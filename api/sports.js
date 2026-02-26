// In-memory cache: survives across requests within the same serverless instance
const cache = {};
const CACHE_TTL_LIVE = 5 * 60 * 1000;       // 5 min — today's date (need fresh live scores)
const CACHE_TTL_STATIC = 6 * 60 * 60 * 1000; // 6 hours — non-today dates (schedules rarely change)
const CACHE_TTL_BDL = 12 * 60 * 60 * 1000;   // 12 hours — BDL is always future schedules

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { sport, date } = req.query;

  // Use provided date or default to today (YYYY-MM-DD)
  const dateStr = date || new Date().toISOString().split('T')[0];
  const endpoints = {
    football: 'https://v3.football.api-sports.io/fixtures?live=all',
    basketball: `https://v1.basketball.api-sports.io/games?date=${dateStr}`,
    hockey: `https://v1.hockey.api-sports.io/games?date=${dateStr}`,
    baseball: `https://v1.baseball.api-sports.io/games?date=${dateStr}`,
    rugby: `https://v1.rugby.api-sports.io/games?date=${dateStr}`,
    nfl: `https://v1.american-football.api-sports.io/games?date=${dateStr}`,
    mma: `https://v1.mma.api-sports.io/fights?date=${dateStr}`,
    f1: `https://v1.formula-1.api-sports.io/races?date=${dateStr}`,
    football_today: `https://v3.football.api-sports.io/fixtures?date=${dateStr}`,
  };

  // BallDontLie API endpoints
  const bdlEndpoints = {
    bdl_nba: `https://api.balldontlie.io/v1/games?dates[]=${dateStr}`,
    bdl_mlb: `https://api.balldontlie.io/mlb/v1/games?dates[]=${dateStr}`,
  };

  // ESPN endpoints (no API key needed)
  const dateCompact = dateStr.replace(/-/g, '');
  const espnEndpoints = {
    espn_ncaab: `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=${dateCompact}&groups=50&limit=200`,
    espn_nhl: `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${dateCompact}`,
    espn_ncaah: `https://site.api.espn.com/apis/site/v2/sports/hockey/mens-college-hockey/scoreboard?dates=${dateCompact}&limit=200`,
  };

  const isBDL = sport in bdlEndpoints;
  const isESPN = sport in espnEndpoints;
  const url = isESPN ? espnEndpoints[sport] : isBDL ? bdlEndpoints[sport] : endpoints[sport];
  if (!url) return res.status(400).json({ error: 'Invalid sport parameter' });

  if (!isBDL && !isESPN) {
    const apiKey = process.env.API_SPORTS_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });
  }

  // Check cache (keyed by sport + date)
  const cacheKey = `${sport}:${dateStr}`;
  const cached = cache[cacheKey];
  const todayStr = new Date().toISOString().split('T')[0];
  const ttl = isESPN ? CACHE_TTL_STATIC : isBDL ? CACHE_TTL_BDL : (dateStr === todayStr ? CACHE_TTL_LIVE : CACHE_TTL_STATIC);
  if (cached && (Date.now() - cached.time < ttl)) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('X-Cache-Age', Math.round((Date.now() - cached.time) / 1000));
    return res.status(200).json(cached.data);
  }

  try {
    const headers = isESPN
      ? {}
      : isBDL
        ? { 'Authorization': process.env.BALLDONTLIE_KEY }
        : { 'x-apisports-key': process.env.API_SPORTS_KEY };

    const response = await fetch(url, { headers });
    const data = await response.json();

    // Check if rate limited (API-Sports specific)
    if (!isBDL && !isESPN && data.errors && data.errors.requests) {
      // If we have stale cache, serve it instead of nothing
      if (cached) {
        res.setHeader('X-Cache', 'STALE');
        return res.status(200).json(cached.data);
      }
      return res.status(429).json(data);
    }

    // Normalize responses:
    // ESPN returns { events: [...] } — pass events array as response
    // BDL returns { data: [...] } — pass data array as response
    // API-Sports returns { response: [...] }
    const normalized = isESPN
      ? { response: data.events || [] }
      : isBDL ? { response: data.data || [] } : data;

    // Store in cache
    cache[cacheKey] = { data: normalized, time: Date.now() };

    res.setHeader('X-Cache', 'MISS');
    if (!isBDL && !isESPN) {
      res.setHeader('X-RateLimit-Remaining', response.headers.get('x-ratelimit-requests-remaining') || '?');
    }
    res.status(200).json(normalized);
  } catch (err) {
    // Serve stale cache on error
    if (cached) {
      res.setHeader('X-Cache', 'STALE-ERROR');
      return res.status(200).json(cached.data);
    }
    res.status(500).json({ error: err.message });
  }
}
