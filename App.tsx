
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppScreen, GameMode, QuizSettings, QuizRecord, QuizResult, Question } from './types/quiz';
import { Language, translations } from './i18n';
import { useAudio } from './hooks/useAudio';
import { GeminiService } from './services/geminiService';
import { roomService } from './services/roomService';
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
import JoinRoomPage from './pages/JoinRoomPage';
import RoomLobbyPage from './pages/RoomLobbyPage';
import LeaderboardPage from './pages/LeaderboardPage';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('LANDING');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('sqg_ui_lang') as Language) || 'en');
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('sqg_mode') === 'guest');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('sqg_mode') === 'admin');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [mode, setMode] = useState<GameMode>(GameMode.SOLO);
  const [settings, setSettings] = useState<QuizSettings>({
    difficulty: 'medium',
    questionCount: 10,
    types: ['MCQ'],
    durationMinutes: 10
  });
  const [quiz, setQuiz] = useState<QuizRecord | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [lastQuizContent, setLastQuizContent] = useState<{content: string, isImage: boolean} | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const audio = useAudio();
  const t = useMemo(() => translations[lang], [lang]);

  const checkJoinParams = () => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && joinCode.length === 6) {
      setScreen('JOIN_ROOM');
      return true;
    }
    return false;
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('sqg_mode');
    const hasJoinCode = checkJoinParams();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setIsGuest(false);
        const isUserAdmin = u.email === 'digitalsecrets635@gmail.com';
        setIsAdmin(isUserAdmin);
        localStorage.setItem('sqg_mode', isUserAdmin ? 'admin' : 'user');
        
        if (!hasJoinCode) setScreen('HOME');
      } else {
        if (hasJoinCode) {
          setScreen('JOIN_ROOM');
        } else if (savedMode === 'guest') {
          handleGuestLogin(false);
          setScreen('HOME');
        } else if (savedMode === 'admin') {
          setUser({ uid: 'admin-001', displayName: 'System Admin' });
          setIsAdmin(true);
          setScreen('HOME');
        } else {
          setUser(null);
          setScreen('LANDING');
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleGuestLogin = (redirect = true) => {
    localStorage.setItem('sqg_mode', 'guest');
    setIsGuest(true);
    setIsAdmin(false);
    const guestUid = localStorage.getItem('sqg_guest_uid') || 'guest-' + Math.random().toString(36).substr(2, 5);
    localStorage.setItem('sqg_guest_uid', guestUid);
    setUser({ uid: guestUid, displayName: 'Guest Player' });
    if (redirect && !checkJoinParams()) setScreen('HOME');
  };

  const handleAdminLogin = () => {
    const pass = prompt("Admin Code:");
    if (pass === "2025") {
      localStorage.setItem('sqg_mode', 'admin');
      setIsAdmin(true);
      setUser({ uid: 'admin-001', displayName: 'System Admin' });
      setScreen('HOME');
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('sqg_mode');
    localStorage.removeItem('sqg_guest_uid');
    setIsGuest(false);
    setIsAdmin(false);
    setUser(null);
    await signOut(auth).catch(() => {});
    setScreen('LANDING');
  };

  const handleStartQuiz = async (content: string, isImage: boolean = false) => {
    setScreen('LOADING');
    setLoadingError(null);
    setLastQuizContent({ content, isImage });

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
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

      if (mode === GameMode.SOLO) {
        setScreen('READY');
      } else {
        const { sessionId } = await roomService.createSession(newQuiz, mode);
        setActiveRoomId(sessionId);
        setScreen('ROOM_LOBBY');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Generation took too long. Please try again.') {
        setLoadingError('Generation took too long. Please try again.');
      } else {
        setLoadingError(err.message || t.generationError);
      }
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setScreen('CONFIG');
  };

  const handleRetryGeneration = () => {
    if (lastQuizContent) {
      handleStartQuiz(lastQuizContent.content, lastQuizContent.isImage);
    }
  };

  const handleStartManual = async (questions: Question[]) => {
    const newQuiz: QuizRecord = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      questionLanguage: lang,
      settings: { ...settings, questionCount: questions.length },
      questions: questions,
      source: 'manual'
    };
    setQuiz(newQuiz);
    
    if (mode === GameMode.SOLO) {
      setScreen('READY');
    } else {
      setScreen('LOADING');
      try {
        const { sessionId } = await roomService.createSession(newQuiz, mode);
        setActiveRoomId(sessionId);
        setScreen('ROOM_LOBBY');
      } catch (err: any) {
        setLoadingError("Failed to create multiplayer session.");
      }
    }
  };

  if (isAuthLoading) return null;

  return (
    <div className="min-h-screen">
      {screen === 'LANDING' && (
        <LandingPage onNext={handleGoogleLogin} onGuest={() => handleGuestLogin(true)} onAdmin={handleAdminLogin} lang={lang} setLang={(l) => { setLang(l); localStorage.setItem('sqg_ui_lang', l); }} t={t} onOpenLegal={() => setScreen('INFO_CENTER')} />
      )}
      
      {user && screen === 'HOME' && (
        <HomePage onSelectMode={(m) => { setMode(m); setScreen('CONFIG'); }} onJoinDuel={() => setScreen('JOIN_ROOM')} onHistory={() => setScreen('HISTORY')} onPricing={() => setScreen('PRICING')} onAffiliate={() => setScreen('AFFILIATE')} onInfoCenter={() => setScreen('INFO_CENTER')} onLogout={handleLogout} onQuickSnap={() => {}} t={t} audio={audio} isGuest={isGuest} demoUsed={false} isAdmin={isAdmin} />
      )}

      {screen === 'CONFIG' && <ConfigPage settings={settings} setSettings={setSettings} onStart={handleStartQuiz} onStartManual={handleStartManual} onBack={() => setScreen('HOME')} t={t} />}
      
      {screen === 'ROOM_LOBBY' && activeRoomId && (
        <RoomLobbyPage 
          roomId={activeRoomId} 
          onStart={(roomQuiz, hostUid) => {
            setQuiz(roomQuiz);
            const myUid = auth.currentUser?.uid || localStorage.getItem('sqg_guest_uid');
            const isHost = hostUid === myUid || isAdmin; 
            if (isHost && mode === GameMode.TEACHER) {
              setScreen('LEADERBOARD');
            } else {
              setScreen('ARENA');
            }
          }} 
          onBack={() => setScreen('HOME')} 
          t={t} 
        />
      )}

      {screen === 'JOIN_ROOM' && <JoinRoomPage onJoinSuccess={(rid) => { setActiveRoomId(rid); setScreen('ROOM_LOBBY'); }} onBack={() => (user ? setScreen('HOME') : setScreen('LANDING'))} t={t} />}
      {screen === 'LOADING' && <LoadingPage t={t} error={loadingError} onCancel={handleCancelGeneration} onRetry={handleRetryGeneration} onBack={() => setScreen('CONFIG')} />}
      {screen === 'READY' && quiz && <ReadyPage quiz={quiz} onStart={() => setScreen('ARENA')} onBack={() => setScreen('CONFIG')} t={t} />}
      
      {screen === 'ARENA' && quiz && (
        <QuizPage 
          quiz={quiz} 
          mode={mode} 
          roomId={activeRoomId || undefined}
          onComplete={(res) => { 
            setResult(res); 
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
          onLeaderboard={() => setScreen('LEADERBOARD')}
          showLeaderboardBtn={mode !== GameMode.SOLO && !!activeRoomId}
          t={t} 
          audio={audio} 
        />
      )}

      {screen === 'LEADERBOARD' && activeRoomId && (
        <LeaderboardPage 
          roomId={activeRoomId} 
          quiz={quiz!} 
          isWinner={result ? result.percentage >= 60 : false} 
          onHome={() => setScreen('HOME')} 
          onBalloon={() => setScreen('BALLOON')} 
          t={t} 
          audio={audio} 
        />
      )}

      {screen === 'BALLOON' && <BalloonGame onComplete={() => setScreen('HOME')} t={t} audio={audio} />}
      {screen === 'HISTORY' && <HistoryPage onSelectQuiz={(q) => { setQuiz(q); setScreen('READY'); }} onBack={() => setScreen('HOME')} t={t} />}
      {screen === 'PRICING' && <PricingPage onBack={() => setScreen('HOME')} t={t} />}
      {screen === 'AFFILIATE' && <AffiliatePage onBack={() => setScreen('HOME')} t={t} lang={lang} />}
      {screen === 'INFO_CENTER' && <InfoCenterPage onBack={() => setScreen('HOME')} lang={lang} />}
    </div>
  );
}
