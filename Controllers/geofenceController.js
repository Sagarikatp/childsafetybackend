const Geofence = require("../schema/geofenceSchema"); // Adjust the path if needed

// Create a new geofence
const createGeofence = async (req, res) => {
  try {
    const { name, center, radius } = req.body;
    const userId = req.user?.id; // Ensure authentication middleware sets this

    // Validate required fields
    if (
      !name ||
      !center ||
      !Array.isArray(center.coordinates) ||
      center.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input. 'name' and valid 'center.coordinates [lng, lat]' are required.",
      });
    }

    // Construct GeoJSON Point format for location
    const geoPoint = {
      type: "Point",
      coordinates: center.coordinates, // Expected as [lng, lat]
    };

    // Create and save new geofence
    const newGeofence = new Geofence({
      name,
      center: geoPoint,
      radius,
      createdBy: userId,
    });

    await newGeofence.save();

    // Populate createdBy with user info (e.g., name) if needed by frontend
    await newGeofence.populate("createdBy", "name");

    res.status(201).json({
      success: true,
      data: newGeofence,
    });
  } catch (error) {
    console.error("Geofence creation error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create geofence. " + error.message,
    });
  }
};

// Get all geofences
const getGeofences = async (req, res) => {
  try {
    const geofences = await Geofence.find().populate("createdBy", "name email"); // Optional: populate user info
    res.status(200).json({ success: true, data: geofences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGeofence = async (req, res) => {
  try {
    const geofenceId = req.params.id;
    const userId = req.user?.id; // Ensure authentication middleware sets this

    if (!geofenceId) {
      return res.status(400).json({
        success: false,
        message: "Geofence ID is required.",
      });
    }

    // Find the geofence to ensure it exists and was created by the user
    const geofence = await Geofence.findOne({
      _id: geofenceId,
      createdBy: userId,
    });

    if (!geofence) {
      return res.status(404).json({
        success: false,
        message: "Geofence not found or not authorized to delete.",
      });
    }

    // Delete the geofence
    await Geofence.deleteOne({ _id: geofenceId });

    res.status(200).json({
      success: true,
      message: "Geofence deleted successfully.",
    });
  } catch (error) {
    console.error("Geofence deletion error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete geofence. " + error.message,
    });
  }
};

module.exports = {
  createGeofence,
  getGeofences,
  deleteGeofence,
};
