/**
 * ==========================================================================
 * 妖幻奇譚 〜もののけ草子〜 セーブ＆ロードマネージャー
 * LocalStorage を用いたゲーム進行状態・成長・章進捗の完全永続化エンジン
 * ==========================================================================
 */

class SaveManager {
  static STORAGE_KEY = 'YOUGEN_KITAN_SAVEDATA_V1';

  // セーブデータが存在するか確認
  static hasSaveData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data !== null;
    } catch (e) {
      return false;
    }
  }

  // セーブデータの要約情報を取得（タイトル表示用）
  static getSaveSummary() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        timestamp: data.savedAt || '',
        chapter: data.currentChapter || 1,
        leaderLevel: data.party && data.party[0] ? data.party[0].level : 1,
        money: data.money || 0
      };
    } catch (e) {
      return null;
    }
  }

  // ゲーム状態をセーブ
  static saveGame(game) {
    try {
      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const saveData = {
        savedAt: dateStr,
        currentChapter: game.map.currentChapter || 1,
        money: GAME_DATA.money || 0,
        party: GAME_DATA.party,
        items: GAME_DATA.items,
        bossDefeated: game.map.bossDefeated,
        artifactsObtained: game.map.artifactsObtained,
        player: {
          gridX: game.map.player.gridX,
          gridY: game.map.player.gridY,
          facing: game.map.player.facing
        }
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  // ゲーム状態をロード
  static loadGame(game) {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);

      // 1. 章マップの復元
      const chapter = data.currentChapter || 1;
      game.map.loadChapterMap(chapter);

      // 2. ボス撃破フラグ・三神具フラグの復元
      if (data.bossDefeated) {
        Object.assign(game.map.bossDefeated, data.bossDefeated);
      }
      if (data.artifactsObtained) {
        Object.assign(game.map.artifactsObtained, data.artifactsObtained);
      }

      // 3. 所持金の復元
      GAME_DATA.money = data.money || 0;

      // 4. パーティデータ（Lv、HP、MP、EXP、習得スキル）の完全復元
      if (data.party && Array.isArray(data.party)) {
        data.party.forEach((savedMember, idx) => {
          if (GAME_DATA.party[idx]) {
            Object.assign(GAME_DATA.party[idx], savedMember);
          }
        });
      }

      // 5. アイテム所持数の復元
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((savedItem, idx) => {
          if (GAME_DATA.items[idx]) {
            GAME_DATA.items[idx].count = savedItem.count;
          }
        });
      }

      // 6. プレイヤー座標の復元
      if (data.player) {
        game.map.player.gridX = data.player.gridX;
        game.map.player.gridY = data.player.gridY;
        game.map.player.x = data.player.gridX * game.map.tileSize;
        game.map.player.y = data.player.gridY * game.map.tileSize;
        game.map.player.targetX = game.map.player.x;
        game.map.player.targetY = game.map.player.y;
        game.map.player.facing = data.player.facing || 'down';
        game.map.player.isMoving = false;
      }

      return true;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  }

  // セーブデータを消去
  static clearSaveData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }
}
