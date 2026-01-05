
import React from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { PlansAndPricing } from './sections/PlansAndPricing';
import { AffiliatePolicy } from './sections/AffiliatePolicy';
import { TermsOfUse } from './sections/TermsOfUse';
import { PrivacyPolicy } from './sections/PrivacyPolicy';
import { SupportContact } from './sections/SupportContact';
import { BusinessContact } from './sections/BusinessContact';
import { Impressum } from './sections/Impressum';
import { RefundPolicy } from './sections/RefundPolicy';
import { infoContent } from './content/ar';
import { Language } from '../i18n';

interface InfoCenterPageProps {
  onBack: () => void;
  lang: Language;
}

const InfoCenterPage: React.FC<InfoCenterPageProps> = ({ onBack, lang }) => {
  const content = infoContent[lang] || infoContent.en;

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black italic text-white drop-shadow-md tracking-tighter">
          {lang === 'de' ? 'Info & Rechtszentrum' : 'Info & Legal Center'}
        </h1>
        <button onClick={onBack} className="glass px-6 py-2 rounded-xl text-sm font-bold active:scale-95 transition">
          {lang === 'de' ? '← Zurück' : '← Back'}
        </button>
      </div>

      <div className="space-y-6">
        <GlassCard><PlansAndPricing content={content.plans} /></GlassCard>
        <GlassCard><RefundPolicy lang={lang} /></GlassCard>
        <GlassCard><AffiliatePolicy content={content.affiliate} /></GlassCard>
        <GlassCard><TermsOfUse content={content.terms} /></GlassCard>
        <GlassCard><PrivacyPolicy content={content.privacy} /></GlassCard>
        <GlassCard><SupportContact content={content.support} /></GlassCard>
        <GlassCard><BusinessContact content={content.business} /></GlassCard>
        <GlassCard><Impressum content={content.impressum} /></GlassCard>
      </div>

      <ThreeDButton onClick={onBack} className="w-full">
        {lang === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
      </ThreeDButton>
    </div>
  );
};

export default InfoCenterPage;
