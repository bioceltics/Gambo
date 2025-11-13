/**
 * Bayesian Inference Engine
 * Updates probabilities based on evidence and prior beliefs
 * Implements sophisticated probability theory for sports predictions
 */

export interface BayesianPrior {
  homeWinRate: number;
  drawRate: number;
  awayWinRate: number;
  confidence: number; // How strongly we believe in the prior
}

export interface Evidence {
  type: 'FORM' | 'H2H' | 'INJURY' | 'MARKET' | 'STATISTICAL' | 'TACTICAL';
  likelihood: number; // P(Evidence | Hypothesis)
  strength: number; // How reliable is this evidence (0-1)
  direction: 'HOME' | 'DRAW' | 'AWAY';
}

export class BayesianInference {
  /**
   * Update probability using Bayes' theorem with multiple pieces of evidence
   * P(H|E) = P(E|H) * P(H) / P(E)
   */
  updateProbability(
    prior: BayesianPrior,
    evidence: Evidence[]
  ): { homeWin: number; draw: number; awayWin: number; confidence: number } {
    // Start with prior probabilities
    let homeProb = prior.homeWinRate;
    let drawProb = prior.drawRate;
    let awayProb = prior.awayWinRate;

    // Track confidence - decreases if evidence conflicts
    let confidence = prior.confidence;

    // Apply each piece of evidence using iterative Bayesian updating
    for (const e of evidence) {
      const update = this.applySingleEvidence(
        { homeWin: homeProb, draw: drawProb, awayWin: awayProb },
        e
      );

      homeProb = update.homeWin;
      drawProb = update.draw;
      awayProb = update.awayWin;

      // Update confidence based on evidence strength and consistency
      confidence = this.updateConfidence(confidence, e, update);
    }

    // Normalize probabilities to sum to 1
    const total = homeProb + drawProb + awayProb;

    return {
      homeWin: homeProb / total,
      draw: drawProb / total,
      awayWin: awayProb / total,
      confidence: Math.min(0.99, Math.max(0.01, confidence)),
    };
  }

  /**
   * Apply single piece of evidence using Bayes' theorem
   */
  private applySingleEvidence(
    current: { homeWin: number; draw: number; awayWin: number },
    evidence: Evidence
  ): { homeWin: number; draw: number; awayWin: number } {
    const { likelihood, strength, direction } = evidence;

    // Calculate likelihood ratios based on evidence direction
    const likelihoodRatios = this.calculateLikelihoodRatios(
      direction,
      likelihood,
      strength
    );

    // Apply Bayesian update
    const homeUpdated = current.homeWin * likelihoodRatios.home;
    const drawUpdated = current.draw * likelihoodRatios.draw;
    const awayUpdated = current.awayWin * likelihoodRatios.away;

    // Normalize
    const total = homeUpdated + drawUpdated + awayUpdated;

    return {
      homeWin: homeUpdated / total,
      draw: drawUpdated / total,
      awayWin: awayUpdated / total,
    };
  }

  /**
   * Calculate likelihood ratios for each outcome
   */
  private calculateLikelihoodRatios(
    direction: 'HOME' | 'DRAW' | 'AWAY',
    likelihood: number,
    strength: number
  ): { home: number; draw: number; away: number } {
    // Strength determines how much the evidence shifts probabilities
    const shiftFactor = 1 + (likelihood - 1) * strength;

    if (direction === 'HOME') {
      return {
        home: shiftFactor,
        draw: 1 / Math.sqrt(shiftFactor), // Inverse relationship
        away: 1 / shiftFactor,
      };
    } else if (direction === 'AWAY') {
      return {
        home: 1 / shiftFactor,
        draw: 1 / Math.sqrt(shiftFactor),
        away: shiftFactor,
      };
    } else {
      // DRAW
      return {
        home: 1 / Math.sqrt(shiftFactor),
        draw: shiftFactor,
        away: 1 / Math.sqrt(shiftFactor),
      };
    }
  }

  /**
   * Update confidence based on evidence consistency
   */
  private updateConfidence(
    currentConfidence: number,
    evidence: Evidence,
    update: { homeWin: number; draw: number; awayWin: number }
  ): number {
    // High-strength evidence from reliable sources increases confidence
    // Conflicting evidence decreases confidence

    const evidenceBoost = evidence.strength * 0.1;

    // Check if this evidence aligns with current prediction
    const maxProb = Math.max(update.homeWin, update.draw, update.awayWin);
    const alignment = maxProb > 0.4 ? 1 : 0.8; // Penalize if no clear favorite

    return currentConfidence * alignment + evidenceBoost;
  }

  /**
   * Calculate posterior predictive distribution
   * Accounts for uncertainty in parameter estimates
   */
  calculatePosteriorPredictive(
    prior: BayesianPrior,
    evidence: Evidence[],
    samples: number = 1000
  ): { mean: number; variance: number; confidence95: [number, number] } {
    const results: number[] = [];

    // Monte Carlo sampling from posterior distribution
    for (let i = 0; i < samples; i++) {
      const noisyEvidence = evidence.map(e => ({
        ...e,
        likelihood: this.addNoise(e.likelihood, 0.05),
      }));

      const posterior = this.updateProbability(prior, noisyEvidence);
      results.push(posterior.homeWin);
    }

    // Calculate statistics
    const mean = results.reduce((a, b) => a + b, 0) / samples;
    const variance =
      results.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples;

    // 95% confidence interval
    const sorted = results.sort((a, b) => a - b);
    const lowerIdx = Math.floor(samples * 0.025);
    const upperIdx = Math.floor(samples * 0.975);

    return {
      mean,
      variance,
      confidence95: [sorted[lowerIdx], sorted[upperIdx]],
    };
  }

  /**
   * Add noise for Monte Carlo sampling
   */
  private addNoise(value: number, stdDev: number): number {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    return Math.max(0, Math.min(1, value + z0 * stdDev));
  }

  /**
   * Compare model predictions with market odds using Bayesian model comparison
   */
  bayesianModelComparison(
    modelProbability: number,
    marketImpliedProbability: number,
    priorModelAccuracy: number = 0.65
  ): { edgeSignificance: number; betRecommendation: 'STRONG' | 'MODERATE' | 'WEAK' | 'NO_BET' } {
    // Calculate Bayes Factor - how much more likely is our model vs market?
    const bayesFactor =
      (modelProbability / (1 - modelProbability)) /
      (marketImpliedProbability / (1 - marketImpliedProbability));

    // Update our belief in the model's accuracy
    const posteriorModelAccuracy =
      (bayesFactor * priorModelAccuracy) /
      (bayesFactor * priorModelAccuracy + (1 - priorModelAccuracy));

    // Calculate edge significance
    const rawEdge = modelProbability - marketImpliedProbability;
    const edgeSignificance = rawEdge * posteriorModelAccuracy;

    // Betting recommendation based on edge significance
    let betRecommendation: 'STRONG' | 'MODERATE' | 'WEAK' | 'NO_BET';

    if (edgeSignificance > 0.10 && posteriorModelAccuracy > 0.75) {
      betRecommendation = 'STRONG';
    } else if (edgeSignificance > 0.05 && posteriorModelAccuracy > 0.65) {
      betRecommendation = 'MODERATE';
    } else if (edgeSignificance > 0.02 && posteriorModelAccuracy > 0.55) {
      betRecommendation = 'WEAK';
    } else {
      betRecommendation = 'NO_BET';
    }

    return {
      edgeSignificance,
      betRecommendation,
    };
  }
}

export default BayesianInference;
