
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { Language } from '../i18n';
import { legalService } from '../services/legalService';
import { affiliateService } from '../services/affiliateService';
import { auth } from '../services/firebase';

interface AffiliatePageProps {
  onBack: () => void;
  t: any;
  lang: Language;
}

const AffiliatePage: React.FC<AffiliatePageProps> = ({ onBack, t, lang }) => {
  const [showPolicy, setShowPolicy] = useState(false);
  const [totals, setTotals] = useState({ pending: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  
  const user = auth.currentUser;
  const referralLink = `https://snapquizgame.app/?ref=${user?.uid || 'guest'}`;

  useEffect(() => {
    affiliateService.getLiveTotals().then(data => {
      setTotals(data);
      setLoading(false);
    });
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied! 🚀");
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 custom-scrollbar overflow-y-auto pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic tracking-tighter">{t.affiliate}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      <GlassCard className="text-center border-brand-lime/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10 text-5xl">🤝</div>
        <h3 className="text-xl font-black mb-2 italic">Invite & Win!</h3>
        <p className="text-brand-lime text-[10px] font-black uppercase tracking-widest mb-4">
          {t.referralBonusInfo}
        </p>
        
        <div className="bg-black/30 p-4 rounded-2xl mb-4 border border-white/5 flex flex-col gap-2">
          <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.3em]">Your Referral Link</p>
          <div className="text-[10px] font-mono break-all text-white/50">{referralLink}</div>
        </div>
        
        <ThreeDButton variant="primary" className="w-full text-sm" onClick={copyLink}>
          Copy Invite Link 📋
        </ThreeDButton>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center p-6 border-white/5 relative">
          <p className="text-[9px] uppercase font-black text-white/30 tracking-widest mb-1">Cash Pending</p>
          <p className="text-2xl font-black text-brand-gold italic">€{loading ? '...' : totals.pending.toFixed(2)}</p>
          <div className="absolute bottom-1 right-3 text-[8px] text-white/10 font-black italic uppercase">Per Sale</div>
        </GlassCard>
        <GlassCard className="text-center p-6 border-brand-lime/20 relative">
          <p className="text-[9px] uppercase font-black text-white/30 tracking-widest mb-1">Available</p>
          <p className="text-2xl font-black text-brand-lime italic">€{loading ? '...' : totals.available.toFixed(2)}</p>
          <div className="absolute bottom-1 right-3 text-[8px] text-brand-lime/30 font-black italic uppercase">Payout Ready</div>
        </GlassCard>
      </div>

      <GlassCard className="bg-white/5 p-4 text-center">
        <p className="text-xs font-bold text-white/60 leading-relaxed italic">
          "Don't have friends with money? No problem! <br/> 
          <span className="text-brand-lime">Earn +2 Free Plays</span> for every friend who just plays a demo quiz using your link!"
        </p>
      </GlassCard>

      <button 
        onClick={() => setShowPolicy(true)}
        className="text-white/40 text-[10px] font-black uppercase tracking-widest underline text-center pt-4"
      >
        View Detailed Terms
      </button>

      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80">
          <GlassCard className="max-h-[80vh] overflow-y-auto w-full max-w-xl relative">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-brand-dark/95 backdrop-blur-md pb-4 z-10 border-b border-white/10">
              <h3 className="text-xl font-black italic">Policy</h3>
              <button onClick={() => setShowPolicy(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">✕</button>
            </div>
            <div 
              className="prose prose-invert text-xs text-white/80 mt-4 leading-relaxed font-bold"
              dangerouslySetInnerHTML={{ __html: legalService.getContent('affiliate', lang) }}
            />
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AffiliatePage;
