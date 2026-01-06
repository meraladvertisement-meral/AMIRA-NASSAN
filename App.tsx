
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

// Admin Security
const AUTHORIZED_ADMIN_EMAIL = "meral.advertisement@gmail.com";
const ADMIN_SECURITY_CODE = "SNAP-ADMIN-2026";

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

  useEffect(() => {
    localStorage.setItem('sqg_ui_lang', lang);
  }, [lang]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
      if (u && screen === 'LANDING') setScreen('HOME');
      if (!u) signInAnonymously(auth).catch(console.error);
    });
    return () => unsubscribe();
  }, [screen]);

  const handleAdminTrigger = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL) {
        await signOut(auth);
        alert("Unauthorized account.");
        return;
      }
      const code = prompt("Enter master code:");
      if (code === ADMIN_SECURITY_CODE) {
        setIsAdmin(true);
        localStorage.setItem('snapquiz_admin', '1');
        setScreen('HOME');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartQuiz = async (content: string, isImage: boolean = false) => {
    if (!isAdmin && user?.isAnonymous) {
      if (demoUsed) {
        alert(t.demoUsed);
        return;
      }
    }

    setScreen('LOADING');
    setLoadingError(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await GeminiService.getInstance().generateQuiz(
        content, 
        settings, 
        isImage, 
        abortControllerRef.current.signal
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
        await firebaseService.createRoom(code, 'duel', 'host-peer-id'); // PeerID is dummy for state check
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
      setLoadingError(err.message === 'TIMEOUT' ? t.generationTimeout : t.generationError);
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
          onRetry={() => handleStartQuiz(localStorage.getItem('sqg_draft_content') || '')}
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
