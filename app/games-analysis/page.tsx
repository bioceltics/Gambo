'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Filter, TrendingUp, Calendar, Globe, Trophy, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface AnalyzedGame {
  id: string;
  sport: string;
  country: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  scheduledAt: string;
  recommendedPick: string;
  betType: string;
  odds: number;
  confidenceScore: number;
  summary: string;
  recentForm: string;
  headToHead: string;
  injuries: string;
  advancedMetrics: string;
  weatherConditions: string;
  motivationFactors: string;
  selectedForBundle: boolean;
}

interface Filters {
  sports: string[];
  countries: string[];
  competitions: string[];
  dates: string[];
}

export default function GamesAnalysisPage() {
  const [games, setGames] = useState<AnalyzedGame[]>([]);
  const [filters, setFilters] = useState<Filters>({ sports: [], countries: [], competitions: [], dates: [] });
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [minConfidence, setMinConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGames();
  }, [selectedSport, selectedCountry, selectedCompetition, selectedDate, selectedOnly, minConfidence]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSport) params.append('sport', selectedSport);
      if (selectedCountry) params.append('country', selectedCountry);
      if (selectedCompetition) params.append('competition', selectedCompetition);
      if (selectedDate) params.append('date', selectedDate);
      if (selectedOnly) params.append('selectedOnly', 'true');
      if (minConfidence > 0) params.append('minConfidence', minConfidence.toString());

      const response = await fetch(`/api/analyzed-games?${params}`);
      const data = await response.json();

      setGames(data.games || []);
      setFilters(data.filters || { sports: [], countries: [], competitions: [], dates: [] });
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGameDetails = (gameId: string) => {
    const newExpanded = new Set(expandedGames);
    if (newExpanded.has(gameId)) {
      newExpanded.delete(gameId);
    } else {
      newExpanded.add(gameId);
    }
    setExpandedGames(newExpanded);
  };

  const clearFilters = () => {
    setSelectedSport('');
    setSelectedCountry('');
    setSelectedCompetition('');
    setSelectedDate('');
    setSelectedOnly(false);
    setMinConfidence(0);
  };

  const getSportEmoji = (sport: string) => {
    const emojis: Record<string, string> = {
      SOCCER: '⚽',
      BASKETBALL: '🏀',
      TENNIS: '🎾',
      HOCKEY: '🏒',
      FOOTBALL: '🏈'
    };
    return emojis[sport] || '🏆';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 70) return 'text-blue-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500/20 border-green-400/30 text-green-400';
    if (confidence >= 70) return 'bg-blue-500/20 border-blue-400/30 text-blue-400';
    if (confidence >= 60) return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400';
    return 'bg-gray-500/20 border-gray-400/30 text-gray-400';
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI-Powered Analysis
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-100">
            Games <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Analysis</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            Browse all games analyzed by our AI engine. Filter by sport, country, competition, and more.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-purple-500/30 bg-[#1a1c2e]/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-xl">Filters</CardTitle>
              </div>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Sport Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Sport</label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Sports</option>
                  {filters.sports.map(sport => (
                    <option key={sport} value={sport}>{getSportEmoji(sport)} {sport}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Countries</option>
                  {filters.countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Competition Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Competition</label>
                <select
                  value={selectedCompetition}
                  onChange={(e) => setSelectedCompetition(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Competitions</option>
                  {filters.competitions.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Generation Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">All Dates</option>
                  {filters.dates.map(date => (
                    <option key={date} value={date}>{new Date(date).toLocaleDateString()}</option>
                  ))}
                </select>
              </div>

              {/* Min Confidence Filter */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Min Confidence</label>
                <select
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                >
                  <option value="0">All</option>
                  <option value="60">60%+</option>
                  <option value="70">70%+</option>
                  <option value="80">80%+</option>
                  <option value="90">90%+</option>
                </select>
              </div>
            </div>

            {/* Selected for Bundle Toggle */}
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOnly}
                  onChange={(e) => setSelectedOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm text-gray-300">Show only games selected for bundles</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-400">
            {isLoading ? 'Loading...' : `${games.length} games found`}
          </p>
        </div>

        {/* Games List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <Card className="border-gray-700 bg-[#1a1c2e]/80">
            <CardContent className="py-20 text-center">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No games found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back after the next bundle generation.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <Card
                key={game.id}
                className={`border-2 transition-all ${
                  game.selectedForBundle
                    ? 'border-purple-500/50 bg-purple-900/10'
                    : 'border-gray-700 bg-[#1a1c2e]/80'
                }`}
              >
                <CardContent className="p-4">
                  {/* Game Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-2xl">{getSportEmoji(game.sport)}</span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400">
                          {game.country}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400">
                          {game.competition}
                        </span>
                        {game.selectedForBundle && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-600/30 text-purple-400 font-bold">
                            IN BUNDLE
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {game.homeTeam} <span className="text-gray-500">vs</span> {game.awayTeam}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {new Date(game.scheduledAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className={`text-2xl font-black ${getConfidenceColor(game.confidenceScore)} mb-1`}>
                        {game.confidenceScore}%
                      </div>
                      <div className={`text-xs px-2 py-1 rounded border ${getConfidenceBadge(game.confidenceScore)}`}>
                        Confidence
                      </div>
                    </div>
                  </div>

                  {/* Pick Info */}
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Recommended Pick</p>
                      <p className="text-lg font-bold text-white">{game.recommendedPick}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Odds</p>
                      <p className="text-lg font-bold text-green-400">{game.odds.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Type</p>
                      <p className="text-sm font-bold text-blue-400 uppercase">{game.betType}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-gray-300 mb-3">{game.summary}</p>

                  {/* Expand Button */}
                  <Button
                    onClick={() => toggleGameDetails(game.id)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {expandedGames.has(game.id) ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Hide Analysis
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show Full Analysis
                      </>
                    )}
                  </Button>

                  {/* Expanded Details */}
                  {expandedGames.has(game.id) && (
                    <div className="mt-4 space-y-3 pt-4 border-t border-gray-700">
                      <div>
                        <h4 className="text-sm font-bold text-purple-400 mb-1">Recent Form</h4>
                        <p className="text-sm text-gray-300">{game.recentForm}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-400 mb-1">Head to Head</h4>
                        <p className="text-sm text-gray-300">{game.headToHead}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-green-400 mb-1">Advanced Metrics</h4>
                        <p className="text-sm text-gray-300">{game.advancedMetrics}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-yellow-400 mb-1">Injuries & Team News</h4>
                        <p className="text-sm text-gray-300">{game.injuries}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-orange-400 mb-1">Weather Conditions</h4>
                        <p className="text-sm text-gray-300">{game.weatherConditions}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-pink-400 mb-1">Motivation Factors</h4>
                        <p className="text-sm text-gray-300">{game.motivationFactors}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
