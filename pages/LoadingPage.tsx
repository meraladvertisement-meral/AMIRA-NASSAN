
import React from 'react';
import { ThreeDButton } from '../components/layout/ThreeDButton';

interface LoadingPageProps {
  t: any;
  error?: string | null;
  onCancel?: () => void;
  onRetry?: () => void;
  onBack?: () => void;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ t, error, onCancel, onRetry, onBack }) => {
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="text-8xl mb-8">⚠️</div>
        <h2 className="text-2xl font-black italic mb-4 text-red-400">
          {error}
        </h2>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <ThreeDButton variant="primary" onClick={onRetry}>{t.retry}</ThreeDButton>
          <button 
            onClick={onBack}
            className="text-white/50 text-sm font-bold uppercase tracking-widest hover:text-white transition-colors py-2"
          >
            ← {t.home}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl mb-8 animate-bounce">🚀</div>
      <h2 className="text-3xl font-black italic mb-2 tracking-widest animate-pulse">
        GENERATING QUIZ...
      </h2>
      <p className="text-brand-lime font-bold uppercase tracking-widest text-sm">
        Gemini AI is reading your content
      </p>
      
      <div className="mt-12 w-64 bg-white/10 h-2 rounded-full overflow-hidden mb-12">
        <div className="h-full bg-brand-lime w-1/2 animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>

      <button 
        onClick={onCancel}
        className="glass px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-white/20"
      >
        ✕ {t.cancel}
      </button>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;
