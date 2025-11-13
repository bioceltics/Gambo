import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sport = searchParams.get('sport');

    const games = await prisma.game.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(sport ? { sport: sport as any } : {}),
      },
      include: {
        liveStats: true,
      },
      orderBy: [
        { status: 'asc' },
        { scheduledAt: 'asc' },
      ],
      take: 100,
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const game = await prisma.game.create({
      data: {
        sport: data.sport,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        league: data.league,
        scheduledAt: new Date(data.scheduledAt),
        venue: data.venue,
        weather: data.weather,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
