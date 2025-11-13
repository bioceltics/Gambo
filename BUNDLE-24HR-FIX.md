# Bundle 24-Hour Schedule Fix

## Problem Identified
Bundles were being generated multiple times per day instead of once every 24 hours.

## Root Cause
The `scripts/schedule-bundle-generation.ts` file had a critical issue on **lines 175-180**:

```typescript
// Run immediately on start
try {
  await runBundleGeneration();
} catch (error) {
  console.error('Initial run failed:', error);
}
```

This caused bundles to be generated **every time the scheduler restarted**, not just at the scheduled 10 PM time.

## Fix Applied

### 1. Stopped Bundle Scheduler
- Killed all running `schedule-bundle-generation.ts` processes

### 2. Fixed Scheduler Logic
Changed [schedule-bundle-generation.ts:175-179](scripts/schedule-bundle-generation.ts#L175-L179):

**BEFORE:**
```typescript
  // Run immediately on start
  try {
    await runBundleGeneration();
  } catch (error) {
    console.error('Initial run failed:', error);
  }

  // Schedule next run at midnight UTC
  scheduleNextRun();
```

**AFTER:**
```typescript
  // DON'T run immediately on start - only run at scheduled 10 PM time
  // This prevents generating bundles every time the scheduler restarts

  // Schedule next run at 10 PM
  scheduleNextRun();
```

### 3. Restored Morning Bundles
Created and ran `scripts/restore-morning-bundles.ts` to:
- Deactivate all current bundles
- Restore the 8 morning bundles from 7:01 AM

**Restored Bundles:**
1. +2 Odds Free (WON - 2.96x)
2. +5 Odds Mixed Sports Basic (LOST)
3. +5 Odds Mixed Sports Pro (LOST)
4. +5 Odds Mixed Sports Pro (In Progress - 2W-0L-2P)
5. +5 Odds Only Soccer (LOST)
6. +5 Odds Players To Score (LOST)
7. 10 Odds Weekend (LOST)
8. +20 Odds Special (LOST)

## Current Behavior
- ✅ Bundles now ONLY generate at **10:00 PM daily** (server local time)
- ✅ All games stay on the page for the full day, even after finishing
- ✅ Bundles stay active for 24 hours until next generation
- ✅ Scheduler won't generate bundles on restart

## How to Control Bundle Generation

### Manual Commands:
```bash
# Generate bundles immediately (manual only)
npm run bundles:generate

# Start scheduler (runs daily at 10 PM)
npm run bundles:schedule

# Using PM2 (if installed):
npm run bundles:start    # Start as daemon
npm run bundles:stop     # Stop daemon
npm run bundles:restart  # Restart daemon
npm run bundles:logs     # View logs
npm run bundles:status   # Check status
```

### Scheduler Behavior:
- **Runs at:** 10:00 PM daily (server local time)
- **Does NOT run:** On scheduler start/restart
- **Logs saved to:** `logs/bundles-YYYY-MM-DD.log`

## Prevention
The scheduler will now ONLY generate bundles at the scheduled 10 PM time, preventing:
- ❌ Hourly regeneration
- ❌ Generation on scheduler restart
- ❌ Multiple generations per day
- ❌ Games disappearing before 24 hours

## Files Modified
1. [scripts/schedule-bundle-generation.ts](scripts/schedule-bundle-generation.ts) - Lines 175-179
2. [scripts/restore-morning-bundles.ts](scripts/restore-morning-bundles.ts) - Created new

## Status
✅ **FIXED** - Bundles now follow proper 24-hour cycle
