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

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  onToggleLike: (id: string) => void;
  onToggleWatchLater: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
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
    <div className="group flex flex-col relative w-full">
      {/* 16:9 Thumbnail Container */}
      <div
        onClick={() => onPlay(video)}
        className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#212121] cursor-pointer select-none group/thumb transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/thumb:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#181818] text-zinc-500">
            <Film className="w-8 h-8 opacity-40 mb-1" />
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-600">Video</span>
          </div>
        )}

        {/* Hover Center Play Pill */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg transform scale-90 group-hover/thumb:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 ml-0.5 fill-white" />
          </div>
        </div>

        {/* Floating Quick Action Icons (Top Right on Hover) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 z-10"
        >
          {/* Quick Watch Later */}
          <button
            onClick={() => onToggleWatchLater(video.id)}
            title={video.isWatchLater ? 'Remove from Watch Later' : 'Watch later'}
            className={`w-7 h-7 rounded-md flex items-center justify-center backdrop-blur-md transition-all shadow-md ${
              video.isWatchLater
                ? 'bg-amber-500 text-black'
                : 'bg-black/75 text-white hover:bg-white hover:text-black border border-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          {/* Quick Like */}
          <button
            onClick={() => onToggleLike(video.id)}
            title={video.isLiked ? 'Unlike' : 'Like'}
            className={`w-7 h-7 rounded-md flex items-center justify-center backdrop-blur-md transition-all shadow-md ${
              video.isLiked
                ? 'bg-rose-500 text-white'
                : 'bg-black/75 text-white hover:bg-white hover:text-black border border-white/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${video.isLiked ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Duration Badge (Bottom Right, authentic YouTube style) */}
        {video.duration ? (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-sm text-white text-[11px] font-medium font-mono tracking-tight pointer-events-none">
            {video.duration}
          </span>
        ) : (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-sm text-zinc-300 text-[10px] font-medium font-mono uppercase tracking-tight pointer-events-none">
            {video.platform}
          </span>
        )}
      </div>

      {/* Video Metadata Block (Authentic YouTube layout below thumbnail) */}
      <div className="mt-3 flex items-start gap-3">
        {/* Channel Avatar Circle */}
        <div
          onClick={() => onPlay(video)}
          className="w-9 h-9 rounded-full bg-[#272727] text-zinc-300 shrink-0 flex items-center justify-center font-bold text-xs ring-1 ring-white/10 overflow-hidden cursor-pointer hover:ring-white/30 transition-all select-none"
        >
          {channelInitial}
        </div>

        {/* Middle Metadata Column */}
        <div className="min-w-0 flex-1">
          {/* Video Title */}
          <h3
            onClick={() => onPlay(video)}
            className="text-sm font-semibold text-[#f1f1f1] group-hover:text-white line-clamp-2 leading-snug cursor-pointer transition-colors"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Channel Name */}
          <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#aaaaaa]">
            <span
              onClick={() => onPlay(video)}
              className="hover:text-white truncate cursor-pointer transition-colors font-normal"
            >
              {video.channel || 'YouTube Video'}
            </span>
          </div>

          {/* Subtitle / Timestamp & Platform */}
          <div className="flex items-center gap-1.5 text-[12px] text-[#717171] mt-0.5">
            <span>Saved {formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1 capitalize">
              {getPlatformIcon()}
              <span>{video.platform}</span>
            </span>
          </div>

          {/* Notes if present */}
          {video.notes && (
            <p className="mt-1 text-xs text-zinc-400 italic line-clamp-1 font-normal">
              "{video.notes}"
            </p>
          )}
        </div>

        {/* 3-Dots Dropdown Trigger */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            title="Action menu"
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* YouTube Frosted Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-[#212121]/95 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors text-left"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>

              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors text-left"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in {video.platform}</span>
              </a>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatchLater(video.id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors text-left"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{video.isWatchLater ? 'Remove from Watch Later' : 'Save to Watch Later'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike(video.id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors text-left"
              >
                <Heart className={`w-3.5 h-3.5 ${video.isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{video.isLiked ? 'Remove from Liked' : 'Add to Liked'}</span>
              </button>

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove from library</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
