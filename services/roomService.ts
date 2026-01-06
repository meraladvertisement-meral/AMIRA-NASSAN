
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  serverTimestamp,
  runTransaction,
  query,
  where,
  getDocs,
  limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, auth } from "./firebase";
import { QuizRecord, RoomData, RoomParticipant } from "../types/quiz";

export const roomService = {
  generateJoinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  async createSession(quiz: QuizRecord): Promise<{ sessionId: string, joinCode: string }> {
    const user = auth.currentUser;
    if (!user) throw new Error("AUTH_REQUIRED");

    const sessionId = Math.random().toString(36).substring(2, 15);
    const joinCode = this.generateJoinCode();

    await runTransaction(db, async (transaction) => {
      const codeRef = doc(db, "joinCodes", joinCode);
      const codeSnap = await transaction.get(codeRef);
      if (codeSnap.exists()) throw new Error("CODE_COLLISION");

      const sessionRef = doc(db, "sessions", sessionId);
      const sessionData = {
        id: sessionId,
        hostUid: user.uid,
        quizSnapshot: quiz,
        joinCode: joinCode,
        status: 'lobby',
        currentQuestionIndex: 0,
        createdAt: serverTimestamp(),
        settings: quiz.settings
      };

      transaction.set(codeRef, { sessionId, createdAt: serverTimestamp() });
      transaction.set(sessionRef, sessionData);
    });

    return { sessionId, joinCode };
  },

  async findSessionByCode(code: string): Promise<string | null> {
    const cleanCode = code.toUpperCase().trim();
    const snap = await getDoc(doc(db, "joinCodes", cleanCode));
    return snap.exists() ? snap.data()?.sessionId : null;
  },

  async getSession(sessionId: string): Promise<any> {
    const snap = await getDoc(doc(db, "sessions", sessionId));
    return snap.exists() ? snap.data() : null;
  },

  async joinSession(sessionId: string, displayName?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("AUTH_REQUIRED");

    const playerRef = doc(db, "sessions", sessionId, "players", user.uid);
    const participant = {
      uid: user.uid,
      displayName: displayName || user.displayName || `Student ${user.uid.substring(0, 4)}`,
      photoURL: user.photoURL || null,
      joinedAt: serverTimestamp(),
      score: 0,
      correctFirstTry: 0,
      wrongCount: 0,
      correctSecondTry: 0,
      lastAnswer: null,
      status: 'active'
    };

    await setDoc(playerRef, participant);
  },

  async startSession(sessionId: string) {
    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      status: 'started',
      startedAt: serverTimestamp()
    });
  },

  async updatePlayerAnswer(sessionId: string, isCorrect: boolean, attempt: number) {
    const user = auth.currentUser;
    if (!user) return;
    
    const playerRef = doc(db, "sessions", sessionId, "players", user.uid);
    const playerSnap = await getDoc(playerRef);
    if (!playerSnap.exists()) return;

    const data = playerSnap.data();
    const updates: any = {
      score: isCorrect ? data.score + (attempt === 0 ? 1 : 0.5) : data.score
    };

    if (isCorrect) {
      if (attempt === 0) updates.correctFirstTry = (data.correctFirstTry || 0) + 1;
      else updates.correctSecondTry = (data.correctSecondTry || 0) + 1;
    } else {
      updates.wrongCount = (data.wrongCount || 0) + 1;
    }

    await updateDoc(playerRef, updates);
  },

  subscribeToSession(sessionId: string, callback: (data: any) => void) {
    return onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (snap.exists()) callback(snap.data());
    });
  },

  subscribeToPlayers(sessionId: string, callback: (players: any[]) => void) {
    return onSnapshot(collection(db, "sessions", sessionId, "players"), (snap) => {
      const players = snap.docs.map(d => d.data());
      callback(players.sort((a, b) => (b.score || 0) - (a.score || 0)));
    });
  }
};
