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
  onQuickSnap: () => void;
  t: any;
  audio: any;
  isGuest: boolean;
  demoUsed: boolean;
  isAdmin?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onSelectMode, 
  onJoinDuel,
  onHistory, 
  onPricing, 
  onAffiliate, 
  onInfoCenter, 
  onLogout,
  onQuickSnap,
  t, 
  audio, 
  isGuest, 
  demoUsed,
  isAdmin
}) => {
  return (
    <div className="min-h-screen flex flex-col relative pb-28">
      <header className="sticky top-0 z-50 w-full bg-brand-dark/40 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-lime rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(132,204,22,0.4)]">
            <span className="text-brand-dark font-black text-xs">SQ</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black italic text-white tracking-tighter drop-shadow-sm leading-none">SnapQuizGame</h1>
            {isAdmin && <span className="text-[8px] text-brand-lime font-black uppercase tracking-widest mt-1">Administrator</span>}
            {isGuest && <span className="text-[8px] text-brand-gold font-black uppercase tracking-widest mt-1">Guest Mode</span>}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { 
              audio.enableAudio();
              audio.playSfx('click'); 
              audio.toggleMute(); 
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 active:scale-90 shadow-lg border ${
              audio.isMuted 
                ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                : 'bg-brand-lime/20 text-brand-lime border-brand-lime/30'
            }`}
          >
            <span className="text-lg leading-none">{audio.isMuted ? '🔇' : '🔊'}</span>
          </button>
          
          <button 
            onClick={onLogout} 
            className="glass px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all border-white/20 active:scale-95"
          >
            {t.logout || 'Logout'}
          </button>
        </div>
      </header>

      <main className="p-6 max-w-lg mx-auto w-full flex-1 flex flex-col justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <GlassCard className="space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/20">
          <ThreeDButton 
            variant="primary" 
            className="w-full flex items-center justify-between py-8 group" 
            onClick={() => { audio.enableAudio(); onSelectMode(GameMode.SOLO); }}
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Create AI Quiz</span>
              <span className="text-2xl font-black">{t.solo}</span>
            </div>
            <span className="text-4xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">🚀</span>
          </ThreeDButton>

          <div className="grid grid-cols-2 gap-4">
            <ThreeDButton variant="secondary" className="py-6 flex flex-col items-center gap-1" onClick={() => { audio.enableAudio(); onSelectMode(GameMode.DUEL); }}>
              <span className="text-[10px] opacity-50 font-black tracking-widest">1 VS 1</span>
              <span className="text-lg">{t.duel} ⚔️</span>
            </ThreeDButton>
            <ThreeDButton variant="secondary" className="py-6 flex flex-col items-center gap-1" onClick={() => { audio.enableAudio(); onSelectMode(GameMode.TEACHER); }}>
              <span className="text-[10px] opacity-50 font-black tracking-widest">CLASSROOM</span>
              <span className="text-lg">{t.teacher} 👩‍🏫</span>
            </ThreeDButton>
          </div>

          <ThreeDButton variant="warning" className="w-full py-5 bg-white/5 border-white/10 hover:bg-white/10" onClick={() => { audio.enableAudio(); onJoinDuel(); }}>
            <span className="flex items-center justify-center gap-2">
              {t.joinRoom} <span className="text-xl">🔑</span>
            </span>
          </ThreeDButton>
        </GlassCard>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => { audio.enableAudio(); onHistory(); }}
            className="glass group p-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-white/20 transition-all active:scale-95 border-white/10"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">📁</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{t.history}</span>
          </button>
          
          <button 
            onClick={() => { audio.enableAudio(); onPricing(); }} 
            className="glass group p-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-white/20 transition-all active:scale-95 border-white/10"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">💎</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{t.pricing}</span>
          </button>
        </div>
      </main>

      {/* Fixed Legal Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-6 bg-brand-dark/20 backdrop-blur-xl z-40 border-t border-white/5">
        <div className="flex justify-center gap-8 text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">
          <button onClick={onInfoCenter} className="hover:text-brand-lime transition-colors">{t.terms}</button>
          <button onClick={onInfoCenter} className="hover:text-brand-lime transition-colors">{t.privacy}</button>
          <button onClick={onInfoCenter} className="hover:text-brand-lime transition-colors">{t.impressum}</button>
        </div>
      </footer>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-dark/20 to-transparent pointer-events-none -z-10"></div>
    </div>
  );
};

export default HomePage;
