# Vercel Deployment

This app can run on Vercel using the serverless API route under `api/generate`.

## Required Environment Variables

Set these in the Vercel project:

```env
GROQ_API_KEY=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
APP_BASE_URL=https://your-domain.vercel.app
```

`APP_BASE_URL` is recommended so provider requests that require a referer use the deployed domain.

## Deploy Notes

- frontend requests use same-origin `/api/generate` in production
- local development still uses the backend proxy on `http://localhost:3001`
- the serverless handler delegates provider logic to `api/_lib/aiProxy.js`

## Verify After Deploy

Check health:

```text
https://your-domain.vercel.app/api/health
```

Then verify:

1. provider flags are present
2. calendar generation works
3. post generation works
4. continuation flow works

## Local Override

If you want the frontend to use a custom backend during development:

```env
VITE_API_BASE_URL=http://localhost:3001
```
