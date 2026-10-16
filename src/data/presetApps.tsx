import React from 'react';
import { AppProfile, ShortcutKey } from '../types';

export const PRESET_APPS: AppProfile[] = [
  { id: 'all', name: '全部应用', iconType: 'all', description: '全局通用快捷键' },
  { id: 'codex', name: 'Codex', iconType: 'codex', description: 'AI 代码辅助与交互' },
  { id: 'zcode', name: 'ZCode', iconType: 'zcode', description: '下一代极速编辑器' },
  { id: 'vscode', name: 'VS Code', iconType: 'vscode', description: '代码编辑与调试' },
  { id: 'chrome', name: 'Chrome', iconType: 'chrome', description: '网页浏览与开发者工具' },
  { id: 'safari', name: 'Safari', iconType: 'safari', description: '苹果生态高速浏览器' },
];

export const SYSTEM_ACTIONS: { id: string; category: 'media' | 'capture' | 'window'; name: string; icon: string; shortcutText: string }[] = [
  // 媒体控制
  { id: 'media-play', category: 'media', name: '播放 / 暂停', icon: '⏯', shortcutText: 'Play/Pause' },
  { id: 'media-prev', category: 'media', name: '上一首', icon: '⏮', shortcutText: 'Previous Track' },
  { id: 'media-next', category: 'media', name: '下一首', icon: '⏭', shortcutText: 'Next Track' },
  { id: 'media-vol-up', category: 'media', name: '增加音量', icon: '🔊', shortcutText: 'Volume Up' },
  { id: 'media-vol-down', category: 'media', name: '减小音量', icon: '🔉', shortcutText: 'Volume Down' },
  { id: 'media-mute', category: 'media', name: '静音', icon: '🔇', shortcutText: 'Mute Audio' },
  // 截图与录屏
  { id: 'capture-fullscreen', category: 'capture', name: '全屏截图', icon: '📸', shortcutText: '⌘ ⇧ 3' },
  { id: 'capture-area', category: 'capture', name: '区域截图', icon: '✂️', shortcutText: '⌘ ⇧ 4' },
  { id: 'capture-screenrecord', category: 'capture', name: '屏幕录制', icon: '🎥', shortcutText: '⌘ ⇧ 5' },
  // 窗口与桌面
  { id: 'window-mission', category: 'window', name: '调度中心', icon: '🪟', shortcutText: 'Mission Control' },
  { id: 'window-desktop', category: 'window', name: '显示桌面', icon: '🖥', shortcutText: 'Show Desktop' },
  { id: 'window-switch', category: 'window', name: '切换应用', icon: '🔄', shortcutText: '⌘ Tab' },
];

export const INITIAL_SHORTCUT: ShortcutKey = {
  id: 'shortcut-1',
  name: '快捷键 1',
  keyLabel: 'W',
  primaryKey: 'W',
  sizePercent: 80,
  opacityPercent: 100,
  actionType: 'click',
  shape: 'circle',
  voice: true,
  hint: true,
  vibrate: false,
  modifiers: [],
  visible: true,
  x: 50,
  y: 48,
};

