
import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ThreeDButton } from '../components/layout/ThreeDButton';
import { auth, db } from '../services/firebase';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

interface PaymentSuccessPageProps {
  onContinue: () => void;
  t: any;
  audio: any;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ onContinue, t, audio }) => {
  const [isActivating, setIsActivating] = useState(true);

  useEffect(() => {
    audio.playSfx('win');
    
    // Listen for Firestore updates to confirm entitlement grant
    let unsub: any;
    if (auth.currentUser) {
      unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snap) => {
        if (snap.exists()) {
          setIsActivating(false);
        }
      });
    } else {
      // If guest or delay in auth, wait a bit
      const timer = setTimeout(() => setIsActivating(false), 3000);
      return () => clearTimeout(timer);
    }

    return () => unsub?.();
  }, [audio]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-lime opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="mb-8 relative">
        <div className="w-32 h-32 bg-brand-lime rounded-full flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(132,204,22,0.5)] animate-bounce">
          {isActivating ? '⏳' : '✨'}
        </div>
      </div>

      <GlassCard className="max-w-md w-full space-y-6 py-10">
        <h2 className="text-4xl font-black italic text-brand-lime drop-shadow-md">
          {isActivating ? 'Activating Plan...' : t.paymentSuccess}
        </h2>
        <p className="text-white/70 font-medium leading-relaxed">
          {isActivating 
            ? "We're just confirming your transaction with Stripe. This usually takes a few seconds." 
            : t.paymentSuccessDesc}
        </p>
        
        {!isActivating && (
          <div className="pt-4">
            <ThreeDButton variant="primary" className="w-full py-5 text-lg" onClick={onContinue}>
              {t.goToAccount} 🏠
            </ThreeDButton>
          </div>
        )}
      </GlassCard>
      
      <p className="mt-8 text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">
        SnapQuizGame Premium Member
      </p>
    </div>
  );
};

export default PaymentSuccessPage;
