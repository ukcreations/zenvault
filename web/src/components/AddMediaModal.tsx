import React, { useState } from 'react';
import {
  X,
  Link2,
  Upload,
  FileJson,
  Check,
  AlertCircle,
  Radio,
  Loader2,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VideoItem } from '../types';
import { extractPlatformAndId, fetchMetadataForUrl } from '../lib/youtubeApi';
import { parseInstagramExport } from '../lib/storage';
import { useToast } from './Toast';

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
  onBulkAdd,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'json' | 'extension'>('url');
  const { success, error: toastError } = useToast();

  // URL Tab state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [thumbnail, setThumbnail] = useState('');
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
      notes: notes.trim() || undefined,
      addedAt: new Date().toISOString(),
      isLiked: true,
      source: 'manual',
    };

    onAddVideo(newVideo);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    success('Video added', newVideo.title);

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
        success('Instagram backup imported', `${items.length} clips added.`);
      } catch (err: any) {
        const errMsg = err.message || 'Error parsing file.';
        setJsonError(errMsg);
        toastError('Failed to parse JSON', errMsg);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#181818] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#212121]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#f1f1f1]">
                Add Video to Sanctuary
              </h2>
              <p className="text-[11px] text-[#aaaaaa]">
                Paste any YouTube, Instagram, or Web video link
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#aaaaaa] hover:text-[#f1f1f1] hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Segmented Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-white/10 bg-[#181818]">
          <div className="flex items-center p-1 rounded-xl bg-[#212121] border border-white/10">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'url'
                  ? 'bg-white/15 text-[#f1f1f1] shadow-sm'
                  : 'text-[#aaaaaa] hover:text-[#f1f1f1]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Direct Link</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'json'
                  ? 'bg-white/15 text-[#f1f1f1] shadow-sm'
                  : 'text-[#aaaaaa] hover:text-[#f1f1f1]'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Insta JSON</span>
            </button>

            <button
              onClick={() => setActiveTab('extension')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'extension'
                  ? 'bg-white/15 text-[#f1f1f1] shadow-sm'
                  : 'text-[#aaaaaa] hover:text-[#f1f1f1]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Extension</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: DIRECT URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleSubmitUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#f1f1f1] mb-1.5">
                  Video URL <span className="text-[#ff0000]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onBlur={handleUrlBlur}
                    placeholder="https://www.youtube.com/watch?v=... or instagram.com/reel/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#212121] border border-white/10 text-xs text-[#f1f1f1] placeholder-[#717171] focus:outline-none focus:border-white/30 transition-all"
                  />
                  {isFetchingMeta && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] text-zinc-300">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching info...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#aaaaaa] mb-1.5">
                    Custom Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Auto-detected if empty"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#212121] border border-white/10 text-xs text-[#f1f1f1] placeholder-[#717171] focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#aaaaaa] mb-1.5">
                    Creator / Channel
                  </label>
                  <input
                    type="text"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    placeholder="e.g. Veritasium, Kurzgesagt"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#212121] border border-white/10 text-xs text-[#f1f1f1] placeholder-[#717171] focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#aaaaaa] mb-1.5">
                  Personal Note (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why did you save this?"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#212121] border border-white/10 text-xs text-[#f1f1f1] placeholder-[#717171] focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 text-xs font-bold"
                >
                  Save to Library
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: INSTAGRAM JSON BACKUP */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#212121] border border-white/10 text-xs text-[#aaaaaa] space-y-2">
                <p className="font-semibold text-[#f1f1f1]">
                  Bulk Import Saved Instagram Reels:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#aaaaaa]">
                  <li>Open Instagram: Settings → Your Activity → Download your information.</li>
                  <li>Select JSON format and check "Saved Posts".</li>
                  <li>Extract the downloaded zip and drop <code className="text-white">saved_posts.json</code> below.</li>
                </ol>
              </div>

              <label className="border-2 border-dashed border-white/15 hover:border-white/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#212121] hover:bg-[#282828]">
                <Upload className="w-8 h-8 text-white mb-2" />
                <span className="text-xs font-bold text-[#f1f1f1]">
                  Click to select saved_posts.json
                </span>
                <span className="text-[10px] text-[#717171] mt-1">
                  Supports official Instagram data export files
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {jsonSuccessCount !== null && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Successfully imported {jsonSuccessCount} reels!</span>
                </div>
              )}

              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{jsonError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHROME EXTENSION GUIDE */}
          {activeTab === 'extension' && (
            <div className="space-y-4 text-xs text-[#aaaaaa]">
              <div className="p-4 rounded-xl bg-[#212121] border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-[#f1f1f1] font-bold">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>ReWatch Everywhere Chrome Extension Bridge</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Save Instagram Reels, YouTube videos, and web clips directly in 1 click while browsing.
                </p>
                <div className="p-2.5 rounded-lg bg-[#121212] border border-white/10 font-mono text-[10px] text-zinc-300">
                  C:\Users\UJJWAL KUMAR\.gemini\antigravity\scratch\zenvault\extension
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Open <code className="text-[#f1f1f1]">chrome://extensions</code> in Chrome.</li>
                  <li>Enable <strong>Developer mode</strong>.</li>
                  <li>Click <strong>Load unpacked</strong> and select the directory above.</li>
                  <li>A floating "⚡ Beam to ReWatch Everywhere" button will appear on all reels!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
