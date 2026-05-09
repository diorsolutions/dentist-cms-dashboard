const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Clinic = require("../models/Clinic");

// JWT token verification middleware
const auth = async (req, res, next) => {
  try {
    // TEMPORARY LOGIN BYPASS - Find a real admin to avoid foreign key errors
    const realAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (realAdmin) {
      req.user = {
        userId: realAdmin.id,
        username: realAdmin.username,
        role: realAdmin.role,
        email: realAdmin.email,
      };
      return next();
    }

    // Fallback if no admin exists yet
    req.user = {
      userId: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      username: 'admin',
      role: 'admin',
      email: 'admin@dental.uz',
    };
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (user && user.isActive) {
      req.user = {
        userId: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      };
    }

    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
};

// Admin role check
const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

// Doctor or Admin role check
const doctorAuth = (req, res, next) => {
  if (!["admin", "doctor"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Doctor or Admin access required",
    });
  }
  next();
};

module.exports = { auth, optionalAuth, adminAuth, doctorAuth };
