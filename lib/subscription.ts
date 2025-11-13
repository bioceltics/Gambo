import { SubscriptionTier } from '@prisma/client';

export const SUBSCRIPTION_FEATURES = {
  FREE: {
    name: 'Free',
    price: 0,
    bundlesPerWeek: 1,
    customAnalysis: 'basic',
    liveScores: 'top-leagues',
    oddsComparison: 'basic',
    specialBundles: [],
  },
  BASIC: {
    name: 'Basic',
    price: 20,
    bundlesPerDay: 2,
    customAnalysis: 'advanced',
    liveScores: 'with-alerts',
    playerProps: true,
    specialBundles: [],
  },
  PRO: {
    name: 'Pro',
    price: 50,
    bundlesPerDay: 5,
    customAnalysis: 'unlimited',
    liveScores: 'advanced-stats',
    playerProps: true,
    specialBundles: ['BTTS'],
  },
  ULTIMATE: {
    name: 'Ultimate',
    price: 100,
    bundlesPerDay: 'unlimited',
    customAnalysis: 'unlimited',
    liveScores: 'advanced-stats',
    playerProps: true,
    customBundleRequests: true,
    earlyLineMovement: true,
    specialBundles: ['BTTS', 'PLUS_50_ODDS', 'WEEKEND_PLUS_10', 'PLAYERS_TO_SCORE', 'UNDER_OVER'],
  },
} as const;

export function canAccessBundle(userTier: SubscriptionTier, bundleTier: SubscriptionTier): boolean {
  const tierOrder = ['FREE', 'BASIC', 'PRO', 'ULTIMATE'];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(bundleTier);
}

export function getBundleLimit(tier: SubscriptionTier, period: 'day' | 'week'): number {
  if (period === 'week' && tier === 'FREE') return 1;
  if (period === 'day') {
    switch (tier) {
      case 'BASIC':
        return 2;
      case 'PRO':
        return 5;
      case 'ULTIMATE':
        return 999; // Unlimited
      default:
        return 0;
    }
  }
  return 0;
}
