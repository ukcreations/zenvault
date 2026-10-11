import React from 'react';
import { Radio, Download, Sparkles } from 'lucide-react';
import { zenAudio } from '../lib/audioSynthesizer';

interface ExtensionBridgeBannerProps {
  extensionLinked: boolean;
  queuedExtensionCount: number;
  onImportQueued: () => void;
  onOpenExtensionGuide: () => void;
}

export const ExtensionBridgeBanner: React.FC<ExtensionBridgeBannerProps> = ({
  extensionLinked,
  queuedExtensionCount,
  onImportQueued,
  onOpenExtensionGuide
}) => {
  if (extensionLinked && queuedExtensionCount > 0) {
    return (
      <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{queuedExtensionCount} New Clip{queuedExtensionCount > 1 ? 's' : ''} Beamed from Browser</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Bridge Ready
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Saved from Instagram Reels or YouTube while browsing.
            </div>
          </div>
        </div>

        <button
          onClick={() => { zenAudio.playHapticClick(850); onImportQueued(); }}
          className="tactile-btn whitespace-nowrap px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>Import All into Sanctuary</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full mb-6 p-3.5 rounded-2xl bg-white/[0.02] border border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 text-slate-400">
        <span className="text-base">💎</span>
        <span>
          <strong className="text-slate-200">Chrome Extension Bridge:</strong> Save Instagram Reels, TikToks, and YouTube clips with 1 click directly from the page.
        </span>
      </div>

      <button
        onClick={() => { zenAudio.playHapticClick(); onOpenExtensionGuide(); }}
        className="tactile-btn whitespace-nowrap text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>View Setup Guide</span>
      </button>
    </div>
  );
};
