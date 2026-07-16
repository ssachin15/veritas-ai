const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    prediction: {
      type: String,
      enum: ["REAL", "FAKE", "INCONCLUSIVE"],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    avg_real: {
      type: Number,
      required: true,
    },
    avg_fake: {
      type: Number,
      required: true,
    },
    frame_count: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "error"],
      default: "pending",
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scan", scanSchema);
