/**
 * Generate Daily Bundles using Gambo 1.0 Engine with REAL DATA
 * Fetches live fixtures and odds from API-Sports and The Odds API
 */

import { PrismaClient, BundleType, SubscriptionTier, Sport } from '@prisma/client';
import { GamboEngine, BundleGenerator } from '../lib/gambo-engine';
import RealDataProvider from '../lib/gambo-engine/data/RealDataProvider';

const prisma = new PrismaClient();
const realDataProvider = new RealDataProvider();

async function generateRealBundles() {
  console.log('\\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       GAMBO 1.0 - REAL DATA BUNDLE GENERATION             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\\n');

  // Initialize engine
  const engine = new GamboEngine();
  const bundleGenerator = new BundleGenerator(engine);

  // Clear existing bundles
  console.log('🗑️  Clearing old bundles...');
  await prisma.bundleGame.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.game.deleteMany({});
  console.log('✅ Database cleared\\n');

  const now = new Date();

  // Fetch real upcoming fixtures
  console.log('🔍 Fetching real fixtures from APIs...\\n');

  const soccerFixtures = await realDataProvider.fetchUpcomingFixtures('SOCCER');
  const basketballFixtures = await realDataProvider.fetchUpcomingFixtures('BASKETBALL');
  const footballFixtures = await realDataProvider.fetchUpcomingFixtures('FOOTBALL');

  console.log(`   Found ${soccerFixtures.length} soccer matches`);
  console.log(`   Found ${basketballFixtures.length} basketball games`);
  console.log(`   Found ${footballFixtures.length} football games\\n`);

  // Convert fixtures to GameData
  const allGames = [
    ...soccerFixtures.map(f => realDataProvider.convertFixtureToGameData(f, 'SOCCER')),
    ...basketballFixtures.map(f => realDataProvider.convertFixtureToGameData(f, 'BASKETBALL')),
    ...footballFixtures.map(f => realDataProvider.convertFixtureToGameData(f, 'FOOTBALL')),
  ].filter(g => g !== null);

  if (allGames.length === 0) {
    console.log('⚠️  No real fixtures found. This could mean:');
    console.log('   1. API keys are not configured');
    console.log('   2. No games scheduled for tomorrow');
    console.log('   3. API rate limits reached\\n');
    console.log('   Please add your API keys to .env file:');
    console.log('   - API_SPORTS_KEY from https://www.api-football.com/');
    console.log('   - ODDS_API_KEY from https://the-odds-api.com/\\n');
    return;
  }

  console.log(`✅ Successfully converted ${allGames.length} fixtures to GameData\\n`);

  // Fetch real odds for games
  console.log('💰 Fetching real odds...\\n');
  for (const game of allGames) {
    if (game) {
      try {
        const odds = await realDataProvider.fetchOdds(game.sport, game.id);
        game.odds = odds;
        console.log(`   ${game.homeTeam} vs ${game.awayTeam}: ${odds.homeWin.toFixed(2)} / ${odds.draw?.toFixed(2) || 'N/A'} / ${odds.awayWin.toFixed(2)}`);
      } catch (error: any) {
        console.log(`   ⚠️  Could not fetch odds for ${game.homeTeam} vs ${game.awayTeam}`);
      }
    }
  }
  console.log('');

  const bundleConfigs = [
    // Bundle 1: +2 odds FREE
    {
      name: 'Free Daily Double',
      type: 'STANDARD' as BundleType,
      targetOdds: 2.0,
      minConfidence: 75,
      maxGames: 2,
      tierAccess: 'FREE' as SubscriptionTier,
      sports: ['SOCCER', 'BASKETBALL'] as Sport[],
      publishOffset: -9,
    },
    // Bundle 2: +5 odds BASIC
    {
      name: 'Basic Mixed 5X',
      type: 'STANDARD' as BundleType,
      targetOdds: 5.0,
      minConfidence: 70,
      maxGames: 3,
      tierAccess: 'BASIC' as SubscriptionTier,
      sports: ['SOCCER', 'BASKETBALL', 'FOOTBALL'] as Sport[],
      publishOffset: -8,
    },
    // Bundle 3: +5 odds PRO
    {
      name: 'Pro Mixed 5X Elite',
      type: 'STANDARD' as BundleType,
      targetOdds: 5.2,
      minConfidence: 75,
      maxGames: 3,
      tierAccess: 'PRO' as SubscriptionTier,
      sports: ['SOCCER', 'BASKETBALL'] as Sport[],
      publishOffset: -7,
    },
    // Bundle 4: +5 odds PRO
    {
      name: 'Pro Value Picks 5X',
      type: 'STANDARD' as BundleType,
      targetOdds: 5.1,
      minConfidence: 72,
      maxGames: 3,
      tierAccess: 'PRO' as SubscriptionTier,
      sports: ['FOOTBALL', 'BASKETBALL', 'SOCCER'] as Sport[],
      publishOffset: -6,
    },
    // Bundle 5: +5 BTTS PRO
    {
      name: 'BTTS Accumulator Pro',
      type: 'BTTS' as BundleType,
      targetOdds: 5.3,
      minConfidence: 65,
      maxGames: 3,
      tierAccess: 'PRO' as SubscriptionTier,
      sports: ['SOCCER'] as Sport[],
      publishOffset: -5,
    },
    // Bundle 6: +5 Soccer Only ULTIMATE
    {
      name: 'Soccer Parlay Ultimate 5X',
      type: 'STANDARD' as BundleType,
      targetOdds: 5.4,
      minConfidence: 78,
      maxGames: 3,
      tierAccess: 'ULTIMATE' as SubscriptionTier,
      sports: ['SOCCER'] as Sport[],
      publishOffset: -4,
    },
    // Bundle 7: +5 Over/Under ULTIMATE
    {
      name: 'Goals Galore Ultimate',
      type: 'UNDER_OVER' as BundleType,
      targetOdds: 5.6,
      minConfidence: 70,
      maxGames: 3,
      tierAccess: 'ULTIMATE' as SubscriptionTier,
      sports: ['SOCCER'] as Sport[],
      publishOffset: -3,
    },
    // Bundle 8: +5 Players to Score ULTIMATE
    {
      name: 'Goalscorers Special Ultimate',
      type: 'PLAYERS_TO_SCORE' as BundleType,
      targetOdds: 5.5,
      minConfidence: 68,
      maxGames: 3,
      tierAccess: 'ULTIMATE' as SubscriptionTier,
      sports: ['SOCCER'] as Sport[],
      publishOffset: -2,
    },
    // Bundle 9: +10 Weekend Mixed ULTIMATE
    {
      name: 'Weekend Special 10X Ultimate',
      type: 'WEEKEND_PLUS_10' as BundleType,
      targetOdds: 10.2,
      minConfidence: 65,
      maxGames: 4,
      tierAccess: 'ULTIMATE' as SubscriptionTier,
      sports: ['SOCCER', 'BASKETBALL', 'FOOTBALL'] as Sport[],
      publishOffset: -1,
    },
    // Bundle 10: +50 Special ULTIMATE
    {
      name: 'Mega 50X Special Ultimate',
      type: 'PLUS_50_ODDS' as BundleType,
      targetOdds: 52.5,
      minConfidence: 60,
      maxGames: 6,
      tierAccess: 'ULTIMATE' as SubscriptionTier,
      sports: ['SOCCER', 'BASKETBALL', 'FOOTBALL'] as Sport[],
      publishOffset: 0,
    },
  ];

  let successCount = 0;
  let fallbackCount = 0;

  for (let i = 0; i < bundleConfigs.length; i++) {
    const config = bundleConfigs[i];
    console.log(`\\n${'='.repeat(60)}`);
    console.log(`📦 Bundle ${i + 1}/10: ${config.name}`);
    console.log(`${'='.repeat(60)}`);

    // Filter games by sport
    const availableGames = allGames.filter(
      g => g && config.sports.includes(g.sport)
    );

    console.log(`   Available games: ${availableGames.length}`);

    if (availableGames.length === 0) {
      console.log(`   ⚠️  No games available for ${config.sports.join(', ')}`);
      console.log(`   Creating fallback bundle...`);

      // Create fallback bundle
      await createFallbackBundle(config, i + 1, now);
      fallbackCount++;
      continue;
    }

    try {
      // Try to generate with real data
      // Note: BundleGenerator will need to be updated to accept pre-fetched games
      // For now, create bundles manually from real games

      const publishedAt = new Date(now);
      publishedAt.setMinutes(publishedAt.getMinutes() + config.publishOffset);

      // Select best games based on odds and create bundle
      const selectedGames = selectBestGames(availableGames, config);

      if (selectedGames.length === 0) {
        throw new Error('No suitable games found');
      }

      // Calculate combined odds
      const combinedOdds = selectedGames.reduce((acc, g) => acc * (g?.odds.homeWin || 2.0), 1);

      // Create bundle
      const bundle = await prisma.bundle.create({
        data: {
          name: config.name,
          type: config.type,
          confidence: config.minConfidence,
          expectedReturn: combinedOdds,
          tierAccess: config.tierAccess,
          isActive: true,
          publishedAt,
        },
      });

      console.log(`✅ Bundle created: ${bundle.name}`);
      console.log(`   Real Odds: ${combinedOdds.toFixed(2)}x`);
      console.log(`   Games: ${selectedGames.length}`);

      // Create games
      for (const gameData of selectedGames) {
        if (!gameData) continue;

        const game = await prisma.game.create({
          data: {
            sport: gameData.sport,
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            league: gameData.league,
            scheduledAt: gameData.scheduledAt,
            status: 'UPCOMING',
          },
        });

        await prisma.bundleGame.create({
          data: {
            bundleId: bundle.id,
            gameId: game.id,
            pick: 'Home Win',
            odds: gameData.odds.homeWin,
            summary: `${gameData.homeTeam} to win against ${gameData.awayTeam}. Real odds: ${gameData.odds.homeWin.toFixed(2)}`,
            recentForm: `Live data from ${gameData.odds.bookmaker}`,
            headToHead: `Match scheduled for ${gameData.scheduledAt.toLocaleDateString()}`,
            injuries: 'Real-time injury data to be integrated',
            advancedMetrics: `Venue: ${gameData.venue || 'TBD'}`,
          },
        });
      }

      console.log(`   ✅ ${selectedGames.length} real games added`);
      successCount++;

    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
      console.log(`   Creating fallback bundle...`);

      await createFallbackBundle(config, i + 1, now);
      fallbackCount++;
    }
  }

  console.log('\\n\\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                   GENERATION COMPLETE                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\\n');
  console.log(`✅ Real data bundles: ${successCount}`);
  console.log(`⚠️  Fallback bundles: ${fallbackCount}`);
  console.log(`📊 Total bundles: ${successCount + fallbackCount}\\n`);

  // Verify
  const bundlesInDb = await prisma.bundle.count();
  const gamesInDb = await prisma.game.count();

  console.log('📋 Database Status:');
  console.log(`   Bundles: ${bundlesInDb}`);
  console.log(`   Games: ${gamesInDb}`);
  console.log(`   Average games per bundle: ${(gamesInDb / bundlesInDb).toFixed(1)}`);

  console.log('\\n🎯 Bundles are now live on /bundles page!\\n');
}

