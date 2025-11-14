/**
 * SportyBet Nigeria Scraper
 * Fetches available games and leagues from SportyBet to filter our analysis
 *
 * NOTE: SportyBet uses JavaScript to load content dynamically.
 * This scraper provides the framework for filtering games.
 * For production use, consider:
 * 1. Using Puppeteer/Playwright for JavaScript rendering
 * 2. Reverse-engineering SportyBet's API endpoints
 * 3. Using a headless browser service
 *
 * Current implementation uses static HTML parsing as a starting point.
 * May need refinement based on SportyBet's actual HTML structure.
 */

import * as cheerio from 'cheerio';

export interface SportyBetGame {
  sport: string;
  league: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  matchTime: Date;
  marketId?: string;
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
 * Fetch available games from SportyBet Nigeria
 */
export async function fetchSportyBetGames(): Promise<SportyBetGame[]> {
  const games: SportyBetGame[] = [];

  try {
    console.log('🔍 Fetching available games from SportyBet Nigeria...');

    // SportyBet uses a sports API endpoint that returns JSON
    // We'll fetch the main sports page and extract the data
    const baseUrl = 'https://www.sportybet.com/ng/sport/football/today';

    const response = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch SportyBet: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // SportyBet typically embeds game data in script tags or data attributes
    // We'll extract from the HTML structure

    // Try to find match containers
    $('.m-event, .event-item, [class*="match"]').each((_, element) => {
      try {
        const $el = $(element);

        // Extract team names (common patterns)
        const homeTeam = $el.find('[class*="home"], .team-home, .team:first').text().trim();
        const awayTeam = $el.find('[class*="away"], .team-away, .team:last').text().trim();

        // Extract league info
        const league = $el.closest('[class*="league"], [class*="competition"]')
          .find('[class*="league-name"], [class*="tournament"]')
          .first()
          .text()
          .trim();

        // Extract match time
        const timeStr = $el.find('[class*="time"], [class*="date"]').text().trim();

        if (homeTeam && awayTeam) {
          games.push({
            sport: 'Soccer',
            league: league || 'Unknown League',
            country: 'Nigeria', // Default to Nigeria since it's SportyBet NG
            homeTeam,
            awayTeam,
            matchTime: new Date(), // Will be parsed from timeStr
            marketId: $el.attr('data-market-id') || $el.attr('id'),
          });
        }
      } catch (err) {
        // Skip malformed entries
      }
    });

    console.log(`✅ Found ${games.length} games on SportyBet`);

  } catch (error) {
    console.error('❌ Error fetching SportyBet games:', error);
  }

  return games;
}

/**
 * Fetch available leagues from SportyBet
 */
export async function fetchSportyBetLeagues(): Promise<SportyBetLeague[]> {
  const leagues: SportyBetLeague[] = [];

  try {
    console.log('🔍 Fetching available leagues from SportyBet...');

    const sports = ['football', 'basketball', 'tennis', 'ice-hockey', 'american-football'];

    for (const sport of sports) {
      const url = `https://www.sportybet.com/ng/sport/${sport}/today`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract league information
      $('[class*="league"], [class*="tournament"], [class*="competition"]').each((_, element) => {
        const $el = $(element);
        const leagueName = $el.find('[class*="name"], [class*="title"]').first().text().trim();
        const matchCount = $el.find('.m-event, .event-item, [class*="match"]').length;

        if (leagueName && matchCount > 0) {
          leagues.push({
            sport: sport === 'football' ? 'Soccer' :
                   sport === 'ice-hockey' ? 'Ice Hockey' :
                   sport === 'american-football' ? 'American Football' :
                   sport.charAt(0).toUpperCase() + sport.slice(1),
            country: 'Various',
            leagueName,
            matchCount,
          });
        }
      });
    }

    console.log(`✅ Found ${leagues.length} active leagues on SportyBet`);

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
