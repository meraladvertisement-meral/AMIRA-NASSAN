
import { GoogleGenAI, Type } from "@google/genai";
import { QuizSettings, Question } from "../types/quiz";

export class GeminiService {
  private static instance: GeminiService;
  private ai: GoogleGenAI;

  private constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async generateQuiz(
    content: string, 
    settings: QuizSettings, 
    isImage: boolean = false, 
    signal?: AbortSignal,
    lang: string = "en"
  ): Promise<{ questions: Question[], language: string }> {
    try {
      // Use the model recommended for Basic/Complex text tasks
      const modelName = 'gemini-3-flash-preview';
      
      const systemInstruction = `You are a professional educational content creator.
      Create a high-quality quiz in ${lang === 'de' ? 'German' : 'English'}.
      
      Difficulty: ${settings.difficulty}.
      Question Count: ${settings.questionCount}.
      Types: ${settings.types.join(", ")}.

      Rules:
      - MCQ: 4 options, correctAnswer must be one of the options.
      - FITB: 'correctAnswer' is the word/phrase for the blank, 'options' are 3 distractors.
      - Return valid JSON only.`;

      const promptText = isImage 
        ? "Generate a quiz from this image. Extract text and concepts for educational questions."
        : `Generate a quiz from this material: \n\n ${content.substring(0, 15000)}`;

      const parts: any[] = [{ text: promptText }];
      
      if (isImage) {
        // Handle potential base64 prefix
        const base64Data = content.includes('base64,') ? content.split(',')[1] : content;
        parts.push({
          inlineData: { mimeType: "image/jpeg", data: base64Data }
        });
      }

      // SDK requires 'contents' to be an array of Content objects
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
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
            required: ["language", "questions"]
          }
        }
      });

      if (!response || !response.text) throw new Error("EMPTY_AI_RESPONSE");

      let cleanJson = response.text.trim();
      // Remove markdown blocks if present
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      }

      const result = JSON.parse(cleanJson);
      return {
        questions: result.questions,
        language: result.language || lang
      };
    } catch (error: any) {
      console.error("GeminiService Error:", error);
      // Fallback for UI
      throw new Error(error.message || "FAILED_TO_GENERATE_QUIZ");
    }
  }
}
