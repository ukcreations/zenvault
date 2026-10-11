# ZenVault — Distraction-Free Private Media Sanctuary

> **Watch only what you chose to save.**  
> Zero algorithmic rabbit holes. Zero toxic comment sections. No infinite feeds.

ZenVault is a high-craft mindful media sanctuary that lets you curate and watch only your saved videos, liked reels, and watch-later stashes across **YouTube, Instagram, TikTok, Vimeo, and the web**.

---

## Architecture Overview

```
zenvault/
├── web/                  # Production-grade React 19 + Vite + Tailwind CSS + Web Audio Sanctuary
│   ├── src/
│   │   ├── components/   # ZenPlayer Cinema, VideoCard, AddMediaModal, YouTubeSyncModal, AmbientAudioPlayer
│   │   ├── lib/          # Web Audio procedural synthesizer, YouTube API client, Instagram parser, Storage
│   │   └── types.ts
│   └── ...
└── extension/            # Manifest V3 Chrome Extension ("ZenVault Bridge")
    ├── manifest.json     # MV3 specification
    ├── popup/            # Fast 1-click "Save Tab to ZenVault" HUD
    ├── content/          # Floating "Beam to ZenVault" on Instagram Reels & YouTube
    ├── background/       # Ephemeral service worker with context menus & badge sync
    └── icons/            # Real 16x16, 48x48, 128x128 PNG icons
```

---

## 1. Quick Start (Web Sanctuary)

The web application runs locally at:
**[http://localhost:5173/](http://localhost:5173/)**

If you ever need to restart the development server manually:
```bash
cd "C:\Users\UJJWAL KUMAR\.gemini\antigravity\scratch\zenvault\web"
npm run dev
```

---

## 2. Setting Up the Chrome Extension Bridge (for Instagram & 1-Click Saving)

The Chrome extension allows you to save any Instagram Reel, YouTube video, or webpage clip into your ZenVault in 1 tap directly while browsing.

### How to Install in Chrome:
1. Open Google Chrome and go to `chrome://extensions` in the address bar.
2. In the top right corner, toggle **Developer mode** to **ON**.
3. Click the **Load unpacked** button in the top left.
4. Select the extension directory:  
   `C:\Users\UJJWAL KUMAR\.gemini\antigravity\scratch\zenvault\extension`
5. That's it! Pin the **ZenVault Bridge** icon to your toolbar.

### How to Use the Extension:
- **On Instagram Reels**: A floating **"⚡ Beam to ZenVault"** button appears on reels. Click it to beam the clip into your vault!
- **On Instagram Saved Posts Tab** (`instagram.com/your_username/saved`): An **"📥 Beam All Visible to ZenVault"** bar appears at the bottom to bulk-import your saved reels.
- **On YouTube**: Click the **"🧘 ZenVault"** button on any video.
- **Anywhere on the Web**: Click the ZenVault extension icon in your browser toolbar and click **"✨ Save to ZenVault"**, or right-click any link/video and choose **"✨ Save to ZenVault Sanctuary"**.

---

## 3. Supported Ingestion Channels

| Source | Method | Details |
| :--- | :--- | :--- |
| **YouTube Liked Videos & Playlists** | **Direct Google Login (OAuth 2.0)** | One-click "Sign in with Google" to sync your official Liked videos (`playlistId: LL`) and custom playlists. |
| **Instagram Saved Reels** | Chrome Extension Bridge | Injected "⚡ Beam to ZenVault" button saves reels directly while browsing. |
| **Instagram Export File** | JSON Drag & Drop | In Instagram, go to `Settings → Download information → Saved Posts`. Drag `saved_posts.json` into ZenVault. |
| **Any Web Video / Clip** | URL Ingester | Paste any URL (YouTube, Insta, TikTok, Vimeo, MP4) with auto-fetched thumbnail & title. |

---

## 4. Built-in Features

- **Distraction-Free Cinema Mode**: Strips all recommendations, algorithmic sidebars, and comments. Uses `enablejsapi=1` and minimal branding.
- **Native Web Audio Ambient Soundscapes**: Procedurally synthesized inside the browser audio thread (Zero external MP3 files):
  - Gentle Ambient Rain
  - Cozy Fireplace Crackle
  - Lofi Vinyl Saturation
  - Deep Brown Noise (432Hz sleep resonance)
  - Forest Wind
- **Mood Filters**: Categorize videos into *Chill & Calm*, *Deep Focus*, *Sleep & Night*, *Laughs & Joy*, *Learn & Wisdom*, and *Inspiration*.
- **Tactile Micro-Haptics**: Apple-grade physics transitions (`cubic-bezier(0.16, 1, 0.3, 1)`) and procedural audio click blips.
