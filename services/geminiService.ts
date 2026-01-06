import { QuizSettings, Question } from "../types/quiz";

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Calls the Netlify Function to generate questions.
   * This keeps the API key secure on the backend.
   */
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          settings,
          isImage,
          language: lang
        }),
        signal
      });

      const data = await response.json();

      if (!response.ok) {
        // Propagate the specific error message from the backend
        throw new Error(data.error || data.details || "Failed to generate quiz");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("EMPTY_QUIZ: The AI did not return any questions.");
      }

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('ABORTED');
      }
      console.error("GeminiService Error:", error);
      throw error;
    }
  }
}