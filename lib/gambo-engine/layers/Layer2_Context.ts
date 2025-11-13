/**
 * Gambo 1.0 Engine - Layer 2: Context Integration
 * Adjusts predictions based on contextual factors
 */

import {
  GameData,
  ContextFactors,
  FormRecord,
  InjuryReport,
  WeatherData,
} from '../types/engine.types';

export class ContextIntegration {
  /**
   * Apply contextual adjustments to base probability
   */
  async adjust(
    baseProbability: number,
    game: GameData
  ): Promise<{
    adjustedProbability: number;
    contextFactors: ContextFactors;
    formFactor: number;
    injuryImpact: number;
    motivationFactor: number;
  }> {
    // Calculate individual context factors
    const formFactor = this.analyzeRecentForm(
      game.homeStats.recentForm,
      game.awayStats.recentForm
    );

    const injuryImpact = this.calculateInjuryImpact(game.injuries || []);

    const weatherImpact = game.weather
      ? this.assessWeatherImpact(game.weather, game.sport)
      : 0;

    const travelImpact = game.travelDistance
      ? this.calculateTravelFatigue(game.travelDistance)
      : 0;

    const motivationFactor = this.assessMotivation(game);

    // Create context factors object
    const contextFactors: ContextFactors = {
      formWeight: formFactor,
      injuryWeight: injuryImpact,
      weatherWeight: weatherImpact,
      travelWeight: travelImpact,
      motivationWeight: motivationFactor,
      totalAdjustment:
        formFactor + injuryImpact + weatherImpact + travelImpact + motivationFactor,
    };

    // Apply adjustments to base probability
    const adjustedProbability = this.applyAdjustments(
      baseProbability,
      contextFactors
    );

    return {
      adjustedProbability,
      contextFactors,
      formFactor,
      injuryImpact,
      motivationFactor,
    };
  }

  /**
   * Analyze recent form (last 5-10 games)
   */
  private analyzeRecentForm(
    homeForm: FormRecord[],
    awayForm: FormRecord[]
  ): number {
    // Calculate form score (3 points for win, 1 for draw, 0 for loss)
    const homeFormScore = homeForm
      .slice(0, 5)
      .reduce((sum, game) => {
        if (game.result === 'W') return sum + 3;
        if (game.result === 'D') return sum + 1;
        return sum;
      }, 0);

    const awayFormScore = awayForm
      .slice(0, 5)
      .reduce((sum, game) => {
        if (game.result === 'W') return sum + 3;
        if (game.result === 'D') return sum + 1;
        return sum;
      }, 0);

    // Normalize to -0.1 to +0.1 range
    const maxPoints = 15; // 5 wins
    const formDiff = (homeFormScore - awayFormScore) / maxPoints;

    return formDiff * 0.1; // Max ±10% adjustment
  }

  /**
   * Calculate injury impact on team performance
   */
  private calculateInjuryImpact(injuries: InjuryReport[]): number {
    if (injuries.length === 0) return 0;

    // Calculate total impact based on severity and player importance
    const totalImpact = injuries.reduce((sum, injury) => {
      const severityWeight = {
        MINOR: 0.3,
        MODERATE: 0.6,
        SEVERE: 1.0,
      }[injury.severity];

      // Impact rating is 0-10, normalize to 0-1
      const playerImpact = injury.impactRating / 10;

      return sum + severityWeight * playerImpact;
    }, 0);

    // Normalize and cap at ±8% adjustment
    return Math.min(totalImpact * -0.02, 0.08) * -1;
  }

  /**
   * Assess weather impact on game
   */
  private assessWeatherImpact(weather: WeatherData, sport: string): number {
    // Weather primarily affects outdoor sports
    if (sport === 'BASKETBALL') return 0;

    let impact = 0;

    // Extreme temperatures
    if (weather.temperature < 5 || weather.temperature > 35) {
      impact -= 0.02;
    }

    // High wind (affects passing games)
    if (weather.windSpeed > 30) {
      impact -= 0.03;
    }

    // Rain/precipitation (affects ball control)
    if (weather.precipitation > 50) {
      impact -= 0.04;
    }

    return impact;
  }

  /**
   * Calculate travel fatigue impact
   */
  private calculateTravelFatigue(distanceKm: number): number {
    // Long distance travel affects away team performance
    if (distanceKm < 200) return 0;
    if (distanceKm < 500) return -0.02;
    if (distanceKm < 1000) return -0.04;
    if (distanceKm < 2000) return -0.06;
    return -0.08; // International/cross-continent travel
  }

