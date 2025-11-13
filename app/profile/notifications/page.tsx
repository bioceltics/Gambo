'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    liveScoreUpdates: true,
    goalAlerts: true,
    matchStart: true,
    matchEnd: true,
    bundleAlerts: true,
    customAnalysis: false,
    weeklyDigest: true,
    promotions: false,
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

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
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Notification Settings
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 text-gray-100">
            Notification <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Preferences</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-3xl">
            Control how and when you receive notifications
          </p>
        </div>

        <div className="max-w-3xl space-y-6">
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-400">
                Notification preferences updated successfully!
              </p>
            </div>
          )}

          {/* Notification Channels */}
          <Card className="border-green-500/30 bg-[#1a1c2e]/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-400" />
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-100">Email Notifications</p>
                    <p className="text-xs text-gray-400">Receive updates via email</p>
                  </div>
                </div>
                <Toggle
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-100">Push Notifications</p>
                    <p className="text-xs text-gray-400">Get instant alerts on your device</p>
                  </div>
                </div>
                <Toggle
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-100">SMS Notifications</p>
                    <p className="text-xs text-gray-400">Receive text messages for important alerts</p>
                  </div>
                </div>
                <Toggle
                  checked={settings.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Live Score Alerts */}
          <Card className="border-[#2a2d42] bg-[#1a1c2e]/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Live Score Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-100">Score Updates</p>
                  <p className="text-xs text-gray-400">Get notified when scores change</p>
                </div>
                <Toggle
                  checked={settings.liveScoreUpdates}
                  onChange={() => handleToggle('liveScoreUpdates')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-100">Goal Alerts</p>
                  <p className="text-xs text-gray-400">Instant alerts for goals scored</p>
                </div>
                <Toggle
                  checked={settings.goalAlerts}
                  onChange={() => handleToggle('goalAlerts')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-100">Match Start</p>
                  <p className="text-xs text-gray-400">Alert when matches begin</p>
                </div>
                <Toggle
                  checked={settings.matchStart}
                  onChange={() => handleToggle('matchStart')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-100">Match End</p>
                  <p className="text-xs text-gray-400">Alert when matches finish</p>
                </div>
                <Toggle
                  checked={settings.matchEnd}
                  onChange={() => handleToggle('matchEnd')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Updates */}
          <Card className="border-[#2a2d42] bg-[#1a1c2e]/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Content Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-100">New Bundles</p>
                  <p className="text-xs text-gray-400">Notify when new betting bundles are available</p>
                </div>
                <Toggle
                  checked={settings.bundleAlerts}
                  onChange={() => handleToggle('bundleAlerts')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-100">Custom Analysis Ready</p>
                  <p className="text-xs text-gray-400">Alert when your requested analysis is complete</p>
                </div>
                <Toggle
                  checked={settings.customAnalysis}
                  onChange={() => handleToggle('customAnalysis')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-100">Weekly Digest</p>
                  <p className="text-xs text-gray-400">Summary of top bundles and updates</p>
                </div>
                <Toggle
                  checked={settings.weeklyDigest}
                  onChange={() => handleToggle('weeklyDigest')}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0c0d15] rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-100">Promotions & Offers</p>
                  <p className="text-xs text-gray-400">Special deals and limited-time offers</p>
                </div>
                <Toggle
                  checked={settings.promotions}
                  onChange={() => handleToggle('promotions')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
