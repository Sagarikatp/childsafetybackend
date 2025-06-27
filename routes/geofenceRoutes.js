const express = require("express");
const router = express.Router();
const {
  createGeofence,
  getGeofences,
} = require("../Controllers/geofenceController");
const authMiddleware = require("../middleware/auth");
const loginauthMiddleware = require("../middleware/loginAuthMiddleware"); // Adjust this path to your auth middleware

router.post("/geofences", authMiddleware, createGeofence);

router.get("/geofences", authMiddleware, getGeofences);

module.exports = router;
