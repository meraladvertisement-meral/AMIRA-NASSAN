
import React, { useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { QuizResult } from '../types/quiz';

interface ResultPageProps {
  result: QuizResult;
  onHome: () => void;
  onBalloon: () => void;
  t: any;
  audio: any;
}

const ResultPage: React.FC<ResultPageProps> = ({ result, onHome, onBalloon, t, audio }) => {
  const isWinner = result.percentage >= 60;

  useEffect(() => {
    if (isWinner) audio.playSfx('win');
  }, [isWinner, audio]);

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6">
      <div className="text-center">
        <h2 className="text-5xl font-black italic mb-2 text-white drop-shadow-lg">
          {isWinner ? 'AMAZING!' : 'GOOD TRY!'}
        </h2>
        <p className="text-brand-lime font-bold tracking-widest uppercase">Quiz Completed</p>
      </div>

      <GlassCard className="text-center py-10">
        <div className="text-7xl font-black mb-2 text-brand-gold">
          {Math.round(result.percentage)}%
        </div>
        <p className="text-xl font-bold text-white/70">
          {result.score} / {result.totalQuestions} Correct
        </p>
      </GlassCard>

      <div className="flex flex-col gap-3">
        {isWinner && (
          <ThreeDButton variant="warning" className="w-full text-2xl" onClick={onBalloon}>
            🎈 {t.balloonHero}
          </ThreeDButton>
        )}
        <ThreeDButton variant="primary" className="w-full" onClick={onHome}>
          {t.home}
        </ThreeDButton>
      </div>
    </div>
  );
};

export default ResultPage;
