# SrijanAI

SrijanAI is a React + Vite content planning app with an AI proxy backend. It creates monthly content calendars, supports creator-platform memory, continues a series month over month, and generates platform-specific post copy.

## What It Does

- Creates monthly content plans per `creator + platform`
- Continues a series with memory, theme evolution, and duplicate prevention
- Supports Instagram, YouTube, LinkedIn, and Twitter/X planning flows
- Generates hooks, captions, hashtags, CTAs, and platform notes
- Stores plans and memory in browser local storage
- Uses a backend proxy with multi-provider AI fallback

## Local Development

### Prerequisites

- Node.js 18+
- npm
- API keys configured in `server/.env`

### Install

```bash
npm install
cd server
npm install
cd ..
```

### Configure Backend

Create `server/.env` with the providers you want to use:

```env
GROQ_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
PORT=3001
```

### Run

Backend:

```bash
cd server
npm start
```

Frontend:

```bash
npm run dev
```

App URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend health: `http://localhost:3001/health`

## Project Structure

```text
d:\SrijanAI
├── ai-content-planner.jsx
├── src
│   ├── contentEngine.js
│   └── main.jsx
├── server
│   ├── server.js
│   ├── test-api.js
│   ├── package.json
│   └── README.md
├── api
│   ├── generate.js
│   └── _lib\aiProxy.js
├── VERCEL-DEPLOYMENT.md
└── README.md
```

## Key Runtime Notes

- In local dev, the frontend uses the backend proxy on `http://localhost:3001`
- Vite also proxies `/api` and `/health` to the backend during dev
- In production, the app can use same-origin serverless routes under `/api`

## Documentation Kept

- `README.md` - product overview and local setup
- `server/README.md` - backend behavior and debugging
- `VERCEL-DEPLOYMENT.md` - deployment notes

## Verification

Production build:

```bash
node .\node_modules\vite\bin\vite.js build
```

Backend proxy test:

```bash
node server\test-api.js
```
