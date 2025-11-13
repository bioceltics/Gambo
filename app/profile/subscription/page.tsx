'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Check,
  Sparkles,
  Calendar,
  TrendingUp,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const user = session.user as any;
  const currentTier = user.subscriptionTier || 'FREE';

  const plans = [
    {
      name: 'Free',
      tier: 'FREE',
      price: '$0',
      period: 'forever',
      gradient: 'from-gray-500 to-gray-600',
      features: [
        'View basic live scores',
        'Access to 1 bundle per week',
        'Basic game statistics',
        'Email support',
      ],
    },
    {
      name: 'Basic',
      tier: 'BASIC',
      price: '$9.99',
      period: 'per month',
      gradient: 'from-blue-500 to-blue-600',
      features: [
        'All Free features',
        '2 bundles per week',
        'Advanced statistics',
        'Priority email support',
        'Mobile notifications',
      ],
    },
    {
      name: 'Pro',
      tier: 'PRO',
      price: '$19.99',
      period: 'per month',
      gradient: 'from-purple-500 to-purple-600',
      popular: true,
      features: [
        'All Basic features',
        'Unlimited bundles',
        'Live score notifications',
        'Detailed analytics',
        'Custom game alerts',
        'Priority support',
      ],
    },
    {
      name: 'Ultimate',
      tier: 'ULTIMATE',
      price: '$39.99',
      period: 'per month',
      gradient: 'from-amber-500 to-orange-600',
      features: [
        'All Pro features',
        'Custom AI analysis',
        'Exclusive expert insights',
        'Early access to bundles',
        'Dedicated support',
        'API access',
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Subscription Management
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-100">
            Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Subscription</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            Manage your plan and billing information
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="border-purple-500/30 bg-[#1a1c2e]/80 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Plan</p>
                <p className="text-xl font-bold text-gray-100">
                  {plans.find(p => p.tier === currentTier)?.name || 'Free'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <p className="text-xl font-bold text-green-400">Active</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Next Billing Date</p>
                <p className="text-xl font-bold text-gray-100">
                  {currentTier === 'FREE' ? 'N/A' : 'Feb 15, 2025'}
                </p>
              </div>
            </div>

            {currentTier !== 'FREE' && (
              <div className="mt-6 pt-6 border-t border-[#2a2d42] flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  Member since January 15, 2025
                </div>
                <Button variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                  Cancel Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Available Plans</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.tier}
                className={`relative border-[#2a2d42] bg-[#1a1c2e]/80 backdrop-blur-sm ${
                  plan.popular ? 'border-purple-500/50' : ''
                } ${currentTier === plan.tier ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold text-white">
                      Most Popular
                    </div>
                  </div>
                )}

                {currentTier === plan.tier && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold text-white">
                      Current Plan
                    </div>
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className={`text-xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent mb-2`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-black text-gray-100">{plan.price}</span>
                      <span className="text-sm text-gray-400">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {currentTier === plan.tier ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Link href="/pricing" className="block">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            : ''
                        }`}
                      >
                        {plan.tier === 'FREE' ? 'Downgrade' : 'Upgrade'}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing History */}
        {currentTier !== 'FREE' && (
          <Card className="border-[#2a2d42] bg-[#1a1c2e]/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: 'Jan 15, 2025', amount: '$19.99', status: 'Paid', invoice: '#INV-001' },
                  { date: 'Dec 15, 2024', amount: '$19.99', status: 'Paid', invoice: '#INV-002' },
                  { date: 'Nov 15, 2024', amount: '$19.99', status: 'Paid', invoice: '#INV-003' },
                ].map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg hover:bg-[#13152a] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-100">{transaction.invoice}</p>
                        <p className="text-xs text-gray-400">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-100">{transaction.amount}</span>
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded">
                        {transaction.status}
                      </span>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
