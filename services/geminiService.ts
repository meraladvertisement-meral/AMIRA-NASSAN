
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
      const modelName = 'gemini-3-flash-preview';
      
      const difficultyDesc = settings.difficulty === 'mixed' 
        ? 'a balanced mix of easy, medium, and hard questions' 
        : settings.difficulty;

      const systemInstruction = `You are an expert educator. Create a high-quality quiz in ${lang === 'de' ? 'German' : 'English'}.
      Difficulty: ${difficultyDesc}.
      Question Count: ${settings.questionCount}.
      Selected Question Types: ${settings.types.join(", ")}.

      JSON Rules:
      - MCQ: 4 options, 1 correctAnswer.
      - TF: options ["True", "False"], 1 correctAnswer.
      - FITB: prompt must have a "_______", options must be 3 distractors, correctAnswer is the missing word.
      - Return a valid JSON object.`;

      const promptText = isImage 
        ? "Analyze this image and create a quiz based on its educational content."
        : `Generate a comprehensive quiz from this material: \n\n ${content.substring(0, 15000)}`;

      const parts: any[] = [{ text: promptText }];
      
      if (isImage) {
        const base64Data = content.includes('base64,') ? content.split(',')[1] : content;
        parts.push({
          inlineData: { mimeType: "image/jpeg", data: base64Data }
        });
      }

      // Fix: contents must be an object with parts, or an array of such objects without role conflicts in single-turn
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.3,
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

      const result = JSON.parse(response.text.trim());
      return {
        questions: result.questions,
        language: result.language || lang
      };
    } catch (error: any) {
      console.error("Gemini Generation Failed:", error);
      throw new Error(error.message || "FAILED_TO_GENERATE_QUIZ");
    }
  }
}
