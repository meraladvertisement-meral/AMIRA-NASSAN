
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { firebaseService, ParticipantData } from '../services/firebaseService';
import { QuizRecord } from '../types/quiz';
import { pdfService } from '../services/pdfService';
import { historyService } from '../services/historyService';

interface DuelLobbyPageProps {
  code: string;
  joined: boolean;
  quiz: QuizRecord;
  onStart: () => void;
  onBack: () => void;
  t: any;
}

const DuelLobbyPage: React.FC<DuelLobbyPageProps> = ({ code, joined, quiz, onStart, onBack, t }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  
  // PDF State aligned with ReadyPage
  const [includeAnswerKey, setIncludeAnswerKey] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const inviteLink = `${window.location.origin}${window.location.pathname}?join=${code}&mode=duel`;

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
      link.download = `SnapQuizGame-Duel-Exam-${quiz.id}.pdf`;
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

  const opponent = participants.find(p => p.role === 'guest' && p.state === 'connected');

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6 pb-12 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic">{t.duel} Lobby</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition">←</button>
      </div>

      <GlassCard className="text-center space-y-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <p className="text-xs uppercase font-bold text-white/50 mb-2 tracking-[0.2em]">{t.roomCode}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-5xl font-black text-brand-lime tracking-[0.3em]">{code}</span>
            <button 
              onClick={() => copy(code, 'code')}
              className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition active:scale-90 shadow-lg"
            >
              {copied === 'code' ? '✅' : '📋'}
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-4 rounded-3xl border border-white/10 transition-all hover:bg-white/10 group">
          <p className="text-[10px] uppercase font-black text-white/40 mb-2 tracking-widest">{t.copyLink}</p>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={inviteLink} 
              className="flex-1 bg-transparent text-[10px] text-white/60 font-mono outline-none truncate"
            />
            <button 
              onClick={() => copy(inviteLink, 'link')}
              className="text-[10px] font-black text-brand-lime uppercase tracking-widest group-hover:scale-105 transition"
            >
              {copied === 'link' ? t.copied : t.copyLink}
            </button>
          </div>
        </div>

        <div className="py-4 border-t border-white/10">
          {opponent ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
              <div className="flex items-center gap-3 bg-brand-lime/10 px-6 py-3 rounded-full border border-brand-lime/20 shadow-[0_0_20px_rgba(132,204,22,0.1)]">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-lime opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-lime"></span>
                </span>
                <span className="text-brand-lime font-black uppercase tracking-widest text-sm">
                  {t.opponentConnected}
                </span>
              </div>
              <ThreeDButton variant="primary" className="w-full py-5 text-xl" onClick={onStart}>
                Start Battle!
              </ThreeDButton>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-8 h-8 border-4 border-white/10 border-t-brand-lime rounded-full animate-spin"></div>
              <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">
                {t.waitingForOpponent}
              </p>
            </div>
          )}
        </div>
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
              name="pdf_opt_ans_duel" 
              checked={!includeAnswerKey} 
              onChange={() => setIncludeAnswerKey(false)}
              className="w-4 h-4 accent-brand-gold"
            />
            <span className="text-sm font-medium">Download PDF (No Answers)</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition">
            <input 
              type="radio" 
              name="pdf_opt_ans_duel" 
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

      <div className="text-center">
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
          The game starts when you press "Start Battle".<br/>Opponents join automatically via your link.
        </p>
      </div>
    </div>
  );
};

export default DuelLobbyPage;
