
const { GoogleGenAI, Type } = require("@google/genai");

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Preflight-Check für CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ error: "CONFIG_ERROR", message: "API_KEY environment variable is missing on Netlify." }) 
      };
    }

    // Body korrekt parsen (Netlify kann den Body manchmal base64-kodiert senden)
    let body;
    try {
      const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body;
      body = JSON.parse(rawBody);
    } catch (e) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: "INVALID_REQUEST", message: "Failed to parse request body." }) 
      };
    }

    const { content, settings, isImage, language } = body;
    const ai = new GoogleGenAI({ apiKey });
    
    const difficultyDesc = settings.difficulty === 'mixed' 
      ? 'a balanced mix of easy, medium, and hard questions' 
      : settings.difficulty;

    const systemInstruction = `You are an expert educator. Generate a quiz in ${language === 'de' ? 'German' : 'English'}.
    Return ONLY a JSON object. No markdown, no backticks, just the raw JSON.
    
    Structure:
    - Count: ${settings.questionCount || 10}
    - Difficulty: ${difficultyDesc}
    - Types: ${(settings.types || ['MCQ']).join(", ")}
    - FITB: prompt must have '_______'. options: 3 distractors.
    - MCQ: options: 4 choices.`;

    const promptText = isImage 
      ? "Create a quiz based on this image."
      : `Create a quiz based on: ${content.substring(0, 10000)}`;

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

    let jsonString = response.text || "";
    
    // Bereinigung: Falls die KI trotzdem ```json ... ``` zurückgibt
    if (jsonString.includes("```")) {
      jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    return {
      statusCode: 200,
      headers,
      body: jsonString
    };

  } catch (error) {
    console.error("Netlify Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "GENERATION_FAILED", 
        message: error.message || "Unknown error during AI generation."
      })
    };
  }
};
