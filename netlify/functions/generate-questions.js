
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
      console.error("API_KEY is missing in environment variables");
      return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ error: "CONFIG_ERROR", message: "API_KEY is missing." }) 
      };
    }

    const body = JSON.parse(event.body);
    const { content, settings, isImage, language } = body;
    
    // إنشاء مثيل جديد من المكتبة داخل الدالة لضمان استخدام المفتاح الصحيح
    const ai = new GoogleGenAI({ apiKey });
    
    const difficultyDesc = settings.difficulty === 'mixed' ? 'balanced' : settings.difficulty;
    const langName = language === 'ar' ? 'Arabic' : language === 'de' ? 'German' : 'English';

    const systemInstruction = `You are a professional educator. Create a quiz in ${langName}.
    Return ONLY valid JSON. Do not include any text before or after the JSON.
    - Question Count: ${settings.questionCount || 10}
    - Difficulty: ${difficultyDesc}
    - Question Types: ${(settings.types || ['MCQ']).join(", ")}
    - IMPORTANT: Ensure MCQ options are unique and clear.`;

    const promptText = isImage 
      ? "Extract the educational content from this image and create a quiz. Make sure choices are clear."
      : `Analyze the following text and generate a quiz: ${content.substring(0, 10000)}`;

    const parts = [{ text: promptText }];

    if (isImage) {
      const base64Data = content.includes('base64,') ? content.split(',')[1] : content;
      parts.push({
        inlineData: { mimeType: "image/jpeg", data: base64Data }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: [{ parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.8,
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

    const text = response.text;
    if (!text) throw new Error("AI returned empty response");

    return {
      statusCode: 200,
      headers,
      body: text
    };

  } catch (error) {
    console.error("Netlify Function Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "SERVER_ERROR", 
        message: error.message,
        stack: error.stack 
      })
    };
  }
};
