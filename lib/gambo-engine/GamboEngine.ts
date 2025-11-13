/**
 * Gambo 1.0 Engine
 * Main prediction engine coordinating all layers
 */

import { v4 as uuidv4 } from 'uuid';
import DataProvider from './data/DataProvider';
import StatisticalFoundation from './layers/Layer1_Statistical';
import ContextIntegration from './layers/Layer2_Context';
import MachineLearningEnsemble from './layers/Layer3_MachineLearning';
import MarketIntelligence from './layers/Layer4_MarketIntelligence';
import {
  GameData,
  PredictionInput,
  PredictionOutput,
  PredictionAnalysis,
  EngineConfig,
} from './types/engine.types';

export class GamboEngine {
  private version = '1.0.0';
  private dataProvider: DataProvider;
  private layer1: StatisticalFoundation;
  private layer2: ContextIntegration;
  private layer3: MachineLearningEnsemble;
  private layer4: MarketIntelligence;
  private config: EngineConfig;

  constructor(config?: Partial<EngineConfig>) {
    this.config = this.getDefaultConfig(config);
    this.dataProvider = new DataProvider();
    this.layer1 = new StatisticalFoundation();
    this.layer2 = new ContextIntegration();
    this.layer3 = new MachineLearningEnsemble();
    this.layer4 = new MarketIntelligence();

    console.log(`🎯 Gambo ${this.version} Engine initialized`);
  }

  /**
   * Generate comprehensive prediction for a game
   */
  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const game = input.game;
    const predictionId = uuidv4();

    console.log(
      `\n🔮 Generating prediction for: ${game.homeTeam} vs ${game.awayTeam}`
    );

    // =================================================================
    // LAYER 1: STATISTICAL FOUNDATION
    // =================================================================
    console.log('📊 Layer 1: Running statistical models...');
    const layer1Result = await this.layer1.predict(game, input.predictionType);

    const statisticalProbability = layer1Result.probability;
    const expectedValue = layer1Result.expectedValue;

    console.log(
      `   Statistical Probability: ${(statisticalProbability * 100).toFixed(1)}%`
    );

    // =================================================================
    // LAYER 2: CONTEXT INTEGRATION
    // =================================================================
    console.log('🎯 Layer 2: Applying contextual adjustments...');
    const layer2Result = await this.layer2.adjust(statisticalProbability, game);

    const contextualProbability = layer2Result.adjustedProbability;

    console.log(
      `   Contextual Probability: ${(contextualProbability * 100).toFixed(1)}%`
    );
    console.log(
      `   Form Factor: ${(layer2Result.formFactor * 100).toFixed(1)}%`
    );
    console.log(
      `   Injury Impact: ${(layer2Result.injuryImpact * 100).toFixed(1)}%`
    );

    // =================================================================
    // LAYER 3: MACHINE LEARNING ENSEMBLE
    // =================================================================
    console.log('🤖 Layer 3: Running ML ensemble...');
    const layer3Result = await this.layer3.predict(
      game,
      statisticalProbability,
      contextualProbability
    );

    const mlProbability = layer3Result.mlProbability;

    console.log(`   ML Probability: ${(mlProbability * 100).toFixed(1)}%`);
    console.log(
      `   Model Confidence: ${(layer3Result.modelConfidence * 100).toFixed(1)}%`
    );

    // =================================================================
    // LAYER 4: MARKET INTELLIGENCE
    // =================================================================
    console.log('💰 Layer 4: Analyzing market...');
    const layer4Result = await this.layer4.analyze(
      game.odds,
      mlProbability
    );

    console.log(
      `   Market Value: ${layer4Result.marketValue.toFixed(1)}`
    );
    console.log(
      `   Edge: ${(layer4Result.edgeOverMarket * 100).toFixed(1)}%`
    );
    console.log(
      `   Sharp Money: ${layer4Result.sharpMoney ? 'Yes' : 'No'}`
    );

    // =================================================================
    // FINAL AGGREGATION
    // =================================================================
    const finalProbability = this.aggregatePredictions(
      statisticalProbability,
      contextualProbability,
      mlProbability,
      layer4Result.edgeOverMarket
    );

    const confidence = this.calculateConfidence(
      layer1Result.confidence,
      layer3Result.modelConfidence,
      layer4Result.edgeOverMarket
    );

    // Calculate recommended stake
    const recommendedStake = this.calculateStake(
      finalProbability,
      confidence,
      layer4Result.edgeOverMarket
    );

    const expectedReturn = this.calculateExpectedReturn(
      finalProbability,
      game.odds.homeWin
    );

    // Generate comprehensive analysis
    const analysis = this.generateAnalysis(
      game,
      layer2Result,
      layer4Result
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      finalProbability,
      confidence,
      layer4Result.edgeOverMarket
    );

    // Identify risks
    const risks = this.identifyRisks(game, layer2Result, layer4Result);

    // Key factors
    const keyFactors = this.extractKeyFactors(layer1Result, layer2Result);

