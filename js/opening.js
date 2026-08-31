/**
 * ==========================================================================
 * 妖幻奇譚 〜もののけ草子〜 オープニング演出エンジン (1280x960 ハイレゾHD-2D版)
 * ==========================================================================
 */

class OpeningManager {
  constructor(game) {
    this.game = game;
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
        x: Math.random() * 1280,
        y: Math.random() * 960,
        vx: (Math.random() - 0.5) * 2,
        vy: 1.2 + Math.random() * 2.5,
        size: 4 + Math.random() * 4,
        color: ['#ffb7c5', '#ffccd5', '#ffffff', '#ffd700'][Math.floor(Math.random() * 4)],
        angle: Math.random() * Math.PI * 2
      });
    }
  }

  start() {
    this.timer = 0;
    this.currentAct = 0;
    this.isSkipped = false;
    this.game.audio.playBgm('opening');
  }

  update(input) {
    if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space') || input.isJustPressed('KeyX')) {
      this.skip();
      return;
    }

    this.timer++;
    this.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.angle += 0.04;
      if (p.y > 960) p.y = -10;
      if (p.x > 1280) p.x = -10;
      if (p.x < -10) p.x = 1280;
    });

    let accumulatedTime = 0;
    for (let i = 0; i < this.acts.length; i++) {
      accumulatedTime += this.acts[i].duration;
      if (this.timer < accumulatedTime) {
        if (this.currentAct !== i) {
          this.currentAct = i;
          if (i === 1) this.game.audio.playTone(110, 0.8, 'sawtooth', 0, this.game.audio.seGain, 0.05, 0.3);
          if (i === 2) this.game.audio.playSlash();
          if (i === 3) this.game.audio.playSave();
        }
        return;
      }
    }

    this.finish();
  }

  handleTap(cx, cy) {
    this.skip();
  }

  skip() {
    if (this.isSkipped) return;
    this.isSkipped = true;
    this.finish();
  }

  finish() {
    this.game.endOpening();
  }

  render(ctx) {
    ctx.clearRect(0, 0, 1280, 960);

    if (this.currentAct === 0) {
      this.renderAct1Moon(ctx);
    } else if (this.currentAct === 1) {
      this.renderAct2Akane(ctx);
    } else if (this.currentAct === 2) {
      this.renderAct3Heroes(ctx);
    } else {
      this.renderAct4Title(ctx);
    }

    ctx.fillStyle = '#ffffff';
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    if (Math.floor(Date.now() / 400) % 2 === 0) {
      const font = this.game.graphics.fontFamily;
      this.game.graphics.drawCrispText(ctx, '【 画面タップ / 決定キー でスキップ 】', 420, 920, `bold 24px ${font}`, '#ffffff', '#000', 3);
    }
  }

  renderAct1Moon(ctx) {
    const font = this.game.graphics.fontFamily;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 960);
    skyGrad.addColorStop(0, '#06000e');
    skyGrad.addColorStop(0.6, '#180422');
    skyGrad.addColorStop(1, '#3a0c28');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1280, 960);

    const eclipseGrad = ctx.createRadialGradient(640, 360, 20, 640, 360, 160);
    eclipseGrad.addColorStop(0, '#ff2222');
    eclipseGrad.addColorStop(0.7, '#880000');
    eclipseGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = eclipseGrad;
    ctx.beginPath(); ctx.arc(640, 360, 160, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#06000e';
    ctx.beginPath(); ctx.arc(620, 350, 150, 0, Math.PI * 2); ctx.fill();

    this.game.graphics.drawCrispText(ctx, '千年の時を超え、皆既月蝕の夜が訪れる……', 310, 680, `bold 36px ${font}`, '#fce4ce', '#000', 4);
    this.game.graphics.drawCrispText(ctx, '常夜の門の封印が解かれ、妖魔が目覚めんとしていた。', 260, 760, `bold 30px ${font}`, '#ff8888', '#000', 4);
  }

  renderAct2Akane(ctx) {
    const font = this.game.graphics.fontFamily;
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 960);
    bgGrad.addColorStop(0, '#100018');
    bgGrad.addColorStop(0.5, '#400820');
    bgGrad.addColorStop(1, '#180010');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1280, 960);

    const youko = this.game.graphics.sprites['boss_shin_youko'];
    if (youko) {
      const yw = 192 * 2.2;
      const yh = 192 * 2.2;
      ctx.drawImage(youko, 640 - yw / 2, 400 - yh / 2, yw, yh);
    }

    this.game.graphics.drawCrispText(ctx, '「人は我が一族を裏切った……許しはせぬ……」', 280, 720, `bold 38px ${font}`, '#ffd700', '#000', 4);
    this.game.graphics.drawCrispText(ctx, '大妖狐・茜の怨嗟の焔が、大地を紅く染め上げる。', 290, 800, `bold 30px ${font}`, '#ff4444', '#000', 4);
  }

  renderAct3Heroes(ctx) {
    const font = this.game.graphics.fontFamily;
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 960);
    bgGrad.addColorStop(0, '#0a1020');
    bgGrad.addColorStop(0.5, '#162848');
    bgGrad.addColorStop(1, '#2c4060');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1280, 960);

    const samurai = this.game.graphics.sprites['samurai_battle_idle'];
    const miko = this.game.graphics.sprites['miko_battle_idle'];
    const ninja = this.game.graphics.sprites['ninja_battle_idle'];

    if (samurai) ctx.drawImage(samurai, 280, 320, 192, 192);
    if (miko) ctx.drawImage(miko, 544, 280, 192, 192);
    if (ninja) ctx.drawImage(ninja, 808, 320, 192, 192);

    this.game.graphics.drawCrispText(ctx, '立ち向かうは、運命に導かれし三人の英傑。', 320, 680, `bold 36px ${font}`, '#ffeed0', '#000', 4);
    this.game.graphics.drawCrispText(ctx, '疾風、小夜、朧——いま、もののけ草子の幕が開く！', 270, 760, `bold 30px ${font}`, '#ffd666', '#000', 4);
  }

  renderAct4Title(ctx) {
    const font = this.game.graphics.fontFamily;
    this.game.graphics.drawBattleBackground(ctx, 1280, 960, 'night');

    this.game.graphics.drawUrushiFrame(ctx, 140, 160, 1000, 320);
    this.game.graphics.drawCrispText(ctx, '妖  幻  奇  譚', 420, 300, `bold 72px ${font}`, '#ffeed0', '#3b0d11', 6);
    this.game.graphics.drawCrispText(ctx, '〜 もののけ草子 〜 【全三章完結 ハイレゾHD-2D】', 300, 390, `bold 36px ${font}`, '#f09199', '#000', 4);

    this.game.graphics.drawCrispText(ctx, '【 画面タップ / 決定キー でタイトルへ 】', 370, 720, `bold 32px ${font}`, '#ffd666', '#000', 4);
  }
}
