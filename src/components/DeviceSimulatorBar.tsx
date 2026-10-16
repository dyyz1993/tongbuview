import React from 'react';
import { Smartphone, Monitor, Tablet, Sparkles, RotateCw, Home, Play, ArrowLeft } from 'lucide-react';
import { DeviceMode } from '../types';

interface Props {
  mode: DeviceMode;
  onModeChange: (m: DeviceMode) => void;
  actualWidth: number;
  actualHeight: number;
  isRealLandscape: boolean;
  onReturnHome?: () => void;
  onReturnToPlay?: () => void;
  currentDeviceName?: string;
}

export const DeviceSimulatorBar: React.FC<Props> = ({
  mode,
  onModeChange,
  actualWidth,
  actualHeight,
  isRealLandscape,
  onReturnHome,
  onReturnToPlay,
  currentDeviceName,
}) => {
  return (
    <header className="w-full bg-[#161618]/95 backdrop-blur-xl border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs text-white/80 select-none z-50 shadow-md">
      {/* Brand title & Return buttons */}
      <div className="flex items-center gap-3">
        {onReturnHome && (
          <button
            onClick={onReturnHome}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer"
            title="返回远程控制设备列表 (Home)"
          >
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium">设备列表</span>
          </button>
        )}

        {onReturnToPlay && (
          <button
            onClick={onReturnToPlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A84FF] hover:bg-[#0071E3] text-white font-medium shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            title="应用配置并进入一级只读操控态"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="text-xs font-semibold">进入一级操控</span>
          </button>
        )}

        {currentDeviceName && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[11px] text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>受控端: <strong className="text-white font-semibold">{currentDeviceName}</strong></span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-2 text-white/40 text-[11px] font-mono pl-2 border-l border-white/10">
          <span>视口: {actualWidth} × {actualHeight}</span>
          <span>·</span>
          <span>方向: {isRealLandscape ? '横屏 (Landscape)' : '竖屏 (Portrait)'}</span>
        </div>
      </div>

      {/* Device Mode Switcher */}
      <div className="flex items-center gap-1 bg-[#242426] p-1 rounded-xl border border-white/10">
        <button
          onClick={() => onModeChange('auto')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'auto'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
          title="根据浏览器窗口实际宽度和旋转角度自动切换"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>自适应</span>
        </button>

        <button
          onClick={() => onModeChange('iphone-portrait')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'iphone-portrait'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
          title="强制模拟 iPhone 竖屏 (393 × 852)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iPhone 竖屏</span>
        </button>

        <button
          onClick={() => onModeChange('iphone-landscape')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'iphone-landscape'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
          title="强制模拟 iPhone 横屏 (852 × 393)"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>iPhone 横屏</span>
        </button>

        <button
          onClick={() => onModeChange('foldable')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'foldable'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
          title="折叠屏展开形态 (近 1:1 双栏分屏)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>折叠屏</span>
        </button>

        <button
          onClick={() => onModeChange('widescreen')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mode === 'widescreen'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
          title="桌面宽屏全景形态"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>宽屏模式</span>
        </button>
      </div>
    </header>
  );
};
