import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// This endpoint is called by Vercel Cron Jobs
// Vercel Cron requires a secret token for authentication
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    console.log('🚀 Vercel Cron: Starting bundle generation...');

    // Run bundle generation script
    const { stdout, stderr } = await execAsync('npx tsx scripts/generate-intelligent-bundles.ts', {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    console.log('Bundle generation output:', stdout);
    if (stderr) {
      console.error('Bundle generation stderr:', stderr);
    }

    return NextResponse.json({
      success: true,
      message: 'Bundle generation completed',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Bundle generation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
