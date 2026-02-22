export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { sport } = req.query;
  
  const endpoints = {
    football: 'https://v3.football.api-sports.io/fixtures?live=all',
    basketball: `https://v1.basketball.api-sports.io/games?date=${new Date().toISOString().split('T')[0]}`,
    hockey: `https://v1.hockey.api-sports.io/games?date=${new Date().toISOString().split('T')[0]}`,
    baseball: `https://v1.baseball.api-sports.io/games?date=${new Date().toISOString().split('T')[0]}`,
    rugby: `https://v1.rugby.api-sports.io/games?date=${new Date().toISOString().split('T')[0]}`,
    football_today: `https://v3.football.api-sports.io/fixtures?date=${new Date().toISOString().split('T')[0]}`,
    basketball_today: `https://v1.basketball.api-sports.io/games?date=${new Date().toISOString().split('T')[0]}`,
    hockey_today: `https://v1.hockey.api-sports.io/games?date=${new Date().toISOString().split('T')[0]}`,
    baseball_today: `https://v1.baseball.api-sports.io/games?date=${new Date().toISOString().split('T')[0]}`,
  };

  const url = endpoints[sport];
  if (!url) return res.status(400).json({ error: 'Invalid sport parameter' });

  const apiKey = process.env.API_SPORTS_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await fetch(url, {
      headers: { 'x-apisports-key': apiKey }
    });
    const data = await response.json();
    // Pass through rate limit headers for monitoring
    res.setHeader('X-RateLimit-Remaining', response.headers.get('x-ratelimit-requests-remaining') || '?');
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
