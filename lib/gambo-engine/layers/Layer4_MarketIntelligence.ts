/**
 * Gambo 1.0 Engine - Layer 4: Market Intelligence
 * Analyzes betting market trends and identifies value
 */

import { OddsData, OddsMovement, MarketAnalysis } from '../types/engine.types';

export class MarketIntelligence {
  /**
   * Analyze market and identify value opportunities
   */
  async analyze(
    odds: OddsData,
    trueProbability: number
  ): Promise<{
    marketValue: number;
    edgeOverMarket: number;
    sharpMoney: boolean;
    marketAnalysis: MarketAnalysis;
  }> {
    // Calculate implied probability from odds
    const impliedProb = this.oddsToImpliedProbability(odds.homeWin);

    // Detect sharp vs public money
    const lineMovement = this.detectLineMovement(odds);

    // Calculate value rating
    const valueRating = this.calculateValueRating(trueProbability, impliedProb);

    // Determine edge over market
    const edgeOverMarket = trueProbability - impliedProb;

    // Analyze money flow
    const { sharpPercentage, publicPercentage } = this.analyzeMoneyFlow(odds);

    const marketAnalysis: MarketAnalysis = {
      currentOdds: odds.homeWin,
      fairOdds: this.probabilityToOdds(trueProbability),
      valueRating,
      sharpPercentage,
      publicPercentage,
      lineMovement,
    };

    return {
      marketValue: valueRating,
      edgeOverMarket,
      sharpMoney: lineMovement === 'SHARP',
      marketAnalysis,
    };
  }

  /**
   * Convert decimal odds to implied probability
   */
  private oddsToImpliedProbability(odds: number): number {
    return 1 / odds;
  }

  /**
   * Convert probability to fair decimal odds
   */
  private probabilityToOdds(probability: number): number {
    return 1 / probability;
  }

  /**
   * Detect line movement patterns
   */
  private detectLineMovement(odds: OddsData): 'SHARP' | 'PUBLIC' | 'NEUTRAL' {
    const openingOdds = odds.openingOdds.homeWin;
    const currentOdds = odds.homeWin;

    const movement = currentOdds - openingOdds;

    // No significant movement
    if (Math.abs(movement) < 0.05) {
      return 'NEUTRAL';
    }

    // Odds getting longer (less money on this outcome)
    if (movement > 0) {
      // If odds drift despite public likely backing favorites, suggests sharp fade
      return 'SHARP';
    }

    // Odds shortening (more money coming in)
    // If dramatic shortening, likely sharp money
    if (movement < -0.15) {
      return 'SHARP';
    }

    // Moderate shortening, likely public money
    return 'PUBLIC';
  }

  /**
   * Calculate value rating (-100 to +100)
   */
  private calculateValueRating(
    trueProbability: number,
    impliedProbability: number
  ): number {
    // Positive value means our probability is higher than market
    const edge = trueProbability - impliedProbability;

    // Scale to -100 to +100
    return edge * 200;
  }

  /**
   * Analyze money flow (sharp vs public)
   */
  private analyzeMoneyFlow(odds: OddsData): {
    sharpPercentage: number;
    publicPercentage: number;
  } {
    // Mock implementation
    // In production, this would analyze:
    // - Bet volume
    // - Bet count
    // - Steam moves
    // - Reverse line movement

    const oddsMovement = odds.homeWin - odds.openingOdds.homeWin;

    // If odds shorten significantly, estimate sharp money
    let sharpPercentage = 50;
    let publicPercentage = 50;

    if (oddsMovement < -0.1) {
      // Odds shortened - more money on home team
      sharpPercentage = 70;
      publicPercentage = 30;
    } else if (oddsMovement > 0.1) {
      // Odds lengthened - sharp fading home team
      sharpPercentage = 30;
      publicPercentage = 70;
    }

    return { sharpPercentage, publicPercentage };
  }

  /**
   * Identify steam moves (sharp action)
   */
  private detectSteamMove(oddsMovement: OddsMovement[]): boolean {
    if (oddsMovement.length < 2) return false;

    // Check for sudden, significant movement
    for (let i = 1; i < oddsMovement.length; i++) {
      const previous = oddsMovement[i - 1];
      const current = oddsMovement[i];

      const timeDiff =
        current.timestamp.getTime() - previous.timestamp.getTime();
      const oddsDiff = Math.abs(current.homeWin - previous.homeWin);

      // Steam move: large odds change in short time
      if (timeDiff < 5 * 60 * 1000 && oddsDiff > 0.15) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate Kelly Criterion recommended stake
   */
  calculateKellyStake(
    trueProbability: number,
    odds: number,
    bankroll: number,
    kellyFraction: number = 0.25 // Quarter Kelly for safety
  ): number {
    const b = odds - 1; // Net odds (decimal - 1)
    const p = trueProbability;
    const q = 1 - p;

    // Kelly formula: (bp - q) / b
    const kellyPercent = (b * p - q) / b;

    if (kellyPercent <= 0) {
      return 0; // No edge, don't bet
    }

    // Apply fractional Kelly for bankroll management
    const stake = bankroll * kellyPercent * kellyFraction;

    // Cap at maximum stake
    return Math.min(stake, bankroll * 0.05); // Max 5% of bankroll
  }

  /**
   * Generate market intelligence analysis text
   */
  generateMarketAnalysis(
    marketAnalysis: MarketAnalysis,
    edgeOverMarket: number
  ): string {
    const valuePct = (edgeOverMarket * 100).toFixed(1);

    let analysis = `Market odds ${marketAnalysis.currentOdds.toFixed(2)} vs fair odds ${marketAnalysis.fairOdds.toFixed(2)}. `;

    if (edgeOverMarket > 0.05) {
      analysis += `Strong value detected (+${valuePct}% edge). `;
    } else if (edgeOverMarket > 0.02) {
      analysis += `Moderate value (+${valuePct}% edge). `;
    } else if (edgeOverMarket < -0.02) {
      analysis += `Overpriced by market (${valuePct}% negative edge). `;
    } else {
      analysis += `Fair market pricing. `;
    }

    if (marketAnalysis.lineMovement === 'SHARP') {
      analysis += `Sharp money detected (${marketAnalysis.sharpPercentage}% professional action). `;
    } else if (marketAnalysis.lineMovement === 'PUBLIC') {
      analysis += `Public betting pressure evident (${marketAnalysis.publicPercentage}% retail action). `;
    }

    analysis += `Market efficiency rating: ${this.getEfficiencyRating(Math.abs(edgeOverMarket))}.`;

    return analysis;
  }

  /**
   * Get market efficiency rating
   */
  private getEfficiencyRating(absEdge: number): string {
    if (absEdge < 0.02) return 'Highly efficient';
    if (absEdge < 0.05) return 'Moderately efficient';
    if (absEdge < 0.10) return 'Inefficient';
    return 'Highly inefficient';
  }
}

export default MarketIntelligence;
