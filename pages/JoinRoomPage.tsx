
import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { roomService } from '../services/roomService';
import { billingService } from '../services/billingService';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

interface JoinRoomPageProps {
  onJoinSuccess: (roomId: string) => void;
  onBack: () => void;
  t: any;
}

const JoinRoomPage: React.FC<JoinRoomPageProps> = ({ onJoinSuccess, onBack, t }) => {
  const [code, setCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestRemaining, setGuestRemaining] = useState(5);

  useEffect(() => {
    const usage = billingService.getGuestUsage();
    setGuestRemaining(5 - usage.dailyPlaysUsed);
  }, []);

  const handleJoin = useCallback(async (roomCode: string) => {
    if (roomCode.length !== 6) return;
    
    if (!billingService.canGuestPlay()) {
      setError(t.guestLimitReached || "Guest daily limit reached. Please sign in!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const roomId = await roomService.findSessionByCode(roomCode.toUpperCase());
      if (roomId) {
        // Pass optional custom name
        await roomService.joinSession(roomId, playerName.trim() || undefined);
        billingService.consumeGuestPlay();
        onJoinSuccess(roomId);
      } else {
        setError(t.roomNotFound);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'DUEL_ROOM_FULL') {
        setError(t.roomFull);
      } else if (err.message === 'ROOM_ALREADY_STARTED') {
        setError(t.alreadyStarted);
      } else {
        setError(t.roomNotFound);
      }
    } finally {
      setLoading(false);
    }
  }, [onJoinSuccess, t, playerName]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && joinCode.length === 6) {
      setCode(joinCode.toUpperCase());
    }
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black italic text-brand-lime leading-none">SnapQuizGame</h2>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">{t.joinRoom}</span>
        </div>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition">←</button>
      </div>

      <GlassCard className="text-center space-y-6 shadow-2xl border-white/20">
        <div className="bg-brand-gold/10 p-4 rounded-2xl border border-brand-gold/20">
          <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Entry Limit</p>
          <p className="text-sm font-bold text-white">{guestRemaining} / 5 {t.playsRemaining}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{t.roomCode}</p>
            <input 
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-6 text-4xl text-center font-black tracking-[0.8rem] focus:outline-none focus:border-brand-lime transition-all uppercase disabled:opacity-50"
              placeholder="CODE"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{t.enterName}</p>
            <input 
              type="text"
              maxLength={15}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={loading}
              className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-center font-bold focus:outline-none focus:border-brand-purple transition-all"
              placeholder="Ex: Player1"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl text-red-200 text-xs font-bold animate-shake">
            ⚠️ {error}
          </div>
        )}

        <ThreeDButton 
          variant="primary" 
          className="w-full py-5 text-xl" 
          disabled={code.length !== 6 || loading || guestRemaining <= 0}
          onClick={() => handleJoin(code)}
        >
          {loading ? "Joining..." : t.joinRoom}
        </ThreeDButton>
      </GlassCard>

      <div className="flex flex-col items-center gap-4">
        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Or for better experience</p>
        <button 
          onClick={handleSignIn}
          className="w-full glass py-3 rounded-2xl text-xs font-bold hover:bg-white/10 transition active:scale-95"
        >
          {t.continueGoogle}
        </button>
      </div>
    </div>
  );
};

export default JoinRoomPage;
