import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Compass,
  Layers,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  X,
  Undo2,
  PackageOpen,
  ArrowDownToLine,
  Info,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MousePointerClick,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ShortcutKey,
  WheelFolderConfig,
  WheelSlot,
  ListFolderConfig,
  ListFolderSlot,
} from '../types';

interface Props {
  shortcut: ShortcutKey;
  allKeys: ShortcutKey[];
  onSave: (updatedFolder: Partial<ShortcutKey>, updatedAllKeys: ShortcutKey[]) => void;
  onClose: () => void;
  onStartCanvasPick?: () => void;
}

const MIN_SLOTS = 3;
const MAX_SLOTS = 8;

export const FolderTier3Editor: React.FC<Props> = ({
  shortcut,
  allKeys,
  onSave,
  onClose,
  onStartCanvasPick,
}) => {
  const isWheel = shortcut.keyType === 'wheel-folder';
  const isList = shortcut.keyType === 'list-folder';

  // Local copy of all keys so user can collect into folder or release to canvas
  const [managedKeys, setManagedKeys] = useState<ShortcutKey[]>(() => {
    return allKeys.map((k) => ({ ...k }));
  });

  // Local notification toast
  const [localToast, setLocalToast] = useState<{ message: string; type?: 'info' | 'warn' | 'success' } | null>(null);
  const showToast = (message: string, type: 'info' | 'warn' | 'success' = 'success') => {
    setLocalToast({ message, type });
    setTimeout(() => setLocalToast(null), 2500);
  };

  // Wheel State: strictly 3 to 8 slots
  const [wheelSlots, setWheelSlots] = useState<WheelSlot[]>(() => {
    if (shortcut.wheelConfig?.slots && shortcut.wheelConfig.slots.length >= MIN_SLOTS) {
      return shortcut.wheelConfig.slots.slice(0, MAX_SLOTS).map((s, idx) => ({ ...s, index: idx }));
    }
    return [
      { id: 'w1', index: 0, label: '1', key: '1', name: '插槽 1' },
      { id: 'w2', index: 1, label: '2', key: '2', name: '插槽 2' },
      { id: 'w3', index: 2, label: '3', key: '3', name: '插槽 3' },
      { id: 'w4', index: 3, label: '4', key: '4', name: '插槽 4' },
    ];
  });
  const [radius, setRadius] = useState<number>(shortcut.wheelConfig?.radius || 80);
  const [deadzone, setDeadzone] = useState<number>(shortcut.wheelConfig?.deadzone || 20);
  const [triggerMode, setTriggerMode] = useState<'slide' | 'release'>(
    shortcut.wheelConfig?.triggerMode || 'slide'
  );

  // List State: strictly 3 to 8 slots
  const [listSlots, setListSlots] = useState<ListFolderSlot[]>(() => {
    if (shortcut.listFolderConfig?.slots && shortcut.listFolderConfig.slots.length >= MIN_SLOTS) {
      return shortcut.listFolderConfig.slots.slice(0, MAX_SLOTS).map((s, idx) => ({ ...s, index: idx }));
    }
    return [
      { id: 'l1', index: 0, label: '槽1', key: '1', name: '插槽 1' },
      { id: 'l2', index: 1, label: '槽2', key: '2', name: '插槽 2' },
      { id: 'l3', index: 2, label: '槽3', key: '3', name: '插槽 3' },
      { id: 'l4', index: 3, label: '槽4', key: '4', name: '插槽 4' },
    ];
  });
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>(
    shortcut.listFolderConfig?.direction || 'up'
  );

  // Expanded preview toggle
  const [isFolderExpanded, setIsFolderExpanded] = useState<boolean>(
    shortcut.isFolderExpanded ?? false
  );

  // Active selected slot index
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);

  // Right Side Panel Tab: 'slots' (插槽卡片与替换管理) | 'keys' (画布按键候选库) | 'settings' (参数设置)
  const [activeTab, setActiveTab] = useState<'slots' | 'keys' | 'settings'>('slots');

  // Key Pool Sub-filter: 'all' | 'available' | 'collected' | 'keypad'
  const [poolFilter, setPoolFilter] = useState<'all' | 'available' | 'collected' | 'keypad'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Replacing Key Modal / Overlay state: which slot index is currently being replaced
  const [replacingSlotIndex, setReplacingSlotIndex] = useState<number | null>(null);

  // Currently active slots array
  const currentSlots = isWheel ? wheelSlots : listSlots;
  const activeSlot = currentSlots[activeSlotIndex] || currentSlots[0];

  // Derive candidate keys (exclude folder itself and system protected menu)
  const allCandidateKeys = managedKeys.filter(
    (k) => k.id !== shortcut.id && k.id !== 'key-system-menu'
  );

  // Derive keys that are loose on canvas (not in any folder)
  const availableCanvasKeys = allCandidateKeys.filter((k) => !k.folderId);

  // Derive keys that are currently collected into THIS folder
  const keysInThisFolder = allCandidateKeys.filter((k) => k.folderId === shortcut.id);

  /* ========================================================================= */
  /* WHEEL & LIST SLOTS SIZING HANDLERS [MIN: 3, MAX: 8]                       */
  /* ========================================================================= */

  // 1. Add slot (max 8)
  const handleAddSlot = () => {
    if (currentSlots.length >= MAX_SLOTS) {
      showToast(`最多支持 ${MAX_SLOTS} 个按键插槽，已达上限！`, 'warn');
      return;
    }
    const newIndex = currentSlots.length;
    if (isWheel) {
      const newSlot: WheelSlot = {
        id: `w_${Date.now()}_${newIndex}`,
        index: newIndex,
        label: String(newIndex + 1),
        key: String(newIndex + 1),
        name: `插槽 ${newIndex + 1}`,
      };
      setWheelSlots((prev) => [...prev, newSlot]);
      setActiveSlotIndex(newIndex);
      // Automatically prompt to choose replacement key for newly added slot
      setReplacingSlotIndex(newIndex);
      showToast(`已新增插槽 #${newIndex + 1}（当前共 ${wheelSlots.length + 1} 槽，最少3个，最多8个），请选择键位`);
    } else {
      const newSlot: ListFolderSlot = {
        id: `l_${Date.now()}_${newIndex}`,
        index: newIndex,
        label: `槽${newIndex + 1}`,
        key: String(newIndex + 1),
        name: `插槽 ${newIndex + 1}`,
      };
      setListSlots((prev) => [...prev, newSlot]);
      setActiveSlotIndex(newIndex);
      setReplacingSlotIndex(newIndex);
      showToast(`已新增插槽 #${newIndex + 1}，请选择键位`);
    }
  };

  // 2. Remove slot completely (shrinks slot count, min 3)
  const handleDeleteSlot = (slotIndex: number) => {
    if (currentSlots.length <= MIN_SLOTS) {
      showToast(`轮盘至少需要保留 ${MIN_SLOTS} 个按键才像样哦！无法继续删除`, 'warn');
      return;
    }

    const targetSlot = currentSlots[slotIndex];
    if (targetSlot?.sourceKeyId) {
      // Release key back to canvas
      setManagedKeys((prev) =>
        prev.map((k) =>
          k.id === targetSlot.sourceKeyId
            ? { ...k, folderId: undefined, folderSlotIndex: undefined }
            : k
        )
      );
    }

    if (isWheel) {
      setWheelSlots((prev) => {
        const filtered = prev.filter((_, idx) => idx !== slotIndex);
        return filtered.map((s, idx) => ({ ...s, index: idx }));
      });
    } else {
      setListSlots((prev) => {
        const filtered = prev.filter((_, idx) => idx !== slotIndex);
        return filtered.map((s, idx) => ({ ...s, index: idx }));
      });
    }

    setActiveSlotIndex((prev) => Math.max(0, Math.min(prev, currentSlots.length - 2)));
    if (replacingSlotIndex === slotIndex) setReplacingSlotIndex(null);
    showToast(`已删除插槽 #${slotIndex + 1}，当前保留 ${currentSlots.length - 1} 键`);
  };

  // 3. Clear key from slot (releases back to canvas, keeps slot geometry)
  const handleClearSlotKey = (slotIndex: number) => {
    const slot = currentSlots[slotIndex];
    if (!slot || !slot.sourceKeyId) return;

    const sourceId = slot.sourceKeyId;
    setManagedKeys((prev) =>
      prev.map((k) =>
        k.id === sourceId ? { ...k, folderId: undefined, folderSlotIndex: undefined } : k
      )
    );

    if (isWheel) {
      setWheelSlots((prev) =>
        prev.map((s, idx) =>
          idx === slotIndex
            ? {
                ...s,
                sourceKeyId: undefined,
                sourceKey: undefined,
                label: String(slotIndex + 1),
                key: String(slotIndex + 1),
                name: `插槽 ${slotIndex + 1}`,
              }
            : s
        )
      );
    } else {
      setListSlots((prev) =>
        prev.map((s, idx) =>
          idx === slotIndex
            ? {
                ...s,
                sourceKeyId: undefined,
                sourceKey: undefined,
                label: `槽${slotIndex + 1}`,
                key: String(slotIndex + 1),
                name: `插槽 ${slotIndex + 1}`,
              }
            : s
        )
      );
    }

    showToast(`按键已释放回主画布，插槽 #${slotIndex + 1} 已清空`);
  };

  // 4. Replace key in a specific slot with a candidate key
  const handleReplaceSlotWithKey = (slotIndex: number, candidateKey: ShortcutKey) => {
    const oldSlot = currentSlots[slotIndex];
    const oldSourceId = oldSlot?.sourceKeyId;

    // Check if candidateKey was already in another slot in this folder
    const prevBoundSlotIdx = currentSlots.findIndex((s) => s.sourceKeyId === candidateKey.id);

    // Update managed keys:
    // 1. If old slot had a key and it is different from candidateKey, release old key back to canvas
    // 2. Set candidateKey's folderId to shortcut.id and slot index to slotIndex
    setManagedKeys((prev) =>
      prev.map((k) => {
        if (oldSourceId && k.id === oldSourceId && k.id !== candidateKey.id) {
          return { ...k, folderId: undefined, folderSlotIndex: undefined };
        }
        if (k.id === candidateKey.id) {
          return { ...k, folderId: shortcut.id, folderSlotIndex: slotIndex };
        }
        return k;
      })
    );

    // Update slots
    if (isWheel) {
      setWheelSlots((prev) =>
        prev.map((s, idx) => {
          if (idx === slotIndex) {
            return {
              ...s,
              sourceKeyId: candidateKey.id,
              label: candidateKey.keyLabel,
              key: candidateKey.primaryKey,
              name: candidateKey.name || `按键 ${candidateKey.keyLabel}`,
              sourceKey: candidateKey,
            };
          }
          // If candidate was in another slot, clear that slot or swap
          if (prevBoundSlotIdx !== -1 && idx === prevBoundSlotIdx && idx !== slotIndex) {
            return {
              ...s,
              sourceKeyId: undefined,
              sourceKey: undefined,
              label: String(idx + 1),
              key: String(idx + 1),
              name: `插槽 ${idx + 1}`,
            };
          }
          return s;
        })
      );
    } else {
      setListSlots((prev) =>
        prev.map((s, idx) => {
          if (idx === slotIndex) {
            return {
              ...s,
              sourceKeyId: candidateKey.id,
              label: candidateKey.keyLabel,
              key: candidateKey.primaryKey,
              name: candidateKey.name || `按键 ${candidateKey.keyLabel}`,
              sourceKey: candidateKey,
            };
          }
          if (prevBoundSlotIdx !== -1 && idx === prevBoundSlotIdx && idx !== slotIndex) {
            return {
              ...s,
              sourceKeyId: undefined,
              sourceKey: undefined,
              label: `槽${idx + 1}`,
              key: String(idx + 1),
              name: `插槽 ${idx + 1}`,
            };
          }
          return s;
        })
      );
    }

    setReplacingSlotIndex(null);
    setActiveSlotIndex(slotIndex);
    showToast(
      `插槽 #${slotIndex + 1} 已成功替换为「${candidateKey.name || candidateKey.keyLabel}」！${
        oldSourceId && oldSourceId !== candidateKey.id ? '原按键已放回画布' : ''
      }`
    );
  };

  // Toggle key between collected & canvas (for candidate deck quick clicks)
  const handleToggleCandidateKey = (keyItem: ShortcutKey) => {
    const slotIdx = currentSlots.findIndex((s) => s.sourceKeyId === keyItem.id);
    const isInThisFolder = slotIdx !== -1 || managedKeys.some((k) => k.id === keyItem.id && k.folderId === shortcut.id);

    if (isInThisFolder) {
      // Release & delete slot if > 3
      if (currentSlots.length > MIN_SLOTS && slotIdx !== -1) {
        handleDeleteSlot(slotIdx);
      } else if (slotIdx !== -1) {
        handleClearSlotKey(slotIdx);
      }
      return;
    }

    // Not in folder: pick empty slot or add slot
    let targetIdx = -1;
    if (!currentSlots[activeSlotIndex]?.sourceKeyId) {
      targetIdx = activeSlotIndex;
    } else {
      const firstEmpty = currentSlots.findIndex((s) => !s.sourceKeyId);
      if (firstEmpty !== -1) targetIdx = firstEmpty;
    }

    if (targetIdx !== -1) {
      handleReplaceSlotWithKey(targetIdx, keyItem);
    } else {
      if (currentSlots.length >= MAX_SLOTS) {
        showToast(`轮盘最多支持 ${MAX_SLOTS} 个按键，当前已满！请先替换现有按键`, 'warn');
        return;
      }
      const newIndex = currentSlots.length;
      if (isWheel) {
        const newSlot: WheelSlot = {
          id: `w_${Date.now()}_${newIndex}`,
          index: newIndex,
          label: keyItem.keyLabel,
          key: keyItem.primaryKey,
          name: keyItem.name,
          sourceKeyId: keyItem.id,
          sourceKey: keyItem,
        };
        setManagedKeys((prev) =>
          prev.map((k) =>
            k.id === keyItem.id ? { ...k, folderId: shortcut.id, folderSlotIndex: newIndex } : k
          )
        );
        setWheelSlots((prev) => [...prev, newSlot]);
        setActiveSlotIndex(newIndex);
        showToast(`已新增插槽 #${newIndex + 1} 并收纳「${keyItem.name || keyItem.keyLabel}」（共 ${wheelSlots.length + 1} 键）`);
      } else {
        const newSlot: ListFolderSlot = {
          id: `l_${Date.now()}_${newIndex}`,
          index: newIndex,
          label: keyItem.keyLabel,
          key: keyItem.primaryKey,
          name: keyItem.name,
          sourceKeyId: keyItem.id,
          sourceKey: keyItem,
        };
        setManagedKeys((prev) =>
          prev.map((k) =>
            k.id === keyItem.id ? { ...k, folderId: shortcut.id, folderSlotIndex: newIndex } : k
          )
        );
        setListSlots((prev) => [...prev, newSlot]);
        setActiveSlotIndex(newIndex);
        showToast(`已新增插槽 #${newIndex + 1} 并收纳「${keyItem.name || keyItem.keyLabel}」`);
      }
    }
  };

  // Release ALL keys from this folder back onto the main canvas
  const handleReleaseAll = () => {
    const count = keysInThisFolder.length;
    setManagedKeys((prev) =>
      prev.map((k) =>
        k.folderId === shortcut.id
          ? { ...k, folderId: undefined, folderSlotIndex: undefined }
          : k
      )
    );

    if (isWheel) {
      setWheelSlots([
        { id: 'w1', index: 0, label: '1', key: '1', name: '插槽 1' },
        { id: 'w2', index: 1, label: '2', key: '2', name: '插槽 2' },
        { id: 'w3', index: 2, label: '3', key: '3', name: '插槽 3' },
        { id: 'w4', index: 3, label: '4', key: '4', name: '插槽 4' },
      ]);
      setActiveSlotIndex(0);
    } else {
      setListSlots([
        { id: 'l1', index: 0, label: '槽1', key: '1', name: '插槽 1' },
        { id: 'l2', index: 1, label: '槽2', key: '2', name: '插槽 2' },
        { id: 'l3', index: 2, label: '槽3', key: '3', name: '插槽 3' },
        { id: 'l4', index: 3, label: '槽4', key: '4', name: '插槽 4' },
      ]);
      setActiveSlotIndex(0);
    }

    showToast(`已全部释放！${count} 个按键已全部放回主画布，轮盘恢复4槽`);
  };

  // Save all changes
  const handleSaveAll = () => {
    if (isWheel) {
      const wheelConfig: WheelFolderConfig = {
        slots: wheelSlots,
        radius,
        deadzone,
        triggerMode,
        isExpanded: isFolderExpanded,
      };
      onSave(
        {
          wheelConfig,
          isFolderExpanded,
        },
        managedKeys
      );
    } else {
      const listFolderConfig: ListFolderConfig = {
        slots: listSlots,
        direction,
        isExpanded: isFolderExpanded,
      };
      onSave(
        {
          listFolderConfig,
          isFolderExpanded,
        },
        managedKeys
      );
    }
    onClose();
  };

  // Raw keyboard keys fallback
  const handleAssignRawKey = (keyChar: string) => {
    const upper = keyChar.toUpperCase();
    if (isWheel) {
      setWheelSlots((prev) =>
        prev.map((s, idx) =>
          idx === activeSlotIndex
            ? { ...s, key: upper, label: upper, name: s.name || `按键 ${upper}` }
            : s
        )
      );
    } else {
      setListSlots((prev) =>
        prev.map((s, idx) =>
          idx === activeSlotIndex
            ? { ...s, key: upper, label: upper, name: s.name || `按键 ${upper}` }
            : s
        )
      );
    }
    showToast(`插槽 #${activeSlotIndex + 1} 已录入按键「${upper}」`);
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Space'],
  ];

  const totalFilledSlots = currentSlots.filter((s) => !!s.sourceKeyId).length;

  // Filtered candidate keys based on search and tab filter
  const filteredCandidates = useMemo(() => {
    let list =
      poolFilter === 'all'
        ? allCandidateKeys
        : poolFilter === 'available'
        ? availableCanvasKeys
        : keysInThisFolder;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (k) =>
          k.keyLabel.toLowerCase().includes(q) ||
          k.name.toLowerCase().includes(q) ||
          k.primaryKey.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allCandidateKeys, availableCanvasKeys, keysInThisFolder, poolFilter, searchQuery]);

  return (
    <div className="absolute inset-0 z-50 bg-[#0C0C12] text-white flex flex-col justify-between p-3 sm:p-4 overflow-hidden select-none animate-in fade-in duration-200">
      {/* Toast notification */}
      {localToast && (
        <div
          className={`absolute top-16 left-1/2 -translate-x-1/2 z-60 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-xl animate-in fade-in duration-150 border ${
            localToast.type === 'warn'
              ? 'bg-[#2A1D12] border-amber-500/50 text-amber-200'
              : 'bg-[#15232E] border-blue-500/50 text-blue-200'
          }`}
        >
          {localToast.type === 'warn' ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-medium">{localToast.message}</span>
        </div>
      )}

      {/* 1. Header Bar */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 shrink-0 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1C24] hover:bg-[#2A2A36] flex items-center justify-center text-white/90 active:scale-95 transition-all cursor-pointer shrink-0"
            title="返回主界面"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white truncate">
                {isWheel ? '轮盘夹 · 三级配置界面' : '列表抽屉夹 · 三级配置界面'}
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-medium shrink-0">
                {currentSlots.length} 槽位 · 已收纳 {totalFilledSlots} 键 (最少3个，最多8个)
              </span>
            </div>
            <p className="text-[11px] text-white/40 truncate hidden sm:block">
              可增加/删除插槽、点击替换按键，或返回画布点选；收纳后按键将在主画布隐藏
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick return to canvas to pick buttons directly */}
          {onStartCanvasPick && (
            <button
              onClick={() => {
                handleSaveAll();
                onStartCanvasPick();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-600/30 hover:bg-purple-600/40 border border-purple-400 text-purple-200 active:scale-95 transition-all cursor-pointer shadow-sm shadow-purple-500/20"
              title="返回二级画布界面，直接点击画布上的按键进行收纳"
            >
              <MousePointerClick className="w-3.5 h-3.5 text-purple-300" />
              <span>👆 返回画布点选</span>
            </button>
          )}

          {totalFilledSlots > 0 && (
            <button
              onClick={handleReleaseAll}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 active:scale-95 transition-all cursor-pointer shadow-sm"
              title="将夹内所有按键一次性全部释放回主画布"
            >
              <PackageOpen className="w-3.5 h-3.5" />
              <span>全部释放</span>
            </button>
          )}

          {/* Quick fold/expand toggle */}
          <button
            onClick={() => setIsFolderExpanded(!isFolderExpanded)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              isFolderExpanded
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-sm'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
            }`}
            title="切换主画布上的收起/展开预览"
          >
            {isFolderExpanded ? (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>主画布: 展开中</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-white/50" />
                <span>主画布: 已收起</span>
              </>
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveAll}
            className="bg-[#0A84FF] hover:bg-[#0071E3] active:bg-[#0058B3] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>保存并应用</span>
          </button>
        </div>
      </div>

      {/* 2. Middle Body: Left Radial Visual Stage + Right Tabs Panel */}
      <div className="flex-1 w-full min-h-0 flex flex-col md:flex-row items-stretch gap-3 py-2.5 overflow-hidden relative">
        {/* LEFT STAGE: Visual Interactive Wheel / Drawer View */}
        <div className="flex-1 w-full h-full bg-[#121218] border border-white/10 rounded-2xl flex flex-col items-center justify-between relative p-3 overflow-hidden">
          {/* Top Status & Quick Add Slot Button */}
          <div className="w-full flex items-center justify-between text-xs text-white/60 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-white/80">
                {isWheel
                  ? `轮盘视效 (${wheelSlots.length} 槽位 · 最少3个，最多8个)`
                  : `抽屉列表 (${listSlots.length} 槽位)`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentSlots.length < MAX_SLOTS && (
                <button
                  onClick={handleAddSlot}
                  className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] px-2.5 py-1 rounded-full transition-all cursor-pointer active:scale-95 font-semibold"
                  title="为轮盘增加一个插槽（最多8个）"
                >
                  <Plus className="w-3 h-3 text-blue-400" />
                  <span>➕ 增加槽位 ({currentSlots.length}/8)</span>
                </button>
              )}
              {currentSlots.length >= MAX_SLOTS && (
                <span className="text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  已达 8 槽上限
                </span>
              )}
            </div>
          </div>

          {/* Center Interactive Wheel Geometry (3 to 8 radial slots) */}
          {isWheel && (
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-white/10 bg-[#161622] flex items-center justify-center shadow-2xl my-auto shrink-0">
              {/* Outer guide ring */}
              <div className="absolute inset-2.5 rounded-full border border-dashed border-blue-400/25 pointer-events-none" />

              {/* Deadzone Center Circle */}
              <div
                style={{ width: `${deadzone * 2.5}px`, height: `${deadzone * 2.5}px` }}
                className="rounded-full bg-blue-500/10 border border-blue-400/40 flex flex-col items-center justify-center text-[10px] text-blue-300 font-medium z-10 pointer-events-none shadow-inner text-center px-1"
              >
                <span>中心死区</span>
                <span className="text-[9px] text-blue-300/70 font-mono">{deadzone}px</span>
                <span className="text-[8px] text-white/40 mt-0.5">{wheelSlots.length}方向</span>
              </div>

              {/* Radial Slots */}
              {wheelSlots.map((s, idx) => {
                const angle = (idx * 360) / wheelSlots.length - 90;
                const rad = (angle * Math.PI) / 180;
                const dist = radius * 1.15;
                const x = Math.cos(rad) * dist;
                const y = Math.sin(rad) * dist;
                const isSelected = activeSlotIndex === idx;
                const isFilled = !!s.sourceKeyId;

                return (
                  <div
                    key={s.id}
                    style={{
                      position: 'absolute',
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    className="relative flex items-center justify-center z-20"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSlotIndex(idx)}
                      className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all shadow-xl cursor-pointer ${
                        isSelected
                          ? 'bg-[#0A84FF] text-white ring-4 ring-blue-400/60 scale-110 z-30 shadow-blue-500/50'
                          : isFilled
                          ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-2 border-emerald-400/70'
                          : 'bg-[#22222E] hover:bg-[#2C2C3A] text-white/80 border border-dashed border-white/30'
                      }`}
                      title={`点击选中插槽 #${idx + 1}`}
                    >
                      <span className="font-mono text-sm leading-tight">{s.label}</span>
                      <span className="text-[8px] opacity-80 truncate max-w-[38px] leading-none">
                        {isFilled ? s.name || '已绑定' : '空槽'}
                      </span>
                    </button>

                    {/* Quick remove button if > 3 slots */}
                    {wheelSlots.length > MIN_SLOTS && isSelected && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlot(idx);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-lg flex items-center justify-center cursor-pointer z-40 transition-transform active:scale-90"
                        title="删除此插槽"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive List / Drawer Layout */}
          {isList && (
            <div className="flex flex-col items-center gap-3 w-full max-w-sm px-2 my-auto">
              <div className="w-full p-3.5 bg-[#171720]/95 border border-purple-500/30 rounded-2xl shadow-2xl transition-all">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
                    <Layers className="w-4 h-4" />
                    <span>抽屉插槽 ({listSlots.length} 槽位)</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-medium">
                    最少3个 · 最多8个
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {listSlots.map((slot, idx) => {
                    const isSelected = activeSlotIndex === idx;
                    const isFilled = !!slot.sourceKeyId;
                    return (
                      <div key={slot.id} className="relative flex items-center">
                        <button
                          type="button"
                          onClick={() => setActiveSlotIndex(idx)}
                          className={`w-full h-12 px-2.5 rounded-xl flex items-center justify-between font-mono font-bold text-xs transition-all shadow-md cursor-pointer ${
                            isSelected
                              ? 'bg-[#0A84FF] text-white ring-2 ring-blue-400 scale-[1.02] z-20 shadow-blue-500/40'
                              : isFilled
                              ? 'bg-purple-600/90 text-white border border-purple-400/60'
                              : 'bg-[#22222E] hover:bg-[#2D2D3A] text-white/80 border border-dashed border-white/30'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-md bg-black/40 border border-white/20 flex items-center justify-center text-xs font-black shrink-0">
                            {slot.label}
                          </span>
                          <span className="text-[11px] font-normal truncate max-w-[70px] text-right">
                            {isFilled ? slot.name || '已绑定' : '空槽'}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Active Slot Quick-Action Bar at bottom of Left Stage */}
          <div className="w-full flex items-center justify-between bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs z-20 shrink-0 mt-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-white/60 shrink-0">当前槽位:</span>
              <span className="font-bold text-blue-400 font-mono shrink-0">#{activeSlotIndex + 1}</span>
              <span className="text-white/90 font-medium truncate">
                「{activeSlot?.name || activeSlot?.label}」
              </span>
              {activeSlot?.sourceKeyId ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                  已绑定
                </span>
              ) : (
                <span className="bg-white/10 text-white/50 text-[10px] px-2 py-0.5 rounded-full shrink-0">
                  空闲中
                </span>
              )}
            </div>

            {/* Direct Replace & Remove buttons on active slot */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setReplacingSlotIndex(activeSlotIndex)}
                className="flex items-center gap-1 bg-[#0A84FF]/25 hover:bg-[#0A84FF]/40 text-blue-200 border border-blue-400/40 text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer font-semibold active:scale-95 shadow-sm"
                title="选择按键替换当前插槽"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-300" />
                <span>{activeSlot?.sourceKeyId ? '替换按键' : '选择按键'}</span>
              </button>

              {activeSlot?.sourceKeyId && (
                <button
                  type="button"
                  onClick={() => handleClearSlotKey(activeSlotIndex)}
                  className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium active:scale-95"
                  title="将此槽位的按键释放回主画布"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>移出放回画布</span>
                </button>
              )}

              {currentSlots.length > MIN_SLOTS && (
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(activeSlotIndex)}
                  className="flex items-center gap-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs px-2 py-1 rounded-lg transition-all cursor-pointer font-medium active:scale-95"
                  title="删除当前插槽"
                >
                  <Trash2 className="w-3 h-3 text-rose-400" />
                  <span>删此槽</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: 3 Tabs (Slots Management | Canvas Key Pool | Settings) */}
        <div className="w-full md:w-[440px] h-full bg-[#14141C] border border-white/10 rounded-2xl p-3 flex flex-col justify-between shrink-0 shadow-xl overflow-hidden relative">
          {/* Panel Top Navigation Tabs */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-1 bg-[#22222E] p-0.5 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('slots')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                  activeTab === 'slots'
                    ? 'bg-[#0A84FF] text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>插槽卡片列表 ({currentSlots.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('keys')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                  activeTab === 'keys'
                    ? 'bg-[#0A84FF] text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>画布按键库 ({allCandidateKeys.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-semibold ${
                  activeTab === 'settings'
                    ? 'bg-[#0A84FF] text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
                title="轮盘参数设置"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>参数</span>
              </button>
            </div>

            {/* Quick Add Slot button in Right Header */}
            {currentSlots.length < MAX_SLOTS && (
              <button
                type="button"
                onClick={handleAddSlot}
                className="flex items-center gap-1 bg-[#0A84FF]/20 hover:bg-[#0A84FF]/35 text-blue-300 text-xs px-2.5 py-1.5 rounded-lg border border-blue-400/40 transition-all cursor-pointer font-semibold active:scale-95 shadow-sm"
                title="新增插槽"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>加槽位</span>
              </button>
            )}
          </div>

          {/* TAB 1: SLOTS CARDS LIST (The Core User Request: Direct Replace, Remove & Add Slot Cards) */}
          {activeTab === 'slots' && (
            <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1 min-h-0 scrollbar-thin">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1.5 text-[11px] text-blue-200/90 flex items-center justify-between">
                <span>点击每个插槽的「替换」或「移除」，快速更新轮盘按键</span>
                <span className="font-mono text-blue-400 font-bold">{currentSlots.length}/8 槽</span>
              </div>

              <div className="space-y-2">
                {currentSlots.map((slot, idx) => {
                  const isSelected = activeSlotIndex === idx;
                  const isFilled = !!slot.sourceKeyId;
                  const boundKey = managedKeys.find((k) => k.id === slot.sourceKeyId);

                  return (
                    <div
                      key={slot.id || idx}
                      onClick={() => setActiveSlotIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isSelected
                          ? 'bg-[#1C2333] border-blue-400 shadow-md ring-1 ring-blue-400/50'
                          : isFilled
                          ? 'bg-[#181822] border-emerald-500/30 hover:border-emerald-500/60'
                          : 'bg-[#181822] border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Left: Slot Identity & Key Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm font-mono shrink-0 shadow-inner ${
                            isFilled
                              ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border border-emerald-400'
                              : 'bg-white/5 border border-white/15 text-white/40'
                          }`}
                        >
                          {slot.label || String(idx + 1)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-white/50 font-mono">#{idx + 1}槽位</span>
                            <span className="text-xs font-bold text-white truncate max-w-[120px]">
                              {slot.name || slot.label}
                            </span>
                          </div>

                          <div className="text-[10px] text-white/40 truncate mt-0.5">
                            {isFilled ? (
                              <span className="text-emerald-300 font-medium">
                                已收纳 · 并在主画布隐藏
                              </span>
                            ) : (
                              <span className="text-white/40">空闲插槽 · 待绑定按键</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions: [替换按键] & [移除按键] & [删槽] */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Replace Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReplacingSlotIndex(idx);
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 shadow-sm"
                          title="选择新按键替换此插槽"
                        >
                          <RefreshCw className="w-3 h-3 text-blue-400" />
                          <span>{isFilled ? '替换' : '绑定'}</span>
                        </button>

                        {/* Remove / Release Button */}
                        {isFilled && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearSlotKey(idx);
                            }}
                            className="flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 px-2 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
                            title="释放此按键回主画布"
                          >
                            <Undo2 className="w-3 h-3" />
                            <span>移除</span>
                          </button>
                        )}

                        {/* Delete Slot (if slots > 3) */}
                        {currentSlots.length > MIN_SLOTS && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlot(idx);
                            }}
                            className="p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                            title="删除此插槽"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Add Slot Banner */}
              {currentSlots.length < MAX_SLOTS ? (
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/10 text-blue-300 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer active:scale-98"
                >
                  <Plus className="w-4 h-4 text-blue-400" />
                  <span>➕ 增加按键插槽 (当前 {currentSlots.length}/8 槽)</span>
                </button>
              ) : (
                <div className="text-center py-2 text-[11px] text-white/40 bg-white/5 rounded-xl border border-white/10">
                  已达到最多 8 个插槽上限，无法继续新增
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CANVAS KEY POOL (Browse and toggle collection) */}
          {activeTab === 'keys' && (
            <div className="flex-1 flex flex-col min-h-0 pt-1">
              {/* Search & Sub-filters */}
              <div className="space-y-2 pb-2 border-b border-white/10 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索按键名称、字母..."
                    className="w-full bg-[#1D1D26] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  {[
                    { id: 'all', label: `全部 (${allCandidateKeys.length})` },
                    { id: 'available', label: `待收纳 (${availableCanvasKeys.length})` },
                    { id: 'collected', label: `已收纳 (${keysInThisFolder.length})` },
                    { id: 'keypad', label: '键盘' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPoolFilter(tab.id as any)}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer font-medium ${
                        poolFilter === tab.id
                          ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                          : 'text-white/60 hover:text-white bg-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keys Cards List */}
              {poolFilter !== 'keypad' && (
                <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1 min-h-0 scrollbar-thin">
                  {filteredCandidates.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center gap-2 border border-dashed border-white/15 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-white/80">没有匹配的按键</p>
                    </div>
                  ) : (
                    filteredCandidates.map((keyItem) => {
                      const isInFolder = currentSlots.some((s) => s.sourceKeyId === keyItem.id);
                      const boundSlotIndex = currentSlots.findIndex((s) => s.sourceKeyId === keyItem.id);

                      return (
                        <div
                          key={keyItem.id}
                          onClick={() => handleToggleCandidateKey(keyItem)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm select-none ${
                            isInFolder
                              ? 'bg-[#15231E] border-emerald-500/40 hover:border-rose-500/60'
                              : 'bg-[#1C1C26] hover:bg-[#252535] border-white/10 hover:border-blue-400/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 flex items-center justify-center font-bold text-sm font-mono text-white transition-colors shadow-inner shrink-0 ${
                                isInFolder
                                  ? 'bg-emerald-600 border border-emerald-400'
                                  : 'bg-[#2A2A38] border border-white/20'
                              } ${keyItem.shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
                            >
                              {keyItem.keyLabel}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white truncate max-w-[130px]">
                                  {keyItem.name || keyItem.keyLabel}
                                </span>
                                {isInFolder && boundSlotIndex !== -1 && (
                                  <span className="text-[9px] bg-blue-500/25 text-blue-300 border border-blue-400/40 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                                    #{boundSlotIndex + 1}槽
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-white/40 mt-0.5">
                                {isInFolder ? '已收纳 (主画布隐藏)' : '画布独立按键'}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isInFolder ? (
                              <button
                                type="button"
                                className="text-[11px] font-semibold text-emerald-300 hover:text-rose-200 bg-emerald-500/15 hover:bg-rose-500/25 border border-emerald-500/30 hover:border-rose-500/50 px-2.5 py-1 rounded-lg transition-all"
                              >
                                移出轮盘
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="text-[11px] font-semibold text-blue-300 bg-blue-500/20 hover:bg-[#0A84FF] hover:text-white border border-blue-500/40 px-2.5 py-1 rounded-lg transition-all"
                              >
                                + 收纳
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Raw Keyboard fallback */}
              {poolFilter === 'keypad' && (
                <div className="flex-1 overflow-y-auto py-2 space-y-2.5 pr-1 min-h-0 text-xs">
                  <div className="text-[11px] text-white/50 px-1">
                    点击按键为插槽 #{activeSlotIndex + 1} 录入字符:
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    {keyboardRows.map((row, rIdx) => (
                      <div key={rIdx} className="flex items-center justify-center gap-1">
                        {row.map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => handleAssignRawKey(k)}
                            className={`h-8 rounded-lg text-xs font-mono font-semibold bg-[#262630] hover:bg-[#343442] hover:text-blue-300 border border-white/10 active:scale-95 transition-all cursor-pointer ${
                              k === 'Space' ? 'w-24' : 'w-7 sm:w-8'
                            }`}
                          >
                            {k}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS (Radius, Deadzone, Direction) */}
          {activeTab === 'settings' && (
            <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 min-h-0 text-xs">
              {isWheel ? (
                <>
                  <div className="bg-[#1C1C26] p-3 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">轮盘展开半径</span>
                      <span className="font-mono text-blue-400 font-bold">{radius}px</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="110"
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0A84FF]"
                    />
                    <div className="flex justify-between text-[10px] text-white/40">
                      <span>紧凑 50px</span>
                      <span>默认 80px</span>
                      <span>扩散 110px</span>
                    </div>
                  </div>

                  <div className="bg-[#1C1C26] p-3 rounded-xl border border-white/10 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">中心死区半径</span>
                      <span className="font-mono text-blue-400 font-bold">{deadzone}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="35"
                      value={deadzone}
                      onChange={(e) => setDeadzone(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#0A84FF]"
                    />
                    <div className="flex justify-between text-[10px] text-white/40">
                      <span>灵敏 10px</span>
                      <span>适中 20px</span>
                      <span>防误触 35px</span>
                    </div>
                  </div>

                  <div className="bg-[#1C1C26] p-3 rounded-xl border border-white/10 space-y-2">
                    <span className="font-semibold text-white block">触发模式</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTriggerMode('slide')}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          triggerMode === 'slide'
                            ? 'bg-[#0A84FF] text-white border-blue-400 font-bold'
                            : 'bg-white/5 border-white/10 text-white/70'
                        }`}
                      >
                        <div>滑过立即触发</div>
                        <div className="text-[10px] opacity-70 mt-0.5">手指划过扇区即生效</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTriggerMode('release')}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          triggerMode === 'release'
                            ? 'bg-[#0A84FF] text-white border-blue-400 font-bold'
                            : 'bg-white/5 border-white/10 text-white/70'
                        }`}
                      >
                        <div>松手释放触发</div>
                        <div className="text-[10px] opacity-70 mt-0.5">移至扇区后抬指生效</div>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-[#1C1C26] p-3 rounded-xl border border-white/10 space-y-2">
                  <span className="font-semibold text-white block">展开抽屉方向:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { dir: 'up', label: '向上展开', icon: <ChevronUp className="w-4 h-4 mx-auto mb-1" /> },
                      { dir: 'down', label: '向下展开', icon: <ChevronDown className="w-4 h-4 mx-auto mb-1" /> },
                      { dir: 'left', label: '向左展开', icon: <ChevronLeft className="w-4 h-4 mx-auto mb-1" /> },
                      { dir: 'right', label: '向右展开', icon: <ChevronRight className="w-4 h-4 mx-auto mb-1" /> },
                    ].map((item) => (
                      <button
                        key={item.dir}
                        type="button"
                        onClick={() => setDirection(item.dir as any)}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                          direction === item.dir
                            ? 'bg-[#0A84FF] text-white border-blue-400 font-bold'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {item.icon}
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer of Right Panel */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs shrink-0">
            <span className="text-white/40">
              已被收纳的按键在主画布隐藏
            </span>
            {onStartCanvasPick && (
              <button
                type="button"
                onClick={() => {
                  handleSaveAll();
                  onStartCanvasPick();
                }}
                className="text-purple-300 hover:text-purple-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>从画布点选 ➔</span>
              </button>
            )}
          </div>

          {/* OVERLAY: REPLACING KEY SELECTION DRAWER */}
          {replacingSlotIndex !== null && (
            <div className="absolute inset-0 z-40 bg-[#12121A]/98 backdrop-blur-xl p-3 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-bold text-xs">
                    #{replacingSlotIndex + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      选择要放入插槽 #{replacingSlotIndex + 1} 的按键
                    </div>
                    <div className="text-[10px] text-white/50">
                      点击下方按键完成替换；或点击“返回画布点选”
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReplacingSlotIndex(null)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Canvas Pick Button inside Replace Drawer */}
              {onStartCanvasPick && (
                <div className="py-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveAll();
                      onStartCanvasPick();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <MousePointerClick className="w-4 h-4" />
                    <span>👆 返回画布，直接点选按键替换此插槽</span>
                  </button>
                </div>
              )}

              {/* Candidate Keys List */}
              <div className="flex-1 overflow-y-auto py-1 space-y-1.5 pr-1 min-h-0 scrollbar-thin">
                <div className="text-[11px] font-semibold text-white/60 mb-1">
                  候选画布按键 ({allCandidateKeys.length}):
                </div>
                {allCandidateKeys.map((keyItem) => {
                  const isCurrentInThisSlot = currentSlots[replacingSlotIndex]?.sourceKeyId === keyItem.id;
                  const otherSlotIdx = currentSlots.findIndex(
                    (s, sIdx) => s.sourceKeyId === keyItem.id && sIdx !== replacingSlotIndex
                  );

                  return (
                    <div
                      key={keyItem.id}
                      onClick={() => handleReplaceSlotWithKey(replacingSlotIndex, keyItem)}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                        isCurrentInThisSlot
                          ? 'bg-blue-500/20 border-blue-400'
                          : 'bg-[#1C1C26] hover:bg-[#262635] border-white/10 hover:border-blue-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono text-white ${
                            isCurrentInThisSlot
                              ? 'bg-blue-600 border border-blue-300'
                              : 'bg-white/10 border border-white/20'
                          }`}
                        >
                          {keyItem.keyLabel}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate max-w-[120px]">
                              {keyItem.name || keyItem.keyLabel}
                            </span>
                            {otherSlotIdx !== -1 && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded">
                                在#{otherSlotIdx + 1}槽
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/40">
                            X: {keyItem.x}% · Y: {keyItem.y}%
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                          isCurrentInThisSlot
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 hover:bg-[#0A84FF] text-white'
                        }`}
                      >
                        {isCurrentInThisSlot ? '当前绑定' : '选定替换 ➔'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Cancel Footer */}
              <div className="pt-2 border-t border-white/10 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setReplacingSlotIndex(null)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white/80 cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
