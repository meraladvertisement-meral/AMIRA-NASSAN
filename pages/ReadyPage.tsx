
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
      // Wait a moment before revoking to ensure download starts
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
      // We generate the PDF to ensure it's ready for the history record
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black italic tracking-tighter">{t.ready}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all">
          ← {t.cancel}
        </button>
      </div>

      <GlassCard className="text-center space-y-8 py-10 relative overflow-hidden border-white/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-lime/50 to-transparent"></div>
        
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.4em]">{t.difficulty}</p>
          <p className="text-3xl font-black text-brand-lime uppercase tracking-widest drop-shadow-sm">
            {quiz.settings.difficulty}
          </p>
        </div>

        <div className="py-8 border-y border-white/5 relative">
          <p className="text-[10px] uppercase font-black text-white/30 tracking-[0.4em] mb-2">{t.questionCount}</p>
          <p className="text-7xl font-black italic text-white drop-shadow-xl">
            {quiz.questions.length}
          </p>
          <div className="absolute inset-0 bg-brand-lime/5 blur-3xl rounded-full -z-10"></div>
        </div>

        <div className="space-y-4 px-4">
          <ThreeDButton variant="primary" className="w-full py-6 text-2xl shadow-xl" onClick={onStart}>
            {t.startChallenge}
          </ThreeDButton>
          
          <button 
            onClick={() => setShowPreview(true)}
            className="w-full text-white/40 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors py-2 active:scale-95"
          >
            {t.previewQuestions}
          </button>
        </div>
      </GlassCard>

      {/* PDF Export Section */}
      <GlassCard className="border-brand-gold/30 space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center text-xl shadow-inner">📄</div>
           <h3 className="text-brand-gold font-black uppercase tracking-[0.2em] text-sm">
             {t.generatePdf || "PDF Export"}
           </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <label className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${!includeAnswerKey ? 'bg-white/10 border-brand-gold/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!includeAnswerKey ? 'border-brand-gold' : 'border-white/30'}`}>
              {!includeAnswerKey && <div className="w-2.5 h-2.5 rounded-full bg-brand-gold"></div>}
            </div>
            <input 
              type="radio" 
              className="hidden" 
              checked={!includeAnswerKey} 
              onChange={() => setIncludeAnswerKey(false)} 
            />
            <span className="text-sm font-bold tracking-tight">Download PDF (No Answers)</span>
          </label>

          <label className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${includeAnswerKey ? 'bg-white/10 border-brand-gold/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${includeAnswerKey ? 'border-brand-gold' : 'border-white/30'}`}>
              {includeAnswerKey && <div className="w-2.5 h-2.5 rounded-full bg-brand-gold"></div>}
            </div>
            <input 
              type="radio" 
              className="hidden" 
              checked={includeAnswerKey} 
              onChange={() => setIncludeAnswerKey(true)} 
            />
            <span className="text-sm font-bold tracking-tight">Download PDF (With Answers)</span>
          </label>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <ThreeDButton 
            variant="warning" 
            className="w-full py-4 text-sm" 
            onClick={handleDownloadPdf}
            disabled={isDownloading}
          >
            {isDownloading ? 'Generating...' : 'Download PDF Now'}
          </ThreeDButton>
          
          <button 
            onClick={handleSaveToRecords}
            disabled={isSaving}
            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-lg ${
              saveSuccess 
                ? 'bg-green-500 text-white border-green-400' 
                : 'glass border-white/10 hover:bg-white/20 text-white/70'
            }`}
          >
            {saveSuccess ? '✅ Saved Successfully!' : isSaving ? 'Saving...' : '📁 Save to Records'}
          </button>
        </div>
      </GlassCard>

      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title={t.previewQuestions}>
        <div className="space-y-4 py-2">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="p-5 bg-white/5 rounded-3xl border border-white/10 group hover:border-brand-lime/30 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">Question {i + 1}</span>
                <span className="text-[8px] font-black bg-white/10 px-2 py-0.5 rounded-full uppercase text-white/40">{q.type}</span>
              </div>
              <p className="text-sm font-bold leading-relaxed text-white/90">{q.prompt}</p>
              {q.options && q.options.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {q.options.map((opt, idx) => (
                    <div key={idx} className="text-[10px] font-medium text-white/40 bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                      {String.fromCharCode(65 + idx)}) {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ReadyPage;
