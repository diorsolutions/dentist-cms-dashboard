const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Client = require("../models/Client");
const Treatment = require("../models/Treatment");
const cloudinary = require("cloudinary").v2;
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Cloudinary konfiguratsiyasi
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function - Cloudinary URL'dan public_id olish
const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    const publicId = lastPart.split(".")[0];

    // Agar folder bo'lsa, to'liq path'ni olish
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex !== -1) {
      const folderAndId = parts.slice(uploadIndex + 2).join("/");
      return folderAndId.split(".")[0];
    }

    return publicId;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};

// Helper function - Fayl o'lchamini tekshirish
const validateFileSize = (size, maxSizeMB = 5) => {
  const maxSize = maxSizeMB * 1024 * 1024; // MB to bytes
  return size <= maxSize;
};

// Create temporary uploads directory if it doesn't exist
const tmpDir = path.join(__dirname, "../tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Create permanent uploads directory if it doesn't exist (fallback uchun)
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads - vaqtinchalik faylni olish uchun
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir); // vaqtinchalik folder
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  // Allowed image types
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed."
      )
    );
  }
};

// File filter for all files
const fileFilter = (req, file, cb) => {
  // Taqiqlangan fayl turlari
  const blockedTypes = /exe|bat|sh|cmd|com|pif|scr/;
  const extname = blockedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    cb(new Error("Bu fayl turi xavfsizlik sababli taqiqlangan."));
  } else {
    cb(null, true);
  }
};

// Rasmlar uchun upload konfiguratsiyasi
const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFilter,
});

// Umumiy fayllar uchun upload konfiguratsiyasi
const uploadFile = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// POST /api/upload/image - Upload single image
router.post(
  "/image",
  optionalAuth,
  uploadImage.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Rasm yuklanmadi",
        });
      }

      // Cloudinary konfiguratsiyasini tekshirish
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        // Vaqtinchalik faylni o'chirish
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
          success: false,
          message: "Cloudinary konfiguratsiyasi topilmadi",
        });
      }

      // Cloudinaryga yuklash
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "dental-clinic/clients", // Cloudinary ichida papka nomi
        transformation: [
          { width: 1200, height: 1200, crop: "limit" }, // Max o'lchamni cheklash
          { quality: "auto:good" }, // Sifatni optimallashtirish
        ],
      });

      // Lokal vaqtinchalik faylni o'chirib tashlaymiz
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.json({
        success: true,
        message: "Rasm Cloudinaryga yuklandi!",
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          size: result.bytes,
          width: result.width,
          height: result.height,
        },
      });
    } catch (error) {
      console.error("Rasm yuklashda xato:", error);

      // Xato bo'lganda vaqtinchalik faylni o'chirish
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Rasm yuklashda xato",
        error: error.message,
      });
    }
  }
);

// POST /api/upload/client-images - Upload images for a client
router.post(
  "/client-images",
  uploadImage.array("images", 10),
  async (req, res) => {
    try {
      console.log("Upload request received:", {
        clientId: req.body.clientId,
        files: req.files?.length || 0,
      });

      const { clientId } = req.body;

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: "Client ID kerak",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Hech qanday fayl yuklanmadi",
        });
      }

      // Find the client
      const client = await Client.findById(clientId);
      if (!client) {
        // Clean up uploaded files if client not found
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(404).json({
          success: false,
          message: "Client topilmadi",
        });
      }

      // Upload files to Cloudinary
      const urls = [];
      for (const file of req.files) {
        try {
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "dental-clinic/clients",
          });
          fs.unlinkSync(file.path); // lokalni o'chir
          urls.push(uploaded.secure_url);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          // O'chirish
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          throw uploadError;
        }
      }

      // Add images to client
      await client.addImages(urls);

      console.log("Images added to client successfully");

      res.json({
        success: true,
        message: `${urls.length} ta rasm Cloudinaryga yuklandi`,
        data: {
          urls,
          uploadedCount: urls.length,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);

      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: "Error uploading images",
        error: error.message,
      });
    }
  }
);

