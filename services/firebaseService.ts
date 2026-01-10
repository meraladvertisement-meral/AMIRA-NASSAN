import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

import { db } from "./firebase";

export interface RoomData {
  mode: 'duel' | 'teacher';
  hostPeerId: string;
  hostUserId?: string;
  status: 'waiting' | 'started' | 'ended';
  createdAt: any;
  expiresAt: any;
}

export interface ParticipantData {
  name: string;
  role: 'host' | 'guest' | 'student' | 'teacher';
  peerId: string;
  joinedAt: any;
  state: 'connected' | 'disconnected';
}

export const firebaseService = {
  async createRoom(roomCode: string, mode: 'duel' | 'teacher', hostPeerId: string) {
    const roomRef = doc(db, "rooms", roomCode);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 45);

    const roomData: RoomData = {
      mode,
      hostPeerId,
      status: 'waiting',
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt)
    };

    await setDoc(roomRef, roomData);
    return roomRef;
  },

  async getRoom(roomCode: string): Promise<RoomData | null> {
    const roomRef = doc(db, "rooms", roomCode);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return null;
    
    const data = snap.data() as RoomData;
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      return null;
    }
    return data;
  },

  async joinRoom(roomCode: string, participantId: string, data: ParticipantData) {
    const partRef = doc(db, "rooms", roomCode, "participants", participantId);
    await setDoc(partRef, {
      ...data,
      joinedAt: serverTimestamp()
    });
  },

  async updateRoomStatus(roomCode: string, status: 'started' | 'ended') {
    const roomRef = doc(db, "rooms", roomCode);
    await updateDoc(roomRef, { status });
  },

  subscribeToRoom(roomCode: string, callback: (data: RoomData) => void) {
    return onSnapshot(doc(db, "rooms", roomCode), (doc) => {
      if (doc.exists()) callback(doc.data() as RoomData);
    });
  },

  subscribeToParticipants(roomCode: string, callback: (parts: ParticipantData[]) => void) {
    const partsCol = collection(db, "rooms", roomCode, "participants");
    return onSnapshot(partsCol, (snap) => {
      const parts = snap.docs.map(d => d.data() as ParticipantData);
      callback(parts);
    });
  },

  async leaveRoom(roomCode: string, participantId: string) {
    try {
      const partRef = doc(db, "rooms", roomCode, "participants", participantId);
      await updateDoc(partRef, { state: 'disconnected' });
    } catch (e) {
      console.warn("Could not update leave status", e);
    }
  }
};