/**
 * ==========================================================================
 * 妖幻奇譚 〜もののけ草子〜 バトルシステム (1280x960 ハイレゾHD-2D版)
 * (成長同期・どうぐコマンド・バフ＆変わり身回避・所持金獲得 完全対応版)
 * ==========================================================================
 */

// ==========================================
// バトル画面レイアウト定数 & 座標算出ヘルパー (一元化)
// ==========================================
const PARTY_LAYOUT = {
  originX: 1040,
  originY: 56,
  stepX: -36,
  stepY: 164,
  spriteSize: 128,
  cardOffsetX: -380,      // スプライト左横にステータスカード配置
  cardWidth: 360,
  cardHeight: 144,
  floatTextOffsetX: -160, // ダメージ・回復数値
  floatTextOffsetY: 48
};

const ENEMY_LAYOUT = {
  normal: { originX: 160, originY: 180, stepX: 72, stepY: 148, floatX: 280, floatY: 230 },
  boss:   { originX: 120, originY: 160, stepX: 0,  stepY: 0,   floatX: 260, floatY: 220 }
};

function getHeroPos(idx) {
  const row = (idx !== undefined && idx !== null) ? Number(idx) : 0;
  const sx = PARTY_LAYOUT.originX + row * PARTY_LAYOUT.stepX;
  const sy = PARTY_LAYOUT.originY + row * PARTY_LAYOUT.stepY;
  return {
    spriteX: sx,
    spriteY: sy,
    cardX: sx + PARTY_LAYOUT.cardOffsetX,
    cardY: sy,
    cardW: PARTY_LAYOUT.cardWidth,
    cardH: PARTY_LAYOUT.cardHeight,
    centerX: sx + PARTY_LAYOUT.spriteSize / 2,
    centerY: sy + PARTY_LAYOUT.spriteSize / 2,
    floatX: sx + PARTY_LAYOUT.floatTextOffsetX,
    floatY: sy + PARTY_LAYOUT.floatTextOffsetY,
    hitX: sx + PARTY_LAYOUT.cardOffsetX,
    hitY: sy,
    hitW: PARTY_LAYOUT.cardWidth + PARTY_LAYOUT.spriteSize + 24,
    hitH: PARTY_LAYOUT.cardHeight
  };
}

function getEnemyPos(idx, isBoss = false) {
  const i = (idx !== undefined && idx !== null) ? Number(idx) : 0;
  const cfg = isBoss ? ENEMY_LAYOUT.boss : ENEMY_LAYOUT.normal;
  const ex = isBoss ? cfg.originX : (cfg.originX + (i % 2) * cfg.stepX);
  const ey = isBoss ? cfg.originY : (cfg.originY + i * cfg.stepY);
  return {
    spriteX: ex,
    spriteY: ey,
    centerX: ex + (isBoss ? 96 : 64),
    centerY: ey + (isBoss ? 96 : 64),
    floatX: isBoss ? cfg.floatX : (cfg.floatX + (i % 2) * 40),
    floatY: isBoss ? cfg.floatY : (cfg.floatY + i * cfg.stepY),
    hitX: ex - 20,
    hitY: ey - 20,
    hitW: isBoss ? 232 : 168,
    hitH: isBoss ? 232 : 168
  };
}

class BattleManager {
  constructor(game) {
    this.game = game;
    this.state = 'START';
    this.enemies = [];
    this.party = [];
    this.currentActorIndex = 0;
    this.actionQueue = [];
    this.currentAction = null;
    this.actionTimer = 0;

    this.menuState = 'MAIN';
    this.selectedActionIndex = 0;
    this.selectedSubIndex = 0;
    this.selectedTargetIndex = 0;

    this.mainMenu = ['こうげき', 'わざ・じゅつ', 'どうぐ', 'にげる'];
    this.messageLog = [];
    this.isBossBattle = false;
    this.bgType = 'night';

    this.animTimer = 0;
    this.floatingTexts = [];
    this.effect = null;
  }

  // ==========================================
  // 戦闘開始処理
  // ==========================================
  startBattle(enemyIds, isBoss = false) {
    this.state = 'START';
    this.isBossBattle = isBoss;
    this.game.audio.playBgm('battle');

    if (this.game.map && this.game.map.currentChapter === 2) {
      if (enemyIds.some(id => ['yukionna_mob', 'hyouro', 'yukiwarashi', 'hyoka'].includes(id))) {
        this.bgType = 'snow';
      } else {
        this.bgType = 'lake';
      }
    } else if (this.game.map && this.game.map.currentChapter === 3) {
      this.bgType = 'tokoyo';
    } else {
      this.bgType = 'night';
    }

    // GAME_DATA.party からクローンしつつ戦闘用バフ変数を初期化
    this.party = GAME_DATA.party.map(p => ({
      ...p,
      skills: [...p.skills],
      isGuarding: false,
      hasEvasion: false,
      buffAtk: 1.0,
      buffDef: 1.0,
      buffSpd: 1.0
    }));

    this.enemies = enemyIds.map((id, index) => {
      const template = GAME_DATA.enemies[id] || GAME_DATA.enemies.karakasa;
      return {
        ...template,
        uid: `${id}_${index}`,
        index: index,
        isBoss: template.isBoss || isBoss,
        buffAtk: 1.0,
        buffDef: 1.0,
        buffSpd: 1.0
      };
    });

    this.currentActorIndex = 0;
    this.actionQueue = [];
    this.currentAction = null;
    this.messageLog = [];
    this.floatingTexts = [];
    this.effect = null;

    const names = this.enemies.map(e => e.name).join('と');
    this.addMessage(`${names}が あらわれた！`);

    setTimeout(() => {
      this.beginTurn();
    }, 900);
  }

