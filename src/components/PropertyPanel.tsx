import React, { useState } from 'react';
import {
  Pencil,
  Eye,
  EyeOff,
  Circle,
  Square,
  Compass,
  Layers,
  Zap,
  Trash2,
  Copy,
  Sliders,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FoldHorizontal,
  UnfoldHorizontal,
  X,
  Plus,
  Check,
  MousePointerClick,
} from 'lucide-react';
import { ShortcutKey, ActionType, KeyShape, ModifierKey, AppProfile } from '../types';
import { AppIconRenderer } from '../data/presetApps';

interface Props {
  shortcut?: ShortcutKey | null;
  onChange: (updated: Partial<ShortcutKey>) => void;
  activeApp: AppProfile;
  onOpenAppSelector: () => void;
  onOpenKeyBinding?: () => void;
  onOpenWheelConfig?: () => void;
  onOpenFolderTier3?: () => void;
  onOpenMacroConfig?: () => void;
  onDeleteKey?: () => void;
  onDuplicateKey?: () => void;
  onReleaseAllFromFolder?: () => void;
  bindingMode?: 'single' | 'combo';
  onAddSingleKey?: () => void;
  onAddComboKey?: () => void;
  isLandscape?: boolean;
  isFoldable?: boolean;
  onClose?: () => void;
  onStartCollectingKeys?: (folderId: string) => void;
  onRemoveSlotFromFolder?: (folderId: string, slotIndex: number) => void;
  onAddSlotToFolder?: (folderId: string) => void;
  isCollectingKeys?: boolean;
}

