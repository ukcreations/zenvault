import React from 'react';
import {
  LayoutDashboard,
  Film,
  Heart,
  Clock,
  Radio,
  LogOut,
  X
} from 'lucide-react';
import { YoutubeIcon, GoogleIcon } from './Icons';
import type { GoogleUserProfile } from '../lib/googleAuth';

export type NavView = 'dashboard' | 'all' | 'liked' | 'watch-later';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  totalCount: number;
  likedCount: number;
  watchLaterCount: number;
  onOpenYouTubeSync: () => void;
  onOpenAddModal: () => void;
  googleUser: GoogleUserProfile | null;
  onSignOut: () => void;
  extensionLinked: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  totalCount,
  likedCount,
  watchLaterCount,
  onOpenYouTubeSync,
  googleUser,
  onSignOut,
  extensionLinked,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'all' as NavView,
      label: 'Library',
      icon: Film,
      badge: totalCount,
    },
    {
      id: 'liked' as NavView,
      label: 'Liked Stashes',
      icon: Heart,
      badge: likedCount,
      activeColor: 'text-rose-400',
    },
    {
      id: 'watch-later' as NavView,
      label: 'Watch Later',
      icon: Clock,
      badge: watchLaterCount,
      activeColor: 'text-amber-400',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#08090D] border-r border-white/[0.07] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B7CFF] to-[#38BDF8] p-[1.5px] flex items-center justify-center shadow-[0_0_16px_rgba(139,124,255,0.4)]">
              <div className="w-full h-full bg-[#08090D] rounded-[10px] flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B7CFF] shadow-[0_0_8px_#8B7CFF]" />
              </div>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#F4F5FA] font-display">
                ZENVAULT
              </span>
              <span className="block text-[10px] font-mono uppercase text-[#8E95A5] tracking-wider -mt-0.5">
                MEDIA SANCTUARY
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-[#5E6573] font-semibold">
              NAVIGATION
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectView(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#171A23] text-[#F4F5FA] font-semibold border border-white/10 shadow-sm'
                        : 'text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent
                        className={`w-4 h-4 ${
                          isActive ? item.activeColor || 'text-[#8B7CFF]' : 'text-[#8E95A5]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          isActive
                            ? 'bg-white/10 text-[#F4F5FA]'
                            : 'bg-white/[0.04] text-[#8E95A5]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sync & Integrations */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-[#5E6573] font-semibold">
              CHANNELS & SYNC
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenYouTubeSync();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <YoutubeIcon className="w-4 h-4 text-red-400" />
                  <span>YouTube Sync</span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    googleUser
                      ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                      : 'bg-[#5E6573]'
                  }`}
                />
              </button>

              <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-[#8E95A5]">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Browser Bridge</span>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase ${
                    extensionLinked ? 'text-emerald-400 font-semibold' : 'text-[#5E6573]'
                  }`}
                >
                  {extensionLinked ? 'Ready' : 'Idle'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Google / Supabase User Account */}
        <div className="p-3 border-t border-white/[0.07] bg-[#0B0D13]">
          {googleUser ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#11131A] border border-white/[0.07]">
              <div className="flex items-center gap-2.5 min-w-0">
                {googleUser.picture ? (
                  <img
                    src={googleUser.picture}
                    alt=""
                    className="w-8 h-8 rounded-full border border-white/15 flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF] font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {googleUser.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F4F5FA] truncate leading-tight">
                    {googleUser.name}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Cloud Synced</span>
                  </p>
                </div>
              </div>

              <button
                onClick={onSignOut}
                title="Sign out"
                className="p-1.5 rounded-lg text-[#8E95A5] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenYouTubeSync}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#171A23] hover:bg-[#1E222E] border border-white/[0.08] text-xs font-semibold text-[#F4F5FA] transition-all"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Connect Google</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
