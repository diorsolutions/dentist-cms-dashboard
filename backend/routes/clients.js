const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const Treatment = require("../models/Treatment");
const { validateClient } = require("../middleware/validation");
const { auth, optionalAuth } = require("../middleware/auth");

// GET /api/clients - Get all clients
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 30, // Default to 30 clients per page
      search = "",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let matchFilter = { isActive: true };
    if (search) {
      matchFilter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status !== "all") {
      matchFilter.status = status;
    }

    const sortStage = {};
    // Map frontend sort fields to backend fields if necessary
    let backendSortBy = sortBy;
    if (sortBy === "name") {
      backendSortBy = "firstName"; // Or 'lastName' depending on primary sort
    } else if (sortBy === "lastVisit") {
      backendSortBy = "lastVisit";
    } else if (sortBy === "nextAppointment") {
      backendSortBy = "nextAppointment";
    } else if (sortBy === "dateOfBirth") { // Handle new sort field
      backendSortBy = "dateOfBirth";
    }
    sortStage[backendSortBy] = sortOrder === "desc" ? -1 : 1;

    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: "treatments", // The name of the treatments collection
          localField: "_id",
          foreignField: "clientId",
          as: "treatments",
        },
      },
      {
        $addFields: {
          treatmentCount: { $size: "$treatments" },
          lastVisit: { $max: "$treatments.treatmentDate" },
          nextAppointment: {
            $min: {
              $filter: {
                input: "$treatments.nextVisitDate",
                as: "date",
                cond: { $gte: ["$$date", new Date()] }, // Filter for future dates
              },
            },
          },
        },
      },
      {
        $project: {
          // Explicitly include all desired client fields.
          // Other fields (like 'treatments' array) will be implicitly excluded.
          _id: 1,
          firstName: 1,
          lastName: 1,
          phone: 1,
          email: 1,
          age: 1,
          dateOfBirth: 1, // Include new field
          address: 1,
          status: 1,
          initialTreatment: 1,
          notes: 1,
          uploadedFiles: 1,
          images: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          treatmentCount: 1,
          lastVisit: 1,
          nextAppointment: 1,
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limitNum },
    ];

    const clients = await Client.aggregate(pipeline);

    // For total count of currently filtered/active clients (for pagination)
    const total = await Client.countDocuments(matchFilter);

    // For total clients ever created (regardless of active status)
    const totalClientsOverall = await Client.countDocuments({}); // This is the new count

    res.json({
      success: true,
      data: clients,
      pagination: {
        current: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        total, // This is the count for the current view
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
      totalClientsOverall: totalClientsOverall, // Add the new overall count here
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
router.post("/", optionalAuth, validateClient, async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();

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
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Get client's treatment history
    const treatments = await Treatment.find({ clientId: client._id }).sort({
      treatmentDate: -1,
    });

    res.json({
      success: true,
      data: {
        ...client.toObject(),
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
router.put("/:id", optionalAuth, validateClient, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

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
router.put("/:id/status", optionalAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["inTreatment", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

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
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

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
router.post("/bulk-status", optionalAuth, async (req, res) => {
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

    const result = await Client.updateMany(
      { _id: { $in: clientIds } },
      { status, updatedAt: Date.now() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} clients status updated`,
      modifiedCount: result.modifiedCount,
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

// POST /api/clients/bulk-delete - Delete multiple clients (changed from DELETE to POST)
router.post("/bulk-delete", optionalAuth, async (req, res) => {
  try {
    const { clientIds } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Client IDs array is required",
      });
    }

    // Soft delete clients
    const result = await Client.updateMany(
      { _id: { $in: clientIds } },
      { isActive: false, updatedAt: Date.now() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} clients deleted`,
      deletedCount: result.modifiedCount,
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