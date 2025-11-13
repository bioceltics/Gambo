# Automated Bundle Generation Scheduling

## Overview

The bundle generation system is designed to run automatically at optimal times when bookmakers worldwide have odds loaded. This ensures your platform always has fresh betting bundles regardless of timezone.

## How It Works

### Timing Strategy

Bookmakers globally update their odds throughout the day:
- **00:00-06:00 UTC**: Late Asian markets + Early European markets
- **06:00-12:00 UTC**: European markets peak
- **12:00-18:00 UTC**: American markets peak
- **18:00-00:00 UTC**: Asian markets peak

The scheduler runs **every 6 hours** to catch all global markets:
- **00:00 UTC**: Catches late Asian + early European odds
- **06:00 UTC**: Catches European morning odds
- **12:00 UTC**: Catches American morning odds
- **18:00 UTC**: Catches Asian evening odds

This ensures worldwide coverage regardless of your server's location.

## Quick Start

### Option 1: Manual Run (For Testing)

Run bundle generation once immediately:

```bash
npx tsx scripts/generate-intelligent-bundles.ts
```

### Option 2: Automated Scheduling (Recommended for Production)

#### Step 1: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

#### Step 2: Start the Scheduler

```bash
pm2 start ecosystem.config.js
```

This will:
- ✅ Run bundle generation immediately
- ✅ Schedule it to run every 6 hours automatically
- ✅ Auto-restart if it crashes
- ✅ Save logs to `./logs/` directory
- ✅ Keep running even after terminal closes

#### Step 3: Verify It's Running

```bash
pm2 status
```

You should see:
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name            │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ gambo-bundles   │ online  │ 0       │ 2m       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

### Useful PM2 Commands

```bash
# View real-time logs
pm2 logs gambo-bundles

# View last 100 lines of logs
pm2 logs gambo-bundles --lines 100

# Restart the scheduler
pm2 restart gambo-bundles

# Stop the scheduler
pm2 stop gambo-bundles

# Remove the scheduler
pm2 delete gambo-bundles

# Save PM2 configuration (persists across reboots)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Production Deployment

### On Your Server

1. **Clone your repository**:
   ```bash
   cd /var/www/gambo
   git pull
   ```

2. **Install dependencies**:
   ```bash
   npm install
   npm install -g pm2
   ```

3. **Set up environment variables**:
   ```bash
   # Make sure .env has your API keys
   nano .env
   ```

4. **Start the scheduler**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start on boot
   ```

5. **Monitor**:
   ```bash
   pm2 monit  # Real-time monitoring dashboard
   ```

### Using Cron (Alternative to PM2)

If you prefer cron jobs instead of PM2:

1. **Open crontab**:
   ```bash
   crontab -e
   ```

2. **Add these lines** (runs every 6 hours at 00:00, 06:00, 12:00, 18:00 UTC):
   ```cron
   0 */6 * * * cd /var/www/gambo && npx tsx scripts/generate-intelligent-bundles.ts >> logs/cron-bundles.log 2>&1
   ```

3. **For specific UTC times**:
   ```cron
   0 0,6,12,18 * * * cd /var/www/gambo && npx tsx scripts/generate-intelligent-bundles.ts >> logs/cron-bundles.log 2>&1
   ```

## Logs and Monitoring

### Log Locations

- **PM2 logs**: `./logs/pm2-out.log` and `./logs/pm2-error.log`
- **Daily bundle logs**: `./logs/bundles-YYYY-MM-DD.log`

### Monitor Bundle Generation

Check if bundles are being created:

```bash
# View today's log
cat logs/bundles-$(date +%Y-%m-%d).log

# Monitor in real-time
tail -f logs/bundles-$(date +%Y-%m-%d).log

# Check database for recent bundles
npx prisma studio
# Then open Bundles table and sort by publishedAt
```

## Customization

### Change Scheduling Interval

Edit [schedule-bundle-generation.ts](scripts/schedule-bundle-generation.ts):

```typescript
const INTERVAL_HOURS = 6; // Change to 3, 4, 8, 12, or 24
```

### Change Cron Schedule

For different timing patterns, use [crontab.guru](https://crontab.guru/) to generate cron expressions:

- Every 3 hours: `0 */3 * * *`
- Every 12 hours: `0 */12 * * *`
- Daily at 6 AM UTC: `0 6 * * *`
- Every day at midnight UTC: `0 0 * * *`

## Troubleshooting

### No bundles are being created

**Check if odds are available**:
```bash
# Run script manually to see output
npx tsx scripts/generate-intelligent-bundles.ts
```

If you see "Total betting opportunities analyzed: 0", it means The Odds API doesn't have odds loaded yet. Wait a few hours and try again.

**Check API quota**:
- Visit [The Odds API Dashboard](https://the-odds-api.com/account/)
- Free tier: 500 requests/month
- Each run uses ~67 requests (one per sport/league)
- With 6-hour intervals: ~335 requests/month ✅

### Scheduler not running

```bash
# Check PM2 status
pm2 status

# If not running, restart it
pm2 restart gambo-bundles

# Check for errors
pm2 logs gambo-bundles --err --lines 50
```

### High memory usage

The scheduler is configured to restart if memory exceeds 500MB. If this happens frequently:

1. **Reduce AI analysis load** by limiting sports in [generate-intelligent-bundles.ts](scripts/generate-intelligent-bundles.ts)
2. **Increase memory limit** in `ecosystem.config.js`:
   ```javascript
   max_memory_restart: '1G',  // Change from 500M to 1G
   ```

## Best Practices

1. **Monitor API quota**: Check your Odds API usage regularly
2. **Check logs daily**: Review `./logs/bundles-*.log` files
3. **Test before deploying**: Run manually first to ensure it works
4. **Use PM2 for production**: More reliable than cron
5. **Set up alerts**: Use PM2 monitoring or log monitoring tools

## API Rate Limits

**The Odds API Free Tier**:
- 500 requests/month
- Each bundle generation run uses ~67 requests
- Running every 6 hours = ~335 requests/month ✅ Fits within quota!

**To reduce API usage**:
- Increase interval to 12 hours (167 requests/month)
- Filter to specific sports only
- Upgrade to paid plan for more requests

## Support

For issues:
- Check logs: `pm2 logs gambo-bundles`
- Verify API keys in `.env`
- Test manually: `npx tsx scripts/generate-intelligent-bundles.ts`
- Check Odds API status: [status.the-odds-api.com](https://status.the-odds-api.com/)

---

**Note**: The scheduler uses UTC time to align with bookmakers worldwide, ensuring your platform serves users globally with fresh odds regardless of timezone.
