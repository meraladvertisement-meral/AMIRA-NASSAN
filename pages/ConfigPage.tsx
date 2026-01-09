
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { QuizSettings, Difficulty, QuestionType, Question, QuizRecord } from '../types/quiz';
import { CameraModal } from '../components/camera/CameraModal';
import { ManualQuizEditor } from '../components/quiz/ManualQuizEditor';
import { GeminiService } from '../services/geminiService';
import { pdfService } from '../services/pdfService';
import { historyService } from '../services/historyService';

interface ConfigPageProps {
  settings: QuizSettings;
  setSettings: (s: QuizSettings) => void;
  onStart: (content: string, isImage?: boolean) => void;
  onStartManual: (questions: Question[]) => void;
  onBack: () => void;
  t: any;
  initialContent?: string;
  initialTab?: 'text' | 'pdf' | 'image';
}

const ConfigPage: React.FC<ConfigPageProps> = ({ 
  settings, 
  setSettings, 
  onStart, 
  onStartManual,
  onBack, 
  t,
  initialContent,
  initialTab = 'text'
}) => {
  const [creationMode, setCreationMode] = useState<'ai' | 'manual'>('ai');
  const [content, setContent] = useState(() => initialContent || localStorage.getItem('sqg_draft_content') || '');
  const [title, setTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'pdf' | 'image'>(initialTab);
  const [fileName, setFileName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'text') {
      localStorage.setItem('sqg_draft_content', content);
    }
  }, [content, activeTab]);

  const updateDifficulty = (d: Difficulty) => setSettings({ ...settings, difficulty: d });
  
  const toggleType = (type: QuestionType) => {
    const newTypes = settings.types.includes(type)
      ? settings.types.filter(t => t !== type)
      : [...settings.types, type];
    if (newTypes.length > 0) setSettings({ ...settings, types: newTypes });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setProcessing(true);
    setOcrSuccess(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (type === 'image') {
        setContent(result);
        setProcessing(false);
      } else {
        // Simple PDF text extraction placeholder
        // In a real scenario, you'd use a PDF library here
        setContent("Processing PDF content from: " + file.name);
        setActiveTab('text');
        setProcessing(false);
      }
    };
    
    if (type === 'image') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleExtractText = async () => {
    if (!content.startsWith('data:image')) return;
    setOcrLoading(true);
    setOcrSuccess(false);
    try {
      const extracted = await GeminiService.getInstance().ocr(content);
      setContent(extracted);
      setOcrSuccess(true);
      setTimeout(() => {
        setActiveTab('text');
      }, 2500);
    } catch (err: any) {
      alert(t.ocrError || "Failed to extract text. Please ensure the image is clear.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleStartValidation = () => {
    if (activeTab === 'text' || activeTab === 'pdf') {
      const wordCount = content.trim().split(/\s+/).length;
      if (wordCount > 6000) {
        alert(t.wordCountError || "Content is too long! (Max 6000 words).");
        return;
      }
    }
    onStart(content, activeTab === 'image');
  };

  const handleDownloadDocPdf = async () => {
    if (!content.trim()) return;
    try {
      const blob = await pdfService.generateDocPdf(title || "Untitled Document", content);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'document'}.pdf`;
      link.click();
    } catch (err) {
      alert("PDF Error");
    }
  };

  const handleSaveDocToHistory = () => {
    if (!content.trim()) return;
    const record: QuizRecord = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      questionLanguage: 'en',
      settings: { ...settings },
      questions: [],
      source: 'document',
      sourceText: content,
      title: title || "Saved Document"
    };
    historyService.saveQuiz(record);
    alert("Saved to History! 📁");
  };

  return (
    <div className={creationMode === 'manual' ? "p-6 max-w-2xl mx-auto min-h-screen" : "p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 relative pb-24 animate-in fade-in duration-500"}>
      {creationMode === 'manual' ? (
        <ManualQuizEditor 
          onBack={() => setCreationMode('ai')} 
          onComplete={onStartManual} 
          t={t} 
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase text-brand-lime tracking-tighter">Quiz Setup</h2>
            <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all">
              ← {t.home}
            </button>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
            <button 
              onClick={() => setCreationMode('ai')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${creationMode === 'ai' ? 'bg-white text-brand-dark shadow-xl scale-[1.02]' : 'text-white/40 hover:text-white/60'}`}
            >
              🤖 AI Generate
            </button>
            <button 
              onClick={() => setCreationMode('manual')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${(creationMode as string) === 'manual' ? 'bg-white text-brand-dark shadow-xl scale-[1.02]' : 'text-white/40 hover:text-white/60'}`}
            >
              ✍️ Manual Creator
            </button>
          </div>

          <GlassCard className="p-4 border-white/20 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black uppercase text-white/30 ml-1 tracking-widest">Document Title</label>
                {content.trim() && !content.startsWith('data:image') && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDownloadDocPdf}
                      title="Download as PDF"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-gold/20 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/30 transition-all active:scale-90"
                    >
                      📄
                    </button>
                    <button 
                      onClick={handleSaveDocToHistory}
                      title="Save to History"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-lime/20 text-brand-lime border border-brand-lime/30 hover:bg-brand-lime/30 transition-all active:scale-90"
                    >
                      📁
                    </button>
                  </div>
                )}
              </div>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none border-2 border-transparent focus:border-brand-lime/30 transition-all font-bold"
                placeholder="Enter title for your PDF or Quiz..."
              />
            </div>

            <div className="flex gap-2">
              <button className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'text' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('text')}>{t.pasteText}</button>
              <button className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'pdf' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('pdf')}>{t.uploadPdf}</button>
              <button className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'image' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('image')}>{t.takePhoto}</button>
            </div>

            {activeTab === 'text' ? (
              <div className="space-y-3">
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-40 bg-white/5 rounded-xl p-4 focus:outline-none border-2 border-transparent focus:border-brand-lime transition-all text-sm font-medium placeholder:text-white/10"
                  placeholder="Paste your learning materials, notes, or paragraphs here..."
                />
                {content.trim() && (
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDownloadDocPdf}
                      className="flex-1 glass py-2 rounded-xl text-[10px] font-black uppercase text-brand-lime border-brand-lime/20 hover:bg-brand-lime/10"
                    >
                      📄 Download PDF
                    </button>
                    <button 
                      onClick={handleSaveDocToHistory}
                      className="flex-1 glass py-2 rounded-xl text-[10px] font-black uppercase text-white/60 hover:bg-white/10"
                    >
                      📁 Save Doc
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/50 bg-white/5 cursor-pointer hover:bg-white/10 transition-all group overflow-hidden"
                >
                  {content.startsWith('data:image') && activeTab === 'image' ? (
                     <img src={content} className="h-full w-full object-contain" />
                  ) : (
                    <>
                      <p className="text-3xl mb-1 group-hover:scale-110 transition-transform">📄</p>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{fileName || `Tap to select ${activeTab.toUpperCase()}`}</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept={activeTab === 'pdf' ? "application/pdf" : "image/*"} onChange={(e) => handleFileUpload(e, activeTab === 'pdf' ? 'pdf' : 'image')} />
                </div>
                
                {activeTab === 'image' && content.startsWith('data:image') && (
                  <div className="space-y-3">
                    {ocrLoading && (
                      <div className="p-4 bg-brand-lime/10 border border-brand-lime/20 rounded-xl flex items-center gap-3 animate-pulse">
                        <span className="animate-spin text-brand-lime">⌛</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-brand-lime uppercase tracking-widest">{t.ocrProcessing || "AI is analyzing image..."}</span>
                          <span className="text-[8px] font-medium text-white/40 uppercase tracking-tighter">Recognizing handwriting & structures...</span>
                        </div>
                      </div>
                    )}
                    {ocrSuccess && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <span className="text-green-500">✅</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{t.ocrSuccess || "Extracted Successfully!"}</span>
                          <span className="text-[8px] font-medium text-white/40 uppercase tracking-tighter">Heading to Text tab...</span>
                        </div>
                      </div>
                    )}
                    <ThreeDButton 
                      variant="secondary" 
                      className="w-full py-4 text-sm" 
                      onClick={handleExtractText}
                      disabled={ocrLoading}
                    >
                      {ocrLoading ? t.extractingText : t.takePhoto}
                    </ThreeDButton>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'image' && !content.startsWith('data:image') && (
              <ThreeDButton variant="secondary" className="w-full mt-2 py-3 text-[10px]" onClick={() => setIsCameraOpen(true)}>Open Camera 📸</ThreeDButton>
            )}
          </GlassCard>

          <GlassCard className="space-y-6 border-white/20">
            <div>
              <label className="block text-[9px] font-black mb-3 uppercase text-white/40 tracking-[0.3em]">{t.difficulty}</label>
              <div className="grid grid-cols-2 gap-2">
                {(['easy', 'medium', 'hard', 'mixed'] as Difficulty[]).map(d => (
                  <button 
                    key={d} 
                    onClick={() => updateDifficulty(d)} 
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${settings.difficulty === d ? 'border-brand-lime bg-brand-lime/10 text-brand-lime shadow-[0_0_15px_rgba(132,204,22,0.1)]' : 'border-white/5 text-white/20 hover:border-white/20'}`}
                  >
                    {t[d] || d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black mb-3 uppercase text-white/40 tracking-[0.3em]">{t.types}</label>
              <div className="flex flex-wrap gap-2">
                {(['MCQ', 'TF', 'FITB'] as QuestionType[]).map(type => (
                  <button 
                    key={type} 
                    onClick={() => toggleType(type)} 
                    className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${settings.types.includes(type) ? 'border-brand-purple bg-brand-purple/10 text-brand-purple shadow-[0_0_15px_rgba(107,33,168,0.1)]' : 'border-white/5 text-white/20 hover:border-white/20'}`}
                  >
                    {t[type.toLowerCase()] || type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black mb-3 uppercase text-white/40 tracking-[0.3em] flex justify-between">
                <span>{t.questionCount}</span>
                <span className="text-brand-lime font-black">{settings.questionCount}</span>
              </label>
              <input type="range" min="5" max="20" step="1" value={settings.questionCount} onChange={(e) => setSettings({...settings, questionCount: parseInt(e.target.value)})} className="w-full accent-brand-lime cursor-pointer h-1.5 bg-white/10 rounded-full appearance-none" />
            </div>
          </GlassCard>

          <ThreeDButton variant="primary" className="w-full py-5 text-xl" disabled={(!content && activeTab === 'text') || ocrLoading} onClick={handleStartValidation}>
            {t.startAi}
          </ThreeDButton>

          <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={(img) => { setContent(img); setActiveTab('image'); }} t={t} />
        </>
      )}
    </div>
  );
};

export default ConfigPage;
