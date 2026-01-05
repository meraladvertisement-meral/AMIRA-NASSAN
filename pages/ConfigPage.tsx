
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { QuizSettings, Difficulty, QuestionType, Question } from '../types/quiz';

interface ConfigPageProps {
  settings: QuizSettings;
  setSettings: (s: QuizSettings) => void;
  onStart: (content: string, isImage?: boolean) => void;
  onStartManual: (questions: Question[]) => void;
  onBack: () => void;
  t: any;
}

interface ManualQuestion {
  text: string;
  choices: string[];
  correctIdx: number;
  error?: string;
}

const ConfigPage: React.FC<ConfigPageProps> = ({ settings, setSettings, onStart, onStartManual, onBack, t }) => {
  const [creationMode, setCreationMode] = useState<'ai' | 'manual'>('ai');
  const [content, setContent] = useState(() => localStorage.getItem('sqg_draft_content') || '');
  const [activeTab, setActiveTab] = useState<'text' | 'pdf' | 'image'>('text');
  const [fileName, setFileName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  // Manual Mode State
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>(() => {
    const saved = localStorage.getItem('sqg_manual_draft');
    return saved ? JSON.parse(saved) : [
      { text: '', choices: ['', '', '', ''], correctIdx: -1 }
    ];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('sqg_draft_content', content);
  }, [content]);

  useEffect(() => {
    localStorage.setItem('sqg_draft_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sqg_manual_draft', JSON.stringify(manualQuestions));
  }, [manualQuestions]);

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
        onStart(result, true);
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

  const addManualQuestion = () => {
    if (manualQuestions.length >= 20) return;
    setManualQuestions([...manualQuestions, { text: '', choices: ['', '', '', ''], correctIdx: -1 }]);
  };

  const removeManualQuestion = (idx: number) => {
    if (manualQuestions.length <= 1) return;
    setManualQuestions(manualQuestions.filter((_, i) => i !== idx));
  };

  const updateManualQuestion = (idx: number, updates: Partial<ManualQuestion>) => {
    setManualQuestions(manualQuestions.map((q, i) => i === idx ? { ...q, ...updates, error: undefined } : q));
    setGlobalError(null);
  };

  const validateManualQuiz = (): boolean => {
    let hasError = false;
    const newQuestions = manualQuestions.map((q, i) => {
      let error = '';
      if (!q.text.trim()) error = t.next === 'Next' ? 'Question text is missing' : 'Fragetext fehlt';
      else if (q.choices.some(c => !c.trim())) error = t.next === 'Next' ? 'All 4 choices must be filled' : 'Alle 4 Optionen müssen ausgefüllt sein';
      else if (q.correctIdx === -1) error = t.next === 'Next' ? 'Select the correct answer' : 'Richtige Antwort wählen';

      if (error) {
        hasError = true;
        return { ...q, error };
      }
      return { ...q, error: undefined };
    });

    if (hasError) {
      setManualQuestions(newQuestions);
      setGlobalError(t.validateError);
      return false;
    }
    return true;
  };

  const handleManualSubmit = () => {
    try {
      if (!validateManualQuiz()) return;

      const converted: Question[] = manualQuestions.map((q, i) => ({
        id: `manual-${Date.now()}-${i}`,
        type: 'MCQ',
        prompt: q.text,
        options: q.choices,
        correctAnswer: q.choices[q.correctIdx]
      }));

      onStartManual(converted);
    } catch (err) {
      console.error("Manual submit failed", err);
      setGlobalError("Something went wrong. Please check your inputs.");
    }
  };

  const validCount = manualQuestions.filter(q => q.text.trim() && q.choices.every(c => c.trim()) && q.correctIdx !== -1).length;

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase text-brand-lime">{t.inputTitle}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold active:scale-95">
          {t.home || 'Home'}
        </button>
      </div>

      {/* Creation Mode Selector */}
      <div className="flex bg-white/10 p-1 rounded-2xl">
        <button 
          onClick={() => setCreationMode('ai')}
          className={`flex-1 py-2 rounded-xl font-bold transition ${creationMode === 'ai' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/60'}`}
        >{t.aiMode}</button>
        <button 
          onClick={() => setCreationMode('manual')}
          className={`flex-1 py-2 rounded-xl font-bold transition ${creationMode === 'manual' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/60'}`}
        >{t.manualMode}</button>
      </div>
      
      {creationMode === 'ai' ? (
        <>
          <GlassCard className="p-4">
            <div className="flex gap-2 mb-4">
              <button 
                className={`flex-1 py-2 rounded-xl font-bold transition ${activeTab === 'text' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`}
                onClick={() => setActiveTab('text')}
              >{t.pasteText}</button>
              <button 
                className={`flex-1 py-2 rounded-xl font-bold transition ${activeTab === 'pdf' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`}
                onClick={() => setActiveTab('pdf')}
              >{t.uploadPdf}</button>
              <button 
                className={`flex-1 py-2 rounded-xl font-bold transition ${activeTab === 'image' ? 'bg-white text-brand-dark shadow-md' : 'bg-white/10'}`}
                onClick={() => setActiveTab('image')}
              >{t.takePhoto}</button>
            </div>

            {activeTab === 'text' && (
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-32 bg-white/10 rounded-xl p-3 focus:outline-none border-2 border-transparent focus:border-brand-lime transition-all"
                placeholder="Paste learning material..."
              />
            )}

            {activeTab === 'pdf' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/50 bg-white/5 cursor-pointer hover:bg-white/10 transition"
              >
                <p className="text-3xl mb-1">📄</p>
                <p>{fileName || "Tap to Select PDF"}</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e, 'pdf')}
                />
              </div>
            )}

            {activeTab === 'image' && (
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-32 border-2 border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10"
                >
                  <p className="text-3xl mb-1">📸</p>
                  <p className="text-xs uppercase font-bold">Camera</p>
                  <input 
                    type="file" 
                    ref={cameraInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    capture="environment"
                    onChange={(e) => handleFileUpload(e, 'image')}
                  />
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-32 border-2 border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10"
                >
                  <p className="text-3xl mb-1">🖼️</p>
                  <p className="text-xs uppercase font-bold">Gallery</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                  />
                </button>
              </div>
            )}
            
            {processing && (
              <p className="text-[10px] text-brand-lime font-bold mt-2 animate-pulse uppercase">Processing File...</p>
            )}
          </GlassCard>

          <GlassCard className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 uppercase text-white/50">{t.difficulty}</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                  <button 
                    key={d}
                    onClick={() => updateDifficulty(d)}
                    className={`flex-1 py-2 rounded-xl font-bold border-2 transition-all ${settings.difficulty === d ? 'border-brand-lime bg-brand-lime/20 text-brand-lime' : 'border-white/10'}`}
                  >{t[d]}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase text-white/50">{t.types}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['MCQ', 'TF', 'FITB'] as QuestionType[]).map(type => (
                  <button 
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`py-2 rounded-xl font-bold border-2 transition-all ${settings.types.includes(type) ? 'border-brand-purple bg-brand-purple/20' : 'border-white/10'}`}
                  >{type}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase text-white/50">{t.questionCount}: {settings.questionCount}</label>
              <input 
                type="range" min="5" max="20" step="1"
                value={settings.questionCount}
                onChange={(e) => setSettings({...settings, questionCount: parseInt(e.target.value)})}
                className="w-full accent-brand-lime cursor-pointer"
              />
            </div>
          </GlassCard>

          <ThreeDButton 
            variant="primary" 
            className="w-full" 
            disabled={!content && activeTab === 'text'}
            onClick={() => onStart(content)}
          >
            {t.startAi}
          </ThreeDButton>
        </>
      ) : (
        <div className="space-y-6 pb-24">
          <div className="sticky top-0 z-10 py-2">
             <div className="bg-brand-dark/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-xl">
                <span className="text-white font-bold">{t.questionCount}: {manualQuestions.length} / 20</span>
                <span className={`font-black text-sm px-3 py-1 rounded-full ${validCount === manualQuestions.length ? 'bg-brand-lime/20 text-brand-lime' : 'bg-brand-gold/20 text-brand-gold'}`}>
                  {validCount} {t.next === 'Next' ? 'Ready' : 'Bereit'}
                </span>
             </div>
          </div>

          {manualQuestions.map((q, qIdx) => (
            <GlassCard key={qIdx} className={`space-y-4 transition-all border-2 ${q.error ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10'}`}>
              <div className="flex justify-between items-center">
                <span className="text-brand-lime font-black"># {qIdx + 1}</span>
                <button 
                  onClick={() => removeManualQuestion(qIdx)}
                  className="text-red-400 text-xs font-bold uppercase tracking-widest hover:text-red-300 p-2"
                >
                  {t.removeQuestion}
                </button>
              </div>
              
              {q.error && (
                <p className="text-red-400 text-xs font-bold animate-pulse uppercase tracking-tight">
                  ⚠️ {q.error}
                </p>
              )}

              <textarea 
                value={q.text}
                onChange={(e) => updateManualQuestion(qIdx, { text: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-brand-lime min-h-[80px] text-sm"
                placeholder={t.questionPlaceholder}
              />
              <div className="grid grid-cols-1 gap-2">
                {q.choices.map((choice, cIdx) => (
                  <div key={cIdx} className="flex gap-2">
                    <input 
                      type="text"
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...q.choices];
                        newChoices[cIdx] = e.target.value;
                        updateManualQuestion(qIdx, { choices: newChoices });
                      }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-lime"
                      placeholder={`${t.choicePlaceholder} ${String.fromCharCode(65 + cIdx)}`}
                    />
                    <button 
                      onClick={() => updateManualQuestion(qIdx, { correctIdx: cIdx })}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${q.correctIdx === cIdx ? 'bg-brand-lime text-brand-dark shadow-[0_0_10px_#84cc16]' : 'bg-white/10 text-white/50'}`}
                    >
                      {t.correctLabel}
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
          
          <button 
            onClick={addManualQuestion}
            className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-white/50 font-bold hover:bg-white/5 hover:border-white/40 transition"
          >
            + {t.addQuestion}
          </button>

          <ThreeDButton 
            variant="primary" 
            className="w-full py-5 text-xl" 
            onClick={handleManualSubmit}
          >
            {t.manualStart}
          </ThreeDButton>
        </div>
      )}

      {globalError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
          <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white/20 animate-bounce-short">
            <span className="text-sm font-bold">{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="font-black p-2">✕</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
        .animate-bounce-short {
          animation: bounce-short 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ConfigPage;
