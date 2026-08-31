import { VIEW_W, VIEW_H, COLORS, FONTS } from '../core/Constants.js';
import { MASTER, isChapterUnlocked } from '../data/MasterData.js';
import { SaveManager } from '../data/SaveManager.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';
import { StatusUI } from './StatusUI.js';
import { ItemUI } from './ItemUI.js';
import { DialogUI } from './DialogUI.js';

/**
 * ポーズメニューUI (MenuUI) - 1280x960 最適化
 */
export class MenuUI {
  /**
   * @param {Object} options
   * @param {import('../data/GameState.js').GameState} options.state
   * @param {UIStack} options.uiStack
   * @param {AudioEngine} [options.audio]
   * @param {GraphicsEngine} [options.graphics]
   * @param {MapScene} options.mapScene
   */
  constructor({ state, uiStack, audio, graphics, mapScene }) {
    this.state = state;
    this.uiStack = uiStack;
    this.audio = audio;
    this.graphics = graphics;
    this.mapScene = mapScene;

    this.selectedIndex = 0;

    this.menuItems = [
      {
        label: '強さ（能力）',
        handler: () => {
          this.audio?.playDecide?.();
          this.uiStack.push(new StatusUI({
            state: this.state,
            audio: this.audio,
            graphics: this.graphics,
            onClose: () => this.uiStack.pop()
          }));
        }
      },
      {
        label: 'どうぐ',
        handler: () => {
          this.audio?.playDecide?.();
          this.uiStack.push(new ItemUI({
            state: this.state,
            party: this.state.party,
            uiStack: this.uiStack,
            audio: this.audio,
            isBattle: false,
            onUse: (item, partyIdx) => {
              this.useItemOnMap(item, partyIdx);
            },
            onCancel: () => {
              this.uiStack.pop();
            }
          }));
        }
      },
      {
        label: '章の移動',
        handler: () => {
          this.handleChapterMove();
        }
      },
      {
        label: '記録（セーブ）',
        handler: () => {
          this.uiStack.pop();
          this.mapScene.performSave();
        }
      },
      {
        label: 'とじる',
        handler: () => {
          this.audio?.playCancel?.();
          this.uiStack.pop();
        }
      }
    ];
  }

  useItemOnMap(item, partyIdx) {
    const target = this.state.party[partyIdx];
    if (!target) return;

    if (item.type === 'heal_hp') {
      if (target.hp >= target.maxHp) {
        this.audio?.playCancel?.();
        return;
      }
      item.count--;
      target.hp = Math.min(target.maxHp, target.hp + item.value);
      this.audio?.playHeal?.();
    } else if (item.type === 'heal_mp') {
      if (target.mp >= target.maxMp) {
        this.audio?.playCancel?.();
        return;
      }
      item.count--;
      target.mp = Math.min(target.maxMp, target.mp + item.value);
      this.audio?.playHeal?.();
    } else if (item.type === 'revive') {
      if (target.hp > 0) {
        this.audio?.playCancel?.();
        return;
      }
      item.count--;
      target.hp = Math.floor(target.maxHp * item.value);
      this.audio?.playHeal?.();
    }
  }

  handleChapterMove() {
    const cur = this.state.currentChapter;
    let nextChapter = (cur % 3) + 1;

    if (!isChapterUnlocked(nextChapter, this.state)) {
      this.audio?.playCancel?.();
      let hint = '';
      if (nextChapter === 2) {
        hint = '第一章の妖狐・茜を鎮めねば、霊峰白嶺へは進めない……！';
      } else if (nextChapter === 3) {
        hint = '酒呑童子を討伐し、鏡と勾玉を揃えねば羅生門は開かぬ……！';
      }
      this.uiStack.push(new DialogUI({
        speaker: '結界の拒絶',
        messages: [hint],
        onClose: () => this.uiStack.pop()
      }));
      return;
    }

    this.audio?.playDecide?.();
    this.uiStack.pop();
    const chapData = MASTER.chapters.find(c => c.id === nextChapter) || MASTER.chapters[0];
    this.mapScene.enter({
      chapterId: nextChapter,
      gridX: chapData.start.x,
      gridY: chapData.start.y,
      facing: chapData.start.facing
    });

    this.mapScene.uiStack.push(new DialogUI({
      speaker: '章の移動',
      messages: [`【 ${chapData.name} 】へ移動しました。`],
      onClose: () => this.mapScene.uiStack.pop()
    }));
  }

  update(input, frame) {
    if (input.isPressed('UP')) {
      this.selectedIndex = (this.selectedIndex - 1 + this.menuItems.length) % this.menuItems.length;
      this.audio?.playCursor?.();
    } else if (input.isPressed('DOWN')) {
      this.selectedIndex = (this.selectedIndex + 1) % this.menuItems.length;
      this.audio?.playCursor?.();
    }

    if (input.isPressed('CONFIRM')) {
      const item = this.menuItems[this.selectedIndex];
      item?.handler?.();
    } else if (input.isPressed('CANCEL')) {
      this.audio?.playCancel?.();
      this.uiStack.pop();
    }
  }

  handleTap(x, y) {
    const mx = 680;
    const my = 120;
    const mw = 550;
    const itemH = 84;

    for (let i = 0; i < this.menuItems.length; i++) {
      const iy = my + 60 + i * itemH;
      if (x >= mx && x <= mx + mw && y >= iy && y <= iy + itemH) {
        this.selectedIndex = i;
        this.menuItems[i].handler();
        return true;
      }
    }

    if (x < mx || y < my || y > my + 540) {
      this.audio?.playCancel?.();
      this.uiStack.pop();
      return true;
    }
    return false;
  }

  render(ctx, frame) {
    const mx = 680;
    const my = 120;
    const mw = 550;
    const mh = 520;

    UrushiFrame.draw(ctx, mx, my, mw, mh, '絵巻物手鑑（主献立）');

    ctx.save();
    this.menuItems.forEach((item, i) => {
      const isSelected = i === this.selectedIndex;
      const iy = my + 96 + i * 84;
      const col = isSelected ? COLORS.GOLD_LIGHT : COLORS.TEXT_LIGHT;

      this.game?.graphics?.drawCrispText?.(
        ctx,
        (isSelected ? '▶ ' : '  ') + item.label,
        mx + 40,
        iy,
        `bold 46px ${FONTS.MAIN}`,
        col,
        '#16101c',
        4
      );
    });
    ctx.restore();
  }
}
