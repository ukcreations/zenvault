export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'reddit' | 'vimeo' | 'web';

export type MoodType = string;

export interface VideoItem {
  id: string;
  url: string;
  title: string;
  platform: Platform;
  thumbnail?: string;
  duration?: string;
  channel?: string;
  mood?: string;
  addedAt: string;
  isLiked?: boolean;
  isWatchLater?: boolean;
  notes?: string;
  source?: 'youtube-sync' | 'extension' | 'insta-json' | 'manual' | 'curated';
}

export type SoundscapeType = 'off';

export interface YouTubeSyncConfig {
  apiKey?: string;
  playlistId?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}
