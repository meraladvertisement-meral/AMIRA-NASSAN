
import React, { useState, useEffect, useMemo } from 'react';
import { ThreeDButton } from '../components/layout/ThreeDButton';

interface LoadingPageProps {
  t: any;
  error?: string | null;
  onCancel?: () => void;
  onRetry?: () => void;
  onBack?: () => void;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ t, error, onCancel, onRetry, onBack }) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState(0);

  const stages = useMemo(() => [
    { id: 0, label: t.appName === 'SnapQuizGame' ? "Ingesting Data" : "Daten einlesen", icon: "📥", threshold: 0 },
    { id: 1, label: t.appName === 'SnapQuizGame' ? "Neural Analysis" : "Neuronale Analyse", icon: "🧠", threshold: 25 },
    { id: 2, label: t.appName === 'SnapQuizGame' ? "Crafting Questions" : "Fragen erstellen", icon: "✍️", threshold: 60 },
    { id: 3, label: t.appName === 'SnapQuizGame' ? "Final Polish" : "Letzter Feinschliff", icon: "✨", threshold: 85 },
  ], [t.appName]);

  const techLogs = [
    "PARSING_NODE_CONTENT...",
    "EXTRACTING_SEMANTIC_HASH",
    "WEIGHT_OPTIMIZATION_START",
    "MCQ_DISTRACTOR_GEN_V2",
    "SYNCING_METADATA...",
    "RESOLVING_BIDI_TEXT...",
    "GEMINI_PRO_THINKING_V3",
    "UI_COMPONENT_PREFLIGHT",
    "LEVELLING_DIFFICULTY...",
    "PACKING_JSON_PAYLOAD"
  ];

  // Percentage Simulation & Stage Trigger
  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99.8) return prev;
        // Natural ease-out progression
        const increment = prev < 40 ? Math.random() * 4 : prev < 75 ? Math.random() * 1.5 : Math.random() * 0.4;
        const next = Math.min(99.8, prev + increment);
        
        // Update active stage based on thresholds
        const currentStage = stages.reduce((acc, stage) => next >= stage.threshold ? stage.id : acc, 0);
        if (currentStage !== activeStage) setActiveStage(currentStage);
        
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [error, activeStage, stages]);

  // Console Activity Log
  useEffect(() => {
    if (error) return;
    const logInterval = setInterval(() => {
      setLogs(prev => [...prev.slice(-4), techLogs[Math.floor(Math.random() * techLogs.length)]]);
    }, 800);
    return () => clearInterval(logInterval);
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
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 animate-pulse-slow">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="neural-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="1.5" fill="#84cc16" opacity="0.4" />
                <path d="M 0 40 L 80 40 M 40 0 L 40 80" stroke="#84cc16" strokeWidth="0.5" fill="none" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neural-grid)" />
          </svg>
        </div>
        
        {/* Floating Data Bits */}
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="absolute font-mono text-[10px] text-brand-lime/30 animate-float-up pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-50px',
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {Math.random() > 0.5 ? '01' : '10'}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Rocket Launch Core */}
        <div className="relative mb-12">
          {/* Energy Halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-lime/10 blur-[80px] rounded-full animate-pulse-fast"></div>
          
          <div className="text-[120px] drop-shadow-[0_0_30px_rgba(132,204,22,0.6)] animate-thrust relative z-10">
            🚀
          </div>

          {/* Scanning Laser */}
          <div className="absolute inset-0 w-full h-full border border-white/5 rounded-full pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-[-50%] w-[200%] h-0.5 bg-gradient-to-r from-transparent via-brand-lime to-transparent animate-scan shadow-[0_0_10px_#84cc16]"></div>
          </div>
        </div>

        {/* Stage Tracker */}
        <div className="flex gap-2 mb-10 w-full px-4">
          {stages.map((stage) => {
            const isCompleted = progress > (stages[stage.id + 1]?.threshold || 100);
            const isActive = activeStage === stage.id;
            return (
              <div key={stage.id} className="flex-1 flex flex-col items-center gap-2 group">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all duration-500 border-2 ${
                  isCompleted ? 'bg-brand-lime border-brand-lime text-brand-dark' : 
                  isActive ? 'bg-white/10 border-brand-lime text-brand-lime shadow-[0_0_15px_rgba(132,204,22,0.3)] scale-110' : 
                  'bg-white/5 border-white/5 text-white/20'
                }`}>
                  {isCompleted ? '✓' : stage.icon}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-white/20'}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Console Activity Log */}
        <div className="w-full h-24 mb-10 glass border-white/10 bg-black/60 rounded-[2rem] p-5 overflow-hidden text-left font-mono text-[9px] text-brand-lime/40 leading-relaxed shadow-inner">
           {logs.map((log, i) => (
             <div key={i} className="animate-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
               <span className="text-white/10">0x{Math.floor(Math.random()*1000)}</span>
               <span className="text-brand-lime/60 flex-1 truncate">{log}</span>
               <span className="text-brand-lime/20">{Math.floor(progress)}%</span>
             </div>
           ))}
        </div>

        {/* High-Fidelity Progress Bar */}
        <div className="w-full space-y-3 mb-12">
          <div className="flex justify-between items-end px-2">
            <div className="text-left">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Current Task</p>
              <p className="text-sm font-black text-brand-lime uppercase tracking-widest animate-pulse">
                {stages[activeStage].label}...
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">AI Load</p>
              <p className="text-2xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {Math.floor(progress)}<span className="text-xs opacity-50 ml-0.5">%</span>
              </p>
            </div>
          </div>
          
          <div className="relative w-full h-4 bg-white/5 rounded-full border border-white/10 p-0.5 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-brand-lime via-brand-lime to-brand-gold rounded-full relative transition-all duration-300 ease-out shadow-[0_0_20px_rgba(132,204,22,0.3)]"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/10 h-1/2 rounded-full m-0.5"></div>
              {/* Particle Spark at end of bar */}
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-md opacity-70"></div>
              {/* Bar Shine */}
              <div className="absolute inset-0 w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-20 animate-shine-move"></div>
            </div>
          </div>
        </div>

        <button 
          onClick={onCancel}
          className="group relative px-10 py-4 rounded-2xl transition-all active:scale-95 border border-white/5 hover:border-white/20"
        >
          <div className="absolute inset-0 glass opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
          <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">
            {t.cancel}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes thrust {
          0%, 100% { transform: translateY(0) rotate(0); }
          25% { transform: translateY(-3px) rotate(-1deg); }
          50% { transform: translateY(0) rotate(1deg); }
          75% { transform: translateY(3px) rotate(-0.5deg); }
        }
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; }
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.4; }
          80% { opacity: 0.4; }
          100% { transform: translateY(-110vh) scale(0.5); opacity: 0; }
        }
        @keyframes shine-move {
          0% { left: -200%; }
          100% { left: 400%; }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
        }
        .animate-thrust { animation: thrust 0.1s linear infinite; }
        .animate-scan { animation: scan 3s ease-in-out infinite; }
        .animate-float-up { animation: float-up linear infinite; }
        .animate-shine-move { animation: shine-move 2s infinite linear; }
        .animate-pulse-fast { animation: pulse-fast 1s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LoadingPage;
