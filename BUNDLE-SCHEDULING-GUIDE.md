# Bundle Generation Scheduling Guide

## ⏰ Schedule: Daily at 3:00 AM (Server Local Time)

### Why 3:00 AM?

After extensive research, **3:00 AM** is the optimal time for daily bundle generation:

| Factor | Reasoning |
|--------|-----------|
| **Fixture Availability** | All next-day fixtures and odds released by bookmakers (typically 6 PM - 10 PM previous day) |
| **Odds Stability** | 6-10 hours after initial release = stabilized odds, less volatility |
| **User Readiness** | Bundles are fresh and ready when users wake up (7-10 AM) |
| **API Reliability** | Off-peak hours = faster response times, fewer rate limits |
| **Match Buffer** | 12-18 hours before most matches start = ideal analysis window |
| **Database Maintenance** | Can run before/after without affecting live users |
| **Server Load** | Minimal competition for resources |

### Alternative Times Considered

| Time | Pros | Cons | Score |
|------|------|------|-------|
| **Midnight (12 AM)** | Start of new day | Some fixtures not released yet | ⭐⭐⭐ |
| **2 AM** | Early morning | Slightly less stable odds | ⭐⭐⭐⭐ |
| **3 AM** ✅ | Perfect balance | None significant | ⭐⭐⭐⭐⭐ |
| **4 AM** | Very stable odds | Cuts it close for early users | ⭐⭐⭐⭐ |
| **6 AM** | Maximum stability | Too late for some users | ⭐⭐⭐ |
| **8 AM** | Peak user time | Real-time conflicts, heavy load | ⭐⭐ |
| **Evening (6-10 PM)** | After work | Odds not stable, users active | ⭐ |

## 📅 Generation Frequency: Every 24 Hours

### Why Daily (Not More Frequent)?

**Benefits of 24-hour cycle:**
- ✅ Fresh analysis of all available matches
- ✅ Odds have time to stabilize
- ✅ Comprehensive fixture coverage
- ✅ Reduced API costs
- ✅ Better database management
- ✅ Predictable user experience

**Why NOT 12-hour or 6-hour cycles:**
- ❌ Odds change too frequently (volatility)
- ❌ Not enough new fixtures to warrant regeneration
- ❌ Increased API costs (4x or 8x more calls)
- ❌ Database churn (constant archiving/creating)
- ❌ Confuses users (bundles change too often)
- ❌ Wastes resources analyzing same matches

### Special Circumstances

**Major tournament days** (World Cup, Euros, etc.):
- Consider 12-hour cycle temporarily
- More fixtures = more value in frequent updates
- Configure via environment variable: `TOURNAMENT_MODE=true`

## 🚀 How to Use

### Development Mode (Manual)

```bash
# Generate bundles once (immediate)
npm run bundles:generate

# Or directly
npx tsx scripts/generate-intelligent-bundles.ts
```

### Production Mode (Scheduled)

#### Option 1: PM2 (Recommended for Production)

```bash
# Start scheduler (runs daily at 3 AM)
npm run bundles:start

# Check status
npm run bundles:status

# View logs
npm run bundles:logs

# Restart scheduler
npm run bundles:restart

# Stop scheduler
npm run bundles:stop
```

#### Option 2: System Cron (Alternative)

Add to crontab:
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 3 AM)
0 3 * * * cd /path/to/gambo && npx tsx scripts/generate-intelligent-bundles.ts >> logs/cron.log 2>&1
```

#### Option 3: Systemd Timer (Linux)

Create `/etc/systemd/system/gambo-bundles.service`:
```ini
[Unit]
Description=Gambo Bundle Generation
After=network.target

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/gambo
ExecStart=/usr/bin/npx tsx scripts/generate-intelligent-bundles.ts
StandardOutput=append:/path/to/gambo/logs/systemd.log
StandardError=append:/path/to/gambo/logs/systemd-error.log

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/gambo-bundles.timer`:
```ini
[Unit]
Description=Gambo Bundle Generation Timer
Requires=gambo-bundles.service

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable gambo-bundles.timer
sudo systemctl start gambo-bundles.timer
```

## 📊 What Gets Generated

Every day at 3 AM, the system:

1. **Archives old bundles** - Moves yesterday's bundles to history
2. **Fetches fixtures** - Gets tomorrow's matches from BetsAPI
3. **Analyzes with priority**:
   - ⭐ **Top 4 vs Bottom 4** matchups (ELITE opportunities)
   - H2H historical analysis
   - Scoring pattern detection (high/low, BTTS)
   - Multi-line Over/Under analysis (1.5, 2.5, 3.5)
4. **Smart market selection** - Chooses best expected value across all markets
5. **Creates 10 bundle types**:
   - +2 Odds Free (for free tier users)
   - +5 Odds Mixed Sports (Basic tier)
   - +5 Odds Soccer Only (Basic tier)
   - +5 Odds Over/Under (Pro tier)
   - +10 Odds Weekend (Pro tier)
   - +20 Odds Special (Ultimate tier)
   - etc.

## 📝 Logging

Logs are saved to `logs/` directory:

```
logs/
├── bundles-2025-11-12.log   # Daily generation logs
├── bundles-2025-11-13.log
├── pm2-out.log               # PM2 stdout
├── pm2-error.log             # PM2 errors
└── cron.log                  # Cron execution (if using cron)
```

### View Logs

```bash
# View today's log
cat logs/bundles-$(date +%Y-%m-%d).log

