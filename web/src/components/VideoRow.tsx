import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Heart,
  Clock,
  MoreVertical,
  ExternalLink,
  Copy,
  Trash2,
  Film,
  Check
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, TikTokIcon } from './Icons';
import type { VideoItem } from '../types';
import { useToast } from './Toast';

interface VideoRowProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  onToggleLike: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VideoRow: React.FC<VideoRowProps> = ({
  video,
  onPlay,
  onToggleLike,
  onToggleWatchLater,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { success } = useToast();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.url);
    setCopied(true);
    success('Link copied to clipboard');
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1200);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (confirm(`Remove "${video.title}" from library?`)) {
      onDelete(video.id);
      success('Video removed');
    }
  };

  const getPlatformIcon = () => {
    switch (video.platform) {
      case 'youtube':
        return <YoutubeIcon className="w-3 h-3 text-[#ff0000]" />;
      case 'instagram':
        return <InstagramIcon className="w-3 h-3 text-pink-400" />;
      case 'tiktok':
        return <TikTokIcon className="w-3 h-3 text-cyan-400" />;
      default:
        return <Film className="w-3 h-3 text-zinc-400" />;
    }
  };

  const formattedDate = new Date(video.addedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const channelInitial = video.channel
    ? video.channel.trim().charAt(0).toUpperCase()
    : 'Y';

  return (
    <div
      onClick={() => onPlay(video)}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#181818] transition-colors cursor-pointer border border-transparent hover:border-white/5"
    >
      {/* Left: Thumbnail & Details */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {/* 16:9 Compact Thumbnail */}
        <div className="relative w-36 sm:w-48 aspect-video rounded-xl bg-[#212121] overflow-hidden shrink-0 group/thumb">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <Film className="w-5 h-5 opacity-40" />
            </div>
          )}

          {/* Hover Play Icon Overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>

          {video.duration ? (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-white text-[10px] font-mono font-medium">
              {video.duration}
            </span>
          ) : (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-zinc-300 text-[9px] font-mono uppercase">
              {video.platform}
            </span>
          )}
        </div>

        {/* Video Metadata */}
        <div className="min-w-0 flex-1 py-1">
          <h4 className="text-xs sm:text-sm font-semibold text-[#f1f1f1] group-hover:text-white transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h4>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-[#aaaaaa]">
            <div className="w-4 h-4 rounded-full bg-[#272727] text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">
              {channelInitial}
            </div>
            <span className="truncate max-w-[160px] hover:text-white transition-colors">
              {video.channel || 'YouTube Video'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-zinc-500 text-[11px] capitalize">
              {getPlatformIcon()}
              <span>{video.platform}</span>
            </span>
            <span>•</span>
            <span className="text-zinc-500 text-[11px]">{formattedDate}</span>
          </div>

          {video.notes && (
            <p className="mt-1 text-xs text-zinc-400 italic line-clamp-1">
              "{video.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-center"
      >
        {/* Like */}
        <button
          onClick={() => onToggleLike(video.id)}
          title={video.isLiked ? 'Unlike' : 'Like'}
          className={`p-2 rounded-full transition-colors ${
            video.isLiked
              ? 'text-rose-400 bg-rose-500/15'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Heart className={`w-4 h-4 ${video.isLiked ? 'fill-rose-400' : ''}`} />
        </button>

        {/* Watch Later */}
        <button
          onClick={() => onToggleWatchLater(video.id)}
          title={video.isWatchLater ? 'Remove from Watch Later' : 'Watch Later'}
          className={`p-2 rounded-full transition-colors ${
            video.isWatchLater
              ? 'text-amber-400 bg-amber-500/15'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Clock className="w-4 h-4" />
        </button>

        {/* 3-Dot Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            title="More options"
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 bottom-full mb-1.5 w-44 rounded-xl bg-[#212121]/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.8)] py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors text-left"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>

              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors text-left"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in new tab</span>
              </a>

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
