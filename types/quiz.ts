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
  pdfUrl?: string; // Reference to the generated Blob URL
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

export interface RoomParticipant {
  uid: string;
  displayName: string;
  photoURL?: string;
  joinedAt: any;
  score: number;
  status: 'active' | 'finished';
}

export interface RoomData {
  id: string;
  hostUid: string;
  quizId: string;
  quizSnapshot: QuizRecord;
  joinCode: string;
  status: 'lobby' | 'started' | 'ended';
  createdAt: any;
  startedAt?: any;
  settings: QuizSettings;
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
  | 'ROOM_LOBBY'
  | 'JOIN_ROOM';