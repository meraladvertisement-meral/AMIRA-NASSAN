
import React, { useState } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';

interface DuelLobbyPageProps {
  code: string;
  joined: boolean;
  onStart: () => void;
  onBack: () => void;
  t: any;
}

const DuelLobbyPage: React.FC<DuelLobbyPageProps> = ({ code, joined, onStart, onBack, t }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const inviteLink = `${window.location.origin}${window.location.pathname}?duelJoin=${code}`;

  const copy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black italic">{t.duel} Lobby</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      <GlassCard className="text-center space-y-6">
        <div>
          <p className="text-xs uppercase font-bold text-white/50 mb-2">{t.roomCode}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-black text-brand-lime tracking-widest">{code}</span>
            <button 
              onClick={() => copy(code, 'code')}
              className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition active:scale-90"
            >
              {copied === 'code' ? '✅' : '📋'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] uppercase font-black text-white/40 mb-2">{t.copyLink}</p>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={inviteLink} 
              className="flex-1 bg-transparent text-xs text-white/60 font-mono outline-none truncate"
            />
            <button 
              onClick={() => copy(inviteLink, 'link')}
              className="text-xs font-bold text-brand-lime uppercase"
            >
              {copied === 'link' ? t.copied : t.copyLink}
            </button>
          </div>
        </div>

        <div className="py-4">
          {joined ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
              <div className="text-brand-lime font-black text-xl flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-brand-lime animate-ping"></span>
                Opponent Joined!
              </div>
              <ThreeDButton variant="primary" className="w-full py-5" onClick={onStart}>
                Start Battle!
              </ThreeDButton>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/60 animate-pulse font-bold uppercase tracking-widest text-sm">
              <span className="text-2xl mb-1">⌛</span>
              Waiting for Opponent...
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default DuelLobbyPage;
