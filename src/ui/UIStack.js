/**
 * スタック型UIマネージャ (UIStack)
 * 排他的なUI画面（メニュー、ダイアログ、選択画面等）をスタックで管理
 */
export class UIStack {
  constructor() {
    this.stack = [];
  }

  /**
   * UI画面を上に積む
   * @param {Object} ui 
   */
  push(ui) {
    ui.onPush?.();
    this.stack.push(ui);
  }

  /**
   * 最前面のUI画面を取り除く
   * @returns {Object|null}
   */
  pop() {
    const ui = this.stack.pop();
    ui?.onPop?.();
    return ui ?? null;
  }

  /**
   * スタックを全クリア
   */
  clear() {
    while (this.stack.length > 0) {
      this.pop();
    }
  }

  /**
   * 最前面のUIを取得
   */
  get top() {
    return this.stack[this.stack.length - 1] ?? null;
  }

  /**
   * UIが存在するか
   */
  get isEmpty() {
    return this.stack.length === 0;
  }

  /**
   * 最前面UIの更新
   * @param {import('../core/InputManager.js').InputManager} input 
   * @param {number} frame 
   */
  update(input, frame) {
    if (this.top) {
      this.top.update(input, frame);
    }
  }

  /**
   * タップを最前面UIへ配送
   * @param {number} x 
   * @param {number} y 
   * @returns {boolean} タップを消費したか
   */
  handleTap(x, y) {
    if (this.top && typeof this.top.handleTap === 'function') {
      return this.top.handleTap(x, y) !== false;
    }
    return false;
  }

  /**
   * 積まれている全UIを下から順に描画
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} frame 
   */
  render(ctx, frame) {
    for (const ui of this.stack) {
      ui.render(ctx, frame);
    }
  }
}
