const express = require("express");
const router = express.Router();
const { Op, fn, col, literal, where } = require("sequelize");
const Client = require("../models/Client");
const Treatment = require("../models/Treatment");
const { validateClient } = require("../middleware/validation");
const { auth } = require("../middleware/auth");
const path = require("path");

// GET /api/clients - Get all clients
router.get("/", auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 30,
      search = "",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
      searchField = "name",
      doctorId,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = { isActive: true };
    if (status !== "all") {
      whereClause.status = status;
    }

    // Filter by doctorId
    if (doctorId && doctorId !== "all") {
      whereClause.doctorId = doctorId;
    } else if (req.user.role === "doctor" && !doctorId) {
      // Default to current doctor's clients if no specific filter is applied
      whereClause.doctorId = req.user.userId;
    }

    // Add search filter
    if (search) {
      if (["lastVisit", "nextAppointment", "dateOfBirth"].includes(searchField)) {
        try {
          const searchDate = new Date(search);
          if (!isNaN(searchDate.getTime())) {
            const localStartOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
            const startOfDayUTC = new Date(localStartOfDay.toISOString());
            const localEndOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1);
            const endOfDayUTC = new Date(localEndOfDay.toISOString());

            if (searchField === "dateOfBirth") {
              whereClause.dateOfBirth = { [Op.gte]: startOfDayUTC, [Op.lt]: endOfDayUTC };
            }
            // Note: lastVisit and nextAppointment are computed from treatments, handled separately
          }
        } catch (dateError) {
          console.error("Error parsing date for filter:", dateError);
        }
      } else {
        // Text search
        const searchRegex = { [Op.iLike]: `%${search}%` };
        switch (searchField) {
          case "name":
            whereClause[Op.or] = [
              { firstName: searchRegex },
              { lastName: searchRegex },
            ];
            break;
          case "phone":
            whereClause.phone = searchRegex;
            break;
          default:
            whereClause[Op.or] = [
              { firstName: searchRegex },
              { lastName: searchRegex },
              { phone: searchRegex },
            ];
            break;
        }
      }
    }

    // Map sortBy to actual column name
    let actualSortBy = sortBy;
    if (sortBy === "name") {
      actualSortBy = "firstName"; // We'll sort by firstName as a proxy
    } else if (sortBy === "createdAt") {
      actualSortBy = "createdAt";
    }

    // Get clients with treatments included
    const { count, rows: clients } = await Client.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Treatment,
          as: "treatments",
          required: false,
        },
      ],
      order: [[actualSortBy, sortOrder === "desc" ? "DESC" : "ASC"]],
      limit: limitNum,
      offset,
      distinct: true,
      subQuery: false,
    });

    // Process clients to add computed fields
    const processedClients = clients.map((client) => {
      const clientObj = client.toJSON();
      const treatments = clientObj.treatments || [];

      clientObj.fullName = `${clientObj.firstName} ${clientObj.lastName}`;
      clientObj.treatmentCount = treatments.length;
      clientObj.lastVisit = treatments.length
        ? new Date(Math.max(...treatments.map((t) => new Date(t.treatmentDate))))
        : null;
      clientObj.nextAppointment = treatments.length
        ? treatments
          .filter((t) => t.nextVisitDate && new Date(t.nextVisitDate) >= new Date())
          .reduce(
            (min, t) =>
              !min || new Date(t.nextVisitDate) < new Date(min) ? t.nextVisitDate : min,
            null
          )
        : null;

      return clientObj;
    });

    // Filter by computed fields if needed (for lastVisit/nextAppointment search)
    let filteredClients = processedClients;
    if (search && ["lastVisit", "nextAppointment"].includes(searchField)) {
      try {
        const searchDate = new Date(search);
        if (!isNaN(searchDate.getTime())) {
          const localStartOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
          const startOfDayUTC = new Date(localStartOfDay.toISOString());
          const localEndOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1);
          const endOfDayUTC = new Date(localEndOfDay.toISOString());

          filteredClients = processedClients.filter((c) => {
            const dateToCheck = searchField === "lastVisit" ? c.lastVisit : c.nextAppointment;
            if (!dateToCheck) return false;
            const dateObj = new Date(dateToCheck);
            return dateObj >= startOfDayUTC && dateObj < endOfDayUTC;
          });
        }
      } catch (e) {
        // Ignore filter error
      }
    }

    // Get total count for pagination (without skip/limit)
    const totalResult = await Client.count({
      where: whereClause,
      distinct: true,
    });

    const totalClientsOverall = await Client.count({});

    res.json({
      success: true,
      data: filteredClients,
      pagination: {
        current: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalResult / limitNum),
        total: totalResult,
        hasNext: pageNum < Math.ceil(totalResult / limitNum),
        hasPrev: pageNum > 1,
      },
      totalClientsOverall,
    });
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching clients",
      error: error.message,
    });
  }
});

