// SportMonks API v3.0 Integration
// Documentation: https://docs.sportmonks.com/football/

const SPORTMONKS_BASE_URL = 'https://api.sportmonks.com/v3/football';

interface SportMonksFixture {
  id: number;
  name: string;
  starting_at: string;
  state: {
    id: number;
    state: string; // "NS" (Not Started), "LIVE", "FT" (Finished)
  };
  participants: Array<{
    id: number;
    name: string;
    meta: {
      location: string; // "home" or "away"
    };
  }>;
  scores: Array<{
    score: {
      participant: string; // "home" or "away"
      goals: number;
    };
    description: string; // "CURRENT", "HALFTIME", etc.
  }>;
  league: {
    id: number;
    name: string;
    country?: {
      name: string;
    };
  };
  periods?: Array<{
    id: number;
    started: number;
    ended: number | null;
  }>;
}

interface SportMonksOdds {
  fixture_id: number;
  bookmaker: {
    id: number;
    name: string;
  };
  market: {
    id: number;
    name: string;
  };
  selections: Array<{
    name: string;
    odds: number;
  }>;
}

export async function fetchSportMonksFixtures(apiKey: string) {
  if (!apiKey || apiKey === 'your_sportmonks_api_key_here') {
    console.log('SportMonks API key not configured, skipping...');
    return [];
  }

  try {
    console.log('Fetching soccer data from SportMonks...');

    // Fetch livescores with includes for detailed data
    const response = await fetch(
      `${SPORTMONKS_BASE_URL}/livescores/inplay?api_token=${apiKey}&include=participants;league;scores;periods;events`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      console.error('SportMonks API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    const fixtures = data.data || [];

    console.log(`SportMonks - Soccer fixtures fetched: ${fixtures.length}`);

    // Transform to unified format
    return fixtures.map((fixture: SportMonksFixture) => {
      const homeTeam = fixture.participants?.find(p => p.meta?.location === 'home');
      const awayTeam = fixture.participants?.find(p => p.meta?.location === 'away');

      // Get current scores
      const currentScores = fixture.scores?.filter(s => s.description === 'CURRENT') || [];
      const homeScoreData = currentScores.find(s => s.score.participant === 'home');
      const awayScoreData = currentScores.find(s => s.score.participant === 'away');

      // Determine status
      let status = 'UPCOMING';
      let currentPeriod = null;

      const state = fixture.state?.state;
      if (state === 'LIVE' || state === 'HT' || state === 'ET') {
        status = 'LIVE';

        // Determine period
        if (state === 'HT') {
          currentPeriod = 'HT';
        } else if (state === 'ET') {
          currentPeriod = 'ET';
        } else {
          // Check periods for current half
          const activePeriod = fixture.periods?.find(p => p.ended === null);
          if (activePeriod) {
            currentPeriod = activePeriod.id === 1 ? '1H' : '2H';
          } else {
            currentPeriod = 'LIVE';
          }
        }
      } else if (state === 'FT' || state === 'AET' || state === 'FT_PEN') {
        status = 'FINISHED';
        currentPeriod = 'FT';
      } else if (state === 'NS') {
        status = 'UPCOMING';
      }

      return {
        id: `soccer-sportmonks-${fixture.id}`,
        sport: 'SOCCER',
        homeTeam: homeTeam?.name || 'Home',
        awayTeam: awayTeam?.name || 'Away',
        homeScore: homeScoreData?.score.goals ?? null,
        awayScore: awayScoreData?.score.goals ?? null,
        status,
        currentPeriod,
        league: fixture.league?.name || 'League',
        country: fixture.league?.country?.name,
        scheduledAt: fixture.starting_at,
        liveStats: null, // Will be enhanced with statistics endpoint
        events: {
          goals: [],
          cards: [],
          substitutions: [],
        },
        inBundle: false,
        fixtureId: fixture.id,
        source: 'sportmonks',
      };
    });
  } catch (error) {
    console.error('Error fetching SportMonks fixtures:', error);
    return [];
  }
}

// Fetch detailed fixture information including events
export async function fetchSportMonksFixtureDetails(
  fixtureId: number,
  apiKey: string
) {
  if (!apiKey || apiKey === 'your_sportmonks_api_key_here') {
    return null;
  }

  try {
    const response = await fetch(
      `${SPORTMONKS_BASE_URL}/fixtures/${fixtureId}?api_token=${apiKey}&include=events.player;statistics`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching fixture ${fixtureId} details:`, error);
    return null;
  }
}

// Fetch odds for a fixture
export async function fetchSportMonksOdds(fixtureId: number, apiKey: string) {
  if (!apiKey || apiKey === 'your_sportmonks_api_key_here') {
    return [];
  }

  try {
    const response = await fetch(
      `${SPORTMONKS_BASE_URL}/odds/pre-match/fixtures/${fixtureId}?api_token=${apiKey}&include=bookmaker;market`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 }, // Cache odds for 5 minutes
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching odds for fixture ${fixtureId}:`, error);
    return [];
  }
}

// Fetch predictions for a fixture (for AI analysis)
export async function fetchSportMonksPredictions(
  fixtureId: number,
  apiKey: string
) {
  if (!apiKey || apiKey === 'your_sportmonks_api_key_here') {
    return null;
  }

  try {
    const response = await fetch(
      `${SPORTMONKS_BASE_URL}/predictions/probabilities/fixtures/${fixtureId}?api_token=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache predictions for 1 hour
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching predictions for fixture ${fixtureId}:`, error);
    return null;
  }
}

// Fetch team statistics
export async function fetchSportMonksTeamStats(teamId: number, apiKey: string) {
  if (!apiKey || apiKey === 'your_sportmonks_api_key_here') {
    return null;
  }

  try {
    const response = await fetch(
      `${SPORTMONKS_BASE_URL}/teams/${teamId}?api_token=${apiKey}&include=statistics;latest`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching team ${teamId} stats:`, error);
    return null;
  }
}
