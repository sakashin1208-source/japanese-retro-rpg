import { VIEW_W, VIEW_H, COLORS, FONTS } from '../core/Constants.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';

/**
 * 対象選択UI (TargetSelectUI) - 1280x960 最適化
 */
export class TargetSelectUI {
  /**
   * @param {Object} options
   * @param {string} options.title
   * @param {'party' | 'enemy'} options.side
   * @param {Array} options.targets
   * @param {Function} options.onSelect (target) => void
   * @param {Function} options.onCancel () => void
   */
  constructor({ title, side, targets, onSelect, onCancel }) {
    this.title = title;
    this.side = side;
    this.targets = targets;
    this.onSelect = onSelect;
    this.onCancel = onCancel;

    this.selectedIndex = 0;
  }

  update(input, frame) {
    if (this.targets.length === 0) {
      this.onCancel?.();
      return;
    }

    if (input.isPressed('UP') || input.isPressed('LEFT')) {
      this.selectedIndex = (this.selectedIndex - 1 + this.targets.length) % this.targets.length;
    } else if (input.isPressed('DOWN') || input.isPressed('RIGHT')) {
      this.selectedIndex = (this.selectedIndex + 1) % this.targets.length;
    }

    if (input.isPressed('CONFIRM')) {
      const target = this.targets[this.selectedIndex];
      if (target) {
        this.onSelect?.(target);
      }
    } else if (input.isPressed('CANCEL')) {
      this.onCancel?.();
    }
  }

  handleTap(x, y) {
    const wx = 804;
    const wy = 580;
    const itemH = 68;

    for (let i = 0; i < this.targets.length; i++) {
      const iy = wy + 60 + i * itemH;
      if (x >= wx && x <= wx + 452 && y >= iy && y <= iy + itemH) {
        this.selectedIndex = i;
        this.onSelect?.(this.targets[i]);
        return true;
      }
    }
    return false;
  }

  render(ctx, frame) {
    const wx = 804;
    const wy = 580;
    const ww = 452;
    const wh = 360;

    UrushiFrame.draw(ctx, wx, wy, ww, wh, this.title);

    ctx.save();
    this.targets.forEach((target, i) => {
      const isSelected = i === this.selectedIndex;
      const iy = wy + 68 + i * 68;
      const col = isSelected ? COLORS.GOLD_LIGHT : COLORS.TEXT_LIGHT;

      const name = target.name || (target.job ? target.name : '対象');
      const hpStr = target.hp !== undefined ? ` (HP:${target.hp})` : '';

      ctx.font = `bold 38px ${FONTS.MAIN}`;
      ctx.strokeStyle = '#16101c';
      ctx.lineWidth = 3.5;
      ctx.lineJoin = 'round';
      ctx.strokeText((isSelected ? '▶ ' : '  ') + name + hpStr, wx + 36, iy);
      ctx.fillStyle = col;
      ctx.fillText((isSelected ? '▶ ' : '  ') + name + hpStr, wx + 36, iy);
    });

    ctx.font = `24px ${FONTS.MAIN}`;
    ctx.fillStyle = COLORS.TEXT_MUTED;
    ctx.fillText('【上下で選択 / 決定】', wx + 40, wy + wh - 24);
    ctx.restore();
  }
}
