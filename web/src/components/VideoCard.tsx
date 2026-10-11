import React from 'react';
import { Play, Heart, Clock, Trash2, Film, ExternalLink } from 'lucide-react';
import { YoutubeIcon, InstagramIcon, TikTokIcon } from './Icons';
import type { VideoItem } from '../types';
import { zenAudio } from '../lib/audioSynthesizer';

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
  onDelete
}) => {
  const getPlatformIcon = () => {
    switch (video.platform) {
      case 'youtube':
        return <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />;
      case 'instagram':
        return <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />;
      case 'tiktok':
        return <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getPlatformBadgeColor = () => {
    switch (video.platform) {
      case 'youtube':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'instagram':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
      case 'tiktok':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
  };

  const formattedDate = new Date(video.addedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="group relative flex flex-col ios-card overflow-hidden">
      
      {/* Thumbnail Container */}
      <div 
        onClick={() => { zenAudio.playHapticClick(580); onPlay(video); }}
        className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer rounded-t-[23px]"
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-500">
            <Film className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-[11px] font-mono tracking-wider uppercase">Zen Media Clip</span>
          </div>
        )}

        {/* Ambient Film Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080e] via-black/20 to-black/40 opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

        {/* Platform Badge (Top Left) */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider backdrop-blur-xl border ${getPlatformBadgeColor()} shadow-sm`}>
            {getPlatformIcon()}
            <span>{video.platform}</span>
          </span>
        </div>

        {/* Duration / Source Tag (Top Right) */}
        {video.duration && (
          <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 backdrop-blur-xl text-white border border-white/15 shadow-sm">
            {video.duration}
          </div>
        )}

        {/* Apple VisionOS Frosted Play Button (Center) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-13 h-13 rounded-full bg-white/20 text-white flex items-center justify-center border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out">
            <Play className="w-5 h-5 ml-0.5 fill-white text-white drop-shadow" />
          </div>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-[#06080e]/40 rounded-b-[23px]">
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
            <span className="uppercase tracking-widest text-indigo-400 font-semibold truncate max-w-[170px]">
              {video.channel || 'Curated'}
            </span>
            <span className="text-slate-500">{formattedDate}</span>
          </div>

          <h3 
            onClick={() => { zenAudio.playHapticClick(580); onPlay(video); }}
            className="text-sm font-semibold text-white line-clamp-2 hover:text-indigo-300 cursor-pointer transition-colors leading-snug"
            title={video.title}
          >
            {video.title}
          </h3>

          {video.notes && (
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-1 italic font-normal">
              "{video.notes}"
            </p>
          )}
        </div>

        {/* Tactical Bottom Toolbar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          {/* Mood Pill */}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.06] text-slate-300 border border-white/10 backdrop-blur-md">
            {video.mood}
          </span>

          {/* iOS Frosted Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { zenAudio.playHapticClick(800); onToggleLike(video.id); }}
              title={video.isLiked ? 'Unlike' : 'Like'}
              className={`p-2 rounded-full transition-all ${
                video.isLiked
                  ? 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${video.isLiked ? 'fill-rose-400' : ''}`} />
            </button>

            <button
              onClick={() => { zenAudio.playHapticClick(600); onToggleWatchLater(video.id); }}
              title={video.isWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
              className={`p-2 rounded-full transition-all ${
                video.isWatchLater
                  ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
            </button>

            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open source URL"
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => {
                if (confirm(`Remove "${video.title}" from your ZenVault?`)) {
                  zenAudio.playHapticClick(350);
                  onDelete(video.id);
                }
              }}
              title="Delete video"
              className="p-2 rounded-full text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-all border border-transparent"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
