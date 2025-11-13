import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all archived bundles with their games and performance
    const archivedBundles = await prisma.bundle.findMany({
      where: {
        isActive: false,
        archivedAt: {
          not: null
        }
      },
      include: {
        games: {
          include: {
            game: true
          }
        },
        performance: true
      },
      orderBy: {
        archivedAt: 'desc'
      }
    });

    // Group bundles by date
    const bundlesByDate: Record<string, any[]> = {};

    for (const bundle of archivedBundles) {
      const dateKey = bundle.archivedAt
        ? new Date(bundle.archivedAt).toISOString().split('T')[0]
        : 'unknown';

      if (!bundlesByDate[dateKey]) {
        bundlesByDate[dateKey] = [];
      }

      // Calculate results for each game
      const gameResults = bundle.games.map((bg) => ({
        id: bg.game.id,
        sport: bg.game.sport,
        homeTeam: bg.game.homeTeam,
        awayTeam: bg.game.awayTeam,
        league: bg.game.league,
        scheduledAt: bg.game.scheduledAt.toISOString(),
        status: bg.game.status,
        homeScore: bg.game.homeScore,
        awayScore: bg.game.awayScore,
        pick: bg.pick,
        odds: bg.odds,
        result: bg.result,
        summary: bg.summary
      }));

      bundlesByDate[dateKey].push({
        id: bundle.id,
        name: bundle.name,
        type: bundle.type,
        confidence: bundle.confidence,
        expectedReturn: bundle.expectedReturn,
        tierAccess: bundle.tierAccess,
        archivedAt: bundle.archivedAt,
        createdAt: bundle.createdAt,
        games: gameResults,
        performance: bundle.performance ? {
          wins: bundle.performance.wins,
          losses: bundle.performance.losses,
          pushes: bundle.performance.pushes,
          actualReturn: bundle.performance.actualReturn
        } : null
      });
    }

    return NextResponse.json({
      success: true,
      bundlesByDate
    });
  } catch (error) {
    console.error('Error fetching bundle history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bundle history' },
      { status: 500 }
    );
  }
}
