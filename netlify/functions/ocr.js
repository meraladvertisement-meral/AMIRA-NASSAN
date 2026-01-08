
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
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing API Key" }) };
    }

    const { image, language } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey });
    
    const base64Data = image.includes('base64,') ? image.split(',')[1] : image;
    const contents = [{ 
      parts: [
        { text: `Extract all visible text from this image exactly as it appears. If the language is ${language === 'de' ? 'German' : 'English'}, ensure special characters are preserved. If there is Arabic text, extract it accurately.` },
        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
      ] 
    }];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: { temperature: 0.1 } // Low temperature for factual extraction
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: response.text })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
