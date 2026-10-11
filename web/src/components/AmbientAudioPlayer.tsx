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
      <div className="flex flex-col items-end gap-2.5">
        
        {/* Expanded iOS Control Center Sheet */}
        {isExpanded && (
          <div className="ios-glass-panel p-4 w-72 flex flex-col gap-3.5 animate-in fade-in slide-in-from-bottom-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>SOUND ENGINE</span>
              </span>
              <span className="text-[11px] font-mono text-slate-300 font-semibold">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p) => {
                const isActive = activeSoundscape === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl text-[11px] font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.4)] border border-white/30 scale-[1.03]'
                        : 'bg-white/[0.04] text-slate-300 hover:text-white border border-white/8 hover:bg-white/[0.08]'
                    }`}
                  >
                    {p.icon}
                    <span className="mt-1 font-semibold">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Volume slider */}
            {activeSoundscape !== 'off' && (
              <div className="flex items-center gap-2.5 pt-1">
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-indigo-500 h-1.5 bg-white/20 rounded-full cursor-pointer"
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
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full border transition-all duration-300 ${
            activeSoundscape !== 'off'
              ? 'ios-btn-primary text-white shadow-[0_0_24px_rgba(99,102,241,0.45)]'
              : 'ios-btn-glass text-slate-200 shadow-lg'
          }`}
        >
          {activeSoundscape !== 'off' ? (
            <>
              <div className="flex items-end gap-[2px] h-3.5">
                <span className="w-0.5 bg-white rounded-full wave-bar-1" />
                <span className="w-0.5 bg-white rounded-full wave-bar-2" />
                <span className="w-0.5 bg-white rounded-full wave-bar-3" />
                <span className="w-0.5 bg-white rounded-full wave-bar-4" />
              </div>
              <span className="text-xs font-bold capitalize font-mono">{activeSoundscape}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-indigo-300" />
              <span className="text-xs font-semibold">Soundscape</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
