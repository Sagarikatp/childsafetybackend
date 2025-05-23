const express = require("express");
const router = express.Router();
const {
  createGeofence,
  getGeofences,
} = require("../Controllers/geofenceController");
const authMiddleware = require("../middleware/auth"); // Adjust this path to your auth middleware

router.post("/geofences", authMiddleware, createGeofence);

router.get("/geofences", getGeofences);

module.exports = router;
