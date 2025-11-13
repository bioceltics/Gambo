'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, Activity, Star } from 'lucide-react';

interface LiveScoreCardProps {
  game: {
    id: string;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    status: string;
    currentPeriod?: string;
    matchMinute?: number | null;
    league: string;
    scheduledAt?: string;
    liveStats?: {
      possession?: { home: number; away: number };
      shots?: { home: number; away: number };
      corners?: { home: number; away: number };
      fouls?: { home: number; away: number };
      yellowCards?: { home: number; away: number };
      redCards?: { home: number; away: number };
      xG?: { home: number; away: number };
    };
    events?: {
      goals: Array<{
        player: string;
        assist: string | null;
        team: string;
        time: number;
        extraTime: number | null;
      }>;
      cards: Array<{
        player: string;
        team: string;
        card: string;
        time: number;
        extraTime: number | null;
      }>;
      substitutions: Array<{
        playerIn: string;
        playerOut: string;
        team: string;
        time: number;
        extraTime: number | null;
      }>;
    };
    inBundle?: boolean;
  };
}

export function LiveScoreCard({ game }: LiveScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewEvent, setHasNewEvent] = useState(game.status === 'LIVE' && Math.random() > 0.7);
  const [isFavorite, setIsFavorite] = useState(false);

  const isLive = game.status === 'LIVE';
  const isUpcoming = game.status === 'UPCOMING';
  const isFinished = game.status === 'FINISHED';

  // Load favorite status from localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
    setIsFavorite(favorites.includes(game.id));
  }, [game.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('favoriteGames') || '[]');
    if (isFavorite) {
      const updated = favorites.filter((id: string) => id !== game.id);
      localStorage.setItem('favoriteGames', JSON.stringify(updated));
    } else {
      favorites.push(game.id);
      localStorage.setItem('favoriteGames', JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);

    // Dispatch custom event to notify parent of favorite change
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  };

  // Get sport icon
  const getSportIcon = () => {
    switch (game.sport) {
      case 'SOCCER':
        return '⚽';
      case 'BASKETBALL':
        return '🏀';
      case 'FOOTBALL':
        return '🏈';
      case 'TENNIS':
        return '🎾';
      case 'HOCKEY':
        return '🏒';
      default:
        return '⚽';
    }
  };

  // Get country flag based on league
  const getCountryFlag = () => {
    const league = game.league.toLowerCase();

    // English leagues
    if (league.includes('premier league') || league.includes('england') || league.includes('championship') || league.includes('efl')) {
      return '🇬🇧';
    }

    // Spanish leagues
    if (league.includes('la liga') || league.includes('spain') || league.includes('laliga')) {
      return '🇪🇸';
    }

    // Italian leagues
    if (league.includes('serie a') || league.includes('italy') || league.includes('coppa italia')) {
      return '🇮🇹';
    }

    // German leagues
    if (league.includes('bundesliga') || league.includes('germany')) {
      return '🇩🇪';
    }

    // French leagues
    if (league.includes('ligue 1') || league.includes('france') || league.includes('ligue1')) {
      return '🇫🇷';
    }

    // European competitions
    if (league.includes('uefa') || league.includes('champions') || league.includes('europa')) {
      return '🇪🇺';
    }

    // International
    if (league.includes('world cup') || league.includes('fifa')) {
      return '🌍';
    }

    // Other countries
    if (league.includes('portugal') || league.includes('primeira liga')) return '🇵🇹';
    if (league.includes('netherlands') || league.includes('eredivisie')) return '🇳🇱';
    if (league.includes('brazil') || league.includes('brasileir')) return '🇧🇷';
    if (league.includes('argentina') || league.includes('superliga')) return '🇦🇷';
    if (league.includes('usa') || league.includes('mls') || league.includes('nba') || league.includes('nfl') || league.includes('nhl')) return '🇺🇸';
    if (league.includes('turkey') || league.includes('süper lig')) return '🇹🇷';
    if (league.includes('russia') || league.includes('premier liga')) return '🇷🇺';
    if (league.includes('mexico') || league.includes('liga mx')) return '🇲🇽';
    if (league.includes('belgium') || league.includes('jupiler')) return '🇧🇪';
    if (league.includes('scotland') || league.includes('premiership')) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';

    return '🌐';
  };

  const getStatusColor = () => {
    if (game.inBundle) return 'border-l-amber-500';
    if (isLive) return 'border-l-green-500';
    if (isFinished) return 'border-l-gray-500';
    return 'border-l-blue-500';
  };

  const getScoreDisplay = () => {
    if (game.homeScore !== undefined && game.awayScore !== undefined) {
      // Get sport-specific gradient colors
      let gradientColors = 'from-blue-400 to-purple-400'; // Default

      switch (game.sport) {
        case 'SOCCER':
          gradientColors = 'from-green-400 to-emerald-400';
          break;
        case 'BASKETBALL':
          gradientColors = 'from-orange-400 to-amber-400';
          break;
        case 'FOOTBALL':
          gradientColors = 'from-red-400 to-rose-400';
          break;
        case 'TENNIS':
          gradientColors = 'from-yellow-400 to-lime-400';
          break;
        case 'HOCKEY':
          gradientColors = 'from-blue-400 to-cyan-400';
          break;
      }

      return (
        <span className={`text-base font-black bg-gradient-to-r ${gradientColors} bg-clip-text text-transparent`}>
          {game.homeScore} - {game.awayScore}
        </span>
      );
    }
    return <span className="text-xs text-gray-500 font-medium">vs</span>;
  };

  const getMatchTime = () => {
    if (!game.scheduledAt) return null;

    const matchDate = new Date(game.scheduledAt);
    const now = new Date();

    // If match is today, show only time
    const isToday = matchDate.toDateString() === now.toDateString();

    if (isToday) {
      return matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // If match is tomorrow, show "Tomorrow HH:MM"
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = matchDate.toDateString() === tomorrow.toDateString();

    if (isTomorrow) {
      const time = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `Tomorrow ${time}`;
    }

    // Otherwise show date and time
    return matchDate.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`relative bg-[#0f1120] border border-[#1e2139] ${getStatusColor()} border-l-2 rounded overflow-hidden hover:border-[#2a2d4a] transition-all duration-200`}>
      {/* New Event Indicator */}
      {hasNewEvent && isLive && (
        <div className="absolute top-1 right-1 z-10">
          <div className="relative">
            <Activity className="w-3 h-3 text-green-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          </div>
        </div>
      )}

      {/* Main Card - Clickable */}
      <div className="w-full px-2.5 py-1.5 hover:bg-[#13152a]/30 transition-colors">
        <div className="flex items-center justify-between gap-2">
          {/* Country Flag & Sport */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px]">{getCountryFlag()}</span>
              <span className="text-xs">{getSportIcon()}</span>
            </div>
          </div>

          {/* Teams, Score & Competition */}
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5 mb-0.5">
                <span className="text-[11px] font-semibold text-gray-200 truncate">{game.homeTeam}</span>
                {getScoreDisplay()}
                <span className="text-[11px] font-semibold text-gray-200 truncate">{game.awayTeam}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="text-[9px] text-gray-400 truncate">{game.league}</div>
                {getMatchTime() && (
                  <>
                    <span className="text-[9px] text-gray-500">•</span>
                    <div className="text-[9px] text-gray-500">{getMatchTime()}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status & Expand */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Star/Favorite Button */}
            <button
              onClick={toggleFavorite}
              className="flex-shrink-0 p-1 hover:bg-[#2a2d4a] rounded transition-colors"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-3.5 h-3.5 transition-colors ${
                  isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500 hover:text-gray-400'
                }`}
              />
            </button>
            {/* Bundle Indicator */}
            {game.inBundle && (
              <Sparkles className="w-3 h-3 text-amber-400" />
            )}

            {/* Status Badge */}
            {isLive && (
              <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-green-500/10">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-bold text-green-400">
                  {game.currentPeriod || 'LIVE'}
                  {game.matchMinute !== null && game.matchMinute !== undefined && ` ${game.matchMinute}'`}
                </span>
              </div>
            )}
            {isFinished && (
              <span className="text-[9px] font-bold text-gray-500 px-1">FT</span>
            )}

            {/* Expand Icon */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0 hover:opacity-80 transition-opacity"
            >
              <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-[#1e2139] bg-[#0a0b14] px-2.5 py-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {/* Match Basic Info - Always show */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px]">
              <span className="text-gray-400">Sport</span>
              <span className="text-gray-300 font-medium">{getSportIcon()} {game.sport}</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-gray-400">Status</span>
              <span className={`font-medium ${isLive ? 'text-green-400' : isFinished ? 'text-gray-400' : 'text-blue-400'}`}>
                {game.status}
                {game.matchMinute !== null && game.matchMinute !== undefined && isLive && ` - ${game.matchMinute}'`}
              </span>
            </div>
            {game.scheduledAt && (
              <div className="flex justify-between text-[9px]">
                <span className="text-gray-400">Scheduled</span>
                <span className="text-gray-300 font-medium">
                  {new Date(game.scheduledAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Live Stats */}
          {game.liveStats && (isLive || isFinished) && (
            <div className="space-y-1.5 pt-1 border-t border-[#1e2139]/50">
              <div className="text-[9px] text-gray-400 font-medium">Live Statistics</div>

              {game.liveStats.possession && (
                <div>
                  <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
                    <span>Possession</span>
                    <span>{game.liveStats.possession.home}% - {game.liveStats.possession.away}%</span>
                  </div>
                  <div className="h-1 bg-[#1e2139] rounded-full overflow-hidden flex">
                    <div className="bg-blue-500" style={{ width: `${game.liveStats.possession.home}%` }}></div>
                    <div className="bg-purple-500" style={{ width: `${game.liveStats.possession.away}%` }}></div>
                  </div>
                </div>
              )}

              {game.liveStats.shots && (
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-400">Shots on Target</span>
                  <span className="text-gray-300 font-medium">{game.liveStats.shots.home} - {game.liveStats.shots.away}</span>
                </div>
              )}

              {game.liveStats.corners && (
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-400">Corners</span>
                  <span className="text-gray-300 font-medium">{game.liveStats.corners.home} - {game.liveStats.corners.away}</span>
                </div>
              )}

              {game.liveStats.fouls && (
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-400">Fouls</span>
                  <span className="text-gray-300 font-medium">{game.liveStats.fouls.home} - {game.liveStats.fouls.away}</span>
                </div>
              )}

              {(game.liveStats.yellowCards || game.liveStats.redCards) && (
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-400">Cards (🟨/🟥)</span>
                  <span className="text-gray-300 font-medium">
                    {game.liveStats.yellowCards?.home || 0}/{game.liveStats.redCards?.home || 0} - {game.liveStats.yellowCards?.away || 0}/{game.liveStats.redCards?.away || 0}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Match Events */}
          {(game.events?.goals?.length || game.events?.cards?.length || game.events?.substitutions?.length) ? (
            <div className="space-y-1.5 pt-1 border-t border-[#1e2139]/50">
              <div className="text-[9px] text-gray-400 font-medium">Match Events</div>

              {/* Goals with real player names and assists */}
              {game.events?.goals && game.events.goals.length > 0 && (
                <div className="space-y-1">
                  {game.events.goals.map((goal, i) => (
                    <div key={`goal-${i}`} className="flex items-start gap-1.5 text-[9px]">
                      <span className="w-1 h-1 bg-green-400 rounded-full mt-1"></span>
                      <div className="flex-1">
                        <div className="text-gray-300">
                          ⚽ Goal - <span className="font-semibold text-green-400">{goal.player}</span>
                          {goal.assist && (
                            <span className="text-gray-400"> (Assist: {goal.assist})</span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-500">
                        {goal.time}'{goal.extraTime ? `+${goal.extraTime}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cards with real player names */}
              {game.events?.cards && game.events.cards.length > 0 && (
                <div className="space-y-1">
                  {game.events.cards.map((card, i) => (
                    <div key={`card-${i}`} className="flex items-center gap-1.5 text-[9px]">
                      <span className={`w-1 h-1 rounded-full ${card.card.includes('Yellow') ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
                      <span className="text-gray-300">
                        {card.card.includes('Yellow') ? '🟨' : '🟥'} {card.card} -
                        <span className={`font-semibold ${card.card.includes('Yellow') ? 'text-yellow-400' : 'text-red-400'}`}> {card.player}</span>
                      </span>
                      <span className="text-gray-500 ml-auto">
                        {card.time}'{card.extraTime ? `+${card.extraTime}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Substitutions with real player names */}
              {game.events?.substitutions && game.events.substitutions.length > 0 && (
                <div className="space-y-1">
                  {game.events.substitutions.map((sub, i) => (
                    <div key={`sub-${i}`} className="flex items-start gap-1.5 text-[9px]">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mt-1"></span>
                      <div className="flex-1">
                        <div className="text-gray-300">
                          🔄 Sub - <span className="text-green-400">↑ {sub.playerIn}</span> <span className="text-red-400">↓ {sub.playerOut}</span>
                        </div>
                      </div>
                      <span className="text-gray-500">
                        {sub.time}'{sub.extraTime ? `+${sub.extraTime}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            (isLive || isFinished) && !game.liveStats && (
              <div className="pt-1 border-t border-[#1e2139]/50">
                <div className="text-[9px] text-gray-500 text-center py-2">
                  Detailed match events not available
                </div>
              </div>
            )
          )}

          {/* Match Info */}
          <div className="pt-1 border-t border-[#1e2139]/50">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-gray-500">Match ID: {game.id.slice(-6)}</span>
              {game.inBundle && (
                <span className="text-amber-400 font-medium flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  In Bundle
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
