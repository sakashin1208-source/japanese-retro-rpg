/**
 * 妖幻奇譚 〜もののけ草子〜 - 定数定義
 */
export const VIEW_W = 1280;
export const VIEW_H = 960;
export const TILE_SIZE = 64;
export const HALF_TILE = 32;

// 論理キーマップ
export const KEYMAP = {
  UP: ['ArrowUp', 'KeyW'],
  DOWN: ['ArrowDown', 'KeyS'],
  LEFT: ['ArrowLeft', 'KeyA'],
  RIGHT: ['ArrowRight', 'KeyD'],
  CONFIRM: ['KeyZ', 'Enter', 'Space'],
  CANCEL: ['KeyX', 'Escape', 'ShiftLeft', 'ShiftRight']
};

export const FONTS = {
  MAIN: '"Zen Kaku Gothic New", "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
  TITLE: '"Zen Kaku Gothic New", "Noto Sans JP", serif'
};

export const COLORS = {
  BG_DARK: '#0b0810',
  URUSHI_BG: '#16101c',
  GOLD_BORDER: '#b8860b',
  GOLD_LIGHT: '#ffd700',
  VERMILION: '#9e2a2b',
  VERMILION_BRIGHT: '#d63031',
  WHITE: '#ffffff',
  TEXT_LIGHT: '#f8f9fa',
  TEXT_MUTED: '#a0a0a0',
  HP_GREEN: '#2ecc71',
  MP_BLUE: '#3498db',
  EXP_GOLD: '#f1c40f'
};
