import { prisma } from '@/lib/prisma';
import { PreviousBundleCard } from '@/components/bundles/PreviousBundleCard';
import Link from 'next/link';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPreviousBundles() {
  try {
    // Get bundles from the past 7 days that are no longer active
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bundles = await prisma.bundle.findMany({
      where: {
        publishedAt: {
          not: null,
          gte: sevenDaysAgo,
        },
        isActive: false, // Only show deactivated bundles
      },
      include: {
        games: {
          include: {
            game: true,
          },
        },
        performance: true, // Include performance data to show results
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return bundles.map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      type: bundle.type,
      confidence: bundle.confidence,
      expectedReturn: bundle.expectedReturn,
      publishedAt: bundle.publishedAt?.toISOString() || '',
      gamesCount: bundle.games.length,
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
        result: bg.result,
        pick: bg.pick,
        odds: bg.odds,
      })),
    }));
  } catch (error) {
    console.error('Error fetching previous bundles:', error);
    return [];
  }
}

export default async function PreviousBundlesPage() {
  const bundles = await getPreviousBundles();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Premium Header */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
          </div>

          <Link
            href="/bundles"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50 hover:border-purple-500/50 text-gray-300 hover:text-white transition-all mb-8 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-medium">Back to Current Bundles</span>
          </Link>

          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Bundle Archive
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📜</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full border-2 border-[#0a0b14]"></div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-100 mb-2">
                Previous <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Bundles</span>
              </h1>
              <p className="text-base text-gray-400">
                Historical expert picks from the past 7 days
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-purple-300 font-semibold">{bundles.length} Archived</span>
                </div>
                <div className="text-sm text-gray-500">
                  Last 7 days
                </div>
              </div>
            </div>
          </div>
        </div>

        {bundles.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-lg mx-auto relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#0a0b14] via-[#13152a] to-[#0a0b14] p-12">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-indigo-600/10 to-purple-600/5"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                  <span className="text-4xl">📜</span>
                </div>
                <p className="text-xl text-gray-200 font-bold mb-3">
                  No Previous Bundles
                </p>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Previous bundles from the past 7 days will appear here. Bundles are archived once they are no longer active.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {bundles.map((bundle) => (
              <PreviousBundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
