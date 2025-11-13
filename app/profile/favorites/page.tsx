'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Star,
  ArrowLeft,
  Trash2,
  Bell,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface FavoriteGame {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  scheduledAt?: string;
  status: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage
    const favoriteIds = JSON.parse(localStorage.getItem('favoriteGames') || '[]');

    // For demo purposes, create mock favorite games
    const mockFavorites: FavoriteGame[] = favoriteIds.slice(0, 5).map((id: string, index: number) => ({
      id,
      sport: ['SOCCER', 'BASKETBALL', 'HOCKEY'][index % 3],
      homeTeam: ['Man City', 'Lakers', 'Bruins', 'Arsenal', 'Warriors'][index],
      awayTeam: ['Arsenal', 'Celtics', 'Rangers', 'Chelsea', 'Nuggets'][index],
      league: ['Premier League', 'NBA', 'NHL', 'Premier League', 'NBA'][index],
      status: ['LIVE', 'UPCOMING', 'FINISHED'][index % 3],
    }));

    setFavorites(mockFavorites);
    setIsLoading(false);
  }, []);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const removeFavorite = (gameId: string) => {
    const favoriteIds = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
    const updated = favoriteIds.filter((id: string) => id !== gameId);
    localStorage.setItem('favoriteGames', JSON.stringify(updated));
    setFavorites(prev => prev.filter(f => f.id !== gameId));
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  };

  const getSportIcon = (sport: string) => {
    const icons: Record<string, string> = {
      SOCCER: '⚽',
      BASKETBALL: '🏀',
      FOOTBALL: '🏈',
      TENNIS: '🎾',
      HOCKEY: '🏒',
    };
    return icons[sport] || '⚽';
  };

  const getStatusColor = (status: string) => {
    if (status === 'LIVE') return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (status === 'FINISHED') return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-500/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
              Favorite Games
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-100">
            Your <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Favorites</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            Manage games you're following and receive personalized notifications
          </p>
        </div>

        {favorites.length === 0 ? (
          <Card className="border-[#2a2d42] bg-[#1a1c2e]/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">No Favorite Games Yet</h3>
              <p className="text-gray-400 mb-6">
                Start adding games to your favorites to get personalized notifications
              </p>
              <Link href="/live-scores">
                <Button className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white">
                  Browse Live Scores
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="border-blue-500/30 bg-[#1a1c2e]/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-100 mb-1">
                      Notification Settings
                    </p>
                    <p className="text-xs text-gray-400">
                      You'll receive alerts for score changes, match starts, and final results for all favorited games.
                      <Link href="/profile/notifications" className="text-blue-400 hover:text-blue-300 ml-1">
                        Manage notifications →
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Favorites List */}
            <div className="grid gap-4">
              {favorites.map((game) => (
                <Card
                  key={game.id}
                  className="border-[#2a2d42] bg-[#1a1c2e]/80 backdrop-blur-sm hover:border-yellow-500/50 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Sport Icon */}
                      <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{getSportIcon(game.sport)}</span>
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-100 truncate">
                            {game.homeTeam} vs {game.awayTeam}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(game.status)}`}>
                            {game.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{game.league}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href="/live-scores">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-400 border-[#2a2d42] hover:text-gray-200 hover:border-blue-500/50"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFavorite(game.id)}
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Link href="/live-scores" className="flex-1">
                <Button variant="outline" className="w-full border-[#2a2d42] hover:border-blue-500/50">
                  <Star className="w-4 h-4 mr-2" />
                  Add More Favorites
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  favorites.forEach(game => removeFavorite(game.id));
                }}
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
