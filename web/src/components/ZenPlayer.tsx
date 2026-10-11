import React, { useEffect } from 'react';
import { X, Heart, Clock, ChevronLeft, ChevronRight, ExternalLink, Sparkles, Volume2 } from 'lucide-react';
import type { VideoItem, SoundscapeType } from '../types';
import { extractPlatformAndId } from '../lib/youtubeApi';
import { zenAudio } from '../lib/audioSynthesizer';

interface ZenPlayerProps {
  video: VideoItem | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleLike: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  activeSoundscape: SoundscapeType;
  setActiveSoundscape: (sound: SoundscapeType) => void;
}

export const ZenPlayer: React.FC<ZenPlayerProps> = ({
  video,
  onClose,
  onNext,
  onPrev,
  onToggleLike,
  onToggleWatchLater,
  activeSoundscape,
  setActiveSoundscape
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!video) return null;

  const { platform, embedUrl } = extractPlatformAndId(video.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-4 md:p-8 animate-in fade-in duration-300">
      
      {/* Ambient Theater Underglow backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/15 blur-[140px] animate-pulse duration-[8000ms]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-violet-600/15 blur-[140px] animate-pulse duration-[10000ms]" />
      </div>

      <div className="relative w-full max-w-5xl max-h-[96vh] flex flex-col liquid-crystal-panel overflow-hidden border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.8)]">
        
        {/* Cinema Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 bg-[#07090e]/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-white/10 text-white border border-white/20">
              {video.platform}
            </span>
            <h2 className="text-sm sm:text-base font-semibold text-white truncate max-w-md sm:max-w-xl">
              {video.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              title="Open source URL in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => { zenAudio.playHapticClick(); onClose(); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-all"
              title="Close Cinema Mode (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full bg-black flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[480px] max-h-[72vh]">
          {platform === 'youtube' ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full aspect-video border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : platform === 'instagram' ? (
            <div className="w-full h-full flex items-center justify-center p-2 bg-[#090d16]">
              <iframe
                src={embedUrl}
                title={video.title}
                className="w-full max-w-[420px] h-[580px] rounded-xl border border-white/10"
                allowTransparency
                allow="encrypted-media"
              />
            </div>
          ) : platform === 'vimeo' ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full aspect-video border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
              <Sparkles className="w-12 h-12 text-indigo-400 mb-4 animate-bounce" />
              <p className="text-white font-medium mb-2">Web Clip Ready</p>
              <p className="text-slate-400 text-xs mb-4 max-w-sm">
                This media clip can be viewed directly in distraction-free player.
              </p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs flex items-center gap-2 hover:bg-indigo-500 transition-all"
              >
                <span>Open Clean Link</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Cinema Footer & Atmosphere Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 border-t border-white/10 bg-[#07090e]/80">
          
          {/* Left: Like & Watch Later controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { zenAudio.playHapticClick(800); onToggleLike(video.id); }}
              className={`tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                video.isLiked
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${video.isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{video.isLiked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={() => { zenAudio.playHapticClick(600); onToggleWatchLater(video.id); }}
              className={`tactile-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                video.isWatchLater
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{video.isWatchLater ? 'Queued' : 'Watch Later'}</span>
            </button>
          </div>

          {/* Center: Ambient Soundscape Companion */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/8 text-[11px]">
            <span className="text-slate-400 px-2 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ambience:</span>
            </span>
            {(['off', 'rain', 'fireplace', 'brown-noise'] as SoundscapeType[]).map((snd) => (
              <button
                key={snd}
                onClick={() => {
                  zenAudio.playHapticClick();
                  setActiveSoundscape(snd);
                  if (snd === 'off') zenAudio.stopSoundscape();
                  else zenAudio.startSoundscape(snd);
                }}
                className={`px-2.5 py-1 rounded-lg capitalize font-mono transition-all ${
                  activeSoundscape === snd
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {snd}
              </button>
            ))}
          </div>

          {/* Right: Previous / Next Navigation */}
          <div className="flex items-center gap-1.5">
            {onPrev && (
              <button
                onClick={() => { zenAudio.playHapticClick(); onPrev(); }}
                className="tactile-btn flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
                title="Previous video (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>
            )}
            {onNext && (
              <button
                onClick={() => { zenAudio.playHapticClick(); onNext(); }}
                className="tactile-btn flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 text-white shadow-sm"
                title="Next video (Right Arrow)"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
