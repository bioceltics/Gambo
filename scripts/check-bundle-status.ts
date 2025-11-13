import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkBundles() {
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
  console.log('CURRENT BUNDLE STATUS CHECK\n');

  for (const bundle of bundles) {
    const allGames = bundle.games;
    const finishedGames = allGames.filter(bg => bg.game.status === 'FINISHED' || bg.game.status === 'CANCELLED');
    const losses = finishedGames.filter(bg => bg.result === 'LOSS').length;
    const wins = finishedGames.filter(bg => bg.result === 'WIN').length;
    const pushes = finishedGames.filter(bg => bg.result === 'PUSH').length;

    console.log(`Bundle: ${bundle.name}`);
    console.log(`  Total Games: ${allGames.length}`);
    console.log(`  Finished: ${finishedGames.length}`);
    console.log(`  Record: ${wins}W-${losses}L-${pushes}P`);
    console.log(`  Actual Return: ${bundle.performance?.actualReturn}`);

    if (losses > 0) {
      console.log(`  ⚠️  HAS LOSS - Should be marked as LOSS (actualReturn = -1)`);
      const actualReturnIsNegativeOne = bundle.performance?.actualReturn === -1;
      if (!actualReturnIsNegativeOne) {
        console.log(`  ❌ ERROR: actualReturn is ${bundle.performance?.actualReturn} instead of -1`);
      } else {
        console.log(`  ✅ Correctly marked as LOSS`);
      }
    }
    console.log('');
  }

  await prisma.$disconnect();
}

checkBundles();
