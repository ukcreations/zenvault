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
        return 'Liked Stashes';
      case 'watch-later':
        return 'Watch Later';
      case 'all':
      default:
        return 'Video Library';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#08090D]/80 backdrop-blur-xl border-b border-white/[0.07] px-4 sm:px-6 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.05]"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#8E95A5] hidden sm:inline">ZenVault</span>
          <span className="text-[#5E6573] hidden sm:inline">/</span>
          <span className="font-semibold text-[#F4F5FA] text-sm">
            {getViewTitle()}
          </span>
          <span className="text-[11px] font-mono text-[#8E95A5] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/5 ml-1">
            {filteredCount}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A5]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stashes, channels, notes..."
            className="w-full pl-9 pr-14 py-2 rounded-lg bg-[#11131A] border border-white/[0.08] text-xs text-[#F4F5FA] placeholder-[#5E6573] focus:outline-none focus:border-[#8B7CFF]/50 focus:ring-1 focus:ring-[#8B7CFF]/30 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#8E95A5] hover:text-[#F4F5FA]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-[#8E95A5] border border-white/5 pointer-events-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Right: View Toggles & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Grid vs List View Mode Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#11131A] border border-white/[0.08]">
          <button
            onClick={() => onToggleViewMode('grid')}
            title="Grid view"
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-[#171A23] text-[#F4F5FA] shadow-sm'
                : 'text-[#8E95A5] hover:text-[#F4F5FA]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleViewMode('list')}
            title="List view"
            className={`p-1.5 rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-[#171A23] text-[#F4F5FA] shadow-sm'
                : 'text-[#8E95A5] hover:text-[#F4F5FA]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync YouTube Button */}
        <button
          onClick={onOpenYouTubeSync}
          className="btn-secondary hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
          title="Synchronize YouTube liked videos and playlists"
        >
          <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />
          <span>Sync</span>
        </button>

        {/* Add Media Primary Button */}
        <button
          onClick={onOpenAddModal}
          className="btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
        </button>
      </div>
    </header>
  );
};
