import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function revertCancelledGames() {
  const gameIds = [
    'cmhw36cbv000r3tpq6n9i9n2z', // BK Decin vs Usti Nad Labem
    'cmhw4ol4y000h3t8mxjlm2i55', // America MG U20 vs Paysandu U20
    'cmhw4ol6200173t8masy0hp10', // JVW FC (W) vs University of Western Cape (W)
    'cmhw4ol6h001k3t8mc0dk44on', // Ferroviaria U20 (W) vs Sao Paulo U20 (W)
    'cmhw36ccm00213tpqqfw8i0kt'  // ZTE KK vs Budapesti Honved SE
  ];

  console.log('Reverting incorrectly CANCELLED games back to LIVE...\n');

  for (const gameId of gameIds) {
    await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'LIVE'
      }
    });

    // Clear the PUSH results we set
    await prisma.bundleGame.updateMany({
      where: { gameId },
      data: { result: null }
    });
  }

  console.log('✅ All games reverted back to LIVE status');
  console.log('PUSH results cleared - ready for API update\n');

  await prisma.$disconnect();
}

revertCancelledGames();
