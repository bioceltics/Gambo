import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkGames() {
  const bundles = await prisma.bundle.findMany({
    where: {
      isActive: true,
      publishedAt: { not: null }
    },
    include: {
      games: {
        include: {
          game: true
        }
      },
      performance: true
    }
  });

  console.log('='.repeat(80));
  console.log('ACTIVE BUNDLES AND THEIR GAMES\n');

  for (const bundle of bundles) {
    console.log(`\n📦 Bundle: ${bundle.name}`);
    console.log(`   Type: ${bundle.type}`);
    console.log(`   Total Games: ${bundle.games.length}`);

    if (bundle.performance) {
      console.log(`   Performance: ${bundle.performance.wins}W-${bundle.performance.losses}L-${bundle.performance.pushes}P`);
      console.log(`   Actual Return: ${bundle.performance.actualReturn}`);
    }

    console.log('\n   Games:');
    for (const bg of bundle.games) {
      const game = bg.game;
      const resultText = bg.result || 'PENDING';
      console.log(`   - ${game.homeTeam} vs ${game.awayTeam}`);
      console.log(`     Status: ${game.status} | Pick: ${bg.pick} | Result: ${resultText}`);
      if (game.homeScore !== null && game.awayScore !== null) {
        console.log(`     Score: ${game.homeScore}-${game.awayScore}`);
      }
      console.log(`     Scheduled: ${game.scheduledAt}`);
      console.log('');
    }
    console.log('-'.repeat(80));
  }

  await prisma.$disconnect();
}

checkGames();
