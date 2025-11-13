import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface GenerationStatus {
  status: 'idle' | 'generating' | 'complete' | 'error';
  currentStep?: string;
  progress?: {
    fixturesFetched?: number;
    fixturesAnalyzed?: number;
    bundlesCreated?: number;
    totalFixtures?: number;
  };
  lastGeneration?: string;
  nextGeneration?: string;
  errorMessage?: string;
  activities?: string[];
}

const STATUS_FILE_PATH = path.join(process.cwd(), 'logs', 'generation-status.json');

async function readStatusFile(): Promise<GenerationStatus> {
  try {
    const data = await fs.readFile(STATUS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return default idle status
    return {
      status: 'idle',
      activities: []
    };
  }
}

export async function GET() {
  try {
    const status = await readStatusFile();

    // Calculate next generation time (3:00 AM local time)
    const now = new Date();
    const next3AM = new Date(now);
    next3AM.setHours(3, 0, 0, 0);

    if (now.getTime() >= next3AM.getTime()) {
      next3AM.setDate(next3AM.getDate() + 1);
    }

    status.nextGeneration = next3AM.toISOString();

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error reading generation status:', error);
    return NextResponse.json(
      {
        status: 'error',
        errorMessage: 'Failed to read generation status',
        activities: []
      },
      { status: 500 }
    );
  }
}
