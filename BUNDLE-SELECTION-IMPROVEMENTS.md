# Bundle Selection Improvements

## Changes Made

### 1. Prioritize Home Win Over Away Win
**Location:** [generate-intelligent-bundles.ts:1429-1437](scripts/generate-intelligent-bundles.ts#L1429-L1437)

**Reasoning:** Home teams historically have better win rates due to:
- Familiar pitch/court conditions
- Home crowd support
- No travel fatigue
- Referee bias (subtle but documented)

**Implementation:**
```typescript
// Second priority: Prioritize Home Win over Away Win (home advantage)
const aIsHomeWin = a.pick.toLowerCase().includes('home win');
const bIsHomeWin = b.pick.toLowerCase().includes('home win');
if (aIsHomeWin && !bIsHomeWin) {
  return -1; // a (Home Win) comes first
}
if (!aIsHomeWin && bIsHomeWin) {
  return 1; // b (Home Win) comes first
}
```

**Impact:**
- When confidence scores are similar (within 5 points), Home Win picks are selected first
- Applies to all bundles across all subscription tiers
- Increases bundle success rate by leveraging home advantage

### 2. Increased Game Count for 10 Odds and 20 Odds Bundles
**Location:** [generate-intelligent-bundles.ts:1386-1396](scripts/generate-intelligent-bundles.ts#L1386-L1396)

**Changes:**

#### Bundle 9: 10 Odds Weekend Mixed Sports Ultimate
**Before:**
- Max picks: 5 games
- Minimum required: 2 games

**After:**
- Max picks: 9 games
- Minimum required: 7 games
- Target range: 7-9 games

#### Bundle 10: +20 Odds Special Ultimate
**Before:**
- Max picks: 6 games
- Minimum required: 3 games

**After:**
- Max picks: 9 games
- Minimum required: 7 games
- Target range: 7-9 games

**Reasoning:**
- More games with lower individual odds = safer strategy
- Example for 10x target:
  - Old: 5 games × 1.58 odds each = risky
  - New: 8 games × 1.33 odds each = safer
- Example for 20x target:
  - Old: 6 games × 1.65 odds each = very risky
  - New: 8 games × 1.44 odds each = much safer

**Safety Calculation:**
```
10x with 7 games: 10^(1/7) = 1.39 odds per game
10x with 9 games: 10^(1/9) = 1.29 odds per game

20x with 7 games: 20^(1/7) = 1.54 odds per game
20x with 9 games: 20^(1/9) = 1.41 odds per game
```

Lower individual odds per game means:
- Higher probability of each pick winning
- Better risk distribution
- More consistent returns
- Less variance in outcomes

### 3. Updated Target Game Count Logic
**Location:** [generate-intelligent-bundles.ts:1466-1472](scripts/generate-intelligent-bundles.ts#L1466-L1472)

**Implementation:**
```typescript
// For high-odds bundles, we need more games (7-9) with lower individual odds for safety
let targetGameCount = maxPicks;
if (targetOdds >= 20) {
  targetGameCount = Math.max(maxPicks, 7); // 7-9 games for 20x+ bundles
} else if (targetOdds >= 10) {
  targetGameCount = Math.max(maxPicks, 7); // 7-9 games for 10x+ bundles
}
```

**Impact:**
- Ensures 10 Odds and 20 Odds bundles always aim for 7+ games
- Automatically adjusts game selection to meet target odds range
- Maintains safety-first approach with lower odds per game

## Selection Priority Order (Updated)

When selecting bets for bundles, the system now prioritizes in this order:

1. **Confidence Score** (75%+ required)
   - Must be within 5 points to consider other factors

2. **Home Win vs Away Win** (NEW)
   - Home Win picks are preferred over Away Win
   - Only applies when confidence scores are similar

3. **Sport Diversity**
   - Cross-sport picks reduce correlated risk
   - Maximum 2 games from same sport per bundle

4. **Odds Distance to Target**
   - For 5x+ targets: prefer odds close to ideal per game
   - For 2x targets: prefer lower odds (safer)

## Expected Benefits

### Home Win Prioritization:
- ✅ Higher win rate (home advantage)
- ✅ More predictable outcomes
- ✅ Better historical performance data
- ✅ Reduced variance in results

### 7-9 Games for High Odds Bundles:
- ✅ Lower risk per individual pick
- ✅ Better risk distribution
- ✅ More consistent returns
- ✅ Easier to reach target odds safely
- ✅ Less likely to lose entire bundle on 1-2 upsets

## Bundle Configuration Summary

| Bundle | Target Odds | Old Games | New Games | Min Required |
|--------|-------------|-----------|-----------|--------------|
| +2 Odds Free | 2x | 2-3 | 2-3 | 2 |
| +5 Odds Basic | 5x | 3-4 | 3-4 | 2 |
| +5 Odds Pro | 5x | 3-5 | 3-5 | 2 |
| +5 Odds Soccer | 5x | 3-4 | 3-4 | 2 |
| +5 Odds O/U | 5x | 3-4 | 3-4 | 2 |
| +5 Odds Players | 5x | 3-4 | 3-4 | 2 |
| **10 Odds Weekend** | **10x** | **3-5** | **7-9** | **7** |
| **+20 Odds Special** | **20x** | **3-6** | **7-9** | **7** |

## Files Modified

1. [scripts/generate-intelligent-bundles.ts](scripts/generate-intelligent-bundles.ts)
   - Lines 1386-1396: Updated 10 Odds and 20 Odds bundle parameters
   - Lines 1429-1437: Added Home Win prioritization logic
   - Lines 1466-1472: Updated target game count for high-odds bundles

## Next Bundle Generation

These changes will take effect at the next scheduled bundle generation:
- **Time:** 10:00 PM daily (server local time)
- **Expected:** Tomorrow at 10 PM
- **Features:** Home Win priority + 7-9 games for 10x/20x bundles

## Testing Recommendation

After tomorrow's bundle generation:
1. Verify 10 Odds bundle has 7-9 games
2. Verify 20 Odds bundle has 7-9 games
3. Check that Home Win picks are prioritized in selections
4. Monitor bundle performance over 7-14 days to compare with historical data
