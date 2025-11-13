# Quick Start: Automated Bundle Generation

## For Immediate Testing

Generate bundles right now:

```bash
npm run bundles:generate
```

This will:
- Fetch odds from all 67 worldwide sports/leagues
- Use AI to analyze each match
- Create up to 10 intelligent bundles
- Save them to your database

## For Production (Automated)

### 1. Install PM2 globally

```bash
npm install -g pm2
```

### 2. Start the automated scheduler

```bash
npm run bundles:start
```

This will:
- ✅ Generate bundles immediately
- ✅ Run every 6 hours automatically (00:00, 06:00, 12:00, 18:00 UTC)
- ✅ Catch odds from bookmakers worldwide
- ✅ Auto-restart if it crashes
- ✅ Keep running even after you close the terminal

### 3. Check it's working

```bash
npm run bundles:status
```

You should see:
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name            │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ gambo-bundles   │ online  │ 0       │ 5m       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

### 4. Monitor logs in real-time

```bash
npm run bundles:logs
```

Press `Ctrl+C` to exit logs (scheduler keeps running).

## Useful Commands

```bash
# Generate bundles once (manual)
npm run bundles:generate

# Start automated scheduler
npm run bundles:start

# Check scheduler status
npm run bundles:status

# View real-time logs
npm run bundles:logs

# Restart scheduler
npm run bundles:restart

# Stop scheduler
npm run bundles:stop
```

## How It Works

The scheduler runs every **6 hours** to catch odds from bookmakers worldwide:

- **00:00 UTC**: Late Asian + Early European markets
- **06:00 UTC**: European markets peak
- **12:00 UTC**: American markets peak
- **18:00 UTC**: Asian markets peak

This ensures your platform always has fresh bundles regardless of timezone.

## What Gets Created

When bundles are generated, you'll get:

1. **Free +2 Odds Pick** (1 pick, odds >= 2.0)
2. **Basic 5X Mixed Sports** (2-4 picks, ~5x odds)
3. **Pro 5X Mixed Sports** (2-4 picks, ~5x odds)
4. **Pro 5X Value Selection** (2-4 picks, ~5x odds)
5. **Pro 5X BTTS/Totals Special** (2-4 picks, ~5x odds)
6. **Ultimate 5X Soccer/Sport Special** (2-4 picks, ~5x odds)
7. **Ultimate 5X Over/Under** (2-4 picks, ~5x odds)
8. **Ultimate 5X High Confidence** (2-4 picks, ~5x odds)
9. **Ultimate 10X Weekend Special** (2-5 picks, ~10x odds)
10. **Ultimate 20X Mega Accumulator** (3-6 picks, ~20x odds)

Each bundle includes:
- AI-analyzed picks from Claude Sonnet 4
- Confidence scores
- Detailed reasoning
- Match analysis
- Value assessments

## Troubleshooting

**No bundles created?**
- Check if odds are available: `npm run bundles:generate`
- If you see "0 betting opportunities", wait a few hours
- Odds availability fluctuates throughout the day

**Scheduler not running?**
```bash
npm run bundles:status
npm run bundles:restart
```

**Want to change the schedule?**
- Edit `scripts/schedule-bundle-generation.ts`
- Change `INTERVAL_HOURS` from 6 to your preferred interval
- Restart: `npm run bundles:restart`

## API Usage

**The Odds API Free Tier**:
- 500 requests/month free
- Each run uses ~67 requests
- Running every 6 hours = ~335 requests/month ✅

You're well within the free tier!

## Next Steps

1. **Test it**: Run `npm run bundles:generate` to see it work
2. **Start scheduler**: Run `npm run bundles:start` for production
3. **Monitor**: Use `npm run bundles:logs` to watch it work
4. **Check database**: Use `npx prisma studio` to see created bundles

For detailed documentation, see [BUNDLE-SCHEDULING.md](BUNDLE-SCHEDULING.md).

---

**Questions?** Check the logs: `npm run bundles:logs`
