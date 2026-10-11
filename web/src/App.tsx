import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Compass,
  Plus
} from 'lucide-react';
import type { VideoItem, MoodType, Platform, SoundscapeType } from './types';
import {
  getSavedVideos,
  addVideo,
  removeVideo,
  toggleLiked,
  toggleWatchLater,
  saveVideosToStorage
} from './lib/storage';
import { Navbar } from './components/Navbar';
import { VideoCard } from './components/VideoCard';
import { ZenPlayer } from './components/ZenPlayer';
import { MoodFilterBar } from './components/MoodFilterBar';
import { AddMediaModal } from './components/AddMediaModal';
import { YouTubeSyncModal } from './components/YouTubeSyncModal';
import { AmbientAudioPlayer } from './components/AmbientAudioPlayer';
import { ExtensionBridgeBanner } from './components/ExtensionBridgeBanner';
import { FluidCanvas } from './components/FluidCanvas';
import { HeroSanctuary } from './components/HeroSanctuary';
import { zenAudio } from './lib/audioSynthesizer';
import { toGoogleProfile, PENDING_YT_SYNC_KEY } from './lib/googleAuth';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { pullCloudVideos, pushVideo, pushVideos, deleteCloudVideo } from './lib/cloudSync';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  // State
  const [videos, setVideos] = useState<VideoItem[]>(() => getSavedVideos());
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'liked' | 'watch-later'>('all');
  const [selectedMood, setSelectedMood] = useState<MoodType>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>('off');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isYTSyncOpen, setIsYTSyncOpen] = useState(false);

  // Google/Supabase auth session - the single source of truth for sign-in state
  const [session, setSession] = useState<Session | null>(null);
  const [autoSyncPending, setAutoSyncPending] = useState(false);
  const googleUser = useMemo(() => toGoogleProfile(session?.user ?? null), [session]);
  const userId = session?.user?.id;

  // Chrome Extension Bridge State
  const [extensionLinked, setExtensionLinked] = useState(false);
  const [queuedExtensionVideos, setQueuedExtensionVideos] = useState<VideoItem[]>([]);

  // Bootstrap the Supabase session and detect the OAuth redirect coming back.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkPendingSync = (activeSession: Session | null) => {
      if (activeSession && localStorage.getItem(PENDING_YT_SYNC_KEY)) {
        setIsYTSyncOpen(true);
        setAutoSyncPending(true);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      checkPendingSync(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      checkPendingSync(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // On login, merge the cloud library with whatever's local, then push
  // anything that only existed locally up to the cloud so it follows the
  // account to other devices too.
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const cloudVideos = await pullCloudVideos(userId);
        setVideos((prevLocal) => {
          const byUrl = new Map<string, VideoItem>();
          for (const v of cloudVideos) byUrl.set(v.url, v);

          const localOnly: VideoItem[] = [];
          for (const v of prevLocal) {
            if (!byUrl.has(v.url)) {
              byUrl.set(v.url, v);
              localOnly.push(v);
            }
          }

          const merged = Array.from(byUrl.values()).sort(
            (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
          );
          saveVideosToStorage(merged);

          if (localOnly.length > 0) {
            pushVideos(userId, localOnly).catch((err) => console.warn('Cloud sync push failed:', err));
          }

          return merged;
        });
      } catch (err) {
        console.warn('Cloud sync pull failed:', err);
      }
    })();
  }, [userId]);

  // 1. Connect to Chrome Extension Bridge via postMessage
  useEffect(() => {
    const handleExtensionMessages = (event: MessageEvent) => {
      if (event.source !== window || !event.data) return;

      if (event.data.type === 'ZENVAULT_EXTENSION_PONG' || event.data.type === 'ZENVAULT_EXTENSION_READY') {
        setExtensionLinked(true);
        if (event.data.videos && Array.isArray(event.data.videos)) {
          // Find clips not yet in local storage
          const currentUrls = new Set(videos.map(v => v.url));
          const newClips = event.data.videos.filter((v: VideoItem) => !currentUrls.has(v.url));
          setQueuedExtensionVideos(newClips);
        }
      }

      if (event.data.type === 'ZENVAULT_ITEM_SYNCED_FROM_EXTENSION') {
        const item: VideoItem = event.data.payload;
        setVideos(prev => {
          if (prev.some(v => v.url === item.url)) return prev;
          const updated = [item, ...prev];
          saveVideosToStorage(updated);
          return updated;
        });
        zenAudio.playHapticClick(900, 0.05);
      }
    };

    window.addEventListener('message', handleExtensionMessages);

    // Ping extension
    window.postMessage({ type: 'ZENVAULT_EXTENSION_PING' }, '*');

    return () => window.removeEventListener('message', handleExtensionMessages);
  }, [videos]);

  // Handlers
  const handleAddVideo = (video: VideoItem) => {
    const updated = addVideo(video);
    setVideos(updated);
    if (userId) pushVideo(userId, video).catch((err) => console.warn('Cloud sync failed:', err));
  };

  const handleBulkAdd = (newVideos: VideoItem[]) => {
    const existingUrls = new Set(videos.map(v => v.url));
    const added = newVideos.filter(v => !existingUrls.has(v.url));
    const current = [...added, ...videos];
    saveVideosToStorage(current);
    setVideos(current);
    if (userId && added.length > 0) {
      pushVideos(userId, added).catch((err) => console.warn('Cloud sync failed:', err));
    }
  };

  const handleDelete = (id: string) => {
    const updated = removeVideo(id);
    setVideos(updated);
    if (activeVideo?.id === id) setActiveVideo(null);
    if (userId) deleteCloudVideo(userId, id).catch((err) => console.warn('Cloud sync failed:', err));
  };

  const handleToggleLike = (id: string) => {
    const updated = toggleLiked(id);
    setVideos(updated);
    if (activeVideo?.id === id) {
      setActiveVideo(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
    }
    if (userId) {
      const changed = updated.find(v => v.id === id);
      if (changed) pushVideo(userId, changed).catch((err) => console.warn('Cloud sync failed:', err));
    }
  };

  const handleToggleWatchLater = (id: string) => {
    const updated = toggleWatchLater(id);
    setVideos(updated);
    if (activeVideo?.id === id) {
      setActiveVideo(prev => prev ? { ...prev, isWatchLater: !prev.isWatchLater } : null);
    }
    if (userId) {
      const changed = updated.find(v => v.id === id);
      if (changed) pushVideo(userId, changed).catch((err) => console.warn('Cloud sync failed:', err));
    }
  };

  const handleImportExtensionStash = () => {
    if (queuedExtensionVideos.length === 0) return;
    handleBulkAdd(queuedExtensionVideos);
    setQueuedExtensionVideos([]);
    confetti({ particleCount: 50, spread: 70 });
    zenAudio.playHapticClick(800, 0.1);
    window.postMessage({ type: 'ZENVAULT_CLEAR_EXTENSION_STORAGE' }, '*');
  };

  // Filtered List - most recently added/liked always shown first
  const filteredVideos = useMemo(() => {
    return videos
      .filter(v => {
        // Filter tab
        if (activeFilter === 'liked' && !v.isLiked) return false;
        if (activeFilter === 'watch-later' && !v.isWatchLater) return false;

        // Mood
        if (selectedMood !== 'all' && v.mood !== selectedMood) return false;

        // Platform
        if (selectedPlatform !== 'all' && v.platform !== selectedPlatform) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = v.title.toLowerCase().includes(q);
          const matchesChannel = v.channel?.toLowerCase().includes(q);
          const matchesNotes = v.notes?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesChannel && !matchesNotes) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [videos, activeFilter, selectedMood, selectedPlatform, searchQuery]);

  // Playlist Navigation in Cinema Mode
  const activeVideoIndex = useMemo(() => {
    if (!activeVideo) return -1;
    return filteredVideos.findIndex(v => v.id === activeVideo.id);
  }, [activeVideo, filteredVideos]);

  const handleNextVideo = () => {
    if (activeVideoIndex >= 0 && activeVideoIndex < filteredVideos.length - 1) {
      setActiveVideo(filteredVideos[activeVideoIndex + 1]);
    } else if (filteredVideos.length > 0) {
      setActiveVideo(filteredVideos[0]);
    }
  };

  const handlePrevVideo = () => {
    if (activeVideoIndex > 0) {
      setActiveVideo(filteredVideos[activeVideoIndex - 1]);
    } else if (filteredVideos.length > 0) {
      setActiveVideo(filteredVideos[filteredVideos.length - 1]);
    }
  };

  const totalLiked = videos.filter(v => v.isLiked).length;
  const totalWatchLater = videos.filter(v => v.isWatchLater).length;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* 60FPS Interactive Fluid Chromatic Canvas */}
      <FluidCanvas />

      {/* Living Ambient Underglow Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[15%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/15 blur-[130px]" />
        <div className="absolute top-[40%] -right-[15%] w-[45vw] h-[45vw] rounded-full bg-violet-900/15 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-sky-900/15 blur-[130px]" />
      </div>

      {/* Navigation */}
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenYouTubeSync={() => setIsYTSyncOpen(true)}
        totalCount={videos.length}
        likedCount={totalLiked}
        watchLaterCount={totalWatchLater}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeSoundscape={activeSoundscape}
        setActiveSoundscape={setActiveSoundscape}
        extensionLinked={extensionLinked}
        onImportFromExtension={handleImportExtensionStash}
        googleUser={googleUser}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        
        {/* iOS / VisionOS Inspired Hero Sanctuary */}
        <HeroSanctuary
          totalCount={videos.length}
          filteredCount={filteredVideos.length}
          onStartCinema={() => {
            if (filteredVideos.length > 0) {
              zenAudio.playHapticClick(700);
              setActiveVideo(filteredVideos[0]);
            }
          }}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Extension Bridge Notification Banner */}
        <ExtensionBridgeBanner
          extensionLinked={extensionLinked}
          queuedExtensionCount={queuedExtensionVideos.length}
          onImportQueued={handleImportExtensionStash}
          onOpenExtensionGuide={() => setIsAddModalOpen(true)}
        />

        {/* Mood & Platform Filters */}
        <div className="mb-8">
          <MoodFilterBar
            selectedMood={selectedMood}
            onSelectMood={setSelectedMood}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Video Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={(v) => setActiveVideo(v)}
                onToggleLike={handleToggleLike}
                onToggleWatchLater={handleToggleWatchLater}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center ios-card rounded-3xl my-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-400/25 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_24px_rgba(99,102,241,0.2)]">
              <Compass className="w-8 h-8 animate-pulse text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">No videos match this filter</h3>
            <p className="text-xs sm:text-sm text-slate-300/80 max-w-md mb-6 leading-relaxed">
              {searchQuery
                ? `No clips found matching "${searchQuery}". Try a different keyword or reset filters.`
                : 'Your sanctuary is quiet. Add a YouTube or Instagram reel URL, or sync with your YouTube account.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedMood('all');
                  setSelectedPlatform('all');
                  setActiveFilter('all');
                  setSearchQuery('');
                  zenAudio.playHapticClick(600);
                }}
                className="ios-btn-glass px-5 py-2.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => {
                  zenAudio.playHapticClick(700);
                  setIsAddModalOpen(true);
                }}
                className="ios-btn-primary px-5 py-2.5 rounded-full text-xs font-semibold text-white flex items-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.35)]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Video</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#07090e]/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ZENVAULT • ZERO ALGORITHMIC INTERFERENCE</span>
          <span>CURATED PRIVATE MEDIA RETREAT</span>
        </div>
      </footer>

      {/* Fullscreen Zen Cinema Player */}
      <ZenPlayer
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
        onNext={handleNextVideo}
        onPrev={handlePrevVideo}
        onToggleLike={handleToggleLike}
        onToggleWatchLater={handleToggleWatchLater}
        activeSoundscape={activeSoundscape}
        setActiveSoundscape={setActiveSoundscape}
      />

      {/* Floating Ambient Sound Dock */}
      <AmbientAudioPlayer
        activeSoundscape={activeSoundscape}
        setActiveSoundscape={setActiveSoundscape}
      />

      {/* Add Media Modal */}
      <AddMediaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddVideo={handleAddVideo}
        onBulkAdd={handleBulkAdd}
      />

      {/* YouTube Sync Modal */}
      <YouTubeSyncModal
        isOpen={isYTSyncOpen}
        onClose={() => {
          setIsYTSyncOpen(false);
          setAutoSyncPending(false);
          localStorage.removeItem(PENDING_YT_SYNC_KEY);
        }}
        session={session}
        autoSyncOnOpen={autoSyncPending}
        onAutoSyncHandled={() => {
          setAutoSyncPending(false);
          localStorage.removeItem(PENDING_YT_SYNC_KEY);
        }}
        onSyncComplete={handleBulkAdd}
      />

    </div>
  );
};

export default App;
