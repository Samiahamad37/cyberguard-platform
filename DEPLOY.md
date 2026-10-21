# Deploy CyberGuard AI fully on Vercel

The app now uses **Next.js API routes** (`/api/v1/*`) — frontend and backend are one project.

## Deploy

1. Push code to GitHub
2. Open https://vercel.com/new and import the repo
3. Add environment variables (Vercel → Settings → Environment Variables), see the table below
4. Deploy

## Environment variables

| Variable | Required | What it does |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** (production) | Postgres (Neon) connection string. Stores users (`cyberguard_users`) and each user's alerts, devices and timeline (`cyberguard_alerts`, `cyberguard_devices`, `cyberguard_timeline`). Tables are created automatically on first use. |
| `AUTH_SECRET` | **Yes** (production) | Long random string used to sign login tokens. |
| `VIRUSTOTAL_API_KEY` | Optional | Enables VirusTotal v3 lookups for file hashes, uploaded files (by SHA-256) and URLs in the Malware Scanner and Phishing Detection. Without it those tools run heuristic analysis only. |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Optional | Enables Google Safe Browsing v4 URL checks in Phishing Detection and the Malware Scanner's URL check. |
| `ABUSEIPDB_API_KEY` | Optional | Fills the "High-Risk IP Addresses" panel on Threat Intelligence from the AbuseIPDB blacklist. Without it the panel shows "Connect a data source". |
| `ABUSE_CH_AUTH_KEY` | Optional | Fills "Active Malware Families" on Threat Intelligence from abuse.ch MalwareBazaar recent samples. Without it the panel shows "Connect a data source". |

No key is needed for the CISA Known Exploited Vulnerabilities feed (Threat Intelligence) or the Website Scanner, which inspects the site live.

That’s it. No separate FastAPI/Render service needed.

## Local

```bash
npm install
npm run dev
```

Open http://localhost:3000

API lives at `/api/v1/...` on the same origin.

## Notes

- **User accounts need a database on Vercel.** Set `DATABASE_URL` to a Postgres (Neon) connection string in Vercel → Settings → Environment Variables, then redeploy. The `cyberguard_users` table is created automatically on first use. Without `DATABASE_URL`, users fall back to `data/users.json` locally and `/tmp/cyberguard-users.json` on Vercel, which is wiped between serverless instances (logins then fail with "User not found").
- New accounts start empty: alerts, timeline and dashboard numbers come only from that user's own scans and device inventory.
- Device scans are TCP connection checks to common ports run from the server. On Vercel, private LAN addresses (10.x, 192.168.x) are not reachable, so add public IPs/hostnames, or self-host to scan a local network.
- The old `backend/` FastAPI folder is optional/legacy and not required for Vercel.
