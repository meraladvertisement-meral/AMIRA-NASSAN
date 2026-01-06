
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { firebaseService, ParticipantData } from '../services/firebaseService';
import { QuizRecord } from '../types/quiz';
import { pdfService } from '../services/pdfService';
import { historyService } from '../services/historyService';

interface TeacherLobbyPageProps {
  code: string;
  quiz: QuizRecord;
  onStart: () => void;
  onBack: () => void;
  t: any;
}

const TeacherLobbyPage: React.FC<TeacherLobbyPageProps> = ({ code, quiz, onStart, onBack, t }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);

  // PDF State aligned with ReadyPage
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const inviteLink = `${window.location.origin}${window.location.pathname}?join=${code}&mode=teacher`;

  useEffect(() => {
    const unsub = firebaseService.subscribeToParticipants(code, (parts) => {
      setParticipants(parts);
    });
    return () => unsub();
  }, [code]);

  const copy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const blob = await pdfService.generateExamPdf(quiz, includeAnswerKey);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SnapQuizGame-Teacher-Exam-${quiz.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("PDF Download failed", err);
      alert("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToRecords = async () => {
    try {
      setIsSaving(true);
      const blob = await pdfService.generateExamPdf(quiz, includeAnswerKey);
      const pdfUrl = URL.createObjectURL(blob);
      const recordToSave: QuizRecord = { ...quiz, pdfGenerated: true, pdfUrl: pdfUrl, createdAt: Date.now() };
      historyService.saveQuiz(recordToSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save record", err);
    } finally {
      setIsSaving(false);
    }
  };

  const students = participants.filter(p => p.role === 'student' && p.state === 'connected');

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 overflow-y-auto pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic">{t.teacher} Lobby</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      <GlassCard className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-white/50">{t.roomCode}</p>
            <p className="text-4xl font-black text-brand-lime tracking-widest">{code}</p>
          </div>
          <button 
            onClick={() => copy(code, 'code')}
            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition active:scale-90"
          >
            {copied === 'code' ? '✅' : '📋'}
          </button>
        </div>

        <button 
          onClick={() => copy(inviteLink, 'link')}
          className="w-full bg-white/5 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition"
        >
          {copied === 'link' ? t.copied : t.copyLink}
        </button>
      </GlassCard>

      {/* PDF Options Block - Identical to ReadyPage */}
      <GlassCard className="border-brand-gold/30 space-y-4">
        <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs flex items-center gap-2">
          📄 PDF Options
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
            <input 
              type="radio" 
              name="pdf_opt_ans_teacher" 
              checked={!includeAnswerKey} 
              onChange={() => setIncludeAnswerKey(false)}
              className="w-4 h-4 accent-brand-gold"
            />
            <span className="text-sm font-medium">Download PDF (No Answers)</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
            <input 
              type="radio" 
              name="pdf_opt_ans_teacher" 
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

      <div className="flex-1 space-y-3 min-h-[200px]">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 flex justify-between">
          <span>{t.activations || 'Students'}</span>
          <span className="text-brand-lime">{students.length}</span>
        </h3>
        
        {students.length === 0 ? (
          <div className="text-center py-8 text-white/30 italic font-bold">
            No students joined yet...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {students.map((s, i) => (
              <GlassCard key={i} className="p-3 border-brand-lime/20 flex items-center justify-between animate-in slide-in-from-right-2">
                <span className="font-bold">{s.name} #{i+1}</span>
                <span className="text-[10px] text-brand-lime font-black uppercase">Online</span>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <ThreeDButton 
          variant="primary" 
          className="w-full py-5 text-xl"
          disabled={students.length === 0}
          onClick={onStart}
        >
          Start Now ({students.length})
        </ThreeDButton>
        <p className="text-center text-[10px] text-white/40 font-bold uppercase tracking-widest">
          Clicking start will begin the quiz for everyone.
        </p>
      </div>
    </div>
  );
};

export default TeacherLobbyPage;
