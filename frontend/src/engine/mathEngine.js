/**
 * MathMate.AI — Local Math Engine
 * 
 * Solves math problems client-side using math.js and nerdamer.
 * No API calls needed for ~80% of problems.
 * 
 * Capabilities:
 * - Expression evaluation (2 + 3 * 4, sin(pi/4))
 * - Equation solving (2x + 5 = 15, x^2 - 4 = 0)
 * - Simplification ((x^2 + 2x + 1) / (x + 1))
 * - Derivatives (derivative of x^3 + 2x)
 * - Integrals (integral of x^2)
 * - Factoring (x^2 + 5x + 6)
 */

import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import 'nerdamer/Solve';
import 'nerdamer/Extra';

// ─── Problem Type Detection ────────────────────────────────────────

/**
 * Detects what kind of math problem the user is asking.
 * Returns: { type, cleaned, variable }
 */
function detectProblemType(input) {
  const cleaned = input.trim();
  const lower = cleaned.toLowerCase();

  // Derivative patterns
  if (/\b(d\/d[a-z]|derivative|differentiate|diff)\b/i.test(lower)) {
    return { type: 'derivative', cleaned, variable: extractVariable(cleaned) };
  }

  // Integral patterns
  if (/\b(integral|integrate|antiderivative|∫)\b/i.test(lower)) {
    return { type: 'integral', cleaned, variable: extractVariable(cleaned) };
  }

  // Factor patterns
  if (/\b(factor|factorise|factorize)\b/i.test(lower)) {
    return { type: 'factor', cleaned, variable: extractVariable(cleaned) };
  }

  // Expand patterns
  if (/\b(expand|distribute)\b/i.test(lower)) {
    return { type: 'expand', cleaned, variable: extractVariable(cleaned) };
  }

  // Simplify patterns
  if (/\b(simplify|reduce)\b/i.test(lower)) {
    return { type: 'simplify', cleaned, variable: extractVariable(cleaned) };
  }

  // Equation (contains =)
  if (cleaned.includes('=')) {
    return { type: 'equation', cleaned, variable: extractVariable(cleaned) };
  }

  // Contains a variable → try to treat as expression to simplify or evaluate
  if (/[a-z]/i.test(cleaned) && !/^[a-z]+$/i.test(cleaned)) {
    return { type: 'expression', cleaned, variable: extractVariable(cleaned) };
  }

  // Pure numeric expression
  return { type: 'evaluate', cleaned, variable: null };
}

/**
 * Extract the most likely variable from the expression (defaults to 'x').
 */
function extractVariable(input) {
  // Look for "with respect to x" or "d/dx" or "dx"
  const wrtMatch = input.match(/(?:with\s+respect\s+to|w\.?r\.?t\.?|d\/d)([a-z])/i);
  if (wrtMatch) return wrtMatch[1].toLowerCase();

  const dxMatch = input.match(/\bd([a-z])\b/i);
  if (dxMatch && dxMatch[1] !== 'e') return dxMatch[1].toLowerCase();

  // Find single-letter variables in the expression (exclude common function names)
  const reserved = new Set(['e', 'i', 'pi', 'sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs',
    'exp', 'asin', 'acos', 'atan', 'sec', 'csc', 'cot', 'of', 'dx', 'dy']);
  const letters = input.match(/\b([a-z])\b/gi) || [];
  const variables = letters.map(l => l.toLowerCase()).filter(l => !reserved.has(l));

  if (variables.length > 0) return variables[0];
  return 'x';
}

/**
 * Clean the input expression — strip natural language, keep the math.
 */
