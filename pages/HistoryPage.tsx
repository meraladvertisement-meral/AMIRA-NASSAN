
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

  useEffect(() => {
    setHistory(historyService.getHistory());
  }, []);

  const handleClear = () => {
    historyService.clearHistory();
    setHistory([]);
  };

  const deleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    historyService.deleteRecord(id);
    setHistory(historyService.getHistory());
  };

  const handlePdfAction = (record: QuizRecord, action: 'generate' | 'download' | 'delete', e: React.MouseEvent) => {
    e.stopPropagation();
    if (action === 'generate') {
      historyService.updateRecord(record.id, { pdfGenerated: true });
      setHistory(historyService.getHistory());
    } else if (action === 'download') {
      const url = pdfService.generateExamPdf(record);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Exam-${record.id}.pdf`;
      link.click();
    } else if (action === 'delete') {
      historyService.updateRecord(record.id, { pdfGenerated: false });
      setHistory(historyService.getHistory());
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic">SnapQuizGame {t.history}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/30 font-bold uppercase italic">
          {t.noHistory}
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(record => (
            <GlassCard 
              key={record.id} 
              className="relative cursor-pointer hover:bg-white/20 transition active:scale-95"
              onClick={() => onSelectQuiz(record)}
            >
              <div className="pr-12">
                <p className="text-xs font-bold text-brand-lime uppercase mb-1">
                  {new Date(record.createdAt).toLocaleDateString()} • {record.settings.difficulty}
                </p>
                <p className="font-bold line-clamp-1">
                  {record.questions[0]?.prompt.substring(0, 50)}...
                </p>
                
                <div className="flex gap-2 mt-4">
                  {!record.pdfGenerated ? (
                    <button 
                      onClick={(e) => handlePdfAction(record, 'generate', e)}
                      className="text-[10px] bg-white/10 px-2 py-1 rounded uppercase font-bold"
                    >
                      📄 {t.generatePdf}
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => handlePdfAction(record, 'download', e)}
                        className="text-[10px] bg-brand-lime text-brand-dark px-2 py-1 rounded uppercase font-bold"
                      >
                        📥 {t.downloadPdf}
                      </button>
                      <button 
                        onClick={(e) => handlePdfAction(record, 'delete', e)}
                        className="text-[10px] bg-red-500/20 px-2 py-1 rounded uppercase font-bold"
                      >
                        🗑️ {t.deletePdf}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={(e) => deleteRecord(record.id, e)}
                className="absolute top-4 right-4 text-white/30 hover:text-red-400 p-2"
              >
                ✕
              </button>
            </GlassCard>
          ))}
          
          <ThreeDButton variant="danger" className="w-full mt-4" onClick={handleClear}>
            {t.clearHistory}
          </ThreeDButton>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
