
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
          
          // Ensure correct answer is in the options
          if (!opts.some(o => o.toLowerCase() === currentQuestion.correctAnswer.toLowerCase())) {
            opts.push(currentQuestion.correctAnswer);
          }
          
          // Fill with fallbacks if for some reason the options are empty or too few
          if (opts.length < 2) {
            const distractors = ["Wait", "Maybe", "Possibly", "Unknown"].filter(d => d.toLowerCase() !== currentQuestion.correctAnswer.toLowerCase());
            while(opts.length < 4) opts.push(distractors.pop() || "Choice");
          }
          
          setFitbOptions(opts.sort(() => Math.random() - 0.5));
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
