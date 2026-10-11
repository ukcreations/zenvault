import type { VideoItem } from '../types';
import { supabase } from './supabaseClient';

interface CloudVideoRow {
  user_id: string;
  video_id: string;
  url: string;
  title: string;
  platform: string;
  thumbnail: string | null;
  channel: string | null;
  mood: string;
  added_at: string;
  is_liked: boolean;
  is_watch_later: boolean;
  notes: string | null;
  source: string | null;
}

function toRow(userId: string, v: VideoItem): CloudVideoRow {
  return {
    user_id: userId,
    video_id: v.id,
    url: v.url,
    title: v.title,
    platform: v.platform,
    thumbnail: v.thumbnail ?? null,
    channel: v.channel ?? null,
    mood: v.mood,
    added_at: v.addedAt,
    is_liked: Boolean(v.isLiked),
    is_watch_later: Boolean(v.isWatchLater),
    notes: v.notes ?? null,
    source: v.source ?? null
  };
}

function fromRow(row: any): VideoItem {
  return {
    id: row.video_id,
    url: row.url,
    title: row.title,
    platform: row.platform,
    thumbnail: row.thumbnail ?? undefined,
    channel: row.channel ?? undefined,
    mood: row.mood,
    addedAt: row.added_at,
    isLiked: row.is_liked,
    isWatchLater: row.is_watch_later,
    notes: row.notes ?? undefined,
    source: row.source ?? undefined
  };
}

export async function pullCloudVideos(userId: string): Promise<VideoItem[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function pushVideo(userId: string, video: VideoItem): Promise<void> {
  const { error } = await supabase
    .from('videos')
    .upsert(toRow(userId, video), { onConflict: 'user_id,video_id' });
  if (error) throw error;
}

export async function pushVideos(userId: string, videos: VideoItem[]): Promise<void> {
  if (videos.length === 0) return;
  const { error } = await supabase
    .from('videos')
    .upsert(videos.map((v) => toRow(userId, v)), { onConflict: 'user_id,video_id' });
  if (error) throw error;
}

export async function deleteCloudVideo(userId: string, videoId: string): Promise<void> {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('user_id', userId)
    .eq('video_id', videoId);
  if (error) throw error;
}