  /**
   * Assess motivation factors
   */
  private assessMotivation(game: GameData): number {
    // This would be enhanced with:
    // - League position and stakes (relegation battle, title race, etc.)
    // - Derby/rivalry matches
    // - Cup competitions
    // - End of season scenarios
    // - Recent performance pressure

    // Mock implementation
    const isImportantMatch = Math.random() > 0.7;
    return isImportantMatch ? 0.05 : 0;
  }

  /**
   * Apply all contextual adjustments to base probability
   */
  private applyAdjustments(
    baseProbability: number,
    factors: ContextFactors
  ): number {
    // Sum all adjustment factors
    const totalAdjustment = factors.totalAdjustment;

    // Apply bounded adjustment (prevent probability going outside 0-1)
    let adjusted = baseProbability + totalAdjustment;
    adjusted = Math.max(0.05, Math.min(0.95, adjusted));

    return adjusted;
  }

  /**
   * Generate contextual analysis text for the 10-point system
   */
  generateContextualAnalysis(game: GameData, factors: ContextFactors): {
    recentForm: string;
    injuries: string;
    weatherConditions?: string;
    motivationFactors?: string;
  } {
    return {
      recentForm: this.generateFormAnalysis(
        game.homeStats.recentForm,
        game.awayStats.recentForm
      ),
      injuries: this.generateInjuryAnalysis(game.injuries || []),
      weatherConditions: game.weather
        ? this.generateWeatherAnalysis(game.weather)
        : undefined,
      motivationFactors: this.generateMotivationAnalysis(factors.motivationWeight),
    };
  }

  private generateFormAnalysis(
    homeForm: FormRecord[],
    awayForm: FormRecord[]
  ): string {
    const homeResults = homeForm
      .slice(0, 5)
      .map((f) => f.result)
      .join('');
    const awayResults = awayForm
      .slice(0, 5)
      .map((f) => f.result)
      .join('');

    const homeWins = homeForm.slice(0, 5).filter((f) => f.result === 'W').length;
    const awayWins = awayForm.slice(0, 5).filter((f) => f.result === 'W').length;

    return `${homeForm[0]?.opponent ? 'Home' : 'Team 1'}: ${homeResults} (${homeWins} wins in last 5). ${
      awayForm[0]?.opponent ? 'Away' : 'Team 2'
    }: ${awayResults} (${awayWins} wins in last 5)`;
  }

  private generateInjuryAnalysis(injuries: InjuryReport[]): string {
    if (injuries.length === 0) {
      return 'No significant injuries reported. Both teams at full strength.';
    }

    const keyInjuries = injuries.filter((i) => i.impactRating >= 7);

    if (keyInjuries.length > 0) {
      return `Key absences: ${keyInjuries.map((i) => `${i.player} (${i.position})`).join(', ')}. ${keyInjuries.length} high-impact ${keyInjuries.length === 1 ? 'player' : 'players'} unavailable.`;
    }

    return `${injuries.length} minor ${injuries.length === 1 ? 'injury' : 'injuries'} reported. Limited impact expected.`;
  }

  private generateWeatherAnalysis(weather: WeatherData): string {
    const conditions = [];

    if (weather.temperature < 10) {
      conditions.push('cold conditions');
    } else if (weather.temperature > 30) {
      conditions.push('hot conditions');
    }

    if (weather.windSpeed > 25) {
      conditions.push('strong winds');
    }

    if (weather.precipitation > 50) {
      conditions.push('wet pitch');
    }

    if (conditions.length === 0) {
      return `Ideal playing conditions: ${weather.temperature}°C, clear skies.`;
    }

    return `${weather.conditions}. ${weather.temperature}°C with ${conditions.join(', ')}. May favor defensive play.`;
  }

  private generateMotivationAnalysis(motivationWeight: number): string {
    if (motivationWeight >= 0.05) {
      return 'High-stakes match with significant implications for league standings. Both teams highly motivated.';
    } else if (motivationWeight >= 0.03) {
      return 'Moderate importance match. Teams showing strong commitment.';
    }
    return 'Standard league fixture. Normal motivation levels expected.';
  }
}

export default ContextIntegration;
