import React from 'react';
import {
  Film,
  Heart,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  Volume2
} from 'lucide-react';
import { YoutubeIcon } from './Icons';
import type { VideoItem, SoundscapeType } from '../types';
import type { GoogleUserProfile } from '../lib/googleAuth';
import { zenAudio } from '../lib/audioSynthesizer';

interface DashboardViewProps {
  videos: VideoItem[];
  googleUser: GoogleUserProfile | null;
  onSelectView: (view: 'all' | 'liked' | 'watch-later') => void;
  onOpenAddModal: () => void;
  onOpenYouTubeSync: () => void;
  onPlayVideo: (video: VideoItem) => void;
  activeSoundscape: SoundscapeType;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  videos,
  googleUser,
  onSelectView,
  onOpenAddModal,
  onOpenYouTubeSync,
  onPlayVideo,
  activeSoundscape,
}) => {
  // Determine greeting based on current local hour
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
      <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#11131A] via-[#141620] to-[#0D0F15] border border-white/[0.08] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Subtle Ambient Accent Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B7CFF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-[#8B7CFF] bg-[#8B7CFF]/10 border border-[#8B7CFF]/20 mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF] animate-pulse" />
            <span>DISTRACTION-FREE MEDIA SANCTUARY</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F4F5FA] font-display">
            {getGreeting()}
            {firstName ? `, ${firstName}` : ''}.
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#8E95A5] leading-relaxed">
            Your private repository of intentional media. No infinite feeds, no algorithmic rabbit holes, and no toxic comment sections. Only the content you chose to save.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                zenAudio.playHapticClick(700);
                onOpenAddModal();
              }}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Curate New Video</span>
            </button>

            <button
              onClick={() => {
                zenAudio.playHapticClick(650);
                onOpenYouTubeSync();
              }}
              className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            >
              <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />
              <span>Sync YouTube Stashes</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Metrics (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Videos */}
        <div
          onClick={() => {
            zenAudio.playHapticClick(600, 0.02);
            onSelectView('all');
          }}
          className="p-5 rounded-xl bg-[#11131A] hover:bg-[#141722] border border-white/[0.07] hover:border-white/[0.12] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#8E95A5] tracking-wider font-semibold">
              TOTAL STASHES
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-[#8E95A5] group-hover:text-[#8B7CFF] transition-colors">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#F4F5FA] font-display">
              {totalVideos}
            </span>
            <span className="text-xs text-[#8E95A5]">saved videos</span>
          </div>
          <p className="mt-2 text-[11px] text-[#5E6573]">Across YouTube, Instagram & Web</p>
        </div>

        {/* Liked Videos */}
        <div
          onClick={() => {
            zenAudio.playHapticClick(600, 0.02);
            onSelectView('liked');
          }}
          className="p-5 rounded-xl bg-[#11131A] hover:bg-[#141722] border border-white/[0.07] hover:border-white/[0.12] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#8E95A5] tracking-wider font-semibold">
              LIKED STASHES
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#F4F5FA] font-display">
              {likedCount}
            </span>
            <span className="text-xs text-[#8E95A5]">favorites</span>
          </div>
          <p className="mt-2 text-[11px] text-[#5E6573]">Curated top-tier gems</p>
        </div>

        {/* Watch Later */}
        <div
          onClick={() => {
            zenAudio.playHapticClick(600, 0.02);
            onSelectView('watch-later');
          }}
          className="p-5 rounded-xl bg-[#11131A] hover:bg-[#141722] border border-white/[0.07] hover:border-white/[0.12] cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#8E95A5] tracking-wider font-semibold">
              WATCH LATER
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#F4F5FA] font-display">
              {watchLaterCount}
            </span>
            <span className="text-xs text-[#8E95A5]">queued</span>
          </div>
          <p className="mt-2 text-[11px] text-[#5E6573]">Ready for your next deep focus</p>
        </div>

        {/* Ambient Soundscape */}
        <div className="p-5 rounded-xl bg-[#11131A] border border-white/[0.07] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#8E95A5] tracking-wider font-semibold">
              SOUND ENGINE
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#8B7CFF]/10 flex items-center justify-center text-[#8B7CFF]">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#F4F5FA] font-display capitalize">
              {activeSoundscape === 'off' ? 'Muted' : activeSoundscape}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#5E6573]">
            {activeSoundscape === 'off' ? 'Zero background distractions' : 'Procedural sound synthesis active'}
          </p>
        </div>
      </div>

      {/* Recently Curated Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#F4F5FA] font-display">
              Recently Stashed
            </h2>
            <p className="text-xs text-[#8E95A5]">Your latest intentional additions</p>
          </div>

          {videos.length > 0 && (
            <button
              onClick={() => {
                zenAudio.playHapticClick(600, 0.02);
                onSelectView('all');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#8B7CFF] hover:text-[#9D90FF] transition-colors"
            >
              <span>View full library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  zenAudio.playHapticClick(580);
                  onPlayVideo(video);
                }}
                className="group relative flex flex-col rounded-xl bg-[#11131A] hover:bg-[#141722] border border-white/[0.07] hover:border-[#8B7CFF]/30 overflow-hidden cursor-pointer transition-all duration-300 shadow-sm"
              >
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-video w-full bg-[#08090D] overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#5E6573]">
                      <Film className="w-8 h-8 opacity-40 mb-1" />
                    </div>
                  )}

                  {/* Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#11131A] via-transparent to-transparent opacity-80" />

                  {/* Platform indicator */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-black/60 backdrop-blur-md text-[#F4F5FA] border border-white/10">
                    {video.platform}
                  </span>

                  {video.duration && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/70 text-white backdrop-blur-md">
                      {video.duration}
                    </span>
                  )}

                  {/* Hover Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-11 h-11 rounded-full bg-[#8B7CFF] text-[#08090D] flex items-center justify-center shadow-[0_4px_20px_rgba(139,124,255,0.6)] transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-4 h-4 ml-0.5 fill-[#08090D]" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <p className="text-[11px] font-mono text-[#8B7CFF] font-medium truncate mb-1">
                      {video.channel || 'Curated'}
                    </p>
                    <h3 className="text-xs font-semibold text-[#F4F5FA] line-clamp-2 leading-snug group-hover:text-[#8B7CFF] transition-colors">
                      {video.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-[10px] text-[#5E6573] font-mono">
                    <span className="capitalize">{video.mood}</span>
                    <span>{new Date(video.addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Sanctuary State */
          <div className="p-12 rounded-2xl bg-[#11131A] border border-white/[0.07] text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#8B7CFF]/10 border border-[#8B7CFF]/20 flex items-center justify-center text-[#8B7CFF] mb-4">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-[#F4F5FA] font-display mb-1">
              Your Sanctuary is Peaceful & Empty
            </h3>
            <p className="text-xs text-[#8E95A5] max-w-sm mb-6 leading-relaxed">
              Start by syncing your YouTube Liked videos or pasting URLs of reels, talks, or lofi streams you wish to keep.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  zenAudio.playHapticClick(700);
                  onOpenYouTubeSync();
                }}
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
                <span>Sync YouTube Liked Videos</span>
              </button>
              <button
                onClick={() => {
                  zenAudio.playHapticClick(650);
                  onOpenAddModal();
                }}
                className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
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
