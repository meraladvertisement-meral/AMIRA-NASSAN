
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
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6 animate-in fade-in duration-700">
      <div className="text-center">
        <h2 className="text-5xl font-black italic mb-2 text-white drop-shadow-lg">
          {isWinner ? (t.appName === 'SnapQuizGame' ? 'AMAZING!' : 'رائع!') : (t.appName === 'SnapQuizGame' ? 'GOOD TRY!' : 'محاولة جيدة!')}
        </h2>
        <p className="text-brand-lime font-bold tracking-widest uppercase animate-pulse">
          {t.appName === 'SnapQuizGame' ? 'Quiz Completed' : 'اكتمل الاختبار'}
        </p>
      </div>

      <GlassCard className="text-center py-10 border-white/20 shadow-2xl">
        <div className="text-7xl font-black mb-2 text-brand-gold drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          {Math.round(result.percentage)}%
        </div>
        <p className="text-xl font-bold text-white/70">
          {result.score} / {result.totalQuestions} {t.score}
        </p>
      </GlassCard>

      <div className="flex flex-col gap-3">
        {isWinner && (
          <ThreeDButton variant="warning" className="w-full text-2xl" onClick={onBalloon}>
            🎈 {t.balloonHero}
          </ThreeDButton>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <ThreeDButton 
            variant="primary" 
            className="w-full py-4 text-lg" 
            onClick={onLeaderboard}
            style={{ display: showLeaderboardBtn ? 'block' : 'none' }}
          >
            🏆 {t.results}
          </ThreeDButton>
          
          <ThreeDButton 
            variant="secondary" 
            className={`w-full py-4 opacity-80 ${!showLeaderboardBtn ? 'col-span-2' : ''}`} 
            onClick={onHome}
          >
            🏠 {t.home}
          </ThreeDButton>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
