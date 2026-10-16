import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Maximize2,
  Wifi,
  BatteryCharging,
  Zap,
  Gamepad2,
  ChevronDown,
  Sparkles,
  Layers,
  SlidersHorizontal,
  Home,
  Monitor,
} from 'lucide-react';
import { DeviceMode, AppViewLevel } from '../types';

interface Props {
  mode: DeviceMode;
  onModeChange: (mode: DeviceMode) => void;
  currentViewLevel: AppViewLevel;
  deviceName?: string;
  ping?: number;
  fps?: number;
  onReturnHome?: () => void;
  children: React.ReactNode;
}

export const MobileShell: React.FC<Props> = ({
  mode,
  onModeChange,
  currentViewLevel,
  deviceName,
  ping = 4,
  fps = 120,
  onReturnHome,
  children,
}) => {
  const [timeStr, setTimeStr] = useState('21:45');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine effective display dimensions based on mode
  const isActualMobile = windowWidth < 640 || (windowWidth < 900 && windowHeight < 550);

  // If user selected auto:
  // - on Home: defaults to portrait or landscape based on window
  // - on Tier 1 (Play): defaults to landscape streaming as user requested!
  const effectiveMode: 'portrait' | 'landscape' | 'foldable' | 'tablet' | 'fullscreen' = (() => {
    if (mode === 'iphone-portrait') return 'portrait';
    if (mode === 'iphone-landscape') return 'landscape';
    if (mode === 'foldable') return 'foldable';
    if (mode === 'tablet') return 'tablet';
    if (mode === 'widescreen') return 'fullscreen';

    // Auto behavior:
    if (isActualMobile) {
      return windowWidth > windowHeight ? 'landscape' : 'portrait';
    }
    if (currentViewLevel === 'tier1_play') {
      return 'landscape'; // Default full landscape streaming!
    }
    return 'portrait'; // Mobile portrait default on Home
  })();

  const isFullscreen = effectiveMode === 'fullscreen' || (isActualMobile && mode === 'auto');

  // Dimension presets for simulated devices
  let frameWidth = '100%';
  let frameHeight = '100%';
  let containerMaxW = 'max-w-none';
  let containerMaxH = 'max-h-none';
  let deviceLabel = '自适应全屏';

  switch (effectiveMode) {
    case 'portrait':
      frameWidth = '393px';
      frameHeight = '844px';
      containerMaxW = 'max-w-[393px]';
      containerMaxH = 'max-h-[844px]';
      deviceLabel = '📱 手机竖屏 (9:19.5)';
      break;
    case 'landscape':
      frameWidth = '852px';
      frameHeight = '393px';
      containerMaxW = 'max-w-[852px]';
      containerMaxH = 'max-h-[393px]';
      deviceLabel = '🎮 手机横屏 (19.5:9 串流)';
      break;
    case 'foldable':
      frameWidth = '680px';
      frameHeight = '760px';
      containerMaxW = 'max-w-[680px]';
      containerMaxH = 'max-h-[760px]';
      deviceLabel = '📖 折叠大屏 (4:3.5)';
      break;
    case 'tablet':
      frameWidth = '1000px';
      frameHeight = '640px';
      containerMaxW = 'max-w-[1000px]';
      containerMaxH = 'max-h-[640px]';
      deviceLabel = '📟 掌机/平板 (16:10)';
      break;
    case 'fullscreen':
    default:
      frameWidth = '100%';
      frameHeight = '100%';
      deviceLabel = '⚡ 100% 全屏铺满';
      break;
  }

  // When inside Tier 1 streaming or Tier 2 editor, enforce 100% True Fullscreen edge-to-edge!
  const isStreamingOrEditing = currentViewLevel === 'tier1_play' || currentViewLevel === 'tier2_edit';
  if (isStreamingOrEditing) {
    return (
      <div className="w-screen h-screen relative overflow-hidden bg-black text-white flex flex-col font-sans select-none">
        {children}
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#070709] text-white flex flex-col font-sans select-none">
      {/* Top Mobile Viewport Floating Switcher Bar */}
      <div className="h-11 bg-[#0E0E12] border-b border-white/[0.08] px-3 sm:px-6 flex items-center justify-between text-xs text-white/80 shrink-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-sm shadow-blue-500" />
            <span className="text-xs sm:text-sm bg-gradient-to-r from-blue-400 via-sky-300 to-white bg-clip-text text-transparent">
              Drel Mobile
            </span>
          </div>

          {deviceName && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-white/70">
              <span className="text-white font-medium">{deviceName}</span>
              <span className="text-emerald-400">· {ping}ms</span>
              <span className="text-sky-400">· {fps}FPS</span>
            </div>
          )}
        </div>

        {/* Viewport Switcher Controls */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10">
          <button
            onClick={() => onModeChange('iphone-portrait')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              effectiveMode === 'portrait'
                ? 'bg-[#0A84FF] text-white shadow-sm shadow-blue-500/40 font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="切换到手机竖屏 (393 × 844)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">竖屏</span>
          </button>

          <button
            onClick={() => onModeChange('iphone-landscape')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              effectiveMode === 'landscape'
                ? 'bg-[#0A84FF] text-white shadow-sm shadow-blue-500/40 font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="切换到手机横屏串流 (852 × 393)"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">横屏串流</span>
          </button>

          <button
            onClick={() => onModeChange('foldable')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              effectiveMode === 'foldable'
                ? 'bg-[#0A84FF] text-white shadow-sm shadow-blue-500/40 font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="切换到折叠屏展开态 (680 × 760)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">折叠屏</span>
          </button>

          <button
            onClick={() => onModeChange('tablet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              effectiveMode === 'tablet'
                ? 'bg-[#0A84FF] text-white shadow-sm shadow-blue-500/40 font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="切换到掌机/平板宽屏 (920 × 580)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">平板/掌机</span>
          </button>

          <button
            onClick={() => onModeChange(mode === 'widescreen' ? 'auto' : 'widescreen')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-white/20 text-white font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            title="全屏铺满窗口"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">全屏</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container Area */}
      <div className="flex-1 w-full h-[calc(100vh-44px)] overflow-hidden flex items-center justify-center p-0 md:p-3 bg-gradient-to-b from-[#0B0B0E] to-[#040406]">
        {isFullscreen ? (
          /* 100% Edge-to-Edge Container (For true mobile screens or fullscreen mode) */
          <div className="w-full h-full relative overflow-hidden bg-black flex flex-col">
            {children}
          </div>
        ) : (
          /* Realistic Hardware Mobile / Handheld Chassis Frame */
          <div
            className={`relative flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-[#202026] overflow-hidden bg-black transition-all duration-300 ease-out ${
              effectiveMode === 'tablet'
                ? 'border-[6px] rounded-[30px]'
                : 'border-[8px] rounded-[44px]'
            }`}
            style={{
              width: frameWidth,
              height: frameHeight,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {/* Simulated Phone Hardware Rim Highlights */}
            <div
              className={`absolute inset-0 pointer-events-none ring-1 ring-white/10 z-40 ${
                effectiveMode === 'tablet' ? 'rounded-[24px]' : 'rounded-[36px]'
              }`}
            />

            {/* Mobile Native Status Bar */}
            <div
              className={`w-full px-6 pt-2 pb-1.5 flex items-center justify-between text-xs font-semibold tracking-tight text-white/90 z-30 shrink-0 bg-black/40 backdrop-blur-md select-none ${
                effectiveMode === 'landscape'
                  ? 'h-7 py-0.5 px-8 text-[11px]'
                  : effectiveMode === 'tablet'
                  ? 'h-8 py-1 px-6 text-xs border-b border-white/[0.06]'
                  : 'h-11'
              }`}
            >
              {/* Left: Clock */}
              <div className="flex items-center gap-2 font-medium text-[13px]">
                <span>{timeStr}</span>
                {effectiveMode === 'tablet' && (
                  <span className="text-[11px] text-white/50 font-normal">周四 10月15日</span>
                )}
              </div>

              {/* Center: Dynamic Island for Phone vs Sleek Logo for Tablet */}
              {effectiveMode === 'tablet' ? (
                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-white/70">
                  <Gamepad2 className="w-3 h-3 text-blue-400" />
                  <span>Drel Tablet Pro</span>
                </div>
              ) : (
                <div
                  className={`bg-black border border-white/10 flex items-center justify-center transition-all ${
                    effectiveMode === 'landscape'
                      ? 'w-20 h-4 rounded-full'
                      : 'w-24 h-5 rounded-full shadow-inner shadow-black'
                  }`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0f] border border-white/20 mr-1.5" />
                  <span className="text-[9px] text-blue-400 font-mono tracking-tighter">5G</span>
                </div>
              )}

              {/* Right: Network, Battery & Telemetry */}
              <div className="flex items-center gap-2 text-white/80">
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold mr-1">
                    {ping}ms
                  </span>
                  <Wifi className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono">98%</span>
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Actual App Inner Screen Content */}
            <div className="relative flex-1 w-full h-full overflow-hidden bg-[#0A0A0E] flex flex-col">
              {children}
            </div>

            {/* Native Mobile Bottom Gesture Indicator Bar */}
            <div className="w-full h-4 bg-black flex items-center justify-center shrink-0 z-30 pointer-events-none">
              <div className="w-28 h-1 rounded-full bg-white/40" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
