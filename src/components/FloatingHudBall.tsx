import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  Home,
  Gamepad2,
  Maximize2,
  Minimize2,
  X,
  Check,
  Play,
} from 'lucide-react';
import { ControlScheme } from '../types';

interface Props {
  onEnterEditMode: () => void;
  onReturnHome: () => void;
  activeScheme: ControlScheme;
  schemes: ControlScheme[];
  onSelectScheme: (schemeId: string) => void;
  onOpenSchemeManager?: () => void;
  fps: number;
  ping: number;
  deviceName: string;
  isEditMode?: boolean;
}

export const FloatingHudBall: React.FC<Props> = ({
  onEnterEditMode,
  onReturnHome,
  activeScheme,
  schemes,
  onSelectScheme,
  onOpenSchemeManager,
  fps,
  ping,
  deviceName,
  isEditMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSchemePicker, setShowSchemePicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Position: In edit mode it can be dragged; in play mode it is fixed at top-right
  const [pos, setPos] = useState<{ x: number; y: number }>(() => ({
    x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 64) : 320,
    y: 16,
  }));

  const isDraggingRef = useRef(false);
  const startDragRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  // Only allow dragging in EDIT MODE
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isEditMode) return; // Fixed in Tier 1 play mode!

    isDraggingRef.current = false;
    startDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode) return;
    const dx = e.clientX - startDragRef.current.startX;
    const dy = e.clientY - startDragRef.current.startY;
    if (Math.hypot(dx, dy) > 6) {
      isDraggingRef.current = true;
      const nextX = Math.max(12, Math.min(window.innerWidth - 60, startDragRef.current.initX + dx));
      const nextY = Math.max(12, Math.min(window.innerHeight - 60, startDragRef.current.initY + dy));
      setPos({ x: nextX, y: nextY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isEditMode) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    // If clicked without drag, toggle menu
    if (!isDraggingRef.current) {
      setIsOpen((prev) => !prev);
      setShowSchemePicker(false);
    }
    isDraggingRef.current = false;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    setIsOpen(false);
  };

  // Keep within bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPos((prev) => ({
        x: Math.min(prev.x, Math.max(16, window.innerWidth - 64)),
        y: Math.min(prev.y, Math.max(16, window.innerHeight - 64)),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When not in edit mode, ensure ball is anchored at top-right
  const positionStyle: React.CSSProperties = isEditMode
    ? { left: `${pos.x}px`, top: `${pos.y}px`, position: 'fixed', zIndex: 9999 }
    : { right: '16px', top: '16px', position: 'fixed', zIndex: 9999 };

  return (
    <div style={positionStyle} className="select-none pointer-events-auto touch-none">
      {/* 1. Floating Orb Button */}
      {!isOpen && (
        <button
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative group w-11 h-11 rounded-full bg-[#121218]/90 hover:bg-[#1A1A24] border border-cyan-400/50 hover:border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.35)] flex items-center justify-center transition-transform active:scale-95 ${
            isEditMode ? 'cursor-move ring-2 ring-cyan-400/30' : 'cursor-pointer'
          }`}
          title={isEditMode ? '浮球（编辑态可拖动，点击展开）' : '浮球（点击呼出快捷菜单）'}
        >
          {/* Subtle pulse */}
          <span className="absolute w-5 h-5 rounded-full bg-cyan-400/20 animate-ping opacity-50 pointer-events-none" />

          {/* Icon */}
          <SlidersHorizontal className="w-4 h-4 text-cyan-300 group-hover:text-white transition-colors" />

          {/* Status dot */}
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#121218]" />
        </button>
      )}

      {/* 2. Ultra-Clean Minimalist Floating Menu */}
      {isOpen && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="relative right-0 w-52 bg-[#121218]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-1.5 py-1 border-b border-white/10 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
              <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
                {deviceName}
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setShowSchemePicker(false);
              }}
              className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action 1: Toggle Edit Mode / Play Mode */}
          <button
            onClick={() => {
              setIsOpen(false);
              onEnterEditMode();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all active:scale-95 cursor-pointer"
          >
            {isEditMode ? (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>返回操控</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>编辑布局</span>
              </>
            )}
          </button>

          {/* Action 2: Switch Layout (Opens secondary layout management modal) */}
          <div className="relative">
            <button
              onClick={() => {
                if (onOpenSchemeManager) {
                  onOpenSchemeManager();
                  setIsOpen(false);
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
                      setIsOpen(false);
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

          {/* Action 3: Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/90 text-xs font-medium transition-all cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{isFullscreen ? '窗口' : '全屏'}</span>
          </button>

          {/* Action 4: Return Home */}
          <button
            onClick={() => {
              setIsOpen(false);
              onReturnHome();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-rose-400" />
            <span>退出</span>
          </button>
        </div>
      )}
    </div>
  );
};
