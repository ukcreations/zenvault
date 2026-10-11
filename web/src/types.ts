export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'reddit' | 'vimeo' | 'web';

export type MoodType = 'all' | 'chill' | 'deep-focus' | 'sleep' | 'comedy' | 'learn' | 'inspiration';

export interface VideoItem {
  id: string;
  url: string;
  title: string;
  platform: Platform;
  thumbnail?: string;
  duration?: string;
  channel?: string;
  mood: MoodType;
  addedAt: string;
  isLiked?: boolean;
  isWatchLater?: boolean;
  notes?: string;
  source?: 'youtube-sync' | 'extension' | 'insta-json' | 'manual' | 'curated';
}

export type SoundscapeType = 'rain' | 'fireplace' | 'lofi' | 'brown-noise' | 'forest' | 'off';

export interface YouTubeSyncConfig {
  apiKey?: string;
  playlistId?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}
