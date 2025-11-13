# Bundle ETA (Estimated Time of Arrival) Feature

## Overview

The Bundle ETA feature displays a live countdown timer on the bundles page showing when the next automated bundle generation will occur.

## Features

✅ **Live Countdown Timer**: Updates every second showing time remaining until next generation
✅ **Progress Bar**: Visual indicator of time elapsed in current 6-hour cycle
✅ **Local Timezone Display**: Shows scheduled time in user's local timezone
✅ **UTC Schedule Info**: Displays the global UTC schedule (00:00, 06:00, 12:00, 18:00)
✅ **Status Indicator**: Changes color when generation is imminent (< 5 minutes)
✅ **Auto-refresh**: Automatically recalculates when scheduled time passes

## How It Works

The system automatically generates bundles every **6 hours** at:
- **00:00 UTC** (Midnight UTC)
- **06:00 UTC** (6 AM UTC)
- **12:00 UTC** (Noon UTC)
- **18:00 UTC** (6 PM UTC)

The ETA component:
1. Calculates the next scheduled time based on current UTC time
2. Updates countdown every second
3. Shows progress bar indicating % of current cycle completed
4. Changes to green/animated state when < 5 minutes remain
5. Automatically recalculates when scheduled time passes

## Component Location

- **Component**: [components/bundles/NextBundleETA.tsx](components/bundles/NextBundleETA.tsx)
- **Used In**: [app/bundles/page.tsx](app/bundles/page.tsx)

## Visual Design

### Normal State (> 5 minutes remaining)
- Blue/purple gradient background
- Clock emoji (⏰)
- Blue progress bar
- Shows countdown timer (e.g., "3h 45m 12s")
- Displays next scheduled time in user's timezone

### Imminent State (< 5 minutes remaining)
- Green/emerald gradient background
- Rocket emoji (🚀)
- Green progress bar
- "Generating Soon" header
- Pulsing animation

## Example Display

```
⏰ NEXT BUNDLE GENERATION
   3h 45m 12s

   Scheduled at
   6:00 PM PST
   Nov 9, 2025

   [=====================================>         ] 75%

   • Auto-updates every 6 hours
   • UTC Schedule: 00:00, 06:00, 12:00, 18:00
```

## Technical Details

### Time Calculation
The component calculates the next scheduled time by:
1. Getting current UTC hour
2. Finding next scheduled hour (0, 6, 12, or 18)
3. If no later hour today, schedules for 00:00 tomorrow
4. Sets exact time to :00:00.000

### Countdown Update
- Updates every 1000ms (1 second)
- Recalculates if scheduled time has passed
- Displays hours, minutes, and seconds remaining

### Progress Bar
- Shows % of 6-hour cycle completed
- Calculated as: `(6 hours - time remaining) / 6 hours * 100`
- Smooth transitions with CSS

## Customization

To modify the schedule interval, edit `NextBundleETA.tsx`:

```typescript
// Change schedule times (currently 00:00, 06:00, 12:00, 18:00 UTC)
const scheduleTimes = [0, 6, 12, 18];

// Change "generating soon" threshold (currently 5 minutes)
const isGeneratingSoon = timeRemaining < 300000; // 300000ms = 5 minutes
```

## Integration with Scheduler

The ETA component is synchronized with the actual bundle generation scheduler:

- **Scheduler**: Runs every 6 hours at scheduled UTC times
- **ETA Display**: Calculates same schedule times
- **Both use**: UTC timezone for consistency worldwide

This ensures the countdown accurately reflects when bundles will be generated.

## User Experience Benefits

1. **Transparency**: Users know exactly when new bundles arrive
2. **Anticipation**: Countdown creates engagement
3. **No Confusion**: Clear display of timezone and schedule
4. **Visual Feedback**: Progress bar shows time passage
5. **Global Consistency**: UTC schedule works worldwide

## Future Enhancements

Potential improvements:
- [ ] Show last generation time
- [ ] Display number of bundles currently active
- [ ] Add notification when new bundles arrive
- [ ] Show generation status (in progress, completed, failed)
- [ ] Display historical generation success rate

---

**Note**: The ETA component is client-side only and does not affect server-side bundle generation. It's purely informational for user experience.
