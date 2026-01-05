
import React from 'react';

interface LoadingPageProps {
  t: any;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ t }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl mb-8 animate-bounce">🚀</div>
      <h2 className="text-3xl font-black italic mb-2 tracking-widest animate-pulse">
        GENERATING QUIZ...
      </h2>
      <p className="text-brand-lime font-bold uppercase tracking-widest text-sm">
        Gemini AI is reading your content
      </p>
      
      <div className="mt-12 w-64 bg-white/10 h-2 rounded-full overflow-hidden">
        <div className="h-full bg-brand-lime w-1/2 animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>

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
