
import { QuizRecord } from "../types/quiz";

const STORAGE_KEY = 'sqg_history';

export const historyService = {
  getHistory(): QuizRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  saveQuiz(record: QuizRecord) {
    let history = this.getHistory();
    // Insert at top
    history = [record, ...history];
    // Keep only latest 10
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },

  deleteRecord(id: string) {
    let history = this.getHistory();
    history = history.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
  },

  updateRecord(id: string, updates: Partial<QuizRecord>) {
    let history = this.getHistory();
    history = history.map(r => r.id === id ? { ...r, ...updates } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
};
