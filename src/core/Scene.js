/**
 * シーン共通基底クラス
 */
export class Scene {
  constructor(game) {
    this.game = game;
  }

  /**
   * シーン開始時の初期化
   * @param {Object} params 
   */
  enter(params = {}) {}

  /**
   * シーン終了時のクリーンアップ
   */
  exit() {}

  /**
   * 毎フレームのロジック更新
   * @param {import('./InputManager.js').InputManager} input 
   * @param {number} frame 
   */
  update(input, frame) {}

  /**
   * 毎フレームの描画
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} frame 
   */
  render(ctx, frame) {}

  /**
   * キャンバス直接タップの処理（内部座標 0-1280, 0-960）
   * @param {number} x 
   * @param {number} y 
   */
  handleTap(x, y) {}
}
