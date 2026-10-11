import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Heart,
  Clock,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Trash2,
  Film,
  Check
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon, TikTokIcon } from './Icons';
import type { VideoItem } from '../types';
import { zenAudio } from '../lib/audioSynthesizer';
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
    zenAudio.playHapticClick(850, 0.04);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1200);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (confirm(`Remove "${video.title}" from your ZenVault?`)) {
      zenAudio.playHapticClick(350);
      onDelete(video.id);
      success('Video removed from sanctuary');
    }
  };

  const getPlatformIcon = () => {
    switch (video.platform) {
      case 'youtube':
        return <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />;
      case 'instagram':
        return <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />;
      case 'tiktok':
        return <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-[#8B7CFF]" />;
    }
  };

  return (
    <div
      onClick={() => {
        zenAudio.playHapticClick(580);
        onPlay(video);
      }}
      className="group flex items-center justify-between gap-4 p-3 rounded-xl bg-[#11131A] hover:bg-[#141722] border border-white/[0.07] hover:border-[#8B7CFF]/30 transition-all cursor-pointer"
    >
      {/* Left: Thumbnail & Title/Channel */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Compact Thumbnail */}
        <div className="relative w-24 sm:w-32 aspect-video rounded-lg bg-[#08090D] overflow-hidden flex-shrink-0">
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#5E6573]">
              <Film className="w-4 h-4 opacity-40" />
            </div>
          )}

          {/* Hover Play Icon Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>

          {video.duration && (
            <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-black/80 text-white">
              {video.duration}
            </span>
          )}
        </div>

        {/* Video Metadata */}
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-semibold text-[#F4F5FA] group-hover:text-[#8B7CFF] transition-colors truncate">
            {video.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8E95A5] font-mono">
            <span className="truncate max-w-[140px] text-[#8B7CFF]">
              {video.channel || 'Curated'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 uppercase">
              {getPlatformIcon()}
              <span className="text-[10px]">{video.platform}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Badges & Actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2 sm:gap-4 flex-shrink-0"
      >
        {/* Mood Pill (Hidden on mobile) */}
        <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.04] text-[#8E95A5] border border-white/5">
          {video.mood}
        </span>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Like */}
          <button
            onClick={() => {
              zenAudio.playHapticClick(800);
              onToggleLike(video.id);
            }}
            title={video.isLiked ? 'Unlike' : 'Like'}
            className={`p-1.5 rounded-lg transition-colors ${
              video.isLiked
                ? 'text-rose-400 bg-rose-500/15'
                : 'text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.06]'
            }`}
          >
            <Heart className={`w-4 h-4 ${video.isLiked ? 'fill-rose-400' : ''}`} />
          </button>

          {/* Watch Later */}
          <button
            onClick={() => {
              zenAudio.playHapticClick(600);
              onToggleWatchLater(video.id);
            }}
            title={video.isWatchLater ? 'Remove from Watch Later' : 'Watch Later'}
            className={`p-1.5 rounded-lg transition-colors ${
              video.isWatchLater
                ? 'text-amber-400 bg-amber-500/15'
                : 'text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.06]'
            }`}
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* More options menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                zenAudio.playHapticClick(500, 0.02);
                setMenuOpen(!menuOpen);
              }}
              title="More options"
              className="p-1.5 rounded-lg text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.06] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-[#171A23] border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.6)] py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.05] transition-colors text-left"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Link' : 'Copy Video URL'}</span>
                </button>

                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.05] transition-colors text-left"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in new tab</span>
                </a>

                <div className="my-1 border-t border-white/[0.06]" />

                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove from vault</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
