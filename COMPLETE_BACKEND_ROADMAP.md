# 🚀 Dental Clinic Backend - To'liq Roadmap (File Path bilan)

Bu roadmap sizga 0 dan boshlab to'liq ishlaydigan backend yaratish va frontend bilan bog'lash uchun aniq file path va kodlar bilan step-by-step yo'riqnoma beradi.

## 📋 Mundarija
1. [Loyiha Strukturasi](#1-loyiha-strukturasi)
2. [Asosiy Fayllarni Yaratish](#2-asosiy-fayllarni-yaratish)
3. [Database Models](#3-database-models)
4. [Middleware va Utils](#4-middleware-va-utils)
5. [API Routes](#5-api-routes)
6. [Server Configuration](#6-server-configuration)
7. [Frontend Integration](#7-frontend-integration)
8. [Testing va Deployment](#8-testing-va-deployment)

---

## 1. Loyiha Strukturasi

### 1.1 Papka Strukturasini Yaratish
\`\`\`bash
# Terminal da loyiha papkasiga o'ting
cd your-project-folder

# Backend papkasini yaratish
mkdir dental-clinic-backend
cd dental-clinic-backend

# Barcha kerakli papkalarni yaratish
mkdir -p {models,routes,middleware,utils,config,controllers,services,tests}
mkdir -p public/{uploads,images}
mkdir -p logs
\`\`\`

**Yakuniy struktura:**
\`\`\`
dental-clinic-backend/
├── config/
│   ├── database.js
│   └── cloudinary.js
├── controllers/
│   ├── clientController.js
│   ├── treatmentController.js
│   └── authController.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── models/
│   ├── Client.js
│   ├── Treatment.js
│   └── User.js
├── routes/
│   ├── clients.js
│   ├── treatments.js
│   ├── auth.js
│   └── upload.js
├── services/
│   ├── emailService.js
│   └── fileService.js
├── utils/
│   ├── helpers.js
│   └── constants.js
├── tests/
│   └── api.test.js
├── public/
│   └── uploads/
├── logs/
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
\`\`\`

### 1.2 package.json Yaratish
\`\`\`bash
# package.json yaratish
npm init -y
\`\`\`

**File: `dental-clinic-backend/package.json`**
\`\`\`json
{
  "name": "dental-clinic-backend",
  "version": "1.0.0",
  "description": "Dental Clinic Management System Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node utils/seedData.js",
    "test": "jest --watchAll",
    "test:coverage": "jest --coverage"
  },
  "keywords": ["dental", "clinic", "management", "api", "nodejs", "express"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.40.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "joi": "^17.9.2",
    "nodemailer": "^6.9.4",
    "moment": "^2.29.4",
    "morgan": "^1.10.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3"
  }
}
\`\`\`

### 1.3 Paketlarni O'rnatish
\`\`\`bash
# Production dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer cloudinary helmet express-rate-limit joi nodemailer moment morgan compression

# Development dependencies
npm install --save-dev nodemon jest supertest
\`\`\`

---

## 2. Asosiy Fayllarni Yaratish

### 2.1 Environment Configuration
**File: `dental-clinic-backend/.env`**
\`\`\`env
# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Database Configuration
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/dental-clinic
# MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dental-clinic?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-complex-2024
JWT_EXPIRE=7d

# Cloudinary Configuration (https://cloudinary.com/)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,audio/mpeg,audio/wav,video/mp4

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
\`\`\`

### 2.2 Git Configuration
**File: `dental-clinic-backend/.gitignore`**
\`\`\`gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
.nyc_output/

# Uploads
public/uploads/*
!public/uploads/.gitkeep

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build
dist/
build/
\`\`\`

---

## 3. Database Models

### 3.1 Database Connection
**File: `dental-clinic-backend/config/database.js`**
\`\`\`javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Database events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
\`\`\`

### 3.2 Client Model
**File: `dental-clinic-backend/models/Client.js`**
\`\`\`javascript
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+998\d{9}$/, 'Please enter a valid phone number (+998XXXXXXXXX)']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  age: {
    type: Number,
    min: [1, 'Age must be at least 1'],
    max: [150, 'Age cannot exceed 150']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },

  // Treatment Information
  status: {
    type: String,
    enum: ['inTreatment', 'completed'],
    default: 'inTreatment'
  },
  initialTreatment: {
    type: String,
    trim: true,
    maxlength: [100, 'Initial treatment cannot exceed 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  // File uploads
  uploadedFiles: {
    image: {
      filename: String,
      url: String,
      cloudinaryId: String,
      uploadedAt: { type: Date, default: Date.now }
    },
    audio: {
      filename: String,
      url: String,
      cloudinaryId: String,
      uploadedAt: { type: Date, default: Date.now }
    },
    video: {
      filename: String,
      url: String,
      cloudinaryId: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
clientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

clientSchema.virtual('treatmentCount', {
  ref: 'Treatment',
  localField: '_id',
  foreignField: 'clientId',
  count: true
});

// Indexes for better performance
clientSchema.index({ firstName: 1, lastName: 1 });
clientSchema.index({ phone: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: -1 });

// Pre-save middleware
clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', clientSchema);
\`\`\`

### 3.3 Treatment Model
**File: `dental-clinic-backend/models/Treatment.js`**
\`\`\`javascript
const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  // Client reference
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required']
  },

  // Treatment details
  visitType: {
    type: String,
    required: [true, 'Visit type is required'],
    trim: true,
    maxlength: [100, 'Visit type cannot exceed 100 characters']
  },
  treatmentType: {
    type: String,
    required: [true, 'Treatment type is required'],
    trim: true,
    maxlength: [100, 'Treatment type cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Doctor information
  doctor: {
    type: String,
    default: 'Dr. Karimova',
    trim: true,
    maxlength: [100, 'Doctor name cannot exceed 100 characters']
  },

  // Financial information
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },

  // Next visit information
  nextVisitDate: {
    type: Date
  },
  nextVisitNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Next visit notes cannot exceed 500 characters']
  },

  // Treatment images
  images: [{
    filename: String,
    url: String,
    cloudinaryId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Treatment status
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'completed'
  },

  // Dates
  treatmentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
treatmentSchema.index({ clientId: 1 });
treatmentSchema.index({ treatmentDate: -1 });
treatmentSchema.index({ status: 1 });
treatmentSchema.index({ doctor: 1 });

// Pre-save middleware
treatmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Treatment', treatmentSchema);
\`\`\`

### 3.4 User Model (Authentication)
**File: `dental-clinic-backend/models/User.js`**
\`\`\`javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Personal information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },

  // Role and permissions
  role: {
    type: String,
    enum: ['admin', 'doctor', 'assistant'],
    default: 'assistant'
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Last login
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual fields
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Pre-save middleware - hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
\`\`\`

---

## 4. Middleware va Utils

### 4.1 Authentication Middleware
**File: `dental-clinic-backend/middleware/auth.js`**
\`\`\`javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token verification middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, access denied'
      });
    }

    // Remove 'Bearer ' prefix
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Add user info to request
    req.user = {
      userId: user._id,
      username: user.username,
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Admin role check
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Doctor or Admin role check
const doctorAuth = (req, res, next) => {
  if (!['admin', 'doctor'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Doctor or Admin access required'
    });
  }
  next();
};

module.exports = { auth, adminAuth, doctorAuth };
\`\`\`

### 4.2 Validation Middleware
**File: `dental-clinic-backend/middleware/validation.js`**
\`\`\`javascript
const Joi = require('joi');

// Client validation
const validateClient = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required().messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters'
    }),
    lastName: Joi.string().trim().min(2).max(50).required().messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
    phone: Joi.string().pattern(/^\+998\d{9}$/).required().messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Invalid phone number format (+998XXXXXXXXX)'
    }),
    email: Joi.string().email().allow('').optional().messages({
      'string.email': 'Invalid email format'
    }),
    age: Joi.number().integer().min(1).max(150).optional().messages({
      'number.min': 'Age must be at least 1',
      'number.max': 'Age cannot exceed 150'
    }),
    address: Joi.string().trim().max(200).allow('').optional().messages({
      'string.max': 'Address cannot exceed 200 characters'
    }),
    initialTreatment: Joi.string().trim().max(100).allow('').optional().messages({
      'string.max': 'Initial treatment cannot exceed 100 characters'
    }),
    notes: Joi.string().trim().max(500).allow('').optional().messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

// Treatment validation
const validateTreatment = (req, res, next) => {
  const schema = Joi.object({
    clientId: Joi.string().required().messages({
      'string.empty': 'Client ID is required'
    }),
    visitType: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Visit type is required',
      'string.min': 'Visit type must be at least 2 characters',
      'string.max': 'Visit type cannot exceed 100 characters'
    }),
    treatmentType: Joi.string().trim().min(2).max(100).required().messages({
      'string.empty': 'Treatment type is required',
      'string.min': 'Treatment type must be at least 2 characters',
      'string.max': 'Treatment type cannot exceed 100 characters'
    }),
    description: Joi.string().trim().max(500).allow('').optional().messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    notes: Joi.string().trim().max(1000).allow('').optional().messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
    doctor: Joi.string().trim().max(100).optional().messages({
      'string.max': 'Doctor name cannot exceed 100 characters'
    }),
    cost: Joi.number().min(0).optional().messages({
      'number.min': 'Cost cannot be negative'
    }),
    nextVisitDate: Joi.date().optional(),
    nextVisitNotes: Joi.string().trim().max(500).allow('').optional().messages({
      'string.max': 'Next visit notes cannot exceed 500 characters'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

// Login validation
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().trim().required().messages({
      'string.empty': 'Username or email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

// Register validation
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required().messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email format'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    }),
    firstName: Joi.string().trim().min(2).max(50).required().messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters'
    }),
    lastName: Joi.string().trim().min(2).max(50).required().messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
    role: Joi.string().valid('admin', 'doctor', 'assistant').optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  next();
};

module.exports = {
  validateClient,
  validateTreatment,
  validateLogin,
  validateRegister
};
\`\`\`

### 4.3 Error Handler Middleware
**File: `dental-clinic-backend/middleware/errorHandler.js`**
\`\`\`javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
\`\`\`

### 4.4 Cloudinary Configuration
**File: `dental-clinic-backend/config/cloudinary.js`**
\`\`\`javascript
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
\`\`\`

---

## 5. API Routes

### 5.1 Client Routes
**File: `dental-clinic-backend/routes/clients.js`**
\`\`\`javascript
const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Treatment = require('../models/Treatment');
const { validateClient } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// GET /api/clients - Get all clients
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Build status filter
    const statusFilter = {};
    if (status !== 'all') {
      statusFilter.status = status;
    }

    // Combine filters
    const filter = { ...searchFilter, ...statusFilter, isActive: true };

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const clients = await Client.find(filter)
      .populate('treatmentCount')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Client.countDocuments(filter);

    res.json({
      success: true,
      data: clients,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
});

// POST /api/clients - Create new client
router.post('/', auth, validateClient, async (req, res) => {
  try {
    // Check if phone number already exists
    const existingClient = await Client.findOne({ phone: req.body.phone });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this phone number already exists'
      });
    }

    const client = new Client(req.body);
    await client.save();

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    console.error('Create client error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Phone number or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating client',
      error: error.message
    });
  }
});

// GET /api/clients/:id - Get single client
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('treatmentCount');

    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Get client's treatment history
    const treatments = await Treatment.find({ clientId: client._id })
      .sort({ treatmentDate: -1 });

    res.json({
      success: true,
      data: {
        ...client.toObject(),
        treatmentHistory: treatments
      }
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    });
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', auth, validateClient, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    console.error('Update client error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Phone number or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    });
  }
});

// PUT /api/clients/:id/status - Update client status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['inTreatment', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
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
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client status updated successfully',
      data: client
    });
  } catch (error) {
    console.error('Update client status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating client status',
      error: error.message
    });
  }
});

// DELETE /api/clients/:id - Delete client (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting client',
      error: error.message
    });
  }
});

// POST /api/clients/bulk-status - Update multiple clients status
router.post('/bulk-status', auth, async (req, res) => {
  try {
    const { clientIds, status } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client IDs array is required'
      });
    }

    if (!['inTreatment', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const result = await Client.updateMany(
      { _id: { $in: clientIds } },
      { status, updatedAt: Date.now() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} clients status updated`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating clients status',
      error: error.message
    });
  }
});

// DELETE /api/clients/bulk - Delete multiple clients
router.delete('/bulk', auth, async (req, res) => {
  try {
    const { clientIds } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client IDs array is required'
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
      deletedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting clients',
      error: error.message
    });
  }
});

module.exports = router;
\`\`\`

### 5.2 Treatment Routes
**File: `dental-clinic-backend/routes/treatments.js`**
\`\`\`javascript
const express = require('express');
const router = express.Router();
const Treatment = require('../models/Treatment');
const Client = require('../models/Client');
const { validateTreatment } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// POST /api/treatments - Create new treatment
router.post('/', auth, validateTreatment, async (req, res) => {
  try {
    const {
      clientId,
      visitType,
      treatmentType,
      description,
      notes,
      doctor = 'Dr. Karimova',
      cost = 0,
      nextVisitDate,
      nextVisitNotes
    } = req.body;

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
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
      status: 'completed'
    });

    await treatment.save();

    // Update client's last update time
    await Client.findByIdAndUpdate(clientId, { updatedAt: Date.now() });

    res.status(201).json({
      success: true,
      message: 'Treatment created successfully',
      data: treatment
    });
  } catch (error) {
    console.error('Create treatment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating treatment',
      error: error.message
    });
  }
});

// GET /api/treatments/client/:clientId - Get client treatments
router.get('/client/:clientId', auth, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if client exists
    const client = await Client.findById(clientId);
    if (!client || !client.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Get treatments
    const treatments = await Treatment.find({ clientId })
      .sort({ treatmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Treatment.countDocuments({ clientId });

    res.json({
      success: true,
      data: treatments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get client treatments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching treatments',
      error: error.message
    });
  }
});

// GET /api/treatments/:id - Get single treatment
router.get('/:id', auth, async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id)
      .populate('clientId', 'firstName lastName phone');

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    res.json({
      success: true,
      data: treatment
    });
  } catch (error) {
    console.error('Get treatment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching treatment',
      error: error.message
    });
  }
});

// PUT /api/treatments/:id - Update treatment
router.put('/:id', auth, validateTreatment, async (req, res) => {
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
      updatedAt: Date.now()
    };

    const treatment = await Treatment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    res.json({
      success: true,
      message: 'Treatment updated successfully',
      data: treatment
    });
  } catch (error) {
    console.error('Update treatment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating treatment',
      error: error.message
    });
  }
});

// DELETE /api/treatments/:id - Delete treatment
router.delete('/:id', auth, async (req, res) => {
  try {
    const treatment = await Treatment.findByIdAndDelete(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found'
      });
    }

    res.json({
      success: true,
      message: 'Treatment deleted successfully'
    });
  } catch (error) {
    console.error('Delete treatment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting treatment',
      error: error.message
    });
  }
});

// GET /api/treatments - Get all treatments (admin)
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      doctor = '',
      status = 'all',
      startDate = '',
      endDate = '',
      sortBy = 'treatmentDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filters
    const filter = {};

    if (doctor) {
      filter.doctor = { $regex: doctor, $options: 'i' };
    }

    if (status !== 'all') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.treatmentDate = {};
      if (startDate) filter.treatmentDate.$gte = new Date(startDate);
      if (endDate) filter.treatmentDate.$lte = new Date(endDate);
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const treatments = await Treatment.find(filter)
      .populate('clientId', 'firstName lastName phone')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Treatment.countDocuments(filter);

    res.json({
      success: true,
      data: treatments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get treatments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching treatments',
      error: error.message
    });
  }
});

module.exports = router;
\`\`\`

### 5.3 Authentication Routes
**File: `dental-clinic-backend/routes/auth.js`**
\`\`\`javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateLogin, validateRegister } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role = 'assistant' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
});

module.exports = router;
\`\`\`

---

## 6. Server Configuration

### 6.1 Main Server File
**File: `dental-clinic-backend/server.js`**
\`\`\`javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import configurations
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const clientRoutes = require('./routes/clients');
const treatmentRoutes = require('./routes/treatments');
const authRoutes = require('./routes/auth');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ 
  limit: process.env.MAX_FILE_SIZE || '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_FILE_SIZE || '10mb' 
}));

// Static files
app.use('/uploads', express.static('public/uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/treatments', treatmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Dental Clinic API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Dental Clinic Management System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user',
        'POST /api/auth/logout': 'Logout user'
      },
      clients: {
        'GET /api/clients': 'Get all clients',
        'POST /api/clients': 'Create new client',
        'GET /api/clients/:id': 'Get single client',
        'PUT /api/clients/:id': 'Update client',
        'DELETE /api/clients/:id': 'Delete client',
        'PUT /api/clients/:id/status': 'Update client status',
        'POST /api/clients/bulk-status': 'Update multiple clients status',
        'DELETE /api/clients/bulk': 'Delete multiple clients'
      },
      treatments: {
        'GET /api/treatments': 'Get all treatments',
        'POST /api/treatments': 'Create new treatment',
        'GET /api/treatments/:id': 'Get single treatment',
        'PUT /api/treatments/:id': 'Update treatment',
        'DELETE /api/treatments/:id': 'Delete treatment',
        'GET /api/treatments/client/:clientId': 'Get client treatments'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Documentation: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/api/health
  `);
});

