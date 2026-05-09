const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const Treatment = require("../models/Treatment");
const Client = require("../models/Client");
const { validateTreatment } = require("../middleware/validation");
const { optionalAuth } = require("../middleware/auth");

// POST /api/treatments - Create new treatment
router.post("/", optionalAuth, validateTreatment, async (req, res) => {
  try {
    const {
      clientId,
      visitType,
      treatmentType,
      description,
      notes,
      doctor = "Dr. Karimova",
      cost = 0,
      nextVisitDate,
      nextVisitNotes,
    } = req.body;

    // Check if client exists
    const client = await Client.findByPk(clientId);
    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const treatment = await Treatment.create({
      clientId,
      visitType,
      treatmentType,
      description,
      notes,
      doctor,
      cost,
      nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : undefined,
      nextVisitNotes,
      status: "completed",
    });

    // Update client's last update time
    await client.update({ updatedAt: new Date() });

    res.status(201).json({
      success: true,
      message: "Treatment created successfully",
      data: treatment,
    });
  } catch (error) {
    console.error("Create treatment error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating treatment",
      error: error.message,
    });
  }
});

// GET /api/treatments/client/:clientId - Get client treatments
router.get("/client/:clientId", optionalAuth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if client exists
    const client = await Client.findByPk(clientId);
    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get treatments
    const { count, rows: treatments } = await Treatment.findAndCountAll({
      where: { clientId },
      order: [["treatmentDate", "DESC"]],
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      data: treatments,
      pagination: {
        current: pageNum,
        pages: Math.ceil(count / limitNum),
        total: count,
      },
    });
  } catch (error) {
    console.error("Get client treatments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching treatments",
      error: error.message,
    });
  }
});

// GET /api/treatments/:id - Get single treatment
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const treatment = await Treatment.findByPk(req.params.id, {
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "firstName", "lastName", "phone"],
        },
      ],
    });

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found",
      });
    }

    res.json({
      success: true,
      data: treatment,
    });
  } catch (error) {
    console.error("Get treatment error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching treatment",
      error: error.message,
    });
  }
});

// PUT /api/treatments/:id - Update treatment
router.put("/:id", optionalAuth, validateTreatment, async (req, res) => {
  try {
    const treatment = await Treatment.findByPk(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found",
      });
    }

    await treatment.update({
      visitType: req.body.visitType,
      treatmentType: req.body.treatmentType,
      description: req.body.description,
      notes: req.body.notes,
      doctor: req.body.doctor,
      cost: req.body.cost,
      nextVisitDate: req.body.nextVisitDate ? new Date(req.body.nextVisitDate) : undefined,
      nextVisitNotes: req.body.nextVisitNotes,
    });

    res.json({
      success: true,
      message: "Treatment updated successfully",
      data: treatment,
    });
  } catch (error) {
    console.error("Update treatment error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating treatment",
      error: error.message,
    });
  }
});

// DELETE /api/treatments/:id - Delete treatment
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const treatment = await Treatment.findByPk(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found",
      });
    }

    await treatment.destroy();

    res.json({
      success: true,
      message: "Treatment deleted successfully",
    });
  } catch (error) {
    console.error("Delete treatment error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting treatment",
      error: error.message,
    });
  }
});

// GET /api/treatments - Get all treatments (admin)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      doctor = "",
      status = "all",
      startDate = "",
      endDate = "",
      sortBy = "treatmentDate",
      sortOrder = "desc",
    } = req.query;

    // Build filters
    const where = {};

    if (doctor) {
      where.doctor = { [Op.iLike]: `%${doctor}%` };
    }

    if (status !== "all") {
      where.status = status;
    }

    if (startDate || endDate) {
      where.treatmentDate = {};
      if (startDate) where.treatmentDate[Op.gte] = new Date(startDate);
      if (endDate) where.treatmentDate[Op.lte] = new Date(endDate);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build sort options
    const order = [[sortBy, sortOrder === "desc" ? "DESC" : "ASC"]];

    // Execute query
    const { count, rows: treatments } = await Treatment.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "firstName", "lastName", "phone"],
        },
      ],
      order,
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      data: treatments,
      pagination: {
        current: pageNum,
        pages: Math.ceil(count / limitNum),
        total: count,
      },
    });
  } catch (error) {
    console.error("Get treatments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching treatments",
      error: error.message,
    });
  }
});

module.exports = router;
