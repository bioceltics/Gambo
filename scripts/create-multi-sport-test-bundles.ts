import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMultiSportTestBundles() {
  console.log('🎨 Creating Multi-Sport Test Bundles with Live Match Time\n');
  console.log('='.repeat(60));

  // Test Bundle 1: SOCCER LIVE GAMES
  console.log('\n⚽ Creating Bundle: SOCCER LIVE GAMES');
  const soccerBundle = await prisma.bundle.create({
    data: {
      name: '⚽ Soccer Live Bundle',
      type: 'STANDARD',
      confidence: 85,
      expectedReturn: 4.5,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  const soccerGames = [
    { home: 'Man United', away: 'Arsenal', homeScore: 1, awayScore: 1, pick: 'Over 2.5', odds: 1.80, minute: 34 },
    { home: 'Liverpool', away: 'Chelsea', homeScore: 2, awayScore: 0, pick: 'Home Win', odds: 1.65, minute: 58 },
  ];

  for (const gameData of soccerGames) {
    const period = gameData.minute <= 45 ? 'First Half' : gameData.minute <= 90 ? 'Second Half' : 'Extra Time';

    const game = await prisma.game.create({
      data: {
        sport: 'SOCCER',
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: 'Premier League',
        scheduledAt: new Date(Date.now() - gameData.minute * 60 * 1000),
        status: 'LIVE',
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
        currentPeriod: `${period} - ${gameData.minute}'`,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: soccerBundle.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: 'Live soccer match in progress',
      }
    });
  }

  console.log(`   ✅ Created ${soccerGames.length} LIVE soccer games`);

  // Test Bundle 2: BASKETBALL LIVE GAMES
  console.log('\n🏀 Creating Bundle: BASKETBALL LIVE GAMES');
  const basketballBundle = await prisma.bundle.create({
    data: {
      name: '🏀 Basketball Live Bundle',
      type: 'STANDARD',
      confidence: 80,
      expectedReturn: 3.8,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  const basketballGames = [
    { home: 'Lakers', away: 'Warriors', homeScore: 65, awayScore: 62, pick: 'Home Win', odds: 1.75, minute: 8, quarter: 3 },
    { home: 'Celtics', away: 'Heat', homeScore: 52, awayScore: 48, pick: 'Over 210.5', odds: 1.85, minute: 5, quarter: 2 },
  ];

  for (const gameData of basketballGames) {
    const quarter = `Q${gameData.quarter}`;

    const game = await prisma.game.create({
      data: {
        sport: 'BASKETBALL',
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: 'NBA',
        scheduledAt: new Date(Date.now() - 60 * 60 * 1000),
        status: 'LIVE',
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
        currentPeriod: `${quarter} - ${gameData.minute}'`,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: basketballBundle.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: 'Live basketball game in progress',
      }
    });
  }

  console.log(`   ✅ Created ${basketballGames.length} LIVE basketball games`);

  // Test Bundle 3: HOCKEY LIVE GAMES
  console.log('\n🏒 Creating Bundle: HOCKEY LIVE GAMES');
  const hockeyBundle = await prisma.bundle.create({
    data: {
      name: '🏒 Hockey Live Bundle',
      type: 'STANDARD',
      confidence: 78,
      expectedReturn: 4.2,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  const hockeyGames = [
    { home: 'Maple Leafs', away: 'Canadiens', homeScore: 2, awayScore: 1, pick: 'Home Win', odds: 1.70, minute: 12, period: 2 },
    { home: 'Rangers', away: 'Bruins', homeScore: 1, awayScore: 1, pick: 'Over 5.5', odds: 1.90, minute: 7, period: 1 },
  ];

  for (const gameData of hockeyGames) {
    const period = `P${gameData.period}`;

    const game = await prisma.game.create({
      data: {
        sport: 'HOCKEY',
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: 'NHL',
        scheduledAt: new Date(Date.now() - 60 * 60 * 1000),
        status: 'LIVE',
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
        currentPeriod: `${period} - ${gameData.minute}'`,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: hockeyBundle.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: 'Live hockey game in progress',
      }
    });
  }

  console.log(`   ✅ Created ${hockeyGames.length} LIVE hockey games`);

  // Test Bundle 4: AMERICAN FOOTBALL LIVE GAMES
  console.log('\n🏈 Creating Bundle: AMERICAN FOOTBALL LIVE GAMES');
  const footballBundle = await prisma.bundle.create({
    data: {
      name: '🏈 Football Live Bundle',
      type: 'STANDARD',
      confidence: 82,
      expectedReturn: 5.1,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  const footballGames = [
    { home: 'Cowboys', away: 'Eagles', homeScore: 14, awayScore: 10, pick: 'Home Win', odds: 1.85, minute: 8, quarter: 2 },
    { home: 'Chiefs', away: 'Bills', homeScore: 21, awayScore: 17, pick: 'Over 48.5', odds: 1.75, minute: 3, quarter: 3 },
  ];

  for (const gameData of footballGames) {
    const quarter = `Q${gameData.quarter}`;

    const game = await prisma.game.create({
      data: {
        sport: 'FOOTBALL',
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: 'NFL',
        scheduledAt: new Date(Date.now() - 90 * 60 * 1000),
        status: 'LIVE',
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
        currentPeriod: `${quarter} - ${gameData.minute}'`,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: footballBundle.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: 'Live football game in progress',
      }
    });
  }

  console.log(`   ✅ Created ${footballGames.length} LIVE football games`);

  // Test Bundle 5: MIXED SPORTS BUNDLE
  console.log('\n🌐 Creating Bundle: MIXED SPORTS LIVE BUNDLE');
  const mixedBundle = await prisma.bundle.create({
    data: {
      name: '🌐 Mixed Sports Live Bundle',
      type: 'STANDARD',
      confidence: 80,
      expectedReturn: 6.5,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  const mixedGames = [
    { sport: 'SOCCER', home: 'Barcelona', away: 'Real Madrid', homeScore: 1, awayScore: 0, pick: 'Over 2.5', odds: 1.70, period: 'First Half - 28\'', league: 'La Liga' },
    { sport: 'BASKETBALL', home: 'Nets', away: 'Knicks', homeScore: 78, awayScore: 75, pick: 'Home Win', odds: 1.65, period: 'Q3 - 6\'', league: 'NBA' },
    { sport: 'HOCKEY', home: 'Penguins', away: 'Flyers', homeScore: 2, awayScore: 2, pick: 'Over 5.5', odds: 1.80, period: 'P2 - 15\'', league: 'NHL' },
    { sport: 'FOOTBALL', home: 'Packers', away: 'Vikings', homeScore: 10, awayScore: 7, pick: 'Home Win', odds: 1.75, period: 'Q2 - 5\'', league: 'NFL' },
  ];

  for (const gameData of mixedGames) {
    const game = await prisma.game.create({
      data: {
        sport: gameData.sport as any,
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: gameData.league,
        scheduledAt: new Date(Date.now() - 60 * 60 * 1000),
        status: 'LIVE',
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
        currentPeriod: gameData.period,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: mixedBundle.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: `Live ${gameData.sport.toLowerCase()} match in progress`,
      }
    });
  }

  console.log(`   ✅ Created ${mixedGames.length} LIVE mixed sport games`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All multi-sport test bundles created successfully!\n');

  // Summary
  console.log('📊 MULTI-SPORT TEST BUNDLE SUMMARY:');
  console.log('━'.repeat(60));
  console.log('1. ⚽ Soccer Live Bundle      → 2 live soccer games with time');
  console.log('2. 🏀 Basketball Live Bundle → 2 live basketball games with time');
  console.log('3. 🏒 Hockey Live Bundle     → 2 live hockey games with time');
  console.log('4. 🏈 Football Live Bundle   → 2 live football games with time');
  console.log('5. 🌐 Mixed Sports Bundle    → 4 live games across all sports');
  console.log('━'.repeat(60));
  console.log('\n🌐 View at: http://localhost:3001/bundles');
  console.log('🎨 All sports with live match time ready for testing!\n');

  await prisma.$disconnect();
}

createMultiSportTestBundles().catch(console.error);
