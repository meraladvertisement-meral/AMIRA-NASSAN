
import { GoogleGenAI } from "@google/genai";

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Priority: GEMINI_API_KEY, Fallback: API_KEY
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ error: "Missing API Key configuration (GEMINI_API_KEY or API_KEY)" }) 
      };
    }

    const { image, language } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey });
    
    const base64Data = image.includes('base64,') ? image.split(',')[1] : image;
    
    // Improved prompt for better handwriting recognition and formatting
    const prompt = `Task: Perform high-accuracy Optical Character Recognition (OCR).
    I am providing an image that may contain printed text or handwriting.
    
    Instructions:
    1. Extract all visible text exactly as written.
    2. Maintain the original structure, paragraphs, and lists where possible.
    3. Be extremely careful with handwriting; try to decipher even difficult or slanted scripts.
    4. Handle multiple languages: ${language === 'de' ? 'German and English' : 'English and Arabic'}.
    5. If there is Arabic text, ensure it is extracted with correct character connections and logical directionality.
    6. Return ONLY the extracted text. Do not add conversational comments, headers, or meta-text.
    7. If text is blurry, use contextual clues to provide the most likely transcription.`;

    const contents = [{ 
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
      ] 
    }];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: { 
        temperature: 0.1,
        topK: 1,
        topP: 1
      }
    });

    const text = response.text;
    if (!text || text.trim().length === 0) {
      throw new Error("AI could not detect any legible text in this image. Please try a clearer photo.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: text })
    };
  } catch (error) {
    console.error("OCR Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Failed to process image" })
    };
  }
};
