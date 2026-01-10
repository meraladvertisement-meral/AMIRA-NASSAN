import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event, context) => {
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
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "CONFIG_ERROR",
          message: "Missing API_KEY in Netlify Environment Variables"
        })
      };
    }

    const body = JSON.parse(event.body);
    const { content, settings, language } = body;
    
    const ai = new GoogleGenAI({ apiKey });
    const langName = language === 'de' ? 'German' : 'English';

    const systemInstruction = `You are a professional educator. Create a quiz in ${langName}. Return ONLY valid JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Analyze and generate a quiz with ${settings.questionCount} questions: ${content.substring(0, 10000)}` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["MCQ", "TF", "FITB"] },
                  prompt: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING }
                },
                required: ["id", "type", "prompt", "options", "correctAnswer"]
              }
            }
          },
          required: ["questions"]
        }
      },
    });

    return {
      statusCode: 200,
      headers,
      body: response.text
    };

  } catch (error) {
    console.error("Generate Questions Function Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};