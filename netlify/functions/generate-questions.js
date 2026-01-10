
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const { content, settings, language } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langName = language === 'de' ? 'German' : 'English';

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ 
        parts: [{ 
          text: `Act as a professional educator and Product Manager for a kids' educational app. Create a ${langName} quiz with ${settings.questionCount} questions based on this content: "${content.substring(0, 10000)}". Difficulty: ${settings.difficulty}. Types: ${settings.types.join(',')}.` 
        }] 
      }],
      config: {
        systemInstruction: `You are an AI specialized in creating interactive, high-quality educational quizzes for children and students. 
        Rules:
        1. Always return a strictly valid JSON object.
        2. Ensure every question is child-friendly, accurate, and relevant to the provided text.
        3. For MCQ: Provide 4 distinct options. The 'correctAnswer' must be identical to one of the options.
        4. For TF: Options must be ["True", "False"] (or language equivalent).
        5. For FITB: The prompt must include a '_______' placeholder where the answer fits.
        6. Language: Respond strictly in ${langName}.
        7. Tone: Encouraging, educational, and clear.`,
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
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "type", "prompt", "options", "correctAnswer"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    return { statusCode: 200, headers, body: response.text };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
