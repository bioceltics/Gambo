# Real Sports Data Integration Guide

This guide will help you integrate real sports data into Gambo using free API providers.

## 🔑 API Keys Required

### 1. API-Sports (Free Tier)
**Provides:** Live fixtures, team statistics, head-to-head records for Soccer, Basketball, Football, Tennis, Hockey

**Sign up:**
1. Go to https://www.api-football.com/
2. Click "Sign Up" (top right)
3. Complete registration
4. Verify your email
5. Go to Dashboard → API Key
6. Copy your API key

**Free tier includes:**
- 100 requests per day
- Access to all sports (Football, Basketball, NFL, Tennis, Hockey)
- Live fixtures and statistics
- No credit card required

### 2. The Odds API (Free Tier)
**Provides:** Real-time betting odds from 40+ bookmakers

**Sign up:**
1. Go to https://the-odds-api.com/
2. Click "Get API Key"
3. Enter your email
4. Check your email for the API key
5. Copy your API key

**Free tier includes:**
- 500 requests per month
- Live odds from major bookmakers
- 70+ sports supported
- No credit card required

## 📝 Setup Instructions

### Step 1: Add API Keys to .env

Open your `.env` file and replace the placeholder keys:

```env
# API Keys for Sports Data
API_SPORTS_KEY="your-actual-api-key-from-api-football"
ODDS_API_KEY="your-actual-api-key-from-the-odds-api"
```

### Step 2: Generate Real Bundles

Run the real data bundle generation script:

```bash
npx ts-node scripts/generate-real-bundles.ts
```

This will:
1. Fetch upcoming fixtures from API-Sports
2. Fetch real odds from The Odds API
3. Generate 10 bundles using real game data
4. Save everything to the database

### Step 3: Verify Real Data

Check that real fixtures were fetched:

```bash
sqlite3 prisma/dev.db "SELECT homeTeam, awayTeam, league, scheduledAt FROM Game LIMIT 5;"
```

You should see real team names and leagues instead of "Team A1 vs Team B1".

## 🎯 What You Get with Real Data

### Without API Keys (Fallback Mode)
- Mock team names (Team A1, Team B1, etc.)
- Generic odds (2.0, 3.5, 3.0)
- Placeholder analysis
- Still functional but not real

### With API Keys (Real Data Mode)
- ✅ Real upcoming fixtures (Manchester City vs Brighton, Lakers vs Celtics, etc.)
- ✅ Live odds from bookmakers (Pinnacle, Bet365, etc.)
- ✅ Actual team statistics (xG, possession, form)
- ✅ Real league names (Premier League, NBA, NFL)
- ✅ Accurate schedules (actual match times)
- ✅ Professional analysis based on real data

## 📊 Supported Sports & Leagues

### Soccer ⚽
- English Premier League (EPL)
- La Liga, Serie A, Bundesliga
- Champions League
- Europa League
- And more...

### Basketball 🏀
- NBA
- NCAA College Basketball
- Euroleague
- WNBA

### American Football 🏈
- NFL
- NCAA College Football

### Tennis 🎾
- ATP
- WTA
- Grand Slams

### Hockey 🏒
- NHL
- KHL

## 🔄 Daily Bundle Generation

### Manual Generation
```bash
npx ts-node scripts/generate-real-bundles.ts
```

### Automated Daily Generation (Optional)

You can set up a cron job to auto-generate bundles daily:

**On Mac/Linux:**
```bash
crontab -e
```

Add this line (runs at 6 AM daily):
```
0 6 * * * cd /path/to/Gambo && npx ts-node scripts/generate-real-bundles.ts
```

**On Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 6:00 AM
4. Action: Start a program
5. Program: `cmd.exe`
6. Arguments: `/c cd C:\\path\\to\\Gambo && npx ts-node scripts/generate-real-bundles.ts`

## 📈 API Usage Limits

### API-Sports Free Tier
- **Limit:** 100 requests/day
- **Usage per bundle generation:** ~10-20 requests
- **Recommendation:** Generate bundles once per day

### The Odds API Free Tier
- **Limit:** 500 requests/month
- **Usage per bundle generation:** ~5-10 requests
- **Recommendation:** Generate bundles once per day (~300 requests/month)

## 🚨 Troubleshooting

### No fixtures found
**Problem:** Script says "No real fixtures found"

**Solutions:**
1. Check API keys are correctly set in .env
2. Verify there are games scheduled for tomorrow
3. Check API rate limits haven't been exceeded
4. Try a different league/sport

### API Error 401/403
**Problem:** Authentication error

**Solutions:**
1. Verify API key is correct (no extra spaces)
2. Check API key is active in your dashboard
3. Ensure you're using the right key for the right service

### API Error 429
**Problem:** Rate limit exceeded

**Solutions:**
1. Wait 24 hours for API-Sports reset
2. Wait until next month for Odds API reset
3. Consider upgrading to paid tier if needed

### Fallback bundles created
**Problem:** All bundles are fallback (not real)

**Solutions:**
1. Check .env file has real API keys
2. Ensure quotes are correct: `API_SPORTS_KEY="abc123"`
3. Restart the script
4. Check API dashboard for request errors

## 💡 Pro Tips

1. **Test APIs First:** Before running bundle generation, test your API keys:
   ```bash
   curl -H "x-rapidapi-key: YOUR_KEY" https://v3.football.api-sports.io/status
   ```

2. **Monitor Usage:** Check your API dashboards regularly to track request usage

3. **Optimize Requests:** The script is designed to minimize API calls - it fetches all fixtures in bulk

4. **Cache Data:** Consider caching fixture data to reduce repeated API calls

5. **Upgrade When Ready:** Both APIs offer affordable paid tiers with higher limits for production use

## 📞 Support

### API-Sports
- Documentation: https://www.api-football.com/documentation-v3
- Support: support@api-sports.io

### The Odds API
- Documentation: https://the-odds-api.com/liveapi/guides/v4/
- Support: contact@the-odds-api.com

## 🎉 Next Steps

Once you have real data working:

1. ✅ Bundles will show real teams and leagues
2. ✅ Odds will be from actual bookmakers
3. ✅ Users will see professional predictions
4. ✅ Analysis will be based on real statistics

Your Gambo application is now powered by real sports data! 🚀
