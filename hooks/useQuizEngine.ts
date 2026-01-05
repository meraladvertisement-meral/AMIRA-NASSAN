
import { useState, useCallback } from 'react';
import { Question, QuizResult, QuizAttempt } from '../types/quiz';

export function useQuizEngine(questions: Question[], onComplete: (result: QuizResult) => void) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [fitbMode, setFitbMode] = useState<'INPUT' | 'MCQ'>('INPUT');
  const [fitbOptions, setFitbOptions] = useState<string[]>([]);
  const [wrongShake, setWrongShake] = useState(false);
  const [attemptsLog, setAttemptsLog] = useState<QuizAttempt[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback(async (userAnswer: string) => {
    if (isFinished) return;

    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    if (isCorrect) {
      const pointEarned = currentAttempts === 0 ? 1 : 0;
      const newScore = score + pointEarned;
      
      const attempt: QuizAttempt = {
        questionId: currentQuestion.id,
        attempts: currentAttempts + 1,
        isCorrect: true,
        score: pointEarned
      };
      
      setScore(newScore);
      setAttemptsLog(prev => [...prev, attempt]);
      advance();
    } else {
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 500);

      if (currentQuestion.type === 'MCQ') {
        if (currentAttempts === 0) {
          setCurrentAttempts(1);
        } else {
          logFail();
          advance();
        }
      } else if (currentQuestion.type === 'TF') {
        logFail();
        advance();
      } else if (currentQuestion.type === 'FITB') {
        if (fitbMode === 'INPUT') {
          setFitbMode('MCQ');
          setCurrentAttempts(1);
          // Use precomputed options from the generation phase (Instant)
          const opts = [...(currentQuestion.options || [])];
          if (opts.length === 0) {
            // Fallback for safety
            opts.push(currentQuestion.correctAnswer, "Option A", "Option B", "Option C");
          }
          setFitbOptions(opts.sort(() => Math.random() - 0.5));
        } else {
          logFail();
          advance();
        }
      }
    }
  }, [currentIndex, currentAttempts, questions, score, isFinished, fitbMode, currentQuestion]);

  const logFail = () => {
    const attempt: QuizAttempt = {
      questionId: currentQuestion.id,
      attempts: currentAttempts + 1,
      isCorrect: false,
      score: 0
    };
    setAttemptsLog(prev => [...prev, attempt]);
  };

  const advance = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAttempts(0);
      setFitbMode('INPUT');
      setFitbOptions([]);
    } else {
      setIsFinished(true);
      const finalResult: QuizResult = {
        score: score,
        totalQuestions: questions.length,
        percentage: (score / questions.length) * 100,
        attempts: attemptsLog
      };
      onComplete(finalResult);
    }
  };

  return {
    currentIndex,
    currentQuestion,
    handleAnswer,
    wrongShake,
    score,
    isFinished,
    fitbMode,
    fitbOptions,
    currentAttempts,
    advance
  };
}
