import React from 'react';
import { Search, Sparkles, Moon, Brain, Laugh, BookOpen, Compass, Filter } from 'lucide-react';
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
  onSearchChange
}) => {
  const moods: { id: MoodType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Moods', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'chill', label: 'Chill & Calm', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'deep-focus', label: 'Deep Focus', icon: <Brain className="w-3.5 h-3.5" /> },
    { id: 'sleep', label: 'Sleep & Night', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'comedy', label: 'Laughs & Joy', icon: <Laugh className="w-3.5 h-3.5" /> },
    { id: 'learn', label: 'Learn & Wisdom', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'inspiration', label: 'Inspiration', icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  const platforms: { id: Platform | 'all'; label: string }[] = [
    { id: 'all', label: 'All Platforms' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'vimeo', label: 'Vimeo' },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      
      {/* Top Search & Platform filter row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search saved videos, creators, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        {/* Platform Filter Select */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 w-full sm:w-auto">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  zenAudio.playHapticClick();
                  onSelectPlatform(p.id);
                }}
                className={`tactile-btn whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedPlatform === p.id
                    ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-white/[0.02] border border-transparent'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {moods.map((m) => {
          const isActive = selectedMood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                zenAudio.playHapticClick();
                onSelectMood(m.id);
              }}
              className={`tactile-btn flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                  : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border-white/8 hover:bg-white/[0.06]'
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
