import React from 'react';
import { Film, Sparkles } from 'lucide-react';
import { zenAudio } from '../lib/audioSynthesizer';

interface HeroSanctuaryProps {
  totalCount: number;
  filteredCount: number;
  onStartCinema: () => void;
  onOpenAddModal: () => void;
}

export const HeroSanctuary: React.FC<HeroSanctuaryProps> = ({
  totalCount,
  filteredCount,
  onStartCinema,
  onOpenAddModal
}) => {
  return (
    <div className="relative mb-10 pt-4 pb-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        
        {/* Left Column: Visionary Editorial Headline */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-white/[0.05] border border-white/10 text-indigo-300 mb-3.5 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_#818cf8]" />
            <span>MINDFUL MEDIA SANCTUARY • {totalCount} PROTECTED</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.12]">
            Watch only what you <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-indigo-400 to-purple-300">
              chose to save.
            </span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-xl font-normal">
            Zero algorithmic rabbit holes. Zero doomscrolling traps. No comment drama.
            Just your saved Instagram reels, liked YouTube videos, and tranquil stashes in pure optical peace.
          </p>
        </div>

        {/* Right Column: iOS Tactile Launchers */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              zenAudio.playHapticClick(720);
              onStartCinema();
            }}
            disabled={filteredCount === 0}
            className="ios-btn-primary flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white disabled:opacity-40 shadow-[0_8px_30px_rgba(99,102,241,0.4)]"
          >
            <Film className="w-4 h-4 text-white" />
            <span>Cinema Mode ({filteredCount})</span>
          </button>

          <button
            onClick={() => {
              zenAudio.playHapticClick(600);
              onOpenAddModal();
            }}
            className="ios-btn-glass flex items-center gap-2 px-4 py-3.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Add Media</span>
          </button>
        </div>

      </div>
    </div>
  );
};
