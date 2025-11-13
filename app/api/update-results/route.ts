import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchAllLiveScores, fetchAllEndedGames } from '@/lib/betsapi';

/**
 * Update game results and calculate bundle outcomes
 * This endpoint should be called periodically (e.g., every 15 minutes)
 */
export async function POST() {
  try {
    console.log('🔄 Starting results update...');

    // Get BetsAPI tokens
    const BETSAPI_SOCCER = process.env.BETSAPI_SOCCER_TOKEN;
    const BETSAPI_BASKETBALL = process.env.BETSAPI_BASKETBALL_TOKEN;
    const BETSAPI_TENNIS = process.env.BETSAPI_TENNIS_TOKEN;
    const BETSAPI_HOCKEY = process.env.BETSAPI_HOCKEY_TOKEN;
    const BETSAPI_FOOTBALL = process.env.BETSAPI_FOOTBALL_TOKEN;

    if (!BETSAPI_SOCCER && !BETSAPI_BASKETBALL && !BETSAPI_TENNIS && !BETSAPI_HOCKEY && !BETSAPI_FOOTBALL) {
      return NextResponse.json({ success: false, error: 'No BetsAPI tokens configured' }, { status: 400 });
    }

    // Fetch all live scores and finished matches
    const [liveScores, endedGames] = await Promise.all([
      fetchAllLiveScores({
        soccer: BETSAPI_SOCCER,
        basketball: BETSAPI_BASKETBALL,
        tennis: BETSAPI_TENNIS,
        hockey: BETSAPI_HOCKEY,
        football: BETSAPI_FOOTBALL,
      }),
      fetchAllEndedGames({
        soccer: BETSAPI_SOCCER,
        basketball: BETSAPI_BASKETBALL,
        tennis: BETSAPI_TENNIS,
        hockey: BETSAPI_HOCKEY,
        football: BETSAPI_FOOTBALL,
      })
    ]);

    // Combine both live and ended games
    const allEvents = [...liveScores, ...endedGames];

    console.log(`📊 Found ${liveScores.length} live events and ${endedGames.length} ended events`);

    let updatedGames = 0;
    let updatedBets = 0;

    // Process each event
    for (const event of allEvents) {
      // Skip if not finished (time_status '3' means finished in BetsAPI)
      if (event.time_status !== '3') {
        continue;
      }

      // Parse score
      const scoreString = event.ss || '';
      const scoreParts = scoreString.split('-');
      const homeScore = scoreParts[0] ? parseInt(scoreParts[0]) : null;
      const awayScore = scoreParts[1] ? parseInt(scoreParts[1]) : null;

      if (homeScore === null || awayScore === null) {
        continue;
      }

      // Map sport ID to sport type
      const sportMap: Record<string, string> = {
        '1': 'SOCCER',
        '18': 'BASKETBALL',
        '13': 'TENNIS',
        '17': 'HOCKEY',
        '16': 'FOOTBALL',
      };

      const sport = sportMap[event.sport_id] || 'SOCCER';
      const homeTeam = event.home?.name || '';
      const awayTeam = event.away?.name || '';

      // Find matching games in database
      const games = await prisma.game.findMany({
        where: {
          sport: sport as any,
          homeTeam: { contains: homeTeam.slice(0, 15) }, // Partial match
          awayTeam: { contains: awayTeam.slice(0, 15) }, // Partial match
          status: { in: ['UPCOMING', 'LIVE'] },
        },
        include: {
          bundles: true,
        },
      });

      for (const game of games) {
        // Update game with final score
        await prisma.game.update({
          where: { id: game.id },
          data: {
            status: 'FINISHED',
            homeScore,
            awayScore,
            currentPeriod: 'FT',
          },
        });

        updatedGames++;

        // Calculate results for each bundle game
        for (const bundleGame of game.bundles) {
          const result = calculateResult(bundleGame.pick, homeScore, awayScore, homeTeam, awayTeam);

          await prisma.bundleGame.update({
            where: { id: bundleGame.id },
            data: { result },
          });

          updatedBets++;
        }
      }
    }

    // Update bundle performance stats
    await updateBundlePerformance();

    console.log(`✅ Updated ${updatedGames} games and ${updatedBets} bets`);

    return NextResponse.json({
      success: true,
      updatedGames,
      updatedBets,
    });

  } catch (error: any) {
    console.error('Error updating results:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Calculate if a bet won, lost, or pushed
 */
function calculateResult(pick: string, homeScore: number, awayScore: number, homeTeam: string, awayTeam: string): string {
  const pickLower = pick.toLowerCase();

  // H2H Results
  if (pickLower.includes('home win') || pickLower === homeTeam.toLowerCase()) {
    return homeScore > awayScore ? 'WIN' : homeScore === awayScore ? 'PUSH' : 'LOSS';
  }

  if (pickLower.includes('away win') || pickLower === awayTeam.toLowerCase()) {
    return awayScore > homeScore ? 'WIN' : homeScore === awayScore ? 'PUSH' : 'LOSS';
  }

  if (pickLower.includes('draw')) {
    return homeScore === awayScore ? 'WIN' : 'LOSS';
  }

  // Over/Under
  const totalGoals = homeScore + awayScore;

  if (pickLower.includes('over')) {
    const lineMatch = pick.match(/(\d+\.?\d*)/);
    if (lineMatch) {
      const line = parseFloat(lineMatch[1]);
      return totalGoals > line ? 'WIN' : totalGoals === line ? 'PUSH' : 'LOSS';
    }
  }

  if (pickLower.includes('under')) {
    const lineMatch = pick.match(/(\d+\.?\d*)/);
    if (lineMatch) {
      const line = parseFloat(lineMatch[1]);
      return totalGoals < line ? 'WIN' : totalGoals === line ? 'PUSH' : 'LOSS';
    }
  }

  // BTTS (Both Teams To Score)
  if (pickLower.includes('btts')) {
    const bothScored = homeScore > 0 && awayScore > 0;
    if (pickLower.includes('yes')) {
      return bothScored ? 'WIN' : 'LOSS';
    }
    if (pickLower.includes('no')) {
      return bothScored ? 'LOSS' : 'WIN';
    }
  }

  // Spread/Handicap
  if (pickLower.includes('spread') || pickLower.includes('handicap') || pickLower.match(/[+-]\d/)) {
    const spreadMatch = pick.match(/([+-]\d+\.?\d*)/);
    if (spreadMatch) {
      const spread = parseFloat(spreadMatch[1]);
      const adjustedHome = homeScore + spread;
      return adjustedHome > awayScore ? 'WIN' : adjustedHome === awayScore ? 'PUSH' : 'LOSS';
    }
  }

  // Default: unable to determine
  return 'PENDING';
}

/**
 * Update bundle performance statistics
 */
async function updateBundlePerformance() {
  const bundles = await prisma.bundle.findMany({
    include: {
      games: true,
    },
  });

  for (const bundle of bundles) {
    const totalGames = bundle.games.length;
    const wins = bundle.games.filter(g => g.result === 'WIN').length;
    const losses = bundle.games.filter(g => g.result === 'LOSS').length;
    const pushes = bundle.games.filter(g => g.result === 'PUSH').length;

    // Calculate actual return (only if all games are resolved)
    const pending = bundle.games.filter(g => !g.result || g.result === 'PENDING').length;
    let actualReturn = null;

    if (pending === 0 && totalGames > 0) {
      // If any game lost, bundle loses (parlay logic)
      if (losses > 0) {
        actualReturn = 0;
      } else if (wins === totalGames) {
        // All won - calculate actual return from odds
        actualReturn = bundle.games.reduce((acc, game) => acc * game.odds, 1);
      }
    }

    // Upsert performance record
    await prisma.bundlePerformance.upsert({
      where: { bundleId: bundle.id },
      create: {
        bundleId: bundle.id,
        totalGames,
        wins,
        losses,
        pushes,
        actualReturn,
      },
      update: {
        totalGames,
        wins,
        losses,
        pushes,
        actualReturn,
      },
    });
  }
}
