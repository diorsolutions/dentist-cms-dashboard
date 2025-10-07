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
      limit = 30,
      search = "",
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
      searchField = "name", // New parameter to specify which field to search by
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Initial match for isActive and status
    let initialMatch = { isActive: true };
    if (status !== "all") {
      initialMatch.status = status;
    }

    // Build the aggregation pipeline
    const pipeline = [
      { $match: initialMatch }, // Apply initial filters first
      {
        $lookup: {
          from: "treatments",
          localField: "_id",
          foreignField: "clientId",
          as: "treatments",
        },
      },
      {
        $addFields: {
          fullName: { $concat: ["$firstName", " ", "$lastName"] },
          treatmentCount: { $size: "$treatments" },
          lastVisit: { $max: "$treatments.treatmentDate" },
          nextAppointment: {
            $min: {
              $filter: {
                input: "$treatments.nextVisitDate",
                as: "date",
                cond: { $gte: ["$$date", new Date()] },
              },
            },
          },
          // Convert dateOfBirth to ISO string for consistent searching/sorting
          dateOfBirthString: { $dateToString: { format: "%Y-%m-%d", date: "$dateOfBirth" } }
        },
      },
    ];

    // Add dynamic search filter if search term is provided
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      let dynamicSearchFilter = {};

      switch (searchField) {
        case "name":
          dynamicSearchFilter.fullName = searchRegex;
          break;
        case "phone":
          dynamicSearchFilter.phone = searchRegex;
          break;
        case "email":
          dynamicSearchFilter.email = searchRegex;
          break;
        case "lastVisit":
          // Search on the ISO string representation of lastVisit
          dynamicSearchFilter.lastVisit = searchRegex;
          break;
        case "nextAppointment":
          // Search on the ISO string representation of nextAppointment
          dynamicSearchFilter.nextAppointment = searchRegex;
          break;
        case "dateOfBirth":
          dynamicSearchFilter.dateOfBirthString = searchRegex;
          break;
        default:
          // Fallback to searching across multiple fields if searchField is unknown or not provided
          dynamicSearchFilter.$or = [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { phone: searchRegex },
            { email: searchRegex },
            { fullName: searchRegex }, // Include computed fullName
            { dateOfBirthString: searchRegex } // Include computed dateOfBirthString
          ];
          break;
      }
      pipeline.push({ $match: dynamicSearchFilter });
    }

    // Add sort stage
    const sortStage = {};
    let actualSortBy = sortBy;
    if (sortBy === "name") {
        actualSortBy = "fullName"; // Sort by computed fullName
    } else if (sortBy === "dateOfBirth") {
        actualSortBy = "dateOfBirthString"; // Sort by computed dateOfBirthString
    }
    sortStage[actualSortBy] = sortOrder === "desc" ? -1 : 1;
    pipeline.push({ $sort: sortStage });

    // Add pagination stages
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Add final projection stage
    pipeline.push({
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          phone: 1,
          email: 1,
          dateOfBirth: 1,
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
          fullName: 1, // Keep fullName if it was used for sorting/searching
          dateOfBirthString: 1 // Keep dateOfBirthString if it was used for sorting/searching
        },
    });

    const clients = await Client.aggregate(pipeline);

    // For total count of currently filtered/active clients (for pagination)
    // This needs a separate pipeline that applies all filters but no skip/limit
    const totalCountPipeline = [
        { $match: initialMatch },
        {
            $lookup: {
                from: "treatments",
                localField: "_id",
                foreignField: "clientId",
                as: "treatments",
            },
        },
        {
            $addFields: {
                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                lastVisit: { $max: "$treatments.treatmentDate" },
                nextAppointment: {
                    $min: {
                        $filter: {
                            input: "$treatments.nextVisitDate",
                            as: "date",
                            cond: { $gte: ["$$date", new Date()] },
                        },
                    },
                },
                dateOfBirthString: { $dateToString: { format: "%Y-%m-%d", date: "$dateOfBirth" } }
            },
        },
    ];
    if (search) {
        const searchRegex = { $regex: search, $options: "i" };
        let dynamicSearchFilter = {};
        switch (searchField) {
            case "name": dynamicSearchFilter.fullName = searchRegex; break;
            case "phone": dynamicSearchFilter.phone = searchRegex; break;
            case "email": dynamicSearchFilter.email = searchRegex; break;
            case "lastVisit": dynamicSearchFilter.lastVisit = searchRegex; break;
            case "nextAppointment": dynamicSearchFilter.nextAppointment = searchRegex; break;
            case "dateOfBirth": dynamicSearchFilter.dateOfBirthString = searchRegex; break;
            default:
                dynamicSearchFilter.$or = [
                    { firstName: searchRegex }, { lastName: searchRegex }, { phone: searchRegex },
                    { email: searchRegex }, { fullName: searchRegex }, { dateOfBirthString: searchRegex }
                ];
                break;
        }
        totalCountPipeline.push({ $match: dynamicSearchFilter });
    }
    totalCountPipeline.push({ $count: "total" });

    const totalResult = await Client.aggregate(totalCountPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    const totalClientsOverall = await Client.countDocuments({});

    res.json({
      success: true,
      data: clients,
      pagination: {
        current: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        total,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
      totalClientsOverall: totalClientsOverall,
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