import { MapContainer, TileLayer } from 'react-leaflet';
import { Game } from '@/lib/types';
import GameMarker from './GameMarker';

interface Props {
  games: Game[];
  tripIds: Set<number>;
  onAddTrip: (game: Game) => void;
  onRemoveTrip: (id: number) => void;
}

export default function Map({ games, tripIds, onAddTrip, onRemoveTrip }: Props) {
  return (
    <MapContainer
      center={[39.8, -98.5]}
      zoom={4}
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {games.map(game => (
        <GameMarker
          key={game.id}
          game={game}
          isInTrip={tripIds.has(game.id)}
          onAddTrip={onAddTrip}
          onRemoveTrip={onRemoveTrip}
        />
      ))}
    </MapContainer>
  );
}
