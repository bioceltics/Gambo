/**
 * Team Quality Analyzer
 *
 * PRIMARY ANALYSIS FACTOR: Identify Top 4 vs Bottom 4 matchups
 * These are the highest value betting opportunities where strong teams
 * play weak teams, offering predictable outcomes with good odds.
 */

export interface TeamStanding {
  team: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[]; // Recent form: ['W', 'W', 'D', 'L', 'W']
}

export interface LeagueStandings {
  league: string;
  season: string;
  teams: TeamStanding[];
  lastUpdated: Date;
}

export interface TeamQualityMatch {
  isTopVsBottom: boolean;
  strongTeam: 'home' | 'away' | null;
  strongTeamPosition: number | null;
  weakTeamPosition: number | null;
  positionDifference: number;
  qualityLevel: 'elite' | 'high' | 'medium' | 'low';
}

export interface H2HRecord {
  homeTeam: string;
  awayTeam: string;
  totalMatches: number;
  homeWins: number;
  draws: number;
  awayWins: number;
  averageHomeGoals: number;
  averageAwayGoals: number;
  averageTotalGoals: number;
  bttsPercentage: number;
  over25Percentage: number;
  over35Percentage: number;
  recentForm: string; // e.g., "HWDHW" (last 5)
}

export interface ScoringPattern {
  team: string;
  matchesAnalyzed: number;
  averageGoalsScored: number;
  averageGoalsConceded: number;
  averageTotalGoals: number;
  bttsPercentage: number; // % of games with both teams scoring
  over15Percentage: number;
  over25Percentage: number;
  over35Percentage: number;
  under15Percentage: number;
  under25Percentage: number;
  under35Percentage: number;
  isHighScoring: boolean; // avg > 3.0 goals
  isLowScoring: boolean;  // avg < 2.0 goals
  cleanSheetPercentage: number;
}

/**
 * Mock standings data (in production, fetch from BetsAPI or SportMonks)
 * This simulates league table data for major competitions
 */
const MOCK_STANDINGS: Record<string, TeamStanding[]> = {
  // English Premier League (example)
  'Premier League': [
    { team: 'Manchester City', position: 1, played: 20, won: 16, drawn: 3, lost: 1, goalsFor: 52, goalsAgainst: 18, goalDifference: 34, points: 51, form: ['W', 'W', 'W', 'D', 'W'] },
    { team: 'Arsenal', position: 2, played: 20, won: 15, drawn: 4, lost: 1, goalsFor: 48, goalsAgainst: 16, goalDifference: 32, points: 49, form: ['W', 'W', 'D', 'W', 'W'] },
    { team: 'Liverpool', position: 3, played: 20, won: 14, drawn: 5, lost: 1, goalsFor: 45, goalsAgainst: 20, goalDifference: 25, points: 47, form: ['W', 'D', 'W', 'W', 'D'] },
    { team: 'Aston Villa', position: 4, played: 20, won: 13, drawn: 3, lost: 4, goalsFor: 42, goalsAgainst: 25, goalDifference: 17, points: 42, form: ['W', 'L', 'W', 'W', 'D'] },
    // ... mid-table teams omitted for brevity
    { team: 'Luton Town', position: 17, played: 20, won: 3, drawn: 5, lost: 12, goalsFor: 22, goalsAgainst: 42, goalDifference: -20, points: 14, form: ['L', 'L', 'D', 'L', 'L'] },
    { team: 'Burnley', position: 18, played: 20, won: 2, drawn: 6, lost: 12, goalsFor: 18, goalsAgainst: 40, goalDifference: -22, points: 12, form: ['L', 'D', 'L', 'L', 'L'] },
    { team: 'Sheffield United', position: 19, played: 20, won: 2, drawn: 4, lost: 14, goalsFor: 16, goalsAgainst: 48, goalDifference: -32, points: 10, form: ['L', 'L', 'L', 'D', 'L'] },
    { team: 'Everton', position: 20, played: 20, won: 1, drawn: 5, lost: 14, goalsFor: 15, goalsAgainst: 45, goalDifference: -30, points: 8, form: ['L', 'L', 'L', 'L', 'D'] },
  ],
  // La Liga (example)
  'La Liga': [
    { team: 'Real Madrid', position: 1, played: 20, won: 15, drawn: 4, lost: 1, goalsFor: 45, goalsAgainst: 15, goalDifference: 30, points: 49, form: ['W', 'W', 'W', 'D', 'W'] },
    { team: 'Barcelona', position: 2, played: 20, won: 14, drawn: 5, lost: 1, goalsFor: 48, goalsAgainst: 18, goalDifference: 30, points: 47, form: ['W', 'D', 'W', 'W', 'W'] },
    { team: 'Girona', position: 3, played: 20, won: 13, drawn: 4, lost: 3, goalsFor: 42, goalsAgainst: 22, goalDifference: 20, points: 43, form: ['W', 'W', 'L', 'W', 'D'] },
    { team: 'Atletico Madrid', position: 4, played: 20, won: 12, drawn: 5, lost: 3, goalsFor: 38, goalsAgainst: 20, goalDifference: 18, points: 41, form: ['W', 'D', 'W', 'W', 'L'] },
    { team: 'Almeria', position: 18, played: 20, won: 2, drawn: 5, lost: 13, goalsFor: 18, goalsAgainst: 42, goalDifference: -24, points: 11, form: ['L', 'L', 'D', 'L', 'L'] },
    { team: 'Cadiz', position: 19, played: 20, won: 2, drawn: 4, lost: 14, goalsFor: 16, goalsAgainst: 40, goalDifference: -24, points: 10, form: ['L', 'L', 'L', 'D', 'L'] },
    { team: 'Granada', position: 20, played: 20, won: 1, drawn: 6, lost: 13, goalsFor: 15, goalsAgainst: 45, goalDifference: -30, points: 9, form: ['L', 'D', 'L', 'L', 'L'] },
  ]
};

