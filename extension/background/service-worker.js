// ZenVault Bridge - Service Worker (Manifest V3)
// Follows ephemeral state rules: state stored exclusively in chrome.storage.local

chrome.runtime.onInstalled.addListener(async () => {
  // Initialize storage
  const { zenvault_saved_videos } = await chrome.storage.local.get('zenvault_saved_videos');
  if (!zenvault_saved_videos) {
    await chrome.storage.local.set({ zenvault_saved_videos: [] });
  }

  // Create Context Menu for saving media
  chrome.contextMenus.create({
    id: 'zenvault-save-page',
    title: '✨ Save to ZenVault Sanctuary',
    contexts: ['page', 'link', 'video']
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'zenvault-save-page') {
    const targetUrl = info.linkUrl || info.srcUrl || info.pageUrl || tab?.url;
    if (!targetUrl) return;

    const newVideo = {
      id: 'ext_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      url: targetUrl,
      title: tab?.title || 'Saved Video clip',
      platform: detectPlatform(targetUrl),
      addedAt: new Date().toISOString(),
      mood: 'chill',
      source: 'context-menu'
    };

    await saveVideoToStorage(newVideo);
    await flashBadge('SAVED', '#10b981');
  }
});

// Message listener for content scripts & popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'SAVE_VIDEO') {
        const result = await saveVideoToStorage(message.payload);
        await flashBadge('✓', '#10b981');
        sendResponse({ success: true, count: result.count });
      } else if (message.type === 'GET_SAVED_VIDEOS') {
        const { zenvault_saved_videos = [] } = await chrome.storage.local.get('zenvault_saved_videos');
        sendResponse({ success: true, videos: zenvault_saved_videos });
      } else if (message.type === 'CLEAR_SAVED_VIDEOS') {
        await chrome.storage.local.set({ zenvault_saved_videos: [] });
        await chrome.action.setBadgeText({ text: '' });
        sendResponse({ success: true });
      } else if (message.type === 'REMOVE_VIDEO') {
        const { zenvault_saved_videos = [] } = await chrome.storage.local.get('zenvault_saved_videos');
        const updated = zenvault_saved_videos.filter(v => v.id !== message.payload.id);
        await chrome.storage.local.set({ zenvault_saved_videos: updated });
        await updateBadgeCount(updated.length);
        sendResponse({ success: true, count: updated.length });
      } else {
        sendResponse({ error: 'Unknown message type' });
      }
    } catch (err) {
      console.error('Error handling message:', err);
      sendResponse({ error: err.message });
    }
  })();
  return true; // Keep channel open for async response
});

// Helper: Save video to storage and broadcast to active tabs
async function saveVideoToStorage(video) {
  const { zenvault_saved_videos = [] } = await chrome.storage.local.get('zenvault_saved_videos');
  
  // Avoid exact URL duplicates
  const existingIndex = zenvault_saved_videos.findIndex(v => v.url === video.url);
  let updated;
  if (existingIndex >= 0) {
    zenvault_saved_videos[existingIndex] = { ...zenvault_saved_videos[existingIndex], ...video, addedAt: new Date().toISOString() };
    updated = [...zenvault_saved_videos];
  } else {
    updated = [video, ...zenvault_saved_videos];
  }

  await chrome.storage.local.set({ zenvault_saved_videos: updated });
  await updateBadgeCount(updated.length);

  // Broadcast to open ZenVault tabs
  const tabs = await chrome.tabs.query({ url: ['http://localhost:*/*', 'https://*/*'] });
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'ZENVAULT_NEW_ITEM_SYNC',
        payload: video
      });
    } catch (e) {
      // Ignore tabs that don't receive the message
    }
  }

  return { count: updated.length };
}

async function updateBadgeCount(count) {
  if (count > 0) {
    await chrome.action.setBadgeText({ text: String(count) });
    await chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
  } else {
    await chrome.action.setBadgeText({ text: '' });
  }
}

async function flashBadge(text, color) {
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(async () => {
    const { zenvault_saved_videos = [] } = await chrome.storage.local.get('zenvault_saved_videos');
    await updateBadgeCount(zenvault_saved_videos.length);
  }, 2500);
}

function detectPlatform(url) {
  if (!url) return 'web';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('reddit.com')) return 'reddit';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'web';
}
