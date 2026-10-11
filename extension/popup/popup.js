// ZenVault Bridge - Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  const tabTitleEl = document.getElementById('tabTitle');
  const tabUrlEl = document.getElementById('tabUrl');
  const tabIconEl = document.getElementById('tabIcon');
  const btnSaveTab = document.getElementById('btnSaveTab');
  const stashCountEl = document.getElementById('stashCount');
  const stashListEl = document.getElementById('stashList');
  const emptyStateEl = document.getElementById('emptyState');
  const btnClearStash = document.getElementById('btnClearStash');
  const btnOpenApp = document.getElementById('btnOpenApp');

  let currentTab = null;

  // 1. Get Active Tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;
    if (tab) {
      tabTitleEl.textContent = tab.title || 'Untitled';
      tabUrlEl.textContent = tab.url || '';
      
      if (tab.url?.includes('youtube.com')) tabIconEl.textContent = '▶️';
      else if (tab.url?.includes('instagram.com')) tabIconEl.textContent = '📷';
      else if (tab.url?.includes('tiktok.com')) tabIconEl.textContent = '🎵';
      else tabIconEl.textContent = '🌐';
    }
  } catch (err) {
    console.error('Error fetching tab:', err);
  }

  // 2. Render Saved Stash
  async function loadStash() {
    const { zenvault_saved_videos = [] } = await chrome.storage.local.get('zenvault_saved_videos');
    stashCountEl.textContent = zenvault_saved_videos.length;

    stashListEl.innerHTML = '';
    if (zenvault_saved_videos.length === 0) {
      stashListEl.appendChild(emptyStateEl);
      emptyStateEl.style.display = 'block';
      return;
    }

    emptyStateEl.style.display = 'none';

    zenvault_saved_videos.slice(0, 8).forEach(video => {
      const item = document.createElement('div');
      item.className = 'stash-item';

      const platformIcon = video.platform === 'youtube' ? '▶️' : 
                           video.platform === 'instagram' ? '📷' : 
                           video.platform === 'tiktok' ? '🎵' : '🌐';

      item.innerHTML = `
        <div class="item-left">
          <span class="item-platform">${platformIcon}</span>
          <span class="item-title" title="${escapeHtml(video.title)}">${escapeHtml(video.title)}</span>
        </div>
        <button class="btn-item-del" data-id="${video.id}" title="Remove">✕</button>
      `;

      item.querySelector('.btn-item-del').addEventListener('click', async (e) => {
        e.stopPropagation();
        await chrome.runtime.sendMessage({
          type: 'REMOVE_VIDEO',
          payload: { id: video.id }
        });
        await loadStash();
      });

      stashListEl.appendChild(item);
    });
  }

  await loadStash();

  // 3. Save Tab Handler
  btnSaveTab.addEventListener('click', async () => {
    if (!currentTab || !currentTab.url) return;

    btnSaveTab.disabled = true;
    btnSaveTab.innerHTML = `<span>⏳</span><span>Saving...</span>`;

    let platform = 'web';
    if (currentTab.url.includes('youtube.com') || currentTab.url.includes('youtu.be')) platform = 'youtube';
    else if (currentTab.url.includes('instagram.com')) platform = 'instagram';
    else if (currentTab.url.includes('tiktok.com')) platform = 'tiktok';

    const videoData = {
      id: 'ext_' + Date.now(),
      url: currentTab.url,
      title: currentTab.title?.replace(' - YouTube', '')?.replace(' | Instagram', '') || 'Saved Video',
      platform: platform,
      addedAt: new Date().toISOString(),
      mood: 'chill',
      source: 'extension-popup'
    };

    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_VIDEO',
        payload: videoData
      });

      btnSaveTab.classList.add('saved');
      btnSaveTab.innerHTML = `<span>✓</span><span>Saved to Vault!</span>`;
      await loadStash();

      setTimeout(() => {
        btnSaveTab.classList.remove('saved');
        btnSaveTab.innerHTML = `<span>✨</span><span>Save to ZenVault</span>`;
        btnSaveTab.disabled = false;
      }, 2000);
    } catch (err) {
      console.error(err);
      btnSaveTab.innerHTML = `<span>⚠️</span><span>Error</span>`;
      btnSaveTab.disabled = false;
    }
  });

  // 4. Clear Stash Handler
  btnClearStash.addEventListener('click', async () => {
    if (confirm('Clear all queued clips in the bridge?')) {
      await chrome.runtime.sendMessage({ type: 'CLEAR_SAVED_VIDEOS' });
      await loadStash();
    }
  });

  // 5. Open ZenVault Web App
  btnOpenApp.addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ url: ['http://localhost:5173/*', 'http://localhost:3000/*'] });
    if (tabs.length > 0) {
      await chrome.tabs.update(tabs[0].id, { active: true });
      if (tabs[0].windowId) {
        await chrome.windows.update(tabs[0].windowId, { focused: true });
      }
    } else {
      await chrome.tabs.create({ url: 'http://localhost:5173' });
    }
    window.close();
  });

  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }
});
