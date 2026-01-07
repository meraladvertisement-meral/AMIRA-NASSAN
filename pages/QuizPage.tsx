
import React, { useState, useEffect, useCallback } from 'react';
import { QuizRecord, QuizResult, GameMode } from '../types/quiz';
import { useQuizEngine } from '../hooks/useQuizEngine';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { Timer } from '../components/quiz/Timer';
import { roomService } from '../services/roomService';
import { auth } from '../services/firebase';

interface QuizPageProps {
  quiz: QuizRecord;
  onComplete: (result: QuizResult) => void;
  onQuit: () => void;
  mode?: GameMode;
  roomId?: string;
  t: any;
  audio: any;
}

const QuizPage: React.FC<QuizPageProps> = ({ quiz, onComplete, onQuit, mode, roomId, t, audio }) => {
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

  useEffect(() => {
    audio.enableAudio();
    audio.startMusic('calm');
    return () => audio.stopMusic();
  }, [audio]);

  useEffect(() => {
    if (roomId && (mode === GameMode.TEACHER || mode === GameMode.DUEL)) {
      const uid = auth.currentUser?.uid || localStorage.getItem('sqg_guest_uid');
      if (uid) {
        roomService.updatePlayerProgress(roomId, uid, score, currentIndex, isFinished);
      }
    }
  }, [currentIndex, score, isFinished, roomId, mode]);

  const onChoice = useCallback((choice: string) => {
    if (feedback.selected) return; 

    const isCorrect = choice.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    // هل سينتقل السؤال الآن أم هناك فرصة ثانية (في حال FITB)
    const willAdvance = isCorrect || currentQuestion.type !== 'FITB' || fitbMode === 'MCQ';

    setFeedback({
      selected: choice,
      isCorrect: isCorrect,
      showCorrect: !isCorrect // دائماً أظهر الصحيحة عند الخطأ
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
      // إذا كان سيغادر السؤال، نعطيه وقت أطول لرؤية الإجابة الصحيحة
      const waitTime = willAdvance ? 1800 : 1000;
      setTimeout(() => {
        handleAnswer(choice);
        setFeedback({ selected: null, isCorrect: null, showCorrect: false });
        if (currentQuestion.type === 'FITB') setInputText('');
      }, waitTime);
    }
  }, [currentQuestion, fitbMode, handleAnswer, audio, feedback.selected]);

  const onFitbSubmit = () => {
    if (!inputText.trim()) return;
    onChoice(inputText);
  };

  const getButtonVariant = (opt: string) => {
    const isSelected = feedback.selected === opt;
    const isCorrectAnswer = opt.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    // إذا أخطأ المستخدم، نلون الإجابة الصحيحة بالأخضر
    if (feedback.showCorrect && isCorrectAnswer) return 'primary';
    
    // تلوين اختيار المستخدم
    if (isSelected) {
      return feedback.isCorrect ? 'primary' : 'danger';
    }
    
    return 'secondary';
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col justify-center gap-6 relative overflow-hidden">
      <div className="flex justify-between items-center text-white/80 font-bold uppercase tracking-widest text-sm relative z-10">
        <button onClick={onQuit} className="glass px-3 py-1.5 rounded-xl text-[10px] active:scale-95 transition-all">
          ✕ {t.home}
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] opacity-40 font-black tracking-widest">{t.appName === 'سناب كويز' ? 'السؤال' : 'Question'}</span>
          <span className="text-lg italic">{currentIndex + 1} / {quiz.questions.length}</span>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] opacity-40 font-black tracking-widest">Score</span>
           <span className="text-brand-lime font-black text-lg">{score}</span>
        </div>
      </div>

      <div className="space-y-5 relative z-10">
        {timePerQuestion !== undefined && (
          <Timer timeLeft={timeLeft} totalTime={timePerQuestion} />
        )}
        <div className="relative w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-lime/60 transition-all duration-700"
            style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <GlassCard className={`relative transition-all duration-500 z-10 ${wrongShake ? 'animate-shake border-red-500/50' : 'border-white/20'}`}>
        {feedback.selected && (
          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl font-black uppercase tracking-widest shadow-2xl animate-bounce ${
            feedback.isCorrect ? 'bg-brand-lime text-brand-dark' : 'bg-red-500 text-white'
          }`}>
            {feedback.isCorrect ? 'Correct! ✨' : 'Incorrect ✕'}
          </div>
        )}

        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center pt-6 text-white">
          {currentQuestion.prompt}
        </h2>

        <div className="grid gap-4">
          {(currentQuestion.type === 'MCQ' || currentQuestion.type === 'TF' || (currentQuestion.type === 'FITB' && fitbMode === 'MCQ')) ? (
            <div className="grid gap-4">
              {(currentQuestion.type === 'FITB' ? fitbOptions : currentQuestion.options).map((opt, i) => (
                <ThreeDButton 
                  key={i} 
                  variant={getButtonVariant(opt)}
                  className={`text-left py-5 px-6 normal-case ${feedback.selected && !getButtonVariant(opt).includes('primary') && !getButtonVariant(opt).includes('danger') ? 'opacity-30' : ''}`}
                  onClick={() => onChoice(opt)}
                  disabled={!!feedback.selected}
                >
                  <span className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 font-black text-xs">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {getButtonVariant(opt) === 'primary' && feedback.selected && <span>✓</span>}
                  </span>
                </ThreeDButton>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <input 
                autoFocus
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !feedback.selected && onFitbSubmit()}
                disabled={!!feedback.selected}
                className={`w-full bg-white/5 border-2 rounded-2xl p-6 text-xl focus:outline-none transition-all text-center font-bold ${
                  feedback.isCorrect === true ? 'border-brand-lime text-brand-lime' : 
                  feedback.isCorrect === false ? 'border-red-500 text-red-500' : 'border-white/10'
                }`}
                placeholder={t.appName === 'سناب كويز' ? "اكتب إجابتك هنا..." : "Type your answer..."}
              />
              {feedback.showCorrect && (
                <div className="text-center animate-pulse">
                  <p className="text-xs text-white/40 uppercase font-black">Correct Answer:</p>
                  <p className="text-brand-lime font-black text-lg">{currentQuestion.correctAnswer}</p>
                </div>
              )}
              <ThreeDButton onClick={onFitbSubmit} disabled={!!feedback.selected || !inputText.trim()} className="py-5">
                {t.submit}
              </ThreeDButton>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default QuizPage;
