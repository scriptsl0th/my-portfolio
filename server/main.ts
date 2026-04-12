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
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
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
