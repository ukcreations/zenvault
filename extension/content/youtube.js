// ZenVault Bridge - YouTube Content Script
(function () {
  'use strict';

  console.log('[ZenVault Bridge] YouTube content script active');

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

  function getYouTubeVideoId(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
      if (u.pathname.includes('/shorts/')) return u.pathname.split('/shorts/')[1].split('/')[0];
      return u.searchParams.get('v');
    } catch (e) {
      return null;
    }
  }

  function injectYouTubeButton() {
    if (!window.location.pathname.includes('/watch') && !window.location.pathname.includes('/shorts/')) {
      return;
    }

    if (document.getElementById('zenvault-yt-btn')) return;

    // Target YouTube action container
    const actionsContainer = document.querySelector('#top-level-buttons-computed') || 
                             document.querySelector('#actions-inner') ||
                             document.querySelector('ytd-watch-metadata #actions');

    const btn = document.createElement('button');
    btn.id = 'zenvault-yt-btn';
    btn.className = 'zenvault-btn';
    btn.style.marginLeft = '8px';
    btn.style.alignSelf = 'center';
    btn.innerHTML = `<span>🧘</span><span>ZenVault</span>`;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const videoId = getYouTubeVideoId(window.location.href);
      const videoTitle = document.querySelector('h1.ytd-watch-metadata')?.textContent?.trim() || 
                         document.title.replace(' - YouTube', '') || 
                         'YouTube Video';

      const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';

      btn.innerHTML = `<span>⏳</span><span>Saving...</span>`;

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'SAVE_VIDEO',
          payload: {
            id: 'yt_' + (videoId || Date.now()),
            url: window.location.href,
            title: videoTitle,
            platform: 'youtube',
            thumbnail: thumbnail,
            addedAt: new Date().toISOString(),
            mood: 'chill',
            source: 'youtube-button'
          }
        });

        if (response?.success) {
          btn.classList.add('zenvault-btn-saved');
          btn.innerHTML = `<span>✓</span><span>Saved!</span>`;
          showToast('Added to your ZenVault quiet library!');
        } else {
          btn.innerHTML = `<span>🧘</span><span>ZenVault</span>`;
          showToast('Could not save to ZenVault', false);
        }
      } catch (err) {
        console.error('ZenVault error:', err);
        showToast('Error: ' + err.message, false);
      }
    });

    if (actionsContainer) {
      actionsContainer.appendChild(btn);
    } else {
      // Fallback floating button if YouTube's action bar isn't found
      btn.style.position = 'fixed';
      btn.style.bottom = '80px';
      btn.style.right = '24px';
      document.body.appendChild(btn);
    }
  }

  // Monitor DOM changes for SPA navigation
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      const existingBtn = document.getElementById('zenvault-yt-btn');
      if (existingBtn) existingBtn.remove();
      setTimeout(injectYouTubeButton, 1200);
    } else {
      if (!document.getElementById('zenvault-yt-btn')) {
        injectYouTubeButton();
      }
    }
  }).observe(document, { subtree: true, childList: true });

  setTimeout(injectYouTubeButton, 1500);
})();
