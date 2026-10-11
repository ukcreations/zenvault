import React, { useState, useEffect, useMemo } from 'react';
import { 
  Film, 
  ShieldCheck, 
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
import { zenAudio } from './lib/audioSynthesizer';
import { getStoredUserProfile } from './lib/googleAuth';
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
  const [googleUser, setGoogleUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('zenvault_google_user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Chrome Extension Bridge State
  const [extensionLinked, setExtensionLinked] = useState(false);
  const [queuedExtensionVideos, setQueuedExtensionVideos] = useState<VideoItem[]>([]);

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
  };

  const handleBulkAdd = (newVideos: VideoItem[]) => {
    let current = [...videos];
    for (const v of newVideos) {
      if (!current.some(existing => existing.url === v.url)) {
        current = [v, ...current];
      }
    }
    saveVideosToStorage(current);
    setVideos(current);
  };

  const handleDelete = (id: string) => {
    const updated = removeVideo(id);
    setVideos(updated);
    if (activeVideo?.id === id) setActiveVideo(null);
  };

  const handleToggleLike = (id: string) => {
    const updated = toggleLiked(id);
    setVideos(updated);
    if (activeVideo?.id === id) {
      setActiveVideo(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
    }
  };

  const handleToggleWatchLater = (id: string) => {
    const updated = toggleWatchLater(id);
    setVideos(updated);
    if (activeVideo?.id === id) {
      setActiveVideo(prev => prev ? { ...prev, isWatchLater: !prev.isWatchLater } : null);
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

  // Filtered List
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
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
    });
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Living Ambient Underglow Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[15%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/10 blur-[130px]" />
        <div className="absolute top-[40%] -right-[15%] w-[45vw] h-[45vw] rounded-full bg-violet-900/10 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[130px]" />
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
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        
        {/* Zen Sanctuary Hero Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/8 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>DISTRACTION-FREE MEDIA SANCTUARY</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
              Watch only what you chose to save.
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-xl">
              Zero algorithmic rabbit holes. Zero toxic comment sections. No infinite feeds.
              Just your saved reels, liked videos, and curated tranquil stashes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (filteredVideos.length > 0) {
                  zenAudio.playHapticClick(700);
                  setActiveVideo(filteredVideos[0]);
                }
              }}
              disabled={filteredVideos.length === 0}
              className="tactile-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold disabled:opacity-40 transition-all shadow-sm"
            >
              <Film className="w-4 h-4 text-indigo-400" />
              <span>Cinema Mode ({filteredVideos.length})</span>
            </button>
          </div>
        </div>

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
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center liquid-crystal-panel border border-white/10 rounded-3xl my-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Compass className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No videos match this filter</h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
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
                }}
                className="tactile-btn px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="tactile-btn px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg flex items-center gap-2"
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
          setGoogleUser(getStoredUserProfile());
        }}
        onSyncComplete={(newVideos) => {
          handleBulkAdd(newVideos);
          setGoogleUser(getStoredUserProfile());
        }}
      />

    </div>
  );
};

export default App;
