# How Odds Are Chosen in Gambo - Comprehensive Guide

## Executive Summary

Gambo uses a **Quad-AI powered system** combined with sophisticated mathematical algorithms to intelligently select betting odds. The platform prioritizes **SAFETY FIRST** while maximizing value, using 4 different AI systems, historical data analysis, and cross-sport intelligence.

---

## Table of Contents

1. [Overview of the Selection Process](#overview)
2. [AI-Powered Match Analysis](#ai-analysis)
3. [Multi-Market Analysis](#multi-market)
4. [Safety-First Strategy](#safety-first)
5. [Odds Selection Algorithm](#odds-algorithm)
6. [Cross-Sport Intelligence](#cross-sport)
7. [Bundle Creation Process](#bundle-creation)
8. [Quality Control & Filtering](#quality-control)

---

## <a name="overview"></a>1. Overview of the Selection Process

### High-Level Flow

```
Step 1: Data Collection
└─> Fetch fixtures from 5 sports (Soccer, Basketball, Tennis, Hockey, Football)
    └─> Fetch odds from BetsAPI (4 market types per match)
        └─> Filter out virtual/esports/low-quality matches
            │
Step 2: AI Analysis
└─> Analyze each match with Quad-AI system
    └─> Calculate probabilities from historical data
        └─> Identify value opportunities across all markets
            │
Step 3: Safety Filtering
└─> Remove high-risk picks (odds > 3.0)
    └─> Require minimum 75% confidence
        └─> Validate pattern consistency
            │
Step 4: Smart Selection
└─> Calculate ideal odds per game for target
    └─> Select picks using geometric mean optimization
        └─> Ensure cross-sport diversity
            │
Step 5: Bundle Creation
└─> Create 10 specialized bundles
    └─> Validate each bundle meets criteria
        └─> Store in database with full analysis
```

---

## <a name="ai-analysis"></a>2. AI-Powered Match Analysis

### Quad-AI System

Gambo uses **4 different AI systems** working together:

#### **2.1 AI Systems Used**
- ✅ **OpenAI GPT-4** - Advanced reasoning and pattern recognition
- ✅ **Anthropic Claude** - Detailed analytical thinking
- ✅ **xAI Grok** - Real-time data integration
- ✅ **Groq** - Ultra-fast inference for rapid analysis

**Consensus Strategy**: All 4 AIs analyze each match independently, then the system:
- Compares recommendations from all AIs
- Takes the **most conservative** (safest) pick when AIs disagree
- Averages confidence scores for balanced assessment
- Only proceeds if majority agreement exists

#### **2.2 Analysis Depth - 12 Critical Factors**

Each AI examines:

1. **Recent Form Analysis**
   - Last 10 games with exact W/L/D records
   - Win rate percentages for both teams
   - BTTS (Both Teams To Score) patterns
   - Goals scored/conceded trends
   - Example: "Home: WWDLW (7W-2D-1L, 70% win rate, BTTS in 6/10)"

2. **Head-to-Head History**
   - Last 5-10 H2H meetings with exact scores
   - Historical win probability calculation
   - BTTS patterns in H2H games
   - Over/Under trends in past meetings
   - Example: "2-1, 1-1, 3-0, 2-2, 1-0. Home won 4/5 (80%). BTTS in 3/5 (60%)"

3. **Key Injuries & Availability**
   - Missing key players and their impact
   - Injury effect on team performance
   - Squad depth analysis
   - Return from injury timeline

4. **Advanced Metrics**
   - **Calculated Probabilities**:
     - Home Win probability = (Wins in last 15) / 15
     - Draw probability = (Draws in last 10 H2H) / 10
     - BTTS probability = (BTTS occurrences in last 10) / 10
     - Over 2.5 probability = (O2.5 games in last 15) / 15
   - xG (Expected Goals) analysis
   - Possession percentages
   - Shots on target ratios

5. **Weather & Venue Conditions**
   - Weather impact on scoring (rain, wind, cold)
   - Home advantage statistics
   - Venue-specific patterns
   - Surface conditions (for tennis)

6. **Motivation Factors**
   - League position and implications
   - Tournament stage importance
   - Playoff implications
   - Rivalry intensity
   - Elimination games pressure

7. **Set Piece Analysis** (Soccer-specific)
   - Corner conversion rates
   - Free kick specialists
   - Set piece goals percentage
   - Defensive vulnerability to set pieces

8. **Style Matchup**
   - Attacking vs Defensive team styles
   - Tactical approach compatibility
   - Pace and tempo differences
   - Pressing vs possession strategies

9. **Player Form**
   - Top scorers current form (goals in last 5)
   - Key assists providers
   - Minutes played (fatigue analysis)
   - Hot/cold streaks

10. **Market Intelligence** (CRITICAL)
    - **Value Calculation**:
      ```
      Implied Probability = 1 / Decimal Odds
      AI Probability = Historical Data Analysis
      Value = AI Probability > Implied Probability
      ```
    - Example: If Home Win = 60% probability but odds are 2.00 (50% implied), that's **10% VALUE**
    - Minimum 10% edge required for recommendation

11. **Pattern Consistency Check**
    - Is pattern consistent across 10-15 games?
    - Or is it a recent 2-3 game fluke?
    - Has pattern held in H2H meetings?
    - League average comparison
    - **Only recommend if 70%+ occurrence consistency**

12. **Cross-Market Validation**
    - Do different markets tell the same story?
    - Example: Recommending Home Win should align with:
      - Home team scoring enough goals to win
      - Away team defensive weakness
      - BTTS pattern consistency

---

## <a name="multi-market"></a>3. Multi-Market Analysis

### 3.1 Available Markets

The AI analyzes **4 different betting markets** per match:

#### **H2H (Home/Draw/Away)**
- Traditional match result betting
- Odds typically: 1.50 - 3.00 range
- Best for: Clear favorites with strong home record

#### **Double Chance**
- Covers two outcomes (e.g., "Home or Draw")
- Safer odds: 1.20 - 1.80 range
- Best for: Close matches with uncertain result but low chance of one outcome

#### **Over/Under (Totals)**
- Goals/Points total betting (e.g., Over 2.5 goals)
- Line varies by sport: 2.5 for soccer, 220 for basketball
- Best for: High/low scoring teams regardless of winner

#### **BTTS (Both Teams To Score)**
- Both teams score at least one goal
- Odds typically: 1.60 - 2.20 range
- Best for: Matches with strong attacks and weak defenses

### 3.2 Market Selection Logic

The AI chooses the **best market** based on:

```
Priority 1: HIGHEST VALUE
└─> Compare AI probability vs Implied probability
    └─> Select market with biggest positive edge

Priority 2: HIGHEST SAFETY
└─> Consistent historical pattern (70%+ occurrence)
    └─> Odds ≤ 3.0 (maximum individual pick odds)

Priority 3: MAXIMUM CONFIDENCE
└─> Strong data support from multiple sources
    └─> Pattern holds across H2H, recent form, and league average
```

**Example Decision Process:**

```
Match: Manchester United vs Liverpool

Market Analysis:
- H2H: Home Win @ 2.10 (implied 47.6%) - AI calculates 55% → 7.4% VALUE
- BTTS: Yes @ 1.70 (implied 58.8%) - AI calculates 75% → 16.2% VALUE ✓ BEST
- Over 2.5: @ 1.90 (implied 52.6%) - AI calculates 60% → 7.4% VALUE
- Draw: @ 3.40 (implied 29.4%) - AI calculates 25% → NEGATIVE VALUE

AI Recommendation: "BTTS Yes" @ 1.70
Reason: Highest value (16.2% edge), occurred in 15/20 last games (75% consistency)
```

---

## <a name="safety-first"></a>4. Safety-First Strategy

### 4.1 Core Safety Rules

#### **Rule 1: Maximum Odds Cap**
- ✅ Individual pick odds: **≤ 3.0 maximum**
- ❌ Never recommend odds > 4.0 (too risky)
- 📊 Typical odds range: 1.30 - 2.50

**Why**: Higher odds = lower probability = higher risk of user losing money

#### **Rule 2: Minimum Confidence Required**
- ✅ Minimum: **75% confidence**
- 📈 Confidence reduced if:
  - Odds > 2.5 (enter risky territory)
  - Pattern inconsistency in last 10 games
  - Conflicting AI recommendations
  - Limited historical data (< 10 games)

#### **Rule 3: Pattern Consistency**
- ✅ Recommendation requires **70%+ occurrence** rate
- ❌ Reject one-off flukes or recent streaks
- 📊 Example: "BTTS Yes" only if occurred in 7+ of last 10 games

#### **Rule 4: Historical Data Minimum**
- ✅ At least **10 games** of historical data required
- 📈 Prefer **15-20 games** for higher confidence
- ❌ Skip matches with insufficient data

#### **Rule 5: Risk-Adjusted Confidence**
```typescript
Base Confidence = AI Analysis Result

Adjustments:
- If odds > 2.5: Reduce by 10%
- If odds > 3.0: Reduce by 20%
- If pattern < 80% consistent: Reduce by 15%
- If AIs disagree: Use lowest confidence
- If limited data: Cap at 75%

Final Confidence = Base - Adjustments
Minimum Required = 75%
```

---

## <a name="odds-algorithm"></a>5. Odds Selection Algorithm

### 5.1 Bundle Odds Targets

Gambo creates **10 specialized bundles** with different odds targets:

| Bundle Type | Target Odds | Max Odds | Typical Games | User Tier |
|------------|-------------|----------|---------------|-----------|
| +2 Odds Free | 2.0x | 2.99x | 2-3 games | FREE |
| +5 Odds Mixed Basic | 5.0x | 6.99x | 3-4 games | BASIC |
| +5 Odds Mixed Pro | 5.0x | 6.99x | 4-5 games | PRO |
| +10 Odds Weekend Basic | 10.0x | 10.99x | 4-5 games | BASIC |
| +10 Odds Weekend Pro | 10.0x | 10.99x | 5-6 games | PRO |
| +10 Odds Weekend Ultimate | 10.0x | 10.99x | 5-6 games | ULTIMATE |
| +20 Odds Special Basic | 20.0x | 20.99x | 6-7 games | BASIC |
| +20 Odds Special Pro | 20.0x | 20.99x | 6-8 games | PRO |
| +20 Odds Special Ultimate | 20.0x | 20.99x | 7-9 games | ULTIMATE |
| +50 Odds Monster Ultimate | 50.0x | 51.99x | 8-10 games | ULTIMATE |

### 5.2 Geometric Mean Optimization

**Problem**: How to reach 20.0x odds using 3.0 max individual picks?

**Solution**: Geometric Mean Formula

```
Ideal Odds Per Game = (Target Odds) ^ (1 / Number of Games)

Examples:
- 5.0x target with 4 games: 1.50 per game
- 10.0x target with 5 games: 1.58 per game
- 20.0x target with 6 games: 1.72 per game
- 50.0x target with 9 games: 1.54 per game
```

**Strategy**:
1. Calculate ideal odds per game
2. Find picks with odds closest to ideal
3. Combine picks to reach target range (Target to Target+0.99)
4. Special case: +5 odds can go up to 6.99

### 5.3 Pick Selection Priority

```
Sort Order (descending priority):

1. Confidence Score (most important)
   └─> Higher confidence = safer pick
       └─> Difference > 5% is significant

2. Odds Distance from Ideal
   └─> For 5x+ targets: Prefer odds close to ideal
       └─> Example: For 10x target (1.78 ideal), prefer 1.70-1.85 over 1.30 or 2.50

3. Sport Diversity (tie-breaker)
   └─> Prefer picks from different sports
       └─> Better risk distribution
```

### 5.4 Selection Example

**Target**: 10.0x odds bundle

```
Step 1: Calculate Ideal
- Assume 5 games average
- Ideal odds per game = 10^(1/5) = 1.58

Step 2: Filter Safe Picks
- All picks with odds ≤ 3.0
- All picks with confidence ≥ 75%
- Result: 87 qualifying picks

Step 3: Sort by Priority
[
  {sport: "SOCCER", odds: 1.60, confidence: 82%},    // ✓ Perfect
  {sport: "BASKETBALL", odds: 1.55, confidence: 81%}, // ✓ Close to ideal
  {sport: "HOCKEY", odds: 1.70, confidence: 80%},     // ✓ Close to ideal
  {sport: "SOCCER", odds: 1.50, confidence: 79%},     // Good but same sport
  {sport: "TENNIS", odds: 1.65, confidence: 78%},     // ✓ Different sport
  ...
]

Step 4: Build Combination
- Pick 1: Soccer @ 1.60 (confidence 82%) → Running odds: 1.60
- Pick 2: Basketball @ 1.55 (confidence 81%) → Running odds: 2.48
- Pick 3: Hockey @ 1.70 (confidence 80%) → Running odds: 4.22
- Pick 4: Tennis @ 1.65 (confidence 78%) → Running odds: 6.96
- Pick 5: Soccer @ 1.50 (confidence 79%) → Running odds: 10.44 ✓

Final Bundle: 5 games @ 10.44x odds
Sports: ⚽🏀🏒🎾⚽ (4 different sports)
Average confidence: 80%
```

---

## <a name="cross-sport"></a>6. Cross-Sport Intelligence

### 6.1 Why Mix Sports?

**Risk Distribution Benefits:**
- ⚽ Soccer upset ≠ 🏀 Basketball upset
- Different sports = independent events
- Reduces correlation risk
- Better hedging strategy

### 6.2 Sport Diversity Algorithm

```
When selecting picks for a bundle:

1. Track sports already included
2. After 2+ picks, check if current sport already used
3. If yes, look for comparable pick from different sport:
   - Confidence within 3% of current pick
   - Still within odds ideal range
4. If found, prefer the diverse sport pick
5. Continue until target reached or no more picks
```

### 6.3 Diversity Reporting

Each bundle shows:
- Sport breakdown: "⚽ Soccer: 2 | 🏀 Basketball: 1 | 🏒 Hockey: 2"
- Diversity indicator: "🌈 4 sports coverage"
- Risk distribution: "Better hedging with multi-sport picks"

---

## <a name="bundle-creation"></a>7. Bundle Creation Process

### 7.1 Full Creation Flow

```
1. Data Collection Phase
   ├─> Fetch from BetsAPI (primary source)
   │   ├─> Soccer: 40 fixtures
   │   ├─> Basketball: 40 fixtures
   │   ├─> Tennis: 40 fixtures
   │   ├─> Hockey: 40 fixtures
   │   └─> Football: 40 fixtures
   │
   ├─> Fallback to SportMonks (if BetsAPI fails)
   └─> Fallback to RapidAPI (if both fail)

2. Filtering Phase
   ├─> Remove esports/virtual games
   ├─> Remove Bahrain league
   ├─> Remove games with odds < 1.20 (mismatched)
   ├─> Keep only next day games
   └─> Validate odds availability

3. AI Analysis Phase (PARALLEL for speed)
   ├─> Analyze all 4 markets per match
   ├─> Calculate historical probabilities
   ├─> Identify value opportunities
   ├─> Determine best market pick
   └─> Output: ~87 betting opportunities

4. Safety Filtering Phase
   ├─> Remove odds > 3.0
   ├─> Remove confidence < 75%
   ├─> Remove inconsistent patterns
   └─> Result: ~60-70 safe picks

5. Bundle Assembly Phase
   ├─> For each of 10 bundle types:
   │   ├─> Calculate ideal odds per game
   │   ├─> Select best picks for target
   │   ├─> Ensure sport diversity
   │   ├─> Validate minimum 2 games
   │   └─> Check odds within range
   │
   └─> Create bundle database records

6. Quality Assurance Phase
   ├─> Verify all bundles meet criteria
   ├─> Check for duplicate games across bundles
   ├─> Validate confidence scores
   └─> Archive old bundles

7. Publication Phase
   ├─> Mark bundles as active
   ├─> Set publishedAt timestamp
   └─> Make available to users
```

### 7.2 Database Storage

Each bundle stores:

```typescript
Bundle {
  name: "10 Odds Weekend Mixed Sports Ultimate"
  expectedReturn: 10.44
  bundleType: "weekend"
  tier: "ULTIMATE"
  sport: "MIXED"
  isActive: true
  publishedAt: Date
  games: [
    {
      pick: "Home Win"
      odds: 1.60
      betType: "h2h"
      confidenceScore: 82
      reasoning: "..."
      analysis: {...}
    },
    ...
  ]
}
```

---

## <a name="quality-control"></a>8. Quality Control & Filtering

### 8.1 Pre-Selection Filters

**Esports/Virtual Removal:**
```typescript
Excluded keywords:
- 'esoccer', 'ebasketball', 'efootball', 'etennis', 'ehockey'
- 'cyber', 'virtual', 'esports', 'e-sports'
- 'simulated', 'fifa', 'nba2k', 'pes'
- 'bahrain' (user-requested exclusion)
```

**Competitive Odds Filter:**
```typescript
Minimum individual odds: 1.20
Reason: Odds < 1.20 indicate heavily mismatched game
Example: 1.05 vs 12.00 odds = one team vastly superior
```

**Date Filter:**
```typescript
Only include games scheduled for:
- Tomorrow (start of next day)
- Up to end of tomorrow
- Excludes today's games
- Excludes games beyond tomorrow
```

### 8.2 Post-Selection Validation

**Bundle Validation Checks:**

1. **Minimum Games**: At least 2 games per bundle
2. **Odds Range**: Between Target and Target+0.99 (or Target+1.99 for +5 odds)
3. **Confidence Threshold**: Average confidence ≥ 75%
4. **Individual Odds Cap**: All picks ≤ 3.0
5. **Sport Coverage**: At least 1 sport represented (prefer 2+)
6. **No Duplicates**: Same game not in multiple picks
7. **Time Validation**: All games scheduled for valid date

**Rejection Reasons:**

```
Bundle rejected if:
- ✗ Less than 2 games
- ✗ Odds below target minimum
- ✗ Odds exceed maximum range
- ✗ Any pick confidence < 75%
- ✗ Any pick odds > 3.0
- ✗ Duplicate games across bundle
- ✗ Games from wrong date range
```

---

## Summary Statistics

### Typical Bundle Generation Run

```
📊 Input:
- Fixtures fetched: ~200 across 5 sports
- After filtering: ~150 valid fixtures
- API calls made: ~160 (BetsAPI)

🤖 AI Analysis:
- Matches analyzed: ~150
- Betting opportunities found: ~87
- Markets analyzed: 4 per match (H2H, DC, O/U, BTTS)
- AI systems used: 4 (GPT-4, Claude, Grok, Groq)

✅ Output:
- Safe picks (≤3.0 odds): ~60-70
- High confidence picks (≥75%): ~60
- Bundles created: 10
- Total games in bundles: ~50-80
- Sport diversity: 4-5 sports per generation
- Average bundle confidence: 78-82%

⏱️ Performance:
- Total generation time: ~5-8 minutes
- Average time per match analysis: 2-3 seconds
- Parallel processing: Yes (all sports simultaneously)
```

---

## Key Takeaways

✅ **Safety First**: Maximum 3.0 odds per pick, minimum 75% confidence

✅ **AI-Powered**: 4 AI systems analyze every match comprehensively

✅ **Value Driven**: Only recommend picks with 10%+ probability edge

✅ **Data Backed**: Minimum 10 games historical data, prefer 15-20

✅ **Multi-Market**: Analyzes H2H, Double Chance, Over/Under, BTTS

✅ **Cross-Sport**: Intelligent sport mixing for better risk distribution

✅ **Mathematically Optimized**: Geometric mean ensures precise odds targeting

✅ **Quality Controlled**: Multiple validation layers ensure safety

---

**Document Version**: 1.0
**Last Updated**: 2025-11-11
**Applies To**: Gambo Platform v2.0+
