
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
        body: JSON.stringify({ error: "CONFIG_ERROR", message: "API_KEY is missing." }) 
      };
    }

    const body = JSON.parse(event.body);
    const { content, settings, isImage, language } = body;
    
    const ai = new GoogleGenAI({ apiKey });
    
    const difficultyDesc = settings.difficulty === 'mixed' 
      ? 'balanced' 
      : settings.difficulty;

    const systemInstruction = `You are an expert educator. Create a quiz in ${language === 'ar' ? 'Arabic' : language === 'de' ? 'German' : 'English'}.
    Return ONLY raw JSON. No markdown.
    - Question Count: ${settings.questionCount || 10}
    - Difficulty: ${difficultyDesc}
    - Types: ${(settings.types || ['MCQ']).join(", ")}
    - IMPORTANT: Ensure all MCQ options are unique and correct answer is included.`;

    const promptText = isImage 
      ? "Generate a quiz from this image. Ensure options are distinct."
      : `Generate a quiz from this text. Ensure options are distinct: ${content.substring(0, 8000)}`;

    const contents = { 
      parts: [{ text: promptText }] 
    };

    if (isImage) {
      const base64Data = content.includes('base64,') ? content.split(',')[1] : content;
      contents.parts.push({
        inlineData: { mimeType: "image/jpeg", data: base64Data }
      });
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
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
      body: result.text
    };

  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "GENERATION_FAILED", 
        message: error.message 
      })
    };
  }
};
