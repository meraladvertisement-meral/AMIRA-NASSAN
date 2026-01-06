
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { roomService } from '../services/roomService';

interface JoinRoomPageProps {
  onJoinSuccess: (roomId: string) => void;
  onBack: () => void;
  t: any;
}

const JoinRoomPage: React.FC<JoinRoomPageProps> = ({ onJoinSuccess, onBack, t }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    setError(null);
    try {
      // Fix: Use findSessionByCode instead of findRoomByCode
      const roomId = await roomService.findSessionByCode(code.toUpperCase());
      if (roomId) {
        // Fix: Use joinSession instead of joinRoom
        await roomService.joinSession(roomId);
        onJoinSuccess(roomId);
      } else {
        setError(t.roomNotFound || "Room not found or expired.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'ROOM_ALREADY_STARTED') {
        setError(t.roomNotFound || "Game already started.");
      } else {
        setError(t.generationError || "Failed to join room.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black italic">{t.joinRoom}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition">←</button>
      </div>

      <GlassCard className="text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">{t.roomCode}</p>
          <input 
            autoFocus
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading}
            className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-6 text-4xl text-center font-black tracking-[0.8rem] focus:outline-none focus:border-brand-lime transition-all uppercase disabled:opacity-50"
            placeholder="K7M9Q2"
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl text-red-200 text-xs font-bold animate-shake">
            ⚠️ {error}
          </div>
        )}

        <ThreeDButton 
          variant="primary" 
          className="w-full py-5" 
          disabled={code.length !== 6 || loading}
          onClick={handleSubmit}
        >
          {loading ? "Joining..." : t.joinRoom}
        </ThreeDButton>
      </GlassCard>

      <div className="text-center">
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
          Ask the host for the 6-character code<br/>or use the direct invite link.
        </p>
      </div>
    </div>
  );
};

export default JoinRoomPage;