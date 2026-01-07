
export type QuestionType = 'MCQ' | 'TF' | 'FITB';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
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
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuizAttempt {
  questionId: string;
  attempts: number;
  isCorrect: boolean;
  score: number;
}

export interface QuizRecord {
  id: string;
  createdAt: number;
  questionLanguage: string;
  settings: QuizSettings;
  questions: Question[];
  pdfGenerated?: boolean;
  pdfUrl?: string;
  source?: QuizSource;
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
  status: 'active' | 'finished';
  score: number;
}

export interface RoomData {
  id: string;
  hostUid: string;
  quizSnapshot: QuizRecord;
  joinCode: string;
  status: 'lobby' | 'started' | 'ended';
  expiresAt: any;
  createdAt: any;
  mode: GameMode;
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
  | 'INFO_CENTER'
  | 'ROOM_LOBBY'
  | 'JOIN_ROOM';
