/**
 * Run this ONCE to get your Spotify refresh token:
 *   npx tsx server/get-spotify-token.ts
 *
 * Steps:
 *  1. Fill SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env first
 *  2. Run this script — it prints an auth URL
 *  3. Open the URL in your browser, authorize, copy the `code` from the redirect URL
 *  4. Paste the code when prompted
 *  5. Copy the refresh_token printed at the end into your .env
 */
import 'dotenv/config';
import * as readline from 'readline';

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = process.env;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error('❌  Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env first.');
  process.exit(1);
}

const SCOPES = 'user-read-currently-playing user-read-playback-state';
const authUrl =
  `https://accounts.spotify.com/authorize?` +
  new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: SPOTIFY_REDIRECT_URI!,
  }).toString();

console.log('\n1️⃣  Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n2️⃣  After authorizing, copy the `code` query param from the redirect URL.\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Paste the code here: ', async (code) => {
  rl.close();

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI!,
    }),
  });

  const data: any = await res.json();
  if (data.error) { console.error('❌  Error:', data); process.exit(1); }

  console.log('\n✅  Success! Add this to your .env:\n');
  console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`);
});
