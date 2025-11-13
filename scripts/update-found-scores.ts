import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateFoundScores() {
  console.log('Updating games with found scores from web search...\n');

  // 1. Dynamo Minsk 7-0 Sibir Novosibirsk (Home Win)
  const game1 = await prisma.game.findFirst({
    where: {
      homeTeam: { contains: 'Dynamo Minsk' },
      awayTeam: { contains: 'Sibir' }
    },
    include: {
      bundles: true
    }
  });

  if (game1) {
    console.log('📌 Dynamo Minsk vs Sibir Novosibirsk');
    console.log('   Found score: 7-0 (Home Win)');

    await prisma.game.update({
      where: { id: game1.id },
      data: {
        homeScore: 7,
        awayScore: 0,
        status: 'FINISHED',
        currentPeriod: 'FT'
      }
    });

    // Calculate results for all bundle games
    for (const bundleGame of game1.bundles) {
      const pick = bundleGame.pick.toLowerCase();
      let result: 'WIN' | 'LOSS' | 'PUSH' = 'LOSS';

      if (pick.includes('home') || pick.includes('dynamo')) {
        result = 'WIN'; // Home won 7-0
      } else if (pick.includes('away') || pick.includes('sibir')) {
        result = 'LOSS';
      }

      await prisma.bundleGame.update({
        where: { id: bundleGame.id },
        data: { result }
      });

      console.log(`   ✓ Pick: ${bundleGame.pick} → ${result}`);
    }
    console.log('');
  }

  // 2. Torpedo Novgorod 5-3 HC Sochi (Home Win)
  const game2 = await prisma.game.findFirst({
    where: {
      homeTeam: { contains: 'Torpedo' },
      awayTeam: { contains: 'Sochi' }
    },
    include: {
      bundles: true
    }
  });

  if (game2) {
    console.log('📌 Torpedo Novgorod vs HC Sochi');
    console.log('   Found score: 5-3 (Home Win)');

    await prisma.game.update({
      where: { id: game2.id },
      data: {
        homeScore: 5,
        awayScore: 3,
        status: 'FINISHED',
        currentPeriod: 'FT'
      }
    });

    // Calculate results for all bundle games
    for (const bundleGame of game2.bundles) {
      const pick = bundleGame.pick.toLowerCase();
      let result: 'WIN' | 'LOSS' | 'PUSH' = 'LOSS';

      if (pick.includes('home') || pick.includes('torpedo')) {
        result = 'WIN'; // Home won 5-3
      } else if (pick.includes('away') || pick.includes('sochi')) {
        result = 'LOSS';
      }

      await prisma.bundleGame.update({
        where: { id: bundleGame.id },
        data: { result }
      });

      console.log(`   ✓ Pick: ${bundleGame.pick} → ${result}`);
    }
    console.log('');
  }

  console.log('✅ Updated games with found scores\n');
  console.log('Recalculating bundle performance...\n');

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

  console.log('\n✅ All bundle performance recalculated');

  await prisma.$disconnect();
}

updateFoundScores();
