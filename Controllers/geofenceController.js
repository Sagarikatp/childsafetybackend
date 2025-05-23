const Geofence = require("../schema/geofenceSchema"); // Adjust the path if needed

// Create a new geofence
const createGeofence = async (req, res) => {
  try {
    const { name, center, radius } = req.body;
    const userId = req.user.id; // Assuming authentication middleware sets req.user

    const geofence = new Geofence({
      name,
      center,
      radius,
      createdBy: userId,
    });

    await geofence.save();
    res.status(201).json({ success: true, data: geofence });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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

module.exports = {
  createGeofence,
  getGeofences,
};
