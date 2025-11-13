import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Sport } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const sport = searchParams.get('sport') as Sport | null;
    const country = searchParams.get('country');
    const competition = searchParams.get('competition');
    const date = searchParams.get('date');
    const selectedOnly = searchParams.get('selectedOnly') === 'true';
    const minConfidence = searchParams.get('minConfidence') ? parseInt(searchParams.get('minConfidence')!) : 0;

    // Build filter
    const where: any = {};

    if (sport) {
      where.sport = sport;
    }

    if (country) {
      where.country = { contains: country };
    }

    if (competition) {
      where.competition = { contains: competition };
    }

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      where.generationDate = {
        gte: targetDate,
        lt: nextDate
      };
    }

    if (selectedOnly) {
      where.selectedForBundle = true;
    }

    if (minConfidence > 0) {
      where.confidenceScore = { gte: minConfidence };
    }

    // Fetch games with filters
    const games = await prisma.analyzedGame.findMany({
      where,
      orderBy: [
        { scheduledAt: 'asc' },
        { confidenceScore: 'desc' }
      ],
      take: 500 // Limit to 500 games
    });

    // Get unique values for filters
    const allGames = await prisma.analyzedGame.findMany({
      select: {
        sport: true,
        country: true,
        competition: true,
        generationDate: true
      }
    });

    const sports = Array.from(new Set(allGames.map(g => g.sport)));
    const countries = Array.from(new Set(allGames.map(g => g.country))).sort();
    const competitions = Array.from(new Set(allGames.map(g => g.competition))).sort();
    const dates = Array.from(new Set(allGames.map(g => g.generationDate.toISOString().split('T')[0]))).sort().reverse();

    return NextResponse.json({
      games,
      filters: {
        sports,
        countries,
        competitions,
        dates
      },
      total: games.length
    });
  } catch (error: any) {
    console.error('Error fetching analyzed games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyzed games', message: error.message },
      { status: 500 }
    );
  }
}
