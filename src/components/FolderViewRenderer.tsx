import React from 'react';
import { Compass, Layers, X, Folder, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { ShortcutKey, WheelSlot, ListFolderSlot } from '../types';

interface FolderViewProps {
  shortcut: ShortcutKey;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isEditMode?: boolean;
  isSelected?: boolean;
  collectedCount?: number;
  onSlotClick?: (label: string, name?: string) => void;
  onOpenTier3?: () => void;
  isLandscape?: boolean;
}

/**
 * Unified Wheel Folder Renderer for Tier 1 (Play/Streaming) and Tier 2 (Edit Canvas)
 * Features minimal keywords, icon-first aesthetics, and strict text clipping/scaling.
 */
export const WheelFolderRenderer: React.FC<FolderViewProps> = ({
  shortcut,
  isExpanded,
  onToggleExpand,
  isEditMode = false,
  isSelected = false,
  collectedCount = 0,
  onSlotClick,
  onOpenTier3,
  isLandscape = false,
}) => {
  const scaledSize = Math.round(
    (isLandscape ? 66 : 74) * (shortcut.sizePercent / 80)
  );
  const opacity = shortcut.opacityPercent / 100;
  const slots = shortcut.wheelConfig?.slots || [
    { id: '1', index: 0, label: '1', key: '1', name: '插槽 1' },
    { id: '2', index: 1, label: '2', key: '2', name: '插槽 2' },
    { id: '3', index: 2, label: '3', key: '3', name: '插槽 3' },
    { id: '4', index: 3, label: '4', key: '4', name: '插槽 4' },
  ];
  const radius = shortcut.wheelConfig?.radius || (isLandscape ? 96 : 90);

  // Short clean keyword without verbose sentence
  const folderTitle = shortcut.name?.trim() || '轮盘夹';

  if (isExpanded) {
    return (
      <div
        className="relative flex items-center justify-center pointer-events-auto select-none"
        style={{ opacity }}
      >
        {/* Radial aura dashed guide ring */}
        <div
          style={{ width: `${radius * 2 + 56}px`, height: `${radius * 2 + 56}px` }}
          className="absolute rounded-full border border-dashed border-blue-400/40 pointer-events-none animate-pulse bg-blue-500/[0.03]"
        />

        {/* 8 Radial Slots */}
        {slots.map((slot: WheelSlot, idx: number, arr: WheelSlot[]) => {
          const angle = (idx * 360) / arr.length - 90;
          const rad = (angle * Math.PI) / 180;
          const sx = Math.cos(rad) * radius;
          const sy = Math.sin(rad) * radius;
          const hasBoundKey = !!slot.sourceKeyId || !!slot.key;

          // Adapt text size to avoid overflow
          const labelLength = (slot.label || '').length;
          const labelClass =
            labelLength <= 2 ? 'text-sm font-black' : 'text-xs font-bold';

          return (
            <button
              key={slot.id || idx}
              type="button"
              style={{
                transform: `translate(${sx}px, ${sy}px)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSlotClick?.(slot.label, slot.name);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onOpenTier3?.();
              }}
              className={`absolute w-12 h-12 sm:w-13 sm:h-13 rounded-full overflow-hidden p-1 flex flex-col items-center justify-center shadow-xl transition-all active:scale-90 hover:scale-105 cursor-pointer z-30 ${
                hasBoundKey
                  ? 'bg-gradient-to-br from-[#0A84FF] to-[#0055D4] text-white border border-white/50 shadow-blue-500/50 ring-1 ring-blue-300/50'
                  : 'bg-[#151522]/95 hover:bg-[#1E1E2E] text-white/80 border border-blue-400/40'
              }`}
              title={slot.name ? `${slot.name} [${slot.label}]` : `槽位: ${slot.label}`}
            >
              <span className={`leading-none drop-shadow-sm font-mono truncate max-w-full ${labelClass}`}>
                {slot.label}
              </span>
              {slot.name && (
                <span className="text-[9px] font-medium text-white/90 truncate max-w-[44px] leading-tight mt-0.5 text-center">
                  {slot.name}
                </span>
              )}
            </button>
          );
        })}

        {/* Center Hub Button: Click to Collapse (叉号 X + 关键词) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="relative w-16 h-16 rounded-full bg-[#121220]/95 backdrop-blur-2xl border-2 border-blue-400 shadow-[0_0_30px_rgba(10,132,255,0.5)] flex flex-col items-center justify-center text-white cursor-pointer transition-all hover:scale-105 active:scale-95 group z-20 overflow-hidden"
          title="点击收起轮盘"
        >
          <X className="w-4 h-4 text-blue-400 group-hover:rotate-90 transition-transform mb-0.5" />
          <span className="text-[11px] font-bold text-white leading-none">收起</span>
          <span className="text-[8px] text-blue-200/80 truncate max-w-[48px] leading-tight mt-0.5 px-0.5">
            {folderTitle}
          </span>
        </button>
      </div>
    );
  }

  // COLLAPSED WHEEL FOLDER (文件夹样式 + 图标表示 + 关键词)
  return (
    <div
      style={{
        width: `${scaledSize}px`,
        height: `${scaledSize}px`,
        opacity,
      }}
      onClick={(e) => {
        if (!isEditMode) {
          e.stopPropagation();
          onToggleExpand();
        }
      }}
      className={`relative rounded-full bg-[#12121C]/90 backdrop-blur-xl border-2 border-blue-400/70 shadow-[0_0_22px_rgba(10,132,255,0.35)] flex flex-col items-center justify-center transition-all cursor-pointer hover:border-blue-400 active:scale-95 overflow-hidden p-1 ${
        isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-black' : ''
      }`}
    >
      {/* Inner dashed ring */}
      <div className="absolute inset-1 rounded-full border border-dashed border-blue-400/30 pointer-events-none" />

      {/* Floating Status Badge (Top-Right): minimal count */}
      <span
        className={`absolute top-0.5 right-0.5 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white/30 shadow-md ${
          collectedCount > 0 ? 'bg-emerald-500' : 'bg-[#0A84FF]'
        }`}
      >
        {collectedCount > 0 ? collectedCount : slots.length}
      </span>

      {/* Center Icon & Keyword only */}
      <Compass className="w-5 h-5 text-blue-400 drop-shadow-md mb-0.5" />
      <span className="text-[10px] font-bold text-white/95 truncate max-w-[52px] leading-tight px-1 text-center font-mono">
        {folderTitle}
      </span>
    </div>
  );
};

/**
 * Unified List Folder Renderer for Tier 1 (Play/Streaming) and Tier 2 (Edit Canvas)
 * Strictly rendered in a TWO-COLUMN (两列) ergonomic grid layout.
 * Supports intelligent LEFT vs RIGHT screen side distinction so it never pushes offscreen.
 */
export const ListFolderRenderer: React.FC<FolderViewProps> = ({
  shortcut,
  isExpanded,
  onToggleExpand,
  isEditMode = false,
  isSelected = false,
  collectedCount = 0,
  onSlotClick,
  onOpenTier3,
  isLandscape = false,
}) => {
  const scaledSize = Math.round(
    (isLandscape ? 66 : 74) * (shortcut.sizePercent / 80)
  );
  const opacity = shortcut.opacityPercent / 100;
  const slots = shortcut.listFolderConfig?.slots || [
    { id: '1', index: 0, label: '1', key: '1', name: '技能1' },
    { id: '2', index: 1, label: '2', key: '2', name: '技能2' },
    { id: '3', index: 2, label: '3', key: '3', name: '技能3' },
    { id: '4', index: 3, label: '4', key: '4', name: '药品4' },
  ];

  // Detect whether element is located on the Left or Right half, or near bottom
  const isRightSide = (shortcut.x ?? 50) > 55;
  const isBottomSide = (shortcut.y ?? 50) > 60;
  const folderTitle = shortcut.name?.trim() || '列表夹';

  if (isExpanded) {
    return (
      <div
        style={{
          opacity,
          // Anchored to right and top if placed near edges, avoiding boundary overflow
          transform: `${isRightSide ? 'translateX(-45%)' : 'translateX(0%)'} ${
            isBottomSide ? 'translateY(-25%)' : 'translateY(0%)'
          }`,
        }}
        className="relative rounded-3xl bg-[#12101D]/95 backdrop-blur-2xl border-2 border-purple-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(168,85,247,0.35)] p-3.5 w-[280px] sm:w-[320px] pointer-events-auto z-30 select-none transition-transform duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-400/40 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 text-purple-300" />
            </div>
            <span className="text-sm font-bold text-white truncate max-w-[120px]">
              {folderTitle}
            </span>
            {/* Screen position indicator badge */}
            <span className="text-[10px] bg-purple-500/20 text-purple-200 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium shrink-0">
              {isRightSide ? '右屏' : '左屏'}·{collectedCount > 0 ? `${collectedCount}键` : `${slots.length}槽`}
            </span>
          </div>

          {/* Quick Collapse Button (叉号 X 收起按钮) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/30 hover:bg-purple-500/50 border border-purple-400/60 text-purple-100 text-xs font-semibold transition-all cursor-pointer active:scale-95 shrink-0"
            title="点击收起为文件夹"
          >
            <X className="w-3.5 h-3.5 text-purple-200" />
            <span>收起</span>
          </button>
        </div>

        {/* TWO-COLUMN GRID OF SLOTS (按照两列呈现，关键词优先，字体大清晰，绝不溢出) */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {slots.map((slot: ListFolderSlot, idx: number) => {
            const hasKey = !!slot.sourceKeyId || !!slot.key;
            const slotName = slot.name?.trim() || `槽位${idx + 1}`;

            return (
              <button
                key={slot.id || idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSlotClick?.(slot.label, slot.name);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onOpenTier3?.();
                }}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md overflow-hidden ${
                  hasKey
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-300/40 shadow-purple-500/30 ring-1 ring-purple-300/30'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/10'
                }`}
                title={slot.name ? `${slot.name} [${slot.label}]` : `槽位: ${slot.label}`}
              >
                {/* Slot Label Badge */}
                <span className="w-6 h-6 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center text-xs font-black shrink-0 font-mono text-purple-200">
                  {slot.label}
                </span>

                {/* Slot Keyword Name (Crisp and legible, generous width) */}
                <span className="text-xs font-medium text-white/95 truncate flex-1 text-right max-w-[85px]">
                  {slotName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Edit mode footer hint with Tier 3 editor link */}
        {isEditMode && (
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/10 text-[9px] text-white/50">
            <span>两列网格排布</span>
            {onOpenTier3 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTier3();
                }}
                className="text-purple-300 hover:text-white hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>三级配置</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // COLLAPSED LIST FOLDER (文件夹样式 + 图标表示 + 关键词)
  return (
    <div
      style={{
        width: `${scaledSize}px`,
        height: `${scaledSize}px`,
        opacity,
      }}
      onClick={(e) => {
        if (!isEditMode) {
          e.stopPropagation();
          onToggleExpand();
        }
      }}
      className={`relative rounded-2xl bg-[#171324]/90 backdrop-blur-xl border-2 border-purple-400/70 shadow-[0_0_22px_rgba(168,85,247,0.35)] flex flex-col items-center justify-center transition-all cursor-pointer hover:border-purple-400 active:scale-95 overflow-hidden p-1 ${
        isSelected ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-black' : ''
      }`}
    >
      {/* Inner dashed ring */}
      <div className="absolute inset-1 rounded-xl border border-dashed border-purple-400/30 pointer-events-none" />

      {/* Floating Status Badge (Top-Right): minimal count */}
      <span
        className={`absolute top-0.5 right-0.5 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white/30 shadow-md ${
          collectedCount > 0 ? 'bg-emerald-500' : 'bg-purple-600'
        }`}
      >
        {collectedCount > 0 ? collectedCount : slots.length}
      </span>

      {/* Center Icon & Keyword only */}
      <Layers className="w-5 h-5 text-purple-400 drop-shadow-md mb-0.5" />
      <span className="text-[10px] font-bold text-white/95 truncate max-w-[52px] leading-tight px-1 text-center font-mono">
        {folderTitle}
      </span>
    </div>
  );
};
