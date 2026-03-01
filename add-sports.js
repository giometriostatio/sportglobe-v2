const fs = require('fs');

// 1. Update types.ts
fs.writeFileSync('lib/types.ts', [
  "export type Sport = 'basketball' | 'college_basketball' | 'baseball' | 'hockey' | 'college_hockey' | 'soccer' | 'football' | 'mma' | 'f1' | 'minor_baseball';",
  "",
  "export type SportFilter = Sport | 'all';",
  "",
  "export const SPORT_COLORS: Record<Sport, string> = {",
  "  basketball: '#F97316',",
  "  college_basketball: '#10B981',",
  "  baseball: '#A855F7',",
  "  hockey: '#38BDF8',",
  "  college_hockey: '#67E8F9',",
  "  soccer: '#4ADE80',",
  "  football: '#EF4444',",
  "  mma: '#F43F5E',",
  "  f1: '#FB923C',",
  "  minor_baseball: '#C084FC',",
  "};",
  "",
  "export const SPORT_LABELS: Record<Sport, string> = {",
  "  basketball: 'NBA',",
  "  college_basketball: 'College BB',",
  "  baseball: 'MLB',",
  "  hockey: 'NHL',",
  "  college_hockey: 'College Hockey',",
  "  soccer: 'Soccer',",
  "  football: 'NFL',",
  "  mma: 'MMA',",
  "  f1: 'F1',",
  "  minor_baseball: 'MiLB',",
  "};",
  "",
  "export interface Game {",
  "  id: number;",
  "  sport: Sport;",
  "  league: string;",
  "  home: string;",
  "  away: string;",
  "  venue: string;",
  "  city: string;",
  "  country: string;",
  "  lat: number;",
  "  lng: number;",
  "  status: 'UPCOMING' | 'LIVE' | 'FINISHED';",
  "  detail: string;",
  "  startTime: string;",
  "  color: string;",
  "  dateUTC: string;",
  "}",
].join('\n'));
console.log('Updated types.ts');

// 2. Add new parsers to parseGames.ts
let parsers = fs.readFileSync('lib/parseGames.ts', 'utf-8');

const newParsers = [
  "",
  "",
  "export function parseESPNGeneric(events: any[], sport: string, league: string, color: string, idOffset: number, targetDate?: string): Game[] {",
  "  return events.map(event => {",
  "    const comp = event.competitions?.[0];",
  "    if (!comp) return null;",
  "",
  "    const statusName: string = event.status?.type?.name || comp.status?.type?.name || '';",
  "    if (statusName !== 'STATUS_SCHEDULED') return null;",
  "",
  "    const competitors = comp.competitors || [];",
  "    const homeTeam = competitors.find((c: any) => c.homeAway === 'home');",
  "    const awayTeam = competitors.find((c: any) => c.homeAway === 'away');",
  "    const homeName = homeTeam?.team?.displayName || '?';",
  "    const awayName = awayTeam?.team?.displayName || '?';",
  "",
  "    const venueName: string = comp.venue?.fullName || '';",
  "    const venueCity: string = comp.venue?.address?.city || '';",
  "    const venueState: string = comp.venue?.address?.state || '';",
  "    const venueCountry: string = comp.venue?.address?.country || 'USA';",
  "",
  "    const utcTime: string = event.date || '';",
  "    const { dateET, timeET } = convertToEastern(utcTime);",
  "    if (targetDate && dateET !== targetDate) return null;",
  "",
  "    const coords = geocodeCityState(venueCity, venueState)",
  "      || geocode(venueName || null, venueCity || null, venueCountry, homeName);",
  "    if (!coords) return null;",
  "",
  "    const eventId = parseInt(event.id, 10) || 0;",
  "",
  "    return {",
  "      id: eventId + idOffset,",
  "      sport: sport as Sport,",
  "      league,",
  "      home: homeName,",
  "      away: awayName,",
  "      venue: venueName,",
  "      city: venueCity,",
  "      country: venueCountry,",
  "      lat: coords[0],",
  "      lng: coords[1],",
  "      status: 'UPCOMING' as const,",
  "      detail: 'Scheduled',",
  "      startTime: timeET,",
  "      color,",
  "      dateUTC: utcTime,",
  "    } as Game;",
  "  }).filter(Boolean) as Game[];",
  "}",
  "",
  "export function parseAPISportsGeneric(games: any[], sport: string, league: string, color: string, idOffset: number): Game[] {",
  "  return games.map((g: any) => {",
  "    const homeName = g.teams?.home?.name || '?';",
  "    const awayName = g.teams?.away?.name || '?';",
  "    const venue = g.league?.name || '';",
  "    const country = g.league?.country || '';",
  "",
  "    const coords = geocode(null, null, country, homeName);",
  "    if (!coords) return null;",
  "",
  "    const utcTime = g.date || (g.timestamp ? new Date(g.timestamp * 1000).toISOString() : '');",
  "    const { timeET } = convertToEastern(utcTime);",
  "",
  "    return {",
  "      id: (g.id || Math.floor(Math.random() * 999999)) + idOffset,",
  "      sport: sport as Sport,",
  "      league,",
  "      home: homeName,",
  "      away: awayName,",
  "      venue,",
  "      city: '',",
  "      country,",
  "      lat: coords[0],",
  "      lng: coords[1],",
  "      status: 'UPCOMING' as const,",
  "      detail: 'Scheduled',",
  "      startTime: timeET,",
  "      color,",
  "      dateUTC: utcTime,",
  "    } as Game;",
  "  }).filter(Boolean) as Game[];",
  "}",
].join('\n');