export const AppIconRenderer: React.FC<{
  type: string;
  size?: number;
  className?: string;
}> = ({ type, size = 32, className = '' }) => {
  const pixelSize = `${size}px`;

  switch (type) {
    case 'all':
      return (
        <div
          style={{ width: pixelSize, height: pixelSize }}
          className={`flex items-center justify-center rounded-xl bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] border border-white/10 shadow-sm ${className}`}
        >
          <div className="grid grid-cols-2 gap-[2.5px] p-1.5">
            <span className="w-2 h-2 rounded-[2px] border-[1.5px] border-white/90" />
            <span className="w-2 h-2 rounded-[2px] border-[1.5px] border-white/90" />
            <span className="w-2 h-2 rounded-[2px] border-[1.5px] border-white/90" />
            <span className="w-2 h-2 rounded-[2px] border-[1.5px] border-white/90" />
          </div>
        </div>
      );

    case 'codex':
      return (
        <div
          style={{ width: pixelSize, height: pixelSize }}
          className={`flex items-center justify-center rounded-xl bg-[#10A37F] bg-gradient-to-b from-[#19c37d] to-[#108e6c] border border-white/15 shadow-sm text-white ${className}`}
        >
          {/* OpenAI / Codex Swirl Icon */}
          <svg
            viewBox="0 0 24 24"
            width={size * 0.65}
            height={size * 0.65}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" opacity="0.2" fill="white" />
            <path d="M12 3a9 9 0 0 1 7.8 4.5l-4.5 2.6A3.8 3.8 0 0 0 12 8.4V3z" fill="white" />
            <path d="M19.8 7.5A9 9 0 0 1 21 12a9 9 0 0 1-1.2 4.5l-4.5-2.6a3.8 3.8 0 0 0 1.5-3.3l4-3.1z" fill="white" />
            <path d="M19.8 16.5A9 9 0 0 1 12 21a9 9 0 0 1-7.8-4.5l4.5-2.6A3.8 3.8 0 0 0 12 15.6v5.4z" fill="white" />
            <path d="M4.2 16.5A9 9 0 0 1 3 12a9 9 0 0 1 1.2-4.5l4.5 2.6A3.8 3.8 0 0 0 7.2 13.4l-3 3.1z" fill="white" />
            <path d="M4.2 7.5A9 9 0 0 1 12 3v5.4a3.8 3.8 0 0 0-3.3 1.5L4.2 7.5z" fill="white" />
          </svg>
        </div>
      );

    case 'zcode':
      return (
        <div
          style={{ width: pixelSize, height: pixelSize }}
          className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#7928CA] via-[#9E00FF] to-[#D800FF] border border-white/20 shadow-md ${className}`}
        >
          <span className="text-white font-black text-sm tracking-tight drop-shadow">
            Z
          </span>
        </div>
      );

    case 'vscode':
      return (
        <div
          style={{ width: pixelSize, height: pixelSize }}
          className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0066B8] via-[#007ACC] to-[#0098FF] border border-white/15 shadow-sm p-1 ${className}`}
        >
          {/* VS Code stylized ribbon SVG */}
          <svg viewBox="0 0 24 24" width={size * 0.7} height={size * 0.7} fill="currentColor" className="text-white">
            <path d="M17.5 2.2a1.8 1.8 0 0 0-1.2.5L7.8 9.8 4.3 7.1a1 1 0 0 0-1.3.1l-1.2 1a1 1 0 0 0-.2 1.3l3.6 4.5-3.6 4.5a1 1 0 0 0 .2 1.3l1.2 1a1 1 0 0 0 1.3.1l3.5-2.7 8.5 7.1c.4.3.9.4 1.4.2a1.8 1.8 0 0 0 1.1-1.6V3.8a1.8 1.8 0 0 0-1.3-1.6zM17 17.5l-6.5-5.5L17 6.5v11z" />
          </svg>
        </div>
      );

    case 'chrome':
      return (
        <div
          style={{ width: pixelSize, height: pixelSize }}
          className={`flex items-center justify-center rounded-xl bg-white border border-white/10 shadow-sm overflow-hidden p-0.5 ${className}`}
        >
          <svg viewBox="0 0 100 100" width={size * 0.85} height={size * 0.85}>
            {/* Chrome Pinwheel */}
            <circle cx="50" cy="50" r="48" fill="#ECEFF1" />
            <path d="M50 50 L50 4 A46 46 0 0 1 89.8 27 L50 50 Z" fill="#EA4335" />
            <path d="M50 50 L89.8 27 A46 46 0 0 1 65.7 92.4 L50 50 Z" fill="#FBBC05" />
            <path d="M50 50 L65.7 92.4 A46 46 0 0 1 10.2 73 L50 50 Z" fill="#34A853" />
            <path d="M50 50 L10.2 73 A46 46 0 0 1 50 4 L50 50 Z" fill="#EA4335" />
            {/* Inner White Ring & Blue Center */}
            <circle cx="50" cy="50" r="22" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="17" fill="#1A73E8" />
          </svg>
        </div>
      );

    case 'safari':
      return (
        <div
          style={{ width: pixelSize, height: pixelSize }}
          className={`flex items-center justify-center rounded-xl bg-gradient-to-b from-[#419BF9] to-[#046CE8] border border-white/20 shadow-sm p-1 ${className}`}
        >
          <svg viewBox="0 0 100 100" width={size * 0.8} height={size * 0.8}>
            <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="3" opacity="0.6" />
            {/* Compass marks */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="8"
                x2="50"
                y2="14"
                stroke="white"
                strokeWidth="2.5"
                transform={`rotate(${deg} 50 50)`}
                opacity="0.8"
              />
            ))}
            {/* Needle */}
            <polygon points="50,15 57,50 50,50" fill="#FF3B30" />
            <polygon points="50,85 57,50 50,50" fill="#FFFFFF" />
            <polygon points="50,15 43,50 50,50" fill="#E62C22" />
            <polygon points="50,85 43,50 50,50" fill="#D8D8D8" />
            <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
          </svg>
        </div>
      );

    default:
      return (
        <div
          style={{ width: pixelSize, height: pixelSize }}
          className={`flex items-center justify-center rounded-xl bg-white/10 border border-white/15 text-white/80 ${className}`}
        >
          <span className="text-xs font-semibold">{type.slice(0, 1).toUpperCase()}</span>
        </div>
      );
  }
};
