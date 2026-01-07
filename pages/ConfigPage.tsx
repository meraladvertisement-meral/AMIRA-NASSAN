
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

const ConfigPage: React.FC<ConfigPageProps> = ({ 
  settings, 
  setSettings, 
  onStart, 
  onBack, 
  t,
  initialContent,
  initialTab = 'text'
}) => {
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

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 relative pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase text-brand-lime">{t.inputTitle}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all">
          ← {t.home}
        </button>
      </div>

      <GlassCard className="p-4 border-white/20">
        <div className="flex gap-2 mb-4">
          <button className={`flex-1 py-2 rounded-xl font-bold transition ${activeTab === 'text' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('text')}>{t.pasteText}</button>
          <button className={`flex-1 py-2 rounded-xl font-bold transition ${activeTab === 'pdf' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('pdf')}>{t.uploadPdf}</button>
          <button className={`flex-1 py-2 rounded-xl font-bold transition ${activeTab === 'image' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`} onClick={() => setActiveTab('image')}>{t.takePhoto}</button>
        </div>

        {activeTab === 'text' ? (
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 bg-white/10 rounded-xl p-3 focus:outline-none border-2 border-transparent focus:border-brand-lime transition-all text-sm font-medium"
            placeholder="Paste learning material here..."
          />
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/50 bg-white/5 cursor-pointer hover:bg-white/10 transition-all group"
          >
            {content.startsWith('data:image') && activeTab === 'image' ? (
               <img src={content} className="h-full w-full object-cover rounded-xl" />
            ) : (
              <>
                <p className="text-3xl mb-1">📄</p>
                <p className="text-sm font-bold">{fileName || `Select ${activeTab.toUpperCase()}`}</p>
              </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept={activeTab === 'pdf' ? "application/pdf" : "image/*"} onChange={(e) => handleFileUpload(e, activeTab === 'pdf' ? 'pdf' : 'image')} />
          </div>
        )}
        
        {activeTab === 'image' && !content.startsWith('data:image') && (
          <ThreeDButton variant="secondary" className="w-full mt-2 py-3 text-xs" onClick={() => setIsCameraOpen(true)}>Open Camera 📸</ThreeDButton>
        )}
      </GlassCard>

      <GlassCard className="space-y-6 border-white/20">
        <div>
          <label className="block text-[10px] font-black mb-2 uppercase text-white/40 tracking-[0.2em]">{t.difficulty}</label>
          <div className="grid grid-cols-2 gap-2">
            {(['easy', 'medium', 'hard', 'mixed'] as Difficulty[]).map(d => (
              <button 
                key={d} 
                onClick={() => updateDifficulty(d)} 
                className={`py-2 rounded-xl font-bold border-2 transition ${settings.difficulty === d ? 'border-brand-lime bg-brand-lime/20 text-brand-lime' : 'border-white/10 text-white/40'}`}
              >
                {t[d] || d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black mb-2 uppercase text-white/40 tracking-[0.2em]">{t.types}</label>
          <div className="flex flex-wrap gap-2">
            {(['MCQ', 'TF', 'FITB'] as QuestionType[]).map(type => (
              <button 
                key={type} 
                onClick={() => toggleType(type)} 
                className={`flex-1 min-w-[80px] py-2 rounded-xl font-bold border-2 transition ${settings.types.includes(type) ? 'border-brand-purple bg-brand-purple/20 text-brand-purple' : 'border-white/10 text-white/40'}`}
              >
                {t[type.toLowerCase()] || type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black mb-2 uppercase text-white/40 tracking-[0.2em] flex justify-between">
            <span>{t.questionCount}</span>
            <span className="text-brand-lime text-sm font-black">{settings.questionCount}</span>
          </label>
          <input type="range" min="5" max="20" step="1" value={settings.questionCount} onChange={(e) => setSettings({...settings, questionCount: parseInt(e.target.value)})} className="w-full accent-brand-lime cursor-pointer" />
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
