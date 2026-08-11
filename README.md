# CyberGuard AI

AI-powered cybersecurity platform for detecting, analyzing, and responding to cyber threats.

**Location:** `D:\cyberguard-ai`

## Stack

- **Frontend:** Next.js (App Router) + TypeScript + React, Tailwind, Zustand, Axios
- **Backend:** FastAPI + SQLAlchemy + SQLite + JWT

## Getting Started

### 1. Backend

```bash
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd D:\cyberguard-ai
copy .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`NEXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:8000/api/v1`.

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `npm run dev` | Start frontend           |
| `npm run build` | Production build       |
| `npm run start` | Start production server|
| `npm run lint`  | Run ESLint             |

## Architecture

```
app/           # App Router pages (landing, auth, dashboard)
backend/       # FastAPI API (auth + scanners + threat intel)
components/    # UI, layout, charts, shared widgets
features/      # Feature-specific UI modules
services/      # Axios clients talking to FastAPI
stores/        # Zustand state
lib/           # Utils, validations, constants
types/         # Shared TypeScript types
```

## Auth

Register/login create real users in SQLite (`backend/cyberguard.db`) and return JWT tokens.
Scanners and threat intel require `Authorization: Bearer <token>`.

## Demo notes

- Analysis engines are heuristic (ready to plug in VirusTotal / OpenAI / etc.)
- 2FA accepts any 6-digit code (or `123456`)
- Forgot-password returns a safe generic message (no email send yet)
