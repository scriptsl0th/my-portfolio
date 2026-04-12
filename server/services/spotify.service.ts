import * as dotenv from 'dotenv';
dotenv.config();

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  item?: {
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string }[];
    };
    external_urls: { spotify: string };
    duration_ms: number;
  };
  progress_ms?: number;
}

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
} = process.env;

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

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

  if (!res.ok) throw new Error(`Spotify token error: ${res.status}`);

  const data: SpotifyTokenResponse = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

export async function getNowPlaying() {
  const token = await getAccessToken();

  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${token}` },
  });

  // 204 = nothing playing
  if (res.status === 204 || res.status === 404) {
    return { isPlaying: false };
  }

  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);

  const data: SpotifyCurrentlyPlaying = await res.json();

  if (!data.item) return { isPlaying: false };

  return {
    isPlaying: data.is_playing,
    title: data.item.name,
    artist: data.item.artists.map(a => a.name).join(', '),
    album: data.item.album.name,
    albumArt: data.item.album.images[0]?.url ?? '',
    songUrl: data.item.external_urls.spotify,
    progressMs: data.progress_ms ?? 0,
    durationMs: data.item.duration_ms,
  };
}
