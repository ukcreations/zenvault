import React, { useState } from 'react';
import { Volume2, VolumeX, CloudRain, Flame, Disc, Radio, Wind, Sliders } from 'lucide-react';
import type { SoundscapeType } from '../types';
import { zenAudio } from '../lib/audioSynthesizer';

interface AmbientAudioPlayerProps {
  activeSoundscape: SoundscapeType;
  setActiveSoundscape: (sound: SoundscapeType) => void;
}

export const AmbientAudioPlayer: React.FC<AmbientAudioPlayerProps> = ({
  activeSoundscape,
  setActiveSoundscape
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.35);

  const presets: { id: SoundscapeType; label: string; icon: React.ReactNode }[] = [
    { id: 'off', label: 'Mute', icon: <VolumeX className="w-4 h-4" /> },
    { id: 'rain', label: 'Rain', icon: <CloudRain className="w-4 h-4" /> },
    { id: 'fireplace', label: 'Fire', icon: <Flame className="w-4 h-4" /> },
    { id: 'lofi', label: 'Lofi', icon: <Disc className="w-4 h-4" /> },
    { id: 'brown-noise', label: 'Brown', icon: <Radio className="w-4 h-4" /> },
    { id: 'forest', label: 'Wind', icon: <Wind className="w-4 h-4" /> },
  ];

  const handleSelect = (sound: SoundscapeType) => {
    zenAudio.playHapticClick(620, 0.04);
    setActiveSoundscape(sound);
    if (sound === 'off') {
      zenAudio.stopSoundscape();
    } else {
      zenAudio.startSoundscape(sound, volume);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    zenAudio.setVolume(val);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="liquid-crystal-panel border border-white/15 p-2 rounded-2xl shadow-2xl flex flex-col items-end gap-2">
        
        {/* Expanded Controls Drawer */}
        {isExpanded && (
          <div className="p-3 bg-[#07090e]/90 rounded-xl border border-white/10 w-64 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5">
                <Sliders className="w-3 h-3" />
                <span>SOUND ENGINE</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-1.5">
              {presets.map((p) => {
                const isActive = activeSoundscape === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className={`tactile-btn flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-medium border transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-md'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/5'
                    }`}
                  >
                    {p.icon}
                    <span className="mt-1">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Volume slider */}
            {activeSoundscape !== 'off' && (
              <div className="flex items-center gap-2 pt-1">
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg cursor-pointer"
                />
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            )}
          </div>
        )}

        {/* Floating Mini Pill */}
        <button
          onClick={() => {
            zenAudio.playHapticClick();
            setIsExpanded(!isExpanded);
          }}
          className={`tactile-btn flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all ${
            activeSoundscape !== 'off'
              ? 'bg-indigo-600/90 hover:bg-indigo-600 text-white border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
              : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border-white/10'
          }`}
        >
          {activeSoundscape !== 'off' ? (
            <>
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-full bg-white animate-pulse" />
                <span className="w-0.5 h-2 bg-white animate-pulse delay-75" />
                <span className="w-0.5 h-3 bg-white animate-pulse delay-150" />
              </div>
              <span className="text-xs font-semibold capitalize font-mono">{activeSoundscape}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold">Soundscape</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
