import React, { useState } from 'react';
import { X, Link2, Upload, FileJson, Sparkles, Check, AlertCircle, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VideoItem, MoodType } from '../types';
import { extractPlatformAndId, fetchMetadataForUrl } from '../lib/youtubeApi';
import { parseInstagramExport } from '../lib/storage';
import { zenAudio } from '../lib/audioSynthesizer';

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (video: VideoItem) => void;
  onBulkAdd: (videos: VideoItem[]) => void;
}

export const AddMediaModal: React.FC<AddMediaModalProps> = ({
  isOpen,
  onClose,
  onAddVideo,
  onBulkAdd
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'json' | 'extension'>('url');
  
  // URL Tab state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [mood, setMood] = useState<MoodType>('chill');
  const [notes, setNotes] = useState('');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  // JSON Tab state
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSuccessCount, setJsonSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleUrlBlur = async () => {
    if (!url.trim()) return;
    setIsFetchingMeta(true);
    try {
      const meta = await fetchMetadataForUrl(url);
      if (meta.title && !title) setTitle(meta.title);
      if (meta.author && !channel) setChannel(meta.author);
      if (meta.thumbnail && !thumbnail) setThumbnail(meta.thumbnail);
    } catch (e) {
      // Ignore
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const { platform } = extractPlatformAndId(url);

    const newVideo: VideoItem = {
      id: 'custom_' + Date.now(),
      url: url.trim(),
      title: title.trim() || `${platform.toUpperCase()} Video Clip`,
      platform: platform,
      channel: channel.trim() || undefined,
      thumbnail: thumbnail.trim() || undefined,
      mood: mood,
      notes: notes.trim() || undefined,
      addedAt: new Date().toISOString(),
      isLiked: true,
      source: 'manual'
    };

    onAddVideo(newVideo);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    zenAudio.playHapticClick(880, 0.08);

    setUrl('');
    setTitle('');
    setChannel('');
    setThumbnail('');
    setNotes('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonError(null);
    setJsonSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const items = parseInstagramExport(text);
        if (items.length === 0) {
          setJsonError('No saved reels or posts found in this file.');
          return;
        }

        onBulkAdd(items);
        setJsonSuccessCount(items.length);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        zenAudio.playHapticClick(800, 0.1);
      } catch (err: any) {
        setJsonError(err.message || 'Error parsing file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl ios-glass-panel overflow-hidden border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.85)]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#06080e]/60 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <div className="w-full h-full bg-[#06080e]/80 rounded-[15px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add to ZenVault</h2>
              <p className="text-[11px] text-slate-400">Ingest your peaceful media stash</p>
            </div>
          </div>
          <button
            onClick={() => { zenAudio.playHapticClick(); onClose(); }}
            className="p-2.5 rounded-full ios-btn-glass text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (iOS Segmented Control) */}
        <div className="p-4 bg-white/[0.01] border-b border-white/8 flex justify-center">
          <div className="ios-segmented-control flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('url')}
              className={`px-4 py-1.5 rounded-full font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'url'
                  ? 'ios-segmented-item-active'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Single Video</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-4 py-1.5 rounded-full font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'json'
                  ? 'ios-segmented-item-active'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Instagram Data</span>
            </button>
            <button
              onClick={() => setActiveTab('extension')}
              className={`px-4 py-1.5 rounded-full font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'extension'
                  ? 'ios-segmented-item-active'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Extension Bridge</span>
            </button>
          </div>
        </div>

        {/* Tab 1: URL Ingester */}
        {activeTab === 'url' && (
          <form onSubmit={handleSubmitUrl} className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-indigo-300 font-bold mb-2">
                Video or Reel URL *
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://www.youtube.com/watch?v=... or instagram.com/reel/..."
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/12 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-xl transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1.5 block">
                Supports YouTube, Instagram Reels, TikTok, Vimeo, and web clips.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2">
                  Title {isFetchingMeta && <span className="text-indigo-400 animate-pulse">(Auto-fetching...)</span>}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Calming title..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/12 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400/60 focus:bg-white/[0.08] backdrop-blur-xl transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2">
                  Mood / Energy
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as MoodType)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-white/12 text-white text-xs focus:outline-none focus:border-indigo-400/60 backdrop-blur-xl transition-all"
                >
                  <option value="chill">Chill & Calm</option>
                  <option value="deep-focus">Deep Focus</option>
                  <option value="sleep">Sleep & Night</option>
                  <option value="comedy">Laughs & Joy</option>
                  <option value="learn">Learn & Wisdom</option>
                  <option value="inspiration">Inspiration</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 font-bold mb-2">
                Personal Note / Why you saved it
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Watch on rainy Sundays..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/12 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400/60 focus:bg-white/[0.08] backdrop-blur-xl transition-all"
              />
            </div>

            <button
              type="submit"
              className="ios-btn-primary mt-2 w-full py-3.5 rounded-2xl text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
            >
              Save to ZenVault
            </button>
          </form>
        )}

        {/* Tab 2: Instagram Data File Import */}
        {activeTab === 'json' && (
          <div className="p-6 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed">
              <span className="font-bold">How to export your Instagram Saved posts:</span>
              <ol className="list-decimal list-inside mt-2 text-slate-300 text-[11px] space-y-1">
                <li>On Instagram, go to <strong>Settings → Your Activity</strong></li>
                <li>Click <strong>Download your information</strong></li>
                <li>Select only <strong>Saved Posts</strong> (JSON format)</li>
                <li>Drag & drop the downloaded <code className="bg-white/10 px-1 py-0.5 rounded text-white">saved_posts.json</code> file below:</li>
              </ol>
            </div>

            <label className="border-2 border-dashed border-white/15 hover:border-indigo-400/60 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-white/[0.02] hover:bg-white/[0.04]">
              <Upload className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
              <span className="text-xs font-bold text-white mb-1">Click or drag saved_posts.json here</span>
              <span className="text-[10px] text-slate-400">Instant batch import of your private saved reels</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {jsonSuccessCount !== null && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Successfully imported {jsonSuccessCount} saved reels into your ZenVault!</span>
              </div>
            )}

            {jsonError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{jsonError}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Extension Bridge Instructions */}
        {activeTab === 'extension' && (
          <div className="p-6 flex flex-col gap-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>ZenVault Bridge Extension Ready to Load</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                The extension has been generated in your project folder:
              </p>
              <code className="block p-2.5 rounded-xl bg-black/60 text-[10px] font-mono text-indigo-300 break-all select-all border border-white/8">
                C:\Users\UJJWAL KUMAR\.gemini\antigravity\scratch\zenvault\extension
              </code>
            </div>

            <div className="space-y-1.5 text-[11px] bg-white/[0.02] p-4 rounded-2xl border border-white/8">
              <div className="font-semibold text-white mb-1">How to activate it in Chrome:</div>
              <div>1. Open Chrome and navigate to <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">chrome://extensions</code></div>
              <div>2. Toggle ON <strong>Developer mode</strong> (top right switch).</div>
              <div>3. Click <strong>Load unpacked</strong>.</div>
              <div>4. Select the <code className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">zenvault\extension</code> folder.</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
              ✨ Now whenever you browse Instagram Reels or YouTube, simply click the floating <strong>"Beam to ZenVault"</strong> button to send clips directly into this sanctuary!
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
