// In-memory cache: survives across requests within the same serverless instance
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { sport } = req.query;
  
  const today = new Date().toISOString().split('T')[0];
  const endpoints = {
    football: 'https://v3.football.api-sports.io/fixtures?live=all',
    basketball: `https://v1.basketball.api-sports.io/games?date=${today}`,
    hockey: `https://v1.hockey.api-sports.io/games?date=${today}`,
    baseball: `https://v1.baseball.api-sports.io/games?date=${today}`,
    rugby: `https://v1.rugby.api-sports.io/games?date=${today}`,
    football_today: `https://v3.football.api-sports.io/fixtures?date=${today}`,
  };

  const url = endpoints[sport];
  if (!url) return res.status(400).json({ error: 'Invalid sport parameter' });

  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  // Check cache
  const cacheKey = sport;
  const cached = cache[cacheKey];
  if (cached && (Date.now() - cached.time < CACHE_TTL)) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('X-Cache-Age', Math.round((Date.now() - cached.time) / 1000));
    return res.status(200).json(cached.data);
  }

  try {
    const response = await fetch(url, {
      headers: { 'x-apisports-key': apiKey }
    });
    const data = await response.json();
    
    // Check if rate limited
    if (data.errors && data.errors.requests) {
      // If we have stale cache, serve it instead of nothing
      if (cached) {
        res.setHeader('X-Cache', 'STALE');
        return res.status(200).json(cached.data);
      }
      return res.status(429).json(data);
    }
    
    // Store in cache
    cache[cacheKey] = { data, time: Date.now() };
    
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-RateLimit-Remaining', response.headers.get('x-ratelimit-requests-remaining') || '?');
    res.status(200).json(data);
  } catch (err) {
    // Serve stale cache on error
    if (cached) {
      res.setHeader('X-Cache', 'STALE-ERROR');
      return res.status(200).json(cached.data);
    }
    res.status(500).json({ error: err.message });
  }
}
