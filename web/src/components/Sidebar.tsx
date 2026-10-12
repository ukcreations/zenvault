import React from 'react';
import {
  LayoutDashboard,
  Film,
  Heart,
  Clock,
  Radio,
  LogOut,
  X,
  Play
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
      label: 'Home',
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
      label: 'Liked Videos',
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
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0f0f0f] border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectView('dashboard')}>
            {/* YouTube Red Icon Badge */}
            <div className="w-8 h-8 rounded-lg bg-[#ff0000] flex items-center justify-center shadow-[0_2px_12px_rgba(255,0,0,0.35)] shrink-0">
              <Play className="w-4 h-4 ml-0.5 fill-white text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#f1f1f1] block leading-tight">
                ReWatch Everywhere
              </span>
              <span className="text-[10px] font-mono uppercase text-[#aaaaaa] tracking-wider block">
                Video Sanctuary
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[#aaaaaa] hover:text-[#f1f1f1] hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-[#717171] font-semibold">
              NAVIGATION
            </div>
            <nav className="space-y-1">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-[#272727] text-white font-semibold'
                        : 'text-[#aaaaaa] hover:text-[#f1f1f1] hover:bg-white/[0.06] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-4 h-4 ${
                          isActive ? item.activeColor || 'text-white' : 'text-[#aaaaaa]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          isActive
                            ? 'bg-white/20 text-white font-semibold'
                            : 'bg-white/5 text-[#aaaaaa]'
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

          {/* YouTube Sync & Integrations */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-[#717171] font-semibold">
              CHANNELS & SYNC
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenYouTubeSync();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#aaaaaa] hover:text-[#f1f1f1] hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-3">
                  <YoutubeIcon className="w-4 h-4 text-[#ff0000]" />
                  <span>YouTube Sync</span>
                </div>
                <span
                  className={`w-2 h-2 rounded-full ${
                    googleUser
                      ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                      : 'bg-zinc-600'
                  }`}
                />
              </button>

              <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#aaaaaa]">
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Browser Bridge</span>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase ${
                    extensionLinked ? 'text-emerald-400 font-semibold' : 'text-[#717171]'
                  }`}
                >
                  {extensionLinked ? 'Active' : 'Idle'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Google / Supabase User Account */}
        <div className="p-3 border-t border-white/[0.08] bg-[#121212]">
          {googleUser ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1e1e1e] border border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                {googleUser.picture ? (
                  <img
                    src={googleUser.picture}
                    alt=""
                    className="w-8 h-8 rounded-full border border-white/20 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {googleUser.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#f1f1f1] truncate leading-tight">
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
                className="p-1.5 rounded-lg text-[#aaaaaa] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenYouTubeSync}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#272727] hover:bg-[#383838] border border-white/10 text-xs font-semibold text-[#f1f1f1] transition-all"
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