if (!parsers.includes('parseESPNGeneric')) {
  parsers += newParsers;
  fs.writeFileSync('lib/parseGames.ts', parsers);
  console.log('Updated parseGames.ts');
} else {
  console.log('parseGames.ts already has generic parsers');
}

// 3. Update SportFilters.tsx
fs.writeFileSync('components/SportFilters.tsx', [
  "import { SportFilter, SPORT_COLORS, SPORT_LABELS } from '@/lib/types';",
  "",
  "const FILTERS: { key: SportFilter; label: string; color: string }[] = [",
  "  { key: 'all', label: 'All Sports', color: '#6366F1' },",
  "  { key: 'basketball', label: SPORT_LABELS.basketball, color: SPORT_COLORS.basketball },",
  "  { key: 'college_basketball', label: SPORT_LABELS.college_basketball, color: SPORT_COLORS.college_basketball },",
  "  { key: 'baseball', label: SPORT_LABELS.baseball, color: SPORT_COLORS.baseball },",
  "  { key: 'hockey', label: SPORT_LABELS.hockey, color: SPORT_COLORS.hockey },",
  "  { key: 'college_hockey', label: SPORT_LABELS.college_hockey, color: SPORT_COLORS.college_hockey },",
  "  { key: 'soccer', label: SPORT_LABELS.soccer, color: SPORT_COLORS.soccer },",
  "  { key: 'football', label: SPORT_LABELS.football, color: SPORT_COLORS.football },",
  "  { key: 'minor_baseball', label: SPORT_LABELS.minor_baseball, color: SPORT_COLORS.minor_baseball },",
  "  { key: 'mma', label: SPORT_LABELS.mma, color: SPORT_COLORS.mma },",
  "  { key: 'f1', label: SPORT_LABELS.f1, color: SPORT_COLORS.f1 },",
  "];",
  "",
  "interface Props {",
  "  active: SportFilter;",
  "  onChange: (f: SportFilter) => void;",
  "  counts: Record<string, number>;",
  "}",
  "",
  "export default function SportFilters({ active, onChange, counts }: Props) {",
  "  const total = Object.values(counts).reduce((a, b) => a + b, 0);",
  "  return (",
  "    <div className=\"flex gap-2 flex-wrap\">",
  "      {FILTERS.map(f => {",
  "        const isActive = active === f.key;",
  "        const count = f.key === 'all' ? total : counts[f.key] || 0;",
  "        if (f.key !== 'all' && count === 0) return null;",
  "        return (",
  "          <button",
  "            key={f.key}",
  "            onClick={() => onChange(f.key)}",
  "            className=\"px-3 py-1.5 rounded-full text-sm font-medium transition-all\"",
  "            style={{",
  "              background: isActive ? f.color : '#1a1a24',",
  "              color: isActive ? '#fff' : '#9ca3af',",
  "              border: `1px solid ${isActive ? f.color : '#2a2a3a'}`,",
  "            }}",
  "          >",
  "            {f.label} ({count})",
  "          </button>",
  "        );",
  "      })}",
  "    </div>",
  "  );",
  "}",
].join('\n'));
console.log('Updated SportFilters.tsx');

