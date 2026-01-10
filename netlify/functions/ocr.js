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
    if (!apiKey) throw new Error("Missing API_KEY");

    const { image } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey });
    
    const base64Data = image.includes('base64,') ? image.split(',')[1] : image;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ 
        parts: [
          { text: "Extract all text from this image exactly." },
          { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ] 
      }]
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