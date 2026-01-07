
import React from 'react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime, className = "" }) => {
  const ratio = timeLeft / totalTime;
  // Trigger urgency at 25% as requested
  const isUrgent = ratio <= 0.25;
  
  // Dynamic color selection based on urgency ratio
  const getColorClasses = () => {
    if (ratio > 0.6) return {
      bar: 'bg-brand-lime shadow-[0_0_20px_rgba(132,204,22,0.6)]',
      text: 'text-brand-lime',
      glow: 'bg-brand-lime/10',
      container: 'border-white/5'
    };
    if (ratio > 0.25) return {
      bar: 'bg-brand-gold shadow-[0_0_20px_rgba(245,158,11,0.6)]',
      text: 'text-brand-gold',
      glow: 'bg-brand-gold/10',
      container: 'border-white/10'
    };
    // Critical state (Red + Pulse + Jitter)
    return {
      bar: 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,1)] animate-pulse',
      text: 'text-red-500 animate-[timer-jitter_0.1s_infinite]',
      glow: 'bg-red-500/30',
      container: 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-pulse'
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`w-full flex flex-col gap-2 transition-all duration-500 ${className} ${isUrgent ? 'animate-pulse' : ''}`}>
      {/* Header with Countdown and Urgent Badge */}
      <div className="flex justify-between items-end px-1">
        <div className="flex flex-col">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1 transition-colors ${isUrgent ? 'text-red-400' : 'text-white/30'}`}>
            Time Remaining
          </span>
          <div className="flex items-baseline gap-1">
             <span className={`text-4xl font-black italic leading-none transition-all duration-300 tabular-nums ${colors.text}`}>
               {timeLeft}
             </span>
             <span className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${isUrgent ? 'text-red-400/40' : 'text-white/20'}`}>sec</span>
          </div>
        </div>
        
        {/* Urgent Hurry Up Badge */}
        {isUrgent && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 animate-bounce shadow-lg">
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

      {/* Progress Track */}
      <div className={`relative w-full h-4 bg-black/40 rounded-full overflow-hidden border backdrop-blur-md transition-all duration-500 ${colors.container}`}>
        {/* Internal Glow Effect */}
        <div className={`absolute inset-0 transition-colors duration-700 ${colors.glow}`}></div>
        
        {/* Animated Progress Fill */}
        <div 
          className={`h-full rounded-full transition-all duration-1000 linear relative ${colors.bar}`}
          style={{ width: `${ratio * 100}%` }}
        >
          {/* Top Edge Highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2 rounded-full m-0.5"></div>
          
          {/* Animated Shine Sweep */}
          <div className={`absolute inset-0 w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-[timer-shine_${isUrgent ? '1s' : '3s'}_infinite_linear]`}></div>
        </div>
      </div>

      <style>{`
        @keyframes timer-shine {
          0% { transform: translateX(-200%) skewX(-12deg); }
          100% { transform: translateX(400%) skewX(-12deg); }
        }
        @keyframes timer-jitter {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-0.5px, 0.5px); }
          50% { transform: translate(0.5px, -0.5px); }
          75% { transform: translate(-0.5px, -0.5px); }
          100% { transform: translate(0.5px, 0.5px); }
        }
      `}</style>
    </div>
  );
};
