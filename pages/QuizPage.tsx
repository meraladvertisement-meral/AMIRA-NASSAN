
import React, { useState, useEffect } from 'react';
import { QuizRecord, QuizResult } from '../types/quiz';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';

interface QuizPageProps {
  quiz: QuizRecord;
  onComplete: (result: QuizResult) => void;
  onQuit: () => void;
  onProgress?: (index: number, score: number) => void;
  opponentProgress?: { index: number; score: number; finished: boolean };
  t: any;
  audio: any;
}

const QuizPage: React.FC<QuizPageProps> = ({ quiz, onComplete, onQuit, onProgress, opponentProgress, t, audio }) => {
  const {
    currentIndex,
    currentQuestion,
    handleAnswer,
    wrongShake,
    score,
    isFinished,
    fitbMode,
    fitbOptions
  } = useQuizEngine(quiz.questions, onComplete);

  const [inputText, setInputText] = useState('');

  // Sync Progress
  useEffect(() => {
    onProgress?.(currentIndex, score);
  }, [currentIndex, score]);

  const onChoice = (choice: string) => {
    handleAnswer(choice);
    // Simple feedback logic for audio
    const isCorrect = choice.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    if (isCorrect) audio.playSfx('correct');
    else audio.playSfx('wrong');
  };

  const onFitbSubmit = () => {
    onChoice(inputText);
    setInputText('');
  };

  const handleQuitRequest = () => {
    if (confirm(t.next === 'Next' ? 'Are you sure you want to quit?' : 'Bist du sicher, dass du abbrechen möchtest?')) {
      onQuit();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col justify-center gap-6">
      <div className="flex justify-between items-center text-white/80 font-bold uppercase tracking-widest text-sm">
        <button onClick={handleQuitRequest} className="glass px-3 py-1 rounded-lg text-[10px] active:scale-95">
          ✕ {t.home}
        </button>
        <span>{t.player || 'Question'} {currentIndex + 1} / {quiz.questions.length}</span>
        <span className="text-brand-lime">Score: {score}</span>
      </div>

      <div className="space-y-2">
        {/* User Progress */}
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-brand-lime transition-all duration-300 shadow-[0_0_10px_#84cc16]"
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Opponent Progress (Duel Mode Only) */}
        {opponentProgress && (
          <div className="flex items-center gap-2">
             <span className="text-[8px] font-black text-white/40 uppercase">Opponent</span>
             <div className="flex-1 bg-white/5 h-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-purple transition-all duration-300"
                  style={{ width: `${((opponentProgress.index + (opponentProgress.finished ? 0 : 1)) / quiz.questions.length) * 100}%` }}
                ></div>
             </div>
             <span className="text-[8px] font-black text-brand-purple uppercase">S:{opponentProgress.score}</span>
          </div>
        )}
      </div>

      <GlassCard className={`relative ${wrongShake ? 'animate-shake border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-white/20'}`}>
        <h2 className="text-2xl font-bold mb-8 text-center leading-relaxed drop-shadow-sm">
          {currentQuestion.prompt}
        </h2>

        <div className="grid gap-3">
          {currentQuestion.type === 'MCQ' || currentQuestion.type === 'TF' ? (
            currentQuestion.options.map((opt, i) => (
              <ThreeDButton 
                key={i} 
                variant="secondary" 
                className="text-left py-4 text-base normal-case"
                onClick={() => onChoice(opt)}
              >
                {opt}
              </ThreeDButton>
            ))
          ) : (
            fitbMode === 'INPUT' ? (
              <div className="flex flex-col gap-4">
                <input 
                  autoFocus
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onFitbSubmit()}
                  className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-xl focus:outline-none focus:border-brand-lime transition-all text-center"
                  placeholder={t.next === 'Next' ? "Type answer..." : "Antwort eingeben..."}
                />
                <ThreeDButton onClick={onFitbSubmit} className="py-4">{t.submit}</ThreeDButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fitbOptions.map((opt, i) => (
                  <ThreeDButton 
                    key={i} 
                    variant="warning"
                    className="text-center py-4 text-base normal-case"
                    onClick={() => onChoice(opt)}
                  >
                    {opt}
                  </ThreeDButton>
                ))}
              </div>
            )
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default QuizPage;
