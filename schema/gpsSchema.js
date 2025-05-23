const { default: mongoose } = require("mongoose");

const gpsSchema = new mongoose.Schema({
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  timestamp: { type: Date, required: true, default: Date.now },
});

const GpsData = mongoose.model("GpsData", gpsSchema);
module.exports = GpsData;
