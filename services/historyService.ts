
import { QuizRecord } from "../types/quiz";

const STORAGE_KEY = 'sqg_history';

export const historyService = {
  getHistory(): QuizRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("History parse error", e);
      return [];
    }
  },

  saveQuiz(record: QuizRecord) {
    let history = this.getHistory();
    // Prepend new record
    history = [record, ...history];
    // Keep only latest 10
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },

  deleteRecord(id: string) {
    if (!id) return;
    const history = this.getHistory();
    // Strict filtering by ID string
    const updatedHistory = history.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
  },

  updateRecord(id: string, updates: Partial<QuizRecord>) {
    const history = this.getHistory();
    const updatedHistory = history.map(r => r.id === id ? { ...r, ...updates } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  }
};
