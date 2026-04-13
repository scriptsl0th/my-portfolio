# Aziz Dridi — Portfolio (Angular 21 + Vercel Serverless)

Modern dark-theme developer portfolio deployed as a static Angular frontend + Vercel serverless API functions.

---

## Architecture

```
Vercel deployment
├── dist/portfolio/browser/        ← Angular static files (served by Vercel CDN)
├── api/
│   ├── spotify/now-playing.ts     ← GET  /api/spotify/now-playing  (serverless)
│   └── contact/index.ts           ← POST /api/contact              (serverless)
└── vercel.json                    ← routing rules
```

---

## Deploy to Vercel (3 steps)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "init"
gh repo create my-portfolio --public --push --source=.
```

### 2. Import on Vercel

Go to https://vercel.com/new → **Import** your repo.

Vercel auto-detects the config from `vercel.json`. No framework preset needed — leave it as **Other**.

### 3. Add Environment Variables

In **Vercel → Project → Settings → Environment Variables**, add:

| Key | Value |
|-----|-------|
| `SPOTIFY_CLIENT_ID` | from Spotify dashboard |
| `SPOTIFY_CLIENT_SECRET` | from Spotify dashboard |
| `SPOTIFY_REFRESH_TOKEN` | see Spotify Setup below |
| `SPOTIFY_REDIRECT_URI` | `https://your-domain.vercel.app/callback` |
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | from Brevo SMTP settings |
| `SMTP_PASS` | from Brevo SMTP settings |
| `SMTP_FROM_EMAIL` | verified sender address |
| `SMTP_FROM_NAME` | `Aziz Dridi` |

Click **Deploy** — done. Vercel builds Angular and deploys the API functions automatically.

---

## Local Development

```bash
npm install

# Run Angular dev server + Express backend together
npm run dev
# Angular → http://localhost:4200
# Express → http://localhost:3001
# /api/* is proxied from 4200 → 3001 via proxy.conf.json
```

---

## Spotify Setup (one-time)

1. Create an app at https://developer.spotify.com/dashboard
2. Add your redirect URI (e.g. `http://127.0.0.1:3001/callback` for local, your Vercel URL for prod)
3. Fill `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env`
4. Run the helper to get your refresh token:
   ```bash
   npx tsx server/get-spotify-token.ts
   ```
5. Paste the `refresh_token` into `.env` (and into Vercel env vars)

---

## Brevo Setup

1. Sign up at https://www.brevo.com
2. Go to **SMTP & API → SMTP** → copy credentials
3. Add them to Vercel environment variables (or `.env` for local dev)

---

## Project Structure

```
src/app/
├── components/
│   ├── home/        hero · about-me · experience · projects · skills · contact
│   ├── layout/      navbar · now-playing · footer · back-to-top · reading-progress
│   ├── ui/          terminal-modal (OS neofetch popup)
│   ├── directives/  click-outside · spotlight
│   └── pipes/       read-time
├── lib/
│   ├── spotify/     Angular polling service → /api/spotify/now-playing
│   ├── github/      Live GitHub stats
│   ├── theme/       Dark/light toggle
│   └── content-metadata/  OS_INFO (Debian, Ubuntu terminal modal)
└── pages/home/      Root page
```
