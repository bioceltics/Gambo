import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchSportMonksFixtures } from '@/lib/sportmonks';
import { fetchAllLiveScores } from '@/lib/betsapi';
import { cache } from '@/lib/cache';

// Sport API configurations
interface SportConfig {
  name: string;
  baseUrl: string;
  sportType: 'SOCCER' | 'BASKETBALL' | 'HOCKEY' | 'FOOTBALL';
  endpoint: string;
}

const SPORT_CONFIGS: SportConfig[] = [
  // Soccer is now fetched from SportMonks API for enhanced data (odds, predictions, stats)
  // Keeping this config as fallback in case SportMonks API is unavailable
  // {
  //   name: 'Football/Soccer',
  //   baseUrl: 'https://sportapi7.p.rapidapi.com',
  //   sportType: 'SOCCER',
  //   endpoint: 'api/v1/sport/football/events/live'
  // },
  {
    name: 'Basketball',
    baseUrl: 'https://sportapi7.p.rapidapi.com',
    sportType: 'BASKETBALL',
    endpoint: 'api/v1/sport/basketball/events/live'
  },
  {
    name: 'Hockey',
    baseUrl: 'https://sportapi7.p.rapidapi.com',
    sportType: 'HOCKEY',
    endpoint: 'api/v1/sport/ice-hockey/events/live'
  },
  {
    name: 'American Football',
    baseUrl: 'https://sportapi7.p.rapidapi.com',
    sportType: 'FOOTBALL',
    endpoint: 'api/v1/sport/american-football/events/live'
  }
];

