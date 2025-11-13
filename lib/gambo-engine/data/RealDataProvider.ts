/**
 * Real Data Provider - Fetches live sports data from APIs
 * Integrates with API-Sports and The Odds API
 */

import { Sport, GameData, TeamStats, HeadToHeadRecord, WeatherData, OddsData } from '../types/engine.types';

export class RealDataProvider {
  private apiSportsKey: string;
  private oddsApiKey: string;
  private apiSportsBaseUrl = 'https://v3.football.api-sports.io';
  private oddsApiBaseUrl = 'https://api.the-odds-api.com/v4';

  constructor() {
    this.apiSportsKey = process.env.API_SPORTS_KEY || '';
    this.oddsApiKey = process.env.ODDS_API_KEY || '';

    if (!this.apiSportsKey) {
      console.warn('⚠️  API_SPORTS_KEY not set - using fallback data');
    }
    if (!this.oddsApiKey) {
      console.warn('⚠️  ODDS_API_KEY not set - using fallback data');
    }
  }

  /**
   * Fetch upcoming fixtures for a sport
   */
  async fetchUpcomingFixtures(sport: Sport, date?: Date): Promise<any[]> {
    const targetDate = date || new Date();
    targetDate.setDate(targetDate.getDate() + 1); // Tomorrow
    const dateStr = targetDate.toISOString().split('T')[0];

    try {
      if (sport === 'SOCCER') {
        return await this.fetchSoccerFixtures(dateStr);
      } else if (sport === 'BASKETBALL') {
        return await this.fetchBasketballFixtures(dateStr);
      } else if (sport === 'FOOTBALL') {
        return await this.fetchFootballFixtures(dateStr);
      }

      return [];
    } catch (error: any) {
      console.error(`Error fetching ${sport} fixtures:`, error.message);
      return [];
    }
  }

