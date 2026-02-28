import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { fetchGamesServer } from '@/lib/fetchGames';
import { Game, SportFilter } from '@/lib/types';
import { fetchSport } from '@/lib/api';
import { parseBDLBasketball, parseBDLBaseball, parseESPNCollegeBasketball } from '@/lib/parseGames';
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
      const [nbaRaw, mlbRaw, ncaabRaw] = await Promise.all([
        fetchSport('bdl_nba', dateStr),
        fetchSport('bdl_mlb', dateStr),
        fetchSport('espn_ncaab', dateStr),
      ]);

      const nba = parseBDLBasketball(nbaRaw, dateStr);
      const mlb = parseBDLBaseball(mlbRaw, dateStr);
      const ncaab = parseESPNCollegeBasketball(ncaabRaw, dateStr);

      setGames([...nba, ...mlb, ...ncaab]);
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
