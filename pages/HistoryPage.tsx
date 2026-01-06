
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { historyService } from '../services/historyService';
import { pdfService } from '../services/pdfService';
import { QuizRecord } from '../types/quiz';

interface HistoryPageProps {
  onSelectQuiz: (quiz: QuizRecord) => void;
  onBack: () => void;
  t: any;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectQuiz, onBack, t }) => {
  const [history, setHistory] = useState<QuizRecord[]>([]);

  const refreshHistory = () => {
    setHistory(historyService.getHistory());
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleClear = () => {
    if (confirm(t.clearHistory + '?')) {
      historyService.clearHistory();
      setHistory([]);
    }
  };

  const deleteRecord = (id: string, e: React.MouseEvent) => {
    // CRITICAL: Stop the event from reaching the GlassCard's onClick
    e.stopPropagation();
    e.preventDefault();
    
    if (confirm(t.appName === 'SnapQuizGame' ? 'Delete this quiz?' : 'Dieses Quiz löschen?')) {
      historyService.deleteRecord(id);
      refreshHistory();
    }
  };

  const handlePdfAction = async (record: QuizRecord, action: 'generate' | 'download' | 'delete', e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (action === 'generate') {
      try {
        const blob = await pdfService.generateExamPdf(record);
        const url = URL.createObjectURL(blob);
        historyService.updateRecord(record.id, { pdfGenerated: true, pdfUrl: url });
        refreshHistory();
      } catch (err) {
        console.error("PDF generation failed", err);
      }
    } else if (action === 'download') {
      let downloadUrl = record.pdfUrl;
      if (!downloadUrl) {
        try {
          const blob = await pdfService.generateExamPdf(record);
          downloadUrl = URL.createObjectURL(blob);
          historyService.updateRecord(record.id, { pdfUrl: downloadUrl });
        } catch (err) { return; }
      }
      const link = document.createElement('a');
      link.href = downloadUrl!;
      link.download = `SnapQuiz-${record.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (action === 'delete') {
      historyService.updateRecord(record.id, { pdfGenerated: false, pdfUrl: undefined });
      refreshHistory();
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic tracking-tighter">SnapQuiz {t.history}</h2>
        <button onClick={onBack} className="glass w-12 h-12 flex items-center justify-center rounded-2xl text-xl active:scale-90 transition shadow-lg">←</button>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4">
          <span className="text-6xl">📁</span>
          <p className="font-black uppercase tracking-[0.3em] text-xs">{t.noHistory}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(record => (
            <GlassCard 
              key={record.id} 
              className="relative cursor-pointer hover:bg-white/20 transition-all active:scale-[0.98] border-white/10"
              onClick={() => onSelectQuiz(record)}
            >
              {/* Deletion Button - Higher Z-Index and clear hit area */}
              <button 
                type="button"
                onClick={(e) => deleteRecord(record.id, e)}
                className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-white/40 hover:bg-red-500 hover:text-white transition-all z-50 pointer-events-auto shadow-sm"
                title="Delete Record"
              >
                <span className="text-lg font-bold">✕</span>
              </button>

              <div className="pr-12">
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-[10px] font-black text-brand-lime bg-brand-lime/10 px-2 py-0.5 rounded uppercase">
                     {record.settings.difficulty}
                   </span>
                   <span className="text-[10px] font-bold text-white/40">
                     {new Date(record.createdAt).toLocaleDateString()}
                   </span>
                </div>
                
                <p className="font-bold line-clamp-2 text-sm leading-relaxed mb-4">
                  {record.questions[0]?.prompt || "Quiz Content"}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {!record.pdfGenerated ? (
                    <button 
                      onClick={(e) => handlePdfAction(record, 'generate', e)}
                      className="text-[9px] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg uppercase font-black transition"
                    >
                      📄 {t.generatePdf}
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => handlePdfAction(record, 'download', e)}
                        className="text-[9px] bg-brand-lime text-brand-dark px-3 py-1.5 rounded-lg uppercase font-black transition shadow-lg"
                      >
                        📥 {t.downloadPdf}
                      </button>
                      <button 
                        onClick={(e) => handlePdfAction(record, 'delete', e)}
                        className="text-[9px] bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg uppercase font-black transition"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
          
          <ThreeDButton variant="danger" className="w-full mt-6 py-4" onClick={handleClear}>
            {t.clearHistory}
          </ThreeDButton>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
