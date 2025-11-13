import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const bundles = await prisma.bundle.findMany({
    where: {
      isActive: true,
      publishedAt: {
        not: null,
      },
    },
    include: {
      games: {
        include: {
          game: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'asc',
    },
    take: 3,
  });

  const result = bundles.map(b => ({
    name: b.name,
    games: b.games.map(bg => ({
      homeTeam: bg.game.homeTeam,
      awayTeam: bg.game.awayTeam,
    })),
  }));

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}
