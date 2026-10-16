import React, { useState } from 'react';
import { RemoteDevice, ShortcutKey, ControlScheme } from '../types';
import { WheelFolderRenderer, ListFolderRenderer } from './FolderViewRenderer';
import { HudWidgetRenderer } from './HudWidgetRenderer';
import {
  Zap,
  SlidersHorizontal,
  Gamepad2,
  Maximize2,
  Minimize2,
  Home,
  X,
  Check,
} from 'lucide-react';

interface Props {
  device: RemoteDevice;
  keys: ShortcutKey[];
  activeScheme: ControlScheme;
  schemes: ControlScheme[];
  onSelectScheme: (schemeId: string) => void;
  onOpenSchemeManager?: () => void;
  onEnterEditMode: () => void;
  onReturnHome: () => void;
}

export const Tier1ControlCanvas: React.FC<Props> = ({
  device,
  keys,
  activeScheme,
  schemes,
  onSelectScheme,
  onOpenSchemeManager,
  onEnterEditMode,
  onReturnHome,
}) => {
  const [pressedKeyId, setPressedKeyId] = useState<string | null>(null);
  const [pressedSlotKey, setPressedSlotKey] = useState<string | null>(null);
  const [lastTriggeredKey, setLastTriggeredKey] = useState<string>('');
  const [expandedFolderIds, setExpandedFolderIds] = useState<Record<string, boolean>>({});

  // Menu popup state triggered by key-system-menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSchemePicker, setShowSchemePicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playClickSound = (freq = 440) => {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch {
      // ignore
    }
  };

  const handleKeyPress = (key: ShortcutKey) => {
    if (key.id === 'key-system-menu' || key.isSystemAction || key.primaryKey === 'menu') {
      setIsMenuOpen((prev) => !prev);
      setShowSchemePicker(false);
      playClickSound(580);
      return;
    }
    setPressedKeyId(key.id);
    setLastTriggeredKey(`${key.name} [${key.keyLabel}]`);
    playClickSound(520);
    setTimeout(() => setPressedKeyId(null), 180);
  };

  const handleSlotPress = (label: string, keyName: string) => {
    setPressedSlotKey(label);
    setLastTriggeredKey(`${keyName} [${label}]`);
    playClickSound(660);
    setTimeout(() => setPressedSlotKey(null), 180);
  };

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolderIds((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
    playClickSound(380);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    setIsMenuOpen(false);
  };

  // Find user-configured movable HUD key or fallback
  const hudKey = keys.find((k) => k.keyType === 'hud') || {
    id: 'key-hud-stats',
    name: '性能监控',
    keyLabel: 'HUD',
    primaryKey: 'hud',
    modifiers: [],
    keyType: 'hud' as const,
    sizePercent: 100,
    opacityPercent: 85,
    actionType: 'click' as const,
    shape: 'pill' as const,
    voice: false,
    hint: false,
    vibrate: false,
    visible: true,
    x: 50,
    y: 6,
  };

  // Find menu key for popover positioning
  const menuKey = keys.find((k) => k.id === 'key-system-menu' || k.isSystemAction) || {
    x: 93,
    y: 8,
  };

  return (
    <div
      onClick={() => isMenuOpen && setIsMenuOpen(false)}
      className="relative w-full h-full bg-black overflow-hidden select-none font-sans"
    >
      {/* 1. Live Remote Stream Video (100% Fullscreen) */}
      <div className="absolute inset-0 z-0">
        <img
          src={device.thumbnail}
          alt={device.name}
          className="w-full h-full object-cover filter brightness-[0.80] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* 2. Performance HUD Widget */}
      {hudKey.visible !== false && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
          style={{
            left: `${hudKey.x}%`,
            top: `${hudKey.y}%`,
          }}
        >
          <HudWidgetRenderer
            shortcut={hudKey}
            fps={device.fps}
            ping={device.ping}
            bitrate={device.bitrate || '12MB/s'}
            battery={98}
            isLandscape={true}
          />
        </div>
      )}

      {/* 3. Center Live Trigger Toast Feedback */}
      {lastTriggeredKey && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 border border-blue-500/40 text-blue-300 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-none">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>触发: {lastTriggeredKey}</span>
        </div>
      )}

      {/* 4. System Menu Popup (Triggered by menu shortcut button) */}
      {isMenuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            right: `${Math.max(12, 100 - menuKey.x)}%`,
            top: `${Math.min(menuKey.y + 7, 72)}%`,
            position: 'absolute',
            zIndex: 9999,
          }}
          className="w-52 bg-[#121218]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex flex-col gap-1.5 animate-in fade-in zoom-in-95 pointer-events-auto"
        >
          <div className="flex items-center justify-between px-1.5 py-1 border-b border-white/10 mb-0.5">
            <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
              {device.name} · 功能菜单
            </span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              onEnterEditMode();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>进入按键编辑</span>
          </button>

          {/* Switch Layout (Secondary Scheme Modal) */}
          <div className="relative">
            <button
              onClick={() => {
                if (onOpenSchemeManager) {
                  onOpenSchemeManager();
                  setIsMenuOpen(false);
                } else {
                  setShowSchemePicker(!showSchemePicker);
                }
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/90 text-xs font-medium transition-all cursor-pointer group"
              title="进入二级布局方案管理与预览"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Gamepad2 className="w-3.5 h-3.5 text-[#0A84FF] group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">切换布局</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-blue-400 font-semibold truncate max-w-[70px]">
                  {activeScheme.name}
                </span>
                <span className="text-[10px] text-white/40">›</span>
              </div>
            </button>

            {/* Fallback inline Scheme Picker if onOpenSchemeManager is not provided */}
            {!onOpenSchemeManager && showSchemePicker && (
              <div className="mt-1 p-1 rounded-xl bg-[#1A1A24] border border-white/15 flex flex-col gap-1 max-h-36 overflow-y-auto">
                {schemes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectScheme(s.id);
                      setShowSchemePicker(false);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer ${
                      s.id === activeScheme.id
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    {s.id === activeScheme.id && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/90 text-xs font-medium transition-all cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{isFullscreen ? '窗口模式' : '全屏模式'}</span>
          </button>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              onReturnHome();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-rose-400" />
            <span>退出串流</span>
          </button>
        </div>
      )}

      {/* 5. Virtual Keys Canvas Layer */}
      <div className="absolute inset-0 z-10 w-full h-full pointer-events-none">
        {keys.map((k) => {
          if (!k.visible || k.folderId || k.keyType === 'hud') return null;

          const isPressed = pressedKeyId === k.id;
          const isWheel = k.keyType === 'wheel-folder';
          const isList = k.keyType === 'list-folder';
          const isFolder = isWheel || isList;
          const isFolderExpanded = !!expandedFolderIds[k.id];
          const isSystemMenu = k.id === 'key-system-menu' || k.isSystemAction;

          const sizePx = Math.round((k.sizePercent / 100) * 58);
          const opacity = k.opacityPercent / 100;

          // A. Wheel Folder
          if (isWheel) {
            const collectedCount = (k.wheelConfig?.slots || []).filter((s) => !!s.sourceKeyId).length;
            return (
              <div
                key={k.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{
                  left: `${k.x}%`,
                  top: `${k.y}%`,
                  zIndex: isFolderExpanded ? 40 : 20,
                }}
              >
                <WheelFolderRenderer
                  shortcut={k}
                  isExpanded={isFolderExpanded}
                  onToggleExpand={() => toggleFolderExpanded(k.id)}
                  collectedCount={collectedCount}
                  onSlotClick={(label, name) => handleSlotPress(label, name || label)}
                />
              </div>
            );
          }

          // B. List Folder
          if (isList) {
            const collectedCount = (k.listFolderConfig?.slots || []).filter((s) => !!s.sourceKeyId).length;
            return (
              <div
                key={k.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{
                  left: `${k.x}%`,
                  top: `${k.y}%`,
                  zIndex: isFolderExpanded ? 40 : 20,
                }}
              >
                <ListFolderRenderer
                  shortcut={k}
                  isExpanded={isFolderExpanded}
                  onToggleExpand={() => toggleFolderExpanded(k.id)}
                  collectedCount={collectedCount}
                  onSlotClick={(label, name) => handleSlotPress(label, name || label)}
                />
              </div>
            );
          }

          // C. System Menu Button (Clean shortcut key with cyan halo)
          if (isSystemMenu) {
            return (
              <button
                key={k.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleKeyPress(k);
                }}
                style={{
                  left: `${k.x}%`,
                  top: `${k.y}%`,
                  width: `${sizePx}px`,
                  height: `${sizePx}px`,
                  opacity: Math.max(0.5, opacity),
                  transform: 'translate(-50%, -50%)',
                  zIndex: 45,
                }}
                className={`absolute pointer-events-auto select-none overflow-hidden p-1 flex flex-col items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 rounded-full bg-[#121218]/90 hover:bg-[#1A1A24] border-2 border-cyan-400/60 hover:border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)] text-white ${
                  isPressed ? 'scale-110 ring-4 ring-cyan-400' : ''
                }`}
                title="系统功能菜单"
              >
                <SlidersHorizontal className="w-5 h-5 text-cyan-300" />
                <span className="text-[8px] text-cyan-200/80 font-medium leading-none mt-0.5">
                  菜单
                </span>
              </button>
            );
          }

          // D. Standard Virtual Key
          const lblLen = (k.keyLabel || '').length;
          const labelClass =
            lblLen <= 2
              ? 'text-lg sm:text-xl font-black'
              : lblLen <= 4
              ? 'text-xs sm:text-sm font-bold'
              : 'text-[10px] font-bold';

          return (
            <button
              key={k.id}
              onClick={() => handleKeyPress(k)}
              style={{
                left: `${k.x}%`,
                top: `${k.y}%`,
                width: `${sizePx}px`,
                height: `${sizePx}px`,
                opacity: opacity,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute pointer-events-auto select-none overflow-hidden p-1 flex flex-col items-center justify-center transition-all duration-150 cursor-pointer active:scale-90 ${
                k.shape === 'circle'
                  ? 'rounded-full'
                  : k.shape === 'pill'
                  ? 'rounded-3xl'
                  : 'rounded-2xl'
              } bg-black/75 hover:bg-black/90 border border-white/25 shadow-xl text-white ${
                isPressed ? 'scale-110 ring-4 ring-blue-400 shadow-[0_0_25px_#0A84FF]' : ''
              }`}
            >
              <span className={`tracking-wider drop-shadow-md select-none truncate max-w-full px-0.5 text-center leading-none ${labelClass}`}>
                {k.keyLabel}
              </span>
              {k.hint && k.name && (
                <span className="text-[8px] sm:text-[9px] text-white/70 font-medium truncate max-w-full px-1 text-center leading-tight mt-0.5">
                  {k.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
