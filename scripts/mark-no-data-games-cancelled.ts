import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function markNoDataGamesCancelled() {
  const gameIds = [
    'cmhvkms1z00083tkliodylsjp', // Dynamo Minsk vs Sibir Novosibirsk
    'cmhvkms28000l3tklan4el9to', // Torpedo Novgorod vs HC Sochi
    'cmhuz5eyc00113ta5rzqgmabh', // Torpedo Gorky vs Yuzhny Ural Orsk
    'cmhw4ol5z00143t8m6j97qswt', // Isa Town vs Al Bahrain
    'cmhw36cct002e3tpqpuijdfib'  // Toros Neftekamsk vs Buran Voronezh
  ];

  console.log('Marking games with no API data as CANCELLED...\n');
  console.log('(These games were scheduled 12+ hours ago but API has no scores)\n');

  for (const gameId of gameIds) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        bundles: true
      }
    });

    if (!game) continue;

    console.log(`📌 ${game.homeTeam} vs ${game.awayTeam}`);
    console.log(`   Scheduled: ${game.scheduledAt}`);
    console.log(`   Current Score: ${game.homeScore}-${game.awayScore}`);

    // Mark as CANCELLED
    await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'CANCELLED'
      }
    });

    // Set all bundle games to PUSH
    for (const bundleGame of game.bundles) {
      await prisma.bundleGame.update({
        where: { id: bundleGame.id },
        data: { result: 'PUSH' }
      });
    }

    console.log(`   ✓ Marked as CANCELLED, all picks set to PUSH\n`);
  }

  console.log('✅ All no-data games marked as CANCELLED with PUSH results');
  console.log('\nRecalculating bundle performance...\n');

  // Recalculate bundle performance
  const bundleIds = [
    'cmhw4ol3u00003t8m7vr3jhuv',
    'cmhw4ol4d00073t8my7xyzxbg',
    'cmhw4ol54000k3t8mc1w5okxg',
    'cmhw4ol5r000x3t8m28p29wwh',
    'cmhw4ol66001a3t8myby23sus',
    'cmhw4ol6k001n3t8m2rt8mb98',
    'cmhw4ol6t00203t8mjgl8igy7',
    'cmhw4ol7e002d3t8m84g8tx5b'
  ];

  for (const bundleId of bundleIds) {
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        games: {
          include: { game: true }
        }
      }
    });

    if (!bundle) continue;

    const allGames = bundle.games;
    const finishedGames = allGames.filter(bg =>
      bg.game.status === 'FINISHED' || bg.game.status === 'CANCELLED'
    );

    const wins = finishedGames.filter(bg => bg.result === 'WIN').length;
    const losses = finishedGames.filter(bg => bg.result === 'LOSS').length;
    const pushes = finishedGames.filter(bg => bg.result === 'PUSH').length;
    const pending = allGames.length - finishedGames.length;

    const hasLoss = losses > 0;
    const allFinished = finishedGames.length === allGames.length && pending === 0;

    let actualReturn: number | null = null;
    if (hasLoss) {
      actualReturn = -1;
    } else if (allFinished && losses === 0 && wins === allGames.length) {
      actualReturn = bundle.expectedReturn;
    }

    await prisma.bundlePerformance.upsert({
      where: { bundleId: bundle.id },
      create: {
        bundleId: bundle.id,
        totalGames: allGames.length,
        wins,
        losses,
        pushes,
        actualReturn
      },
      update: {
        totalGames: allGames.length,
        wins,
        losses,
        pushes,
        actualReturn
      }
    });

    console.log(`✓ ${bundle.name}: ${wins}W-${losses}L-${pushes}P, Return: ${actualReturn}`);
  }

  console.log('\n✅ Bundle performance recalculated');

  await prisma.$disconnect();
}

markNoDataGamesCancelled();
