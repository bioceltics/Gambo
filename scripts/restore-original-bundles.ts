import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreOriginalBundles() {
  console.log('🔄 Restoring Original Bundles\n');
  console.log('='.repeat(60));

  // Step 1: Delete all current active bundles (test bundles)
  console.log('\n1️⃣  Deleting test bundles...');

  const testBundles = await prisma.bundle.findMany({
    where: { isActive: true }
  });

  console.log(`   Found ${testBundles.length} test bundles to delete`);

  // Delete bundle games first (foreign key constraint)
  await prisma.bundleGame.deleteMany({
    where: {
      bundleId: {
        in: testBundles.map(b => b.id)
      }
    }
  });

  // Delete bundle performances
  await prisma.bundlePerformance.deleteMany({
    where: {
      bundleId: {
        in: testBundles.map(b => b.id)
      }
    }
  });

  // Delete bundles
  await prisma.bundle.deleteMany({
    where: { isActive: true }
  });

  // Get all test game IDs
  const testGames = await prisma.game.findMany({
    where: {
      OR: [
        { league: { contains: 'Test League' } },
        { league: { in: ['Premier League', 'NBA', 'NHL', 'NFL'] } }
      ]
    },
    select: { id: true }
  });

  // Delete test games (only those not referenced by any bundles)
  if (testGames.length > 0) {
    await prisma.game.deleteMany({
      where: {
        id: { in: testGames.map(g => g.id) },
        bundles: { none: {} }
      }
    });
  }

  console.log('   ✅ Test bundles and games deleted\n');

  // Step 2: Get the most recent archived bundles (the original ones)
  console.log('2️⃣  Finding original bundles...');

  const recentBundles = await prisma.bundle.findMany({
    where: { isActive: false },
    orderBy: { createdAt: 'desc' },
    take: 8
  });

  console.log(`   Found ${recentBundles.length} archived bundles\n`);

  // Step 3: Reactivate them
  console.log('3️⃣  Reactivating original bundles...');

  for (const bundle of recentBundles) {
    await prisma.bundle.update({
      where: { id: bundle.id },
      data: { isActive: true }
    });
    console.log(`   ✅ ${bundle.name}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Original bundles restored successfully!\n');

  console.log('📊 Restored Bundles:');
  const restored = await prisma.bundle.findMany({
    where: { isActive: true },
    include: { games: true }
  });

  for (const bundle of restored) {
    console.log(`   🏆 ${bundle.name} - ${bundle.games.length} games`);
  }

  console.log('\n🌐 View at: http://localhost:3001/bundles');
  console.log('🎉 System restored to original state!\n');

  await prisma.$disconnect();
}

restoreOriginalBundles().catch((error) => {
  console.error('Error restoring bundles:', error);
  process.exit(1);
});
