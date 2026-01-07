
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { QuizSettings, Difficulty, QuestionType, Question } from '../types/quiz';
import { CameraModal } from '../components/camera/CameraModal';

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

interface ManualQuestion {
  type: QuestionType;
  text: string;
  choices: string[]; 
  correctIdx: number; 
  tfAnswer?: boolean; 
  fitbAnswer?: string; 
  error?: string;
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
  const [activeTab, setActiveTab] = useState<'text' | 'pdf' | 'image'>(initialTab);
  const [fileName, setFileName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // Manual Mode State
  const [manualStep, setManualStep] = useState<'setup' | 'edit'>('setup');
  const [manualCounts, setManualCounts] = useState({ MCQ: 5, TF: 0, FITB: 0 });
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'text') {
      localStorage.setItem('sqg_draft_content', content);
    }
  }, [content, activeTab]);

  useEffect(() => {
    localStorage.setItem('sqg_draft_settings', JSON.stringify(settings));
  }, [settings]);

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

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (type === 'image') {
        setContent(result);
        setProcessing(false);
      } else {
        setContent("Processing PDF content: " + file.name);
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

  const handleCameraCapture = (base64Image: string) => {
    setContent(base64Image);
    setActiveTab('image');
  };

  const totalManualQuestions = manualCounts.MCQ + manualCounts.TF + manualCounts.FITB;
  const isSetupValid = totalManualQuestions >= 5 && totalManualQuestions <= 20;

  const handleCreateQuestions = () => {
    const newQuestions: ManualQuestion[] = [];
    for (let i = 0; i < manualCounts.MCQ; i++) newQuestions.push({ type: 'MCQ', text: '', choices: ['', '', '', ''], correctIdx: -1 });
    for (let i = 0; i < manualCounts.TF; i++) newQuestions.push({ type: 'TF', text: '', choices: [], correctIdx: -1, tfAnswer: undefined });
    for (let i = 0; i < manualCounts.FITB; i++) newQuestions.push({ type: 'FITB', text: '', choices: [], correctIdx: -1, fitbAnswer: '' });
    setManualQuestions(newQuestions);
    setManualStep('edit');
  };

  const updateManualQuestion = (idx: number, updates: Partial<ManualQuestion>) => {
    setManualQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...updates, error: undefined } : q));
    setGlobalError(null);
  };

  const handleManualSubmit = () => {
    onStartManual(manualQuestions.map((q, i) => {
      const base = { id: `m-${Date.now()}-${i}`, type: q.type, prompt: q.text };
      if (q.type === 'MCQ') return { ...base, options: q.choices, correctAnswer: q.choices[q.correctIdx] } as Question;
      if (q.type === 'TF') return { ...base, options: ['True', 'False'], correctAnswer: q.tfAnswer ? 'True' : 'False' } as Question;
      return { ...base, options: [], correctAnswer: q.fitbAnswer! } as Question;
    }));
  };

  const updateCount = (type: keyof typeof manualCounts, delta: number) => {
    setManualCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 relative pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase text-brand-lime">{t.inputTitle}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all">
          {t.home || 'Home'}
        </button>
      </div>

      <div className="flex bg-white/10 p-1 rounded-2xl shadow-inner">
        <button onClick={() => setCreationMode('ai')} className={`flex-1 py-2 rounded-xl font-bold transition ${creationMode === 'ai' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/60'}`}>{t.aiMode}</button>
        <button onClick={() => setCreationMode('manual')} className={`flex-1 py-2 rounded-xl font-bold transition ${creationMode === 'manual' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/60'}`}>{t.manualMode}</button>
      </div>
      
      {creationMode === 'ai' ? (
        <>
          <GlassCard className="p-4 border-white/20">
            <div className="flex gap-2 mb-4">
              <button className={`flex-1 py-2 rounded-xl font-bold transition ${activeTab === 'text' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('text')}>{t.pasteText}</button>
              <button className={`flex-1 py-2 rounded-xl font-bold transition ${activeTab === 'pdf' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('pdf')}>{t.uploadPdf}</button>
              <button className={`flex-1 py-2 rounded-xl font-bold transition ${activeTab === 'image' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('image')}>{t.takePhoto}</button>
            </div>

            {activeTab === 'text' && (
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-32 bg-white/10 rounded-xl p-3 focus:outline-none border-2 border-transparent focus:border-brand-lime transition-all text-sm font-medium"
                placeholder="Paste learning material here..."
              />
            )}

            {(activeTab === 'pdf' || (activeTab === 'image' && !content.startsWith('data:image'))) && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/50 bg-white/5 cursor-pointer hover:bg-white/10 transition-all group"
              >
                <p className="text-3xl mb-1">📄</p>
                <p className="text-sm font-bold">{fileName || `Tap to Select ${activeTab === 'pdf' ? 'PDF' : 'Image'}`}</p>
                <input type="file" ref={fileInputRef} className="hidden" accept={activeTab === 'pdf' ? "application/pdf" : "image/*"} onChange={(e) => handleFileUpload(e, activeTab === 'pdf' ? 'pdf' : 'image')} />
              </div>
            )}

            {activeTab === 'image' && content.startsWith('data:image') && (
              <div className="relative h-40 w-full rounded-xl overflow-hidden group">
                <img src={content} className="w-full h-full object-cover" alt="Captured" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setContent('')} className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest">Remove</button>
                </div>
              </div>
            )}
            
            {activeTab === 'image' && !content.startsWith('data:image') && (
              <ThreeDButton variant="secondary" className="w-full mt-2 py-3 text-xs" onClick={() => setIsCameraOpen(true)}>Open Camera 📸</ThreeDButton>
            )}

            {processing && <p className="text-[10px] text-brand-lime font-black mt-2 animate-pulse uppercase tracking-widest text-center">Processing...</p>}
          </GlassCard>

          <GlassCard className="space-y-6 border-white/20">
            <div>
              <label className="block text-[10px] font-black mb-2 uppercase text-white/40 tracking-[0.2em]">{t.difficulty}</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button key={d} onClick={() => updateDifficulty(d)} className={`flex-1 py-2 rounded-xl font-bold border-2 transition ${settings.difficulty === d ? 'border-brand-lime bg-brand-lime/20 text-brand-lime' : 'border-white/10 text-white/40'}`}>{t[d]}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black mb-2 uppercase text-white/40 tracking-[0.2em] flex justify-between">
                <span>{t.questionCount}</span>
                <span className="text-brand-lime text-sm">{settings.questionCount}</span>
              </label>
              <input type="range" min="5" max="20" step="1" value={settings.questionCount} onChange={(e) => setSettings({...settings, questionCount: parseInt(e.target.value)})} className="w-full accent-brand-lime cursor-pointer" />
            </div>
          </GlassCard>

          <div className="flex flex-col gap-4">
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] text-center px-4 leading-relaxed">
              🌐 {t.languageNotice}
            </p>
            
            <ThreeDButton variant="primary" className="w-full py-5 text-xl" disabled={!content && activeTab === 'text'} onClick={() => onStart(content, activeTab === 'image')}>
              {t.startAi}
            </ThreeDButton>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {manualStep === 'setup' ? (
            <GlassCard className="space-y-8 border-white/20">
              {['MCQ', 'TF', 'FITB'].map((type) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="font-bold">{t[type.toLowerCase()] || type}</span>
                  <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                    <button onClick={() => updateCount(type as any, -1)} className="w-10 h-10 rounded-xl bg-white/10">-</button>
                    <span className="w-8 text-center font-black text-xl text-brand-lime">{manualCounts[type as keyof typeof manualCounts]}</span>
                    <button onClick={() => updateCount(type as any, 1)} className="w-10 h-10 rounded-xl bg-brand-lime text-brand-dark">+</button>
                  </div>
                </div>
              ))}
              <ThreeDButton variant="primary" className="w-full py-5 text-xl" disabled={!isSetupValid} onClick={handleCreateQuestions}>Create Questions</ThreeDButton>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              {manualQuestions.map((q, idx) => (
                <GlassCard key={idx} className="space-y-4 border-white/10">
                  <p className="text-[10px] font-black text-brand-lime">Question {idx + 1} ({q.type})</p>
                  <textarea value={q.text} onChange={(e) => updateManualQuestion(idx, { text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-brand-lime min-h-[80px]" placeholder={t.questionPlaceholder} />
                </GlassCard>
              ))}
              <ThreeDButton variant="primary" className="w-full py-5 text-xl" onClick={handleManualSubmit}>Start Quiz</ThreeDButton>
            </div>
          )}
        </div>
      )}

      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCameraCapture} t={t} />

      {globalError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white/20">
            <span className="text-sm font-bold">{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="font-black p-2">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPage;
