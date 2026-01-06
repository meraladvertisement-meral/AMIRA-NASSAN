
import React, { useState } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { billingService } from '../services/billingService';

interface PricingPageProps {
  onBack: () => void;
  t: any;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack, t }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutItem, setCheckoutItem] = useState<any | null>(null);
  
  // Consents for EU Compliance
  const [consentImmediate, setConsentImmediate] = useState(false);
  const [consentAcknowledge, setConsentAcknowledge] = useState(false);

  const plans = [
    { 
      id: 'plus', 
      name: 'Plus', 
      monthly: 8.99, 
      yearly: 89.90,
      yearlyEquivalent: 7.49,
      features: [
        '200 plays / month (Solo + Duel)', 
        '20 Teacher quizzes / month'
      ] 
    },
    { 
      id: 'unlimited', 
      name: 'Unlimited', 
      monthly: 18.99, 
      yearly: 189.90,
      yearlyEquivalent: 15.83,
      features: [
        'Unlimited plays (Solo + Duel) — Fair Use', 
        '60 Teacher quizzes / month'
      ] 
    },
  ];

  const packs = [
    { id: 'S', count: 50, price: 2.99 },
    { id: 'M', count: 120, price: 5.49 },
    { id: 'L', count: 300, price: 11.99 },
  ];

  const handlePurchase = () => {
    if (checkoutItem.type === 'pack') {
      if (!consentAcknowledge) return alert("Please acknowledge withdrawal right expiry.");
      billingService.addPack(checkoutItem.count);
    } else {
      if (!consentImmediate || !consentAcknowledge) return alert("Please accept the terms.");
      const ent = billingService.getEntitlement();
      ent.planId = checkoutItem.id;
      ent.cycle = billingCycle;
      ent.subscriptionStartAt = Date.now();
      billingService.save(ent);
    }
    setCheckoutItem(null);
    alert("Purchase Successful (Mock Mode)");
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic">{t.pricing}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      {/* Cycle Toggle */}
      <div className="flex bg-white/10 p-1 rounded-2xl">
        <button 
          onClick={() => setBillingCycle('monthly')}
          className={`flex-1 py-2 rounded-xl font-bold transition ${billingCycle === 'monthly' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/60'}`}
        >Monthly</button>
        <button 
          onClick={() => setBillingCycle('yearly')}
          className={`flex-1 py-2 rounded-xl font-bold transition ${billingCycle === 'yearly' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/60'}`}
        >Yearly</button>
      </div>

      <div className="space-y-4">
        {plans.map(p => (
          <GlassCard key={p.id} className={p.id === 'plus' ? 'border-brand-lime border-2' : 'border-white/10'}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-black">{p.name}</h3>
                <p className="text-brand-lime font-bold text-xl">
                  ${billingCycle === 'monthly' ? p.monthly.toFixed(2) : p.yearly.toFixed(2)} 
                  <span className="text-sm font-normal text-white/50"> / {billingCycle}</span>
                </p>
                {billingCycle === 'yearly' && (
                  <div className="mt-1">
                    <p className="text-[12px] text-brand-gold font-black uppercase tracking-wider italic">Includes 2 months free</p>
                    <p className="text-[10px] text-white/60 font-bold">${p.yearlyEquivalent.toFixed(2)} / month equivalent</p>
                  </div>
                )}
              </div>
            </div>
            <ul className="text-sm text-white/80 space-y-2 mb-6">
              {p.features.map(f => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-brand-lime">✓</span> 
                  {f}
                </li>
              ))}
            </ul>
            <ThreeDButton 
              variant={p.id === 'plus' ? 'primary' : 'secondary'} 
              className="w-full py-3"
              onClick={() => setCheckoutItem({ ...p, type: 'subscription' })}
            >
              Subscribe Now
            </ThreeDButton>
          </GlassCard>
        ))}
      </div>

      <p className="text-[10px] text-center text-white/40 font-bold uppercase tracking-widest">
        Subscriptions renew automatically until cancelled.
      </p>

      <h3 className="text-xl font-bold mt-4">Play Packs (One-time)</h3>
      <div className="grid grid-cols-3 gap-2">
        {packs.map(pack => (
          <GlassCard key={pack.id} className="p-3 text-center flex flex-col items-center border-white/10">
            <p className="text-[10px] font-bold text-brand-gold">PACK {pack.id}</p>
            <p className="text-xl font-black">{pack.count}</p>
            <p className="text-[10px] opacity-60 mb-2">Plays</p>
            <button 
              onClick={() => setCheckoutItem({ ...pack, type: 'pack' })}
              className="bg-brand-lime/20 text-brand-lime border border-brand-lime/30 w-full py-1 rounded-lg text-xs font-bold active:scale-95 transition"
            >
              ${pack.price.toFixed(2)}
            </button>
          </GlassCard>
        ))}
      </div>
      <p className="text-[10px] text-center text-white/40 font-bold uppercase tracking-widest">
        Packs expire 90 days after purchase.
      </p>

      {/* EU Compliance Checkout Modal */}
      {checkoutItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <GlassCard className="w-full max-w-md space-y-6">
            <h2 className="text-2xl font-black italic">Checkout</h2>
            <div className="bg-white/10 p-4 rounded-2xl">
              <p className="text-sm text-white/60">Selected Item:</p>
              <p className="text-xl font-bold">
                {checkoutItem.name || `Pack ${checkoutItem.id}`} - ${
                  checkoutItem.type === 'pack' 
                    ? checkoutItem.price.toFixed(2) 
                    : (billingCycle === 'monthly' ? checkoutItem.monthly.toFixed(2) : checkoutItem.yearly.toFixed(2))
                }
              </p>
            </div>

            <div className="space-y-4">
              {checkoutItem.type === 'subscription' ? (
                <>
                  <label className="flex gap-3 cursor-pointer">
                    <input type="checkbox" checked={consentImmediate} onChange={e => setConsentImmediate(e.target.checked)} className="w-5 h-5 accent-brand-lime" />
                    <span className="text-xs text-white/70">I request immediate start of the service before the 14-day withdrawal period ends.</span>
                  </label>
                  <label className="flex gap-3 cursor-pointer">
                    <input type="checkbox" checked={consentAcknowledge} onChange={e => setConsentAcknowledge(e.target.checked)} className="w-5 h-5 accent-brand-lime" />
                    <span className="text-xs text-white/70">I understand that if I withdraw within 14 days, usage compensation will be deducted from the refund.</span>
                  </label>
                </>
              ) : (
                <label className="flex gap-3 cursor-pointer">
                  <input type="checkbox" checked={consentAcknowledge} onChange={e => setConsentAcknowledge(e.target.checked)} className="w-5 h-5 accent-brand-lime" />
                  <span className="text-xs text-white/70">I agree to immediate supply of the digital credit and lose my 14-day withdrawal right once supply begins.</span>
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <ThreeDButton variant="secondary" className="flex-1 py-3" onClick={() => setCheckoutItem(null)}>Cancel</ThreeDButton>
              <ThreeDButton 
                variant="primary" 
                className="flex-1 py-3" 
                onClick={handlePurchase}
              >Pay Now</ThreeDButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
