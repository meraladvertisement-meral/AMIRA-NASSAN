
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const SFX = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  correct: 'https://assets.mixkit.co/active_storage/sfx/1913/1913-preview.mp3', // Better Bell sound
  wrong: 'https://assets.mixkit.co/active_storage/sfx/1000/1000-preview.mp3', // Professional Buzzer
  pop: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
  win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  tick: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  game_over: 'https://assets.mixkit.co/active_storage/sfx/2562/2562-preview.mp3',
};

const MUSIC = {
  calm: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  arcade: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
};

export function useAudio() {
  const [isMusicMuted, setIsMusicMuted] = useState(() => {
    const saved = localStorage.getItem('sqg_music_muted');
    return saved === null ? false : saved === 'true';
  });
  
  const [isSfxMuted, setIsSfxMuted] = useState(() => {
    const saved = localStorage.getItem('sqg_sfx_muted');
    return saved === null ? false : saved === 'true';
  });
  
  const [audioEnabled, setAudioEnabled] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('sqg_music_muted', isMusicMuted.toString());
    if (musicRef.current) {
      musicRef.current.muted = isMusicMuted;
    }
  }, [isMusicMuted]);

  useEffect(() => {
    localStorage.setItem('sqg_sfx_muted', isSfxMuted.toString());
  }, [isSfxMuted]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.onended = null;
      musicRef.current.oncanplay = null;
      musicRef.current.src = "";
      musicRef.current.load(); 
      musicRef.current = null;
    }
  }, []);

  const playSfx = useCallback((type: keyof typeof SFX) => {
    if (isSfxMuted || !audioEnabled) return;
    try {
      const audio = new Audio(SFX[type]);
      audio.volume = type === 'tick' ? 0.2 : 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  }, [isSfxMuted, audioEnabled]);

  const startMusic = useCallback((type: keyof typeof MUSIC) => {
    if (!audioEnabled) return;
    stopMusic();
    try {
      const audioObj = new Audio(MUSIC[type]);
      audioObj.loop = true;
      audioObj.muted = isMusicMuted;
      audioObj.volume = 0.2;
      musicRef.current = audioObj;
      audioObj.play().catch(() => {});
    } catch (e) {}
  }, [isMusicMuted, audioEnabled, stopMusic]);

  const enableAudio = useCallback(() => {
    if (audioEnabled) return;
    setAudioEnabled(true);
    const silent = new Audio(SFX.click);
    silent.volume = 0;
    silent.play().catch(() => {});
  }, [audioEnabled]);

  const toggleMusicMute = useCallback(() => {
    setIsMusicMuted(prev => !prev);
  }, []);

  const toggleSfxMute = useCallback(() => {
    setIsSfxMuted(prev => !prev);
  }, []);

  const audioContext = useMemo(() => ({
    isMusicMuted,
    isSfxMuted,
    toggleMusicMute,
    toggleSfxMute,
    playSfx,
    startMusic,
    stopMusic,
    enableAudio,
    audioEnabled
  }), [isMusicMuted, isSfxMuted, toggleMusicMute, toggleSfxMute, playSfx, startMusic, stopMusic, enableAudio, audioEnabled]);

  return audioContext;
}
