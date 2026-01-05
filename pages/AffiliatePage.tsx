
import React, { useState } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { Language } from '../i18n';
import { legalService } from '../services/legalService';

interface AffiliatePageProps {
  onBack: () => void;
  t: any;
  lang: Language;
}

const AffiliatePage: React.FC<AffiliatePageProps> = ({ onBack, t, lang }) => {
  const [showPolicy, setShowPolicy] = useState(false);
  const referralLink = `https://snapquiz.game/?ref=USER123`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert(t.copied);
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic">{t.affiliate}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      <GlassCard className="text-center">
        <h3 className="text-xl font-bold mb-2">{t.referralTitle}</h3>
        <p className="text-white/60 mb-6">{t.referralDesc}</p>
        
        <div className="bg-white/10 p-4 rounded-2xl mb-4 text-brand-lime font-mono break-all">
          {referralLink}
        </div>
        
        <ThreeDButton variant="primary" className="w-full" onClick={copyLink}>
          {t.copyLink}
        </ThreeDButton>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="text-center p-4">
          <p className="text-xs uppercase font-bold text-white/50">{t.activations}</p>
          <p className="text-2xl font-black">12</p>
        </GlassCard>
        <GlassCard className="text-center p-4">
          <p className="text-xs uppercase font-bold text-white/50">Earnings</p>
          <p className="text-2xl font-black text-brand-lime">€36.00</p>
        </GlassCard>
      </div>

      <button 
        onClick={() => setShowPolicy(true)}
        className="text-white/40 text-sm underline text-center"
      >
        View Affiliate & Referral Policy
      </button>

      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80">
          <GlassCard className="max-h-[80vh] overflow-y-auto w-full max-w-xl">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-transparent backdrop-blur-md pb-2 z-10 border-b border-white/10">
              <h3 className="text-xl font-bold">{t.affiliate} Policy</h3>
              <button onClick={() => setShowPolicy(false)} className="p-2">✕</button>
            </div>
            <div 
              className="prose prose-invert text-sm text-white/80 mt-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: legalService.getContent('affiliate', lang) }}
            />
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AffiliatePage;