/**
 * Analyze if a match is Top 4 vs Bottom 4
 * This is the PRIMARY filter for high-value betting opportunities
 */
export function analyzeTeamQuality(
  homeTeam: string,
  awayTeam: string,
  league: string
): TeamQualityMatch {
  const standings = getLeagueStandings(league);

  if (!standings || standings.length === 0) {
    return {
      isTopVsBottom: false,
      strongTeam: null,
      strongTeamPosition: null,
      weakTeamPosition: null,
      positionDifference: 0,
      qualityLevel: 'low'
    };
  }

  const totalTeams = standings.length;
  const homeStanding = findTeamStanding(standings, homeTeam);
  const awayStanding = findTeamStanding(standings, awayTeam);

  if (!homeStanding || !awayStanding) {
    return {
      isTopVsBottom: false,
      strongTeam: null,
      strongTeamPosition: null,
      weakTeamPosition: null,
      positionDifference: 0,
      qualityLevel: 'low'
    };
  }

  const homePos = homeStanding.position;
  const awayPos = awayStanding.position;
  const positionDiff = Math.abs(homePos - awayPos);

  // Define Top 4 and Bottom 4
  const isHomeTop4 = homePos <= 4;
  const isAwayTop4 = awayPos <= 4;
  const isHomeBottom4 = homePos > totalTeams - 4;
  const isAwayBottom4 = awayPos > totalTeams - 4;

  // Check if it's a Top 4 vs Bottom 4 matchup
  const isTopVsBottom = (isHomeTop4 && isAwayBottom4) || (isAwayTop4 && isHomeBottom4);

  let strongTeam: 'home' | 'away' | null = null;
  let strongTeamPosition: number | null = null;
  let weakTeamPosition: number | null = null;

  if (isTopVsBottom) {
    if (isHomeTop4 && isAwayBottom4) {
      strongTeam = 'home';
      strongTeamPosition = homePos;
      weakTeamPosition = awayPos;
    } else {
      strongTeam = 'away';
      strongTeamPosition = awayPos;
      weakTeamPosition = homePos;
    }
  }

  // Determine quality level based on position difference
  let qualityLevel: 'elite' | 'high' | 'medium' | 'low' = 'low';
  if (isTopVsBottom) {
    qualityLevel = 'elite'; // Top 4 vs Bottom 4 is ELITE opportunity
  } else if (positionDiff >= 10) {
    qualityLevel = 'high'; // Large position gap
  } else if (positionDiff >= 5) {
    qualityLevel = 'medium'; // Moderate gap
  }

  return {
    isTopVsBottom,
    strongTeam,
    strongTeamPosition,
    weakTeamPosition,
    positionDifference: positionDiff,
    qualityLevel
  };
}

