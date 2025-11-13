import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixAllCancelled() {
  const cancelledGameIds = [
    'cmhvkms1z00083tkliodylsjp', // Dynamo Minsk vs Sibir Novosibirsk
    'cmhvkms28000l3tklan4el9to', // Torpedo Novgorod vs HC Sochi
    'cmhuz5eyc00113ta5rzqgmabh', // Torpedo Gorky vs Yuzhny Ural Orsk
    'cmhw4ol5z00143t8m6j97qswt', // Isa Town vs Al Bahrain
    'cmhw36cct002e3tpqpuijdfib'  // Toros Neftekamsk vs Buran Voronezh
  ];

  console.log('Reverting ALL CANCELLED games back to LIVE for API update...\n');

  for (const gameId of cancelledGameIds) {
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (game) {
      console.log(`📌 ${game.homeTeam} vs ${game.awayTeam}`);

      await prisma.game.update({
        where: { id: gameId },
        data: {
          status: 'LIVE'
        }
      });

      // Clear any PUSH results
      await prisma.bundleGame.updateMany({
        where: {
          gameId,
          result: 'PUSH'
        },
        data: { result: null }
      });

      console.log(`   ✓ Reverted to LIVE, cleared PUSH results\n`);
    }
  }

  console.log('✅ All CANCELLED games reverted to LIVE');
  console.log('Ready for comprehensive API update...\n');

  await prisma.$disconnect();
}

fixAllCancelled();
