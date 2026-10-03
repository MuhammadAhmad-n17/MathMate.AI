/**
 * MathMate.AI — Share Engine
 * 
 * Encodes/decodes solutions into shareable URL hashes.
 * No backend needed — everything is in the URL.
 */

/**
 * Encode a solution into a shareable URL hash.
 */
export function encodeSolution(input, solution) {
  const payload = {
    i: input,
    a: solution.answer || solution.solution,
    l: solution.latex,
    s: solution.steps?.map(s => ({
      n: s.step,
      d: s.description,
      x: s.latex,
    })),
    g: solution.graphExpression,
  };

  const json = JSON.stringify(payload);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return encoded;
}

/**
 * Decode a solution from a URL hash.
 */
export function decodeSolution(hash) {
  try {
    const json = decodeURIComponent(escape(atob(hash)));
    const payload = JSON.parse(json);
    return {
      input: payload.i,
      solution: {
        answer: payload.a,
        solution: payload.a,
        latex: payload.l,
        steps: payload.s?.map(s => ({
          step: s.n,
          description: s.d,
          latex: s.x,
        })) || [],
        graphExpression: payload.g,
      },
    };
  } catch (err) {
    console.error('Failed to decode solution:', err);
    return null;
  }
}

/**
 * Generate a shareable URL for a solution.
 */
export function getShareUrl(input, solution) {
  const hash = encodeSolution(input, solution);
  return `${window.location.origin}/share/${hash}`;
}

/**
 * Copy text to clipboard.
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}
