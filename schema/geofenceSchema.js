const { default: mongoose } = require("mongoose");

const geofenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  center: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function (v) {
          return v.length === 2;
        },
        message: "Center must have exactly two coordinates [lng, lat].",
      },
    },
  },
  radius: {
    type: Number, // in meters
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Add 2dsphere index for geospatial queries
geofenceSchema.index({ center: "2dsphere" });

const Geofence = mongoose.model("Geofence", geofenceSchema);
module.exports = Geofence;
