const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/auth.controller");
const { authLimiter } = require("../middleware/rateLimiter");

// Auth endpoints get stricter rate limiting (20 req / 15 min)
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

module.exports = router;
