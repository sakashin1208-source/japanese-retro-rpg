import { VIEW_W, VIEW_H, COLORS, FONTS } from '../core/Constants.js';
import { MASTER } from '../data/MasterData.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';

/**
 * つよさ（能力）画面UI (StatusUI) - 1280x960 最適化
 */
export class StatusUI {
  /**
   * @param {Object} options
   * @param {import('../data/GameState.js').GameState} options.state
   * @param {AudioEngine} [options.audio]
   * @param {GraphicsEngine} [options.graphics]
   * @param {Function} [options.onClose]
   */
  constructor({ state, audio, graphics, onClose }) {
    this.state = state;
    this.audio = audio;
    this.graphics = graphics;
    this.onClose = onClose;

    this.partyIndex = 0;
    this.skillCursor = 0;
  }

  update(input, frame) {
    if (input.isPressed('LEFT')) {
      this.partyIndex = (this.partyIndex - 1 + this.state.party.length) % this.state.party.length;
      this.skillCursor = 0;
      this.audio?.playCursor?.();
    } else if (input.isPressed('RIGHT')) {
      this.partyIndex = (this.partyIndex + 1) % this.state.party.length;
      this.skillCursor = 0;
      this.audio?.playCursor?.();
    }

    const hero = this.state.party[this.partyIndex];
    if (hero && hero.skills.length > 0) {
      if (input.isPressed('UP')) {
        this.skillCursor = (this.skillCursor - 1 + hero.skills.length) % hero.skills.length;
        this.audio?.playCursor?.();
      } else if (input.isPressed('DOWN')) {
        this.skillCursor = (this.skillCursor + 1) % hero.skills.length;
        this.audio?.playCursor?.();
      }
    }

    if (input.isPressed('CANCEL') || input.isPressed('CONFIRM')) {
      this.audio?.playCancel?.();
      this.onClose?.();
    }
  }

  handleTap(x, y) {
    if (x < 160 && y < 240) {
      this.partyIndex = (this.partyIndex - 1 + this.state.party.length) % this.state.party.length;
      this.skillCursor = 0;
      this.audio?.playCursor?.();
      return true;
    }
    if (x > 1120 && y < 240) {
      this.partyIndex = (this.partyIndex + 1) % this.state.party.length;
      this.skillCursor = 0;
      this.audio?.playCursor?.();
      return true;
    }
    if (y > 840) {
      this.audio?.playCancel?.();
      this.onClose?.();
      return true;
    }
    return false;
  }

