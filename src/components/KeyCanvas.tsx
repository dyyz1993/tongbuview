import React, { useState, useRef } from 'react';
import {
  Minus,
  Plus,
  Maximize2,
  Compass,
  Zap,
  Layers,
  FoldHorizontal,
  UnfoldHorizontal,
  SlidersHorizontal,
  Check,
  PackageOpen,
} from 'lucide-react';
import { ShortcutKey, WheelSlot, ListFolderSlot } from '../types';
import { WheelFolderRenderer, ListFolderRenderer } from './FolderViewRenderer';
import { HudWidgetRenderer } from './HudWidgetRenderer';

interface Props {
  keys: ShortcutKey[];
  selectedKeyId: string;
  onSelectKey: (id: string) => void;
  onChangePosition: (id: string, x: number, y: number) => void;
  onOpenKeyBinding?: () => void;
  onOpenWheelConfig?: () => void;
  onOpenFolderTier3?: () => void;
  onOpenMacroConfig?: () => void;
  onToggleFolderExpand?: (id: string) => void;
  isLandscape?: boolean;
  onDraggingChange?: (isDragging: boolean) => void;
  collectingFolderId?: string | null;
  onToggleCollectKey?: (keyId: string) => void;
  onStopCollecting?: () => void;
}

export const KeyCanvas: React.FC<Props> = ({
  keys,
  selectedKeyId,
  onSelectKey,
  onChangePosition,
  onOpenKeyBinding,
  onOpenWheelConfig,
  onOpenFolderTier3,
  onOpenMacroConfig,
  onToggleFolderExpand,
  isLandscape = false,
  onDraggingChange,
  collectingFolderId = null,
  onToggleCollectKey,
  onStopCollecting,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingKeyId, setDraggingKeyId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [pressedKeyId, setPressedKeyId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const pointerStartRef = useRef<{ x: number; y: number; moved: boolean }>({ x: 0, y: 0, moved: false });
  const dragStartKeyCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pendingKeyIdRef = useRef<string | null>(null);

  // Dragging logic
  const handlePointerDown = (e: React.PointerEvent, keyId: string) => {
    e.stopPropagation();
    pointerStartRef.current = { x: e.clientX, y: e.clientY, moved: false };
    pendingKeyIdRef.current = keyId;

    const currentKey = keys.find((k) => k.id === keyId);
    if (currentKey) {
      dragStartKeyCoordRef.current = { x: currentKey.x, y: currentKey.y };
    }

    setDraggingKeyId(keyId);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingKeyId || !canvasRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (Math.hypot(dx, dy) > 4) {
      if (!pointerStartRef.current.moved) {
        pointerStartRef.current.moved = true;
        // Triggers the top area to smoothly animate upwards (向上收起)
        if (onDraggingChange) onDraggingChange(true);
      }
    }
    if (!pointerStartRef.current.moved) return;

    const rect = canvasRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Delta percentage relative to where the drag originated (no sudden jump or drift)
    const dxPercent = (dx / rect.width) * 100;
    const dyPercent = (dy / rect.height) * 100;

    const newX = Math.max(5, Math.min(95, Math.round(dragStartKeyCoordRef.current.x + dxPercent)));
    const newY = Math.max(5, Math.min(95, Math.round(dragStartKeyCoordRef.current.y + dyPercent)));

    onChangePosition(draggingKeyId, newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (onDraggingChange) {
      onDraggingChange(false);
    }
    if (draggingKeyId) {
      const targetId = pendingKeyIdRef.current;
      setDraggingKeyId(null);

      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      // Keep the released key selected so the top property panel slides back in with its details
      if (targetId) {
        onSelectKey(targetId);
      }
    }
  };

  const triggerSlotFeedback = (label: string, name?: string) => {
    const text = name ? `${name} [${label}]` : label;
    setFeedbackMessage(text);
    if ('vibrate' in navigator) {
      navigator.vibrate?.(30);
    }
    setTimeout(() => setFeedbackMessage(null), 1000);
  };

  const handleKeyClick = (e: React.MouseEvent, keyItem: ShortcutKey) => {
    e.stopPropagation();
    // If it was dragged, ignore the trailing click event
    if (pointerStartRef.current.moved) return;

    if (collectingFolderId) {
      if (keyItem.id === collectingFolderId) {
        triggerSlotFeedback('当前轮盘夹', '正在为它收纳按键');
        return;
      }
      if (keyItem.id === 'key-system-menu' || keyItem.isSystemAction) {
        triggerSlotFeedback('系统功能菜单', '保护按键不可收纳');
        return;
      }
      if (onToggleCollectKey) {
        onToggleCollectKey(keyItem.id);
      }
      return;
    }

    onSelectKey(keyItem.id);
    setPressedKeyId(keyItem.id);
    setTimeout(() => setPressedKeyId(null), 200);

    if (keyItem.vibrate && 'vibrate' in navigator) {
      navigator.vibrate?.(40);
    }

    const mods = (keyItem.modifiers || []).map((m) => m.toUpperCase()).join('+');
    const msg = mods ? `${mods} + ${keyItem.keyLabel}` : keyItem.keyLabel;
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 1200);
  };

  const handleKeyDoubleClick = (e: React.MouseEvent, keyItem: ShortcutKey) => {
    e.stopPropagation();
    if (keyItem.keyType === 'wheel-folder' || keyItem.keyType === 'list-folder') {
      if (onOpenFolderTier3) onOpenFolderTier3();
      else if (onOpenWheelConfig) onOpenWheelConfig();
    } else if (keyItem.keyType === 'macro' && onOpenMacroConfig) {
      onOpenMacroConfig();
    } else if (onOpenKeyBinding) {
      onOpenKeyBinding();
    }
  };

  const baseSize = isLandscape ? 66 : 74;

  return (
    <div
      ref={canvasRef}
      onClick={(e) => {
        // Clicking canvas background clears selection and hides property panel
        if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'IMG') {
          onSelectKey('');
        }
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative flex-1 w-full h-full min-h-[280px] overflow-hidden select-none bg-black cursor-default"
    >
      {/* Mountain Wallpaper background */}
      <img
        src="/src/assets/images/drel_mountain_bg_1791958211905.jpg"
        alt="macOS Dusk Mountain Wallpaper"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none brightness-95"
      />

      {/* Subtle vignette shadow overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

      {/* Interactive Key Collection Banner */}
      {collectingFolderId && (() => {
        const targetFolder = keys.find((k) => k.id === collectingFolderId);
        if (!targetFolder) return null;
        const targetSlots = targetFolder.wheelConfig?.slots || targetFolder.listFolderConfig?.slots || [];
        const filledCount = targetSlots.filter((s) => !!s.sourceKeyId).length || keys.filter((k) => k.folderId === collectingFolderId).length;
        return (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#161622]/95 border border-purple-500/60 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in duration-200 select-none">
            <div className="w-8 h-8 rounded-xl bg-purple-500/25 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white truncate max-w-[150px]">
                  正在为「{targetFolder.name}」点选收纳
                </span>
                <span className="text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full font-bold shrink-0">
                  已收纳 {filledCount}/8 键 (最少3个，最多8个)
                </span>
              </div>
              <p className="text-[11px] text-white/60 truncate">
                直接在画布上点击按键即可收纳；点击已收纳按键即可移出删除
              </p>
            </div>
            {onStopCollecting && (
              <button
                onClick={onStopCollecting}
                className="bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>完成点选，返回三级界面</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Render all virtual keys on canvas (keys with folderId are contained in a folder and hidden unless in collection mode for this folder) */}
      {keys.map((k) => {
        const isCollectedInThisFolder = !!(collectingFolderId && k.folderId === collectingFolderId);
        if (!k.visible) return null;
        if (k.folderId && !isCollectedInThisFolder) return null;

        const isSelected = k.id === selectedKeyId;
        const isPressed = pressedKeyId === k.id;
        const scaledSize = Math.round(
          baseSize * (k.sizePercent / 80) * (zoomLevel / 100)
        );

        const isFolder = k.keyType === 'wheel-folder' || k.keyType === 'list-folder';
        const isExpanded = !!k.isFolderExpanded;

        // Count how many canvas keys have been collected into this folder
        const collectedCount = (
          k.keyType === 'wheel-folder'
            ? k.wheelConfig?.slots
            : k.listFolderConfig?.slots
        )?.filter((s) => !!s.sourceKeyId).length || 0;

        const isCurrentFolderTarget = collectingFolderId && k.id === collectingFolderId;
        const isAvailableToCollect = collectingFolderId && !k.folderId && !isCurrentFolderTarget && k.id !== 'key-system-menu' && !k.isSystemAction;

        return (
          <div
            key={k.id}
            style={{
              left: `${k.x}%`,
              top: `${k.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute touch-none cursor-move select-none group ${
              isExpanded ? 'z-40' : isSelected ? 'z-30' : 'z-20'
            }`}
            onPointerDown={(e) => handlePointerDown(e, k.id)}
            onClick={(e) => handleKeyClick(e, k)}
            onDoubleClick={(e) => handleKeyDoubleClick(e, k)}
          >
            {/* Interactive Collection Badges */}
            {isCollectedInThisFolder && (
              <div className="absolute -top-3.5 -right-2 z-50 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-300 shadow-md flex items-center gap-0.5 pointer-events-none animate-in zoom-in-75">
                <Check className="w-2.5 h-2.5" />
                <span>已在轮盘 (点此移出)</span>
              </div>
            )}
            {isAvailableToCollect && (
              <div className="absolute -top-3.5 -right-2 z-50 bg-purple-600/90 text-purple-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-purple-400 shadow-md flex items-center gap-0.5 pointer-events-none group-hover:scale-110 transition-transform">
                <span>+ 点击收纳</span>
              </div>
            )}
            {isCurrentFolderTarget && (
              <div className="absolute -top-3.5 -left-2 z-50 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-400 shadow-md flex items-center gap-0.5 pointer-events-none">
                <span>当前轮盘夹</span>
              </div>
            )}

            {/* Selection Box & Corner Handles (Rendered only when key is collapsed and not HUD) */}
            <div
              style={{
                width: isExpanded || k.keyType === 'hud' ? 'auto' : `${scaledSize + (isSelected ? 16 : 0)}px`,
                height: isExpanded || k.keyType === 'hud' ? 'auto' : `${scaledSize + (isSelected ? 16 : 0)}px`,
              }}
              className={`relative flex items-center justify-center transition-all ${
                isCollectedInThisFolder
                  ? 'ring-2 ring-emerald-400 rounded-2xl bg-emerald-500/15'
                  : isAvailableToCollect
                  ? 'border-2 border-dashed border-purple-400/80 rounded-2xl group-hover:border-purple-300 group-hover:bg-purple-500/10'
                  : isSelected && !isExpanded && k.keyType !== 'hud'
                  ? 'border-[1.5px] border-[#0A84FF] rounded-2xl shadow-lg shadow-blue-500/25'
                  : 'border border-transparent'
              } ${isPressed ? 'scale-95' : ''}`}
            >
              {isSelected && !isExpanded && k.keyType !== 'hud' && (
                <>
                  <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-[#0A84FF] rounded-[1px] shadow-sm" />
                  <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-[#0A84FF] rounded-[1px] shadow-sm" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border border-[#0A84FF] rounded-[1px] shadow-sm" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border border-[#0A84FF] rounded-[1px] shadow-sm" />
                </>
              )}

              {/* ============================================================= */}
              {/* SPECIALIZED RENDER 1: WHEEL FOLDER (COLLAPSED VS EXPANDED)    */}
              {/* ============================================================= */}
              {k.keyType === 'wheel-folder' ? (
                <WheelFolderRenderer
                  shortcut={k}
                  isExpanded={isExpanded}
                  onToggleExpand={() => (onToggleFolderExpand ? onToggleFolderExpand(k.id) : onSelectKey(k.id))}
                  isEditMode={true}
                  isSelected={isSelected}
                  collectedCount={collectedCount}
                  onSlotClick={(label, name) => triggerSlotFeedback(label, name)}
                  onOpenTier3={onOpenFolderTier3 || onOpenWheelConfig}
                  isLandscape={isLandscape}
                />
              ) : k.keyType === 'list-folder' ? (
                /* ============================================================= */
                /* SPECIALIZED RENDER 2: LIST DRAWER FOLDER (COLLAPSED VS EXPANDED)*/
                /* ============================================================= */
                <ListFolderRenderer
                  shortcut={k}
                  isExpanded={isExpanded}
                  onToggleExpand={() => (onToggleFolderExpand ? onToggleFolderExpand(k.id) : onSelectKey(k.id))}
                  isEditMode={true}
                  isSelected={isSelected}
                  collectedCount={collectedCount}
                  onSlotClick={(label, name) => triggerSlotFeedback(label, name)}
                  onOpenTier3={onOpenFolderTier3 || onOpenWheelConfig}
                  isLandscape={isLandscape}
                />
              ) : k.keyType === 'macro' ? (
                /* ============================================================= */
                /* SPECIALIZED RENDER 3: MACRO KEY                               */
                /* ============================================================= */
                <div
                  style={{
                    width: `${scaledSize}px`,
                    height: `${scaledSize}px`,
                    opacity: k.opacityPercent / 100,
                  }}
                  className="rounded-full bg-[#1F1B24]/90 backdrop-blur-xl border-2 border-amber-400/60 flex flex-col items-center justify-center shadow-2xl hover:border-amber-400 transition-all overflow-hidden p-1"
                >
                  <Zap className="w-4 h-4 text-amber-400 mb-0.5 animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold text-amber-200 truncate max-w-full px-1 text-center">
                    {k.keyLabel}
                  </span>
                </div>
              ) : k.keyType === 'hud' ? (
                /* ============================================================= */
                /* SPECIALIZED RENDER 4: MOVABLE TELEMETRY HUD COMPONENT         */
                /* ============================================================= */
                <HudWidgetRenderer
                  shortcut={k}
                  fps={120}
                  ping={4}
                  bitrate="12MB/s"
                  battery={98}
                  isEditMode={true}
                  isSelected={isSelected}
                  isLandscape={isLandscape}
                />
              ) : (
                /* ============================================================= */
                /* STANDARD VIRTUAL KEY (SINGLE / COMBO / SYSTEM)               */
                /* ============================================================= */
                (() => {
                  const isSystemMenu = k.id === 'key-system-menu' || k.isSystemAction;
                  if (isSystemMenu) {
                    return (
                      <div
                        style={{
                          width: `${scaledSize}px`,
                          height: `${scaledSize}px`,
                          opacity: Math.max(0.5, k.opacityPercent / 100),
                        }}
                        className="rounded-full bg-[#121218]/90 backdrop-blur-xl border-2 border-cyan-400/60 shadow-[0_0_16px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center overflow-hidden p-1 select-none"
                      >
                        <SlidersHorizontal className="w-5 h-5 text-cyan-300" />
                        <span className="text-[8px] text-cyan-200/90 font-medium leading-none mt-0.5">
                          菜单
                        </span>
                      </div>
                    );
                  }

                  const lblLen = (k.keyLabel || '').length;
                  const labelClass =
                    lblLen <= 2
                      ? 'text-lg sm:text-xl font-black'
                      : lblLen <= 4
                      ? 'text-xs sm:text-sm font-bold'
                      : 'text-[10px] font-bold';

                  return (
                    <div
                      style={{
                        width: `${scaledSize}px`,
                        height: `${scaledSize}px`,
                        opacity: k.opacityPercent / 100,
                      }}
                      className={`overflow-hidden p-1 flex flex-col items-center justify-center bg-[#1A1A1E]/85 backdrop-blur-xl border border-white/25 shadow-2xl transition-all ${
                        k.shape === 'circle'
                          ? 'rounded-full'
                          : k.shape === 'pill'
                          ? 'rounded-full'
                          : 'rounded-2xl'
                      }`}
                    >
                      <span className={`text-white tracking-wider drop-shadow-md select-none truncate max-w-full px-0.5 text-center leading-none ${labelClass}`}>
                        {k.keyLabel}
                      </span>
                      {k.hint && k.name && k.name !== k.keyLabel && (
                        <span className="text-[8px] sm:text-[9px] text-white/60 -mt-0.5 truncate max-w-full px-1 text-center leading-tight">
                          {k.name}
                        </span>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        );
      })}

      {/* Floating Visual Feedback when key or slot is clicked */}
      {feedbackMessage && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 bg-[#0A84FF] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg animate-in fade-in zoom-in-90 duration-150">
          触发: {feedbackMessage}
        </div>
      )}

      {/* Floating Bottom Zoom Control & Fullscreen */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {/* Zoom Pill */}
        <div className="flex items-center gap-2 bg-[#18181A]/75 backdrop-blur-xl border border-white/15 px-3 py-1 rounded-full text-white text-xs font-mono shadow-2xl">
          <button
            onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
            className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white cursor-pointer active:scale-90 transition-transform"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-11 text-center font-medium select-none">
            {zoomLevel}%
          </span>

          <button
            onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
            className="w-5 h-5 flex items-center justify-center text-white/70 hover:text-white cursor-pointer active:scale-90 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fit / Fullscreen Button */}
        <button
          onClick={() => setZoomLevel(100)}
          className="w-8 h-8 flex items-center justify-center bg-[#18181A]/75 backdrop-blur-xl border border-white/15 rounded-xl text-white/80 hover:text-white cursor-pointer active:scale-90 transition-transform shadow-2xl"
          title="重置缩放 100%"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* iOS Home Indicator Bar */}
      <div className="absolute bottom-1 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div className="w-32 h-1 bg-white/70 rounded-full" />
      </div>
    </div>
  );
};
