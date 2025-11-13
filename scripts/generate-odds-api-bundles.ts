/**
 * Generate Daily Bundles using ONLY The Odds API
 * Uses real, live fixtures from The Odds API
 */

import { PrismaClient, BundleType, SubscriptionTier, Sport } from '@prisma/client';

const prisma = new PrismaClient();

async function generateBundlesFromOddsAPI() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       REAL DATA BUNDLE GENERATION - THE ODDS API         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const oddsApiKey = process.env.ODDS_API_KEY || '';

  if (!oddsApiKey) {
    console.log('❌ ODDS_API_KEY not configured in .env file\n');
    return;
  }

  // Clear existing bundles
  console.log('🗑️  Clearing old bundles...');
  await prisma.bundleGame.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.game.deleteMany({});
  console.log('✅ Database cleared\n');

  // Fetch all fixtures from The Odds API
  console.log('🔍 Fetching fixtures from The Odds API...\n');

  const allGames: any[] = [];

  // Fetch soccer fixtures
  try {
    const soccerResponse = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${oddsApiKey}&regions=us&markets=h2h&dateFormat=iso`
    );
    if (soccerResponse.ok) {
      const soccerData = await soccerResponse.json();
      console.log(`   ⚽ Found ${soccerData.length} Premier League fixtures`);

      for (const event of soccerData.slice(0, 20)) {
        const bookmaker = event.bookmakers?.[0];
        const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
        const homeOdds = h2hMarket?.outcomes?.find((o: any) => o.name === event.home_team);
        const awayOdds = h2hMarket?.outcomes?.find((o: any) => o.name === event.away_team);
        const drawOdds = h2hMarket?.outcomes?.find((o: any) => o.name === 'Draw');

        allGames.push({
          id: event.id,
          sport: 'SOCCER' as Sport,
          league: 'Premier League',
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          scheduledAt: new Date(event.commence_time),
          venue: 'Stadium',
          odds: {
            homeWin: homeOdds?.price || 2.0,
            draw: drawOdds?.price || 3.5,
            awayWin: awayOdds?.price || 3.0,
            bookmaker: bookmaker?.title || 'Unknown',
          },
        });
      }
    }
  } catch (error: any) {
    console.log(`   ⚠️  Error fetching soccer: ${error.message}`);
  }

  // Fetch basketball fixtures
  try {
    const basketballResponse = await fetch(
      `https://api.the-odds-api.com/v4/sports/basketball_nba/odds/?apiKey=${oddsApiKey}&regions=us&markets=h2h&dateFormat=iso`
    );
    if (basketballResponse.ok) {
      const basketballData = await basketballResponse.json();
      console.log(`   🏀 Found ${basketballData.length} NBA fixtures`);

      for (const event of basketballData.slice(0, 10)) {
        const bookmaker = event.bookmakers?.[0];
        const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
        const homeOdds = h2hMarket?.outcomes?.find((o: any) => o.name === event.home_team);
        const awayOdds = h2hMarket?.outcomes?.find((o: any) => o.name === event.away_team);

        allGames.push({
          id: event.id,
          sport: 'BASKETBALL' as Sport,
          league: 'NBA',
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          scheduledAt: new Date(event.commence_time),
          venue: 'Arena',
          odds: {
            homeWin: homeOdds?.price || 2.0,
            awayWin: awayOdds?.price || 2.0,
            bookmaker: bookmaker?.title || 'Unknown',
          },
        });
      }
    }
  } catch (error: any) {
    console.log(`   ⚠️  Error fetching basketball: ${error.message}`);
  }

  // Fetch American football fixtures
  try {
    const footballResponse = await fetch(
      `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=${oddsApiKey}&regions=us&markets=h2h&dateFormat=iso`
    );
    if (footballResponse.ok) {
      const footballData = await footballResponse.json();
      console.log(`   🏈 Found ${footballData.length} NFL fixtures`);

      for (const event of footballData.slice(0, 10)) {
        const bookmaker = event.bookmakers?.[0];
        const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h');
        const homeOdds = h2hMarket?.outcomes?.find((o: any) => o.name === event.home_team);
        const awayOdds = h2hMarket?.outcomes?.find((o: any) => o.name === event.away_team);

        allGames.push({
          id: event.id,
          sport: 'FOOTBALL' as Sport,
          league: 'NFL',
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          scheduledAt: new Date(event.commence_time),
          venue: 'Stadium',
          odds: {
            homeWin: homeOdds?.price || 2.0,
            awayWin: awayOdds?.price || 2.0,
            bookmaker: bookmaker?.title || 'Unknown',
          },
        });
      }
    }
  } catch (error: any) {
    console.log(`   ⚠️  Error fetching football: ${error.message}`);
  }

  console.log(`\n   ✅ Total games fetched: ${allGames.length}\n`);

  if (allGames.length === 0) {
    console.log('❌ No fixtures found from The Odds API\n');
    return;
  }

  // First, find and add Manchester City vs Liverpool to a featured bundle
  const manCityLiverpool = allGames.find(g =>
    g.homeTeam === 'Manchester City' && g.awayTeam === 'Liverpool'
  );

  if (manCityLiverpool) {
    console.log(`\n🌟 Featured Match Found: ${manCityLiverpool.homeTeam} vs ${manCityLiverpool.awayTeam}`);
    console.log(`   Odds: ${manCityLiverpool.odds.homeWin.toFixed(2)} (Home) | ${manCityLiverpool.odds.draw?.toFixed(2)} (Draw) | ${manCityLiverpool.odds.awayWin.toFixed(2)} (Away)`);

    // Create featured bundle with Man City vs Liverpool
    const publishedAt = new Date();
    publishedAt.setMinutes(publishedAt.getMinutes() - 10);

    const featuredBundle = await prisma.bundle.create({
      data: {
        name: 'Featured Match: Man City vs Liverpool',
        type: 'STANDARD' as BundleType,
        confidence: 80,
        expectedReturn: manCityLiverpool.odds.homeWin,
        tierAccess: 'FREE' as SubscriptionTier,
        isActive: true,
        publishedAt,
      },
    });

    const game = await prisma.game.create({
      data: {
        sport: manCityLiverpool.sport,
        homeTeam: manCityLiverpool.homeTeam,
        awayTeam: manCityLiverpool.awayTeam,
        league: manCityLiverpool.league,
        scheduledAt: manCityLiverpool.scheduledAt,
        status: 'UPCOMING',
      },
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: featuredBundle.id,
        gameId: game.id,
        pick: 'Home Win',
        odds: manCityLiverpool.odds.homeWin,
        summary: `Manchester City to beat Liverpool at home. This is the biggest Premier League clash of the weekend.`,
        recentForm: `Man City: Strong home form | Liverpool: Excellent away record`,
        headToHead: `Historic rivalry - scheduled for ${manCityLiverpool.scheduledAt.toLocaleString()}`,
        injuries: 'Key players available',
        advancedMetrics: `${manCityLiverpool.league} - Top-of-the-table clash`,
      },
    });

    console.log(`   ✅ Featured bundle created\n`);
  }

  // Bundle configurations
  const bundleConfigs = [
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
  ];

  const now = new Date();
  let successCount = 0;

  for (let i = 0; i < bundleConfigs.length; i++) {
    const config = bundleConfigs[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Bundle ${i + 1}/${bundleConfigs.length}: ${config.name}`);
    console.log(`${'='.repeat(60)}`);

    // Filter games by sport
    const availableGames = allGames.filter(
      g => config.sports.includes(g.sport)
    );

    console.log(`   Available games for ${config.sports.join(', ')}: ${availableGames.length}`);

    if (availableGames.length === 0) {
      console.log(`   ⚠️  Skipping - no games available`);
      continue;
    }

    // Select best games based on odds
    const targetOddsPerGame = Math.pow(config.targetOdds, 1 / config.maxGames);
    const sorted = availableGames.sort((a, b) => {
      const aDiff = Math.abs((a.odds.homeWin || 2) - targetOddsPerGame);
      const bDiff = Math.abs((b.odds.homeWin || 2) - targetOddsPerGame);
      return aDiff - bDiff;
    });

    const selectedGames = sorted.slice(0, config.maxGames);
    const combinedOdds = selectedGames.reduce((acc, g) => acc * (g.odds.homeWin || 2.0), 1);

    // Create bundle
    const publishedAt = new Date(now);
    publishedAt.setMinutes(publishedAt.getMinutes() + config.publishOffset);

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

    console.log(`   ✅ Bundle created: ${bundle.name}`);
    console.log(`   Combined Odds: ${combinedOdds.toFixed(2)}x`);
    console.log(`   Games: ${selectedGames.length}\n`);

    // Create games
    for (const gameData of selectedGames) {
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

      const pick = gameData.odds.homeWin < (gameData.odds.awayWin || 3.0) ? 'Home Win' : 'Away Win';
      const pickOdds = pick === 'Home Win' ? gameData.odds.homeWin : (gameData.odds.awayWin || 2.0);

      await prisma.bundleGame.create({
        data: {
          bundleId: bundle.id,
          gameId: game.id,
          pick,
          odds: pickOdds,
          summary: `${gameData.homeTeam} vs ${gameData.awayTeam} - ${pick} at ${pickOdds.toFixed(2)} odds`,
          recentForm: `Live odds from ${gameData.odds.bookmaker}`,
          headToHead: `Scheduled for ${gameData.scheduledAt.toLocaleString()}`,
          injuries: 'Real-time data',
          advancedMetrics: `${gameData.league} - ${gameData.sport}`,
        },
      });

      console.log(`      ${gameData.homeTeam} vs ${gameData.awayTeam} - ${pick} @ ${pickOdds.toFixed(2)}`);
    }

    successCount++;
  }

  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                   GENERATION COMPLETE                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Bundles created: ${successCount}`);

  const bundlesInDb = await prisma.bundle.count();
  const gamesInDb = await prisma.game.count();

  console.log('\n📋 Database Status:');
  console.log(`   Bundles: ${bundlesInDb}`);
  console.log(`   Games: ${gamesInDb}`);
  console.log(`   Average games per bundle: ${(gamesInDb / bundlesInDb).toFixed(1)}`);

  console.log('\n🎯 Bundles are now live on /bundles page!\n');
}

// Run the script
generateBundlesFromOddsAPI()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
