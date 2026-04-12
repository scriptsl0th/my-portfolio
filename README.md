# Aziz Dridi — Portfolio (Angular 21 + Express)

Modern dark-theme developer portfolio with a full Express backend for Spotify Now Playing and Brevo email.

---

## Quick Start

```bash
npm install

# Dev (Angular + Express together, with API proxy)
npm run dev

# Angular only (no backend)
npm start

# Express server only
npm run start:server
```

---

## Project Structure

```
aziz-portfolio/
├── src/                          # Angular frontend
│   └── app/
│       ├── components/
│       │   ├── home/
│       │   │   ├── hero/           # Typewriter + OS terminal modal
│       │   │   ├── about-me/       # Stats, certs, live GitHub stats
│       │   │   ├── experience/     # Tabbed job switcher
│       │   │   ├── projects/       # Project cards grid
│       │   │   ├── skills/         # Tech stack icon grid
│       │   │   └── contact/        # Form → POST /api/contact
│       │   ├── layout/
│       │   │   ├── navbar/         # Sticky nav with Now Playing pill
│       │   │   ├── now-playing/    # Spotify widget → GET /api/spotify/now-playing
│       │   │   ├── footer/
│       │   │   ├── back-to-top/
│       │   │   └── reading-progress/
│       │   ├── ui/
│       │   │   └── terminal-modal/ # OS neofetch terminal popup
│       │   ├── directives/         # click-outside, spotlight
│       │   └── pipes/              # read-time
│       ├── lib/
│       │   ├── spotify/            # Angular polling service (client)
│       │   ├── github/             # GitHub stats service
│       │   ├── theme/              # Dark/light theme
│       │   └── content-metadata/   # OS_INFO (Debian, Ubuntu)
│       └── pages/home/             # Root page component
│
├── server/                       # Express backend
│   ├── main.ts                   # Entry point — serves API + static in prod
│   ├── services/
│   │   ├── spotify.service.ts    # Spotify OAuth token + now-playing fetch
│   │   └── email.service.ts      # Brevo SMTP — notify + auto-reply
│   ├── routes/api/
│   │   ├── spotify/now-playing.ts  # GET  /api/spotify/now-playing
│   │   └── contact/index.ts        # POST /api/contact
│   └── get-spotify-token.ts      # One-time helper to get refresh token
│
├── proxy.conf.json               # Dev proxy: /api → localhost:3000
├── .env                          # Environment variables (fill before running)
└── tsconfig.server.json          # TypeScript config for server
```

---

## Environment Variables

Fill `.env` before starting:

```dotenv
# ── Spotify ──────────────────────────────────────────────
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

# ── Brevo SMTP ───────────────────────────────────────────
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
SMTP_FROM_NAME=

# ── Server ───────────────────────────────────────────────
PORT=3000
NODE_ENV=development
```

---

## Spotify Setup (one-time)

1. Create an app at https://developer.spotify.com/dashboard
2. Add `http://localhost:3000/callback` to Redirect URIs
3. Copy **Client ID** and **Client Secret** into `.env`
4. Run the helper:
   ```bash
   npx tsx server/get-spotify-token.ts
   ```
5. Follow the prompts — paste the resulting `refresh_token` into `.env`

That's it. The server handles token refresh automatically from that point on.

---

## Brevo Setup

1. Sign up at https://www.brevo.com
2. Go to **SMTP & API → SMTP** and copy credentials into `.env`
3. Set `SMTP_FROM_EMAIL` to a verified sender address

When someone submits the contact form:
- You receive a notification email with their name, email, and message
- They receive the terminal-style auto-reply immediately

---

## Production Deployment

```bash
# 1. Build Angular
npm run build
# Output → dist/aziz-portfolio/browser/

# 2. Start Express (serves API + static files)
NODE_ENV=production npm run start:server
```

The Express server in production mode:
- Serves the Angular build as static files
- Falls back to `index.html` for all non-API routes (SPA routing)
- Exposes `/api/spotify/now-playing` and `/api/contact`

Deploy to any Node.js host: Railway, Render, Fly.io, DigitalOcean App Platform.

---

## Adding More OS Entries (Terminal Modal)

Edit `src/app/lib/content-metadata/content-metadata.ts` and add to `OS_INFO`:

```ts
{
  name: 'arch',
  label: 'Arch Linux',
  version: 'Arch Linux x86_64',
  kernel: '6.12.1-arch1-1',
  shell: 'fish 3.7.1',
  uptime: '3 days, 14 hours',
  packages: '1203 (pacman)',
  memory: '4.2 GiB / 16 GiB',
  cpu: 'AMD Ryzen 9 7900X',
  hostname: 'aziz@arch-beast',
  color: '#1793d1',
  icon: '🔷',
}
```
