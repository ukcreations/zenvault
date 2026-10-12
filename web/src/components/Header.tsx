import React, { useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Plus,
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { YoutubeIcon } from './Icons';
import type { NavView } from './Sidebar';

interface HeaderProps {
  currentView: NavView;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  onOpenAddModal: () => void;
  onOpenYouTubeSync: () => void;
  onOpenMobileMenu: () => void;
  filteredCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  searchQuery,
  onSearchChange,
  viewMode,
  onToggleViewMode,
  onOpenAddModal,
  onOpenYouTubeSync,
  onOpenMobileMenu,
  filteredCount,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K or Ctrl+K focuses the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard';
      case 'liked':
        return 'Liked Videos';
      case 'watch-later':
        return 'Watch Later';
      case 'all':
      default:
        return 'Library';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0f0f0f]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Menu & Current View Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#aaaaaa] hover:text-[#f1f1f1] hover:bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#f1f1f1] text-sm tracking-tight">
            {getViewTitle()}
          </span>
          <span className="text-[11px] font-mono text-[#aaaaaa] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ml-1">
            {filteredCount}
          </span>
        </div>
      </div>

      {/* Center: Global YouTube-style Search Pill */}
      <div className="flex-1 max-w-lg mx-2 hidden md:block">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaaaaa]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search saved videos, channels, topics..."
            className="w-full pl-10 pr-14 py-2 rounded-full bg-[#121212] border border-white/15 text-xs text-[#f1f1f1] placeholder-[#717171] focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all shadow-inner"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 text-[#aaaaaa] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-[#aaaaaa] border border-white/10 pointer-events-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Right: View Toggles & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Grid vs List View Mode Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#212121] border border-white/10">
          <button
            onClick={() => onToggleViewMode('grid')}
            title="Grid view"
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-white/15 text-[#f1f1f1] shadow-sm'
                : 'text-[#aaaaaa] hover:text-[#f1f1f1]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleViewMode('list')}
            title="List view"
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white/15 text-[#f1f1f1] shadow-sm'
                : 'text-[#aaaaaa] hover:text-[#f1f1f1]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync YouTube Button */}
        <button
          onClick={onOpenYouTubeSync}
          className="btn-secondary hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold"
          title="Synchronize YouTube liked videos"
        >
          <YoutubeIcon className="w-3.5 h-3.5 text-[#ff0000]" />
          <span>Sync YouTube</span>
        </button>

        {/* Add Video Primary Button (Crisp White Pill) */}
        <button
          onClick={onOpenAddModal}
          className="btn-primary flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
        </button>
      </div>
    </header>
  );
};
