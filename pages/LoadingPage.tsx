
import React, { useState, useEffect } from 'react';
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

  const statusMessages = [
    t.appName === 'SnapQuizGame' ? "Igniting AI engines..." : "KI-Motoren zünden...",
    t.appName === 'SnapQuizGame' ? "Scanning your content..." : "Inhalt scannen...",
    t.appName === 'SnapQuizGame' ? "Extracting core concepts..." : "Kernkonzepte extrahieren...",
    t.appName === 'SnapQuizGame' ? "Crafting tricky questions..." : "Knifflige Fragen erstellen...",
    t.appName === 'SnapQuizGame' ? "Finalizing your challenge..." : "Herausforderung abschließen..."
  ];

  // Message Cycling
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [error, statusMessages.length]);

  // Percentage Simulation
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        const jump = Math.random() * 5;
        return Math.min(99, prev + jump);
      });
    }, 400);
    return () => clearInterval(interval);
  }, [error]);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300 relative overflow-hidden bg-brand-dark">
        <div className="absolute inset-0 bg-red-900/20 pointer-events-none"></div>
        <div className="text-8xl mb-8 drop-shadow-2xl">⚠️</div>
        <h2 className="text-2xl font-black italic mb-4 text-red-400 drop-shadow-sm">
          {error}
        </h2>
        <div className="flex flex-col gap-3 w-full max-w-xs z-10">
          <ThreeDButton variant="primary" onClick={onRetry}>{t.retry}</ThreeDButton>
          <button 
            onClick={onBack}
            className="text-white/50 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors py-2"
          >
            ← {t.home}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-brand-dark">
      {/* Dynamic background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute text-4xl opacity-10 animate-drift"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animationDelay: `${-Math.random() * 10}s`
            }}
          >
            {['💡', '📝', '✨', '🧪', '🌍', '🧠'][i % 6]}
          </div>
        ))}
      </div>

      {/* Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-lime/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-purple/10 blur-[150px] rounded-full animate-pulse-slow delay-1000"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <div className="relative mb-12">
          <div className="text-9xl animate-bounce-custom filter drop-shadow-[0_0_40px_rgba(132,204,22,0.4)]">
            🚀
          </div>
          {/* Scanning Line */}
          <div className="absolute top-0 left-[-20%] w-[140%] h-1 bg-gradient-to-r from-transparent via-brand-lime/80 to-transparent animate-scan shadow-[0_0_15px_#84cc16]"></div>
        </div>
        
        <h2 className="text-3xl font-black italic mb-2 tracking-tighter text-white drop-shadow-lg uppercase">
          {t.appName}
        </h2>

        <div className="h-6 overflow-hidden mb-8 w-full">
          <p key={messageIndex} className="text-brand-lime font-black uppercase tracking-[0.2em] text-[10px] animate-message-slide">
            {statusMessages[messageIndex]}
          </p>
        </div>
        
        {/* Progress Display */}
        <div className="w-full space-y-3 mb-16">
          <div className="flex justify-between items-end px-1">
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Processing</span>
             <span className="text-xl font-black text-brand-lime italic">{Math.floor(progress)}%</span>
          </div>
          
          <div className="relative w-full h-5 bg-white/5 rounded-full p-1 border border-white/10 shadow-inner overflow-hidden">
            {/* Progress Bar Background Glow */}
            <div 
              className="absolute inset-y-0 left-0 bg-brand-lime/10 blur-md transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
            
            {/* Main Progress Bar */}
            <div 
              className="h-full bg-gradient-to-r from-brand-lime via-brand-lime to-brand-gold rounded-full relative transition-all duration-700 ease-out shadow-[0_0_15px_rgba(132,204,22,0.4)]"
              style={{ width: `${progress}%` }}
            >
              {/* Liquid Shine Effect */}
              <div className="absolute inset-0 bg-white/20 h-1/2 rounded-full m-0.5 opacity-50 blur-[1px]"></div>
              
              {/* Animated Shine Streak */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-20 animate-loading-streak"></div>
            </div>
          </div>
        </div>

        <button 
          onClick={onCancel}
          className="glass group px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all hover:bg-white/20 border-white/20 hover:border-white/40 text-white/60"
        >
          <span className="flex items-center gap-2">
            <span className="group-hover:rotate-90 transition-transform duration-300">✕</span> {t.cancel}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.15; }
          80% { opacity: 0.15; }
          100% { transform: translate(40px, -100px) rotate(45deg); opacity: 0; }
        }
        @keyframes loading-streak {
          0% { transform: translateX(-100%) skewX(-45deg); }
          100% { transform: translateX(500%) skewX(-45deg); }
        }
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: 90%; }
        }
        @keyframes message-slide {
          0% { transform: translateY(15px); opacity: 0; filter: blur(5px); }
          15% { transform: translateY(0); opacity: 1; filter: blur(0); }
          85% { transform: translateY(0); opacity: 1; filter: blur(0); }
          100% { transform: translateY(-15px); opacity: 0; filter: blur(5px); }
        }
        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-35px) scale(1.05); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-drift {
          animation: drift linear infinite;
        }
        .animate-loading-streak {
          animation: loading-streak 2s linear infinite;
        }
        .animate-scan {
          animation: scan 4s ease-in-out infinite;
        }
        .animate-message-slide {
          animation: message-slide 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-bounce-custom {
          animation: bounce-custom 2.4s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;