module.exports = app;
\`\`\`

### 6.2 Seed Data Script
**File: `dental-clinic-backend/utils/seedData.js`**
\`\`\`javascript
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Client = require('../models/Client');
const Treatment = require('../models/Treatment');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Client.deleteMany({});
    await Treatment.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@dentalclinic.uz',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    await adminUser.save();

    // Create doctor user
    const doctorUser = new User({
      username: 'doctor',
      email: 'doctor@dentalclinic.uz',
      password: 'doctor123',
      firstName: 'Dr. Malika',
      lastName: 'Karimova',
      role: 'doctor'
    });
    await doctorUser.save();

    console.log('👥 Created users');

    // Create sample clients
    const clients = [
      {
        firstName: 'Ahmadjon',
        lastName: 'Karimov',
        phone: '+998901234567',
        email: 'ahmad@example.com',
        age: 35,
        address: 'Toshkent, Yunusobod tumani',
        status: 'inTreatment',
        initialTreatment: 'Tish to\'ldirish',
        notes: 'Yuqori jag\'da 3 ta tish davolash kerak'
      },
      {
        firstName: 'Malika',
        lastName: 'Toshmatova',
        phone: '+998907654321',
        email: 'malika@example.com',
        age: 28,
        address: 'Toshkent, Mirzo Ulug\'bek tumani',
        status: 'completed',
        initialTreatment: 'Tish tozalash',
        notes: 'Muntazam profilaktik ko\'rik'
      },
      {
        firstName: 'Bobur',
        lastName: 'Rahimov',
        phone: '+998909876543',
        email: 'bobur@example.com',
        age: 42,
        address: 'Toshkent, Shayxontohur tumani',
        status: 'inTreatment',
        initialTreatment: 'Implant o\'rnatish',
        notes: 'Oldindan tayyorgarlik ko\'rish kerak'
      },
      {
        firstName: 'Nodira',
        lastName: 'Abdullayeva',
        phone: '+998905555555',
        email: 'nodira@example.com',
        age: 24,
        address: 'Toshkent, Chilonzor tumani',
        status: 'inTreatment',
        initialTreatment: 'Ortodontik davolash',
        notes: 'Breket tizimi o\'rnatilgan'
      }
    ];

    const createdClients = await Client.insertMany(clients);
    console.log('🦷 Created clients');

    // Create sample treatments
    const treatments = [
      {
        clientId: createdClients[0]._id,
        visitType: 'Karies davolash',
        treatmentType: 'Tish to\'ldirish',
        description: 'Yuqori jag\'dagi tish to\'ldirildi',
        notes: 'Karies tozalandi, kompozit material bilan to\'ldirildi',
        doctor: 'Dr. Karimova',
        cost: 150000,
        status: 'completed'
      },
      {
        clientId: createdClients[0]._id,
        visitType: 'Konsultatsiya',
        treatmentType: 'Dastlabki ko\'rik',
        description: 'Og\'iz bo\'shlig\'i tekshirildi',
        notes: '3 ta tishda karies aniqlandi',
        doctor: 'Dr. Karimova',
        cost: 50000,
        status: 'completed'
      },
      {
        clientId: createdClients[1]._id,
        visitType: 'Profilaktika',
        treatmentType: 'Tish tozalash',
        description: 'Professional tish tozalash',
        notes: 'Ultrasonic tozalash amalga oshirildi',
        doctor: 'Dr. Abdullayev',
        cost: 100000,
        status: 'completed'
      }
    ];

    await Treatment.insertMany(treatments);
    console.log('💊 Created treatments');

    console.log(`
