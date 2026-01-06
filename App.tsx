import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppScreen, GameMode, QuizSettings, QuizRecord, QuizResult, Question } from './types/quiz';
import { Language, translations } from './i18n';
import { useAudio } from './hooks/useAudio';
import { GeminiService } from './services/geminiService';
import { historyService } from './services/historyService';
import { firebaseService } from './services/firebaseService';
import { auth, googleProvider } from './services/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ConfigPage from './pages/ConfigPage';
import LoadingPage from './pages/LoadingPage';
import ReadyPage from './pages/ReadyPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import BalloonGame from './pages/BalloonGame';
import HistoryPage from './pages/HistoryPage';
import PricingPage from './pages/PricingPage';
import AffiliatePage from './pages/AffiliatePage';
import InfoCenterPage from './info_center/InfoCenterPage';
import DuelLobbyPage from './pages/DuelLobbyPage';
import DuelJoinPage from './pages/DuelJoinPage';
import TeacherLobbyPage from './pages/TeacherLobbyPage';

const ADMIN_EMAILS = ["meral.advertisement@gmail.com"];

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('LANDING');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('sqg_ui_lang') as Language) || 'en');
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<{ title: string; message: string; code: string } | null>(null);

  // Game Logic State
  const [mode, setMode] = useState<GameMode>(GameMode.SOLO);
  const [settings, setSettings] = useState<QuizSettings>({
    difficulty: 'medium',
    questionCount: 10,
    types: ['MCQ'],
    durationMinutes: 10
  });
  const [quiz, setQuiz] = useState<QuizRecord | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');
  
  const audio = useAudio();
  const t = useMemo(() => translations[lang], [lang]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isAdmin = useMemo(() => {
    return user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  }, [user]);

  // Mandatory Authentication Flow & Path Protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);

      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      
      // Define path patterns
      const isJoinPath = path === '/join' || params.has('join') || params.has('code');
      const isPlayPath = path.startsWith('/play');
      const isProtected = ['/play', '/teacher', '/admin', '/config', '/history'].some(p => path.startsWith(p)) || path === '/';

      if (!u) {
        // If not logged in and trying to access protected content
        setScreen('LANDING');
        if (isProtected && path !== '/') {
          localStorage.setItem('auth_redirect', window.location.href);
        }
      } else {
        // User is authenticated
        // 1. Handle Deep Linking from Query Params (Priority)
        const joinCode = params.get('join') || params.get('code');
        const m = params.get('mode');

        if (joinCode) {
          setRoomCode(joinCode.toUpperCase());
          if (m === 'teacher') setMode(GameMode.TEACHER);
          else setMode(GameMode.DUEL);
          setScreen('JOIN_ROOM');
          return;
        }

        // 2. Handle Path-based navigation (for SPA safety)
        if (path === '/join') {
          setScreen('JOIN_ROOM');
        } else if (isPlayPath) {
          setScreen('HOME');
        } else if (screen === 'LANDING') {
          setScreen('HOME');
        }
      }
    });
    return () => unsubscribe();
  }, [screen]);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      // Use Firebase Auth with Google
      await signInWithPopup(auth, googleProvider);
      
      const redirect = localStorage.getItem('auth_redirect');
      if (redirect) {
        localStorage.removeItem('auth_redirect');
        window.location.href = redirect; 
      } else {
        setScreen('HOME');
      }
    } catch (e: any) {
      console.error("Login Error:", e);
      // Specific handling for Unauthorized Domain error
      if (e.code === 'auth/unauthorized-domain') {
        setAuthError({
          title: "Domain Authorization Required",
          message: `Your current domain (${window.location.hostname}) is not authorized in the Firebase Console. To fix this, log in to Firebase, go to "Authentication" -> "Settings" -> "Authorized Domains", and add "${window.location.hostname}".`,
          code: e.code
        });
      } else if (e.code !== 'auth/popup-closed-by-user') {
        setAuthError({
          title: "Login Failed",
          message: e.message || "An unexpected authentication error occurred.",
          code: e.code || "unknown"
        });
      }
    }
  };

  const handleStartQuiz = async (content: string, isImage: boolean = false) => {
    if (!user) {
      setScreen('LANDING');
      return;
    }

    setScreen('LOADING');
    setLoadingError(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await GeminiService.getInstance().generateQuiz(
        content, 
        settings, 
        isImage, 
        abortControllerRef.current.signal,
        lang
      );
      
      const newQuiz: QuizRecord = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        questionLanguage: response.language,
        settings: { ...settings },
        questions: response.questions,
        source: 'ai'
      };

      setQuiz(newQuiz);
      
      if (mode === GameMode.DUEL) {
        const code = Math.random().toString(36).substr(2, 6).toUpperCase();
        setRoomCode(code);
        await firebaseService.createRoom(code, 'duel', 'host-peer-id'); 
        setScreen('ROOM_LOBBY');
      } else if (mode === GameMode.TEACHER) {
        const code = Math.random().toString(36).substr(2, 6).toUpperCase();
        setRoomCode(code);
        await firebaseService.createRoom(code, 'teacher', 'teacher-peer-id');
        setScreen('ROOM_LOBBY');
      } else {
        setScreen('READY');
      }
    } catch (err: any) {
      if (err.message === 'ABORTED') return;
      console.error("Quiz Generation Failed:", err);
      setLoadingError(err.message || t.generationError);
    }
  };

  const handleManualQuiz = (questions: Question[]) => {
    const newQuiz: QuizRecord = {
      id: `manual-${Date.now()}`,
      createdAt: Date.now(),
      questionLanguage: lang,
      settings: { ...settings, questionCount: questions.length },
      questions,
      source: 'manual'
    };
    setQuiz(newQuiz);
    setScreen('READY');
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-lime border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-black uppercase tracking-widest text-xs animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-brand-lime selection:text-brand-dark">
      {screen === 'LANDING' && (
        <LandingPage 
          onNext={handleLogin} 
          onGuest={handleLogin} 
          onAdmin={handleLogin}
          lang={lang} 
          setLang={setLang} 
          t={t} 
          onOpenLegal={() => {}} 
        />
      )}

      {authError && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-brand-dark border-2 border-brand-lime/30 p-8 rounded-[2rem] max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <span className="text-3xl font-black">!</span>
            </div>
            <h2 className="text-2xl font-black text-center mb-4 text-white uppercase italic tracking-tighter leading-none">
              {authError.title}
            </h2>
            <p className="text-white/70 text-sm text-center mb-8 leading-relaxed">
              {authError.message}
            </p>
            <button 
              onClick={() => setAuthError(null)} 
              className="w-full bg-brand-lime text-brand-dark py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {screen === 'HOME' && user && (
        <HomePage 
          onSelectMode={(m) => { setMode(m); setScreen('CONFIG'); }}
          onJoinDuel={() => setScreen('JOIN_ROOM')}
          onHistory={() => setScreen('HISTORY')}
          onPricing={() => setScreen('PRICING')}
          onAffiliate={() => setScreen('AFFILIATE')}
          onInfoCenter={() => setScreen('INFO_CENTER')}
          onLogout={() => signOut(auth).then(() => setScreen('LANDING'))}
          t={t}
          audio={audio}
          isGuest={false}
          demoUsed={false}
          isAdmin={isAdmin}
        />
      )}

      {screen === 'CONFIG' && user && (
        <ConfigPage 
          settings={settings} 
          setSettings={setSettings} 
          onStart={handleStartQuiz}
          onStartManual={handleManualQuiz}
          onBack={() => setScreen('HOME')}
          t={t}
        />
      )}

      {screen === 'LOADING' && (
        <LoadingPage 
          t={t} 
          error={loadingError} 
          onCancel={() => { abortControllerRef.current?.abort(); setScreen('CONFIG'); }} 
          onRetry={() => {
            const draft = localStorage.getItem('sqg_draft_content') || '';
            handleStartQuiz(draft, draft.startsWith('data:image'));
          }}
          onBack={() => setScreen('HOME')}
        />
      )}

      {screen === 'READY' && quiz && (
        <ReadyPage 
          quiz={quiz} 
          onStart={() => {
            audio.enableAudio();
            setScreen('ARENA');
          }}
          onBack={() => setScreen('CONFIG')}
          t={t}
        />
      )}

      {screen === 'ROOM_LOBBY' && mode === GameMode.DUEL && quiz && (
        <DuelLobbyPage 
          code={roomCode} 
          joined={false} 
          quiz={quiz}
          onStart={() => setScreen('READY')}
          onBack={() => setScreen('HOME')}
          t={t}
        />
      )}

      {screen === 'ROOM_LOBBY' && mode === GameMode.TEACHER && quiz && (
        <TeacherLobbyPage 
          code={roomCode} 
          quiz={quiz}
          onStart={() => setScreen('READY')}
          onBack={() => setScreen('HOME')}
          t={t}
        />
      )}

      {screen === 'JOIN_ROOM' && (
        <DuelJoinPage 
          onJoin={(code) => { setRoomCode(code); setScreen('READY'); }} 
          onBack={() => setScreen('HOME')} 
          t={t} 
        />
      )}

      {screen === 'ARENA' && quiz && (
        <QuizPage 
          quiz={quiz} 
          mode={mode}
          onComplete={(res) => {
            setResult(res);
            historyService.saveQuiz(quiz);
            setScreen('RESULT');
          }}
          onQuit={() => setScreen('HOME')}
          t={t}
          audio={audio}
        />
      )}

      {screen === 'RESULT' && result && (
        <ResultPage 
          result={result} 
          onHome={() => setScreen('HOME')} 
          onBalloon={() => setScreen('BALLOON')}
          t={t}
          audio={audio}
        />
      )}

      {screen === 'BALLOON' && (
        <BalloonGame 
          onComplete={() => setScreen('HOME')} 
          t={t} 
          audio={audio} 
        />
      )}

      {screen === 'HISTORY' && (
        <HistoryPage 
          onSelectQuiz={(q) => { setQuiz(q); setScreen('READY'); }} 
          onBack={() => setScreen('HOME')} 
          t={t} 
        />
      )}

      {screen === 'PRICING' && (
        <PricingPage onBack={() => setScreen('HOME')} t={t} />
      )}

      {screen === 'AFFILIATE' && (
        <AffiliatePage onBack={() => setScreen('HOME')} t={t} lang={lang} />
      )}

      {screen === 'INFO_CENTER' && (
        <InfoCenterPage onBack={() => setScreen('HOME')} lang={lang} />
      )}
    </div>
  );
}
