/**
 * Adaptive Learning System
 * Learns from prediction outcomes and dynamically adjusts model weights
 * Implements online learning and model calibration
 */

export interface PredictionRecord {
  predictionId: string;
  timestamp: Date;
  predictedProbability: number;
  actualOutcome: boolean; // Did prediction win?
  odds: number;
  modelWeights: { [model: string]: number };
  features: { [key: string]: number };
}

export interface ModelPerformance {
  modelId: string;
  accuracy: number;
  calibration: number; // How well probabilities match actual frequencies
  sharpeRatio: number;
  roi: number; // Return on investment
  betsPlaced: number;
  betsWon: number;
  totalStake: number;
  totalReturn: number;
  recentPerformance: number; // Last 100 bets
}

export interface CalibrationCurve {
  bins: {
    predictedProbability: number;
    actualFrequency: number;
    count: number;
  }[];
  brierScore: number; // Lower is better (0-1)
  logLoss: number; // Lower is better
}

export class AdaptiveLearningSystem {
  private predictionHistory: PredictionRecord[] = [];
  private modelWeights: Map<string, number> = new Map();
  private learningRate = 0.01;

  constructor() {
    // Initialize model weights
    this.modelWeights.set('statistical', 0.25);
    this.modelWeights.set('contextual', 0.25);
    this.modelWeights.set('machineLearning', 0.35);
    this.modelWeights.set('market', 0.15);
  }

  /**
   * Record a prediction and its outcome
   */
  recordPrediction(record: PredictionRecord): void {
    this.predictionHistory.push(record);

    // Trim history to last 10,000 predictions
    if (this.predictionHistory.length > 10000) {
      this.predictionHistory = this.predictionHistory.slice(-10000);
    }
  }

  /**
   * Update model weights based on recent performance
   * Uses gradient descent to minimize prediction error
   */
  updateModelWeights(): void {
    if (this.predictionHistory.length < 100) {
      return; // Need minimum data
    }

    // Analyze recent performance (last 500 predictions)
    const recentPredictions = this.predictionHistory.slice(-500);

    // Calculate performance by model contribution
    const modelGradients = this.calculateModelGradients(recentPredictions);

    // Update weights using gradient descent
    for (const [model, gradient] of Object.entries(modelGradients)) {
      const currentWeight = this.modelWeights.get(model) || 0.25;

      // Gradient descent update
      const newWeight = currentWeight - this.learningRate * gradient;

      this.modelWeights.set(model, newWeight);
    }

    // Normalize weights to sum to 1
    this.normalizeWeights();

    console.log('📊 Updated model weights:', Object.fromEntries(this.modelWeights));
  }

  /**
   * Calculate gradients for each model
   * Based on contribution to prediction error
   */
  private calculateModelGradients(
    predictions: PredictionRecord[]
  ): { [model: string]: number } {
    const gradients: { [model: string]: number } = {
      statistical: 0,
      contextual: 0,
      machineLearning: 0,
      market: 0,
    };

    for (const pred of predictions) {
      // Calculate prediction error
      const predictedProb = pred.predictedProbability;
      const actual = pred.actualOutcome ? 1 : 0;
      const error = predictedProb - actual;

      // Attribute error to each model based on its weight
      for (const [model, weight] of Object.entries(pred.modelWeights)) {
        // Gradient is proportional to model's contribution to error
        gradients[model] += error * weight;
      }
    }

    // Average gradients
    const count = predictions.length;
    for (const model of Object.keys(gradients)) {
      gradients[model] /= count;
    }

    return gradients;
  }

  /**
   * Normalize weights to sum to 1
   */
  private normalizeWeights(): void {
    const total = Array.from(this.modelWeights.values()).reduce((a, b) => a + b, 0);

    for (const [model, weight] of this.modelWeights.entries()) {
      this.modelWeights.set(model, weight / total);
    }
  }

