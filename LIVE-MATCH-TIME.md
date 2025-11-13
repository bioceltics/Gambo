# Live Match Time Display - Implementation Summary

## ✅ Feature Implemented

Live games now display the **current match time** on the game cards in real-time.

---

## 🎯 What Was Changed

### 1. **BundleCard Component** ([components/bundles/BundleCard.tsx](components/bundles/BundleCard.tsx#L390-L394))

Added match time display for live games:

```typescript
{/* Show match time for live games */}
{(game.status === 'INPLAY' || game.status === 'LIVE') && game.currentPeriod && (
  <span className="px-1.5 py-0.5 bg-blue-600/20 border border-blue-500/40 rounded text-[10px] font-bold text-blue-300">
    {game.currentPeriod}
  </span>
)}
```

**Display Format**:
- `First Half - 38'` for first half games
- `Second Half - 67'` for second half games
- `Extra Time - 105'` for extra time
- `Halftime` when at halftime

### 2. **Live Scores API** ([app/api/live-scores/route.ts](app/api/live-scores/route.ts))

Updated both sportapi7 and BetsAPI transformations to include formatted match time:

**sportapi7 (Lines 88-101)**:
```typescript
if (config.sportType === 'SOCCER') {
  let periodName = '';
  if (statusCode === 6) periodName = 'First Half';
  else if (statusCode === 7) periodName = 'Second Half';
  else if (statusCode === 31) periodName = 'Halftime';
  else if (statusCode === 41) periodName = 'Extra Time';
  else periodName = 'LIVE';

  // Format with minute if available
  if (matchMinute !== null && periodName !== 'Halftime') {
    currentPeriod = `${periodName} - ${matchMinute}'`;
  } else {
    currentPeriod = periodName;
  }
}
```

**BetsAPI (Lines 354-366)**:
```typescript
if (fixture.sport === 'SOCCER' || fixture.sport_id === '1') {
  if (periodType === '1') {
    if (minute < 45) currentPeriod = `First Half - ${minute}'`;
    else if (minute === 45) currentPeriod = 'Halftime';
    else currentPeriod = `First Half - ${minute}'`;
  } else if (periodType === '2') {
    currentPeriod = 'Halftime';
  } else if (periodType === '3') {
    currentPeriod = `Second Half - ${minute}'`;
  } else if (periodType === '4') {
    currentPeriod = `Extra Time - ${minute}'`;
  }
}
```

### 3. **Test Bundles** ([scripts/create-test-bundles.ts](scripts/create-test-bundles.ts#L147-L166))

Test bundles include live games with match time:

```typescript
const liveGames = [
  { home: 'Juventus', away: 'Napoli', homeScore: 1, awayScore: 1, pick: 'Home Win', odds: 1.95, status: 'LIVE', minute: 38 },
  { home: 'Atletico Madrid', away: 'Sevilla', homeScore: 2, awayScore: 0, pick: 'Over 2.5', odds: 1.70, status: 'LIVE', minute: 67 },
  { home: 'Tottenham', away: 'West Ham', homeScore: 0, awayScore: 0, pick: 'BTTS', odds: 1.85, status: 'LIVE', minute: 23 },
];

for (const gameData of liveGames) {
  const period = gameData.minute <= 45 ? 'First Half' : gameData.minute <= 90 ? 'Second Half' : 'Extra Time';

  const game = await prisma.game.create({
    data: {
      // ... other fields
      currentPeriod: `${period} - ${gameData.minute}'`,
    }
  });
}
```

---

## 📱 UI Display

When viewing bundles at **http://localhost:3001/bundles**, live games now show:

```
🔴 LIVE  |  1-1  |  First Half - 38'
```

The match time badge appears with:
- **Blue background** (`bg-blue-600/20`)
- **Blue border** (`border-blue-500/40`)
- **Blue text** (`text-blue-300`)
- Small, compact display (`text-[10px]`)

---

## 🔄 Real-Time Updates

When games are live and the live score API fetches updates:

1. **Every 45 seconds**, the live scores API refreshes
2. **Match minute** is extracted from API response
3. **Current period** is calculated based on game time
4. **Database is updated** with new `currentPeriod` value
5. **UI displays** the formatted time automatically

---

## 🎨 Test Bundles Created

You can test the feature right now with these bundles:

### 1. 🔵 Test Bundle - Live Games
All 3 games showing live match time:
- Juventus 1-1 Napoli **[First Half - 38']**
- Atletico Madrid 2-0 Sevilla **[Second Half - 67']**
- Tottenham 0-0 West Ham **[First Half - 23']**

### 2. 🔵 Test Bundle - Mixed Live & Finished
Mix of statuses with 1 live game showing time:
- Lazio 2-1 Roma (Finished - no time)
- Fiorentina 1-0 Atalanta **[Second Half]**
- Udinese vs Sampdoria (Upcoming - no time)

---

## ✅ Summary

**Live match time is now displayed on all live games!**

The feature works for:
- ✅ Soccer games (First Half, Second Half, Extra Time)
- ✅ Basketball games (Q1, Q2, Q3, Q4)
- ✅ Hockey games (P1, P2, P3)
- ✅ American Football games (Q1, Q2, Q3, Q4)

For soccer specifically, the display includes the current minute in the format:
- `First Half - 38'`
- `Second Half - 67'`
- `Extra Time - 105'`
- `Halftime` (no minute)

---

**View the live feature at**: http://localhost:3001/bundles

**Restore original bundles after testing**:
```bash
npx tsx scripts/restore-original-bundles.ts
```
