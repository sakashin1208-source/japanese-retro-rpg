/**
 * 技エフェクト描画マネージャ (Effects - 全13種)
 */
export class Effects {
  /**
   * エフェクトを描画
   * @param {CanvasRenderingContext2D} ctx 
   * @param {string} effectType 
   * @param {number} x 
   * @param {number} y 
   * @param {number} progress 0.0 -> 1.0
   */
  static draw(ctx, effectType, x, y, progress) {
    const p = Math.max(0, Math.min(1, progress));
    switch (effectType) {
      case 'slash':
      case 'slash_heavy':
        this.drawSlashEffect(ctx, x, y, p, effectType === 'slash_heavy');
        break;
      case 'wind':
      case 'tornado':
        this.drawTornadoEffect(ctx, x, y, p);
        break;
      case 'holy':
        this.drawHolyEffect(ctx, x, y, p);
        break;
      case 'holy_pillar':
        this.drawHolyPillarEffect(ctx, x, y, p);
        break;
      case 'fire':
      case 'foxfire':
        this.drawFireEffect(ctx, x, y, p);
        break;
      case 'blizzard':
        this.drawBlizzardEffect(ctx, x, y, p);
        break;
      case 'ice_spear':
        this.drawIceSpearEffect(ctx, x, y, p);
        break;
      case 'water':
        this.drawWaterWaveEffect(ctx, x, y, p);
        break;
      case 'thunder':
        this.drawThunderEffect(ctx, x, y, p);
        break;
      case 'purple_lightning':
        this.drawPurpleLightningEffect(ctx, x, y, p);
        break;
      case 'dark_slash':
        this.drawDarkSlashEffect(ctx, x, y, p);
        break;
      case 'heal':
        this.drawHealEffect(ctx, x, y, p);
        break;
      case 'buff':
      case 'buff_atk_spd':
      case 'buff_def_all':
      case 'evasion':
        this.drawBuffEffect(ctx, x, y, p);
        break;
      default:
        this.drawSlashEffect(ctx, x, y, p);
        break;
    }
  }

  static drawSlashEffect(ctx, x, y, progress, isHeavy = false) {
    ctx.save();
    ctx.strokeStyle = isHeavy ? '#ffd700' : '#ffffff';
    ctx.lineWidth = isHeavy ? 6 : 4;
    ctx.beginPath();
    const len = (isHeavy ? 100 : 70) * progress;
    ctx.moveTo(x - len / 2, y - len / 2);
    ctx.lineTo(x + len / 2, y + len / 2);
    ctx.stroke();
    if (isHeavy) {
      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + len / 2, y - len / 2);
      ctx.lineTo(x - len / 2, y + len / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawTornadoEffect(ctx, x, y, progress) {
    ctx.save();
    ctx.strokeStyle = `rgba(180, 240, 255, ${1 - progress})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const r = (30 + i * 20) * progress;
      const angle = progress * Math.PI * 4 + i * (Math.PI / 2);
      ctx.ellipse(x, y, r, r * 0.4, angle, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawHolyEffect(ctx, x, y, progress) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 200, ${1 - progress})`;
    ctx.beginPath();
    ctx.arc(x, y, 60 * progress, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static drawHolyPillarEffect(ctx, x, y, progress) {
    ctx.save();
    const alpha = 1 - Math.abs(progress - 0.5) * 2;
    ctx.fillStyle = `rgba(255, 250, 200, ${alpha * 0.8})`;
    ctx.fillRect(x - 40, 0, 80, 960);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x - 15, 0, 30, 960);
    ctx.restore();
  }

  static drawFireEffect(ctx, x, y, progress) {
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + progress * 2;
      const dist = progress * 70;
      const fx = x + Math.cos(angle) * dist;
      const fy = y + Math.sin(angle) * dist - progress * 40;
      ctx.fillStyle = i % 2 === 0 ? `rgba(255, 60, 0, ${1 - progress})` : `rgba(255, 200, 0, ${1 - progress})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 14 * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  static drawBlizzardEffect(ctx, x, y, progress) {
    ctx.save();
    for (let i = 0; i < 15; i++) {
      const bx = x + ((i * 37 + progress * 200) % 180) - 90;
      const by = y + ((i * 23 + progress * 150) % 140) - 70;
      ctx.fillStyle = `rgba(220, 245, 255, ${1 - progress})`;
      ctx.fillRect(bx, by, 6, 6);
    }
    ctx.restore();
  }

  static drawIceSpearEffect(ctx, x, y, progress) {
    ctx.save();
    ctx.strokeStyle = `rgba(150, 220, 255, ${1 - progress * 0.5})`;
    ctx.fillStyle = `rgba(220, 245, 255, ${1 - progress})`;
    ctx.lineWidth = 3;
    const sy = y - 100 + progress * 100;
    ctx.beginPath();
    ctx.moveTo(x, sy + 50);
    ctx.lineTo(x - 15, sy);
    ctx.lineTo(x + 15, sy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  static drawWaterWaveEffect(ctx, x, y, progress) {
    ctx.save();
    ctx.strokeStyle = `rgba(60, 160, 255, ${1 - progress})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, 75 * progress, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  static drawThunderEffect(ctx, x, y, progress) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 100, ${1 - progress})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 20, y * 0.4);
    ctx.lineTo(x + 15, y * 0.7);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
  }

  static drawPurpleLightningEffect(ctx, x, y, progress) {
    ctx.save();
    ctx.strokeStyle = `rgba(220, 100, 255, ${1 - progress})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 25, y * 0.3);
    ctx.lineTo(x - 20, y * 0.6);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
  }

  static drawDarkSlashEffect(ctx, x, y, progress) {
    ctx.save();
    ctx.strokeStyle = `rgba(120, 0, 180, ${1 - progress})`;
    ctx.lineWidth = 8;
    const len = 90 * progress;
    ctx.beginPath();
    ctx.moveTo(x - len, y + len);
    ctx.lineTo(x + len, y - len);
    ctx.stroke();
    ctx.restore();
  }

  static drawHealEffect(ctx, x, y, progress) {
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const hx = x + Math.cos(angle) * (20 + progress * 20);
      const hy = y + Math.sin(angle) * (20 + progress * 20) - progress * 50;
      ctx.fillStyle = `rgba(100, 255, 150, ${1 - progress})`;
      ctx.font = '20px sans-serif';
      ctx.fillText('✨', hx, hy);
    }
    ctx.restore();
  }

  static drawBuffEffect(ctx, x, y, progress) {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 215, 0, ${1 - progress})`;
    ctx.lineWidth = 3;
    const r = 40 + progress * 30;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
