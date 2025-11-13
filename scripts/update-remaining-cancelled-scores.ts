import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateRemainingScores() {
  console.log('Updating remaining 3 games with scores from SofaScore...\\n');

  // 1. Torpedo Gorky 2-1 Yuzhny Ural Orsk (Home Win)
  const game1 = await prisma.game.findFirst({
    where: {
      homeTeam: { contains: 'Torpedo Gorky' },
      awayTeam: { contains: 'Yuzhny Ural' }
    },
    include: {
      bundles: true
    }
  });

  if (game1) {
    console.log('📌 Torpedo Gorky vs Yuzhny Ural Orsk');
    console.log('   Found score: 2-1 (Home Win)');

    await prisma.game.update({
      where: { id: game1.id },
      data: {
        homeScore: 2,
        awayScore: 1,
        status: 'FINISHED',
        currentPeriod: 'FT'
      }
    });

    // Calculate results for all bundle games
    for (const bundleGame of game1.bundles) {
      const pick = bundleGame.pick.toLowerCase();
      let result: 'WIN' | 'LOSS' | 'PUSH' = 'LOSS';

      if (pick.includes('home') || pick.includes('torpedo')) {
        result = 'WIN'; // Home won 2-1
      } else if (pick.includes('away') || pick.includes('yuzhny') || pick.includes('ural')) {
        result = 'LOSS';
      } else if (pick.includes('over') || pick.includes('under')) {
        // Total is 3 goals (2+1)
        if (pick.includes('over 2.5')) {
          result = 'WIN'; // 3 > 2.5
        } else if (pick.includes('under 2.5')) {
          result = 'LOSS'; // 3 > 2.5
        }
      }

      await prisma.bundleGame.update({
        where: { id: bundleGame.id },
        data: { result }
      });

      console.log(`   ✓ Pick: ${bundleGame.pick} → ${result}`);
    }
    console.log('');
  }

  // 2. Toros Neftekamsk 3-4 Buran Voronezh (Away Win)
  const game2 = await prisma.game.findFirst({
    where: {
      homeTeam: { contains: 'Toros' },
      awayTeam: { contains: 'Buran' }
    },
    include: {
      bundles: true
    }
  });

  if (game2) {
    console.log('📌 Toros Neftekamsk vs Buran Voronezh');
    console.log('   Found score: 3-4 (Away Win)');

    await prisma.game.update({
      where: { id: game2.id },
      data: {
        homeScore: 3,
        awayScore: 4,
        status: 'FINISHED',
        currentPeriod: 'FT'
      }
    });

    // Calculate results for all bundle games
    for (const bundleGame of game2.bundles) {
      const pick = bundleGame.pick.toLowerCase();
      let result: 'WIN' | 'LOSS' | 'PUSH' = 'LOSS';

      if (pick.includes('away') || pick.includes('buran')) {
        result = 'WIN'; // Away won 4-3
      } else if (pick.includes('home') || pick.includes('toros')) {
        result = 'LOSS';
      } else if (pick.includes('over') || pick.includes('under')) {
        // Total is 7 goals (3+4)
        if (pick.includes('over 5.5')) {
          result = 'WIN'; // 7 > 5.5
        } else if (pick.includes('under 5.5')) {
          result = 'LOSS'; // 7 > 5.5
        }
      }

      await prisma.bundleGame.update({
        where: { id: bundleGame.id },
        data: { result }
      });

      console.log(`   ✓ Pick: ${bundleGame.pick} → ${result}`);
    }
    console.log('');
  }

  // 3. Isa Town 82-89 Al Bahrain (Away Win - Basketball)
  const game3 = await prisma.game.findFirst({
    where: {
      homeTeam: { contains: 'Isa Town' },
      awayTeam: { contains: 'Bahrain' }
    },
    include: {
      bundles: true
    }
  });

  if (game3) {
    console.log('📌 Isa Town vs Al Bahrain');
    console.log('   Found score: 82-89 (Away Win - Basketball)');

    await prisma.game.update({
      where: { id: game3.id },
      data: {
        homeScore: 82,
        awayScore: 89,
        status: 'FINISHED',
        currentPeriod: 'FT'
      }
    });

    // Calculate results for all bundle games
    for (const bundleGame of game3.bundles) {
      const pick = bundleGame.pick.toLowerCase();
      let result: 'WIN' | 'LOSS' | 'PUSH' = 'LOSS';

      if (pick.includes('away') || pick.includes('bahrain') || pick.includes('al bahrain')) {
        result = 'WIN'; // Away won 89-82
      } else if (pick.includes('home') || pick.includes('isa')) {
        result = 'LOSS';
      } else if (pick.includes('over') || pick.includes('under')) {
        // Total is 171 points (82+89)
        const totalPoints = 171;
        if (pick.includes('over')) {
          const overValue = parseFloat(pick.match(/over\s+([\d.]+)/)?.[1] || '0');
          result = totalPoints > overValue ? 'WIN' : 'LOSS';
        } else if (pick.includes('under')) {
          const underValue = parseFloat(pick.match(/under\s+([\d.]+)/)?.[1] || '0');
          result = totalPoints < underValue ? 'WIN' : 'LOSS';
        }
      }

      await prisma.bundleGame.update({
        where: { id: bundleGame.id },
        data: { result }
      });

      console.log(`   ✓ Pick: ${bundleGame.pick} → ${result}`);
    }
    console.log('');
  }

  console.log('✅ Updated all 3 games with found scores\\n');
  console.log('Recalculating bundle performance...\\n');

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

  console.log('\\n✅ All bundle performance recalculated');

  await prisma.$disconnect();
}

updateRemainingScores();
