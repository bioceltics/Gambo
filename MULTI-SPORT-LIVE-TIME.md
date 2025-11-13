# Multi-Sport Live Match Time - Complete Implementation

## ✅ Feature Fully Implemented

Live match time is now displayed for **ALL SPORTS** on the bundles page in real-time.

---

## 🎯 Supported Sports

### ⚽ Soccer
**Format**: `First Half - 34'`, `Second Half - 58'`, `Extra Time - 105'`
- First Half (0-45 minutes)
- Halftime (break)
- Second Half (46-90 minutes)
- Extra Time (90+ minutes)

### 🏀 Basketball
**Format**: `Q1 - 5'`, `Q2 - 8'`, `Q3 - 6'`, `Q4 - 10'`
- Q1, Q2, Q3, Q4 (4 quarters)
- Shows current minute within each quarter

### 🏒 Hockey
**Format**: `P1 - 7'`, `P2 - 12'`, `P3 - 15'`
- P1, P2, P3 (3 periods)
- Shows current minute within each period

### 🏈 American Football
**Format**: `Q1 - 3'`, `Q2 - 8'`, `Q3 - 5'`, `Q4 - 12'`
- Q1, Q2, Q3, Q4 (4 quarters)
- Shows current minute within each quarter

---

## 📝 Implementation Details

### 1. Live Scores API ([app/api/live-scores/route.ts](app/api/live-scores/route.ts))

**sportapi7 Integration** (Lines 88-143):
```typescript
// Soccer
if (config.sportType === 'SOCCER') {
  let periodName = '';
  if (statusCode === 6) periodName = 'First Half';
  else if (statusCode === 7) periodName = 'Second Half';
  else if (statusCode === 31) periodName = 'Halftime';
  else if (statusCode === 41) periodName = 'Extra Time';

  if (matchMinute !== null && periodName !== 'Halftime') {
    currentPeriod = `${periodName} - ${matchMinute}'`;
  } else {
    currentPeriod = periodName;
  }
}

// Basketball
else if (config.sportType === 'BASKETBALL') {
  let periodName = '';
  if (statusCode === 14) periodName = 'Q1';
  else if (statusCode === 15) periodName = 'Q2';
  else if (statusCode === 16) periodName = 'Q3';
  else if (statusCode === 17) periodName = 'Q4';

  if (matchMinute !== null && periodName !== 'LIVE') {
    currentPeriod = `${periodName} - ${matchMinute}'`;
  } else {
    currentPeriod = periodName;
  }
}

// Hockey
else if (config.sportType === 'HOCKEY') {
  let periodName = '';
  if (statusCode === 14) periodName = 'P1';
  else if (statusCode === 15) periodName = 'P2';
  else if (statusCode === 16) periodName = 'P3';

  if (matchMinute !== null && periodName !== 'LIVE') {
    currentPeriod = `${periodName} - ${matchMinute}'`;
  } else {
    currentPeriod = periodName;
  }
}

// American Football
else if (config.sportType === 'FOOTBALL') {
  let periodName = '';
  if (statusCode === 14) periodName = 'Q1';
  else if (statusCode === 15) periodName = 'Q2';
  else if (statusCode === 16) periodName = 'Q3';
  else if (statusCode === 17) periodName = 'Q4';

  if (matchMinute !== null && periodName !== 'LIVE') {
    currentPeriod = `${periodName} - ${matchMinute}'`;
  } else {
    currentPeriod = periodName;
  }
}
```

**BetsAPI Integration** (Lines 378-414):
```typescript
// Soccer
if (fixture.sport === 'SOCCER' || fixture.sport_id === '1') {
  if (periodType === '1') currentPeriod = `First Half - ${minute}'`;
  else if (periodType === '2') currentPeriod = 'Halftime';
  else if (periodType === '3') currentPeriod = `Second Half - ${minute}'`;
  else if (periodType === '4') currentPeriod = `Extra Time - ${minute}'`;
}

// Basketball
else if (fixture.sport === 'BASKETBALL' || fixture.sport_id === '18') {
  if (periodType === '1') currentPeriod = `Q1 - ${minute}'`;
  else if (periodType === '2') currentPeriod = `Q2 - ${minute}'`;
  else if (periodType === '3') currentPeriod = `Q3 - ${minute}'`;
  else if (periodType === '4') currentPeriod = `Q4 - ${minute}'`;
}