  // ==========================================
  // 戦闘成長データの完全同期ヘルパー (C-1 修正)
  // ==========================================
  syncPartyToGameData() {
    this.party.forEach((p, idx) => {
      if (GAME_DATA.party[idx]) {
        const target = GAME_DATA.party[idx];
        target.hp = Math.max(0, Math.min(p.maxHp, p.hp));
        target.mp = Math.max(0, Math.min(p.maxMp, p.mp));
        target.maxHp = p.maxHp;
        target.maxMp = p.maxMp;
        target.level = p.level;
        target.exp = p.exp;
        target.nextExp = p.nextExp;
        target.atk = p.atk;
        target.def = p.def;
        target.matk = p.matk;
        target.spd = p.spd;
        target.skills = [...p.skills];
      }
    });
  }

  addMessage(msg) {
    this.messageLog.unshift(msg);
    if (this.messageLog.length > 5) this.messageLog.pop();
  }

  addFloatingText(text, x, y, color = '#ffffff') {
    this.floatingTexts.push({ text, x, y, color, life: 45, vy: -2.0 });
  }

  beginTurn() {
    this.state = 'INPUT';
    this.currentActorIndex = 0;
    this.menuState = 'MAIN';
    this.selectedActionIndex = 0;
    this.findNextLivingHero();
  }

  findNextLivingHero() {
    while (this.currentActorIndex < this.party.length && this.party[this.currentActorIndex].hp <= 0) {
      this.currentActorIndex++;
    }
    if (this.currentActorIndex >= this.party.length) {
      this.startTurnExecution();
    } else {
      this.menuState = 'MAIN';
      this.selectedActionIndex = 0;
    }
  }

  // ==========================================
  // タップ入力判定
  // ==========================================
  handleTap(cx, cy) {
    if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
      if (this.state === 'VICTORY') this.game.endBattle(false);
      else this.game.reviveAtShrine();
      return;
    }

    // M-2: 演出中のタップで早送りスキップ
    if (this.state === 'EXECUTING') {
      if (this.effect) this.effect.progress = 1.0;
      return;
    }

    if (this.state !== 'INPUT') return;

