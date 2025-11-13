/**
 * Market Efficiency Detector
 * Identifies market inefficiencies, sharp money, and value opportunities
 * Implements advanced market microstructure analysis
 */

export interface OddsMovement {
  timestamp: Date;
  odds: number;
  volume?: number; // Betting volume at this price
  bookmaker: string;
}

export interface MarketDepth {
  bid: number; // Best available back odds
  ask: number; // Best available lay odds
  bidVolume: number;
  askVolume: number;
  spread: number;
}

export interface LineMovementAnalysis {
  direction: 'SHARP_HOME' | 'SHARP_AWAY' | 'PUBLIC_HOME' | 'PUBLIC_AWAY' | 'NEUTRAL';
  sharpMoneyConfidence: number; // 0-1 scale
  steamMove: boolean; // Rapid coordinated line movement
  reverseLineMovement: boolean; // Line moves against public money
  efficiency: number; // Market efficiency score 0-1
  valueOpportunity: number; // Size of potential edge
}

export class MarketEfficiencyDetector {
  /**
   * Analyze odds movement to detect sharp vs public money
   */
  analyzeLineMovement(
    oddsHistory: OddsMovement[],
    publicBettingPercentage: number // % of bets on home team
  ): LineMovementAnalysis {
    if (oddsHistory.length < 2) {
      return this.getDefaultAnalysis();
    }

    // Sort by timestamp
    const sorted = oddsHistory.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const openingOdds = sorted[0].odds;
    const currentOdds = sorted[sorted.length - 1].odds;
    const oddsChange = currentOdds - openingOdds;
    const oddsChangePercent = (oddsChange / openingOdds) * 100;

    // Detect steam move (rapid, significant movement)
    const steamMove = this.detectSteamMove(sorted);

    // Detect reverse line movement
    // Line moves away from public despite heavy public betting
    const reverseLineMovement = this.detectReverseLineMovement(
      oddsChange,
      publicBettingPercentage
    );

    // Calculate sharp money confidence
    const sharpMoneyConfidence = this.calculateSharpConfidence(
      sorted,
      steamMove,
      reverseLineMovement
    );

    // Determine direction
    const direction = this.determineDirection(
      oddsChange,
      publicBettingPercentage,
      sharpMoneyConfidence
    );

    // Calculate market efficiency
    const efficiency = this.calculateMarketEfficiency(sorted);

    // Calculate value opportunity
    const valueOpportunity = this.calculateValueOpportunity(
      oddsChangePercent,
      sharpMoneyConfidence,
      efficiency
    );

    return {
      direction,
      sharpMoneyConfidence,
      steamMove,
      reverseLineMovement,
      efficiency,
      valueOpportunity,
    };
  }

  /**
   * Detect steam move - rapid coordinated line movement across bookmakers
   */
  private detectSteamMove(oddsHistory: OddsMovement[]): boolean {
    if (oddsHistory.length < 3) return false;

    // Check for multiple significant moves in short time
    const recentMoves = oddsHistory.slice(-5); // Last 5 movements
    let significantMoves = 0;

    for (let i = 1; i < recentMoves.length; i++) {
      const change = Math.abs(recentMoves[i].odds - recentMoves[i - 1].odds);
      const percentChange = (change / recentMoves[i - 1].odds) * 100;

      if (percentChange > 2) {
        // More than 2% move
        significantMoves++;
      }
    }

    // Steam move if 3+ significant moves in recent history
    return significantMoves >= 3;
  }

  /**
   * Detect reverse line movement
   * Line moves against public betting percentage
   */
  private detectReverseLineMovement(
    oddsChange: number,
    publicBettingPercentage: number
  ): boolean {
    // If odds increased (implying team is LESS likely to win)
    // But public is heavily backing that team
    // This suggests sharp money on the opposite side

    if (oddsChange > 0 && publicBettingPercentage > 65) {
      return true; // Line moved away despite public backing
    }

    if (oddsChange < 0 && publicBettingPercentage < 35) {
      return true; // Line moved toward despite public fading
    }

    return false;
  }