// POST /api/upload/treatment-images - Upload images for a treatment
router.post(
  "/treatment-images",
  uploadImage.array("images", 10),
  async (req, res) => {
    try {
      const { treatmentId } = req.body;

      if (!treatmentId) {
        return res.status(400).json({
          success: false,
          message: "Treatment ID kerak",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Hech qanday fayl yuklanmadi",
        });
      }

      // Find the treatment
      const treatment = await Treatment.findById(treatmentId);
      if (!treatment) {
        // Clean up uploaded files if treatment not found
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(404).json({
          success: false,
          message: "Treatment topilmadi",
        });
      }

      // Upload files to Cloudinary
      const urls = [];
      for (const file of req.files) {
        try {
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "dental-clinic/treatments",
          });
          fs.unlinkSync(file.path); // lokalni o'chir
          urls.push(uploaded.secure_url);
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          // O'chirish
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          throw uploadError;
        }
      }

      // Add images to treatment
      if (!treatment.images) {
        treatment.images = [];
      }
      treatment.images.push(...urls);
      await treatment.save();

      res.json({
        success: true,
        message: `${urls.length} ta rasm Cloudinaryga yuklandi`,
        data: {
          urls,
          uploadedCount: urls.length,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);

      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: "Error uploading images",
        error: error.message,
      });
    }
  }
);

// POST /api/upload/file - Upload single file (any type) - LOCAL uchun
router.post(
  "/file",
  optionalAuth,
  uploadFile.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Move from tmp to permanent uploads directory
      const permanentPath = path.join(uploadsDir, req.file.filename);
      fs.renameSync(req.file.path, permanentPath);

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;

      res.json({
        success: true,
        message: "File uploaded successfully",
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
          path: permanentPath,
        },
      });
    } catch (error) {
      console.error("File upload error:", error);

      // Clean up on error
      if (req.file) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }

      res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: error.message,
      });
    }
  }
);

// POST /api/upload/multiple - Upload multiple files - CLOUDINARY uchun
router.post(
  "/multiple",
  optionalAuth,
  uploadFile.array("files", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const uploadedFiles = [];

      // Upload files to Cloudinary
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "dental-clinic/files",
            resource_type: "auto", // Har qanday fayl turi uchun
          });

          // Vaqtinchalik faylni o'chirish
          fs.unlinkSync(file.path);

          uploadedFiles.push({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            url: result.secure_url,
            public_id: result.public_id,
            cloudinary_url: result.secure_url,
          });
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          // O'chirish
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          throw uploadError;
        }
      }

      res.json({
        success: true,
        message: `${uploadedFiles.length} files uploaded to Cloudinary successfully`,
        data: uploadedFiles,
      });
    } catch (error) {
      console.error("Multiple files upload error:", error);

      // Clean up on error
      if (req.files) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: "Error uploading files to Cloudinary",
        error: error.message,
      });
    }
  }
);

// DELETE /api/upload/cloudinary/:publicId - Delete from Cloudinary
router.delete("/cloudinary/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = "image" } = req.query; // image, raw, video

    // Cloudinary'dan o'chirish
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== "ok") {
      return res.status(404).json({
        success: false,
        message: "Fayl topilmadi yoki o'chirishda xato",
      });
    }

    // Database'dan ham o'chirish (URL bo'yicha)
    const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`;

    await Client.updateMany(
      {},
      {
        $pull: {
          images: { $regex: publicId },
          "uploadedFiles.images": { $regex: publicId },
        },
      }
    );

    await Treatment.updateMany({}, { $pull: { images: { $regex: publicId } } });

    res.json({
      success: true,
      message: "Fayl Cloudinary'dan muvaffaqiyatli o'chirildi",
      data: result,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500).json({
      success: false,
      message: "Cloudinary'dan o'chirishda xato",
      error: error.message,
    });
  }
});

// DELETE /api/upload/local/:filename - Delete local file
router.delete("/local/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Lokal fayl topilmadi",
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    // Remove from database records
    await Client.updateMany(
      {
        $or: [{ images: filename }, { "uploadedFiles.images": filename }],
      },
      {
        $pull: {
          images: filename,
          "uploadedFiles.images": filename,
        },
      }
    );

    await Treatment.updateMany(
      { images: filename },
      { $pull: { images: filename } }
    );

    res.json({
      success: true,
      message: "Lokal fayl muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.error("Local delete error:", error);
    res.status(500).json({
      success: false,
      message: "Lokal faylni o'chirishda xato",
      error: error.message,
    });
  }
});

// GET /api/upload/:filename - Serve uploaded files
router.get("/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  // Serve the file
  res.sendFile(filePath);
});

module.exports = router;
