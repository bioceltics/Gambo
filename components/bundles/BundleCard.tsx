'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, TrendingUp, Target, Trophy, Sparkles } from 'lucide-react';
import { formatOdds } from '@/lib/utils';

interface GameAnalysis {
  pick: string;
  odds: number;
  summary: string;
  recentForm?: string | null;
  headToHead?: string | null;
  injuries?: string | null;
  advancedMetrics?: string | null;
  weatherConditions?: string | null;
  motivationFactors?: string | null;
  setPieceAnalysis?: string | null;
  styleMatchup?: string | null;
  playerForm?: string | null;
  marketIntelligence?: string | null;
}

interface GameInfo {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  league: string; // Competition/League name
  scheduledAt: string;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  result?: string | null;
  currentPeriod?: string | null; // e.g., "45'", "HT", "2nd Half"
  analysis: GameAnalysis;
}

interface BundlePerformance {
  wins: number;
  losses: number;
  pushes: number;
  actualReturn?: number | null;
}

interface BundleCardProps {
  bundle: {
    id: string;
    name: string;
    type: string;
    confidence: number;
    expectedReturn: number;
    games: GameInfo[];
    performance?: BundlePerformance | null;
  };
  bundleNumber?: number;
}

export function BundleCard({ bundle, bundleNumber }: BundleCardProps) {
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  const toggleGame = (gameId: string) => {
    setExpandedGames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  const getSportEmoji = (sport: string) => {
    const emojis: Record<string, string> = {
      SOCCER: '⚽',
      BASKETBALL: '🏀',
      FOOTBALL: '🏈',
      TENNIS: '🎾',
      HOCKEY: '🏒',
    };
    return emojis[sport] || '🎯';
  };

  // Get country flag emoji based on league name
  const getLeagueFlag = (league: string): string => {
    const leagueName = league.toLowerCase();

    // Major leagues with flags
    if (leagueName.includes('premier league') || leagueName.includes('england') || leagueName.includes('efl')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
    if (leagueName.includes('la liga') || leagueName.includes('spain')) return '🇪🇸';
    if (leagueName.includes('serie a') || leagueName.includes('italy')) return '🇮🇹';
    if (leagueName.includes('bundesliga') || leagueName.includes('germany')) return '🇩🇪';
    if (leagueName.includes('ligue 1') || leagueName.includes('france')) return '🇫🇷';
    if (leagueName.includes('eredivisie') || leagueName.includes('netherlands')) return '🇳🇱';
    if (leagueName.includes('liga portugal') || leagueName.includes('portugal')) return '🇵🇹';
    if (leagueName.includes('scottish') || leagueName.includes('scotland')) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';

    // American leagues
    if (leagueName.includes('nba') || leagueName.includes('nfl') || leagueName.includes('mlb') || leagueName.includes('nhl') || leagueName.includes('mls') || leagueName.includes('usa') || leagueName.includes('united states')) return '🇺🇸';

    // European competitions
    if (leagueName.includes('champions league') || leagueName.includes('europa league') || leagueName.includes('uefa')) return '🇪🇺';

    // South American
    if (leagueName.includes('brazil')) return '🇧🇷';
    if (leagueName.includes('argentina')) return '🇦🇷';
    if (leagueName.includes('copa libertadores') || leagueName.includes('copa sudamericana')) return '🏆';

    // Other major countries
    if (leagueName.includes('mexico')) return '🇲🇽';
    if (leagueName.includes('turkey')) return '🇹🇷';
    if (leagueName.includes('russia')) return '🇷🇺';
    if (leagueName.includes('belgium')) return '🇧🇪';
    if (leagueName.includes('austria')) return '🇦🇹';
    if (leagueName.includes('switzerland')) return '🇨🇭';
    if (leagueName.includes('denmark')) return '🇩🇰';
    if (leagueName.includes('sweden')) return '🇸🇪';
    if (leagueName.includes('norway')) return '🇳🇴';
    if (leagueName.includes('greece')) return '🇬🇷';
    if (leagueName.includes('croatia')) return '🇭🇷';
    if (leagueName.includes('serbia')) return '🇷🇸';
    if (leagueName.includes('poland')) return '🇵🇱';
    if (leagueName.includes('czech')) return '🇨🇿';
    if (leagueName.includes('ukraine')) return '🇺🇦';
    if (leagueName.includes('romania')) return '🇷🇴';

    // Asian leagues
    if (leagueName.includes('japan') || leagueName.includes('j-league') || leagueName.includes('j.league')) return '🇯🇵';
    if (leagueName.includes('china') || leagueName.includes('csl')) return '🇨🇳';
    if (leagueName.includes('korea') || leagueName.includes('k-league')) return '🇰🇷';
    if (leagueName.includes('saudi') || leagueName.includes('arabia')) return '🇸🇦';
    if (leagueName.includes('qatar')) return '🇶🇦';
    if (leagueName.includes('uae') || leagueName.includes('emirates')) return '🇦🇪';
    if (leagueName.includes('india')) return '🇮🇳';
    if (leagueName.includes('thailand')) return '🇹🇭';
    if (leagueName.includes('australia') || leagueName.includes('a-league')) return '🇦🇺';

    // African leagues
    if (leagueName.includes('egypt')) return '🇪🇬';
    if (leagueName.includes('south africa')) return '🇿🇦';
    if (leagueName.includes('nigeria')) return '🇳🇬';
    if (leagueName.includes('morocco')) return '🇲🇦';
    if (leagueName.includes('tunisia')) return '🇹🇳';
    if (leagueName.includes('algeria')) return '🇩🇿';
    if (leagueName.includes('caf') || leagueName.includes('africa')) return '🌍';

    // Default trophy for international or unknown leagues
    if (leagueName.includes('world cup') || leagueName.includes('international') || leagueName.includes('friendly')) return '🌍';

    return '🏆'; // Default trophy emoji for unknown leagues
  };

  const getBundleTypeGradient = (type: string) => {
    const gradients: Record<string, string> = {
      BTTS: 'from-blue-600/20 to-cyan-600/20',
      HIGH_ODDS: 'from-purple-600/20 to-pink-600/20',
      WEEKEND: 'from-amber-600/20 to-orange-600/20',
      PLAYERS: 'from-green-600/20 to-emerald-600/20',
      TOTALS: 'from-red-600/20 to-rose-600/20',
      CUSTOM: 'from-indigo-600/20 to-violet-600/20',
    };
    return gradients[type] || 'from-blue-600/20 to-purple-600/20';
  };

  const getBundleTypeBorder = (type: string) => {
    const borders: Record<string, string> = {
      BTTS: 'border-blue-500/30',
      HIGH_ODDS: 'border-purple-500/30',
      WEEKEND: 'border-amber-500/30',
      PLAYERS: 'border-green-500/30',
      TOTALS: 'border-red-500/30',
      CUSTOM: 'border-indigo-500/30',
    };
    return borders[type] || 'border-blue-500/30';
  };

  const getResultColor = (result?: string | null) => {
    if (!result) return null;

    if (result === 'WIN') {
      return {
        bg: 'bg-green-600/20',
        border: 'border-green-500/40',
        text: 'text-green-400',
        label: '✓ WIN'
      };
    }

    if (result === 'LOSS') {
      return {
        bg: 'bg-red-600/20',
        border: 'border-red-500/40',
        text: 'text-red-400',
        label: '✗ LOSS'
      };
    }

    if (result === 'PUSH') {
      return {
        bg: 'bg-yellow-600/20',
        border: 'border-yellow-500/40',
        text: 'text-yellow-400',
        label: '- PUSH'
      };
    }

    return null;
  };

  // Get game status color overlay (for live games)
  const getGameStatusOverlay = (game: GameInfo) => {
    // If game has result, use result colors
    if (game.result) {
      const resultColors = getResultColor(game.result);
      if (resultColors) {
        return {
          border: resultColors.border,
          bg: resultColors.bg,
          overlay: null // No overlay needed, already finished
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

  // Check bundle status
  const allGamesFinished = bundle.games.every(g => g.status === 'FINISHED' || g.status === 'CANCELLED');
  const hasLiveGames = bundle.games.some(g => g.status === 'INPLAY' || g.status === 'LIVE');
  const actualReturn = bundle.performance?.actualReturn ?? null;
  const bundleWon = actualReturn !== null && actualReturn > 0;
  const bundleLost = actualReturn === -1; // Lost immediately when any game is LOSS

  // Get odds card status colors
  const getOddsCardStatus = () => {
    if (bundleWon) {
      return {
        bg: 'bg-green-600/30',
        border: 'border-green-500/50',
        text: 'text-green-400',
        icon: 'text-green-400'
      };
    }
    if (bundleLost) {
      return {
        bg: 'bg-red-600/30',
        border: 'border-red-500/50',
        text: 'text-red-400',
        icon: 'text-red-400'
      };
    }
    if (hasLiveGames) {
      return {
        bg: 'bg-blue-600/30',
        border: 'border-blue-500/50 animate-pulse',
        text: 'text-blue-400',
        icon: 'text-blue-400'
      };
    }
    return {
      bg: 'bg-blue-600/20',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'text-blue-400'
    };
  };

  return (
    <Card className={`w-full group relative overflow-hidden border-2 ${getBundleTypeBorder(bundle.type)} hover:border-opacity-80 transition-all duration-300 hover:shadow-2xl`}>
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBundleTypeGradient(bundle.type)} opacity-50 group-hover:opacity-70 transition-opacity`}></div>

      {/* Bundle Status Badge */}
      {(allGamesFinished || hasLiveGames || bundleLost || bundleWon) && (
        <div className="absolute top-4 left-4 z-10">
          {/* Show LOST immediately when bundle is lost (even with games still in progress) */}
          {bundleLost && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg">
              <span>✗ LOST</span>
              {bundle.performance?.actualReturn !== null && bundle.performance?.actualReturn !== undefined && (
                <span className="ml-1">({bundle.performance.actualReturn.toFixed(2)}x)</span>
              )}
            </div>
          )}
          {/* Show WON when bundle won */}
          {!bundleLost && bundleWon && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold shadow-lg">
              <span>✓ WON</span>
              {bundle.performance?.actualReturn !== null && bundle.performance?.actualReturn !== undefined && (
                <span className="ml-1">({bundle.performance.actualReturn.toFixed(2)}x)</span>
              )}
            </div>
          )}
          {/* Show LIVE indicator if any games are live and bundle not decided yet */}
          {!bundleLost && !bundleWon && hasLiveGames && !allGamesFinished && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg animate-pulse">
              <span>🔴 LIVE</span>
            </div>
          )}
        </div>
      )}

      {/* Premium badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white text-xs font-bold shadow-lg">
          <Sparkles className="w-3 h-3" />
          <span>PREMIUM</span>
        </div>
      </div>

      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {bundleNumber && (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-bold">
                  {bundleNumber}
                </div>
              )}
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{bundle.type.replace('_', ' ')}</span>
            </div>
            <CardTitle className="text-2xl font-black text-gray-100">{bundle.name}</CardTitle>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-green-400">{bundle.confidence}%</span>
            <span className="text-xs text-gray-400">Confidence</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 ${getOddsCardStatus().bg} border ${getOddsCardStatus().border} rounded-lg`}>
            <TrendingUp className={`w-4 h-4 ${getOddsCardStatus().icon}`} />
            <span className={`text-sm font-bold ${getOddsCardStatus().text}`}>{bundle.expectedReturn}x</span>
            <span className="text-xs text-gray-400">Return</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg">
            <span className="text-sm font-bold text-purple-400">{bundle.games.length}</span>
            <span className="text-xs text-gray-400">Games</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-2">
        <div className="space-y-1.5">
          {bundle.games.map((game, index) => {
            const statusOverlay = getGameStatusOverlay(game);
            const resultColors = getResultColor(game.result);
            const gameBorderClass = `border-2 ${statusOverlay.border}`;

            return (
            <div key={game.id} className={`relative ${gameBorderClass} ${statusOverlay.bg} rounded overflow-hidden backdrop-blur-sm hover:border-opacity-80 transition-all group/game`}>
              {/* Live game overlay (pulsing blue) */}
              {statusOverlay.overlay && <div className={statusOverlay.overlay} />}

              <div className={expandedGames.has(game.id) ? "p-3" : "px-2.5 py-2"}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="w-5 h-5 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px]">{getSportEmoji(game.sport)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="px-1 py-0.5 bg-gray-800 rounded text-[9px] font-semibold text-gray-400">#{index + 1}</span>
                        <span className="font-bold text-[11px] text-gray-100 truncate">
                          {game.homeTeam} <span className="text-gray-500">vs</span> {game.awayTeam}
                        </span>
                        {/* Show cancelled indicator */}
                        {game.status === 'CANCELLED' && (
                          <span className="px-1.5 py-0.5 bg-black rounded text-[10px] font-bold text-white">
                            ⚫ CANCELLED
                          </span>
                        )}
                        {/* Show live indicator for in-progress games */}
                        {(game.status === 'INPLAY' || game.status === 'LIVE') && (() => {
                          // Evaluate if prediction is winning, losing, or neutral
                          const evaluatePickStatus = () => {
                            const pick = game.analysis.pick.toLowerCase();
                            const homeScore = game.homeScore || 0;
                            const awayScore = game.awayScore || 0;
                            const totalGoals = homeScore + awayScore;

                            // Home Win or 1
                            if (pick.includes('home win') || (pick.includes('1') && !pick.includes('1x') && !pick.includes('12'))) {
                              if (homeScore > awayScore) return 'winning'; // Green
                              if (homeScore === awayScore) return 'neutral'; // Blue (still tied)
                              return 'losing'; // Red
                            }

                            // Away Win or 2
                            if (pick.includes('away win') || (pick.includes('2') && !pick.includes('x2') && !pick.includes('12'))) {
                              if (awayScore > homeScore) return 'winning';
                              if (homeScore === awayScore) return 'neutral';
                              return 'losing';
                            }

                            // Draw or X
                            if ((pick.includes('draw') && !pick.includes('home') && !pick.includes('away')) || (pick === 'x')) {
                              if (homeScore === awayScore) return 'winning';
                              return 'losing'; // Either team ahead means draw is losing
                            }

                            // Double Chance: 1X (Home or Draw)
                            if (pick.includes('1x') || pick.includes('home win or draw')) {
                              if (homeScore >= awayScore) return 'winning'; // Home ahead or tied
                              return 'losing'; // Away ahead
                            }

                            // Double Chance: X2 (Away or Draw)
                            if (pick.includes('x2') || pick.includes('away win or draw')) {
                              if (awayScore >= homeScore) return 'winning'; // Away ahead or tied
                              return 'losing'; // Home ahead
                            }

                            // Double Chance: 12 (Home or Away - no draw)
                            if (pick.includes('12') || pick.includes('home or away')) {
                              if (homeScore !== awayScore) return 'winning'; // Either team ahead
                              return 'losing'; // Tied is bad for this bet
                            }

                            // Over X.5
                            if (pick.includes('over')) {
                              const threshold = parseFloat(pick.match(/over\s+(\d+\.?\d*)/i)?.[1] || '2.5');
                              if (totalGoals > threshold) return 'winning';
                              if (totalGoals === Math.floor(threshold)) return 'neutral'; // On the edge
                              return 'losing';
                            }

                            // Under X.5
                            if (pick.includes('under')) {
                              const threshold = parseFloat(pick.match(/under\s+(\d+\.?\d*)/i)?.[1] || '2.5');
                              if (totalGoals < threshold) return 'winning';
                              if (totalGoals === Math.ceil(threshold)) return 'neutral'; // On the edge
                              return 'losing';
                            }

                            // BTTS Yes (Both Teams to Score) / GG
                            if (pick.includes('btts yes') || pick.includes('both teams to score') || pick.includes('gg')) {
                              if (homeScore > 0 && awayScore > 0) return 'winning';
                              if (homeScore === 0 || awayScore === 0) return 'losing';
                              return 'neutral';
                            }

                            // BTTS No / NG
                            if (pick.includes('btts no') || pick.includes('ng')) {
                              if (homeScore === 0 || awayScore === 0) return 'winning';
                              if (homeScore > 0 && awayScore > 0) return 'losing';
                              return 'neutral';
                            }

                            return 'neutral'; // Default to neutral for unknown picks
                          };

                          const status = evaluatePickStatus();
                          const dotColor = status === 'winning' ? '🟢' : status === 'losing' ? '🔴' : '🔵';

                          return (
                            <span className="px-1.5 py-0.5 bg-blue-600 rounded text-[10px] font-bold text-white animate-pulse">
                              {dotColor} LIVE
                            </span>
                          );
                        })()}
                        {/* Show score if finished or live */}
                        {(game.status === 'FINISHED' || game.status === 'INPLAY' || game.status === 'LIVE') && game.homeScore !== null && game.homeScore !== undefined && game.awayScore !== null && game.awayScore !== undefined && (
                          <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] font-bold text-blue-400">
                            {game.homeScore}-{game.awayScore}
                          </span>
                        )}
                        {/* Show match time for live games */}
                        {(game.status === 'INPLAY' || game.status === 'LIVE') && game.currentPeriod && (
                          <span className="px-1.5 py-0.5 bg-blue-600/20 border border-blue-500/40 rounded text-[10px] font-bold text-blue-300">
                            {game.currentPeriod}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px]" title={`Country flag for ${game.league}`}>{getLeagueFlag(game.league)}</span>
                        <span className="text-[9px] text-gray-400 truncate font-medium" title={game.league}>{game.league}</span>
                      </div>
                      <div className="text-[9px] text-gray-500 truncate">
                        {game.status === 'FINISHED' ? 'Final' : new Date(game.scheduledAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Result badge */}
                    {resultColors && (
                      <div className={`px-2 py-1 rounded ${resultColors.bg} ${resultColors.border} border`}>
                        <span className={`text-[9px] font-bold ${resultColors.text}`}>
                          {resultColors.label}
                        </span>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="px-1.5 py-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded">
                        <div className="font-bold text-[10px] text-blue-400">
                          {game.analysis.pick}
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5">
                        @ {formatOdds(game.analysis.odds)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/10 flex items-center gap-1"
                      onClick={() => toggleGame(game.id)}
                    >
                      <span className="text-[9px] font-semibold">
                        {expandedGames.has(game.id) ? 'Hide' : 'Analysis'}
                      </span>
                      {expandedGames.has(game.id) ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedGames.has(game.id) && (
                  <>
                    <div className="mt-2 bg-[#0c0d15] border border-[#2a2d42] rounded p-2">
                      <div className="flex items-start gap-1.5 mb-1">
                        <Target className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Analysis Summary</div>
                      </div>
                      <p className="text-[10px] text-gray-300 leading-relaxed">{game.analysis.summary}</p>
                    </div>
                  </>
                )}
              </div>

              {expandedGames.has(game.id) && (
                <div className="px-2.5 pb-2.5 border-t border-[#2a2d42]">
                  <div className="pt-2 space-y-1.5">
                    {game.analysis.recentForm && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">📈 Recent Form</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.recentForm}</p>
                      </div>
                    )}
                    {game.analysis.headToHead && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">⚔️ Head-to-Head</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.headToHead}</p>
                      </div>
                    )}
                    {game.analysis.injuries && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">🏥 Key Injuries</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.injuries}</p>
                      </div>
                    )}
                    {game.analysis.advancedMetrics && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">📊 Advanced Metrics</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.advancedMetrics}</p>
                      </div>
                    )}
                    {game.analysis.weatherConditions && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">🌤️ Weather Conditions</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.weatherConditions}</p>
                      </div>
                    )}
                    {game.analysis.motivationFactors && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">💪 Motivation Factors</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.motivationFactors}</p>
                      </div>
                    )}
                    {game.analysis.setPieceAnalysis && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">⚽ Set Piece Analysis</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.setPieceAnalysis}</p>
                      </div>
                    )}
                    {game.analysis.styleMatchup && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">🎯 Style Matchup</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.styleMatchup}</p>
                      </div>
                    )}
                    {game.analysis.playerForm && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">⭐ Player Form</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.playerForm}</p>
                      </div>
                    )}
                    {game.analysis.marketIntelligence && (
                      <div className="bg-[#0c0d15] rounded p-2">
                        <div className="font-bold text-[10px] text-gray-300 mb-1">💡 Market Intelligence</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{game.analysis.marketIntelligence}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            );
          })}

          <div className={`mt-3 p-3 rounded-lg ${
            bundleWon
              ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-2 border-green-500/50'
              : bundleLost
              ? 'bg-gradient-to-br from-red-600/20 to-rose-600/20 border-2 border-red-500/50'
              : 'bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-300">
                <span className="font-bold text-gray-100">{bundle.games.length}</span> Games
              </div>
              <span className="text-gray-600">•</span>
              <div className="text-xs text-gray-300">
                Combined Odds: <span className={`font-bold ${
                  bundleWon
                    ? 'text-green-400'
                    : bundleLost
                    ? 'text-red-400'
                    : 'text-blue-400'
                }`}>{formatOdds(bundle.games.reduce((acc, g) => acc * g.analysis.odds, 1))}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
