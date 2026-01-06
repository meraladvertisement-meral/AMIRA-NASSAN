# SnapQuizGame

A production-ready AI-powered quiz application that transforms content into interactive challenges.

## Features
- **AI Generation**: Convert Text, PDF, or Images into quizzes using Google Gemini via Netlify Functions.
- **Game Modes**: 
  - Solo: Learn at your own pace.
  - Duel: 1v1 live WebRTC-based battle.
  - Teacher: Host live sessions for multiple students.
- **Reward System**: Pop balloons after scoring 60%+.
- **History**: Local storage of the last 10 quizzes.
- **PDF Artifacts**: Generate printable exams from quizzes.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS.
- **Backend**: Netlify Functions (Node.js).
- **AI**: Google Gemini API.
- **P2P Networking**: PeerJS (WebRTC).
- **PDF Generation**: jsPDF.
- **Persistence**: LocalStorage (History), Firebase (Auth & Firestore).

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- Netlify CLI (`npm install -g netlify-cli`)
- A Google Cloud Project with Gemini API enabled.

### 2. Environment Variables
For local development using Netlify Dev:
Create a `.env` file in the root:
```env
API_KEY=YOUR_GEMINI_API_KEY
```

**IMPORTANT FOR PRODUCTION:**
Go to your Netlify Site Settings > Build & Deploy > Environment > Environment variables and add:
- `API_KEY`: Your Google Gemini API Key.

### 3. Installation & Local Development
```bash
npm install
# Use netlify dev to run both frontend and functions locally
netlify dev
```

### 4. How to test on Netlify
- **Verify SPA Routing**: Once deployed, navigate directly to `/join` or any sub-URL (e.g. `/?join=ABCDEF`) by typing it in the browser address bar. The Netlify redirect rule in `netlify.toml` ensures the page loads correctly instead of showing a 404/white page.
- **Verify Question Generation**: Open the app, select Solo mode, paste some text, and click "Generate Quiz". Ensure `API_KEY` is set in your Netlify dashboard environment variables.

## Credits
Built by SnapQuiz Engineering Team.