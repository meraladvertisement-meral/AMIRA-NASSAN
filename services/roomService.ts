
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  serverTimestamp,
  runTransaction,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db, auth } from "./firebase";
import { QuizRecord } from "../types/quiz";

export const roomService = {
  generateJoinCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  async createSession(quiz: QuizRecord, mode: any): Promise<{ sessionId: string, joinCode: string }> {
    const user = auth.currentUser || { uid: localStorage.getItem('sqg_mode') === 'admin' ? 'admin-001' : 'guest-123' };
    
    const sessionId = Math.random().toString(36).substring(2, 15);
    const joinCode = this.generateJoinCode();
    const expiresAt = new Date(Date.now() + 45 * 60 * 1000); // 45 mins

    await runTransaction(db, async (transaction) => {
      const codeRef = doc(db, "joinCodes", joinCode);
      const sessionRef = doc(db, "sessions", sessionId);

      const sessionData = {
        id: sessionId,
        hostUid: user.uid,
        quizSnapshot: quiz,
        joinCode: joinCode,
        status: 'lobby',
        mode: mode,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        settings: quiz.settings
      };

      transaction.set(codeRef, { sessionId, expiresAt: Timestamp.fromDate(expiresAt) });
      transaction.set(sessionRef, sessionData);
    });

    return { sessionId, joinCode };
  },

  async findSessionByCode(code: string): Promise<string | null> {
    const cleanCode = code.toUpperCase().trim();
    const snap = await getDoc(doc(db, "joinCodes", cleanCode));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data.expiresAt.toDate() < new Date()) return null;
    return data.sessionId;
  },

  async joinSession(sessionId: string) {
    // محاولة الحصول على مستخدم Firebase أو استخدام مستخدم محلي (للضيوف)
    const user = auth.currentUser || { 
      uid: 'guest-' + Math.random().toString(36).substr(2, 5),
      displayName: 'Guest Player'
    };

    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) throw new Error("SESSION_NOT_FOUND");
    
    const data = sessionSnap.data();
    if (data.status !== 'lobby') throw new Error("ROOM_ALREADY_STARTED");

    const playerRef = doc(db, "sessions", sessionId, "players", user.uid);
    await setDoc(playerRef, {
      uid: user.uid,
      displayName: user.displayName || "Player",
      status: 'active',
      score: 0,
      joinedAt: serverTimestamp()
    });
  },

  subscribeToSession(sessionId: string, callback: (data: any) => void) {
    return onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (snap.exists()) callback(snap.data());
    });
  },

  subscribeToPlayers(sessionId: string, callback: (players: any[]) => void) {
    return onSnapshot(collection(db, "sessions", sessionId, "players"), (snap) => {
      const players = snap.docs.map(d => d.data());
      callback(players);
    });
  },

  async startSession(sessionId: string) {
    await updateDoc(doc(db, "sessions", sessionId), { status: 'started' });
  }
};
