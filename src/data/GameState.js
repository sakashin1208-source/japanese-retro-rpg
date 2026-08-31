import { MASTER } from './MasterData.js';

/**
 * 実行時可変ゲーム状態 (GameState)
 */
export class GameState {
  constructor() {
    this.reset();
  }

  /**
   * 初期状態に完全リセット
   */
  reset() {
    this.party = MASTER.characters.map(c => JSON.parse(JSON.stringify(c)));
    this.items = MASTER.items.map(i => JSON.parse(JSON.stringify(i)));
    this.money = 0;
    this.currentChapter = 1;
    this.bossDefeated = {
      akaoni: false,
      tengu: false,
      youko: false,
      hyoka: false,
      mizuchi: false,
      shuten: false,
      ibaraki: false,
      musokage: false,
      shin_youko: false
    };
    this.artifacts = {
      mirror: false,
      magatama: false,
      sword: false
    };
    this.player = {
      gridX: 12,
      gridY: 14,
      facing: 'down'
    };
  }

  /**
   * セーブ用プレーンオブジェクトを生成
   */
  toJSON() {
    return {
      savedAt: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      currentChapter: this.currentChapter,
      money: this.money,
      party: this.party,
      items: this.items,
      bossDefeated: this.bossDefeated,
      artifacts: this.artifacts,
      player: this.player
    };
  }

  /**
   * セーブデータから状態を復元（検証付き）
   * @param {Object} data 
   */
  loadJSON(data) {
    if (!data) return false;

    if (typeof data.currentChapter === 'number') this.currentChapter = data.currentChapter;
    if (typeof data.money === 'number') this.money = data.money;

    if (Array.isArray(data.party)) {
      this.party = data.party.map((p, idx) => {
        const masterChar = MASTER.characters[idx] || MASTER.characters[0];
        return {
          ...JSON.parse(JSON.stringify(masterChar)),
          ...p
        };
      });
    }

    if (Array.isArray(data.items)) {
      this.items = data.items.map((it, idx) => {
        const masterItem = MASTER.items[idx] || MASTER.items[0];
        return {
          ...JSON.parse(JSON.stringify(masterItem)),
          ...it
        };
      });
    }

    if (data.bossDefeated && typeof data.bossDefeated === 'object') {
      this.bossDefeated = { ...this.bossDefeated, ...data.bossDefeated };
    }

    if (data.artifacts && typeof data.artifacts === 'object') {
      this.artifacts = { ...this.artifacts, ...data.artifacts };
    }

    if (data.player && typeof data.player === 'object') {
      this.player = {
        gridX: data.player.gridX ?? 12,
        gridY: data.player.gridY ?? 14,
        facing: data.player.facing ?? 'down'
      };
    }

    return true;
  }
}
