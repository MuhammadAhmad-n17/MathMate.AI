const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  input: String,
  inputFormat: {
    type: String,
    enum: ["text", "latex", "image"],
    default: "text",
  },
  problemType: {
    type: String,
    enum: ["algebra", "calculus", "linear_algebra", "statistics", "other"],
    default: "other",
  },
  graphExpression: String,
  solution: String,
  steps: [
    {
      step: Number,
      description: String,
      latex: String,
      operation: String,
    },
  ],
  verification: {
    verified: Boolean,
    confidence: Number,
  },
  graphs: [
    {
      type: String,
      url: String,
    },
  ],
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  solvingTime: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Problem", ProblemSchema);
