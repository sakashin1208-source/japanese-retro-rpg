import { Scene } from '../core/Scene.js';
import { VIEW_W, VIEW_H, COLORS, FONTS } from '../core/Constants.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';

/**
 * オープニングシーン (OpeningScene) - 四幕シネマティック
 */
export class OpeningScene extends Scene {
  constructor(game) {
    super(game);
    this.timer = 0;
    this.currentAct = 0;
    this.isSkipped = false;

    this.acts = [
      { name: 'prologue_moon', duration: 320 },
      { name: 'akane_awaken', duration: 360 },
      { name: 'heroes_assemble', duration: 360 },
      { name: 'title_drop', duration: 320 }
    ];

    this.particles = [];
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * VIEW_W,
        y: Math.random() * VIEW_H,
        vx: (Math.random() - 0.5) * 2,
        vy: 1.2 + Math.random() * 2.5,
        size: 4 + Math.random() * 4,
        color: ['#ffb7c5', '#ffccd5', '#ffffff', '#ffd700'][Math.floor(Math.random() * 4)],
        angle: Math.random() * Math.PI * 2
      });
    }
  }

  enter() {
    this.timer = 0;
    this.currentAct = 0;
    this.isSkipped = false;
    this.game.audio?.playBgm?.('opening');
  }

  update(input, frame) {
    if (input.isPressed('CONFIRM') || input.isPressed('CANCEL')) {
      this.skip();
      return;
    }

    this.timer++;
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += 0.04;
      if (p.y > VIEW_H) p.y = -10;
      if (p.x > VIEW_W) p.x = -10;
      if (p.x < -10) p.x = VIEW_W;
    });

    let accumulatedTime = 0;
    for (let i = 0; i < this.acts.length; i++) {
      accumulatedTime += this.acts[i].duration;
      if (this.timer < accumulatedTime) {
        if (this.currentAct !== i) {
          this.currentAct = i;
          if (i === 1) this.game.audio?.playTone?.(110, 0.8, 'sawtooth', 0, this.game.audio?.seGain, 0.05, 0.3);
          if (i === 2) this.game.audio?.playSlash?.();
          if (i === 3) this.game.audio?.playSave?.();
        }
        return;
      }
    }

    this.finish();
  }

  handleTap(x, y) {
    this.skip();
    return true;
  }

  skip() {
    if (this.isSkipped) return;
    this.isSkipped = true;
    this.finish();
  }

  finish() {
    this.game.changeScene('TITLE');
  }

  render(ctx, frame) {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);

    if (this.currentAct === 0) {
      this.renderAct1Moon(ctx);
    } else if (this.currentAct === 1) {
      this.renderAct2Akane(ctx);
    } else if (this.currentAct === 2) {
      this.renderAct3Heroes(ctx);
    } else {
      this.renderAct4Title(ctx);
    }

    // パーティクル描画
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    // スキップ案内 (点滅)
    if (Math.floor(Date.now() / 400) % 2 === 0) {
      this.game.graphics?.drawCrispText(ctx, '【 画面タップ / 決定キー でスキップ 】', VIEW_W / 2, 920, `bold 24px ${FONTS.MAIN}`, '#ffffff', '#000', 3, 'center');
    }
  }

  renderAct1Moon(ctx) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    skyGrad.addColorStop(0, '#06000e');
    skyGrad.addColorStop(0.6, '#180422');
    skyGrad.addColorStop(1, '#3a0c28');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const eclipseGrad = ctx.createRadialGradient(640, 360, 20, 640, 360, 160);
    eclipseGrad.addColorStop(0, '#ff2222');
    eclipseGrad.addColorStop(0.7, '#880000');
    eclipseGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = eclipseGrad;
    ctx.beginPath();
    ctx.arc(640, 360, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#06000e';
    ctx.beginPath();
    ctx.arc(620, 350, 150, 0, Math.PI * 2);
    ctx.fill();

    this.game.graphics?.drawCrispText(ctx, '千年の時を超え、皆既月蝕の夜が訪れる……', VIEW_W / 2, 680, `bold 36px ${FONTS.MAIN}`, '#fce4ce', '#000', 4, 'center');
    this.game.graphics?.drawCrispText(ctx, '常夜の門の封印が解かれ、妖魔が目覚めんとしていた。', VIEW_W / 2, 760, `bold 30px ${FONTS.MAIN}`, '#ff8888', '#000', 4, 'center');
  }

  renderAct2Akane(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    bgGrad.addColorStop(0, '#100018');
    bgGrad.addColorStop(0.5, '#400820');
    bgGrad.addColorStop(1, '#180010');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const youko = this.game.graphics?.sprites?.['boss_shin_youko'];
    if (youko) {
      const yw = 192 * 2.2;
      const yh = 192 * 2.2;
      ctx.drawImage(youko, 640 - yw / 2, 400 - yh / 2, yw, yh);
    }

    this.game.graphics?.drawCrispText(ctx, '「人は我が一族を裏切った……許しはせぬ……」', VIEW_W / 2, 720, `bold 38px ${FONTS.MAIN}`, '#ffd700', '#000', 4, 'center');
    this.game.graphics?.drawCrispText(ctx, '大妖狐・茜の怨嗟の焔が、大地を紅く染め上げる。', VIEW_W / 2, 800, `bold 30px ${FONTS.MAIN}`, '#ff4444', '#000', 4, 'center');
  }

  renderAct3Heroes(ctx) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    bgGrad.addColorStop(0, '#0a1020');
    bgGrad.addColorStop(0.5, '#162848');
    bgGrad.addColorStop(1, '#2c4060');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const samurai = this.game.graphics?.sprites?.['samurai_battle_idle'];
    const miko = this.game.graphics?.sprites?.['miko_battle_idle'];
    const ninja = this.game.graphics?.sprites?.['ninja_battle_idle'];

    if (samurai) ctx.drawImage(samurai, 280, 320, 192, 192);
    if (miko) ctx.drawImage(miko, 544, 280, 192, 192);
    if (ninja) ctx.drawImage(ninja, 808, 320, 192, 192);

    this.game.graphics?.drawCrispText(ctx, '立ち向かうは、運命に導かれし三人の英傑。', VIEW_W / 2, 680, `bold 36px ${FONTS.MAIN}`, '#ffeed0', '#000', 4, 'center');
    this.game.graphics?.drawCrispText(ctx, '疾風、小夜、朧——いま、もののけ草子の幕が開く！', VIEW_W / 2, 760, `bold 30px ${FONTS.MAIN}`, '#ffd666', '#000', 4, 'center');
  }

  renderAct4Title(ctx) {
    this.game.graphics?.drawCrispText(ctx, '妖  幻  奇  譚', VIEW_W / 2, 300, `bold 72px ${FONTS.TITLE}`, '#ffeed0', '#3b0d11', 6, 'center');
    this.game.graphics?.drawCrispText(ctx, '〜 もののけ草子 〜 【全三章完結 ハイレゾHD-2D】', VIEW_W / 2, 390, `bold 36px ${FONTS.MAIN}`, '#f09199', '#000', 4, 'center');
    this.game.graphics?.drawCrispText(ctx, '【 画面タップ / 決定キー でタイトルへ 】', VIEW_W / 2, 720, `bold 32px ${FONTS.MAIN}`, '#ffd666', '#000', 4, 'center');
  }
}
