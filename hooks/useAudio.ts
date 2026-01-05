
import { useState, useEffect, useRef, useCallback } from 'react';

const SFX = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3',
  pop: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
};

const MUSIC = {
  calm: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  arcade: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
};

export function useAudio() {
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('sqg_muted') === 'true');
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
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }
  }, []);

  const playSfx = useCallback((type: keyof typeof SFX) => {
    if (isMuted || !audioEnabled) return;
    const audio = new Audio(SFX[type]);
    audio.play().catch(() => {});
  }, [isMuted, audioEnabled]);

  const startMusic = useCallback((type: keyof typeof MUSIC) => {
    if (!audioEnabled) return;
    stopMusic();
    musicRef.current = new Audio(MUSIC[type]);
    musicRef.current.loop = true;
    musicRef.current.muted = isMuted;
    musicRef.current.play().catch(() => {});
  }, [isMuted, audioEnabled, stopMusic]);

  const enableAudio = () => {
    setAudioEnabled(true);
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  return { isMuted, toggleMute, playSfx, startMusic, stopMusic, enableAudio, audioEnabled };
}