  /**
   * Calculate calibration curve
   * Measures how well predicted probabilities match actual frequencies
   */
  calculateCalibration(binCount: number = 10): CalibrationCurve {
    if (this.predictionHistory.length < 50) {
      return this.getDefaultCalibration();
    }

    // Create probability bins
    const bins: {
      predictedProbability: number;
      actualFrequency: number;
      count: number;
    }[] = [];

    const binSize = 1.0 / binCount;

    for (let i = 0; i < binCount; i++) {
      const binMin = i * binSize;
      const binMax = (i + 1) * binSize;
      const binCenter = (binMin + binMax) / 2;

      // Get predictions in this bin
      const binPredictions = this.predictionHistory.filter(
        p => p.predictedProbability >= binMin && p.predictedProbability < binMax
      );

      if (binPredictions.length > 0) {
        const wins = binPredictions.filter(p => p.actualOutcome).length;
        const actualFrequency = wins / binPredictions.length;

        bins.push({
          predictedProbability: binCenter,
          actualFrequency,
          count: binPredictions.length,
        });
      }
    }

    // Calculate Brier Score
    const brierScore = this.calculateBrierScore(this.predictionHistory);

    // Calculate Log Loss
    const logLoss = this.calculateLogLoss(this.predictionHistory);

    return {
      bins,
      brierScore,
      logLoss,
    };
  }

  /**
   * Calculate Brier Score (mean squared error for probabilities)
   * Brier = (1/N) Σ (predicted_i - actual_i)²
   */
  private calculateBrierScore(predictions: PredictionRecord[]): number {
    const squaredErrors = predictions.map(p => {
      const actual = p.actualOutcome ? 1 : 0;
      return Math.pow(p.predictedProbability - actual, 2);
    });

    return squaredErrors.reduce((a, b) => a + b, 0) / predictions.length;
  }

  /**
   * Calculate Log Loss (cross-entropy loss)
   * LogLoss = -(1/N) Σ [y*log(p) + (1-y)*log(1-p)]
   */
  private calculateLogLoss(predictions: PredictionRecord[]): number {
    const losses = predictions.map(p => {
      const actual = p.actualOutcome ? 1 : 0;
      const predicted = Math.max(0.001, Math.min(0.999, p.predictedProbability)); // Clip

      if (actual === 1) {
        return -Math.log(predicted);
      } else {
        return -Math.log(1 - predicted);
      }
    });

    return losses.reduce((a, b) => a + b, 0) / predictions.length;
  }

  /**
   * Evaluate model performance over time
   */
  evaluateModelPerformance(modelId: string, windowSize: number = 1000): ModelPerformance {
    const relevantPredictions = this.predictionHistory
      .filter(p => p.modelWeights[modelId] && p.modelWeights[modelId] > 0)
      .slice(-windowSize);

    if (relevantPredictions.length === 0) {
      return this.getDefaultPerformance(modelId);
    }

    // Calculate accuracy
    const wins = relevantPredictions.filter(p => p.actualOutcome).length;
    const accuracy = wins / relevantPredictions.length;

    // Calculate calibration
    const calibrationData = relevantPredictions.map(p => ({
      predicted: p.predictedProbability,
      actual: p.actualOutcome ? 1 : 0,
    }));

    const calibration = 1 - this.calculateBrierScore(relevantPredictions);

    // Calculate ROI
    const totalStake = relevantPredictions.length; // Assume unit stakes
    const totalReturn = relevantPredictions.reduce((sum, p) => {
      return sum + (p.actualOutcome ? p.odds : 0);
    }, 0);
    const roi = ((totalReturn - totalStake) / totalStake) * 100;

    // Calculate Sharpe Ratio
    const returns = relevantPredictions.map(p => {
      return p.actualOutcome ? p.odds - 1 : -1;
    });

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    // Recent performance (last 100)
    const recent = relevantPredictions.slice(-100);
    const recentWins = recent.filter(p => p.actualOutcome).length;
    const recentPerformance = recent.length > 0 ? recentWins / recent.length : 0;

    return {
      modelId,
      accuracy,
      calibration,
      sharpeRatio,
      roi,
      betsPlaced: relevantPredictions.length,
      betsWon: wins,
      totalStake,
      totalReturn,
      recentPerformance,
    };
  }

