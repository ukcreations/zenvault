// ZenVault Bridge - Instagram Content Script
(function () {
  'use strict';

  console.log('[ZenVault Bridge] Instagram content script active');

  function showToast(message, isSuccess = true) {
    const existing = document.getElementById('zenvault-toast-msg');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'zenvault-toast-msg';
    toast.className = 'zenvault-toast';
    toast.innerHTML = `
      <span style="font-size: 16px;">${isSuccess ? '✨' : '⚠️'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // 1. Injected Quick Button for Reels and Posts
  function injectReelButton() {
    // Check if we are viewing a reel or post modal
    const isReelOrPost = window.location.pathname.includes('/reel/') || 
                         window.location.pathname.includes('/reels/') || 
                         window.location.pathname.includes('/p/');
    
    if (!isReelOrPost) return;

    if (document.getElementById('zenvault-insta-float-btn')) return;

    const floatBtn = document.createElement('button');
    floatBtn.id = 'zenvault-insta-float-btn';
    floatBtn.className = 'zenvault-btn';
    floatBtn.style.position = 'fixed';
    floatBtn.style.top = '80px';
    floatBtn.style.right = '24px';
    floatBtn.innerHTML = `<span>⚡</span><span>Beam to ZenVault</span>`;

    floatBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const videoUrl = window.location.href.split('?')[0];
      const videoTitle = document.title.replace(' | Instagram', '') || 'Instagram Reel';
      
      // Attempt to grab thumbnail if available in DOM
      let thumbnail = '';
      const videoEl = document.querySelector('video');
      if (videoEl && videoEl.poster) {
        thumbnail = videoEl.poster;
      } else {
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) thumbnail = ogImage.content;
      }

      floatBtn.innerHTML = `<span>⏳</span><span>Saving...</span>`;

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'SAVE_VIDEO',
          payload: {
            id: 'ig_' + Date.now(),
            url: videoUrl,
            title: videoTitle,
            platform: 'instagram',
            thumbnail: thumbnail || '',
            addedAt: new Date().toISOString(),
            mood: 'chill',
            source: 'instagram-button'
          }
        });

        if (response?.success) {
          floatBtn.classList.add('zenvault-btn-saved');
          floatBtn.innerHTML = `<span>✓</span><span>Saved to Vault!</span>`;
          showToast('Reel saved to your ZenVault sanctuary!');
        } else {
          floatBtn.innerHTML = `<span>⚡</span><span>Beam to ZenVault</span>`;
          showToast('Failed to save to ZenVault', false);
        }
      } catch (err) {
        console.error('ZenVault error:', err);
        showToast('Error saving: ' + err.message, false);
      }
    });

    document.body.appendChild(floatBtn);
  }

  // 2. Saved Tab Scanner (for /saved/ pages)
  function injectSavedTabSyncBar() {
    const isSavedPage = window.location.pathname.includes('/saved');
    if (!isSavedPage) return;

    if (document.getElementById('zenvault-saved-sync-bar')) return;

    const syncBar = document.createElement('div');
    syncBar.id = 'zenvault-saved-sync-bar';
    syncBar.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(99, 102, 241, 0.5);
      backdrop-filter: blur(20px);
      padding: 12px 20px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 35px rgba(0,0,0,0.6);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
    `;

    syncBar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">💎</span>
        <div>
          <div style="font-weight: 700;">ZenVault Sync Available</div>
          <div style="font-size: 11px; color: #94a3b8;">Import visible saved reels into your quiet sanctuary</div>
        </div>
      </div>
      <button id="zenvault-scan-saved-btn" class="zenvault-btn" style="padding: 6px 14px; font-size: 12px;">
        📥 Beam All Visible to ZenVault
      </button>
    `;

    document.body.appendChild(syncBar);

    document.getElementById('zenvault-scan-saved-btn').addEventListener('click', async () => {
      const btn = document.getElementById('zenvault-scan-saved-btn');
      btn.innerHTML = `<span>⏳</span><span>Scanning...</span>`;

      // Find all reel/post anchors
      const links = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'));
      const uniqueUrls = new Set();
      const itemsToSave = [];

      for (const link of links) {
        const fullUrl = link.href.split('?')[0];
        if (!uniqueUrls.has(fullUrl)) {
          uniqueUrls.add(fullUrl);
          const img = link.querySelector('img');
          const thumbnail = img ? img.src : '';
          itemsToSave.push({
            id: 'ig_' + Math.random().toString(36).substr(2, 9),
            url: fullUrl,
            title: img?.alt || 'Saved Instagram Reel',
            thumbnail: thumbnail,
            platform: 'instagram',
            addedAt: new Date().toISOString(),
            mood: 'chill',
            source: 'saved-bulk-scan'
          });
        }
      }

      if (itemsToSave.length === 0) {
        btn.innerHTML = `<span>⚠️</span><span>No posts found</span>`;
        showToast('Could not find saved posts on this screen. Scroll down and try again!', false);
        return;
      }

      let savedCount = 0;
      for (const item of itemsToSave) {
        await chrome.runtime.sendMessage({
          type: 'SAVE_VIDEO',
          payload: item
        });
        savedCount++;
      }

      btn.classList.add('zenvault-btn-saved');
      btn.innerHTML = `<span>✓</span><span>Synced ${savedCount} Reels!</span>`;
      showToast(`Successfully beamed ${savedCount} saved reels into ZenVault!`);
    });
  }

  // Observe URL changes (Instagram is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      const existingBtn = document.getElementById('zenvault-insta-float-btn');
      if (existingBtn) existingBtn.remove();
      const existingBar = document.getElementById('zenvault-saved-sync-bar');
      if (existingBar) existingBar.remove();
      setTimeout(() => {
        injectReelButton();
        injectSavedTabSyncBar();
      }, 1000);
    } else {
      injectReelButton();
      injectSavedTabSyncBar();
    }
  }).observe(document, { subtree: true, childList: true });

  // Initial check
  setTimeout(() => {
    injectReelButton();
    injectSavedTabSyncBar();
  }, 1200);
})();
