import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Spotify token cache (per cold start) ─────────────────
let cachedToken: string | null = null;
let tokenExpiry = 0;

interface SpotifyErrorResponse {
  error?: string;
  error_description?: string;
  message?: string;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error('Spotify is not configured: set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN');
  }

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN!,
    }),
  });

  if (!res.ok) {
    const errorBody = (await res.text()).trim();
    let details = errorBody;

    if (errorBody) {
      try {
        const parsed = JSON.parse(errorBody) as SpotifyErrorResponse;
        details = parsed.error_description ?? parsed.error ?? errorBody;
      } catch {
        // Keep raw text when Spotify does not return JSON.
      }
    }

    throw new Error(`Spotify token error: ${res.status}${details ? ` - ${details}` : ''}`);
  }

  const data: any = await res.json();
  if (!data?.access_token) {
    throw new Error('Spotify token error: missing access token in response');
  }
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

// ── Handler ───────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only GET
  if (req.method !== 'GET') return res.status(405).end();

  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=25, stale-while-revalidate=30');

  const { SPOTIFY_CLIENT_ID, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_REFRESH_TOKEN) {
    return res.status(503).json({ error: 'Spotify not configured' });
  }

  try {
    const token = await getAccessToken();

    const spotifyRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (spotifyRes.status === 204 || spotifyRes.status === 404) {
      return res.json({ isPlaying: false });
    }

    if (!spotifyRes.ok) {
      const errorBody = (await spotifyRes.text()).trim();
      throw new Error(`Spotify API ${spotifyRes.status}${errorBody ? ` - ${errorBody}` : ''}`);
    }

    const data: any = await spotifyRes.json();

    if (!data?.item) return res.json({ isPlaying: false });

    return res.json({
      isPlaying:   data.is_playing,
      title:       data.item.name,
      artist:      data.item.artists.map((a: any) => a.name).join(', '),
      album:       data.item.album.name,
      albumArt:    data.item.album.images[0]?.url ?? '',
      songUrl:     data.item.external_urls.spotify,
      progressMs:  data.progress_ms ?? 0,
      durationMs:  data.item.duration_ms,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch now playing';
    console.error('[Spotify]', message);

    if (message.includes('invalid_grant') || message.includes('Invalid refresh token')) {
      return res.status(401).json({ error: message });
    }

    return res.status(500).json({ error: message });
  }
}
