/**
 * Gambo 1.0 Engine - Bundle Generator
 * Creates optimized betting bundles from predictions
 */

import { GamboEngine } from './GamboEngine';
import DataProvider from './data/DataProvider';
import RealDataProvider from './data/RealDataProvider';
import {
  BundleRequest,
  BundleCandidate,
  GeneratedBundle,
  BundleGame,
  PredictionOutput,
  GameData,
} from './types/engine.types';
import { Sport, BundleType, SubscriptionTier } from '@prisma/client';

export class BundleGenerator {
  private engine: GamboEngine;
  private dataProvider: DataProvider;
  private realDataProvider: RealDataProvider;

  constructor(engine?: GamboEngine) {
    this.engine = engine || new GamboEngine();
    this.dataProvider = new DataProvider();
    this.realDataProvider = new RealDataProvider();
  }

  /**
   * Generate an optimized bundle based on request criteria
   */
  async generateBundle(request: BundleRequest): Promise<GeneratedBundle> {
    console.log(
      `\n🎯 Generating ${request.type} bundle targeting ${request.targetOdds}x odds...`
    );

    // Step 1: Fetch available games
    const availableGames = await this.fetchAvailableGames(
      request.sports,
      request.date
    );

    console.log(`   Found ${availableGames.length} available games`);

    // Step 2: Generate predictions for all games
    const predictions = await this.generatePredictions(
      availableGames,
      request
    );

    console.log(`   Generated ${predictions.length} predictions`);

    // Step 3: Filter predictions by confidence and value
    const qualifiedPredictions = this.filterQualifiedPredictions(
      predictions,
      request.minConfidence
    );

    console.log(
      `   ${qualifiedPredictions.length} predictions meet criteria`
    );

    // Step 4: Find optimal combination
    const optimalCombination = this.findOptimalCombination(
      qualifiedPredictions,
      request
    );

    if (!optimalCombination) {
      throw new Error('Could not find suitable bundle combination');
    }

    console.log(
      `   Selected ${optimalCombination.games.length} games, Combined odds: ${optimalCombination.combinedOdds.toFixed(2)}x`
    );

    // Step 5: Build final bundle
    const bundle = await this.buildBundle(optimalCombination, request);

    console.log(`\n✅ Bundle "${bundle.name}" generated successfully!`);

    return bundle;
  }

