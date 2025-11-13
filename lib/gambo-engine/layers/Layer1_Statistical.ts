/**
 * Gambo 1.0 Engine - Layer 1: Statistical Foundation
 * Base probability calculations using statistical models
 */

import { Sport } from '@prisma/client';
import {
  GameData,
  StatisticalModel,
  PredictionType,
  TeamStats,
} from '../types/engine.types';

export class StatisticalFoundation {
  /**
   * Generate base statistical prediction
   */
  async predict(
    game: GameData,
    predictionType: PredictionType
  ): Promise<{
    probability: number;
    expectedValue: number;
    models: StatisticalModel[];
    confidence: number;
  }> {
    const models: StatisticalModel[] = [];

    // Run multiple statistical models
    if (game.sport === 'SOCCER') {
      models.push(await this.poissonModel(game));
      models.push(await this.xGModel(game));
      models.push(await this.eloModel(game));
    } else {
      models.push(await this.eloModel(game));
      models.push(await this.efficiencyModel(game));
    }

    // Combine model predictions with confidence weighting
    const weightedPrediction = this.combineModels(models);

    // Calculate expected value based on prediction type
    const expectedValue = this.calculateExpectedValue(
      weightedPrediction.probability,
      game.odds,
      predictionType
    );

    return {
      probability: weightedPrediction.probability,
      expectedValue,
      models,
      confidence: weightedPrediction.confidence,
    };
  }

  /**
   * Poisson Distribution Model (Soccer specific)
   * Predicts match outcomes based on expected goals
   */
  private async poissonModel(game: GameData): Promise<StatisticalModel> {
    const homeStats = game.homeStats;
    const awayStats = game.awayStats;

    // Calculate expected goals using attack/defense strength
    const leagueAvgGoals = 2.7; // Average goals per game

    const homeExpectedGoals =
      (homeStats.attackStrength || 1.0) *
      (awayStats.defenseStrength || 1.0) *
      (homeStats.homeAdvantage || 1.0) *
      leagueAvgGoals;

    const awayExpectedGoals =
      (awayStats.attackStrength || 1.0) *
      (homeStats.defenseStrength || 1.0) *
      0.85 * // Away disadvantage
      leagueAvgGoals;

    // Calculate Poisson probabilities
    const homeWinProb = this.poissonProbability(
      homeExpectedGoals,
      awayExpectedGoals,
      'HOME_WIN'
    );

    return {
      type: 'POISSON',
      parameters: {
        homeExpectedGoals,
        awayExpectedGoals,
        leagueAverage: leagueAvgGoals,
      },
      prediction: homeWinProb,
      confidence: 0.75,
    };
  }

  /**
   * Expected Goals (xG) Model
   * Uses xG data for more accurate predictions
   */
  private async xGModel(game: GameData): Promise<StatisticalModel> {
    const homeXG = game.homeStats.xG || 0;
    const awayXG = game.awayStats.xG || 0;
    const homeGames = game.homeStats.gamesPlayed || 1;
    const awayGames = game.awayStats.gamesPlayed || 1;

    // Average xG per game
    const homeAvgXG = homeXG / homeGames;
    const awayAvgXG = awayXG / awayGames;

    // Adjust for home advantage
    const adjustedHomeXG = homeAvgXG * 1.15;
    const adjustedAwayXG = awayAvgXG * 0.9;

    // Calculate win probability
    const totalXG = adjustedHomeXG + adjustedAwayXG;
    const homeWinProb = totalXG > 0 ? adjustedHomeXG / totalXG : 0.5;

    return {
      type: 'XG',
      parameters: {
        homeXG: adjustedHomeXG,
        awayXG: adjustedAwayXG,
        xGDifference: adjustedHomeXG - adjustedAwayXG,
      },
      prediction: homeWinProb,
      confidence: 0.8,
    };
  }

  /**
   * ELO Rating Model
   * Universal rating system applicable to all sports
   */
  private async eloModel(game: GameData): Promise<StatisticalModel> {
    // Calculate ELO ratings based on win/loss record
    const homeElo = this.calculateEloRating(game.homeStats);
    const awayElo = this.calculateEloRating(game.awayStats);

    // Home advantage bonus
    const homeAdvantage = 100;
    const adjustedHomeElo = homeElo + homeAdvantage;

    // Calculate expected score (probability)
    const eloDiff = adjustedHomeElo - awayElo;
    const homeWinProb = 1 / (1 + Math.pow(10, -eloDiff / 400));

    return {
      type: 'ELO',
      parameters: {
        homeElo,
        awayElo,
        eloDifference: eloDiff,
        homeAdvantage,
      },
      prediction: homeWinProb,
      confidence: 0.7,
    };
  }

