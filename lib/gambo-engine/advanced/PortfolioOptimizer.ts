/**
 * Portfolio Theory for Bundle Optimization
 * Applies Modern Portfolio Theory (MPT) to betting bundles
 * Optimizes for maximum Sharpe ratio and minimizes correlation risk
 */

export interface BundleAsset {
  id: string;
  expectedReturn: number; // Expected value
  variance: number; // Risk (variance of outcome)
  probability: number; // Win probability
  odds: number;
  sport: string;
  league: string;
  gameTime: Date;
}

export interface CorrelationMatrix {
  [assetId: string]: { [assetId: string]: number };
}

export interface OptimizedPortfolio {
  assets: BundleAsset[];
  expectedReturn: number;
  portfolioVariance: number;
  sharpeRatio: number;
  diversificationScore: number;
  correlationRisk: number;
  weights: number[]; // Suggested stake weights
}

export class PortfolioOptimizer {
  private riskFreeRate = 0.0; // Betting has no true risk-free rate

  /**
   * Optimize bundle selection using Modern Portfolio Theory
   * Maximizes Sharpe Ratio: (Return - RiskFree) / Volatility
   */
  optimizeBundle(
    candidates: BundleAsset[],
    targetSize: number,
    targetReturn: number,
    maxCorrelation: number = 0.7
  ): OptimizedPortfolio {
    // Generate all possible combinations of target size
    const combinations = this.generateCombinations(candidates, targetSize);

    let bestPortfolio: OptimizedPortfolio | null = null;
    let bestSharpe = -Infinity;

    for (const combo of combinations) {
      // Calculate correlation matrix for this combination
      const correlations = this.calculateCorrelationMatrix(combo);

      // Skip if too highly correlated
      const avgCorrelation = this.getAverageCorrelation(correlations);
      if (avgCorrelation > maxCorrelation) continue;

      // Calculate portfolio metrics
      const portfolio = this.calculatePortfolioMetrics(combo, correlations);

      // Check if close to target return
      const returnDiff = Math.abs(portfolio.expectedReturn - targetReturn);
      if (returnDiff / targetReturn > 0.2) continue; // Within 20% of target

      // Calculate Sharpe ratio
      const sharpe = this.calculateSharpeRatio(
        portfolio.expectedReturn,
        portfolio.portfolioVariance
      );

      // Update best if this is better
      if (sharpe > bestSharpe) {
        bestSharpe = sharpe;
        bestPortfolio = {
          ...portfolio,
          sharpeRatio: sharpe,
        };
      }
    }

    if (!bestPortfolio) {
      // Fallback: select highest EV assets
      const sorted = candidates
        .sort((a, b) => b.expectedReturn - a.expectedReturn)
        .slice(0, targetSize);

      const correlations = this.calculateCorrelationMatrix(sorted);
      bestPortfolio = this.calculatePortfolioMetrics(sorted, correlations);
      bestPortfolio.sharpeRatio = this.calculateSharpeRatio(
        bestPortfolio.expectedReturn,
        bestPortfolio.portfolioVariance
      );
    }

    return bestPortfolio;
  }

  /**
   * Calculate correlation between two assets
   * Based on sport, league, timing, and game dependencies
   */
  private calculateCorrelation(asset1: BundleAsset, asset2: BundleAsset): number {
    let correlation = 0.0;

    // Same sport increases correlation
    if (asset1.sport === asset2.sport) {
      correlation += 0.3;
    }

    // Same league increases correlation significantly
    if (asset1.league === asset2.league) {
      correlation += 0.4;
    }

    // Games at similar times are correlated (weather, conditions)
    const timeDiffHours =
      Math.abs(asset1.gameTime.getTime() - asset2.gameTime.getTime()) /
      (1000 * 60 * 60);

    if (timeDiffHours < 2) {
      correlation += 0.2;
    } else if (timeDiffHours < 6) {
      correlation += 0.1;
    }

    // Similar odds suggest similar risk profiles
    const oddsDiff = Math.abs(asset1.odds - asset2.odds);
    if (oddsDiff < 0.5) {
      correlation += 0.1;
    }

    return Math.min(0.95, correlation);
  }

  /**
   * Build correlation matrix for portfolio
   */
  private calculateCorrelationMatrix(assets: BundleAsset[]): CorrelationMatrix {
    const matrix: CorrelationMatrix = {};

    for (const asset1 of assets) {
      matrix[asset1.id] = {};

      for (const asset2 of assets) {
        if (asset1.id === asset2.id) {
          matrix[asset1.id][asset2.id] = 1.0; // Perfect correlation with self
        } else {
          matrix[asset1.id][asset2.id] = this.calculateCorrelation(
            asset1,
            asset2
          );
        }
      }
    }

    return matrix;
  }

