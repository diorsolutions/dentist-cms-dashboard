const Joi = require("joi")

// Client validation
const validateClient = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
    }),
    lastName: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "Last name is required",
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
    }),
    phone: Joi.string()
      .pattern(/^\+998\d{9}$/)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Invalid phone number format (+998XXXXXXXXX)",
      }),
    email: Joi.string().email().allow("").optional().messages({
      "string.email": "Invalid email format",
    }),
    age: Joi.number().integer().min(1).max(150).optional().messages({
      "number.min": "Age must be at least 1",
      "number.max": "Age cannot exceed 150",
    }),
    dateOfBirth: Joi.date().iso().allow(null).optional().messages({ // New field validation
      "date.iso": "Invalid date of birth format (YYYY-MM-DD)",
    }),
    address: Joi.string().trim().max(200).allow("").optional().messages({
      "string.max": "Address cannot exceed 200 characters",
    }),
    initialTreatment: Joi.string().trim().max(100).allow("").optional().messages({
      "string.max": "Initial treatment cannot exceed 100 characters",
    }),
    notes: Joi.string().trim().max(500).allow("").optional().messages({
      "string.max": "Notes cannot exceed 500 characters",
    }),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    })
  }

  next()
}

// Treatment validation
const validateTreatment = (req, res, next) => {
  const schema = Joi.object({
    clientId: Joi.string().required().messages({
      "string.empty": "Client ID is required",
    }),
    visitType: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Visit type is required",
      "string.min": "Visit type must be at least 2 characters",
      "string.max": "Visit type cannot exceed 100 characters",
    }),
    treatmentType: Joi.string().trim().min(2).max(100).allow("").optional().messages({ // Made optional
      "string.min": "Treatment type must be at least 2 characters",
      "string.max": "Treatment type cannot exceed 100 characters",
    }),
    description: Joi.string().trim().max(500).allow("").optional().messages({
      "string.max": "Description cannot exceed 500 characters",
    }),
    notes: Joi.string().trim().max(1000).allow("").optional().messages({
      "string.max": "Notes cannot exceed 1000 characters",
    }),
    doctor: Joi.string().trim().max(100).optional().messages({
      "string.max": "Doctor name cannot exceed 100 characters",
    }),
    cost: Joi.number().min(0).optional().messages({
      "number.min": "Cost cannot be negative",
    }),
    nextVisitDate: Joi.date().optional(),
    nextVisitNotes: Joi.string().trim().max(500).allow("").optional().messages({
      "string.max": "Next visit notes cannot exceed 500 characters",
    }),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    })
  }

  next()
}

// Login validation
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().trim().required().messages({
      "string.empty": "Username or email is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    })
  }

  next()
}

// Register validation
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required().messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username cannot exceed 30 characters",
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email format",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
    }),
    firstName: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
    }),
    lastName: Joi.string().trim().min(2).max(50).required().messages({
      "string.empty": "Last name is required",
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
    }),
    role: Joi.string().valid("admin", "doctor", "assistant").optional(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    })
  }

  next()
}

module.exports = {
  validateClient,
  validateTreatment,
  validateLogin,
  validateRegister,
}