import { Game, SPORT_LABELS } from '@/lib/types';

interface Props {
  game: Game;
  isInTrip: boolean;
  onAddTrip: () => void;
  onRemoveTrip: () => void;
}

export default function GameDetail({ game, isInTrip, onAddTrip, onRemoveTrip }: Props) {
  return (
    <div className="min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-3 h-3 rounded-full inline-block"
          style={{ background: game.color }}
        />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: game.color }}>
          {SPORT_LABELS[game.sport] || game.league}
        </span>
      </div>
      <p className="font-bold text-white text-sm leading-tight">
        {game.away}
      </p>
      <p className="text-xs text-gray-400 my-0.5">at</p>
      <p className="font-bold text-white text-sm leading-tight mb-2">
        {game.home}
      </p>
      {game.startTime && (
        <p className="text-xs text-gray-400 mb-1">{game.startTime}</p>
      )}
      {game.venue && (
        <p className="text-xs text-gray-500">{game.venue}</p>
      )}
      <button
        onClick={isInTrip ? onRemoveTrip : onAddTrip}
        className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: isInTrip ? '#991B1B' : '#F59E0B',
          color: isInTrip ? '#FCA5A5' : '#000',
        }}
      >
        {isInTrip ? 'Remove from Trip' : '+ Add to Trip'}
      </button>
    </div>
  );
}
