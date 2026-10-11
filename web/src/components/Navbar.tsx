import React from 'react';
import { Sparkles, Plus, VolumeX, Radio, Heart, Clock } from 'lucide-react';
import { YoutubeIcon, GoogleIcon } from './Icons';
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
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto ios-nav-capsule px-4 sm:px-6 h-16 flex items-center justify-between gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        
        {/* Left: Brand with Iridescent Glow */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-[0_0_24px_rgba(99,102,241,0.5)]">
            <div className="w-full h-full bg-[#090d18]/90 rounded-[14px] flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg font-display">
                ZENVAULT
              </span>
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ALGO-SHIELD
              </span>
            </div>
            <div className="hidden 2xl:block text-[10px] text-slate-400 font-mono tracking-wider">
              <span>ZERO FEEDS • PURE CALM</span>
            </div>
          </div>
        </div>

        {/* Center: iOS Segmented Control Pills */}
        <div className="hidden lg:flex items-center ios-segmented-control text-xs font-semibold">
          <button
            onClick={() => { zenAudio.playHapticClick(); setActiveFilter('all'); }}
            className={`px-3.5 py-1.5 ios-segmented-item flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'ios-segmented-item-active'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-slate-300 font-mono">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => { zenAudio.playHapticClick(); setActiveFilter('liked'); }}
            className={`px-3.5 py-1.5 ios-segmented-item flex items-center gap-1.5 ${
              activeFilter === 'liked'
                ? 'ios-segmented-item-active text-rose-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeFilter === 'liked' ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span>Liked</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-slate-300 font-mono">
              {likedCount}
            </span>
          </button>

          <button
            onClick={() => { zenAudio.playHapticClick(); setActiveFilter('watch-later'); }}
            className={`px-3.5 py-1.5 ios-segmented-item flex items-center gap-1.5 ${
              activeFilter === 'watch-later'
                ? 'ios-segmented-item-active text-amber-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Later</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-slate-300 font-mono">
              {watchLaterCount}
            </span>
          </button>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* iOS Sound Toggle with Live Waveform */}
          <button
            onClick={toggleSound}
            title={activeSoundscape === 'off' ? 'Turn on relaxing ambient rain' : 'Mute ambient soundscape'}
            className={`ios-btn-glass flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
              activeSoundscape !== 'off'
                ? 'border-indigo-400/40 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeSoundscape !== 'off' ? (
              <>
                <div className="flex items-end gap-[2px] h-3.5">
                  <span className="w-0.5 bg-indigo-400 rounded-full wave-bar-1" />
                  <span className="w-0.5 bg-indigo-300 rounded-full wave-bar-2" />
                  <span className="w-0.5 bg-indigo-400 rounded-full wave-bar-3" />
                  <span className="w-0.5 bg-indigo-300 rounded-full wave-bar-4" />
                </div>
                <span className="capitalize font-mono text-[11px] hidden sm:inline">{activeSoundscape}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] hidden sm:inline">Ambience</span>
              </>
            )}
          </button>

          {/* Extension Linked Pill */}
          {extensionLinked && (
            <button
              onClick={() => { zenAudio.playHapticClick(); onImportFromExtension(); }}
              className="ios-btn-glass hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/15"
              title="Chrome extension bridge connected. Click to refresh stash."
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Bridge</span>
            </button>
          )}

          {/* Google / YouTube Account Button */}
          {googleUser ? (
            <button
              onClick={() => { zenAudio.playHapticClick(); onOpenYouTubeSync(); }}
              className="ios-btn-glass flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border-indigo-400/30 text-white"
              title={`Connected as ${googleUser.name}`}
            >
              {googleUser.picture ? (
                <img src={googleUser.picture} alt="" className="w-5 h-5 rounded-full border border-indigo-400/50" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline text-[11px] font-medium text-slate-200">
                {googleUser.name.split(' ')[0]}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            </button>
          ) : (
            <button
              onClick={() => { zenAudio.playHapticClick(); onOpenYouTubeSync(); }}
              className="ios-btn-glass flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-slate-200"
            >
              <YoutubeIcon className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}

          {/* iOS Vibrant "+ Add Media" Primary Capsule Button */}
          <button
            onClick={() => { zenAudio.playHapticClick(); onOpenAddModal(); }}
            className="ios-btn-primary flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

        </div>

      </div>
    </header>
  );
};
