import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cron job to update game results and bundle statuses
 * Runs every 5 minutes to check for completed games and update scores
 *
 * Vercel Cron: Add to vercel.json:
 * {
 *   "path": "/api/cron/update-results",
 *   "schedule": "*\/5 * * * *"
 * }
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🔄 Starting game results update...');

    // Get all pending picks from active bundles
    const pendingPicks = await prisma.bundlePick.findMany({
      where: {
        status: 'PENDING',
        bundle: {
          isActive: true
        }
      },
      include: {
        bundle: true
      }
    });

    console.log(`   Found ${pendingPicks.length} pending picks to check`);

    let updatedCount = 0;
    let wonCount = 0;
    let lostCount = 0;

    // Check each pending pick
    for (const pick of pendingPicks) {
      // Skip if game hasn't started yet
      const gameTime = new Date(pick.matchTime);
      const now = new Date();
      const timeSinceStart = (now.getTime() - gameTime.getTime()) / (1000 * 60); // minutes

      if (timeSinceStart < 0) {
        // Game hasn't started
        continue;
      }

      // For games that should have finished (>120 minutes after start)
      if (timeSinceStart > 120) {
        // Fetch result from BetsAPI
        const result = await fetchGameResult(pick);

        if (result) {
          // Update pick status
          await prisma.bundlePick.update({
            where: { id: pick.id },
            data: {
              status: result.won ? 'WON' : 'LOST',
              homeScore: result.homeScore,
              awayScore: result.awayScore,
              updatedAt: new Date()
            }
          });

          updatedCount++;
          if (result.won) wonCount++;
          else lostCount++;

          console.log(`   ${result.won ? '✅' : '❌'} ${pick.homeTeam} vs ${pick.awayTeam}: ${result.homeScore}-${result.awayScore}`);
        }
      }
    }

    // Update bundle statuses
    if (updatedCount > 0) {
      await updateBundleStatuses();
    }

    console.log(`✅ Updated ${updatedCount} picks (${wonCount} won, ${lostCount} lost)`);

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      won: wonCount,
      lost: lostCount
    });

  } catch (error: any) {
    console.error('❌ Error updating results:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetch game result from BetsAPI
 */
async function fetchGameResult(pick: any): Promise<{ won: boolean; homeScore: number; awayScore: number } | null> {
  try {
    const token = process.env.BETSAPI_SOCCER_TOKEN; // Use appropriate token based on sport
    if (!token || token === 'your_betsapi_soccer_token_here') {
      return null;
    }

    // BetsAPI result endpoint
    const url = `https://api.betsapi.com/v1/event/view?token=${token}&event_id=${pick.fixtureId}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.success && data.results && data.results.length > 0) {
      const result = data.results[0];

      // Check if game is finished
      if (result.time_status !== '3') { // 3 = finished
        return null;
      }

      const homeScore = parseInt(result.ss?.split('-')[0] || '0');
      const awayScore = parseInt(result.ss?.split('-')[1] || '0');

      // Determine if pick won
      const won = checkIfPickWon(pick, homeScore, awayScore);

      return { won, homeScore, awayScore };
    }

    return null;
  } catch (error) {
    console.error(`   Error fetching result for ${pick.homeTeam} vs ${pick.awayTeam}:`, error);
    return null;
  }
}

/**
 * Check if a pick won based on the result
 */
function checkIfPickWon(pick: any, homeScore: number, awayScore: number): boolean {
  const pickLower = pick.pick.toLowerCase();

  // Home Win
  if (pickLower.includes('home win')) {
    return homeScore > awayScore;
  }

  // Away Win
  if (pickLower.includes('away win')) {
    return awayScore > homeScore;
  }

  // Draw
  if (pickLower === 'draw') {
    return homeScore === awayScore;
  }

  // Home or Draw (Double Chance)
  if (pickLower.includes('home') && pickLower.includes('draw')) {
    return homeScore >= awayScore;
  }

  // Away or Draw (Double Chance)
  if (pickLower.includes('away') && pickLower.includes('draw')) {
    return awayScore >= homeScore;
  }

  // Over/Under
  if (pickLower.includes('over') || pickLower.includes('under')) {
    const totalGoals = homeScore + awayScore;
    const line = parseFloat(pick.pick.match(/\d+\.?\d*/)?.[0] || '2.5');

    if (pickLower.includes('over')) {
      return totalGoals > line;
    } else {
      return totalGoals < line;
    }
  }

  // BTTS (Both Teams To Score)
  if (pickLower.includes('btts')) {
    const bothScored = homeScore > 0 && awayScore > 0;
    if (pickLower.includes('yes')) {
      return bothScored;
    } else {
      return !bothScored;
    }
  }

  // Default: couldn't determine, mark as lost
  return false;
}

/**
 * Update bundle statuses based on pick results
 */
async function updateBundleStatuses() {
  const activeBundles = await prisma.bundle.findMany({
    where: { isActive: true },
    include: {
      picks: true
    }
  });

  for (const bundle of activeBundles) {
    const wonPicks = bundle.picks.filter(p => p.status === 'WON').length;
    const lostPicks = bundle.picks.filter(p => p.status === 'LOST').length;
    const pendingPicks = bundle.picks.filter(p => p.status === 'PENDING').length;

    let status = bundle.status;

    // If any pick lost, bundle is lost (accumulator)
    if (lostPicks > 0) {
      status = 'LOST';
    }
    // If all picks won, bundle is won
    else if (pendingPicks === 0 && wonPicks === bundle.picks.length) {
      status = 'WON';
    }
    // Otherwise, still pending
    else {
      status = 'PENDING';
    }

    // Update bundle
    await prisma.bundle.update({
      where: { id: bundle.id },
      data: {
        status,
        wonCount: wonPicks,
        lostCount: lostPicks,
        pendingCount: pendingPicks,
        updatedAt: new Date()
      }
    });
  }
}
