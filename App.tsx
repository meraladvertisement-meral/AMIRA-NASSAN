import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppScreen, GameMode, QuizSettings, QuizRecord, QuizResult, Question } from './types/quiz';
import { Language, translations } from './i18n';
import { useAudio } from './hooks/useAudio';
import { GeminiService } from './services/geminiService';
import { historyService } from './services/historyService';
import { billingService } from './services/billingService';
import { legalService, LegalDocType } from './services/legalService';
import { PeerService, DuelMessage } from './services/peerService';
import { firebaseService, RoomData, ParticipantData } from './services/firebaseService';
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

// Components
import { Modal } from './components/layout/Modal';

// Admin Authorization Constants
const AUTHORIZED_ADMIN_EMAIL = "meral.advertisement@gmail.com";
const ADMIN_SECURITY_CODE = "SNAP-ADMIN-2026";

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('LANDING');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('sqg_ui_lang') as Language) || 'en');
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('snapquiz_admin') === '1');
  const [demoUsed, setDemoUsed] = useState(() => localStorage.getItem('sqg_demo_used') === 'true');
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.SOLO);
  const [duelRole, setDuelRole] = useState<'host' | 'guest' | null>(null);
  
  const [settings, setSettings] = useState<QuizSettings>(() => {
    const saved = localStorage.getItem('sqg_draft_settings');
    return saved ? JSON.parse(saved) : {
      difficulty: 'medium',
      questionCount: 10,
      types: ['MCQ'],
      durationMinutes: 10
    };
  });
  
  const [currentQuiz, setCurrentQuiz] = useState<QuizRecord | null>(null);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(null);

  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isGeneratingRef = useRef(false);

  const [roomCode, setRoomCode] = useState<string>('');
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState({ index: 0, score: 0, finished: false });
  const peerRef = useRef<PeerService>(new PeerService());
  const myGuestId = useRef(`guest-${Math.random().toString(36).substr(2, 9)}`);

  const audio = useAudio();
  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    localStorage.setItem('sqg_ui_lang', lang);
  }, [lang]);

  // Auth & Admin Persistence Logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userEmail = user.email?.toLowerCase();
        const storedAdminFlag = localStorage.getItem('snapquiz_admin');
        const storedAdminUid = localStorage.getItem('snapquiz_admin_uid');
        
        // Strict Admin Verification
        const isAuthorizedEmail = userEmail === AUTHORIZED_ADMIN_EMAIL;
        const hasAdminFlag = storedAdminFlag === '1';
        const matchesStoredUid = storedAdminUid === user.uid;

        if (isAuthorizedEmail && hasAdminFlag && matchesStoredUid) {
          setIsAdmin(true);
          setIsGuest(false);
        } else if (!user.isAnonymous) {
          // If logged in with a standard account (not authorized admin), ensure admin state is cleared
          if (isAdmin) {
            setIsAdmin(false);
            clearAdminStorage();
          }
        }
      } else {
        // Logged out
        setIsAdmin(false);
        clearAdminStorage();
        signInAnonymously(auth);
      }
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const clearAdminStorage = () => {
    localStorage.removeItem('snapquiz_admin');
    localStorage.removeItem('snapquiz_admin_uid');
    localStorage.removeItem('snapquiz_admin_email');
    localStorage.removeItem('snapquiz_admin_since');
  };

  const handleAdminTrigger = async () => {
    try {
      // Step 1: Trigger Google Sign-In
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = user.email?.toLowerCase();

      // Step 2: Strict Email Authorization Check
      if (userEmail !== AUTHORIZED_ADMIN_EMAIL) {
        await signOut(auth);
        alert(`ACCESS DENIED\n\nThe account '${user.email}' is not authorized for Admin access.`);
        setIsAdmin(false);
        clearAdminStorage();
        return;
      }

      // Step 3: Password Challenge
      const password = prompt("🔐 ADMIN IDENTITY CONFIRMED\nAuthorized: " + user.email + "\n\nEnter master admin code:");
      
      if (password === ADMIN_SECURITY_CODE) {
        setIsAdmin(true);
        localStorage.setItem('snapquiz_admin', '1');
        localStorage.setItem('snapquiz_admin_uid', user.uid);
        localStorage.setItem('snapquiz_admin_email', user.email || '');
        localStorage.setItem('snapquiz_admin_since', new Date().toISOString());
        alert("ADMIN ACCESS GRANTED 🔓\nYou are now in bypass mode (Unlimited plays).");
        setScreen('HOME');
      } else {
        if (password !== null) alert("INCORRECT CODE\nAdmin privileges remain locked.");
        setIsAdmin(false);
        clearAdminStorage();
      }
    } catch (e: any) {
      console.error("Admin Gate Error:", e);
      if (e.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        alert(`FIREBASE AUTH ERROR: Domain '${domain}' is not authorized. Please add it to your Firebase Console (Auth > Settings > Domains).`);
      } else if (e.code !== 'auth/popup-closed-by-user') {
        alert("Authentication failed: " + (e.message || "Unknown error"));
      }
    }
  };

  const handleStartGeneration = async (content: string, isImage: boolean = false) => {
    if (isGeneratingRef.current) return;
    
    // Check if user has plays left (Admins ALWAYS bypass this)
    const canPlay = isAdmin || (isGuest ? !demoUsed : billingService.consumePlay(isAdmin));
    if (!canPlay) {
      setScreen(isGuest ? 'HOME' : 'PRICING');
      return;
    }

    setError(null);
    setScreen('LOADING');
    isGeneratingRef.current = true;
    abortControllerRef.current = new AbortController();

    try {
      const { questions, language } = await GeminiService.getInstance().generateQuiz(
        content, 
        settings, 
        isImage, 
        abortControllerRef.current.signal
      );
      
      const quiz: QuizRecord = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        questionLanguage: language,
        settings,
        questions,
        source: 'ai'
      };
      
      if (isGuest && !isAdmin) {
        localStorage.setItem('sqg_demo_used', 'true');
        setDemoUsed(true);
      }

      setCurrentQuiz(quiz);
      setScreen('READY');
      localStorage.removeItem('sqg_draft_content');
    } catch (err: any) {
      if (err.message === 'ABORTED') {
        setScreen('CONFIG');
      } else {
        setError(t.generationError);
      }
    } finally {
      isGeneratingRef.current = false;
      abortControllerRef.current = null;
    }
  };

  const cancelGeneration = () => {
    abortControllerRef.current?.abort();
  };

  const handleStartManual = async (questions: Question[]) => {
    const canPlay = isAdmin || (isGuest ? !demoUsed : billingService.consumePlay(isAdmin));
    if (!canPlay) {
      setScreen(isGuest ? 'HOME' : 'PRICING');
      return;
    }

    const quiz: QuizRecord = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      questionLanguage: lang,
      settings: { ...settings, questionCount: questions.length, types: ['MCQ'] },
      questions,
      source: 'manual'
    };

    if (isGuest && !isAdmin) {
      localStorage.setItem('sqg_demo_used', 'true');
      setDemoUsed(true);
    }

    setCurrentQuiz(quiz);
    setScreen('READY');
  };

  const handleCompleteQuiz = (result: QuizResult) => {
    setLastResult(result);
    // History is saved for persistent users (including Admins)
    if (!isGuest && currentQuiz) historyService.saveQuiz(currentQuiz);
    setScreen('RESULT');
  };

  const handleLogout = () => {
    setIsGuest(false);
    setIsAdmin(false);
    clearAdminStorage();
    signOut(auth);
    setScreen('LANDING');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'LANDING':
        return <LandingPage 
          onNext={() => { setIsGuest(false); setScreen('HOME'); }} 
          onGuest={() => { setIsGuest(true); setScreen('HOME'); }}
          onAdmin={handleAdminTrigger}
          lang={lang} setLang={setLang} t={t} onOpenLegal={setActiveLegalDoc}
        />;
      case 'HOME':
        return <HomePage 
          onSelectMode={(m) => { setGameMode(m); setDuelRole(m !== GameMode.SOLO ? 'host' : null); setScreen('CONFIG'); }} 
          onJoinDuel={() => { setGameMode(GameMode.DUEL); setDuelRole('guest'); setScreen('DUEL_JOIN'); }}
          t={t} audio={audio} 
          onHistory={() => setScreen('HISTORY')} onPricing={() => setScreen('PRICING')}
          onAffiliate={() => setScreen('AFFILIATE')} onInfoCenter={() => setScreen('INFO_CENTER')}
          isGuest={isGuest} demoUsed={demoUsed} onLogout={handleLogout}
          isAdmin={isAdmin}
        />;
      case 'CONFIG':
        return <ConfigPage 
          settings={settings} setSettings={setSettings} 
          onStart={handleStartGeneration} onStartManual={handleStartManual}
          onBack={() => setScreen('HOME')} t={t} 
        />;
      case 'LOADING':
        return <LoadingPage t={t} error={error} onCancel={cancelGeneration} onBack={() => { setError(null); setScreen('CONFIG'); }} />;
      case 'READY':
        return <ReadyPage quiz={currentQuiz!} onStart={() => { audio.enableAudio(); audio.startMusic('calm'); setScreen('ARENA'); }} onBack={() => setScreen('CONFIG')} t={t} />;
      case 'ARENA':
        return <QuizPage quiz={currentQuiz!} onComplete={handleCompleteQuiz} onQuit={() => { audio.stopMusic(); setScreen('HOME'); }} t={t} audio={audio} />;
      case 'RESULT':
        return <ResultPage result={lastResult!} onHome={() => setScreen('HOME')} onBalloon={() => setScreen('BALLOON')} t={t} audio={audio} />;
      case 'BALLOON':
        return <BalloonGame onComplete={() => setScreen('HOME')} t={t} audio={audio} />;
      case 'HISTORY':
        return <HistoryPage onSelectQuiz={(q) => { setGameMode(GameMode.SOLO); setCurrentQuiz(q); setScreen('READY'); }} onBack={() => setScreen('HOME')} t={t} />;
      case 'PRICING':
        return <PricingPage onBack={() => setScreen('HOME')} t={t} />;
      case 'AFFILIATE':
        return <AffiliatePage onBack={() => setScreen('HOME')} t={t} lang={lang} />;
      case 'INFO_CENTER':
        return <InfoCenterPage onBack={() => setScreen('HOME')} lang={lang} />;
      default:
        return <LandingPage onNext={() => setScreen('HOME')} onGuest={() => setScreen('HOME')} lang={lang} setLang={setLang} t={t} onOpenLegal={setActiveLegalDoc} />;
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-lime selection:text-brand-dark">
      {renderScreen()}
      <Modal isOpen={activeLegalDoc !== null} onClose={() => setActiveLegalDoc(null)} title={activeLegalDoc ? t[activeLegalDoc as keyof typeof t] : ''}>
        <div className="prose prose-invert max-w-none text-white/80" dangerouslySetInnerHTML={{ __html: activeLegalDoc ? legalService.getContent(activeLegalDoc, lang) : '' }} />
      </Modal>
    </div>
  );
};

export default App;