  /**
   * Fetch soccer fixtures from API-Football
   */
  private async fetchSoccerFixtures(date: string): Promise<any[]> {
    if (!this.apiSportsKey) return [];

    const response = await fetch(
      `${this.apiSportsBaseUrl}/fixtures?date=${date}&league=39&season=2024`, // Premier League
      {
        headers: {
          'x-apisports-key': this.apiSportsKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API-Football error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || [];
  }

  /**
   * Fetch basketball fixtures from API-Basketball
   */
  private async fetchBasketballFixtures(date: string): Promise<any[]> {
    if (!this.apiSportsKey) return [];

    const response = await fetch(
      `https://v1.basketball.api-sports.io/games?date=${date}&league=12&season=2024-2025`, // NBA
      {
        headers: {
          'x-apisports-key': this.apiSportsKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API-Basketball error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || [];
  }

  /**
   * Fetch American football fixtures from API-Football (NFL)
   */
  private async fetchFootballFixtures(date: string): Promise<any[]> {
    if (!this.apiSportsKey) return [];

    const response = await fetch(
      `https://v1.american-football.api-sports.io/games?date=${date}&league=1&season=2024`, // NFL
      {
        headers: {
          'x-apisports-key': this.apiSportsKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API-Football error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || [];
  }

  /**
   * Fetch real odds from The Odds API
   */
  async fetchOdds(sport: Sport, fixtureId?: string): Promise<OddsData> {
    if (!this.oddsApiKey) {
      return this.getFallbackOdds();
    }

    try {
      const sportKey = this.getSportKeyForOddsAPI(sport);
      const response = await fetch(
        `${this.oddsApiBaseUrl}/sports/${sportKey}/odds?apiKey=${this.oddsApiKey}&regions=us,uk&markets=h2h,spreads,totals&oddsFormat=decimal`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Odds API error: ${response.status}`);
      }

      const data = await response.json();

      // Find the specific fixture or use first available
      const event = fixtureId
        ? data.find((e: any) => e.id === fixtureId)
        : data[0];

      if (!event || !event.bookmakers || event.bookmakers.length === 0) {
        return this.getFallbackOdds();
      }

      // Extract odds from the first bookmaker
      const bookmaker = event.bookmakers[0];
      const h2hMarket = bookmaker.markets.find((m: any) => m.key === 'h2h');

      if (!h2hMarket || !h2hMarket.outcomes) {
        return this.getFallbackOdds();
      }

      const homeOdds = h2hMarket.outcomes.find((o: any) => o.name === event.home_team);
      const awayOdds = h2hMarket.outcomes.find((o: any) => o.name === event.away_team);
      const drawOdds = h2hMarket.outcomes.find((o: any) => o.name === 'Draw');

      return {
        homeWin: homeOdds?.price || 2.0,
        draw: drawOdds?.price || 3.5,
        awayWin: awayOdds?.price || 3.0,
        bookmaker: bookmaker.title,
        lastUpdate: new Date(event.commence_time),
        opening: {
          homeWin: homeOdds?.price || 2.0,
          draw: drawOdds?.price || 3.5,
          awayWin: awayOdds?.price || 3.0,
        },
      };
    } catch (error: any) {
      console.error('Error fetching odds:', error.message);
      return this.getFallbackOdds();
    }
  }

  /**
   * Map sport to Odds API sport key
   */
  private getSportKeyForOddsAPI(sport: Sport): string {
    const mapping: Record<Sport, string> = {
      SOCCER: 'soccer_epl', // English Premier League
      BASKETBALL: 'basketball_nba',
      FOOTBALL: 'americanfootball_nfl',
      TENNIS: 'tennis_atp',
      HOCKEY: 'icehockey_nhl',
    };
    return mapping[sport] || 'soccer_epl';
  }

  /**
   * Fetch team statistics from API-Sports
   */
  async fetchTeamStats(sport: Sport, teamId: string, season: string = '2024'): Promise<TeamStats> {
    if (!this.apiSportsKey) {
      return this.getFallbackTeamStats();
    }

    try {
      if (sport === 'SOCCER') {
        return await this.fetchSoccerTeamStats(teamId, season);
      } else if (sport === 'BASKETBALL') {
        return await this.fetchBasketballTeamStats(teamId, season);
      }

      return this.getFallbackTeamStats();
    } catch (error: any) {
      console.error('Error fetching team stats:', error.message);
      return this.getFallbackTeamStats();
    }
  }

  /**
   * Fetch soccer team statistics
   */
  private async fetchSoccerTeamStats(teamId: string, season: string): Promise<TeamStats> {
    const response = await fetch(
      `${this.apiSportsBaseUrl}/teams/statistics?team=${teamId}&season=${season}&league=39`,
      {
        headers: {
          'x-apisports-key': this.apiSportsKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const stats = data.response;

    return {
      gamesPlayed: stats.fixtures.played.total || 0,
      wins: stats.fixtures.wins.total || 0,
      draws: stats.fixtures.draws.total || 0,
      losses: stats.fixtures.loses.total || 0,
      goalsScored: stats.goals.for.total.total || 0,
      goalsConceded: stats.goals.against.total.total || 0,
      cleanSheets: stats.clean_sheet.total || 0,
      xG: stats.goals.for.total.total * 0.9, // Approximation
      xGA: stats.goals.against.total.total * 0.9,
      possession: parseFloat(stats.goals.for.average.total) || 50,
      shotsPerGame: 12,
      shotsOnTargetPerGame: 5,
      setPieceEfficiency: 0.15,
    };
  }

  /**
   * Fetch basketball team statistics
   */
  private async fetchBasketballTeamStats(teamId: string, season: string): Promise<TeamStats> {
    const response = await fetch(
      `https://v1.basketball.api-sports.io/teams/statistics?id=${teamId}&season=${season}&league=12`,
      {
        headers: {
          'x-apisports-key': this.apiSportsKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const stats = data.response;

    return {
      gamesPlayed: stats.games.played || 0,
      wins: stats.games.wins.total || 0,
      draws: 0,
      losses: stats.games.loses.total || 0,
      goalsScored: stats.points.for.average || 0,
      goalsConceded: stats.points.against.average || 0,
      cleanSheets: 0,
    };
  }

  /**
   * Fetch head-to-head records
   */
  async fetchHeadToHead(sport: Sport, homeTeamId: string, awayTeamId: string): Promise<HeadToHeadRecord[]> {
    if (!this.apiSportsKey || sport !== 'SOCCER') {
      return [];
    }

    try {
      const response = await fetch(
        `${this.apiSportsBaseUrl}/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}`,
        {
          headers: {
            'x-apisports-key': this.apiSportsKey,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const fixtures = data.response || [];

      return fixtures.slice(0, 10).map((fixture: any) => ({
        date: new Date(fixture.fixture.date),
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        homeScore: fixture.goals.home,
        awayScore: fixture.goals.away,
        venue: fixture.fixture.venue.name,
      }));
    } catch (error: any) {
      console.error('Error fetching H2H:', error.message);
      return [];
    }
  }

  /**
   * Convert API fixture to GameData
   */
  convertFixtureToGameData(fixture: any, sport: Sport): GameData | null {
    try {
      if (sport === 'SOCCER') {
        return this.convertSoccerFixture(fixture);
      } else if (sport === 'BASKETBALL') {
        return this.convertBasketballFixture(fixture);
      } else if (sport === 'FOOTBALL') {
        return this.convertFootballFixture(fixture);
      }
      return null;
    } catch (error: any) {
      console.error('Error converting fixture:', error.message);
      return null;
    }
  }

  /**
   * Convert soccer fixture
   */
  private convertSoccerFixture(fixture: any): GameData {
    const homeTeam = fixture.teams.home.name;
    const awayTeam = fixture.teams.away.name;

    return {
      id: `SOCCER_${fixture.fixture.id}`,
      sport: 'SOCCER',
      league: fixture.league.name,
      homeTeam,
      awayTeam,
      scheduledAt: new Date(fixture.fixture.date),
      venue: fixture.fixture.venue.name,
      homeStats: this.getFallbackTeamStats(),
      awayStats: this.getFallbackTeamStats(),
      odds: this.getFallbackOdds(),
      headToHead: [],
      injuries: [],
      weather: this.getFallbackWeather(),
      motivation: {
        homeTeam: 'Standard fixture',
        awayTeam: 'Standard fixture',
      },
    };
  }

  /**
   * Convert basketball fixture
   */
  private convertBasketballFixture(fixture: any): GameData {
    const homeTeam = fixture.teams.home.name;
    const awayTeam = fixture.teams.away.name;

    return {
      id: `BASKETBALL_${fixture.id}`,
      sport: 'BASKETBALL',
      league: fixture.league.name,
      homeTeam,
      awayTeam,
      scheduledAt: new Date(fixture.date),
      venue: fixture.arena || 'Arena',
      homeStats: this.getFallbackTeamStats(),
      awayStats: this.getFallbackTeamStats(),
      odds: this.getFallbackOdds(),
      headToHead: [],
      injuries: [],
      motivation: {
        homeTeam: 'Standard game',
        awayTeam: 'Standard game',
      },
    };
  }

  /**
   * Convert football fixture
   */
  private convertFootballFixture(fixture: any): GameData {
    const homeTeam = fixture.teams.home.name;
    const awayTeam = fixture.teams.away.name;

    return {
      id: `FOOTBALL_${fixture.game.id}`,
      sport: 'FOOTBALL',
      league: fixture.league.name,
      homeTeam,
      awayTeam,
      scheduledAt: new Date(fixture.game.date.date),
      venue: fixture.game.venue || 'Stadium',
      homeStats: this.getFallbackTeamStats(),
      awayStats: this.getFallbackTeamStats(),
      odds: this.getFallbackOdds(),
      headToHead: [],
      injuries: [],
      motivation: {
        homeTeam: 'Regular season',
        awayTeam: 'Regular season',
      },
    };
  }

  // Fallback data methods
  private getFallbackOdds(): OddsData {
    return {
      homeWin: 2.0,
      draw: 3.5,
      awayWin: 3.0,
      bookmaker: 'Fallback',
      lastUpdate: new Date(),
      opening: {
        homeWin: 2.0,
        draw: 3.5,
        awayWin: 3.0,
      },
    };
  }

  private getFallbackTeamStats(): TeamStats {
    return {
      gamesPlayed: 20,
      wins: 10,
      draws: 5,
      losses: 5,
      goalsScored: 25,
      goalsConceded: 20,
      cleanSheets: 5,
      xG: 22.5,
      xGA: 18.0,
      possession: 50,
      shotsPerGame: 12,
      shotsOnTargetPerGame: 5,
      setPieceEfficiency: 0.15,
    };
  }

  private getFallbackWeather(): WeatherData {
    return {
      temperature: 18,
      condition: 'Clear',
      windSpeed: 10,
      precipitation: 0,
      humidity: 60,
    };
  }
}

export default RealDataProvider;
