/**
 * MathMate.AI — Local OCR Engine
 * 
 * Uses Tesseract.js to extract text from images entirely client-side.
 * No API calls needed. Works offline.
 */

import { createWorker } from 'tesseract.js';

let worker = null;
let isInitializing = false;
let initPromise = null;

/**
 * Initialize the Tesseract worker (lazy — only on first use).
 * The worker is reused across calls for performance.
 */
async function getWorker() {
  if (worker) return worker;

  if (isInitializing) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      worker = await createWorker('eng', 1, {
        logger: () => {}, // Suppress progress logs
      });
      return worker;
    } catch (error) {
      isInitializing = false;
      worker = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Post-process OCR output to improve math notation.
 */
function cleanMathText(text) {
  let cleaned = text;

  // Common OCR misreads for math
  cleaned = cleaned.replace(/[|l](?=\s*[=+\-*/^])/g, '1'); // | or l near operators → 1
  cleaned = cleaned.replace(/[oO](?=\s*[=+\-*/^])/g, '0'); // O near operators → 0
  cleaned = cleaned.replace(/×/g, '*');
  cleaned = cleaned.replace(/÷/g, '/');
  cleaned = cleaned.replace(/−/g, '-'); // unicode minus → ascii
  cleaned = cleaned.replace(/—/g, '-'); // em dash → minus
  cleaned = cleaned.replace(/'/g, "'");
  cleaned = cleaned.replace(/"/g, '"');

  // Clean up spacing
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove non-math garbage lines (lines with no math characters)
  const lines = cleaned.split('\n');
  const mathLines = lines.filter(line => {
    const stripped = line.trim();
    if (!stripped) return false;
    // Keep lines that have digits, operators, or common math symbols
    return /[\d=+\-*/^()x²³√∫∑πθ]/.test(stripped);
  });

  return mathLines.length > 0 ? mathLines.join('\n') : cleaned;
}

/**
 * Extract text from an image file using Tesseract.js.
 * 
 * @param {File} imageFile - The image file from an input element
 * @returns {Promise<{ success: boolean, text?: string, error?: string }>}
 */
export async function extractTextFromImage(imageFile) {
  try {
    const tessWorker = await getWorker();

    // Convert File to data URL for Tesseract
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const result = await tessWorker.recognize(dataUrl);
    const rawText = result.data.text;

    if (!rawText || rawText.trim().length === 0) {
      return {
        success: false,
        error: 'No text detected in the image. Try a clearer photo with better lighting.',
      };
    }

    const cleaned = cleanMathText(rawText);

    return {
      success: true,
      text: cleaned,
      confidence: result.data.confidence,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'OCR processing failed',
    };
  }
}

/**
 * Terminate the worker to free memory.
 */
export async function terminateOcr() {
  if (worker) {
    await worker.terminate();
    worker = null;
    isInitializing = false;
  }
}