// 4. Update index.tsx
let index = fs.readFileSync('pages/index.tsx', 'utf-8');

// Update imports
index = index.replace(
  "import { parseBDLBasketball, parseBDLBaseball, parseESPNCollegeBasketball } from '@/lib/parseGames';",
  "import { parseBDLBasketball, parseBDLBaseball, parseESPNCollegeBasketball, parseESPNGeneric, parseAPISportsGeneric } from '@/lib/parseGames';\nimport { SPORT_COLORS } from '@/lib/types';"
);

// Replace loadGames
const oldFetchBlock = `const [nbaRaw, mlbRaw, ncaabRaw] = await Promise.all([
        fetchSport('bdl_nba', dateStr),
        fetchSport('bdl_mlb', dateStr),
        fetchSport('espn_ncaab', dateStr),
      ]);

      const nba = parseBDLBasketball(nbaRaw, dateStr);
      const mlb = parseBDLBaseball(mlbRaw, dateStr);
      const ncaab = parseESPNCollegeBasketball(ncaabRaw, dateStr);

      setGames([...nba, ...mlb, ...ncaab]);`;

const newFetchBlock = `const [nbaRaw, mlbRaw, ncaabRaw, nhlRaw, eplRaw, mlsRaw, uclRaw, laligaRaw, fifaRaw, ncaahRaw, milbRaw, nflRaw, mmaRaw, f1Raw] = await Promise.all([
        fetchSport('bdl_nba', dateStr),
        fetchSport('bdl_mlb', dateStr),
        fetchSport('espn_ncaab', dateStr),
        fetchSport('espn_nhl', dateStr),
        fetchSport('espn_epl', dateStr),
        fetchSport('espn_mls', dateStr),
        fetchSport('espn_ucl', dateStr),
        fetchSport('espn_laliga', dateStr),
        fetchSport('espn_fifa', dateStr),
        fetchSport('espn_ncaah', dateStr),
        fetchSport('espn_milb', dateStr),
        fetchSport('nfl', dateStr),
        fetchSport('mma', dateStr),
        fetchSport('f1', dateStr),
      ]);

      const nba = parseBDLBasketball(nbaRaw, dateStr);
      const mlb = parseBDLBaseball(mlbRaw, dateStr);
      const ncaab = parseESPNCollegeBasketball(ncaabRaw, dateStr);
      const nhl = parseESPNGeneric(nhlRaw, 'hockey', 'NHL', SPORT_COLORS.hockey, 300000, dateStr);
      const epl = parseESPNGeneric(eplRaw, 'soccer', 'EPL', SPORT_COLORS.soccer, 400000, dateStr);
      const mls = parseESPNGeneric(mlsRaw, 'soccer', 'MLS', SPORT_COLORS.soccer, 410000, dateStr);
      const ucl = parseESPNGeneric(uclRaw, 'soccer', 'UCL', SPORT_COLORS.soccer, 420000, dateStr);
      const laliga = parseESPNGeneric(laligaRaw, 'soccer', 'La Liga', SPORT_COLORS.soccer, 430000, dateStr);
      const fifa = parseESPNGeneric(fifaRaw, 'soccer', 'FIFA', SPORT_COLORS.soccer, 440000, dateStr);
      const ncaah = parseESPNGeneric(ncaahRaw, 'college_hockey', 'NCAA Hockey', SPORT_COLORS.college_hockey, 500000, dateStr);
      const milb = parseESPNGeneric(milbRaw, 'minor_baseball', 'MiLB', SPORT_COLORS.minor_baseball, 600000, dateStr);
      const nfl = parseAPISportsGeneric(nflRaw, 'football', 'NFL', SPORT_COLORS.football, 700000);
      const mma = parseAPISportsGeneric(mmaRaw, 'mma', 'MMA', SPORT_COLORS.mma, 750000);
      const f1games = parseAPISportsGeneric(f1Raw, 'f1', 'F1', SPORT_COLORS.f1, 780000);

      setGames([...nba, ...mlb, ...ncaab, ...nhl, ...epl, ...mls, ...ucl, ...laliga, ...fifa, ...ncaah, ...milb, ...nfl, ...mma, ...f1games]);`;

