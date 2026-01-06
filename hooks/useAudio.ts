
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

  // Monitor mute changes and apply to current music
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

  // Ensure music stops when the component using the hook unmounts
  useEffect(() => {
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  const playSfx = useCallback((type: keyof typeof SFX) => {
    if (isMuted || !audioEnabled) return;
    const audio = new Audio(SFX[type]);
    audio.play().catch((err) => console.warn('SFX playback failed:', err));
  }, [isMuted, audioEnabled]);

  const startMusic = useCallback((type: keyof typeof MUSIC) => {
    if (!audioEnabled) return;
    
    // Stop any existing music before starting new track
    stopMusic();
    
    const audioObj = new Audio(MUSIC[type]);
    audioObj.loop = true;
    audioObj.muted = isMuted;
    musicRef.current = audioObj;
    
    audioObj.play().catch((err) => {
      console.warn('Music playback failed (interaction required?):', err);
    });
  }, [isMuted, audioEnabled, stopMusic]);

  const enableAudio = () => {
    setAudioEnabled(true);
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  return { isMuted, toggleMute, playSfx, startMusic, stopMusic, enableAudio, audioEnabled };
}