// Hockey
else if (fixture.sport === 'HOCKEY' || fixture.sport_id === '17') {
  if (periodType === '1') currentPeriod = `P1 - ${minute}'`;
  else if (periodType === '2') currentPeriod = `P2 - ${minute}'`;
  else if (periodType === '3') currentPeriod = `P3 - ${minute}'`;
}

// American Football
else if (fixture.sport === 'FOOTBALL' || fixture.sport_id === '16') {
  if (periodType === '1') currentPeriod = `Q1 - ${minute}'`;
  else if (periodType === '2') currentPeriod = `Q2 - ${minute}'`;
  else if (periodType === '3') currentPeriod = `Q3 - ${minute}'`;
  else if (periodType === '4') currentPeriod = `Q4 - ${minute}'`;
}
```

### 2. UI Display ([components/bundles/BundleCard.tsx](components/bundles/BundleCard.tsx#L390-L394))

```typescript
{/* Show match time for live games */}
{(game.status === 'INPLAY' || game.status === 'LIVE') && game.currentPeriod && (
  <span className="px-1.5 py-0.5 bg-blue-600/20 border border-blue-500/40 rounded text-[10px] font-bold text-blue-300">
    {game.currentPeriod}
  </span>
)}
```

**Visual Style**:
- Blue background with border
- Small, compact font
- Displayed next to live score
- Automatically updates every 45 seconds

### 3. Data Flow ([app/bundles/page.tsx](app/bundles/page.tsx#L57))

```typescript
currentPeriod: bg.game.currentPeriod, // Include current period for live match time
```

---

## 🧪 Test Bundles Available

You can test all sports right now at **http://localhost:3001/bundles**:

### 1. ⚽ Soccer Live Bundle
- Man United 1-1 Arsenal → **First Half - 34'**
- Liverpool 2-0 Chelsea → **Second Half - 58'**

### 2. 🏀 Basketball Live Bundle
- Lakers 65-62 Warriors → **Q3 - 8'**
- Celtics 52-48 Heat → **Q2 - 5'**

### 3. 🏒 Hockey Live Bundle
- Maple Leafs 2-1 Canadiens → **P2 - 12'**
- Rangers 1-1 Bruins → **P1 - 7'**

### 4. 🏈 Football Live Bundle
- Cowboys 14-10 Eagles → **Q2 - 8'**
- Chiefs 21-17 Bills → **Q3 - 3'**

### 5. 🌐 Mixed Sports Bundle
- Barcelona 1-0 Real Madrid → **First Half - 28'** (Soccer)
- Nets 78-75 Knicks → **Q3 - 6'** (Basketball)
- Penguins 2-2 Flyers → **P2 - 15'** (Hockey)
- Packers 10-7 Vikings → **Q2 - 5'** (Football)

---

## 🔄 Real-Time Updates

When real games go live, the system will:

1. **Fetch live data every 45 seconds** from BetsAPI or sportapi7
2. **Extract match minute** from API response
3. **Calculate current period** based on sport and time
4. **Update database** with formatted `currentPeriod` string
5. **Display automatically** on the UI

---

## 📊 Format Reference

| Sport | Period Format | Minute Format | Example |
|-------|--------------|---------------|---------|
| ⚽ Soccer | First Half, Second Half, Extra Time, Halftime | 0-120+ | `Second Half - 67'` |
| 🏀 Basketball | Q1, Q2, Q3, Q4 | 0-12 per quarter | `Q3 - 8'` |
| 🏒 Hockey | P1, P2, P3 | 0-20 per period | `P2 - 15'` |
| 🏈 Football | Q1, Q2, Q3, Q4 | 0-15 per quarter | `Q2 - 8'` |

---

## 🎯 Summary

✅ **Soccer** - Full implementation with half/extra time
✅ **Basketball** - Quarter-based time display
✅ **Hockey** - Period-based time display
✅ **American Football** - Quarter-based time display
✅ **Mixed Sports** - All sports work together in one bundle
✅ **Real-time Updates** - Automatic refresh every 45 seconds
✅ **Visual Design** - Clean blue badge with match time
✅ **API Integration** - Both BetsAPI and sportapi7 supported

---

**View live at**: http://localhost:3001/bundles

**Restore original bundles**:
```bash
npx tsx scripts/restore-original-bundles.ts
```

**Create multi-sport test bundles again**:
```bash
npx tsx scripts/create-multi-sport-test-bundles.ts
```
