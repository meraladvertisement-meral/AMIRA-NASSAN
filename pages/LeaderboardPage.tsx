
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { roomService } from '../services/roomService';
import { QuizRecord } from '../types/quiz';

interface LeaderboardPageProps {
  roomId: string;
  quiz: QuizRecord;
  onHome: () => void;
  onBalloon: () => void;
  isWinner: boolean;
  t: any;
  audio: any;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ roomId, quiz, onHome, onBalloon, isWinner, t, audio }) => {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const unsub = roomService.subscribeToPlayers(roomId, (data) => {
      setPlayers(data);
    });
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    if (isWinner) audio.playSfx('win');
  }, [isWinner, audio]);

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black italic text-brand-lime tracking-tighter uppercase drop-shadow-md">
          {t.appName === 'SnapQuizGame' ? 'Live Leaderboard' : 'لوحة الصدارة الحية'}
        </h2>
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-lime animate-ping"></span>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Updating Real-time ⚡
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
        {players.map((player, index) => (
          <GlassCard 
            key={player.uid} 
            className={`p-4 flex items-center justify-between transition-all duration-500 border-white/10 ${
              index === 0 ? 'bg-brand-gold/20 border-brand-gold/40 scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 
              index === 1 ? 'bg-slate-300/10' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                index === 0 ? 'bg-brand-gold text-brand-dark shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                index === 1 ? 'bg-slate-300 text-brand-dark' : 
                index === 2 ? 'bg-orange-400 text-brand-dark' : 'bg-white/10 text-white/50'
              }`}>
                #{index + 1}
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-sm truncate max-w-[120px]">{player.displayName}</span>
                <span className="text-[10px] text-white/30 uppercase font-black">
                  {player.status === 'finished' ? '✅ Finished' : `✏️ Q${player.progress + 1}`}
                </span>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <span className="block text-xl font-black text-brand-lime leading-none">{player.score}</span>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Points</span>
            </div>
          </GlassCard>
        ))}

        {players.length === 0 && (
          <p className="text-center py-20 text-white/20 italic">Waiting for results...</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5">
        {isWinner && (
          <ThreeDButton variant="warning" className="w-full py-4 text-lg" onClick={onBalloon}>
            🎈 {t.balloonHero}
          </ThreeDButton>
        )}
        <ThreeDButton variant="secondary" className="w-full py-4" onClick={onHome}>
          {t.home}
        </ThreeDButton>
      </div>
    </div>
  );
};

export default LeaderboardPage;
