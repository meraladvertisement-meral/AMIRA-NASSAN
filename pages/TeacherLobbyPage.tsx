
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { firebaseService, ParticipantData } from '../services/firebaseService';

interface TeacherLobbyPageProps {
  code: string;
  onStart: () => void;
  onBack: () => void;
  t: any;
}

const TeacherLobbyPage: React.FC<TeacherLobbyPageProps> = ({ code, onStart, onBack, t }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);

  const inviteLink = `${window.location.origin}${window.location.pathname}?join=${code}&mode=teacher`;

  useEffect(() => {
    const unsub = firebaseService.subscribeToParticipants(code, (parts) => {
      setParticipants(parts);
    });
    return () => unsub();
  }, [code]);

  const copy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const students = participants.filter(p => p.role === 'student' && p.state === 'connected');

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-black italic">{t.teacher} Lobby</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      <GlassCard className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-white/50">{t.roomCode}</p>
            <p className="text-4xl font-black text-brand-lime tracking-widest">{code}</p>
          </div>
          <button 
            onClick={() => copy(code, 'code')}
            className="bg-white/10 p-3 rounded-xl hover:bg-white/20 transition active:scale-90"
          >
            {copied === 'code' ? '✅' : '📋'}
          </button>
        </div>

        <button 
          onClick={() => copy(inviteLink, 'link')}
          className="w-full bg-white/5 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition"
        >
          {copied === 'link' ? t.copied : t.copyLink}
        </button>
      </GlassCard>

      <div className="flex-1 overflow-y-auto space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 flex justify-between">
          <span>{t.activations || 'Students'}</span>
          <span className="text-brand-lime">{students.length}</span>
        </h3>
        
        {students.length === 0 ? (
          <div className="text-center py-12 text-white/30 italic font-bold">
            No students joined yet...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {students.map((s, i) => (
              <GlassCard key={i} className="p-3 border-brand-lime/20 flex items-center justify-between animate-in slide-in-from-right-2">
                <span className="font-bold">{s.name} #{i+1}</span>
                <span className="text-[10px] text-brand-lime font-black uppercase">Online</span>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <ThreeDButton 
          variant="primary" 
          className="w-full py-5 text-xl"
          disabled={students.length === 0}
          onClick={onStart}
        >
          Start Now ({students.length})
        </ThreeDButton>
        <p className="text-center text-[10px] text-white/40 font-bold uppercase tracking-widest">
          Clicking start will begin the quiz for everyone.
        </p>
      </div>
    </div>
  );
};

export default TeacherLobbyPage;
