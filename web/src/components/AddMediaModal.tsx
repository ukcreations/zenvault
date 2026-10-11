import React, { useState } from 'react';
import {
  X,
  Link2,
  Upload,
  FileJson,
  Sparkles,
  Check,
  AlertCircle,
  Radio,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { VideoItem, MoodType } from '../types';
import { extractPlatformAndId, fetchMetadataForUrl } from '../lib/youtubeApi';
import { parseInstagramExport } from '../lib/storage';
import { zenAudio } from '../lib/audioSynthesizer';
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
      source: 'manual',
    };

    onAddVideo(newVideo);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    zenAudio.playHapticClick(880, 0.08);
    success('Video added to vault', newVideo.title);

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
        success('Instagram backup imported', `${items.length} clips added to vault.`);
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
      <div className="relative w-full max-w-lg rounded-2xl bg-[#11131A] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07] bg-[#141722]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F4F5FA] font-display">
                Curate Video to Sanctuary
              </h2>
              <p className="text-[11px] text-[#8E95A5]">
                Save without algorithmic recommendations or comments
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              zenAudio.playHapticClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#8E95A5] hover:text-[#F4F5FA] hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Segmented Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-white/[0.06] bg-[#11131A]">
          <div className="flex items-center p-1 rounded-xl bg-[#171A23] border border-white/[0.06]">
            <button
              onClick={() => {
                zenAudio.playHapticClick(600, 0.02);
                setActiveTab('url');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'url'
                  ? 'bg-[#1E222E] text-[#F4F5FA] shadow-sm'
                  : 'text-[#8E95A5] hover:text-[#F4F5FA]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Direct Link</span>
            </button>

            <button
              onClick={() => {
                zenAudio.playHapticClick(600, 0.02);
                setActiveTab('json');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'json'
                  ? 'bg-[#1E222E] text-[#F4F5FA] shadow-sm'
                  : 'text-[#8E95A5] hover:text-[#F4F5FA]'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Insta JSON</span>
            </button>

            <button
              onClick={() => {
                zenAudio.playHapticClick(600, 0.02);
                setActiveTab('extension');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'extension'
                  ? 'bg-[#1E222E] text-[#F4F5FA] shadow-sm'
                  : 'text-[#8E95A5] hover:text-[#F4F5FA]'
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
                <label className="block text-xs font-semibold text-[#F4F5FA] mb-1.5">
                  Video URL <span className="text-[#8B7CFF]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onBlur={handleUrlBlur}
                    placeholder="https://www.youtube.com/watch?v=... or instagram.com/reel/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#171A23] border border-white/[0.08] text-xs text-[#F4F5FA] placeholder-[#5E6573] focus:outline-none focus:border-[#8B7CFF]/60 focus:ring-1 focus:ring-[#8B7CFF]/30 transition-all"
                  />
                  {isFetchingMeta && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] text-[#8B7CFF]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching info...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8E95A5] mb-1.5">
                    Custom Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Auto-detected if left empty"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#171A23] border border-white/[0.08] text-xs text-[#F4F5FA] placeholder-[#5E6573] focus:outline-none focus:border-[#8B7CFF]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8E95A5] mb-1.5">
                    Creator / Channel
                  </label>
                  <input
                    type="text"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    placeholder="e.g. Veritasium, Lofi Girl"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#171A23] border border-white/[0.08] text-xs text-[#F4F5FA] placeholder-[#5E6573] focus:outline-none focus:border-[#8B7CFF]/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E95A5] mb-1.5">
                  Mood & Intent
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'chill', label: 'Chill & Calm' },
                      { id: 'deep-focus', label: 'Deep Focus' },
                      { id: 'sleep', label: 'Sleep & Night' },
                      { id: 'learn', label: 'Learn & Wisdom' },
                      { id: 'comedy', label: 'Laughs & Joy' },
                      { id: 'inspiration', label: 'Inspiration' },
                    ] as const
                  ).map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMood(m.id)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                        mood === m.id
                          ? 'bg-[#8B7CFF] text-[#08090D] font-bold shadow-sm'
                          : 'bg-[#171A23] text-[#8E95A5] hover:text-[#F4F5FA]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E95A5] mb-1.5">
                  Personal Reflection or Note (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why did you save this?"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#171A23] border border-white/[0.08] text-xs text-[#F4F5FA] placeholder-[#5E6573] focus:outline-none focus:border-[#8B7CFF]/60"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 rounded-xl text-xs font-bold"
                >
                  Save to Sanctuary
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: INSTAGRAM JSON BACKUP */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#171A23] border border-white/[0.07] text-xs text-[#8E95A5] space-y-2">
                <p className="font-semibold text-[#F4F5FA]">
                  Bulk Import Saved Instagram Reels:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#8E95A5]">
                  <li>Open Instagram: Settings → Your Activity → Download your information.</li>
                  <li>Select JSON format and check "Saved Posts".</li>
                  <li>Extract the downloaded zip and drop <code className="text-[#8B7CFF]">saved_posts.json</code> below.</li>
                </ol>
              </div>

              <label className="border-2 border-dashed border-white/15 hover:border-[#8B7CFF]/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#141722] hover:bg-[#171A28]">
                <Upload className="w-8 h-8 text-[#8B7CFF] mb-2 animate-bounce" />
                <span className="text-xs font-bold text-[#F4F5FA]">
                  Click to select saved_posts.json
                </span>
                <span className="text-[10px] text-[#5E6573] mt-1">
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
                  <span>Successfully ingested {jsonSuccessCount} reels!</span>
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
            <div className="space-y-4 text-xs text-[#8E95A5]">
              <div className="p-4 rounded-xl bg-[#171A23] border border-white/[0.07] space-y-2.5">
                <div className="flex items-center gap-2 text-[#F4F5FA] font-bold">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>ZenVault Chrome Extension Bridge</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Save Instagram Reels, YouTube videos, and any web video directly in 1 click while browsing.
                </p>
                <div className="p-2.5 rounded-lg bg-[#08090D] border border-white/5 font-mono text-[10px] text-[#8B7CFF]">
                  C:\Users\UJJWAL KUMAR\.gemini\antigravity\scratch\zenvault\extension
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px]">
                  <li>Open <code className="text-[#F4F5FA]">chrome://extensions</code> in Chrome.</li>
                  <li>Enable <strong>Developer mode</strong>.</li>
                  <li>Click <strong>Load unpacked</strong> and select the directory above.</li>
                  <li>A floating "⚡ Beam to ZenVault" button will appear on all reels!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