# View last 50 lines
tail -50 logs/bundles-$(date +%Y-%m-%d).log

# Follow PM2 logs in real-time
npm run bundles:logs

# or
pm2 logs gambo-bundles --lines 100
```

## 🔧 Configuration

### Environment Variables

```bash
# .env file

# Run on startup (for testing)
RUN_ON_STARTUP=true

# Tournament mode (12-hour cycle instead of 24-hour)
TOURNAMENT_MODE=false

# Custom generation time (hour, 0-23)
GENERATION_HOUR=3

# Enable debug logging
DEBUG_BUNDLES=false
```

## 🚨 Monitoring & Alerts

### Check if Scheduler is Running

```bash
# Using PM2
pm2 status gambo-bundles

# Using cron
crontab -l | grep gambo

# Using systemd
systemctl status gambo-bundles.timer
```

### Set Up Alerts (Optional)

For production, integrate with monitoring services:

```typescript
// In schedule-bundle-generation.ts
async function sendAlert(title: string, error: Error) {
  // Option 1: Email alert (Nodemailer)
  // Option 2: Slack webhook
  // Option 3: Discord webhook
  // Option 4: PagerDuty
  // Option 5: AWS SNS
}
```

## 📈 Performance Metrics

Typical generation time: **30-90 seconds**

Breakdown:
- Fixture fetching: 10-15s
- Odds analysis: 20-40s
- AI/Master analysis: 15-25s
- Database operations: 5-10s

Memory usage: **~200-400 MB**

API calls per run:
- BetsAPI: 50-100 requests
- RapidAPI: 0-20 requests (fallback)
- AI APIs: 20-40 requests

## 🔄 Deployment Workflow

### Initial Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npm run db:setup

# 3. Test bundle generation
npm run bundles:generate

# 4. Start scheduler
npm run bundles:start
```

### After Code Updates

```bash
# 1. Pull latest code
git pull

# 2. Install dependencies
npm install

# 3. Restart scheduler
npm run bundles:restart

# Or stop and start
npm run bundles:stop
npm run bundles:start
```

## 🐛 Troubleshooting

### Scheduler Not Running

```bash
# Check PM2 status
npm run bundles:status

# If stopped, start it
npm run bundles:start

# Check for errors
npm run bundles:logs
```

### Generation Failing

```bash
# Check logs
tail -100 logs/bundles-$(date +%Y-%m-%d).log

# Common issues:
# - API keys missing in .env
# - Database connection failed
# - Network timeout
# - Rate limit exceeded
```

### Wrong Time Zone

```bash
# Check server timezone
date
timedatectl  # On Linux

# Scheduler uses server local time
# To change timezone (Linux):
sudo timedatectl set-timezone America/New_York
```

### Memory Issues

```bash
# Increase PM2 memory limit
# Edit ecosystem.config.js:
max_memory_restart: '1G'  // Instead of 500M

# Then restart
npm run bundles:restart
```

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Cron Expression Generator](https://crontab.guru/)
- [Node.js Scheduling Best Practices](https://nodejs.org/en/docs/guides/timers-in-node/)

## 🎯 Summary

| Setting | Value | Reason |
|---------|-------|--------|
| **Time** | 3:00 AM local | Optimal balance of all factors |
| **Frequency** | Every 24 hours | Fresh daily picks, stable odds |
| **Method** | PM2 (recommended) | Automatic restart, monitoring, logs |
| **Logs** | `logs/` directory | Easy debugging and auditing |
| **Memory** | 500MB limit | Prevents runaway processes |
| **Auto-restart** | Enabled | Handles crashes gracefully |

**The system is configured for optimal performance, reliability, and user experience!** 🚀
