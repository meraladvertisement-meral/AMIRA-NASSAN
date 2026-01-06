import React, { useState } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { QuizRecord } from '../types/quiz';
import { pdfService } from '../services/pdfService';
import { historyService } from '../services/historyService';
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
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const blob = await pdfService.generateExamPdf(quiz, includeAnswerKey);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SnapQuizGame-Exam-${quiz.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("PDF Download failed", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToRecords = async () => {
    try {
      setIsSaving(true);
      // Generate PDF as blob first to get a URL as requested
      const blob = await pdfService.generateExamPdf(quiz, includeAnswerKey);
      const pdfUrl = URL.createObjectURL(blob);
      
      const recordToSave: QuizRecord = {
        ...quiz,
        pdfGenerated: true,
        pdfUrl: pdfUrl,
        createdAt: Date.now()
      };
      
      historyService.saveQuiz(recordToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save to records", err);
      alert("Failed to save record.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-brand-dark/50 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col gap-6 py-8">
        <GlassCard className="text-center border-brand-lime/30">
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
          </div>
        </GlassCard>

        {/* PDF Options Box */}
        <GlassCard className="border-brand-gold/30 space-y-4">
          <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            📄 PDF Options
          </h3>
          
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
              <input 
                type="radio" 
                name="pdf_opt_ans" 
                checked={!includeAnswerKey} 
                onChange={() => setIncludeAnswerKey(false)}
                className="w-4 h-4 accent-brand-gold"
              />
              <span className="text-sm font-medium">Download PDF (No Answers)</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
              <input 
                type="radio" 
                name="pdf_opt_ans" 
                checked={includeAnswerKey} 
                onChange={() => setIncludeAnswerKey(true)}
                className="w-4 h-4 accent-brand-gold"
              />
              <span className="text-sm font-medium">Download PDF (With Answers)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <ThreeDButton 
              variant="warning" 
              className="py-3 text-sm" 
              onClick={handleDownloadPdf}
              disabled={isDownloading}
            >
              {isDownloading ? 'Generating...' : 'Download PDF Now'}
            </ThreeDButton>
            <button 
              onClick={handleSaveToRecords}
              disabled={isSaving}
              className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20 ${saveSuccess ? 'bg-green-500 text-white' : 'glass hover:bg-white/20'}`}
            >
              {saveSuccess ? '✅ Saved to Records!' : isSaving ? 'Saving...' : '📁 Save to Records'}
            </button>
          </div>
        </GlassCard>

        <button 
          onClick={onBack}
          className="text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors py-2 text-center"
        >
          ← {t.next === 'Next' ? 'Change Settings' : 'Einstellungen ändern'}
        </button>
      </div>

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