  /**
   * Detect concept drift - when model performance degrades
   */
  detectConceptDrift(windowSize: number = 200): {
    driftDetected: boolean;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendation: string;
  } {
    if (this.predictionHistory.length < windowSize * 2) {
      return {
        driftDetected: false,
        severity: 'LOW',
        recommendation: 'Insufficient data for drift detection',
      };
    }

    // Compare recent performance to historical baseline
    const recent = this.predictionHistory.slice(-windowSize);
    const historical = this.predictionHistory.slice(
      -windowSize * 2,
      -windowSize
    );

    const recentAccuracy = recent.filter(p => p.actualOutcome).length / recent.length;
    const historicalAccuracy =
      historical.filter(p => p.actualOutcome).length / historical.length;

    const performanceDrop = historicalAccuracy - recentAccuracy;

    // Also check calibration drift
    const recentBrier = this.calculateBrierScore(recent);
    const historicalBrier = this.calculateBrierScore(historical);
    const calibrationDrift = recentBrier - historicalBrier;

    // Determine drift severity
    let driftDetected = false;
    let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let recommendation = 'Model performance is stable';

    if (performanceDrop > 0.05 || calibrationDrift > 0.03) {
      driftDetected = true;

      if (performanceDrop > 0.10 || calibrationDrift > 0.06) {
        severity = 'HIGH';
        recommendation =
          'Significant concept drift detected. Recommend model retraining with recent data.';
      } else if (performanceDrop > 0.07 || calibrationDrift > 0.04) {
        severity = 'MEDIUM';
        recommendation =
          'Moderate concept drift detected. Consider updating model parameters.';
      } else {
        severity = 'LOW';
        recommendation =
          'Minor concept drift detected. Monitor closely and prepare for retraining.';
      }
    }

    return {
      driftDetected,
      severity,
      recommendation,
    };
  }

  /**
   * Get current adaptive model weights
   */
  getCurrentWeights(): { [model: string]: number } {
    return Object.fromEntries(this.modelWeights);
  }

  /**
   * Get prediction history statistics
   */
  getHistoryStats(): {
    totalPredictions: number;
    overallAccuracy: number;
    avgConfidence: number;
    profitability: number;
  } {
    if (this.predictionHistory.length === 0) {
      return {
        totalPredictions: 0,
        overallAccuracy: 0,
        avgConfidence: 0,
        profitability: 0,
      };
    }

    const wins = this.predictionHistory.filter(p => p.actualOutcome).length;
    const accuracy = wins / this.predictionHistory.length;

    const avgConfidence =
      this.predictionHistory.reduce((sum, p) => sum + p.predictedProbability, 0) /
      this.predictionHistory.length;

    const totalReturn = this.predictionHistory.reduce((sum, p) => {
      return sum + (p.actualOutcome ? p.odds : 0);
    }, 0);

    const profitability =
      ((totalReturn - this.predictionHistory.length) / this.predictionHistory.length) *
      100;

    return {
      totalPredictions: this.predictionHistory.length,
      overallAccuracy: accuracy,
      avgConfidence,
      profitability,
    };
  }

  /**
   * Export learning data for analysis
   */
  exportLearningData(): {
    weights: { [model: string]: number };
    calibration: CalibrationCurve;
    performance: { [model: string]: ModelPerformance };
    drift: any;
  } {
    return {
      weights: this.getCurrentWeights(),
      calibration: this.calculateCalibration(),
      performance: {
        statistical: this.evaluateModelPerformance('statistical'),
        contextual: this.evaluateModelPerformance('contextual'),
        machineLearning: this.evaluateModelPerformance('machineLearning'),
        market: this.evaluateModelPerformance('market'),
      },
      drift: this.detectConceptDrift(),
    };
  }

  // Helper methods
  private getDefaultCalibration(): CalibrationCurve {
    return {
      bins: [],
      brierScore: 0.25,
      logLoss: 0.69,
    };
  }

  private getDefaultPerformance(modelId: string): ModelPerformance {
    return {
      modelId,
      accuracy: 0.5,
      calibration: 0.5,
      sharpeRatio: 0,
      roi: 0,
      betsPlaced: 0,
      betsWon: 0,
      totalStake: 0,
      totalReturn: 0,
      recentPerformance: 0.5,
    };
  }
}

export default AdaptiveLearningSystem;
