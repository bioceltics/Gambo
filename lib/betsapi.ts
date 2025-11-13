// BetsAPI Integration for Comprehensive Global Sports Coverage
// Documentation: https://betsapi.com/docs/

const BETS_API_BASE = 'https://api.b365api.com/v3';

/**
 * Sport IDs in BetsAPI
 */
export const SPORT_IDS = {
  SOCCER: 1,
  BASKETBALL: 18,
  TENNIS: 13,
  ICE_HOCKEY: 17,
  AMERICAN_FOOTBALL: 16,
} as const;

/**
 * Unified fixture interface for all sports
 */
export interface BetsAPIFixture {
  id: string;
  sport: 'SOCCER' | 'BASKETBALL' | 'TENNIS' | 'HOCKEY' | 'FOOTBALL';
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueName: string;
  scheduledAt: Date;
  odds: {
    homeWin?: number;
    draw?: number;
    awayWin?: number;
    over?: number;
    under?: number;
    spread?: number;
    homeSpread?: number;
    awaySpread?: number;
    doubleChance?: {
      homeOrDraw?: number;
      awayOrDraw?: number;
    };
    overUnder?: {
      over?: number;
      under?: number;
      line?: number;
    };
    overUnderLines?: {
      [line: string]: {
        over?: number;
        under?: number;
      };
    };
    btts?: {
      yes?: number;
      no?: number;
    };
  };
  markets: string[];
  status: string;
  country?: string;
}

/**
 * Sample events across the full day instead of just taking first N
 * This ensures we get early AND late games for comprehensive coverage
 */
function sampleEventsAcrossDay(events: any[], maxSamples: number): any[] {
  if (events.length <= maxSamples) return events;

  // Group events by hour of day
  const eventsByHour = new Map<number, any[]>();
  events.forEach(event => {
    const eventTime = new Date(event.time * 1000);
    const hour = eventTime.getHours();
    if (!eventsByHour.has(hour)) {
      eventsByHour.set(hour, []);
    }
    eventsByHour.get(hour)!.push(event);
  });

  // Calculate how many samples per hour
  const hours = Array.from(eventsByHour.keys()).sort((a, b) => a - b);
  const samplesPerHour = Math.ceil(maxSamples / hours.length);

  // Sample from each hour
  const sampled: any[] = [];
  for (const hour of hours) {
    const hourEvents = eventsByHour.get(hour)!;
    // Take evenly distributed samples from this hour
    const step = Math.max(1, Math.floor(hourEvents.length / samplesPerHour));
    for (let i = 0; i < hourEvents.length && sampled.length < maxSamples; i += step) {
      sampled.push(hourEvents[i]);
    }
    if (sampled.length >= maxSamples) break;
  }

  return sampled;
}

/**
 * Fetch odds for a single event from BetsAPI
 * Supports all sports and multiple markets:
 * Soccer: 1_1 (H2H), 1_2 (Double Chance), 1_3 (O/U), 1_5 (BTTS)
 * Basketball: 18_1, Tennis: 13_1, Hockey: 17_1, Football: 16_1
 */