  /**
   * Calculate confidence in sharp money indicator
   */
  private calculateSharpConfidence(
    oddsHistory: OddsMovement[],
    steamMove: boolean,
    reverseLineMovement: boolean
  ): number {
    let confidence = 0.5; // Start neutral

    // Steam moves are strong sharp indicators
    if (steamMove) {
      confidence += 0.25;
    }

    // Reverse line movement is extremely strong indicator
    if (reverseLineMovement) {
      confidence += 0.30;
    }

    // Consistent directional movement increases confidence
    const consistency = this.calculateMovementConsistency(oddsHistory);
    confidence += consistency * 0.15;

    // Volume analysis (if available)
    const volumeSignal = this.analyzeVolume(oddsHistory);
    confidence += volumeSignal * 0.10;

    return Math.min(0.99, Math.max(0.01, confidence));
  }

  /**
   * Calculate consistency of odds movement direction
   */
  private calculateMovementConsistency(oddsHistory: OddsMovement[]): number {
    if (oddsHistory.length < 2) return 0;

    let consistentMoves = 0;
    let totalMoves = 0;

    for (let i = 1; i < oddsHistory.length; i++) {
      const change = oddsHistory[i].odds - oddsHistory[i - 1].odds;

      if (Math.abs(change) > 0.01) {
        // Significant move
        totalMoves++;

        // Check if in same direction as overall trend
        const overallChange =
          oddsHistory[oddsHistory.length - 1].odds - oddsHistory[0].odds;

        if ((change > 0 && overallChange > 0) || (change < 0 && overallChange < 0)) {
          consistentMoves++;
        }
      }
    }

    return totalMoves > 0 ? consistentMoves / totalMoves : 0;
  }

  /**
   * Analyze betting volume patterns
   */
  private analyzeVolume(oddsHistory: OddsMovement[]): number {
    const withVolume = oddsHistory.filter(oh => oh.volume && oh.volume > 0);

    if (withVolume.length < 2) return 0;

    // Check if volume is increasing with line movement
    const volumeIncrease =
      withVolume[withVolume.length - 1].volume! > withVolume[0].volume!;

    return volumeIncrease ? 0.5 : 0.2;
  }

  /**
   * Determine if sharp or public money is driving line
   */
  private determineDirection(
    oddsChange: number,
    publicBettingPercentage: number,
    sharpConfidence: number
  ): 'SHARP_HOME' | 'SHARP_AWAY' | 'PUBLIC_HOME' | 'PUBLIC_AWAY' | 'NEUTRAL' {
    const isSharp = sharpConfidence > 0.65;

    if (Math.abs(oddsChange) < 0.05) {
      return 'NEUTRAL'; // No significant movement
    }

    // Odds decreased = team more likely to win
    if (oddsChange < 0) {
      return isSharp ? 'SHARP_HOME' : 'PUBLIC_HOME';
    } else {
      return isSharp ? 'SHARP_AWAY' : 'PUBLIC_AWAY';
    }
  }

  /**
   * Calculate market efficiency score
   * Efficient markets are harder to beat but more reliable
   */
  private calculateMarketEfficiency(oddsHistory: OddsMovement[]): number {
    // Factors indicating efficient market:
    // 1. Small spread between bookmakers
    // 2. Smooth, gradual line movement (no erratic jumps)
    // 3. Quick incorporation of new information

    if (oddsHistory.length < 3) return 0.5;

    // Calculate volatility of odds
    const volatility = this.calculateVolatility(oddsHistory);

    // Low volatility = high efficiency
    const volatilityScore = 1 - Math.min(1, volatility / 0.5);

    // Bookmaker consensus (if multiple bookmakers)
    const bookmakers = new Set(oddsHistory.map(oh => oh.bookmaker));
    const consensusScore = Math.min(1, bookmakers.size / 5); // More bookmakers = more efficient

    return (volatilityScore * 0.6 + consensusScore * 0.4);
  }

