// Import necessary modules
require("dotenv").config();
const sendSMS = require("./utils/smsSender");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const authenticateToken = require("./middleware/auth");
const GpsData = require("./schema/gpsSchema");
const geofenceRoutes = require("./routes/geofenceRoutes");
const Geofence = require("./schema/geofenceSchema");
const haversine = require("haversine-distance");
const GeofenceBreach = require("./schema/geofenceBreach");

// Initialize the app
const app = express();
const PORT = 3000;
// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json()); // Built-in body-parser
app.use(morgan("dev"));
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/geofence", geofenceRoutes);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// POST endpoint to store GPS data
app.post("/api/gps", authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user = req.user;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required." });
    }

    const newGpsData = new GpsData({
      latitude,
      longitude,
      createdBy: user.id,
    });
    await newGpsData.save();

    const geofences = await Geofence.find({ createdBy: user.id });
    if (!geofences.length) {
      return res
        .status(404)
        .json({ error: "No geofences found for this user." });
    }

    let smsSent = false;

    for (const geofence of geofences) {
      const center = {
        lat: geofence.center.coordinates[1], // latitude
        lon: geofence.center.coordinates[0], // longitude
      };

      const current = { lat: latitude, lon: longitude };
      const distance = haversine(center, current); // in meters

      let breach = await GeofenceBreach.findOne({
        user: user.id,
        geofence: geofence._id,
      });

      if (!breach) {
        breach = new GeofenceBreach({
          user: user.id,
          geofence: geofence._id,
          breached: false,
        });
      }

      const isNowOutside = distance > geofence.radius;

      if (isNowOutside && !breach.breached && !smsSent) {
        const message = `Alert: Student exited geofence '${geofence.name}'.`;
        await sendSMS("+91" + user.phone, message);

        breach.breached = true;
        await breach.save();

        smsSent = true; // Prevent any further alerts in this cycle
        break; // Exit loop after first SMS
      }

      // Reset if student is back inside
      if (!isNowOutside && breach.breached) {
        breach.breached = false;
        await breach.save();
      }
    }

    res.status(201).json({ message: "GPS data processed successfully." });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// GET endpoint to retrieve all stored GPS data
app.get("/api/gps", authenticateToken, async (req, res) => {
  try {
    const gpsRecords = await GpsData.find({ createdBy: req.user.id }).sort({
      timestamp: -1,
    }); // Sort by latest
    res.status(200).json(gpsRecords);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
