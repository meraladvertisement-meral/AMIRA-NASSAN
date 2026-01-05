
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { firebaseService } from '../services/firebaseService';

interface DuelJoinPageProps {
  onJoin: (code: string) => void;
  onBack: () => void;
  t: any;
}

const DuelJoinPage: React.FC<DuelJoinPageProps> = ({ onJoin, onBack, t }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-trigger if code is 6 digits from link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && joinCode.length === 6) {
      setCode(joinCode.toUpperCase());
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      setLoading(true);
      try {
        await onJoin(code.toUpperCase());
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col justify-center gap-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black italic">{t.joinRoom}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">{t.roomCode}</p>
            <input 
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-6 text-4xl text-center font-black tracking-[1rem] focus:outline-none focus:border-brand-lime transition-all uppercase disabled:opacity-50"
              placeholder="000000"
            />
          </div>

          <ThreeDButton 
            variant="primary" 
            className="w-full py-5" 
            disabled={code.length !== 6 || loading}
            type="submit"
          >
            {loading ? "Checking..." : t.joinRoom}
          </ThreeDButton>
        </form>
      </GlassCard>

      <p className="text-center text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed">
        Ask your opponent for their 6-character room code or use the invite link.
      </p>
    </div>
  );
};

export default DuelJoinPage;
