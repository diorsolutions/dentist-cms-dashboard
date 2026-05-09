const express = require("express");
const { sequelize, testConnection } = require("./config/database");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Import models to set up associations
require("./models/index");

const app = express();

// PostgreSQL connection
const connectDB = async () => {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ PostgreSQL connection failed");
      console.log("💡 Make sure PostgreSQL is running and credentials are correct");
      process.exit(1);
    }

    // Sync models (create tables if they don't exist)
    // In production, use migrations instead
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("✅ Database tables synchronized");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "https://dentist-cms-production.up.railway.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/api/uploads", express.static(path.join(__dirname, "public/uploads")));

// Import routes
const clientRoutes = require("./routes/clients");
const treatmentRoutes = require("./routes/treatments");
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/upload", uploadRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  let dbStatus = "Unknown";
  try {
    await sequelize.authenticate();
    dbStatus = "Connected";
  } catch {
    dbStatus = "Disconnected";
  }

  res.json({
    success: true,
    message: "Dental Clinic API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Dental Clinic Management System API",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "Login user",
        "GET /api/auth/me": "Get current user",
        "POST /api/auth/logout": "Logout user",
      },
      clients: {
        "GET /api/clients": "Get all clients",
        "POST /api/clients": "Create new client",
        "GET /api/clients/:id": "Get single client",
        "PUT /api/clients/:id": "Update client",
        "DELETE /api/clients/:id": "Delete client",
        "PUT /api/clients/:id/status": "Update client status",
        "POST /api/clients/bulk-status": "Update multiple clients status",
        "DELETE /api/clients/bulk": "Delete multiple clients",
      },
      treatments: {
        "GET /api/treatments": "Get all treatments",
        "POST /api/treatments": "Create new treatment",
        "GET /api/treatments/:id": "Get single treatment",
        "PUT /api/treatments/:id": "Update treatment",
        "DELETE /api/treatments/:id": "Delete treatment",
        "GET /api/treatments/client/:clientId": "Get client treatments",
      },
      upload: {
        "POST /api/upload/image": "Upload image",
        "POST /api/upload/file": "Upload file",
      },
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    message: "Server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal server error",
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}
🗄️  Database: PostgreSQL
🌍 Environment: ${process.env.NODE_ENV || "development"}
📚 API Documentation: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/api/health

💡 To test API:
   curl http://localhost:${PORT}/api/health
  `);
});

module.exports = app;