  /**
   * Calculate odds volatility
   */
  private calculateVolatility(oddsHistory: OddsMovement[]): number {
    const changes = [];

    for (let i = 1; i < oddsHistory.length; i++) {
      const change =
        (oddsHistory[i].odds - oddsHistory[i - 1].odds) / oddsHistory[i - 1].odds;
      changes.push(change);
    }

    if (changes.length === 0) return 0;

    const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
    const variance =
      changes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / changes.length;

    return Math.sqrt(variance);
  }

  /**
   * Calculate size of value opportunity
   */
  private calculateValueOpportunity(
    oddsChangePercent: number,
    sharpConfidence: number,
    efficiency: number
  ): number {
    // Large odds movement + high sharp confidence = big opportunity
    // But tempered by market efficiency

    const rawOpportunity = Math.abs(oddsChangePercent) * sharpConfidence;

    // Less efficient markets offer more value
    const efficiencyMultiplier = 1 + (1 - efficiency) * 0.5;

    return rawOpportunity * efficiencyMultiplier / 100;
  }

  /**
   * Analyze market depth (for exchange betting)
   */
  analyzeMarketDepth(depth: MarketDepth): {
    liquidityScore: number;
    spreadQuality: number;
    marketStrength: number;
  } {
    // Spread quality - tighter spread = better market
    const spreadPercent = ((depth.ask - depth.bid) / depth.bid) * 100;
    const spreadQuality = Math.max(0, 1 - spreadPercent / 5); // 5% spread = 0 quality

    // Liquidity - total volume available
    const totalVolume = depth.bidVolume + depth.askVolume;
    const liquidityScore = Math.min(1, totalVolume / 100000); // Normalize

    // Market strength - balance between bid and ask
    const volumeBalance = Math.min(depth.bidVolume, depth.askVolume) /
      Math.max(depth.bidVolume, depth.askVolume);
    const marketStrength = volumeBalance;

    return {
      liquidityScore,
      spreadQuality,
      marketStrength,
    };
  }

  /**
   * Detect arbitrage opportunities
   */
  detectArbitrage(
    odds1: number,
    odds2: number,
    odds3?: number
  ): { opportunity: boolean; profitMargin: number } {
    const inverse1 = 1 / odds1;
    const inverse2 = 1 / odds2;
    const inverse3 = odds3 ? 1 / odds3 : 0;

    const totalInverse = inverse1 + inverse2 + inverse3;

    // Arbitrage exists if sum of inverses < 1
    if (totalInverse < 1) {
      return {
        opportunity: true,
        profitMargin: (1 - totalInverse) * 100,
      };
    }

    return {
      opportunity: false,
      profitMargin: 0,
    };
  }

  /**
   * Default analysis when insufficient data
   */
  private getDefaultAnalysis(): LineMovementAnalysis {
    return {
      direction: 'NEUTRAL',
      sharpMoneyConfidence: 0.5,
      steamMove: false,
      reverseLineMovement: false,
      efficiency: 0.7,
      valueOpportunity: 0,
    };
  }

  /**
   * Calculate closing line value (CLV)
   * Measures how well you beat the closing odds
   */
  calculateClosingLineValue(
    betOdds: number,
    closingOdds: number
  ): { clv: number; category: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' } {
    const clv = ((betOdds - closingOdds) / closingOdds) * 100;

    let category: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

    if (clv > 5) {
      category = 'EXCELLENT';
    } else if (clv > 2) {
      category = 'GOOD';
    } else if (clv > -2) {
      category = 'FAIR';
    } else {
      category = 'POOR';
    }

    return { clv, category };
  }
}

export default MarketEfficiencyDetector;
