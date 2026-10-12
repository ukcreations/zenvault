import React, { useEffect } from 'react';
import {
  X,
  Heart,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Film
} from 'lucide-react';
import type { VideoItem } from '../types';
import { extractPlatformAndId } from '../lib/youtubeApi';
import { useToast } from './Toast';

interface ZenPlayerProps {
  video: VideoItem | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleLike: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
}

export const ZenPlayer: React.FC<ZenPlayerProps> = ({
  video,
  onClose,
  onNext,
  onPrev,
  onToggleLike,
  onToggleWatchLater,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-3 sm:p-6 md:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[96vh] flex flex-col rounded-2xl bg-[#0f0f0f] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Cinema Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#181818]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="shrink-0 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-white/10 text-white border border-white/15">
              {video.platform}
            </span>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-semibold text-[#f1f1f1] truncate max-w-sm sm:max-w-xl">
                {video.title}
              </h2>
              {video.channel && (
                <p className="text-[11px] text-[#aaaaaa] truncate">
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
              className="p-2 rounded-lg text-[#aaaaaa] hover:text-white hover:bg-white/10 transition-colors"
              title="Open source video in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#aaaaaa] hover:text-white hover:bg-white/10 transition-colors"
              title="Close player (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Canvas */}
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
            <div className="w-full h-full flex items-center justify-center p-2 bg-[#0f0f0f]">
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
              <Film className="w-10 h-10 text-zinc-400 mb-3" />
              <p className="text-[#f1f1f1] font-semibold text-sm mb-1">Web Video</p>
              <p className="text-[#aaaaaa] text-xs mb-4 max-w-sm">
                This media clip can be viewed directly in a clean browser window.
              </p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-2"
              >
                <span>Open Video</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Cinema Footer Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/10 bg-[#181818]/90 backdrop-blur-xl">
          {/* Like & Watch Later */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onToggleLike(video.id);
                success(video.isLiked ? 'Removed from Liked' : 'Saved to Liked');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                video.isLiked
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'btn-secondary text-[#aaaaaa]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${video.isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{video.isLiked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={() => {
                onToggleWatchLater(video.id);
                success(video.isWatchLater ? 'Removed from Watch Later' : 'Saved to Watch Later');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                video.isWatchLater
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'btn-secondary text-[#aaaaaa]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{video.isWatchLater ? 'Saved' : 'Watch Later'}</span>
            </button>
          </div>

          {/* Prev / Next controls */}
          <div className="flex items-center gap-2">
            {onPrev && (
              <button
                onClick={onPrev}
                className="btn-secondary flex items-center gap-1 px-3 py-1.5 text-xs font-semibold"
                title="Previous video (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="btn-primary flex items-center gap-1 px-4 py-1.5 text-xs font-bold"
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
