const express = require("express");
const router = express.Router();
const {
  createGeofence,
  getGeofences,
  deleteGeofence,
} = require("../Controllers/geofenceController");
const authMiddleware = require("../middleware/auth");

router.post("/geofences", authMiddleware, createGeofence);

router.delete("/geofences/:id", authMiddleware, deleteGeofence);

router.get("/geofences", authMiddleware, getGeofences);

module.exports = router;
