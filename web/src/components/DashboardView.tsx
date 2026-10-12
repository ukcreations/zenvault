import React from 'react';
import {
  Film,
  Heart,
  Clock,
  ArrowRight,
  Plus,
  Compass
} from 'lucide-react';
import { YoutubeIcon } from './Icons';
import type { VideoItem } from '../types';
import type { GoogleUserProfile } from '../lib/googleAuth';
import { VideoCard } from './VideoCard';

interface DashboardViewProps {
  videos: VideoItem[];
  googleUser: GoogleUserProfile | null;
  onSelectView: (view: 'all' | 'liked' | 'watch-later') => void;
  onOpenAddModal: () => void;
  onOpenYouTubeSync: () => void;
  onPlayVideo: (video: VideoItem) => void;
  onToggleLike?: (id: string) => void;
  onToggleWatchLater?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  videos,
  googleUser,
  onSelectView,
  onOpenAddModal,
  onOpenYouTubeSync,
  onPlayVideo,
  onToggleLike = () => {},
  onToggleWatchLater = () => {},
  onDelete = () => {},
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalVideos = videos.length;
  const likedCount = videos.filter((v) => v.isLiked).length;
  const watchLaterCount = videos.filter((v) => v.isWatchLater).length;
  const recentVideos = [...videos]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 6);

  const firstName = googleUser?.name ? googleUser.name.split(' ')[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Welcome Header */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-[#181818] border border-white/10 overflow-hidden shadow-xl">
        {/* Subtle Frosted Reflection */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider text-zinc-300 bg-white/5 border border-white/10 mb-3.5">
            <span className="w-2 h-2 rounded-full bg-[#ff0000] shadow-[0_0_8px_#ff0000]" />
            <span>REWATCH EVERYWHERE • AD-FREE VIDEO VAULT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#f1f1f1]">
            {getGreeting()}
            {firstName ? `, ${firstName}` : ''}.
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#aaaaaa] leading-relaxed">
            Your clean, distraction-free video sanctuary. Browse your saved and liked videos without algorithmic rabbit holes, ads, or toxic comments.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="btn-primary flex items-center gap-2 px-5 py-2 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add Video</span>
            </button>

            <button
              onClick={onOpenYouTubeSync}
              className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs font-semibold"
            >
              <YoutubeIcon className="w-4 h-4 text-[#ff0000]" />
              <span>Sync YouTube Liked Videos</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Metrics (3 Balanced Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Videos */}
        <div
          onClick={() => onSelectView('all')}
          className="p-5 rounded-xl bg-[#181818] hover:bg-[#212121] border border-white/10 hover:border-white/20 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#aaaaaa] tracking-wider font-semibold">
              TOTAL VIDEOS
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-300 group-hover:text-white transition-colors">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#f1f1f1]">
              {totalVideos}
            </span>
            <span className="text-xs text-[#aaaaaa]">saved</span>
          </div>
          <p className="mt-2 text-[11px] text-[#717171]">Across YouTube, Instagram & Web</p>
        </div>

        {/* Liked Videos */}
        <div
          onClick={() => onSelectView('liked')}
          className="p-5 rounded-xl bg-[#181818] hover:bg-[#212121] border border-white/10 hover:border-white/20 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#aaaaaa] tracking-wider font-semibold">
              LIKED VIDEOS
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4 fill-rose-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#f1f1f1]">
              {likedCount}
            </span>
            <span className="text-xs text-[#aaaaaa]">favorites</span>
          </div>
          <p className="mt-2 text-[11px] text-[#717171]">Curated favorite videos</p>
        </div>

        {/* Watch Later */}
        <div
          onClick={() => onSelectView('watch-later')}
          className="p-5 rounded-xl bg-[#181818] hover:bg-[#212121] border border-white/10 hover:border-white/20 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#aaaaaa] tracking-wider font-semibold">
              WATCH LATER
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#f1f1f1]">
              {watchLaterCount}
            </span>
            <span className="text-xs text-[#aaaaaa]">queued</span>
          </div>
          <p className="mt-2 text-[11px] text-[#717171]">Queued for your next session</p>
        </div>
      </div>

      {/* Recently Added Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#f1f1f1]">
              Recently Saved
            </h2>
            <p className="text-xs text-[#aaaaaa]">Latest additions to your sanctuary</p>
          </div>

          {videos.length > 0 && (
            <button
              onClick={() => onSelectView('all')}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <span>View full library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={onPlayVideo}
                onToggleLike={onToggleLike}
                onToggleWatchLater={onToggleWatchLater}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          /* Empty Sanctuary State */
          <div className="p-12 rounded-2xl bg-[#181818] border border-white/10 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 mb-4">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-[#f1f1f1] mb-1">
              Your Library is Peaceful & Empty
            </h3>
            <p className="text-xs text-[#aaaaaa] max-w-sm mb-6 leading-relaxed">
              Start by syncing your YouTube Liked videos or pasting URLs of videos and reels you wish to keep.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenYouTubeSync}
                className="btn-primary flex items-center gap-2 px-5 py-2 text-xs font-bold"
              >
                <YoutubeIcon className="w-3.5 h-3.5 text-[#ff0000]" />
                <span>Sync YouTube Liked Videos</span>
              </button>
              <button
                onClick={onOpenAddModal}
                className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Paste Video Link</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
