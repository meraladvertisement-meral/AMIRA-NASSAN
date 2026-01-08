
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { billingService } from '../services/billingService';
import { Entitlement } from '../types/billing';

interface PricingPageProps {
  onBack: () => void;
  t: any;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack, t }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [entitlement, setEntitlement] = useState<Entitlement>(billingService.getEntitlement());
  
  useEffect(() => {
    setEntitlement(billingService.getEntitlement());
  }, []);

  const subscriptionPlans = [
    { 
      id: 'plus', 
      name: 'Plus', 
      monthly: 8.99, 
      yearly: 89.90,
      fullYearlyPrice: 107.88,
      features: t.plusFeatures
    },
    { 
      id: 'unlimited', 
      name: 'Unlimited', 
      monthly: 18.99, 
      yearly: 189.90,
      fullYearlyPrice: 227.88,
      features: t.unlimitedFeatures
    },
  ];

  const playPacks = [
    { id: 'starter_pack', name: '🎖 Starter Pack', count: 20, price: 4.49 },
    { id: 'pro_pack', name: '🥈 Pro Pack', count: 100, price: 13.99 },
    { id: 'master_pack', name: '🥇 Master Pack', count: 250, price: 27.99, isBestSeller: true }
  ];

  const handleSubscribe = (planId: string) => {
    const ent = billingService.getEntitlement();
    ent.planId = planId as any;
    ent.subscriptionStartAt = Date.now();
    ent.cycle = billingCycle;
    billingService.save(ent);
    setEntitlement({ ...ent });
    alert(t.subActivated);
  };

  const handleBuyPack = (count: number) => {
    billingService.addPack(count);
    setEntitlement(billingService.getEntitlement());
    alert(t.playsAdded.replace('{count}', count.toString()));
  };

  const handleCancel = () => {
    const ent = billingService.getEntitlement();
    const confirmCancel = confirm(t.cancelSubConfirm);
    if (confirmCancel) {
      ent.planId = 'free'; 
      billingService.save(ent);
      setEntitlement({ ...ent });
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

      {/* Subscription Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase text-brand-lime tracking-widest ml-1">{t.subscriptions}</h3>
        <div className="flex bg-white/10 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setBillingCycle('monthly')} 
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase transition ${billingCycle === 'monthly' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/40'}`}
          >{t.monthly}</button>
          <button 
            onClick={() => setBillingCycle('yearly')} 
            className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase transition ${billingCycle === 'yearly' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/40'}`}
          >{t.yearly} <span className="text-[8px] opacity-70">(-20%)</span></button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {subscriptionPlans.map(p => {
            const isActive = entitlement.planId === p.id;
            const currentPrice = billingCycle === 'monthly' ? p.monthly : p.yearly;
            const showDiscount = billingCycle === 'yearly';

            return (
              <GlassCard key={p.id} className={`relative border-white/10 ${isActive ? 'border-brand-lime border-2' : ''}`}>
                <h3 className="text-xl font-black mb-2">{p.name}</h3>
                
                <div className="relative flex items-center mb-6 pt-4 h-20">
                  <div className="flex items-baseline">
                    <p className="text-4xl font-black text-brand-lime leading-none">€{currentPrice}</p>
                    <span className="text-[10px] text-white/30 ml-1 font-black uppercase tracking-widest">
                      {billingCycle === 'monthly' ? '/mo' : '/yr'}
                    </span>
                  </div>
                  
                  {showDiscount && (
                    <div className="absolute top-0 right-2 transform -translate-y-1/4 rotate-[15deg] pointer-events-none">
                      <span className="text-3xl font-black text-red-600 line-through decoration-[3px] drop-shadow-[0_0_10px_rgba(220,38,38,0.4)] italic">
                        €{p.fullYearlyPrice}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="text-[11px] space-y-1 mb-6 opacity-80">
                  {p.features.map((f: string) => <li key={f}>• {f}</li>)}
                </ul>
                <ThreeDButton 
                  variant={isActive ? 'danger' : 'primary'} 
                  className="w-full py-3 text-sm" 
                  onClick={() => isActive ? handleCancel() : handleSubscribe(p.id)}
                >
                  {isActive ? t.cancelSub : t.subscribe}
                </ThreeDButton>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Prepaid Play Packs Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h3 className="text-sm font-black uppercase text-brand-gold tracking-widest ml-1">{t.prepaidPacks}</h3>
        
        <div className="glass p-5 rounded-3xl border-brand-gold/20 bg-brand-gold/5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase text-brand-gold tracking-widest">{t.packRules}</p>
              <ul className="text-[10px] text-white/70 space-y-1.5 leading-relaxed font-medium">
                <li>• {t.packInfo1}</li>
                <li>• {t.packInfo2}</li>
                <li>• <span className="text-red-400 font-bold">{t.packInfo3}</span></li>
                <li>• <span className="text-red-400 font-bold">{t.packInfo4}</span></li>
                <li>• {t.packInfo5}</li>
                <li>• {t.packInfo6}</li>
                <li>• {t.packInfo7}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {playPacks.map(pack => (
            <GlassCard 
              key={pack.id} 
              className={`relative border-brand-gold/20 hover:border-brand-gold/40 transition-colors ${pack.isBestSeller ? 'border-brand-orange bg-brand-orange/5 ring-1 ring-brand-orange/30 shadow-[0_0_20px_rgba(234,88,12,0.1)]' : ''}`}
            >
              {pack.isBestSeller && (
                <div className="absolute -top-3 -right-3 bg-brand-orange text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg transform rotate-6 animate-pulse z-10">
                  🔥 {t.bestSeller}
                </div>
              )}
              
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black">{pack.name}</h3>
                  <span className="bg-brand-gold/20 text-brand-gold px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter">
                    {t.oneTimePayment || 'One-time Payment'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white leading-none">€{pack.price}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{t.included || 'Included'}:</span>
                <span className="text-xl font-black text-brand-gold">{pack.count} {t.solo}</span>
              </div>

              <ThreeDButton 
                variant={pack.isBestSeller ? 'primary' : 'warning'} 
                className="w-full py-4 text-sm" 
                onClick={() => handleBuyPack(pack.count)}
              >
                {t.buyPlays.replace('{count}', pack.count.toString())}
              </ThreeDButton>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
