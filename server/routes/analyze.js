const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");
const path = require("path");
const Scan = require("../models/Scan");

router.post("/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Video URL is required" });
  }

  // Paths go up from server/routes/ → server/ → DeepfakeDetector/
  const scriptPath = path.join(__dirname, "../../link_to_result.py");
  const pythonExe = path.join(__dirname, "../../venv/Scripts/python.exe");

  const pythonProcess = spawn(pythonExe, [scriptPath, url], { cwd: path.join(__dirname, "../..") });

  let output = "";
  let errorOutput = "";

  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on("close", async (code) => {
    const resultLine = output
      .split("\n")
      .find((line) => line.startsWith("RESULT_JSON:"));

    if (!resultLine) {
      console.error("Python error output:", errorOutput);
      return res.status(500).json({ error: "Analysis failed", details: errorOutput });
    }

    try {
      const result = JSON.parse(resultLine.replace("RESULT_JSON:", ""));

      const scan = await Scan.create({
        url,
        prediction: result.prediction,
        confidence: result.confidence,
        avg_real: result.avg_real,
        avg_fake: result.avg_fake,
        frame_count: result.frame_count,
        userId: req.user?.id // only if JWT auth middleware is attached
      });

      res.json(scan);
    } catch (err) {
      console.error("Parse error:", err);
      res.status(500).json({ error: "Could not parse analysis result" });
    }
  });
});

module.exports = router;
