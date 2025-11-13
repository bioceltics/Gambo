'use client';

import { PricingCard } from '@/components/pricing/PricingCard';
import { useRouter } from 'next/navigation';

const PRICING_TIERS = [
  {
    name: 'Free',
    price: 0,
    features: [
      '1 betting bundle per week',
      'Basic custom analysis',
      'Live scores for top leagues',
      'Basic odds comparison',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Basic',
    price: 20,
    period: 'month',
    features: [
      '2 expert bundles daily',
      'Advanced custom analysis',
      'Live scores with alerts',
      'Player prop insights',
      'Email support',
    ],
    cta: 'Subscribe Now',
  },
  {
    name: 'Pro',
    price: 50,
    period: 'month',
    highlighted: true,
    features: [
      '5 expert bundles daily',
      'BTTS Bundle access',
      'Unlimited custom analysis',
      'Live scores with advanced stats',
      'Player prop predictions',
      'Priority support',
    ],
    cta: 'Subscribe Now',
  },
  {
    name: 'Ultimate',
    price: 100,
    period: 'month',
    features: [
      'Everything in Pro',
      'Special +50 Odds Bundle',
      'Weekend +10 Odds Bundle',
      'Players to Score Bundle',
      'Under & Over Bundle',
      'Custom bundle requests',
      'Early line movement alerts',
      'VIP support',
    ],
    cta: 'Subscribe Now',
  },
];

export default function PricingPage() {
  const router = useRouter();

  const handleSelectPlan = (tierName: string) => {
    if (tierName === 'Free') {
      router.push('/auth/signup');
    } else {
      router.push('/auth/signup?plan=' + tierName.toLowerCase());
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Premium Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Flexible Pricing Options
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4 text-gray-100">
            Choose Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Winning Plan</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select the perfect tier for your betting strategy and unlock professional-grade analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              onSelect={() => handleSelectPlan(tier.name)}
            />
          ))}
        </div>

        {/* Premium Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-100">All Plans Include</h2>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto">Every tier comes with our core professional features</p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="group relative bg-[#1a1c2e] border border-[#2a2d42] p-8 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-bold mb-2 text-gray-100 text-lg">Expert Analysis</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Detailed breakdowns of every pick with 10+ data points
                </p>
              </div>
            </div>

            <div className="group relative bg-[#1a1c2e] border border-[#2a2d42] p-8 rounded-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-bold mb-2 text-gray-100 text-lg">Real-Time Updates</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Live scores, stats, and instant notifications
                </p>
              </div>
            </div>

            <div className="group relative bg-[#1a1c2e] border border-[#2a2d42] p-8 rounded-xl hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-bold mb-2 text-gray-100 text-lg">Track Record</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Full transparency with verified performance history
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            No credit card required for Free tier • Cancel anytime • 100% transparent
          </p>
        </div>
      </div>
    </div>
  );
}