🎉 Seed data created successfully!

📋 Login credentials:
👤 Admin: username=admin, password=admin123
🩺 Doctor: username=doctor, password=doctor123

🔗 API Endpoints:
📍 Health Check: http://localhost:5000/api/health
📍 API Docs: http://localhost:5000/api
📍 Clients: http://localhost:5000/api/clients
📍 Treatments: http://localhost:5000/api/treatments
📍 Auth: http://localhost:5000/api/auth
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed data error:', error);
    process.exit(1);
  }
};

// Run seed data
seedData();
\`\`\`

---

## 7. Frontend Integration

### 7.1 API Service Layer
**File: `your-frontend-project/services/api.js`**
\`\`\`javascript
// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

export default new ApiService();
\`\`\`

### 7.2 Client Service
**File: `your-frontend-project/services/clientService.js`**
\`\`\`javascript
import ApiService from './api';

class ClientService {
  // Get all clients
  static async getAllClients(params = {}) {
    return ApiService.get('/clients', params);
  }

  // Create new client
  static async createClient(clientData) {
    return ApiService.post('/clients', clientData);
  }

  // Get single client
  static async getClient(clientId) {
    return ApiService.get(`/clients/${clientId}`);
  }

  // Update client
  static async updateClient(clientId, clientData) {
    return ApiService.put(`/clients/${clientId}`, clientData);
  }

  // Update client status
  static async updateClientStatus(clientId, status) {
    return ApiService.put(`/clients/${clientId}/status`, { status });
  }

  // Delete client
  static async deleteClient(clientId) {
    return ApiService.delete(`/clients/${clientId}`);
  }

  // Bulk status update
  static async bulkUpdateStatus(clientIds, status) {
    return ApiService.post('/clients/bulk-status', { clientIds, status });
  }

  // Bulk delete
  static async bulkDelete(clientIds) {
    return ApiService.delete('/clients/bulk', { clientIds });
  }
}

export default ClientService;
\`\`\`

### 7.3 Treatment Service
**File: `your-frontend-project/services/treatmentService.js`**
\`\`\`javascript
import ApiService from './api';

class TreatmentService {
  // Create new treatment
  static async createTreatment(treatmentData) {
    return ApiService.post('/treatments', treatmentData);
  }

  // Get client treatments
  static async getClientTreatments(clientId, params = {}) {
    return ApiService.get(`/treatments/client/${clientId}`, params);
  }

  // Get single treatment
  static async getTreatment(treatmentId) {
    return ApiService.get(`/treatments/${treatmentId}`);
  }

  // Update treatment
  static async updateTreatment(treatmentId, treatmentData) {
    return ApiService.put(`/treatments/${treatmentId}`, treatmentData);
  }

  // Delete treatment
  static async deleteTreatment(treatmentId) {
    return ApiService.delete(`/treatments/${treatmentId}`);
  }

  // Get all treatments (admin)
  static async getAllTreatments(params = {}) {
    return ApiService.get('/treatments', params);
  }
}

export default TreatmentService;
\`\`\`

### 7.4 Auth Service
**File: `your-frontend-project/services/authService.js`**
\`\`\`javascript
import ApiService from './api';

class AuthService {
  // Login
  static async login(credentials) {
    const response = await ApiService.post('/auth/login', credentials);
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  // Register
  static async register(userData) {
    const response = await ApiService.post('/auth/register', userData);
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  // Get current user
  static async getCurrentUser() {
    return ApiService.get('/auth/me');
  }

  // Logout
  static async logout() {
    const response = await ApiService.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response;
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Get stored user
  static getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export default AuthService;
\`\`\`

### 7.5 Frontend Integration Example
**File: `your-frontend-project/dental-clinic-dashboard.tsx` (modifications)**
\`\`\`javascript
// Add these imports at the top
import ClientService from './services/clientService';
import TreatmentService from './services/treatmentService';
import AuthService from './services/authService';

// Replace localStorage operations with API calls

// 1. Load clients from API instead of localStorage
useEffect(() => {
  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await ClientService.getAllClients({
        search: searchTerm,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: getSortField(),
        sortOrder: getSortOrder()
      });
      
      if (response.success) {
        setClients(response.data);
        setTotalClients(response.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Show error message to user
    } finally {
      setLoading(false);
    }
  };

  fetchClients();
}, [searchTerm, statusFilter, nameSortState, lastVisitSortState, nextAppointmentSortState]);

// 2. Replace handleAddClient function
const handleAddClient = async () => {
  if (!newClient.firstName || !newClient.lastName || !newClient.phone) {
    return;
  }

  try {
    setLoading(true);
    const response = await ClientService.createClient({
      firstName: newClient.firstName,
      lastName: newClient.lastName,
      phone: newClient.phone,
      email: newClient.email,
      age: parseInt(newClient.age) || undefined,
      address: newClient.address,
      initialTreatment: newClient.treatment,
      notes: newClient.notes
    });

    if (response.success) {
      // Refresh clients list
      const clientsResponse = await ClientService.getAllClients();
      if (clientsResponse.success) {
        setClients(clientsResponse.data);
      }
      
      // Reset form
      setNewClient({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        age: '',
        address: '',
        treatment: '',
        notes: ''
      });
      setIsAddClientOpen(false);
      
      // Show success message
      console.log('Client added successfully');
    }
  } catch (error) {
    console.error('Error adding client:', error);
    // Show error message to user
  } finally {
    setLoading(false);
  }
};

// 3. Replace markAsCompleted function
const markAsCompleted = async () => {
  try {
    setLoading(true);
    const response = await ClientService.bulkUpdateStatus(selectedClients, 'completed');
    
    if (response.success) {
      // Refresh clients list
      const clientsResponse = await ClientService.getAllClients();
      if (clientsResponse.success) {
        setClients(clientsResponse.data);
      }
      setSelectedClients([]);
      
      // Show success message
      console.log(`${response.modifiedCount} clients marked as completed`);
    }
  } catch (error) {
    console.error('Error updating client status:', error);
    // Show error message to user
  } finally {
    setLoading(false);
  }
};

// 4. Replace deleteClients function
const deleteClients = async () => {
  if (!window.confirm('Are you sure you want to delete selected clients?')) {
    return;
  }

  try {
    setLoading(true);
    const response = await ClientService.bulkDelete(selectedClients);
    
    if (response.success) {
      // Refresh clients list
      const clientsResponse = await ClientService.getAllClients();
      if (clientsResponse.success) {
        setClients(clientsResponse.data);
      }
      setSelectedClients([]);
      
      // Show success message
      console.log(`${response.deletedCount} clients deleted`);
    }
  } catch (error) {
    console.error('Error deleting clients:', error);
    // Show error message to user
  } finally {
    setLoading(false);
  }
};

// 5. Replace handleAddTreatment function
const handleAdTreatment = async () => {
  if (!selectedClient || !newTreatment.visit || !newTreatment.treatment) {
    return;
  }

  try {
    setLoading(true);
    const response = await TreatmentService.createTreatment({
      clientId: selectedClient.id,
      visitType: newTreatment.visit,
      treatmentType: newTreatment.treatment,
      notes: newTreatment.notes,
      nextVisitDate: newTreatment.nextVisitDate || undefined,
      nextVisitNotes: newTreatment.notes
    });

    if (response.success) {
      // Refresh client's treatment history
      const treatmentsdResponse = await TreatmentService.getClientTreatments(selectedClient.id);
      if (treatmentsResponse.success) {
        setSelectedClient(prev => ({
          ...prev,
          treatmentHistory: treatmentsResponse.data
        }));
      }
      
      // Reset form
      setNewTreatment({
        visit: '',
        treatment: '',
        notes: '',
        nextVisitDate: '',
        images: null
      });
      setIsAddTreatmentOpen(false);
      
      // Show success message
      console.log('Treatment added successfully');
    }
  } catch (error) {
    console.error('Error adding treatment:', error);
    // Show error message to user
  } finally {
    setLoading(false);
  }
};

// 6. Add loading state
const [loading, setLoading] = useState(false);

// 7. Add error handling state
const [error, setError] = useState(null);

// Helper functions for sorting
const getSortField = () => {
  if (nameSortState !== 'none') return 'firstName';
  if (lastVisitSortState !== 'none') return 'updatedAt';
  if (nextAppointmentSortState !== 'none') return 'createdAt';
  return 'createdAt';
};

const getSortOrder = () => {
  if (nameSortState === 'asc') return 'asc';
  if (nameSortState === 'desc') return 'desc';
  if (lastVisitSortState === 'asc') return 'asc';
  if (lastVisitSortState === 'desc') return 'desc';
  if (nextAppointmentSortState === 'asc') return 'asc';
  if (nextAppointmentSortState === 'desc') return 'desc';
  return 'desc';
};
\`\`\`

---

## 8. Testing va Deployment

### 8.1 API Testing
**File: `dental-clinic-backend/tests/api.test.js`**
\`\`\`javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/dental-clinic-test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    test('GET /api/health should return 200', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Dental Clinic API is running');
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/register should create new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login should authenticate user', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });

  // Add more tests for clients, treatments, etc.
});
\`\`\`

### 8.2 Package.json Scripts Update
**File: `dental-clinic-backend/package.json` (scripts section)**
\`\`\`json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node utils/seedData.js",
    "test": "jest --watchAll --detectOpenHandles",
    "test:coverage": "jest --coverage --detectOpenHandles",
    "test:ci": "jest --ci --coverage --detectOpenHandles",
    "build": "echo 'No build step required for Node.js'",
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix"
  }
}
\`\`\`

### 8.3 Deployment Configuration

#### Railway Deployment
**File: `dental-clinic-backend/railway.json`**
\`\`\`json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
\`\`\`

#### Heroku Deployment
**File: `dental-clinic-backend/Procfile`**
\`\`\`
web: npm start
\`\`\`

#### Docker Configuration
**File: `dental-clinic-backend/Dockerfile`**
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["npm", "start"]
\`\`\`

**File: `dental-clinic-backend/docker-compose.yml`**
\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/dental-clinic
    depends_on:
      - mongo
    volumes:
      - ./logs:/app/logs

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
\`\`\`

---

## 🚀 Quick Start Commands

### Development Setup
\`\`\`bash
# 1. Clone and setup
git clone <your-repo>
cd dental-clinic-backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your actual values

# 4. Start MongoDB (if local)
mongod

# 5. Seed database
npm run seed

# 6. Start development server
npm run dev
\`\`\`

### Production Deployment
\`\`\`bash
# 1. Build and deploy to Railway
railway login
railway link
railway up

# 2. Set environment variables
railway variables set MONGODB_URI=your-mongodb-uri
railway variables set JWT_SECRET=your-jwt-secret
railway variables set FRONTEND_URL=your-frontend-url

# 3. Deploy
git push origin main
\`\`\`

### Testing
\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
\`\`\`

---

## 📝 Environment Variables Checklist

Before deploying, make sure you have set all required environment variables:

- [ ] `NODE_ENV` (development/production)
- [ ] `PORT` (5000)
- [ ] `FRONTEND_URL` (your frontend URL)
- [ ] `MONGODB_URI` (your MongoDB connection string)
- [ ] `JWT_SECRET` (long, complex secret key)
- [ ] `CLOUDINARY_CLOUD_NAME` (if using file uploads)
- [ ] `CLOUDINARY_API_KEY` (if using file uploads)
- [ ] `CLOUDINARY_API_SECRET` (if using file uploads)
- [ ] `EMAIL_HOST` (if using email features)
- [ ] `EMAIL_PORT` (if using email features)
- [ ] `EMAIL_USER` (if using email features)
- [ ] `EMAIL_PASS` (if using email features)

---

## 🎯 Final Checklist

### Backend Setup Complete ✅
- [ ] All files created in correct paths
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database connected
- [ ] Seed data created
- [ ] Server running on http://localhost:5000
- [ ] API endpoints responding
- [ ] Authentication working

### Frontend Integration ✅
- [ ] API services created
- [ ] Frontend updated to use API
- [ ] Authentication flow implemented
- [ ] Error handling added
- [ ] Loading states implemented

### Testing ✅
- [ ] API endpoints tested
- [ ] Authentication tested
- [ ] CRUD operations tested
- [ ] Error scenarios tested

### Deployment Ready ✅
- [ ] Environment variables set
- [ ] Database configured
- [ ] CORS configured for production
- [ ] Security middleware enabled
- [ ] Logging configured
- [ ] Health check endpoint working

---

## 🆘 Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Error**
   \`\`\`bash
   # Check MongoDB status
   systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   
   # Check connection string in .env
   \`\`\`

2. **CORS Error**
   \`\`\`javascript
   // Update FRONTEND_URL in .env
   FRONTEND_URL=http://localhost:3000
   
   // Or add to allowed origins in server.js
   \`\`\`

3. **JWT Token Error**
   \`\`\`javascript
   // Make sure JWT_SECRET is set in .env
   JWT_SECRET=your-very-long-secret-key
   
   // Check token format in frontend
   Authorization: Bearer ${token}
   \`\`\`

4. **Port Already in Use**
   \`\`\`bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill process
   kill -9 <PID>
   
   # Or use different port
   PORT=5001 npm run dev
   \`\`\`

---

## 📚 Additional Resources

- **MongoDB Atlas**: https://www.mongodb.com/atlas
- **Cloudinary**: https://cloudinary.com/
- **Railway**: https://railway.app/
- **Heroku**: https://heroku.com/
- **Express.js Docs**: https://expressjs.com/
- **Mongoose Docs**: https://mongoosejs.com/
- **JWT.io**: https://jwt.io/

---

**🎉 Congratulations! You now have a complete roadmap to build and deploy your Dental Clinic Backend API!**

Follow each step carefully, test thoroughly, and you'll have a production-ready backend system. Good luck! 🚀
