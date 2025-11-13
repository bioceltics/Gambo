import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findStaleGames() {
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

  const bundles = await prisma.bundle.findMany({
    where: { id: { in: bundleIds } },
    include: {
      games: {
        include: { game: true }
      }
    }
  });

  const now = new Date();
  console.log('Games that should have finished:\n');

  const staleGames = [];

  for (const bundle of bundles) {
    for (const bg of bundle.games) {
      const game = bg.game;
      const scheduledAt = new Date(game.scheduledAt);
      const hoursSince = (now.getTime() - scheduledAt.getTime()) / (1000 * 60 * 60);

      // Games scheduled more than 3 hours ago should be finished
      const isNotFinished = game.status !== 'FINISHED' && game.status !== 'CANCELLED';
      if (hoursSince > 3 && isNotFinished) {
        const gameInfo = {
          id: game.id,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          sport: game.sport,
          league: game.league,
          scheduledAt: game.scheduledAt,
          status: game.status,
          hoursSince: hoursSince.toFixed(1),
          pick: bg.pick
        };
        staleGames.push(gameInfo);

        console.log(`📌 ${game.homeTeam} vs ${game.awayTeam}`);
        console.log(`   Sport: ${game.sport} | League: ${game.league}`);
        console.log(`   Scheduled: ${game.scheduledAt}`);
        console.log(`   Hours ago: ${hoursSince.toFixed(1)}`);
        console.log(`   Current status: ${game.status}`);
        console.log(`   Pick: ${bg.pick}`);
        console.log(`   ID: ${game.id}`);
        console.log('');
      }
    }
  }

  console.log(`Total stale games: ${staleGames.length}`);

  await prisma.$disconnect();
}

findStaleGames();