  /**
   * Fetch available games for the bundle
   */
  private async fetchAvailableGames(
    sports?: Sport[],
    date?: Date
  ): Promise<GameData[]> {
    const targetDate = date || new Date();
    const tomorrow = new Date(targetDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sportsToInclude = sports || [
      'SOCCER',
      'BASKETBALL',
      'FOOTBALL',
      'TENNIS',
      'HOCKEY',
    ];

    const games: GameData[] = [];

    // Fetch real games from The Odds API
    for (const sport of sportsToInclude) {
      try {
        const sportGames = await this.fetchRealGamesForSport(sport, tomorrow);
        games.push(...sportGames);
      } catch (error) {
        console.warn(`   ⚠️  Could not fetch real data for ${sport}, using mock data`);
        // Fallback to mock data if API fails
        const mockGames = await this.generateMockGamesForSport(sport, tomorrow);
        games.push(...mockGames);
      }
    }

    return games;
  }

  /**
   * Fetch real games from The Odds API
   */
  private async fetchRealGamesForSport(
    sport: Sport,
    scheduledAt: Date
  ): Promise<GameData[]> {
    // Fetch fixtures and odds from The Odds API
    const fixtures = await this.realDataProvider.fetchUpcomingFixtures(sport, scheduledAt);

    if (!fixtures || fixtures.length === 0) {
      throw new Error(`No fixtures found for ${sport}`);
    }

    // Convert fixtures to GameData format
    const games: GameData[] = [];

    for (const fixture of fixtures.slice(0, 5)) { // Limit to 5 games per sport
      try {
        const oddsData = await this.realDataProvider.fetchOdds(sport, fixture.id);

        // Build game data
        const gameData = await this.dataProvider.fetchGameData(
          sport,
          fixture.home_team,
          fixture.away_team,
          new Date(fixture.commence_time)
        );

        // Override odds with real market odds
        if (oddsData && oddsData.homeWin) {
          gameData.odds = oddsData;
        }

        games.push(gameData);
      } catch (error) {
        console.warn(`   ⚠️  Could not process fixture ${fixture.id}`);
      }
    }

    return games;
  }

  /**
   * Generate mock games for a specific sport
   */
  private async generateMockGamesForSport(
    sport: Sport,
    scheduledAt: Date
  ): Promise<GameData[]> {
    const matchups = this.getMockMatchups(sport);

    return Promise.all(
      matchups.map((matchup) =>
        this.dataProvider.fetchGameData(
          sport,
          matchup.home,
          matchup.away,
          scheduledAt
        )
      )
    );
  }

  /**
   * Get mock matchups for each sport
   */
  private getMockMatchups(
    sport: Sport
  ): Array<{ home: string; away: string }> {
    const matchups: Record<Sport, Array<{ home: string; away: string }>> = {
      SOCCER: [
        { home: 'Manchester City', away: 'Brighton' },
        { home: 'Liverpool', away: 'Nottingham Forest' },
        { home: 'Arsenal', away: 'Southampton' },
        { home: 'Chelsea', away: 'Newcastle' },
      ],
      BASKETBALL: [
        { home: 'Boston Celtics', away: 'Detroit Pistons' },
        { home: 'LA Lakers', away: 'Memphis Grizzlies' },
        { home: 'Milwaukee Bucks', away: 'Charlotte Hornets' },
      ],
      FOOTBALL: [
        { home: 'Kansas City Chiefs', away: 'Las Vegas Raiders' },
        { home: 'Buffalo Bills', away: 'Miami Dolphins' },
      ],
      TENNIS: [{ home: 'Novak Djokovic', away: 'Jannik Sinner' }],
      HOCKEY: [{ home: 'Colorado Avalanche', away: 'Arizona Coyotes' }],
    };

    return matchups[sport] || [];
  }

  /**
   * Generate predictions for all games
   */
  private async generatePredictions(
    games: GameData[],
    request: BundleRequest
  ): Promise<PredictionOutput[]> {
    const predictionType = this.getBundlePredictionType(request.type);

    const predictions = await Promise.all(
      games.map((game) =>
        this.engine.predict({
          game,
          predictionType,
          targetOdds: request.targetOdds,
        })
      )
    );

    return predictions;
  }

  /**
   * Map bundle type to prediction type
   */
  private getBundlePredictionType(bundleType: string): any {
    const mapping: Record<string, string> = {
      STANDARD: 'MATCH_RESULT',
      BTTS: 'BTTS',
      PLUS_50_ODDS: 'MATCH_RESULT',
      WEEKEND_PLUS_10: 'MATCH_RESULT',
      PLAYERS_TO_SCORE: 'PLAYER_SCORE',
      UNDER_OVER: 'OVER_UNDER',
    };

    return mapping[bundleType] || 'MATCH_RESULT';
  }

  /**
   * Filter predictions that meet minimum criteria
   */
  private filterQualifiedPredictions(
    predictions: PredictionOutput[],
    minConfidence: number
  ): PredictionOutput[] {
    return predictions.filter((pred) => {
      return (
        pred.confidence >= minConfidence &&
        pred.edgeOverMarket > 0 &&
        pred.recommendedStake > 0
      );
    });
  }

  /**
   * Find optimal combination of games
   */
  private findOptimalCombination(
    predictions: PredictionOutput[],
    request: BundleRequest
  ): BundleCandidate | null {
    const candidates: BundleCandidate[] = [];

    // Generate possible combinations
    const combinations = this.generateCombinations(
      predictions,
      request.maxGames
    );

    for (const combo of combinations) {
      const candidate = this.evaluateCandidate(combo, request.targetOdds);

      // Check if combination meets target odds
      if (
        Math.abs(candidate.combinedOdds - request.targetOdds) /
          request.targetOdds <
        0.15 // Within 15% of target
      ) {
        candidates.push(candidate);
      }
    }

    // Sort by score (confidence, diversity, risk)
    candidates.sort((a, b) => {
      const scoreA =
        a.averageConfidence * 0.5 +
        a.diversityScore * 0.3 -
        a.riskScore * 0.2;
      const scoreB =
        b.averageConfidence * 0.5 +
        b.diversityScore * 0.3 -
        b.riskScore * 0.2;
      return scoreB - scoreA;
    });

    return candidates[0] || null;
  }

  /**
   * Generate all possible combinations
   */
  private generateCombinations(
    predictions: PredictionOutput[],
    maxGames: number
  ): PredictionOutput[][] {
    const combinations: PredictionOutput[][] = [];

    // Generate combinations from 2 to maxGames
    for (let size = 2; size <= Math.min(maxGames, predictions.length); size++) {
      const combos = this.getCombinationsOfSize(predictions, size);
      combinations.push(...combos);
    }

    return combinations;
  }

  /**
   * Get combinations of specific size
   */
  private getCombinationsOfSize(
    array: PredictionOutput[],
    size: number
  ): PredictionOutput[][] {
    if (size > array.length) return [];
    if (size === 1) return array.map((item) => [item]);
    if (size === array.length) return [array];

    const combinations: PredictionOutput[][] = [];

    for (let i = 0; i <= array.length - size; i++) {
      const head = array[i];
      const tail = array.slice(i + 1);
      const tailCombos = this.getCombinationsOfSize(tail, size - 1);

      for (const combo of tailCombos) {
        combinations.push([head, ...combo]);
      }
    }

    return combinations;
  }

  /**
   * Evaluate a bundle candidate
   */
  private evaluateCandidate(
    predictions: PredictionOutput[],
    targetOdds: number
  ): BundleCandidate {
    // Calculate combined odds
    const combinedOdds = predictions.reduce(
      (product, pred) => {
        // Get odds from the game (simplified - in production use actual odds)
        const odds = pred.expectedReturn / pred.finalProbability;
        return product * odds;
      },
      1
    );

    // Calculate average confidence
    const averageConfidence =
      predictions.reduce((sum, pred) => sum + pred.confidence, 0) /
      predictions.length;

    // Calculate expected return
    const expectedReturn =
      predictions.reduce((product, pred) => product * pred.finalProbability, 1) *
      combinedOdds;

    // Calculate risk score (based on variance in confidence)
    const confidenceVariance = this.calculateVariance(
      predictions.map((p) => p.confidence)
    );
    const riskScore = confidenceVariance / 100;

    // Calculate diversity score (different sports/leagues)
    const uniqueSports = new Set(
      predictions.map((p) => p.gameId.split('_')[0])
    ).size;
    const diversityScore = uniqueSports / predictions.length;

    return {
      games: predictions,
      combinedOdds,
      averageConfidence,
      expectedReturn,
      riskScore,
      diversityScore,
    };
  }

  /**
   * Calculate variance
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map((n) => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length;
  }

  /**
   * Build final bundle object
   */
  private async buildBundle(
    candidate: BundleCandidate,
    request: BundleRequest
  ): Promise<GeneratedBundle> {
    const bundleGames: BundleGame[] = candidate.games.map((pred) => {
      // Extract game info from prediction
      const [sport, home, away] = pred.gameId.split('_');

      return {
        gameId: pred.gameId,
        sport: sport as Sport,
        homeTeam: home.replace(/-/g, ' '),
        awayTeam: away.replace(/-/g, ' '),
        scheduledAt: new Date(),
        pick: this.generatePickDescription(pred),
        odds: pred.expectedReturn / pred.finalProbability,
        prediction: pred,
      };
    });

    return {
      name: this.generateBundleName(request, candidate),
      type: request.type,
      confidence: Math.round(candidate.averageConfidence),
      expectedReturn: candidate.combinedOdds,
      tierAccess: request.tierAccess,
      games: bundleGames,
      metadata: {
        generatedAt: new Date(),
        engineVersion: this.engine.getVersion(),
        totalPredictions: candidate.games.length,
        selectionCriteria: `Min ${request.minConfidence}% confidence, Target ${request.targetOdds}x odds`,
      },
    };
  }

  /**
   * Generate pick description
   */
  private generatePickDescription(pred: PredictionOutput): string {
    const descriptions: Record<string, string> = {
      MATCH_RESULT: 'Home Win',
      BTTS: 'Both Teams to Score',
      OVER_UNDER: 'Over 2.5 Goals',
      PLAYER_SCORE: 'Anytime Goalscorer',
    };

    return descriptions[pred.type] || 'Win';
  }

  /**
   * Generate bundle name
   */
  private generateBundleName(
    request: BundleRequest,
    candidate: BundleCandidate
  ): string {
    const typeNames: Record<string, string> = {
      STANDARD: 'Daily Acca',
      BTTS: 'BTTS Special',
      PLUS_50_ODDS: 'Mega Odds',
      WEEKEND_PLUS_10: 'Weekend Treble',
      PLAYERS_TO_SCORE: 'Goalscorers',
      UNDER_OVER: 'Goals Galore',
    };

    const baseName = typeNames[request.type] || 'Mixed Bundle';
    const oddsString = `${candidate.combinedOdds.toFixed(1)}x`;
    const confidenceLevel =
      candidate.averageConfidence >= 80
        ? 'Elite'
        : candidate.averageConfidence >= 70
        ? 'Premium'
        : 'Value';

    return `${confidenceLevel} ${baseName} ${oddsString}`;
  }
}

export default BundleGenerator;
