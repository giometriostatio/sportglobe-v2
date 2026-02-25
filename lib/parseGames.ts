import { Game, Sport, SPORT_COLORS } from './types';
import { geocode, geocodeCityState } from './geocoding';

export function convertToEastern(utcDateString: string): { dateET: string; timeET: string } {
  const d = new Date(utcDateString);
  if (isNaN(d.getTime())) {
    return { dateET: '', timeET: '' };
  }

  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dateET = dateFormatter.format(d);

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const timeET = timeFormatter.format(d).replace(/\s+/g, ' ') + ' ET';

  return { dateET, timeET };
}

export function parseBDLBasketball(games: any[], targetDateET?: string): Game[] {
  return games.map(g => {
    const statusStr: string = g.status || '';
    const isScheduled = statusStr.includes('T') && statusStr.includes('Z');
    const scorePlayed = (g.home_team_score > 0 || g.visitor_team_score > 0);

    if (!isScheduled && scorePlayed) return null;

    const utcTime = isScheduled ? statusStr : `${g.date}T00:00:00Z`;
    const { dateET, timeET } = convertToEastern(utcTime);

    if (targetDateET && dateET !== targetDateET) return null;

    const homeName = g.home_team?.full_name || '?';
    const awayName = g.visitor_team?.full_name || '?';

    const coords = geocode(null, null, 'USA', homeName);
    if (!coords) return null;

    return {
      id: g.id + 800000,
      sport: 'basketball' as Sport,
      league: 'NBA',
      home: homeName,
      away: awayName,
      venue: '', city: g.home_team?.city || '', country: 'USA',
      lat: coords[0], lng: coords[1],
      status: 'UPCOMING' as const,
      detail: 'Scheduled',
      startTime: timeET,
      color: SPORT_COLORS.basketball,
      dateUTC: utcTime,
    } as Game;
  }).filter(Boolean) as Game[];
}

export function parseBDLBaseball(games: any[], targetDateET?: string): Game[] {
  return games.map(g => {
    const statusStr: string = g.status || '';
    const isScheduled = statusStr.includes('T') && statusStr.includes('Z');
    const scorePlayed = (g.home_team_score > 0 || g.visitor_team_score > 0);

    if (!isScheduled && scorePlayed) return null;

    const utcTime = isScheduled ? statusStr : `${g.date}T00:00:00Z`;
    const { dateET, timeET } = convertToEastern(utcTime);

    if (targetDateET && dateET !== targetDateET) return null;

    const homeName = g.home_team?.display_name || g.home_team_name || g.home_team?.name || '?';
    const awayName = g.away_team?.display_name || g.away_team_name || g.away_team?.name || '?';

    const coords = geocode(null, null, 'USA', homeName);
    if (!coords) return null;

    return {
      id: g.id + 900000,
      sport: 'baseball' as Sport,
      league: 'MLB',
      home: homeName,
      away: awayName,
      venue: '', city: g.home_team?.city || '', country: 'USA',
      lat: coords[0], lng: coords[1],
      status: 'UPCOMING' as const,
      detail: 'Scheduled',
      startTime: timeET,
      color: SPORT_COLORS.baseball,
      dateUTC: utcTime,
    } as Game;
  }).filter(Boolean) as Game[];
}

export function parseESPNCollegeBasketball(events: any[], targetDate?: string): Game[] {
  return events
    .map(event => {
      const comp = event.competitions?.[0];
      if (!comp) return null;

      const statusName: string = event.status?.type?.name || comp.status?.type?.name || '';
      if (statusName !== 'STATUS_SCHEDULED') return null;

      const competitors = comp.competitors || [];
      const homeTeam = competitors.find((c: any) => c.homeAway === 'home');
      const awayTeam = competitors.find((c: any) => c.homeAway === 'away');
      const homeName = homeTeam?.team?.displayName || '?';
      const awayName = awayTeam?.team?.displayName || '?';

      const venueName: string = comp.venue?.fullName || '';
      const venueCity: string = comp.venue?.address?.city || '';
      const venueState: string = comp.venue?.address?.state || '';

      const utcTime: string = event.date || '';
      const { dateET, timeET } = convertToEastern(utcTime);

      if (targetDate && dateET !== targetDate) return null;

      const coords = geocodeCityState(venueCity, venueState)
        || geocode(venueName || null, venueCity || null, 'USA', homeName);
      if (!coords) return null;

      const eventId = parseInt(event.id, 10) || 0;

      return {
        id: eventId + 200000,
        sport: 'college_basketball' as Sport,
        league: 'NCAA',
        home: homeName,
        away: awayName,
        venue: venueName,
        city: venueCity,
        country: 'USA',
        lat: coords[0],
        lng: coords[1],
        status: 'UPCOMING' as const,
        detail: 'Scheduled',
        startTime: timeET,
        color: SPORT_COLORS.college_basketball,
        dateUTC: utcTime,
      } as Game;
    })
    .filter(Boolean) as Game[];
}
