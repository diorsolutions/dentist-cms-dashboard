const express = require("express")
const router = express.Router()
const Treatment = require("../models/Treatment")
const Client = require("../models/Client")
const { validateTreatment } = require("../middleware/validation")
const { auth, optionalAuth } = require("../middleware/auth")

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
    } = req.body

    // Check if client exists
    const client = await Client.findById(clientId)
    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      })
    }

    const treatment = new Treatment({
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
    })

    await treatment.save()

    // Update client's last update time
    await Client.findByIdAndUpdate(clientId, { updatedAt: Date.now() })

    res.status(201).json({
      success: true,
      message: "Treatment created successfully",
      data: treatment,
    })
  } catch (error) {
    console.error("Create treatment error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating treatment",
      error: error.message,
    })
  }
})

// GET /api/treatments/client/:clientId - Get client treatments
router.get("/client/:clientId", optionalAuth, async (req, res) => {
  try {
    const { clientId } = req.params
    const { page = 1, limit = 20 } = req.query

    // Check if client exists
    const client = await Client.findById(clientId)
    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      })
    }

    // Get treatments
    const treatments = await Treatment.find({ clientId })
      .sort({ treatmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    // Get total count
    const total = await Treatment.countDocuments({ clientId })

    res.json({
      success: true,
      data: treatments,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get client treatments error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching treatments",
      error: error.message,
    })
  }
})

// GET /api/treatments/:id - Get single treatment
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id).populate("clientId", "firstName lastName phone")

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found",
      })
    }

    res.json({
      success: true,
      data: treatment,
    })
  } catch (error) {
    console.error("Get treatment error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching treatment",
      error: error.message,
    })
  }
})

// PUT /api/treatments/:id - Update treatment
router.put("/:id", optionalAuth, validateTreatment, async (req, res) => {
  try {
    const updateData = {
      visitType: req.body.visitType,
      treatmentType: req.body.treatmentType,
      description: req.body.description,
      notes: req.body.notes,
      doctor: req.body.doctor,
      cost: req.body.cost,
      nextVisitDate: req.body.nextVisitDate ? new Date(req.body.nextVisitDate) : undefined,
      nextVisitNotes: req.body.nextVisitNotes,
      updatedAt: Date.now(),
    }

    const treatment = await Treatment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found",
      })
    }

    res.json({
      success: true,
      message: "Treatment updated successfully",
      data: treatment,
    })
  } catch (error) {
    console.error("Update treatment error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating treatment",
      error: error.message,
    })
  }
})

// DELETE /api/treatments/:id - Delete treatment
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const treatment = await Treatment.findByIdAndDelete(req.params.id)

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: "Treatment not found",
      })
    }

    res.json({
      success: true,
      message: "Treatment deleted successfully",
    })
  } catch (error) {
    console.error("Delete treatment error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting treatment",
      error: error.message,
    })
  }
})

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
    } = req.query

    // Build filters
    const filter = {}

    if (doctor) {
      filter.doctor = { $regex: doctor, $options: "i" }
    }

    if (status !== "all") {
      filter.status = status
    }

    if (startDate || endDate) {
      filter.treatmentDate = {}
      if (startDate) filter.treatmentDate.$gte = new Date(startDate)
      if (endDate) filter.treatmentDate.$lte = new Date(endDate)
    }

    // Build sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const treatments = await Treatment.find(filter)
      .populate("clientId", "firstName lastName phone")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    // Get total count
    const total = await Treatment.countDocuments(filter)

    res.json({
      success: true,
      data: treatments,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Get treatments error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching treatments",
      error: error.message,
    })
  }
})

module.exports = router
