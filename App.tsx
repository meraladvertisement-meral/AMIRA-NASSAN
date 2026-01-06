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

const ADMIN_EMAIL = "Meral.advertisement@gmail.com";
const ADMIN_PASS = "SNAP-ADMIN-2026";

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
        const storedAdminFlag = localStorage.getItem('snapquiz_admin');
        const storedAdminUid = localStorage.getItem('snapquiz_admin_uid');
        const storedAdminEmail = localStorage.getItem('snapquiz_admin_email');
        
        // Re-verify Admin status on auth state change
        if (
          user.email === ADMIN_EMAIL && 
          storedAdminFlag === '1' && 
          storedAdminUid === user.uid &&
          storedAdminEmail === user.email
        ) {
          setIsAdmin(true);
          setIsGuest(false);
        } else if (!user.isAnonymous) {
          // If signed in with a different Google account, ensure admin is off
          if (isAdmin) {
            setIsAdmin(false);
            clearAdminStorage();
          }
        }
      } else {
        // Handle Logout
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
      let user = auth.currentUser;

      // 1. Force Google Sign-In with Account Selection
      // Even if already logged in, we trigger the popup to ensure we get the right account session
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;

      // 2. Identity Verification
      if (user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        alert(`NOT AUTHORIZED\n\nThe account '${user.email}' does not have administrator privileges.\n\nPlease log in with: ${ADMIN_EMAIL}`);
        setIsAdmin(false);
        clearAdminStorage();
        return;
      }

      // 3. Password Challenge
      const password = prompt("🔐 ADMIN SECURITY CHECK\nAccessing bypass mode for Meral.advertisement@gmail.com\n\nPlease enter the admin password:");
      
      if (password === ADMIN_PASS) {
        setIsAdmin(true);
        localStorage.setItem('snapquiz_admin', '1');
        localStorage.setItem('snapquiz_admin_uid', user.uid);
        localStorage.setItem('snapquiz_admin_email', user.email);
        localStorage.setItem('snapquiz_admin_since', new Date().toISOString());
        alert("ADMIN ACCESS ENABLED 🔓\nYou now have unlimited generations and plays. Quotas are ignored.");
        setScreen('HOME');
      } else if (password !== null) {
        alert("WRONG CODE\nAdmin mode remained inactive.");
        setIsAdmin(false);
      }
    } catch (e: any) {
      console.error("Admin Gate Error:", e);
      if (e.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        const msg = `FIREBASE AUTH ERROR: UNAUTHORIZED DOMAIN\n\nThe domain '${domain}' is not authorized in your Firebase project for Google Sign-In.\n\nTO FIX THIS:\n1. Go to Firebase Console\n2. Authentication > Settings > Authorized Domains\n3. Add '${domain}' to the list.\n4. Save and try again.`;
        alert(msg);
      } else if (e.code !== 'auth/popup-closed-by-user') {
        alert(`Authentication failed: ${e.message}`);
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