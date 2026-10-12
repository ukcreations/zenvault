import React from 'react';
import {
  Search,
  X
} from 'lucide-react';
import type { Platform } from '../types';

interface MoodFilterBarProps {
  selectedPlatform: Platform | 'all';
  onSelectPlatform: (platform: Platform | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Optional for backward compatibility
  selectedMood?: any;
  onSelectMood?: any;
}

export const MoodFilterBar: React.FC<MoodFilterBarProps> = ({
  selectedPlatform,
  onSelectPlatform,
  searchQuery,
  onSearchChange,
}) => {
  const platforms: { id: Platform | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'vimeo', label: 'Vimeo' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
      {/* Platform Selector YouTube-Style Pill Chips */}
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
        {platforms.map((p) => {
          const isSelected = selectedPlatform === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPlatform(p.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#383838] font-medium'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Mobile Search input */}
      <div className="relative w-full sm:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaaaaa]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search videos, channels..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#212121] border border-white/10 text-xs text-[#f1f1f1] placeholder-[#717171] focus:outline-none focus:border-white/30"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#aaaaaa]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
