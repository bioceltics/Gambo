import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Marks games as LIVE based on their scheduled time
 * This is a fallback for games that don't have API coverage
 */
async function markGamesLiveByTime() {
  console.log('⏰ Marking Games as LIVE Based on Scheduled Time\n');
  console.log('='.repeat(60));

  const now = new Date();

  try {
    // Find all games in active bundles that should be live based on time
    const games = await prisma.game.findMany({
      where: {
        status: 'UPCOMING',
        bundles: {
          some: {
            bundle: {
              isActive: true
            }
          }
        }
      },
      include: {
        bundles: {
          include: {
            bundle: {
              select: { name: true, isActive: true }
            }
          }
        }
      }
    });

    console.log(`\n📊 Found ${games.length} UPCOMING games in active bundles\n`);

    let markedLive = 0;
    let markedFinished = 0;
    let keptUpcoming = 0;

    for (const game of games) {
      const scheduledAt = new Date(game.scheduledAt);
      const diffMinutes = Math.floor((now.getTime() - scheduledAt.getTime()) / 60000);

      // Game should be finished if it started more than 120 minutes ago
      if (diffMinutes >= 120) {
        await prisma.game.update({
          where: { id: game.id },
          data: {
            status: 'FINISHED',
            currentPeriod: 'FT',
          },
        });
        console.log(`🏁 Marked as FINISHED: ${game.homeTeam} vs ${game.awayTeam}`);
        console.log(`   (Started ${diffMinutes} minutes ago)\n`);
        markedFinished++;
      }
      // Game should be live if it started 0-120 minutes ago
      else if (diffMinutes > 0 && diffMinutes < 120) {
        // Calculate estimated period based on sport and time
        let currentPeriod = 'LIVE';

        if (game.sport === 'SOCCER') {
          if (diffMinutes <= 45) {
            currentPeriod = `First Half - ${diffMinutes}'`;
          } else if (diffMinutes <= 50) {
            currentPeriod = 'Halftime';
          } else if (diffMinutes <= 90) {
            const secondHalfMinute = diffMinutes - 45;
            currentPeriod = `Second Half - ${secondHalfMinute}'`;
          } else {
            const extraTimeMinute = diffMinutes - 90;
            currentPeriod = `Extra Time - ${extraTimeMinute}'`;
          }
        } else if (game.sport === 'BASKETBALL') {
          const quarter = Math.min(Math.ceil(diffMinutes / 12), 4);
          const quarterMinute = diffMinutes % 12 || 12;
          currentPeriod = `Q${quarter} - ${quarterMinute}'`;
        } else if (game.sport === 'HOCKEY') {
          const period = Math.min(Math.ceil(diffMinutes / 20), 3);
          const periodMinute = diffMinutes % 20 || 20;
          currentPeriod = `P${period} - ${periodMinute}'`;
        } else if (game.sport === 'FOOTBALL') {
          const quarter = Math.min(Math.ceil(diffMinutes / 15), 4);
          const quarterMinute = diffMinutes % 15 || 15;
          currentPeriod = `Q${quarter} - ${quarterMinute}'`;
        }

        await prisma.game.update({
          where: { id: game.id },
          data: {
            status: 'LIVE',
            currentPeriod: currentPeriod,
          },
        });

        const activeBundles = game.bundles.filter(b => b.bundle.isActive);
        const bundleNames = activeBundles.map(b => b.bundle.name).join(', ');

        console.log(`✅ Marked as LIVE: ${game.homeTeam} vs ${game.awayTeam}`);
        console.log(`   League: ${game.league}`);
        console.log(`   Started: ${diffMinutes} minutes ago`);
        console.log(`   Period: ${currentPeriod}`);
        console.log(`   In Bundles: ${bundleNames}`);
        console.log('');
        markedLive++;
      } else {
        keptUpcoming++;
      }
    }

    console.log('='.repeat(60));
    console.log('✅ Time-based status update complete!\n');
    console.log(`   Marked as LIVE: ${markedLive} games`);
    console.log(`   Marked as FINISHED: ${markedFinished} games`);
    console.log(`   Kept as UPCOMING: ${keptUpcoming} games`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error marking games live:', error);
  } finally {
    await prisma.$disconnect();
  }
}

markGamesLiveByTime();
