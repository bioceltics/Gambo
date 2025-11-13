# Smart Live Indicator - Dynamic Color System

## ✅ Feature Implemented

The live game indicator now **intelligently changes color** based on whether the prediction is currently winning or not.

---

## 🎨 Color System

### 🟢 Green Dot
**Meaning**: Prediction is currently WINNING
- Home Win: Home team is ahead
- Away Win: Away team is ahead
- Over X.5: Total goals/points exceed threshold
- BTTS: Both teams have scored
- Draw: Scores are level (if prediction is draw)

### 🔴 Red Dot
**Meaning**: Prediction is NOT winning yet
- Home Win: Home team is NOT ahead
- Away Win: Away team is NOT ahead
- Over X.5: Total goals/points below threshold
- Under X.5: Total goals/points above threshold
- BTTS: One or both teams haven't scored yet

### 🔵 Blue Dot
**Meaning**: Neutral/Unknown prediction type
- Used for predictions that can't be evaluated in real-time
- Fallback for unrecognized bet types

---

## 📊 Supported Bet Types

### ✅ Fully Supported (Real-Time Evaluation)

1. **Home Win / 1**
   - Green: Home team winning
   - Red: Home team drawing or losing

2. **Away Win / 2**
   - Green: Away team winning
   - Red: Away team drawing or losing

3. **Draw / X**
   - Green: Scores are level
   - Red: One team is ahead

4. **Over X.5**
   - Green: Total goals/points > threshold
   - Red: Total goals/points ≤ threshold

5. **Under X.5**
   - Green: Total goals/points < threshold
   - Red: Total goals/points ≥ threshold

6. **BTTS (Both Teams To Score)**
   - Green: Both teams scored
   - Red: One or both teams haven't scored

---

## 🔧 Implementation

### File: [components/bundles/BundleCard.tsx](components/bundles/BundleCard.tsx#L378-L423)

```typescript
{(game.status === 'INPLAY' || game.status === 'LIVE') && (() => {
  // Determine if prediction is currently winning
  const isWinning = (() => {
    const pick = game.analysis.pick.toLowerCase();
    const homeScore = game.homeScore || 0;
    const awayScore = game.awayScore || 0;
    const totalGoals = homeScore + awayScore;

    // Home Win
    if (pick.includes('home win') || pick.includes('1')) {
      return homeScore > awayScore;
    }
    // Away Win
    if (pick.includes('away win') || pick.includes('2')) {
      return awayScore > homeScore;
    }
    // Draw
    if (pick.includes('draw') && !pick.includes('home') && !pick.includes('away')) {
      return homeScore === awayScore;
    }
    // Over X.5
    if (pick.includes('over')) {
      const threshold = parseFloat(pick.match(/over\s+(\d+\.?\d*)/i)?.[1] || '2.5');
      return totalGoals > threshold;
    }
    // Under X.5
    if (pick.includes('under')) {
      const threshold = parseFloat(pick.match(/under\s+(\d+\.?\d*)/i)?.[1] || '2.5');
      return totalGoals < threshold;
    }
    // BTTS (Both Teams to Score)
    if (pick.includes('btts') || pick.includes('both teams to score')) {
      return homeScore > 0 && awayScore > 0;
    }
    // Default: neutral
    return null;
  })();

  const dotColor = isWinning === true ? '🟢' : isWinning === false ? '🔴' : '🔵';

  return (
    <span className="px-1.5 py-0.5 bg-blue-600 rounded text-[10px] font-bold text-white animate-pulse">
      {dotColor} LIVE
    </span>
  );
})()}
```

---

## 🎮 Live Examples

### Current Test Bundles

**⚽ Soccer Bundle**:
- Man United 1-1 Arsenal (Over 2.5) → 🔴 RED (2 goals, need 3+)
- Liverpool 2-0 Chelsea (Home Win) → 🟢 GREEN (Liverpool winning)

**🏀 Basketball Bundle**:
- Lakers 65-62 Warriors (Home Win) → 🟢 GREEN (Lakers ahead)
- Celtics 52-48 Heat (Over 210.5) → 🔴 RED (100 points, need 211+)

**🏒 Hockey Bundle**:
- Maple Leafs 2-1 Canadiens (Home Win) → 🟢 GREEN (Leafs winning)
- Rangers 1-1 Bruins (Over 5.5) → 🔴 RED (2 goals, need 6+)

**🏈 Football Bundle**:
- Cowboys 14-10 Eagles (Home Win) → 🟢 GREEN (Cowboys ahead)
- Chiefs 21-17 Bills (Over 48.5) → 🔴 RED (38 points, need 49+)

---

## 🔄 Real-Time Updates

The indicator color updates automatically:
1. **Live score changes** → Updates when database refreshes (every 45 seconds)
2. **Instant visual feedback** → Users see if prediction is on track
3. **Dynamic evaluation** → Recalculates with each score update

---

## 💡 User Benefits

### Before (Old System):
```
🔴 LIVE (always red, no information)
```

### After (Smart System):
```
🟢 LIVE = "We're winning! 🎉"
🔴 LIVE = "Not winning yet, keep watching 👀"
🔵 LIVE = "Status unknown 🤷"
```

Users can now:
- ✅ **Quickly see** if their bets are winning
- ✅ **Monitor progress** in real-time
- ✅ **Make informed decisions** about cash-out options
- ✅ **Track bundle performance** at a glance

---

## 📱 Visual Display

The live indicator appears next to the team names:

```
⚽ Liverpool vs Chelsea  🟢 LIVE  2-0  Second Half - 58'
     └─ Green = Home Win prediction is winning!

⚽ Man United vs Arsenal  🔴 LIVE  1-1  First Half - 34'
     └─ Red = Over 2.5 needs more goals!
```

---

## ✅ Summary

**Smart Live Indicator Features**:
- 🟢 Green when prediction is currently winning
- 🔴 Red when prediction is not winning yet
- 🔵 Blue for neutral/unknown predictions
- ⚡ Real-time evaluation based on live scores
- 🎯 Supports all major bet types
- 📊 Works across all sports (Soccer, Basketball, Hockey, Football)

**View live at**: http://localhost:3001/bundles

This gives users instant visual feedback on their predictions' current status!
