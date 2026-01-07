
import React, { useState } from 'react';
import { Question, QuestionType } from '../../types/quiz';
import { GlassCard } from '../layout/GlassCard';
import { ThreeDButton } from '../layout/ThreeDButton';

interface ManualQuizEditorProps {
  onComplete: (questions: Question[]) => void;
  onBack: () => void;
  t: any;
}

export const ManualQuizEditor: React.FC<ManualQuizEditorProps> = ({ onComplete, onBack, t }) => {
  const [questions, setQuestions] = useState<Partial<Question>[]>([
    { id: '1', type: 'MCQ', prompt: '', options: ['', '', '', ''], correctAnswer: '' }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { 
      id: Math.random().toString(36).substr(2, 9), 
      type: 'MCQ', 
      prompt: '', 
      options: ['', '', '', ''], 
      correctAnswer: '' 
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], ...updates };
    setQuestions(newQs);
  };

  const validate = () => {
    for (const q of questions) {
      if (!q.prompt?.trim()) return false;
      if (!q.correctAnswer?.trim()) return false;
      if (q.type === 'MCQ' && (q.options?.some(opt => !opt.trim()) || !q.options?.includes(q.correctAnswer))) return false;
      if (q.type === 'FITB' && !q.prompt?.includes('_______')) return false;
    }
    return questions.length > 0;
  };

  const handleFinish = () => {
    if (validate()) {
      onComplete(questions as Question[]);
    } else {
      alert(t.validateError || "Please ensure all fields are filled correctly.");
    }
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-brand-dark/40 p-4 rounded-2xl backdrop-blur-md border border-white/10 sticky top-0 z-20">
        <h2 className="text-xl font-black text-brand-lime uppercase tracking-tighter">Manual Quiz Creator</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors">✕ {t.cancel}</button>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <GlassCard key={q.id} className="relative border-white/10 group overflow-visible">
            <button 
              onClick={() => removeQuestion(i)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full font-bold shadow-2xl z-10 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
            >✕</button>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
              {(['MCQ', 'TF', 'FITB'] as QuestionType[]).map(type => (
                <button
                  key={type}
                  onClick={() => updateQuestion(i, { 
                    type, 
                    options: type === 'MCQ' ? ['', '', '', ''] : (type === 'TF' ? ['True', 'False'] : ['', '', '']), 
                    correctAnswer: '' 
                  })}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${q.type === type ? 'bg-brand-lime text-brand-dark shadow-lg shadow-brand-lime/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-white/30 ml-1">Question Text</label>
                <textarea
                  placeholder={q.type === 'FITB' ? "Example: The sky is _______ color. (Must include _______)" : "Enter your question here..."}
                  value={q.prompt}
                  onChange={(e) => updateQuestion(i, { prompt: e.target.value })}
                  className="w-full bg-black/40 rounded-2xl p-4 text-sm focus:outline-none border-2 border-white/5 focus:border-brand-lime/50 transition-all min-h-[100px]"
                />
              </div>

              {q.type === 'MCQ' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options?.map((opt, optIdx) => (
                    <div key={optIdx} className="relative group/opt">
                      <input
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(q.options || [])];
                          newOpts[optIdx] = e.target.value;
                          updateQuestion(i, { options: newOpts });
                        }}
                        className={`w-full bg-white/5 p-4 rounded-xl text-xs pr-12 transition-all border-2 ${q.correctAnswer === opt && opt !== '' ? 'border-brand-lime bg-brand-lime/5' : 'border-transparent'}`}
                      />
                      <button 
                        onClick={() => updateQuestion(i, { correctAnswer: opt })}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${q.correctAnswer === opt && opt !== '' ? 'bg-brand-lime text-brand-dark' : 'bg-white/10 text-white/20 hover:text-white/60'}`}
                      >
                        {q.correctAnswer === opt && opt !== '' ? '✓' : '○'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'TF' && (
                <div className="flex gap-3">
                  {['True', 'False'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateQuestion(i, { correctAnswer: opt })}
                      className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest border-2 transition-all ${q.correctAnswer === opt ? 'bg-brand-lime text-brand-dark border-brand-lime shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'FITB' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-brand-lime/60 ml-1 tracking-widest">Correct Missing Word</label>
                    <input
                      placeholder="e.g. Blue"
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(i, { correctAnswer: e.target.value })}
                      className="w-full bg-brand-lime/10 border-2 border-brand-lime/30 rounded-2xl p-4 text-sm focus:outline-none text-brand-lime font-black uppercase tracking-wider"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {q.options?.slice(0, 3).map((opt, optIdx) => (
                      <input
                        key={optIdx}
                        placeholder={`Distractor ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...(q.options || [])];
                          newOpts[optIdx] = e.target.value;
                          updateQuestion(i, { options: newOpts });
                        }}
                        className="bg-white/5 p-3 rounded-xl text-[10px] border border-white/5 focus:border-white/20 outline-none"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      <button 
        onClick={addQuestion}
        className="w-full py-8 border-4 border-dashed border-white/10 rounded-[2rem] text-white/20 font-black uppercase tracking-[0.3em] hover:bg-white/5 hover:border-white/20 hover:text-white/40 transition-all active:scale-95"
      >
        + Add Another Question
      </button>

      <div className="fixed bottom-0 left-0 w-full p-6 bg-brand-dark/80 backdrop-blur-2xl border-t border-white/10 z-40 flex justify-center">
        <ThreeDButton 
          variant="primary" 
          className="w-full max-w-md py-5 text-xl" 
          onClick={handleFinish}
          disabled={questions.length === 0}
        >
          {t.manualStart} ({questions.length})
        </ThreeDButton>
      </div>
    </div>
  );
};
