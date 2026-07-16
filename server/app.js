const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const analyzeRoute = require("./routes/analyze");

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use("/api", analyzeRoute);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "DeepfakeDetector API is running." });
});

// ── Database + Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/deepfake";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[DB] Connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`[Server] Listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[DB] Connection error:", err.message);
    process.exit(1);
  });

module.exports = app;