  /**
   * Efficiency Model
   * Based on team efficiency metrics
   */
  private async efficiencyModel(game: GameData): Promise<StatisticalModel> {
    const homeEfficiency = this.calculateEfficiency(game.homeStats);
    const awayEfficiency = this.calculateEfficiency(game.awayStats);

    const totalEfficiency = homeEfficiency + awayEfficiency;
    const homeWinProb =
      totalEfficiency > 0 ? homeEfficiency / totalEfficiency : 0.5;

    return {
      type: 'EFFICIENCY',
      parameters: {
        homeEfficiency,
        awayEfficiency,
        efficiencyDiff: homeEfficiency - awayEfficiency,
      },
      prediction: homeWinProb,
      confidence: 0.65,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Combine multiple model predictions using confidence-weighted averaging
   */
  private combineModels(models: StatisticalModel[]): {
    probability: number;
    confidence: number;
  } {
    const totalConfidence = models.reduce((sum, m) => sum + m.confidence, 0);

    const weightedProbability = models.reduce(
      (sum, m) => sum + m.prediction * m.confidence,
      0
    );

    return {
      probability: weightedProbability / totalConfidence,
      confidence: totalConfidence / models.length,
    };
  }

  /**
   * Calculate Poisson probability for match outcomes
   */
  private poissonProbability(
    homeExpected: number,
    awayExpected: number,
    outcome: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN'
  ): number {
    // Simplified Poisson calculation
    // In production, use full Poisson distribution
    const diff = homeExpected - awayExpected;

    if (outcome === 'HOME_WIN') {
      return 1 / (1 + Math.exp(-diff));
    } else if (outcome === 'AWAY_WIN') {
      return 1 / (1 + Math.exp(diff));
    } else {
      // DRAW
      return Math.exp(-Math.abs(diff)) * 0.3;
    }
  }

  /**
   * Calculate ELO rating from team stats
   */
  private calculateEloRating(stats: TeamStats): number {
    const baseElo = 1500;
    const k = 32;

    const winRate = stats.wins / stats.gamesPlayed;
    const expectedWinRate = 0.5;

    const eloChange = k * (winRate - expectedWinRate) * stats.gamesPlayed;

    return baseElo + eloChange;
  }

  /**
   * Calculate team efficiency rating
   */
  private calculateEfficiency(stats: TeamStats): number {
    // Points per game
    const ppg = (stats.wins * 3 + stats.draws) / stats.gamesPlayed;

    // Goal difference factor
    const goalDiff = (stats.goalsScored || 0) - (stats.goalsConceded || 0);
    const gdFactor = goalDiff / stats.gamesPlayed;

    // Recent form factor
    const recentWins = stats.recentForm.filter((f) => f.result === 'W').length;
    const formFactor = recentWins / Math.min(stats.recentForm.length, 5);

    return ppg * 0.5 + gdFactor * 0.3 + formFactor * 0.2;
  }

  /**
   * Calculate expected value
   */
  private calculateExpectedValue(
    probability: number,
    odds: any,
    predictionType: PredictionType
  ): number {
    // Get the relevant odds for the prediction type
    let decimalOdds = 1.0;

    if (predictionType === 'MATCH_RESULT') {
      decimalOdds = odds.homeWin || 1.0;
    } else if (predictionType === 'OVER_UNDER') {
      decimalOdds = odds.totalGoals?.over25 || 1.0;
    } else if (predictionType === 'BTTS') {
      decimalOdds = odds.btts?.yes || 1.0;
    }

    // EV = (Probability × Decimal Odds) - 1
    return probability * decimalOdds - 1;
  }

  /**
   * Calculate BTTS (Both Teams To Score) probability
   */
  calculateBTTSProbability(game: GameData): number {
    const homeScoreProb = (game.homeStats.goalsScored || 0) / game.homeStats.gamesPlayed;
    const awayScoreProb = (game.awayStats.goalsScored || 0) / game.awayStats.gamesPlayed;

    // Simple model: independent probabilities
    return Math.min(homeScoreProb * awayScoreProb * 1.5, 0.95);
  }

  /**
   * Calculate Over/Under probability
   */
  calculateOverUnderProbability(
    game: GameData,
    line: number
  ): { over: number; under: number } {
    const homeAvg = (game.homeStats.goalsScored || 0) / game.homeStats.gamesPlayed;
    const awayAvg = (game.awayStats.goalsScored || 0) / game.awayStats.gamesPlayed;

    const expectedTotal = homeAvg + awayAvg;

    // Simplified normal distribution approximation
    const diff = expectedTotal - line;
    const overProb = 1 / (1 + Math.exp(-diff));

    return {
      over: overProb,
      under: 1 - overProb,
    };
  }
}

export default StatisticalFoundation;
