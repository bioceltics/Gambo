import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Comprehensive live score update
 * 1. Fetches live scores from API and updates games with real data
 * 2. Falls back to time-based status for games not covered by API
 */
async function comprehensiveUpdate() {
  console.log('🔄 COMPREHENSIVE LIVE SCORE UPDATE\n');
  console.log('='.repeat(80));

  let apiUpdated = 0;
  let timeMarkedLive = 0;
  let timeMarkedFinished = 0;

  try {
    // STEP 1: Update from API
    console.log('\n📡 STEP 1: Fetching live scores from API...\n');

    const response = await fetch('http://localhost:3000/api/live-scores');
    const data = await response.json();

    if (!data.success || !data.games) {
      console.log('⚠️  API fetch failed, skipping API update');
    } else {
      console.log(`Found ${data.games.length} live games from API\n`);

      for (const liveGame of data.games) {
        if (!liveGame.inBundle) continue;

        try {
          // Find the game (no duplicates now!)
          let dbGame = await prisma.game.findFirst({
            where: {
              homeTeam: { contains: liveGame.homeTeam.substring(0, 15) },
              awayTeam: { contains: liveGame.awayTeam.substring(0, 15) },
              league: liveGame.league,
              bundles: {
                some: {
                  bundle: { isActive: true }
                }
              }
            },
          });

          // If no exact league match, try loose match
          if (!dbGame) {
            dbGame = await prisma.game.findFirst({
              where: {
                homeTeam: { contains: liveGame.homeTeam.substring(0, 15) },
                awayTeam: { contains: liveGame.awayTeam.substring(0, 15) },
                bundles: {
                  some: {
                    bundle: { isActive: true }
                  }
                }
              },
            });
          }

          if (!dbGame) continue;

          // Skip if game claims to be LIVE but has no scores and no period (pre-match)
          if (liveGame.status === 'LIVE' &&
              liveGame.homeScore === null &&
              liveGame.awayScore === null &&
              !liveGame.currentPeriod) {
            continue; // Skip pre-match games falsely marked as LIVE
          }

          // Update the game
          await prisma.game.update({
            where: { id: dbGame.id },
            data: {
              status: liveGame.status,
              homeScore: liveGame.homeScore !== null ? liveGame.homeScore : (liveGame.status === 'LIVE' ? 0 : null),
              awayScore: liveGame.awayScore !== null ? liveGame.awayScore : (liveGame.status === 'LIVE' ? 0 : null),
              currentPeriod: liveGame.currentPeriod,
            },
          });

          console.log(`✅ API: ${liveGame.homeTeam} vs ${liveGame.awayTeam}`);
          console.log(`   ${liveGame.homeScore}-${liveGame.awayScore} | ${liveGame.currentPeriod || 'LIVE'}\n`);
          apiUpdated++;
        } catch (error) {
          // Silent fail for individual games
        }
      }

      console.log(`API Update Complete: ${apiUpdated} games updated\n`);
    }

    // STEP 2: Time-based fallback for games not in API
    console.log('⏰ STEP 2: Time-based status update for remaining games...\n');

    const now = new Date();
    // Check all UPCOMING and LIVE games for time-based status updates
    const upcomingGames = await prisma.game.findMany({
      where: {
        OR: [
          { status: 'UPCOMING' },
          { status: 'LIVE' } // Check all LIVE games to see if they should be finished
        ],
        bundles: {
          some: {
            bundle: { isActive: true }
          }
        }
      }
    });

    for (const game of upcomingGames) {
      const scheduledAt = new Date(game.scheduledAt);
      const diffMinutes = Math.floor((now.getTime() - scheduledAt.getTime()) / 60000);

      if (diffMinutes >= 120) {
        await prisma.game.update({
          where: { id: game.id },
          data: {
            status: 'FINISHED',
            currentPeriod: 'FT',
          },
        });
        console.log(`🏁 TIME: ${game.homeTeam} vs ${game.awayTeam} → FINISHED`);
        timeMarkedFinished++;
      } else if (diffMinutes > 0 && diffMinutes < 120) {
        let currentPeriod = 'LIVE';

        if (game.sport === 'SOCCER') {
          if (diffMinutes <= 45) {
            currentPeriod = `First Half - ${diffMinutes}'`;
          } else if (diffMinutes <= 50) {
            currentPeriod = 'Halftime';
          } else if (diffMinutes <= 90) {
            currentPeriod = `Second Half - ${diffMinutes - 45}'`;
          } else {
            currentPeriod = `Extra Time - ${diffMinutes - 90}'`;
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

        console.log(`✅ TIME: ${game.homeTeam} vs ${game.awayTeam} → LIVE`);
        console.log(`   Period: ${currentPeriod}\n`);
        timeMarkedLive++;
      }
    }

    // STEP 3: Calculate results for finished games
    console.log('🎯 STEP 3: Calculating results for finished games...\n');

    let resultsCalculated = 0;

    const finishedGames = await prisma.game.findMany({
      where: {
        status: 'FINISHED',
        homeScore: { not: null },
        awayScore: { not: null },
        bundles: {
          some: {
            bundle: { isActive: true },
            result: null // Only games without results set
          }
        }
      },
      include: {
        bundles: {
          where: {
            bundle: { isActive: true },
            result: null
          },
          include: {
            bundle: true
          }
        }
      }
    });

    for (const game of finishedGames) {
      for (const bundleGame of game.bundles) {
        let result: string | null = null;

        const homeScore = game.homeScore!;
        const awayScore = game.awayScore!;
        const pick = bundleGame.pick.toLowerCase();
        const betType = bundleGame.betType.toLowerCase();

        // Calculate result based on bet type
        if (betType === 'h2h') {
          if (pick.includes('home win') || pick.includes('home to win')) {
            result = homeScore > awayScore ? 'WIN' : 'LOSS'; // Draw is a LOSS if you didn't predict it
          } else if (pick.includes('away win') || pick.includes('away to win')) {
            result = awayScore > homeScore ? 'WIN' : 'LOSS'; // Draw is a LOSS if you didn't predict it
          } else if (pick.includes('draw')) {
            result = homeScore === awayScore ? 'WIN' : 'LOSS';
          }
        } else if (betType === 'doublechance') {
          if (pick.includes('home win or draw') || pick.includes('1x')) {
            result = homeScore >= awayScore ? 'WIN' : 'LOSS';
          } else if (pick.includes('away win or draw') || pick.includes('x2')) {
            result = awayScore >= homeScore ? 'WIN' : 'LOSS';
          } else if (pick.includes('home or away') || pick.includes('12')) {
            result = homeScore !== awayScore ? 'WIN' : 'LOSS';
          }
        } else if (betType === 'totals' || pick.includes('over') || pick.includes('under')) {
          const totalGoals = homeScore + awayScore;
          const match = pick.match(/(\d+\.?\d*)/);
          if (match) {
            const line = parseFloat(match[1]);
            if (pick.includes('over')) {
              result = totalGoals > line ? 'WIN' : (totalGoals === line ? 'PUSH' : 'LOSS');
            } else if (pick.includes('under')) {
              result = totalGoals < line ? 'WIN' : (totalGoals === line ? 'PUSH' : 'LOSS');
            }
          }
        } else if (betType === 'btts') {
          if (pick.toLowerCase().includes('yes') || pick.toLowerCase().includes('both teams to score')) {
            result = (homeScore > 0 && awayScore > 0) ? 'WIN' : 'LOSS';
          } else if (pick.toLowerCase().includes('no')) {
            result = (homeScore === 0 || awayScore === 0) ? 'WIN' : 'LOSS';
          }
        }

        if (result) {
          await prisma.bundleGame.update({
            where: { id: bundleGame.id },
            data: { result }
          });

          console.log(`${result === 'WIN' ? '✅' : result === 'LOSS' ? '❌' : '⚪'} ${game.homeTeam} vs ${game.awayTeam}`);
          console.log(`   Score: ${homeScore}-${awayScore} | Pick: ${bundleGame.pick} | Result: ${result}\n`);
          resultsCalculated++;
        }
      }
    }

    console.log(`Results Calculated: ${resultsCalculated} games\n`);

    // STEP 4: Update bundle performance based on game results
    console.log('📊 STEP 4: Updating bundle performance...\n');

    let bundlesUpdated = 0;

    const activeBundles = await prisma.bundle.findMany({
      where: {
        isActive: true,
        publishedAt: { not: null }
      },
      include: {
        games: {
          include: {
            game: true
          }
        },
        performance: true
      }
    });

    for (const bundle of activeBundles) {
      const allGames = bundle.games;
      const finishedGames = allGames.filter(bg => bg.game.status === 'FINISHED');

      // Skip if no games are finished yet
      if (finishedGames.length === 0) continue;

      const wins = finishedGames.filter(bg => bg.result === 'WIN').length;
      const losses = finishedGames.filter(bg => bg.result === 'LOSS').length;
      const pushes = finishedGames.filter(bg => bg.result === 'PUSH').length;
      const pending = finishedGames.filter(bg => bg.result === null).length;

      // RULE 1: If ANY game is a LOSS, mark bundle as LOSS immediately
      const hasLoss = losses > 0;

      // RULE 2: If all games are finished, determine final result
      const allFinished = finishedGames.length === allGames.length && pending === 0;

      let bundleResult: 'WIN' | 'LOSS' | null = null;

      if (hasLoss) {
        bundleResult = 'LOSS';
      } else if (allFinished && losses === 0 && wins === allGames.length) {
        bundleResult = 'WIN';
      }

      // Calculate actual return for completed bundles
      let actualReturn: number | null = null;
      if (bundleResult === 'WIN') {
        actualReturn = bundle.expectedReturn;
      } else if (bundleResult === 'LOSS') {
        actualReturn = -1; // Lost the stake
      }

      // Update or create bundle performance
      if (bundle.performance) {
        await prisma.bundlePerformance.update({
          where: { id: bundle.performance.id },
          data: {
            totalGames: allGames.length,
            wins,
            losses,
            pushes,
            actualReturn
          }
        });
      } else {
        await prisma.bundlePerformance.create({
          data: {
            bundleId: bundle.id,
            totalGames: allGames.length,
            wins,
            losses,
            pushes,
            actualReturn
          }
        });
      }

      // Keep bundle active until regeneration - don't auto-archive
      // Bundles will be removed when new bundles are generated

      console.log(`${bundleResult === 'WIN' ? '🏆' : bundleResult === 'LOSS' ? '💔' : '📊'} ${bundle.name}`);
      console.log(`   Games: ${finishedGames.length}/${allGames.length} finished`);
      console.log(`   Record: ${wins}W-${losses}L-${pushes}P`);
      if (bundleResult) {
        const returnSign = actualReturn && actualReturn > 0 ? '+' : '';
        console.log(`   Bundle Result: ${bundleResult} (${returnSign}${actualReturn?.toFixed(2)}x)`);
      }
      if (allFinished) {
        console.log(`   Status: All games completed (staying active until regeneration)`);
      }
      console.log('');

      bundlesUpdated++;
    }

    console.log(`Bundle Performance Updated: ${bundlesUpdated} bundles\n`);

    console.log('='.repeat(80));
    console.log('✅ COMPREHENSIVE UPDATE COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   API Updates: ${apiUpdated || 0} games`);
    console.log(`   Time-based LIVE: ${timeMarkedLive} games`);
    console.log(`   Time-based FINISHED: ${timeMarkedFinished} games`);
    console.log(`   Results Calculated: ${resultsCalculated} games`);
    console.log(`   Bundles Updated: ${bundlesUpdated} bundles`);
    console.log(`   Total Updated: ${(apiUpdated || 0) + timeMarkedLive + timeMarkedFinished + resultsCalculated} games`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error in comprehensive update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveUpdate();