  render(ctx, frame) {
    const hero = this.state.party[this.partyIndex];
    if (!hero) return;

    UrushiFrame.draw(ctx, 32, 32, 1216, 896, `強 さ（能力） - ${this.partyIndex + 1}/3`);

    ctx.save();
    // 左右切替ボタン
    this.graphics?.drawCrispText(ctx, '◀ [A/左]', 64, 108, `bold 38px ${FONTS.MAIN}`, COLORS.GOLD_LIGHT, '#000', 4);
    this.graphics?.drawCrispText(ctx, '[D/右] ▶', 980, 108, `bold 38px ${FONTS.MAIN}`, COLORS.GOLD_LIGHT, '#000', 4);

    // ポートレート (160x160)
    const portrait = this.graphics?.portraits?.[hero.spriteKey];
    if (portrait) {
      ctx.strokeStyle = COLORS.GOLD_BORDER;
      ctx.lineWidth = 4;
      ctx.strokeRect(68, 144, 160, 160);
      ctx.drawImage(portrait, 72, 148, 152, 152);
    }

    // 名前・称号・Lv
    this.graphics?.drawCrispText(ctx, hero.name, 260, 196, `bold 52px ${FONTS.MAIN}`, COLORS.TEXT_LIGHT, '#000', 4.5);
    this.graphics?.drawCrispText(ctx, `【${hero.title}】`, 260, 246, `bold 36px ${FONTS.MAIN}`, COLORS.GOLD_LIGHT, '#000', 3.5);
    this.graphics?.drawCrispText(ctx, `職業: ${hero.job}   Lv.${hero.level}`, 260, 292, `bold 34px ${FONTS.MAIN}`, COLORS.TEXT_MUTED, '#000', 3.5);

    // パラメータボックス
    ctx.fillStyle = '#22192b';
    ctx.fillRect(64, 332, 1152, 180);
    ctx.strokeStyle = '#685030';
    ctx.lineWidth = 2;
    ctx.strokeRect(64, 332, 1152, 180);

    this.graphics?.drawCrispText(ctx, `H P: ${hero.hp} / ${hero.maxHp}`, 92, 396, `bold 38px ${FONTS.MAIN}`, COLORS.WHITE, '#000', 4);
    this.graphics?.drawCrispText(ctx, `M P: ${hero.mp} / ${hero.maxMp}`, 92, 452, `bold 38px ${FONTS.MAIN}`, COLORS.WHITE, '#000', 4);
    this.graphics?.drawCrispText(ctx, `攻撃力: ${hero.atk}`, 480, 396, `bold 38px ${FONTS.MAIN}`, COLORS.WHITE, '#000', 4);
    this.graphics?.drawCrispText(ctx, `防御力: ${hero.def}`, 480, 452, `bold 38px ${FONTS.MAIN}`, COLORS.WHITE, '#000', 4);
    this.graphics?.drawCrispText(ctx, `精神力: ${hero.matk}`, 760, 396, `bold 38px ${FONTS.MAIN}`, COLORS.WHITE, '#000', 4);
    this.graphics?.drawCrispText(ctx, `素早さ: ${hero.spd}`, 760, 452, `bold 38px ${FONTS.MAIN}`, COLORS.WHITE, '#000', 4);
    this.graphics?.drawCrispText(ctx, `EXP: ${hero.exp} (次まで ${Math.max(0, hero.nextExp - hero.exp)})`, 92, 498, `bold 30px ${FONTS.MAIN}`, COLORS.GOLD_LIGHT, '#000', 3.5);

    // 習得技・術一覧
    this.graphics?.drawCrispText(ctx, '【 習 得 技 ・ 術 一 覧 】', 72, 560, `bold 40px ${FONTS.MAIN}`, COLORS.TEXT_LIGHT, '#000', 4);

    const skills = hero.skills.map(id => MASTER.skills[id]).filter(Boolean);
    skills.forEach((sk, idx) => {
      const sx = 92 + (idx % 2) * 550;
      const sy = 616 + Math.floor(idx / 2) * 60;
      const isSel = this.skillCursor === idx;
      const col = isSel ? COLORS.GOLD_LIGHT : COLORS.WHITE;
      this.graphics?.drawCrispText(ctx, `${isSel ? '▶ ' : '・'}${sk.name} (${sk.mpCost}MP)`, sx, sy, `bold 36px ${FONTS.MAIN}`, col, '#000', 3.5);
    });

    // 選択中の技説明枠
    const selSkill = skills[this.skillCursor] || skills[0];
    if (selSkill) {
      ctx.fillStyle = '#110d16';
      ctx.fillRect(64, 748, 1152, 100);
      ctx.strokeStyle = COLORS.VERMILION;
      ctx.lineWidth = 2;
      ctx.strokeRect(64, 748, 1152, 100);
      this.graphics?.drawCrispText(ctx, `【${selSkill.name}】: ${selSkill.desc}`, 84, 808, `bold 34px ${FONTS.MAIN}`, COLORS.TEXT_LIGHT, '#000', 3.5);
    }

    this.graphics?.drawCrispText(ctx, '【 左右: キャラ切替 | 上下: 技選択 | 取消: 閉じる 】', 280, 904, `bold 30px ${FONTS.MAIN}`, COLORS.TEXT_MUTED, '#000', 3.5);
    ctx.restore();
  }
}
