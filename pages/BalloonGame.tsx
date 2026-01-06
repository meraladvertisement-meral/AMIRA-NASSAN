
import React, { useState, useEffect, useCallback } from 'react';
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

  // Background Music Lifecycle
  useEffect(() => {
    audio.startMusic('arcade');
    
    return () => {
      audio.stopMusic();
    };
  }, [audio]);

  // Game Timer
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
    const interval = setInterval(addBalloon, 500);
    return () => clearInterval(interval);
  }, [addBalloon]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setBalloons(prev => prev.map(b => ({ ...b, y: b.y - 1.5 })).filter(b => b.y > -20));
    }, 20);
    return () => clearInterval(moveInterval);
  }, []);

  const pop = (id: number) => {
    audio.playSfx('pop');
    if ('vibrate' in navigator) navigator.vibrate(50);
    setBalloons(prev => prev.filter(b => b.id !== id));
    setPopped(prev => prev + 1);
  };

  const handleFinish = () => {
    audio.stopMusic(); // Ensure music is stopped explicitly before callback
    onComplete(popped);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-brand-dark">
      <div className={`absolute top-10 left-1/2 -translate-x-1/2 z-20 text-center ${timeLeft <= 5 ? 'scale-125 text-red-500 animate-pulse' : 'text-white'}`}>
        <p className="text-4xl font-black">{timeLeft}s</p>
        <p className="text-brand-lime font-bold uppercase tracking-widest">{t.popCount}: {popped}</p>
      </div>

      {balloons.map(b => (
        <div 
          key={b.id}
          onClick={() => pop(b.id)}
          className="absolute cursor-pointer rounded-full flex items-center justify-center touch-none"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: '80px',
            height: '100px',
            backgroundColor: b.color,
            boxShadow: 'inset -10px -10px 10px rgba(0,0,0,0.2)',
            transition: 'top 0.02s linear'
          }}
        >
          <div className="w-1 h-4 bg-white/20 absolute bottom-[-10px] left-1/2 -translate-x-1/2 rounded-full"></div>
        </div>
      ))}

      {timeLeft === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center glass backdrop-blur-md">
          <div className="text-center p-8 bg-black/40 rounded-3xl border border-white/20">
            <h2 className="text-6xl font-black text-brand-gold mb-4 italic">BALLOON HERO!</h2>
            <p className="text-3xl font-bold text-white mb-8">{popped} {t.popCount}</p>
            <ThreeDButton onClick={handleFinish}>{t.home}</ThreeDButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalloonGame;
