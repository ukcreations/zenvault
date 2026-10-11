// ZenVault Bridge - Web App Bridge Content Script
// Facilitates two-way live communication between ZenVault Web Application and Chrome Extension
(function () {
  'use strict';

  console.log('[ZenVault Bridge] Web App Bridge connected');

  // Let the web application know that the extension is active
  window.addEventListener('message', async (event) => {
    // Only accept messages from same origin window
    if (event.source !== window) return;

    const message = event.data;
    if (!message || typeof message !== 'object') return;

    if (message.type === 'ZENVAULT_EXTENSION_PING') {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_SAVED_VIDEOS' });
        window.postMessage({
          type: 'ZENVAULT_EXTENSION_PONG',
          installed: true,
          videos: response?.videos || []
        }, '*');
      } catch (err) {
        window.postMessage({
          type: 'ZENVAULT_EXTENSION_PONG',
          installed: true,
          videos: []
        }, '*');
      }
    }

    if (message.type === 'ZENVAULT_CLEAR_EXTENSION_STORAGE') {
      try {
        await chrome.runtime.sendMessage({ type: 'CLEAR_SAVED_VIDEOS' });
        window.postMessage({ type: 'ZENVAULT_STORAGE_CLEARED' }, '*');
      } catch (e) {
        console.error(e);
      }
    }
  });

  // Listen for push notifications from the extension background service worker
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'ZENVAULT_NEW_ITEM_SYNC') {
      window.postMessage({
        type: 'ZENVAULT_ITEM_SYNCED_FROM_EXTENSION',
        payload: msg.payload
      }, '*');
    }
  });

  // Announce presence immediately
  setTimeout(() => {
    window.postMessage({ type: 'ZENVAULT_EXTENSION_READY', installed: true }, '*');
  }, 500);
})();
