import type { VideoItem } from '../types';

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

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: any }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

const CLIENT_ID_KEY = 'zenvault_google_client_id';
const ACCESS_TOKEN_KEY = 'zenvault_google_access_token';
const USER_PROFILE_KEY = 'zenvault_google_user_profile';

export function getStoredGoogleClientId(): string {
  return localStorage.getItem(CLIENT_ID_KEY) || '';
}

export function setStoredGoogleClientId(clientId: string): void {
  localStorage.setItem(CLIENT_ID_KEY, clientId.trim());
}

export function getStoredAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getStoredUserProfile(): GoogleUserProfile | null {
  try {
    const raw = sessionStorage.getItem(USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUserProfile(profile: GoogleUserProfile | null): void {
  if (profile) {
    sessionStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } else {
    sessionStorage.removeItem(USER_PROFILE_KEY);
  }
}

export function clearGoogleSession(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_PROFILE_KEY);
}

// Request Direct Login via Google Identity Services Popup
export function requestGoogleLogin(
  clientId: string,
  onSuccess: (token: string) => void,
  onError: (err: any) => void
): void {
  if (!window.google?.accounts?.oauth2) {
    onError(new Error('Google Identity Services script is still loading. Please try again in a moment.'));
    return;
  }

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      callback: (response) => {
        if (response.error) {
          onError(new Error(response.error.message || response.error));
          return;
        }
        if (response.access_token) {
          setStoredAccessToken(response.access_token);
          onSuccess(response.access_token);
        } else {
          onError(new Error('No access token returned from Google.'));
        }
      }
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  } catch (err: any) {
    onError(err);
  }
}

// Fetch Google User Profile
export async function fetchGoogleProfile(accessToken: string): Promise<GoogleUserProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch Google profile.');
  }
  const data = await res.json();
  const profile: GoogleUserProfile = {
    name: data.name || data.given_name || 'Google User',
    email: data.email || '',
    picture: data.picture || ''
  };
  setStoredUserProfile(profile);
  return profile;
}

// Fetch Liked Videos (playlistId: 'LL')
export async function fetchGoogleLikedVideos(accessToken: string): Promise<VideoItem[]> {
  const url = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=LL&maxResults=50';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || 'Failed to fetch Liked Videos from YouTube.');
  }

  const data = await res.json();
  return parsePlaylistItemsResponse(data, true);
}

// Fetch All User's Personal Playlists
export async function fetchGoogleUserPlaylists(accessToken: string): Promise<YouTubePlaylistMeta[]> {
  const url = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || 'Failed to fetch your YouTube playlists.');
  }

  const data = await res.json();
  const playlists: YouTubePlaylistMeta[] = [];

  for (const item of data.items || []) {
    playlists.push({
      id: item.id,
      title: item.snippet?.title || 'Untitled Playlist',
      itemCount: item.contentDetails?.itemCount || 0,
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url
    });
  }

  return playlists;
}

// Fetch videos inside any playlist
export async function fetchGooglePlaylistVideos(accessToken: string, playlistId: string): Promise<VideoItem[]> {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || 'Failed to fetch playlist items.');
  }

  const data = await res.json();
  return parsePlaylistItemsResponse(data, playlistId === 'LL');
}

function parsePlaylistItemsResponse(data: any, isLikedList: boolean): VideoItem[] {
  const items: VideoItem[] = [];

  for (const item of data.items || []) {
    const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
    if (!videoId) continue;

    items.push({
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

  return items;
}
