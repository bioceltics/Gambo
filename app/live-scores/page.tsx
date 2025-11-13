'use client';

import { useEffect, useState } from 'react';
import { LiveScoreCard } from '@/components/live-scores/LiveScoreCard';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Game {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  currentPeriod?: string;
  league: string;
  scheduledAt: string;
  liveStats?: {
    possession?: { home: number; away: number };
    shots?: { home: number; away: number };
    xG?: { home: number; away: number };
  };
  inBundle?: boolean;
}

type SportFilter = 'ALL' | 'SOCCER' | 'BASKETBALL' | 'FOOTBALL' | 'TENNIS' | 'HOCKEY';

export default function LiveScoresPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState<SportFilter>('ALL');
  const [favoriteGames, setFavoriteGames] = useState<string[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [previousGameStates, setPreviousGameStates] = useState<Map<string, Game>>(new Map());

  const sendNotification = (title: string, body: string, icon?: string) => {
    if (notificationPermission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  };

  const checkForGameUpdates = (newGames: Game[]) => {
    const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');

    newGames.forEach((game) => {
      if (favorites.includes(game.id)) {
        const previousGame = previousGameStates.get(game.id);

        if (previousGame) {
          // Check for score changes
          if (game.homeScore !== previousGame.homeScore || game.awayScore !== previousGame.awayScore) {
            sendNotification(
              `⚽ Score Update: ${game.homeTeam} vs ${game.awayTeam}`,
              `${game.homeScore} - ${game.awayScore}`
            );
          }

          // Check if game just went live
          if (game.status === 'LIVE' && previousGame.status !== 'LIVE') {
            sendNotification(
              `🔴 LIVE: ${game.homeTeam} vs ${game.awayTeam}`,
              `Match is now live!`
            );
          }

          // Check if game finished
          if (game.status === 'FINISHED' && previousGame.status !== 'FINISHED') {
            sendNotification(
              `🏁 Full Time: ${game.homeTeam} vs ${game.awayTeam}`,
              `Final Score: ${game.homeScore} - ${game.awayScore}`
            );
          }
        }
      }
    });

    // Update previous game states
    const newStateMap = new Map<string, Game>();
    newGames.forEach((game) => {
      newStateMap.set(game.id, game);
    });
    setPreviousGameStates(newStateMap);
  };

  const fetchLiveScores = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/live-scores');
      const data = await response.json();

      if (data.success) {
        checkForGameUpdates(data.games);
        setGames(data.games);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching live scores:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveScores();

    // Load favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
    setFavoriteGames(favorites);

    // Request notification permission if there are favorites
    if ('Notification' in window && favorites.length > 0) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }

    // Auto-refresh every 30 seconds for live games
    const interval = setInterval(() => {
      fetchLiveScores();
    }, 30000);

    // Listen for storage changes (when favorites are updated)
    const handleStorageChange = () => {
      const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
      setFavoriteGames(favorites);
    };

    // Listen for custom favorites changed event
    const handleFavoritesChanged = () => {
      const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
      setFavoriteGames(favorites);

      // Request notification permission when first favorite is added
      if ('Notification' in window && Notification.permission === 'default') {
        const updatedFavorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
        if (updatedFavorites.length > 0) {
          Notification.requestPermission().then((permission) => {
            setNotificationPermission(permission);
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoritesChanged', handleFavoritesChanged);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesChanged', handleFavoritesChanged);
    };
  }, []);

  const sportFilters: { value: SportFilter; label: string; emoji: string }[] = [
    { value: 'ALL', label: 'All Sports', emoji: '🎯' },
    { value: 'SOCCER', label: 'Soccer', emoji: '⚽' },
    { value: 'BASKETBALL', label: 'Basketball', emoji: '🏀' },
    { value: 'FOOTBALL', label: 'Football', emoji: '🏈' },
    { value: 'TENNIS', label: 'Tennis', emoji: '🎾' },
    { value: 'HOCKEY', label: 'Hockey', emoji: '🏒' },
  ];

  const filteredGames = selectedSport === 'ALL'
    ? games
    : games.filter((g) => g.sport === selectedSport);

  // Sort function to put favorited games at the top
  const sortByFavorites = (gamesList: Game[]) => {
    return [...gamesList].sort((a, b) => {
      const aIsFavorite = favoriteGames.includes(a.id);
      const bIsFavorite = favoriteGames.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });
  };

  const liveGames = sortByFavorites(filteredGames.filter((g) => g.status === 'LIVE'));
  const upcomingGames = sortByFavorites(filteredGames.filter((g) => g.status === 'UPCOMING'));
  const finishedGames = sortByFavorites(filteredGames.filter((g) => g.status === 'FINISHED'));

  const formatLastUpdated = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading live scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Premium Header */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Real-Time Updates
            </span>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-100">
                Live <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Scores</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-3xl">
                Real-time scores, advanced stats, and live analytics for all major sports
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Updated {formatLastUpdated()}
              </div>
              <Button
                onClick={fetchLiveScores}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Bundle Info Banner */}
        {games.some(g => g.inBundle) && (
          <div className="mb-8 bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <p className="text-sm text-gray-300">
                <span className="font-bold text-amber-400">Bundle Matches</span> are highlighted below -
                these games are included in our premium betting bundles
              </p>
            </div>
          </div>
        )}

        {/* Sport Filter Submenu */}
        <div className="mb-8 bg-[#1a1c2e]/80 backdrop-blur-sm border border-[#2a2d42] rounded-xl p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {sportFilters.map((filter) => {
              const count = filter.value === 'ALL'
                ? games.length
                : games.filter((g) => g.sport === filter.value).length;
              const isActive = selectedSport === filter.value;

              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedSport(filter.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-[#0c0d15] text-gray-400 hover:text-gray-200 hover:bg-[#1a1c2e] border border-[#2a2d42]'
                  }`}
                >
                  <span className="text-sm">{filter.emoji}</span>
                  <span className="text-xs font-semibold">{filter.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {liveGames.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-red-600/10 to-orange-600/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
                <h2 className="text-2xl font-bold text-red-400">Live Now</h2>
              </div>
              <span className="text-sm text-gray-400 font-semibold">
                {liveGames.length} {liveGames.length === 1 ? 'match' : 'matches'}
              </span>
            </div>
            <div className="space-y-2">
              {liveGames.map((game) => (
                <LiveScoreCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {upcomingGames.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-4">
              <h2 className="text-2xl font-bold text-gray-100">Upcoming Matches</h2>
              <span className="text-sm text-gray-400 font-semibold">
                {upcomingGames.length} scheduled
              </span>
            </div>
            <div className="space-y-2">
              {upcomingGames.map((game) => (
                <LiveScoreCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {finishedGames.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-gray-600/10 to-slate-600/10 border border-gray-500/30 rounded-xl p-4">
              <h2 className="text-2xl font-bold text-gray-100">Recent Results</h2>
              <span className="text-sm text-gray-400 font-semibold">
                Last {finishedGames.slice(0, 9).length} matches
              </span>
            </div>
            <div className="space-y-2">
              {finishedGames.slice(0, 9).map((game) => (
                <LiveScoreCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {games.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto bg-[#1a1c2e] border border-[#2a2d42] rounded-xl p-12">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚽</span>
              </div>
              <p className="text-xl text-gray-300 mb-2 font-semibold">
                No Games Available
              </p>
              <p className="text-gray-400">
                Check back later for live scores and updates
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
