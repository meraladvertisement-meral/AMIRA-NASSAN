
/**
 * Netlify Function: generate-questions
 * Optimized for maximum speed and sub-10s response.
 */
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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
    const { text, settings, isImage, language } = JSON.parse(event.body);
    const apiKey = process.env.API_KEY;

    if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing API_KEY" }) };

    // Use latest fastest model
    const model = "gemini-3-flash-preview";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const systemPrompt = `You are an API. Generate a quiz JSON. 
    Strictly follow these settings:
    - Language: ${language}
    - Difficulty: ${settings.difficulty}
    - Q-Count: ${settings.questionCount}
    - Types: ${settings.types.join(",")}
    
    JSON format:
    {
      "language": "${language}",
      "questions": [
        {"id": "q1", "type": "MCQ", "prompt": "...", "options": ["a","b","c","d"], "correctAnswer": "a", "explanation": "..."}
      ]
    }`;

    const requestBody = {
      contents: [{
        parts: [{ text: isImage ? "Create quiz from image." : `Content: ${text.substring(0, 10000)}` }]
      }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1, // Faster and more stable
        maxOutputTokens: 2500 // Limit size to prevent timeout
      }
    };

    if (isImage) {
      requestBody.contents[0].parts.push({
        inlineData: { mimeType: "image/jpeg", data: text }
      });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Gemini Error");

    return {
      statusCode: 200,
      headers,
      body: data.candidates[0].content.parts[0].text
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "FAILED", details: error.message })
    };
  }
};
