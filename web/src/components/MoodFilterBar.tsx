import React from 'react';
import {
  Sparkles,
  Moon,
  Brain,
  Laugh,
  BookOpen,
  Compass,
  Search,
  X
} from 'lucide-react';
import type { MoodType, Platform } from '../types';
import { zenAudio } from '../lib/audioSynthesizer';

interface MoodFilterBarProps {
  selectedMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  selectedPlatform: Platform | 'all';
  onSelectPlatform: (platform: Platform | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const MoodFilterBar: React.FC<MoodFilterBarProps> = ({
  selectedMood,
  onSelectMood,
  selectedPlatform,
  onSelectPlatform,
  searchQuery,
  onSearchChange,
}) => {
  const moods: { id: MoodType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Moods', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'chill', label: 'Chill & Calm', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'deep-focus', label: 'Deep Focus', icon: <Brain className="w-3.5 h-3.5" /> },
    { id: 'sleep', label: 'Sleep & Night', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'learn', label: 'Learn & Wisdom', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'comedy', label: 'Laughs & Joy', icon: <Laugh className="w-3.5 h-3.5" /> },
  ];

  const platforms: { id: Platform | 'all'; label: string }[] = [
    { id: 'all', label: 'All Platforms' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'vimeo', label: 'Vimeo' },
  ];

  return (
    <div className="space-y-3 mb-6">
      {/* Top Row: Platforms & Mobile Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Platform Selector Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-[#11131A] border border-white/[0.07] w-full sm:w-auto">
          {platforms.map((p) => {
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  zenAudio.playHapticClick(600, 0.02);
                  onSelectPlatform(p.id);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#171A23] text-[#F4F5FA] font-semibold shadow-sm border border-white/10'
                    : 'text-[#8E95A5] hover:text-[#F4F5FA]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Search input (visible only on mobile) */}
        <div className="relative w-full sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E95A5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search stashes..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#11131A] border border-white/[0.07] text-xs text-[#F4F5FA] placeholder-[#5E6573] focus:outline-none focus:border-[#8B7CFF]/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8E95A5]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mood Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {moods.map((m) => {
          const isActive = selectedMood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                zenAudio.playHapticClick(600, 0.02);
                onSelectMood(m.id);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#8B7CFF] text-[#08090D] font-bold shadow-sm'
                  : 'bg-[#11131A] text-[#8E95A5] hover:text-[#F4F5FA] border border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
