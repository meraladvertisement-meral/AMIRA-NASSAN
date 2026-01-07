
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
  
  // تحديث البيانات عند تحميل الصفحة
  useEffect(() => {
    setEntitlement(billingService.getEntitlement());
  }, []);

  const plans = [
    { 
      id: 'plus', 
      name: 'Plus', 
      monthly: 8.99, 
      yearly: 89.90,
      features: [
        '200 plays / month', 
        '20 Teacher quizzes / month',
        'Priority AI Generation'
      ] 
    },
    { 
      id: 'unlimited', 
      name: 'Unlimited', 
      monthly: 18.99, 
      yearly: 189.90,
      features: [
        'Unlimited plays (Fair Use)', 
        '60 Teacher quizzes / month',
        'Custom PDF Branding'
      ] 
    },
  ];

  const handleSubscribe = (planId: string) => {
    const ent = billingService.getEntitlement();
    // محاكاة عملية شراء ناجحة
    ent.planId = planId as any;
    ent.subscriptionStartAt = Date.now();
    ent.cycle = billingCycle;
    billingService.save(ent);
    setEntitlement({ ...ent });
    alert(t.appName === 'سناب كويز' ? "تم تفعيل الاشتراك بنجاح!" : "Subscription Activated Successfully!");
  };

  const handleCancel = () => {
    const ent = billingService.getEntitlement();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const isWithinRefundingPeriod = ent.subscriptionStartAt && (Date.now() - ent.subscriptionStartAt < fourteenDaysMs);

    if (isWithinRefundingPeriod) {
      // قانون الاتحاد الأوروبي: حق الانسحاب خلال 14 يوماً
      const confirmRefund = confirm(
        t.appName === 'سناب كويز' 
        ? "أنت لا تزال في فترة الـ 14 يوماً القانونية. هل تريد إلغاء الاشتراك واسترداد كامل المبلغ؟" 
        : "You are within the legal 14-day withdrawal period. Would you like to cancel and receive a FULL REFUND?"
      );
      if (confirmRefund) {
        ent.planId = 'free';
        ent.subscriptionStartAt = undefined;
        billingService.save(ent);
        setEntitlement({ ...ent });
        alert(t.appName === 'سناب كويز' ? "تم الإلغاء بنجاح وسيتم استرداد المبلغ." : "Subscription cancelled. Your refund is being processed.");
      }
    } else {
      // إلغاء عادي للتجديد التلقائي
      const confirmCancel = confirm(
        t.appName === 'سناب كويز' 
        ? "سيتم إيقاف التجديد التلقائي. ستظل المميزات متاحة حتى نهاية الفترة الحالية. هل أنت متأكد؟" 
        : "Auto-renewal will be stopped. Features remain active until the end of the current cycle. Confirm?"
      );
      if (confirmCancel) {
        ent.planId = 'free'; 
        billingService.save(ent);
        setEntitlement({ ...ent });
        alert(t.appName === 'سناب كويز' ? "تم إيقاف التجديد التلقائي." : "Auto-renewal has been disabled.");
      }
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen flex flex-col gap-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter">{t.pricing}</h2>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Manage your plan</p>
        </div>
        <button onClick={onBack} className="glass w-12 h-12 flex items-center justify-center rounded-2xl text-xl active:scale-90 transition shadow-lg">←</button>
      </div>

      {/* تبديل الدورة المحاسبية */}
      <div className="flex bg-white/10 p-1 rounded-2xl border border-white/5">
        <button 
          onClick={() => setBillingCycle('monthly')} 
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase transition ${billingCycle === 'monthly' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/40'}`}
        >Monthly</button>
        <button 
          onClick={() => setBillingCycle('yearly')} 
          className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase transition ${billingCycle === 'yearly' ? 'bg-white text-brand-dark shadow-lg' : 'text-white/40'}`}
        >Yearly <span className="text-[8px] opacity-70">(Save 20%)</span></button>
      </div>

      <div className="space-y-4">
        {plans.map(p => {
          const isActive = entitlement.planId === p.id;
          return (
            <GlassCard key={p.id} className={`relative transition-all duration-500 overflow-hidden ${isActive ? 'border-brand-lime border-2 shadow-[0_0_30px_rgba(132,204,22,0.2)] scale-[1.02]' : 'border-white/10 opacity-80'}`}>
              {isActive && (
                <div className="absolute top-0 right-0 bg-brand-lime text-brand-dark text-[8px] font-black px-4 py-1.5 uppercase tracking-widest rounded-bl-xl shadow-lg">
                  Active Plan
                </div>
              )}
              
              <h3 className="text-2xl font-black mb-1">{p.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-brand-lime font-black text-3xl">
                  ${billingCycle === 'monthly' ? p.monthly : p.yearly}
                </span>
                <span className="text-[10px] text-white/40 font-bold"> / {billingCycle}</span>
              </div>

              <ul className="text-sm text-white/70 space-y-2 mb-8">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-brand-lime text-xs">✔</span> {f}
                  </li>
                ))}
              </ul>
              
              {isActive ? (
                <ThreeDButton 
                  variant="danger" 
                  className="w-full py-4 text-sm" 
                  onClick={handleCancel}
                >
                  {t.appName === 'سناب كويز' ? 'إلغاء الاشتراك' : 'Cancel Subscription'}
                </ThreeDButton>
              ) : (
                <ThreeDButton 
                  variant={p.id === 'plus' ? 'primary' : 'secondary'} 
                  className="w-full py-4 text-sm" 
                  onClick={() => handleSubscribe(p.id)}
                >
                  {t.appName === 'سناب كويز' ? 'اشترك الآن' : 'Upgrade Now'}
                </ThreeDButton>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* التذييل القانوني */}
      <div className="mt-8 p-6 glass rounded-[2rem] border-brand-gold/20 bg-brand-gold/5">
        <h4 className="text-brand-gold font-black uppercase tracking-widest text-[10px] mb-3 text-center">Consumer Rights (EU/Global)</h4>
        <p className="text-[10px] text-white/60 leading-relaxed italic text-center">
          {t.appName === 'سناب كويز' 
            ? "بصفتك مستخدماً، لديك الحق في إلغاء اشتراكك واسترداد أموالك خلال 14 يوماً من الشراء إذا لم تستخدم الخدمة بشكل مفرط. الإلغاء بعد هذه الفترة يوقف التجديد التلقائي للدورة القادمة."
            : "As a user, you have the right to cancel and request a refund within 14 days of purchase if the service hasn't been heavily used. Cancellations after this period will stop future auto-renewals."}
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
