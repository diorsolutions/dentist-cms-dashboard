const mongoose = require("mongoose")

const clientSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+998\d{9}$/, "Please enter a valid phone number (+998XXXXXXXXX)"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    age: {
      type: Number,
      min: [1, "Age must be at least 1"],
      max: [150, "Age cannot exceed 150"],
    },
    dateOfBirth: { // New field for birth date
      type: Date,
      optional: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },

    // Treatment Information
    status: {
      type: String,
      enum: ["inTreatment", "completed"],
      default: "inTreatment",
    },
    initialTreatment: {
      type: String,
      trim: true,
      maxlength: [100, "Initial treatment cannot exceed 100 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },

    // Legacy field for backward compatibility
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    // New structured file storage
    uploadedFiles: {
      images: [
        {
          type: String,
        },
      ],
      documents: [
        {
          type: String,
        },
      ],
      videos: [
        {
          type: String,
        },
      ],
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual fields
clientSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

clientSchema.virtual("treatmentCount", {
  ref: "Treatment",
  localField: "_id",
  foreignField: "clientId",
  count: true,
})

// Indexes for better performance
clientSchema.index({ firstName: 1, lastName: 1 })
clientSchema.index({ email: 1 })
clientSchema.index({ status: 1 })
clientSchema.index({ createdAt: -1 })
clientSchema.index({ dateOfBirth: 1 }); // Index for new field

// Pre-save middleware to ensure uploadedFiles structure
clientSchema.pre("save", function (next) {
  if (!this.uploadedFiles) {
    this.uploadedFiles = { images: [], documents: [], videos: [] }
  }
  if (!this.uploadedFiles.images) {
    this.uploadedFiles.images = []
  }
  if (!this.uploadedFiles.documents) {
    this.uploadedFiles.documents = []
  }
  if (!this.uploadedFiles.videos) {
    this.uploadedFiles.videos = []
  }
  next()
})

// Method to add images
clientSchema.methods.addImages = function (imageFilenames) {
  console.log("Adding images to client:", imageFilenames)

  if (!this.uploadedFiles) {
    this.uploadedFiles = {}
  }
  if (!this.uploadedFiles.images) {
    this.uploadedFiles.images = []
  }

  // Add to new structure
  this.uploadedFiles.images.push(...imageFilenames)

  // Also add to legacy field for backward compatibility
  if (!this.images) {
    this.images = []
  }
  this.images.push(...imageFilenames)

  console.log("Client images after adding:", this.uploadedFiles.images)
  return this.save()
}

// Method to remove images
clientSchema.methods.removeImages = function (imageFilenames) {
  if (this.uploadedFiles && this.uploadedFiles.images) {
    this.uploadedFiles.images = this.uploadedFiles.images.filter((img) => !imageFilenames.includes(img))
  }

  // Also remove from legacy field
  if (this.images) {
    this.images = this.images.filter((img) => !imageFilenames.includes(img))
  }

  return this.save()
}

// Method to get all images
clientSchema.methods.getAllImages = function () {
  const newImages = this.uploadedFiles?.images || []
  const legacyImages = this.images || []

  // Combine and deduplicate
  const allImages = [...new Set([...newImages, ...legacyImages])]
  return allImages
}

module.exports = mongoose.model("Client", clientSchema)