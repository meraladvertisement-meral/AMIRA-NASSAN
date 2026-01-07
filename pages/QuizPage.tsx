
import React, { useState, useEffect } from 'react';
import { QuizRecord, QuizResult, GameMode } from '../types/quiz';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { Timer } from '../components/quiz/Timer';

interface QuizPageProps {
  quiz: QuizRecord;
  onComplete: (result: QuizResult) => void;
  onQuit: () => void;
  onProgress?: (index: number, score: number) => void;
  opponentProgress?: { index: number; score: number; finished: boolean };
  mode?: GameMode;
  t: any;
  audio: any;
}

const QuizPage: React.FC<QuizPageProps> = ({ quiz, onComplete, onQuit, onProgress, opponentProgress, mode, t, audio }) => {
  const isTimeMode = mode === GameMode.DUEL || mode === GameMode.TEACHER;
  const timePerQuestion = isTimeMode ? 20 : undefined;

  const {
    currentIndex,
    currentQuestion,
    handleAnswer,
    wrongShake,
    score,
    isFinished,
    fitbMode,
    fitbOptions,
    currentAttempts,
    timeLeft
  } = useQuizEngine(quiz.questions, onComplete, timePerQuestion);

  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState<{
    selected: string | null;
    isCorrect: boolean | null;
    showCorrect: boolean;
  }>({
    selected: null,
    isCorrect: null,
    showCorrect: false
  });

  // Handle Music Lifecycle specifically for this screen
  useEffect(() => {
    audio.startMusic('calm');
    return () => {
      audio.stopMusic();
    };
  }, [audio]);

  useEffect(() => {
    onProgress?.(currentIndex, score);
  }, [currentIndex, score, onProgress]);

  // Handle low time sound feedback
  useEffect(() => {
    if (timePerQuestion && timeLeft <= 5 && timeLeft > 0 && !feedback.selected) {
      // Small vibration or tick sound if we had one
    }
  }, [timeLeft, timePerQuestion, feedback.selected]);

  const onChoice = (choice: string) => {
    if (feedback.selected) return; 

    const isCorrect = choice.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    setFeedback({
      selected: choice,
      isCorrect: isCorrect,
      showCorrect: false
    });

    if (isCorrect) {
      audio.playSfx('correct');
      setTimeout(() => {
        handleAnswer(choice);
        setFeedback({ selected: null, isCorrect: null, showCorrect: false });
        setInputText('');
      }, 1000);
    } else {
      audio.playSfx('wrong');
      
      const isLastAttempt = 
        (currentQuestion.type === 'TF') || 
        (currentQuestion.type === 'MCQ' && currentAttempts >= 1) ||
        (currentQuestion.type === 'FITB' && fitbMode === 'MCQ');

      if (isLastAttempt) {
        setTimeout(() => {
          setFeedback(prev => ({ ...prev, showCorrect: true }));
          setTimeout(() => {
            handleAnswer(choice);
            setFeedback({ selected: null, isCorrect: null, showCorrect: false });
            setInputText('');
          }, 1200);
        }, 800);
      } else {
        setTimeout(() => {
          handleAnswer(choice); 
          setFeedback({ selected: null, isCorrect: null, showCorrect: false });
          if (currentQuestion.type === 'FITB') setInputText('');
        }, 1000);
      }
    }
  };

  const onFitbSubmit = () => {
    if (!inputText.trim()) return;
    onChoice(inputText);
  };

  const handleQuitRequest = () => {
    if (confirm(t.next === 'Next' ? 'Are you sure you want to quit?' : 'Bist du sicher, dass du abbrechen möchtest?')) {
      audio.stopMusic();
      onQuit();
    }
  };

  const getButtonVariant = (opt: string) => {
    const isSelected = feedback.selected === opt;
    const isCorrectAnswer = opt.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

    if ((isSelected && feedback.isCorrect) || (feedback.showCorrect && isCorrectAnswer)) return 'primary';
    if (isSelected && feedback.isCorrect === false) return 'danger';
    
    return 'secondary';
  };

  const isCritical = timePerQuestion !== undefined && (timeLeft / timePerQuestion) <= 0.25;

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col justify-center gap-6 relative">
      {isCritical && !feedback.selected && (
        <div className="fixed inset-0 pointer-events-none z-[-5] animate-pulse-fast bg-[radial-gradient(circle_at_center,transparent_30%,rgba(239,68,68,0.08)_100%)]"></div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-center text-white/80 font-bold uppercase tracking-widest text-sm relative z-10">
        <button onClick={handleQuitRequest} className="glass px-3 py-1.5 rounded-xl text-[10px] active:scale-95 transition-all border-white/10 hover:bg-white/20">
          ✕ {t.home}
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] opacity-40 font-black tracking-widest">{t.player || 'Question'}</span>
          <span className="text-lg italic">{currentIndex + 1} <span className="text-white/30 text-xs font-normal not-italic">/ {quiz.questions.length}</span></span>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] opacity-40 font-black tracking-widest">Score</span>
           <span className="text-brand-lime font-black text-lg drop-shadow-[0_0_10px_rgba(132,204,22,0.3)]">{score}</span>
        </div>
      </div>

      {/* Progress & Timers */}
      <div className="space-y-5 relative z-10">
        {timePerQuestion !== undefined && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <Timer timeLeft={timeLeft} totalTime={timePerQuestion} />
          </div>
        )}

        <div className="relative w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div 
            className="h-full bg-brand-lime/60 transition-all duration-700 ease-out"
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
        
        {opponentProgress && (
          <div className="flex items-center gap-3 glass p-3 rounded-2xl border-brand-purple/20 bg-brand-purple/5 shadow-xl animate-in fade-in duration-1000">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-brand-purple uppercase tracking-widest opacity-60">Opponent</span>
                <span className="text-[10px] font-black text-white/80 uppercase">{opponentProgress.score} pts</span>
             </div>
             <div className="flex-1 bg-black/30 h-1 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-purple transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(107,33,168,0.4)]"
                  style={{ width: `${((opponentProgress.index + (opponentProgress.finished ? 0 : 1)) / quiz.questions.length) * 100}%` }}
                ></div>
             </div>
             {opponentProgress.finished && (
               <span className="text-[8px] font-black bg-brand-purple text-white px-2 py-0.5 rounded-full uppercase animate-pulse">Done</span>
             )}
          </div>
        )}
      </div>

      {/* Question Card */}
      <GlassCard className={`relative transition-all duration-500 z-10 ${wrongShake ? 'animate-shake border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : isCritical && !feedback.selected ? 'border-red-500/20' : 'border-white/20'}`}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 glass px-4 py-1.5 rounded-full border-white/20 shadow-lg flex items-center gap-2">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">{currentQuestion.type}</span>
           {currentQuestion.type === 'FITB' && fitbMode === 'MCQ' && (
             <span className="bg-brand-purple text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(107,33,168,0.5)]">
               2nd Chance!
             </span>
           )}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center leading-tight drop-shadow-md pt-6 text-white">
          {currentQuestion.prompt}
        </h2>

        {/* Answers Area */}
        <div className="grid gap-4">
          {currentQuestion.type === 'MCQ' || currentQuestion.type === 'TF' || (currentQuestion.type === 'FITB' && fitbMode === 'MCQ') ? (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {(currentQuestion.type === 'FITB' ? fitbOptions : currentQuestion.options).map((opt, i) => (
                <ThreeDButton 
                  key={i} 
                  variant={getButtonVariant(opt)}
                  className={`text-left py-5 px-6 text-base normal-case border-brand-purple/10 group relative overflow-hidden transition-all duration-300 ${feedback.selected ? 'opacity-50' : 'hover:scale-[1.01]'}`}
                  onClick={() => onChoice(opt)}
                  disabled={!!feedback.selected}
                >
                  <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative z-10 flex items-center gap-4">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-xl font-black text-xs transition-colors ${getButtonVariant(opt) === 'primary' ? 'bg-brand-dark/20 text-brand-dark' : 'bg-white/10 text-white/40'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                  </span>
                </ThreeDButton>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="relative">
                <input 
                  autoFocus
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !feedback.selected && onFitbSubmit()}
                  disabled={!!feedback.selected}
                  className={`w-full bg-white/5 border-2 rounded-[2rem] p-6 text-xl focus:outline-none transition-all text-center placeholder:text-white/10 font-bold ${
                    feedback.isCorrect === true ? 'border-brand-lime text-brand-lime shadow-[0_0_20px_rgba(132,204,22,0.2)]' : 
                    feedback.isCorrect === false ? 'border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10 focus:border-brand-lime/50'
                  }`}
                  placeholder={t.next === 'Next' ? "Type your answer..." : "Antwort eingeben..."}
                />
                {feedback.showCorrect && (
                  <p className="text-center text-brand-lime font-black mt-3 animate-bounce uppercase tracking-widest text-[10px]">
                    Correct Answer: {currentQuestion.correctAnswer}
                  </p>
                )}
              </div>
              <ThreeDButton 
                onClick={onFitbSubmit} 
                disabled={!!feedback.selected || !inputText.trim()}
                className="py-5 shadow-lg"
              >
                {t.submit}
              </ThreeDButton>
            </div>
          )}
        </div>
      </GlassCard>

      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-purple opacity-[0.05] blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-lime opacity-[0.03] blur-[120px] pointer-events-none -z-10"></div>

      <style>{`
        @keyframes pulse-fast {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .animate-pulse-fast { animation: pulse-fast 0.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default QuizPage;
