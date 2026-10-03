const { GoogleGenAI } = require("@google/genai");
const { sanitizeForPrompt } = require("../utils/validators");

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const solveMath = async (input, format = "text", problemType = "other") => {
  try {
    // Sanitize input to prevent prompt injection
    const cleanInput = sanitizeForPrompt(input);

    if (!cleanInput) {
      throw new Error("Invalid or empty input after sanitization.");
    }

    const prompt = `You are an expert mathematical solver and tutor. 
    The user has provided the following math problem:
    Problem: "${cleanInput}"
    Format: "${format}"
    Type: "${problemType}"

    Solve this step-by-step. Return the response STRICTLY as a JSON object with this exact structure (do not include markdown wrapping like \`\`\`json):
    {
      "answer": "String. A short human readable final answer.",
      "latex": "String. The final answer strictly in LaTeX format.",
      "graphExpression": "String or null. If the problem naturally involves graphing, or is a function f(x), y=..., or an expression of a single variable x, output the strict right-hand side mathjs parsable string here (e.g. 'x^2 + 5'). If graphing is irrelevant or impossible, output null.",
      "steps": [
        {
          "step": Number,
          "description": "String. A clear explanation of what is happening in this step.",
          "latex": "String. The mathematical state of the equation at this step in LaTeX format."
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const outputText = response.text.trim();
    const solutionData = JSON.parse(outputText);

    return {
      answer: solutionData.answer || "Calculation complete.",
      steps: solutionData.steps || [],
      latex: solutionData.latex || input,
      graphExpression: solutionData.graphExpression || null,
      verification: {
        verified: !!solutionData.answer,
        method: "ai-generated",
      },
    };
  } catch (error) {
    console.error("Solver Error:", error);
    throw new Error("Solving failed: " + error.message);
  }
};

module.exports = { solveMath };