    if (this.menuState === 'MAIN') {
      const mx = 804; const my = 580; const mw = 452;
      if (cx >= mx && cx <= mx + mw && cy >= my && cy <= my + 360) {
        const idx = Math.floor((cy - (my + 64)) / 74);
        if (idx >= 0 && idx < this.mainMenu.length) {
          this.selectedActionIndex = idx;
          this.executeMainActionChoice();
        }
      }
    } else if (this.menuState === 'SKILL') {
      const sx = 280; const sy = 580; const sw = 976;
      if (cx >= sx && cx <= sx + sw && cy >= sy && cy <= sy + 360) {
        const char = this.party[this.currentActorIndex];
        const idx = Math.floor((cy - (sy + 64)) / 64);
        if (idx >= 0 && idx < char.skills.length) {
          this.selectedSubIndex = idx;
          this.executeSkillChoice();
        }
      }
    } else if (this.menuState === 'ITEM') {
      const ix = 280; const iy = 580; const iw = 976;
      if (cx >= ix && cx <= ix + iw && cy >= iy && cy <= iy + 360) {
        const idx = Math.floor((cy - (iy + 64)) / 64);
        if (idx >= 0 && idx < GAME_DATA.items.length) {
          this.selectedSubIndex = idx;
          this.executeItemChoice();
        }
      }
    } else if (this.menuState === 'TARGET_ENEMY') {
      const livingEnemies = this.enemies.filter(e => e.hp > 0);
      livingEnemies.forEach((e, idx) => {
        const pos = getEnemyPos(e.index !== undefined ? e.index : idx, e.isBoss);
        if (cx >= pos.hitX && cx <= pos.hitX + pos.hitW && cy >= pos.hitY && cy <= pos.hitY + pos.hitH) {
          this.selectedTargetIndex = idx;
          this.confirmTargetChoice();
        }
      });
    } else if (this.menuState === 'TARGET_ALLY') {
      const livingAllies = this.party.filter(p => p.hp > 0);
      livingAllies.forEach((a, idx) => {
        const pos = getHeroPos(a.row !== undefined ? a.row : idx);
        if (cx >= pos.hitX && cx <= pos.hitX + pos.hitW && cy >= pos.hitY && cy <= pos.hitY + pos.hitH) {
          this.selectedTargetIndex = idx;
          this.confirmTargetChoice();
        }
      });
    } else if (this.menuState === 'TARGET_ALLY_REVIVE') {
      const deadAllies = this.party.filter(p => p.hp <= 0);
      deadAllies.forEach((a, idx) => {
        const pos = getHeroPos(a.row !== undefined ? a.row : idx);
        if (cx >= pos.hitX && cx <= pos.hitX + pos.hitW && cy >= pos.hitY && cy <= pos.hitY + pos.hitH) {
          this.selectedTargetIndex = idx;
          this.confirmTargetChoice();
        }
      });
    }
  }

  update(input) {
    this.animTimer += 0.05;

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    if (this.state === 'START') return;

    if (this.state === 'INPUT') {
      this.updateInput(input);
    } else if (this.state === 'EXECUTING') {
      // M-2: 決定キーでエフェクト早送り
      if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
        if (this.effect) this.effect.progress = 1.0;
      }
      this.updateExecution();
    } else if (this.state === 'VICTORY' || this.state === 'DEFEAT') {
      if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
        if (this.state === 'VICTORY') this.game.endBattle(false);
        else this.game.reviveAtShrine();
      }
    }
  }

  // ==========================================
  // キーボード・ボタン入力更新 (C-2 ITEM対応)
  // ==========================================
  updateInput(input) {
    if (this.menuState === 'MAIN') {
      if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
        this.selectedActionIndex = (this.selectedActionIndex - 1 + this.mainMenu.length) % this.mainMenu.length;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('ArrowDown') || input.isJustPressed('KeyS')) {
        this.selectedActionIndex = (this.selectedActionIndex + 1) % this.mainMenu.length;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
        this.executeMainActionChoice();
      } else if (input.isJustPressed('KeyX') || input.isJustPressed('Escape')) {
        if (this.currentActorIndex > 0) {
          this.currentActorIndex--;
          while (this.currentActorIndex > 0 && this.party[this.currentActorIndex].hp <= 0) {
            this.currentActorIndex--;
          }
          this.actionQueue.pop();
          this.game.audio.playCancel();
        }
      }
    } else if (this.menuState === 'SKILL') {
      const char = this.party[this.currentActorIndex];
      const count = char.skills.length;
      if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
        this.selectedSubIndex = (this.selectedSubIndex - 1 + count) % count;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('ArrowDown') || input.isJustPressed('KeyS')) {
        this.selectedSubIndex = (this.selectedSubIndex + 1) % count;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
        this.executeSkillChoice();
      } else if (input.isJustPressed('KeyX') || input.isJustPressed('Escape')) {
        this.menuState = 'MAIN';
        this.game.audio.playCancel();
      }
    } else if (this.menuState === 'ITEM') {
      const count = GAME_DATA.items.length;
      if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
        this.selectedSubIndex = (this.selectedSubIndex - 1 + count) % count;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('ArrowDown') || input.isJustPressed('KeyS')) {
        this.selectedSubIndex = (this.selectedSubIndex + 1) % count;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
        this.executeItemChoice();
      } else if (input.isJustPressed('KeyX') || input.isJustPressed('Escape')) {
        this.menuState = 'MAIN';
        this.game.audio.playCancel();
      }
    } else if (this.menuState === 'TARGET_ENEMY' || this.menuState === 'TARGET_ALLY' || this.menuState === 'TARGET_ALLY_REVIVE') {
      let maxTargets = 1;
      if (this.menuState === 'TARGET_ENEMY') maxTargets = this.enemies.filter(e => e.hp > 0).length;
      else if (this.menuState === 'TARGET_ALLY') maxTargets = this.party.filter(p => p.hp > 0).length;
      else if (this.menuState === 'TARGET_ALLY_REVIVE') maxTargets = Math.max(1, this.party.filter(p => p.hp <= 0).length);

      if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
        this.selectedTargetIndex = (this.selectedTargetIndex - 1 + maxTargets) % maxTargets;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('ArrowDown') || input.isJustPressed('KeyS')) {
        this.selectedTargetIndex = (this.selectedTargetIndex + 1) % maxTargets;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
        this.confirmTargetChoice();
      } else if (input.isJustPressed('KeyX') || input.isJustPressed('Escape')) {
        this.menuState = this.selectedActionIndex === 2 ? 'ITEM' : (this.selectedActionIndex === 1 ? 'SKILL' : 'MAIN');
        this.game.audio.playCancel();
      }
    }
  }

  executeMainActionChoice() {
    this.game.audio.playDecide();
    if (this.selectedActionIndex === 0) {
      this.menuState = 'TARGET_ENEMY';
      this.selectedTargetIndex = 0;
    } else if (this.selectedActionIndex === 1) {
      this.menuState = 'SKILL';
      this.selectedSubIndex = 0;
    } else if (this.selectedActionIndex === 2) {
      this.menuState = 'ITEM';
      this.selectedSubIndex = 0;
    } else if (this.selectedActionIndex === 3) {
      if (this.isBossBattle) {
        this.addMessage('ボス戦からは逃げられない！');
        this.game.audio.playCancel();
      } else {
        if (Math.random() < 0.65) {
          this.addMessage('全員で逃げ出した！');
          this.game.audio.playCancel();
          this.syncPartyToGameData();
          setTimeout(() => this.game.endBattle(true), 600);
        } else {
          this.addMessage('逃げ切れなかった！');
          this.actionQueue.push({ actor: this.party[this.currentActorIndex], type: 'flee_fail' });
          this.currentActorIndex++;
          this.findNextLivingHero();
        }
      }
    }
  }

  executeSkillChoice() {
    const char = this.party[this.currentActorIndex];
    const skillKey = char.skills[this.selectedSubIndex];
    const skill = GAME_DATA.skills[skillKey];

    if (char.mp < skill.mpCost) {
      this.addMessage('MPが 足りない！');
      this.game.audio.playCancel();
      return;
    }

    this.game.audio.playDecide();
    if (skill.target === 'enemy_single') {
      this.menuState = 'TARGET_ENEMY';
      this.selectedTargetIndex = 0;
    } else if (skill.target === 'ally_single') {
      this.menuState = 'TARGET_ALLY';
      this.selectedTargetIndex = 0;
    } else {
      this.actionQueue.push({
        actor: char,
        type: 'skill',
        skillKey: skillKey,
        targetType: skill.target
      });
      this.currentActorIndex++;
      this.findNextLivingHero();
    }
  }

  executeItemChoice() {
    const item = GAME_DATA.items[this.selectedSubIndex];
    if (!item || item.count <= 0) {
      this.addMessage(`${item ? item.name : 'アイテム'}を 所持していない！`);
      this.game.audio.playCancel();
      return;
    }

    this.game.audio.playDecide();
    if (item.type === 'revive') {
      const deadAllies = this.party.filter(p => p.hp <= 0);
      if (deadAllies.length === 0) {
        this.addMessage('倒れている仲間はいない！');
        this.game.audio.playCancel();
        return;
      }
      this.menuState = 'TARGET_ALLY_REVIVE';
      this.selectedTargetIndex = 0;
    } else {
      this.menuState = 'TARGET_ALLY';
      this.selectedTargetIndex = 0;
    }
  }

  confirmTargetChoice() {
    this.game.audio.playDecide();
    const char = this.party[this.currentActorIndex];

    if (this.menuState === 'TARGET_ENEMY') {
      const livingEnemies = this.enemies.filter(e => e.hp > 0);
      const targetEnemy = livingEnemies[this.selectedTargetIndex] || livingEnemies[0];

      if (this.selectedActionIndex === 0) {
        this.actionQueue.push({
          actor: char,
          type: 'attack',
          target: targetEnemy
        });
      } else if (this.selectedActionIndex === 1) {
        const skillKey = char.skills[this.selectedSubIndex];
        this.actionQueue.push({
          actor: char,
          type: 'skill',
          skillKey: skillKey,
          target: targetEnemy
        });
      }
    } else if (this.menuState === 'TARGET_ALLY' || this.menuState === 'TARGET_ALLY_REVIVE') {
      if (this.selectedActionIndex === 1) {
        // 技（単体回復等）
        const livingAllies = this.party.filter(p => p.hp > 0);
        const targetAlly = livingAllies[this.selectedTargetIndex] || livingAllies[0];
        const skillKey = char.skills[this.selectedSubIndex];

        this.actionQueue.push({
          actor: char,
          type: 'skill',
          skillKey: skillKey,
          target: targetAlly
        });
      } else if (this.selectedActionIndex === 2) {
        // どうぐ使用
        const item = GAME_DATA.items[this.selectedSubIndex];
        const isRevive = item.type === 'revive';
        const candidateAllies = isRevive ? this.party.filter(p => p.hp <= 0) : this.party.filter(p => p.hp > 0);
        const targetAlly = candidateAllies[this.selectedTargetIndex] || candidateAllies[0];

        this.actionQueue.push({
          actor: char,
          type: 'item',
          itemIndex: this.selectedSubIndex,
          itemData: item,
          target: targetAlly
        });
      }
    }

    this.currentActorIndex++;
    this.findNextLivingHero();
  }

  startTurnExecution() {
    this.state = 'EXECUTING';

    this.enemies.filter(e => e.hp > 0).forEach(enemy => {
      const livingHeroes = this.party.filter(p => p.hp > 0);
      const target = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
      const act = enemy.actions[Math.floor(Math.random() * enemy.actions.length)];
      this.actionQueue.push({
        actor: enemy,
        type: 'enemy_action',
        actionData: act,
        target: target
      });
    });

    this.actionQueue.sort((a, b) => ((b.actor.spd || 10) * (b.actor.buffSpd || 1.0)) - ((a.actor.spd || 10) * (a.actor.buffSpd || 1.0)));
    this.executeNextAction();
  }

  // ==========================================
  // アクション実行エンジン (技・アイテム・変わり身回避)
  // ==========================================
  executeNextAction() {
    if (this.actionQueue.length === 0) {
      if (this.checkBattleEnd()) return;
      this.beginTurn();
      return;
    }

    if (this.checkBattleEnd()) return;

    this.currentAction = this.actionQueue.shift();
    const act = this.currentAction;

    if (act.actor.hp <= 0) {
      this.executeNextAction();
      return;
    }

    this.actionTimer = 0;

    // 1. 通常攻撃
    if (act.type === 'attack') {
      this.addMessage(`${act.actor.name}の 攻撃！`);
      this.game.audio.playSlash();
      const dmg = Math.max(1, Math.floor((act.actor.atk * act.actor.buffAtk * 1.4) - (act.target.def * act.target.buffDef * 0.7) + (Math.random() * 4 - 2)));
      act.target.hp = Math.max(0, act.target.hp - dmg);
      this.effect = { type: 'slash', target: act.target, progress: 0 };
      const tPos = getEnemyPos(act.target.index, act.target.isBoss);
      this.addFloatingText(`-${dmg}`, tPos.floatX, tPos.floatY, '#ff4444');

      setTimeout(() => {
        this.effect = null;
        if (act.target.hp <= 0) {
          this.addMessage(`${act.target.name}を 倒した！`);
          this.game.audio.playEnemyDead();
        }
        setTimeout(() => this.executeNextAction(), 400);
      }, 500);
    }
    // 2. 技・術
    else if (act.type === 'skill') {
      const skill = GAME_DATA.skills[act.skillKey] || { name: '技', mpCost: 0, power: 1.0, effectType: 'slash', target: 'enemy_single' };
      act.actor.mp -= (skill.mpCost || 0);
      this.addMessage(`${act.actor.name}は【${skill.name}】を放った！`);

      if (skill.effectType === 'heal') {
        this.game.audio.playHeal();
        const healAmt = skill.power + Math.floor(act.actor.matk * 1.2);
        if (skill.target === 'ally_all') {
          this.party.filter(p => p.hp > 0).forEach(p => {
            p.hp = Math.min(p.maxHp, p.hp + healAmt);
            const pPos = getHeroPos(p.row);
            this.addFloatingText(`+${healAmt}`, pPos.floatX, pPos.floatY, '#44ff88');
          });
        } else {
          act.target.hp = Math.min(act.target.maxHp, act.target.hp + healAmt);
          const tPos = getHeroPos(act.target.row);
          this.addFloatingText(`+${healAmt}`, tPos.floatX, tPos.floatY, '#44ff88');
        }
        this.effect = { type: 'heal', target: act.target, progress: 0 };
      }
      // H-1: 明鏡止水 (ATK+35% & SPD+25%)
      else if (skill.effectType === 'buff_atk_spd') {
        this.game.audio.playMagic();
        act.actor.buffAtk = 1.35;
        act.actor.buffSpd = 1.25;
        this.addMessage(`${act.actor.name}の 攻撃力と素早さが高まった！`);
        this.effect = { type: 'buff', target: act.actor, progress: 0 };
      }
      // H-1: 清めの結界 (味方全体DEF+35%)
      else if (skill.effectType === 'buff_def_all') {
        this.game.audio.playMagic();
        this.party.filter(p => p.hp > 0).forEach(p => {
          p.buffDef = 1.35;
          const pPos = getHeroPos(p.row);
          this.addFloatingText('DEF UP!', pPos.floatX, pPos.floatY, '#ffd700');
        });
        this.addMessage('千歳杉の神気結界が 味方全員の防御力を高めた！');
        this.effect = { type: 'buff', target: act.actor, progress: 0 };
      }
      // H-1: 変わり身の術 (完全回避フラグ)
      else if (skill.effectType === 'evasion') {
        this.game.audio.playMagic();
        act.actor.hasEvasion = true;
        this.addMessage(`${act.actor.name}は 変わり身の構えをとった！`);
        this.effect = { type: 'buff', target: act.actor, progress: 0 };
      }
      // 単体・全体攻撃術
      else {
        this.game.audio.playMagic();
        const isAll = skill.target === 'enemy_all';
        const targets = isAll ? this.enemies.filter(e => e.hp > 0) : [act.target];

        targets.forEach(tgt => {
          const dmg = Math.max(1, Math.floor((act.actor.matk * 1.8 * skill.power) - (tgt.def * 0.4) + (Math.random() * 6 - 3)));
          tgt.hp = Math.max(0, tgt.hp - dmg);
          const tPos = getEnemyPos(tgt.index, tgt.isBoss);
          this.addFloatingText(`-${dmg}`, tPos.floatX, tPos.floatY, '#ffea66');
        });
        this.effect = { type: skill.effectType, target: act.target, progress: 0 };
      }

      setTimeout(() => {
        this.effect = null;
        this.enemies.filter(e => e.hp <= 0).forEach(e => {
          this.addMessage(`${e.name}を 倒した！`);
          this.game.audio.playEnemyDead();
        });
        setTimeout(() => this.executeNextAction(), 450);
      }, 600);
    }
    // 3. どうぐ使用 (C-2 実装)
    else if (act.type === 'item') {
      const item = GAME_DATA.items[act.itemIndex] || { name: 'どうぐ', count: 0, type: 'heal_hp', value: 30 };
      if (item.count <= 0) {
        this.addMessage(`${item.name}が 足りない！`);
        this.executeNextAction();
        return;
      }
      item.count--;
      this.addMessage(`${act.actor.name}は【${item.name}】を使った！`);

      if (item.type === 'heal_hp') {
        this.game.audio.playHeal();
        act.target.hp = Math.min(act.target.maxHp, act.target.hp + item.value);
        this.effect = { type: 'heal', target: act.target, progress: 0 };
        const tPos = getHeroPos(act.target.row);
        this.addFloatingText(`+${item.value}`, tPos.floatX, tPos.floatY, '#44ff88');
        this.addMessage(`${act.target.name}の HPが ${item.value} 回復した！`);
      } else if (item.type === 'heal_mp') {
        this.game.audio.playHeal();
        act.target.mp = Math.min(act.target.maxMp, act.target.mp + item.value);
        this.effect = { type: 'heal', target: act.target, progress: 0 };
        const tPos = getHeroPos(act.target.row);
        this.addFloatingText(`+${item.value}MP`, tPos.floatX, tPos.floatY, '#44aaff');
        this.addMessage(`${act.target.name}の MPが ${item.value} 回復した！`);
      } else if (item.type === 'revive') {
        this.game.audio.playVictory();
        const recoverHp = Math.floor(act.target.maxHp * (item.value || 0.5));
        act.target.hp = recoverHp;
        this.effect = { type: 'holy', target: act.target, progress: 0 };
        const tPos = getHeroPos(act.target.row);
        this.addFloatingText(`復活! +${recoverHp}`, tPos.floatX, tPos.floatY, '#ffd700');
        this.addMessage(`${act.target.name}は 息を吹き返した！`);
      }

      setTimeout(() => {
        this.effect = null;
        this.executeNextAction();
      }, 600);
    }
    // 4. 敵の行動 (M-4 修正: heal/defend/luck 分岐)
    else if (act.type === 'enemy_action') {
      const actData = act.actionData || { name: '攻撃', type: 'attack', power: 1.0 };
      this.addMessage(`${act.actor.name}の【${actData.name}】！`);

      // 敵の回復行動 (例: 木霊の森の癒し)
      if (actData.type === 'heal') {
        this.game.audio.playHeal();
        const hurtEnemy = this.enemies.find(e => e.hp > 0 && e.hp < e.maxHp) || act.actor;
        const healAmt = Math.max(12, Math.floor(hurtEnemy.maxHp * (actData.power || 0.35)));
        hurtEnemy.hp = Math.min(hurtEnemy.maxHp, hurtEnemy.hp + healAmt);
        this.effect = { type: 'heal', target: hurtEnemy, progress: 0 };
        const hPos = getEnemyPos(hurtEnemy.index, hurtEnemy.isBoss);
        this.addFloatingText(`+${healAmt}`, hPos.floatX, hPos.floatY, '#44ff88');
        this.addMessage(`${hurtEnemy.name}の HPが ${healAmt} 回復した！`);

        setTimeout(() => {
          this.effect = null;
          setTimeout(() => this.executeNextAction(), 400);
        }, 500);
        return;
      }
      // 敵の防御行動 (例: ぬりかべの鉄壁の構え)
      else if (actData.type === 'defend') {
        this.game.audio.playMagic();
        act.actor.buffDef = 1.45;
        this.effect = { type: 'buff', target: act.actor, progress: 0 };
        const aPos = getEnemyPos(act.actor.index, act.actor.isBoss);
        this.addFloatingText('DEF UP!', aPos.floatX, aPos.floatY, '#ffd700');
        this.addMessage(`${act.actor.name}は 守りを固め防御力が高まった！`);

        setTimeout(() => {
          this.effect = null;
          setTimeout(() => this.executeNextAction(), 400);
        }, 500);
        return;
      }
      // 敵の福授け・強化行動 (例: 座敷童子の福授け)
      else if (actData.type === 'luck') {
        this.game.audio.playMagic();
        act.actor.buffAtk = 1.3;
        act.actor.buffSpd = 1.3;
        this.effect = { type: 'holy', target: act.actor, progress: 0 };
        const aPos = getEnemyPos(act.actor.index, act.actor.isBoss);
        this.addFloatingText('ALL UP!', aPos.floatX, aPos.floatY, '#ffd700');
        this.addMessage(`${act.actor.name}に 神気と福が宿った！`);

        setTimeout(() => {
          this.effect = null;
          setTimeout(() => this.executeNextAction(), 400);
        }, 500);
        return;
      }

      // 通常攻撃・属性攻撃行動 (変わり身回避判定)
      if (act.target.hasEvasion) {
        act.target.hasEvasion = false;
        this.game.audio.playTone(440, 0.1, 'sine', 0, this.game.audio.seGain, 0.01, 0.05);
        this.addMessage(`しかし ${act.target.name}は 丸太に変わり身して 攻撃をかわした！`);
        const tPos = getHeroPos(act.target.row);
        this.addFloatingText('完全回避!', tPos.floatX, tPos.floatY, '#00ffff');
        setTimeout(() => this.executeNextAction(), 600);
        return;
      }

      this.game.audio.playHit();
      const mult = actData.power || 1.0;
      const dmg = Math.max(1, Math.floor((act.actor.atk * (act.actor.buffAtk || 1.0) * mult * 1.2) - (act.target.def * (act.target.buffDef || 1.0) * 0.6) + (Math.random() * 4 - 2)));
      act.target.hp = Math.max(0, act.target.hp - dmg);
      this.effect = { type: actData.type || 'slash', target: act.target, progress: 0 };
      const tPos = getHeroPos(act.target.row);
      this.addFloatingText(`-${dmg}`, tPos.floatX, tPos.floatY, '#ff4444');

      setTimeout(() => {
        this.effect = null;
        if (act.target.hp <= 0) {
          this.addMessage(`${act.target.name}は 倒れた……！`);
        }
        setTimeout(() => this.executeNextAction(), 400);
      }, 500);
    } else {
      this.executeNextAction();
    }
  }

  // ==========================================
  // 戦闘終了判定＆成長・所持金反映 (C-1, C-4 修正)
  // ==========================================
  checkBattleEnd() {
    const allEnemiesDead = this.enemies.every(e => e.hp <= 0);
    const allHeroesDead = this.party.every(p => p.hp <= 0);

    if (allEnemiesDead) {
      this.state = 'VICTORY';
      this.game.audio.playVictory();
      let totalExp = 0; let totalMoney = 0;
      this.enemies.forEach(e => { totalExp += e.exp || 10; totalMoney += e.money || 10; });

      // C-4: 所持金の永続加算
      GAME_DATA.money = (GAME_DATA.money || 0) + totalMoney;
      this.addMessage('【 戦闘に勝利した！ 】');
      this.addMessage(`経験値 ${totalExp} と ${totalMoney}文 を手に入れた！（所持金: ${GAME_DATA.money}文）`);

      // C-1: レベルアップ処理とステータス上昇
      this.party.forEach(p => {
        if (p.hp > 0) {
          p.exp += totalExp;
          while (p.exp >= p.nextExp && p.level < 10) {
            p.level++;
            p.maxHp += 12; p.hp = p.maxHp;
            p.maxMp += 6; p.mp = p.maxMp;
            p.atk += 4; p.def += 3; p.matk += 3; p.spd += 2;
            p.nextExp = Math.floor(p.nextExp * 1.8);
            this.addMessage(`${p.name}は Lv.${p.level} に上がった！`);

            const learn = p.skillLearns?.find(l => l.level === p.level);
            if (learn && !p.skills.includes(learn.skillId)) {
              p.skills.push(learn.skillId);
              this.addMessage(`【${learn.name}】を会得した！`);
            }
          }
        }
      });

      // C-1: GAME_DATA.party へ完全同期！
      this.syncPartyToGameData();
      return true;
    }

    if (allHeroesDead) {
      this.state = 'DEFEAT';
      this.game.audio.stopBgm();
      this.addMessage('【 全滅してしまった…… 】');
      this.addMessage('千歳杉の神気が、そなたらを白鷺神社へと導く……');
      this.syncPartyToGameData();
      return true;
    }

    return false;
  }

  // ==========================================
  // 描画処理 (1280x960 ハイレゾHD-2D版・新王道レイアウト)
  // ==========================================
  render(ctx) {
    const font = this.game.graphics.fontFamily;
    this.game.graphics.drawBattleBackground(ctx, 1280, 960, this.bgType);

    // 1. 敵魔物 (128x128 / ボス192x192)
    this.enemies.forEach((enemy, idx) => {
      if (enemy.hp <= 0) return;
      const pos = getEnemyPos(enemy.index !== undefined ? enemy.index : idx, enemy.isBoss);
      const sprite = this.game.graphics.sprites[enemy.spriteKey] || this.game.graphics.sprites.karakasa;
      if (sprite) {
        const floatY = Math.sin(this.animTimer * 2 + idx) * 6;
        ctx.drawImage(sprite, pos.spriteX, pos.spriteY + floatY);
      }
      this.game.graphics.drawCrispText(ctx, enemy.name, pos.spriteX - 20, pos.spriteY - 18, `bold 44px ${font}`, '#ffeed0', '#000', 4);
    });

    // 2. プレイヤーパーティ (128x128 スプライト & 横並びステータスカード)
    this.party.forEach((hero, idx) => {
      const pos = getHeroPos(hero.row !== undefined ? hero.row : idx);
      const isDead = hero.hp <= 0;
      const isAct = (this.state === 'INPUT' && this.currentActorIndex === idx);

      // スプライト描画
      const spriteKey = isDead ? `${hero.spriteKey}_battle_hit` : `${hero.spriteKey}_battle_idle`;
      const sprite = this.game.graphics.sprites[spriteKey];
      if (sprite) ctx.drawImage(sprite, pos.spriteX, pos.spriteY);

      // ステータスカード背景 (現在行動中キャラは黄金枠ハイライト点灯)
      ctx.fillStyle = isAct ? 'rgba(42, 28, 54, 0.95)' : 'rgba(18, 12, 24, 0.88)';
      ctx.fillRect(pos.cardX, pos.cardY, pos.cardW, pos.cardH);
      ctx.strokeStyle = isAct ? '#ffd666' : (isDead ? '#443344' : '#6b5030');
      ctx.lineWidth = isAct ? 3.5 : 2;
      ctx.strokeRect(pos.cardX, pos.cardY, pos.cardW, pos.cardH);

      // 名前表示 (行動中キャラは「▶」付き黄金色)
      const nameColor = isDead ? '#776677' : (isAct ? '#ffd666' : '#ffeed0');
      const namePrefix = isAct ? '▶ ' : '';
      this.game.graphics.drawCrispText(ctx, `${namePrefix}${hero.name}`, pos.cardX + 16, pos.cardY + 46, `bold 44px ${font}`, nameColor, '#000', 4);

      // HPバーゲージ
      const barX = pos.cardX + 16;
      const barY = pos.cardY + 62;
      const barW = pos.cardW - 32;
      const barH = 12;
      ctx.fillStyle = '#2a1a1a';
      ctx.fillRect(barX, barY, barW, barH);
      const hpRatio = Math.max(0, Math.min(1, hero.hp / hero.maxHp));
      ctx.fillStyle = hero.hp < hero.maxHp * 0.25 ? '#ff4444' : (hero.hp < hero.maxHp * 0.5 ? '#ffbb33' : '#44dd66');
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
      ctx.strokeStyle = '#553e20';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX, barY, barW, barH);

      // HP / MP 数値表示 (42px)
      const hpColor = hero.hp < hero.maxHp * 0.25 ? '#ff6666' : '#ffffff';
      this.game.graphics.drawCrispText(ctx, `H:${hero.hp}/${hero.maxHp}`, pos.cardX + 16, pos.cardY + 120, `bold 40px ${font}`, hpColor, '#000', 3.5);
      this.game.graphics.drawCrispText(ctx, `M:${hero.mp}`, pos.cardX + 224, pos.cardY + 120, `bold 40px ${font}`, '#88ccff', '#000', 3.5);
    });

    // 3. エフェクト描画 (座標ヘルパーに完全連動)
    if (this.effect) {
      const eff = this.effect;
      eff.progress = Math.min(1, eff.progress + 0.08);
      let tx = 640; let ty = 480;
      if (eff.target && eff.target.row !== undefined) {
        const pos = getHeroPos(eff.target.row);
        tx = pos.centerX; ty = pos.centerY;
      } else if (eff.target && eff.target.index !== undefined) {
        const pos = getEnemyPos(eff.target.index, eff.target.isBoss);
        tx = pos.centerX; ty = pos.centerY;
      }

      if (eff.type === 'slash' || eff.type === 'slash_heavy') this.game.graphics.drawSlashEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'tornado') this.game.graphics.drawTornadoEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'holy') this.game.graphics.drawHolyEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'holy_pillar') this.game.graphics.drawHolyPillarEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'fire' || eff.type === 'foxfire') this.game.graphics.drawFireEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'blizzard') this.game.graphics.drawBlizzardEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'ice_spear') this.game.graphics.drawIceSpearEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'water') this.game.graphics.drawWaterWaveEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'thunder') this.game.graphics.drawThunderEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'purple_lightning') this.game.graphics.drawPurpleLightningEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'dark_slash') this.game.graphics.drawDarkSlashEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'heal') this.game.graphics.drawHealEffect(ctx, tx, ty, eff.progress);
      else if (eff.type === 'buff') this.game.graphics.drawBuffEffect(ctx, tx, ty, eff.progress);
    }

    // 4. フローティングテキスト (特大48px)
    this.floatingTexts.forEach(ft => {
      this.game.graphics.drawCrispText(ctx, ft.text, ft.x, ft.y, `bold 48px ${font}`, ft.color, '#000', 4.5);
    });

    // 5. 下部UI
    this.renderBattleUI(ctx);
  }

  // ==========================================
  // 戦闘UI描画 (新設計・56px特大フォント版)
  // ==========================================
  renderBattleUI(ctx) {
    const font = this.game.graphics.fontFamily;
    const actHero = this.party[this.currentActorIndex] || this.party[0];

    // メッセージウィンドウ (2〜3行で56pxゆったり表示)
    this.game.graphics.drawUrushiFrame(ctx, 24, 580, 760, 360, '戦況');
    const msgCount = Math.min(3, this.messageLog.length);
    for (let i = 0; i < msgCount; i++) {
      this.game.graphics.drawCrispText(ctx, this.messageLog[i], 56, 672 + i * 86, `bold 46px ${font}`, '#fcfaf2', '#0c0812', 4);
    }

    // コマンドウィンドウ
    if (this.state === 'INPUT') {
      if (this.menuState === 'MAIN') {
        this.game.graphics.drawUrushiFrame(ctx, 804, 580, 452, 360, `${actHero.name}`);
        this.mainMenu.forEach((item, idx) => {
          const isSel = this.selectedActionIndex === idx;
          const col = isSel ? '#ffd666' : '#eee';
          this.game.graphics.drawCrispText(ctx, (isSel ? '▶ ' : '  ') + item, 836, 664 + idx * 74, `bold 52px ${font}`, col, '#16101c', 4);
        });
      } else if (this.menuState === 'SKILL') {
        this.game.graphics.drawUrushiFrame(ctx, 280, 580, 976, 360, '技・術選択');
        actHero.skills.forEach((skKey, idx) => {
          const sk = GAME_DATA.skills[skKey] || { name: '技', mpCost: 0, desc: '' };
          const isSel = this.selectedSubIndex === idx;
          const col = isSel ? '#ffd666' : '#eee';
          this.game.graphics.drawCrispText(ctx, `${isSel ? '▶ ' : '  '}${sk.name} (${sk.mpCost}MP)`, 320, 664 + idx * 64, `bold 44px ${font}`, col, '#16101c', 4);
        });
      } else if (this.menuState === 'ITEM') {
        this.game.graphics.drawUrushiFrame(ctx, 280, 580, 976, 360, 'どうぐ選択');
        GAME_DATA.items.forEach((item, idx) => {
          const isSel = this.selectedSubIndex === idx;
          const col = isSel ? '#ffd666' : (item.count > 0 ? '#eee' : '#888');
          this.game.graphics.drawCrispText(ctx, `${isSel ? '▶ ' : '  '}${item.name} x${item.count} (${item.desc})`, 310, 664 + idx * 64, `bold 42px ${font}`, col, '#16101c', 4);
        });
      } else if (this.menuState === 'TARGET_ENEMY') {
        this.game.graphics.drawUrushiFrame(ctx, 804, 580, 452, 360, '対象選択');
        this.game.graphics.drawCrispText(ctx, '【対象をタップ】', 836, 700, `bold 46px ${font}`, '#ffd666', '#000', 4);
        this.game.graphics.drawCrispText(ctx, 'または上下で選択', 836, 780, `bold 38px ${font}`, '#d0c8e0', '#000', 3.5);
      } else if (this.menuState === 'TARGET_ALLY') {
        this.game.graphics.drawUrushiFrame(ctx, 804, 580, 452, 360, '味方選択');
        this.game.graphics.drawCrispText(ctx, '【味方をタップ】', 836, 700, `bold 46px ${font}`, '#ffd666', '#000', 4);
        this.game.graphics.drawCrispText(ctx, 'または上下で選択', 836, 780, `bold 38px ${font}`, '#d0c8e0', '#000', 3.5);
      } else if (this.menuState === 'TARGET_ALLY_REVIVE') {
        this.game.graphics.drawUrushiFrame(ctx, 804, 580, 452, 360, '蘇生対象');
        this.game.graphics.drawCrispText(ctx, '【仲間を選択】', 836, 720, `bold 46px ${font}`, '#ffd666', '#000', 4);
      }
    }
  }
}
