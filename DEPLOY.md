# Deploy CyberGuard AI fully on Vercel

The app now uses **Next.js API routes** (`/api/v1/*`) — frontend and backend are one project.

## Deploy

1. Push code to GitHub
2. Open https://vercel.com/new and import the repo
3. Add environment variable (optional but recommended):
   - `AUTH_SECRET` = a long random string
4. Deploy

That’s it. No separate FastAPI/Render service needed.

## Local

```bash
npm install
npm run dev
```

Open http://localhost:3000

API lives at `/api/v1/...` on the same origin.

## Notes

- User accounts are stored in `data/users.json` locally, and `/tmp/cyberguard-users.json` on Vercel (ephemeral on free serverless — for demos). For durable production users later, plug in Postgres/Neon.
- The old `backend/` FastAPI folder is optional/legacy and not required for Vercel.
