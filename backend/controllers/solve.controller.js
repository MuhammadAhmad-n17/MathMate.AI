const Problem = require("../models/Problem");
const { solveMath } = require("../services/solver.service");

const solve = async (req, res) => {
  try {
    const { input, format = "text", problemType = "other" } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    const startTime = Date.now();

    // Solve the problem
    const solution = await solveMath(input, format, problemType);

    const solvingTime = Date.now() - startTime;

    // Save to database
    const problem = new Problem({
      userId,
      input,
      inputFormat: format,
      problemType,
      solution: solution.answer,
      steps: solution.steps,
      graphExpression: solution.graphExpression,
      verification: solution.verification,
      solvingTime,
    });

    await problem.save();

    res.json({
      success: true,
      problemId: problem._id,
      solution: solution.answer,
      steps: solution.steps,
      latex: solution.latex,
      graphExpression: solution.graphExpression,
      verification: solution.verification,
      solvingTime,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { solve, getSolution };