// Helper to select best games
function selectBestGames(games: any[], config: any): any[] {
  // Sort by odds closest to target
  const targetOddsPerGame = Math.pow(config.targetOdds, 1 / config.maxGames);

  const sorted = games
    .filter(g => g !== null)
    .sort((a, b) => {
      const aDiff = Math.abs((a?.odds.homeWin || 2) - targetOddsPerGame);
      const bDiff = Math.abs((b?.odds.homeWin || 2) - targetOddsPerGame);
      return aDiff - bDiff;
    });

  return sorted.slice(0, config.maxGames);
}

// Helper to create fallback bundle
async function createFallbackBundle(config: any, bundleNumber: number, baseDate: Date) {
  const publishedAt = new Date(baseDate);
  publishedAt.setMinutes(publishedAt.getMinutes() + config.publishOffset);

  const fallbackBundle = await prisma.bundle.create({
    data: {
      name: config.name,
      type: config.type,
      confidence: config.minConfidence,
      expectedReturn: config.targetOdds,
      tierAccess: config.tierAccess,
      isActive: true,
      publishedAt,
    },
  });

  // Create fallback games
  const numGames = Math.min(config.maxGames, 3);
  const oddsPerGame = Math.pow(config.targetOdds, 1 / numGames);

  for (let j = 0; j < numGames; j++) {
    const game = await prisma.game.create({
      data: {
        sport: config.sports[j % config.sports.length],
        homeTeam: `Team A${j + 1}`,
        awayTeam: `Team B${j + 1}`,
        league: 'League TBD',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'UPCOMING',
      },
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: fallbackBundle.id,
        gameId: game.id,
        pick: 'Home Win',
        odds: oddsPerGame,
        summary: `Fallback data - configure API keys for real fixtures`,
        recentForm: 'Add API_SPORTS_KEY to .env',
        headToHead: 'Add ODDS_API_KEY to .env',
        injuries: 'Real data will appear once APIs are configured',
      },
    });
  }

  console.log(`   ✅ Fallback bundle created with ${numGames} games`);
}

// Run the script
generateRealBundles()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
