/**
 * Gambo 1.0 Engine - Type Definitions
 * Core types for the AI prediction engine
 */

import { Sport, GameStatus } from '@prisma/client';

// ============================================================================
// DATA LAYER TYPES
// ============================================================================

export interface GameData {
  id: string;
  sport: Sport;
  homeTeam: string;
  awayTeam: string;
  league: string;
  scheduledAt: Date;
  venue?: string;

  // Team Statistics
  homeStats: TeamStats;
  awayStats: TeamStats;

  // Contextual Data
  weather?: WeatherData;
  injuries?: InjuryReport[];
  travelDistance?: number;

  // Historical Data
  headToHead: HeadToHeadRecord[];

  // Market Data
  odds: OddsData;
}

export interface TeamStats {
  // General Stats
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;

  // Sport-specific stats (soccer example)
  goalsScored?: number;
  goalsConceded?: number;
  xG?: number;
  xGA?: number;
  possession?: number;
  shots?: number;
  shotsOnTarget?: number;

  // Recent Form (last 5-10 games)
  recentForm: FormRecord[];

  // Advanced Metrics
  attackStrength?: number;
  defenseStrength?: number;
  homeAdvantage?: number;
  setPieceEfficiency?: number;
}

export interface FormRecord {
  date: Date;
  opponent: string;
  result: 'W' | 'D' | 'L';
  goalsFor: number;
  goalsAgainst: number;
  location: 'HOME' | 'AWAY';
}

export interface HeadToHeadRecord {
  date: Date;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  venue: string;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  conditions: string;
}

export interface InjuryReport {
  player: string;
  position: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  expectedReturn?: Date;
  impactRating: number; // 0-10 scale
}

export interface OddsData {
  homeWin: number;
  draw?: number;
  awayWin: number;
  totalGoals?: {
    over25: number;
    under25: number;
  };
  btts?: {
    yes: number;
    no: number;
  };
  // Odds movement tracking
  openingOdds: {
    homeWin: number;
    draw?: number;
    awayWin: number;
  };
  oddsMovement: OddsMovement[];
}

export interface OddsMovement {
  timestamp: Date;
  homeWin: number;
  draw?: number;
  awayWin: number;
  volume?: number;
}

// ============================================================================
// PREDICTION ENGINE TYPES
// ============================================================================

export interface PredictionInput {
  game: GameData;
  predictionType: PredictionType;
  targetOdds?: number; // For bundle optimization
}

export type PredictionType =
  | 'MATCH_RESULT'
  | 'OVER_UNDER'
  | 'BTTS'
  | 'PLAYER_SCORE'
  | 'HANDICAP'
  | 'CUSTOM';

export interface PredictionOutput {
  predictionId: string;
  gameId: string;
  type: PredictionType;

  // Layer 1: Statistical Foundation
  statisticalProbability: number;
  expectedValue: number;

  // Layer 2: Context Adjustments
  contextualProbability: number;
  formFactor: number;
  injuryImpact: number;
  motivationFactor: number;

  // Layer 3: ML Ensemble
  mlProbability: number;
  modelConfidence: number;
  ensembleWeights: Record<string, number>;

  // Layer 4: Market Intelligence
  marketValue: number;
  edgeOverMarket: number;
  sharpMoney: boolean;

  // Final Prediction
  finalProbability: number;
  confidence: number; // 0-100
  recommendedStake: number;
  expectedReturn: number;

  // Metadata
  recommendation: string;
  risks: string[];
  keyFactors: string[];

  // 10-Point Analysis
  analysis: PredictionAnalysis;
}

export interface PredictionAnalysis {
  summary: string;
  recentForm: string;
  headToHead: string;
  injuries: string;
  advancedMetrics: string;
  weatherConditions?: string;
  motivationFactors?: string;
  setPieceAnalysis?: string;
  styleMatchup?: string;
  playerForm?: string;
  marketIntelligence: string;
}

