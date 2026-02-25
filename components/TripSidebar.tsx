import { Game, SPORT_LABELS } from '@/lib/types';

interface Props {
  games: Game[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

export default function TripSidebar({ games, onRemove, onClear }: Props) {
  const sorted = [...games].sort((a, b) => a.dateUTC.localeCompare(b.dateUTC));

  const buildItineraryUrl = () => {
    if (sorted.length === 0) return '';
    const stops = sorted.map(g => `${g.lat},${g.lng}`).join('/');
    return `https://www.google.com/maps/dir/${stops}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          Trip ({games.length})
        </h2>
        {games.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Clear All
          </button>
        )}
      </div>

      {games.length === 0 ? (
        <p className="text-sm text-gray-500 text-center mt-8">
          Click markers on the map and add games to build your trip itinerary.
        </p>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto space-y-3">
            {sorted.map((game, i) => (
              <div
                key={game.id}
                className="bg-[#12121a] rounded-lg p-3 border border-[#2a2a3a]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#F59E0B]">
                      #{i + 1}
                    </span>
                    <span
                      className="text-xs font-semibold uppercase"
                      style={{ color: game.color }}
                    >
                      {SPORT_LABELS[game.sport] || game.league}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemove(game.id)}
                    className="text-gray-600 hover:text-red-400 text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-white font-medium">
                  {game.away} @ {game.home}
                </p>
                {game.startTime && (
                  <p className="text-xs text-gray-400 mt-1">{game.startTime}</p>
                )}
              </div>
            ))}
          </div>

          <a
            href={buildItineraryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full py-3 rounded-lg text-center font-bold text-sm transition-all"
            style={{ background: '#F59E0B', color: '#000' }}
          >
            Build Itinerary →
          </a>
        </>
      )}
    </div>
  );
}
