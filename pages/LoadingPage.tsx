
import React, { useState, useEffect, useRef } from 'react';
import { ThreeDButton } from '../components/layout/ThreeDButton';

interface LoadingPageProps {
  t: any;
  error?: string | null;
  onCancel?: () => void;
  onRetry?: () => void;
  onBack?: () => void;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ t, error, onCancel, onRetry, onBack }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const statusMessages = [
    t.appName === 'SnapQuizGame' ? "Igniting AI engines..." : "KI-Motoren zünden...",
    t.appName === 'SnapQuizGame' ? "Scanning your content..." : "Inhalt scannen...",
    t.appName === 'SnapQuizGame' ? "Extracting core concepts..." : "Kernkonzepte extrahieren...",
    t.appName === 'SnapQuizGame' ? "Crafting tricky questions..." : "Knifflige Fragen erstellen...",
    t.appName === 'SnapQuizGame' ? "Finalizing your challenge..." : "Herausforderung abschließen..."
  ];

  const techLogs = [
    "INIT /gemini-flash-lite-v2.5",
    "DECODING_CONTENT_BUFFER...",
    "EXTRACTING_SEMANTIC_NODES...",
    "OPTIMIZING_LLM_WEIGHTS...",
    "STRUCTURING_RESPONSE_SCHEMA...",
    "GENERATING_DISTRACTORS...",
    "RESOLVING_CONTEXT_HASH...",
    "SYNCING_FIREBASE_REALTIME...",
    "RENDER_UI_COMPONENTS...",
    "BOOSTING_NEURAL_PATHWAYS..."
  ];

  // Message Cycling
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [error, statusMessages.length]);

  // Log Spawner
  useEffect(() => {
    if (error) return;
    const logInterval = setInterval(() => {
      setLogs(prev => [...prev.slice(-5), techLogs[Math.floor(Math.random() * techLogs.length)]]);
    }, 900);
    return () => clearInterval(logInterval);
  }, [error]);

  // Percentage Simulation
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return prev;
        // Faster start, slower finish for realism
        const increment = prev < 60 ? Math.random() * 5 : Math.random() * 2;
        return Math.min(99.4, prev + increment);
      });
    }, 300);
    return () => clearInterval(interval);
  }, [error]);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 relative overflow-hidden bg-[#1a0505]">
        <div className="absolute inset-0 bg-red-950/20 pointer-events-none"></div>
        <div className="text-8xl mb-8 drop-shadow-[0_0_40px_rgba(239,68,68,0.6)] animate-bounce">⚠️</div>
        <h2 className="text-2xl font-black italic mb-4 text-red-400 drop-shadow-sm uppercase tracking-tighter">
          {error}
        </h2>
        <div className="flex flex-col gap-3 w-full max-w-xs z-10">
          <ThreeDButton variant="primary" onClick={onRetry}>{t.retry}</ThreeDButton>
          <button onClick={onBack} className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white py-3 transition-all">
            ← {t.home}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[#050b1a]">
      {/* 3D Neural Mesh Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 animate-pulse-slow">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="neural-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1" fill="#84cc16" opacity="0.5" />
                <path d="M 0 30 L 60 30 M 30 0 L 30 60" stroke="#84cc16" strokeWidth="0.2" fill="none" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neural-pattern)" />
          </svg>
        </div>
        {/* Animated Data Particles */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-brand-lime rounded-full animate-data-particle blur-[1px]"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3
            }}
          />
        ))}
      </div>

      {/* Main Loader Core */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <div className="relative mb-14 group">
          {/* Energy Halo */}
          <div className="absolute inset-0 bg-brand-lime/20 blur-[60px] rounded-full animate-pulse scale-150"></div>
          
          {/* The Rocket Icon with Advanced Jitter */}
          <div className="text-[130px] filter drop-shadow-[0_0_30px_rgba(132,204,22,0.8)] animate-rocket-thrust">
            🚀
          </div>
          
          {/* Scanning Line Effect */}
          <div className="absolute top-0 left-[-30%] w-[160%] h-0.5 bg-gradient-to-r from-transparent via-brand-lime to-transparent animate-laser shadow-[0_0_15px_#84cc16]"></div>
        </div>

        <div className="space-y-1 mb-8 w-full">
           <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {t.appName}
          </h2>
          <div className="h-6 overflow-hidden">
            <p key={messageIndex} className="text-brand-lime font-black uppercase tracking-[0.25em] text-[10px] animate-message-entrance">
              {statusMessages[messageIndex]}
            </p>
          </div>
        </div>

        {/* Console Activity Log */}
        <div className="w-full h-28 mb-10 glass border-white/10 bg-black/60 rounded-3xl p-5 overflow-hidden text-left font-mono text-[9px] text-brand-lime/50 leading-loose shadow-2xl relative">
           <div className="absolute top-2 right-4 flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 animate-pulse"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50 animate-pulse delay-75"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse delay-150"></div>
           </div>
           {logs.map((log, i) => (
             <div key={i} className="animate-in slide-in-from-bottom-3 duration-300 flex items-center gap-2">
               <span className="text-brand-lime/20">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
               <span className="flex-1 truncate">
                 <span className="text-brand-lime/80">$</span> {log}
               </span>
             </div>
           ))}
        </div>
        
        {/* Advanced Progress Bar System */}
        <div className="w-full space-y-4 mb-14">
          <div className="flex justify-between items-end px-1">
             <div className="flex flex-col items-start">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">System Status</span>
               <span className="text-[10px] font-bold text-brand-lime uppercase tracking-widest animate-pulse">Optimizing...</span>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Neural Load</span>
               <span className="text-2xl font-black text-brand-lime italic drop-shadow-[0_0_10px_rgba(132,204,22,0.5)]">
                 {Math.floor(progress)}<span className="text-sm opacity-50 ml-0.5">%</span>
               </span>
             </div>
          </div>
          
          <div className="relative w-full h-5 bg-white/5 rounded-full border border-white/10 shadow-inner p-1 group">
             {/* Progress Fill */}
             <div 
               className="h-full bg-gradient-to-r from-brand-lime via-brand-lime to-brand-gold rounded-full relative transition-all duration-700 ease-out shadow-[0_0_20px_rgba(132,204,22,0.4)]"
               style={{ width: `${progress}%` }}
             >
               {/* Glossy Overlay */}
               <div className="absolute inset-0 bg-white/10 h-1/2 rounded-full m-0.5 blur-[0.5px]"></div>
               
               {/* Animated Scanning Shine */}
               <div className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-bar-shine -skew-x-12"></div>
               
               {/* Floating Tip Glow */}
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-md opacity-50"></div>
             </div>
          </div>
        </div>

        <button 
          onClick={onCancel}
          className="group relative px-10 py-4 overflow-hidden rounded-2xl transition-all active:scale-95"
        >
          <div className="absolute inset-0 glass border-white/20 group-hover:bg-white/20 transition-all"></div>
          <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/60 group-hover:text-white transition-all">
            {t.cancel}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes rocket-thrust {
          0%, 100% { transform: translateY(0) scale(1) rotate(0); }
          25% { transform: translateY(-4px) scale(1.02) rotate(-1deg); }
          50% { transform: translateY(0) scale(1) rotate(0.5deg); }
          75% { transform: translateY(2px) scale(0.98) rotate(-0.5deg); }
        }
        @keyframes message-entrance {
          0% { transform: translateY(10px) scale(0.9); opacity: 0; filter: blur(5px); }
          100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes bar-shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes laser {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: 100%; }
        }
        @keyframes data-particle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.3; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        .animate-rocket-thrust { animation: rocket-thrust 0.15s linear infinite; }
        .animate-message-entrance { animation: message-entrance 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-bar-shine { animation: bar-shine 2.5s infinite linear; }
        .animate-laser { animation: laser 4s ease-in-out infinite; }
        .animate-data-particle { animation: data-particle linear infinite; }
        .animate-pulse-slow { animation: pulse 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LoadingPage;
