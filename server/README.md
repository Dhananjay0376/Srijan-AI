# SrijanAI Backend

The backend is an Express proxy that accepts frontend AI requests, calls available model providers in fallback order, and returns a normalized response shape to the app.

## Responsibilities

- Keeps provider API keys out of the frontend
- Avoids direct browser-to-provider CORS issues
- Tries providers in fallback order
- Returns a shared response format for the UI
- Exposes a health endpoint for local checks

## Fallback Order

1. Groq
2. Gemini
3. OpenRouter
4. Anthropic

## Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
GROQ_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
PORT=3001
```

## Run

```bash
npm start
```

Dev mode with auto-reload:

```bash
npm run dev
```

## Endpoints

- `POST /api/generate`
- `GET /health`

## Health Check

```bash
curl http://localhost:3001/health
```

Expected response includes provider availability flags.

## Local Test

From the repo root:

```bash
node server\test-api.js
```

This checks:

- backend reachability
- title generation path
- normalized provider response handling

## Request Shape

`POST /api/generate`

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 500,
  "system": "system prompt",
  "messages": [
    { "role": "user", "content": "prompt body" }
  ]
}
```

## Response Shape

Successful responses are normalized to a Claude-style structure:

```json
{
  "content": [
    { "type": "text", "text": "..." }
  ],
  "model": "provider-model",
  "role": "assistant",
  "provider": "groq"
}
```

## Relevant Files

- `server.js` - local Express server
- `..\api\generate.js` - production/serverless route
- `..\api\_lib\aiProxy.js` - provider fallback logic
- `test-api.js` - local backend smoke test
