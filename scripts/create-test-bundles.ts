import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestBundles() {
  console.log('🎨 Creating Test Bundles with Color Status Variations\n');
  console.log('='.repeat(60));

  // Test Bundle 1: ALL WON (GREEN)
  console.log('\n1️⃣  Creating Bundle: ALL GAMES WON (Green Status)');
  const bundle1 = await prisma.bundle.create({
    data: {
      name: '🟢 Test Bundle - All Won',
      type: 'STANDARD',
      confidence: 85,
      expectedReturn: 5.2,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  // Create won games for bundle 1
  const wonGames = [
    { home: 'Man City', away: 'Liverpool', homeScore: 3, awayScore: 1, pick: 'Home Win', odds: 1.75 },
    { home: 'Barcelona', away: 'Real Madrid', homeScore: 2, awayScore: 1, pick: 'Home Win', odds: 1.85 },
    { home: 'Bayern Munich', away: 'Dortmund', homeScore: 4, awayScore: 2, pick: 'Over 2.5', odds: 1.65 },
  ];

  for (const gameData of wonGames) {
    const game = await prisma.game.create({
      data: {
        sport: 'SOCCER',
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: 'Test League',
        scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'FINISHED',
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: bundle1.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: 'Strong performance expected',
        result: 'WIN',
      }
    });
  }

  // Calculate actual return for bundle 1
  const actualReturn = wonGames.reduce((acc, g) => acc * g.odds, 1);
  await prisma.bundlePerformance.create({
    data: {
      bundleId: bundle1.id,
      totalGames: wonGames.length,
      wins: wonGames.length,
      losses: 0,
      pushes: 0,
      actualReturn: actualReturn,
    }
  });

  console.log(`   ✅ Created ${wonGames.length} WON games`);
  console.log(`   💰 Actual Return: ${actualReturn.toFixed(2)}x`);

  // Test Bundle 2: HAS LOSSES (RED)
  console.log('\n2️⃣  Creating Bundle: HAS LOST GAMES (Red Status)');
  const bundle2 = await prisma.bundle.create({
    data: {
      name: '🔴 Test Bundle - Has Losses',
      type: 'PLUS_50_ODDS',
      confidence: 70,
      expectedReturn: 8.5,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  const mixedGames = [
    { home: 'Arsenal', away: 'Chelsea', homeScore: 2, awayScore: 1, pick: 'Home Win', odds: 2.10, result: 'WIN' },
    { home: 'PSG', away: 'Lyon', homeScore: 1, awayScore: 2, pick: 'Home Win', odds: 1.80, result: 'LOSS' }, // LOST
    { home: 'Inter Milan', away: 'AC Milan', homeScore: 3, awayScore: 1, pick: 'Over 2.5', odds: 1.75, result: 'WIN' },
  ];

  for (const gameData of mixedGames) {
    const game = await prisma.game.create({
      data: {
        sport: 'SOCCER',
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: 'Test League',
        scheduledAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        status: 'FINISHED',
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: bundle2.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: 'Expected strong performance',
        result: gameData.result,
      }
    });
  }

  await prisma.bundlePerformance.create({
    data: {
      bundleId: bundle2.id,
      totalGames: mixedGames.length,
      wins: mixedGames.filter(g => g.result === 'WIN').length,
      losses: mixedGames.filter(g => g.result === 'LOSS').length,
      pushes: 0,
      actualReturn: 0, // Bundle lost
    }
  });

  console.log(`   ✅ Created ${mixedGames.length} mixed games (${mixedGames.filter(g => g.result === 'WIN').length} won, ${mixedGames.filter(g => g.result === 'LOSS').length} lost)`);
  console.log(`   💰 Bundle Lost (has 1 loss)`);

  // Test Bundle 3: LIVE GAMES (BLUE PULSING)
  console.log('\n3️⃣  Creating Bundle: LIVE GAMES (Blue Pulsing Status)');
  const bundle3 = await prisma.bundle.create({
    data: {
      name: '🔵 Test Bundle - Live Games',
      type: 'WEEKEND_PLUS_10',
      confidence: 80,
      expectedReturn: 6.3,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  const liveGames = [
    { home: 'Juventus', away: 'Napoli', homeScore: 1, awayScore: 1, pick: 'Home Win', odds: 1.95, status: 'LIVE', minute: 38 },
    { home: 'Atletico Madrid', away: 'Sevilla', homeScore: 2, awayScore: 0, pick: 'Over 2.5', odds: 1.70, status: 'LIVE', minute: 67 },
    { home: 'Tottenham', away: 'West Ham', homeScore: 0, awayScore: 0, pick: 'BTTS', odds: 1.85, status: 'LIVE', minute: 23 },
  ];

  for (const gameData of liveGames) {
    const period = gameData.minute <= 45 ? 'First Half' : gameData.minute <= 90 ? 'Second Half' : 'Extra Time';

    const game = await prisma.game.create({
      data: {
        sport: 'SOCCER',
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: 'Test League - Live',
        scheduledAt: new Date(Date.now() - gameData.minute * 60 * 1000), // Started N minutes ago
        status: gameData.status,
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
        currentPeriod: `${period} - ${gameData.minute}'`,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: bundle3.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: 'Currently in play',
        result: null, // No result yet
      }
    });
  }

  console.log(`   ✅ Created ${liveGames.length} LIVE games (in progress)`);
  console.log(`   🔵 Status: Games are LIVE NOW`);

  // Test Bundle 4: MIXED (Live + Finished)
  console.log('\n4️⃣  Creating Bundle: MIXED Status (Blue - has live games)');
  const bundle4 = await prisma.bundle.create({
    data: {
      name: '🔵 Test Bundle - Mixed Live & Finished',
      type: 'STANDARD',
      confidence: 75,
      expectedReturn: 4.8,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  const mixedStatusGames = [
    { home: 'Lazio', away: 'Roma', homeScore: 2, awayScore: 1, pick: 'Home Win', odds: 1.90, status: 'FINISHED', result: 'WIN', minute: null },
    { home: 'Fiorentina', away: 'Atalanta', homeScore: 1, awayScore: 0, pick: 'Over 2.5', odds: 1.75, status: 'LIVE', result: null, minute: 52 },
    { home: 'Udinese', away: 'Sampdoria', homeScore: 0, awayScore: 0, pick: 'Home Win', odds: 1.65, status: 'UPCOMING', result: null, minute: null },
  ];

  for (const gameData of mixedStatusGames) {
    const scheduledTime = gameData.status === 'UPCOMING'
      ? new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      : new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago

    // Calculate current period for live games
    let currentPeriod = null;
    if (gameData.status === 'LIVE' && gameData.minute) {
      const period = gameData.minute <= 45 ? 'First Half' : gameData.minute <= 90 ? 'Second Half' : 'Extra Time';
      currentPeriod = `${period} - ${gameData.minute}'`;
    }

    const game = await prisma.game.create({
      data: {
        sport: 'SOCCER',
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: 'Test League - Mixed',
        scheduledAt: scheduledTime,
        status: gameData.status,
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
        currentPeriod: currentPeriod,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: bundle4.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: 'Mixed status test',
        result: gameData.result,
      }
    });
  }

  console.log(`   ✅ Created ${mixedStatusGames.length} games (1 finished, 1 live, 1 scheduled)`);
  console.log(`   🔵 Status: Bundle has LIVE games (blue pulsing)`);

  // Test Bundle 5: WITH PUSH
  console.log('\n5️⃣  Creating Bundle: WITH PUSH GAME (Yellow Status)');
  const bundle5 = await prisma.bundle.create({
    data: {
      name: '🟡 Test Bundle - Has Push',
      type: 'STANDARD',
      confidence: 78,
      expectedReturn: 5.5,
      tierAccess: 'ULTIMATE',
      isActive: true,
      publishedAt: new Date(),
    }
  });

  const pushGames = [
    { home: 'Valencia', away: 'Villarreal', homeScore: 2, awayScore: 1, pick: 'Home Win', odds: 2.00, result: 'WIN' },
    { home: 'Getafe', away: 'Osasuna', homeScore: 1, awayScore: 1, pick: 'Home Win', odds: 1.85, result: 'PUSH' }, // PUSH
    { home: 'Betis', away: 'Mallorca', homeScore: 3, awayScore: 2, pick: 'Over 2.5', odds: 1.70, result: 'WIN' },
  ];

  for (const gameData of pushGames) {
    const game = await prisma.game.create({
      data: {
        sport: 'SOCCER',
        homeTeam: gameData.home,
        awayTeam: gameData.away,
        league: 'Test League',
        scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'FINISHED',
        homeScore: gameData.homeScore,
        awayScore: gameData.awayScore,
      }
    });

    await prisma.bundleGame.create({
      data: {
        bundleId: bundle5.id,
        gameId: game.id,
        pick: gameData.pick,
        odds: gameData.odds,
        summary: 'Test with push',
        result: gameData.result,
      }
    });
  }

  console.log(`   ✅ Created ${pushGames.length} games (2 won, 1 push)`);
  console.log(`   🟡 Has PUSH game (yellow indicator)`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ All test bundles created successfully!\n');

  // Summary
  console.log('📊 TEST BUNDLE SUMMARY:');
  console.log('━'.repeat(60));
  console.log('1. 🟢 All Won Bundle      → GREEN return card');
  console.log('2. 🔴 Has Losses Bundle   → RED return card');
  console.log('3. 🔵 Live Games Bundle   → BLUE PULSING return card');
  console.log('4. 🔵 Mixed Status Bundle → BLUE PULSING (has live)');
  console.log('5. 🟡 With Push Bundle    → Shows push game (yellow)');
  console.log('━'.repeat(60));
  console.log('\n🌐 View at: http://localhost:3001/bundles');
  console.log('🎨 All color statuses ready for testing!\n');

  await prisma.$disconnect();
}

createTestBundles().catch(console.error);
