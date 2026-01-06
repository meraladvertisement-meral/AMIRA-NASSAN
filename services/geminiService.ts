
import { GoogleGenAI, Type } from "@google/genai";
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

  private async compressImage(base64: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
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
        resolve(canvas.toDataURL('image/jpeg', 0.6).split(',')[1]);
      };
      img.onerror = () => resolve(base64.split(',')[1] || base64);
    });
  }

  async generateQuiz(
    content: string, 
    settings: QuizSettings, 
    isImage: boolean = false, 
    signal?: AbortSignal,
    lang: string = "en"
  ): Promise<{ questions: Question[], language: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const modelName = "gemini-3-flash-preview";
    
    const prompt = `Task: Create a high-quality educational quiz from the provided data.
    Strict Rules:
    - Language: ${lang === 'de' ? 'German' : 'English'}
    - Difficulty: ${settings.difficulty}
    - Count: ${settings.questionCount}
    - Types: ${settings.types.join(", ")}
    - Output MUST be valid JSON.
    - Each MCQ must have 4 unique options.
    - Each TF must have ["True", "False"] options.
    - For FITB (Fill in the blanks), the correctAnswer is the word to fill. IMPORTANT: Also provide 3 plausible distractors (incorrect but related words) in the 'options' field so that we can offer a multiple-choice retry if the user fails the first time.
    - Add a concise explanation for each correct answer.`;

    try {
      let parts: any[] = [{ text: prompt }];

      if (isImage) {
        const base64Data = await this.compressImage(content);
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        });
      } else {
        parts.push({ text: `Source Content:\n${content.substring(0, 20000)}` });
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts }],
        config: {
          temperature: 0.1,
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

      const resultText = response.text;
      if (!resultText) throw new Error("EMPTY_AI_RESPONSE");

      const parsedData = JSON.parse(resultText.trim());
      if (!parsedData.questions || parsedData.questions.length === 0) {
        throw new Error("QUIZ_EMPTY");
      }

      return parsedData;
    } catch (error: any) {
      console.error("AI Gen Failed:", error);
      throw error;
    }
  }
}
