import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, BarChart3, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Premium Betting Aesthetic */}
      <section className="relative container mx-auto px-4 py-24 text-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI-Powered Sports Analytics
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Gambo
          </span>
        </h1>

        <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-bold">
          AI Betting Intelligence
        </p>

        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Professional-grade betting bundles powered by AI, advanced analytics.
          <br className="hidden md:block" />
          Data-driven picks with <span className="text-green-400 font-semibold">86%+ confidence</span> across all major sports.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/bundles">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/50 min-w-[200px]">
              View Expert Picks
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-gray-700 text-gray-200 hover:bg-[#1a1c2e] hover:text-white hover:border-blue-500/50 min-w-[200px]">
              See Plans
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">86%</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Win Rate</div>
          </div>
          <div className="text-center border-x border-gray-800">
            <div className="text-3xl font-bold text-blue-400 mb-1">10K+</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">$2M+</div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">Won This Month</div>
          </div>
        </div>
      </section>

      {/* Features Section with Premium Design */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-100">
            Professional-Grade Analytics
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform combines AI, statistical models, and expert analysis to deliver the most accurate betting predictions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-[#1a1c2e] border border-[#2a2d42] p-6 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-100">10+ Data Points</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Comprehensive analysis including form, H2H, injuries, xG, weather, and market intelligence
              </p>
            </div>
          </div>

          <div className="group relative bg-[#1a1c2e] border border-[#2a2d42] p-6 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-100">86% Win Rate</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Proven track record with transparent performance metrics updated in real-time
              </p>
            </div>
          </div>

          <div className="group relative bg-[#1a1c2e] border border-[#2a2d42] p-6 rounded-xl hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-100">Live Analytics</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Real-time scores, stats, and probability updates as games unfold
              </p>
            </div>
          </div>

          <div className="group relative bg-[#1a1c2e] border border-[#2a2d42] p-6 rounded-xl hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-100">Daily Updates</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Fresh expert picks every day across soccer, NBA, NFL, tennis, and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Bundle Types Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-100">
            Specialized Betting Strategies
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose from our range of expert-curated bundles, each optimized for specific betting strategies
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          <div className="group relative bg-[#1a1c2e] border border-blue-600/30 rounded-xl p-7 hover:border-blue-500 hover:bg-[#22243a] transition-all duration-300">
            <div className="absolute top-3 right-3 px-3 py-1 bg-blue-600/20 rounded-full text-blue-400 text-xs font-semibold">PRO</div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">BTTS Bundle</h3>
            <p className="text-gray-400 text-sm mb-3">Both Teams to Score specialists with 82% accuracy</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>High Confidence</span>
            </div>
          </div>

          <div className="group relative bg-[#1a1c2e] border border-purple-600/30 rounded-xl p-7 hover:border-purple-500 hover:bg-[#22243a] transition-all duration-300">
            <div className="absolute top-3 right-3 px-3 py-1 bg-amber-600/20 rounded-full text-amber-400 text-xs font-semibold">ULTIMATE</div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">+50 Odds Bundle</h3>
            <p className="text-gray-400 text-sm mb-3">High-risk, high-reward parlays with calculated edge</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>High Reward</span>
            </div>
          </div>

          <div className="group relative bg-[#1a1c2e] border border-green-600/30 rounded-xl p-7 hover:border-green-500 hover:bg-[#22243a] transition-all duration-300">
            <div className="absolute top-3 right-3 px-3 py-1 bg-amber-600/20 rounded-full text-amber-400 text-xs font-semibold">ULTIMATE</div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Weekend +10</h3>
            <p className="text-gray-400 text-sm mb-3">Premium weekend picks with 10+ combined odds</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Weekly Special</span>
            </div>
          </div>

          <div className="group relative bg-[#1a1c2e] border border-orange-600/30 rounded-xl p-7 hover:border-orange-500 hover:bg-[#22243a] transition-all duration-300">
            <div className="absolute top-3 right-3 px-3 py-1 bg-amber-600/20 rounded-full text-amber-400 text-xs font-semibold">ULTIMATE</div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Players to Score</h3>
            <p className="text-gray-400 text-sm mb-3">Anytime goalscorer predictions with 78% hit rate</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Player Props</span>
            </div>
          </div>

          <div className="group relative bg-[#1a1c2e] border border-red-600/30 rounded-xl p-7 hover:border-red-500 hover:bg-[#22243a] transition-all duration-300">
            <div className="absolute top-3 right-3 px-3 py-1 bg-amber-600/20 rounded-full text-amber-400 text-xs font-semibold">ULTIMATE</div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Under & Over</h3>
            <p className="text-gray-400 text-sm mb-3">Totals betting portfolio with xG-based analysis</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Data Driven</span>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-amber-600/10 to-purple-600/10 border border-amber-600/50 rounded-xl p-7 hover:border-amber-500 hover:from-amber-600/20 hover:to-purple-600/20 transition-all duration-300">
            <div className="absolute top-3 right-3 px-3 py-1 bg-amber-600 rounded-full text-white text-xs font-semibold">VIP</div>
            <h3 className="text-xl font-bold mb-2 text-gray-100">Custom Requests</h3>
            <p className="text-gray-400 text-sm mb-3">Personalized bundles tailored to your preferences</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Exclusive</span>
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-12 text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-gray-100">
              Start Winning Today
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join over <span className="text-blue-400 font-bold">10,000+ professional bettors</span> using Gambo to make smarter, data-driven decisions
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/50 text-lg px-8 min-w-[220px]">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-gray-700 text-gray-200 hover:bg-[#1a1c2e] hover:text-white hover:border-blue-500/50 text-lg px-8 min-w-[220px]">
                  View All Plans
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Cancel anytime • Full transparency
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
