const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/User");
const { validateLogin, validateRegister } = require("../middleware/validation");
const { auth, adminAuth } = require("../middleware/auth");

// POST /api/auth/register - Register new user
router.post("/register", validateRegister, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role = "assistant" } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
});

// POST /api/auth/login - Login user
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [{ username }, { email: username }],
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          role: user.role,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
});

// GET /api/auth/me - Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.getFullName(),
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    });
  }
});

// POST /api/auth/logout - Logout user
router.post("/logout", auth, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
});

// GET /api/auth/doctors - Get all doctors (admin and doctor roles)
router.get("/doctors", auth, async (req, res) => {
  try {
    const doctors = await User.findAll({
      where: {
        role: {
          [Op.in]: ["admin", "doctor"],
        },
        isActive: true,
      },
      attributes: ["id", "username", "email", "firstName", "lastName", "phone", "role", "lastLogin"],
      order: [["created_at", "ASC"]],
    });

    res.json({
      success: true,
      data: doctors.map((doctor) => ({
        id: doctor.id,
        username: doctor.username,
        email: doctor.email,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        fullName: `${doctor.firstName} ${doctor.lastName}`,
        phone: doctor.phone,
        role: doctor.role,
        lastLogin: doctor.lastLogin,
      })),
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctors",
      error: error.message,
    });
  }
});

// POST /api/auth/register-doctor - Register new doctor (any authenticated user, max 3 doctors total)
router.post("/register-doctor", auth, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;



    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username yoki email allaqachon mavjud",
      });
    }

    // Create new doctor
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      role: "doctor",
    });

    res.status(201).json({
      success: true,
      message: "Doktor muvaffaqiyatli qo'shildi",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.getFullName(),
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register doctor error:", error);
    res.status(500).json({
      success: false,
      message: "Doktor qo'shishda xatolik yuz berdi",
      error: error.message,
    });
  }
});

// DELETE /api/auth/doctors/:id - Deactivate a doctor (admin and doctor only)
router.delete("/doctors/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Only admins and doctors can delete
    if (!["admin", "doctor"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Sizda bu amalni bajarish uchun ruxsat yo'q",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Doktor topilmadi",
      });
    }

    if (!["admin", "doctor"].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: "Faqat doktorlarni o'chirish mumkin",
      });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.count({
        where: {
          role: "admin",
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Eng kamida bitta admin qolishi kerak",
        });
      }
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: "Doktor muvaffaqiyatli o'chirildi",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({
      success: false,
      message: "Doktor o'chirishda xatolik yuz berdi",
      error: error.message,
    });
  }
});

module.exports = router;
