'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Game {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  scheduledAt: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  pick: string;
  odds: number;
  result: string | null;
  summary: string;
}

interface Bundle {
  id: string;
  name: string;
  type: string;
  confidence: number;
  expectedReturn: number;
  tierAccess: string;
  archivedAt: string;
  createdAt: string;
  games: Game[];
  performance: {
    wins: number;
    losses: number;
    pushes: number;
    actualReturn: number;
  } | null;
}

interface BundlesByDate {
  [date: string]: Bundle[];
}

export default function BundleHistoryPage() {
  const [bundlesByDate, setBundlesByDate] = useState<BundlesByDate>({});
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundleHistory();
  }, []);

  const fetchBundleHistory = async () => {
    try {
      const response = await fetch('/api/bundles/history');
      const data = await response.json();

      if (data.success) {
        setBundlesByDate(data.bundlesByDate);
      }
    } catch (error) {
      console.error('Error fetching bundle history:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBundle = (bundleId: string) => {
    setExpandedBundles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bundleId)) {
        newSet.delete(bundleId);
      } else {
        newSet.add(bundleId);
      }
      return newSet;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getResultBadge = (result: string | null) => {
    if (!result) return <span className="text-gray-400 text-xs">Pending</span>;

    const colors = {
      WIN: 'bg-green-500/20 text-green-400 border-green-500/40',
      LOSS: 'bg-red-500/20 text-red-400 border-red-500/40',
      PUSH: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
    };

    return (
      <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${colors[result as keyof typeof colors]}`}>
        {result}
      </span>
    );
  };

  const getBundleStatus = (bundle: Bundle) => {
    const hasLoss = bundle.games.some(g => g.result === 'LOSS');
    const allFinished = bundle.games.every(g => g.status === 'FINISHED');
    const allWon = bundle.games.every(g => g.result === 'WIN');

    if (hasLoss) {
      return { color: 'bg-red-500/20 text-red-400 border-red-500/40', text: 'LOST' };
    }
    if (allFinished && allWon) {
      return { color: 'bg-green-500/20 text-green-400 border-green-500/40', text: 'WON' };
    }
    if (!allFinished) {
      return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', text: 'IN PROGRESS' };
    }
    return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/40', text: 'MIXED' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading bundle history...</p>
        </div>
      </div>
    );
  }

  const dates = Object.keys(bundlesByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/bundles"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          >
            ← Back to Active Bundles
          </Link>

          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Bundle History
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-sm font-medium">
              {dates.reduce((sum, date) => sum + bundlesByDate[date].length, 0)} Total Bundles
            </span>
          </div>
          <p className="text-gray-400 mt-2">
            View past bundle performance and outcomes
          </p>
        </div>

        {/* Bundles by Date */}
        {dates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No archived bundles yet</p>
            <Link
              href="/bundles"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              View Active Bundles
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {dates.map(date => (
              <div key={date} className="space-y-4">
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm py-3 border-b border-gray-800">
                  <h2 className="text-xl font-semibold text-white">
                    {formatDate(date)}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {bundlesByDate[date].length} bundle{bundlesByDate[date].length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Bundles for this date */}
                <div className="grid gap-4">
                  {bundlesByDate[date].map(bundle => {
                    const isExpanded = expandedBundles.has(bundle.id);
                    const status = getBundleStatus(bundle);

                    return (
                      <div
                        key={bundle.id}
                        className="bg-slate-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg overflow-hidden hover:border-gray-600/50 transition-colors"
                      >
                        {/* Bundle Header - Clickable */}
                        <button
                          onClick={() => toggleBundle(bundle.id)}
                          className="w-full p-6 text-left hover:bg-slate-800/60 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-white">
                                  {bundle.name}
                                </h3>
                                <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${status.color}`}>
                                  {status.text}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>{bundle.games.length} games</span>
                                <span>•</span>
                                <span>{bundle.confidence}% confidence</span>
                                <span>•</span>
                                <span>{bundle.expectedReturn.toFixed(2)}x expected</span>
                                {bundle.performance && (
                                  <>
                                    <span>•</span>
                                    <span className="text-blue-400 font-medium">
                                      {bundle.performance.actualReturn.toFixed(2)}x actual
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm">
                                {isExpanded ? 'Hide' : 'Show'} Details
                              </span>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-700/50 p-6 bg-slate-900/40">
                            <div className="space-y-3">
                              {bundle.games.map((game, idx) => (
                                <div
                                  key={game.id}
                                  className="p-4 bg-slate-800/60 rounded-lg border border-gray-700/30"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-gray-500">
                                          {game.sport}
                                        </span>
                                        <span className="text-xs text-gray-600">•</span>
                                        <span className="text-xs text-gray-500">
                                          {game.league}
                                        </span>
                                      </div>
                                      <div className="text-white font-medium">
                                        {game.homeTeam} vs {game.awayTeam}
                                      </div>
                                      {game.status === 'FINISHED' && (
                                        <div className="text-sm text-gray-400 mt-1">
                                          Final Score: {game.homeScore}-{game.awayScore}
                                        </div>
                                      )}
                                    </div>

                                    <div className="text-right">
                                      {getResultBadge(game.result)}
                                      <div className="text-xs text-gray-500 mt-1">
                                        {game.odds.toFixed(2)} odds
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-2 text-sm">
                                    <span className="text-blue-400 font-medium">Pick:</span>
                                    <span className="text-gray-300 ml-2">{game.pick}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
