/**
 * Sophisticated Bundle Generator 2.0
 * Uses Portfolio Theory and Advanced Optimization
 * - Modern Portfolio Theory (Sharpe Ratio Optimization)
 * - Correlation Analysis
 * - Risk-Adjusted Returns
 * - Multi-Objective Optimization
 */

import { SophisticatedGamboEngine } from './SophisticatedGamboEngine';
import DataProvider from './data/DataProvider';
import RealDataProvider from './data/RealDataProvider';
import PortfolioOptimizer, { BundleAsset, OptimizedPortfolio } from './advanced/PortfolioOptimizer';
import {
  BundleRequest,
  GeneratedBundle,
  BundleGame,
  PredictionOutput,
  GameData,
} from './types/engine.types';
import { Sport, BundleType } from '@prisma/client';

export class SophisticatedBundleGenerator {
  private engine: SophisticatedGamboEngine;
  private dataProvider: DataProvider;
  private realDataProvider: RealDataProvider;
  private portfolioOptimizer: PortfolioOptimizer;

  constructor(engine?: SophisticatedGamboEngine) {
    this.engine = engine || new SophisticatedGamboEngine();
    this.dataProvider = new DataProvider();
    this.realDataProvider = new RealDataProvider();
    this.portfolioOptimizer = new PortfolioOptimizer();
  }

  /**
   * Generate sophisticated bundle using portfolio optimization
   */
  async generateBundle(request: BundleRequest): Promise<GeneratedBundle> {
    console.log(`\n╔${'═'.repeat(58)}╗`);
    console.log(`║  📦 SOPHISTICATED BUNDLE GENERATION                      ║`);
    console.log(`╚${'═'.repeat(58)}╝`);
    console.log(`\n  Type: ${request.type}`);
    console.log(`  Target Odds: ${request.targetOdds}x`);
    console.log(`  Min Confidence: ${request.minConfidence}%`);
    console.log(`  Max Games: ${request.maxGames}`);
    console.log(`  Sports: ${request.sports?.join(', ') || 'All'}\n`);

    // =================================================================
    // STEP 1: FETCH AVAILABLE GAMES
    // =================================================================
    console.log('Step 1: Fetching available games...');
    const availableGames = await this.fetchAvailableGames(
      request.sports,
      request.date
    );
    console.log(`  ✓ Found ${availableGames.length} games\n`);

    // =================================================================
    // STEP 2: GENERATE PREDICTIONS FOR ALL GAMES
    // =================================================================
    console.log('Step 2: Generating sophisticated predictions...');
    const predictions = await this.generatePredictions(
      availableGames,
      request
    );
    console.log(`  ✓ Generated ${predictions.length} predictions\n`);

    // =================================================================
    // STEP 3: FILTER BY QUALITY THRESHOLDS
    // =================================================================
    console.log('Step 3: Filtering high-quality predictions...');
    const qualifiedPredictions = this.filterQualifiedPredictions(
      predictions,
      request.minConfidence,
      request.targetOdds
    );
    console.log(`  ✓ ${qualifiedPredictions.length} meet quality thresholds\n`);

    if (qualifiedPredictions.length < 2) {
      throw new Error(
        `Insufficient quality predictions (${qualifiedPredictions.length}). Minimum 2 required.`
      );
    }

    // =================================================================
    // STEP 4: CONVERT TO PORTFOLIO ASSETS
    // =================================================================
    console.log('Step 4: Converting to portfolio assets...');
    const assets = this.convertToBundleAssets(
      qualifiedPredictions,
      availableGames
    );
    console.log(`  ✓ Created ${assets.length} portfolio assets\n`);

    // =================================================================
    // STEP 5: PORTFOLIO OPTIMIZATION
    // =================================================================
    console.log('Step 5: Running portfolio optimization...');
    console.log('  Optimizing for:');
    console.log('    • Maximum Sharpe Ratio');
    console.log('    • Minimum Correlation');
    console.log('    • Maximum Diversification');
    console.log('    • Target Return Match\n');

    const optimalPortfolio = this.portfolioOptimizer.optimizeBundle(
      assets,
      request.maxGames,
      request.targetOdds,
      0.6 // Max 60% correlation
    );

    console.log('  Portfolio Metrics:');
    console.log(`    Expected Return: ${optimalPortfolio.expectedReturn.toFixed(2)}x`);
    console.log(`    Sharpe Ratio: ${optimalPortfolio.sharpeRatio.toFixed(2)}`);
    console.log(`    Portfolio Risk: ${Math.sqrt(optimalPortfolio.portfolioVariance).toFixed(2)}`);
    console.log(`    Diversification: ${(optimalPortfolio.diversificationScore * 100).toFixed(0)}%`);
    console.log(`    Correlation Risk: ${(optimalPortfolio.correlationRisk * 100).toFixed(0)}%\n`);

    // Calculate portfolio quality score
    const qualityScore = this.portfolioOptimizer.scorePortfolio(
      optimalPortfolio
    );
    console.log(`  Portfolio Quality Score: ${qualityScore.toFixed(0)}/100\n`);

    // =================================================================
    // STEP 6: CALCULATE OPTIMAL STAKES
    // =================================================================
    console.log('Step 6: Calculating optimal Kelly stakes...');
    const optimalStakes = this.portfolioOptimizer.calculateKellyStakes(
      optimalPortfolio,
      1000, // $1000 bankroll
      0.25 // Fractional Kelly
    );

    console.log('  Recommended Stakes:');
    optimalPortfolio.assets.forEach((asset, i) => {
      console.log(`    Game ${i + 1}: ${(optimalStakes[i] * 100).toFixed(1)}% of bankroll`);
    });
    console.log('');

    // =================================================================
    // STEP 7: BUILD FINAL BUNDLE
    // =================================================================
    console.log('Step 7: Building final bundle...\n');
    const bundle = await this.buildSophisticatedBundle(
      optimalPortfolio,
      qualifiedPredictions,
      availableGames,
      request,
      qualityScore
    );

    console.log(`╔${'═'.repeat(58)}╗`);
    console.log(`║  ✅ BUNDLE GENERATED SUCCESSFULLY                        ║`);
    console.log(`╚${'═'.repeat(58)}╝`);
    console.log(`\n  Name: ${bundle.name}`);
    console.log(`  Games: ${bundle.games.length}`);
    console.log(`  Combined Odds: ${bundle.expectedReturn.toFixed(2)}x`);
    console.log(`  Confidence: ${bundle.confidence}%`);
    console.log(`  Quality Score: ${qualityScore.toFixed(0)}/100\n`);

    return bundle;
  }

