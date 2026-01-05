
import React from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { QuizRecord } from '../types/quiz';
import { pdfService } from '../services/pdfService';

interface ReadyPageProps {
  quiz: QuizRecord;
  onStart?: () => void;
  onBack: () => void;
  t: any;
  isDuel?: boolean;
  isHost?: boolean;
}

const ReadyPage: React.FC<ReadyPageProps> = ({ quiz, onStart, onBack, t, isDuel, isHost }) => {
  const downloadPdf = () => {
    const url = pdfService.generateExamPdf(quiz, true);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Exam-${quiz.id}.pdf`;
    link.click();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-brand-dark/50">
      <GlassCard className="w-full max-w-sm text-center border-brand-lime/30">
        <div className="text-6xl mb-4 drop-shadow-xl animate-float">✨</div>
        <h2 className="text-4xl font-black italic mb-2 tracking-tighter">{t.ready}</h2>
        <div className="my-6 space-y-2 text-white/70">
          <p className="font-bold text-xl text-white">{quiz.questions.length} {t.questionCount}</p>
          <p className="text-sm uppercase tracking-widest bg-white/10 py-2 rounded-xl font-black border border-white/10">
            {t[quiz.settings.difficulty] || quiz.settings.difficulty} {t.difficulty}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {isDuel ? (
            isHost ? (
              <ThreeDButton variant="primary" className="w-full py-5 text-xl" onClick={onStart}>
                Start Battle!
              </ThreeDButton>
            ) : (
              <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                <p className="text-sm font-bold animate-pulse uppercase tracking-widest text-brand-lime">
                  {t.waitingForHost}
                </p>
              </div>
            )
          ) : (
            <ThreeDButton variant="primary" className="w-full py-5 text-xl" onClick={onStart}>
              {t.startChallenge}
            </ThreeDButton>
          )}
          
          <button 
            onClick={downloadPdf}
            className="w-full py-3 glass rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
          >
            📥 {t.downloadPdf || 'Download Exam PDF'}
          </button>

          <button 
            onClick={onBack}
            className="text-white/50 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors py-2"
          >
            ← {isDuel ? t.home : (t.next === 'Next' ? 'Change Settings' : 'Einstellungen ändern')}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ReadyPage;
