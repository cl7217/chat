const express = require("express");
const router = express.Router();

// Example route (not required for basic chat functionality)
router.get("/status", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

module.exports = router;