  /**
   * Calculate portfolio variance using correlation matrix
   * σ²_p = Σ Σ w_i w_j σ_i σ_j ρ_ij
   */
  private calculatePortfolioVariance(
    assets: BundleAsset[],
    correlations: CorrelationMatrix,
    weights: number[]
  ): number {
    let variance = 0;

    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        const correlation = correlations[assets[i].id][assets[j].id];
        const stdDev_i = Math.sqrt(assets[i].variance);
        const stdDev_j = Math.sqrt(assets[j].variance);

        variance +=
          weights[i] * weights[j] * stdDev_i * stdDev_j * correlation;
      }
    }

    return variance;
  }

  /**
   * Calculate full portfolio metrics
   */
  private calculatePortfolioMetrics(
    assets: BundleAsset[],
    correlations: CorrelationMatrix
  ): OptimizedPortfolio {
    // For accumulator bets, all assets have equal importance
    const equalWeights = assets.map(() => 1 / assets.length);

    // Calculate expected return (product of probabilities * combined odds)
    const combinedOdds = assets.reduce((acc, a) => acc * a.odds, 1);
    const winProbability = assets.reduce((acc, a) => acc * a.probability, 1);
    const expectedReturn = winProbability * combinedOdds;

    // Calculate variance
    const variance = this.calculatePortfolioVariance(
      assets,
      correlations,
      equalWeights
    );

    // Calculate diversification score
    const diversificationScore = this.calculateDiversification(assets);

    // Calculate average correlation (risk metric)
    const correlationRisk = this.getAverageCorrelation(correlations);

    return {
      assets,
      expectedReturn,
      portfolioVariance: variance,
      sharpeRatio: 0, // Calculated later
      diversificationScore,
      correlationRisk,
      weights: equalWeights,
    };
  }

  /**
   * Calculate Sharpe Ratio
   * SR = (E[R] - Rf) / σ
   */
  private calculateSharpeRatio(
    expectedReturn: number,
    variance: number
  ): number {
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    return (expectedReturn - this.riskFreeRate - 1) / stdDev;
  }

  /**
   * Calculate diversification score
   * Higher score = better diversification across sports, leagues, times
   */
  private calculateDiversification(assets: BundleAsset[]): number {
    const sports = new Set(assets.map(a => a.sport));
    const leagues = new Set(assets.map(a => a.league));

    // Time diversity - spread across different time windows
    const times = assets.map(a => a.gameTime.getTime());
    const timeSpread = Math.max(...times) - Math.min(...times);
    const hoursSpread = timeSpread / (1000 * 60 * 60);

    const sportDiversity = sports.size / assets.length;
    const leagueDiversity = leagues.size / assets.length;
    const timeDiversity = Math.min(1, hoursSpread / 24); // Normalize to 0-1

    return (sportDiversity + leagueDiversity + timeDiversity) / 3;
  }

  /**
   * Get average correlation (excluding diagonal)
   */
  private getAverageCorrelation(correlations: CorrelationMatrix): number {
    const keys = Object.keys(correlations);
    let sum = 0;
    let count = 0;

    for (const key1 of keys) {
      for (const key2 of keys) {
        if (key1 !== key2) {
          sum += correlations[key1][key2];
          count++;
        }
      }
    }

    return count > 0 ? sum / count : 0;
  }

  /**
   * Generate all combinations of size k
   */
  private generateCombinations(
    assets: BundleAsset[],
    size: number
  ): BundleAsset[][] {
    if (size > assets.length) return [];
    if (size === 1) return assets.map(a => [a]);
    if (size === assets.length) return [assets];

    const combinations: BundleAsset[][] = [];

    const generate = (start: number, combo: BundleAsset[]) => {
      if (combo.length === size) {
        combinations.push([...combo]);
        return;
      }

      for (let i = start; i < assets.length; i++) {
        combo.push(assets[i]);
        generate(i + 1, combo);
        combo.pop();
      }
    };

    generate(0, []);
    return combinations;
  }

  /**
   * Calculate optimal Kelly stakes for portfolio
   * Accounts for correlation between bets
   */
  calculateKellyStakes(
    portfolio: OptimizedPortfolio,
    bankroll: number,
    kellyFraction: number = 0.25
  ): number[] {
    const stakes: number[] = [];

    for (const asset of portfolio.assets) {
      // Kelly formula: f* = (bp - q) / b
      // where b = odds - 1, p = probability, q = 1 - p
      const b = asset.odds - 1;
      const p = asset.probability;
      const q = 1 - p;

      const kellyFraction_raw = (b * p - q) / b;

      // Apply fractional Kelly for safety
      const kellyFraction_safe = kellyFraction_raw * kellyFraction;

      // Adjust for correlation risk
      const correlationAdjustment = 1 - portfolio.correlationRisk * 0.3;
      const finalKelly = Math.max(
        0,
        Math.min(0.1, kellyFraction_safe * correlationAdjustment)
      );

      stakes.push(finalKelly);
    }

    return stakes;
  }

  /**
   * Evaluate portfolio quality score (0-100)
   */
  scorePortfolio(portfolio: OptimizedPortfolio): number {
    const sharpeScore = Math.min(100, portfolio.sharpeRatio * 20 + 50);
    const diversificationScore = portfolio.diversificationScore * 100;
    const correlationScore = (1 - portfolio.correlationRisk) * 100;
    const returnScore = Math.min(100, (portfolio.expectedReturn / 1.5) * 100);

    return (
      sharpeScore * 0.3 +
      diversificationScore * 0.25 +
      correlationScore * 0.25 +
      returnScore * 0.2
    );
  }
}

export default PortfolioOptimizer;
