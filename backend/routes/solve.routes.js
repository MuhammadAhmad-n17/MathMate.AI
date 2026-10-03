const express = require("express");
const router = express.Router();
const { solve, getSolution } = require("../controllers/solve.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { solveLimiter } = require("../middleware/rateLimiter");

// Solve endpoints get stricter rate limiting (10 req / min) — these are expensive
router.post("/equation", authenticateToken, solveLimiter, solve);
router.get("/:id", authenticateToken, getSolution);

module.exports = router;
