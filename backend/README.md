# CyberGuard AI Backend

FastAPI API for CyberGuard AI. Runs on port **8000** and serves `/api/v1/*`.

## Setup

```bash
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

## Run

```bash
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs  
Health: http://localhost:8000/health

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/register` | No |
| POST | `/api/v1/auth/login` | No |
| GET | `/api/v1/auth/me` | Bearer |
| POST | `/api/v1/auth/forgot-password` | No |
| POST | `/api/v1/auth/2fa/verify` | Bearer |
| POST | `/api/v1/phishing/analyze` | Bearer |
| POST | `/api/v1/phishing/analyze-url` | Bearer |
| POST | `/api/v1/malware/scan-file` | Bearer |
| POST | `/api/v1/malware/scan-hash` | Bearer |
| POST | `/api/v1/malware/scan-url` | Bearer |
| POST | `/api/v1/website/scan` | Bearer |
| POST | `/api/v1/assistant/chat` | Bearer |
| GET | `/api/v1/threat-intel` | Bearer |

Users are stored in SQLite (`cyberguard.db`). Analysis endpoints currently use heuristic engines (ready to swap for VirusTotal / OpenAI / etc.).
