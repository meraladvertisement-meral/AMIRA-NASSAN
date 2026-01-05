
import React from 'react';
import { Language } from '../../i18n';

interface RefundPolicyProps {
  lang: Language;
}

export const RefundPolicy: React.FC<RefundPolicyProps> = ({ lang }) => {
  const isDe = lang === 'de';

  const billingPolicyContent = {
    en: {
      title: "Billing Policy (Fair Use)",
      summary: "The 'Unlimited' plan is provided for fair personal use on a single account. This means users can play without a fixed limit, subject to fair use policies to prevent abuse such as bots or account sharing.",
      order: "Order of Consumption: Daily Free Credits → Play Packs → Subscription."
    },
    de: {
      title: "Abrechnungsrichtlinie (Fair Use)",
      summary: "Der 'Unlimited'-Plan wird für die angemessene persönliche Nutzung auf einem einzelnen Konto bereitgestellt. Dies bedeutet, dass Nutzer ohne festes Limit spielen können, unter Vorbehalt der Fair-Use-Richtlinien zur Vermeidung von Missbrauch wie Bots oder Account-Sharing.",
      order: "Reihenfolge des Verbrauchs: Tägliches Gratis-Guthaben → Play Packs → Abonnement."
    }
  };

  const policy = billingPolicyContent[lang] || billingPolicyContent.en;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-brand-lime underline uppercase tracking-tighter">
        {isDe ? 'Widerrufs- & Rückerstattungsrichtlinie' : 'Withdrawal & Refund Policy'}
      </h3>
      
      <div className="space-y-2 text-sm text-white/80">
        <p className="font-bold">
          {isDe ? '14-tägiges Widerrufsrecht (Deutschland/EU)' : '14-Day Right of Withdrawal (Germany/EU)'}
        </p>
        <p>
          {isDe 
            ? 'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.' 
            : 'You have the right to withdraw from this contract within 14 days without giving any reason.'}
        </p>
        
        <p className="mt-4 font-bold text-brand-gold">
          {isDe ? 'Abonnements:' : 'Subscriptions:'}
        </p>
        <p>
          {isDe 
            ? 'Wenn Sie den sofortigen Beginn angefordert haben, ziehen wir eine Nutzungsentschädigung von Ihrer Rückerstattung ab, basierend auf:' 
            : 'If you requested immediate start, we will deduct usage compensation from your refund based on:'}
        </p>
        <ul className="list-disc pl-5">
          <li>{isDe ? 'Plus: Genutzte Spiele im Verhältnis zur monatlichen Quote.' : 'Plus: Plays used relative to monthly quota.'}</li>
          <li>{isDe ? 'Unlimited: Verstrichene Tage im aktuellen Abrechnungszeitraum.' : 'Unlimited: Days elapsed during the current billing period.'}</li>
        </ul>

        <p className="mt-4 font-bold text-brand-gold">
          {isDe ? 'Play Packs:' : 'Play Packs:'}
        </p>
        <p>
          {isDe 
            ? 'Durch die Zustimmung zur sofortigen Lieferung erkennen Sie an, dass Sie das Widerrufsrecht verlieren, sobald die digitalen Credits Ihrem Konto gutgeschrieben wurden.' 
            : 'By agreeing to immediate supply, you acknowledge that you lose the right of withdrawal once the digital credits are added to your account.'}
        </p>
        
        <p className="mt-4">
          {isDe ? 'Um Ihr Recht auszuüben, kontaktieren Sie ' : 'To exercise your right, contact '}
          <span className="underline">digitalsecrets635@gmail.com</span> 
          {isDe ? ' mit Ihren Kontodaten.' : ' with your account details.'}
        </p>
      </div>

      <div className="mt-6 p-4 border border-white/10 rounded-xl bg-white/5">
        <h4 className="font-bold mb-2 text-brand-lime">{policy.title}</h4>
        <div className="text-xs text-white/60 leading-relaxed space-y-2">
          <p>{policy.summary}</p>
          <p className="font-bold text-brand-gold italic">{policy.order}</p>
        </div>
      </div>
    </div>
  );
};
