import React, { useEffect } from 'react';
import {
  X,
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Volume2
} from 'lucide-react';
import type { VideoItem, SoundscapeType } from '../types';
import { extractPlatformAndId } from '../lib/youtubeApi';
import { zenAudio } from '../lib/audioSynthesizer';
import { useToast } from './Toast';

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
  setActiveSoundscape,
}) => {
  const { success } = useToast();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-3 sm:p-6 md:p-8 animate-in fade-in duration-200">
      {/* Subtle Ambient Backlight */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] rounded-full bg-[#8B7CFF]/10 blur-[180px]" />
      </div>

      <div className="relative w-full max-w-5xl max-h-[96vh] flex flex-col rounded-2xl bg-[#08090D] border border-white/[0.1] shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Cinema Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#11131A]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="flex-shrink-0 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-white/10 text-white border border-white/15">
              {video.platform}
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-semibold text-[#F4F5FA] truncate max-w-sm sm:max-w-xl">
                {video.title}
              </h2>
              {video.channel && (
                <p className="text-[10px] text-[#8E95A5] font-mono truncate">
                  {video.channel}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.06] transition-colors"
              title="Open source URL in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                zenAudio.playHapticClick();
                onClose();
              }}
              className="p-2 rounded-lg text-[#8E95A5] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Close Cinema Mode (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full bg-black flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[460px] max-h-[72vh]">
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
            <div className="w-full h-full flex items-center justify-center p-2 bg-[#08090D]">
              <iframe
                src={embedUrl}
                title={video.title}
                className="w-full max-w-[420px] h-[560px] rounded-xl border border-white/15 shadow-2xl"
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
              <Sparkles className="w-10 h-10 text-[#8B7CFF] mb-3 animate-pulse" />
              <p className="text-[#F4F5FA] font-semibold text-sm mb-1">Web Clip Ready</p>
              <p className="text-[#8E95A5] text-xs mb-4 max-w-sm">
                This media clip can be viewed directly in distraction-free player.
              </p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <span>Open Clean Link</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Cinema Footer Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-white/[0.08] bg-[#11131A]/90 backdrop-blur-xl">
          {/* Like & Watch Later */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                zenAudio.playHapticClick(800);
                onToggleLike(video.id);
                success(video.isLiked ? 'Removed from Liked' : 'Saved to Liked');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                video.isLiked
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'btn-secondary text-[#8E95A5]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${video.isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{video.isLiked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={() => {
                zenAudio.playHapticClick(600);
                onToggleWatchLater(video.id);
                success(video.isWatchLater ? 'Removed from Queue' : 'Added to Watch Later');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                video.isWatchLater
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'btn-secondary text-[#8E95A5]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{video.isWatchLater ? 'Queued' : 'Watch Later'}</span>
            </button>
          </div>

          {/* Soundscape presets */}
          <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-xl bg-[#171A23] border border-white/[0.06] text-[11px]">
            <span className="text-[#8E95A5] px-2 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-[#8B7CFF]" />
              <span>Sound:</span>
            </span>
            {(['off', 'rain', 'fireplace', 'brown-noise'] as SoundscapeType[]).map((snd) => (
              <button
                key={snd}
                onClick={() => {
                  zenAudio.playHapticClick(600, 0.02);
                  setActiveSoundscape(snd);
                  if (snd === 'off') zenAudio.stopSoundscape();
                  else zenAudio.startSoundscape(snd);
                }}
                className={`px-2.5 py-1 rounded-lg capitalize font-mono text-[10px] transition-all ${
                  activeSoundscape === snd
                    ? 'bg-[#8B7CFF] text-[#08090D] font-bold'
                    : 'text-[#8E95A5] hover:text-[#F4F5FA]'
                }`}
              >
                {snd}
              </button>
            ))}
          </div>

          {/* Prev / Next controls */}
          <div className="flex items-center gap-1.5">
            {onPrev && (
              <button
                onClick={() => {
                  zenAudio.playHapticClick(650);
                  onPrev();
                }}
                className="btn-secondary flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                title="Previous video (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>
            )}
            {onNext && (
              <button
                onClick={() => {
                  zenAudio.playHapticClick(700);
                  onNext();
                }}
                className="btn-primary flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold"
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
