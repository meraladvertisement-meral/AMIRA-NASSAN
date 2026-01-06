
import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime, className = "" }) => {
  const ratio = timeLeft / totalTime;
  
  // Color mapping based on urgency
  const getColorClass = () => {
    if (ratio > 0.5) return 'bg-brand-lime shadow-[0_0_15px_#84cc16]';
    if (ratio > 0.2) return 'bg-brand-gold shadow-[0_0_15px_#f59e0b]';
    return 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse';
  };

  const getTextColorClass = () => {
    if (ratio > 0.5) return 'text-brand-lime';
    if (ratio > 0.2) return 'text-brand-gold';
    return 'text-red-500 animate-pulse';
  };

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-end px-1">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">Time Remaining</span>
          <div className="flex items-baseline gap-1">
             <span className={`text-2xl font-black italic leading-none transition-colors duration-500 ${getTextColorClass()}`}>
               {timeLeft}
             </span>
             <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">sec</span>
          </div>
        </div>
        
        {timeLeft <= 5 && (
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-bounce">
            Hurry Up! ⚡
          </span>
        )}
      </div>

      <div className="relative w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
        {/* Track Glow Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: ratio > 0.5 ? '#84cc16' : ratio > 0.2 ? '#f59e0b' : '#ef4444' }}></div>
        
        {/* Progress Fill */}
        <div 
          className={`h-full rounded-full transition-all duration-1000 linear ${getColorClass()}`}
          style={{ width: `${ratio * 100}%` }}
        >
          {/* Internal Shine */}
          <div className="absolute inset-0 bg-white/20 h-1/2 rounded-full m-0.5 blur-[0.5px]"></div>
          
          {/* Leading Light Edge */}
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-md rounded-full translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
};
