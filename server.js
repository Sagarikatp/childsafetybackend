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
    const { latitude, longitude, timestamp } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required." });
    }

    const newGpsData = new GpsData({ latitude, longitude, timestamp });
    await newGpsData.save();

    res.status(201).json({ message: "GPS data added successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// GET endpoint to retrieve all stored GPS data
app.get("/api/gps", authenticateToken, async (req, res) => {
  try {
    const gpsRecords = await GpsData.find().sort({ timestamp: -1 }); // Sort by latest
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
