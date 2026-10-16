export type ActionType = 'click' | 'lock' | 'hold';
export type KeyShape = 'circle' | 'rect' | 'pill';
export type ModifierKey = 'cmd' | 'shift' | 'opt' | 'ctrl' | 'fn';
export type VirtualKeyType =
  | 'single'
  | 'combo'
  | 'wheel-folder'
  | 'list-folder'
  | 'macro'
  | 'camera-joystick'
  | 'system'
  | 'hud';

export interface MacroAction {
  id: string;
  type: 'keydown' | 'keyup' | 'click' | 'delay';
  key: string;
  delayMs: number;
}

export interface WheelSlot {
  id: string;
  index: number;
  label: string;
  key: string;
  name?: string;
  icon?: string;
  sourceKeyId?: string; // ID of the canvas ShortcutKey collected into this slot
  sourceKey?: Partial<ShortcutKey>;
}

export interface WheelFolderConfig {
  slots: WheelSlot[];
  radius: number; // 40 - 120
  deadzone: number; // 10 - 40
  triggerMode: 'slide' | 'release';
  isExpanded?: boolean;
}

export interface ListFolderSlot {
  id: string;
  index: number;
  label: string;
  key: string;
  name?: string;
  sourceKeyId?: string; // ID of the canvas ShortcutKey collected into this slot
  sourceKey?: Partial<ShortcutKey>;
}

export interface ListFolderConfig {
  slots: ListFolderSlot[];
  direction: 'up' | 'down' | 'left' | 'right';
  isExpanded?: boolean;
}

export interface MacroConfig {
  actions: MacroAction[];
  loopType: 'once' | 'hold' | 'toggle';
  totalDurationMs?: number;
}

export interface SystemAction {
  id: string;
  category: 'folder' | 'macro' | 'system' | 'media' | 'capture' | 'window';
  name: string;
  iconName: string;
  badge?: string;
  defaultShortcut?: string;
  description: string;
}

export interface ShortcutKey {
  id: string;
  name: string;
  keyLabel: string; // Displayed label, e.g. "W", "⌘W", "⏯", etc.
  primaryKey: string; // The base key, e.g. "W", "space", "esc", "F1"
  modifiers: ModifierKey[]; // Active modifiers: ['cmd', 'shift'], etc.
  keyType?: VirtualKeyType;
  isSystemAction?: boolean;
  systemActionId?: string;
  sizePercent: number; // 20 - 150
  opacityPercent: number; // 0 - 100
  actionType: ActionType;
  shape: KeyShape;
  turboFrequency?: number; // 1 - 30 clicks/second when actionType is lock/turbo
  voice: boolean;
  hint: boolean;
  vibrate: boolean;
  visible: boolean;
  x: number;
  y: number;
  folderId?: string; // ID of the folder (wheel-folder or list-folder) containing this key
  folderSlotIndex?: number; // Slot index inside the folder
  isFolderExpanded?: boolean; // Controls canvas expanded vs collapsed in edit mode
  wheelConfig?: WheelFolderConfig;
  listFolderConfig?: ListFolderConfig;
  macroConfig?: MacroConfig;
  hudConfig?: {
    showFps?: boolean;
    showPing?: boolean;
    showBitrate?: boolean;
    showBattery?: boolean;
    customLabel?: string;
  };
}

export type PositionAnchorType =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-edge'
  | 'bottom-edge'
  | 'center';

export interface ControlScheme {
  id: string;
  name: string;
  gameApp: string;
  iconType: 'lol' | 'diablo' | 'genshin' | 'fps' | 'office' | 'custom';
  isOfficial?: boolean;
  isCurrent?: boolean;
  code: string;
  keys: ShortcutKey[];
  keysLandscape?: ShortcutKey[];
  keysPortrait?: ShortcutKey[];
  positioningMode?: 'percentage-anchored' | 'percentage-fluid';
  description: string;
  updatedAt: string;
  author?: string;
}

export interface AppProfile {
  id: string;
  name: string;
  iconType: 'all' | 'codex' | 'zcode' | 'vscode' | 'chrome' | 'safari' | 'custom';
  color?: string;
  customIcon?: string;
  description?: string;
}

export type DeviceMode =
  | 'auto'
  | 'iphone-portrait'
  | 'iphone-landscape'
  | 'foldable'
  | 'tablet'
  | 'widescreen';

export type AppViewLevel = 'home' | 'tier1_play' | 'tier2_edit';

export interface RemoteDevice {
  id: string;
  name: string;
  hostType: 'windows' | 'mac' | 'linux' | 'console';
  osName: string;
  gpu: string;
  cpu: string;
  ip: string;
  ping: number; // in ms
  fps: number;
  resolution: string;
  bitrate: string;
  status: 'online' | 'busy' | 'offline' | 'sleeping';
  category: 'game' | 'work' | 'server';
  thumbnail: string;
  activeGameOrApp?: string;
  defaultSchemeId?: string;
  tags: string[];
}
