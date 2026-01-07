
import { useState, useEffect, useRef, useCallback } from 'react';

const SFX = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  correct: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2561/2561-preview.mp3',
  pop: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
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
      const audio = musicRef.current;
      audio.pause();
      // Properly release the media resource
      audio.src = "";
      audio.load();
      musicRef.current = null;
    }
  }, []);

  const playSfx = useCallback((type: keyof typeof SFX) => {
    if (isMuted || !audioEnabled) return;
    const audio = new Audio(SFX[type]);
    audio.volume = 0.6;
    audio.play().catch((err) => console.warn('SFX playback failed:', err));
  }, [isMuted, audioEnabled]);

  const startMusic = useCallback((type: keyof typeof MUSIC) => {
    // If audio is not enabled by interaction yet, we can't play
    if (!audioEnabled) return;
    
    stopMusic();
    
    const audioObj = new Audio(MUSIC[type]);
    audioObj.loop = true;
    audioObj.muted = isMuted;
    audioObj.volume = 0.3; // Music should be background
    musicRef.current = audioObj;
    
    audioObj.play().catch((err) => {
      console.warn('Music playback failed:', err);
    });
  }, [isMuted, audioEnabled, stopMusic]);

  const enableAudio = useCallback(() => {
    if (audioEnabled) return;
    setAudioEnabled(true);
    // Play a silent or subtle sound to "unlock" audio context
    const contextUnlock = new Audio(SFX.click);
    contextUnlock.volume = 0;
    contextUnlock.play().catch(() => {});
  }, [audioEnabled]);

  const toggleMute = () => setIsMuted(prev => !prev);

  // Stop music on unmount of the audio hook owner
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);

  return { isMuted, toggleMute, playSfx, startMusic, stopMusic, enableAudio, audioEnabled };
}
