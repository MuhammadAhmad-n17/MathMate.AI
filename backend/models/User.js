const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: String,
  avatar: String,
  subscription: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free",
  },
  solveLimit: {
    type: Number,
    default: 100,
  },
  usedSolves: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
