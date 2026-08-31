import { KEYMAP, VIEW_W, VIEW_H } from './Constants.js';

/**
 * 入力抽象化マネージャ
 */
export class InputManager {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {Function} onFirstInput 初回入力時のコールバック（Web Audio アンロック用）
   */
  constructor(canvas, onFirstInput) {
    this.canvas = canvas;
    this.onFirstInput = onFirstInput;
    this.firstInputFired = false;

    // 入力状態
    this.down = new Set();          // 押されている物理コード
    this.pressed = new Set();       // このフレームで押された物理コード
    this.logicalPressed = new Set(); // このフレームで押された論理キー
    this.logicalDown = new Set();    // 押されている論理キー
    this.tapQueue = [];             // キャンバス内部座標 [x, y] のキュー

    this.activeDpadDirection = null;

    this._bindKeyboard();
    this._bindCanvasTap();
    this._bindVirtualPad();
  }

  _triggerFirstInput() {
    if (!this.firstInputFired && typeof this.onFirstInput === 'function') {
      this.firstInputFired = true;
      this.onFirstInput();
    }
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      this._triggerFirstInput();
      if (!this.down.has(e.code)) {
        this.down.add(e.code);
        this.pressed.add(e.code);
      }
      // ゲーム操作キーのスクロール防止
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('keyup', (e) => {
      this.down.delete(e.code);
    }, { passive: true });
  }

  _bindCanvasTap() {
    const handleTapEvent = (clientX, clientY) => {
      this._triggerFirstInput();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = VIEW_W / rect.width;
      const scaleY = VIEW_H / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      if (x >= 0 && x <= VIEW_W && y >= 0 && y <= VIEW_H) {
        this.tapQueue.push({ x, y });
      }
    };

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        handleTapEvent(t.clientX, t.clientY);
      }
    }, { passive: false });

    this.canvas.addEventListener('mousedown', (e) => {
      handleTapEvent(e.clientX, e.clientY);
    }, { passive: true });
  }

  _bindVirtualPad() {
    const dpad = document.getElementById('dpad');
    const btnA = document.getElementById('btn-a');
    const btnB = document.getElementById('btn-b');

    // D-Pad スライド追従
    if (dpad) {
      const handleDpad = (e) => {
        e.preventDefault();
        this._triggerFirstInput();
        const touch = e.touches ? e.touches[0] : e;
        const rect = dpad.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const dist = Math.hypot(dx, dy);

        this._clearDpadDirections();

        if (dist > 12) { // デッドゾーン 12px
          let dir = null;
          if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? 'RIGHT' : 'LEFT';
          } else {
            dir = dy > 0 ? 'DOWN' : 'UP';
          }
          this._setLogicalKey(dir, true);
          this.activeDpadDirection = dir;
          this._highlightDpad(dir);
        }
      };

      const clearDpad = (e) => {
        if (e) e.preventDefault();
        this._clearDpadDirections();
      };

      dpad.addEventListener('touchstart', handleDpad, { passive: false });
      dpad.addEventListener('touchmove', handleDpad, { passive: false });
      dpad.addEventListener('touchend', clearDpad, { passive: false });
      dpad.addEventListener('touchcancel', clearDpad, { passive: false });

      dpad.addEventListener('mousedown', handleDpad);
      window.addEventListener('mouseup', () => {
        if (this.activeDpadDirection) clearDpad();
      });
    }

    // A/B ボタン
    const setupButton = (btn, logicalKey) => {
      if (!btn) return;
      const start = (e) => {
        e.preventDefault();
        this._triggerFirstInput();
        this._setLogicalKey(logicalKey, true);
        btn.classList.add('active');
      };
      const end = (e) => {
        if (e) e.preventDefault();
        this._setLogicalKey(logicalKey, false);
        btn.classList.remove('active');
      };

      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('touchcancel', end, { passive: false });
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
    };

    setupButton(btnA, 'CONFIRM');
    setupButton(btnB, 'CANCEL');
  }

  _clearDpadDirections() {
    ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(dir => {
      this._setLogicalKey(dir, false);
    });
    this.activeDpadDirection = null;
    const dpad = document.getElementById('dpad');
    if (dpad) {
      dpad.querySelectorAll('.dpad-btn').forEach(el => el.classList.remove('active'));
    }
  }

  _highlightDpad(dir) {
    const el = document.getElementById(`dpad-${dir.toLowerCase()}`);
    if (el) el.classList.add('active');
  }

  _setLogicalKey(logicalKey, isDown) {
    if (isDown) {
      if (!this.logicalDown.has(logicalKey)) {
        this.logicalPressed.add(logicalKey);
      }
      this.logicalDown.add(logicalKey);
    } else {
      this.logicalDown.delete(logicalKey);
    }
  }

  /**
   * 指定した論理キーが現在押されているか
   * @param {'UP'|'DOWN'|'LEFT'|'RIGHT'|'CONFIRM'|'CANCEL'} logicalKey 
   */
  isDown(logicalKey) {
    if (this.logicalDown.has(logicalKey)) return true;
    const codes = KEYMAP[logicalKey];
    if (codes) {
      for (const code of codes) {
        if (this.down.has(code)) return true;
      }
    }
    return false;
  }

  /**
   * 指定した論理キーがこのフレームで新たに押されたか
   * @param {'UP'|'DOWN'|'LEFT'|'RIGHT'|'CONFIRM'|'CANCEL'} logicalKey 
   */
  isPressed(logicalKey) {
    if (this.logicalPressed.has(logicalKey)) return true;
    const codes = KEYMAP[logicalKey];
    if (codes) {
      for (const code of codes) {
        if (this.pressed.has(code)) return true;
      }
    }
    return false;
  }

  /**
   * このフレームで発生した直接タップ座標の配列を取得してキューを空にする
   * @returns {Array<{x: number, y: number}>}
   */
  consumeTaps() {
    const taps = this.tapQueue;
    this.tapQueue = [];
    return taps;
  }

  /**
   * 各フレーム終了時に呼ぶ
   */
  endFrame() {
    this.pressed.clear();
    this.logicalPressed.clear();
  }
}
