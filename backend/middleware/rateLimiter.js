const rateLimit = require("express-rate-limit");

// In-memory rate limiter — no Redis dependency needed
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    error: "Too many requests, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // only 20 login/register attempts per 15 min
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for solve/OCR endpoints (expensive operations)
const solveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 solves per minute
  message: {
    error: "Solving rate limit reached. Please wait a moment.",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { limiter, authLimiter, solveLimiter };
