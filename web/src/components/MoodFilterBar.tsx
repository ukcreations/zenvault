import React from 'react';
import { Search, Sparkles, Moon, Brain, Laugh, BookOpen, Compass } from 'lucide-react';
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
        {/* iOS Frosted Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            id="zenvault-search"
            name="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search saved videos, creators, or tags..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white/[0.05] border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-indigo-400/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-2xl transition-all shadow-inner"
          />
        </div>

        {/* Platform Filter Segmented Control */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <div className="flex items-center gap-1 overflow-x-auto py-1 w-full sm:w-auto ios-segmented-control text-xs">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  zenAudio.playHapticClick();
                  onSelectPlatform(p.id);
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  selectedPlatform === p.id
                    ? 'ios-segmented-item-active'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Pills Carousel with iOS Springs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {moods.map((m) => {
          const isActive = selectedMood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                zenAudio.playHapticClick();
                onSelectMood(m.id);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white border-indigo-400/50 shadow-[0_4px_16px_rgba(99,102,241,0.4)] scale-[1.02]'
                  : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/8 hover:bg-white/[0.08] backdrop-blur-xl'
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
