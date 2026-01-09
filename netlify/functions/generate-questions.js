
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Priority: GEMINI_API_KEY, Fallback: API_KEY as per Netlify Environment standards
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "CONFIG_ERROR",
          message: "Missing GEMINI_API_KEY in Netlify Environment Variables"
        })
      };
    }

    const body = JSON.parse(event.body);
    const { content, settings, isImage, language } = body;
    
    // Initialize GenAI inside the handler
    const ai = new GoogleGenAI({ apiKey });
    
    const difficultyDesc = settings.difficulty === 'mixed' ? 'balanced' : settings.difficulty;
    const langName = language === 'de' ? 'German' : 'English';

    const systemInstruction = `You are a professional educator and assessment specialist. 
    Create an engaging and accurate educational quiz in ${langName}.
    
    Return ONLY valid JSON according to the schema provided. 
    Do not include any markdown formatting like \`\`\`json.
    
    Quiz Requirements:
    - Question Count: ${settings.questionCount || 10}
    - Difficulty Level: ${difficultyDesc}
    - Question Types: ${(settings.types || ['MCQ']).join(", ")}
    - IMPORTANT: Ensure all Multiple Choice (MCQ) distractors are plausible but clearly incorrect.
    - IMPORTANT: If types include 'FITB', the prompt MUST contain a blank indicated by '_______'.`;

    const promptText = isImage 
      ? "Analyze the provided image. Extract the educational content and generate a quiz based on the visible facts, diagrams, or text."
      : `Analyze the following source material and generate a comprehensive quiz: ${content.substring(0, 15000)}`;

    const contents = [{ parts: [{ text: promptText }] }];

    if (isImage) {
      const base64Data = content.includes('base64,') ? content.split(',')[1] : content;
      contents[0].parts.push({
        inlineData: { mimeType: "image/jpeg", data: base64Data }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned an empty response.");
    }

    return {
      statusCode: 200,
      headers,
      body: text
    };

  } catch (error) {
    console.error("Netlify Function Runtime Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "SERVER_ERROR", 
        message: error.message || "An unexpected error occurred during question generation."
      })
    };
  }
};
