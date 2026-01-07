
const { GoogleGenAI, Type } = require("@google/genai");

exports.handler = async (event, context) => {
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
    const { content, settings, isImage, language } = JSON.parse(event.body);
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ error: "Missing API_KEY in Netlify environment variables." }) 
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const difficultyDesc = settings.difficulty === 'mixed' 
      ? 'a balanced mix of easy, medium, and hard questions' 
      : settings.difficulty;

    const systemInstruction = `You are a world-class educational content creator.
    Generate a quiz in ${language === 'de' ? 'German' : 'English'}.
    
    RULES:
    - Count: ${settings.questionCount || 10} questions.
    - Difficulty: ${difficultyDesc}.
    - Types: ${(settings.types || ['MCQ']).join(", ")}.
    - FITB (Fill-in-the-blanks): The 'prompt' must contain '_______'. 'correctAnswer' is the word. 'options' must be 3 plausible but wrong distractors.
    - MCQ: 'options' must be 4 choices. 'correctAnswer' must be one of them.
    - Return ONLY valid JSON matching the schema.`;

    const promptText = isImage 
      ? "Analyze this image and create an educational quiz based on its contents."
      : `Generate a quiz based on this content: ${content.substring(0, 15000)}`;

    const contents = [{
      parts: [{ text: promptText }]
    }];

    if (isImage) {
      const base64Data = content.includes('base64,') ? content.split(',')[1] : content;
      contents[0].parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.4,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: "MCQ, TF, or FITB" },
                  prompt: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "3 distractors for FITB, or 4 options for MCQ"
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "type", "prompt", "options", "correctAnswer"]
              }
            }
          },
          required: ["language", "questions"]
        }
      },
    });

    const outputText = response.text;
    
    return {
      statusCode: 200,
      headers,
      body: outputText
    };

  } catch (error) {
    console.error("Netlify Function Error Details:", error);
    // Return the actual error message for better debugging
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "GENERATION_FAILED", 
        message: error.message,
        details: error.stack?.split('\n')[0]
      })
    };
  }
};
