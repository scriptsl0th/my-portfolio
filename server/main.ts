import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import spotifyRouter  from './routes/api/spotify/now-playing';
import contactRouter  from './routes/api/contact/index';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '127.0.0.1';
const isProd = process.env.NODE_ENV === 'production';

// ── Middleware ──────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: isProd ? 'https://www.azizdridi.tn' : 'http://localhost:4200',
  methods: ['GET', 'POST'],
}));

// ── API routes ──────────────────────────────────────────
app.use('/api/spotify/now-playing', spotifyRouter);
app.use('/api/contact',             contactRouter);

if (!isProd) {
  app.get('/callback', (req, res) => {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const error = typeof req.query.error === 'string' ? req.query.error : '';

    res.type('html').send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Spotify Callback</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              margin: 0;
              min-height: 100vh;
              display: grid;
              place-items: center;
              background: #0f172a;
              color: #e2e8f0;
            }
            main {
              width: min(720px, calc(100vw - 32px));
              background: rgba(15, 23, 42, 0.92);
              border: 1px solid rgba(148, 163, 184, 0.18);
              border-radius: 16px;
              padding: 24px;
              box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
            }
            code, pre {
              white-space: pre-wrap;
              word-break: break-word;
              background: rgba(148, 163, 184, 0.12);
              padding: 12px;
              border-radius: 12px;
              display: block;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Spotify authorization received</h1>
            ${error ? `<p>Authorization failed: <strong>${error}</strong></p>` : `<p>Authorization code received.</p>`}
            ${code ? `<p>Code:</p><pre>${code}</pre>` : ''}
            <p>You can close this tab and return to the terminal.</p>
          </main>
        </body>
      </html>
    `);
  });
}

// ── Serve Angular build in production ───────────────────
if (isProd) {
  const staticPath = path.join(__dirname, '..', 'dist', 'portfolio', 'browser');
  app.use(express.static(staticPath));

  // SPA fallback — all non-API routes → index.html
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`   Spotify : ${process.env.SPOTIFY_CLIENT_ID ? '✓ configured' : '✗ not configured'}`);
  console.log(`   Brevo   : ${process.env.SMTP_USER          ? '✓ configured' : '✗ not configured'}\n`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  Port ${PORT} is already in use.`);
    console.error(`   Set a different port in .env: PORT=3002\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
