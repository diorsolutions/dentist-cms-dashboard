const express = require("express")
const router = express.Router()
const Client = require("../models/Client")
const Treatment = require("../models/Treatment")
const { validateClient } = require("../middleware/validation")
const { auth, optionalAuth } = require("../middleware/auth")

// GET /api/clients - Get all clients
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "", status = "all", sortBy = "createdAt", sortOrder = "desc" } = req.query

    // Build search filter
    let searchFilter = {}
    if (search) {
      searchFilter = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    }

    // Build status filter
    const statusFilter = {}
    if (status !== "all") {
      statusFilter.status = status
    }

    // Combine filters
    const filter = { ...searchFilter, ...statusFilter, isActive: true }

    // Build sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const clients = await Client.find(filter)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    // Get total count
    const total = await Client.countDocuments(filter)

    res.json({
      success: true,
      data: clients,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get clients error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching clients",
      error: error.message,
    })
  }
})

// POST /api/clients - Create new client
router.post("/", optionalAuth, validateClient, async (req, res) => {
  try {
    const client = new Client(req.body)
    await client.save()

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      data: client,
    })
  } catch (error) {
    console.error("Create client error:", error)

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Phone number or email already exists",
      })
    }

    res.status(500).json({
      success: false,
      message: "Error creating client",
      error: error.message,
    })
  }
})

// GET /api/clients/:id - Get single client
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)

    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      })
    }

    // Get client's treatment history
    const treatments = await Treatment.find({ clientId: client._id }).sort({ treatmentDate: -1 })

    res.json({
      success: true,
      data: {
        ...client.toObject(),
        treatmentHistory: treatments,
      },
    })
  } catch (error) {
    console.error("Get client error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching client",
      error: error.message,
    })
  }
})

// PUT /api/clients/:id - Update client
router.put("/:id", optionalAuth, validateClient, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      })
    }

    res.json({
      success: true,
      message: "Client updated successfully",
      data: client,
    })
  } catch (error) {
    console.error("Update client error:", error)

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Phone number or email already exists",
      })
    }

    res.status(500).json({
      success: false,
      message: "Error updating client",
      error: error.message,
    })
  }
})

// PUT /api/clients/:id/status - Update client status
router.put("/:id/status", optionalAuth, async (req, res) => {
  try {
    const { status } = req.body

    if (!["inTreatment", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      })
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true },
    )

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      })
    }

    res.json({
      success: true,
      message: "Client status updated successfully",
      data: client,
    })
  } catch (error) {
    console.error("Update client status error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating client status",
      error: error.message,
    })
  }
})

// DELETE /api/clients/:id - Delete client (soft delete)
router.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true },
    )

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      })
    }

    res.json({
      success: true,
      message: "Client deleted successfully",
    })
  } catch (error) {
    console.error("Delete client error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting client",
      error: error.message,
    })
  }
})

// POST /api/clients/bulk-status - Update multiple clients status
router.post("/bulk-status", optionalAuth, async (req, res) => {
  try {
    const { clientIds, status } = req.body

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Client IDs array is required",
      })
    }

    if (!["inTreatment", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      })
    }

    const result = await Client.updateMany({ _id: { $in: clientIds } }, { status, updatedAt: Date.now() })

    res.json({
      success: true,
      message: `${result.modifiedCount} clients status updated`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Bulk status update error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating clients status",
      error: error.message,
    })
  }
})

// POST /api/clients/bulk-delete - Delete multiple clients (changed from DELETE to POST)
router.post("/bulk-delete", optionalAuth, async (req, res) => {
  try {
    const { clientIds } = req.body

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Client IDs array is required",
      })
    }

    // Soft delete clients
    const result = await Client.updateMany({ _id: { $in: clientIds } }, { isActive: false, updatedAt: Date.now() })

    res.json({
      success: true,
      message: `${result.modifiedCount} clients deleted`,
      deletedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Bulk delete error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting clients",
      error: error.message,
    })
  }
})

module.exports = router
