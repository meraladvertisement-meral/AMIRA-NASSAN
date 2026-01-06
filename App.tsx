
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppScreen, GameMode, QuizSettings, QuizRecord, QuizResult, Question } from './types/quiz';
import { Language, translations } from './i18n';
import { useAudio } from './hooks/useAudio';
import { GeminiService } from './services/geminiService';
import { historyService } from './services/historyService';
import { billingService } from './services/billingService';
import { legalService, LegalDocType } from './services/legalService';
import { firebaseService } from './services/firebaseService';
import { auth, googleProvider } from './services/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInAnonymously, 
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

// Admin Security Whitelist
const ADMIN_EMAILS = ["meral.advertisement@gmail.com"];

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('LANDING');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('sqg_ui_lang') as Language) || 'en');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('snapquiz_admin') === '1');
  const [demoUsed, setDemoUsed] = useState(() => localStorage.getItem('sqg_demo_used') === 'true');
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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

  // Handle Deep Linking / Query Parameters
  useEffect(() => {
    const handleNavigation = () => {
      const params = new URLSearchParams(window.location.search);
      const join = params.get('join') || params.get('joinRoom') || params.get('code');
      const modeParam = params.get('mode');

      if (join && screen !== 'ARENA' && screen !== 'RESULT') {
        setRoomCode(join.toUpperCase());
        if (modeParam === 'teacher') setMode(GameMode.TEACHER);
        else setMode(GameMode.DUEL);
        setScreen('JOIN_ROOM');
      }
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [screen]);

  useEffect(() => {
    localStorage.setItem('sqg_ui_lang', lang);
  }, [lang]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
      
      const email = u?.email?.toLowerCase();
      if (email && ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
        localStorage.setItem('snapquiz_admin', '1');
      } else {
        setIsAdmin(false);
        localStorage.removeItem('snapquiz_admin');
      }

      if (u && screen === 'LANDING' && !window.location.search.includes('join')) {
        setScreen('HOME');
      }
      if (!u) signInAnonymously(auth).catch(console.error);
    });
    return () => unsubscribe();
  }, [screen]);

  const handleAdminTrigger = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email?.toLowerCase();

      if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
        setIsAdmin(true);
        localStorage.setItem('snapquiz_admin', '1');
        setScreen('HOME');
      } else {
        await signOut(auth);
        setIsAdmin(false);
        localStorage.removeItem('snapquiz_admin');
        alert("ACCESS DENIED");
      }
    } catch (e: any) {
      console.error("Admin Auth Error:", e);
      if (e.code !== 'auth/popup-closed-by-user') {
        alert("Authentication failed: " + e.message);
      }
    }
  };

  const handleStartQuiz = async (content: string, isImage: boolean = false) => {
    if (!isAdmin && user?.isAnonymous && demoUsed) {
      alert(t.demoUsed);
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
      console.error("Generation error details:", err);
      let msg = t.generationError;
      if (err.message === 'INVALID_API_KEY') msg = "Invalid API Key. Check Google AI Studio settings.";
      else if (err.message === 'EMPTY_RESPONSE') msg = "AI returned an empty response. Try different content.";
      
      setLoadingError(msg);
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

  if (isAuthLoading) return null;

  return (
    <div className="min-h-screen font-sans selection:bg-brand-lime selection:text-brand-dark">
      {screen === 'LANDING' && (
        <LandingPage 
          onNext={() => setScreen('HOME')} 
          onGuest={() => setScreen('HOME')} 
          onAdmin={handleAdminTrigger}
          lang={lang} 
          setLang={setLang} 
          t={t} 
          onOpenLegal={() => {}} 
        />
      )}

      {screen === 'HOME' && (
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
          isGuest={user?.isAnonymous}
          demoUsed={demoUsed}
          isAdmin={isAdmin}
        />
      )}

      {screen === 'CONFIG' && (
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
            if (user?.isAnonymous && !isAdmin) {
              setDemoUsed(true);
              localStorage.setItem('sqg_demo_used', 'true');
            }
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
