# SportGlobe - Live Sports on a 3D Globe

## Setup

1. Push to GitHub
2. Import into Vercel
3. In Vercel project settings → Environment Variables, add:
   - `API_SPORTS_KEY` = your API-Sports key
4. Redeploy

## How it works

- Fetches live games from API-Sports (football, basketball, hockey, baseball)
- Geocodes venues to lat/lng coordinates
- Renders on an interactive 3D globe
- Auto-refreshes every 60 seconds
- Falls back to today's schedule if no live games
