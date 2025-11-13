import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to request custom analysis' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sport, homeTeam, awayTeam, league, gameDate, additionalInfo } = body;

    // Validate required fields
    if (!sport || !homeTeam || !awayTeam || !league || !gameDate) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // Create the custom bundle request
    const description = `${homeTeam} vs ${awayTeam} - ${league} on ${new Date(gameDate).toLocaleDateString()}${
      additionalInfo ? `\n\nAdditional Info: ${additionalInfo}` : ''
    }`;

    const customRequest = await prisma.customBundleRequest.create({
      data: {
        userId: (session.user as any).id,
        sport,
        description,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        message: 'Custom analysis request submitted successfully',
        requestId: customRequest.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating custom analysis request:', error);
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again.' },
      { status: 500 }
    );
  }
}
