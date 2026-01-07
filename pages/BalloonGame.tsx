
// Add React import to fix 'Cannot find namespace React' error.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThreeDButton } from '../components/layout/ThreeDButton';

interface BalloonGameProps {
  onComplete: (count: number) => void;
  t: any;
  audio: any;
}

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
}

const BalloonGame: React.FC<BalloonGameProps> = ({ onComplete, t, audio }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [popped, setPopped] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const finishedRef = useRef(false);

  useEffect(() => {
    audio.startMusic('arcade');
    return () => audio.stopMusic();
  }, [audio]);

  // صوت تكتكة المؤقت
  useEffect(() => {
    if (timeLeft > 0 && timeLeft <= 5) {
      audio.playSfx('tick');
    }
    
    if (timeLeft === 0 && !finishedRef.current) {
      finishedRef.current = true;
      audio.playSfx('game_over');
      audio.stopMusic();
    }
  }, [timeLeft, audio]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addBalloon = useCallback(() => {
    if (timeLeft <= 0) return;
    const colors = ['#84cc16', '#6b21a8', '#f59e0b', '#ef4444', '#3b82f6'];
    const newBalloon: Balloon = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: 110,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setBalloons(prev => [...prev, newBalloon]);
  }, [timeLeft]);

  useEffect(() => {
    const interval = setInterval(addBalloon, 600);
    return () => clearInterval(interval);
  }, [addBalloon]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBalloons(prev => prev.map(b => ({ ...b, y: b.y - 1.2 })).filter(b => b.y > -20));
    }, 20);
    return () => clearInterval(moveInterval);
  }, []);

  const pop = (id: number) => {
    if (timeLeft <= 0) return;
    audio.playSfx('pop');
    if ('vibrate' in navigator) navigator.vibrate(50);
    setBalloons(prev => prev.filter(b => b.id !== id));
    setPopped(prev => prev + 1);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-brand-dark select-none touch-none">
      <div className={`absolute top-10 left-1/2 -translate-x-1/2 z-20 text-center transition-all ${timeLeft <= 5 ? 'scale-150 text-red-500 animate-pulse' : 'text-white'}`}>
        <p className="text-5xl font-black tabular-nums">{timeLeft}s</p>
        <p className="text-brand-lime font-bold uppercase tracking-widest text-xs mt-2">
          {t.appName === 'سناب كويز' ? 'فرقعة' : 'Popped'}: {popped}
        </p>
      </div>

      {balloons.map(b => (
        <div 
          key={b.id}
          onPointerDown={() => pop(b.id)}
          className="absolute cursor-pointer rounded-full flex items-center justify-center"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: '70px',
            height: '90px',
            backgroundColor: b.color,
            boxShadow: 'inset -8px -8px 15px rgba(0,0,0,0.3), 5px 5px 20px rgba(0,0,0,0.2)',
            transition: 'top 0.02s linear'
          }}
        >
          <div className="w-0.5 h-6 bg-white/20 absolute bottom-[-15px] left-1/2 -translate-x-1/2"></div>
        </div>
      ))}

      {timeLeft === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center glass backdrop-blur-xl animate-in fade-in duration-1000">
          <div className="text-center p-10 bg-black/60 rounded-[3rem] border border-white/20 shadow-2xl scale-110">
            <h2 className="text-6xl font-black text-brand-gold mb-4 italic animate-bounce">
              {t.appName === 'سناب كويز' ? 'بطل البالونات!' : 'BALLOON HERO!'}
            </h2>
            <p className="text-3xl font-bold text-white mb-10">{popped} {t.appName === 'سناب كويز' ? 'بالون' : 'Balloons'}</p>
            <ThreeDButton onClick={() => onComplete(popped)} className="px-12 py-5 text-xl">
              {t.home}
            </ThreeDButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalloonGame;
