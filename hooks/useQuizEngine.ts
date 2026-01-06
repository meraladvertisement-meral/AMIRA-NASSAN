import { useState, useCallback, useEffect } from 'react';
import { Question, QuizResult, QuizAttempt } from '../types/quiz';

export function useQuizEngine(
  questions: Question[], 
  onComplete: (result: QuizResult) => void,
  timePerQuestion?: number // Optional timer in seconds
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [fitbMode, setFitbMode] = useState<'INPUT' | 'MCQ'>('INPUT');
  const [fitbOptions, setFitbOptions] = useState<string[]>([]);
  const [wrongShake, setWrongShake] = useState(false);
  const [attemptsLog, setAttemptsLog] = useState<QuizAttempt[]>([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion || 0);

  const currentQuestion = questions[currentIndex];

  // Timer logic
  useEffect(() => {
    if (!timePerQuestion || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isFinished, timePerQuestion]);

  // Reset timer on question change
  useEffect(() => {
    if (timePerQuestion) {
      setTimeLeft(timePerQuestion);
    }
  }, [currentIndex, timePerQuestion]);

  const handleTimeout = useCallback(() => {
    logFail();
    advance();
  }, [currentIndex, currentAttempts, currentQuestion]);

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

  const handleAnswer = useCallback(async (userAnswer: string) => {
    if (isFinished) return;

    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    if (isCorrect) {
      const pointEarned = currentAttempts === 0 ? 1 : 0.5; // Half points for second try
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
          // Switch to MCQ mode for the second attempt
          setFitbMode('MCQ');
          setCurrentAttempts(1);
          
          // Prepare options for the multiple-choice attempt
          let opts = Array.isArray(currentQuestion.options) ? [...currentQuestion.options] : [];
          
          // Ensure correct answer is in the options and case is preserved from the original if possible
          const lowerAnswer = currentQuestion.correctAnswer.toLowerCase();
          const hasAnswer = opts.some(o => o.toLowerCase() === lowerAnswer);
          
          if (!hasAnswer) {
            opts.push(currentQuestion.correctAnswer);
          }
          
          // Strictly ensure exactly 4 options by filtering duplicates and filling gaps
          const uniqueOpts = Array.from(new Set(opts.map(o => o.trim())));
          let finalOpts = uniqueOpts.slice(0, 4);

          // Fallback distractors if the AI didn't provide enough
          const fallbacks = ["Incorrect", "False", "None", "Alternative", "Other", "Maybe", "Unlikely"];
          while (finalOpts.length < 4) {
            const nextFallback = fallbacks.shift();
            if (nextFallback && !finalOpts.some(o => o.toLowerCase() === nextFallback.toLowerCase())) {
              finalOpts.push(nextFallback);
            }
          }
          
          // Final shuffle
          setFitbOptions(finalOpts.sort(() => Math.random() - 0.5));
        } else {
          logFail();
          advance();
        }
      }
    }
  }, [currentIndex, currentAttempts, questions, score, isFinished, fitbMode, currentQuestion, advance]);

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
    advance,
    timeLeft
  };
}