// Fetch fixtures for a specific sport using sportapi7
async function fetchSportFixtures(config: SportConfig, API_KEY: string) {
  try {
    console.log(`Fetching ${config.name} data from sportapi7...`);

    // Fetch live events from sportapi7
    const response = await fetch(`${config.baseUrl}/${config.endpoint}`, {
      headers: {
        'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
        'x-rapidapi-key': API_KEY
      },
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      console.error(`${config.name} API error:`, response.status);
      return [];
    }

    const data = await response.json();
    const events = data.events || [];

    console.log(`${config.name} - Events fetched:`, events.length);

    // Transform sportapi7 events to unified format
    return events.map((event: any) => {
      // Determine status based on sportapi7 status codes
      // Common codes: 6 (1st half), 7 (2nd half), 31 (Halftime), 100 (Finished), 0 (Not started)
      const statusCode = event.status?.code;
      const statusType = event.status?.type; // "finished", "inprogress", "notstarted"

      let status = 'UPCOMING';
      let currentPeriod = null;
      let matchMinute = null;

      if (statusType === 'inprogress') {
        status = 'LIVE';

        // Extract match time (minutes)
        matchMinute = event.time?.currentPeriodStartTimestamp
          ? Math.floor((Date.now() / 1000 - event.time.currentPeriodStartTimestamp) / 60)
          : null;

        // Calculate current period based on status code and sport
        if (config.sportType === 'SOCCER') {
          let periodName = '';
          if (statusCode === 6) periodName = 'First Half';
          else if (statusCode === 7) periodName = 'Second Half';
          else if (statusCode === 31) periodName = 'Halftime';
          else if (statusCode === 41) periodName = 'Extra Time';
          else periodName = 'LIVE';

          // Format with minute if available
          if (matchMinute !== null && periodName !== 'Halftime') {
            currentPeriod = `${periodName} - ${matchMinute}'`;
          } else {
            currentPeriod = periodName;
          }
        } else if (config.sportType === 'BASKETBALL') {
          let periodName = '';
          if (statusCode === 14) periodName = 'Q1';
          else if (statusCode === 15) periodName = 'Q2';
          else if (statusCode === 16) periodName = 'Q3';
          else if (statusCode === 17) periodName = 'Q4';
          else periodName = 'LIVE';

          // Format with minute if available
          if (matchMinute !== null && periodName !== 'LIVE') {
            currentPeriod = `${periodName} - ${matchMinute}'`;
          } else {
            currentPeriod = periodName;
          }
        } else if (config.sportType === 'HOCKEY') {
          let periodName = '';
          if (statusCode === 14) periodName = 'P1';
          else if (statusCode === 15) periodName = 'P2';
          else if (statusCode === 16) periodName = 'P3';
          else periodName = 'LIVE';

          // Format with minute if available
          if (matchMinute !== null && periodName !== 'LIVE') {
            currentPeriod = `${periodName} - ${matchMinute}'`;
          } else {
            currentPeriod = periodName;
          }
        } else if (config.sportType === 'FOOTBALL') {
          let periodName = '';
          if (statusCode === 14) periodName = 'Q1';
          else if (statusCode === 15) periodName = 'Q2';
          else if (statusCode === 16) periodName = 'Q3';
          else if (statusCode === 17) periodName = 'Q4';
          else periodName = 'LIVE';

          // Format with minute if available
          if (matchMinute !== null && periodName !== 'LIVE') {
            currentPeriod = `${periodName} - ${matchMinute}'`;
          } else {
            currentPeriod = periodName;
          }
        }
      } else if (statusType === 'finished') {
        status = 'FINISHED';
        currentPeriod = 'FT';
      } else if (statusType === 'notstarted') {
        status = 'UPCOMING';
      }

      // Extract scores
      const homeScore = event.homeScore?.current ?? event.homeScore?.display ?? null;
      const awayScore = event.awayScore?.current ?? event.awayScore?.display ?? null;

      // Extract team names
      const homeTeam = event.homeTeam?.name || 'Home';
      const awayTeam = event.awayTeam?.name || 'Away';

      // Extract league/tournament info
      const league = event.tournament?.name || event.tournament?.uniqueTournament?.name || 'League';

      // Extract scheduled time
      const scheduledAt = event.startTimestamp ? new Date(event.startTimestamp * 1000).toISOString() : null;

      // For soccer, try to extract stats if available
      let liveStats = null;
      if (status === 'LIVE' && config.sportType === 'SOCCER' && event.statistics) {
        // sportapi7 may provide statistics in a different format
        // We'll handle this if the data is available
        liveStats = null; // Placeholder for now
      }

      return {
        id: `${config.sportType.toLowerCase()}-${event.id}`,
        sport: config.sportType,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        status,
        currentPeriod,
        matchMinute,
        league,
        scheduledAt,
        liveStats,
        events: {
          goals: [],
          cards: [],
          substitutions: []
        },
        inBundle: false,
        eventId: event.id // Store event ID for fetching detailed incidents
      };
    });

    // For soccer, fetch detailed incidents for live and finished matches
    if (config.sportType === 'SOCCER') {
      const eventsWithIncidents = await Promise.all(
        events.map(async (event: any) => {
          if (event.status === 'LIVE' || event.status === 'FINISHED') {
            try {
              const incidentsResponse = await fetch(
                `${config.baseUrl}/api/v1/event/${event.eventId}/incidents`,
                {
                  headers: {
                    'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
                    'x-rapidapi-key': API_KEY
                  },
                  next: { revalidate: 30 }
                }
              );

              if (incidentsResponse.ok) {
                const incidentsData = await incidentsResponse.json();
                const incidents = incidentsData.incidents || [];

                // Extract goals
                const goals = incidents
                  .filter((inc: any) => inc.incidentType === 'goal')
                  .map((inc: any) => ({
                    player: inc.player?.name || 'Unknown',
                    assist: inc.assist?.name || null,
                    team: inc.isHome ? event.homeTeam : event.awayTeam,
                    time: inc.time || 0,
                    extraTime: inc.addedTime && inc.addedTime !== 999 ? inc.addedTime : null
                  }));

                // Extract cards
                const cards = incidents
                  .filter((inc: any) => inc.incidentType === 'card')
                  .map((inc: any) => ({
                    player: inc.player?.name || inc.playerName || 'Unknown',
                    team: inc.isHome ? event.homeTeam : event.awayTeam,
                    card: inc.incidentClass === 'yellow' ? 'Yellow Card' : 'Red Card',
                    time: inc.time || 0,
                    extraTime: inc.addedTime && inc.addedTime !== 999 ? inc.addedTime : null
                  }));

                // Extract substitutions
                const substitutions = incidents
                  .filter((inc: any) => inc.incidentType === 'substitution')
                  .map((inc: any) => ({
                    playerIn: inc.playerIn?.name || 'Unknown',
                    playerOut: inc.playerOut?.name || 'Unknown',
                    team: inc.isHome ? event.homeTeam : event.awayTeam,
                    time: inc.time || 0,
                    extraTime: inc.addedTime && inc.addedTime !== 999 ? inc.addedTime : null
                  }));

                return {
                  ...event,
                  events: {
                    goals,
                    cards,
                    substitutions
                  }
                };
              }
            } catch (error) {
              console.error(`Failed to fetch incidents for event ${event.eventId}:`, error);
            }
          }
          return event;
        })
      );

      return eventsWithIncidents;
    }

    return events;
  } catch (error) {
    console.error(`Error fetching ${config.name} fixtures:`, error);
    return [];
  }
}

/**
 * Parse match events from BetsAPI event data
 */
function parseMatchEvents(events: any[] = []) {
  const goals: any[] = [];
  const cards: any[] = [];
  const substitutions: any[] = [];

  events.forEach((event) => {
    const text = event.text || '';

    // Parse goals (e.g., "44' - 1st Goal -   (Hapoel Rishon Lezion) -")
    // Note: BetsAPI doesn't provide player names in basic event text, only team
    if (text.includes('Goal')) {
      const minuteMatch = text.match(/^(\d+)'/);
      const teamMatch = text.match(/\((.*?)\)/);

      // Check for extra time (e.g., "45+4'")
      const extraTimeMatch = text.match(/^(\d+)\+(\d+)'/);

      if (minuteMatch || extraTimeMatch) {
        const minute = extraTimeMatch ? parseInt(extraTimeMatch[1]) : parseInt(minuteMatch![1]);
        const extraTime = extraTimeMatch ? parseInt(extraTimeMatch[2]) : null;
        const team = teamMatch ? teamMatch[1] : 'Unknown';

        goals.push({
          player: team, // BetsAPI doesn't provide scorer name in event text
          assist: null, // BetsAPI doesn't provide assist info in event text
          team: team,
          time: minute,
          extraTime: extraTime
        });
      }
    }

    // Parse yellow cards (e.g., "2' ~ 1st Yellow Card ~  ~(Hapoel Hadera)")
    if (text.includes('Yellow Card')) {
      const minuteMatch = text.match(/^(\d+)'/);
      const teamMatch = text.match(/\((.*?)\)/);
      const extraTimeMatch = text.match(/^(\d+)\+(\d+)'/);

      if (minuteMatch || extraTimeMatch) {
        const minute = extraTimeMatch ? parseInt(extraTimeMatch[1]) : parseInt(minuteMatch![1]);
        const extraTime = extraTimeMatch ? parseInt(extraTimeMatch[2]) : null;
        const team = teamMatch ? teamMatch[1] : 'Unknown';

        cards.push({
          player: team, // BetsAPI doesn't provide player name in event text
          team: team,
          card: 'Yellow Card',
          time: minute,
          extraTime: extraTime
        });
      }
    }

    // Parse red cards (e.g., "39' ~ 1st Red Card ~  ~(Hapoel Rishon Lezion)")
    if (text.includes('Red Card')) {
      const minuteMatch = text.match(/^(\d+)'/);
      const teamMatch = text.match(/\((.*?)\)/);
      const extraTimeMatch = text.match(/^(\d+)\+(\d+)'/);

      if (minuteMatch || extraTimeMatch) {
        const minute = extraTimeMatch ? parseInt(extraTimeMatch[1]) : parseInt(minuteMatch![1]);
        const extraTime = extraTimeMatch ? parseInt(extraTimeMatch[2]) : null;
        const team = teamMatch ? teamMatch[1] : 'Unknown';

        cards.push({
          player: team, // BetsAPI doesn't provide player name in event text
          team: team,
          card: 'Red Card',
          time: minute,
          extraTime: extraTime
        });
      }
    }
  });

  return { goals, cards, substitutions };
}

/**
 * Transform BetsAPI fixture to live score format with full match details
 */
function transformBetsAPIToLiveScore(fixture: any): any {
  // Parse score from "ss" field (e.g., "0-2")
  const scoreString = fixture.ss || '';
  const scoreParts = scoreString.split('-');
  const homeScore = scoreParts[0] ? parseInt(scoreParts[0]) : null;
  const awayScore = scoreParts[1] ? parseInt(scoreParts[1]) : null;

  // Determine current period based on timer
  let currentPeriod = null;
  let matchMinute = null;
  let status = 'LIVE';

  if (fixture.timer) {
    const minute = fixture.timer.tm || 0;
    const periodType = fixture.timer.tt || '0';
    matchMinute = minute;

    // Soccer
    if (fixture.sport === 'SOCCER' || fixture.sport_id === '1') {
      if (periodType === '1') {
        if (minute < 45) currentPeriod = `First Half - ${minute}'`;
        else if (minute === 45) currentPeriod = 'Halftime';
        else currentPeriod = `First Half - ${minute}'`;
      } else if (periodType === '2') {
        currentPeriod = 'Halftime';
      } else if (periodType === '3') {
        currentPeriod = `Second Half - ${minute}'`;
      } else if (periodType === '4') {
        currentPeriod = `Extra Time - ${minute}'`;
      }
    }
    // Basketball
    else if (fixture.sport === 'BASKETBALL' || fixture.sport_id === '18') {
      if (periodType === '1') currentPeriod = `Q1 - ${minute}'`;
      else if (periodType === '2') currentPeriod = `Q2 - ${minute}'`;
      else if (periodType === '3') currentPeriod = `Q3 - ${minute}'`;
      else if (periodType === '4') currentPeriod = `Q4 - ${minute}'`;
      else currentPeriod = 'LIVE';
    }
    // Hockey
    else if (fixture.sport === 'HOCKEY' || fixture.sport_id === '17') {
      if (periodType === '1') currentPeriod = `P1 - ${minute}'`;
      else if (periodType === '2') currentPeriod = `P2 - ${minute}'`;
      else if (periodType === '3') currentPeriod = `P3 - ${minute}'`;
      else currentPeriod = 'LIVE';
    }
    // American Football
    else if (fixture.sport === 'FOOTBALL' || fixture.sport_id === '16') {
      if (periodType === '1') currentPeriod = `Q1 - ${minute}'`;
      else if (periodType === '2') currentPeriod = `Q2 - ${minute}'`;
      else if (periodType === '3') currentPeriod = `Q3 - ${minute}'`;
      else if (periodType === '4') currentPeriod = `Q4 - ${minute}'`;
      else currentPeriod = 'LIVE';
    }
  }

  // Check if match is finished
  if (fixture.time_status === '3') {
    status = 'FINISHED';
    currentPeriod = 'FT';
  } else if (fixture.time_status === '0') {
    status = 'UPCOMING';
    currentPeriod = null;
  }

  // Parse live stats from BetsAPI stats object
  const stats = fixture.stats || {};
  const liveStats = stats ? {
    possession: stats.possession_rt ? {
      home: parseInt(stats.possession_rt[0]) || 0,
      away: parseInt(stats.possession_rt[1]) || 0
    } : undefined,
    shots: stats.on_target ? {
      home: parseInt(stats.on_target[0]) || 0,
      away: parseInt(stats.on_target[1]) || 0
    } : undefined,
    corners: stats.corners ? {
      home: parseInt(stats.corners[0]) || 0,
      away: parseInt(stats.corners[1]) || 0
    } : undefined,
    fouls: stats.fouls ? {
      home: parseInt(stats.fouls[0]) || 0,
      away: parseInt(stats.fouls[1]) || 0
    } : undefined,
    yellowCards: stats.yellowcards ? {
      home: parseInt(stats.yellowcards[0]) || 0,
      away: parseInt(stats.yellowcards[1]) || 0
    } : undefined,
    redCards: stats.redcards ? {
      home: parseInt(stats.redcards[0]) || 0,
      away: parseInt(stats.redcards[1]) || 0
    } : undefined,
  } : null;

  // Map sport ID to sport type
  const sportMap: Record<string, string> = {
    '1': 'SOCCER',
    '18': 'BASKETBALL',
    '13': 'TENNIS',
    '17': 'HOCKEY',
    '16': 'FOOTBALL',
  };

  const sport = sportMap[fixture.sport_id] || 'SOCCER';

  // Parse match events if available
  const matchEvents = parseMatchEvents(fixture.events || []);

  return {
    id: `betsapi-${sport.toLowerCase()}-${fixture.id}`,
    sport,
    homeTeam: fixture.home?.name || 'Home Team',
    awayTeam: fixture.away?.name || 'Away Team',
    homeScore,
    awayScore,
    status,
    currentPeriod,
    matchMinute,
    league: fixture.league?.name || 'League',
    scheduledAt: fixture.time ? new Date(fixture.time * 1000).toISOString() : new Date().toISOString(),
    liveStats,
    inBundle: false,
    events: matchEvents
  };
}

// Main function to fetch all sports using hybrid approach
// Priority: BetsAPI (paid subscription) > SportMonks > sportapi7
async function fetchRealLiveScores() {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const SPORTMONKS_KEY = process.env.SPORTMONKS_API_KEY;

  // BetsAPI tokens (paid $90/month subscription)
  const BETSAPI_SOCCER = process.env.BETSAPI_SOCCER_TOKEN;
  const BETSAPI_BASKETBALL = process.env.BETSAPI_BASKETBALL_TOKEN;
  const BETSAPI_TENNIS = process.env.BETSAPI_TENNIS_TOKEN;
  const BETSAPI_HOCKEY = process.env.BETSAPI_HOCKEY_TOKEN;
  const BETSAPI_FOOTBALL = process.env.BETSAPI_FOOTBALL_TOKEN;

  try {
    console.log('=== FETCHING MULTI-SPORT LIVE SCORES ===');

    const allFixtures: any[] = [];

    // PRIORITY 1: Fetch from BetsAPI (paid subscription - best data)
    const hasBetsAPI = BETSAPI_SOCCER || BETSAPI_BASKETBALL || BETSAPI_TENNIS || BETSAPI_HOCKEY || BETSAPI_FOOTBALL;

    if (hasBetsAPI) {
      console.log('Fetching live scores from BetsAPI (paid subscription)...');

      try {
        const betsapiEvents = await fetchAllLiveScores({
          soccer: BETSAPI_SOCCER,
          basketball: BETSAPI_BASKETBALL,
          tennis: BETSAPI_TENNIS,
          hockey: BETSAPI_HOCKEY,
          football: BETSAPI_FOOTBALL,
        });

        // Transform raw events to live score format with all match details
        const transformedFixtures = betsapiEvents
          .map(event => {
            try {
              return transformBetsAPIToLiveScore(event);
            } catch (err) {
              console.error('Error transforming BetsAPI event:', err);
              return null;
            }
          })
          .filter(Boolean);

        allFixtures.push(...transformedFixtures);

        console.log(`- BetsAPI: ${transformedFixtures.length} live fixtures across all sports`);
      } catch (error) {
        console.error('BetsAPI fetch error:', error);
      }
    }

    // FALLBACK 1: Fetch soccer from SportMonks for enhanced data (if no BetsAPI soccer)
    if (!BETSAPI_SOCCER && SPORTMONKS_KEY && SPORTMONKS_KEY !== 'your_sportmonks_api_key_here') {
      console.log('Fetching soccer from SportMonks API (fallback)...');
      const soccerFixtures = await fetchSportMonksFixtures(SPORTMONKS_KEY);
      allFixtures.push(...soccerFixtures);
      console.log(`- Soccer (SportMonks): ${soccerFixtures.length} fixtures`);
    }

    // FALLBACK 2: Fetch other sports from sportapi7 (if no BetsAPI)
    if (!hasBetsAPI && RAPIDAPI_KEY) {
      console.log('Fetching other sports from sportapi7 (fallback)...');
      const otherSportsFixtures = await Promise.all(
        SPORT_CONFIGS.map(config => fetchSportFixtures(config, RAPIDAPI_KEY))
      );

      const otherSportsFlat = otherSportsFixtures.flat().filter(Boolean);
      allFixtures.push(...otherSportsFlat);

      SPORT_CONFIGS.forEach((config, i) => {
        console.log(`- ${config.name} (sportapi7): ${otherSportsFixtures[i]?.length || 0} fixtures`);
      });
    }

    console.log('=== LIVE SCORES SUMMARY ===');
    console.log(`Total fixtures: ${allFixtures.length}`);

    return allFixtures;
  } catch (error) {
    console.error('Error fetching live scores:', error);
    return null;
  }
}


export async function GET(request: NextRequest) {
  try {
    const CACHE_KEY = 'live-scores';
    const CACHE_TTL_SECONDS = 45; // Cache for 45 seconds to reduce API calls

    // Check cache first
    const cachedData = cache.get<any>(CACHE_KEY);
    if (cachedData) {
      console.log('✓ Returning cached live scores (avoiding API call)');
      return NextResponse.json({
        ...cachedData,
        cached: true,
        cacheStats: cache.getStats()
      });
    }

    console.log('⟳ Cache miss - fetching fresh live scores from API');

    // Fetch real data from API
    let games = await fetchRealLiveScores();
    let dataSource = 'real';

    // If no API data available, return empty array
    if (!games || games.length === 0) {
      console.log('No live scores available from API');
      games = [];
      dataSource = 'none';
    }

    // Get games that are in bundles from database
    const bundleGames = await prisma.game.findMany({
      where: {
        bundles: {
          some: {
            bundle: {
              isActive: true,
              publishedAt: {
                not: null
              }
            }
          }
        }
      },
      select: {
        homeTeam: true,
        awayTeam: true,
        sport: true
      }
    });

    // Mark games that are in bundles
    const gamesWithBundleInfo = games.map(game => {
      const isInBundle = bundleGames.some(
        bg => bg.homeTeam === game.homeTeam &&
              bg.awayTeam === game.awayTeam &&
              bg.sport === game.sport
      );

      return {
        ...game,
        inBundle: isInBundle || game.inBundle
      };
    });

    const responseData = {
      success: true,
      games: gamesWithBundleInfo,
      source: dataSource
    };

    // Cache the response
    cache.set(CACHE_KEY, responseData, CACHE_TTL_SECONDS);
    console.log(`✓ Cached live scores for ${CACHE_TTL_SECONDS} seconds`);

    return NextResponse.json({
      ...responseData,
      cached: false
    });
  } catch (error) {
    console.error('Error fetching live scores:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live scores' },
      { status: 500 }
    );
  }
}

// Optional: Add POST endpoint for real API integration
export async function POST(request: NextRequest) {
  try {
    const { apiKey, sport } = await request.json();

    // This is where you would integrate with API-Sports.io or similar
    // Example for API-Football:
    // const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
    //   headers: {
    //     'x-rapidapi-host': 'v3.football.api-sports.io',
    //     'x-rapidapi-key': apiKey || process.env.SPORTS_API_KEY
    //   }
    // });
    // const data = await response.json();

    return NextResponse.json({
      success: false,
      message: 'Real API integration not yet implemented. Using mock data.'
    });
  } catch (error) {
    console.error('Error with API integration:', error);
    return NextResponse.json(
      { success: false, error: 'API integration error' },
      { status: 500 }
    );
  }
}
