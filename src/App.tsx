/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  DeviceMode,
  ShortcutKey,
  AppProfile,
  ControlScheme,
  MacroConfig,
  RemoteDevice,
  AppViewLevel,
} from './types';
import { PRESET_APPS } from './data/presetApps';
import { PRESET_SCHEMES } from './data/presetSchemes';
import { PRESET_DEVICES } from './data/presetDevices';
import { getSchemeKeysForOrientation, adaptKeysForOrientation } from './utils/layoutPositioning';
import { MobileShell } from './components/MobileShell';
import { HomeDeviceList } from './components/HomeDeviceList';
import { Tier1ControlCanvas } from './components/Tier1ControlCanvas';
import { EditorTopBar } from './components/EditorTopBar';
import { PropertyPanel } from './components/PropertyPanel';
import { KeyCanvas } from './components/KeyCanvas';
import { AppSelectorSheet } from './components/AppSelectorSheet';
import { KeyBindingScreen } from './components/KeyBindingScreen';
import { SchemeManagementModal } from './components/SchemeManagementModal';
import { FolderTier3Editor } from './components/FolderTier3Editor';
import { MacroEditorModal } from './components/MacroEditorModal';
import { CheckCircle2, UnfoldHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

export default function App() {
  // Navigation: Home -> Tier1 Play -> Tier2 Edit -> Tier3 Folder/Key
  const [currentViewLevel, setCurrentViewLevel] = useState<AppViewLevel>('home');
  const [devices, setDevices] = useState<RemoteDevice[]>(PRESET_DEVICES);
  const [currentDevice, setCurrentDevice] = useState<RemoteDevice>(PRESET_DEVICES[0]);

  // Mode defaults to auto, but switches intelligently
  const [mode, setMode] = useState<DeviceMode>('auto');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // App & Scheme State
  const [apps, setApps] = useState<AppProfile[]>(PRESET_APPS);
  const [selectedAppId, setSelectedAppId] = useState<string>('all');
  const [schemes, setSchemes] = useState<ControlScheme[]>(PRESET_SCHEMES);
  const [activeSchemeId, setActiveSchemeId] = useState<string>('scheme-default');

  // Multi-Key State on Canvas (Ensures movable HUD exists)
  const [keys, setKeys] = useState<ShortcutKey[]>(() => {
    const active = PRESET_SCHEMES.find((s) => s.id === 'scheme-default') || PRESET_SCHEMES[0];
    const initialKeys = [...active.keys];
    if (!initialKeys.some((k) => k.keyType === 'hud')) {
      initialKeys.push({
        id: 'key-hud-stats',
        name: '性能监控 HUD',
        keyLabel: 'HUD',
        primaryKey: 'hud',
        modifiers: [],
        keyType: 'hud',
        sizePercent: 100,
        opacityPercent: 85,
        actionType: 'click',
        shape: 'pill',
        voice: false,
        hint: false,
        vibrate: false,
        visible: true,
        x: 50,
        y: 6,
      });
    }
    if (!initialKeys.some((k) => k.id === 'key-system-menu' || k.isSystemAction)) {
      initialKeys.push({
        id: 'key-system-menu',
        name: '功能菜单',
        keyLabel: '⚙️',
        primaryKey: 'menu',
        modifiers: [],
        keyType: 'system',
        isSystemAction: true,
        systemActionId: 'menu',
        sizePercent: 100,
        opacityPercent: 90,
        actionType: 'click',
        shape: 'circle',
        voice: false,
        hint: false,
        vibrate: true,
        visible: true,
        x: 93,
        y: 8,
      });
    }
    return initialKeys;
  });
  const [selectedKeyId, setSelectedKeyId] = useState<string>(() => {
    const active = PRESET_SCHEMES.find((s) => s.id === 'scheme-default');
    return active && active.keys.length > 0 ? active.keys[0].id : 'key-w';
  });

  // Modal Visibility State
  const [isAppSheetOpen, setIsAppSheetOpen] = useState(false);
  const [isKeyBindingOpen, setIsKeyBindingOpen] = useState(false);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);

  // Canvas Key Collection Mode (for wheel / list folder)
  const [collectingFolderId, setCollectingFolderId] = useState<string | null>(null);

  // Editor Collapse & Dragging State
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(false);
  const [isDraggingKey, setIsDraggingKey] = useState(false);

  const handleSelectKey = (keyId: string) => {
    setSelectedKeyId(keyId);
    if (keyId) {
      setIsFullyCollapsed(false);
    }
  };

  // Key Binding Mode & Toast
  const [bindingMode, setBindingMode] = useState<'single' | 'combo'>('single');
  const [isAddingNewKey, setIsAddingNewKey] = useState(false);
  const [showDoneToast, setShowDoneToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('已成功保存配置');

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const activeApp = apps.find((a) => a.id === selectedAppId) || apps[0];
  const activeScheme = schemes.find((s) => s.id === activeSchemeId) || schemes[0];
  const activeKey = keys.find((k) => k.id === selectedKeyId) || keys[0] || {
    id: 'key-w',
    name: '按键',
    keyLabel: 'W',
    primaryKey: 'W',
    modifiers: [],
    sizePercent: 80,
    opacityPercent: 85,
    actionType: 'click',
    shape: 'circle',
    voice: true,
    hint: true,
    vibrate: true,
    visible: true,
    x: 50,
    y: 50,
  };

  // Determine effective display mode for components
  const isRealLandscape = windowWidth > windowHeight;
  const isActualMobile = windowWidth < 640 || (windowWidth < 900 && windowHeight < 550);

  const effectiveViewport: 'portrait' | 'landscape' | 'foldable' | 'tablet' | 'fullscreen' = (() => {
    if (mode === 'iphone-portrait') return 'portrait';
    if (mode === 'iphone-landscape') return 'landscape';
    if (mode === 'foldable') return 'foldable';
    if (mode === 'tablet') return 'tablet';
    if (mode === 'widescreen') return 'fullscreen';

    // Auto behavior
    if (isActualMobile) {
      return isRealLandscape ? 'landscape' : 'portrait';
    }
    if (currentViewLevel === 'tier1_play') {
      return 'landscape'; // Default to landscape handheld game stream!
    }
    return 'portrait';
  })();

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowDoneToast(true);
    setTimeout(() => setShowDoneToast(false), 2000);
  };

  /* ========================================================================= */
  /* NAVIGATION & TRANSITION HANDLERS                                          */
  /* ========================================================================= */
  const handleConnectDevice = (device: RemoteDevice) => {
    setCurrentDevice(device);
    if (device.defaultSchemeId) {
      handleSelectScheme(device.defaultSchemeId);
    }
    // As explicitly requested: prioritize mobile landscape streaming!
    setMode('iphone-landscape');
    setCurrentViewLevel('tier1_play');
    triggerToast(`已连接「${device.name}」，已切换至横屏沉浸串流`);
  };

  const handleEditDeviceLayout = (device: RemoteDevice) => {
    setCurrentDevice(device);
    if (device.defaultSchemeId) {
      handleSelectScheme(device.defaultSchemeId);
    }
    setCurrentViewLevel('tier2_edit');
    triggerToast(`进入「${device.name}」按键编辑态`);
  };

  const handleReturnHome = () => {
    setCurrentViewLevel('home');
    triggerToast('已返回远程主机列表');
  };

  const handleEnterEditMode = () => {
    setCurrentViewLevel('tier2_edit');
    triggerToast('已进入二级按键编辑态');
  };

  const handleReturnToPlay = () => {
    setCurrentViewLevel('tier1_play');
    triggerToast('已应用配置，返回一级操控态');
  };

  const handleDone = () => {
    triggerToast(`已成功保存方案「${activeScheme.name}」配置`);
    setCurrentViewLevel('tier1_play');
  };

  /* ========================================================================= */
  /* KEY MANAGEMENT HANDLERS                                                   */
  /* ========================================================================= */
  const handleShortcutChange = (updated: Partial<ShortcutKey>) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === selectedKeyId ? { ...k, ...updated } : k))
    );
  };

  const handlePositionChange = (id: string, x: number, y: number) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, x, y } : k)));
  };

  const handleAddSingleKey = () => {
    setBindingMode('single');
    setIsAddingNewKey(true);
    setIsKeyBindingOpen(true);
  };

  const handleAddComboKey = () => {
    setBindingMode('combo');
    setIsAddingNewKey(true);
    setIsKeyBindingOpen(true);
  };

  const handleClearKey = () => {
    handleShortcutChange({ keyLabel: '·', primaryKey: '', modifiers: [] });
    triggerToast('已清空当前按键映射');
  };

  const handleReleaseAllFromFolder = (folderId = selectedKeyId) => {
    const folder = keys.find((k) => k.id === folderId);
    const folderName = folder?.name || '功能夹';

    setKeys((prev) =>
      prev.map((k) => {
        if (k.folderId === folderId) {
          return { ...k, folderId: undefined, folderSlotIndex: undefined };
        }
        if (k.id === folderId) {
          if (k.keyType === 'wheel-folder' && k.wheelConfig) {
            return {
              ...k,
              wheelConfig: {
                ...k.wheelConfig,
                slots: k.wheelConfig.slots.map((s, idx) => ({
                  ...s,
                  sourceKeyId: undefined,
                  sourceKey: undefined,
                  label: String(idx + 1),
                  key: String(idx + 1),
                  name: `插槽 ${idx + 1}`,
                })),
              },
            };
          }
          if (k.keyType === 'list-folder' && k.listFolderConfig) {
            return {
              ...k,
              listFolderConfig: {
                ...k.listFolderConfig,
                slots: k.listFolderConfig.slots.map((s, idx) => ({
                  ...s,
                  sourceKeyId: undefined,
                  sourceKey: undefined,
                  label: `槽${idx + 1}`,
                  key: String(idx + 1),
                  name: `插槽 ${idx + 1}`,
                })),
              },
            };
          }
        }
        return k;
      })
    );

    triggerToast(`已释放「${folderName}」内部按键`);
  };

  const handleToggleFolderExpand = (folderId: string) => {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === folderId ? { ...k, isFolderExpanded: !k.isFolderExpanded } : k
      )
    );
  };

  const handleSaveFolderTier3 = (
    updatedFolder: Partial<ShortcutKey>,
    updatedAllKeys?: ShortcutKey[]
  ) => {
    if (updatedAllKeys) {
      setKeys(
        updatedAllKeys.map((k) =>
          k.id === selectedKeyId ? { ...k, ...updatedFolder } : k
        )
      );
    } else {
      handleShortcutChange(updatedFolder);
    }
    triggerToast('功能夹配置已保存');
  };

  /* ========================================================================= */
  /* DIRECT CANVAS KEY COLLECTION MODE (返回二级画布点选控件收纳)             */
  /* ========================================================================= */
  const handleStartCollectingKeys = (folderId: string) => {
    setIsWheelModalOpen(false);
    setCollectingFolderId(folderId);
    setSelectedKeyId(folderId);
    const folder = keys.find((k) => k.id === folderId);
    triggerToast(`已进入「${folder?.name || '轮盘夹'}」点选收纳：请直接点击画布上的按键进行收纳`);
  };

  const handleStopCollectingKeys = () => {
    const prevFolderId = collectingFolderId;
    setCollectingFolderId(null);
    if (prevFolderId) {
      setSelectedKeyId(prevFolderId);
      setIsWheelModalOpen(true);
      triggerToast('按键点选完成，已自动返回三级配置界面继续确认配置');
    } else {
      triggerToast('按键点选收纳完成');
    }
  };

  const handleToggleCollectKey = (targetKeyId: string) => {
    if (!collectingFolderId) return;

    const folder = keys.find((k) => k.id === collectingFolderId);
    const targetKey = keys.find((k) => k.id === targetKeyId);
    if (!folder || !targetKey) return;

    const isWheel = folder.keyType === 'wheel-folder';
    const isList = folder.keyType === 'list-folder';

    const currentSlots = isWheel
      ? folder.wheelConfig?.slots || []
      : folder.listFolderConfig?.slots || [];

    const slotIndex = currentSlots.findIndex((s) => s.sourceKeyId === targetKeyId);
    const isAlreadyIn = slotIndex !== -1 || targetKey.folderId === collectingFolderId;

    if (isAlreadyIn) {
      // "在添加那里再点一下就删除" (Remove & release back to canvas)
      if (currentSlots.length <= 3) {
        triggerToast(`「${folder.name}」至少需要保留 3 个按键才像样哦！无法继续删除`);
        return;
      }

      // Remove from slots & release targetKey
      const updatedKeys = keys.map((k) => {
        if (k.id === targetKeyId) {
          return { ...k, folderId: undefined, folderSlotIndex: undefined };
        }
        if (k.id === collectingFolderId) {
          if (isWheel && k.wheelConfig) {
            const newSlots = k.wheelConfig.slots
              .filter((_, idx) => idx !== slotIndex)
              .map((s, idx) => ({ ...s, index: idx }));
            return {
              ...k,
              wheelConfig: { ...k.wheelConfig, slots: newSlots },
            };
          }
          if (isList && k.listFolderConfig) {
            const newSlots = k.listFolderConfig.slots
              .filter((_, idx) => idx !== slotIndex)
              .map((s, idx) => ({ ...s, index: idx }));
            return {
              ...k,
              listFolderConfig: { ...k.listFolderConfig, slots: newSlots },
            };
          }
        }
        return k;
      });

      setKeys(updatedKeys);
      triggerToast(`已将「${targetKey.name || targetKey.keyLabel}」移出轮盘 (当前保留 ${currentSlots.length - 1} 键)`);
    } else {
      // Add into folder (max 8, deduplicated)
      if (currentSlots.length >= 8) {
        triggerToast('轮盘最多容纳 8 个按键，已达上限！');
        return;
      }

      // Check if there's an empty slot without a sourceKeyId, or create new slot
      const emptySlotIdx = currentSlots.findIndex((s) => !s.sourceKeyId);
      const newSlotIndex = emptySlotIdx !== -1 ? emptySlotIdx : currentSlots.length;

      const updatedKeys = keys.map((k) => {
        if (k.id === targetKeyId) {
          return { ...k, folderId: collectingFolderId, folderSlotIndex: newSlotIndex };
        }
        if (k.id === collectingFolderId) {
          if (isWheel) {
            const oldSlots = k.wheelConfig?.slots || [];
            let newSlots = [...oldSlots];
            if (emptySlotIdx !== -1) {
              newSlots[emptySlotIdx] = {
                ...newSlots[emptySlotIdx],
                sourceKeyId: targetKeyId,
                label: targetKey.keyLabel,
                key: targetKey.primaryKey,
                name: targetKey.name,
                sourceKey: targetKey,
              };
            } else {
              newSlots.push({
                id: `w_${Date.now()}_${newSlots.length}`,
                index: newSlots.length,
                label: targetKey.keyLabel,
                key: targetKey.primaryKey,
                name: targetKey.name,
                sourceKeyId: targetKeyId,
                sourceKey: targetKey,
              });
            }
            return {
              ...k,
              wheelConfig: {
                ...(k.wheelConfig || { radius: 80, deadzone: 20, triggerMode: 'slide', isExpanded: false }),
                slots: newSlots,
              },
            };
          }
          if (isList) {
            const oldSlots = k.listFolderConfig?.slots || [];
            let newSlots = [...oldSlots];
            if (emptySlotIdx !== -1) {
              newSlots[emptySlotIdx] = {
                ...newSlots[emptySlotIdx],
                sourceKeyId: targetKeyId,
                label: targetKey.keyLabel,
                key: targetKey.primaryKey,
                name: targetKey.name,
                sourceKey: targetKey,
              };
            } else {
              newSlots.push({
                id: `l_${Date.now()}_${newSlots.length}`,
                index: newSlots.length,
                label: targetKey.keyLabel,
                key: targetKey.primaryKey,
                name: targetKey.name,
                sourceKeyId: targetKeyId,
                sourceKey: targetKey,
              });
            }
            return {
              ...k,
              listFolderConfig: {
                ...(k.listFolderConfig || { direction: 'up', isExpanded: false }),
                slots: newSlots,
              },
            };
          }
        }
        return k;
      });

      setKeys(updatedKeys);
      triggerToast(`已将「${targetKey.name || targetKey.keyLabel}」收纳入轮盘 (#${newSlotIndex + 1})`);
    }
  };

  const handleRemoveSlotFromFolder = (folderId: string, slotIndex: number) => {
    const folder = keys.find((k) => k.id === folderId);
    if (!folder) return;
    const isWheel = folder.keyType === 'wheel-folder';
    const currentSlots = isWheel
      ? folder.wheelConfig?.slots || []
      : folder.listFolderConfig?.slots || [];

    if (currentSlots.length <= 3) {
      triggerToast('轮盘至少需要保留 3 个按键才像样哦！无法继续删除');
      return;
    }

    const targetSlot = currentSlots[slotIndex];
    const targetSourceId = targetSlot?.sourceKeyId;

    const updatedKeys = keys.map((k) => {
      if (targetSourceId && k.id === targetSourceId) {
        return { ...k, folderId: undefined, folderSlotIndex: undefined };
      }
      if (k.id === folderId) {
        if (isWheel && k.wheelConfig) {
          const newSlots = k.wheelConfig.slots
            .filter((_, idx) => idx !== slotIndex)
            .map((s, idx) => ({ ...s, index: idx }));
          return {
            ...k,
            wheelConfig: { ...k.wheelConfig, slots: newSlots },
          };
        }
        if (folder.keyType === 'list-folder' && k.listFolderConfig) {
          const newSlots = k.listFolderConfig.slots
            .filter((_, idx) => idx !== slotIndex)
            .map((s, idx) => ({ ...s, index: idx }));
          return {
            ...k,
            listFolderConfig: { ...k.listFolderConfig, slots: newSlots },
          };
        }
      }
      return k;
    });

    setKeys(updatedKeys);
    triggerToast(`已删除插槽 #${slotIndex + 1}，当前保留 ${currentSlots.length - 1} 键`);
  };

  const handleAddSlotToFolder = (folderId: string) => {
    const folder = keys.find((k) => k.id === folderId);
    if (!folder) return;
    const isWheel = folder.keyType === 'wheel-folder';
    const currentSlots = isWheel
      ? folder.wheelConfig?.slots || []
      : folder.listFolderConfig?.slots || [];

    if (currentSlots.length >= 8) {
      triggerToast('轮盘最多支持 8 个按键，已达上限！');
      return;
    }

    const newIndex = currentSlots.length;
    const updatedKeys = keys.map((k) => {
      if (k.id === folderId) {
        if (isWheel) {
          const newSlots = [
            ...(k.wheelConfig?.slots || []),
            {
              id: `w_${Date.now()}_${newIndex}`,
              index: newIndex,
              label: String(newIndex + 1),
              key: String(newIndex + 1),
              name: `插槽 ${newIndex + 1}`,
            },
          ];
          return {
            ...k,
            wheelConfig: {
              ...(k.wheelConfig || { radius: 80, deadzone: 20, triggerMode: 'slide', isExpanded: false }),
              slots: newSlots,
            },
          };
        } else {
          const newSlots = [
            ...(k.listFolderConfig?.slots || []),
            {
              id: `l_${Date.now()}_${newIndex}`,
              index: newIndex,
              label: `槽${newIndex + 1}`,
              key: String(newIndex + 1),
              name: `插槽 ${newIndex + 1}`,
            },
          ];
          return {
            ...k,
            listFolderConfig: {
              ...(k.listFolderConfig || { direction: 'up', isExpanded: false }),
              slots: newSlots,
            },
          };
        }
      }
      return k;
    });

    setKeys(updatedKeys);
    triggerToast(`已新增空插槽 #${newIndex + 1}（当前共 ${newIndex + 1} 槽）`);
  };

  const handleDeleteSelectedKey = () => {
    if (keys.length <= 1) {
      triggerToast('至少保留一个按键在屏幕上');
      return;
    }
    const keyToDelete = keys.find((k) => k.id === selectedKeyId);
    if (keyToDelete?.id === 'key-system-menu' || keyToDelete?.isSystemAction) {
      triggerToast('功能菜单键为核心入口，不可删除');
      return;
    }
    const remaining = keys
      .filter((k) => k.id !== selectedKeyId)
      .map((k) =>
        k.folderId === selectedKeyId
          ? { ...k, folderId: undefined, folderSlotIndex: undefined }
          : k
      );
    setKeys(remaining);
    setSelectedKeyId(remaining[0].id);
    triggerToast('已删除选中按键');
  };

  const handleDuplicateSelectedKey = () => {
    const newId = `key_${Date.now()}`;
    const duplicated: ShortcutKey = {
      ...activeKey,
      id: newId,
      name: `${activeKey.name} 副本`,
      x: Math.min(88, activeKey.x + 8),
      y: Math.min(85, activeKey.y + 6),
    };
    setKeys((prev) => [...prev, duplicated]);
    setSelectedKeyId(newId);
    triggerToast(`已复制创建「${duplicated.name}」`);
  };

  const handleSaveKeyBinding = (updated: Partial<ShortcutKey>) => {
    if (isAddingNewKey) {
      const newId = `key_${Date.now()}`;
      const newKey: ShortcutKey = {
        id: newId,
        name: updated.name || updated.keyLabel || '新按键',
        keyLabel: updated.keyLabel || 'W',
        primaryKey: updated.primaryKey || 'W',
        modifiers: updated.modifiers || [],
        keyType: updated.keyType || (bindingMode === 'combo' ? 'combo' : 'single'),
        isSystemAction: updated.isSystemAction,
        systemActionId: updated.systemActionId,
        sizePercent: 85,
        opacityPercent: 85,
        actionType: 'click',
        shape: 'circle',
        voice: true,
        hint: true,
        vibrate: true,
        visible: true,
        x: Math.round(35 + Math.random() * 30),
        y: Math.round(40 + Math.random() * 25),
      };
      setKeys((prev) => [...prev, newKey]);
      setSelectedKeyId(newId);
      setIsAddingNewKey(false);
      triggerToast(`已添加新按键「${newKey.keyLabel}」`);
    } else {
      handleShortcutChange(updated);
      triggerToast(`已更新「${activeKey.name}」映射`);
    }
  };

  /* ========================================================================= */
  /* CONTROL SCHEME MANAGEMENT HANDLERS                                        */
  /* ========================================================================= */
  const handleSelectScheme = (schemeId: string) => {
    const found = schemes.find((s) => s.id === schemeId);
    if (!found) return;
    setActiveSchemeId(schemeId);

    // Retrieve orientation-calibrated keys (landscape or portrait)
    const orientation = isEditorLandscape ? 'landscape' : 'portrait';
    const effectiveKeys = getSchemeKeysForOrientation(found, orientation);

    let schemeKeys = [...effectiveKeys];
    if (!schemeKeys.some((k) => k.keyType === 'hud')) {
      schemeKeys.push({
        id: 'key-hud-stats',
        name: '性能监控 HUD',
        keyLabel: 'HUD',
        primaryKey: 'hud',
        modifiers: [],
        keyType: 'hud',
        sizePercent: 100,
        opacityPercent: 85,
        actionType: 'click',
        shape: 'pill',
        voice: false,
        hint: false,
        vibrate: false,
        visible: true,
        x: 50,
        y: 6,
      });
    }
    if (!schemeKeys.some((k) => k.id === 'key-system-menu' || k.isSystemAction)) {
      schemeKeys.push({
        id: 'key-system-menu',
        name: '功能菜单',
        keyLabel: '⚙️',
        primaryKey: 'menu',
        modifiers: [],
        keyType: 'system',
        isSystemAction: true,
        systemActionId: 'menu',
        sizePercent: 100,
        opacityPercent: 90,
        actionType: 'click',
        shape: 'circle',
        voice: false,
        hint: false,
        vibrate: true,
        visible: true,
        x: 93,
        y: 8,
      });
    }
    setKeys(schemeKeys);
    if (schemeKeys.length > 0) {
      setSelectedKeyId(schemeKeys[0].id);
    }
    setIsSchemeModalOpen(false);
    triggerToast(`已快速替换并载入方案: ${found.name}`);
  };

  const handleOverwriteScheme = (
    schemeId: string,
    updatedKeys: ShortcutKey[],
    targetOrientation: 'all' | 'landscape' | 'portrait' = 'all'
  ) => {
    setSchemes((prev) =>
      prev.map((s) => {
        if (s.id !== schemeId) return s;
        if (targetOrientation === 'landscape') {
          return {
            ...s,
            keysLandscape: [...updatedKeys],
            keys: isEditorLandscape ? [...updatedKeys] : s.keys,
            updatedAt: '刚刚',
          };
        } else if (targetOrientation === 'portrait') {
          return {
            ...s,
            keysPortrait: [...updatedKeys],
            keys: !isEditorLandscape ? [...updatedKeys] : s.keys,
            updatedAt: '刚刚',
          };
        } else {
          return {
            ...s,
            keys: [...updatedKeys],
            keysLandscape: isEditorLandscape ? [...updatedKeys] : s.keysLandscape,
            keysPortrait: !isEditorLandscape ? [...updatedKeys] : s.keysPortrait,
            updatedAt: '刚刚',
          };
        }
      })
    );
    triggerToast('已成功保存并覆盖方案配置');
  };

  const handleCreateScheme = (
    name: string,
    options?: { keysLandscape?: ShortcutKey[]; keysPortrait?: ShortcutKey[] }
  ) => {
    const newSchemeId = `scheme_${Date.now()}`;
    const newScheme: ControlScheme = {
      id: newSchemeId,
      name,
      gameApp: '自定义游戏/应用',
      iconType: 'custom',
      isOfficial: false,
      code: `CUST${Math.floor(100 + Math.random() * 900)}`,
      description: `基于当前键位自定义的操控方案 (${keys.length} 控件)`,
      updatedAt: '刚刚',
      author: '当前用户',
      keys: [...keys],
      keysLandscape: options?.keysLandscape || (isEditorLandscape ? [...keys] : undefined),
      keysPortrait: options?.keysPortrait || (!isEditorLandscape ? [...keys] : undefined),
      positioningMode: 'percentage-anchored',
    };
    setSchemes((prev) => [newScheme, ...prev]);
    setActiveSchemeId(newSchemeId);
    triggerToast(`成功新建方案「${name}」`);
  };

  const handleRenameScheme = (schemeId: string, newName: string) => {
    setSchemes((prev) =>
      prev.map((s) => (s.id === schemeId ? { ...s, name: newName } : s))
    );
    triggerToast('方案重命名成功');
  };

  const handleDuplicateScheme = (schemeId: string) => {
    const source = schemes.find((s) => s.id === schemeId);
    if (!source) return;
    const dupId = `scheme_dup_${Date.now()}`;
    const dup: ControlScheme = {
      ...source,
      id: dupId,
      name: `${source.name} 副本`,
      isOfficial: false,
      code: `CPY${Math.floor(100 + Math.random() * 900)}`,
      updatedAt: '刚刚',
      keys: source.keys.map((k) => ({ ...k })),
    };
    setSchemes((prev) => [dup, ...prev]);
    triggerToast(`已生成方案副本: ${dup.name}`);
  };

  const handleDeleteScheme = (schemeId: string) => {
    const remaining = schemes.filter((s) => s.id !== schemeId);
    setSchemes(remaining);
    if (activeSchemeId === schemeId && remaining.length > 0) {
      setActiveSchemeId(remaining[0].id);
      setKeys(remaining[0].keys);
    }
    triggerToast('已删除方案');
  };

  const handleImportCode = (code: string): boolean => {
    const matched = schemes.find((s) => s.code.toUpperCase() === code.toUpperCase());
    if (matched) {
      handleSelectScheme(matched.id);
      return true;
    }
    return false;
  };

  const isEditorLandscape = effectiveViewport === 'landscape' || effectiveViewport === 'tablet';

  return (
    <MobileShell
      mode={mode}
      onModeChange={setMode}
      currentViewLevel={currentViewLevel}
      deviceName={currentDevice.name}
      ping={currentDevice.ping}
      fps={currentDevice.fps}
      onReturnHome={handleReturnHome}
    >
      {/* Toast Notification */}
      {showDoneToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1E]/95 border border-white/20 text-white px-3.5 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2 backdrop-blur-xl animate-in fade-in duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* =============================================================== */}
      {/* 1. HOME VIEW LEVEL (Mobile Handheld Game Launcher)               */}
      {/* =============================================================== */}
      {currentViewLevel === 'home' && (
        <HomeDeviceList
          devices={devices}
          onConnectDevice={handleConnectDevice}
          onEditDeviceLayout={handleEditDeviceLayout}
          onAddDevice={(newDev) => {
            const fullDev: RemoteDevice = {
              id: `dev-${Date.now()}`,
              name: newDev.name || '新主机',
              ip: newDev.ip || '192.168.1.100',
              hostType: newDev.hostType || 'windows',
              osName: newDev.hostType === 'mac' ? 'macOS Sequoia' : newDev.hostType === 'linux' ? 'Ubuntu 24.04' : 'Windows 11 Pro',
              cpu: 'Intel Core i9 / AMD Ryzen 9',
              tags: ['串流', '游戏'],
              status: 'online',
              ping: newDev.ping || 6,
              fps: newDev.fps || 60,
              bitrate: newDev.bitrate || '50 Mbps',
              resolution: newDev.resolution || '2560x1440',
              gpu: newDev.gpu || 'RTX 4080 Super',
              thumbnail:
                newDev.thumbnail ||
                'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
              activeGameOrApp: newDev.activeGameOrApp || '桌面待机',
              category: 'game',
            };
            setDevices((prev) => [fullDev, ...prev]);
            triggerToast(`已添加主机: ${fullDev.name}`);
          }}
          viewportMode={effectiveViewport}
        />
      )}

      {/* =============================================================== */}
      {/* 2. TIER 1 OPERATION CANVAS (Immersive Remote Game Streaming)    */}
      {/* =============================================================== */}
      {currentViewLevel === 'tier1_play' && (
        <Tier1ControlCanvas
          device={currentDevice}
          keys={keys}
          activeScheme={activeScheme}
          schemes={schemes}
          onSelectScheme={handleSelectScheme}
          onOpenSchemeManager={() => setIsSchemeModalOpen(true)}
          onEnterEditMode={handleEnterEditMode}
          onReturnHome={handleReturnHome}
        />
      )}

      {/* =============================================================== */}
      {/* 3. TIER 2 EDIT MODE (Mobile Handheld Key & Layout Editor)        */}
      {/* =============================================================== */}
      {currentViewLevel === 'tier2_edit' && (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
          {/* 1. Stationary Edge-to-Edge Canvas (Never jumps, stays fixed at 100% fullscreen) */}
          <div className="absolute inset-0 w-full h-full overflow-hidden z-10">
            <KeyCanvas
              keys={keys}
              selectedKeyId={selectedKeyId}
              onSelectKey={handleSelectKey}
              onChangePosition={handlePositionChange}
              onOpenKeyBinding={() => {
                setIsAddingNewKey(false);
                setIsKeyBindingOpen(true);
              }}
              onOpenWheelConfig={() => setIsWheelModalOpen(true)}
              onOpenFolderTier3={() => setIsWheelModalOpen(true)}
              onOpenMacroConfig={() => setIsMacroModalOpen(true)}
              onToggleFolderExpand={handleToggleFolderExpand}
              isLandscape={isEditorLandscape}
              onDraggingChange={setIsDraggingKey}
              collectingFolderId={collectingFolderId}
              onToggleCollectKey={handleToggleCollectKey}
              onStopCollecting={handleStopCollectingKeys}
            />
          </div>

          {/* 2. Top Bars Overlay with smooth slide-up and slide-down animation */}
          <div
            className={`absolute top-0 left-0 right-0 z-30 flex flex-col shadow-2xl transition-transform duration-300 ease-out pointer-events-none ${
              isDraggingKey || isFullyCollapsed ? '-translate-y-full' : 'translate-y-0'
            }`}
          >
            <div className="w-full flex flex-col pointer-events-auto">
              <EditorTopBar
                isLandscape={isEditorLandscape}
                hideFakeStatusBar={true}
                onComplete={handleDone}
                onReturnHome={handleReturnHome}
                onReturnToPlay={handleReturnToPlay}
                schemeName={activeScheme.name}
                onOpenSchemeManager={() => setIsSchemeModalOpen(true)}
                bindingMode={bindingMode}
                onAddSingleKey={handleAddSingleKey}
                onAddComboKey={handleAddComboKey}
                onClear={handleClearKey}
                onCollapseAll={() => setIsFullyCollapsed(true)}
              />

              {/* Property Panel inside the sliding top container */}
              {!!selectedKeyId && !!activeKey && (
                <PropertyPanel
                  shortcut={activeKey}
                  onChange={handleShortcutChange}
                  activeApp={activeApp}
                  onOpenAppSelector={() => setIsAppSheetOpen(true)}
                  onOpenKeyBinding={() => {
                    setIsAddingNewKey(false);
                    setIsKeyBindingOpen(true);
                  }}
                  onOpenWheelConfig={() => setIsWheelModalOpen(true)}
                  onOpenFolderTier3={() => setIsWheelModalOpen(true)}
                  onOpenMacroConfig={() => setIsMacroModalOpen(true)}
                  onDeleteKey={handleDeleteSelectedKey}
                  onDuplicateKey={handleDuplicateSelectedKey}
                  onReleaseAllFromFolder={() => handleReleaseAllFromFolder(activeKey.id)}
                  bindingMode={bindingMode}
                  onAddSingleKey={handleAddSingleKey}
                  onAddComboKey={handleAddComboKey}
                  isLandscape={isEditorLandscape}
                  onClose={() => setSelectedKeyId('')}
                  onStartCollectingKeys={handleStartCollectingKeys}
                  onRemoveSlotFromFolder={handleRemoveSlotFromFolder}
                  onAddSlotToFolder={handleAddSlotToFolder}
                  isCollectingKeys={collectingFolderId === activeKey.id}
                />
              )}
            </div>

            {/* Unified Center Handle Tab (Fully responsive arrow toggle for 收起 / 展开) */}
            {!isDraggingKey && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsDraggingKey(false);
                    setIsFullyCollapsed((prev) => !prev);
                  }}
                  className={`flex items-center justify-center gap-1.5 px-4 h-7 backdrop-blur-2xl border-b border-x border-white/20 rounded-b-xl shadow-2xl transition-all cursor-pointer active:scale-95 group select-none ${
                    isFullyCollapsed
                      ? 'bg-[#0A84FF] hover:bg-[#0071E3] text-white shadow-blue-500/40 ring-1 ring-blue-400/50'
                      : 'bg-[#18181A]/95 hover:bg-[#24242A] text-white/90'
                  }`}
                  title={isFullyCollapsed ? '点击展开按键编辑器工具栏与属性面板' : '点击完全收起顶部工具与属性面板'}
                >
                  {isFullyCollapsed ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-white animate-pulse group-hover:translate-y-0.5 transition-transform" />
                      <span className="text-[11px] font-semibold text-white">展开</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-white/60 group-hover:-translate-y-0.5 transition-transform" />
                      <span className="text-[11px] font-medium text-white/80">收起</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* GLOBAL MODALS & DRAWERS                                          */}
      {/* =============================================================== */}
      {/* App Selector Bottom Sheet */}
      <AppSelectorSheet
        isOpen={isAppSheetOpen}
        onClose={() => setIsAppSheetOpen(false)}
        apps={apps}
        selectedAppId={selectedAppId}
        onSelectApp={(app) => {
          setSelectedAppId(app.id);
          setIsAppSheetOpen(false);
          triggerToast(`已绑定应用: ${app.name}`);
        }}
        onAddCustomApp={(newApp: AppProfile) => {
          setApps((prev) => [...prev, newApp]);
          setSelectedAppId(newApp.id);
          setIsAppSheetOpen(false);
          triggerToast(`已添加新应用: ${newApp.name}`);
        }}
      />

      {/* Key Binding Screen Modal */}
      {isKeyBindingOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="relative w-full max-w-lg h-[540px] rounded-3xl overflow-hidden shadow-2xl">
            <KeyBindingScreen
              shortcut={activeKey}
              bindingMode={bindingMode}
              onSave={handleSaveKeyBinding}
              onClose={() => {
                setIsKeyBindingOpen(false);
                setIsAddingNewKey(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Scheme & Layout Management Modal (二级界面) */}
      {isSchemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[92vh] max-h-[660px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <SchemeManagementModal
              schemes={schemes}
              activeSchemeId={activeSchemeId}
              currentKeys={keys}
              isCurrentLandscape={isEditorLandscape}
              onSelectScheme={handleSelectScheme}
              onCreateScheme={handleCreateScheme}
              onRenameScheme={handleRenameScheme}
              onDuplicateScheme={handleDuplicateScheme}
              onDeleteScheme={handleDeleteScheme}
              onImportCode={handleImportCode}
              onOverwriteScheme={handleOverwriteScheme}
              onClose={() => setIsSchemeModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Tier 3 Folder Editor Modal */}
      {isWheelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[640px] max-h-[94vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <FolderTier3Editor
              shortcut={activeKey}
              allKeys={keys}
              onSave={handleSaveFolderTier3}
              onClose={() => setIsWheelModalOpen(false)}
              onStartCanvasPick={() => handleStartCollectingKeys(activeKey.id)}
            />
          </div>
        </div>
      )}

      {/* Macro Step Editor Modal */}
      {isMacroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3">
          <div className="relative w-full max-w-lg h-[540px] rounded-3xl overflow-hidden shadow-2xl">
            <MacroEditorModal
              shortcut={activeKey}
              onSave={(macroConfig: MacroConfig) => {
                handleShortcutChange({ macroConfig });
                triggerToast('宏按键连招步骤已更新');
              }}
              onClose={() => setIsMacroModalOpen(false)}
            />
          </div>
        </div>
      )}
    </MobileShell>
  );
}
