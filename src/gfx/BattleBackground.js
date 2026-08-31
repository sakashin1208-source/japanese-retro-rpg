/**
 * 戦闘背景描画マネージャ (オフスクリーンキャッシュ対応)
 */
import { VIEW_W, VIEW_H } from '../core/Constants.js';

export class BattleBackground {
  constructor() {
    this.cachedBackgrounds = {};
  }

  /**
   * 指定した背景タイプのオフスクリーンCanvasを取得または生成して描画
   * @param {CanvasRenderingContext2D} ctx 
   * @param {'night'|'snow'|'lake'|'tokoyo'} bgType 
   */
  draw(ctx, bgType = 'night') {
    if (!this.cachedBackgrounds[bgType]) {
      this.cachedBackgrounds[bgType] = this._createCachedBackground(bgType);
    }
    ctx.drawImage(this.cachedBackgrounds[bgType], 0, 0, VIEW_W, VIEW_H);
  }

  _createCachedBackground(bgType) {
    const c = document.createElement('canvas');
    c.width = VIEW_W;
    c.height = VIEW_H;
    const ctx = c.getContext('2d');

    if (bgType === 'snow') {
      const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grad.addColorStop(0, '#101e30');
      grad.addColorStop(0.55, '#1e3852');
      grad.addColorStop(0.56, '#486e88');
      grad.addColorStop(0.7, '#d8eaf5');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 150; i++) {
        const x = (i * 73) % VIEW_W;
        const y = (i * 37) % (VIEW_H * 0.7);
        const r = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (bgType === 'lake') {
      const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grad.addColorStop(0, '#041220');
      grad.addColorStop(0.4, '#08253a');
      grad.addColorStop(0.7, '#0f4058');
      grad.addColorStop(1, '#1b5b75');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.fillStyle = 'rgba(100, 220, 255, 0.15)';
      for (let i = 0; i < 40; i++) {
        const x = (i * 89) % VIEW_W;
        const y = (i * 53) % VIEW_H;
        const r = (i % 6) + 3;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (bgType === 'tokoyo') {
      const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grad.addColorStop(0, '#150020');
      grad.addColorStop(0.55, '#2e0840');
      grad.addColorStop(0.56, '#1a0428');
      grad.addColorStop(1, '#08010d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      const moonGrad = ctx.createRadialGradient(VIEW_W * 0.75, 180, 20, VIEW_W * 0.75, 180, 140);
      moonGrad.addColorStop(0, '#ff3366');
      moonGrad.addColorStop(0.6, '#aa0033');
      moonGrad.addColorStop(1, 'rgba(170, 0, 51, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(VIEW_W * 0.75, 180, 140, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // night (デフォルト)
      const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grad.addColorStop(0, '#080612');
      grad.addColorStop(0.55, '#18122c');
      grad.addColorStop(0.56, '#100b1e');
      grad.addColorStop(0.75, '#221838');
      grad.addColorStop(1, '#0e0918');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.fillStyle = 'rgba(255, 255, 230, 0.9)';
      for (let i = 0; i < 80; i++) {
        const x = (i * 97) % VIEW_W;
        const y = (i * 43) % (VIEW_H * 0.55);
        const r = (i % 2 === 0) ? 1.5 : 1.0;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      const moonGrad = ctx.createRadialGradient(VIEW_W * 0.8, 140, 20, VIEW_W * 0.8, 140, 90);
      moonGrad.addColorStop(0, '#fffbe6');
      moonGrad.addColorStop(0.5, '#f0d060');
      moonGrad.addColorStop(1, 'rgba(240, 208, 96, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(VIEW_W * 0.8, 140, 90, 0, Math.PI * 2);
      ctx.fill();
    }

    return c;
  }
}
