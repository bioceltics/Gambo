/**
 * Gambo 1.0 Engine API - Prediction Endpoint
 * POST /api/gambo-engine/predict
 */

import { NextRequest, NextResponse } from 'next/server';
import { GamboEngine, BundleGenerator } from '@/lib/gambo-engine';

const engine = new GamboEngine();
const bundleGenerator = new BundleGenerator(engine);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'generate-bundle') {
      // Generate a bundle
      const bundle = await bundleGenerator.generateBundle(data);

      return NextResponse.json({
        success: true,
        bundle,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    }, { status: 400 });

  } catch (error: any) {
    console.error('Gambo Engine API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Get engine status
  return NextResponse.json({
    success: true,
    version: engine.getVersion(),
    config: engine.getConfig(),
    status: 'operational',
  });
}
