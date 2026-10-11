import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  HelpCircle, 
  LogOut, 
  Check, 
  Settings, 
  Heart, 
  ListMusic, 
  ChevronRight,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { YoutubeIcon, GoogleIcon } from './Icons';
import confetti from 'canvas-confetti';
import type { VideoItem } from '../types';
import { 
  getStoredGoogleClientId, 
  setStoredGoogleClientId, 
  getStoredAccessToken, 
  getStoredUserProfile, 
  clearGoogleSession, 
  requestGoogleLogin, 
  fetchGoogleProfile, 
  fetchGoogleLikedVideos, 
  fetchGoogleUserPlaylists, 
  fetchGooglePlaylistVideos,
  type GoogleUserProfile,
  type YouTubePlaylistMeta
} from '../lib/googleAuth';
import { zenAudio } from '../lib/audioSynthesizer';

interface YouTubeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: (videos: VideoItem[]) => void;
}

export const YouTubeSyncModal: React.FC<YouTubeSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete
}) => {
  const [clientId, setClientId] = useState(() => getStoredGoogleClientId());
  const [isEditingClientId, setIsEditingClientId] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredAccessToken());
  const [userProfile, setUserProfile] = useState<GoogleUserProfile | null>(() => getStoredUserProfile());
  const [playlists, setPlaylists] = useState<YouTubePlaylistMeta[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [syncingPlaylistId, setSyncingPlaylistId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If token is already present on open, load profile and playlists
  useEffect(() => {
    if (isOpen && accessToken && !userProfile) {
      loadProfileAndPlaylists(accessToken);
    }
  }, [isOpen, accessToken]);

  if (!isOpen) return null;

  async function loadProfileAndPlaylists(token: string) {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await fetchGoogleProfile(token);
      setUserProfile(profile);

      const userPlaylists = await fetchGoogleUserPlaylists(token);
      setPlaylists(userPlaylists);
    } catch (err: any) {
      console.warn('Could not load profile or playlists:', err);
      clearGoogleSession();
      setAccessToken(null);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Sign In with Google
  const handleGoogleSignIn = () => {
    setError(null);
    setSuccessMsg(null);

    const activeClientId = clientId.trim();
    if (!activeClientId) {
      setIsEditingClientId(true);
      setError('Please provide your Google OAuth 2.0 Client ID to connect.');
      return;
    }

    setStoredGoogleClientId(activeClientId);
    setIsLoading(true);

    requestGoogleLogin(
      activeClientId,
      async (token) => {
        setAccessToken(token);
        zenAudio.playHapticClick(880, 0.08);
        await loadProfileAndPlaylists(token);
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        setError(err.message || 'Google Sign-in was cancelled or failed.');
      }
    );
  };

  // Sync Liked Videos
  const handleSyncLikedVideos = async () => {
    if (!accessToken) return;
    setSyncingPlaylistId('LL');
    setError(null);
    setSuccessMsg(null);

    try {
      const videos = await fetchGoogleLikedVideos(accessToken);
      if (videos.length === 0) {
        setError('No Liked Videos found in your YouTube account.');
        return;
      }
      onSyncComplete(videos);
      confetti({ particleCount: 50, spread: 60 });
      zenAudio.playHapticClick(900, 0.1);
      setSuccessMsg(`Successfully synced ${videos.length} Liked videos!`);
    } catch (err: any) {
      setError(err.message || 'Failed to sync Liked videos.');
    } finally {
      setSyncingPlaylistId(null);
    }
  };

  // Sync specific playlist
  const handleSyncPlaylist = async (playlist: YouTubePlaylistMeta) => {
    if (!accessToken) return;
    setSyncingPlaylistId(playlist.id);
    setError(null);
    setSuccessMsg(null);

    try {
      const videos = await fetchGooglePlaylistVideos(accessToken, playlist.id);
      if (videos.length === 0) {
        setError(`No videos found in playlist "${playlist.title}".`);
        return;
      }
      onSyncComplete(videos);
      confetti({ particleCount: 40, spread: 50 });
      zenAudio.playHapticClick(850, 0.08);
      setSuccessMsg(`Synced ${videos.length} videos from "${playlist.title}"!`);
    } catch (err: any) {
      setError(err.message || `Failed to sync "${playlist.title}".`);
    } finally {
      setSyncingPlaylistId(null);
    }
  };

  const handleSignOut = () => {
    clearGoogleSession();
    setAccessToken(null);
    setUserProfile(null);
    setPlaylists([]);
    setSuccessMsg(null);
    zenAudio.playHapticClick(450, 0.04);
  };

  // Quick Demo fallback
  const handleDemoLiked = () => {
    const demoItems: VideoItem[] = [
      {
        id: 'yt_demo_1',
        url: 'https://www.youtube.com/watch?v=TURbeWK226M',
        title: 'Rain in Kyoto - Old Alleyway Binaural Rain (4K)',
        platform: 'youtube',
        thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
        channel: 'Nomadic Ambience',
        mood: 'chill',
        addedAt: new Date().toISOString(),
        isLiked: true,
        source: 'youtube-sync'
      },
      {
        id: 'yt_demo_2',
        url: 'https://www.youtube.com/watch?v=WPni755-Krg',
        title: 'Night Sky Aurora Borealis over Norwegian Fjords',
        platform: 'youtube',
        thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&auto=format&fit=crop&q=80',
        channel: 'Earth Cinema',
        mood: 'sleep',
        addedAt: new Date().toISOString(),
        isLiked: true,
        source: 'youtube-sync'
      }
    ];
    onSyncComplete(demoItems);
    confetti({ particleCount: 40 });
    zenAudio.playHapticClick(800, 0.05);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col liquid-crystal-panel overflow-hidden border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#07090e]/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <YoutubeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Google & YouTube Sync</h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  READ-ONLY OAUTH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Directly connect your Google account to sync Liked & saved videos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { zenAudio.playHapticClick(); onClose(); }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          
          {/* Feedback messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section: Google Account State */}
          {userProfile && accessToken ? (
            /* Logged in state card */
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {userProfile.picture ? (
                  <img
                    src={userProfile.picture}
                    alt={userProfile.name}
                    className="w-12 h-12 rounded-full border border-indigo-400/50 shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{userProfile.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  </div>
                  <div className="text-xs text-slate-400">{userProfile.email}</div>
                  <div className="text-[10px] font-mono text-indigo-400 mt-0.5">
                    [GOOGLE ACCOUNT CONNECTED]
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="tactile-btn self-start sm:self-center px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            /* Not logged in state -> Direct Sign In Card */
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center shadow-inner">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Direct Google Account Sign-In</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Sign in to your Google Account to stream your YouTube Liked videos and custom playlists into your quiet sanctuary.
                </p>
              </div>

              {/* If Client ID is configured, show 1-click Sign In */}
              {clientId.trim() && !isEditingClientId ? (
                <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="tactile-btn w-full sm:w-auto min-w-[240px] px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin text-base">⏳</span>
                        <span>Connecting with Google...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="w-4 h-4" />
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsEditingClientId(true)}
                    className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 mt-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change OAuth Client ID</span>
                  </button>
                </div>
              ) : (
                /* Client ID Input Box */
                <div className="w-full flex flex-col gap-3 text-left bg-black/40 p-4 rounded-xl border border-indigo-500/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono uppercase text-indigo-300 font-bold flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Google OAuth 2.0 Client ID</span>
                    </span>
                    <a
                      href="https://console.cloud.google.com/apis/credentials"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 text-[11px] flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Get free Client ID</span>
                    </a>
                  </div>

                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="e.g. 1234567890-abcdef.apps.googleusercontent.com"
                    className="w-full px-3 py-2.5 rounded-lg bg-black/60 border border-white/10 text-white placeholder-slate-600 text-xs font-mono focus:outline-none focus:border-indigo-500/60"
                  />

                  <div className="text-[11px] text-slate-400 bg-white/[0.02] p-3 rounded-lg border border-white/5 space-y-1">
                    <div className="font-semibold text-slate-200">Quick 1-Minute Setup:</div>
                    <div>1. Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Google Cloud Console</a> & create a free project.</div>
                    <div>2. Enable <strong>YouTube Data API v3</strong>.</div>
                    <div>3. Go to <strong>Credentials → Create Credentials → OAuth Client ID (Web Application)</strong>.</div>
                    <div>4. In <strong>Authorized JavaScript origins</strong>, add: <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">http://localhost:5173</code></div>
                  </div>

                  <button
                    onClick={() => {
                      if (clientId.trim()) {
                        setStoredGoogleClientId(clientId);
                        setIsEditingClientId(false);
                        handleGoogleSignIn();
                      } else {
                        setError('Please paste your Google OAuth Client ID.');
                      }
                    }}
                    className="tactile-btn w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    <span>Save & Sign in with Google</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sync Actions (Available when connected) */}
          {userProfile && accessToken && (
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                AVAILABLE VAULT SYNCS
              </span>

              {/* Liked Videos Action Card */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                    <Heart className="w-5 h-5 fill-rose-500/40" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs sm:text-sm">My Liked Videos</div>
                    <div className="text-[11px] text-slate-400">Stream your official YouTube Liked playlist (LL)</div>
                  </div>
                </div>

                <button
                  onClick={handleSyncLikedVideos}
                  disabled={syncingPlaylistId === 'LL'}
                  className="tactile-btn px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
                >
                  {syncingPlaylistId === 'LL' ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <span>Sync Liked</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Custom Playlists List */}
              {playlists.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    YOUR YOUTUBE PLAYLISTS ({playlists.length})
                  </span>
                  <div className="max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-1">
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <ListMusic className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          <div className="overflow-hidden">
                            <div className="text-xs font-semibold text-white truncate" title={pl.title}>
                              {pl.title}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {pl.itemCount} videos
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSyncPlaylist(pl)}
                          disabled={syncingPlaylistId === pl.id}
                          className="tactile-btn whitespace-nowrap px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-medium transition-all disabled:opacity-50"
                        >
                          {syncingPlaylistId === pl.id ? 'Syncing...' : 'Sync'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Test Option */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-500">Want to test without signing in?</span>
            <button
              onClick={handleDemoLiked}
              className="tactile-btn text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Liked Stash</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
