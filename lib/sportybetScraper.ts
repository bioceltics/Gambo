/**
 * SportyBet Nigeria Scraper
 * Fetches available games and leagues from SportyBet to filter our analysis
 *
 * Uses SportyBet's official API endpoints discovered via network analysis:
 * - /api/ng/factsCenter/pcUpcomingEvents - Get upcoming games
 * - /api/ng/factsCenter/sportList - Get available sports
 * - /api/ng/factsCenter/popularAndSportList - Get leagues and tournaments
 */

export interface SportyBetOddsOutcome {
  id: string;
  odds: string;
  probability: string;
  isActive: number;
  desc: string;
  specifier?: string;
}

export interface SportyBetMarket {
  id: string;
  product: number;
  desc: string;
  status: number;
  group: string;
  groupId: string;
  marketGuide: string;
  title: string;
  name: string;
  favourite: number;
  outcomes: SportyBetOddsOutcome[];
}

export interface SportyBetGame {
  sport: string;
  league: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  matchTime: Date;
  marketId?: string;
  eventId?: string;
  gameId?: string;
  totalMarketSize?: number;
  markets?: SportyBetMarket[];
}

export interface SportyBetLeague {
  sport: string;
  country: string;
  leagueName: string;
  matchCount: number;
}

/**
 * Normalize team names for matching
 * Removes common variations and special characters
 */
function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/fc|cf|sc|ac|afc|utd|united/gi, '')
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Fetch available games from SportyBet Nigeria using official API
 */
export async function fetchSportyBetGames(): Promise<SportyBetGame[]> {
  const games: SportyBetGame[] = [];

  try {
    console.log('🔍 Fetching available games from SportyBet Nigeria API...');

    // Map sport IDs to sport names
    const sports = [
      { id: 'sr:sport:1', name: 'Soccer' },
      { id: 'sr:sport:2', name: 'Basketball' },
      { id: 'sr:sport:5', name: 'Tennis' },
      { id: 'sr:sport:4', name: 'Ice Hockey' },
      { id: 'sr:sport:16', name: 'American Football' },
    ];

    for (const sport of sports) {
      try {
        const timestamp = Date.now();
        const url = `https://www.sportybet.com/api/ng/factsCenter/pcUpcomingEvents?sportId=${encodeURIComponent(sport.id)}&marketId=1,18,10,29,11,26,36,14,60100&pageSize=100&pageNum=1&todayGames=true&timeline=15.9&_t=${timestamp}`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.sportybet.com/ng/',
            'Origin': 'https://www.sportybet.com',
          },
        });

        if (!response.ok) {
          console.log(`⚠️  ${sport.name}: API returned ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (data.bizCode === 10000 && data.data && data.data.tournaments) {
          const tournaments = data.data.tournaments;
          let sportEventCount = 0;

          for (const tournament of tournaments) {
            if (tournament.events && Array.isArray(tournament.events)) {
              for (const event of tournament.events) {
                games.push({
                  sport: sport.name,
                  league: tournament.name || 'Unknown League',
                  country: tournament.categoryName || event.sport?.category?.name || 'International',
                  homeTeam: event.homeTeamName || 'Home',
                  awayTeam: event.awayTeamName || 'Away',
                  matchTime: new Date(event.estimateStartTime || Date.now()),
                  marketId: event.eventId || event.gameId,
                  eventId: event.eventId,
                  gameId: event.gameId,
                  totalMarketSize: event.totalMarketSize || 0,
                  markets: event.markets || [],
                });
                sportEventCount++;
              }
            }
          }

          console.log(`   ✅ ${sport.name}: Found ${sportEventCount} games across ${tournaments.length} tournaments`);
        }
      } catch (error: any) {
        console.log(`   ⚠️  ${sport.name}: ${error.message}`);
      }

      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`✅ Total: Found ${games.length} games on SportyBet`);

  } catch (error) {
    console.error('❌ Error fetching SportyBet games:', error);
  }

  return games;
}

/**
 * Fetch available leagues from SportyBet using official API
 */
export async function fetchSportyBetLeagues(): Promise<SportyBetLeague[]> {
  const leagues: SportyBetLeague[] = [];

  try {
    console.log('🔍 Fetching available leagues from SportyBet API...');

    const timestamp = Date.now();
    const url = `https://www.sportybet.com/api/ng/factsCenter/sportList?productId=1&option=1&_t=${timestamp}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.sportybet.com/ng/',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  SportyBet leagues API returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (data.bizCode === 10000 && data.data) {
      const sportsList = data.data;

      for (const sport of sportsList) {
        leagues.push({
          sport: sport.name || 'Unknown Sport',
          country: 'Various',
          leagueName: sport.name || 'Unknown League',
          matchCount: sport.eventSize || 0,
        });
      }
    }

    console.log(`✅ Found ${leagues.length} active sports/leagues on SportyBet`);

  } catch (error) {
    console.error('❌ Error fetching SportyBet leagues:', error);
  }

  return leagues;
}

/**
 * Check if a fixture from BetsAPI exists on SportyBet
 */
export function isGameOnSportyBet(
  fixture: { homeTeam: string; awayTeam: string; leagueName: string },
  sportyBetGames: SportyBetGame[]
): boolean {
  const normalizedHome = normalizeTeamName(fixture.homeTeam);
  const normalizedAway = normalizeTeamName(fixture.awayTeam);

  return sportyBetGames.some(game => {
    const gameHome = normalizeTeamName(game.homeTeam);
    const gameAway = normalizeTeamName(game.awayTeam);

    // Check if teams match (allowing for minor variations)
    const teamsMatch =
      (gameHome.includes(normalizedHome) || normalizedHome.includes(gameHome)) &&
      (gameAway.includes(normalizedAway) || normalizedAway.includes(gameAway));

    return teamsMatch;
  });
}

/**
 * Check if a league is available on SportyBet
 */
export function isLeagueOnSportyBet(
  leagueName: string,
  sportyBetLeagues: SportyBetLeague[]
): boolean {
  const normalized = leagueName.toLowerCase().trim();

  return sportyBetLeagues.some(league => {
    const leagueNormalized = league.leagueName.toLowerCase().trim();
    return leagueNormalized.includes(normalized) || normalized.includes(leagueNormalized);
  });
}

/**
 * Get filtering statistics
 */
export function getFilteringStats(
  totalFixtures: number,
  filteredFixtures: number
): {
  total: number;
  filtered: number;
  removed: number;
  percentageReduction: number;
  apiRequestsSaved: number;
} {
  const removed = totalFixtures - filteredFixtures;
  const percentageReduction = totalFixtures > 0 ? (removed / totalFixtures) * 100 : 0;

  return {
    total: totalFixtures,
    filtered: filteredFixtures,
    removed,
    percentageReduction: Math.round(percentageReduction),
    apiRequestsSaved: removed, // Each fixture = 1 API request saved
  };
}
