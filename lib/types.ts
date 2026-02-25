export type Sport = 'basketball' | 'college_basketball' | 'baseball';

export const SPORT_COLORS: Record<Sport, string> = {
  basketball: '#F97316',
  college_basketball: '#10B981',
  baseball: '#A855F7',
};

export const SPORT_LABELS: Record<Sport, string> = {
  basketball: 'NBA',
  college_basketball: 'College BB',
  baseball: 'MLB',
};

export interface Game {
  id: number;
  sport: Sport;
  league: string;
  home: string;
  away: string;
  venue: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  detail: string;
  startTime: string;
  color: string;
  dateUTC: string;
}

export type SportFilter = 'all' | Sport;
