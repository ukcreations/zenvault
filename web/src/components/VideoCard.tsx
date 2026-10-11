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

  // Close dropdown menu when clicking outside
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

  const formattedDate = new Date(video.addedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="group relative flex flex-col zen-card">
      {/* 16:9 Thumbnail Container */}
      <div
        onClick={() => {
          zenAudio.playHapticClick(580);
          onPlay(video);
        }}
        className="relative aspect-video w-full bg-[#08090D] overflow-hidden cursor-pointer"
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#11131A] to-[#08090D] text-[#5E6573]">
            <Film className="w-8 h-8 opacity-40 mb-1" />
            <span className="text-[10px] font-mono tracking-wider uppercase">Zen Media</span>
          </div>
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11131A] via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Platform Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold tracking-wider bg-black/70 backdrop-blur-md text-[#F4F5FA] border border-white/10 shadow-sm">
            {getPlatformIcon()}
            <span>{video.platform}</span>
          </span>
        </div>

        {/* Duration Badge (Top Right) */}
        {video.duration && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 backdrop-blur-md text-white border border-white/10 shadow-sm">
            {video.duration}
          </div>
        )}

        {/* Center Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-[#8B7CFF] text-[#08090D] flex items-center justify-center shadow-[0_4px_24px_rgba(139,124,255,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 ml-0.5 fill-[#08090D]" />
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-3 bg-[#11131A]">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8E95A5] mb-1.5">
            <span className="uppercase tracking-wider text-[#8B7CFF] font-semibold truncate max-w-[160px]">
              {video.channel || 'Curated'}
            </span>
            <span className="text-[#5E6573] text-[10px]">{formattedDate}</span>
          </div>

          <h3
            onClick={() => {
              zenAudio.playHapticClick(580);
              onPlay(video);
            }}
            className="text-xs sm:text-sm font-semibold text-[#F4F5FA] line-clamp-2 hover:text-[#8B7CFF] cursor-pointer transition-colors leading-snug"
            title={video.title}
          >
            {video.title}
          </h3>

          {video.notes && (
            <p className="mt-1.5 text-xs text-[#8E95A5] line-clamp-1 italic font-normal">
              "{video.notes}"
            </p>
          )}
        </div>

        {/* Card Footer Toolbar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          {/* Mood Pill */}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] text-[#8E95A5] border border-white/5">
            {video.mood}
          </span>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            {/* Like Button */}
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

            {/* Watch Later Button */}
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

            {/* 3-Dot Dropdown Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  zenAudio.playHapticClick(500, 0.02);
                  setMenuOpen(!menuOpen);
                }}
                title="More options"
                className="p-1.5 rounded-lg text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.06] transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 bottom-full mb-1.5 w-44 rounded-xl bg-[#171A23] border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.6)] py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
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
                    onClick={(e) => e.stopPropagation()}
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
    </div>
  );
};