  /**
   * Fetch available games
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
   * Generate mock games for testing
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
   * Get mock matchups
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
        { home: 'Tottenham', away: 'Aston Villa' },
      ],
      BASKETBALL: [
        { home: 'Boston Celtics', away: 'Detroit Pistons' },
        { home: 'LA Lakers', away: 'Memphis Grizzlies' },
        { home: 'Milwaukee Bucks', away: 'Charlotte Hornets' },
        { home: 'Phoenix Suns', away: 'Portland Trail Blazers' },
      ],
      FOOTBALL: [
        { home: 'Kansas City Chiefs', away: 'Las Vegas Raiders' },
        { home: 'Buffalo Bills', away: 'Miami Dolphins' },
        { home: 'San Francisco 49ers', away: 'Seattle Seahawks' },
      ],
      TENNIS: [
        { home: 'Novak Djokovic', away: 'Jannik Sinner' },
        { home: 'Carlos Alcaraz', away: 'Daniil Medvedev' },
      ],
      HOCKEY: [
        { home: 'Colorado Avalanche', away: 'Arizona Coyotes' },
        { home: 'Edmonton Oilers', away: 'Calgary Flames' },
      ],
    };

    return matchups[sport] || [];
  }

  /**
   * Generate predictions using sophisticated engine
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
   * Filter predictions by quality thresholds
   */
  private filterQualifiedPredictions(
    predictions: PredictionOutput[],
    minConfidence: number,
    targetOdds: number
  ): PredictionOutput[] {
    return predictions.filter((pred) => {
      // Must meet confidence threshold
      if (pred.confidence < minConfidence) return false;

      // Must have positive edge
      if (pred.edgeOverMarket <= 0) return false;

      // Must have recommended stake
      if (pred.recommendedStake <= 0) return false;

      // Must have reasonable expected return
      if (pred.expectedReturn < 1.01) return false;

      // Prefer predictions with sharpe money backing
      const qualityBonus = pred.sharpMoney ? 5 : 0;

      return pred.confidence + qualityBonus >= minConfidence;
    });
  }

