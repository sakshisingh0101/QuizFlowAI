# QuizFlow AI — Frontend

The client for QuizFlow AI — a real-time, AI-powered quiz classroom. Teachers generate quizzes with AI and run live sessions; students join with a room code and compete on a live leaderboard.

**Live app:** https://quiz-flow-ai-dun.vercel.app
**Backend repo:** https://github.com/sakshisingh0101/QuizFlowAI_backend

---

## Tech stack

| Layer | Choice |
|---|---|
| Build tool | Vite |
| Framework | React |
| Styling | Tailwind CSS v4 |
| Routing | React Router |
| HTTP client | Axios |
| Real-time | Socket.IO client |

### A note on structure
API calls, state, and UI are deliberately kept in separate layers rather than mixed into components:

```
src/
├── api/              Axios instance + one file per resource (auth.api.js, quiz.api.js, ...)
│                       — knows endpoint shapes, nothing else
├── context/           Global state (AuthContext, later SocketContext)
│                       — knows state logic, not how data is fetched
├── pages/             Route-level components — UI + form handling only
├── components/        Reusable UI pieces
```

This mirrors the separation used on the backend (controllers vs. services): a component shouldn't need to know *how* a login request is made, only that `loginUser(formData)` exists and returns a promise. If an endpoint or auth strategy changes, only the `api/` layer changes — components and context are untouched.

### Why Context API and not Redux/Zustand
The global state here is genuinely small — who's logged in, and later, the active Socket.IO connection. Live-quiz state (current question, timer, leaderboard) is scoped to the session page itself via local component state, since nothing outside that page needs it. Context is the right-sized tool for this; reaching for Redux here would be unjustified complexity for the amount of shared state actually present.

---

## Features

- Email/password registration with role selection (teacher / student) and optional avatar upload
- OTP email verification flow
- Persistent login via httpOnly cookies (session restored on refresh through a `/users/me` check)
- Teacher: create a quiz by describing a topic — questions are AI-generated, then previewable/editable before going live
- Teacher: start a live session, get a shareable room code, control question pacing, watch live answer counts and the leaderboard update in real time
- Student: join a session via room code, answer questions against a live timer, see leaderboard standing update live
- Post-quiz AI-generated class performance summary (accuracy, strong/weak areas, recommendation)

---

## Running locally

```bash
npm install
npm run dev
```

### Environment variables

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

Point these at the deployed backend (`https://quizflowai-backend.onrender.com`) to run the frontend against production data instead of a local backend.

---

## Design notes

Styling follows a clean, light SaaS aesthetic — indigo accent, white cards on an off-white background, Inter typeface. Tailwind v4 is configured via `@theme` directly in CSS rather than a `tailwind.config.js` (the config-file approach was removed in v4 in favor of CSS-native theme tokens).

---

## License

MIT
