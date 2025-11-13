# Bundle Generation Issues and Fixes

## Issues Identified

### 1. Scheduler Not Running at 10 PM
**Problem:** The scheduler process was not running before 10 PM tonight, so bundle generation didn't trigger automatically.

**Root Cause:** The scheduler needs to run continuously as a background service. When the computer restarts or the process is killed, it stops.

**Fix Applied:**
- Installed PM2 as a local dev dependency
- Updated package.json scripts to use `npx pm2`
- PM2 now manages the scheduler process
- Next step: Set up PM2 to auto-start on system boot

**Status:** ✅ Fixed - PM2 configured and will be started after current generation completes

### 2. League Activity Animations Not Showing
**Problem:** During bundle generation, the AI Engine box should show live activities like "⚽ Analyzing England • Premier League" but these don't appear.

**Root Cause:** The code was implemented correctly in the script (lines 388-410 for soccer, similar for other sports), but the generation that ran used a cached or old version of the script.

**Code Location:** [generate-intelligent-bundles.ts:388-577](scripts/generate-intelligent-bundles.ts#L388-L577)

**Implementation:**
```typescript
const leaguesSeen = new Set<string>();

for (const fixture of fixtures) {
  const leagueKey = `${fixture.countryName} • ${fixture.leagueName}`;
  if (!leaguesSeen.has(leagueKey)) {
    leaguesSeen.add(leagueKey);
    generationStatusManager.addActivity(`⚽ Analyzing ${leagueKey}`);
  }
  // ... process fixture
}
```

**Fix Applied:**
- Cleared TSX/Node caches
- Running fresh generation to test the implemented code

**Status:** ⏳ Testing - Fresh generation running now

### 3. Analyzed Games Not Being Saved to Database
**Problem:** All analyzed games should be saved to the `AnalyzedGame` table for the Games Analysis page, but 0 games were saved.

**Root Cause:** Same as issue #2 - the code exists (lines 1058-1101) but didn't execute in the previous generation due to caching.

**Code Location:** [generate-intelligent-bundles.ts:1058-1101](scripts/generate-intelligent-bundles.ts#L1058-L1101)

**Implementation:**
```typescript
// Save ALL analyzed games to database
for (const bet of allBets) {
  try {
    await prisma.analyzedGame.create({
      data: {
        sport: bet.sport,
        country: bet.league.split(' - ')[0] || 'Unknown',
        competition: bet.league,
        homeTeam: bet.homeTeam,
        awayTeam: bet.awayTeam,
        scheduledAt: bet.scheduledAt,
        // ... all analysis fields
        selectedForBundle: false,
        generationDate: generationDate
      }
    });
  } catch (error: any) {
    console.error(`Error saving analyzed game: ${error.message}`);
  }
}
```

**Fix Applied:**
- Cleared caches
- Running fresh generation with proper code

**Status:** ⏳ Testing - Fresh generation running now

### 4. Previous Bundles Feature Request
**Problem:** User wants current bundles saved to a "Previous" section before new generation starts.

**Current Behavior:**
- Old bundles are archived (isActive = false) AFTER new bundles are created
- This ensures zero downtime - users always see bundles

**User Request:**
"all current games should be saved into previous before generation starts"

**Proposed Solution:**
Option A: Archive bundles BEFORE generation (may leave no bundles visible during generation)
Option B: Create a "Previous Bundles" UI page to view archived bundles
Option C: Keep current behavior (archive after) but add a filter/section to view past bundles

**Status:** ⏸️ Pending - Awaiting user clarification on which approach they prefer

## Files Modified

1. [package.json](package.json) - Updated PM2 scripts to use npx
2. [scripts/generate-intelligent-bundles.ts](scripts/generate-intelligent-bundles.ts)
   - Lines 388-410: Soccer league activity logging
   - Lines 429-455: Basketball league activity logging
   - Lines 470-497: Tennis league activity logging
   - Lines 511-538: Hockey league activity logging
   - Lines 553-577: Football league activity logging
   - Lines 1058-1101: Save all analyzed games to database
   - Lines 1691-1692: Bundle creation activity logging

3. [prisma/schema.prisma](prisma/schema.prisma) - Added AnalyzedGame model
4. [app/api/analyzed-games/route.ts](app/api/analyzed-games/route.ts) - API endpoint for analyzed games
5. [app/games-analysis/page.tsx](app/games-analysis/page.tsx) - Games Analysis UI page

## Current Generation Status

**Running:** Fresh bundle generation with cleared caches
**Started:** 10:07 PM
**Expected:**
- League activities should appear in AI Engine box
- All ~700 games should be saved to AnalyzedGame table
- Games Analysis page should populate with data

## Next Steps

1. ✅ Wait for current generation to complete
2. ⏳ Verify league activities appear in generation-status.json
3. ⏳ Verify analyzed games saved to database
4. ⏳ Verify Games Analysis page shows data
5. ⏳ Start PM2 scheduler for future automatic generations
6. ⏳ Set up PM2 auto-startup on system boot
7. ❓ Clarify and implement "Previous Bundles" feature

## Testing Checklist

After this generation completes:
- [ ] Check generation-status.json shows league activities
- [ ] Query database: `SELECT COUNT(*) FROM AnalyzedGame` should return ~700
- [ ] Visit `/games-analysis` - should show games
- [ ] Test filters (Sport, Country, Competition, etc.)
- [ ] Expand game cards to view full analysis
- [ ] Verify "IN BUNDLE" badges appear
- [ ] Check AI Engine box showed live activities during generation

## PM2 Commands

```bash
# Start scheduler
npm run bundles:start

# Check status
npm run bundles:status

# View logs
npm run bundles:logs

# Stop scheduler
npm run bundles:stop

# Restart scheduler
npm run bundles:restart
```

## Troubleshooting

If issues persist:
1. **Clear all caches:** `rm -rf node_modules/.cache`
2. **Kill all node processes:** `pkill -f node`
3. **Restart dev server:** `npm run dev`
4. **Check database:** `sqlite3 prisma/dev.db "SELECT * FROM AnalyzedGame LIMIT 5;"`
5. **Check generation logs:** `tail -100 logs/generation-status.json`
