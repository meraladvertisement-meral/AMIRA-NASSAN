
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
  const logContainerRef = useRef<HTMLDivElement>(null);

  const statusMessages = [
    t.appName === 'SnapQuizGame' ? "Igniting AI engines..." : "KI-Motoren zünden...",
    t.appName === 'SnapQuizGame' ? "Scanning your content..." : "Inhalt scannen...",
    t.appName === 'SnapQuizGame' ? "Extracting core concepts..." : "Kernkonzepte extrahieren...",
    t.appName === 'SnapQuizGame' ? "Crafting tricky questions..." : "Knifflige Fragen erstellen...",
    t.appName === 'SnapQuizGame' ? "Finalizing your challenge..." : "Herausforderung abschließen..."
  ];

  const techLogs = [
    "POST /api/v1/gemini-flash-3",
    "Initializing neural layers...",
    "Embedding context vectors...",
    "Resolving semantic tokens...",
    "Structuring JSON schema...",
    "Validating difficulty constraints...",
    "Optimizing distraction nodes...",
    "Generating FITB logic...",
    "Syncing with Firebase real-time...",
    "Compressing image artifacts...",
    "Readying rocket boosters..."
  ];

  // Message Cycling
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [error, statusMessages.length]);

  // Log Spawner
  useEffect(() => {
    if (error) return;
    const logInterval = setInterval(() => {
      setLogs(prev => [...prev.slice(-4), techLogs[Math.floor(Math.random() * techLogs.length)]]);
    }, 1200);
    return () => clearInterval(logInterval);
  }, [error]);

  // Percentage Simulation
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        const jump = Math.random() * 8;
        return Math.min(99, prev + jump);
      });
    }, 500);
    return () => clearInterval(interval);
  }, [error]);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300 relative overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 bg-red-900/10 pointer-events-none"></div>
        <div className="text-8xl mb-8 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">⚠️</div>
        <h2 className="text-2xl font-black italic mb-4 text-red-400">
          {error}
        </h2>
        <div className="flex flex-col gap-3 w-full max-w-xs z-10">
          <ThreeDButton variant="primary" onClick={onRetry}>{t.retry}</ThreeDButton>
          <button onClick={onBack} className="text-white/50 text-xs font-bold uppercase tracking-widest hover:text-white py-2">
            ← {t.home}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[#0a0f2b]">
      {/* Neural Network Background Simulation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-pulse-slow">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(132,204,22,0.3)" strokeWidth="1"/>
                <circle cx="0" cy="0" r="1.5" fill="#84cc16"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Floating Artifacts */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="absolute opacity-10 animate-float-fast"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
          >
            {['0', '1', 'AI', 'Snap', '{ }'][i % 5]}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <div className="relative mb-10 group">
          <div className="text-[120px] filter drop-shadow-[0_0_50px_rgba(132,204,22,0.6)] animate-rocket-shake transition-all duration-300">
            🚀
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-500/40 blur-xl rounded-full animate-pulse"></div>
        </div>

        <div className="space-y-1 mb-8">
           <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase drop-shadow-md">
            {t.appName}
          </h2>
          <div className="h-4">
            <p key={messageIndex} className="text-brand-lime font-black uppercase tracking-[0.2em] text-[10px] animate-message-pop">
              {statusMessages[messageIndex]}
            </p>
          </div>
        </div>

        {/* Console Log */}
        <div className="w-full h-24 mb-10 glass border-white/5 bg-black/40 rounded-2xl p-4 overflow-hidden text-left font-mono text-[9px] text-brand-lime/70 leading-relaxed shadow-inner">
           {logs.map((log, i) => (
             <div key={i} className="animate-in slide-in-from-bottom-2 duration-300">
               <span className="opacity-40">{">"}</span> {log}
             </div>
           ))}
        </div>
        
        {/* Progress Display */}
        <div className="w-full space-y-4 mb-12">
          <div className="relative w-full h-4 bg-white/5 rounded-full border border-white/10 shadow-2xl overflow-hidden p-0.5">
             <div 
               className="h-full bg-gradient-to-r from-brand-lime via-brand-lime to-brand-gold rounded-full relative transition-all duration-700 ease-out"
               style={{ width: `${progress}%` }}
             >
               <div className="absolute top-0 right-0 h-full w-4 bg-white/30 blur-sm"></div>
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full animate-progress-shine"></div>
             </div>
          </div>
          <div className="flex justify-between items-center px-1">
             <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`w-1 h-3 rounded-full ${progress > (i * 10) ? 'bg-brand-lime shadow-[0_0_5px_#84cc16]' : 'bg-white/10'}`}></div>
                ))}
             </div>
             <span className="text-2xl font-black text-brand-lime italic leading-none">{Math.floor(progress)}%</span>
          </div>
        </div>

        <button 
          onClick={onCancel}
          className="glass group px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all hover:bg-white/20 border-white/20 text-white/50"
        >
          {t.cancel}
        </button>
      </div>

      <style>{`
        @keyframes rocket-shake {
          0%, 100% { transform: translateY(0) rotate(0); }
          25% { transform: translateY(-3px) rotate(-1deg); }
          75% { transform: translateY(2px) rotate(1deg); }
        }
        @keyframes message-pop {
          0% { transform: scale(0.9); opacity: 0; filter: blur(4px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes progress-shine {
          0% { transform: translateX(-100%) skewX(-30deg); }
          100% { transform: translateX(200%) skewX(-30deg); }
        }
        @keyframes float-fast {
          0% { transform: translate(0, 0); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translate(50px, -50px); opacity: 0; }
        }
        .animate-pulse-slow { animation: pulse 6s ease-in-out infinite; }
        .animate-rocket-shake { animation: rocket-shake 0.1s linear infinite; }
        .animate-message-pop { animation: message-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-progress-shine { animation: progress-shine 2s infinite linear; }
        .animate-float-fast { animation: float-fast 3s infinite ease-in; }
      `}</style>
    </div>
  );
};

export default LoadingPage;
