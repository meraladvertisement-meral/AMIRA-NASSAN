
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { roomService } from '../services/roomService';
import { auth } from '../services/firebase';
import { QuizRecord } from '../types/quiz';

interface RoomLobbyPageProps {
  roomId: string;
  onStart: (quiz: QuizRecord) => void;
  onBack: () => void;
  t: any;
}

const RoomLobbyPage: React.FC<RoomLobbyPageProps> = ({ roomId, onStart, onBack, t }) => {
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost = room?.hostUid === (auth.currentUser?.uid || localStorage.getItem('sqg_guest_uid'));
  const joinUrl = `${window.location.origin}/?join=${room?.joinCode}`;

  useEffect(() => {
    // Subscribe to session changes
    const unsubRoom = roomService.subscribeToSession(roomId, (data) => {
      setRoom(data);
      // If the game has started in the database, trigger the start UI for everyone
      if (data.status === 'started' && data.quizSnapshot) {
        onStart(data.quizSnapshot);
      }
    });

    const unsubPlayers = roomService.subscribeToPlayers(roomId, setPlayers);
    
    return () => { 
      unsubRoom(); 
      unsubPlayers(); 
    };
  }, [roomId, onStart]);

  useEffect(() => {
    if (!room?.expiresAt) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = room.expiresAt.toDate().getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("EXPIRED");
        setIsExpired(true);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [room]);

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHostStart = async () => {
    if (!isHost) return;
    try {
      await roomService.startSession(roomId);
      // The useEffect subscription will handle the transition for everyone including the host
    } catch (err) {
      console.error("Failed to start session", err);
    }
  };

  if (isExpired) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center text-center gap-6">
        <h2 className="text-4xl font-black text-red-500 uppercase">Session Expired ⏰</h2>
        <p className="text-white/60">The join time has run out. Please create a new room.</p>
        <ThreeDButton onClick={onBack}>Go Back</ThreeDButton>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
           <h2 className="text-2xl font-black italic text-brand-lime leading-none">SnapQuiz</h2>
           <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{room?.mode} Mode</span>
        </div>
        <div className="bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/30">
          <span className="text-red-400 font-black text-xl tabular-nums">{timeLeft}</span>
        </div>
      </div>

      <GlassCard className="text-center space-y-6">
        <div>
          <p className="text-[10px] uppercase font-black text-white/40 tracking-widest mb-2">Room Code</p>
          <p className="text-6xl font-black text-brand-lime tracking-[0.5rem]">{room?.joinCode}</p>
        </div>

        <div className="flex flex-col gap-2">
           <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Invite Link</p>
           <div className="flex gap-2">
             <input readOnly value={joinUrl} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/50 truncate" />
             <button onClick={copyLink} className="bg-brand-lime text-brand-dark px-4 py-2 rounded-xl font-black text-xs uppercase">
               {copied ? 'Copied' : 'Copy'}
             </button>
           </div>
        </div>
      </GlassCard>

      <div className="flex-1 flex flex-col gap-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex justify-between">
          Players Joined <span>{players.length}</span>
        </h3>
        <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
          {players.length === 0 ? (
            <p className="text-center py-10 text-white/20 italic">Waiting for players to join...</p>
          ) : (
            players.map((p, i) => (
              <GlassCard key={i} className="p-4 border-white/10 flex items-center justify-between animate-in slide-in-from-right-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-lime animate-pulse"></div>
                  <span className="font-bold">{p.displayName}</span>
                </div>
                <span className="text-[10px] text-white/30 font-black uppercase">
                  {p.uid === room?.hostUid ? 'HOST' : 'PLAYER'}
                </span>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {isHost ? (
        <ThreeDButton 
          variant="primary" 
          className="w-full py-5 text-xl" 
          disabled={players.length === 0}
          onClick={handleHostStart}
        >
          Start Quiz 🚀
        </ThreeDButton>
      ) : (
        <div className="text-center p-6 glass rounded-3xl animate-pulse border-brand-lime/20">
          <p className="text-brand-lime font-black uppercase tracking-widest">Waiting for host to start...</p>
        </div>
      )}
    </div>
  );
};

export default RoomLobbyPage;
