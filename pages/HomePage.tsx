
import React from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { GameMode } from '../types/quiz';

interface HomePageProps {
  onSelectMode: (mode: GameMode) => void;
  onJoinDuel: () => void;
  onHistory: () => void;
  onPricing: () => void;
  onAffiliate: () => void;
  onInfoCenter: () => void;
  onLogout: () => void;
  t: any;
  audio: any;
  isGuest: boolean;
  demoUsed: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onSelectMode, 
  onJoinDuel,
  onHistory, 
  onPricing, 
  onAffiliate, 
  onInfoCenter, 
  onLogout,
  t, 
  audio, 
  isGuest, 
  demoUsed 
}) => {
  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center p-1">
            <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="40" width="60" height="40" rx="8" fill="#1e3a8a" />
              <rect x="35" y="32" width="30" height="12" rx="4" fill="#1e3a8a" />
              <circle cx="50" cy="60" r="18" fill="white" />
              <circle cx="50" cy="60" r="14" fill="#f59e0b" />
              <path d="M50 15 L20 30 L50 45 L80 30 Z" fill="#6b21a8" />
            </svg>
          </div>
          <h1 className="text-2xl font-black italic text-white drop-shadow-md tracking-tighter">SnapQuizGame</h1>
        </div>
        <div className="flex gap-2">
          {isGuest && (
            <button 
              onClick={onLogout}
              className="glass p-3 rounded-2xl text-xs font-bold shadow-lg active:scale-90 transition-transform"
            >
              Sign In
            </button>
          )}
          <button 
            onClick={() => audio.toggleMute()}
            className="glass p-3 rounded-2xl text-2xl shadow-lg active:scale-90 transition-transform"
          >
            {audio.isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {isGuest && demoUsed && (
        <GlassCard className="bg-brand-gold/30 border-brand-gold/60 text-center animate-bounce-short z-20">
          <p className="font-bold text-white mb-2 text-lg">⚠️ {t.demoUsed}</p>
          <p className="text-sm opacity-90 leading-relaxed">{t.guestBlocker}</p>
          <button 
            onClick={onLogout}
            className="mt-6 px-8 py-3 bg-brand-lime text-brand-dark rounded-2xl text-sm font-black shadow-xl uppercase tracking-widest active:scale-95 transition-all hover:brightness-110"
          >
            {t.continueGoogle}
          </button>
        </GlassCard>
      )}

      <GlassCard className="space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/20">
        <ThreeDButton 
          variant="primary" 
          className={`w-full flex items-center justify-between py-5 ${isGuest && demoUsed ? 'opacity-40 grayscale cursor-not-allowed' : ''}`} 
          onClick={() => (isGuest && demoUsed ? null : onSelectMode(GameMode.SOLO))}
          disabled={isGuest && demoUsed}
        >
          <span className="text-xl">{isGuest ? t.tryDemo : t.solo}</span>
          <span className="text-3xl">🚀</span>
        </ThreeDButton>

        <div className="grid grid-cols-2 gap-2">
          <ThreeDButton 
            variant="secondary" 
            className={`flex-1 flex flex-col items-center justify-center py-4 ${isGuest ? 'opacity-25 pointer-events-none' : ''}`} 
            onClick={() => onSelectMode(GameMode.DUEL)}
            disabled={isGuest}
          >
            <span className="text-xs font-black uppercase mb-1">{t.createRoom}</span>
            <span className="text-2xl">⚔️</span>
          </ThreeDButton>
          <ThreeDButton 
            variant="secondary" 
            className={`flex-1 flex flex-col items-center justify-center py-4 bg-white/5 ${isGuest ? 'opacity-25 pointer-events-none' : ''}`} 
            onClick={onJoinDuel}
            disabled={isGuest}
          >
            <span className="text-xs font-black uppercase mb-1">{t.joinRoom}</span>
            <span className="text-2xl">🤝</span>
          </ThreeDButton>
        </div>

        <ThreeDButton 
          variant="warning" 
          className={`w-full flex items-center justify-between py-5 ${isGuest ? 'opacity-25 pointer-events-none' : ''}`} 
          onClick={() => onSelectMode(GameMode.TEACHER)}
          disabled={isGuest}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{t.teacher}</span>
            {isGuest && <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full">🔒</span>}
          </div>
          <span className="text-3xl">👩‍🏫</span>
        </ThreeDButton>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <ThreeDButton 
          variant="secondary" 
          className={`text-sm py-4 bg-white/5 border-white/10 ${isGuest ? 'opacity-25 pointer-events-none' : ''}`} 
          onClick={onHistory}
          disabled={isGuest}
        >
          📁 {t.history} {isGuest && "🔒"}
        </ThreeDButton>
        <ThreeDButton 
          variant="secondary" 
          className={`text-sm py-4 bg-white/5 border-white/10 ${isGuest ? 'opacity-25 pointer-events-none' : ''}`} 
          onClick={onPricing}
          disabled={isGuest}
        >
          💎 {t.pricing} {isGuest && "🔒"}
        </ThreeDButton>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <ThreeDButton 
          variant="secondary" 
          className={`text-sm py-4 bg-white/5 border-white/10 ${isGuest ? 'opacity-25 pointer-events-none' : ''}`} 
          onClick={onAffiliate}
          disabled={isGuest}
        >
          🤝 {t.affiliate} {isGuest && "🔒"}
        </ThreeDButton>
        <ThreeDButton variant="secondary" className="text-sm py-4 bg-white/5 border-brand-gold/30" onClick={onInfoCenter}>
          ℹ️ Info & Support
        </ThreeDButton>
      </div>

      {!audio.audioEnabled && (
        <p className="text-center text-[10px] text-white/50 font-bold animate-pulse uppercase tracking-widest mt-2">
          {t.enableMusic}
        </p>
      )}
    </div>
  );
};

export default HomePage;
