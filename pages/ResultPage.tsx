
import React, { useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { QuizResult } from '../types/quiz';

interface ResultPageProps {
  result: QuizResult;
  onHome: () => void;
  onBalloon: () => void;
  onLeaderboard: () => void;
  showLeaderboardBtn?: boolean;
  t: any;
  audio: any;
}

const ResultPage: React.FC<ResultPageProps> = ({ result, onHome, onBalloon, onLeaderboard, showLeaderboardBtn, t, audio }) => {
  const isWinner = result.percentage >= 60;

  useEffect(() => {
    if (isWinner) audio.playSfx('win');
  }, [isWinner, audio]);

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6">
      <div className="text-center">
        <h2 className="text-5xl font-black italic mb-2 text-white drop-shadow-lg animate-in zoom-in duration-500">
          {isWinner ? 'AMAZING!' : 'GOOD TRY!'}
        </h2>
        <p className="text-brand-lime font-bold tracking-widest uppercase animate-pulse">Quiz Completed</p>
      </div>

      <GlassCard className="text-center py-10 border-white/20">
        <div className="text-7xl font-black mb-2 text-brand-gold drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          {Math.round(result.percentage)}%
        </div>
        <p className="text-xl font-bold text-white/70">
          {result.score} / {result.totalQuestions} {t.score || 'Correct'}
        </p>
      </GlassCard>

      <div className="flex flex-col gap-3">
        {isWinner && (
          <ThreeDButton variant="warning" className="w-full text-2xl" onClick={onBalloon}>
            🎈 {t.balloonHero}
          </ThreeDButton>
        )}
        
        {showLeaderboardBtn && (
          <ThreeDButton variant="primary" className="w-full py-5 text-xl bg-brand-lime" onClick={onLeaderboard}>
            🏆 {t.appName === 'SnapQuizGame' ? 'View Leaderboard' : 'لوحة الصدارة'}
          </ThreeDButton>
        )}

        <ThreeDButton variant="secondary" className="w-full py-4 opacity-80" onClick={onHome}>
          🏠 {t.home}
        </ThreeDButton>
      </div>
    </div>
  );
};

export default ResultPage;
