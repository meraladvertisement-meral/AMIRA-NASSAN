
# SnapQuizGame

A production-ready AI-powered quiz application that transforms content into interactive challenges.

## Features
- **AI Generation**: Convert Text, PDF, or Images into quizzes using Google Gemini.
- **Game Modes**: 
  - Solo: Learn at your own pace.
  - Duel: 1v1 live WebRTC-based battle.
  - Teacher: Host live sessions for multiple students.
- **Reward System**: Pop balloons after scoring 60%+.
- **History**: Local storage of the last 10 quizzes.
- **PDF Artifacts**: Generate printable exams from quizzes.
- **Monetization**: Tiered subscriptions and Play Packs (Mock logic included).

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS.
- **AI**: Google GenAI SDK (Gemini).
- **P2P Networking**: PeerJS (WebRTC).
- **PDF Generation**: jsPDF.
- **Persistence**: LocalStorage (History), Firebase (Auth & Firestore).

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- A Google Cloud Project with Gemini API enabled.
- A Firebase Project.

### 2. Environment Variables
Create a `.env` file in the root:
```env
API_KEY=YOUR_GEMINI_API_KEY
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### 3. Installation
```bash
npm install
npm run dev
```

### 4. Firebase Configuration
Enable **Google Authentication** and **Cloud Firestore** in your Firebase console.

### 5. PeerJS
The app uses the default PeerJS public cloud server. For production, consider hosting your own PeerServer.

## Production Roadmap
1. **Stripe Integration**: Connect the billing scaffold to real Stripe Checkout sessions via Firebase Functions.
2. **Affiliate Ledger**: The app records referral activations; set up a monthly cron to approve pending commissions.
3. **Asset Hosting**: Replace placeholder audio/image URLs with CDN-hosted assets.

## Credits
Built by SnapQuiz Engineering Team.
- Audio: Mixkit, SoundHelix.
- UI: Tailwind Glassmorphism.
