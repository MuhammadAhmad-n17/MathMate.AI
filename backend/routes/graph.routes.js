const express = require("express");
const router = express.Router();
const {
  generateGraph,
  exportGraph,
} = require("../controllers/graph.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/generate", authenticateToken, generateGraph);
router.get("/export/:id", authenticateToken, exportGraph);

module.exports = router;
