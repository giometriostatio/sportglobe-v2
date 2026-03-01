export type Sport = 'basketball' | 'college_basketball' | 'baseball' | 'hockey' | 'college_hockey' | 'soccer' | 'football' | 'mma' | 'f1' | 'minor_baseball';

export type SportFilter = Sport | 'all';

export const SPORT_COLORS: Record<Sport, string> = {
  basketball: '#F97316',
  college_basketball: '#10B981',
  baseball: '#A855F7',
  hockey: '#38BDF8',
  college_hockey: '#67E8F9',
  soccer: '#4ADE80',
  football: '#EF4444',
  mma: '#F43F5E',
  f1: '#FB923C',
  minor_baseball: '#C084FC',
};

export const SPORT_LABELS: Record<Sport, string> = {
  basketball: 'NBA',
  college_basketball: 'College BB',
  baseball: 'MLB',
  hockey: 'NHL',
  college_hockey: 'College Hockey',
  soccer: 'Soccer',
  football: 'NFL',
  mma: 'MMA',
  f1: 'F1',
  minor_baseball: 'MiLB',
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