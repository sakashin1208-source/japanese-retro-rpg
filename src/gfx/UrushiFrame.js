/**
 * 漆枠UI描画コンポーネント (UrushiFrame)
 * 1280x960 HD-2D 専用の高級感あふれる黒漆・金枠・朱色アクセント枠
 */
import { COLORS, FONTS } from '../core/Constants.js';

export class UrushiFrame {
  /**
   * 漆枠ウィンドウを描画
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} x 
   * @param {number} y 
   * @param {number} w 
   * @param {number} h 
   * @param {string} [title] 
   */
  static draw(ctx, x, y, w, h, title = null) {
    ctx.save();

    // 1. 背景（黒漆＋深いグラデーション）
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#1c1424');
    grad.addColorStop(1, '#0e0a14');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    // 2. 金外枠 (3.5px)
    ctx.strokeStyle = COLORS.GOLD_BORDER;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);

    // 3. 朱内枠 (1.5px)
    ctx.strokeStyle = COLORS.VERMILION;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 7, y + 7, w - 14, h - 14);

    // 4. 四隅の金飾り
    const cornerSize = 10;
    ctx.fillStyle = COLORS.GOLD_LIGHT;
    // 左上
    ctx.fillRect(x + 4, y + 4, cornerSize, 3);
    ctx.fillRect(x + 4, y + 4, 3, cornerSize);
    // 右上
    ctx.fillRect(x + w - 4 - cornerSize, y + 4, cornerSize, 3);
    ctx.fillRect(x + w - 7, y + 4, 3, cornerSize);
    // 左下
    ctx.fillRect(x + 4, y + h - 7, cornerSize, 3);
    ctx.fillRect(x + 4, y + h - 4 - cornerSize, 3, cornerSize);
    // 右下
    ctx.fillRect(x + w - 4 - cornerSize, y + h - 7, cornerSize, 3);
    ctx.fillRect(x + w - 7, y + h - 4 - cornerSize, 3, cornerSize);

    // 5. タイトルタブ
    if (title) {
      ctx.font = `bold 24px ${FONTS.MAIN}`;
      const textMetrics = ctx.measureText(title);
      const tabW = textMetrics.width + 44;
      const tabH = 38;
      const tabX = x + 28;
      const tabY = y - tabH / 2;

      ctx.fillStyle = COLORS.VERMILION;
      ctx.fillRect(tabX, tabY, tabW, tabH);
      ctx.strokeStyle = COLORS.GOLD_BORDER;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(tabX, tabY, tabW, tabH);

      ctx.fillStyle = COLORS.WHITE;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, tabX + tabW / 2, tabY + tabH / 2);
    }

    ctx.restore();
  }
}
