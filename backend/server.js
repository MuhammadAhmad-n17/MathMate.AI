const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const { limiter } = require("./middleware/rateLimiter");

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet()); // Sets various HTTP security headers
app.use(limiter); // Global rate limiting (100 req / 15 min per IP)

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/mathai")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/solve", require("./routes/solve.routes"));
app.use("/api/ocr", require("./routes/ocr.routes"));
app.use("/api/graph", require("./routes/graph.routes"));
app.use("/api/user", require("./routes/user.routes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "MathMate.AI Backend is running", timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
    timestamp: new Date(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MathMate.AI Server running on port ${PORT}`);
});

module.exports = app;
