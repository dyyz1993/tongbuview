import { Wifi, ChevronDown, ChevronUp, Folders, Home, Play, FoldHorizontal } from 'lucide-react';

interface Props {
  isLandscape?: boolean;
  hideFakeStatusBar?: boolean;
  onComplete?: () => void;
  onReturnHome?: () => void;
  onReturnToPlay?: () => void;
  schemeName?: string;
  onRenameScheme?: (newName: string) => void;
  onOpenSchemeManager?: () => void;
  bindingMode?: 'single' | 'combo';
  onAddSingleKey?: () => void;
  onAddComboKey?: () => void;
  onClear?: () => void;
  onCollapseAll?: () => void;
  onToggleTopBar?: () => void;
}

export const EditorTopBar: React.FC<Props> = ({
  isLandscape = false,
  hideFakeStatusBar = true,
  onComplete,
  onReturnHome,
  onReturnToPlay,
  schemeName = '默认',
  onRenameScheme,
  onOpenSchemeManager,
  bindingMode = 'single',
  onAddSingleKey,
  onAddComboKey,
  onClear,
  onCollapseAll,
  onToggleTopBar,
}) => {
  return (
    <div className="w-full select-none shrink-0 bg-[#161618] border-b border-white/10">
      {/* iOS Status Bar (only shown if not in MobileShell) */}
      {!isLandscape && !hideFakeStatusBar && (
        <div className="w-full flex items-center justify-between px-6 pt-2 pb-1 text-[13px] text-white/90 font-medium">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="w-5 h-2.5 border border-white/80 rounded-sm p-[1px] flex items-center">
              <div className="w-full h-full bg-white rounded-2xs" />
            </div>
          </div>
        </div>
      )}

      {/* PORTRAIT TWO-ROW TOPBAR */}
      {!isLandscape ? (
        <div className="w-full flex flex-col">
          {/* Row 1: App Header & Complete Button */}
          <div className="w-full flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              {onReturnHome && (
                <button
                  onClick={onReturnHome}
                  className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer mr-1"
                  title="断开并返回主页设备列表"
                >
                  <Home className="w-3.5 h-3.5 text-blue-400" />
                  <span>主页</span>
                </button>
              )}
              <span className="text-white text-[16px] font-semibold tracking-tight">Drel</span>
              <span className="text-white/30 text-[13px]">·</span>
              <span className="text-white/85 text-[14px] font-medium tracking-tight">按键编辑器</span>
            </div>

            <div className="flex items-center gap-2">
              {onCollapseAll && (
                <button
                  onClick={onCollapseAll}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/90 hover:text-white text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer border border-white/10 active:scale-95"
                  title="完全收起工具与属性面板，100%通透无遮挡操控"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>全收起</span>
                </button>
              )}

              {/* Complete & Return to Tier 1 Button */}
              <button
                onClick={() => {
                  if (onComplete) onComplete();
                  if (onReturnToPlay) onReturnToPlay();
                }}
                className="flex items-center gap-1.5 bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-[13px] font-medium px-4 py-1 rounded-full shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
                title="保存并返回一级操控态"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>完成操控</span>
              </button>
            </div>
          </div>

          {/* Row 2: Dedicated Action Toolbar (Scheme on Left, Single/Combo Centered, Clear on Right) */}
          <div className="w-full flex items-center justify-between px-4 py-1.5 bg-[#1C1C1F] border-t border-white/5 relative">
            {/* Left: Scheme Selector: 方案: 默认 ▾ (Click to open full 操控方案 modal) */}
            <button
              onClick={onOpenSchemeManager}
              className="flex items-center gap-1.5 bg-[#252529] hover:bg-[#2e2e33] active:bg-[#35353c] px-2.5 py-1 rounded-full border border-white/10 text-xs text-white/90 transition-all cursor-pointer shrink-0 shadow-sm group"
              title="点击打开操控方案管理 (支持预设切换、导入方案码、新建方案)"
            >
              <Folders className="w-3 h-3 text-[#0A84FF] group-hover:scale-110 transition-transform" />
              <span className="text-white/50 text-[11px]">方案:</span>
              <span className="font-semibold text-white text-xs max-w-[80px] truncate">{schemeName}</span>
              <ChevronDown className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
            </button>

            {/* DEAD CENTER: [+ 单键] [+ 组合键] Segmented Pill */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
              {(onAddSingleKey || onAddComboKey) && (
                <div className="flex items-center bg-[#252529] p-0.5 rounded-full border border-white/10 text-xs shadow-inner">
                  {onAddSingleKey && (
                    <button
                      onClick={onAddSingleKey}
                      className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        bindingMode === 'single'
                          ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                      title="添加/映射单个按键（点击按键即生效收回）"
                    >
                      <span className="text-[11px] font-bold">+</span>
                      <span>单键</span>
                    </button>
                  )}
                  {onAddComboKey && (
                    <button
                      onClick={onAddComboKey}
                      className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        bindingMode === 'combo'
                          ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                      title="添加/映射组合按键（支持多选组合，点完成生效）"
                    >
                      <span className="text-[11px] font-bold">+</span>
                      <span>组合键</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: Clear button */}
            <div className="flex items-center shrink-0">
              {onClear && (
                <button
                  onClick={onClear}
                  className="text-white/50 hover:text-white text-xs px-2.5 py-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                  title="清空当前按键绑定"
                >
                  清空
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LANDSCAPE SINGLE-ROW COMPACT HEADER */
        <div className="w-full flex items-center justify-between px-4 py-2 relative">
          {/* Left: Brand + Scheme Selector */}
          <div className="flex items-center gap-3 shrink-0">
            {onReturnHome && (
              <button
                onClick={onReturnHome}
                className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                title="断开并返回主页设备列表"
              >
                <Home className="w-3.5 h-3.5 text-blue-400" />
                <span>主页</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-white text-[15px] font-semibold tracking-tight">Drel</span>
              <span className="text-white/30 text-[13px]">·</span>
              <span className="text-white/85 text-[14px] font-medium tracking-tight">按键编辑器</span>
            </div>

            {/* Scheme Selector */}
            <button
              onClick={onOpenSchemeManager}
              className="flex items-center gap-1.5 bg-[#252529] hover:bg-[#2e2e33] active:bg-[#35353c] px-2.5 py-1 rounded-full border border-white/10 text-xs text-white/90 transition-all cursor-pointer group"
              title="点击打开操控方案管理"
            >
              <Folders className="w-3 h-3 text-[#0A84FF] group-hover:scale-110 transition-transform" />
              <span className="text-white/50 text-[11px]">方案:</span>
              <span className="font-semibold text-white text-xs max-w-[100px] truncate">{schemeName}</span>
              <ChevronDown className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* DEAD CENTER: Single/Combo Control in Landscape */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            {(onAddSingleKey || onAddComboKey) && (
              <div className="flex items-center bg-[#252529] p-0.5 rounded-full border border-white/10 text-xs shadow-inner">
                {onAddSingleKey && (
                  <button
                    onClick={onAddSingleKey}
                    className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      bindingMode === 'single'
                        ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                    title="添加/映射单个按键"
                  >
                    <span className="text-[11px] font-bold">+</span>
                    <span>单键</span>
                  </button>
                )}
                {onAddComboKey && (
                  <button
                    onClick={onAddComboKey}
                    className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      bindingMode === 'combo'
                        ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                    title="添加/映射组合按键"
                  >
                    <span className="text-[11px] font-bold">+</span>
                    <span>组合键</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Clear + Complete */}
          <div className="flex items-center gap-2 shrink-0">
            {onCollapseAll && (
              <button
                onClick={onCollapseAll}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white/90 hover:text-white text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer border border-white/10 active:scale-95"
                title="完全收起工具与属性面板，100%通透无遮挡操控"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>全收起</span>
              </button>
            )}

            {onClear && (
              <button
                onClick={onClear}
                className="text-white/50 hover:text-white text-xs px-2.5 py-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                title="清空当前按键绑定"
              >
                清空
              </button>
            )}

            <button
              onClick={() => {
                if (onComplete) onComplete();
                if (onReturnToPlay) onReturnToPlay();
              }}
              className="flex items-center gap-1.5 bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-[13px] font-medium px-4 py-1 rounded-full shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
              title="保存并返回一级操控态"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>完成操控</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