// POST /api/clients - Create new client
router.post("/", auth, validateClient, async (req, res) => {
  try {
    // Assign the doctor's ID to the client (either from request or current user)
    const clientData = {
      ...req.body,
      doctorId: req.body.doctorId || req.user.userId,
    };
    const client = await Client.create(clientData);

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    });
  } catch (error) {
    console.error("Create client error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating client",
      error: error.message,
    });
  }
});

// GET /api/clients/:id - Get single client
router.get("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Check if doctor can access this client (allow viewing, restrict editing)
    if (req.user.role === "doctor" && client.doctorId !== req.user.userId) {
      // We allow viewing but could add a flag if we wanted to restrict certain info
      // For now, let's allow viewing to match the requested dashboard switching feature
    }

    // Get client's treatment history
    const treatments = await Treatment.findAll({
      where: { clientId: client.id },
      order: [["treatmentDate", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        ...client.toJSON(),
        treatmentHistory: treatments,
      },
    });
  } catch (error) {
    console.error("Get client error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching client",
      error: error.message,
    });
  }
});

// PUT /api/clients/:id - Update client
router.put("/:id", auth, validateClient, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Check if doctor can update this client
    if (req.user.role === "doctor" && client.doctorId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Siz faqat o'zingizning mijozlaringizni tahrirlashingiz mumkin",
      });
    }

    // Doctor cannot change the doctorId
    const updateData = { ...req.body, updatedAt: new Date() };
    if (req.user.role === "doctor") {
      delete updateData.doctorId;
    }

    await client.update(updateData);

    res.json({
      success: true,
      message: "Client updated successfully",
      data: client,
    });
  } catch (error) {
    console.error("Update client error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating client",
      error: error.message,
    });
  }
});

// PUT /api/clients/:id/status - Update client status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["inTreatment", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Check if doctor can update this client
    if (req.user.role === "doctor" && client.doctorId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Siz faqat o'zingizning mijozlaringiz holatini o'zgartirishingiz mumkin",
      });
    }

    await client.update({ status, updatedAt: new Date() });

    res.json({
      success: true,
      message: "Client status updated successfully",
      data: client,
    });
  } catch (error) {
    console.error("Update client status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating client status",
      error: error.message,
    });
  }
});

// DELETE /api/clients/:id - Delete client (soft delete)
router.delete("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Check if doctor can delete this client
    if (req.user.role === "doctor" && client.doctorId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Siz faqat o'zingizning mijozlaringizni o'chirishingiz mumkin",
      });
    }

    await client.update({ isActive: false, updatedAt: new Date() });

    res.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete client error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting client",
      error: error.message,
    });
  }
});

// POST /api/clients/bulk-status - Update multiple clients status
router.post("/bulk-status", auth, async (req, res) => {
  try {
    const { clientIds, status } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Client IDs array is required",
      });
    }

    if (!["inTreatment", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const [modifiedCount] = await Client.update(
      { status, updatedAt: new Date() },
      { where: { id: { [Op.in]: clientIds } } }
    );

    res.json({
      success: true,
      message: `${modifiedCount} clients status updated`,
      modifiedCount,
    });
  } catch (error) {
    console.error("Bulk status update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating clients status",
      error: error.message,
    });
  }
});

// POST /api/clients/bulk-delete - Delete multiple clients (soft delete)
router.post("/bulk-delete", auth, async (req, res) => {
  try {
    const { clientIds } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Client IDs array is required",
      });
    }

    const [modifiedCount] = await Client.update(
      { isActive: false, updatedAt: new Date() },
      { where: { id: { [Op.in]: clientIds } } }
    );

    res.json({
      success: true,
      message: `${modifiedCount} clients deleted`,
      deletedCount: modifiedCount,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting clients",
      error: error.message,
    });
  }
});


module.exports = router;
