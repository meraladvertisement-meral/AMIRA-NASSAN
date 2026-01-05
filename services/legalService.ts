
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
          
          <h3 class="font-bold text-brand-lime">3. Your Rights</h3>
          <p class="mb-4">You have the right to access, correct, or delete your personal data at any time. Contact us at digitalsecrets635@gmail.com for data requests.</p>
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
              <p>E-Mail: <span class="text-white underline">digitalsecrets635@gmail.com</span></p>
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
            <p class="mt-4 font-mono text-sm">Email: digitalsecrets635@gmail.com</p>
          </div>
        `,
        affiliate: `
          <h2 class="text-xl font-bold mb-4">Affiliate & Referral Policy</h2>
          <h3 class="font-bold text-brand-lime">A) Referral Rewards</h3>
          <p class="mb-4">1) <strong>Activation:</strong> A referral is activated when a friend joins via your link, signs in with Google, and completes their first quiz.<br>
          2) <strong>Reward:</strong> You receive +2 Bonus Plays for every activated referral.<br>
          3) <strong>Daily Cap:</strong> Rewards are capped at 5 activations per day. Additional activations are rolled over to the next day automatically.</p>
          
          <h3 class="font-bold text-brand-lime">B) Paid Affiliate Commission</h3>
          <p class="mb-4">1) <strong>Commission:</strong> Earn a fixed 3 € commission for every new paid subscription referred through your link.<br>
          2) <strong>Approval:</strong> Commissions are approved after a 30-day window, provided the subscription is not cancelled or refunded.<br>
          3) <strong>Payout:</strong> Minimum payout is 20 €. Contact support for payment arrangements.</p>
        `
      },
      de: {
        terms: `
          <h2 class="text-xl font-bold mb-4">Allgemeine Geschäftsbedingungen (AGB)</h2>
          <p class="mb-4">Willkommen bei SnapQuizGame. Durch die Nutzung unseres Dienstes erklären Sie sich mit diesen Bedingungen einverstanden.</p>
          
          <h3 class="font-bold text-brand-lime">1. Abonnement & Kündigung</h3>
          <p class="mb-4">Unsere Pläne "Plus" und "Unlimited" sind abonnementbasiert. Sie können <strong>jederzeit kündigen</strong> über Ihre Kontoeinstellungen oder per E-Mail an den Support. Nach der Kündigung bleibt Ihr Zugang bis zum Ende des aktuellen Abrechnungszeitraums aktiv.</p>
          
          <h3 class="font-bold text-brand-lime">2. KI-Inhaltserstellung</h3>
          <p class="mb-4">SnapQuizGame nutzt Google Gemini KI, um Ihre Materialien in Quizze zu verwandeln. Wir bemühen uns um Genauigkeit, jedoch werden Bildungsinhalte automatisch generiert und sollten überprüft werden.</p>
          
          <h3 class="font-bold text-brand-lime">3. Play Packs</h3>
          <p class="mb-4">Play Packs are Einmalkäufe. Sie laufen nicht ab, sind jedoch nicht erstattungsfähig, sobald ein Teil des Guthabens verbraucht wurde.</p>
        `,
        privacy: `
          <h2 class="text-xl font-bold mb-4">Datenschutzerklärung</h2>
          <p class="mb-4">Diese Richtlinie erläutert, wie wir Ihre personenbezogenen Daten gemäß der DSGVO erheben, verwenden und schützen.</p>
          
          <h3 class="font-bold text-brand-lime">1. Verantwortliche Stelle</h3>
          <p class="mb-4">Verantwortlich für die Datenverarbeitung ist Frau Nassan, Kippenbergstraße 26, 04317 Leipzig, Deutschland.</p>
          
          <h3 class="font-bold text-brand-lime">2. Erhobene Daten</h3>
          <p class="mb-4">Wir speichern Ihren Namen und Ihre E-Mail-Adresse (via Google Login), um Ihr Konto und Ihre Abonnements zu verwalten.</p>
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
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Kontakt</p>
              <p>E-Mail: <span class="text-white underline">digitalsecrets635@gmail.com</span></p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Unternehmensform</p>
              <p>Einzelunternehmerin (Gewerbe)</p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Wirtschafts-Identifikationsnummer (W-IdNr)</p>
              <p>DE453051120</p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Registernummer</p>
              <p>14713000</p>
            </div>
            <div>
              <p class="font-bold uppercase text-brand-lime text-[10px] tracking-widest">Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV</p>
              <p>Frau Nassan</p>
            </div>
          </div>
        `,
        contact: `
          <h2 class="text-xl font-bold mb-4">Kontakt & Support</h2>
          <p>Wir helfen Ihnen gerne bei Fragen oder technischen Problemen weiter.</p>
          <div class="mt-6 p-6 glass rounded-2xl border-brand-lime/20">
            <p class="text-brand-lime font-bold mb-2">Frau Nassan</p>
            <p class="text-white/80">Kippenbergstraße 26<br>04317 Leipzig</p>
            <p class="mt-4 font-mono text-sm">E-Mail: digitalsecrets635@gmail.com</p>
          </div>
        `,
        affiliate: `
          <h2 class="text-xl font-bold mb-4">Partnerprogramm & Empfehlungsrichtlinien</h2>
          <h3 class="font-bold text-brand-lime">A) Empfehlungs-Belohnungen</h3>
          <p class="mb-4">1) <strong>Aktivierung:</strong> Eine Empfehlung wird aktiviert, wenn ein Freund über Ihren Link beitritt, sich mit Google anmeldet und sein erstes Quiz abschließt.<br>
          2) <strong>Belohnung:</strong> Sie erhalten +2 Bonus-Spiele für jede aktivierte Empfehlung.<br>
          3) <strong>Tageslimit:</strong> Belohnungen sind auf 5 Aktivierungen pro Tag begrenzt. Weitere Aktivierungen werden automatisch auf den nächsten Tag übertragen.</p>
          
          <h3 class="font-bold text-brand-lime">B) Bezahlte Partner-Provision</h3>
          <p class="mb-4">1) <strong>Provision:</strong> Verdienen Sie eine feste Provision von 3 € für jedes neue kostenpflichtige Abonnement, das über Ihren Link vermittelt wurde.<br>
          2) <strong>Freigabe:</strong> Provisionen werden nach einer 30-tägigen Frist freigegeben, sofern das Abonnement nicht gekündigt oder erstattet wurde.<br>
          3) <strong>Auszahlung:</strong> Die Mindestauszahlung beträgt 20 €. Kontaktieren Sie den Support für Auszahlungsmodalitäten.</p>
        `
      }
    };

    return contents[lang][type] || contents['en'][type];
  }
};
