import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixStaleGames() {
  const staleGameIds = [
    'cmhw36cbv000r3tpq6n9i9n2z', // BK Decin vs Usti Nad Labem
    'cmhw4ol4y000h3t8mxjlm2i55', // America MG U20 vs Paysandu U20
    'cmhw4ol6200173t8masy0hp10', // JVW FC (W) vs University of Western Cape (W)
    'cmhw4ol6h001k3t8mc0dk44on', // Ferroviaria U20 (W) vs Sao Paulo U20 (W)
    'cmhw36ccm00213tpqqfw8i0kt'  // ZTE KK vs Budapesti Honved SE
  ];

  console.log('Fixing stale games (10+ hours in LIVE status, no scores available online)...\n');

  for (const gameId of staleGameIds) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        bundles: true
      }
    });

    if (!game) {
      console.log(`Game ${gameId} not found`);
      continue;
    }

    console.log(`\n📌 ${game.homeTeam} vs ${game.awayTeam}`);
    console.log(`   Sport: ${game.sport} | League: ${game.league}`);
    console.log(`   Current status: ${game.status}`);

    // Mark game as CANCELLED since no score is available
    await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'CANCELLED'
      }
    });

    console.log(`   ✓ Updated status to CANCELLED`);

    // Set all bundle games for this game to PUSH
    for (const bundleGame of game.bundles) {
      if (bundleGame.result === null) {
        await prisma.bundleGame.update({
          where: { id: bundleGame.id },
          data: { result: 'PUSH' }
        });
        console.log(`   ✓ Set result to PUSH for bundle game ${bundleGame.id}`);
      }
    }
  }

  console.log('\n✅ All stale games have been marked as CANCELLED with PUSH results');
  console.log('Now running comprehensive update to recalculate bundle performance...\n');

  // Recalculate bundle performance for all affected bundles
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
      actualReturn = -1; // Lost the stake
    } else if (allFinished && losses === 0 && wins === allGames.length) {
      actualReturn = bundle.expectedReturn; // Won
    }

    // Update or create performance
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

    console.log(`✓ Updated ${bundle.name}: ${wins}W-${losses}L-${pushes}P, Return: ${actualReturn}`);
  }

  console.log('\n✅ Bundle performance recalculated for all affected bundles');

  await prisma.$disconnect();
}

fixStaleGames();
