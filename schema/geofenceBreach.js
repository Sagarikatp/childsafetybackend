const { default: mongoose } = require("mongoose");

const breachSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  geofence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Geofence",
    required: true,
  },
  breached: { type: Boolean, default: false },
});

breachSchema.index({ user: 1, geofence: 1 }, { unique: true });

const GeofenceBreach = mongoose.model("GeofenceBreach", breachSchema);
module.exports = GeofenceBreach;
