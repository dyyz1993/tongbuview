import React from 'react';
import { Wifi, BatteryCharging, Zap, Activity } from 'lucide-react';
import { ShortcutKey } from '../types';

interface Props {
  shortcut: ShortcutKey;
  fps?: number;
  ping?: number;
  bitrate?: string;
  battery?: number;
  isEditMode?: boolean;
  isSelected?: boolean;
  isLandscape?: boolean;
}

export const HudWidgetRenderer: React.FC<Props> = ({
  shortcut,
  fps = 120,
  ping = 4,
  bitrate = '12MB/s',
  battery = 98,
  isEditMode = false,
  isSelected = false,
  isLandscape = false,
}) => {
  const cfg = shortcut.hudConfig || {
    showFps: true,
    showPing: true,
    showBitrate: true,
    showBattery: true,
  };

  const opacity = (shortcut.opacityPercent ?? 85) / 100;
  const scale = (shortcut.sizePercent ?? 100) / 100;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
      className={`select-none pointer-events-auto transition-all ${
        isSelected && isEditMode
          ? 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
          : ''
      } rounded-full`}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/80 hover:bg-black/90 backdrop-blur-2xl border border-white/20 shadow-2xl text-[11px] sm:text-xs font-mono text-white/90">
        {/* Live Status Pulse */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        {/* 1. Network Ping */}
        {cfg.showPing !== false && (
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{ping}ms</span>
          </div>
        )}

        <span className="text-white/20">|</span>

        {/* 2. FPS */}
        {cfg.showFps !== false && (
          <div className="flex items-center gap-1">
            <span className="text-white font-semibold">{fps}</span>
            <span className="text-[9px] text-white/50 uppercase">FPS</span>
          </div>
        )}

        <span className="text-white/20">|</span>

        {/* 3. Bitrate */}
        {cfg.showBitrate !== false && (
          <div className="flex items-center gap-1">
            <span className="text-cyan-300">{bitrate}</span>
          </div>
        )}

        <span className="text-white/20">|</span>

        {/* 4. Battery */}
        {cfg.showBattery !== false && (
          <div className="flex items-center gap-1 text-emerald-400">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-[11px] text-white/90 font-medium">{battery}%</span>
          </div>
        )}

        {/* Edit Tag (Only visible in editor when selected) */}
        {isEditMode && isSelected && (
          <span className="ml-1 text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-sans shrink-0">
            可拖动HUD
          </span>
        )}
      </div>
    </div>
  );
};
