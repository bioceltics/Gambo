# Live Status Color System

## ✅ Dynamic Game Status Colors Implemented

### Color Coding System

The bundle and match cards now display dynamic colors based on game status:

#### 1. **🔵 Blue - Live/In Progress**
- **When**: Game status is `INPLAY` or `LIVE`
- **Match Card**: Blue border with pulsing blue overlay
- **Bundle Badge**: "🔴 LIVE" badge at top-left
- **Visual Effect**: Animated pulse to draw attention

#### 2. **🟢 Green - Won**
- **When**: Game result is `WIN`
- **Match Card**: Green border and background
- **Badge**: "✓ WIN" label
- **Bundle**: Shows "✓ WON" when all games won

#### 3. **🔴 Red - Lost**
- **When**: Game result is `LOSS`
- **Match Card**: Red border and background
- **Badge**: "✗ LOSS" label
- **Bundle**: Shows "✗ LOST" when any game lost

#### 4. **🟡 Yellow - Push**
- **When**: Game result is `PUSH` (tie/void)
- **Match Card**: Yellow border and background
- **Badge**: "- PUSH" label

#### 5. **⚪ Default - Scheduled**
- **When**: Game hasn't started yet
- **Match Card**: Gray border, dark background
- **No special indicators**

## Implementation Details

### File Modified: `components/bundles/BundleCard.tsx`

#### New Function: `getGameStatusOverlay()`
```typescript
const getGameStatusOverlay = (game: GameInfo) => {
  // If game has result, use result colors
  if (game.result) {
    const resultColors = getResultColor(game.result);
    if (resultColors) {
      return {
        border: resultColors.border,
        bg: resultColors.bg,
        overlay: null
      };
    }
  }

  // If game is live (in progress)
  if (game.status === 'INPLAY' || game.status === 'LIVE') {
    return {
      border: 'border-blue-500/60',
      bg: 'bg-blue-600/10',
      overlay: 'absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none'
    };
  }

  // Default for scheduled games
  return {
    border: 'border-[#2a2d42]',
    bg: 'bg-[#1a1c2e]/50',
    overlay: null
  };
};
```

## Visual Examples

### Live Game Card:
```
┌──────────────────────────────────────────────┐
│ [Blue pulsing border and overlay]           │
│                                              │
│ ⚽ #1  Man City vs Liverpool  🔴 LIVE       │
│      Premier League            2-1          │
│      Mar 12, 3:30 PM                        │
│                                              │
│                        Home Win @ 1.80      │
└──────────────────────────────────────────────┘
```

### Won Game Card:
```
┌──────────────────────────────────────────────┐
│ [Green border and background]               │
│                                              │
│ ⚽ #2  Barcelona vs Real Madrid    ✓ WIN    │
│      La Liga                     3-1        │
│      Final                                  │
│                                              │
│                        Over 2.5 @ 1.95      │
└──────────────────────────────────────────────┘
```

### Lost Game Card:
```
┌──────────────────────────────────────────────┐
│ [Red border and background]                 │
│                                              │
│ ⚽ #3  Bayern vs Dortmund          ✗ LOSS   │
│      Bundesliga                  1-2        │
│      Final                                  │
│                                              │
│                        Home Win @ 1.65      │
└──────────────────────────────────────────────┘
```

## Bundle-Level Status

### Active Bundle with Live Games:
```
╔════════════════════════════════════════════╗
║  🔴 LIVE                    ✨ PREMIUM     ║
║                                            ║
║  🏆  +5 Odds Mixed Sports Bundle          ║
║                                            ║
║  🎯 80% Confidence  📈 5.2x  🎮 5 Games   ║
╚════════════════════════════════════════════╝
```

### Completed Bundle (Won):
```
╔════════════════════════════════════════════╗
║  ✓ WON (5.2x)              ✨ PREMIUM     ║
║                                            ║
║  🏆  +5 Odds Mixed Sports Bundle          ║
║                                            ║
║  🎯 80% Confidence  📈 5.2x  🎮 5 Games   ║
╚════════════════════════════════════════════╝
```

### Completed Bundle (Lost):
```
╔════════════════════════════════════════════╗
║  ✗ LOST                    ✨ PREMIUM     ║
║                                            ║
║  🏆  +5 Odds Mixed Sports Bundle          ║
║                                            ║
║  🎯 80% Confidence  📈 5.2x  🎮 5 Games   ║
╚════════════════════════════════════════════╝
```

## Features

### 1. Real-Time Visual Feedback
- Games automatically update colors as status changes
- No page refresh needed (when integrated with live scores)
- Clear visual distinction between states

### 2. Attention-Grabbing Effects
- **Live games**: Pulsing blue animation
- **Bundle LIVE badge**: Pulsing effect at top-left
- Draws user attention to active games

### 3. Instant Recognition
- **Blue** = Watch this now (live)
- **Green** = Success
- **Red** = Failed
- **Yellow** = Push/Void
- **Gray** = Not started

### 4. Accessibility
- High contrast colors
- Text labels accompany colors
- Icons provide additional context

## Game Status Flow

```
Scheduled (Gray)
    ↓
🔵 Live/In Progress (Blue + Pulsing)
    ↓
┌────┬────┬────┐
│    │    │    │
🟢   🔴   🟡
Win  Loss Push
```

## Bundle Status Flow

```
Scheduled Bundle
    ↓
Has Live Games → 🔴 LIVE Badge (Blue, Pulsing)
    ↓
All Games Finished
    ↓
┌─────────────────┐
│  All Wins?      │
│  ├─ Yes → ✓ WON (Green)
│  └─ No  → ✗ LOST (Red)
└─────────────────┘
```

## Integration with Live Scores

This color system works seamlessly with the live scores API:

1. **API Returns**: Game status (`SCHEDULED`, `INPLAY`, `FINISHED`)
2. **Component Updates**: Colors change automatically
3. **User Sees**: Real-time visual feedback

### Example Live Score Integration:
```typescript
// When live score updates come in:
{
  status: 'INPLAY',  // → Triggers blue color + pulse
  homeScore: 2,
  awayScore: 1
}

// When game finishes:
{
  status: 'FINISHED',  // → Evaluates result
  result: 'WIN'        // → Triggers green color
}
```

## Benefits

✅ **Instant Visual Feedback** - Users immediately see game status
✅ **No Confusion** - Clear color coding system
✅ **Engaging UX** - Pulsing animations for live games
✅ **Professional Look** - Clean, modern design
✅ **Scalable** - Works for any number of games/bundles
✅ **Accessible** - Color + text + icons for clarity

## Testing

To see the color system in action:

1. **View scheduled games**: Gray borders, no special effects
2. **Simulate live game**: Set status to `INPLAY` → See blue pulse
3. **Mark game won**: Set result to `WIN` → See green
4. **Mark game lost**: Set result to `LOSS` → See red

The system is fully functional and ready for production! 🎨