/**
 * Analyze H2H record between two teams
 * This is SECONDARY analysis after identifying Top 4 vs Bottom 4
 */
export function analyzeH2H(
  homeTeam: string,
  awayTeam: string,
  league: string
): H2HRecord {
  // In production, fetch real H2H data from BetsAPI
  // For now, return mock data based on team quality

  const standings = getLeagueStandings(league);
  const homeStanding = findTeamStanding(standings || [], homeTeam);
  const awayStanding = findTeamStanding(standings || [], awayTeam);

  // Simulate H2H based on team positions
  const homeAdvantage = homeStanding ? (20 - homeStanding.position) / 20 : 0.5;
  const awayStrength = awayStanding ? (20 - awayStanding.position) / 20 : 0.5;

  const totalMatches = 10;
  const homeWins = Math.round(totalMatches * homeAdvantage * 0.6);
  const awayWins = Math.round(totalMatches * awayStrength * 0.4);
  const draws = totalMatches - homeWins - awayWins;

  return {
    homeTeam,
    awayTeam,
    totalMatches,
    homeWins,
    draws,
    awayWins,
    averageHomeGoals: homeStanding ? homeStanding.goalsFor / homeStanding.played : 1.5,
    averageAwayGoals: awayStanding ? awayStanding.goalsFor / awayStanding.played : 1.2,
    averageTotalGoals: 2.7,
    bttsPercentage: 55,
    over25Percentage: 52,
    over35Percentage: 28,
    recentForm: 'HWDHW'
  };
}

/**
 * Analyze scoring patterns for a team
 * Used to determine if Over/Under or BTTS is better than straight win
 */
export function analyzeScoringPattern(
  team: string,
  league: string,
  recentMatches: number = 10
): ScoringPattern {
  const standings = getLeagueStandings(league);
  const teamStanding = findTeamStanding(standings || [], team);

  if (!teamStanding) {
    // Return default pattern
    return {
      team,
      matchesAnalyzed: 0,
      averageGoalsScored: 1.5,
      averageGoalsConceded: 1.5,
      averageTotalGoals: 3.0,
      bttsPercentage: 50,
      over15Percentage: 70,
      over25Percentage: 50,
      over35Percentage: 25,
      under15Percentage: 30,
      under25Percentage: 50,
      under35Percentage: 75,
      isHighScoring: false,
      isLowScoring: false,
      cleanSheetPercentage: 25
    };
  }

  const goalsScored = teamStanding.goalsFor / teamStanding.played;
  const goalsConceded = teamStanding.goalsAgainst / teamStanding.played;
  const totalGoals = goalsScored + goalsConceded;

  // Calculate percentages (simplified - in production use real match data)
  const over15Pct = totalGoals > 1.5 ? 75 : 40;
  const over25Pct = totalGoals > 2.5 ? 60 : 35;
  const over35Pct = totalGoals > 3.5 ? 35 : 15;

  return {
    team,
    matchesAnalyzed: teamStanding.played,
    averageGoalsScored: goalsScored,
    averageGoalsConceded: goalsConceded,
    averageTotalGoals: totalGoals,
    bttsPercentage: goalsConceded > 0.8 && goalsScored > 0.8 ? 65 : 40,
    over15Percentage: over15Pct,
    over25Percentage: over25Pct,
    over35Percentage: over35Pct,
    under15Percentage: 100 - over15Pct,
    under25Percentage: 100 - over25Pct,
    under35Percentage: 100 - over35Pct,
    isHighScoring: totalGoals > 3.0,
    isLowScoring: totalGoals < 2.0,
    cleanSheetPercentage: goalsConceded < 0.5 ? 40 : 20
  };
}

