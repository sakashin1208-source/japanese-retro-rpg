import { VIEW_W, VIEW_H, COLORS, FONTS } from '../core/Constants.js';
import { MASTER } from '../data/MasterData.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';
import { TargetSelectUI } from './TargetSelectUI.js';

/**
 * 道具一覧・使用UI (ItemUI) - 1280x960 最適化
 */
export class ItemUI {
  /**
   * @param {Object} options
   * @param {import('../data/GameState.js').GameState} options.state
   * @param {Array} options.party
   * @param {UIStack} options.uiStack
   * @param {AudioEngine} [options.audio]
   * @param {boolean} [options.isBattle]
   * @param {Function} [options.onUse] (item, targetIdx) => void
   * @param {Function} [options.onCancel]
   */
  constructor({ state, party, uiStack, audio, isBattle = false, onUse, onCancel }) {
    this.state = state;
    this.party = party;
    this.uiStack = uiStack;
    this.audio = audio;
    this.isBattle = isBattle;
    this.onUse = onUse;
    this.onCancel = onCancel;

    this.selectedIndex = 0;
    this.items = this.state.items || [];
  }

  update(input, frame) {
    const totalOptions = this.items.length + 1; // アイテム一覧 + 「もどる」

    if (input.isPressed('UP')) {
      this.selectedIndex = (this.selectedIndex - 1 + totalOptions) % totalOptions;
      this.audio?.playCursor?.();
    } else if (input.isPressed('DOWN')) {
      this.selectedIndex = (this.selectedIndex + 1) % totalOptions;
      this.audio?.playCursor?.();
    }

    if (input.isPressed('CONFIRM')) {
      if (this.selectedIndex === this.items.length) {
        // もどる
        this.audio?.playCancel?.();
        this.onCancel?.();
        return;
      }

      const item = this.items[this.selectedIndex];
      if (!item || item.count <= 0) {
        this.audio?.playCancel?.();
        return;
      }

      this.audio?.playDecide?.();

      if (item.type === 'revive') {
        const deadParty = this.party.filter(p => p.hp <= 0);
        if (deadParty.length === 0) {
          this.audio?.playCancel?.();
          return;
        }
        this.uiStack.push(new TargetSelectUI({
          title: `${item.name}の対象（蘇生）`,
          side: 'party',
          targets: deadParty,
          onSelect: (target) => {
            this.uiStack.pop();
            const partyIdx = this.party.indexOf(target);
            this.onUse?.(item, partyIdx);
          },
          onCancel: () => {
            this.uiStack.pop();
            this.audio?.playCancel?.();
          }
        }));
      } else {
        const aliveParty = this.party.filter(p => p.hp > 0);
        this.uiStack.push(new TargetSelectUI({
          title: `${item.name}の対象`,
          side: 'party',
          targets: aliveParty,
          onSelect: (target) => {
            this.uiStack.pop();
            const partyIdx = this.party.indexOf(target);
            this.onUse?.(item, partyIdx);
          },
          onCancel: () => {
            this.uiStack.pop();
            this.audio?.playCancel?.();
          }
        }));
      }
    } else if (input.isPressed('CANCEL')) {
      this.audio?.playCancel?.();
      this.onCancel?.();
    }
  }

  selectCurrentItem() {
    this.update({ isPressed: (k) => k === 'CONFIRM', isDown: () => false }, 0);
  }

  handleTap(x, y) {
    const ix = 320;
    const iy = 120;
    const iw = 880;
    const ih = 720;

    if (x >= ix && x <= ix + iw && y >= iy && y <= iy + ih) {
      const idx = Math.floor((y - (iy + 130)) / 80);
      if (idx >= 0 && idx < this.items.length) {
        this.selectedIndex = idx;
        const item = this.items[idx];
        if (item && item.count > 0) {
          this.update({ isPressed: (k) => k === 'CONFIRM' }, 0);
        }
        return true;
      } else if (idx === this.items.length || y > iy + ih - 80) {
        this.audio?.playCancel?.();
        this.onCancel?.();
        return true;
      }
    }
    return false;
  }

  render(ctx, frame) {
    const ix = 320;
    const iy = 120;
    const iw = 880;
    const ih = 720;

    UrushiFrame.draw(ctx, ix, iy, iw, ih, this.isBattle ? 'どうぐ選択' : '所持品・道具使用');

    ctx.save();
    // 所持金
    this.drawCrispText(ctx, `【 所持金 】: ${this.state.money || 0} 文`, ix + 48, iy + 72, `bold 28px ${FONTS.MAIN}`, COLORS.GOLD_LIGHT);

    // アイテム一覧
    this.items.forEach((item, idx) => {
      const isSel = this.selectedIndex === idx;
      const col = isSel ? COLORS.GOLD_LIGHT : (item.count > 0 ? COLORS.TEXT_LIGHT : COLORS.TEXT_MUTED);
      const text = `${isSel ? '▶ ' : '  '}${item.name}  x${item.count}  (${item.desc})`;
      this.drawCrispText(ctx, text, ix + 48, iy + 140 + idx * 80, `bold 26px ${FONTS.MAIN}`, col);
    });

    // 「もどる」
    const isBackSel = this.selectedIndex === this.items.length;
    const backCol = isBackSel ? COLORS.GOLD_LIGHT : COLORS.TEXT_MUTED;
    this.drawCrispText(ctx, `${isBackSel ? '▶ ' : '  '}もどる`, ix + 48, iy + 140 + this.items.length * 80, `bold 26px ${FONTS.MAIN}`, backCol);

    // 三神具の封印解除状況 (非戦闘時のみ)
    if (!this.isBattle) {
      ctx.fillStyle = '#18121f';
      ctx.fillRect(ix + 40, iy + 470, iw - 80, 180);
      ctx.strokeStyle = COLORS.VERMILION;
      ctx.lineWidth = 2;
      ctx.strokeRect(ix + 40, iy + 470, iw - 80, 180);

      const artifacts = this.state.artifacts || {};
      this.drawCrispText(ctx, '【 三 神 具 の 封 印 解 除 】', ix + 56, iy + 510, `bold 24px ${FONTS.MAIN}`, COLORS.GOLD_LIGHT);
      this.drawCrispText(ctx, `・八咫の鏡: ${artifacts.mirror ? '所持（霊峰白嶺の光）' : '未所持'}`, ix + 56, iy + 550, `22px ${FONTS.MAIN}`, artifacts.mirror ? COLORS.WHITE : COLORS.TEXT_MUTED);
      this.drawCrispText(ctx, `・八尺瓊勾玉: ${artifacts.magatama ? '所持（湖底神殿の加護）' : '未所持'}`, ix + 56, iy + 590, `22px ${FONTS.MAIN}`, artifacts.magatama ? COLORS.WHITE : COLORS.TEXT_MUTED);
      this.drawCrispText(ctx, `・草薙の剣: ${artifacts.sword ? '所持（師・無双影の魂）' : '未所持'}`, ix + 56, iy + 630, `22px ${FONTS.MAIN}`, artifacts.sword ? COLORS.WHITE : COLORS.TEXT_MUTED);
    }

    this.drawCrispText(ctx, '【 決定/タップ: 使う | 取消: 戻る 】', ix + 240, iy + ih - 24, `22px ${FONTS.MAIN}`, COLORS.TEXT_MUTED);
    ctx.restore();
  }

  drawCrispText(ctx, text, x, y, fontStr, color = '#ffffff') {
    ctx.font = fontStr;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeStyle = '#16101c';
    ctx.lineWidth = 3.5;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
}
