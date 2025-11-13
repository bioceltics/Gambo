# Multi-Market Betting Implementation Status

## Current Status: IN PROGRESS ⚠️

We are in the middle of implementing support for ALL betting markets (not just H2H).

## What's Been Completed ✅

### 1. Multi-Sport Support
- ✅ Configured BetsAPI to fetch from 5 sports: Soccer, Basketball, Tennis, Hockey, Football
- ✅ Added esports filtering for all sports (removes virtual/cyber games)
- ✅ Added competitive odds filtering (minimum 1.20 odds to exclude mismatched games)
- ✅ All sports now fetch real odds using separate API calls

### 2. Groq API Upgrade
- ✅ Upgraded Groq to pay-as-you-go (working perfectly, no rate limits)
- ✅ System handles 80+ games across 4 sports without issues

### 3. Bundle Naming
- ✅ Fixed bundle names to use target odds format:
  - "+2 Odds Free"
  - "+5 Odds Mixed Sports Basic/Pro"
  - "10 Odds Weekend Mixed Sports Ultimate"
  - "+20 Odds Special Ultimate"

### 4. Odds Fetching Enhancement (PARTIAL)
- ✅ Updated `fetchEventOdds()` in `/lib/betsapi.ts` to fetch multiple markets:
  - Market 1_1: H2H (Home/Draw/Away)
  - Market 1_2: Double Chance (Home or Draw / Away or Draw)
  - Market 1_3: Over/Under Goals
  - Market 1_5: BTTS (Both Teams To Score)
- ✅ Updated MatchOdds interface in `/lib/ai/MatchAnalyzer.ts` to include new markets

## What Still Needs To Be Done 🔧

### CRITICAL: AI and Bet Conversion Updates

**Current Problem:**
- The `fetchEventOdds()` now returns ALL markets
- BUT the AI is still only returning "Home Win", "Away Win", "Draw"
- AND the bet conversion doesn't create bets for the new markets

**Required Changes:**

#### 1. Update AI Result Interface
File: `/lib/ai/MatchAnalyzer.ts`

Change `AIAnalysisResult` interface:
```typescript
interface AIAnalysisResult {
  recommendedPick: 'Home Win' | 'Away Win' | 'Draw' | 'Home or Draw' | 'Away or Draw' | 'Over 2.5' | 'Under 2.5' | 'BTTS Yes' | 'BTTS No';
  // ... rest
}
```

#### 2. Update AI Prompts
File: `/lib/ai/MatchAnalyzer.ts` (lines 1303, 1236-1312)

Update the prompt to:
- Include all available markets in the analysis
- Pass doubleChance, overUnder, btts odds to the AI
- Allow AI to recommend from ALL market types
- Add back Double Chance, BTTS, Over/Under instructions (we removed them earlier)

#### 3. Update Bet Conversion
File: `/scripts/generate-intelligent-bundles.ts`

The `convertBetsAPIFixtureToMatchBets()` function (lines 87-205) needs to:
- Check the AI's recommended pick
- Map it to the correct odds from the fixture
- Create bets for Double Chance picks (use doubleChance.homeOrDraw or doubleChance.awayOrDraw)
- Create bets for BTTS picks (use btts.yes or btts.no)
- Create bets for Over/Under picks (use overUnder.over or overUnder.under)

Example logic needed:
```typescript
let pickOdds: number;
if (pick === 'Home Win') {
  pickOdds = fixture.odds.homeWin;
} else if (pick === 'Home or Draw') {
  pickOdds = fixture.odds.doubleChance?.homeOrDraw || 0;
} else if (pick === 'BTTS Yes') {
  pickOdds = fixture.odds.btts?.yes || 0;
}
// ... etc
```

## Current Test Results

Last successful run with H2H only:
- Soccer: 37 games
- Basketball: 13 games
- Hockey: 36 games
- Tennis: 0 games
- **Total: 86 betting opportunities**
- **8 bundles created** with real competitive odds (1.27-2.00 range)

## Next Steps

1. **Update AIAnalysisResult interface** to support all market types
2. **Update AI prompts** to analyze and recommend all markets
3. **Update convertBetsAPIFixtureToMatchBets** to handle all pick types
4. **Test with real data** to ensure correct odds mapping
5. **Clear database and regenerate bundles** with full market support

## Files Modified

- `/lib/betsapi.ts` - fetchEventOdds() updated ✅
- `/lib/ai/MatchAnalyzer.ts` - MatchOdds interface updated ✅ (AIAnalysisResult pending)
- `/scripts/generate-intelligent-bundles.ts` - Needs bet conversion updates ❌
- All bundle generation and archiving logic ✅

## Important Notes

- The system is currently working with H2H only (safe fallback)
- Don't delete the current working code until multi-market is fully tested
- The BetsAPI DOES provide all markets (confirmed via testing)
- Double Chance format: homeOrDraw and awayOrDraw (not homeOrAway)
