import type { Platform, VideoItem } from '../types';

export function extractPlatformAndId(url: string): { platform: Platform; id: string | null; embedUrl: string } {
  try {
    const trimmed = url.trim();

    // 1. YouTube
    if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      let videoId: string | null = null;
      if (trimmed.includes('youtu.be/')) {
        videoId = trimmed.split('youtu.be/')[1].split('?')[0].split('/')[0];
      } else if (trimmed.includes('/shorts/')) {
        videoId = trimmed.split('/shorts/')[1].split('?')[0].split('/')[0];
      } else if (trimmed.includes('v=')) {
        const u = new URL(trimmed);
        videoId = u.searchParams.get('v');
      }

      if (videoId) {
        return {
          platform: 'youtube',
          id: videoId,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`
        };
      }
    }

    // 2. Instagram
    if (trimmed.includes('instagram.com')) {
      let postId: string | null = null;
      const match = trimmed.match(/\/(reel|reels|p)\/([A-Za-z0-9_-]+)/);
      if (match && match[2]) {
        postId = match[2];
        return {
          platform: 'instagram',
          id: postId,
          embedUrl: `https://www.instagram.com/p/${postId}/embed/captioned/`
        };
      }
    }

    // 3. TikTok
    if (trimmed.includes('tiktok.com')) {
      const match = trimmed.match(/\/video\/([0-9]+)/);
      const videoId = match ? match[1] : null;
      return {
        platform: 'tiktok',
        id: videoId,
        embedUrl: videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : trimmed
      };
    }

    // 4. Vimeo
    if (trimmed.includes('vimeo.com')) {
      const match = trimmed.match(/vimeo\.com\/([0-9]+)/);
      const videoId = match ? match[1] : null;
      return {
        platform: 'vimeo',
        id: videoId,
        embedUrl: videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : trimmed
      };
    }

    return {
      platform: 'web',
      id: null,
      embedUrl: trimmed
    };
  } catch (e) {
    return {
      platform: 'web',
      id: null,
      embedUrl: url
    };
  }
}

export async function fetchMetadataForUrl(url: string): Promise<{ title?: string; author?: string; thumbnail?: string }> {
  const { platform, id } = extractPlatformAndId(url);

  if (platform === 'youtube' && id) {
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title,
          author: data.author_name,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
        };
      }
    } catch (e) {
      return {
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
      };
    }
  }

  return {};
}

export async function fetchYouTubePlaylist(apiKey: string, playlistId: string): Promise<VideoItem[]> {
  const endpoint = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || 'Failed to fetch YouTube playlist.');
  }

  const data = await response.json();
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
      isLiked: playlistId === 'LL',
      isWatchLater: false,
      source: 'youtube-sync'
    });
  }

  return items;
}
