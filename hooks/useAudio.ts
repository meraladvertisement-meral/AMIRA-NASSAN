
import { useState, useEffect, useRef, useCallback } from 'react';

const SFX = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  correct: 'https://assets.mixkit.co/active_storage/sfx/2700/2700-preview.mp3', // صوت نجاح مميز
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3',
  pop: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  tick: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // صوت تكتكة المؤقت
  game_over: 'https://assets.mixkit.co/active_storage/sfx/2562/2562-preview.mp3',
};

const MUSIC = {
  calm: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  arcade: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
};

export function useAudio() {
  // الافتراضي صامت (true) إذا لم يكن هناك خيار محفوظ
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('sqg_muted');
    return saved === null ? true : saved === 'true';
  });
  
  const [audioEnabled, setAudioEnabled] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('sqg_muted', isMuted.toString());
    if (musicRef.current) {
      musicRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.src = "";
      musicRef.current = null;
    }
  }, []);

  const playSfx = useCallback((type: keyof typeof SFX) => {
    if (isMuted || !audioEnabled) return;
    try {
      const audio = new Audio(SFX[type]);
      audio.volume = type === 'tick' ? 0.3 : 0.6;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [isMuted, audioEnabled]);

  const startMusic = useCallback((type: keyof typeof MUSIC) => {
    if (!audioEnabled) return;
    stopMusic();
    try {
      const audioObj = new Audio(MUSIC[type]);
      audioObj.loop = true;
      audioObj.muted = isMuted;
      audioObj.volume = 0.3;
      musicRef.current = audioObj;
      audioObj.play().catch(() => {});
    } catch (e) {}
  }, [isMuted, audioEnabled, stopMusic]);

  const enableAudio = useCallback(() => {
    if (audioEnabled) return;
    setAudioEnabled(true);
    // فتح سياق الصوت للمتصفح
    const silent = new Audio(SFX.click);
    silent.volume = 0;
    silent.play().catch(() => {});
  }, [audioEnabled]);

  const toggleMute = () => setIsMuted(prev => !prev);

  return { isMuted, toggleMute, playSfx, startMusic, stopMusic, enableAudio, audioEnabled };
}
