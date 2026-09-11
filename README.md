# Smriti Setu — Actual One

Dementia-friendly home-page frontend for the Smriti Setu hackathon project.

## Run in VS Code

1. Open this folder in VS Code.
2. Open Terminal.
3. Run:

```bash
npm install
npm run dev
```

4. Open the localhost address shown by Vite.

## Structure

- `index.html`
- `package.json`
- `src/App.jsx`
- `src/main.jsx`
- `src/Home.css`

The four home-page buttons and the persistent footer already navigate between sections using URL hashes. Replace the placeholder sections in `src/App.jsx` with the real pages as you build them.

## Firebase setup for Play with Friends

The app runs safely in local demo mode when Firebase is not configured. To enable cross-device authentication, chat, offline sync, and multiplayer rooms:

1. Create a Firebase project and register a Web app.
2. Enable **Authentication → Sign-in method → Anonymous**.
3. Create a Cloud Firestore database.
4. Copy `.env.example` to `.env.local` and fill in the Firebase Web configuration values.
5. Deploy `firestore.rules` using the Firebase CLI or paste the rules into the Firebase console.
6. Restart the Vite development server.

The connection banner on **Activities → Play with Friends** will change from “Demo mode” to “Firebase connected” when authentication and Firestore initialization succeed. Never commit `.env` or `.env.local`.

## Bhashini translation

The preferred-language screen supports Assamese, Bengali, Bodo, Manipuri, Khasi, Mizo and Nepali. A secure Firebase HTTPS function is included in `functions/index.js`; it performs Bhashini's pipeline-config and compute calls without exposing credentials to the browser.

Authenticate the Firebase CLI, then configure the three required secrets and deploy:

```sh
firebase login
firebase functions:secrets:set BHASHINI_USER_ID
firebase functions:secrets:set BHASHINI_ULCA_API_KEY
firebase functions:secrets:set BHASHINI_PIPELINE_ID
firebase deploy --only functions,firestore:rules
```

Set `VITE_BHASHINI_PROXY_URL` to the deployed `translate` function URL and rebuild the app. Until this URL and valid Bhashini credentials are present, the interface keeps its local core-language labels and preserves other text in English.

## Multiplayer testing

Multiplayer requires two different Firebase users. Use two devices, two different browser profiles, or `localhost` and `127.0.0.1` during development. Exchange the six-character invite codes, accept the request, then send a game invitation from the chat. With only one user, use **Play solo instead**.


Speech-to-text uses the browser Web Speech API. Chrome and Edge provide the best support; the microphone button appears beside the Play with Friends chat experience.
