import React from 'react';
import { Sparkles, Plus, Volume2, VolumeX, Radio } from 'lucide-react';
import { YoutubeIcon } from './Icons';
import { zenAudio } from '../lib/audioSynthesizer';
import type { SoundscapeType } from '../types';
import type { GoogleUserProfile } from '../lib/googleAuth';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenYouTubeSync: () => void;
  totalCount: number;
  likedCount: number;
  watchLaterCount: number;
  activeFilter: string;
  setActiveFilter: (filter: 'all' | 'liked' | 'watch-later') => void;
  activeSoundscape: SoundscapeType;
  setActiveSoundscape: (sound: SoundscapeType) => void;
  extensionLinked: boolean;
  onImportFromExtension: () => void;
  googleUser?: GoogleUserProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenYouTubeSync,
  totalCount,
  likedCount,
  watchLaterCount,
  activeFilter,
  setActiveFilter,
  activeSoundscape,
  setActiveSoundscape,
  extensionLinked,
  onImportFromExtension,
  googleUser
}) => {
  const toggleSound = () => {
    zenAudio.playHapticClick(650, 0.03);
    if (activeSoundscape === 'off') {
      setActiveSoundscape('rain');
      zenAudio.startSoundscape('rain');
    } else {
      setActiveSoundscape('off');
      zenAudio.stopSoundscape();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07090e]/80 border-b border-white/8 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand & Tactical Telemetry */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-400 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <div className="w-full h-full bg-[#07090e] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-lg sm:text-xl font-display">
                  ZENVAULT
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ALGO-FREE
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-mono tracking-wider">
                <span>[SANCTUARY: SECURE]</span>
                <span className="text-slate-600">•</span>
                <span>NO FEEDS • NO COMMENTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Pill Quick Navigation */}
        <div className="hidden lg:flex items-center bg-white/[0.03] border border-white/10 rounded-full p-1 shadow-inner">
          <button
            onClick={() => { zenAudio.playHapticClick(); setActiveFilter('all'); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Vault ({totalCount})
          </button>
          <button
            onClick={() => { zenAudio.playHapticClick(); setActiveFilter('liked'); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'liked'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ♥ Liked ({likedCount})
          </button>
          <button
            onClick={() => { zenAudio.playHapticClick(); setActiveFilter('watch-later'); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'watch-later'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⏳ Watch Later ({watchLaterCount})
          </button>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ambient Sound Quick Toggle */}
          <button
            onClick={toggleSound}
            title={activeSoundscape === 'off' ? 'Turn on relaxing ambient rain' : 'Mute ambient soundscape'}
            className={`tactile-btn flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              activeSoundscape !== 'off'
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeSoundscape !== 'off' ? (
              <>
                <Volume2 className="w-4 h-4 text-indigo-400 animate-bounce" />
                <span className="hidden sm:inline capitalize font-mono text-[11px]">{activeSoundscape}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline text-[11px]">Sound</span>
              </>
            )}
          </button>

          {/* Extension Linked Indicator / Sync Button */}
          {extensionLinked && (
            <button
              onClick={() => { zenAudio.playHapticClick(); onImportFromExtension(); }}
              className="tactile-btn hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
              title="Chrome extension bridge connected. Click to refresh stash."
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Bridge Sync</span>
            </button>
          )}

          {/* YouTube Sync / Google Account Status Button */}
          {googleUser ? (
            <button
              onClick={() => { zenAudio.playHapticClick(); onOpenYouTubeSync(); }}
              className="tactile-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 border border-red-500/30 text-white hover:bg-red-500/20"
              title={`Connected as ${googleUser.name} (${googleUser.email}). Click to sync.`}
            >
              {googleUser.picture ? (
                <img src={googleUser.picture} alt="" className="w-5 h-5 rounded-full border border-red-400" />
              ) : (
                <YoutubeIcon className="w-4 h-4 text-red-500" />
              )}
              <span className="hidden sm:inline text-[11px] font-medium text-red-200">
                {googleUser.name.split(' ')[0]}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          ) : (
            <button
              onClick={() => { zenAudio.playHapticClick(); onOpenYouTubeSync(); }}
              className="tactile-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/10 text-slate-200 hover:bg-white/[0.08] hover:border-white/20"
            >
              <YoutubeIcon className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Google / YouTube</span>
            </button>
          )}

          {/* Add Video Button */}
          <button
            onClick={() => { zenAudio.playHapticClick(); onOpenAddModal(); }}
            className="tactile-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border border-indigo-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Media</span>
          </button>
        </div>

      </div>
    </header>
  );
};
