import type { VideoItem } from '../types';
import { INITIAL_CURATED_VIDEOS } from './mockCuratedData';

const STORAGE_KEY = 'zenvault_library_v1';

export function getSavedVideos(): VideoItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CURATED_VIDEOS));
      return INITIAL_CURATED_VIDEOS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load videos from storage:', err);
    return INITIAL_CURATED_VIDEOS;
  }
}

export function saveVideosToStorage(videos: VideoItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  } catch (err) {
    console.error('Failed to persist videos:', err);
  }
}

export function addVideo(video: VideoItem): VideoItem[] {
  const current = getSavedVideos();
  const existing = current.find(v => v.url === video.url);
  let updated: VideoItem[];
  if (existing) {
    updated = current.map(v => v.url === video.url ? { ...v, ...video } : v);
  } else {
    updated = [video, ...current];
  }
  saveVideosToStorage(updated);
  return updated;
}

export function removeVideo(id: string): VideoItem[] {
  const current = getSavedVideos();
  const updated = current.filter(v => v.id !== id);
  saveVideosToStorage(updated);
  return updated;
}

export function toggleLiked(id: string): VideoItem[] {
  const current = getSavedVideos();
  const updated = current.map(v => v.id === id ? { ...v, isLiked: !v.isLiked } : v);
  saveVideosToStorage(updated);
  return updated;
}

export function toggleWatchLater(id: string): VideoItem[] {
  const current = getSavedVideos();
  const updated = current.map(v => v.id === id ? { ...v, isWatchLater: !v.isWatchLater } : v);
  saveVideosToStorage(updated);
  return updated;
}

export function parseInstagramExport(jsonContent: string): VideoItem[] {
  try {
    const parsed = JSON.parse(jsonContent);
    const items: VideoItem[] = [];

    const entries = parsed.saved_saved_media || parsed.saved_posts || (Array.isArray(parsed) ? parsed : []);

    for (const entry of entries) {
      const href = entry.href || entry.string_map_data?.['Post URL']?.href || entry.string_map_data?.['Saved on']?.href;
      const title = entry.title || 'Saved Instagram Reel';
      const timestamp = entry.string_map_data?.['Saved on']?.timestamp 
        ? new Date(entry.string_map_data['Saved on'].timestamp * 1000).toISOString()
        : new Date().toISOString();

      if (href) {
        items.push({
          id: 'ig_import_' + Math.random().toString(36).substring(2, 9),
          url: href,
          title: title,
          platform: 'instagram',
          mood: 'chill',
          addedAt: timestamp,
          isLiked: true,
          source: 'insta-json'
        });
      }
    }

    return items;
  } catch (e) {
    throw new Error('Invalid Instagram JSON format. Please upload your saved_posts.json export.');
  }
}
