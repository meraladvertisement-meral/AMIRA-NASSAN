
import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime, className = "" }) => {
  const ratio = timeLeft / totalTime;
  
  const getColorClasses = () => {
    if (ratio > 0.5) return {
      bar: 'bg-brand-lime shadow-[0_0_15px_rgba(132,204,22,0.5)]',
      text: 'text-brand-lime'
    };
    if (ratio > 0.25) return {
      bar: 'bg-brand-gold shadow-[0_0_15px_rgba(245,158,11,0.5)]',
      text: 'text-brand-gold'
    };
    return {
      bar: 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse',
      text: 'text-red-500 animate-pulse'
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`w-full flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Time Left</span>
        <span className={`text-3xl font-black italic tabular-nums transition-colors duration-500 ${colors.text}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
        <div 
          className={`h-full rounded-full transition-all duration-1000 linear ${colors.bar}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
};
