# RapidAPI Integration Guide

## Status: ✅ FULLY INTEGRATED

RapidAPI is already integrated into the Gambo betting platform as a **fallback data source** for live scores across all sports.

---

## Current Implementation

### 1. Live Scores Integration

**File**: [app/api/live-scores/route.ts](app/api/live-scores/route.ts)

RapidAPI is used through the **SportAPI7** service (`sportapi7.p.rapidapi.com`) to fetch live sports data.

#### Data Source Priority:
1. **BetsAPI** (Primary - Paid $90/month subscription) - Best odds and match data
2. **SportMonks** (Fallback #1) - Enhanced soccer data
3. **RapidAPI/SportAPI7** (Fallback #2) - Multi-sport live scores

#### Sports Covered via RapidAPI:
- ⚽ **Soccer/Football** - `api/v1/sport/football/events/live`
- 🏀 **Basketball** - `api/v1/sport/basketball/events/live`
- 🏒 **Ice Hockey** - `api/v1/sport/ice-hockey/events/live`
- 🏈 **American Football** - `api/v1/sport/american-football/events/live`

### 2. Environment Configuration

Add to your `.env` or `.env.local`:

```bash
# RapidAPI Key for SportAPI7
RAPIDAPI_KEY=your_rapidapi_key_here
```

**Where to get the key:**
1. Sign up at [RapidAPI.com](https://rapidapi.com/)
2. Subscribe to [SportAPI7](https://rapidapi.com/sportapi/api/sportapi7)
3. Copy your API key from the dashboard

---

## Features Implemented

### ✅ Multi-Sport Live Scores
- Real-time scores across 5 sports
- Match status tracking (LIVE, UPCOMING, FINISHED)
- Period/quarter tracking (1H, 2H, Q1-Q4, etc.)
- Team names and league information

### ✅ Soccer Match Details
When a soccer match is live or finished, the system automatically fetches:
- **Goals** with player names and assist information
- **Cards** (yellow/red) with player names
- **Substitutions** with player in/out details
- **Match timing** with extra time tracking

### ✅ Live Statistics
- Possession percentages
- Shots on target
- Corners
- Fouls
- Yellow/Red cards count

### ✅ Time Display (NEW!)
- Shows match scheduled time for all games
- Smart formatting:
  - Today's matches: "14:30"
  - Tomorrow's matches: "Tomorrow 14:30"
  - Future matches: "Jan 15, 14:30"

---

## Data Transformation

RapidAPI data is transformed to match the unified format:

```typescript
{
  id: string;              // Unique match ID
  sport: string;           // SOCCER, BASKETBALL, TENNIS, HOCKEY, FOOTBALL
  homeTeam: string;        // Home team name
  awayTeam: string;        // Away team name
  homeScore?: number;      // Home team score
  awayScore?: number;      // Away team score
  status: string;          // LIVE, UPCOMING, FINISHED
  currentPeriod?: string;  // 1H, 2H, Q1, Q2, etc.
  league: string;          // League/tournament name
  scheduledAt?: string;    // ISO timestamp of match start
  liveStats?: {...};       // Live statistics
  events?: {...};          // Goals, cards, substitutions
  inBundle: boolean;       // Whether game is in active bundle
}
```

---

## API Request Structure

### Headers Required:
```typescript
{
  'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
  'x-rapidapi-key': process.env.RAPIDAPI_KEY
}
```

### Cache Strategy:
- **45-second cache** on live scores to minimize API calls
- Automatic cache invalidation on data updates
- Cache statistics tracking

### Rate Limiting:
- RapidAPI enforces rate limits based on subscription tier
- Free tier: ~500 requests/day
- Pro tier: ~10,000 requests/day
- The 45-second cache helps stay within limits

---

## When RapidAPI Is Used

### Scenario 1: No BetsAPI Subscription
If you don't have BetsAPI tokens configured, the system automatically falls back to RapidAPI for all sports.

### Scenario 2: BetsAPI Partial Coverage
If you only have some BetsAPI sport tokens (e.g., just soccer), RapidAPI fills in the gaps for other sports.

### Scenario 3: API Failures
If BetsAPI or SportMonks fail, RapidAPI provides backup data.

---

## Code Locations

### Main Integration:
- **Live Scores API**: [app/api/live-scores/route.ts:24-236](app/api/live-scores/route.ts#L24-L236)
  - `fetchSportFixtures()` function handles all RapidAPI calls
  - Automatic incident fetching for soccer matches

### UI Display:
- **Live Score Cards**: [components/live-scores/LiveScoreCard.tsx](components/live-scores/LiveScoreCard.tsx)
  - Displays all data from RapidAPI
  - Shows match time, status, scores, events
  - Interactive expandable cards with full match details

---

## Testing RapidAPI Integration

### 1. Check if RapidAPI is Active:
```bash
# View live scores API logs
tail -f logs/next.log | grep -i "rapidapi\|sportapi7"
```

### 2. Force RapidAPI Usage:
Temporarily comment out BetsAPI tokens in your `.env`:
```bash
# BETSAPI_SOCCER_TOKEN=...
# BETSAPI_BASKETBALL_TOKEN=...
```

This will force the system to use RapidAPI as the primary source.

### 3. Test Live Scores Endpoint:
```bash
curl http://localhost:3000/api/live-scores
```

Look for `"source": "real"` in the response to confirm real data is being fetched.

---

## API Response Examples

### Soccer Match (Live):
```json
{
  "id": "soccer-12345",
  "sport": "SOCCER",
  "homeTeam": "Manchester United",
  "awayTeam": "Liverpool",
  "homeScore": 2,
  "awayScore": 1,
  "status": "LIVE",
  "currentPeriod": "2H",
  "league": "Premier League",
  "scheduledAt": "2025-11-11T15:00:00.000Z",
  "liveStats": {
    "possession": { "home": 55, "away": 45 },
    "shots": { "home": 12, "away": 8 }
  },
  "events": {
    "goals": [
      {
        "player": "Marcus Rashford",
        "assist": "Bruno Fernandes",
        "team": "Manchester United",
        "time": 23,
        "extraTime": null
      }
    ],
    "cards": [...],
    "substitutions": [...]
  },
  "inBundle": true
}
```

---

## Advantages of RapidAPI Integration

### 1. **Multi-API Redundancy**
- Never depends on a single data source
- Automatic failover if primary APIs are down

### 2. **Cost Efficiency**
- Free tier available for testing
- Pay-as-you-go pricing for production
- Cheaper than multiple individual sports APIs

### 3. **Unified Interface**
- Single API for all sports
- Consistent data format
- Easy to integrate new sports

### 4. **Rich Match Data**
- Player names for goals/cards/subs
- Live statistics
- Match incidents with timing
- Tournament/league information

---

## Future Enhancements

### Potential Additions:
1. **Pre-Match Odds Fetching** - Use RapidAPI to fetch odds from multiple bookmakers
2. **Head-to-Head Statistics** - Historical match data between teams
3. **Player Statistics** - Individual player performance data
4. **Lineup Information** - Starting XI and formation data
5. **Venue/Weather Data** - Match location and conditions

### Additional Sports:
- 🎾 Tennis (already configured, just need to enable)
- ⚾ Baseball
- 🏏 Cricket
- 🏉 Rugby
- 🎯 Darts
- 🏐 Volleyball

---

## Troubleshooting

### Issue: "No live scores available"
**Causes:**
- RapidAPI key not set in `.env`
- API rate limit exceeded
- No live matches currently happening

**Solution:**
1. Check `.env` has `RAPIDAPI_KEY=...`
2. Check RapidAPI dashboard for usage limits
3. Test with different sports

### Issue: "403 Forbidden" or "401 Unauthorized"
**Causes:**
- Invalid API key
- Subscription expired
- API key not subscribed to SportAPI7

**Solution:**
1. Verify API key in RapidAPI dashboard
2. Ensure SportAPI7 subscription is active
3. Generate new API key if needed

### Issue: Match details missing (no goals/cards)
**Cause:** RapidAPI incidents endpoint may not have data for that match

**Solution:** This is normal - not all matches have detailed incident data available. The system gracefully handles missing data.

---

## Cost Breakdown

### RapidAPI SportAPI7 Pricing (as of 2025):

| Tier | Requests/Month | Cost |
|------|---------------|------|
| **Free** | 500/day (~15k/mo) | $0 |
| **Basic** | 50k/month | $10/mo |
| **Pro** | 250k/month | $25/mo |
| **Ultra** | 1M/month | $100/mo |

### Estimated Usage (Gambo Platform):
- Live scores refresh: Every 45 seconds
- Incidents fetch: Per live match (soccer only)
- **Total**: ~2,000-5,000 requests/day (60k-150k/month)

**Recommended Tier**: **Pro** ($25/mo) for production use

---

## Summary

✅ **RapidAPI is already integrated and working**
✅ **Used as a fallback when BetsAPI is unavailable**
✅ **Supports 4 sports: Soccer, Basketball, Hockey, Football**
✅ **Provides detailed match incidents and live statistics**
✅ **Time display now shows scheduled match times**
✅ **45-second cache minimizes API calls**

**No additional setup needed - just add `RAPIDAPI_KEY` to your `.env` file!**

---

**Documentation Date**: 2025-11-11
**Status**: Production Ready ✅
