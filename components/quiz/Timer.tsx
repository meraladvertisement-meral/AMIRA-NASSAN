
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
    if (ratio > 0.6) return {
      bar: 'bg-brand-lime shadow-[0_0_20px_rgba(132,204,22,0.6)]',
      text: 'text-brand-lime',
      glow: 'bg-brand-lime/10'
    };
    if (ratio > 0.3) return {
      bar: 'bg-brand-gold shadow-[0_0_20px_rgba(245,158,11,0.6)]',
      text: 'text-brand-gold',
      glow: 'bg-brand-gold/10'
    };
    return {
      bar: 'bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.9)] animate-pulse',
      text: 'text-red-500 animate-pulse',
      glow: 'bg-red-500/20'
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      {/* Timer Labels & Countdown */}
      <div className="flex justify-between items-end px-1">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em] leading-none mb-1">
            Time Remaining
          </span>
          <div className="flex items-baseline gap-1">
             <span className={`text-4xl font-black italic leading-none transition-colors duration-500 tabular-nums ${colors.text}`}>
               {timeLeft}
             </span>
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">sec</span>
          </div>
        </div>
        
        {/* Urgency Indicator */}
        {timeLeft <= 5 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 animate-bounce">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
              Hurry up!
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar Track */}
      <div className="relative w-full h-3.5 bg-black/30 rounded-full overflow-hidden border border-white/5 shadow-inner backdrop-blur-sm">
        {/* Dynamic Background Glow */}
        <div className={`absolute inset-0 transition-colors duration-700 ${colors.glow}`}></div>
        
        {/* Smooth Progress Fill */}
        <div 
          className={`h-full rounded-full transition-all duration-1000 linear relative ${colors.bar}`}
          style={{ width: `${ratio * 100}%` }}
        >
          {/* Internal Highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 rounded-full m-0.5"></div>
          
          {/* Animated Scanline */}
          <div className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-[timer-shine_3s_infinite_linear]"></div>
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
