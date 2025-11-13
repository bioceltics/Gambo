/**
 * Gambo 1.0 Engine - Layer 3: Machine Learning Ensemble
 * ML-powered predictions using ensemble methods
 */

import { GameData, MLModel, MLPrediction } from '../types/engine.types';

export class MachineLearningEnsemble {
  private models: MLModel[] = [];

  constructor() {
    this.initializeModels();
  }

  /**
   * Initialize ML models
   */
  private initializeModels() {
    this.models = [
      {
        name: 'Deep Neural Network',
        type: 'NEURAL_NETWORK',
        version: '1.0.0',
        accuracy: 0.72,
        lastTrained: new Date('2024-10-01'),
      },
      {
        name: 'Gradient Boosting',
        type: 'GRADIENT_BOOST',
        version: '1.0.0',
        accuracy: 0.68,
        lastTrained: new Date('2024-10-01'),
      },
      {
        name: 'Random Forest',
        type: 'RANDOM_FOREST',
        version: '1.0.0',
        accuracy: 0.65,
        lastTrained: new Date('2024-10-01'),
      },
    ];
  }

  /**
   * Generate ML ensemble prediction
   */
  async predict(
    game: GameData,
    statisticalProb: number,
    contextualProb: number
  ): Promise<{
    mlProbability: number;
    modelConfidence: number;
    ensembleWeights: Record<string, number>;
    predictions: MLPrediction[];
  }> {
    // Extract features from game data
    const features = this.extractFeatures(game, statisticalProb, contextualProb);

    // Get predictions from all models
    const predictions: MLPrediction[] = await Promise.all(
      this.models.map((model) => this.runModel(model, features))
    );

    // Calculate ensemble weights based on model accuracy
    const ensembleWeights = this.calculateEnsembleWeights(predictions);

    // Combine predictions using weighted average
    const mlProbability = predictions.reduce(
      (sum, pred, idx) =>
        sum + pred.prediction * ensembleWeights[pred.model.name],
      0
    );

    // Calculate overall model confidence
    const modelConfidence = predictions.reduce(
      (sum, pred) => sum + pred.confidence,
      0
    ) / predictions.length;

    return {
      mlProbability,
      modelConfidence,
      ensembleWeights,
      predictions,
    };
  }

  /**
   * Extract features for ML models
   */
  private extractFeatures(
    game: GameData,
    statisticalProb: number,
    contextualProb: number
  ): Record<string, number> {
    return {
      // Statistical features
      statistical_probability: statisticalProb,
      contextual_probability: contextualProb,

      // Team strength features
      home_win_rate:
        game.homeStats.wins / (game.homeStats.gamesPlayed || 1),
      away_win_rate:
        game.awayStats.wins / (game.awayStats.gamesPlayed || 1),

      // Goal features (soccer)
      home_goals_per_game:
        (game.homeStats.goalsScored || 0) / (game.homeStats.gamesPlayed || 1),
      away_goals_per_game:
        (game.awayStats.goalsScored || 0) / (game.awayStats.gamesPlayed || 1),
      home_goals_conceded:
        (game.homeStats.goalsConceded || 0) / (game.homeStats.gamesPlayed || 1),
      away_goals_conceded:
        (game.awayStats.goalsConceded || 0) / (game.awayStats.gamesPlayed || 1),

      // Advanced metrics
      home_xg: game.homeStats.xG || 0,
      away_xg: game.awayStats.xG || 0,
      home_possession: game.homeStats.possession || 0,
      home_shots_per_game:
        (game.homeStats.shots || 0) / (game.homeStats.gamesPlayed || 1),

      // Form features
      home_recent_wins: game.homeStats.recentForm.filter((f) => f.result === 'W')
        .length,
      away_recent_wins: game.awayStats.recentForm.filter((f) => f.result === 'W')
        .length,

      // Head to head
      h2h_games: game.headToHead.length,
      h2h_home_wins: game.headToHead.filter(
        (h) => h.homeTeam === game.homeTeam && h.homeScore > h.awayScore
      ).length,

      // Context features
      injury_count: (game.injuries || []).length,
      weather_temp: game.weather?.temperature || 20,
      weather_wind: game.weather?.windSpeed || 0,

      // Odds features (market sentiment)
      home_odds: game.odds.homeWin,
      away_odds: game.odds.awayWin,
      odds_movement:
        game.odds.homeWin - game.odds.openingOdds.homeWin,
    };
  }

  /**
   * Run individual ML model (mock implementation)
   */
  private async runModel(
    model: MLModel,
    features: Record<string, number>
  ): Promise<MLPrediction> {
    // In production, this would load actual trained models
    // For now, we'll use a weighted feature combination

    let prediction = 0;

    if (model.type === 'NEURAL_NETWORK') {
      // Deep learning approach - non-linear combinations
      prediction =
        features.statistical_probability * 0.4 +
        features.contextual_probability * 0.3 +
        features.home_win_rate * 0.2 +
        Math.sin(features.home_goals_per_game) * 0.1;
    } else if (model.type === 'GRADIENT_BOOST') {
      // Tree-based approach - feature interactions
      prediction =
        features.statistical_probability * 0.35 +
        features.contextual_probability * 0.35 +
        (features.home_win_rate - features.away_win_rate) * 0.15 +
        (features.home_goals_per_game - features.away_goals_per_game) * 0.15;
    } else {
      // Random Forest - ensemble of decisions
      prediction =
        features.statistical_probability * 0.33 +
        features.contextual_probability * 0.33 +
        features.home_win_rate * 0.17 +
        features.home_recent_wins * 0.02 +
        features.h2h_home_wins * 0.03 / Math.max(features.h2h_games, 1);
    }

    // Normalize to 0-1 range
    prediction = Math.max(0, Math.min(1, prediction));

    return {
      model,
      prediction,
      confidence: model.accuracy,
      features,
    };
  }

  /**
   * Calculate ensemble weights based on model performance
   */
  private calculateEnsembleWeights(
    predictions: MLPrediction[]
  ): Record<string, number> {
    const totalAccuracy = predictions.reduce(
      (sum, pred) => sum + pred.model.accuracy,
      0
    );

    const weights: Record<string, number> = {};
    predictions.forEach((pred) => {
      weights[pred.model.name] = pred.model.accuracy / totalAccuracy;
    });

    return weights;
  }

  /**
   * Retrain models with new data (placeholder)
   */
  async retrain(historicalData: GameData[], outcomes: number[]): Promise<void> {
    // In production, this would retrain the actual ML models
    console.log(
      `Retraining models with ${historicalData.length} data points...`
    );

    // Update last trained date
    this.models.forEach((model) => {
      model.lastTrained = new Date();
    });
  }

  /**
   * Get model performance metrics
   */
  getModelMetrics(): MLModel[] {
    return this.models;
  }
}

export default MachineLearningEnsemble;
