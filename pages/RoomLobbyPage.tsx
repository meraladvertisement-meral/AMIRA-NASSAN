
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { roomService } from '../services/roomService';
import { RoomData, RoomParticipant } from '../types/quiz';
import { auth } from '../services/firebase';

interface RoomLobbyPageProps {
  roomId: string;
  onStart: () => void;
  onBack: () => void;
  t: any;
}

const RoomLobbyPage: React.FC<RoomLobbyPageProps> = ({ roomId, onStart, onBack, t }) => {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<RoomParticipant[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const currentUser = auth.currentUser;
  const isHost = room?.hostUid === currentUser?.uid;
  const joinUrl = `${window.location.origin}${window.location.pathname}?joinRoom=${roomId}`;

  useEffect(() => {
    // Fix: Use subscribeToSession instead of subscribeToRoom
    const unsubRoom = roomService.subscribeToSession(roomId, (data) => {
      setRoom(data);
      if (data.status === 'started' && !isHost) {
        onStart();
      }
    });

    const unsubPlayers = roomService.subscribeToPlayers(roomId, (list) => {
      setPlayers(list);
    });

    return () => {
      unsubRoom();
      unsubPlayers();
    };
  }, [roomId, isHost, onStart]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleStartGame = async () => {
    if (players.length === 0) return;
    try {
      // Fix: Use startSession instead of startRoom
      await roomService.startSession(roomId);
      onStart();
    } catch (err) {
      console.error(err);
      alert("Failed to start game.");
    }
  };

  if (!room) return null;

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic">{t.appName} Lobby</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition">←</button>
      </div>

      <GlassCard className="text-center space-y-6">
        <div>
          <p className="text-[10px] uppercase font-black text-white/50 tracking-[0.2em] mb-1">{t.roomCode}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-black text-brand-lime tracking-[0.2em]">{room.joinCode}</span>
            <button 
              onClick={() => handleCopy(room.joinCode, 'code')}
              className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition"
            >
              {copied === 'code' ? '✅' : '📋'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-3xl">
          <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Direct Invite Link</p>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={joinUrl} 
              className="flex-1 bg-transparent text-[10px] text-white/60 font-mono outline-none truncate"
            />
            <button 
              onClick={() => handleCopy(joinUrl, 'link')}
              className="text-[10px] font-black text-brand-lime uppercase tracking-widest"
            >
              {copied === 'link' ? t.copied : t.copyLink}
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Players</h3>
          <span className="bg-brand-lime text-brand-dark px-3 py-1 rounded-full text-xs font-black">{players.length}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
          {players.length === 0 ? (
            <div className="text-center py-12 text-white/20 italic font-bold">Waiting for students...</div>
          ) : (
            players.map((p, i) => (
              <GlassCard key={i} className="p-3 border-white/10 flex items-center gap-4 animate-in slide-in-from-right-4 duration-300">
                <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center font-black text-white shadow-lg">
                  {p.displayName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{p.displayName}</p>
                  <p className="text-[8px] uppercase font-black text-brand-lime">Ready</p>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto">
        {isHost ? (
          <ThreeDButton 
            variant="primary" 
            className="w-full py-5 text-xl" 
            disabled={players.length === 0}
            onClick={handleStartGame}
          >
            Start Game 🔊
          </ThreeDButton>
        ) : (
          <div className="bg-white/10 p-6 rounded-3xl text-center border border-white/10">
            <div className="flex justify-center mb-3">
              <div className="w-3 h-3 bg-brand-lime rounded-full animate-ping"></div>
            </div>
            <p className="text-sm font-black uppercase tracking-widest text-brand-lime">
              {t.waitingForHost}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomLobbyPage;