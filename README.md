# CyberGuard AI

AI-powered cybersecurity platform for detecting, analyzing, and responding to cyber threats.

**Location:** `D:\cyberguard-ai`

## Stack

- Next.js (App Router) + TypeScript + React
- Tailwind CSS + shadcn/ui-style components
- Framer Motion, Recharts, Zustand
- React Hook Form + Zod
- Axios client prepared for FastAPI

## Features

- Landing page (hero, features, benefits, pricing, testimonials, FAQ)
- Auth: login, register, forgot password, 2FA UI, session store
- Dashboard with security score, alerts, charts, threat timeline
- Phishing detection, malware scanner, website security scanner
- Threat intelligence, AI assistant, reports, alerts center
- Device management and user settings

## Getting Started

```bash
cd D:\cyberguard-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build       |
| `npm run start` | Start production server|
| `npm run lint`  | Run ESLint             |

## Architecture

```
app/           # App Router pages (landing, auth, dashboard)
components/    # UI, layout, charts, shared widgets
features/      # Feature-specific UI modules
services/      # API service layer (mock → FastAPI-ready)
stores/        # Zustand state
lib/           # Utils, validations, constants, mock data
types/         # Shared TypeScript types
hooks/         # React hooks
utils/         # Helper re-exports
```

## API Integrations (prepared)

Service modules use mock JSON responses today and are structured for:

- OpenAI API
- VirusTotal API
- AbuseIPDB API
- URLScan.io API
- Have I Been Pwned API
- Shodan API
- Google Safe Browsing API

Configure keys via `.env.local` (see `.env.example`). Point `NEXT_PUBLIC_API_BASE_URL` at your FastAPI backend when ready.

## Demo notes

- Auth is mocked locally via Zustand persistence
- 2FA accepts any 6-digit code
- Scanners return simulated AI analysis results
