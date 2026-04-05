const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const Treatment = require("../models/Treatment");
const { validateClient } = require("../middleware/validation");
const { auth, optionalAuth } = require("../middleware/auth");
const archiver = require("archiver");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const path = require("path");

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
                // IMPORTANT: Use current UTC date for comparison
                cond: { $gte: ["$$date", new Date(new Date().toISOString())] },
              },
            },
          },
        },
      },
    ];

    // Add dynamic search filter if search term is provided
    if (search) {
      let dynamicSearchFilter = {};

      if (["lastVisit", "nextAppointment", "dateOfBirth"].includes(searchField)) {
        try {
          const searchDate = new Date(search); // e.g., "2023-10-26"
          if (!isNaN(searchDate.getTime())) {
            // Construct local date objects first, then convert to UTC ISO string
            // This is often more reliable than Date.UTC() for day boundaries
            const localStartOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
            const startOfDayUTC = new Date(localStartOfDay.toISOString());

            const localEndOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1);
            const endOfDayUTC = new Date(localEndOfDay.toISOString());

            if (searchField === "lastVisit") {
              dynamicSearchFilter.lastVisit = { $gte: startOfDayUTC, $lt: endOfDayUTC };
            } else if (searchField === "nextAppointment") {
              dynamicSearchFilter.nextAppointment = { $gte: startOfDayUTC, $lt: endOfDayUTC };
            } else if (searchField === "dateOfBirth") {
              dynamicSearchFilter.dateOfBirth = { $gte: startOfDayUTC, $lt: endOfDayUTC };
            }
          } else {
            dynamicSearchFilter[searchField] = null;
          }
        } catch (dateError) {
          console.error("Error parsing date for filter:", dateError);
          dynamicSearchFilter[searchField] = null; // Fallback to match nothing
        }
      } else {
        // Existing regex logic for other fields
        const searchRegex = { $regex: search, $options: "i" };
        switch (searchField) {
          case "name":
            dynamicSearchFilter.fullName = searchRegex;
            break;
          case "phone":
            dynamicSearchFilter.phone = searchRegex;
            break;
          default:
            // Fallback to searching across multiple fields if searchField is unknown or not provided
            dynamicSearchFilter.$or = [
              { firstName: searchRegex },
              { lastName: searchRegex },
              { phone: searchRegex },
              { fullName: searchRegex },
            ];
            break;
        }
      }
      pipeline.push({ $match: dynamicSearchFilter });
    }

    // Add sort stage
    const sortStage = {};
    let actualSortBy = sortBy;
    if (sortBy === "name") {
      actualSortBy = "fullName"; // Sort by computed fullName
    }
    // For date fields, we sort by the actual Date object, not a string representation
    // The frontend sends "lastVisit", "nextAppointment", "dateOfBirth" which are direct field names
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
                cond: { $gte: ["$$date", new Date(new Date().toISOString())] },
              },
            },
          },
        },
      },
    ];
    if (search) {
      let dynamicSearchFilter = {};
      if (["lastVisit", "nextAppointment", "dateOfBirth"].includes(searchField)) {
        try {
          const searchDate = new Date(search);
          if (!isNaN(searchDate.getTime())) {
            const localStartOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
            const startOfDayUTC = new Date(localStartOfDay.toISOString());

            const localEndOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1);
            const endOfDayUTC = new Date(localEndOfDay.toISOString());

            if (searchField === "lastVisit") {
              dynamicSearchFilter.lastVisit = { $gte: startOfDayUTC, $lt: endOfDayUTC };
            } else if (searchField === "nextAppointment") {
              dynamicSearchFilter.nextAppointment = { $gte: startOfDayUTC, $lt: endOfDayUTC };
            } else if (searchField === "dateOfBirth") {
              dynamicSearchFilter.dateOfBirth = { $gte: startOfDayUTC, $lt: endOfDayUTC };
            }
          } else {
            dynamicSearchFilter[searchField] = null;
          }
        } catch (dateError) {
          console.error("Error parsing date for filter in total count:", dateError);
          dynamicSearchFilter[searchField] = null;
        }
      } else {
        const searchRegex = { $regex: search, $options: "i" };
        switch (searchField) {
          case "name": dynamicSearchFilter.fullName = searchRegex; break;
          case "phone": dynamicSearchFilter.phone = searchRegex; break;
          default:
            dynamicSearchFilter.$or = [
              { firstName: searchRegex }, { lastName: searchRegex }, { phone: searchRegex },
              { fullName: searchRegex },
            ];
            break;
        }
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

// GET /api/clients/:id/export - Export client with images as ZIP
router.get("/:id/export", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the client
    const client = await Client.findById(id);
    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Get client's treatments
    const treatments = await Treatment.find({ clientId: id }).sort({
      treatmentDate: -1,
    });

    // Collect all image URLs from client
    const imageUrls = [];

    // From uploadedFiles.images (new structure with objects)
    if (client.uploadedFiles?.images) {
      client.uploadedFiles.images.forEach((img) => {
        if (img.url) imageUrls.push(img.url);
      });
    }

    // From legacy images (backward compatibility)
    if (client.images) {
      client.images.forEach((img) => {
        if (typeof img === "string" && img.startsWith("http")) {
          imageUrls.push(img);
        }
      });
    }

    // From treatment images
    treatments.forEach((treatment) => {
      if (treatment.images) {
        treatment.images.forEach((img) => {
          if (img.url) imageUrls.push(img.url);
        });
      }
    });

    // Remove duplicates
    const uniqueImageUrls = [...new Set(imageUrls)];

    // Set response headers for ZIP download
    const sanitizedName = `${client.firstName}_${client.lastName}`.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `client-export-${sanitizedName}-${new Date().toISOString().split("T")[0]}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache");

    // Create archiver instance
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Handle archiver errors
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error creating ZIP archive",
        });
      }
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add client data as JSON
    const clientData = {
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      email: client.email,
      dateOfBirth: client.dateOfBirth,
      address: client.address,
      status: client.status,
      initialTreatment: client.initialTreatment,
      notes: client.notes,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
    archive.append(JSON.stringify(clientData, null, 2), {
      name: "client-data.json",
    });

    // Add treatments data as JSON
    archive.append(JSON.stringify(treatments, null, 2), {
      name: "treatments-data.json",
    });

    // Add README with export info
    const readmeContent = `Client Export
=============
Exported: ${new Date().toISOString()}
Client: ${client.firstName} ${client.lastName}
Phone: ${client.phone}
Total Images: ${uniqueImageUrls.length}
Total Treatments: ${treatments.length}

This file was automatically generated by Dental Clinic CMS.
`;
    archive.append(readmeContent, { name: "README.txt" });

    // Create images folder in ZIP
    archive.directory("images/", false);

    // Download images from Cloudinary and add to ZIP
    const imageDownloadPromises = uniqueImageUrls.map(async (url, index) => {
      try {
        const response = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 30000, // 30 second timeout per image
          maxContentLength: 50 * 1024 * 1024, // 50MB max per image
        });

        // Determine file extension from URL or default to jpg
        const urlParts = url.split(".");
        const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split("?")[0] : "jpg";
        const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
        const fileExt = validExtensions.includes(extension) ? extension : "jpg";

        const filename = `images/image-${String(index + 1).padStart(3, "0")}.${fileExt}`;

        archive.append(Buffer.from(response.data), { name: filename });

        return { url, status: "success", filename };
      } catch (error) {
        console.error(`Error downloading image ${index + 1}: ${url}`, error.message);
        return { url, status: "failed", error: error.message };
      }
    });

    // Wait for all downloads to complete
    const downloadResults = await Promise.allSettled(imageDownloadPromises);

    // Add download report
    const successfulDownloads = downloadResults.filter(
      (r) => r.status === "fulfilled" && r.value.status === "success"
    ).length;
    const failedDownloads = downloadResults.filter(
      (r) => r.status === "fulfilled" && r.value.status === "failed"
    );

    const downloadReport = `Image Download Report
========================
Total Images: ${uniqueImageUrls.length}
Successful: ${successfulDownloads}
Failed: ${failedDownloads.length}

${failedDownloads.length > 0 ? "Failed URLs:\n" + failedDownloads.map((f) => `- ${f.value.url}`).join("\n") : "All images downloaded successfully."}
`;
    archive.append(downloadReport, { name: "download-report.txt" });

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error("Export client error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error exporting client",
        error: error.message,
      });
    }
  }
});

// POST /api/clients/bulk-export - Export multiple clients as ZIP
router.post("/bulk-export", optionalAuth, async (req, res) => {
  try {
    const { clientIds } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Client IDs array is required",
      });
    }

    // Find all clients
    const clients = await Client.find({
      _id: { $in: clientIds },
      isActive: true,
    });

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No clients found",
      });
    }

    // Set response headers
    const filename = `bulk-export-${clients.length}-clients-${new Date().toISOString().split("T")[0]}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache");

    // Create archiver
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error creating ZIP archive",
        });
      }
    });

    archive.pipe(res);

    // Add summary JSON
    const summary = {
      exportDate: new Date().toISOString(),
      totalClients: clients.length,
      clients: clients.map((c) => ({
        id: c._id,
        name: `${c.firstName} ${c.lastName}`,
        phone: c.phone,
        email: c.email,
      })),
    };
    archive.append(JSON.stringify(summary, null, 2), {
      name: "bulk-export-summary.json",
    });

    // Add each client's data
    for (const client of clients) {
      const sanitizedName = `${client.firstName}_${client.lastName}`.replace(/[^a-zA-Z0-9_-]/g, "_");
      const folderName = `clients/${sanitizedName}_${client._id}/`;

      // Client data
      const clientData = {
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email,
        dateOfBirth: client.dateOfBirth,
        address: client.address,
        status: client.status,
        initialTreatment: client.initialTreatment,
        notes: client.notes,
      };
      archive.append(JSON.stringify(clientData, null, 2), {
        name: `${folderName}client-data.json`,
      });

      // Get treatments
      const treatments = await Treatment.find({ clientId: client._id });
      archive.append(JSON.stringify(treatments, null, 2), {
        name: `${folderName}treatments-data.json`,
      });

      // Collect image URLs
      const imageUrls = [];
      if (client.uploadedFiles?.images) {
        client.uploadedFiles.images.forEach((img) => {
          if (img.url) imageUrls.push(img.url);
        });
      }
      if (client.images) {
        client.images.forEach((img) => {
          if (typeof img === "string" && img.startsWith("http")) {
            imageUrls.push(img);
          }
        });
      }

      // Download and add images
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const url = imageUrls[i];
          const response = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 30000,
            maxContentLength: 50 * 1024 * 1024,
          });

          const urlParts = url.split(".");
          const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split("?")[0] : "jpg";
          const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
          const fileExt = validExtensions.includes(extension) ? extension : "jpg";

          archive.append(Buffer.from(response.data), {
            name: `${folderName}images/image-${String(i + 1).padStart(3, "0")}.${fileExt}`,
          });
        } catch (error) {
          console.error(`Error downloading image for ${client.firstName}:`, error.message);
        }
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error("Bulk export error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Error exporting clients",
        error: error.message,
      });
    }
  }
});

module.exports = router;