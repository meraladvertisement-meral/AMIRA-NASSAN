
import React, { useState, useEffect } from 'react';
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
  defaultSection?: string;
}

const InfoCenterPage: React.FC<InfoCenterPageProps> = ({ onBack, lang, defaultSection = 'plans' }) => {
  const [activeTab, setActiveTab] = useState(defaultSection);
  const content = infoContent[lang] || infoContent.en;

  useEffect(() => {
    if (defaultSection) {
      setActiveTab(defaultSection);
    }
  }, [defaultSection]);

  const tabs = [
    { id: 'plans', label: lang === 'de' ? 'Preise' : 'Plans', icon: '💎' },
    { id: 'terms', label: lang === 'de' ? 'AGB' : 'Terms', icon: '📝' },
    { id: 'privacy', label: lang === 'de' ? 'Datenschutz' : 'Privacy', icon: '🛡️' },
    { id: 'affiliate', label: lang === 'de' ? 'Partner' : 'Affiliate', icon: '🤝' },
    { id: 'support', label: lang === 'de' ? 'Support' : 'Support', icon: '💬' },
    { id: 'impressum', label: lang === 'de' ? 'Impressum' : 'Impressum', icon: '🏛️' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'plans':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard><PlansAndPricing content={content.plans} /></GlassCard>
            <GlassCard><RefundPolicy lang={lang} /></GlassCard>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard><TermsOfUse content={content.terms} /></GlassCard>
            <GlassCard><RefundPolicy lang={lang} /></GlassCard>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard><PrivacyPolicy content={content.privacy} /></GlassCard>
          </div>
        );
      case 'affiliate':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard><AffiliatePolicy content={content.affiliate} /></GlassCard>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard><SupportContact content={content.support} /></GlassCard>
            <GlassCard><BusinessContact content={content.business} /></GlassCard>
          </div>
        );
      case 'impressum':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GlassCard><Impressum content={content.impressum} /></GlassCard>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col gap-6 pb-12 overflow-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black italic text-white drop-shadow-md tracking-tighter">
          {lang === 'de' ? 'Info & Rechtszentrum' : 'Info & Legal Center'}
        </h1>
        <button onClick={onBack} className="glass px-6 py-2 rounded-xl text-sm font-bold active:scale-95 transition">
          {lang === 'de' ? '← Zurück' : '← Back'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar no-scrollbar scroll-smooth">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap border ${
              activeTab === tab.id 
                ? 'bg-brand-lime text-brand-dark border-brand-lime shadow-[0_0_20px_rgba(132,204,22,0.3)]' 
                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {renderContent()}
      </div>

      <div className="pt-4 mt-auto">
        <ThreeDButton onClick={onBack} className="w-full">
          {lang === 'de' ? 'Zurück zur Startseite' : 'Back to Home'}
        </ThreeDButton>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InfoCenterPage;
