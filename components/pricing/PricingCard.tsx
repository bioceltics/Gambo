'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PricingTier {
  name: string;
  price: number;
  period?: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

interface PricingCardProps {
  tier: PricingTier;
  onSelect: () => void;
}

export function PricingCard({ tier, onSelect }: PricingCardProps) {
  const getTierColor = (name: string) => {
    switch (name) {
      case 'Free': return 'from-gray-600 to-gray-800';
      case 'Basic': return 'from-blue-600 to-blue-800';
      case 'Pro': return 'from-purple-600 to-purple-800';
      case 'Ultimate': return 'from-amber-600 to-amber-800';
      default: return 'from-blue-600 to-purple-600';
    }
  };

  const getTierBadgeColor = (name: string) => {
    switch (name) {
      case 'Pro': return 'bg-purple-600';
      case 'Ultimate': return 'bg-gradient-to-r from-amber-600 to-orange-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <Card
      className={`relative group transition-all duration-300 ${
        tier.highlighted
          ? 'border-purple-500 shadow-2xl shadow-purple-500/20 scale-105 hover:scale-[1.07]'
          : 'hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10'
      }`}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl ${
        tier.highlighted
          ? 'bg-gradient-to-br from-purple-600/5 to-transparent'
          : 'bg-gradient-to-br from-blue-600/5 to-transparent'
      }`}></div>

      {tier.highlighted && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${getTierBadgeColor(tier.name)} text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg`}>
          ⭐ Most Popular
        </div>
      )}

      <CardHeader className="text-center pb-8 relative">
        {/* Tier icon/badge */}
        <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${getTierColor(tier.name)} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
          <span className="text-2xl">
            {tier.name === 'Free' && '🎯'}
            {tier.name === 'Basic' && '📈'}
            {tier.name === 'Pro' && '💎'}
            {tier.name === 'Ultimate' && '👑'}
          </span>
        </div>

        <CardTitle className="text-2xl mb-4 text-gray-100">{tier.name}</CardTitle>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
          </span>
          {tier.price > 0 && (
            <span className="text-gray-500 text-lg">/{tier.period || 'month'}</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <ul className="space-y-3 mb-8">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-300 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className={`w-full ${tier.highlighted ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl shadow-purple-500/30' : ''}`}
          variant={tier.highlighted ? 'default' : 'outline'}
          size="lg"
          onClick={onSelect}
        >
          {tier.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
