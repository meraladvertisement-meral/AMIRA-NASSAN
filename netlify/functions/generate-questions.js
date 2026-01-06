/**
 * Netlify Function: generate-questions
 * Handles quiz generation via Gemini API securely on the server side.
 */
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        headers, 
        body: JSON.stringify({ error: "Method Not Allowed. Use POST." }) 
      };
    }

    const body = JSON.parse(event.body);
    const { content, settings, isImage, language } = body;
    
    // Read key from environment variable (NOT hardcoded)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("Critical: GEMINI_API_KEY environment variable is not set.");
      return { 
        statusCode: 500, 
        headers, 
        body: JSON.stringify({ error: "Server Configuration Error: API key missing." }) 
      };
    }

    const model = "gemini-3-flash-preview";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemPrompt = `Task: Create a high-quality educational quiz.
    Strict Rules:
    - Language: ${language === 'de' ? 'German' : 'English'}
    - Difficulty: ${settings.difficulty || 'medium'}
    - Count: ${settings.questionCount || 10}
    - Types: ${(settings.types || ['MCQ']).join(", ")}
    - Output MUST be valid JSON.
    - For FITB (Fill in the blanks), provide 3 distractors in 'options' for retry.
    
    Response Format (JSON only):
    {
      "language": "${language}",
      "questions": [
        {
          "id": "q1",
          "type": "MCQ|TF|FITB",
          "prompt": "The question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Why it is correct."
        }
      ]
    }`;

    const parts = [
      { text: isImage ? "Analyze this image and create a quiz based on its educational content." : `Generate a quiz based on this content: ${content.substring(0, 15000)}` }
    ];
    
    if (isImage) {
      // Content should be base64 string
      const base64Data = content.includes('base64,') ? content.split(',')[1] : content;
      parts.push({
        inlineData: { mimeType: "image/jpeg", data: base64Data }
      });
    }

    const requestPayload = {
      contents: [{ role: "user", parts }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 4000
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorDetail = data.error?.message || "Unknown Gemini API Error";
      console.error("Gemini API error response:", data);
      return { 
        statusCode: response.status, 
        headers, 
        body: JSON.stringify({ error: errorDetail }) 
      };
    }

    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "AI generated an invalid response structure." })
      };
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    return {
      statusCode: 200,
      headers,
      body: generatedText // This is already JSON string from Gemini
    };

  } catch (error) {
    console.error("Function Handler Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "INTERNAL_SERVER_ERROR", details: error.message })
    };
  }
};