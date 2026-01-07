
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
    externalSignal?: AbortSignal,
    lang: string = "en"
  ): Promise<{ questions: Question[], language: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second hard timeout

    // Combine signals if externalSignal is provided
    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort());
    }

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
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON Response received:", text);
        throw new Error(text || "Server returned an invalid response format.");
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || `Server Error: ${response.status}`);
      }
      
      if (!result.questions || !Array.isArray(result.questions)) {
        throw new Error("The AI response was empty or malformed.");
      }

      return {
        questions: result.questions,
        language: lang
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error("Generation took too long. Please try again.");
      }
      console.error("Quiz Generation Failed:", error);
      throw error;
    }
  }
}
