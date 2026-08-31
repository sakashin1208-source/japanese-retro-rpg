/**
 * セーブデータ永続化マネージャ (SaveManager)
 */

export const SAVE_KEY_V2 = 'YOUGEN_KITAN_SAVEDATA_V2';
export const SAVE_KEY_V1 = 'YOUGEN_KITAN_SAVEDATA_V1';

export const SaveManager = {
  /**
   * セーブデータが存在するか確認
   */
  hasSaveData() {
    try {
      return !!localStorage.getItem(SAVE_KEY_V2) || !!localStorage.getItem(SAVE_KEY_V1);
    } catch (e) {
      console.warn('LocalStorage access failed:', e);
      return false;
    }
  },

  /**
   * 状態をセーブ
   * @param {import('./GameState.js').GameState} state 
   * @returns {boolean}
   */
  save(state) {
    try {
      const payload = {
        version: 2,
        ...state.toJSON()
      };
      localStorage.setItem(SAVE_KEY_V2, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  },

  /**
   * セーブデータをロードして state に反映
   * @param {import('./GameState.js').GameState} state 
   * @returns {boolean}
   */
  load(state) {
    try {
      let raw = localStorage.getItem(SAVE_KEY_V2);
      if (!raw) {
        // v1互換フォールバック
        raw = localStorage.getItem(SAVE_KEY_V1);
      }
      if (!raw) return false;

      const data = JSON.parse(raw);
      return state.loadJSON(data);
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  },

  /**
   * セーブデータ消去（デバッグ用）
   */
  clear() {
    try {
      localStorage.removeItem(SAVE_KEY_V2);
      localStorage.removeItem(SAVE_KEY_V1);
      return true;
    } catch (e) {
      console.error('Clear save failed:', e);
      return false;
    }
  }
};
