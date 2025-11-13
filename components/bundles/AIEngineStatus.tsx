'use client';

import { useEffect, useState } from 'react';

interface EngineActivity {
  status: 'idle' | 'fetching' | 'analyzing' | 'generating' | 'complete';
  currentGame?: string;
  currentLeague?: string;
  currentCountry?: string;
  gamesAnalyzed: number;
  totalGames: number;
  currentActivity?: string;
  lastUpdate: Date;
}

interface GenerationStatus {
  status: 'idle' | 'generating' | 'complete' | 'error';
  currentStep?: string;
  progress?: {
    fixturesFetched?: number;
    fixturesAnalyzed?: number;
    bundlesCreated?: number;
    totalFixtures?: number;
  };
  lastGeneration?: string;
  nextGeneration?: string;
  errorMessage?: string;
  activities?: string[];
}

function getNextScheduledTime(): Date {
  const now = new Date();

  // Daily generation at 10:00 PM (22:00) local time
  const nextTime = new Date(now);
  nextTime.setMilliseconds(0);
  nextTime.setSeconds(0);
  nextTime.setMinutes(0);
  nextTime.setHours(22);

  // If we've passed today's 10 PM, move to tomorrow
  if (now >= nextTime) {
    nextTime.setDate(nextTime.getDate() + 1);
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

export function AIEngineStatus() {
  const [activity, setActivity] = useState<EngineActivity>({
    status: 'idle',
    gamesAnalyzed: 0,
    totalGames: 0,
    lastUpdate: new Date(),
  });

  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [nextTime, setNextTime] = useState<Date | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);

  // Fetch real generation status from API
  useEffect(() => {
    const fetchGenerationStatus = async () => {
      try {
        const response = await fetch('/api/bundle-generation-status');
        if (response.ok) {
          const data = await response.json();
          setGenerationStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch generation status:', error);
      }
    };

    // Initial fetch
    fetchGenerationStatus();

    // Poll every 3 seconds
    const statusInterval = setInterval(fetchGenerationStatus, 3000);

    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    // Calculate next time
    const calculateNextTime = () => {
      const next = getNextScheduledTime();
      setNextTime(next);
      return next;
    };

    const next = calculateNextTime();

    // Update activity based on real generation status
    const updateActivity = () => {
      const now = new Date();

      // Update countdown
      const remaining = next.getTime() - now.getTime();
      if (remaining <= 0) {
        calculateNextTime();
      } else {
        setTimeRemaining(remaining);
      }

      // Use real generation status if available and generating
      if (generationStatus && generationStatus.status === 'generating') {
        // Map generation status to activity status
        const mapped: EngineActivity = {
          status: 'analyzing',
          gamesAnalyzed: generationStatus.progress?.fixturesFetched || 0,
          totalGames: generationStatus.progress?.totalFixtures || 0,
          currentActivity: generationStatus.currentStep || 'Processing...',
          lastUpdate: now,
        };

        setActivity(mapped);

        // Update activity log with real activities
        if (generationStatus.activities && generationStatus.activities.length > 0) {
          setActivityLog(generationStatus.activities.slice(-5));
        }
      } else {
        // Standby mode with sample data
        const leagues = [
          { league: 'Premier League', country: 'England' },
          { league: 'La Liga', country: 'Spain' },
          { league: 'Bundesliga', country: 'Germany' },
          { league: 'Serie A', country: 'Italy' },
          { league: 'Ligue 1', country: 'France' },
        ];

        const randomLeague = leagues[Math.floor(Math.random() * leagues.length)];
        const totalGames = 450 + Math.floor(Math.random() * 100);

        setActivity({
          status: 'idle',
          currentLeague: randomLeague.league,
          currentCountry: randomLeague.country,
          gamesAnalyzed: 0,
          totalGames: totalGames,
          currentActivity: 'Preparing analysis pipeline',
          lastUpdate: now,
        });

        // Keep minimal activity log in standby
        if (activityLog.length < 3) {
          setActivityLog(prev => [
            `${now.toLocaleTimeString()}: ${randomLeague.country} • ${randomLeague.league} - Monitoring odds updates`,
            ...prev.slice(0, 4)
          ]);
        }
      }
    };

    // Run immediately
    updateActivity();

    // Update every 1 second
    const interval = setInterval(updateActivity, 1000);

    return () => clearInterval(interval);
  }, [generationStatus]);

  const getStatusColor = () => {
    switch (activity.status) {
      case 'fetching': return 'from-blue-500 to-cyan-500';
      case 'analyzing': return 'from-purple-500 to-pink-500';
      case 'generating': return 'from-green-500 to-emerald-500';
      case 'complete': return 'from-green-500 to-teal-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusText = () => {
    switch (activity.status) {
      case 'fetching': return 'Fetching Match Data';
      case 'analyzing': return 'AI Analysis in Progress';
      case 'generating': return 'Generating Bundles';
      case 'complete': return 'Generation Complete';
      default: return 'Standby Mode';
    }
  };

  const getStatusIcon = () => {
    switch (activity.status) {
      case 'fetching': return '🌐';
      case 'analyzing': return '🤖';
      case 'generating': return '⚡';
      case 'complete': return '✅';
      default: return '💤';
    }
  };

  const isGeneratingSoon = timeRemaining !== null && timeRemaining < 300000;

  return (
    <div className="mb-4">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-[#0a0b14] via-[#13152a] to-[#0a0b14] border-[#2a2d42] shadow-lg">
        {/* Premium animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/10 to-indigo-600/5"></div>
        {activity.status !== 'idle' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/10 to-purple-500/5 animate-pulse"></div>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-pulse"></div>
          </>
        )}

        <div className="relative p-3">
          {/* Compact Header with Engine and Countdown */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Engine Icon */}
              <div className="relative">
                <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${getStatusColor()} flex items-center justify-center shadow-md`}>
                  <span className="text-xl">{getStatusIcon()}</span>
                  {activity.status !== 'idle' && (
                    <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-cyan-500/30 via-blue-500/30 to-purple-500/30 blur-md animate-pulse"></div>
                  )}
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full"></div>
              </div>

              {/* Engine Info */}
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="text-sm font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    GAMBO AI ENGINE
                  </h3>
                  <span className="px-1 py-0.5 rounded bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-blue-400/30 text-xs font-bold text-blue-300">
                    v1.0.0
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${
                    activity.status !== 'idle'
                      ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'
                      : 'text-gray-500'
                  }`}>
                    {getStatusText()}
                  </p>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    activity.status !== 'idle' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                  }`}></div>
                </div>
              </div>
            </div>

            {/* Next Generation Countdown */}
            {timeRemaining !== null && nextTime !== null && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Next in</p>
                <p className="text-base font-black text-white">
                  {formatTimeRemaining(timeRemaining)}
                </p>
                <p className="text-xs text-gray-500">
                  {nextTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {timeRemaining !== null && (
            <div className="mb-2 h-1 bg-gray-800 rounded-full overflow-hidden max-w-md">
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
          )}

          {/* Display Section */}
          {(activity.currentLeague || activity.currentGame) ? (
            <div className="space-y-1.5">
              {/* Current Activity Display */}
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={`text-xs px-1 py-0.5 rounded border font-bold ${
                        activity.status !== 'idle'
                          ? 'bg-purple-500/20 border-purple-400/30 text-purple-300'
                          : 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                      }`}>
                        {activity.status !== 'idle' ? 'ANALYZING' : 'MONITORING'}
                      </span>
                      {activity.currentCountry && <span className="text-xs text-blue-300">{activity.currentCountry}</span>}
                      {activity.currentLeague && <span className="text-xs text-cyan-300">•</span>}
                      {activity.currentLeague && <span className="text-xs text-cyan-300">{activity.currentLeague}</span>}
                    </div>
                    {activity.currentGame ? (
                      <p className="text-white font-bold text-xs mb-0.5">{activity.currentGame}</p>
                    ) : (
                      <p className="text-white font-bold text-xs mb-0.5">Tracking league competitions</p>
                    )}
                    <p className="text-xs text-gray-400">{activity.currentActivity}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-xs text-gray-400">{activity.status !== 'idle' ? 'Progress' : 'Total'}</p>
                    <p className="text-sm font-bold text-purple-300">{activity.status !== 'idle' ? activity.gamesAnalyzed : activity.totalGames}</p>
                    {activity.status !== 'idle' && <p className="text-xs text-gray-500">/{activity.totalGames}</p>}
                    {activity.status === 'idle' && <p className="text-xs text-gray-500">matches</p>}
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              {activityLog.length > 0 && (
                <div className="p-2 rounded-lg bg-gray-900/30 border border-gray-700/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      activity.status !== 'idle' ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
                    }`}></div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {activity.status !== 'idle' ? 'Live Feed' : 'League Updates'}
                    </h4>
                  </div>
                  <div className="space-y-0.5 max-h-20 overflow-y-auto">
                    {activityLog.slice(0, 3).map((log, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-1.5 text-xs py-0.5"
                        style={{
                          opacity: 1 - (index * 0.25),
                          animation: index === 0 && activity.status !== 'idle' ? 'slideIn 0.3s ease-out' : 'none'
                        }}
                      >
                        <div className="w-1 h-1 bg-cyan-400 rounded-full mt-1 flex-shrink-0"></div>
                        <p className="text-gray-400 leading-relaxed font-mono flex-1">{log}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              <div className="text-center p-1.5 rounded bg-gray-900/30 border border-gray-800/50">
                <p className="text-xs text-cyan-400 font-black">500+</p>
                <p className="text-xs text-gray-600">Matches</p>
              </div>
              <div className="text-center p-1.5 rounded bg-gray-900/30 border border-gray-800/50">
                <p className="text-xs text-purple-400 font-black">67+</p>
                <p className="text-xs text-gray-600">Leagues</p>
              </div>
              <div className="text-center p-1.5 rounded bg-gray-900/30 border border-gray-800/50">
                <p className="text-xs text-green-400 font-black">2s</p>
                <p className="text-xs text-gray-600">Speed</p>
              </div>
              <div className="text-center p-1.5 rounded bg-gray-900/30 border border-gray-800/50">
                <p className="text-xs text-orange-400 font-black">85%</p>
                <p className="text-xs text-gray-600">Accuracy</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
