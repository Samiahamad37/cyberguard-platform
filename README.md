# CyberGuard AI

AI-powered cybersecurity platform for detecting, analyzing, and responding to cyber threats.

## Stack

- **Next.js** (App Router) — UI + `/api/v1` backend routes
- TypeScript, Tailwind, Zustand, Axios
- JWT auth (`jose`) + password hashing (`bcryptjs`)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

See [DEPLOY.md](./DEPLOY.md). One project hosts both the website and the API.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

## Architecture

```
app/            # Pages + API routes (app/api/v1/*)
lib/server/     # Auth, DB store, scanners
services/       # Frontend API clients
components/     # UI
stores/         # Zustand
backend/        # Legacy FastAPI (optional, not needed for Vercel)
```
