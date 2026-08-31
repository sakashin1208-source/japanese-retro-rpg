/**
 * ==========================================================================
 * 妖幻奇譚 〜もののけ草子〜 大団円エンディング演出エンジン (1280x960 ハイレゾHD-2D版)
 * ==========================================================================
 */

class EndingManager {
  constructor(game) {
    this.game = game;
    this.timer = 0;
    this.isComplete = false;

    this.credits = [
      '【 妖 幻 奇 譚 〜もののけ草子〜 】',
      '',
      '〜 企画・監督 〜',
      'しんちゃん',
      '',
      '〜 キャラクターデザイン 〜',
      '風神無想流 侍「疾風」',
      '白鷺神社 神子「小夜」',
      '月影忍軍 頭領「朧」',
      '',
      '〜 劇伴音響・効果音 〜',
      '和風都節シンセ音源',
      '',
      '〜 登場妖怪 〜',
      'もののけ全五十種 ＆ 九大妖魔将',
      '',
      '〜 特別出演 〜',
      '大妖狐・茜 ＆ 神楽の里の人々',
      '',
      '人の心に優しさがある限り、',
      'もののけと人は共に生きていける——',
      '',
      '【 終 幕（完） 】',
      'ありがとうございました！'
    ];
  }

  start() {
    this.timer = 0;
    this.isComplete = false;
    this.game.audio.playBgm('village');
  }

  update(input) {
    this.timer++;

    if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space') || input.isJustPressed('KeyX')) {
      if (this.timer > 200) {
        this.finish();
      }
    }

    if (this.timer >= 1200) {
      this.finish();
    }
  }

  handleTap(cx, cy) {
    if (this.timer > 200) {
      this.finish();
    }
  }

  finish() {
    this.isComplete = true;
    this.game.endEnding();
  }

  render(ctx) {
    const font = this.game.graphics.fontFamily;
    const t = this.timer;
    ctx.clearRect(0, 0, 1280, 960);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, 960);
    skyGrad.addColorStop(0, '#2c1e38');
    skyGrad.addColorStop(0.4, '#c04848');
    skyGrad.addColorStop(0.7, '#f0a050');
    skyGrad.addColorStop(1, '#ffeed0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1280, 960);

    const sunGrad = ctx.createRadialGradient(640, 640, 40, 640, 640, 240);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.3, '#ffea80');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath(); ctx.arc(640, 640, 240, 0, Math.PI * 2); ctx.fill();

    const samurai = this.game.graphics.sprites['samurai_battle_idle'];
    const miko = this.game.graphics.sprites['miko_battle_idle'];
    const ninja = this.game.graphics.sprites['ninja_battle_idle'];
    if (samurai) ctx.drawImage(samurai, 360, 700);
    if (miko) ctx.drawImage(miko, 560, 700);
    if (ninja) ctx.drawImage(ninja, 760, 700);

    const scrollY = 880 - t * 1.8;

    this.credits.forEach((line, idx) => {
      const ly = scrollY + idx * 64;
      if (ly >= -60 && ly <= 1000) {
        let col = '#ffffff';
        if (line.startsWith('【') || line.startsWith('〜')) {
          col = '#ffd666';
        }
        this.game.graphics.drawCrispText(ctx, line, 640 - (line.length * 15), ly, `bold 30px ${font}`, col, '#000', 4);
      }
    });

    if (t > 300 && Math.floor(Date.now() / 400) % 2 === 0) {
      ctx.fillStyle = '#16101c';
      ctx.fillRect(320, 860, 640, 64);
      ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2; ctx.strokeRect(320, 860, 640, 64);
      this.game.graphics.drawCrispText(ctx, '【 タップ / 決定でタイトルへ 】', 420, 904, `bold 30px ${font}`, '#ffd666', '#000', 4);
    }
  }
}
