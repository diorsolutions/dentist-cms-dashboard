const mongoose = require("mongoose")

const treatmentSchema = new mongoose.Schema(
  {
    // Client reference
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client ID is required"],
    },

    // Treatment details
    visitType: {
      type: String,
      required: [true, "Visit type is required"],
      trim: true,
      maxlength: [100, "Visit type cannot exceed 100 characters"],
    },
    treatmentType: {
      type: String,
      required: [true, "Treatment type is required"],
      trim: true,
      maxlength: [100, "Treatment type cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },

    // Doctor information
    doctor: {
      type: String,
      default: "Dr. Karimova",
      trim: true,
      maxlength: [100, "Doctor name cannot exceed 100 characters"],
    },

    // Financial information
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
      default: 0,
    },

    // Next visit information
    nextVisitDate: {
      type: Date,
    },
    nextVisitNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Next visit notes cannot exceed 500 characters"],
    },

    // Treatment images
    images: [
      {
        filename: String,
        url: String,
        cloudinaryId: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Treatment status
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "completed",
    },

    // Dates
    treatmentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
treatmentSchema.index({ clientId: 1 })
treatmentSchema.index({ treatmentDate: -1 })
treatmentSchema.index({ status: 1 })
treatmentSchema.index({ doctor: 1 })

// Pre-save middleware
treatmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("Treatment", treatmentSchema)
