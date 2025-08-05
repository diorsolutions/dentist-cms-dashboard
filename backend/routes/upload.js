const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const Client = require("../models/Client")
const Treatment = require("../models/Treatment")
const { optionalAuth } = require("../middleware/auth")

const router = express.Router() // Declare the router variable

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../public/uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only images are allowed."))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
})

// POST /api/upload/image - Upload single image
router.post("/image", optionalAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path,
      },
    })
  } catch (error) {
    console.error("Image upload error:", error)
    res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    })
  }
})

// POST /api/upload/client-images - Upload images for a client
router.post("/client-images", upload.array("images", 10), async (req, res) => {
  try {
    console.log("Upload request received:", {
      clientId: req.body.clientId,
      files: req.files?.length || 0,
    })

    const { clientId } = req.body

    if (!clientId) {
      return res.status(400).json({
        success: false,
        message: "Client ID is required",
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      })
    }

    // Find the client
    const client = await Client.findById(clientId)
    if (!client) {
      // Clean up uploaded files if client not found
      req.files.forEach((file) => {
        fs.unlinkSync(file.path)
      })
      return res.status(404).json({
        success: false,
        message: "Client not found",
      })
    }

    // Get filenames
    const filenames = req.files.map((file) => file.filename)
    console.log("Uploaded filenames:", filenames)

    // Add images to client
    await client.addImages(filenames)

    console.log("Images added to client successfully")

    res.json({
      success: true,
      message: `${filenames.length} images uploaded successfully`,
      data: {
        filenames,
        uploadedCount: filenames.length,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)

    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path)
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError)
        }
      })
    }

    res.status(500).json({
      success: false,
      message: "Error uploading images",
      error: error.message,
    })
  }
})

// POST /api/upload/treatment-images - Upload images for a treatment
router.post("/treatment-images", upload.array("images", 10), async (req, res) => {
  try {
    const { treatmentId } = req.body

    if (!treatmentId) {
      return res.status(400).json({
        success: false,
        message: "Treatment ID is required",
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      })
    }

    // Find the treatment
    const treatment = await Treatment.findById(treatmentId)
    if (!treatment) {
      // Clean up uploaded files if treatment not found
      req.files.forEach((file) => {
        fs.unlinkSync(file.path)
      })
      return res.status(404).json({
        success: false,
        message: "Treatment not found",
      })
    }

    // Get filenames
    const filenames = req.files.map((file) => file.filename)

    // Add images to treatment
    if (!treatment.images) {
      treatment.images = []
    }
    treatment.images.push(...filenames)
    await treatment.save()

    res.json({
      success: true,
      message: `${filenames.length} images uploaded successfully`,
      data: {
        filenames,
        uploadedCount: filenames.length,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)

    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.path)
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError)
        }
      })
    }

    res.status(500).json({
      success: false,
      message: "Error uploading images",
      error: error.message,
    })
  }
})

// POST /api/upload/file - Upload single file (any type)
router.post("/file", optionalAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        path: req.file.path,
      },
    })
  } catch (error) {
    console.error("File upload error:", error)
    res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: error.message,
    })
  }
})

// POST /api/upload/multiple - Upload multiple files
router.post("/multiple", optionalAuth, upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      })
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      path: file.path,
    }))

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: uploadedFiles,
    })
  } catch (error) {
    console.error("Multiple files upload error:", error)
    res.status(500).json({
      success: false,
      message: "Error uploading files",
      error: error.message,
    })
  }
})

// DELETE /api/upload/:filename - Delete uploaded file
router.delete("/:filename", async (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(uploadsDir, filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    // Delete file
    fs.unlinkSync(filePath)

    // Remove from database records (both clients and treatments)
    await Client.updateMany(
      {
        $or: [{ images: filename }, { "uploadedFiles.images": filename }],
      },
      {
        $pull: {
          images: filename,
          "uploadedFiles.images": filename,
        },
      },
    )

    await Treatment.updateMany({ images: filename }, { $pull: { images: filename } })

    res.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Delete error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting file",
      error: error.message,
    })
  }
})

// GET /api/upload/:filename - Serve uploaded files
router.get("/:filename", (req, res) => {
  const { filename } = req.params
  const filePath = path.join(uploadsDir, filename)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    })
  }

  // Serve the file
  res.sendFile(filePath)
})

module.exports = router
