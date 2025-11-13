import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDiversity() {
  const bundles = await prisma.bundle.findMany({
    where: { isActive: true },
    include: { games: true },
    take: 3
  });

  for (const bundle of bundles) {
    console.log(`\n📦 ${bundle.name}`);
    console.log(`   Expected Return: ${bundle.expectedReturn}x`);
    console.log(`   Games:`);
    for (const game of bundle.games) {
      // Fetch the actual Game data to get team names
      const gameData = await prisma.game.findUnique({
        where: { id: game.gameId }
      });
      console.log(`   ✓ ${gameData?.homeTeam} vs ${gameData?.awayTeam}`);
      console.log(`     Pick: ${game.pick} @ ${game.odds} [${game.betType}]`);
    }
  }

  // Count by bet type
  const games = await prisma.bundleGame.findMany({
    where: { bundle: { isActive: true } }
  });

  const betTypes = games.reduce((acc, game) => {
    acc[game.betType] = (acc[game.betType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`\n\n📊 Bet Type Distribution:`);
  Object.entries(betTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  // Show some examples of non-H2H picks
  const nonH2H = games.filter(g => g.betType !== 'h2h').slice(0, 5);
  console.log(`\n\n🎯 Sample Non-H2H Picks (${nonH2H.length} total):`);
  for (const game of nonH2H) {
    const gameData = await prisma.game.findUnique({
      where: { id: game.gameId }
    });
    console.log(`   ${gameData?.homeTeam} vs ${gameData?.awayTeam}`);
    console.log(`   Pick: ${game.pick} @ ${game.odds} [${game.betType}]`);
    console.log('');
  }

  await prisma.$disconnect();
}

checkDiversity().catch(console.error);
