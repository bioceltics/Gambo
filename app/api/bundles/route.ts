import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const bundles = await prisma.bundle.findMany({
      where: {
        isActive: true,
        publishedAt: {
          not: null,
        },
        ...(type ? { type: type as any } : {}),
      },
      include: {
        games: {
          include: {
            game: true,
          },
        },
        performance: true,
      },
      orderBy: {
        publishedAt: 'asc',
      },
      take: 10,
    });

    // Transform to match the expected format
    const formattedBundles = bundles.map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      type: bundle.type,
      confidence: bundle.confidence,
      expectedReturn: bundle.expectedReturn,
      performance: bundle.performance ? {
        wins: bundle.performance.wins,
        losses: bundle.performance.losses,
        pushes: bundle.performance.pushes,
        actualReturn: bundle.performance.actualReturn,
      } : null,
      games: bundle.games.map((bg) => ({
        id: bg.game.id,
        sport: bg.game.sport,
        homeTeam: bg.game.homeTeam,
        awayTeam: bg.game.awayTeam,
        league: bg.game.league,
        scheduledAt: bg.game.scheduledAt.toISOString(),
        status: bg.game.status,
        homeScore: bg.game.homeScore,
        awayScore: bg.game.awayScore,
        currentPeriod: bg.game.currentPeriod,
        result: bg.result,
        analysis: {
          pick: bg.pick,
          odds: bg.odds,
          summary: bg.summary,
          recentForm: bg.recentForm,
          headToHead: bg.headToHead,
          injuries: bg.injuries,
          advancedMetrics: bg.advancedMetrics,
          weatherConditions: bg.weatherConditions,
          motivationFactors: bg.motivationFactors,
          setPieceAnalysis: bg.setPieceAnalysis,
          styleMatchup: bg.styleMatchup,
          playerForm: bg.playerForm,
          marketIntelligence: bg.marketIntelligence,
        },
      })),
    }));

    return NextResponse.json(formattedBundles);
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you'll need to add isAdmin field to User model)
    const data = await request.json();

    const bundle = await prisma.bundle.create({
      data: {
        name: data.name,
        type: data.type,
        confidence: data.confidence,
        expectedReturn: data.expectedReturn,
        tierAccess: data.tierAccess,
        publishedAt: data.publishNow ? new Date() : null,
      },
    });

    return NextResponse.json(bundle, { status: 201 });
  } catch (error) {
    console.error('Error creating bundle:', error);
    return NextResponse.json(
      { error: 'Failed to create bundle' },
      { status: 500 }
    );
  }
}