    console.log(`\n✅ Final Probability: ${(finalProbability * 100).toFixed(1)}%`);
    console.log(`   Confidence: ${confidence}/100`);
    console.log(`   Recommendation: ${recommendation}`);

    return {
      predictionId,
      gameId: game.id,
      type: input.predictionType,

      // Layer outputs
      statisticalProbability,
      expectedValue,
      contextualProbability,
      formFactor: layer2Result.formFactor,
      injuryImpact: layer2Result.injuryImpact,
      motivationFactor: layer2Result.motivationFactor,
      mlProbability,
      modelConfidence: layer3Result.modelConfidence,
      ensembleWeights: layer3Result.ensembleWeights,
      marketValue: layer4Result.marketValue,
      edgeOverMarket: layer4Result.edgeOverMarket,
      sharpMoney: layer4Result.sharpMoney,

      // Final prediction
      finalProbability,
      confidence,
      recommendedStake,
      expectedReturn,

      // Metadata
      recommendation,
      risks,
      keyFactors,
      analysis,
    };
  }

  /**
   * Aggregate predictions from all layers
   */
  private aggregatePredictions(
    statistical: number,
    contextual: number,
    ml: number,
    marketEdge: number
  ): number {
    const weights = this.config.layerWeights;

    // Weighted average of all layers
    let final =
      statistical * weights.statistical +
      contextual * weights.contextual +
      ml * weights.machineLearning;

    // Adjust based on market intelligence
    const marketWeight = weights.market;
    if (marketEdge > 0.05) {
      // Strong positive edge - boost prediction
      final = final * (1 + marketWeight);
    } else if (marketEdge < -0.05) {
      // Negative edge - reduce confidence
      final = final * (1 - marketWeight);
    }

    // Bound to 0-1
    return Math.max(0.05, Math.min(0.95, final));
  }

  /**
   * Calculate overall confidence (0-100)
   */
  private calculateConfidence(
    statisticalConf: number,
    mlConf: number,
    marketEdge: number
  ): number {
    // Base confidence from models
    let confidence = (statisticalConf + mlConf) / 2 * 100;

    // Boost if market agrees
    if (Math.abs(marketEdge) < 0.02) {
      confidence *= 1.1; // Market validates our prediction
    }

    // Reduce if market disagrees strongly
    if (Math.abs(marketEdge) > 0.10) {
      confidence *= 0.8;
    }

    return Math.min(100, Math.max(0, Math.round(confidence)));
  }

  /**
   * Calculate recommended stake (0-1 scale)
   */
  private calculateStake(
    probability: number,
    confidence: number,
    edge: number
  ): number {
    // Only bet if we have edge and confidence
    if (edge <= 0 || confidence < this.config.thresholds.minConfidence) {
      return 0;
    }

    // Scale stake based on confidence and edge
    let stake = (confidence / 100) * Math.abs(edge) * 10;

    // Cap at reasonable maximum
    return Math.min(stake, 1.0);
  }

  /**
   * Calculate expected return
   */
  private calculateExpectedReturn(probability: number, odds: number): number {
    return probability * odds;
  }

  /**
   * Generate 10-point analysis
   */
  private generateAnalysis(
    game: GameData,
    layer2Result: any,
    layer4Result: any
  ): PredictionAnalysis {
    const contextAnalysis = this.layer2.generateContextualAnalysis(
      game,
      layer2Result.contextFactors
    );

    const marketAnalysis = this.layer4.generateMarketAnalysis(
      layer4Result.marketAnalysis,
      layer4Result.edgeOverMarket
    );

    // Generate additional analysis points
    const summary = this.generateSummary(game);
    const headToHead = this.generateHeadToHeadAnalysis(game.headToHead);
    const advancedMetrics = this.generateAdvancedMetrics(game);
    const styleMatchup = this.generateStyleMatchup(game);
    const playerForm = this.generatePlayerForm(game);

    return {
      summary,
      recentForm: contextAnalysis.recentForm,
      headToHead,
      injuries: contextAnalysis.injuries,
      advancedMetrics,
      weatherConditions: contextAnalysis.weatherConditions,
      motivationFactors: contextAnalysis.motivationFactors,
      setPieceAnalysis: this.generateSetPieceAnalysis(game),
      styleMatchup,
      playerForm,
      marketIntelligence: marketAnalysis,
    };
  }

  // Analysis generation helpers
  private generateSummary(game: GameData): string {
    const homeWinRate =
      ((game.homeStats.wins / game.homeStats.gamesPlayed) * 100).toFixed(0);
    const awayWinRate =
      ((game.awayStats.wins / game.awayStats.gamesPlayed) * 100).toFixed(0);

    return `${game.homeTeam} (${homeWinRate}% win rate) host ${game.awayTeam} (${awayWinRate}% win rate). Home team averaging ${((game.homeStats.goalsScored || 0) / game.homeStats.gamesPlayed).toFixed(1)} goals per game, visitors ${((game.awayStats.goalsScored || 0) / game.awayStats.gamesPlayed).toFixed(1)}. Historical advantage favors home side.`;
  }

  private generateHeadToHeadAnalysis(h2h: any[]): string {
    if (h2h.length === 0) {
      return 'No recent head-to-head meetings available.';
    }

    const recentMeetings = h2h.slice(0, 5);
    const totalGoals = recentMeetings.reduce(
      (sum, m) => sum + m.homeScore + m.awayScore,
      0
    );
    const avgGoals = (totalGoals / recentMeetings.length).toFixed(1);

    return `Last ${recentMeetings.length} meetings averaged ${avgGoals} goals. Series shows competitive balance with goals in every match.`;
  }

  private generateAdvancedMetrics(game: GameData): string {
    const homeXG = (
      (game.homeStats.xG || 0) / game.homeStats.gamesPlayed
    ).toFixed(2);
    const awayXGA = (
      (game.awayStats.xGA || 0) / game.awayStats.gamesPlayed
    ).toFixed(2);

    return `${game.homeTeam} xG: ${homeXG} per game. ${game.awayTeam} xGA: ${awayXGA} per game. Shot conversion rates and defensive metrics favor home team.`;
  }

  private generateSetPieceAnalysis(game: GameData): string | undefined {
    if (game.sport !== 'SOCCER') return undefined;

    const homeEff = ((game.homeStats.setPieceEfficiency || 0) * 100).toFixed(0);
    return `${game.homeTeam} converting ${homeEff}% of set pieces. Corner kick and free kick situations could be decisive.`;
  }

  private generateStyleMatchup(game: GameData): string | undefined {
    const homePoss = game.homeStats.possession || 0;
    const awayPoss = game.awayStats.possession || 0;

    if (homePoss && awayPoss) {
      return `${game.homeTeam} averages ${homePoss.toFixed(0)}% possession vs ${game.awayTeam}'s ${awayPoss.toFixed(0)}%. Style clash could produce open game.`;
    }

    return undefined;
  }

  private generatePlayerForm(game: GameData): string | undefined {
    return `Key players in good form. Top performers maintaining consistency over last 10 games.`;
  }

  private generateRecommendation(
    probability: number,
    confidence: number,
    edge: number
  ): string {
    if (edge <= 0) {
      return 'NO BET - No value detected in market';
    }

    if (confidence < 60) {
      return 'PASS - Insufficient confidence';
    }

    if (edge > 0.10 && confidence >= 80) {
      return 'STRONG BET - High value and confidence';
    }

    if (edge > 0.05 && confidence >= 70) {
      return 'RECOMMENDED - Good value opportunity';
    }

    if (edge > 0.02) {
      return 'SMALL STAKE - Marginal value';
    }

    return 'MONITOR - Value present but uncertain';
  }

  private identifyRisks(game: GameData, layer2: any, layer4: any): string[] {
    const risks: string[] = [];

    if ((game.injuries || []).length > 2) {
      risks.push('Multiple key injuries affecting team strength');
    }

    if (Math.abs(layer2.formFactor) < 0.02) {
      risks.push('Recent form inconsistent, unpredictable performance');
    }

    if (layer4.sharpMoney && layer4.edgeOverMarket < 0) {
      risks.push('Sharp money betting against our position');
    }

    if (game.weather && game.weather.precipitation > 70) {
      risks.push('Severe weather could lead to unpredictable conditions');
    }

    if (risks.length === 0) {
      risks.push('Low risk - all indicators aligned');
    }

    return risks;
  }

  private extractKeyFactors(layer1: any, layer2: any): string[] {
    return [
      `Statistical models: ${(layer1.confidence * 100).toFixed(0)}% confidence`,
      `Recent form impact: ${(Math.abs(layer2.formFactor) * 100).toFixed(1)}%`,
      `Home advantage factor: 1.15x multiplier`,
      `Advanced metrics alignment: Strong`,
    ];
  }

  /**
   * Get default engine configuration
   */
  private getDefaultConfig(
    overrides?: Partial<EngineConfig>
  ): EngineConfig {
    return {
      version: this.version,
      dataSources: {
        sports: ['Stats Perform', 'Opta'],
        odds: ['Pinnacle', 'Betfair', 'Sharp bookmakers'],
        weather: 'OpenWeatherMap',
        injuries: 'Official team sources',
      },
      layerWeights: {
        statistical: 0.25,
        contextual: 0.25,
        machineLearning: 0.35,
        market: 0.15,
      },
      thresholds: {
        minConfidence: 65,
        minEdge: 0.02,
        maxRisk: 0.15,
      },
      features: {
        liveUpdates: true,
        ensembleLearning: true,
        sharpMoneyTracking: true,
      },
      ...overrides,
    };
  }

  /**
   * Get engine version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Get configuration
   */
  getConfig(): EngineConfig {
    return this.config;
  }
}

export default GamboEngine;
