import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  X,
  AlertCircle,
  LogOut,
  Check,
  Heart,
  ListMusic,
  ShieldCheck,
  RefreshCw,
  Loader2
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
import { zenAudio } from '../lib/audioSynthesizer';
import { useToast } from './Toast';

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
  onSyncComplete,
}) => {
  const userProfile = toGoogleProfile(session?.user);
  const providerToken = session?.provider_token ?? null;
  const { success, error: toastError } = useToast();

  const [playlists, setPlaylists] = useState<YouTubePlaylistMeta[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [syncingPlaylistId, setSyncingPlaylistId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Load playlists when providerToken becomes available
  useEffect(() => {
    if (isOpen && providerToken && playlists.length === 0) {
      loadPlaylists(providerToken);
    }
  }, [isOpen, providerToken]);

  useEffect(() => {
    if (!providerToken) setPlaylists([]);
  }, [providerToken]);

  // Handle auto-sync on return from Google OAuth
  useEffect(() => {
    if (isOpen && autoSyncOnOpen && providerToken) {
      handleSyncLikedVideos(providerToken).finally(() => onAutoSyncHandled());
    }
  }, [isOpen, autoSyncOnOpen, providerToken]);

  if (!isOpen) return null;

  async function loadPlaylists(token: string) {
    setIsLoadingPlaylists(true);
    setError(null);
    try {
      const userPlaylists = await fetchGoogleUserPlaylists(token);
      setPlaylists(userPlaylists);
    } catch (err: any) {
      console.warn('Could not load YouTube playlists:', err);
      setError('Your Google session has expired. Sign in again to refresh your playlists.');
    } finally {
      setIsLoadingPlaylists(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSigningIn(true);
    localStorage.setItem(PENDING_YT_SYNC_KEY, '1');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      localStorage.removeItem(PENDING_YT_SYNC_KEY);
      setIsSigningIn(false);
      setError(err.message || 'Google sign-in could not be initiated.');
    }
  };

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
      const msg = `Synced ${videos.length} Liked videos into your sanctuary!`;
      setSuccessMsg(msg);
      success('YouTube sync complete', `${videos.length} videos added.`);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to sync Liked videos from YouTube.';
      setError(errMsg);
      toastError('Sync failed', errMsg);
    } finally {
      setSyncingPlaylistId(null);
    }
  }

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
      const msg = `Synced ${videos.length} videos from "${playlist.title}"!`;
      setSuccessMsg(msg);
      success('Playlist imported', msg);
    } catch (err: any) {
      const errMsg = err.message || `Failed to sync "${playlist.title}".`;
      setError(errMsg);
      toastError('Playlist sync error', errMsg);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#11131A] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07] bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <YoutubeIcon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F4F5FA] font-display">
                YouTube Cloud Synchronization
              </h2>
              <p className="text-[11px] text-[#8E95A5]">
                Directly import your Liked Videos & custom playlists
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              zenAudio.playHapticClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Account Status Card */}
          {userProfile ? (
            <div className="p-4 rounded-xl bg-[#171A23] border border-white/[0.08] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {userProfile.picture ? (
                  <img
                    src={userProfile.picture}
                    alt=""
                    className="w-10 h-10 rounded-full border border-white/15 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF] flex items-center justify-center font-bold text-sm">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F4F5FA] truncate">
                      {userProfile.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      CONNECTED
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E95A5] truncate">{userProfile.email}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8E95A5] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            /* Not Signed In: Google OAuth Connect Callout */
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#171A23] to-[#12141D] border border-white/[0.08] text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#F4F5FA]">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-bold text-[#F4F5FA] font-display">
                  Connect Your Google Account
                </h3>
                <p className="mt-1 text-xs text-[#8E95A5] leading-relaxed">
                  Sign in once to let ZenVault read your YouTube Liked Videos (`LL`) and private playlists. We never modify your account or store passwords.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="btn-primary w-full max-w-xs mx-auto py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 shadow-md disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Google...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4" />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#5E6573] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Read-only YouTube permission (`youtube.readonly`)</span>
              </div>
            </div>
          )}

          {/* Sync Actions (Available when signed in) */}
          {providerToken && (
            <div className="space-y-4 pt-1">
              {/* Liked Videos Sync Action */}
              <div className="p-4 rounded-xl bg-[#141722] border border-white/[0.07] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <Heart className="w-4 h-4 fill-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F4F5FA]">
                      Liked Videos (`LL`)
                    </h4>
                    <p className="text-[11px] text-[#8E95A5]">
                      All videos you ever clicked Like on in YouTube
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSyncLikedVideos(providerToken)}
                  disabled={syncingPlaylistId !== null}
                  className="btn-primary px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {syncingPlaylistId === 'LL' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Personal Playlists Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-mono uppercase text-[#8E95A5] font-semibold tracking-wider flex items-center gap-1.5">
                    <ListMusic className="w-3.5 h-3.5 text-[#8B7CFF]" />
                    <span>YOUR YOUTUBE PLAYLISTS</span>
                  </span>
                  {playlists.length > 0 && (
                    <button
                      onClick={() => loadPlaylists(providerToken)}
                      disabled={isLoadingPlaylists}
                      className="text-[11px] text-[#8B7CFF] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingPlaylists ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  )}
                </div>

                {isLoadingPlaylists ? (
                  <div className="py-8 text-center text-xs text-[#8E95A5] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#8B7CFF]" />
                    <span>Fetching playlists from YouTube...</span>
                  </div>
                ) : playlists.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        className="p-3 rounded-lg bg-[#141722] hover:bg-[#171A28] border border-white/[0.06] flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {pl.thumbnail ? (
                            <img
                              src={pl.thumbnail}
                              alt=""
                              className="w-10 h-7 object-cover rounded bg-black flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-7 rounded bg-white/5 flex items-center justify-center text-[#5E6573] flex-shrink-0">
                              <ListMusic className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#F4F5FA] truncate">
                              {pl.title}
                            </p>
                            <p className="text-[10px] text-[#8E95A5] font-mono">
                              {pl.itemCount} videos
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSyncPlaylist(pl)}
                          disabled={syncingPlaylistId !== null}
                          className="btn-secondary px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          {syncingPlaylistId === pl.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <span>Import</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[#5E6573] p-4 rounded-xl bg-[#141722] border border-white/[0.06]">
                    No personal playlists found on this YouTube account.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
