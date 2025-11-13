'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  User,
  LogOut,
  Settings,
  CreditCard,
  Bell,
  Star,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface ProfileDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    subscriptionTier?: string;
  };
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getTierBadge = () => {
    const tier = user.subscriptionTier || 'FREE';

    const tierConfig = {
      FREE: { label: 'Free', gradient: 'from-gray-500 to-gray-600', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
      BASIC: { label: 'Basic', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
      PRO: { label: 'Pro', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
      ULTIMATE: { label: 'Ultimate', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    };

    const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.FREE;

    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bg} border ${config.border}`}>
        {tier === 'ULTIMATE' && <Sparkles className="w-3 h-3 text-amber-400" />}
        <span className={`text-xs font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
          {config.label}
        </span>
      </div>
    );
  };

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1c2e] border border-[#2a2d42] hover:border-blue-500/50 transition-all"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">{getInitials()}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#1a1c2e] border border-[#2a2d42] rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
          {/* User Info Section */}
          <div className="p-4 border-b border-[#2a2d42]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-base font-bold text-white">{getInitials()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-100 truncate">{user.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            {getTierBadge()}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-[#2a2d42] hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Personal Info</span>
            </Link>

            <Link
              href="/profile/subscription"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-[#2a2d42] hover:text-white transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">Subscription</span>
            </Link>

            <Link
              href="/profile/favorites"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-[#2a2d42] hover:text-white transition-colors"
            >
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Favorite Games</span>
            </Link>

            <Link
              href="/profile/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-[#2a2d42] hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">Notifications</span>
            </Link>

            <Link
              href="/profile/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-[#2a2d42] hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Account Settings</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-[#2a2d42] py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
