// Helper function to sanitize math input
const sanitizeMathInput = (input) => {
  if (typeof input !== "string") return "";
  // Remove potentially dangerous characters (shell injection, code execution)
  return input.replace(/[`;\${}]/g, "").trim();
};

// Helper function to validate LaTeX
const validateLatex = (latex) => {
  if (typeof latex !== "string") return false;
  // Basic LaTeX validation — matching brackets and parentheses
  const brackets =
    (latex.match(/\{/g) || []).length === (latex.match(/\}/g) || []).length;
  const parens =
    (latex.match(/\(/g) || []).length === (latex.match(/\)/g) || []).length;
  return brackets && parens;
};

// Sanitize input before sending to AI prompt (prevent prompt injection)
const sanitizeForPrompt = (input) => {
  if (typeof input !== "string") return "";
  // Strip common prompt injection patterns
  const cleaned = input
    .replace(/ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, "")
    .replace(/you\s+are\s+now/gi, "")
    .replace(/system\s*:\s*/gi, "")
    .replace(/\bprompt\b/gi, "")
    .trim();
  // Limit length to prevent abuse
  return cleaned.slice(0, 2000);
};

module.exports = { sanitizeMathInput, validateLatex, sanitizeForPrompt };