/**
 * Get league standings (from cache or API)
 */
function getLeagueStandings(league: string): TeamStanding[] | null {
  // Normalize league name for lookup
  const normalizedLeague = league.toLowerCase();

  for (const [key, value] of Object.entries(MOCK_STANDINGS)) {
    if (key.toLowerCase().includes(normalizedLeague) || normalizedLeague.includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}

/**
 * Find a team's standing in the league table
 */
function findTeamStanding(standings: TeamStanding[], teamName: string): TeamStanding | null {
  const normalizedName = teamName.toLowerCase();

  return standings.find(standing =>
    standing.team.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(standing.team.toLowerCase())
  ) || null;
}

/**
 * MASTER ANALYSIS FUNCTION
 * Combines all analysis factors in priority order:
 * 1. Top 4 vs Bottom 4 identification
 * 2. H2H historical analysis
 * 3. Scoring pattern detection
 * 4. Returns best market recommendation
 */
export interface MasterAnalysis {
  teamQuality: TeamQualityMatch;
  h2h: H2HRecord;
  homeScoringPattern: ScoringPattern;
  awayScoringPattern: ScoringPattern;
  recommendedMarket: 'h2h' | 'doubleChance' | 'totals' | 'btts';
  primaryPick: string;
  reasoning: string;
  confidence: number;
  expectedValue: number;
}

export function performMasterAnalysis(
  homeTeam: string,
  awayTeam: string,
  league: string,
  odds: {
    homeWin?: number;
    draw?: number;
    awayWin?: number;
    doubleChance?: { homeOrDraw?: number; awayOrDraw?: number };
    overUnder?: { over?: number; under?: number; line?: number };
    btts?: { yes?: number; no?: number };
  }
): MasterAnalysis {
  // Step 1: Analyze team quality (PRIMARY FACTOR)
  const teamQuality = analyzeTeamQuality(homeTeam, awayTeam, league);

  // Step 2: H2H analysis
  const h2h = analyzeH2H(homeTeam, awayTeam, league);

  // Step 3: Scoring patterns
  const homeScoringPattern = analyzeScoringPattern(homeTeam, league);
  const awayScoringPattern = analyzeScoringPattern(awayTeam, league);

  // Step 4: Determine best market based on analysis
  let recommendedMarket: 'h2h' | 'doubleChance' | 'totals' | 'btts' = 'h2h';
  let primaryPick = '';
  let reasoning = '';
  let confidence = 70;
  let expectedValue = 0;

  // ELITE OPPORTUNITY: Top 4 vs Bottom 4
  if (teamQuality.isTopVsBottom && teamQuality.strongTeam) {
    const strongTeamOdds = teamQuality.strongTeam === 'home' ? odds.homeWin : odds.awayWin;
    const combinedGoals = homeScoringPattern.averageTotalGoals + awayScoringPattern.averageTotalGoals;

    // Check if Over/Under offers better value than straight win
    const overOdds = odds.overUnder?.over || 0;
    const underOdds = odds.overUnder?.under || 0;

    // Calculate expected value for each market
    const h2hValue = strongTeamOdds ? (0.75 * strongTeamOdds - 1) : 0; // 75% win probability
    const overValue = combinedGoals > 2.5 && overOdds ? (0.65 * overOdds - 1) : 0;
    const underValue = combinedGoals < 2.5 && underOdds ? (0.65 * underOdds - 1) : 0;

    // Select market with best expected value
    if (overValue > h2hValue && overValue > 0.1) {
      recommendedMarket = 'totals';
      primaryPick = `Over ${odds.overUnder?.line || 2.5}`;
      reasoning = `${teamQuality.strongTeam === 'home' ? homeTeam : awayTeam} (Top 4, position ${teamQuality.strongTeamPosition}) vs bottom team. High scoring expected (avg ${combinedGoals.toFixed(1)} goals). Over offers +${(overValue * 100).toFixed(1)}% value vs straight win.`;
      confidence = 78;
      expectedValue = overValue;
    } else if (underValue > h2hValue && underValue > 0.1) {
      recommendedMarket = 'totals';
      primaryPick = `Under ${odds.overUnder?.line || 2.5}`;
      reasoning = `${teamQuality.strongTeam === 'home' ? homeTeam : awayTeam} (Top 4, position ${teamQuality.strongTeamPosition}) vs bottom team. Low scoring expected (avg ${combinedGoals.toFixed(1)} goals). Under offers +${(underValue * 100).toFixed(1)}% value vs straight win.`;
      confidence = 78;
      expectedValue = underValue;
    } else {
      recommendedMarket = 'h2h';
      primaryPick = teamQuality.strongTeam === 'home' ? 'Home Win' : 'Away Win';
      reasoning = `ELITE MATCHUP: ${teamQuality.strongTeam === 'home' ? homeTeam : awayTeam} (Top 4, position ${teamQuality.strongTeamPosition}) vs ${teamQuality.strongTeam === 'home' ? awayTeam : homeTeam} (Bottom 4, position ${teamQuality.weakTeamPosition}). Position gap: ${teamQuality.positionDifference}. Straight win offers best value.`;
      confidence = 85;
      expectedValue = h2hValue;
    }

    return {
      teamQuality,
      h2h,
      homeScoringPattern,
      awayScoringPattern,
      recommendedMarket,
      primaryPick,
      reasoning,
      confidence,
      expectedValue
    };
  }

  // FALLBACK: No clear Top 4 vs Bottom 4, use H2H and scoring patterns
  const combinedGoals = (homeScoringPattern.averageTotalGoals + awayScoringPattern.averageTotalGoals) / 2;
  const bttsLikely = homeScoringPattern.bttsPercentage > 60 && awayScoringPattern.bttsPercentage > 60;

  if (bttsLikely && odds.btts?.yes && odds.btts.yes <= 2.2) {
    recommendedMarket = 'btts';
    primaryPick = 'BTTS Yes';
    reasoning = `Both teams score frequently (${homeScoringPattern.bttsPercentage}% / ${awayScoringPattern.bttsPercentage}%). BTTS offers good value at ${odds.btts.yes.toFixed(2)}`;
    confidence = 72;
  } else if (combinedGoals > 2.8 && odds.overUnder?.over) {
    recommendedMarket = 'totals';
    primaryPick = `Over ${odds.overUnder.line || 2.5}`;
    reasoning = `High-scoring teams (avg ${combinedGoals.toFixed(1)} total goals). Over is better value than H2H.`;
    confidence = 70;
  } else {
    // Default to H2H based on form
    const homeWinProb = h2h.homeWins / h2h.totalMatches;
    const awayWinProb = h2h.awayWins / h2h.totalMatches;

    if (homeWinProb > 0.5) {
      primaryPick = 'Home Win';
      confidence = Math.round(homeWinProb * 100);
    } else if (awayWinProb > 0.4) {
      primaryPick = 'Away Win';
      confidence = Math.round(awayWinProb * 100);
    } else {
      recommendedMarket = 'doubleChance';
      primaryPick = homeWinProb > awayWinProb ? 'Home or Draw' : 'Away or Draw';
      confidence = 75;
    }

    reasoning = `H2H record: ${h2h.homeWins}W-${h2h.draws}D-${h2h.awayWins}L. ${primaryPick} based on historical performance.`;
  }

  return {
    teamQuality,
    h2h,
    homeScoringPattern,
    awayScoringPattern,
    recommendedMarket,
    primaryPick,
    reasoning,
    confidence,
    expectedValue
  };
}