// ============================================================================
// LAYER-SPECIFIC TYPES
// ============================================================================

// Layer 1: Statistical Foundation
export interface StatisticalModel {
  type: 'POISSON' | 'XG' | 'ELO' | 'EFFICIENCY';
  parameters: Record<string, number>;
  prediction: number;
  confidence: number;
}

// Layer 2: Context Integration
export interface ContextFactors {
  formWeight: number;
  injuryWeight: number;
  weatherWeight: number;
  travelWeight: number;
  motivationWeight: number;
  totalAdjustment: number;
}

// Layer 3: Machine Learning
export interface MLModel {
  name: string;
  type: 'NEURAL_NETWORK' | 'GRADIENT_BOOST' | 'RANDOM_FOREST' | 'ENSEMBLE';
  version: string;
  accuracy: number;
  lastTrained: Date;
}

export interface MLPrediction {
  model: MLModel;
  prediction: number;
  confidence: number;
  features: Record<string, number>;
}

// Layer 4: Market Intelligence
export interface MarketAnalysis {
  currentOdds: number;
  fairOdds: number;
  valueRating: number; // -100 to +100
  sharpPercentage: number;
  publicPercentage: number;
  lineMovement: 'SHARP' | 'PUBLIC' | 'NEUTRAL';
}

// ============================================================================
// BUNDLE GENERATION TYPES
// ============================================================================

export interface BundleRequest {
  type: 'STANDARD' | 'BTTS' | 'PLUS_50_ODDS' | 'WEEKEND_PLUS_10' | 'PLAYERS_TO_SCORE' | 'UNDER_OVER';
  targetOdds: number;
  minConfidence: number;
  maxGames: number;
  sports?: Sport[];
  tierAccess: 'FREE' | 'BASIC' | 'PRO' | 'ULTIMATE';
  date?: Date;
}

export interface BundleCandidate {
  games: PredictionOutput[];
  combinedOdds: number;
  averageConfidence: number;
  expectedReturn: number;
  riskScore: number;
  diversityScore: number;
}

export interface GeneratedBundle {
  name: string;
  type: string;
  confidence: number;
  expectedReturn: number;
  tierAccess: string;
  games: BundleGame[];
  metadata: {
    generatedAt: Date;
    engineVersion: string;
    totalPredictions: number;
    selectionCriteria: string;
    portfolioMetrics?: {
      sharpeRatio: number;
      diversificationScore: number;
      correlationRisk: number;
      qualityScore: number;
    };
  };
}

export interface BundleGame {
  gameId: string;
  sport: Sport;
  homeTeam: string;
  awayTeam: string;
  scheduledAt: Date;
  pick: string;
  odds: number;
  prediction: PredictionOutput;
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

export interface EngineConfig {
  version: string;

  // Data sources
  dataSources: {
    sports: string[];
    odds: string[];
    weather: string;
    injuries: string;
  };

  // Model weights
  layerWeights: {
    statistical: number;
    contextual: number;
    machineLearning: number;
    market: number;
  };

  // Thresholds
  thresholds: {
    minConfidence: number;
    minEdge: number;
    maxRisk: number;
  };

  // Feature flags
  features: {
    liveUpdates: boolean;
    ensembleLearning: boolean;
    sharpMoneyTracking: boolean;
  };
}

// ============================================================================
// ANALYTICS & PERFORMANCE
// ============================================================================

export interface EnginePerformance {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  averageEdge: number;
  roi: number;

  byConfidenceLevel: {
    high: PerformanceMetrics;
    medium: PerformanceMetrics;
    low: PerformanceMetrics;
  };

  bySport: Record<Sport, PerformanceMetrics>;

  byPredictionType: Record<PredictionType, PerformanceMetrics>;
}

export interface PerformanceMetrics {
  total: number;
  wins: number;
  losses: number;
  pushes: number;
  accuracy: number;
  roi: number;
  averageOdds: number;
}
