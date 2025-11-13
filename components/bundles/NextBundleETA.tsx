'use client';

import { useEffect, useState } from 'react';

/**
 * Calculate next scheduled bundle generation time (daily at 00:00 UTC)
 */
function getNextScheduledTime(): Date {
  const now = new Date();

  // Daily generation at 00:00 UTC
  const nextTime = new Date(now);
  nextTime.setUTCMilliseconds(0);
  nextTime.setUTCSeconds(0);
  nextTime.setUTCMinutes(0);
  nextTime.setUTCHours(0);

  // If we've passed today's generation time, move to tomorrow
  if (now.getUTCHours() >= 0 && now >= nextTime) {
    nextTime.setUTCDate(nextTime.getUTCDate() + 1);
  }

  return nextTime;
}

function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function NextBundleETA() {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [nextTime, setNextTime] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate initial next time
    const calculateNextTime = () => {
      const next = getNextScheduledTime();
      setNextTime(next);
      return next;
    };

    const next = calculateNextTime();

    // Update countdown every second
    const interval = setInterval(() => {
      const now = new Date();
      const remaining = next.getTime() - now.getTime();

      if (remaining <= 0) {
        // Recalculate next time if we've passed the scheduled time
        calculateNextTime();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeRemaining === null || nextTime === null) {
    return null;
  }

  const isGeneratingSoon = timeRemaining < 300000; // Less than 5 minutes

  return (
    <div className="mb-6">
      <div className={`relative overflow-hidden rounded-lg border ${
        isGeneratingSoon
          ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/40'
          : 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30'
      } p-4`}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5 animate-pulse"></div>

        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isGeneratingSoon
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-blue-600 to-purple-600'
              }`}>
                <span className="text-2xl">
                  {isGeneratingSoon ? '🚀' : '⏰'}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  {isGeneratingSoon ? 'Generating Soon' : 'Next Bundle Generation'}
                </h3>
                <p className="text-2xl font-black text-white mt-1">
                  {formatTimeRemaining(timeRemaining)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">Scheduled at</p>
              <p className="text-lg font-semibold text-white">
                {nextTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {nextTime.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isGeneratingSoon
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
              style={{
                width: `${Math.max(0, 100 - (timeRemaining / (24 * 60 * 60 * 1000)) * 100)}%`
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Daily auto-updates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>UTC Schedule: 00:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
