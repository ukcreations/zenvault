import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  X,
  Sparkles,
  AlertCircle,
  LogOut,
  Check,
  Heart,
  ListMusic,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { YoutubeIcon, GoogleIcon } from './Icons';
import confetti from 'canvas-confetti';
import type { VideoItem } from '../types';
import {
  toGoogleProfile,
  signInWithGoogle,
  signOutGoogle,
  fetchGoogleLikedVideos,
  fetchGoogleUserPlaylists,
  fetchGooglePlaylistVideos,
  PENDING_YT_SYNC_KEY,
  type YouTubePlaylistMeta
} from '../lib/googleAuth';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { zenAudio } from '../lib/audioSynthesizer';

interface YouTubeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  autoSyncOnOpen: boolean;
  onAutoSyncHandled: () => void;
  onSyncComplete: (videos: VideoItem[]) => void;
}

export const YouTubeSyncModal: React.FC<YouTubeSyncModalProps> = ({
  isOpen,
  onClose,
  session,
  autoSyncOnOpen,
  onAutoSyncHandled,
  onSyncComplete
}) => {
  const userProfile = toGoogleProfile(session?.user);
  const providerToken = session?.provider_token ?? null;

  const [playlists, setPlaylists] = useState<YouTubePlaylistMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncingPlaylistId, setSyncingPlaylistId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load the user's playlists once we have a usable token.
  useEffect(() => {
    if (isOpen && providerToken && playlists.length === 0) {
      loadPlaylists(providerToken);
    }
  }, [isOpen, providerToken]);

  // Clear stale playlists once the Google access token is gone (sign-out or expiry).
  useEffect(() => {
    if (!providerToken) setPlaylists([]);
  }, [providerToken]);

  // After an OAuth redirect brings the user back signed-in, auto-run the
  // Liked Videos sync immediately — login should produce a synced library
  // without a second click.
  useEffect(() => {
    if (isOpen && autoSyncOnOpen && providerToken) {
      handleSyncLikedVideos(providerToken).finally(() => onAutoSyncHandled());
    }
  }, [isOpen, autoSyncOnOpen, providerToken]);

  if (!isOpen) return null;

  async function loadPlaylists(token: string) {
    setIsLoading(true);
    setError(null);
    try {
      const userPlaylists = await fetchGoogleUserPlaylists(token);
      setPlaylists(userPlaylists);
    } catch (err: any) {
      console.warn('Could not load YouTube playlists:', err);
      setError('Your Google access has expired. Sign in again to keep syncing.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    localStorage.setItem(PENDING_YT_SYNC_KEY, '1');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      localStorage.removeItem(PENDING_YT_SYNC_KEY);
      setIsLoading(false);
      setError(err.message || 'Google sign-in failed to start.');
    }
  };

  // Sync Liked Videos
  async function handleSyncLikedVideos(token: string) {
    setSyncingPlaylistId('LL');
    setError(null);
    setSuccessMsg(null);

    try {
      const videos = await fetchGoogleLikedVideos(token);
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
  }

  // Sync specific playlist
  const handleSyncPlaylist = async (playlist: YouTubePlaylistMeta) => {
    if (!providerToken) return;
    setSyncingPlaylistId(playlist.id);
    setError(null);
    setSuccessMsg(null);

    try {
      const videos = await fetchGooglePlaylistVideos(providerToken, playlist.id);
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

  const handleSignOut = async () => {
    await signOutGoogle();
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

          {!isSupabaseConfigured ? (
            /* Dev hasn't wired up Supabase yet */
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-2">
              <div className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Supabase isn't configured yet
              </div>
              <p className="text-amber-200/80">
                Set <code className="bg-black/30 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-black/30 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-black/30 px-1 rounded">web/.env</code>, and enable the Google provider in your Supabase project's Authentication settings.
              </p>
            </div>
          ) : userProfile && providerToken ? (
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
          ) : userProfile && !providerToken ? (
            /* Signed in to Supabase, but Google access expired - needs re-consent */
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reconnect Google Access</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  You're signed in as {userProfile.email}, but your YouTube access has expired. Sign in again to keep syncing.
                </p>
              </div>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="tactile-btn w-full sm:w-auto min-w-[240px] px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Reconnect with Google</span>
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
                  Sign in to your Google Account to stream your YouTube Liked videos and custom playlists into your quiet sanctuary — and keep them synced across every device you sign into.
                </p>
              </div>

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
            </div>
          )}

          {/* Sync Actions (Available when connected) */}
          {userProfile && providerToken && (
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
                  onClick={() => handleSyncLikedVideos(providerToken)}
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
