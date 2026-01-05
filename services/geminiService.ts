
import { GoogleGenAI, Type } from "@google/genai";
import { QuizSettings, Question, QuestionType } from "../types/quiz";

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

  private async compressImage(base64: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
      };
    });
  }

  async generateQuiz(
    content: string, 
    settings: QuizSettings, 
    isImage: boolean = false, 
    signal?: AbortSignal
  ): Promise<{ questions: Question[], language: string }> {
    if (!process.env.API_KEY) return this.mockQuiz(settings);

    try {
      let parts: any[] = [];
      const prompt = `Generate a compact JSON quiz from this content. 
      Settings: Difficulty: ${settings.difficulty}, Count: ${settings.questionCount}, Types: ${settings.types.join(",")}.
      Detect language and use it for questions.
      CRITICAL: Return ONLY valid JSON. 
      For FITB questions, the 'options' field MUST contain the correct answer plus 3 plausible distractors (total 4).`;

      if (isImage) {
        const compressed = await this.compressImage(content);
        parts = [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: compressed } }
        ];
      } else {
        parts = [{ text: `${prompt}\n\nContent: "${content.substring(0, 6000)}"` }];
      }

      const generationPromise = this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
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
                    explanation: { type: Type.STRING },
                  },
                  required: ["id", "type", "prompt", "correctAnswer", "options"]
                }
              }
            },
            required: ["language", "questions"]
          }
        }
      });

      const timeoutPromise = new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error("TIMEOUT")), 45000);
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error("ABORTED"));
        });
      });

      const response = await Promise.race([generationPromise, timeoutPromise]) as any;
      
      if (!response.text) throw new Error("INVALID_RESPONSE");
      
      return JSON.parse(response.text);
    } catch (error: any) {
      if (error.message === 'ABORTED') throw error;
      console.error("Gemini failed", error);
      throw error;
    }
  }

  private mockQuiz(settings: QuizSettings): { questions: Question[], language: string } {
    const questions: Question[] = Array.from({ length: settings.questionCount }).map((_, i) => {
      const type = settings.types[i % settings.types.length];
      return {
        id: `q-${i}`,
        type,
        prompt: `Mock Question ${i + 1} (${type}) - Is the sky blue?`,
        options: type === 'FITB' ? ["Blue", "Red", "Green", "Yellow"] : (type === 'MCQ' ? ["Yes", "No", "Maybe", "Sometimes"] : ["True", "False"]),
        correctAnswer: type === 'FITB' ? "Blue" : (type === 'MCQ' ? "Yes" : "True"),
        explanation: "Correct!"
      };
    });
    return { questions, language: "en" };
  }
}
