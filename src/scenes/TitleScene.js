import { Scene } from '../core/Scene.js';
import { VIEW_W, VIEW_H, COLORS, FONTS } from '../core/Constants.js';
import { SaveManager } from '../data/SaveManager.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';

/**
 * タイトルシーン (TitleScene)
 */
export class TitleScene extends Scene {
  constructor(game) {
    super(game);
    this.selectedIndex = 0;
    this.idleTimer = 0;
    this.hasSave = false;

    this.petals = [];
    for (let i = 0; i < 50; i++) {
      this.petals.push({
        x: Math.random() * VIEW_W,
        y: Math.random() * VIEW_H,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.0 + Math.random() * 2.0,
        size: 5 + Math.random() * 5,
        color: ['#ffb7c5', '#ffccd5', '#ffffff'][Math.floor(Math.random() * 3)]
      });
    }
  }

  enter() {
    this.hasSave = SaveManager.hasSaveData();
    this.selectedIndex = this.hasSave ? 1 : 0; // セーブデータがあれば「つづきから」
    this.idleTimer = 0;
    this.game.audio?.playBgm?.('title');
  }

  get menuItems() {
    return [
      { label: 'はじめから', enabled: true },
      { label: this.hasSave ? 'つづきから' : 'つづきから (無)', enabled: this.hasSave },
      { label: '序幕（オープニング）', enabled: true },
      { label: '終幕（エンディング）', enabled: true }
    ];
  }

  update(input, frame) {
    this.idleTimer++;
    if (this.idleTimer >= 1200) {
      // 20秒無操作でアトラクトモード (オープニングへ)
      this.game.changeScene('OPENING');
      return;
    }

    // 桜吹雪移動
    this.petals.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y > VIEW_H) p.y = -10;
      if (p.x > VIEW_W) p.x = -10;
      if (p.x < -10) p.x = VIEW_W;
    });

    const items = this.menuItems;
    if (input.isPressed('UP')) {
      this.idleTimer = 0;
      do {
        this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
      } while (!items[this.selectedIndex].enabled);
      this.game.audio?.playCursor?.();
    } else if (input.isPressed('DOWN')) {
      this.idleTimer = 0;
      do {
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
      } while (!items[this.selectedIndex].enabled);
      this.game.audio?.playCursor?.();
    }

    if (input.isPressed('CONFIRM')) {
      this.idleTimer = 0;
      this.executeMenu(this.selectedIndex);
    }
  }

  executeMenu(index) {
    if (index === 0) {
      // はじめから
      this.game.audio?.playDecide?.();
      this.game.state.reset();
      this.game.changeScene('MAP', { chapterId: 1 });
    } else if (index === 1 && this.hasSave) {
      // つづきから
      this.game.audio?.playDecide?.();
      const ok = SaveManager.load(this.game.state);
      if (ok) {
        this.game.changeScene('MAP', {
          chapterId: this.game.state.currentChapter,
          gridX: this.game.state.player?.gridX,
          gridY: this.game.state.player?.gridY,
          facing: this.game.state.player?.facing
        });
      } else {
        this.game.state.reset();
        this.game.changeScene('MAP', { chapterId: 1 });
      }
    } else if (index === 2) {
      // 序幕
      this.game.audio?.playDecide?.();
      this.game.changeScene('OPENING');
    } else if (index === 3) {
      // 終幕
      this.game.audio?.playDecide?.();
      this.game.changeScene('ENDING');
    }
  }

  handleTap(x, y) {
    this.idleTimer = 0;
    // メニュー項目タップ判定
    const boxX = 420;
    const boxY = 560;
    const itemH = 68;

    for (let i = 0; i < this.menuItems.length; i++) {
      const iy = boxY + i * itemH;
      if (x >= boxX && x <= boxX + 440 && y >= iy && y <= iy + itemH) {
        if (this.menuItems[i].enabled) {
          this.selectedIndex = i;
          this.executeMenu(i);
          return true;
        }
      }
    }
    return false;
  }

  render(ctx, frame) {
    // 背景 (満月の夜空)
    this.game.graphics?.drawBattleBackground?.(ctx, VIEW_W, VIEW_H, 'night');

    // 桜吹雪描画
    this.petals.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    // 3キャラ立ち絵
    const samurai = this.game.graphics?.sprites?.['samurai_battle_idle'];
    const miko = this.game.graphics?.sprites?.['miko_battle_idle'];
    const ninja = this.game.graphics?.sprites?.['ninja_battle_idle'];

    if (samurai) ctx.drawImage(samurai, 160, 360, 160, 160);
    if (miko) ctx.drawImage(miko, 560, 330, 160, 160);
    if (ninja) ctx.drawImage(ninja, 960, 360, 160, 160);

    // タイトルロゴ漆枠
    UrushiFrame.draw(ctx, 240, 100, 800, 220);
    this.game.graphics?.drawCrispText(ctx, '妖  幻  奇  譚', VIEW_W / 2, 200, `bold 64px ${FONTS.TITLE}`, '#ffeed0', '#3b0d11', 6, 'center');
    this.game.graphics?.drawCrispText(ctx, '〜 もののけ草子 〜', VIEW_W / 2, 270, `bold 32px ${FONTS.MAIN}`, '#f09199', '#000', 4, 'center');

    // メニューウィンドウ
    UrushiFrame.draw(ctx, 400, 540, 480, 320);

    ctx.save();
    ctx.font = `bold 24px ${FONTS.MAIN}`;
    ctx.textBaseline = 'middle';

    this.menuItems.forEach((item, i) => {
      const isSelected = i === this.selectedIndex;
      const iy = 590 + i * 65;

      if (isSelected) {
        ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
        ctx.fillRect(420, iy - 22, 440, 44);
        ctx.fillStyle = COLORS.GOLD_LIGHT;
        ctx.fillText('▶', 435, iy);
      }

      ctx.fillStyle = item.enabled ? (isSelected ? COLORS.GOLD_LIGHT : COLORS.TEXT_LIGHT) : COLORS.TEXT_MUTED;
      ctx.fillText(item.label, 475, iy);
    });

    ctx.restore();
  }
}
