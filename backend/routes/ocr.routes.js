const express = require("express");
const router = express.Router();
const { uploadImage, extractMath } = require("../controllers/ocr.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { solveLimiter } = require("../middleware/rateLimiter");

// OCR endpoints also get stricter rate limiting — image processing is expensive
router.post("/upload", authenticateToken, solveLimiter, uploadImage);
router.post("/extract", authenticateToken, extractMath);

module.exports = router;
