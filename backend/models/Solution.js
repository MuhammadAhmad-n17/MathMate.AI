const mongoose = require("mongoose");

const SolutionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  equation: String,
  answer: String,
  steps: [
    {
      step: Number,
      description: String,
      latex: String,
    },
  ],
  latex: String,
  verification: {
    verified: Boolean,
    confidence: Number,
  },
  solvingTime: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Solution", SolutionSchema);
