import { prisma } from '@/lib/prisma';
import { BundlesClient } from '@/components/bundles/BundlesClient';
import { NextBundleETA } from '@/components/bundles/NextBundleETA';
import { AIEngineStatus } from '@/components/bundles/AIEngineStatus';
import Link from 'next/link';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getBundles() {
  try {
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
        performance: true,
      },
      orderBy: {
        publishedAt: 'asc',
      },
      take: 10,
    });

    return bundles.map((bundle) => ({
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
        league: bg.game.league, // Include league/competition name
        scheduledAt: bg.game.scheduledAt.toISOString(),
        status: bg.game.status,
        homeScore: bg.game.homeScore,
        awayScore: bg.game.awayScore,
        currentPeriod: bg.game.currentPeriod, // Include current period for live match time
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
  } catch (error) {
    console.error('Error fetching bundles:', error);
    return [];
  }
}

export default async function BundlesPage() {
  const bundles = await getBundles();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Premium Header */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Daily Expert Picks
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-100">
                Premium Betting <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Bundles</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-3xl">
                Carefully curated picks with comprehensive 10-point analysis backed by data and expert insights
              </p>
              <p className="text-sm text-green-400 mt-2">
                ✅ Real-time data loaded at {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* Navigation to Bundle History */}
            <Link
              href="/bundles/history"
              className="group relative overflow-hidden flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-br from-purple-900/20 via-indigo-900/20 to-purple-900/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
            >
              {/* Animated background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-600/20 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Icon with gradient background */}
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full border-2 border-[#0a0b14] group-hover:scale-125 transition-transform duration-300"></div>
              </div>

              <div className="relative z-10 text-left">
                <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors mb-0.5">
                  Previous Bundles
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover:animate-pulse"></div>
                  <p className="text-xs text-purple-300 font-semibold">
                    Past 3 days
                  </p>
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="relative z-10 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* AI Engine Status with Next Bundle ETA */}
        <AIEngineStatus />

        {/* Client component with auto-refresh */}
        <BundlesClient initialBundles={bundles} />
      </div>
    </div>
  );
}