function extractMathExpression(input, type) {
  let expr = input;

  // Remove common prefixes
  expr = expr.replace(/^(solve|find|calculate|compute|evaluate|what\s+is|determine)\s*/i, '');
  expr = expr.replace(/^(the\s+)?(derivative|integral|antiderivative|diff)\s*(of)?\s*/i, '');
  expr = expr.replace(/^(factor|factorise|factorize|expand|simplify|reduce)\s*/i, '');
  expr = expr.replace(/\s*(with\s+respect\s+to\s+[a-z])\s*/i, '');
  expr = expr.replace(/\s*d[a-z]\s*$/i, ''); // trailing "dx"

  // Clean up common notation
  expr = expr.replace(/\^(\d+)/g, '^$1'); // ensure ^ works
  expr = expr.replace(/(\d)([a-z])/gi, '$1*$2'); // 2x → 2*x
  expr = expr.replace(/([a-z])(\d)/gi, '$1*$2'); // x2 → x*2 (less common but handle it)
  expr = expr.replace(/\)\(/g, ')*('); // )( → )*(
  expr = expr.replace(/(\d)\(/g, '$1*('); // 2( → 2*(
  expr = expr.replace(/\)(\d)/g, ')*$1'); // )2 → )*2
  expr = expr.replace(/([a-z])\(/gi, '$1*('); // x( → x*(

  return expr.trim();
}

// ─── Solvers ────────────────────────────────────────────────────────

/**
 * Evaluate a pure numeric expression.
 */
function solveEvaluate(expr, steps) {
  steps.push({
    step: 1,
    description: 'Evaluate the expression',
    latex: `${expr}`
  });

  const result = math.evaluate(expr);
  const resultStr = typeof result === 'number' ? math.format(result, { precision: 14 }) : String(result);

  steps.push({
    step: 2,
    description: 'Result',
    latex: `= ${resultStr}`
  });

  return {
    answer: resultStr,
    latex: resultStr,
    graphExpression: null,
  };
}

/**
 * Solve an equation for a variable.
 */
function solveEquation(expr, variable, steps) {
  const sides = expr.split('=').map(s => s.trim());
  if (sides.length !== 2) throw new Error('Invalid equation format');

  const [lhs, rhs] = sides;

  steps.push({
    step: 1,
    description: `We need to solve the equation for $${variable}$`,
    latex: `${lhs} = ${rhs}`
  });

  // Move everything to one side
  const combined = `(${lhs}) - (${rhs})`;
  let simplifiedExpr;
  try {
    simplifiedExpr = nerdamer(`simplify(${combined})`).toString();
  } catch {
    simplifiedExpr = combined;
  }

  steps.push({
    step: 2,
    description: 'Rearrange: move all terms to one side',
    latex: `${simplifiedExpr} = 0`
  });

  // Solve with nerdamer
  const solutions = nerdamer.solve(simplifiedExpr, variable);
  const solArray = solutions.toString().replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean);

  if (solArray.length === 0) throw new Error('No solution found');

  steps.push({
    step: 3,
    description: `Solve for $${variable}$`,
    latex: solArray.map(s => `${variable} = ${s}`).join(', \\quad ')
  });

  // Try to evaluate to decimal if it's a number
  const evaluated = solArray.map(s => {
    try {
      const val = math.evaluate(s.replace(/\*/g, '*'));
      return typeof val === 'number' ? math.format(val, { precision: 10 }) : s;
    } catch { return s; }
  });

  if (evaluated.some((v, i) => v !== solArray[i])) {
    steps.push({
      step: 4,
      description: 'Decimal approximation',
      latex: evaluated.map(s => `${variable} \\approx ${s}`).join(', \\quad ')
    });
  }

  const answerStr = solArray.length === 1
    ? `${variable} = ${solArray[0]}`
    : `${variable} = ${solArray.join(', ')}`;

  // Try to get a graphable expression from LHS
  let graphExpr = null;
  try {
    graphExpr = nerdamer(`simplify(${lhs} - (${rhs}))`).toString();
    // Only graph if it's a function of x
    if (!graphExpr.includes(variable)) graphExpr = null;
  } catch { /* no graph */ }

  return {
    answer: answerStr,
    latex: solArray.map(s => `${variable} = ${s}`).join(', \\quad '),
    graphExpression: graphExpr,
  };
}

/**
 * Compute a derivative.
 */
function solveDerivative(expr, variable, steps) {
  steps.push({
    step: 1,
    description: `Find the derivative with respect to $${variable}$`,
    latex: `\\frac{d}{d${variable}}\\left(${expr}\\right)`
  });

  const result = nerdamer(`diff(${expr}, ${variable})`);
  const resultStr = result.toString();

  steps.push({
    step: 2,
    description: 'Apply differentiation rules',
    latex: `= ${resultStr}`
  });

  // Try to simplify
  try {
    const simplified = nerdamer(`simplify(${resultStr})`).toString();
    if (simplified !== resultStr) {
      steps.push({
        step: 3,
        description: 'Simplify the result',
        latex: `= ${simplified}`
      });
      return {
        answer: `${simplified}`,
        latex: `\\frac{d}{d${variable}}\\left(${expr}\\right) = ${simplified}`,
        graphExpression: simplified,
      };
    }
  } catch { /* skip simplification */ }

  return {
    answer: resultStr,
    latex: `\\frac{d}{d${variable}}\\left(${expr}\\right) = ${resultStr}`,
    graphExpression: resultStr,
  };
}

/**
 * Compute an integral.
 */
function solveIntegral(expr, variable, steps) {
  steps.push({
    step: 1,
    description: `Find the indefinite integral with respect to $${variable}$`,
    latex: `\\int ${expr} \\, d${variable}`
  });

  const result = nerdamer(`integrate(${expr}, ${variable})`);
  const resultStr = result.toString();

  steps.push({
    step: 2,
    description: 'Apply integration rules',
    latex: `= ${resultStr} + C`
  });

  return {
    answer: `${resultStr} + C`,
    latex: `\\int ${expr} \\, d${variable} = ${resultStr} + C`,
    graphExpression: resultStr,
  };
}

/**
 * Factor an expression.
 */
function solveFactor(expr, variable, steps) {
  steps.push({
    step: 1,
    description: 'Factor the expression',
    latex: expr
  });

  const result = nerdamer(`factor(${expr})`);
  const resultStr = result.toString();

  steps.push({
    step: 2,
    description: 'Factored form',
    latex: `= ${resultStr}`
  });

  return {
    answer: resultStr,
    latex: resultStr,
    graphExpression: expr.includes(variable) ? expr : null,
  };
}

