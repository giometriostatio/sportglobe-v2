import { Game } from './types';
import { parseBDLBasketball, parseBDLBaseball, parseESPNCollegeBasketball } from './parseGames';

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export async function fetchGamesServer(dateStr?: string): Promise<{ games: Game[]; date: string }> {
  const date = dateStr || getTomorrow();
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const [nbaRaw, mlbRaw, ncaabRaw] = await Promise.all([
    fetch(`${baseUrl}/api/sports?sport=bdl_nba&date=${date}`).then(r => r.ok ? r.json() : { response: [] }).catch(() => ({ response: [] })),
    fetch(`${baseUrl}/api/sports?sport=bdl_mlb&date=${date}`).then(r => r.ok ? r.json() : { response: [] }).catch(() => ({ response: [] })),
    fetch(`${baseUrl}/api/sports?sport=espn_ncaab&date=${date}`).then(r => r.ok ? r.json() : { response: [] }).catch(() => ({ response: [] })),
  ]);

  const nba = parseBDLBasketball(nbaRaw.response || [], date);
  const mlb = parseBDLBaseball(mlbRaw.response || [], date);
  const ncaab = parseESPNCollegeBasketball(ncaabRaw.response || [], date);

  return { games: [...nba, ...mlb, ...ncaab], date };
}
