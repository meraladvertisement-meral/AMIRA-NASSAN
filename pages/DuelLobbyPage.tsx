
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { firebaseService, ParticipantData } from '../services/firebaseService';

interface DuelLobbyPageProps {
  code: string;
  joined: boolean;
  onStart: () => void;
  onBack: () => void;
  t: any;
}

const DuelLobbyPage: React.FC<DuelLobbyPageProps> = ({ code, joined, onStart, onBack, t }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);

  const inviteLink = `${window.location.origin}${window.location.pathname}?join=${code}&mode=duel`;

  useEffect(() => {
    const unsub = firebaseService.subscribeToParticipants(code, (parts) => {
      setParticipants(parts);
    });
    return () => unsub();
  }, [code]);

  const copy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const opponent = participants.find(p => p.role === 'guest' && p.state === 'connected');

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black italic">{t.duel} Lobby</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition">←</button>
      </div>

      <GlassCard className="text-center space-y-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <p className="text-xs uppercase font-bold text-white/50 mb-2 tracking-[0.2em]">{t.roomCode}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-black text-brand-lime tracking-[0.3em]">{code}</span>
            <button 
              onClick={() => copy(code, 'code')}
              className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition active:scale-90 shadow-lg"
            >
              {copied === 'code' ? '✅' : '📋'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-3xl border border-white/10 transition-all hover:bg-white/10 group">
          <p className="text-[10px] uppercase font-black text-white/40 mb-2 tracking-widest">{t.copyLink}</p>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={inviteLink} 
              className="flex-1 bg-transparent text-[10px] text-white/60 font-mono outline-none truncate"
            />
            <button 
              onClick={() => copy(inviteLink, 'link')}
              className="text-[10px] font-black text-brand-lime uppercase tracking-widest group-hover:scale-105 transition"
            >
              {copied === 'link' ? t.copied : t.copyLink}
            </button>
          </div>
        </div>

        <div className="py-6 border-t border-white/10 mt-4">
          {opponent ? (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
              <div className="flex items-center gap-3 bg-brand-lime/10 px-6 py-3 rounded-full border border-brand-lime/20 shadow-[0_0_20px_rgba(132,204,22,0.1)]">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-lime opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-lime"></span>
                </span>
                <span className="text-brand-lime font-black uppercase tracking-widest text-sm">
                  {t.opponentConnected}
                </span>
              </div>
              <ThreeDButton variant="primary" className="w-full py-5 text-xl" onClick={onStart}>
                Start Battle!
              </ThreeDButton>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-10 h-10 border-4 border-white/10 border-t-brand-lime rounded-full animate-spin"></div>
              <p className="text-white/40 font-black uppercase tracking-[0.2em] text-xs">
                {t.waitingForOpponent}
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="text-center px-6">
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
          Share the code or link with your friend.<br/>The game starts when you press "Start Battle".
        </p>
      </div>
    </div>
  );
};

export default DuelLobbyPage;
