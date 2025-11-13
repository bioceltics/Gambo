import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLiveScores() {
  console.log('🔄 Updating Live Scores from API\n');
  console.log('='.repeat(60));

  try {
    // Fetch live scores from the API
    const response = await fetch('http://localhost:3001/api/live-scores');
    const data = await response.json();

    if (!data.success || !data.games) {
      console.error('❌ Failed to fetch live scores:', data);
      return;
    }

    console.log(`\n📊 Found ${data.games.length} live games from API\n`);

    let updated = 0;
    let skipped = 0;

    for (const liveGame of data.games) {
      // Only process games that are in bundles
      if (!liveGame.inBundle) {
        skipped++;
        continue;
      }

      try {
        // Find the game in our database by matching teams and league
        // ONLY find games that are in ACTIVE bundles
        const dbGame = await prisma.game.findFirst({
          where: {
            homeTeam: { contains: liveGame.homeTeam.substring(0, 15) },
            awayTeam: { contains: liveGame.awayTeam.substring(0, 15) },
            league: liveGame.league,
            bundles: {
              some: {
                bundle: {
                  isActive: true
                }
              }
            }
          },
        });

        if (!dbGame) {
          // Try a looser match if exact league doesn't work
          const looseMatch = await prisma.game.findFirst({
            where: {
              homeTeam: { contains: liveGame.homeTeam.substring(0, 15) },
              awayTeam: { contains: liveGame.awayTeam.substring(0, 15) },
              bundles: {
                some: {
                  bundle: {
                    isActive: true
                  }
                }
              }
            },
          });

          if (!looseMatch) {
            skipped++;
            continue;
          }

          // Update the loose match
          await prisma.game.update({
            where: { id: looseMatch.id },
            data: {
              status: liveGame.status,
              homeScore: liveGame.homeScore || 0,
              awayScore: liveGame.awayScore || 0,
              currentPeriod: liveGame.currentPeriod,
            },
          });

          console.log(`✅ Updated: ${liveGame.homeTeam} vs ${liveGame.awayTeam}`);
          console.log(`   Score: ${liveGame.homeScore}-${liveGame.awayScore} | Status: ${liveGame.status} | Period: ${liveGame.currentPeriod || 'N/A'}`);
          updated++;
          continue;
        }

        // Update the game with live scores
        await prisma.game.update({
          where: { id: dbGame.id },
          data: {
            status: liveGame.status,
            homeScore: liveGame.homeScore || 0,
            awayScore: liveGame.awayScore || 0,
            currentPeriod: liveGame.currentPeriod,
          },
        });

        console.log(`✅ Updated: ${liveGame.homeTeam} vs ${liveGame.awayTeam}`);
        console.log(`   Score: ${liveGame.homeScore}-${liveGame.awayScore} | Status: ${liveGame.status} | Period: ${liveGame.currentPeriod || 'N/A'}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating game: ${liveGame.homeTeam} vs ${liveGame.awayTeam}`, error);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Live scores update complete!`);
    console.log(`   Updated: ${updated} games`);
    console.log(`   Skipped: ${skipped} games`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error fetching live scores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLiveScores();
