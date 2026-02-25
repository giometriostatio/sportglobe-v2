import { CircleMarker, Popup } from 'react-leaflet';
import { Game } from '@/lib/types';
import GameDetail from './GameDetail';

interface Props {
  game: Game;
  isInTrip: boolean;
  onAddTrip: (game: Game) => void;
  onRemoveTrip: (id: number) => void;
}

export default function GameMarker({ game, isInTrip, onAddTrip, onRemoveTrip }: Props) {
  const color = isInTrip ? '#F59E0B' : game.color;
  const radius = isInTrip ? 8 : 6;

  return (
    <CircleMarker
      center={[game.lat, game.lng]}
      radius={radius}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: isInTrip ? 3 : 1.5,
        opacity: 1,
      }}
      className={isInTrip ? 'trip-marker' : ''}
    >
      <Popup>
        <GameDetail
          game={game}
          isInTrip={isInTrip}
          onAddTrip={() => onAddTrip(game)}
          onRemoveTrip={() => onRemoveTrip(game.id)}
        />
      </Popup>
    </CircleMarker>
  );
}
