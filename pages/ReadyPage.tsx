
import React, { useState } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { QuizRecord } from '../types/quiz';
import { pdfService } from '../services/pdfService';
import { Modal } from '../components/layout/Modal';

interface ReadyPageProps {
  quiz: QuizRecord;
  onStart?: () => void;
  onInvite?: () => void;
  onBack: () => void;
  t: any;
  isDuel?: boolean;
  isHost?: boolean;
}

const ReadyPage: React.FC<ReadyPageProps> = ({ quiz, onStart, onInvite, onBack, t, isDuel, isHost }) => {
  const [showPreview, setShowPreview] = useState(false);

  // Added async to handle Promise<string> from pdfService
  const downloadPdf = async () => {
    const url = await pdfService.generateExamPdf(quiz, true);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Exam-${quiz.id}.pdf`;
    link.click();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-brand-dark/50">
      <GlassCard className="w-full max-sm text-center border-brand-lime/30">
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
              <>
                <ThreeDButton variant="primary" className="w-full py-5 text-xl" onClick={onInvite}>
                  {t.inviteFriend}
                </ThreeDButton>
                <button 
                  onClick={() => setShowPreview(true)}
                  className="text-xs font-bold text-white/60 uppercase tracking-widest hover:text-white transition py-2"
                >
                  👁️ {t.previewQuestions}
                </button>
              </>
            ) : (
              <div className="bg-white/10 p-6 rounded-3xl border border-white/10 shadow-inner">
                <div className="flex justify-center mb-3">
                   <div className="w-2 h-2 rounded-full bg-brand-lime animate-ping"></div>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-brand-lime">
                  {t.waitingForHost}
                </p>
              </div>
            )
          ) : (
            <ThreeDButton variant="primary" className="w-full py-5 text-xl" onClick={onStart}>
              {t.startChallenge}
            </ThreeDButton>
          )}
          
          <div className="pt-4 border-t border-white/10 mt-2 space-y-3">
            <button 
              onClick={downloadPdf}
              className="w-full py-3 glass rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
            >
              📥 {t.downloadPdf || 'Download Exam PDF'}
            </button>

            <button 
              onClick={onBack}
              className="text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors py-2"
            >
              ← {t.next === 'Next' ? 'Change Settings' : 'Einstellungen ändern'}
            </button>
          </div>
        </div>
      </GlassCard>

      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title={t.previewQuestions}>
        <div className="space-y-4 pb-6">
          {quiz.questions.slice(0, 3).map((q, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black text-brand-lime uppercase mb-1">Question {i+1}</p>
              <p className="font-bold text-sm leading-relaxed">{q.prompt}</p>
            </div>
          ))}
          {quiz.questions.length > 3 && (
            <p className="text-center text-[10px] font-black text-white/30 uppercase italic">
              + {quiz.questions.length - 3} more questions...
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ReadyPage;
