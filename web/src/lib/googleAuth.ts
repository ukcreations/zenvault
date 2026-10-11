import type { User } from '@supabase/supabase-js';
import type { VideoItem } from '../types';
import { supabase } from './supabaseClient';

export interface GoogleUserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface YouTubePlaylistMeta {
  id: string;
  title: string;
  itemCount: number;
  thumbnail?: string;
}

// Set right before redirecting to Google so that, after the OAuth redirect
// brings the user back (a full page reload), App.tsx knows to reopen the
// sync modal and auto-run the Liked Videos sync.
export const PENDING_YT_SYNC_KEY = 'zenvault_pending_yt_sync';

const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube.readonly';

export function toGoogleProfile(user: User | null | undefined): GoogleUserProfile | null {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    name: meta.full_name || meta.name || user.email?.split('@')[0] || 'Google User',
    email: user.email || '',
    picture: meta.avatar_url || meta.picture || ''
  };
}

// Redirects to Google's consent screen via Supabase Auth; the browser
// navigates away and back, so nothing meaningful happens after the await
// unless Supabase fails to even start the redirect.
export async function signInWithGoogle(redirectTo: string = window.location.origin): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: YOUTUBE_SCOPE,
      redirectTo,
      // access_type=offline + consent ensures Google actually returns a
      // provider token we can call the YouTube API with.
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });
  if (error) throw error;
}

export async function signOutGoogle(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Fetches every page of a YouTube Data API list endpoint, following nextPageToken.
async function fetchAllPages(baseUrl: string, accessToken: string): Promise<any[]> {
  const items: any[] = [];
  let pageToken: string | undefined;

  do {
    const url = pageToken ? `${baseUrl}&pageToken=${pageToken}` : baseUrl;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error?.message || 'Failed to fetch from YouTube.');
    }

    const data = await res.json();
    items.push(...(data.items || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return items;
}

// Fetch Liked Videos (playlistId: 'LL')
export async function fetchGoogleLikedVideos(accessToken: string): Promise<VideoItem[]> {
  const items = await fetchAllPages(
    'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=LL&maxResults=50',
    accessToken
  );
  return parsePlaylistItems(items, true);
}

// Fetch All User's Personal Playlists
export async function fetchGoogleUserPlaylists(accessToken: string): Promise<YouTubePlaylistMeta[]> {
  const items = await fetchAllPages(
    'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50',
    accessToken
  );

  return items.map((item) => ({
    id: item.id,
    title: item.snippet?.title || 'Untitled Playlist',
    itemCount: item.contentDetails?.itemCount || 0,
    thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url
  }));
}

// Fetch videos inside any playlist
export async function fetchGooglePlaylistVideos(accessToken: string, playlistId: string): Promise<VideoItem[]> {
  const items = await fetchAllPages(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50`,
    accessToken
  );
  return parsePlaylistItems(items, playlistId === 'LL');
}

function parsePlaylistItems(items: any[], isLikedList: boolean): VideoItem[] {
  const result: VideoItem[] = [];

  for (const item of items) {
    const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
    if (!videoId) continue;

    result.push({
      id: 'yt_' + videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title: item.snippet?.title || 'YouTube Video',
      channel: item.snippet?.channelTitle || 'YouTube Creator',
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      platform: 'youtube',
      mood: 'chill',
      addedAt: item.snippet?.publishedAt || new Date().toISOString(),
      isLiked: isLikedList,
      isWatchLater: false,
      source: 'youtube-sync'
    });
  }

  return result;
}
