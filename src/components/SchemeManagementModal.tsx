import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Check,
  Copy,
  Pencil,
  Trash2,
  Share2,
  Gamepad2,
  Download,
  Search,
  Smartphone,
  Monitor,
  Layers,
  Save,
  CheckCircle2,
  Info,
  ChevronRight,
  X,
  Compass,
  Zap,
  Activity,
  SlidersHorizontal,
} from 'lucide-react';
import { ControlScheme, ShortcutKey } from '../types';
import {
  detectAnchorType,
  getAnchorLabel,
  getSchemeKeysForOrientation,
  adaptKeysForOrientation,
} from '../utils/layoutPositioning';

interface Props {
  schemes: ControlScheme[];
  activeSchemeId: string;
  currentKeys?: ShortcutKey[];
  isCurrentLandscape?: boolean;
  onSelectScheme: (schemeId: string) => void;
  onCreateScheme: (name: string, options?: { keysLandscape?: ShortcutKey[]; keysPortrait?: ShortcutKey[] }) => void;
  onRenameScheme: (schemeId: string, newName: string) => void;
  onDuplicateScheme: (schemeId: string) => void;
  onDeleteScheme: (schemeId: string) => void;
  onImportCode: (code: string) => boolean;
  onOverwriteScheme?: (schemeId: string, keys: ShortcutKey[], targetOrientation?: 'all' | 'landscape' | 'portrait') => void;
  onClose: () => void;
}

