import { VIEW_W, VIEW_H, COLORS, FONTS } from '../core/Constants.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';

/**
 * 会話ダイアログUI (DialogUI) - 1280x960 最適化
 */
export class DialogUI {
  /**
   * @param {Object} options
   * @param {string} [options.speaker] 話者名
   * @param {string[]} options.messages メッセージ配列
   * @param {HTMLCanvasElement} [options.portrait] ポートレート画像
   * @param {Function} [options.onComplete] 終了時コールバック
   * @param {Function} [options.onCharSound] 文字送り時SEコールバック
   * @param {Function} [options.onClose] ダイアログ閉じる処理 (UIStack.pop等)
   */
  constructor({ speaker, messages, portrait, onComplete, onCharSound, onClose }) {
    this.speaker = speaker;
    this.messages = Array.isArray(messages) ? messages : [messages];
    this.portrait = portrait;
    this.onComplete = onComplete;
    this.onCharSound = onCharSound;
    this.onClose = onClose;

    this.pageIndex = 0;
    this.charIndex = 0;
    this.textTimer = 0;
    this.isPageComplete = false;
  }

  get currentText() {
    return this.messages[this.pageIndex] || '';
  }

  get displayedText() {
    return this.currentText.slice(0, this.charIndex);
  }

  update(input, frame) {
    if (!this.isPageComplete) {
      this.textTimer++;
      if (this.textTimer >= 1.5) {
        this.textTimer = 0;
        this.charIndex++;
        if (this.charIndex % 2 === 0 && this.onCharSound) {
          this.onCharSound();
        }
        if (this.charIndex >= this.currentText.length) {
          this.charIndex = this.currentText.length;
          this.isPageComplete = true;
        }
      }
    }

    if (input.isPressed('CONFIRM')) {
      this.advance();
    }
  }

  handleTap(x, y) {
    this.advance();
    return true;
  }

  advance() {
    if (!this.isPageComplete) {
      this.charIndex = this.currentText.length;
      this.isPageComplete = true;
    } else {
      this.pageIndex++;
      if (this.pageIndex < this.messages.length) {
        this.charIndex = 0;
        this.isPageComplete = false;
      } else {
        this.close();
      }
    }
  }

  close() {
    this.onClose?.();
    this.onComplete?.();
  }

  render(ctx, frame) {
    const wx = 36;
    const wy = 590;
    const ww = 1208;
    const wh = 338;

    // 漆枠描画
    UrushiFrame.draw(ctx, wx, wy, ww, wh, this.speaker);

    ctx.save();
    let textStartX = wx + 50;

    // ポートレート立ち絵描画 (192x192)
    if (this.portrait) {
      const px = wx + 32;
      const py = wy + 52;
      const pSize = 192;

      ctx.fillStyle = '#100c14';
      ctx.fillRect(px, py, pSize, pSize);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.portrait, 0, 0, this.portrait.width, this.portrait.height, px + 4, py + 4, pSize - 8, pSize - 8);
      ctx.strokeStyle = COLORS.GOLD_BORDER;
      ctx.lineWidth = 3;
      ctx.strokeRect(px, py, pSize, pSize);

      textStartX = wx + 256;
    }

    // 本文描画 (フチ取り付き・42px大文字)
    ctx.font = `bold 42px ${FONTS.MAIN}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const lines = this.displayedText.split('\n');
    lines.forEach((line, i) => {
      const ly = wy + 68 + i * 66;

      // フチ取り
      ctx.strokeStyle = '#0c0812';
      ctx.lineWidth = 4.5;
      ctx.strokeText(line, textStartX, ly);

      // 本文
      ctx.fillStyle = COLORS.TEXT_LIGHT;
      ctx.fillText(line, textStartX, ly);
    });

    // ページ送りインジケータ (点滅)
    if (this.isPageComplete) {
      const blink = Math.floor(frame / 20) % 2 === 0;
      if (blink) {
        ctx.font = `bold 32px ${FONTS.MAIN}`;
        ctx.fillStyle = COLORS.GOLD_LIGHT;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText('▼ (タップで進む)', wx + ww - 320, wy + wh - 48);
        ctx.fillText('▼ (タップで進む)', wx + ww - 320, wy + wh - 48);
      }
    }

    ctx.restore();
  }
}
