'use client';

import { useEffect, useState } from 'react';

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

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return 'less than 1m';
  }
}

export function NoBundlesMessage() {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [nextTime, setNextTime] = useState<Date | null>(null);

  useEffect(() => {
    const calculateNextTime = () => {
      const next = getNextScheduledTime();
      setNextTime(next);
      return next;
    };

    const next = calculateNextTime();

    const updateCountdown = () => {
      const now = new Date();
      const remaining = next.getTime() - now.getTime();

      if (remaining <= 0) {
        calculateNextTime();
      } else {
        setTimeRemaining(remaining);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-8">
      <div className="max-w-lg mx-auto bg-[#1a1c2e] border border-[#2a2d42] rounded-lg p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
          <div className="text-left">
            <p className="text-lg text-gray-300 font-semibold">
              No Active Bundles
            </p>
            {timeRemaining !== null && nextTime !== null ? (
              <p className="text-sm text-gray-400">
                Generation starts in {formatTimeRemaining(timeRemaining)} at{' '}
                {nextTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                {' '}(~30min process)
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Check back soon for new expert picks!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