  /**
   * Convert predictions to portfolio assets
   */
  private convertToBundleAssets(
    predictions: PredictionOutput[],
    games: GameData[]
  ): BundleAsset[] {
    return predictions.map((pred) => {
      const game = games.find((g) => g.id === pred.gameId);

      if (!game) {
        throw new Error(`Game not found for prediction ${pred.gameId}`);
      }

      // Calculate variance (risk)
      // Higher probability predictions have lower variance
      const variance = pred.finalProbability * (1 - pred.finalProbability);

      // Adjust odds based on prediction (simplified)
      const odds = game.odds.homeWin;

      return {
        id: pred.gameId,
        expectedReturn: pred.expectedReturn,
        variance,
        probability: pred.finalProbability,
        odds,
        sport: game.sport,
        league: game.league,
        gameTime: game.scheduledAt,
      };
    });
  }

  /**
   * Build sophisticated bundle
   */
  private async buildSophisticatedBundle(
    portfolio: OptimizedPortfolio,
    predictions: PredictionOutput[],
    games: GameData[],
    request: BundleRequest,
    qualityScore: number
  ): Promise<GeneratedBundle> {
    const bundleGames: BundleGame[] = portfolio.assets.map((asset) => {
      const pred = predictions.find((p) => p.gameId === asset.id);
      const game = games.find((g) => g.id === asset.id);

      if (!pred || !game) {
        throw new Error('Missing prediction or game data');
      }

      const [sport, home, away] = pred.gameId.split('_');

      return {
        gameId: pred.gameId,
        sport: sport as Sport,
        homeTeam: home.replace(/-/g, ' '),
        awayTeam: away.replace(/-/g, ' '),
        scheduledAt: game.scheduledAt,
        pick: this.generatePickDescription(pred),
        odds: asset.odds,
        prediction: pred,
      };
    });

    // Calculate average confidence weighted by stake
    const avgConfidence = Math.round(
      portfolio.assets.reduce((sum, asset, i) => {
        const pred = predictions.find((p) => p.gameId === asset.id);
        return sum + (pred?.confidence || 0) * portfolio.weights[i];
      }, 0)
    );

    return {
      name: this.generateSophisticatedBundleName(
        request,
        portfolio,
        qualityScore
      ),
      type: request.type,
      confidence: Math.max(avgConfidence, request.minConfidence),
      expectedReturn: portfolio.expectedReturn,
      tierAccess: request.tierAccess,
      games: bundleGames,
      metadata: {
        generatedAt: new Date(),
        engineVersion: this.engine.getVersion(),
        totalPredictions: bundleGames.length,
        selectionCriteria: `Portfolio optimized for Sharpe ratio. Min ${request.minConfidence}% confidence, Target ${request.targetOdds}x odds.`,
        portfolioMetrics: {
          sharpeRatio: portfolio.sharpeRatio,
          diversificationScore: portfolio.diversificationScore,
          correlationRisk: portfolio.correlationRisk,
          qualityScore,
        },
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
   * Generate sophisticated bundle name
   */
  private generateSophisticatedBundleName(
    request: BundleRequest,
    portfolio: OptimizedPortfolio,
    qualityScore: number
  ): string {
    const typeNames: Record<string, string> = {
      STANDARD: 'Optimized Acca',
      BTTS: 'BTTS Portfolio',
      PLUS_50_ODDS: 'High Value Mega',
      WEEKEND_PLUS_10: 'Weekend Portfolio',
      PLAYERS_TO_SCORE: 'Goalscorers Portfolio',
      UNDER_OVER: 'Goals Portfolio',
    };

    const baseName = typeNames[request.type] || 'Mixed Portfolio';
    const oddsString = `${portfolio.expectedReturn.toFixed(1)}x`;

    // Quality tier based on portfolio score
    let qualityTier: string;
    if (qualityScore >= 85) {
      qualityTier = 'Elite';
    } else if (qualityScore >= 75) {
      qualityTier = 'Premium';
    } else if (qualityScore >= 65) {
      qualityTier = 'Select';
    } else {
      qualityTier = 'Value';
    }

    // Add Sharpe indicator if exceptional
    const sharpeIndicator =
      portfolio.sharpeRatio > 1.5 ? ' ⚡' : portfolio.sharpeRatio > 1.0 ? ' ✨' : '';

    return `${qualityTier} ${baseName} ${oddsString}${sharpeIndicator}`;
  }
}

export default SophisticatedBundleGenerator;
