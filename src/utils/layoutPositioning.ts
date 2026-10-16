import { PositionAnchorType, ShortcutKey, ControlScheme } from '../types';

/**
 * Detects the corner / edge anchor type based on percentage coordinates (0 - 100).
 */
export function detectAnchorType(x: number, y: number): PositionAnchorType {
  // Top bar items (HUD, Menu, Back, Settings)
  if (y <= 18) {
    if (x <= 35) return 'top-left';
    if (x >= 65) return 'top-right';
    return 'top-edge';
  }

  // Extreme bottom bar
  if (y >= 88) {
    if (x <= 35) return 'bottom-left';
    if (x >= 65) return 'bottom-right';
    return 'bottom-edge';
  }

  // Lower half (Thumb holding zones)
  if (y >= 45) {
    if (x <= 42) return 'bottom-left';
    if (x >= 58) return 'bottom-right';
    return 'center';
  }

  // Upper half
  if (x <= 42) return 'top-left';
  if (x >= 58) return 'top-right';
  return 'center';
}

/**
 * Human-readable anchor label for tooltips and badges
 */
export function getAnchorLabel(anchor: PositionAnchorType): string {
  switch (anchor) {
    case 'bottom-left':
      return '左下角 · 摇杆/移动区吸附';
    case 'bottom-right':
      return '右下角 · 技能/主操作区吸附';
    case 'top-left':
      return '左上角 · 视窗/背包区吸附';
    case 'top-right':
      return '右上角 · 状态/快捷菜单吸附';
    case 'top-edge':
      return '顶部 · 状态栏水平吸附';
    case 'bottom-edge':
      return '底部 · 居中快捷栏吸附';
    default:
      return '自由百分比居中分布';
  }
}

/**
 * Intelligently adapts key positions when switching between landscape (16:9 / 20:9)
 * and portrait (9:16 / 9:19.5) using four-corner edge anchor affinity.
 */
export function adaptKeysForOrientation(
  keys: ShortcutKey[],
  targetOrientation: 'landscape' | 'portrait'
): ShortcutKey[] {
  return keys.map((key) => {
    // Top bar / system keys (HUD, Menu)
    if (key.keyType === 'hud') {
      return {
        ...key,
        x: 50,
        y: targetOrientation === 'portrait' ? 5 : 6,
      };
    }
    if (key.keyType === 'system' || key.id === 'key-system-menu' || key.isSystemAction) {
      return {
        ...key,
        x: targetOrientation === 'portrait' ? 90 : 93,
        y: targetOrientation === 'portrait' ? 6 : 8,
      };
    }

    const anchor = detectAnchorType(key.x, key.y);

    if (targetOrientation === 'portrait') {
      // Adapting to narrow, tall screen
      switch (anchor) {
        case 'bottom-left': {
          // Left thumb: keep close to bottom-left corner with safe ergonomic padding
          const distFromLeft = Math.max(5, key.x);
          const distFromBottom = Math.max(5, 100 - key.y);
          // Clamp x inside 10% - 42%, clamp y inside 62% - 90%
          const newX = Math.round(Math.min(42, Math.max(12, distFromLeft * 1.05)));
          const newY = Math.round(Math.max(64, Math.min(90, 100 - distFromBottom * 0.95)));
          return { ...key, x: newX, y: newY };
        }
        case 'bottom-right': {
          // Right thumb: keep close to bottom-right corner
          const distFromRight = Math.max(5, 100 - key.x);
          const distFromBottom = Math.max(5, 100 - key.y);
          const newX = Math.round(Math.max(56, Math.min(88, 100 - distFromRight * 1.08)));
          const newY = Math.round(Math.max(64, Math.min(90, 100 - distFromBottom * 0.95)));
          return { ...key, x: newX, y: newY };
        }
        case 'top-left': {
          const newX = Math.round(Math.min(38, Math.max(10, key.x)));
          const newY = Math.round(Math.min(35, Math.max(12, key.y * 1.2)));
          return { ...key, x: newX, y: newY };
        }
        case 'top-right': {
          const distFromRight = 100 - key.x;
          const newX = Math.round(Math.max(62, Math.min(90, 100 - distFromRight)));
          const newY = Math.round(Math.min(35, Math.max(12, key.y * 1.2)));
          return { ...key, x: newX, y: newY };
        }
        default:
          return { ...key };
      }
    } else {
      // Adapting to wide landscape screen
      switch (anchor) {
        case 'bottom-left': {
          // Spread comfortably towards the left side in landscape
          const newX = Math.round(Math.min(35, Math.max(10, key.x * 0.95)));
          const newY = Math.round(Math.max(48, Math.min(86, key.y)));
          return { ...key, x: newX, y: newY };
        }
        case 'bottom-right': {
          // Spread comfortably towards the right side in landscape
          const distFromRight = 100 - key.x;
          const newX = Math.round(Math.max(62, Math.min(90, 100 - distFromRight * 0.95)));
          const newY = Math.round(Math.max(48, Math.min(86, key.y)));
          return { ...key, x: newX, y: newY };
        }
        case 'top-left': {
          const newX = Math.round(Math.min(30, Math.max(8, key.x)));
          const newY = Math.round(Math.min(30, Math.max(8, key.y * 0.9)));
          return { ...key, x: newX, y: newY };
        }
        case 'top-right': {
          const distFromRight = 100 - key.x;
          const newX = Math.round(Math.max(70, Math.min(92, 100 - distFromRight)));
          const newY = Math.round(Math.min(30, Math.max(8, key.y * 0.9)));
          return { ...key, x: newX, y: newY };
        }
        default:
          return { ...key };
      }
    }
  });
}

/**
 * Returns the effective keys for a given scheme and orientation,
 * utilizing the dedicated keysLandscape / keysPortrait if defined,
 * or dynamically adapting using four-corner edge anchoring.
 */
export function getSchemeKeysForOrientation(
  scheme: ControlScheme,
  orientation: 'landscape' | 'portrait'
): ShortcutKey[] {
  if (orientation === 'landscape') {
    if (scheme.keysLandscape && scheme.keysLandscape.length > 0) {
      return scheme.keysLandscape;
    }
    return scheme.keys;
  } else {
    if (scheme.keysPortrait && scheme.keysPortrait.length > 0) {
      return scheme.keysPortrait;
    }
    // Intelligently generate portrait layout from current keys
    return adaptKeysForOrientation(scheme.keys, 'portrait');
  }
}
