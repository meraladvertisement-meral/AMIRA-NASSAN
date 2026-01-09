
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { billingService } from '../services/billingService';
import { Entitlement } from '../types/billing';
import { auth } from '../services/firebase';

interface PricingPageProps {
  onBack: () => void;
  t: any;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack, t }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [entitlement, setEntitlement] = useState<Entitlement>(billingService.getEntitlement());
  
  useEffect(() => {
    setEntitlement(billingService.getEntitlement());
  }, []);

  const subscriptionPlans = [
    { 
      id: 'plus', 
      name: 'Plus', 
      monthly: 8.99, 
      yearly: 82.99,
      monthlyPriceId: 'price_1SnPldGvLCUKCR9vpV4CdIHs',
      yearlyPriceId: 'price_1SnPtJGvLCUKCR9vJVjo8FB1',
      fullYearlyPrice: 107.88,
      features: t.plusFeatures
    },
    { 
      id: 'unlimited', 
      name: 'Unlimited', 
      monthly: 17.99, 
      yearly: 174.99,
      monthlyPriceId: 'price_1SnPmqGvLCUKCR9vtyWXSjRz',
      yearlyPriceId: 'price_1SnPnRGvLCUKCR9vx4AtlCmF',
      fullYearlyPrice: 215.88,
      features: t.unlimitedFeatures
    },
  ];

  const playPacks = [
    { id: 'starter_pack', name: '🎖 Starter Pack', count: 20, price: 4.13, priceId: 'price_1SnR0TGvLCUKCR9vty6XX32N' },
    { id: 'pro_pack', name: '🥈 Pro Pack', count: 100, price: 12.87, priceId: 'price_1SnRR8GvLCUKCR9vr0VbBn2T' },
    { id: 'master_pack', name: '🥇 Master Pack', count: 250, price: 25.75, priceId: 'price_1SnRSiGvLCUKCR9vKxRbuSnk', isBestSeller: true }
  ];

  const startCheckout = async (priceId: string) => {
    if (!auth.currentUser) {
      alert("Please sign in to make a purchase.");
      return;
    }
    
    setLoadingPriceId(priceId);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const referrerUid = localStorage.getItem('sqg_referrer_uid');

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ priceId, referrerUid })
      });
      
      const { url, error } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error(error || "Failed to create checkout session");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 pb-24 custom-scrollbar overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter">{t.pricing}</h2>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Upgrade your experience</p>
        </div>
        <button onClick={onBack} className="glass w-12 h-12 flex items-center justify-center rounded-2xl text-xl active:scale-90 transition shadow-lg">←</button>
      </div>

      <div className="bg-brand-lime/10 border border-brand-lime/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
        <span className="text-xl">💡</span>
        <p className="text-[11px] font-bold text-white/80 leading-snug">{t.dailyCreditsInfo}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase text-brand-lime tracking-widest ml-1">{t.subscriptions}</h3>
        <div className="flex bg-white/10 p-1 rounded-2xl border border-white/5">
          <button onClick={() => setBillingCycle('monthly')} className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase transition ${billingCycle === 'monthly' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/40'}`}>{t.monthly}</button>
          <button onClick={() => setBillingCycle('yearly')} className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase transition ${billingCycle === 'yearly' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/40'}`}>{t.yearly} <span className={`text-[9px] ml-1 ${billingCycle === 'yearly' ? 'text-brand-orange' : 'opacity-70'}`}>({t.threeMonthsFree})</span></button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {subscriptionPlans.map(p => {
            const isActive = entitlement.planId === p.id;
            const currentPrice = billingCycle === 'monthly' ? p.monthly : p.yearly;
            const priceId = billingCycle === 'monthly' ? p.monthlyPriceId : p.yearlyPriceId;
            const showDiscount = billingCycle === 'yearly';

            return (
              <GlassCard key={p.id} className={`relative border-white/10 ${isActive ? 'border-brand-lime border-2' : ''}`}>
                <h3 className="text-xl font-black mb-2">{p.name}</h3>
                <div className="relative flex items-center mb-6 pt-4 h-20">
                  <div className="flex items-baseline z-10">
                    <p className="text-4xl font-black text-brand-lime leading-none">€{currentPrice.toFixed(2)}</p>
                    <span className="text-[10px] text-white/30 ml-1 font-black uppercase tracking-widest">{billingCycle === 'monthly' ? '/mo' : '/yr'}</span>
                  </div>
                  {showDiscount && (
                    <div className="absolute top-0 right-2 transform -translate-y-1/4">
                      <span className="text-3xl font-light italic text-brand-orange line-through decoration-red-600 decoration-[1.5px] opacity-90 tracking-tighter">€{p.fullYearlyPrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <ul className="text-[11px] space-y-1 mb-6 opacity-80">{p.features.map((f: string) => <li key={f}>• {f}</li>)}</ul>
                <ThreeDButton 
                  variant={isActive ? 'secondary' : 'primary'} 
                  className="w-full py-3 text-sm disabled:opacity-50" 
                  disabled={isActive || loadingPriceId !== null}
                  onClick={() => startCheckout(priceId)}
                >
                  {loadingPriceId === priceId ? 'Loading...' : isActive ? 'Current Plan' : t.subscribe}
                </ThreeDButton>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-sm font-black uppercase text-brand-gold tracking-widest ml-1">{t.packRules}</h3>
        <GlassCard className="bg-black/20 border-brand-gold/20 p-4">
          <ul className="space-y-2">
            {[t.packInfo1, t.packInfo2, t.packInfo3, t.packInfo4, t.packInfo5, t.packInfo6, t.packInfo7].map((info, idx) => (
              <li key={idx} className="flex gap-2 items-start text-[10px] font-bold text-white/60 leading-relaxed">
                <span className="text-brand-gold mt-0.5">•</span>
                {info}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-black uppercase text-brand-gold tracking-widest ml-1">{t.prepaidPacks}</h3>
        <div className="grid grid-cols-1 gap-4">
          {playPacks.map(pack => (
            <GlassCard key={pack.id} className={`relative border-brand-gold/20 ${pack.isBestSeller ? 'border-brand-orange bg-brand-orange/5 shadow-lg' : ''}`}>
              {pack.isBestSeller && <div className="absolute -top-3 -right-3 bg-brand-orange text-white text-[10px] font-black px-4 py-1.5 rounded-full z-10 animate-pulse">🔥 {t.bestSeller}</div>}
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black">{pack.name}</h3>
                  <span className="bg-brand-gold/20 text-brand-gold px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter">One-time Payment</span>
                </div>
                <p className="text-2xl font-black text-white">€{pack.price.toFixed(2)}</p>
              </div>
              <ThreeDButton 
                variant={pack.isBestSeller ? 'primary' : 'warning'} 
                className="w-full py-4 text-sm disabled:opacity-50" 
                disabled={loadingPriceId !== null}
                onClick={() => startCheckout(pack.priceId)}
              >
                {loadingPriceId === pack.priceId ? 'Loading...' : t.buyPlays.replace('{count}', pack.count.toString())}
              </ThreeDButton>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
