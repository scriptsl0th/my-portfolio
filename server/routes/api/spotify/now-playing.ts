import { Router, Request, Response } from 'express';
import { getNowPlaying } from '../../../services/spotify.service';

const router = Router();

// Cache response for 25s to avoid hammering Spotify
let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 25_000;

router.get('/', async (_req: Request, res: Response) => {
  try {
    // Check env vars are set
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_REFRESH_TOKEN) {
      return res.status(503).json({ error: 'Spotify not configured' });
    }

    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return res.json(cache.data);
    }

    const data = await getNowPlaying();
    cache = { data, ts: Date.now() };
    return res.json(data);
  } catch (err) {
    console.error('[Spotify]', err);
    return res.status(500).json({ error: 'Failed to fetch now playing' });
  }
});

export default router;
