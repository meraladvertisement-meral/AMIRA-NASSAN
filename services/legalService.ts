
import { Language } from '../i18n';

export type LegalDocType = 'terms' | 'privacy' | 'impressum' | 'contact' | 'affiliate';

export const legalService = {
  getContent(type: LegalDocType, lang: Language) {
    const contents = {
      en: {
        terms: `
          <h2 class="text-xl font-bold mb-4">Terms of Use (AGB)</h2>
          <p class="mb-4">Welcome to SnapQuizGame. By using our service, you agree to these Terms and Conditions.</p>
          
          <h3 class="font-bold text-brand-lime">1. Subscription & Cancellation</h3>
          <p class="mb-4">Our "Plus" and "Unlimited" plans are subscription-based. You can <strong>cancel anytime</strong> through your account settings or by contacting our support team. Upon cancellation, your access remains active until the end of the current billing period.</p>
          
          <h3 class="font-bold text-brand-lime">2. AI Content Generation</h3>
          <p class="mb-4">SnapQuizGame utilizes Google Gemini AI to transform your materials into quizzes. While we strive for accuracy, educational content is generated automatically and should be verified for critical learning purposes.</p>
          
          <h3 class="font-bold text-brand-lime">3. Play Packs</h3>
          <p class="mb-4">Play Packs are one-time purchases. They do not expire but are non-refundable once any portion of the credits has been used.</p>
          
          <h3 class="font-bold text-brand-lime">4. Fair Use Policy</h3>
          <p class="mb-4">Unlimited plans are subject to a Fair Use Policy to prevent automated abuse (bots) and account sharing. We reserve the right to limit usage if suspicious activity is detected.</p>
        `,
        privacy: `
          <h2 class="text-xl font-bold mb-4">Privacy Policy</h2>
          <p class="mb-4">This policy explains how we collect, use, and protect your personal data in compliance with GDPR.</p>
          
          <h3 class="font-bold text-brand-lime">1. Data Controller</h3>
          <p class="mb-4">The data controller for this application is Frau Nassan, Kippenbergstraße 26, 04317 Leipzig, Germany.</p>
          
          <h3 class="font-bold text-brand-lime">2. Data We Collect</h3>
          <p class="mb-4"><strong>Account Data:</strong> We store your name and email provided via Google Sign-In to manage your subscription and history.<br>
          <strong>Content Data:</strong> Text/PDFs uploaded for quiz generation are processed via Google Gemini API. We do not store this raw content permanently after the quiz is generated.</p>
          
          <h3 class="font-bold text-brand-lime">3. Your Your Rights</h3>
          <p class="mb-4">You have the right to access, correct, or delete your personal data at any time. Contact us at info@snapquizgame.app for data requests.</p>
        `,
        impressum: `
          <h2 class="text-xl font-bold mb-4">Impressum</h2>
          <div class="space-y-4">
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Provider / Anbieterin</p>
              <p>Frau Nassan</p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Address / Adresse</p>
              <p>Kippenbergstraße 26<br>04317 Leipzig<br>Deutschland</p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Contact / Kontakt</p>
              <p>E-Mail: <span class="text-white underline">info@snapquizgame.app</span></p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Business Form / Unternehmensform</p>
              <p>Einzelunternehmerin (Gewerbe)</p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">W-IdNr / VAT ID</p>
              <p>DE453051120</p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Registry Number / Registernummer</p>
              <p>14713000</p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Responsible for content / Verantwortlich</p>
              <p>Frau Nassan</p>
            </div>
          </div>
        `,
        contact: `
          <h2 class="text-xl font-bold mb-4">Contact & Support</h2>
          <p>We are here to help you with any questions or technical issues.</p>
          <div class="mt-6 p-6 glass rounded-2xl border-brand-lime/20">
            <p class="text-brand-lime font-bold mb-2">Frau Nassan</p>
            <p class="text-white/80">Kippenbergstraße 26<br>04317 Leipzig</p>
            <p class="mt-4 font-mono text-sm">Email: info@snapquizgame.app</p>
          </div>
        `,
        affiliate: `
          <h2 class="text-xl font-bold mb-4 italic">Affiliate & Referral Policy</h2>
          <h3 class="font-bold text-brand-lime uppercase text-[10px] tracking-widest mb-2">A) Free Referral Plays</h3>
          <p class="mb-4">1) <strong>Reward:</strong> You receive +2 Bonus Plays for every friend who joins via your link and completes a quiz.<br>
          2) <strong>Abuse:</strong> We monitor for multi-account abuse. Bonus plays may be revoked if fraud is detected.</p>
          
          <h3 class="font-bold text-brand-lime uppercase text-[10px] tracking-widest mb-2">B) Paid Affiliate Commissions</h3>
          <p class="mb-4">1) <strong>Commission:</strong> Earn a fixed €3.00 for every new paid subscription referred.<br>
          2) <strong>Review (Anti-Fraud):</strong> Commissions are reviewed manually. Earnings appear as "Pending" first and become "Available" only after manual verification to prevent fraud.<br>
          3) <strong>Exclusions:</strong> No commission is paid on one-time Play Packs purchases.<br>
          4) <strong>Payout:</strong> Minimum payout threshold is €20.00. Contact us at info@snapquizgame.app for payment setup.</p>
        `
      },
      de: {
        terms: `
          <h2 class="text-xl font-bold mb-4">Allgemeine Geschäftsbedingungen (AGB)</h2>
          <p class="mb-4">Willkommen bei SnapQuizGame. Durch die Nutzung unseres Dienstes erklären Sie sich mit diesen Bedingungen einverstanden.</p>
          
          <h3 class="font-bold text-brand-lime">1. Abonnement & Kündigung</h3>
          <p class="mb-4">Unsere Pläne "Plus" und "Unlimited" sind abonnementbasiert. Sie können <strong>jederzeit kündigen</strong> über Ihre Kontoeinstellungen oder per E-Mail an den Support.</p>
        `,
        privacy: `
          <h2 class="text-xl font-bold mb-4">Datenschutzerklärung</h2>
          <p class="mb-4">Diese Richtlinie erläutert, wie wir Ihre personenbezogenen Daten gemäß der DSGVO erheben, verwenden und schützen.</p>
        `,
        impressum: `
          <h2 class="text-xl font-bold mb-4">Impressum</h2>
          <div class="space-y-4">
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Anbieterin</p>
              <p>Frau Nassan</p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Adresse</p>
              <p>Kippenbergstraße 26<br>04317 Leipzig<br>Deutschland</p>
            </div>
          </div>
        `,
        contact: `
          <h2 class="text-xl font-bold mb-4">Kontakt & Support</h2>
          <p>Wir helfen Ihnen gerne bei Fragen oder technischen Problemen weiter.</p>
        `,
        affiliate: `
          <h2 class="text-xl font-bold mb-4 italic">Partnerprogramm & Empfehlungsrichtlinien</h2>
          <h3 class="font-bold text-brand-lime uppercase text-[10px] tracking-widest mb-2">A) Gratis-Spiele</h3>
          <p class="mb-4">Sie erhalten +2 Bonus-Spiele für jeden Freund, الذي tritt über Ihren Link bei und schließt ein Quiz ab.</p>
          
          <h3 class="font-bold text-brand-lime uppercase text-[10px] tracking-widest mb-2">B) Bezahlte Partner-Provision</h3>
          <p class="mb-4">1) <strong>Provision:</strong> €3.00 für jedes neue kostenpflichtige Abonnement.<br>
          2) <strong>Prüfung:</strong> Provisionen werden manuell geprüft (Anti-Betrug). Sie erscheinen erst als "Ausstehend" und werden nach Freigabe "Verfügbar".<br>
          3) <strong>Auszahlung:</strong> Mindestbetrag €20.00.</p>
        `
      }
    };

    return contents[lang][type] || contents['en'][type];
  }
};