export const SchemeManagementModal: React.FC<Props> = ({
  schemes,
  activeSchemeId,
  currentKeys = [],
  isCurrentLandscape = true,
  onSelectScheme,
  onCreateScheme,
  onRenameScheme,
  onDuplicateScheme,
  onDeleteScheme,
  onImportCode,
  onOverwriteScheme,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'my' | 'official' | 'import'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewSchemeId, setPreviewSchemeId] = useState<string>(activeSchemeId);
  const [previewOrientation, setPreviewOrientation] = useState<'landscape' | 'portrait'>(
    isCurrentLandscape ? 'landscape' : 'portrait'
  );
  const [hoveredKey, setHoveredKey] = useState<ShortcutKey | null>(null);

  // Rename modal / inline state
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  // Share Code Dialog
  const [shareCodeModal, setShareCodeModal] = useState<ControlScheme | null>(null);

  // Import Code state
  const [importCodeInput, setImportCodeInput] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Create new scheme modal state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');
  const [saveBothOrientations, setSaveBothOrientations] = useState(true);

  // Local feedback toast
  const [localToast, setLocalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 2200);
  };

  // Filter schemes
  const mySchemes = schemes.filter((s) => !s.isOfficial);
  const officialSchemes = schemes.filter((s) => s.isOfficial);

  const displayedList =
    activeTab === 'my'
      ? mySchemes.filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.gameApp.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : officialSchemes.filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.gameApp.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // Active scheme in preview
  const selectedPreviewScheme =
    schemes.find((s) => s.id === previewSchemeId) ||
    schemes.find((s) => s.id === activeSchemeId) ||
    schemes[0];

  // Get keys to preview based on previewOrientation
  const previewKeys = useMemo(() => {
    if (!selectedPreviewScheme) return [];
    return getSchemeKeysForOrientation(selectedPreviewScheme, previewOrientation);
  }, [selectedPreviewScheme, previewOrientation]);

  // Rename handlers
  const handleStartRename = (s: ControlScheme) => {
    setEditingSchemeId(s.id);
    setEditNameValue(s.name);
  };

  const handleSaveRename = (schemeId: string) => {
    if (editNameValue.trim()) {
      onRenameScheme(schemeId, editNameValue.trim());
      showToast('方案名称已更新');
    }
    setEditingSchemeId(null);
  };

  // Create new scheme
  const handleCreateNew = () => {
    if (newSchemeName.trim()) {
      const keysL = isCurrentLandscape
        ? currentKeys
        : adaptKeysForOrientation(currentKeys, 'landscape');
      const keysP = !isCurrentLandscape
        ? currentKeys
        : adaptKeysForOrientation(currentKeys, 'portrait');

      onCreateScheme(newSchemeName.trim(), {
        keysLandscape: keysL,
        keysPortrait: saveBothOrientations ? keysP : undefined,
      });
      setNewSchemeName('');
      setIsCreatingNew(false);
      setActiveTab('my');
      showToast(`已新建方案「${newSchemeName.trim()}」并录入当前画布键位`);
    }
  };

  // Overwrite handler
  const handleOverwrite = (targetSchemeId: string) => {
    if (onOverwriteScheme && currentKeys.length > 0) {
      onOverwriteScheme(targetSchemeId, currentKeys, 'all');
      showToast('已将当前画布最新按键覆盖保存至该方案');
    } else {
      showToast('当前画布无可保存的按键');
    }
  };

  // Overwrite specific orientation handler
  const handleOverwriteOrientation = (targetSchemeId: string, orientation: 'landscape' | 'portrait') => {
    if (onOverwriteScheme && currentKeys.length > 0) {
      onOverwriteScheme(targetSchemeId, currentKeys, orientation);
      showToast(`已成功将当前键位保存为专属「${orientation === 'landscape' ? '横屏' : '竖屏'}」布局`);
    }
  };

  // Import handler
  const handleRunImport = () => {
    if (!importCodeInput.trim()) return;
    const ok = onImportCode(importCodeInput.trim().toUpperCase());
    if (ok) {
      setImportFeedback('✅ 方案导入成功并已设为当前激活方案！');
      setTimeout(() => {
        setImportFeedback(null);
        setActiveTab('my');
      }, 1200);
    } else {
      setImportFeedback('❌ 未找到匹配的方案码，请检查后重试');
      setTimeout(() => setImportFeedback(null), 2500);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0E0E12]/95 backdrop-blur-2xl text-white flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {localToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C24] border border-blue-500/40 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{localToast}</span>
        </div>
      )}

      {/* 1. TOP HEADER BAR */}
      <div className="w-full flex items-center justify-between px-3 sm:px-6 py-2.5 shrink-0 border-b border-white/10 bg-[#14141A]">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#202028] hover:bg-[#2C2C38] active:bg-[#383846] flex items-center justify-center text-white/90 active:scale-95 transition-all cursor-pointer"
            title="返回主界面"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#0A84FF]" />
              <span>切换布局与方案</span>
              <span className="text-[10px] sm:text-xs bg-blue-500/20 text-[#0A84FF] px-2 py-0.5 rounded-full font-semibold border border-blue-500/30">
                二级管理中心
              </span>
            </h1>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Overwrite Active Scheme */}
          {currentKeys.length > 0 && onOverwriteScheme && (
            <button
              onClick={() => handleOverwrite(activeSchemeId)}
              className="hidden sm:flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 active:scale-95 transition-all cursor-pointer"
              title="将当前画布键位快速覆盖保存至当前方案"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>覆盖保存当前</span>
            </button>
          )}

          {/* + Save As New Scheme */}
          <button
            onClick={() => setIsCreatingNew(true)}
            className="flex items-center gap-1.5 bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>另存为新方案</span>
          </button>
        </div>
      </div>

      {/* 2. TAB NAV BAR */}
      <div className="w-full flex items-center justify-between px-3 sm:px-6 bg-[#16161D] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={() => setActiveTab('my')}
            className={`text-xs sm:text-sm font-medium transition-all relative py-2.5 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'my'
                ? 'text-white font-semibold'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>我的自定义 ({mySchemes.length})</span>
            {activeTab === 'my' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A84FF] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('official')}
            className={`text-xs sm:text-sm font-medium transition-all relative py-2.5 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'official'
                ? 'text-white font-semibold'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>官方精选推荐 ({officialSchemes.length})</span>
            {activeTab === 'official' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`text-xs sm:text-sm font-medium transition-all relative py-2.5 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'text-white font-semibold'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>方案码导入与提取</span>
            {activeTab === 'import' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Search input in header if on my/official tab */}
        {activeTab !== 'import' && (
          <div className="hidden md:flex items-center bg-[#20202A] px-2.5 py-1 rounded-lg border border-white/10 w-44">
            <Search className="w-3.5 h-3.5 text-white/40 shrink-0 mr-1.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索方案或游戏..."
              className="bg-transparent text-xs text-white placeholder-white/30 focus:outline-none w-full"
            />
          </div>
        )}
      </div>

      {/* 3. MAIN BODY (SPLIT DUAL PANEL) */}
      <div className="flex-1 w-full overflow-hidden flex flex-col lg:flex-row">
        {/* =============================================================== */}
        {/* LEFT PANEL: SCHEME LIST OR IMPORT TAB                            */}
        {/* =============================================================== */}
        <div className="w-full lg:w-[48%] xl:w-[45%] h-full flex flex-col border-r border-white/5 bg-[#111116] overflow-hidden">
          {activeTab === 'import' ? (
            /* TAB: IMPORT VIA CODE */
            <div className="p-4 sm:p-6 flex flex-col gap-4 max-w-lg mx-auto w-full my-auto">
              <div className="p-5 rounded-2xl bg-[#1A1A24] border border-white/10 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Download className="w-4 h-4 text-[#0A84FF]" />
                  <span>输入 6 位方案码快速导入</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  通过好友或官方社区分享的方案码（如 <code className="text-blue-400">LOL888</code>、
                  <code className="text-purple-400">FPS666</code>、<code className="text-emerald-400">DIABLO</code>），一键完整还原全套按键、轮盘与宏配置。
                </p>

                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={importCodeInput}
                    onChange={(e) => setImportCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunImport()}
                    placeholder="输入方案码 (如 LOL888)"
                    maxLength={10}
                    className="flex-1 bg-[#121217] border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-wider placeholder-white/30 focus:outline-none focus:border-blue-500 uppercase"
                  />
                  <button
                    onClick={handleRunImport}
                    className="bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    立即导入
                  </button>
                </div>

                {importFeedback && (
                  <div
                    className={`mt-2 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      importFeedback.startsWith('✅')
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-300 border border-red-500/30'
                    }`}
                  >
                    <span>{importFeedback}</span>
                  </div>
                )}
              </div>

              {/* Preset Quick Codes */}
              <div className="p-4 rounded-2xl bg-[#15151F] border border-white/5 flex flex-col gap-2">
                <span className="text-xs font-semibold text-white/70">热门方案码快捷填入：</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: 'LOL888', label: '英雄联盟 MOBA' },
                    { code: 'FPS666', label: '无畏契约/CS射击' },
                    { code: 'DIABLO', label: '暗黑破坏神: 不朽' },
                    { code: 'OFFICE', label: '办公生产力套件' },
                  ].map((p) => (
                    <button
                      key={p.code}
                      onClick={() => {
                        setImportCodeInput(p.code);
                        onImportCode(p.code);
                        showToast(`已通过方案码「${p.code}」载入并应用方案`);
                        setActiveTab('my');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer font-mono"
                    >
                      <span className="font-bold text-blue-400">{p.code}</span>
                      <span className="text-[11px] text-white/50">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* TAB: MY SCHEMES / OFFICIAL SCHEMES LIST */
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 scrollbar-thin">
              {/* Mobile Search input */}
              <div className="md:hidden flex items-center bg-[#20202A] px-3 py-2 rounded-xl border border-white/10 mb-2">
                <Search className="w-3.5 h-3.5 text-white/40 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索方案或游戏..."
                  className="bg-transparent text-xs text-white placeholder-white/30 focus:outline-none w-full"
                />
              </div>

              {displayedList.length === 0 ? (
                <div className="text-center py-12 text-white/40 text-xs flex flex-col items-center gap-2">
                  <Gamepad2 className="w-8 h-8 opacity-30" />
                  <span>未找到匹配的方案</span>
                  {activeTab === 'my' && (
                    <button
                      onClick={() => setIsCreatingNew(true)}
                      className="mt-2 text-[#0A84FF] hover:underline"
                    >
                      立即新建当前按键方案
                    </button>
                  )}
                </div>
              ) : (
                displayedList.map((scheme) => {
                  const isActive = scheme.id === activeSchemeId;
                  const isPreviewing = scheme.id === selectedPreviewScheme?.id;

                  return (
                    <div
                      key={scheme.id}
                      onClick={() => setPreviewSchemeId(scheme.id)}
                      className={`relative p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                        isPreviewing
                          ? 'bg-[#1C1C26] border-blue-500/60 shadow-lg shadow-blue-500/10'
                          : 'bg-[#15151D] border-white/10 hover:border-white/20 hover:bg-[#181822]'
                      } ${isActive ? 'ring-1 ring-emerald-500/50' : ''}`}
                    >
                      {/* Row 1: Badges & Name */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              scheme.isOfficial
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-blue-500/20 text-[#0A84FF] border border-blue-500/30'
                            }`}
                          >
                            <Gamepad2 className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            {editingSchemeId === scheme.id ? (
                              <div
                                className="flex items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="text"
                                  value={editNameValue}
                                  onChange={(e) => setEditNameValue(e.target.value)}
                                  onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSaveRename(scheme.id)
                                  }
                                  autoFocus
                                  className="bg-black/60 border border-blue-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                                />
                                <button
                                  onClick={() => handleSaveRename(scheme.id)}
                                  className="p-1 text-emerald-400 hover:text-emerald-300"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingSchemeId(null)}
                                  className="p-1 text-white/40 hover:text-white"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-xs sm:text-sm text-white truncate max-w-[150px] sm:max-w-[200px]">
                                  {scheme.name}
                                </span>
                                {isActive && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>当前使用中</span>
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="text-[11px] text-white/50 truncate">
                              {scheme.gameApp}
                            </div>
                          </div>
                        </div>

                        {/* Top Right Quick Badges */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded-md border border-white/5 font-mono">
                            {scheme.keys.length} 控件
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Description & Adapting Badges */}
                      <p className="text-[11px] text-white/60 line-clamp-1 leading-relaxed">
                        {scheme.description || '自定义全套按键布局配置'}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-white/40">
                        <span className="bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5 text-white/60">
                          四角边缘自适应吸附
                        </span>
                        {scheme.keysLandscape && scheme.keysLandscape.length > 0 && (
                          <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded">
                            横屏专属
                          </span>
                        )}
                        {scheme.keysPortrait && scheme.keysPortrait.length > 0 && (
                          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            竖屏专属
                          </span>
                        )}
                        <span className="ml-auto font-mono text-[10px] text-white/30">
                          {scheme.updatedAt}
                        </span>
                      </div>

                      {/* Row 3: Action Buttons Bar */}
                      <div
                        className="mt-1 pt-2 border-t border-white/5 flex items-center justify-between gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Quick Replace / Apply Button */}
                        <button
                          onClick={() => {
                            onSelectScheme(scheme.id);
                            showToast(`已快速替换并生效「${scheme.name}」布局！`);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isActive ? '重新载入应用' : '快速替换应用'}</span>
                        </button>

                        {/* Secondary Tools */}
                        <div className="flex items-center gap-1 text-white/60">
                          {/* Overwrite with current keys */}
                          {currentKeys.length > 0 && onOverwriteScheme && (
                            <button
                              onClick={() => handleOverwrite(scheme.id)}
                              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                              title="将当前画布键位覆盖保存至此方案"
                            >
                              <Save className="w-3.5 h-3.5 text-emerald-400" />
                            </button>
                          )}

                          {/* Rename */}
                          {!scheme.isOfficial && (
                            <button
                              onClick={() => handleStartRename(scheme)}
                              className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                              title="重命名"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Duplicate */}
                          <button
                            onClick={() => onDuplicateScheme(scheme.id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                            title="复制副本"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Share Code */}
                          <button
                            onClick={() => setShareCodeModal(scheme)}
                            className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                            title="查看方案分享码"
                          >
                            <Share2 className="w-3.5 h-3.5 text-purple-400" />
                          </button>

                          {/* Delete (if not official) */}
                          {!scheme.isOfficial && schemes.length > 1 && (
                            <button
                              onClick={() => onDeleteScheme(scheme.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
                              title="删除方案"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* =============================================================== */}
        {/* RIGHT PANEL: INTERACTIVE MICRO-PREVIEW (横竖屏即时微缩预览)     */}
        {/* =============================================================== */}
        <div className="w-full lg:w-[52%] xl:w-[55%] h-full flex flex-col bg-[#0A0A0E] overflow-hidden">
          {/* Preview Toolbar */}
          <div className="px-4 py-2 bg-[#121217] border-b border-white/5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>实时微缩预览:</span>
                <span className="text-blue-400 max-w-[140px] truncate">
                  {selectedPreviewScheme?.name}
                </span>
              </span>
            </div>

            {/* Orientation Switcher Pill: [ 🖥️ 横屏预览 ] [ 📱 竖屏预览 ] */}
            <div className="flex items-center bg-[#1F1F28] p-0.5 rounded-full border border-white/10 text-xs">
              <button
                onClick={() => setPreviewOrientation('landscape')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  previewOrientation === 'landscape'
                    ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
                title="切换为横屏微缩视口 (16:9)"
              >
                <Monitor className="w-3 h-3" />
                <span>横屏预览</span>
              </button>
              <button
                onClick={() => setPreviewOrientation('portrait')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  previewOrientation === 'portrait'
                    ? 'bg-[#0A84FF] text-white shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
                title="切换为竖屏微缩视口 (9:16)"
              >
                <Smartphone className="w-3 h-3" />
                <span>竖屏预览</span>
              </button>
            </div>
          </div>

          {/* Positioning Strategy & Ergonomics Notice */}
          <div className="px-4 py-1.5 bg-[#14141E] border-b border-white/5 flex items-center justify-between text-[11px] text-white/60 shrink-0">
            <div className="flex items-center gap-1.5">
              <Info className="w-3 h-3 text-[#0A84FF] shrink-0" />
              <span>
                定位机制: <strong className="text-white/90">百分比坐标 + 四角边缘吸附自适应</strong>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-white/40">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                左手移动区
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                右手技能区
              </span>
            </div>
          </div>

          {/* Micro Device Bezel & Live Key Canvas */}
          <div className="flex-1 p-3 sm:p-5 flex items-center justify-center overflow-hidden relative">
            <div
              className={`relative bg-[#050508] border-2 border-white/20 rounded-[28px] shadow-2xl transition-all duration-300 flex items-center justify-center overflow-hidden ${
                previewOrientation === 'landscape'
                  ? 'w-[94%] max-w-[500px] aspect-[16/9] max-h-[300px]'
                  : 'h-[92%] max-h-[380px] aspect-[9/16] w-auto'
              }`}
              style={{
                boxShadow: '0 20px 45px -10px rgba(0,0,0,0.8), inset 0 0 15px rgba(255,255,255,0.05)',
              }}
            >
              {/* Simulated Device Bezel Features */}
              {previewOrientation === 'landscape' ? (
                // Landscape camera notch on left edge
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white/20 rounded-full z-30 pointer-events-none" />
              ) : (
                // Portrait camera pill on top edge
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-2 bg-white/25 rounded-full z-30 pointer-events-none" />
              )}

              {/* Background Mock Grid */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Four Corner Anchor Visual Guides (Soft ambient glow) */}
              <div className="absolute bottom-2 left-2 w-16 h-16 rounded-full bg-blue-500/5 pointer-events-none border border-blue-500/10" />
              <div className="absolute bottom-2 right-2 w-16 h-16 rounded-full bg-purple-500/5 pointer-events-none border border-purple-500/10" />

              {/* Real Keys Display in Preview */}
              {previewKeys.map((k) => {
                const anchor = detectAnchorType(k.x, k.y);
                const isHovered = hoveredKey?.id === k.id;
                const isFolder = k.keyType === 'wheel-folder' || k.keyType === 'list-folder';

                return (
                  <div
                    key={k.id}
                    onMouseEnter={() => setHoveredKey(k)}
                    onMouseLeave={() => setHoveredKey(null)}
                    style={{
                      left: `${k.x}%`,
                      top: `${k.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-20 flex items-center justify-center transition-all cursor-pointer ${
                      isHovered ? 'scale-125 z-40' : 'hover:scale-110'
                    }`}
                  >
                    {/* Key Visual Shape */}
                    <div
                      className={`relative flex items-center justify-center transition-all ${
                        k.shape === 'pill'
                          ? 'px-2 py-0.5 rounded-full'
                          : k.shape === 'rect'
                          ? 'w-7 h-7 rounded-lg'
                          : 'w-7 h-7 rounded-full'
                      } ${
                        isFolder
                          ? 'bg-gradient-to-br from-purple-600/80 to-indigo-700/80 border border-purple-400/80 shadow-md shadow-purple-500/30'
                          : k.keyType === 'macro'
                          ? 'bg-amber-600/70 border border-amber-400/80 text-amber-200'
                          : k.keyType === 'hud'
                          ? 'bg-emerald-950/70 border border-emerald-500/50 px-2 py-0.5 rounded-full'
                          : anchor === 'bottom-left'
                          ? 'bg-blue-600/70 border border-blue-400/70'
                          : anchor === 'bottom-right'
                          ? 'bg-purple-600/70 border border-purple-400/70'
                          : 'bg-white/20 border border-white/40'
                      }`}
                    >
                      {/* Key Content */}
                      <span className="text-[10px] font-bold text-white tracking-tight truncate max-w-[36px]">
                        {k.keyType === 'hud' ? 'HUD' : k.keyLabel}
                      </span>

                      {/* Small Folder Indicator Ring */}
                      {isFolder && (
                        <span className="absolute -inset-1 rounded-full border border-purple-400/40 border-dashed animate-spin-slow pointer-events-none" />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Hover Tooltip Overlay inside preview */}
              {hoveredKey && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 text-white px-3 py-1.5 rounded-xl shadow-xl z-50 text-[11px] flex items-center gap-2 pointer-events-none backdrop-blur-md">
                  <span className="font-bold text-blue-400">{hoveredKey.name || hoveredKey.keyLabel}</span>
                  <span className="text-white/40">|</span>
                  <span className="font-mono text-white/80">X:{hoveredKey.x}% Y:{hoveredKey.y}%</span>
                  <span className="text-white/40">|</span>
                  <span className="text-emerald-400 text-[10px]">
                    {getAnchorLabel(detectAnchorType(hoveredKey.x, hoveredKey.y))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Footer for Preview Scheme */}
          <div className="p-3 sm:p-4 bg-[#14141C] border-t border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              {/* Overwrite specific orientation */}
              {currentKeys.length > 0 && onOverwriteScheme && (
                <button
                  onClick={() =>
                    handleOverwriteOrientation(
                      selectedPreviewScheme?.id || activeSchemeId,
                      previewOrientation
                    )
                  }
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 active:bg-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 active:scale-95 transition-all cursor-pointer"
                  title={`将当前画布的按键只保存为该方案的独立「${
                    previewOrientation === 'landscape' ? '横屏' : '竖屏'
                  }」布局`}
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    保存当前为{previewOrientation === 'landscape' ? '横屏' : '竖屏'}专属
                  </span>
                </button>
              )}
            </div>

            {/* Big One-Click Replace Button */}
            <button
              onClick={() => {
                if (selectedPreviewScheme) {
                  onSelectScheme(selectedPreviewScheme.id);
                  showToast(`已应用方案「${selectedPreviewScheme.name}」！`);
                }
              }}
              className="flex items-center gap-2 bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-xs font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>立即应用此布局 (快速替换)</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MODAL: SAVE AS NEW SCHEME                                        */}
      {/* =================================================================== */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-[#181822] border border-white/15 rounded-3xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0A84FF]" />
                <span>保存为新方案</span>
              </h3>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-1 rounded-full text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              将当前画布中的 {currentKeys.length} 个按键、功能夹与宏连招保存为一个全新的独立方案。
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/70 font-medium">方案名称</label>
              <input
                type="text"
                value={newSchemeName}
                onChange={(e) => setNewSchemeName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNew()}
                placeholder="例如: 掌机专属FPS方案、黑神话定制"
                autoFocus
                className="bg-[#101016] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveBothOrientations}
                onChange={(e) => setSaveBothOrientations(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span>同时自适应生成横屏与竖屏专属独立配置</span>
            </label>

            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setIsCreatingNew(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleCreateNew}
                disabled={!newSchemeName.trim()}
                className="bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. MODAL: SHARE CODE POPUP                                          */}
      {/* =================================================================== */}
      {shareCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-[#181822] border border-white/15 rounded-3xl p-5 max-w-sm w-full flex flex-col gap-4 shadow-2xl text-center">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>方案分享码</span>
              </h3>
              <button
                onClick={() => setShareCodeModal(null)}
                className="p-1 rounded-full text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F0F16] border border-white/10 flex flex-col items-center gap-2">
              <span className="text-xs text-white/50">方案「{shareCodeModal.name}」专属码</span>
              <span className="text-2xl font-black text-[#0A84FF] font-mono tracking-widest">
                {shareCodeModal.code}
              </span>
              <span className="text-[11px] text-white/40">
                其他设备在「方案码导入」输入此代码即可一键获取
              </span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(shareCodeModal.code);
                showToast(`已复制方案码: ${shareCodeModal.code}`);
                setShareCodeModal(null);
              }}
              className="bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>复制方案码到剪贴板</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
