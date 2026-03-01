import { Game, SPORT_COLORS } from './types';
import { parseBDLBasketball, parseBDLBaseball, parseESPNCollegeBasketball, parseESPNGeneric, parseAPISportsGeneric } from './parseGames';

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

async function safeFetch(url: string): Promise<any[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.response || [];
  } catch {
    return [];
  }
}

export async function fetchGamesServer(dateStr?: string): Promise<{ games: Game[]; date: string }> {
  const date = dateStr || getTomorrow();
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const [nbaRaw, mlbRaw, ncaabRaw, nhlRaw, eplRaw, mlsRaw, uclRaw, laligaRaw, fifaRaw, ncaahRaw, milbRaw, nflRaw, mmaRaw, f1Raw] = await Promise.all([
    safeFetch(`${baseUrl}/api/sports?sport=bdl_nba&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=bdl_mlb&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=espn_ncaab&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=espn_nhl&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=espn_epl&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=espn_mls&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=espn_ucl&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=espn_laliga&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=espn_fifa&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=espn_ncaah&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=espn_milb&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=nfl&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=mma&date=${date}`),
    safeFetch(`${baseUrl}/api/sports?sport=f1&date=${date}`),
  ]);

  const games = [
    ...parseBDLBasketball(nbaRaw, date),
    ...parseBDLBaseball(mlbRaw, date),
    ...parseESPNCollegeBasketball(ncaabRaw, date),
    ...parseESPNGeneric(nhlRaw, 'hockey', 'NHL', SPORT_COLORS.hockey, 300000, date),
    ...parseESPNGeneric(eplRaw, 'soccer', 'EPL', SPORT_COLORS.soccer, 400000, date),
    ...parseESPNGeneric(mlsRaw, 'soccer', 'MLS', SPORT_COLORS.soccer, 410000, date),
    ...parseESPNGeneric(uclRaw, 'soccer', 'UCL', SPORT_COLORS.soccer, 420000, date),
    ...parseESPNGeneric(laligaRaw, 'soccer', 'La Liga', SPORT_COLORS.soccer, 430000, date),
    ...parseESPNGeneric(fifaRaw, 'soccer', 'FIFA', SPORT_COLORS.soccer, 440000, date),
    ...parseESPNGeneric(ncaahRaw, 'college_hockey', 'NCAA Hockey', SPORT_COLORS.college_hockey, 500000, date),
    ...parseESPNGeneric(milbRaw, 'minor_baseball', 'MiLB', SPORT_COLORS.minor_baseball, 600000, date),
    ...parseAPISportsGeneric(nflRaw, 'football', 'NFL', SPORT_COLORS.football, 700000),
    ...parseAPISportsGeneric(mmaRaw, 'mma', 'MMA', SPORT_COLORS.mma, 750000),
    ...parseAPISportsGeneric(f1Raw, 'f1', 'F1', SPORT_COLORS.f1, 780000),
  ];

  return { games, date };
}