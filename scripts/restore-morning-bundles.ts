import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function restoreMorningBundles() {
  console.log('Restoring morning bundles (7:01 AM)...\n');

  // Deactivate current bundles
  const currentBundles = await prisma.bundle.findMany({
    where: {
      isActive: true
    }
  });

  console.log(`Found ${currentBundles.length} active bundles to deactivate\n`);

  for (const bundle of currentBundles) {
    await prisma.bundle.update({
      where: { id: bundle.id },
      data: { isActive: false }
    });
    console.log(`✓ Deactivated: ${bundle.name}`);
  }

  console.log('\n---\n');

  // Restore the morning bundles
  const morningBundleIds = [
    'cmhw4ol3u00003t8m7vr3jhuv', // +2 Odds Free - WON
    'cmhw4ol4d00073t8my7xyzxbg', // +5 Odds Mixed Sports Basic
    'cmhw4ol54000k3t8mc1w5okxg', // +5 Odds Mixed Sports Pro
    'cmhw4ol5r000x3t8m28p29wwh', // +5 Odds Mixed Sports Pro (in progress)
    'cmhw4ol66001a3t8myby23sus', // +5 Odds Only Soccer - LOST
    'cmhw4ol6k001n3t8m2rt8mb98', // +5 Odds Players To Score - LOST
    'cmhw4ol6t00203t8mjgl8igy7', // 10 Odds Weekend - LOST
    'cmhw4ol7e002d3t8m84g8tx5b'  // +20 Odds Special - LOST
  ];

  console.log(`Restoring ${morningBundleIds.length} morning bundles\n`);

  for (const bundleId of morningBundleIds) {
    const bundle = await prisma.bundle.update({
      where: { id: bundleId },
      data: { isActive: true }
    });
    console.log(`✓ Restored: ${bundle.name}`);
  }

  console.log('\n✅ Morning bundles restored successfully');
  console.log('These bundles will stay active until tomorrow at 10 PM\n');

  await prisma.$disconnect();
}

restoreMorningBundles();
