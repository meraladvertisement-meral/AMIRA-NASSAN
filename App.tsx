
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppScreen, GameMode, QuizSettings, QuizRecord, QuizResult, Question } from './types/quiz';
import { Language, translations } from './i18n';
import { useAudio } from './hooks/useAudio';
import { GeminiService } from './services/geminiService';
import { historyService } from './services/historyService';
import { billingService } from './services/billingService';
import { legalService, LegalDocType } from './services/legalService';
import { PeerService, DuelMessage } from './services/peerService';

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

// Components
import { Modal } from './components/layout/Modal';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('LANDING');
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('sqg_ui_lang') as Language) || 'en');
  const [isGuest, setIsGuest] = useState(false);
  const [demoUsed, setDemoUsed] = useState(() => localStorage.getItem('sqg_demo_used') === 'true');
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.SOLO);
  
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

  // Duel State
  const [roomCode, setRoomCode] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState({ index: 0, score: 0, finished: false });
  const peerRef = useRef<PeerService>(new PeerService());

  const audio = useAudio();
  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    localStorage.setItem('sqg_ui_lang', lang);
  }, [lang]);

  // Handle Join Link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const duelJoin = params.get('duelJoin');
    if (duelJoin) {
      setRoomCode(duelJoin.toUpperCase());
      setScreen('DUEL_JOIN');
      // Clear URL params without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePeerMessage = (msg: DuelMessage) => {
    switch (msg.type) {
      case 'INIT_QUIZ':
        setCurrentQuiz(msg.payload);
        setScreen('READY');
        break;
      case 'NEXT_READY':
        audio.enableAudio();
        audio.startMusic('calm');
        setScreen('ARENA');
        break;
      case 'PROGRESS':
        setOpponentProgress(msg.payload);
        break;
    }
  };

  const createDuelRoom = (quiz: QuizRecord) => {
    const code = PeerService.generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setOpponentJoined(false);

    peerRef.current.init(
      code,
      () => setScreen('DUEL_LOBBY'),
      (err) => {
        if (err.type === 'unavailable-id') {
          createDuelRoom(quiz); // Retry with new code
        } else {
          alert("Could not create room. Please try again.");
          setScreen('CONFIG');
        }
      }
    );

    peerRef.current.onConnection(() => {
      setOpponentJoined(true);
      peerRef.current.send({ type: 'INIT_QUIZ', payload: quiz });
    });

    peerRef.current.onMessage(handlePeerMessage);
  };

  const joinDuelRoom = (code: string) => {
    setScreen('LOADING');
    peerRef.current.connect(
      code,
      () => {
        setIsHost(false);
        setRoomCode(code);
        setOpponentJoined(true);
      },
      (err) => {
        alert("Could not find room.");
        setScreen('DUEL_JOIN');
      }
    );
    peerRef.current.onMessage(handlePeerMessage);
  };

  const handleStartGeneration = async (content: string, isImage: boolean = false) => {
    if (isGuest) {
      if (demoUsed) return;
    } else {
      const canPlay = billingService.consumePlay();
      if (!canPlay) {
        setScreen('PRICING');
        return;
      }
    }

    setScreen('LOADING');
    try {
      const { questions, language } = await GeminiService.getInstance().generateQuiz(content, settings, isImage);
      const quiz: QuizRecord = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        questionLanguage: language,
        settings,
        questions,
        source: 'ai'
      };
      
      if (isGuest) {
        localStorage.setItem('sqg_demo_used', 'true');
        setDemoUsed(true);
      }

      setCurrentQuiz(quiz);
      if (gameMode === GameMode.DUEL) {
        createDuelRoom(quiz);
      } else {
        setScreen('READY');
      }
      localStorage.removeItem('sqg_draft_content');
    } catch (err) {
      console.error(err);
      setScreen('CONFIG');
    }
  };

  const handleStartManual = (questions: Question[]) => {
    if (isGuest) {
      if (demoUsed) return;
    } else {
      const canPlay = billingService.consumePlay();
      if (!canPlay) {
        setScreen('PRICING');
        return;
      }
    }

    const quiz: QuizRecord = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      questionLanguage: lang,
      settings: {
        ...settings,
        questionCount: questions.length,
        types: ['MCQ']
      },
      questions,
      source: 'manual'
    };

    if (isGuest) {
      localStorage.setItem('sqg_demo_used', 'true');
      setDemoUsed(true);
    }

    setCurrentQuiz(quiz);
    if (gameMode === GameMode.DUEL) {
      createDuelRoom(quiz);
    } else {
      setScreen('READY');
    }
  };

  const handleCompleteQuiz = (result: QuizResult) => {
    setLastResult(result);
    if (!isGuest && currentQuiz) {
      historyService.saveQuiz(currentQuiz);
    }
    if (gameMode === GameMode.DUEL) {
      peerRef.current.send({ 
        type: 'PROGRESS', 
        payload: { index: currentQuiz!.questions.length, score: result.score, finished: true } 
      });
    }
    setScreen('RESULT');
  };

  const handleDuelStart = () => {
    peerRef.current.send({ type: 'NEXT_READY' });
    audio.enableAudio();
    audio.startMusic('calm');
    setScreen('ARENA');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'LANDING':
        return <LandingPage 
          onNext={() => { setIsGuest(false); setScreen('HOME'); }} 
          onGuest={() => { setIsGuest(true); setScreen('HOME'); }}
          lang={lang} 
          setLang={setLang} 
          t={t} 
          onOpenLegal={setActiveLegalDoc}
        />;
      case 'HOME':
        return <HomePage 
          onSelectMode={(m) => { setGameMode(m); setScreen('CONFIG'); }} 
          onJoinDuel={() => setScreen('DUEL_JOIN')}
          t={t} 
          audio={audio} 
          onHistory={() => setScreen('HISTORY')} 
          onPricing={() => setScreen('PRICING')}
          onAffiliate={() => setScreen('AFFILIATE')} 
          onInfoCenter={() => setScreen('INFO_CENTER')}
          isGuest={isGuest}
          demoUsed={demoUsed}
          onLogout={() => { setIsGuest(false); setScreen('LANDING'); }}
        />;
      case 'CONFIG':
        return <ConfigPage 
          settings={settings} 
          setSettings={setSettings} 
          onStart={handleStartGeneration} 
          onStartManual={handleStartManual}
          onBack={() => setScreen('HOME')}
          t={t} 
        />;
      case 'DUEL_LOBBY':
        return <DuelLobbyPage 
          code={roomCode} 
          joined={opponentJoined} 
          onStart={handleDuelStart}
          onBack={() => { peerRef.current.destroy(); setScreen('HOME'); }}
          t={t} 
        />;
      case 'DUEL_JOIN':
        return <DuelJoinPage 
          onJoin={joinDuelRoom}
          onBack={() => setScreen('HOME')}
          t={t} 
        />;
      case 'LOADING':
        return <LoadingPage t={t} />;
      case 'READY':
        return <ReadyPage 
          quiz={currentQuiz!} 
          onStart={gameMode === GameMode.DUEL ? undefined : () => { audio.enableAudio(); audio.startMusic('calm'); setScreen('ARENA'); }} 
          onBack={() => setScreen('HOME')}
          t={t}
          isDuel={gameMode === GameMode.DUEL}
          isHost={isHost}
        />;
      case 'ARENA':
        return <QuizPage 
          quiz={currentQuiz!} 
          onComplete={handleCompleteQuiz} 
          onQuit={() => { audio.stopMusic(); peerRef.current.destroy(); setScreen('HOME'); }}
          onProgress={(index, score) => {
            if (gameMode === GameMode.DUEL) {
              peerRef.current.send({ type: 'PROGRESS', payload: { index, score, finished: false } });
            }
          }}
          opponentProgress={gameMode === GameMode.DUEL ? opponentProgress : undefined}
          t={t} 
          audio={audio} 
        />;
      case 'RESULT':
        return <ResultPage result={lastResult!} onHome={() => { peerRef.current.destroy(); setScreen('HOME'); }} onBalloon={() => setScreen('BALLOON')} t={t} audio={audio} />;
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

      <Modal 
        isOpen={activeLegalDoc !== null} 
        onClose={() => setActiveLegalDoc(null)}
        title={activeLegalDoc ? t[activeLegalDoc as keyof typeof t] : ''}
      >
        <div 
          className="prose prose-invert max-w-none text-white/80"
          dangerouslySetInnerHTML={{ 
            __html: activeLegalDoc ? legalService.getContent(activeLegalDoc, lang) : '' 
          }} 
        />
      </Modal>
    </div>
  );
};

export default App;