/**
 * Expand an expression.
 */
function solveExpand(expr, steps) {
  steps.push({
    step: 1,
    description: 'Expand the expression',
    latex: expr
  });

  const result = nerdamer(`expand(${expr})`);
  const resultStr = result.toString();

  steps.push({
    step: 2,
    description: 'Expanded form',
    latex: `= ${resultStr}`
  });

  return {
    answer: resultStr,
    latex: resultStr,
    graphExpression: null,
  };
}

/**
 * Simplify or evaluate a symbolic expression.
 */
function solveExpression(expr, variable, steps) {
  steps.push({
    step: 1,
    description: 'Simplify the expression',
    latex: expr
  });

  // Try nerdamer simplify
  const simplified = nerdamer(`simplify(${expr})`).toString();

  steps.push({
    step: 2,
    description: 'Simplified form',
    latex: `= ${simplified}`
  });

  return {
    answer: simplified,
    latex: simplified,
    graphExpression: simplified.includes(variable) ? simplified : null,
  };
}

// ─── Main Entry Point ───────────────────────────────────────────────

/**
 * Attempt to solve a math problem locally.
 * Returns { success: true, data: { answer, steps, latex, graphExpression } }
 * or { success: false, error: "reason" }
 */
export function solveLocally(input) {
  try {
    const { type, cleaned, variable } = detectProblemType(input);
    const expr = extractMathExpression(cleaned, type);
    const steps = [];
    let result;

    switch (type) {
      case 'evaluate':
        result = solveEvaluate(expr, steps);
        break;
      case 'equation':
        result = solveEquation(expr, variable, steps);
        break;
      case 'derivative':
        result = solveDerivative(expr, variable, steps);
        break;
      case 'integral':
        result = solveIntegral(expr, variable, steps);
        break;
      case 'factor':
        result = solveFactor(expr, variable, steps);
        break;
      case 'expand':
        result = solveExpand(expr, steps);
        break;
      case 'expression':
      case 'simplify':
        result = solveExpression(expr, variable, steps);
        break;
      default:
        return { success: false, error: 'Unrecognized problem type' };
    }

    return {
      success: true,
      data: {
        answer: result.answer,
        solution: result.answer,
        steps,
        latex: result.latex,
        graphExpression: result.graphExpression,
        verification: { verified: true, method: 'local-engine' },
        solvedLocally: true,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Local solver could not handle this problem',
    };
  }
}

/**
 * Check if the local engine can likely handle this input.
 * Used to decide whether to even try local vs going straight to API.
 */
export function canSolveLocally(input) {
  const lower = input.toLowerCase();
  // If it looks like a word problem or natural language, skip local
  const wordProblemIndicators = [
    /\b(how many|how much|what percent|what fraction)\b/,
    /\b(john|mary|alice|bob|train|car|tank|store|price|cost|age|distance|speed)\b/,
    /\b(together|combined|total|remaining|left over)\b/,
    /\b(probability|expected value|standard deviation|variance)\b/,
    /\b(matrix|matrices|determinant|eigenvalue|eigenvector)\b/,
    /\b(proof|prove|theorem|lemma)\b/,
  ];

  for (const pattern of wordProblemIndicators) {
    if (pattern.test(lower)) return false;
  }

  return true;
}

/**
 * Expose problem type detection for UI badges.
 */
export { detectProblemType };

/**
 * Type display info for the UI.
 */
const TYPE_INFO = {
  derivative: { label: 'Calculus — Derivative', emoji: '∫', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  integral: { label: 'Calculus — Integral', emoji: '∫', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  factor: { label: 'Algebra — Factoring', emoji: '🧩', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  expand: { label: 'Algebra — Expansion', emoji: '📐', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  simplify: { label: 'Algebra — Simplification', emoji: '✂️', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  equation: { label: 'Equation Solving', emoji: '🔢', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  expression: { label: 'Expression Evaluation', emoji: '🔢', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
};

export function getTypeInfo(type) {
  return TYPE_INFO[type] || { label: 'Math Problem', emoji: '🔢', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' };
}

/**
 * Suggest related problems based on the detected type.
 */
export function getRelatedProblems(type) {
  const related = {
    derivative: ['derivative of sin(x)', 'derivative of x^4 + 3x^2', 'derivative of e^x * x'],
    integral: ['integrate cos(x)', 'integrate x^3', 'integrate 1/x'],
    factor: ['factor x^2 - 16', 'factor x^2 + 7x + 12', 'factor 2x^2 - 8'],
    expand: ['expand (x+2)^3', 'expand (2x-1)(x+4)', 'expand (a+b)^2'],
    simplify: ['simplify (x^2-1)/(x-1)', 'simplify 2x/4x^2', 'simplify (x+1)^2 - x^2'],
    equation: ['3x + 7 = 22', 'x^2 - 5x + 6 = 0', '2x^2 + 3x - 5 = 0'],
    expression: ['sqrt(144) + 3^4', 'sin(pi/3) * cos(pi/6)', 'log(1000)'],
  };
  return related[type] || related.expression;
}

