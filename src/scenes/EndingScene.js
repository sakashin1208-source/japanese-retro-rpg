import { Scene } from '../core/Scene.js';
import { VIEW_W, VIEW_H, COLORS, FONTS } from '../core/Constants.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';

/**
 * エンディングシーン (EndingScene) - 大団円スタッフロール
 */
export class EndingScene extends Scene {
  constructor(game) {
    super(game);
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

  enter() {
    this.timer = 0;
    this.isComplete = false;
    this.game.audio?.playBgm?.('village');
  }

  update(input, frame) {
    this.timer++;

    if (input.isPressed('CONFIRM') || input.isPressed('CANCEL')) {
      if (this.timer > 200) {
        this.finish();
      }
    }

    if (this.timer >= 1200) {
      this.finish();
    }
  }

  handleTap(x, y) {
    if (this.timer > 200) {
      this.finish();
      return true;
    }
    return false;
  }

  finish() {
    this.isComplete = true;
    this.game.changeScene('TITLE');
  }

  render(ctx, frame) {
    const t = this.timer;
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);

    // 朝焼けグラデーション
    const skyGrad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    skyGrad.addColorStop(0, '#2c1e38');
    skyGrad.addColorStop(0.4, '#c04848');
    skyGrad.addColorStop(0.7, '#f0a050');
    skyGrad.addColorStop(1, '#ffeed0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const sunGrad = ctx.createRadialGradient(640, 640, 40, 640, 640, 240);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.3, '#ffea80');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(640, 640, 240, 0, Math.PI * 2);
    ctx.fill();

    // 3キャラ立ち絵 (下部に配置)
    const samurai = this.game.graphics?.sprites?.['samurai_battle_idle'];
    const miko = this.game.graphics?.sprites?.['miko_battle_idle'];
    const ninja = this.game.graphics?.sprites?.['ninja_battle_idle'];
    if (samurai) ctx.drawImage(samurai, 360, 720, 128, 128);
    if (miko) ctx.drawImage(miko, 576, 700, 128, 128);
    if (ninja) ctx.drawImage(ninja, 792, 720, 128, 128);

    // クレジットスクロール (textAlign: center で正確にセンタリング)
    const scrollY = 880 - t * 1.8;

    ctx.save();
    ctx.textAlign = 'center';
    this.credits.forEach((line, idx) => {
      const ly = scrollY + idx * 64;
      if (ly >= -60 && ly <= 1000) {
        let col = COLORS.WHITE;
        if (line.startsWith('【') || line.startsWith('〜')) {
          col = COLORS.GOLD_LIGHT;
        }
        this.game.graphics?.drawCrispText(ctx, line, VIEW_W / 2, ly, `bold 30px ${FONTS.MAIN}`, col, '#000', 4, 'center');
      }
    });
    ctx.restore();

    // 終了ガイド (点滅)
    if (t > 300 && Math.floor(Date.now() / 400) % 2 === 0) {
      UrushiFrame.draw(ctx, 320, 860, 640, 64);
      this.game.graphics?.drawCrispText(ctx, '【 タップ / 決定でタイトルへ 】', VIEW_W / 2, 902, `bold 28px ${FONTS.MAIN}`, COLORS.GOLD_LIGHT, '#000', 4, 'center');
    }
  }
}
