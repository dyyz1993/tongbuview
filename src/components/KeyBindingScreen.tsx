import React, { useState } from 'react';
import {
  ArrowLeft,
  X,
  Plus,
  EyeOff,
  ZoomIn,
  Mouse,
  Compass,
  Layers,
  Zap,
  Keyboard,
  Play,
  Volume2,
  Camera,
  LayoutGrid,
  MousePointer,
  CircleDot,
  ArrowUpCircle,
  ArrowDownCircle,
  Check,
  Sparkles,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { ShortcutKey, ModifierKey, VirtualKeyType } from '../types';

interface Props {
  shortcut: ShortcutKey;
  bindingMode: 'single' | 'combo';
  onSave: (updated: Partial<ShortcutKey>) => void;
  onClose: () => void;
}

type TabType = 'keyboard' | 'mouse' | 'functions';

interface FunctionItem {
  id: string;
  category: 'folder' | 'macro' | 'system';
  categoryLabel: string;
  title: string;
  desc: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  iconBg: string;
  keyLabel: string;
  keyType: VirtualKeyType;
}

export const KeyBindingScreen: React.FC<Props> = ({
  shortcut,
  bindingMode = 'single',
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(
    shortcut.isSystemAction || shortcut.keyType === 'wheel-folder' || shortcut.keyType === 'list-folder' || shortcut.keyType === 'macro'
      ? 'functions'
      : 'keyboard'
  );

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'folder' | 'macro' | 'system'>('all');

  // For combo mode: list of combo keys/modifiers, e.g. ['cmd', 'shift', 'E']
  const [comboKeys, setComboKeys] = useState<string[]>(() => {
    const list: string[] = [];
    if (shortcut.modifiers && shortcut.modifiers.length > 0) {
      list.push(...shortcut.modifiers);
    }
    if (shortcut.primaryKey) {
      list.push(shortcut.primaryKey);
    }
    return list.length > 0 ? list : ['W'];
  });

  const [singleKey] = useState<string>(shortcut.primaryKey || 'W');
  const [selectedActionId, setSelectedActionId] = useState<string | null>(
    shortcut.systemActionId || (shortcut.keyType === 'wheel-folder' ? 'fn-wheel-folder' : shortcut.keyType === 'list-folder' ? 'fn-list-folder' : null)
  );

  /* ========================================================================= */
  /* POLISHED FUNCTION LIST & SYSTEM ACTIONS                                    */
  /* ========================================================================= */
  const functionItems: FunctionItem[] = [
    // 1. Foldable Folders (收放型功能夹)
    {
      id: 'fn-wheel-folder',
      category: 'folder',
      categoryLabel: '收放型功能夹',
      title: '轮盘功能夹',
      desc: '支持8向环形技能收放，属性面板可切换展开/收起，并可进入三级插槽编辑',
      badge: '支持收放',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: <Compass className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-500/15 border-blue-500/30',
      keyLabel: '轮盘',
      keyType: 'wheel-folder',
    },
    {
      id: 'fn-list-folder',
      category: 'folder',
      categoryLabel: '收放型功能夹',
      title: '列表抽屉夹',
      desc: '折叠抽屉式多键组，支持上下左右定向展开，属性面板可随时切换收起与展开',
      badge: '支持收放',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      iconBg: 'bg-indigo-500/15 border-indigo-500/30',
      keyLabel: '抽屉',
      keyType: 'list-folder',
    },

    // 2. Macros & Advanced Inputs
    {
      id: 'fn-macro',
      category: 'macro',
      categoryLabel: '宏与高级映射',
      title: '宏按键 (一键连招)',
      desc: '支持多个按键时序连发、毫秒级精准延时，循环单发或按住循环连招',
      badge: '一键连招',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      keyLabel: '⚡️宏',
      keyType: 'macro',
    },
    {
      id: 'fn-keyboard-input',
      category: 'macro',
      categoryLabel: '宏与高级映射',
      title: '虚拟键盘打字输入',
      desc: '在游戏或应用中呼出快捷虚拟软键盘，支持文字快速输入与聊天',
      badge: '打字呼出',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: <Keyboard className="w-5 h-5 text-cyan-400" />,
      iconBg: 'bg-cyan-500/15 border-cyan-500/30',
      keyLabel: '输入',
      keyType: 'system',
    },

    // 3. System Actions
    {
      id: 'fn-hide-all',
      category: 'system',
      categoryLabel: '系统辅助与控制',
      title: '一键隐藏所有虚拟键',
      desc: '点击隐匿屏幕上所有浮动控件保持画面干净，再次点击瞬间恢复',
      badge: '快捷隐匿',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: <EyeOff className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      keyLabel: '隐藏',
      keyType: 'system',
    },
    {
      id: 'fn-zoom',
      category: 'system',
      categoryLabel: '系统辅助与控制',
      title: '界面快捷局域放大',
      desc: '按下后可放大当前视区，释放手指后即刻平滑恢复原始画面',
      badge: '视区放大',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      icon: <ZoomIn className="w-5 h-5 text-teal-400" />,
      iconBg: 'bg-teal-500/15 border-teal-500/30',
      keyLabel: '放大',
      keyType: 'system',
    },
    {
      id: 'fn-capture',
      category: 'system',
      categoryLabel: '系统辅助与控制',
      title: '截图与录屏快捷键',
      desc: '快速抓取当前游戏高光瞬间或启动后台高清录制',
      badge: '截屏录屏',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: <Camera className="w-5 h-5 text-rose-400" />,
      iconBg: 'bg-rose-500/15 border-rose-500/30',
      keyLabel: '📸',
      keyType: 'system',
    },
    {
      id: 'fn-window',
      category: 'system',
      categoryLabel: '系统辅助与控制',
      title: '调度中心与桌面显示',
      desc: '展开 macOS / Windows 任务调度，或快速最小化所有窗口回到桌面',
      badge: '窗口调度',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      icon: <LayoutGrid className="w-5 h-5 text-sky-400" />,
      iconBg: 'bg-sky-500/15 border-sky-500/30',
      keyLabel: '⊞',
      keyType: 'system',
    },
    {
      id: 'fn-media',
      category: 'system',
      categoryLabel: '系统辅助与控制',
      title: '多媒体播放控制',
      desc: '快捷控制系统背景音乐，支持播放/暂停、上一首、下一首切歌',
      badge: '媒体切歌',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: <Play className="w-5 h-5 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      keyLabel: '⏯',
      keyType: 'system',
    },
    {
      id: 'fn-volume',
      category: 'system',
      categoryLabel: '系统辅助与控制',
      title: '主音量调节与静音',
      desc: '快速步进增减系统音量，长按一键切换全局静音状态',
      badge: '音量调节',
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      icon: <Volume2 className="w-5 h-5 text-orange-400" />,
      iconBg: 'bg-orange-500/15 border-orange-500/30',
      keyLabel: '🔊',
      keyType: 'system',
    },
  ];

  /* Mouse items */
  const mouseKeyItems = [
    {
      id: 'mouse-left',
      title: '鼠标左键',
      desc: '标准左键点击，基础确认、普攻或开火射击',
      icon: <MousePointer className="w-5 h-5 text-blue-400" />,
      keyLabel: '左键',
    },
    {
      id: 'mouse-right',
      title: '鼠标右键行走模式',
      desc: '模拟右键点击，适用于 MOBA、ARPG 智能寻路行走或开镜瞄准',
      icon: <Mouse className="w-5 h-5 text-emerald-400" />,
      keyLabel: '右键',
    },
    {
      id: 'mouse-wheel-up',
      title: '滚轮向上滚动',
      desc: '视野向前推移、枪械快捷切枪或向上滚屏翻页',
      icon: <ArrowUpCircle className="w-5 h-5 text-amber-400" />,
      keyLabel: '滚轮↑',
    },
    {
      id: 'mouse-wheel-down',
      title: '滚轮向下滚动',
      desc: '视野向后拉远、装备快速下切或向下滚屏翻页',
      icon: <ArrowDownCircle className="w-5 h-5 text-amber-400" />,
      keyLabel: '滚轮↓',
    },
    {
      id: 'mouse-middle',
      title: '鼠标中键',
      desc: '按下滚轮中键，通常用于视角重置、标记地图或特殊技能',
      icon: <CircleDot className="w-5 h-5 text-purple-400" />,
      keyLabel: '中键',
    },
  ];

  // Handle click on function or system action card
  const handleSelectActionItem = (item: FunctionItem) => {
    setSelectedActionId(item.id);

    // If single mode, save and close immediately
    if (bindingMode === 'single') {
      const isFolder = item.keyType === 'wheel-folder' || item.keyType === 'list-folder';
      onSave({
        keyLabel: item.keyLabel,
        primaryKey: item.title,
        modifiers: [],
        keyType: item.keyType,
        isSystemAction: !isFolder,
        systemActionId: item.id,
        name: item.title,
        isFolderExpanded: false,
      });
      onClose();
    }
  };

  const handleSelectMouseItem = (item: (typeof mouseKeyItems)[0]) => {
    setSelectedActionId(item.id);
    if (bindingMode === 'single') {
      onSave({
        keyLabel: item.keyLabel,
        primaryKey: item.title,
        modifiers: [],
        keyType: 'system',
        isSystemAction: true,
        systemActionId: item.id,
        name: item.title,
      });
      onClose();
    }
  };

  // Keyboard clicks
  const handleKeyClick = (keyItem: { label: string; key: string; isMod?: boolean; modKey?: ModifierKey }) => {
    if (bindingMode === 'single') {
      const label = keyItem.key.toUpperCase();
      onSave({
        keyLabel: label,
        primaryKey: keyItem.key,
        modifiers: [],
        keyType: 'single',
        isSystemAction: false,
        systemActionId: undefined,
      });
      onClose();
      return;
    }

    // Combo mode
    const targetKey = keyItem.isMod ? (keyItem.modKey as string) : keyItem.key;
    setComboKeys((prev) => {
      if (prev.includes(targetKey)) {
        return prev.filter((k) => k !== targetKey);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), targetKey];
      }
      return [...prev, targetKey];
    });
  };

  const handleRemoveComboKey = (keyToRemove: string) => {
    setComboKeys((prev) => prev.filter((k) => k !== keyToRemove));
  };

  const handleSave = () => {
    if (activeTab === 'functions') {
      const found = functionItems.find((i) => i.id === selectedActionId);
      if (found) {
        const isFolder = found.keyType === 'wheel-folder' || found.keyType === 'list-folder';
        onSave({
          keyLabel: found.keyLabel,
          primaryKey: found.title,
          modifiers: [],
          keyType: found.keyType,
          isSystemAction: !isFolder,
          systemActionId: found.id,
          name: found.title,
          isFolderExpanded: false,
        });
      }
    } else if (activeTab === 'mouse') {
      const found = mouseKeyItems.find((i) => i.id === selectedActionId);
      if (found) {
        onSave({
          keyLabel: found.keyLabel,
          primaryKey: found.title,
          modifiers: [],
          isSystemAction: true,
          systemActionId: found.id,
          name: found.title,
        });
      }
    } else {
      if (bindingMode === 'single') {
        const finalKey = singleKey || 'W';
        onSave({
          keyLabel: finalKey.toUpperCase(),
          primaryKey: finalKey,
          modifiers: [],
          isSystemAction: false,
          systemActionId: undefined,
        });
      } else {
        const modSymbols: Record<string, string> = {
          cmd: '⌘',
          shift: '⇧',
          opt: '⌥',
          ctrl: '⌃',
          fn: 'fn',
        };

        const activeMods: ModifierKey[] = [];
        const nonMods: string[] = [];

        comboKeys.forEach((k) => {
          if (['cmd', 'shift', 'opt', 'ctrl', 'fn'].includes(k)) {
            activeMods.push(k as ModifierKey);
          } else {
            nonMods.push(k);
          }
        });

        const modPrefix = activeMods.map((m) => modSymbols[m]).join('');
        const primaryText = nonMods.map((k) => k.toUpperCase()).join('');
        const finalLabel = modPrefix ? (primaryText ? `${modPrefix}${primaryText}` : modPrefix) : primaryText || 'W';

        onSave({
          keyLabel: finalLabel,
          primaryKey: nonMods[0] || 'W',
          modifiers: activeMods,
          isSystemAction: false,
          systemActionId: undefined,
        });
      }
    }
    onClose();
  };

  /* Keyboard row definitions */
  const row1 = [
    { label: 'esc', key: 'esc', flex: 1.2 },
    { label: 'F1', key: 'F1', flex: 1 },
    { label: 'F2', key: 'F2', flex: 1 },
    { label: 'F3', key: 'F3', flex: 1 },
    { label: 'F4', key: 'F4', flex: 1 },
    { label: 'F5', key: 'F5', flex: 1 },
    { label: 'F6', key: 'F6', flex: 1 },
    { label: 'F7', key: 'F7', flex: 1 },
    { label: 'F8', key: 'F8', flex: 1 },
    { label: 'F9', key: 'F9', flex: 1 },
    { label: 'F10', key: 'F10', flex: 1 },
    { label: 'F11', key: 'F11', flex: 1 },
    { label: 'F12', key: 'F12', flex: 1 },
  ];

  const row2 = [
    { label: '~\n`', key: '`', flex: 1 },
    { label: '!\n1', key: '1', flex: 1 },
    { label: '@\n2', key: '2', flex: 1 },
    { label: '#\n3', key: '3', flex: 1 },
    { label: '$\n4', key: '4', flex: 1 },
    { label: '%\n5', key: '5', flex: 1 },
    { label: '^\n6', key: '6', flex: 1 },
    { label: '&\n7', key: '7', flex: 1 },
    { label: '*\n8', key: '8', flex: 1 },
    { label: '(\n9', key: '9', flex: 1 },
    { label: ')\n0', key: '0', flex: 1 },
    { label: '_\n-', key: '-', flex: 1 },
    { label: '+\n=', key: '=', flex: 1 },
    { label: 'delete', key: 'delete', flex: 1.5 },
  ];

  const row3 = [
    { label: 'tab', key: 'tab', flex: 1.5 },
    { label: 'Q', key: 'Q', flex: 1 },
    { label: 'W', key: 'W', flex: 1 },
    { label: 'E', key: 'E', flex: 1 },
    { label: 'R', key: 'R', flex: 1 },
    { label: 'T', key: 'T', flex: 1 },
    { label: 'Y', key: 'Y', flex: 1 },
    { label: 'U', key: 'U', flex: 1 },
    { label: 'I', key: 'I', flex: 1 },
    { label: 'O', key: 'O', flex: 1 },
    { label: 'P', key: 'P', flex: 1 },
    { label: '{\n[', key: '[', flex: 1 },
    { label: '}\n]', key: ']', flex: 1 },
    { label: '|\n\\', key: '\\', flex: 1 },
  ];

  const row4 = [
    { label: 'caps lock', key: 'caps lock', flex: 1.8 },
    { label: 'A', key: 'A', flex: 1 },
    { label: 'S', key: 'S', flex: 1 },
    { label: 'D', key: 'D', flex: 1 },
    { label: 'F', key: 'F', flex: 1 },
    { label: 'G', key: 'G', flex: 1 },
    { label: 'H', key: 'H', flex: 1 },
    { label: 'J', key: 'J', flex: 1 },
    { label: 'K', key: 'K', flex: 1 },
    { label: 'L', key: 'L', flex: 1 },
    { label: ':\n;', key: ';', flex: 1 },
    { label: '"\n\'', key: "'", flex: 1 },
    { label: 'return', key: 'return', flex: 1.8 },
  ];

  const row5 = [
    { label: 'shift', key: 'shift', isMod: true, modKey: 'shift', flex: 2.2 },
    { label: 'Z', key: 'Z', flex: 1 },
    { label: 'X', key: 'X', flex: 1 },
    { label: 'C', key: 'C', flex: 1 },
    { label: 'V', key: 'V', flex: 1 },
    { label: 'B', key: 'B', flex: 1 },
    { label: 'N', key: 'N', flex: 1 },
    { label: 'M', key: 'M', flex: 1 },
    { label: '<\n,', key: ',', flex: 1 },
    { label: '>\n.', key: '.', flex: 1 },
    { label: '?\n/', key: '/', flex: 1 },
    { label: '↑', key: 'ArrowUp', flex: 1 },
  ];

  const row6 = [
    { label: 'fn', key: 'fn', isMod: true, modKey: 'fn', flex: 1 },
    { label: 'control', key: 'ctrl', isMod: true, modKey: 'ctrl', flex: 1.2 },
    { label: 'option', key: 'opt', isMod: true, modKey: 'opt', flex: 1.2 },
    { label: 'command', key: 'cmd', isMod: true, modKey: 'cmd', flex: 1.4 },
    { label: 'space', key: 'space', flex: 4.8 },
    { label: '←', key: 'ArrowLeft', flex: 1 },
    { label: '↓', key: 'ArrowDown', flex: 1 },
    { label: '→', key: 'ArrowRight', flex: 1 },
  ];

  const formatSlotKey = (k: string) => {
    const symbolMap: Record<string, string> = {
      cmd: '⌘ cmd',
      shift: '⇧ shift',
      opt: '⌥ opt',
      ctrl: '⌃ ctrl',
      fn: 'fn',
    };
    return symbolMap[k] || k.toUpperCase();
  };

  const filteredFunctionItems =
    selectedCategory === 'all'
      ? functionItems
      : functionItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="absolute inset-0 z-50 bg-[#0F0F12] text-white flex flex-col justify-between p-2 sm:p-3 overflow-hidden select-none animate-in fade-in duration-200">
      {/* =================================================================== */}
      {/* 1. TOP PROMPT BAR: Back Arrow | 点击下方按键 添加对应按键 到主屏   */}
      {/* NOTE: No single/multi toggles here, purely concise navigation      */}
      {/* =================================================================== */}
      <div className="w-full flex items-center justify-between px-2 py-1 shrink-0 relative">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#1F1F24] hover:bg-[#2C2C33] flex items-center justify-center text-white/90 active:scale-95 transition-all cursor-pointer z-10"
          title="返回主界面"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Center prompt matching screenshot */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-tight text-white/90 whitespace-nowrap">
          <span>点击下方按键</span>
          <span className="text-[#0A84FF] font-semibold">添加对应按键</span>
          <span>到主屏</span>
        </div>

        {/* Right side: Complete button for combo mode or spacer */}
        {bindingMode === 'combo' ? (
          <button
            onClick={handleSave}
            className="bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-[12px] font-medium px-3.5 py-1 rounded-full shadow-sm shadow-blue-500/25 active:scale-95 transition-all cursor-pointer z-10"
          >
            完成
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. TAB NAVIGATION BAR: [主键盘] [鼠标按键与轮盘] [功能键]            */}
      {/* =================================================================== */}
      <div className="w-full flex items-center justify-between px-3 pt-2 pb-1 shrink-0 border-b border-white/10 bg-[#161619] rounded-t-xl">
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={() => setActiveTab('keyboard')}
            className={`text-[13px] sm:text-[14px] font-medium transition-all pb-1.5 relative cursor-pointer ${
              activeTab === 'keyboard' ? 'text-white font-semibold' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span>主键盘</span>
            {activeTab === 'keyboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A84FF] rounded-full shadow-sm shadow-blue-500/50" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('mouse')}
            className={`text-[13px] sm:text-[14px] font-medium transition-all pb-1.5 relative cursor-pointer ${
              activeTab === 'mouse' ? 'text-white font-semibold' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span>鼠标按键与轮盘</span>
            {activeTab === 'mouse' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A84FF] rounded-full shadow-sm shadow-blue-500/50" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('functions')}
            className={`text-[13px] sm:text-[14px] font-medium transition-all pb-1.5 relative cursor-pointer ${
              activeTab === 'functions' ? 'text-white font-semibold' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span>功能键</span>
            {activeTab === 'functions' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A84FF] rounded-full shadow-sm shadow-blue-500/50" />
            )}
          </button>
        </div>

        {/* Combo Mode Slots indicator if active in combo mode */}
        {bindingMode === 'combo' && activeTab === 'keyboard' && (
          <div className="flex items-center gap-1">
            {comboKeys.length === 0 ? (
              <span className="text-[11px] text-white/40 border border-dashed border-white/20 px-2 py-0.5 rounded">
                点选按键组合
              </span>
            ) : (
              comboKeys.map((k, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-white/30 text-[10px] font-bold">+</span>}
                  <div className="flex items-center gap-1 bg-[#0A84FF] text-white text-[11px] font-mono px-2 py-0.5 rounded border border-blue-400">
                    <span>{formatSlotKey(k)}</span>
                    <button
                      onClick={() => handleRemoveComboKey(k)}
                      className="hover:text-red-300 ml-0.5 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </React.Fragment>
              ))
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN CONTENT: KEYBOARD / MOUSE / POLISHED FUNCTION LIST CARDS    */}
      {/* =================================================================== */}
      <div className="flex-1 w-full min-h-0 flex flex-col pt-1 pb-1 overflow-hidden">
        {/* TAB 1: 主键盘 */}
        {activeTab === 'keyboard' && (
          <div className="w-full h-full flex flex-col justify-between gap-1 p-1 bg-[#141418] rounded-b-xl border-x border-b border-white/10">
            {[row1, row2, row3, row4, row5, row6].map((row, rIdx) => (
              <div key={rIdx} className="flex-1 flex gap-1 min-h-0">
                {row.map((k) => {
                  const keyIdent = (k as any).isMod ? ((k as any).modKey as string) : k.key;
                  const isSelected =
                    bindingMode === 'combo'
                      ? comboKeys.includes(keyIdent)
                      : singleKey.toLowerCase() === k.key.toLowerCase();

                  return (
                    <button
                      key={k.key}
                      style={{ flex: k.flex }}
                      onClick={() => handleKeyClick(k as any)}
                      className={`h-full min-h-0 flex items-center justify-center rounded-[6px] text-[10px] sm:text-[11px] md:text-xs font-mono leading-none border transition-all cursor-pointer whitespace-pre-line text-center select-none active:scale-95 ${
                        isSelected
                          ? 'bg-[#0A84FF] border-blue-400 text-white font-bold shadow-md shadow-blue-500/40 z-10'
                          : 'bg-[#222226] border-white/10 text-white/85 hover:bg-[#2d2d33] hover:text-white'
                      }`}
                    >
                      {k.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: 鼠标按键与轮盘 */}
        {activeTab === 'mouse' && (
          <div className="w-full h-full overflow-y-auto p-2 bg-[#141418] rounded-b-xl border-x border-b border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {mouseKeyItems.map((item) => {
                const isSelected = selectedActionId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMouseItem(item)}
                    className={`group relative bg-[#1A1A1F] hover:bg-[#23232B] active:bg-[#282833] border rounded-2xl p-4 flex flex-col items-center text-center transition-all cursor-pointer shadow-lg active:scale-98 ${
                      isSelected
                        ? 'border-[#0A84FF] bg-[#122338]'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-all shadow-inner">
                      {item.icon}
                    </div>

                    <span className="text-[14px] font-semibold text-white tracking-tight mt-3 mb-1 group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </span>

                    <span className="text-[11px] text-white/45 leading-relaxed font-normal line-clamp-2 px-1">
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: 功能键 (BEAUTIFULLY POLISHED WITH FOLDABLE FOLDERS & SYSTEM ACTIONS) */}
        {activeTab === 'functions' && (
          <div className="w-full h-full flex flex-col bg-[#141418] rounded-b-xl border-x border-b border-white/10 overflow-hidden">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10 bg-[#16161C] shrink-0">
              <span className="text-[11px] text-white/50 mr-1">分类筛选:</span>
              {[
                { id: 'all', label: '全部' },
                { id: 'folder', label: '收放型功能夹' },
                { id: 'macro', label: '宏与高级' },
                { id: 'system', label: '系统动作' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id as any)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#0A84FF] text-white font-semibold shadow-sm'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Grid of high-polish function cards */}
            <div className="flex-1 overflow-y-auto p-2.5 sm:p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredFunctionItems.map((item) => {
                  const isSelected = selectedActionId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectActionItem(item)}
                      className={`group relative bg-[#1B1B22] hover:bg-[#23232C] border rounded-2xl p-3.5 text-left transition-all cursor-pointer shadow-lg active:scale-98 flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#0A84FF] ring-2 ring-blue-500/40 bg-[#142335]'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Icon container */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all ${item.iconBg}`}
                      >
                        {item.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[13px] sm:text-[14px] font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
