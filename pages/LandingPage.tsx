
import React from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { Language } from '../i18n';
import { LegalDocType } from '../services/legalService';

interface LandingPageProps {
  onNext: () => void;
  onGuest: () => void;
  onAdmin?: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: any;
  onOpenLegal: (type: LegalDocType) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNext, onGuest, onAdmin, lang, setLang, t, onOpenLegal }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 h-screen overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-lime opacity-20 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-brand-gold opacity-10 blur-[100px] rounded-full"></div>

      <div className="absolute top-6 right-6 flex gap-2 z-10">
        <button 
          onClick={() => setLang('en')}
          className={`px-3 py-1 rounded-full text-sm font-bold transition ${lang === 'en' ? 'bg-white text-brand-dark shadow-lg' : 'bg-white/20 text-white'}`}
        >EN</button>
        <button 
          onClick={() => setLang('de')}
          className={`px-3 py-1 rounded-full text-sm font-bold transition ${lang === 'de' ? 'bg-white text-brand-dark shadow-lg' : 'bg-white/20 text-white'}`}
        >DE</button>
      </div>

      <div className="flex flex-col items-center mb-8 animate-float z-10">
        <div className="w-48 h-48 md:w-56 md:h-56 logo-circle bg-white mb-6 flex items-center justify-center relative shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <svg viewBox="0 0 100 100" className="w-full h-full p-6" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="40" width="60" height="40" rx="8" fill="#1e3a8a" />
            <rect x="35" y="32" width="30" height="12" rx="4" fill="#1e3a8a" />
            <circle cx="50" cy="60" r="18" fill="white" />
            <circle cx="50" cy="60" r="14" fill="#f59e0b" /> 
            <circle cx="50" cy="60" r="6" fill="#1e3a8a" />
            <circle cx="58" cy="52" r="3" fill="white" fillOpacity="0.4" />
            <circle cx="70" cy="48" r="4" fill="#84cc16" />
            <path d="M50 15 L20 30 L50 45 L80 30 Z" fill="#6b21a8" />
            <path d="M35 32 L35 42 C35 42 50 50 65 42 L65 32" fill="#6b21a8" />
            <line x1="80" y1="30" x2="80" y2="45" stroke="#84cc16" strokeWidth="2" />
            <circle cx="80" cy="45" r="3" fill="#84cc16" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] mb-2 italic tracking-tighter">SnapQuizGame</h1>
        <p className="text-white font-medium tracking-widest uppercase text-[10px] bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-inner">
          Capture Knowledge Instantly 📸✨
        </p>
      </div>

      <GlassCard className="w-full max-w-md space-y-4 z-10 border-white/30">
        <ThreeDButton variant="primary" className="w-full text-xl py-5" onClick={onNext}>
          {t.continueGoogle}
        </ThreeDButton>
        <ThreeDButton variant="secondary" className="w-full py-4 bg-white/10" onClick={onGuest}>
          {t.continueGuest}
        </ThreeDButton>
        
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="flex justify-center gap-6 text-white/50 text-[10px] font-bold uppercase tracking-widest">
            <button onClick={() => onOpenLegal('terms')} className="hover:text-brand-lime transition-colors">{t.terms}</button>
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-brand-lime transition-colors">{t.privacy}</button>
            <button onClick={() => onOpenLegal('impressum')} className="hover:text-brand-lime transition-colors">{t.impressum}</button>
          </div>
          
          {/* Subtle Admin Trigger */}
          <button 
            onClick={onAdmin} 
            className="text-[8px] text-white/10 hover:text-white/30 uppercase tracking-[0.5em] transition-colors"
          >
            Admin
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default LandingPage;