async function fetchEventOdds(eventId: string, apiToken: string): Promise<any> {
  try {
    const response = await fetch(
      `https://api.b365api.com/v2/event/odds/summary?token=${apiToken}&event_id=${eventId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.results) {
      return null;
    }

    // Get odds from first available bookmaker
    const bookmakers = Object.keys(data.results);
    for (const bookmaker of bookmakers) {
      const bookmakerData = data.results[bookmaker];

      if (!bookmakerData.odds?.start) continue;

      const result: any = {};

      // H2H/Moneyline markets (all sports)
      const h2hMarkets = ['1_1', '18_1', '13_1', '17_1', '16_1'];
      for (const marketId of h2hMarkets) {
        if (bookmakerData.odds.start[marketId]) {
          const oddsData = bookmakerData.odds.start[marketId];
          result.homeWin = parseFloat(oddsData.home_od) || undefined;
          result.draw = parseFloat(oddsData.draw_od) || undefined;
          result.awayWin = parseFloat(oddsData.away_od) || undefined;
          break;
        }
      }

      // Soccer-specific markets
      // Double Chance (1_2) - Note: BetsAPI format varies, some use handicap field
      if (bookmakerData.odds.start['1_2']) {
        const dc = bookmakerData.odds.start['1_2'];
        // Double Chance odds might be in home_od/away_od or structured differently
        result.doubleChance = {
          homeOrDraw: parseFloat(dc.home_od) || undefined,
          awayOrDraw: parseFloat(dc.away_od) || undefined,
        };
      }

      // Over/Under (1_3) - Fetch multiple lines (1.5, 2.5, 3.5)
      if (bookmakerData.odds.start['1_3']) {
        const ou = bookmakerData.odds.start['1_3'];
        const mainLine = parseFloat(ou.handicap) || 2.5;

        // Store the main line
        result.overUnder = {
          over: parseFloat(ou.over_od) || undefined,
          under: parseFloat(ou.under_od) || undefined,
          line: mainLine,
        };

        // Initialize overUnderLines object to store all available lines
        result.overUnderLines = {};
        result.overUnderLines[mainLine.toString()] = {
          over: parseFloat(ou.over_od) || undefined,
          under: parseFloat(ou.under_od) || undefined,
        };

        // Check for additional O/U lines in the odds data
        // BetsAPI sometimes provides multiple lines as array or object
        if (Array.isArray(ou)) {
          ou.forEach((lineData: any) => {
            const line = parseFloat(lineData.handicap);
            if (line && (line === 1.5 || line === 2.5 || line === 3.5)) {
              result.overUnderLines[line.toString()] = {
                over: parseFloat(lineData.over_od) || undefined,
                under: parseFloat(lineData.under_od) || undefined,
              };
            }
          });
        }
      }

      // Also check for alternative O/U markets with specific lines
      // Some bookmakers provide 1_3 variations for different lines
      const ouMarkets = Object.keys(bookmakerData.odds.start).filter(k => k.startsWith('1_3'));
      ouMarkets.forEach(marketKey => {
        const ouData = bookmakerData.odds.start[marketKey];
        const line = parseFloat(ouData.handicap);
        if (line && (line === 1.5 || line === 2.5 || line === 3.5)) {
          if (!result.overUnderLines) result.overUnderLines = {};
          result.overUnderLines[line.toString()] = {
            over: parseFloat(ouData.over_od) || undefined,
            under: parseFloat(ouData.under_od) || undefined,
          };
        }
      });

      // BTTS (1_5)
      if (bookmakerData.odds.start['1_5']) {
        const btts = bookmakerData.odds.start['1_5'];
        result.btts = {
          yes: parseFloat(btts.home_od) || undefined,
          no: parseFloat(btts.away_od) || undefined,
        };
      }

      // Return if we found at least H2H odds
      if (result.homeWin || result.awayWin) {
        return result;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch all soccer fixtures from ALL leagues globally
 * Includes: EPL, Championship, League One, League Two, all European leagues,
 * Saudi Pro League, Saudi 2nd Division, all African, Asian, American leagues
 */
export async function fetchAllSoccerFixtures(
  apiToken: string,
  startDate: Date,
  endDate: Date
): Promise<BetsAPIFixture[]> {
  const fixtures: BetsAPIFixture[] = [];

  try {
    console.log('🌍 Fetching ALL soccer fixtures globally from BetsAPI...');

    // Format dates to Unix timestamp
    const dayFrom = Math.floor(startDate.getTime() / 1000);
    const dayTo = Math.floor(endDate.getTime() / 1000);

    // COMPREHENSIVE FETCH: Paginate through ALL available games
    // BetsAPI returns max 50 per page, so we need to fetch multiple pages
    let allEvents: any[] = [];
    let page = 1;
    const maxPages = 10; // Fetch up to 500 games (10 pages * 50 per page) to avoid rate limits

    console.log(`   Fetching ALL pages of soccer fixtures (no limits)...`);

    while (page <= maxPages) {
      const response = await fetch(
        `${BETS_API_BASE}/events/upcoming?sport_id=${SPORT_IDS.SOCCER}&token=${apiToken}&day=${Math.floor(Date.now() / 1000 / 86400)}&skip_esports=true&page=${page}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (page === 1) {
          throw new Error(`BetsAPI error: ${response.status} ${response.statusText}`);
        }
        break; // No more pages
      }

      const data = await response.json();

      if (!data.success) {
        if (page === 1) {
          throw new Error(`BetsAPI failed: ${data.error || 'Unknown error'}`);
        }
        break;
      }

      const pageEvents = data.results || [];
      if (pageEvents.length === 0) {
        break; // No more events
      }

      allEvents = allEvents.concat(pageEvents);
      console.log(`   Page ${page}: Found ${pageEvents.length} fixtures (Total: ${allEvents.length})`);

      // If we got less than 50, we're on the last page
      if (pageEvents.length < 50) {
        break;
      }

      page++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const events = allEvents;
    console.log(`   ✅ Fetched ${events.length} soccer fixtures from ${page} pages`);

    // Filter out esports and only process real soccer leagues
    const realSoccerEvents = events.filter((event: any) => {
      const leagueName = event.league?.name?.toLowerCase() || '';
      const countryCode = event.league?.cc?.toLowerCase() || '';
      return !leagueName.includes('esport') &&
             !leagueName.includes('esoccer') &&
             !leagueName.includes('cyber') &&
             !leagueName.includes('bahrain') &&  // Exclude Bahrain league
             countryCode !== 'bh' &&  // Exclude Bahrain country code
             event.league?.cc !== null; // Only leagues with country codes
    });

    console.log(`   Filtered to ${realSoccerEvents.length} real soccer fixtures (excluding esports)`);

    // COMPREHENSIVE ANALYSIS: Process ALL games, no sampling limits
    // Quality over speed - we want the BEST picks, not the fastest picks
    const eventsToProcess = realSoccerEvents;
    console.log(`   Processing ALL ${eventsToProcess.length} fixtures for comprehensive analysis...`);

    let processedCount = 0;
    for (const event of eventsToProcess) {
      try {
        // Fetch odds for this specific event
        const odds = await fetchEventOdds(event.id, apiToken);

        // Only add fixtures that have REAL valid odds AND competitive matchups
        // Exclude heavily mismatched games (odds below 1.20 indicate one team is overwhelmingly favored)
        const hasRealOdds = odds &&
                           odds.homeWin !== undefined &&
                           odds.awayWin !== undefined &&
                           odds.homeWin >= 1.20 &&
                           odds.awayWin >= 1.20;

        if (hasRealOdds) {
          // Build markets array dynamically based on available odds
          const availableMarkets: string[] = ['1_1']; // Always have H2H
          if (odds.doubleChance) availableMarkets.push('1_2');
          if (odds.overUnder) availableMarkets.push('1_3');
          if (odds.btts) availableMarkets.push('1_5');

          fixtures.push({
            id: `betsapi-soccer-${event.id}`,
            sport: 'SOCCER',
            homeTeam: event.home?.name || 'Home Team',
            awayTeam: event.away?.name || 'Away Team',
            league: event.league?.name || 'Soccer League',
            leagueName: event.league?.name || 'Soccer League',
            scheduledAt: new Date(event.time * 1000),
            odds: {
              homeWin: odds.homeWin,
              draw: odds.draw,
              awayWin: odds.awayWin,
              doubleChance: odds.doubleChance,
              overUnder: odds.overUnder,
              overUnderLines: odds.overUnderLines,
              btts: odds.btts,
            },
            markets: availableMarkets,
            status: event.time_status || 'upcoming',
            country: event.league?.cc || undefined,
          });
          processedCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   Error processing fixture ${event.id}:`, error);
      }
    }

    console.log(`✅ Processed ${processedCount} soccer fixtures with real odds`);
    return fixtures;

  } catch (error: any) {
    console.error('❌ Error fetching soccer from BetsAPI:', error.message);
    return [];
  }
}

/**
 * Fetch all basketball fixtures from ALL leagues globally
 * Includes: NBA, NCAA, EuroLeague, all international leagues
 */
export async function fetchAllBasketballFixtures(
  apiToken: string,
  startDate: Date,
  endDate: Date
): Promise<BetsAPIFixture[]> {
  const fixtures: BetsAPIFixture[] = [];

  try {
    console.log('🏀 Fetching ALL basketball fixtures globally from BetsAPI...');

    const dayFrom = Math.floor(startDate.getTime() / 1000);

    // COMPREHENSIVE FETCH: Paginate through ALL available games
    // BetsAPI returns max 50 per page, so we need to fetch multiple pages
    let allEvents: any[] = [];
    let page = 1;
    const maxPages = 10; // Fetch up to 500 games (10 pages * 50 per page) to avoid rate limits

    console.log(`   Fetching ALL pages of basketball fixtures (no limits)...`);

    while (page <= maxPages) {
      const response = await fetch(
        `${BETS_API_BASE}/events/upcoming?sport_id=${SPORT_IDS.BASKETBALL}&token=${apiToken}&day=${dayFrom}&page=${page}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (page === 1) {
          throw new Error(`BetsAPI error: ${response.status} ${response.statusText}`);
        }
        break; // No more pages
      }

      const data = await response.json();

      if (!data.success) {
        if (page === 1) {
          throw new Error(`BetsAPI failed: ${data.error || 'Unknown error'}`);
        }
        break;
      }

      const pageEvents = data.results || [];
      if (pageEvents.length === 0) {
        break; // No more events
      }

      allEvents = allEvents.concat(pageEvents);
      console.log(`   Page ${page}: Found ${pageEvents.length} fixtures (Total: ${allEvents.length})`);

      // If we got less than 50, we're on the last page
      if (pageEvents.length < 50) {
        break;
      }

      page++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const events = allEvents;
    console.log(`   ✅ Fetched ${events.length} basketball fixtures from ${page} pages`);

    // Filter out esports/virtual/simulated basketball games
    const realBasketballEvents = events.filter((event: any) => {
      const homeName = event.home?.name?.toLowerCase() || '';
      const awayName = event.away?.name?.toLowerCase() || '';
      const leagueName = event.league?.name?.toLowerCase() || '';

      // Exclude games with parentheses (usually esports player tags like "Nuggets (HOGGY)")
      // Exclude virtual/cyber/esports leagues
      const isEsports = homeName.includes('(') || awayName.includes('(') ||
                       leagueName.includes('esport') ||
                       leagueName.includes('cyber') ||
                       leagueName.includes('virtual') ||
                       leagueName.includes('simulation');

      return !isEsports && event.league?.cc !== null;
    });

    console.log(`   Filtered to ${realBasketballEvents.length} real basketball fixtures (excluding esports)`);

    // COMPREHENSIVE ANALYSIS: Process ALL games, no sampling limits
    const eventsToProcess = realBasketballEvents;
    console.log(`   Processing ALL ${eventsToProcess.length} fixtures for comprehensive analysis...`);

    let processedCount = 0;
    for (const event of eventsToProcess) {
      try {
        // Fetch odds for this specific event
        const odds = await fetchEventOdds(event.id, apiToken);

        // Only add fixtures that have REAL valid odds AND competitive matchups
        // Exclude heavily mismatched games (odds below 1.20 indicate one team is overwhelmingly favored)
        const hasRealOdds = odds &&
                           odds.homeWin !== undefined &&
                           odds.awayWin !== undefined &&
                           odds.homeWin >= 1.20 &&
                           odds.awayWin >= 1.20;

        if (hasRealOdds) {
          // Build markets array dynamically based on available odds
          const availableMarkets: string[] = ['18_1']; // Basketball H2H
          if (odds.overUnder) availableMarkets.push('18_3'); // Basketball totals

          fixtures.push({
            id: `betsapi-basketball-${event.id}`,
            sport: 'BASKETBALL',
            homeTeam: event.home?.name || 'Home Team',
            awayTeam: event.away?.name || 'Away Team',
            league: event.league?.name || 'Basketball League',
            leagueName: event.league?.name || 'Basketball League',
            scheduledAt: new Date(event.time * 1000),
            odds: {
              homeWin: odds.homeWin,
              awayWin: odds.awayWin,
              overUnder: odds.overUnder,
            },
            markets: availableMarkets,
            status: event.time_status || 'upcoming',
            country: event.league?.cc || undefined,
          });
          processedCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   Error parsing basketball fixture ${event.id}:`, error);
      }
    }

    console.log(`✅ Processed ${processedCount} basketball fixtures with real odds`);
    return fixtures;

  } catch (error: any) {
    console.error('❌ Error fetching basketball from BetsAPI:', error.message);
    return [];
  }
}

/**
 * Fetch all tennis fixtures from ALL tournaments globally
 * Includes: ATP, WTA, Challengers, ITF
 */
export async function fetchAllTennisFixtures(
  apiToken: string,
  startDate: Date,
  endDate: Date
): Promise<BetsAPIFixture[]> {
  const fixtures: BetsAPIFixture[] = [];

  try {
    console.log('🎾 Fetching ALL tennis fixtures globally from BetsAPI...');

    const dayFrom = Math.floor(startDate.getTime() / 1000);

    // COMPREHENSIVE FETCH: Paginate through ALL available games
    // BetsAPI returns max 50 per page, so we need to fetch multiple pages
    let allEvents: any[] = [];
    let page = 1;
    const maxPages = 10; // Fetch up to 500 games (10 pages * 50 per page) to avoid rate limits

    console.log(`   Fetching ALL pages of tennis fixtures (no limits)...`);

    while (page <= maxPages) {
      const response = await fetch(
        `${BETS_API_BASE}/events/upcoming?sport_id=${SPORT_IDS.TENNIS}&token=${apiToken}&day=${dayFrom}&page=${page}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (page === 1) {
          throw new Error(`BetsAPI error: ${response.status} ${response.statusText}`);
        }
        break; // No more pages
      }

      const data = await response.json();

      if (!data.success) {
        if (page === 1) {
          throw new Error(`BetsAPI failed: ${data.error || 'Unknown error'}`);
        }
        break;
      }

      const pageEvents = data.results || [];
      if (pageEvents.length === 0) {
        break; // No more events
      }

      allEvents = allEvents.concat(pageEvents);
      console.log(`   Page ${page}: Found ${pageEvents.length} fixtures (Total: ${allEvents.length})`);

      // If we got less than 50, we're on the last page
      if (pageEvents.length < 50) {
        break;
      }

      page++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const events = allEvents;
    console.log(`   ✅ Fetched ${events.length} tennis fixtures from ${page} pages`);

    // Filter out esports/virtual tennis matches
    const realTennisEvents = events.filter((event: any) => {
      const homeName = event.home?.name?.toLowerCase() || '';
      const awayName = event.away?.name?.toLowerCase() || '';
      const leagueName = event.league?.name?.toLowerCase() || '';

      // Exclude games with parentheses (esports tags) or virtual/cyber leagues
      const isEsports = homeName.includes('(') || awayName.includes('(') ||
                       leagueName.includes('esport') ||
                       leagueName.includes('cyber') ||
                       leagueName.includes('virtual') ||
                       leagueName.includes('simulation');

      return !isEsports && event.league?.cc !== null;
    });

    console.log(`   Filtered to ${realTennisEvents.length} real tennis fixtures (excluding esports)`);

    // COMPREHENSIVE ANALYSIS: Process ALL games, no sampling limits
    const eventsToProcess = realTennisEvents;
    console.log(`   Processing ALL ${eventsToProcess.length} fixtures for comprehensive analysis...`);

    let processedCount = 0;
    for (const event of eventsToProcess) {
      try {
        // Fetch odds for this specific event
        const odds = await fetchEventOdds(event.id, apiToken);

        // Only add fixtures that have REAL valid odds AND competitive matchups
        // Exclude heavily mismatched games (odds below 1.20 indicate one team is overwhelmingly favored)
        const hasRealOdds = odds &&
                           odds.homeWin !== undefined &&
                           odds.awayWin !== undefined &&
                           odds.homeWin >= 1.20 &&
                           odds.awayWin >= 1.20;

        if (hasRealOdds) {
          // Build markets array dynamically based on available odds
          const availableMarkets: string[] = ['13_1']; // Tennis H2H
          if (odds.overUnder) availableMarkets.push('13_3'); // Tennis totals (sets/games)

          fixtures.push({
            id: `betsapi-tennis-${event.id}`,
            sport: 'TENNIS',
            homeTeam: event.home?.name || 'Player 1',
            awayTeam: event.away?.name || 'Player 2',
            league: event.league?.name || 'Tennis Tournament',
            leagueName: event.league?.name || 'Tennis Tournament',
            scheduledAt: new Date(event.time * 1000),
            odds: {
              homeWin: odds.homeWin,
              awayWin: odds.awayWin,
              overUnder: odds.overUnder,
            },
            markets: availableMarkets,
            status: event.time_status || 'upcoming',
            country: event.league?.cc || undefined,
          });
          processedCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   Error parsing tennis fixture ${event.id}:`, error);
      }
    }

    console.log(`✅ Processed ${processedCount} tennis fixtures with real odds`);
    return fixtures;

  } catch (error: any) {
    console.error('❌ Error fetching tennis from BetsAPI:', error.message);
    return [];
  }
}

/**
 * Fetch all ice hockey fixtures from ALL leagues globally
 * Includes: NHL, KHL, European leagues, minor leagues
 */
export async function fetchAllHockeyFixtures(
  apiToken: string,
  startDate: Date,
  endDate: Date
): Promise<BetsAPIFixture[]> {
  const fixtures: BetsAPIFixture[] = [];

  try {
    console.log('🏒 Fetching ALL hockey fixtures globally from BetsAPI...');

    const dayFrom = Math.floor(startDate.getTime() / 1000);

    // COMPREHENSIVE FETCH: Paginate through ALL available games
    // BetsAPI returns max 50 per page, so we need to fetch multiple pages
    let allEvents: any[] = [];
    let page = 1;
    const maxPages = 10; // Fetch up to 500 games (10 pages * 50 per page) to avoid rate limits

    console.log(`   Fetching ALL pages of hockey fixtures (no limits)...`);

    while (page <= maxPages) {
      const response = await fetch(
        `${BETS_API_BASE}/events/upcoming?sport_id=${SPORT_IDS.ICE_HOCKEY}&token=${apiToken}&day=${dayFrom}&page=${page}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (page === 1) {
          throw new Error(`BetsAPI error: ${response.status} ${response.statusText}`);
        }
        break; // No more pages
      }

      const data = await response.json();

      if (!data.success) {
        if (page === 1) {
          throw new Error(`BetsAPI failed: ${data.error || 'Unknown error'}`);
        }
        break;
      }

      const pageEvents = data.results || [];
      if (pageEvents.length === 0) {
        break; // No more events
      }

      allEvents = allEvents.concat(pageEvents);
      console.log(`   Page ${page}: Found ${pageEvents.length} fixtures (Total: ${allEvents.length})`);

      // If we got less than 50, we're on the last page
      if (pageEvents.length < 50) {
        break;
      }

      page++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const events = allEvents;
    console.log(`   ✅ Fetched ${events.length} hockey fixtures from ${page} pages`);

    // Filter out esports/virtual hockey games
    const realHockeyEvents = events.filter((event: any) => {
      const homeName = event.home?.name?.toLowerCase() || '';
      const awayName = event.away?.name?.toLowerCase() || '';
      const leagueName = event.league?.name?.toLowerCase() || '';

      // Exclude games with parentheses (esports tags) or virtual/cyber leagues
      const isEsports = homeName.includes('(') || awayName.includes('(') ||
                       leagueName.includes('esport') ||
                       leagueName.includes('cyber') ||
                       leagueName.includes('virtual') ||
                       leagueName.includes('simulation');

      return !isEsports && event.league?.cc !== null;
    });

    console.log(`   Filtered to ${realHockeyEvents.length} real hockey fixtures (excluding esports)`);

    // COMPREHENSIVE ANALYSIS: Process ALL games, no sampling limits
    const eventsToProcess = realHockeyEvents;
    console.log(`   Processing ALL ${eventsToProcess.length} fixtures for comprehensive analysis...`);

    let processedCount = 0;
    for (const event of eventsToProcess) {
      try {
        // Fetch odds for this specific event
        const odds = await fetchEventOdds(event.id, apiToken);

        // Only add fixtures that have REAL valid odds AND competitive matchups
        // Exclude heavily mismatched games (odds below 1.20 indicate one team is overwhelmingly favored)
        const hasRealOdds = odds &&
                           odds.homeWin !== undefined &&
                           odds.awayWin !== undefined &&
                           odds.homeWin >= 1.20 &&
                           odds.awayWin >= 1.20;

        if (hasRealOdds) {
          // Build markets array dynamically based on available odds
          const availableMarkets: string[] = ['17_1']; // Hockey H2H
          if (odds.overUnder) availableMarkets.push('17_3'); // Hockey totals

          fixtures.push({
            id: `betsapi-hockey-${event.id}`,
            sport: 'HOCKEY',
            homeTeam: event.home?.name || 'Home Team',
            awayTeam: event.away?.name || 'Away Team',
            league: event.league?.name || 'Hockey League',
            leagueName: event.league?.name || 'Hockey League',
            scheduledAt: new Date(event.time * 1000),
            odds: {
              homeWin: odds.homeWin,
              draw: odds.draw,
              awayWin: odds.awayWin,
              overUnder: odds.overUnder,
            },
            markets: availableMarkets,
            status: event.time_status || 'upcoming',
            country: event.league?.cc || undefined,
          });
          processedCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   Error parsing hockey fixture ${event.id}:`, error);
      }
    }

    console.log(`✅ Processed ${processedCount} hockey fixtures with real odds`);
    return fixtures;

  } catch (error: any) {
    console.error('❌ Error fetching hockey from BetsAPI:', error.message);
    return [];
  }
}

/**
 * Fetch all American football fixtures from ALL leagues globally
 * Includes: NFL, NCAA, CFL, XFL
 */
export async function fetchAllFootballFixtures(
  apiToken: string,
  startDate: Date,
  endDate: Date
): Promise<BetsAPIFixture[]> {
  const fixtures: BetsAPIFixture[] = [];

  try {
    console.log('🏈 Fetching ALL football fixtures globally from BetsAPI...');

    const dayFrom = Math.floor(startDate.getTime() / 1000);

    // COMPREHENSIVE FETCH: Paginate through ALL available games
    // BetsAPI returns max 50 per page, so we need to fetch multiple pages
    let allEvents: any[] = [];
    let page = 1;
    const maxPages = 10; // Fetch up to 500 games (10 pages * 50 per page) to avoid rate limits

    console.log(`   Fetching ALL pages of football fixtures (no limits)...`);

    while (page <= maxPages) {
      const response = await fetch(
        `${BETS_API_BASE}/events/upcoming?sport_id=${SPORT_IDS.AMERICAN_FOOTBALL}&token=${apiToken}&day=${dayFrom}&page=${page}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (page === 1) {
          throw new Error(`BetsAPI error: ${response.status} ${response.statusText}`);
        }
        break; // No more pages
      }

      const data = await response.json();

      if (!data.success) {
        if (page === 1) {
          throw new Error(`BetsAPI failed: ${data.error || 'Unknown error'}`);
        }
        break;
      }

      const pageEvents = data.results || [];
      if (pageEvents.length === 0) {
        break; // No more events
      }

      allEvents = allEvents.concat(pageEvents);
      console.log(`   Page ${page}: Found ${pageEvents.length} fixtures (Total: ${allEvents.length})`);

      // If we got less than 50, we're on the last page
      if (pageEvents.length < 50) {
        break;
      }

      page++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const events = allEvents;
    console.log(`   ✅ Fetched ${events.length} football fixtures from ${page} pages`);

    // Filter out esports/virtual football games
    const realFootballEvents = events.filter((event: any) => {
      const homeName = event.home?.name?.toLowerCase() || '';
      const awayName = event.away?.name?.toLowerCase() || '';
      const leagueName = event.league?.name?.toLowerCase() || '';

      // Exclude games with parentheses (esports tags) or virtual/cyber leagues
      const isEsports = homeName.includes('(') || awayName.includes('(') ||
                       leagueName.includes('esport') ||
                       leagueName.includes('cyber') ||
                       leagueName.includes('virtual') ||
                       leagueName.includes('simulation');

      return !isEsports && event.league?.cc !== null;
    });

    console.log(`   Filtered to ${realFootballEvents.length} real football fixtures (excluding esports)`);

    // COMPREHENSIVE ANALYSIS: Process ALL games, no sampling limits
    const eventsToProcess = realFootballEvents;
    console.log(`   Processing ALL ${eventsToProcess.length} fixtures for comprehensive analysis...`);

    let processedCount = 0;
    for (const event of eventsToProcess) {
      try {
        // Fetch odds for this specific event
        const odds = await fetchEventOdds(event.id, apiToken);

        // Only add fixtures that have REAL valid odds AND competitive matchups
        // Exclude heavily mismatched games (odds below 1.20 indicate one team is overwhelmingly favored)
        const hasRealOdds = odds &&
                           odds.homeWin !== undefined &&
                           odds.awayWin !== undefined &&
                           odds.homeWin >= 1.20 &&
                           odds.awayWin >= 1.20;

        if (hasRealOdds) {
          // Build markets array dynamically based on available odds
          const availableMarkets: string[] = ['16_1']; // Football H2H
          if (odds.overUnder) availableMarkets.push('16_3'); // Football totals

          fixtures.push({
            id: `betsapi-football-${event.id}`,
            sport: 'FOOTBALL',
            homeTeam: event.home?.name || 'Home Team',
            awayTeam: event.away?.name || 'Away Team',
            league: event.league?.name || 'Football League',
            leagueName: event.league?.name || 'Football League',
            scheduledAt: new Date(event.time * 1000),
            odds: {
              homeWin: odds.homeWin,
              draw: odds.draw,
              awayWin: odds.awayWin,
              overUnder: odds.overUnder,
            },
            markets: availableMarkets,
            status: event.time_status || 'upcoming',
            country: event.league?.cc || undefined,
          });
          processedCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`   Error parsing football fixture ${event.id}:`, error);
      }
    }

    console.log(`✅ Processed ${processedCount} football fixtures with real odds`);
    return fixtures;

  } catch (error: any) {
    console.error('❌ Error fetching football from BetsAPI:', error.message);
    return [];
  }
}

/**
 * Fetch detailed event information including match events (goals, cards, etc.)
 */
export async function fetchEventDetails(
  apiToken: string,
  eventId: string
): Promise<any | null> {
  try {
    const response = await fetch(
      `${BETS_API_BASE}/event/view?token=${apiToken}&event_id=${eventId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.results || data.results.length === 0) {
      return null;
    }

    return data.results[0];
  } catch (error) {
    return null;
  }
}

/**
 * Fetch live scores for a specific sport (returns raw event data with all details)
 */
export async function fetchLiveScores(
  apiToken: string,
  sportId: number
): Promise<any[]> {
  try {
    const url = `${BETS_API_BASE}/events/inplay?sport_id=${sportId}&token=${apiToken}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`BetsAPI inplay fetch failed (sport ${sportId}): ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    if (!data.success) {
      if (data.error === 'TOO_MANY_REQUESTS') {
        console.error(`⚠️  BetsAPI RATE LIMIT EXCEEDED (sport ${sportId})`);
        console.error(`   Error: ${data.error_detail || 'Too many requests'}`);
        console.error(`   Visit https://betsapi.com/mm/pricing_table to upgrade`);
      } else {
        console.log(`BetsAPI inplay unsuccessful (sport ${sportId}):`, data.error || 'Unknown error');
      }
      return [];
    }

    // Return raw events with all details (scores, stats, timer, etc.)
    const results = data.results || [];
    console.log(`BetsAPI inplay (sport ${sportId}): ${results.length} events`);
    return results;
  } catch (error: any) {
    console.error(`BetsAPI inplay error (sport ${sportId}):`, error.message);
    return [];
  }
}

/**
 * Helper function to detect if a league/event is a real physical sport
 * Filters out eSports, virtual sports, and cyber sports
 */
function isRealSport(leagueName: string): boolean {
  if (!leagueName) return true; // If no league name, allow it through

  const lower = leagueName.toLowerCase();
  const excludedKeywords = [
    'esoccer', 'ebasketball', 'efootball', 'etennis', 'ehockey',
    'cyber', 'virtual', 'esports', 'e-sports',
    'simulated', 'fifa', 'nba2k', 'pes',
    'bahrain'  // Exclude Bahrain leagues
  ];

  // Return false if any excluded keyword is found
  return !excludedKeywords.some(keyword => lower.includes(keyword));
}

/**
 * Fetch ended/finished games for a specific sport
 */
export async function fetchEndedGames(
  apiToken: string,
  sportId: number
): Promise<any[]> {
  try {
    const response = await fetch(
      `${BETS_API_BASE}/events/ended?sport_id=${sportId}&token=${apiToken}&day=${Math.floor(Date.now() / 1000 / 86400)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.success) {
      return [];
    }

    // Filter out eSports and virtual sports
    const events = data.results || [];
    const filteredEvents = events.filter((event: any) => {
      const leagueName = event.league?.name || event.league_name || '';
      return isRealSport(leagueName);
    });

    return filteredEvents;
  } catch (error) {
    return [];
  }
}

/**
 * Fetch live scores for all sports from BetsAPI with detailed event information
 */
export async function fetchAllLiveScores(tokens: {
  soccer?: string;
  basketball?: string;
  tennis?: string;
  hockey?: string;
  football?: string;
}): Promise<any[]> {
  const allEvents: any[] = [];

  // Fetch live scores for each sport in parallel
  const promises: { token: string; sportId: number }[] = [];

  if (tokens.soccer) {
    promises.push({ token: tokens.soccer, sportId: SPORT_IDS.SOCCER });
  }
  if (tokens.basketball) {
    promises.push({ token: tokens.basketball, sportId: SPORT_IDS.BASKETBALL });
  }
  if (tokens.tennis) {
    promises.push({ token: tokens.tennis, sportId: SPORT_IDS.TENNIS });
  }
  if (tokens.hockey) {
    promises.push({ token: tokens.hockey, sportId: SPORT_IDS.ICE_HOCKEY });
  }
  if (tokens.football) {
    promises.push({ token: tokens.football, sportId: SPORT_IDS.AMERICAN_FOOTBALL });
  }

  // Fetch all live events first
  const liveEventsPromises = promises.map(({ token, sportId }) =>
    fetchLiveScores(token, sportId)
  );

  const results = await Promise.all(liveEventsPromises);
  const flatEvents = results.flat();

  // Filter out eSports and virtual sports before fetching details
  const realSportEvents = flatEvents.filter((event: any) => {
    const leagueName = event.league?.name || event.league_name || '';
    return isRealSport(leagueName);
  });

  // For each event, fetch detailed information including match events (goals, cards, etc.)
  // Show all live events from all sports (no limit)
  const detailedEventsPromises = realSportEvents.map(async (event) => {
    // Find the appropriate token for this sport
    const sportToken = promises.find(p => p.sportId.toString() === event.sport_id)?.token;

    if (!sportToken) return event;

    const detailedEvent = await fetchEventDetails(sportToken, event.id);

    // Merge detailed event data with basic event data
    if (detailedEvent) {
      return {
        ...event,
        events: detailedEvent.events || [],
        has_lineup: detailedEvent.has_lineup || 0
      };
    }

    return event;
  });

  const detailedEvents = await Promise.all(detailedEventsPromises);
  allEvents.push(...detailedEvents);

  return allEvents;
}

/**
 * Fetch all ended/finished games from all sports
 */
export async function fetchAllEndedGames(tokens: {
  soccer?: string;
  basketball?: string;
  tennis?: string;
  hockey?: string;
  football?: string;
}): Promise<any[]> {
  const allEvents: any[] = [];

  // Fetch ended games for each sport in parallel
  const promises: { token: string; sportId: number }[] = [];

  if (tokens.soccer) {
    promises.push({ token: tokens.soccer, sportId: SPORT_IDS.SOCCER });
  }
  if (tokens.basketball) {
    promises.push({ token: tokens.basketball, sportId: SPORT_IDS.BASKETBALL });
  }
  if (tokens.tennis) {
    promises.push({ token: tokens.tennis, sportId: SPORT_IDS.TENNIS });
  }
  if (tokens.hockey) {
    promises.push({ token: tokens.hockey, sportId: SPORT_IDS.ICE_HOCKEY });
  }
  if (tokens.football) {
    promises.push({ token: tokens.football, sportId: SPORT_IDS.AMERICAN_FOOTBALL });
  }

  const endedEventsPromises = promises.map(({ token, sportId }) =>
    fetchEndedGames(token, sportId)
  );

  const results = await Promise.all(endedEventsPromises);
  const flatEvents = results.flat();

  // Filter out eSports and virtual sports (extra safety check)
  const realSportEvents = flatEvents.filter((event: any) => {
    const leagueName = event.league?.name || event.league_name || '';
    return isRealSport(leagueName);
  });

  allEvents.push(...realSportEvents);

  return allEvents;
}
