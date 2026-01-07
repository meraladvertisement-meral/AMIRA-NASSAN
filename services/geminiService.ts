
import { Question, QuizSettings } from "../types/quiz";

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

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
      const response = await fetch('/.netlify/functions/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          settings,
          isImage,
          language: lang
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error("INVALID_FORMAT");
      }

      return {
        questions: result.questions,
        language: result.language || lang
      };
    } catch (error: any) {
      console.error("Quiz Generation Failed:", error);
      throw error;
    }
  }
}