export const PropertyPanel: React.FC<Props> = ({
  shortcut,
  onChange,
  activeApp,
  onOpenAppSelector,
  onOpenKeyBinding,
  onOpenWheelConfig,
  onOpenFolderTier3,
  onOpenMacroConfig,
  onDeleteKey,
  onDuplicateKey,
  onReleaseAllFromFolder,
  bindingMode = 'single',
  onAddSingleKey,
  onAddComboKey,
  isLandscape = false,
  isFoldable = false,
  onClose,
  onStartCollectingKeys,
  onRemoveSlotFromFolder,
  onAddSlotToFolder,
  isCollectingKeys = false,
}) => {
  if (!shortcut) return null;

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(shortcut.name);

  // SPECIALIZED RENDER: HUD PERFORMANCE METRICS KEY
  if (shortcut.keyType === 'hud') {
    const hudCfg = shortcut.hudConfig || {
      showFps: true,
      showPing: true,
      showBitrate: true,
      showBattery: true,
    };
    return (
      <div className="relative w-full bg-[#141418]/95 backdrop-blur-2xl border-b border-cyan-500/30 px-4 py-2 text-white select-none transition-all shadow-xl z-20 overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {/* Identity */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
            <span className="text-xs font-bold text-white tracking-wide">性能监控 HUD</span>
            <span className="text-[10px] text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium">
              可任意拖拽改位
            </span>
          </div>

          {/* Toggle Display Items */}
          <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10 text-[11px]">
            <button
              onClick={() => onChange({ hudConfig: { ...hudCfg, showPing: !hudCfg.showPing } })}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                hudCfg.showPing !== false ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-white/40'
              }`}
            >
              延迟
            </button>
            <button
              onClick={() => onChange({ hudConfig: { ...hudCfg, showFps: !hudCfg.showFps } })}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                hudCfg.showFps !== false ? 'bg-sky-500/30 text-sky-300 font-bold' : 'text-white/40'
              }`}
            >
              帧率
            </button>
            <button
              onClick={() => onChange({ hudConfig: { ...hudCfg, showBitrate: !hudCfg.showBitrate } })}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                hudCfg.showBitrate !== false ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-white/40'
              }`}
            >
              码率
            </button>
            <button
              onClick={() => onChange({ hudConfig: { ...hudCfg, showBattery: !hudCfg.showBattery } })}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                hudCfg.showBattery !== false ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-white/40'
              }`}
            >
              电量
            </button>
          </div>

          {/* Sliders */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/60">缩放</span>
              <input
                type="range"
                min="50"
                max="150"
                value={shortcut.sizePercent}
                onChange={(e) => onChange({ sizePercent: Number(e.target.value) })}
                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[11px] font-mono text-cyan-300">{shortcut.sizePercent}%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/60">透明</span>
              <input
                type="range"
                min="20"
                max="100"
                value={shortcut.opacityPercent}
                onChange={(e) => onChange({ opacityPercent: Number(e.target.value) })}
                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[11px] font-mono text-cyan-300">{shortcut.opacityPercent}%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange({ x: 50, y: 6 })}
              className="text-[11px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
              title="重置位置到顶部居中"
            >
              置顶居中
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
                title="收起属性面板"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleNameSave = () => {
    setIsEditingName(false);
    if (nameInput.trim()) {
      onChange({ name: nameInput.trim() });
    } else {
      setNameInput(shortcut.name);
    }
  };

  const isFolder =
    shortcut.keyType === 'wheel-folder' || shortcut.keyType === 'list-folder';
  const isWheel = shortcut.keyType === 'wheel-folder';
  const isList = shortcut.keyType === 'list-folder';
  const isFolderExpanded = !!shortcut.isFolderExpanded;
  const isSystemMenuKey = shortcut.id === 'key-system-menu' || shortcut.isSystemAction;

  const collectedCount = (
    isWheel ? shortcut.wheelConfig?.slots : shortcut.listFolderConfig?.slots
  )?.filter((s) => !!s.sourceKeyId).length || 0;
  const totalSlotCount = isWheel
    ? shortcut.wheelConfig?.slots?.length || 8
    : shortcut.listFolderConfig?.slots?.length || 4;

  const handleToggleFolderExpand = () => {
    const nextState = !isFolderExpanded;
    if (isWheel && shortcut.wheelConfig) {
      onChange({
        isFolderExpanded: nextState,
        wheelConfig: { ...shortcut.wheelConfig, isExpanded: nextState },
      });
    } else if (isList && shortcut.listFolderConfig) {
      onChange({
        isFolderExpanded: nextState,
        listFolderConfig: { ...shortcut.listFolderConfig, isExpanded: nextState },
      });
    } else {
      onChange({ isFolderExpanded: nextState });
    }
  };

  const handleOpenFolderEditor = () => {
    if (onOpenFolderTier3) {
      onOpenFolderTier3();
    } else if (onOpenWheelConfig) {
      onOpenWheelConfig();
    }
  };

  /* ========================================================================= */
  /* LANDSCAPE LAYOUT: COMPACT INLINE AS SPECIFIED IN REFERENCE IMAGE          */
  /* ========================================================================= */
  if (isLandscape) {
    return (
      <div className="relative w-full bg-[#18181A]/90 backdrop-blur-2xl border-b border-white/10 px-4 py-2 text-white select-none transition-all shadow-xl z-20 overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
            {/* Group 1: Shortcut Identifier & App Selector */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenKeyBinding}
                  className="w-7 h-7 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3D] hover:border-blue-400 border border-white/15 flex items-center justify-center font-bold text-xs text-white shadow-inner hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="点击设置按键或组合键 (三级界面)"
                >
                  {shortcut.keyLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (bindingMode === 'single' && onAddComboKey) {
                      onAddComboKey();
                    } else if (onAddSingleKey) {
                      onAddSingleKey();
                    } else if (onOpenKeyBinding) {
                      onOpenKeyBinding();
                    }
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#242428] hover:bg-[#2c2c30] border border-white/10 text-[10px] text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="点击切换映射模式 (单键/组合键)"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      bindingMode === 'combo' ? 'bg-[#FF9F0A]' : 'bg-[#0A84FF]'
                    }`}
                  />
                  <span>{bindingMode === 'combo' ? '组合' : '单键'}</span>
                </button>
              </div>

              {isEditingName ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="bg-black/50 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white w-20 focus:outline-none"
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => setIsEditingName(true)}
                  className="flex items-center gap-1.5 cursor-pointer group"
                >
                  <span className="text-[13px] font-medium text-white group-hover:text-blue-400 transition-colors">
                    {shortcut.name}
                  </span>
                  <Pencil className="w-3 h-3 text-white/50 group-hover:text-white" />
                </div>
              )}

              {/* Special Controls for Folders (Wheel / List) - Strictly Minimal: Only Fold/Expand and Tier-3 Entry */}
              {isFolder && (
                <div className="flex items-center gap-2 ml-1">
                  {/* Expand / Collapse Toggle Button */}
                  <button
                    type="button"
                    onClick={handleToggleFolderExpand}
                    className={`flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      isFolderExpanded
                        ? 'bg-blue-500/25 border-blue-400 text-blue-200 font-semibold'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                    }`}
                    title="在画布上切换轮盘/列表夹的展开与收起状态"
                  >
                    {isFolderExpanded ? (
                      <>
                        <UnfoldHorizontal className="w-3.5 h-3.5 text-blue-300" />
                        <span>已展开 (点击收起)</span>
                      </>
                    ) : (
                      <>
                        <FoldHorizontal className="w-3.5 h-3.5 text-white/50" />
                        <span>已收起 (点击展开)</span>
                      </>
                    )}
                  </button>

                  {/* Tier 3 Fullscreen / Modal Editor Button */}
                  <button
                    type="button"
                    onClick={handleOpenFolderEditor}
                    className="flex items-center gap-1.5 bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm shadow-blue-500/30 transition-all cursor-pointer"
                    title="进入三级界面配置槽位、替换键位与收纳按键"
                  >
                    {isWheel ? <Compass className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                    <span>{isWheel ? '配置轮盘按键 (三级界面)' : '配置功能夹 (三级界面)'}</span>
                  </button>
                </div>
              )}

              {shortcut.keyType === 'macro' && onOpenMacroConfig && (
                <button
                  onClick={onOpenMacroConfig}
                  className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>编辑连招</span>
                </button>
              )}
            </div>

            {/* Group 2: Sliders (Size & Opacity) */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/60">大小</span>
                <input
                  type="range"
                  min={isSystemMenuKey ? 70 : 30}
                  max="150"
                  value={shortcut.sizePercent}
                  onChange={(e) => onChange({ sizePercent: Number(e.target.value) })}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0A84FF]"
                />
                <span className="text-[11px] font-mono text-[#0A84FF] w-6 text-right">
                  {shortcut.sizePercent}%
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/60">透明</span>
                <input
                  type="range"
                  min={isSystemMenuKey ? 50 : 10}
                  max="100"
                  value={shortcut.opacityPercent}
                  onChange={(e) => onChange({ opacityPercent: Number(e.target.value) })}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0A84FF]"
                />
                <span className="text-[11px] font-mono text-[#0A84FF] w-7 text-right">
                  {shortcut.opacityPercent}%
                </span>
              </div>
            </div>

            {/* Group 3: Trigger & Shape */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center bg-[#242426] p-0.5 rounded-lg border border-white/10 text-[11px]">
                {(['click', 'lock', 'hold'] as ActionType[]).map((action) => {
                  const labels = { click: '单击', lock: '连点', hold: '按住' };
                  const isSelected = shortcut.actionType === action;
                  return (
                    <button
                      key={action}
                      onClick={() => onChange({ actionType: action })}
                      className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                        isSelected
                          ? 'bg-[#0A84FF] text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {labels[action]}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                {isSystemMenuKey ? (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium">
                    系统按键 · 保护中
                  </span>
                ) : (
                  <>
                    {onDuplicateKey && (
                      <button
                        onClick={onDuplicateKey}
                        className="p-1 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        title="复制当前按键"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteKey && (
                      <button
                        onClick={onDeleteKey}
                        className="p-1 text-white/50 hover:text-red-400 bg-white/5 hover:bg-red-500/15 rounded-lg transition-colors cursor-pointer"
                        title="删除当前按键"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-1"
                    title="收起属性面板"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
    );
  }

  /* ========================================================================= */
  /* PORTRAIT / FOLDABLE LAYOUT: ENHANCED WITH SPECIALIZED CONTROLS            */
  /* ========================================================================= */
  return (
    <div
      className={`relative w-full bg-[#18181A]/85 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-2.5 text-white select-none transition-all shadow-xl z-20 overflow-visible ${
        isFoldable ? 'rounded-2xl border border-white/10' : ''
      }`}
    >
      {/* Row 1: Key Icon, Name, Pencil, Dashed Line, Special Actions, App Icon, Delete */}
      <div className="flex items-center justify-between pb-2.5">
        <div className="flex items-center gap-2.5">
          {/* Avatar / Key Binding Trigger */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenKeyBinding}
              className="w-8 h-8 rounded-full bg-[#2C2C2E] hover:bg-[#3A3A3D] hover:border-blue-400 border border-white/15 flex items-center justify-center font-bold text-sm text-white shadow-inner hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="点击进入设置键盘按键 (三级界面)"
            >
              {shortcut.keyLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                if (bindingMode === 'single' && onAddComboKey) {
                  onAddComboKey();
                } else if (onAddSingleKey) {
                  onAddSingleKey();
                } else if (onOpenKeyBinding) {
                  onOpenKeyBinding();
                }
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#242428] hover:bg-[#2c2c30] border border-white/10 text-xs text-white/80 hover:text-white transition-colors cursor-pointer"
              title="点击切换按键模式 (单键/组合键)"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  bindingMode === 'combo' ? 'bg-[#FF9F0A]' : 'bg-[#0A84FF]'
                }`}
              />
              <span className="text-[11px] font-medium">
                {bindingMode === 'combo' ? '组合键' : '单键'}
              </span>
            </button>
          </div>

          {/* Shortcut Name */}
          {isEditingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="bg-black/50 border border-blue-500 rounded px-2 py-0.5 text-[15px] font-medium text-white w-28 focus:outline-none"
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-1.5 cursor-pointer group"
            >
              <span className="text-[15px] font-medium text-white group-hover:text-blue-400 transition-colors">
                {shortcut.name}
              </span>
              <Pencil className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
            </div>
          )}
        </div>

        {/* Right side of row 1: Special configs, Visibility, App Icon, Delete */}
        <div className="flex items-center gap-2">
          {isSystemMenuKey ? (
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full font-medium">
              系统菜单 · 受保护
            </span>
          ) : (
            <>
              {/* Visibility toggle eye */}
              <button
                onClick={() => onChange({ visible: !shortcut.visible })}
                className="text-white/70 hover:text-white transition-colors cursor-pointer p-1"
                title={shortcut.visible ? '隐藏虚拟按键' : '显示虚拟按键'}
              >
                {shortcut.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4 text-red-400" />
                )}
              </button>

              {/* Duplicate Key */}
              {onDuplicateKey && (
                <button
                  onClick={onDuplicateKey}
                  className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
                  title="复制按键"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}

              {/* Delete Key */}
              {onDeleteKey && (
                <button
                  onClick={onDeleteKey}
                  className="p-1 text-white/50 hover:text-red-400 transition-colors cursor-pointer"
                  title="删除按键"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* App Switcher Entrance Icon */}
          <button
            onClick={onOpenAppSelector}
            className="cursor-pointer hover:scale-105 active:scale-95 transition-transform ml-1"
            title="选择应用"
          >
            <AppIconRenderer type={activeApp.iconType} size={30} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-1">
          {/* =============================================================== */}
          {/* SPECIALIZED FOLDER SECTION: EXPAND / COLLAPSE & TIER-3 ENTRY    */}
          {/* =============================================================== */}
          {isFolder && (
            <div className="bg-[#1D1D24] border border-blue-500/25 rounded-2xl p-3 flex flex-col gap-2.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isWheel ? (
                    <Compass className="w-4 h-4 text-[#0A84FF]" />
                  ) : (
                    <Layers className="w-4 h-4 text-indigo-400" />
                  )}
                  <span className="text-xs font-bold text-white">
                    {isWheel ? '轮盘功能夹' : '列表抽屉夹'}
                  </span>
                </div>

                {/* Enter Tier 3 Fullscreen / Modal Editor Button */}
                <button
                  type="button"
                  onClick={handleOpenFolderEditor}
                  className="flex items-center gap-1.5 bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md shadow-blue-500/30 transition-all cursor-pointer"
                  title="进入三级界面配置槽位、替换键位与收纳按键"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{isWheel ? '配置轮盘按键 (三级界面)' : '配置功能夹 (三级界面)'}</span>
                </button>
              </div>

              {/* Expand / Collapse Toggle Row */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-white/70">
                  主画布收放状态:
                </span>
                <div className="flex items-center bg-[#25252C] p-0.5 rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (isFolderExpanded) handleToggleFolderExpand();
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      !isFolderExpanded
                        ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <FoldHorizontal className="w-3.5 h-3.5" />
                    <span>收起 (折叠)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isFolderExpanded) handleToggleFolderExpand();
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isFolderExpanded
                        ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <UnfoldHorizontal className="w-3.5 h-3.5" />
                    <span>展开 (呈现)</span>
                  </button>
                </div>
              </div>

              {/* If List Folder: Direction Selector */}
              {isList && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-white/70">展开抽屉方向:</span>
                  <div className="flex items-center gap-1 bg-[#25252C] p-0.5 rounded-lg border border-white/10">
                    {[
                      { dir: 'up', label: '上', icon: <ChevronUp className="w-3 h-3" /> },
                      { dir: 'down', label: '下', icon: <ChevronDown className="w-3 h-3" /> },
                      { dir: 'left', label: '左', icon: <ChevronLeft className="w-3 h-3" /> },
                      { dir: 'right', label: '右', icon: <ChevronRight className="w-3 h-3" /> },
                    ].map((d) => {
                      const curDir = shortcut.listFolderConfig?.direction || 'up';
                      const isSel = curDir === d.dir;
                      return (
                        <button
                          key={d.dir}
                          onClick={() => {
                            const newCfg = {
                              ...(shortcut.listFolderConfig || {
                                slots: [
                                  { id: '1', index: 0, label: '1', key: '1' },
                                  { id: '2', index: 1, label: '2', key: '2' },
                                ],
                                isExpanded: isFolderExpanded,
                              }),
                              direction: d.dir as any,
                            };
                            onChange({ listFolderConfig: newCfg });
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-0.5 cursor-pointer transition-all ${
                            isSel
                              ? 'bg-[#0A84FF] text-white font-bold'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {d.icon}
                          <span>{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Special Macro Config entrance */}
          {shortcut.keyType === 'macro' && onOpenMacroConfig && (
            <div className="bg-[#241E18] border border-amber-500/25 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-200">一键连招宏按键</span>
              </div>
              <button
                onClick={onOpenMacroConfig}
                className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black text-[11px] font-bold px-3 py-1 rounded-full shadow-sm cursor-pointer"
              >
                编辑连招时序
              </button>
            </div>
          )}

          {/* Row 2: Sliders (大小 80% & 不透明度 100%) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Size Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-white/70 shrink-0">大小</span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={isSystemMenuKey ? 70 : 30}
                  max="150"
                  value={shortcut.sizePercent}
                  onChange={(e) => onChange({ sizePercent: Number(e.target.value) })}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0A84FF]"
                />
              </div>
              <span className="text-[12px] font-mono text-[#0A84FF] w-8 text-right shrink-0">
                {shortcut.sizePercent}%
              </span>
            </div>

            {/* Opacity Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-white/70 shrink-0">不透明度</span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={isSystemMenuKey ? 50 : 10}
                  max="100"
                  value={shortcut.opacityPercent}
                  onChange={(e) => onChange({ opacityPercent: Number(e.target.value) })}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0A84FF]"
                />
              </div>
              <span className="text-[12px] font-mono text-[#0A84FF] w-9 text-right shrink-0">
                {shortcut.opacityPercent}%
              </span>
            </div>
          </div>

          {/* Row 3: 按下后 & 形状 */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Trigger action: [ 单击 | 连点 | 按住 ] */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-white/70">按下后</span>
              <div className="flex items-center bg-[#242426] p-0.5 rounded-lg border border-white/10 text-xs">
                {(['click', 'lock', 'hold'] as ActionType[]).map((action) => {
                  const labels = { click: '单击', lock: '连点', hold: '按住' };
                  const isSelected = shortcut.actionType === action;
                  return (
                    <button
                      key={action}
                      onClick={() => onChange({ actionType: action })}
                      className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0A84FF] text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {labels[action]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If 连点 (lock), show Turbo Frequency */}
            {shortcut.actionType === 'lock' && (
              <div className="flex items-center gap-2 bg-[#202026] px-2.5 py-1 rounded-lg border border-blue-500/30 text-xs">
                <span className="text-[11px] text-white/60">频率</span>
                <input
                  type="range"
                  min="2"
                  max="30"
                  value={shortcut.turboFrequency || 10}
                  onChange={(e) => onChange({ turboFrequency: Number(e.target.value) })}
                  className="w-16 h-1 accent-[#0A84FF] cursor-pointer"
                />
                <span className="font-mono text-blue-400 font-semibold text-[11px]">
                  {shortcut.turboFrequency || 10}次/秒
                </span>
              </div>
            )}

            {/* Shape: [ Circle | Rect | Pill ] */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-white/70">形状</span>
              <div className="flex items-center bg-[#242426] p-0.5 rounded-lg border border-white/10">
                <button
                  onClick={() => onChange({ shape: 'circle' })}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    shortcut.shape === 'circle'
                      ? 'bg-[#0A84FF] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title="圆形"
                >
                  <Circle className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  onClick={() => onChange({ shape: 'rect' })}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    shortcut.shape === 'rect'
                      ? 'bg-[#0A84FF] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title="圆角矩形"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onChange({ shape: 'pill' })}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    shortcut.shape === 'pill'
                      ? 'bg-[#0A84FF] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title="胶囊形"
                >
                  <div className="w-3.5 h-2.5 rounded-full border border-current" />
                </button>
              </div>
            </div>
          </div>

          {/* Row 4: Switches (语音, 提示, 振动) */}
          <div className="flex items-center gap-6 py-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-[12px] text-white/80">
              <span>语音</span>
              <input
                type="checkbox"
                checked={shortcut.voice}
                onChange={(e) => onChange({ voice: e.target.checked })}
                className="sr-only"
              />
              <div
                className={`w-8 h-4.5 rounded-full transition-colors p-[2px] ${
                  shortcut.voice ? 'bg-[#0A84FF]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    shortcut.voice ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-[12px] text-white/80">
              <span>提示</span>
              <input
                type="checkbox"
                checked={shortcut.hint}
                onChange={(e) => onChange({ hint: e.target.checked })}
                className="sr-only"
              />
              <div
                className={`w-8 h-4.5 rounded-full transition-colors p-[2px] ${
                  shortcut.hint ? 'bg-[#0A84FF]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    shortcut.hint ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-[12px] text-white/80">
              <span>振动</span>
              <input
                type="checkbox"
                checked={shortcut.vibrate}
                onChange={(e) => onChange({ vibrate: e.target.checked })}
                className="sr-only"
              />
              <div
                className={`w-8 h-4.5 rounded-full transition-colors p-[2px] ${
                  shortcut.vibrate ? 'bg-[#0A84FF]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                    shortcut.vibrate ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  };
