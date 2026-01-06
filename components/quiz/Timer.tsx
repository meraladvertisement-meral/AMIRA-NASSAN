
import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime, className = "" }) => {
  const ratio = timeLeft / totalTime;
  
  // Dynamic color selection based on urgency
  const getColorClasses = () => {
    if (ratio > 0.5) return {
      bar: 'bg-brand-lime shadow-[0_0_20px_rgba(132,204,22,0.6)]',
      text: 'text-brand-lime',
      glow: 'bg-brand-lime/10'
    };
    if (ratio > 0.25) return {
      bar: 'bg-brand-gold shadow-[0_0_20px_rgba(245,158,11,0.6)]',
      text: 'text-brand-gold',
      glow: 'bg-brand-gold/10'
    };
    return {
      bar: 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse',
      text: 'text-red-500 animate-pulse',
      glow: 'bg-red-500/20'
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`w-full flex flex-col gap-2.5 ${className}`}>
      {/* Timer Labels & Countdown */}
      <div className="flex justify-between items-end px-1.5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.25em] leading-none mb-1.5">
            Quest Timer
          </span>
          <div className="flex items-baseline gap-1.5">
             <span className={`text-3xl font-black italic leading-none transition-colors duration-500 tabular-nums ${colors.text}`}>
               {timeLeft}
             </span>
             <span className="text-[11px] font-bold text-white/30 uppercase tracking-tighter">seconds</span>
          </div>
        </div>
        
        {/* Urgent Warning */}
        {timeLeft <= 5 && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-bounce">
              Time is running out! ⚡
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar Track */}
      <div className="relative w-full h-3.5 bg-black/40 rounded-full overflow-hidden border border-white/10 shadow-inner backdrop-blur-sm">
        {/* Dynamic Background Glow */}
        <div className={`absolute inset-0 transition-colors duration-500 ${colors.glow}`}></div>
        
        {/* Smooth Progress Fill */}
        <div 
          className={`h-full rounded-full transition-all duration-1000 linear relative flex items-center justify-end ${colors.bar}`}
          style={{ width: `${ratio * 100}%` }}
        >
          {/* Internal Glass Highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 rounded-full m-0.5"></div>
          
          {/* Animated Scanning Light */}
          <div className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-[timer-shine_3s_infinite_linear]"></div>
          
          {/* Leading Cap Glow */}
          <div className="w-4 h-full bg-white/40 blur-sm rounded-full translate-x-1/2"></div>
        </div>
      </div>

      <style>{`
        @keyframes timer-shine {
          0% { transform: translateX(-200%) skewX(-12deg); }
          100% { transform: translateX(400%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};
