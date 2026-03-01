import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { fetchGamesServer } from '@/lib/fetchGames';
import { Game, SportFilter } from '@/lib/types';
import { fetchSport } from '@/lib/api';
import { parseBDLBasketball, parseBDLBaseball, parseESPNCollegeBasketball, parseESPNGeneric, parseAPISportsGeneric } from '@/lib/parseGames';
import { SPORT_COLORS } from '@/lib/types';
import SportFilters from '@/components/SportFilters';
import DatePicker from '@/components/DatePicker';
import TripSidebar from '@/components/TripSidebar';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { games, date } = await fetchGamesServer();
    return { props: { initialGames: JSON.parse(JSON.stringify(games)), initialDate: date } };
  } catch {
    return { props: { initialGames: [], initialDate: new Date().toISOString().split('T')[0] } };
  }
};

export default function Home({ initialGames = [], initialDate }: { initialGames?: Game[]; initialDate?: string }) {
  const [date, setDate] = useState(initialDate || getTomorrow);
  const [games, setGames] = useState<Game[]>(initialGames || []);
  const [filter, setFilter] = useState<SportFilter>('all');
  const [tripGames, setTripGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadGames = useCallback(async (dateStr: string) => {
    setLoading(true);
    try {
      const [nbaRaw, mlbRaw, ncaabRaw, nhlRaw, eplRaw, mlsRaw, uclRaw, laligaRaw, fifaRaw, ncaahRaw, milbRaw, nflRaw, mmaRaw, f1Raw] = await Promise.all([
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

      setGames([...nba, ...mlb, ...ncaab, ...nhl, ...epl, ...mls, ...ucl, ...laliga, ...fifa, ...ncaah, ...milb, ...nfl, ...mma, ...f1games]);
    } catch (err) {
      console.error('Failed to load games:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames(date);
  }, [date, loadGames]);

  const filteredGames = useMemo(() => {
    if (filter === 'all') return games;
    return games.filter(g => g.sport === filter);
  }, [games, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const g of games) {
      c[g.sport] = (c[g.sport] || 0) + 1;
    }
    return c;
  }, [games]);

  const tripIds = useMemo(() => new Set(tripGames.map(g => g.id)), [tripGames]);

  const addToTrip = useCallback((game: Game) => {
    setTripGames(prev => {
      if (prev.some(g => g.id === game.id)) return prev;
      return [...prev, game];
    });
  }, []);

  const removeFromTrip = useCallback((id: number) => {
    setTripGames(prev => prev.filter(g => g.id !== id));
  }, []);

  const clearTrip = useCallback(() => {
    setTripGames([]);
  }, []);

  return (
    <>
      <Head>
        <title>SportGlobe Trip Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="h-screen flex flex-col bg-[#0a0a0f]">
        {/* Header */}
        <header className="px-4 py-3 border-b border-[#1a1a24] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-extrabold leading-tight">
                <span className="bg-gradient-to-r from-[#10B981] to-[#34D399] bg-clip-text text-transparent">
                  SportGlobe
                </span>
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 uppercase">
                Trip Planner
              </p>
            </div>
            <SportFilters active={filter} onChange={setFilter} counts={counts} />
          </div>
          <div className="flex items-center gap-3">
            <DatePicker value={date} onChange={setDate} />
            {loading && (
              <span className="text-xs text-gray-500 animate-pulse">Loading...</span>
            )}
            {/* Mobile trip toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden px-3 py-1.5 rounded-lg text-sm font-medium border"
              style={{
                background: tripGames.length > 0 ? '#F59E0B' : '#1a1a24',
                color: tripGames.length > 0 ? '#000' : '#9ca3af',
                borderColor: tripGames.length > 0 ? '#F59E0B' : '#2a2a3a',
              }}
            >
              Trip ({tripGames.length})
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Map */}
          <div className="flex-1 relative">
            <Map
              games={filteredGames}
              tripIds={tripIds}
              onAddTrip={addToTrip}
              onRemoveTrip={removeFromTrip}
            />
            {/* Game count badge */}
            <div className="absolute bottom-4 left-4 bg-[#1a1a24]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-[#2a2a3a] text-xs text-gray-400">
              {filteredGames.length} games
            </div>
          </div>

          {/* Sidebar — desktop always visible, mobile overlay */}
          <div
            className={`
              w-80 bg-[#0f0f17] border-l border-[#1a1a24] p-4
              lg:relative lg:block
              ${sidebarOpen ? 'absolute inset-y-0 right-0 z-[1000] block' : 'hidden lg:block'}
            `}
          >
            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-3 right-3 text-gray-500 hover:text-white"
            >
              ✕
            </button>
            <TripSidebar
              games={tripGames}
              onRemove={removeFromTrip}
              onClear={clearTrip}
            />
          </div>
        </div>
      </div>
    </>
  );
}
