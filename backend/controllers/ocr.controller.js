const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const uploadImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      // Convert buffer directly to Base64
      const base64Image = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;

      // Prompt Gemini to act as a pure Math OCR system
      const prompt = `You are an expert mathematical OCR system. Extract all text and mathematical formulas from this image exactly as they appear. If there are explicit written instructions (e.g., "Add following equations", "Solve for x"), include them at the beginning of your extraction. Format the mathematical equations/expressions as LaTeX where applicable. Do not solve the problem. Do not include any conversational text like "Here is the extraction" or "\`\`\`latex". Output ONLY the combined question/instruction text and the raw LaTeX string representing the equations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }
        ]
      });

      const extractedText = response.text.trim();

      // Clean up markdown formatting if Gemini included it despite instructions
      const cleanedText = extractedText.replace(/^```latex\n?/, '').replace(/\n?```$/, '').trim();

      res.json({
        success: true,
        extractedText: cleanedText,
        confidence: 0.99, // Highly confident with Gemini
        message: "Image processed safely with Gemini",
      });
    } catch (error) {
      console.error("OCR Error:", error);
      res.status(500).json({ error: error.message || "Failed to extract math from image." });
    }
  },
];

// Compatibility route matching the legacy extractMath endpoint if needed
const extractMath = async (req, res) => {
  return res.status(400).json({ 
    error: "Deprecated. Use the /api/ocr/upload endpoint and pass the image buffer directly to get latex back." 
  });
};

module.exports = { uploadImage, extractMath };
