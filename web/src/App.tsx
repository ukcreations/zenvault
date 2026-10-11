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
import { Sidebar, type NavView } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { VideoCard } from './components/VideoCard';
import { VideoRow } from './components/VideoRow';
import { MoodFilterBar } from './components/MoodFilterBar';
import { ZenPlayer } from './components/ZenPlayer';
import { AddMediaModal } from './components/AddMediaModal';
import { YouTubeSyncModal } from './components/YouTubeSyncModal';
import { ToastProvider, useToast } from './components/Toast';
import { zenAudio } from './lib/audioSynthesizer';
import { toGoogleProfile, signOutGoogle, PENDING_YT_SYNC_KEY } from './lib/googleAuth';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { pullCloudVideos, pushVideo, pushVideos, deleteCloudVideo } from './lib/cloudSync';

const MainApp: React.FC = () => {
  // State
  const [videos, setVideos] = useState<VideoItem[]>(() => getSavedVideos());
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeType>('off');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isYTSyncOpen, setIsYTSyncOpen] = useState(false);

  // Google/Supabase auth session
  const [session, setSession] = useState<Session | null>(null);
  const [autoSyncPending, setAutoSyncPending] = useState(false);
  const googleUser = useMemo(() => toGoogleProfile(session?.user ?? null), [session]);
  const userId = session?.user?.id;

  // Chrome Extension Bridge State
  const [extensionLinked, setExtensionLinked] = useState(false);

  const { success: toastSuccess } = useToast();

  // Bootstrap Supabase session
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

  // Merge cloud library on login
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

  // Connect to Chrome Extension Bridge via postMessage
  useEffect(() => {
    const handleExtensionMessages = (event: MessageEvent) => {
      if (event.source !== window || !event.data) return;

      if (event.data.type === 'ZENVAULT_EXTENSION_PONG' || event.data.type === 'ZENVAULT_EXTENSION_READY') {
        setExtensionLinked(true);
        if (event.data.videos && Array.isArray(event.data.videos)) {
          const currentUrls = new Set(videos.map(v => v.url));
          const newClips = event.data.videos.filter((v: VideoItem) => !currentUrls.has(v.url));
          if (newClips.length > 0) {
            setVideos(prev => {
              const updated = [...newClips, ...prev];
              saveVideosToStorage(updated);
              return updated;
            });
            toastSuccess('Extension bridge synced', `${newClips.length} clips imported.`);
          }
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
        toastSuccess('Video beamed from extension', item.title);
      }
    };

    window.addEventListener('message', handleExtensionMessages);
    window.postMessage({ type: 'ZENVAULT_EXTENSION_PING' }, '*');
    return () => window.removeEventListener('message', handleExtensionMessages);
  }, [videos, toastSuccess]);

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

  const handleSignOut = async () => {
    await signOutGoogle();
    toastSuccess('Signed out of Google session');
  };

  // Filtered List
  const filteredVideos = useMemo(() => {
    return videos
      .filter(v => {
        if (currentView === 'liked' && !v.isLiked) return false;
        if (currentView === 'watch-later' && !v.isWatchLater) return false;
        if (selectedMood !== 'all' && v.mood !== selectedMood) return false;
        if (selectedPlatform !== 'all' && v.platform !== selectedPlatform) return false;

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
  }, [videos, currentView, selectedMood, selectedPlatform, searchQuery]);

  // Cinema Mode Playlist Navigation
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
    <div className="min-h-screen bg-[#08090D] text-[#F4F5FA] flex flex-col relative selection:bg-[#8B7CFF] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        selectedMood={selectedMood}
        onSelectMood={setSelectedMood}
        totalCount={videos.length}
        likedCount={totalLiked}
        watchLaterCount={totalWatchLater}
        onOpenYouTubeSync={() => setIsYTSyncOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        activeSoundscape={activeSoundscape}
        setActiveSoundscape={setActiveSoundscape}
        googleUser={googleUser}
        onSignOut={handleSignOut}
        extensionLinked={extensionLinked}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset by Sidebar on Desktop) */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all">
        {/* Top Header */}
        <Header
          currentView={currentView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenYouTubeSync={() => setIsYTSyncOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          filteredCount={currentView === 'dashboard' ? videos.length : filteredVideos.length}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'dashboard' ? (
            <DashboardView
              videos={videos}
              googleUser={googleUser}
              onSelectView={setCurrentView}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenYouTubeSync={() => setIsYTSyncOpen(true)}
              onPlayVideo={(v) => setActiveVideo(v)}
              activeSoundscape={activeSoundscape}
            />
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Mood & Platform Filter Controls */}
              <MoodFilterBar
                selectedMood={selectedMood}
                onSelectMood={setSelectedMood}
                selectedPlatform={selectedPlatform}
                onSelectPlatform={setSelectedPlatform}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              {/* Video Collection (Grid or List View) */}
              {filteredVideos.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                  <div className="space-y-2.5">
                    {filteredVideos.map((video) => (
                      <VideoRow
                        key={video.id}
                        video={video}
                        onPlay={(v) => setActiveVideo(v)}
                        onToggleLike={handleToggleLike}
                        onToggleWatchLater={handleToggleWatchLater}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )
              ) : (
                /* Empty filtered view */
                <div className="py-20 px-6 rounded-2xl bg-[#11131A] border border-white/[0.07] text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#8B7CFF]/10 border border-[#8B7CFF]/20 flex items-center justify-center text-[#8B7CFF] mb-4">
                    <Compass className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-[#F4F5FA] font-display mb-1">
                    No videos match this filter
                  </h3>
                  <p className="text-xs text-[#8E95A5] max-w-sm mb-6 leading-relaxed">
                    {searchQuery
                      ? `No stashes found matching "${searchQuery}". Try adjusting your keywords or clearing the filter.`
                      : 'No videos found in this channel yet.'}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedMood('all');
                        setSelectedPlatform('all');
                        setSearchQuery('');
                        zenAudio.playHapticClick(600);
                      }}
                      className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => {
                        zenAudio.playHapticClick(700);
                        setIsAddModalOpen(true);
                      }}
                      className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Video</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Cinema Mode Player */}
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

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
};

export default App;
