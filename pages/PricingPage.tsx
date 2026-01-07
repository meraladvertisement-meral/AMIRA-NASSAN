
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
  
  const plans = [
    { 
      id: 'plus', 
      name: 'Plus', 
      monthly: 8.99, 
      yearly: 89.90,
      features: ['200 plays / month', '20 Teacher quizzes / month'] 
    },
    { 
      id: 'unlimited', 
      name: 'Unlimited', 
      monthly: 18.99, 
      yearly: 189.90,
      features: ['Unlimited plays', '60 Teacher quizzes / month'] 
    },
  ];

  const handleSubscribe = (planId: string) => {
    const ent = billingService.getEntitlement();
    ent.planId = planId as any;
    ent.subscriptionStartAt = Date.now();
    billingService.save(ent);
    setEntitlement({ ...ent });
    alert(t.appName === 'سناب كويز' ? "تم تفعيل الاشتراك!" : "Subscription Activated!");
  };

  const handleCancel = () => {
    const ent = billingService.getEntitlement();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const isWithinRefundingPeriod = ent.subscriptionStartAt && (Date.now() - ent.subscriptionStartAt < fourteenDaysMs);

    if (isWithinRefundingPeriod) {
      const confirmRefund = confirm(
        t.appName === 'سناب كويز' 
        ? "أنت ضمن فترة الـ 14 يوماً القانونية. هل تريد إلغاء الاشتراك واسترداد كامل المبلغ؟" 
        : "You are within the legal 14-day window. Would you like to cancel and receive a FULL REFUND?"
      );
      if (confirmRefund) {
        ent.planId = 'free';
        ent.subscriptionStartAt = undefined;
        billingService.save(ent);
        setEntitlement({ ...ent });
        alert(t.appName === 'سناب كويز' ? "تم الإلغاء والاسترداد بنجاح." : "Cancelled and refunded successfully.");
      }
    } else {
      const confirmCancel = confirm(
        t.appName === 'سناب كويز' 
        ? "سيتم إلغاء التجديد التلقائي فقط بدون استرداد لأنك تجاوزت 14 يوماً. هل تريد الاستمرار؟" 
        : "Only auto-renewal will be cancelled (no refund) as you passed the 14-day window. Continue?"
      );
      if (confirmCancel) {
        ent.planId = 'free';
        billingService.save(ent);
        setEntitlement({ ...ent });
        alert(t.appName === 'سناب كويز' ? "تم إلغاء التجديد." : "Auto-renewal cancelled.");
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic">{t.pricing}</h2>
        <button onClick={onBack} className="glass px-4 py-2 rounded-xl text-sm font-bold">←</button>
      </div>

      <div className="flex bg-white/10 p-1 rounded-2xl">
        <button onClick={() => setBillingCycle('monthly')} className={`flex-1 py-2 rounded-xl font-bold transition ${billingCycle === 'monthly' ? 'bg-white text-brand-dark' : 'text-white/60'}`}>Monthly</button>
        <button onClick={() => setBillingCycle('yearly')} className={`flex-1 py-2 rounded-xl font-bold transition ${billingCycle === 'yearly' ? 'bg-white text-brand-dark' : 'text-white/60'}`}>Yearly</button>
      </div>

      <div className="space-y-4">
        {plans.map(p => {
          const isActive = entitlement.planId === p.id;
          return (
            <GlassCard key={p.id} className={isActive ? 'border-brand-lime border-2' : ''}>
              <h3 className="text-2xl font-black mb-1">{p.name}</h3>
              <p className="text-brand-lime font-bold text-xl mb-4">
                ${billingCycle === 'monthly' ? p.monthly : p.yearly} 
                <span className="text-sm text-white/50"> / {billingCycle}</span>
              </p>
              <ul className="text-sm text-white/70 space-y-2 mb-6">
                {p.features.map(f => <li key={f}>✓ {f}</li>)}
              </ul>
              
              {isActive ? (
                <ThreeDButton variant="danger" className="w-full py-3" onClick={handleCancel}>
                  {t.appName === 'سناب كويز' ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
                </ThreeDButton>
              ) : (
                <ThreeDButton variant="primary" className="w-full py-3" onClick={() => handleSubscribe(p.id)}>
                  {t.appName === 'سناب كويز' ? 'اشترك الآن' : 'Subscribe Now'}
                </ThreeDButton>
              )}
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-8 p-4 glass rounded-2xl border-brand-gold/30 bg-brand-gold/5">
        <p className="text-[10px] text-white/60 leading-relaxed italic text-center">
          {t.appName === 'سناب كويز' 
            ? "يحق للمستخدم في الاتحاد الأوروبي إلغاء الاشتراك خلال 14 يومًا من تاريخ الشراء واسترجاع كامل المبلغ وفقًا لقوانين حماية المستهلك في الاتحاد الأوروبي."
            : "EU users have the right to cancel their subscription within 14 days of purchase and receive a full refund in accordance with EU consumer protection laws."}
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
