
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { QuizSettings, Difficulty, QuestionType, Question } from '../types/quiz';
import { CameraModal } from '../components/camera/CameraModal';
import { ManualQuizEditor } from '../components/quiz/ManualQuizEditor';

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
  const [activeTab, setActiveTab] = useState<'text' | 'pdf' | 'image'>(initialTab);
  const [fileName, setFileName] = useState('');
  const [processing, setProcessing] = useState(false);
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

    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      if (type === 'image') {
        setContent(result);
        setProcessing(false);
      } else {
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

  if (creationMode === 'manual') {
    return (
      <div className="p-6 max-w-2xl mx-auto min-h-screen">
        <ManualQuizEditor 
          onBack={() => setCreationMode('ai')} 
          onComplete={onStartManual} 
          t={t} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 relative pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase text-brand-lime tracking-tighter">Quiz Setup</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all">
          ← {t.home}
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-inner">
        <button 
          onClick={() => setCreationMode('ai')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${creationMode === 'ai' ? 'bg-white text-brand-dark shadow-xl scale-[1.02]' : 'text-white/40 hover:text-white/60'}`}
        >
          🤖 AI Generate
        </button>
        <button 
          onClick={() => setCreationMode('manual')}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${creationMode === 'manual' ? 'bg-white text-brand-dark shadow-xl scale-[1.02]' : 'text-white/40 hover:text-white/60'}`}
        >
          ✍️ Manual Creator
        </button>
      </div>

      <GlassCard className="p-4 border-white/20">
        <div className="flex gap-2 mb-4">
          <button className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'text' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('text')}>{t.pasteText}</button>
          <button className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'pdf' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('pdf')}>{t.uploadPdf}</button>
          <button className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${activeTab === 'image' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('image')}>{t.takePhoto}</button>
        </div>

        {activeTab === 'text' ? (
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 bg-white/5 rounded-xl p-4 focus:outline-none border-2 border-transparent focus:border-brand-lime transition-all text-sm font-medium placeholder:text-white/10"
            placeholder="Paste your learning materials, notes, or paragraphs here..."
          />
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-white/50 bg-white/5 cursor-pointer hover:bg-white/10 transition-all group overflow-hidden"
          >
            {content.startsWith('data:image') && activeTab === 'image' ? (
               <img src={content} className="h-full w-full object-cover" />
            ) : (
              <>
                <p className="text-3xl mb-1 group-hover:scale-110 transition-transform">📄</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{fileName || `Tap to select ${activeTab.toUpperCase()}`}</p>
              </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept={activeTab === 'pdf' ? "application/pdf" : "image/*"} onChange={(e) => handleFileUpload(e, activeTab === 'pdf' ? 'pdf' : 'image')} />
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

      <ThreeDButton variant="primary" className="w-full py-5 text-xl" disabled={!content && activeTab === 'text'} onClick={() => onStart(content, activeTab === 'image')}>
        {t.startAi}
      </ThreeDButton>

      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={(img) => { setContent(img); setActiveTab('image'); }} t={t} />
    </div>
  );
};

export default ConfigPage;