index = index.replace(oldFetchBlock, newFetchBlock);
fs.writeFileSync('pages/index.tsx', index);
console.log('Updated index.tsx');

// 5. Update fetchGames.ts (SSR)
const fetchGamesContent = [
  "import { Game, SPORT_COLORS } from './types';",
  "import { parseBDLBasketball, parseBDLBaseball, parseESPNCollegeBasketball, parseESPNGeneric, parseAPISportsGeneric } from './parseGames';",
  "",
  "function getTomorrow(): string {",
  "  const d = new Date();",
  "  d.setDate(d.getDate() + 1);",
  "  return d.toISOString().split('T')[0];",
  "}",
  "",
  "async function safeFetch(url: string): Promise<any[]> {",
  "  try {",
  "    const res = await fetch(url);",
  "    if (!res.ok) return [];",
  "    const data = await res.json();",
  "    return data.response || [];",
  "  } catch {",
  "    return [];",
  "  }",
  "}",
  "",
  "export async function fetchGamesServer(dateStr?: string): Promise<{ games: Game[]; date: string }> {",
  "  const date = dateStr || getTomorrow();",
  "  const baseUrl = process.env.VERCEL_URL",
  "    ? `https://${process.env.VERCEL_URL}`",
  "    : 'http://localhost:3000';",
  "",
  "  const [nbaRaw, mlbRaw, ncaabRaw, nhlRaw, eplRaw, mlsRaw, uclRaw, laligaRaw, fifaRaw, ncaahRaw, milbRaw, nflRaw, mmaRaw, f1Raw] = await Promise.all([",
  "    safeFetch(`${baseUrl}/api/sports?sport=bdl_nba&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=bdl_mlb&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=espn_ncaab&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=espn_nhl&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=espn_epl&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=espn_mls&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=espn_ucl&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=espn_laliga&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=espn_fifa&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=espn_ncaah&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=espn_milb&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=nfl&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=mma&date=${date}`),",
  "    safeFetch(`${baseUrl}/api/sports?sport=f1&date=${date}`),",
  "  ]);",
  "",
  "  const games = [",
  "    ...parseBDLBasketball(nbaRaw, date),",
  "    ...parseBDLBaseball(mlbRaw, date),",
  "    ...parseESPNCollegeBasketball(ncaabRaw, date),",
  "    ...parseESPNGeneric(nhlRaw, 'hockey', 'NHL', SPORT_COLORS.hockey, 300000, date),",
  "    ...parseESPNGeneric(eplRaw, 'soccer', 'EPL', SPORT_COLORS.soccer, 400000, date),",
  "    ...parseESPNGeneric(mlsRaw, 'soccer', 'MLS', SPORT_COLORS.soccer, 410000, date),",
  "    ...parseESPNGeneric(uclRaw, 'soccer', 'UCL', SPORT_COLORS.soccer, 420000, date),",
  "    ...parseESPNGeneric(laligaRaw, 'soccer', 'La Liga', SPORT_COLORS.soccer, 430000, date),",
  "    ...parseESPNGeneric(fifaRaw, 'soccer', 'FIFA', SPORT_COLORS.soccer, 440000, date),",
  "    ...parseESPNGeneric(ncaahRaw, 'college_hockey', 'NCAA Hockey', SPORT_COLORS.college_hockey, 500000, date),",
  "    ...parseESPNGeneric(milbRaw, 'minor_baseball', 'MiLB', SPORT_COLORS.minor_baseball, 600000, date),",
  "    ...parseAPISportsGeneric(nflRaw, 'football', 'NFL', SPORT_COLORS.football, 700000),",
  "    ...parseAPISportsGeneric(mmaRaw, 'mma', 'MMA', SPORT_COLORS.mma, 750000),",
  "    ...parseAPISportsGeneric(f1Raw, 'f1', 'F1', SPORT_COLORS.f1, 780000),",
  "  ];",
  "",
  "  return { games, date };",
  "}",
].join('\n');

fs.writeFileSync('lib/fetchGames.ts', fetchGamesContent);
console.log('Updated fetchGames.ts');

console.log('\nAll files updated! Run: npm run build');
