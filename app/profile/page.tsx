'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  CreditCard,
  Star,
  Bell,
  Settings,
  Sparkles,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const user = session.user as any;
  const subscriptionTier = user.subscriptionTier || 'FREE';

  const getTierConfig = () => {
    const configs = {
      FREE: {
        label: 'Free',
        gradient: 'from-gray-500 to-gray-600',
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/30',
        description: 'Basic features'
      },
      BASIC: {
        label: 'Basic',
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        description: 'Standard features + 2 bundles/week'
      },
      PRO: {
        label: 'Pro',
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        description: 'Advanced features + unlimited bundles'
      },
      ULTIMATE: {
        label: 'Ultimate',
        gradient: 'from-amber-500 to-orange-600',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        description: 'All features + custom analysis'
      },
    };

    return configs[subscriptionTier as keyof typeof configs] || configs.FREE;
  };

  const tierConfig = getTierConfig();

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  const profileSections = [
    {
      icon: User,
      title: 'Personal Information',
      description: 'Update your name, email, and profile details',
      link: '/profile/settings',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: CreditCard,
      title: 'Subscription & Billing',
      description: `Current plan: ${tierConfig.label}. Manage your subscription`,
      link: '/profile/subscription',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: Star,
      title: 'Favorite Games',
      description: 'Manage games you\'re following for notifications',
      link: '/profile/favorites',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      icon: Bell,
      title: 'Notification Settings',
      description: 'Configure alerts for live scores and updates',
      link: '/profile/notifications',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      icon: Activity,
      title: 'Activity & History',
      description: 'View your betting history and analytics',
      link: '/profile/activity',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Change password and privacy settings',
      link: '/profile/security',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Your Profile
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-100">
            Account <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Settings</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            Manage your account, subscription, and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-[#2a2d42] bg-[#1a1c2e]/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-white">{getInitials()}</span>
                  </div>

                  {/* User Info */}
                  <h2 className="text-xl font-bold text-gray-100 mb-1">{user.name || 'User'}</h2>
                  <p className="text-sm text-gray-400 mb-4">{user.email}</p>

                  {/* Subscription Tier Badge */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${tierConfig.bg} border ${tierConfig.border} mb-6`}>
                    {subscriptionTier === 'ULTIMATE' && <Sparkles className="w-4 h-4 text-amber-400" />}
                    <span className={`text-sm font-bold bg-gradient-to-r ${tierConfig.gradient} bg-clip-text text-transparent`}>
                      {tierConfig.label} Plan
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="w-full space-y-3 mb-6">
                    <div className="flex items-center justify-between p-3 bg-[#0c0d15] rounded-lg">
                      <span className="text-sm text-gray-400">Favorite Games</span>
                      <span className="text-sm font-bold text-gray-100">12</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0c0d15] rounded-lg">
                      <span className="text-sm text-gray-400">Bundles Viewed</span>
                      <span className="text-sm font-bold text-gray-100">47</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0c0d15] rounded-lg">
                      <span className="text-sm text-gray-400">Member Since</span>
                      <span className="text-sm font-bold text-gray-100">Jan 2025</span>
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  {subscriptionTier !== 'ULTIMATE' && (
                    <Link href="/pricing" className="w-full">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Sections */}
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {profileSections.map((section, index) => (
                <Link key={index} href={section.link}>
                  <Card className="border-[#2a2d42] bg-[#1a1c2e]/80 backdrop-blur-sm hover:border-blue-500/50 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${section.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <section.icon className={`w-6 h-6 ${section.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-100 mb-1">{section.title}</h3>
                          <p className="text-sm text-gray-400">{section.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
