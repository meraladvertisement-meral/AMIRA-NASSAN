
export type QuestionType = 'MCQ' | 'TF' | 'FITB';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuizSource = 'ai' | 'manual';

export interface QuizSettings {
  difficulty: Difficulty;
  questionCount: number;
  types: QuestionType[];
  durationMinutes: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[]; // For MCQ/TF, and for FITB attempt 2 distractors (precomputed)
  correctAnswer: string;
  explanation?: string;
}

export interface QuizRecord {
  id: string;
  createdAt: number;
  questionLanguage: string;
  settings: QuizSettings;
  questions: Question[];
  pdfGenerated?: boolean;
  source?: QuizSource;
}

export interface QuizAttempt {
  questionId: string;
  attempts: number;
  isCorrect: boolean;
  score: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  attempts: QuizAttempt[];
}

export enum GameMode {
  SOLO = 'SOLO',
  DUEL = 'DUEL',
  TEACHER = 'TEACHER'
}

export type AppScreen = 
  | 'LANDING' 
  | 'HOME' 
  | 'CONFIG' 
  | 'LOADING' 
  | 'READY' 
  | 'ARENA' 
  | 'RESULT' 
  | 'BALLOON' 
  | 'HISTORY'
  | 'PRICING'
  | 'AFFILIATE'
  | 'SETTINGS'
  | 'INFO_CENTER'
  | 'DUEL_LOBBY'
  | 'DUEL_JOIN';
