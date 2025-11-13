'use client';

import { useEffect, useState } from 'react';
import { BundleCard } from './BundleCard';
import { NoBundlesMessage } from './NoBundlesMessage';

interface Bundle {
  id: string;
  name: string;
  type: string;
  confidence: number;
  expectedReturn: number;
  performance: {
    wins: number;
    losses: number;
    pushes: number;
    actualReturn: number | null;
  } | null;
  games: Array<{
    id: string;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    scheduledAt: string;
    status: string;
    homeScore: number | null;
    awayScore: number | null;
    currentPeriod: string | null;
    result: string | null;
    analysis: {
      pick: string;
      odds: number;
      summary: string;
      recentForm: string | null;
      headToHead: string | null;
      injuries: string | null;
      advancedMetrics: string | null;
      weatherConditions: string | null;
      motivationFactors: string | null;
      setPieceAnalysis: string | null;
      styleMatchup: string | null;
      playerForm: string | null;
      marketIntelligence: string | null;
    };
  }>;
}

export function BundlesClient({ initialBundles }: { initialBundles: Bundle[] }) {
  const [bundles, setBundles] = useState<Bundle[]>(initialBundles);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Auto-refresh every 45 seconds to match live score updates
    const interval = setInterval(async () => {
      setIsRefreshing(true);
      try {
        const response = await fetch('/api/bundles');
        const data = await response.json();

        if (Array.isArray(data)) {
          setBundles(data);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Error refreshing bundles:', error);
      } finally {
        setIsRefreshing(false);
      }
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/bundles');
      const data = await response.json();

      if (Array.isArray(data)) {
        setBundles(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error refreshing bundles:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/40 backdrop-blur-sm border border-gray-700/50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="text-sm text-gray-400">
            {isRefreshing ? 'Updating...' : isMounted ? `Last update: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>

      {/* Bundles */}
      {bundles.length === 0 ? (
        <NoBundlesMessage />
      ) : (
        <div className="space-y-6">
          {bundles.map((bundle, index) => (
            <BundleCard key={bundle.id} bundle={bundle} bundleNumber={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
