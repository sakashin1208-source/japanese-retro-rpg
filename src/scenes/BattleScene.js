import { Scene } from '../core/Scene.js';
import { VIEW_W, VIEW_H, COLORS, FONTS } from '../core/Constants.js';
import { MASTER } from '../data/MasterData.js';
import { BattleBackground } from '../gfx/BattleBackground.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';
import { Effects } from '../gfx/Effects.js';
import { UIStack } from '../ui/UIStack.js';
import { TargetSelectUI } from '../ui/TargetSelectUI.js';
import { ItemUI } from '../ui/ItemUI.js';

/**
 * 戦闘シーン (BattleScene) - 1280x960 最適化レイアウト
 */
export class BattleScene extends Scene {
  constructor(game) {
    super(game);
    this.background = new BattleBackground();
    this.uiStack = new UIStack();

    this.party = [];
    this.enemies = [];
    this.isBoss = false;
    this.bossId = null;
    this.areaType = 'plains';
    this.returnChapter = 1;
    this.onVictory = null;

    // ステートマシン
    this.phase = 'INTRO'; // INTRO, INPUT, ACTION_PLAYBACK, VICTORY, DEFEAT, ESCAPE
    this.phaseFrame = 0;

    // コマンド入力管理
    this.currentActorIndex = 0; // 入力中の味方インデックス (0, 1, 2)
    this.actionQueue = [];     // [{ actorRef, actionType, skill, item, targetRef }]
    this.commandCursor = 0;    // 0:こうげき, 1:わざ, 2:どうぐ, 3:にげる
    this.menuState = 'MAIN';   // MAIN, SKILL_SELECT

    // アクション演出再生用
    this.currentActionIndex = 0;
    this.playbackStep = null;
    this.actionSteps = [];
    this.floatingTexts = [];

    // メッセージログ
    this.messages = [];
  }

  enter(params = {}) {
    this.uiStack.clear();
    this.isBoss = !!params.isBoss;
    this.bossId = params.bossId || null;
    this.areaType = params.areaType || 'plains';
    this.returnChapter = params.returnChapter || this.game.state.currentChapter || 1;
    this.onVictory = params.onVictory || null;

    // 1. パーティの複製とバフ初期化 (全員 1.0)
    this.party = this.game.state.party.map((p, idx) => ({
      ...JSON.parse(JSON.stringify(p)),
      buffAtk: 1.0,
      buffDef: 1.0,
      buffSpd: 1.0,
      hasEvasion: false,
      isActing: false,
      animPose: 'idle',
      animTimer: 0
    }));

    // 2. 敵の生成とバフ初期化
    const enemyIds = params.enemyIds || ['karakasa'];
    this.enemies = enemyIds.map((id, idx) => {
      const masterEnemy = MASTER.enemies[id] || MASTER.enemies.karakasa;
      return {
        ...JSON.parse(JSON.stringify(masterEnemy)),
        uid: `${id}_${idx}_${Date.now()}`,
        index: idx,
        buffAtk: 1.0,
        buffDef: 1.0,
        buffSpd: 1.0,
        hasEvasion: false,
        animTimer: 0,
        shakeTimer: 0
      };
    });

    this.phase = 'INTRO';
    this.phaseFrame = 0;
    this.messages = [`妖怪が現れた！`];
    this.floatingTexts = [];

    this.game.audio?.playBgm?.('battle');
  }

  exit() {
    this.syncBack();
    this.uiStack.clear();
  }

  syncBack() {
    const FIELDS = ['hp', 'mp', 'maxHp', 'maxMp', 'level', 'exp', 'nextExp', 'atk', 'def', 'matk', 'spd'];
    this.party.forEach((p, i) => {
      const dst = this.game.state.party[i];
      if (dst) {
        FIELDS.forEach(f => {
          if (p[f] !== undefined) dst[f] = p[f];
        });
        dst.skills = [...p.skills];
      }
    });
  }

  addMessage(msg) {
    this.messages.push(msg);
    if (this.messages.length > 5) this.messages.shift();
  }

  addFloatingText(x, y, text, color = '#ffffff') {
    this.floatingTexts.push({ x, y, text, color, timer: 0, duration: 40 });
  }

  update(input, frame) {
    this.phaseFrame++;

    // フローティングテキスト更新
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.timer++;
      ft.y -= 1.2;
      if (ft.timer >= ft.duration) {
        this.floatingTexts.splice(i, 1);
      }
    }

    if (!this.uiStack.isEmpty) {
      this.uiStack.update(input, frame);
      return;
    }

    switch (this.phase) {
      case 'INTRO':
        if (this.phaseFrame >= 35) {
          this.beginInputPhase();
        }
        break;

      case 'INPUT':
        this.updateInputPhase(input);
        break;

      case 'ACTION_PLAYBACK':
        this.updateActionPlayback(input);
        break;

      case 'VICTORY':
        if (input.isPressed('CONFIRM') || this.phaseFrame >= 120) {
          this.finishVictory();
        }
        break;

      case 'DEFEAT':
        if (input.isPressed('CONFIRM') || this.phaseFrame >= 120) {
          this.finishDefeat();
        }
        break;

      case 'ESCAPE':
        if (input.isPressed('CONFIRM') || this.phaseFrame >= 60) {
          this.game.changeScene('MAP', { chapterId: this.returnChapter });
        }
        break;
    }
  }

  beginInputPhase() {
    this.phase = 'INPUT';
    this.phaseFrame = 0;
    this.currentActorIndex = 0;
    this.actionQueue = [];
    this.commandCursor = 0;
    this.menuState = 'MAIN';

    while (this.currentActorIndex < this.party.length && this.party[this.currentActorIndex].hp <= 0) {
      this.currentActorIndex++;
    }

    if (this.currentActorIndex >= this.party.length) {
      this.checkBattleEnd();
    }
  }

  updateInputPhase(input) {
    const actor = this.party[this.currentActorIndex];
    if (!actor || actor.hp <= 0) {
      this.advanceActorInput();
      return;
    }

    if (this.menuState === 'MAIN') {
      const commands = ['こうげき', 'わざ・じゅつ', 'どうぐ', 'にげる'];
      if (input.isPressed('UP')) {
        this.commandCursor = (this.commandCursor - 1 + commands.length) % commands.length;
        this.game.audio?.playCursor?.();
      } else if (input.isPressed('DOWN')) {
        this.commandCursor = (this.commandCursor + 1) % commands.length;
        this.game.audio?.playCursor?.();
      }

      if (input.isPressed('CONFIRM')) {
        this.executeCommandChoice(this.commandCursor);
      } else if (input.isPressed('CANCEL')) {
        this.revertActorInput();
      }
    } else if (this.menuState === 'SKILL_SELECT') {
      const skills = actor.skills.map(id => MASTER.skills[id]).filter(Boolean);
      if (input.isPressed('UP')) {
        this.skillCursor = (this.skillCursor - 1 + skills.length) % skills.length;
        this.game.audio?.playCursor?.();
      } else if (input.isPressed('DOWN')) {
        this.skillCursor = (this.skillCursor + 1) % skills.length;
        this.game.audio?.playCursor?.();
      }

      if (input.isPressed('CONFIRM')) {
        const skill = skills[this.skillCursor];
        if (skill) {
          if (actor.mp < skill.mpCost) {
            this.addMessage('MPが足りません！');
            this.game.audio?.playCancel?.();
            return;
          }
          this.chooseSkillTarget(actor, skill);
        }
      } else if (input.isPressed('CANCEL')) {
        this.menuState = 'MAIN';
        this.game.audio?.playCancel?.();
      }
    }
  }

  executeCommandChoice(cmdIndex) {
    const actor = this.party[this.currentActorIndex];
    this.game.audio?.playDecide?.();

    if (cmdIndex === 0) {
      // こうげき
      const aliveEnemies = this.enemies.filter(e => e.hp > 0);
      this.uiStack.push(new TargetSelectUI({
        title: '攻撃対象を選択',
        side: 'enemy',
        targets: aliveEnemies,
        onSelect: (target) => {
          this.uiStack.pop();
          this.actionQueue.push({
            actorRef: { side: 'party', index: this.currentActorIndex },
            actionType: 'attack',
            targetRef: { side: 'enemy', index: this.enemies.indexOf(target) }
          });
          this.advanceActorInput();
        },
        onCancel: () => {
          this.uiStack.pop();
          this.game.audio?.playCancel?.();
        }
      }));
    } else if (cmdIndex === 1) {
      // わざ・じゅつ
      this.menuState = 'SKILL_SELECT';
      this.skillCursor = 0;
    } else if (cmdIndex === 2) {
      // どうぐ
      this.uiStack.push(new ItemUI({
        state: this.game.state,
        party: this.party,
        uiStack: this.uiStack,
        audio: this.game.audio,
        isBattle: true,
        onUse: (item, targetIndex) => {
          this.uiStack.pop();
          item.count--;
          this.actionQueue.push({
            actorRef: { side: 'party', index: this.currentActorIndex },
            actionType: 'item',
            item: item,
            targetRef: { side: 'party', index: targetIndex }
          });
          this.advanceActorInput();
        },
        onCancel: () => {
          this.uiStack.pop();
          this.game.audio?.playCancel?.();
        }
      }));
    } else if (cmdIndex === 3) {
      // にげる
      if (this.isBoss) {
        this.addMessage('ボス戦からは逃げられない！');
        this.game.audio?.playCancel?.();
        return;
      }
      this.actionQueue.push({
        actorRef: { side: 'party', index: this.currentActorIndex },
        actionType: 'escape'
      });
      this.advanceActorInput();
    }
  }

  chooseSkillTarget(actor, skill) {
    if (skill.target === 'enemy_all') {
      this.actionQueue.push({
        actorRef: { side: 'party', index: this.currentActorIndex },
        actionType: 'skill',
        skill: skill,
        targetRef: { side: 'enemy', isAll: true }
      });
      this.menuState = 'MAIN';
      this.advanceActorInput();
    } else if (skill.target === 'self') {
      this.actionQueue.push({
        actorRef: { side: 'party', index: this.currentActorIndex },
        actionType: 'skill',
        skill: skill,
        targetRef: { side: 'party', index: this.currentActorIndex }
      });
      this.menuState = 'MAIN';
      this.advanceActorInput();
    } else if (skill.target === 'ally_all') {
      this.actionQueue.push({
        actorRef: { side: 'party', index: this.currentActorIndex },
        actionType: 'skill',
        skill: skill,
        targetRef: { side: 'party', isAll: true }
      });
      this.menuState = 'MAIN';
      this.advanceActorInput();
    } else if (skill.target === 'ally_single') {
      const aliveParty = this.party.filter(p => p.hp > 0);
      this.uiStack.push(new TargetSelectUI({
        title: `${skill.name}の対象`,
        side: 'party',
        targets: aliveParty,
        onSelect: (target) => {
          this.uiStack.pop();
          this.actionQueue.push({
            actorRef: { side: 'party', index: this.currentActorIndex },
            actionType: 'skill',
            skill: skill,
            targetRef: { side: 'party', index: this.party.indexOf(target) }
          });
          this.menuState = 'MAIN';
          this.advanceActorInput();
        },
        onCancel: () => {
          this.uiStack.pop();
          this.game.audio?.playCancel?.();
        }
      }));
    } else {
      const aliveEnemies = this.enemies.filter(e => e.hp > 0);
      this.uiStack.push(new TargetSelectUI({
        title: `${skill.name}の対象`,
        side: 'enemy',
        targets: aliveEnemies,
        onSelect: (target) => {
          this.uiStack.pop();
          this.actionQueue.push({
            actorRef: { side: 'party', index: this.currentActorIndex },
            actionType: 'skill',
            skill: skill,
            targetRef: { side: 'enemy', index: this.enemies.indexOf(target) }
          });
          this.menuState = 'MAIN';
          this.advanceActorInput();
        },
        onCancel: () => {
          this.uiStack.pop();
          this.game.audio?.playCancel?.();
        }
      }));
    }
  }

  advanceActorInput() {
    this.currentActorIndex++;
    while (this.currentActorIndex < this.party.length && this.party[this.currentActorIndex].hp <= 0) {
      this.currentActorIndex++;
    }

    if (this.currentActorIndex >= this.party.length) {
      this.startTurnExecution();
    } else {
      this.commandCursor = 0;
      this.menuState = 'MAIN';
    }
  }

  revertActorInput() {
    if (this.currentActorIndex > 0) {
      this.currentActorIndex--;
      while (this.currentActorIndex > 0 && this.party[this.currentActorIndex].hp <= 0) {
        this.currentActorIndex--;
      }
      this.actionQueue.pop();
      this.commandCursor = 0;
      this.menuState = 'MAIN';
      this.game.audio?.playCancel?.();
    }
  }

  startTurnExecution() {
    this.enemies.forEach((enemy, idx) => {
      if (enemy.hp <= 0) return;
      const action = this.pickEnemyAction(enemy);
      const aliveParty = this.party.filter(p => p.hp > 0);
      const target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
      if (target) {
        this.actionQueue.push({
          actorRef: { side: 'enemy', index: idx },
          actionType: 'enemy_action',
          action: action,
          targetRef: { side: 'party', index: this.party.indexOf(target) }
        });
      }
    });

    const getSpeed = (act) => {
      const actor = act.actorRef.side === 'party' ? this.party[act.actorRef.index] : this.enemies[act.actorRef.index];
      return (actor?.spd ?? 10) * (actor?.buffSpd ?? 1.0);
    };
    this.actionQueue.sort((a, b) => getSpeed(b) - getSpeed(a));

    this.phase = 'ACTION_PLAYBACK';
    this.currentActionIndex = 0;
    this.actionSteps = [];
    this.playbackStep = null;
    this.prepareNextAction();
  }

  pickEnemyAction(enemy) {
    if (!enemy.actions || enemy.actions.length === 0) {
      return { type: 'attack', name: '通常攻撃', power: 1.0 };
    }
    const total = enemy.actions.reduce((s, a) => s + (a.rate ?? 1), 0);
    let roll = Math.random() * total;
    for (const a of enemy.actions) {
      roll -= (a.rate ?? 1);
      if (roll <= 0) return a;
    }
    return enemy.actions[0];
  }

  prepareNextAction() {
    if (this.currentActionIndex >= this.actionQueue.length) {
      this.beginInputPhase();
      return;
    }

    const action = this.actionQueue[this.currentActionIndex];
    this.currentActionIndex++;

    const actor = action.actorRef.side === 'party' ? this.party[action.actorRef.index] : this.enemies[action.actorRef.index];
    if (!actor || actor.hp <= 0) {
      this.prepareNextAction();
      return;
    }

    this.actionSteps = this.buildActionSteps(action, actor);
    this.advanceStep();
  }

  buildActionSteps(action, actor) {
    const steps = [];

    if (action.actionType === 'escape') {
      const isSuccess = Math.random() < 0.65;
      steps.push({ type: 'msg', text: `${actor.name}は 逃げ出した！`, duration: 30 });
      if (isSuccess) {
        steps.push({ type: 'msg', text: '逃走に成功した！', duration: 30, onRun: () => { this.phase = 'ESCAPE'; this.phaseFrame = 0; } });
      } else {
        steps.push({ type: 'msg', text: 'しかし 逃げ切れなかった！', duration: 30 });
      }
      return steps;
    }

    if (action.actionType === 'item') {
      const target = this.party[action.targetRef.index];
      steps.push({ type: 'msg', text: `${actor.name}は 【${action.item.name}】を使った！`, duration: 30 });
      steps.push({
        type: 'item_effect',
        item: action.item,
        target: target,
        duration: 35,
        onRun: () => {
          this.applyItemEffect(action.item, target);
        }
      });
      return steps;
    }

    if (action.actionType === 'attack') {
      let target = this.enemies[action.targetRef.index];
      if (!target || target.hp <= 0) {
        target = this.enemies.find(e => e.hp > 0);
      }
      if (!target) return steps;

      steps.push({ type: 'msg', text: `${actor.name}の攻撃！`, duration: 25 });
      steps.push({
        type: 'attack_effect',
        actor: actor,
        target: target,
        effect: 'slash',
        duration: 30,
        onRun: () => {
          this.applyPhysicalAttack(actor, target);
        }
      });
      return steps;
    }

    if (action.actionType === 'skill') {
      const skill = action.skill;
      actor.mp = Math.max(0, actor.mp - skill.mpCost);
      steps.push({ type: 'msg', text: `${actor.name}の 【${skill.name}】！`, duration: 30 });

      if (skill.type === 'buff_self') {
        steps.push({
          type: 'buff_effect',
          actor: actor,
          effect: 'buff',
          duration: 30,
          onRun: () => {
            if (skill.id === 'meikyo_shisui') {
              actor.buffAtk = 1.35;
              actor.buffSpd = 1.25;
              this.addMessage(`${actor.name}の攻撃力と素早さが上がった！`);
            } else if (skill.id === 'kawarimi') {
              actor.hasEvasion = true;
              this.addMessage(`${actor.name}は変わり身の構えをとった！`);
            }
          }
        });
      } else if (skill.type === 'buff_all') {
        steps.push({
          type: 'buff_effect',
          actor: actor,
          effect: 'buff',
          duration: 35,
          onRun: () => {
            if (skill.id === 'kiyome_kekkai') {
              this.party.forEach(p => { if (p.hp > 0) p.buffDef = 1.35; });
              this.addMessage('味方全員の防御力が高まった！');
            }
          }
        });
      } else if (skill.type === 'heal' || skill.type === 'heal_all') {
        steps.push({
          type: 'heal_effect',
          actor: actor,
          skill: skill,
          targetRef: action.targetRef,
          duration: 35,
          onRun: () => {
            this.applyHealSkill(actor, skill, action.targetRef);
          }
        });
      } else {
        steps.push({
          type: 'skill_damage',
          actor: actor,
          skill: skill,
          targetRef: action.targetRef,
          duration: 40,
          onRun: () => {
            this.applySkillDamage(actor, skill, action.targetRef);
          }
        });
      }
      return steps;
    }

    if (action.actionType === 'enemy_action') {
      const act = action.action;
      let target = this.party[action.targetRef.index];
      if (!target || target.hp <= 0) {
        target = this.party.find(p => p.hp > 0);
      }
      if (!target) return steps;

      steps.push({ type: 'msg', text: `${actor.name}の 【${act.name}】！`, duration: 30 });

      if (act.type === 'heal') {
        steps.push({
          type: 'enemy_heal',
          actor: actor,
          duration: 30,
          onRun: () => {
            actor.hp = Math.min(actor.maxHp, actor.hp + (act.power || 30));
            this.addFloatingText(this.getEnemyX(actor.index), 240, `+${act.power || 30}`, COLORS.HP_GREEN);
            this.addMessage(`${actor.name}の傷が癒えた！`);
          }
        });
      } else if (act.type === 'defend') {
        steps.push({
          type: 'enemy_buff',
          actor: actor,
          duration: 30,
          onRun: () => {
            actor.buffDef = 1.5;
            this.addMessage(`${actor.name}は身を固めた！`);
          }
        });
      } else if (act.type === 'buff_self') {
        steps.push({
          type: 'enemy_buff',
          actor: actor,
          duration: 30,
          onRun: () => {
            actor.buffAtk = act.power || 1.4;
            this.addMessage(`${actor.name}の力が高まった！`);
          }
        });
      } else {
        steps.push({
          type: 'enemy_damage',
          actor: actor,
          target: target,
          action: act,
          duration: 35,
          onRun: () => {
            this.applyEnemyAttack(actor, target, act);
          }
        });
      }
      return steps;
    }

    return steps;
  }

  applyPhysicalAttack(actor, target) {
    const rand = Math.random() * 4 - 2;
    const base = actor.atk * actor.buffAtk * 1.4 - target.def * target.buffDef * 0.7;
    const dmg = Math.max(1, Math.floor(base + rand));

    target.hp = Math.max(0, target.hp - dmg);
    target.shakeTimer = 15;
    this.game.audio?.playHit?.();
    this.addFloatingText(this.getEnemyX(target.index), 240, `-${dmg}`, COLORS.GOLD_LIGHT);
    this.addMessage(`${target.name}に ${dmg} のダメージ！`);

    if (target.hp <= 0) {
      this.game.audio?.playEnemyDead?.();
      this.addMessage(`${target.name}を倒した！`);
    }
  }

  applySkillDamage(actor, skill, targetRef) {
    const rand = () => Math.random() * 6 - 3;
    const targets = targetRef.isAll ? this.enemies.filter(e => e.hp > 0) : [this.enemies[targetRef.index]].filter(Boolean);

    targets.forEach(target => {
      if (target.hp <= 0) return;

      let base = 0;
      if (skill.type === 'physical') {
        base = actor.atk * actor.buffAtk * 1.4 * skill.power - target.def * target.buffDef * 0.5;
      } else {
        base = actor.matk * 1.8 * skill.power - target.def * target.buffDef * 0.4;
      }
      const dmg = Math.max(1, Math.floor(base + rand()));

      target.hp = Math.max(0, target.hp - dmg);
      target.shakeTimer = 15;
      this.addFloatingText(this.getEnemyX(target.index), 240, `-${dmg}`, COLORS.GOLD_LIGHT);
      this.addMessage(`${target.name}に ${dmg} のダメージ！`);

      if (target.hp <= 0) {
        this.game.audio?.playEnemyDead?.();
        this.addMessage(`${target.name}を倒した！`);
      }
    });

    this.game.audio?.playSlash?.();
  }

  applyHealSkill(actor, skill, targetRef) {
    const targets = targetRef.isAll ? this.party.filter(p => p.hp > 0) : [this.party[targetRef.index]].filter(Boolean);
    const healAmount = skill.power + Math.floor(actor.matk * 1.2);

    targets.forEach(target => {
      target.hp = Math.min(target.maxHp, target.hp + healAmount);
      this.addFloatingText(820, this.getHeroY(this.party.indexOf(target)) + 30, `+${healAmount}`, COLORS.HP_GREEN);
      this.addMessage(`${target.name}のHPが ${healAmount} 回復！`);
    });
    this.game.audio?.playHeal?.();
  }

  applyItemEffect(item, target) {
    const pIdx = this.party.indexOf(target);
    const py = this.getHeroY(pIdx) + 30;

    if (item.type === 'heal_hp') {
      target.hp = Math.min(target.maxHp, target.hp + item.value);
      this.addFloatingText(820, py, `+${item.value}`, COLORS.HP_GREEN);
      this.addMessage(`${target.name}のHPが ${item.value} 回復！`);
    } else if (item.type === 'heal_mp') {
      target.mp = Math.min(target.maxMp, target.mp + item.value);
      this.addFloatingText(820, py, `+${item.value}MP`, COLORS.MP_BLUE);
      this.addMessage(`${target.name}のMPが ${item.value} 回復！`);
    } else if (item.type === 'revive') {
      target.hp = Math.floor(target.maxHp * item.value);
      this.addFloatingText(820, py, `蘇生！`, COLORS.GOLD_LIGHT);
      this.addMessage(`${target.name}が息を吹き返した！`);
    }
    this.game.audio?.playHeal?.();
  }

  applyEnemyAttack(actor, target, action) {
    const pIdx = this.party.indexOf(target);
    const py = this.getHeroY(pIdx) + 30;

    if (target.hasEvasion) {
      target.hasEvasion = false;
      this.addMessage(`${target.name}は変わり身の術で攻撃をかわした！`);
      this.addFloatingText(820, py, `回避！`, COLORS.GOLD_LIGHT);
      return;
    }

    const rand = Math.random() * 4 - 2;
    const power = action.power || 1.0;
    const base = actor.atk * (actor.buffAtk || 1.0) * power * 1.2 - target.def * target.buffDef * 0.6;
    const dmg = Math.max(1, Math.floor(base + rand));

    target.hp = Math.max(0, target.hp - dmg);
    target.animPose = 'hit';
    target.animTimer = 15;
    this.game.audio?.playHit?.();
    this.addFloatingText(820, py, `-${dmg}`, COLORS.VERMILION_BRIGHT);
    this.addMessage(`${target.name}は ${dmg} のダメージを受けた！`);

    if (target.hp <= 0) {
      this.addMessage(`${target.name}は倒れた！`);
    }
  }

  advanceStep() {
    if (this.actionSteps.length === 0) {
      this.playbackStep = null;
      if (this.checkBattleEnd()) return;
      this.prepareNextAction();
      return;
    }

    this.playbackStep = this.actionSteps.shift();
    this.playbackStep.timer = 0;
    this.playbackStep.onRun?.();
  }

  updateActionPlayback(input) {
    if (!this.playbackStep) {
      this.advanceStep();
      return;
    }

    const speed = input.isDown('CONFIRM') ? 3 : 1;
    this.playbackStep.timer += speed;

    if (this.playbackStep.timer >= this.playbackStep.duration) {
      this.advanceStep();
    }
  }

  checkBattleEnd() {
    const aliveEnemies = this.enemies.filter(e => e.hp > 0);
    const aliveParty = this.party.filter(p => p.hp > 0);

    if (aliveEnemies.length === 0) {
      this.phase = 'VICTORY';
      this.phaseFrame = 0;
      this.game.audio?.playVictory?.();

      let totalExp = 0;
      let totalMoney = 0;
      this.enemies.forEach(e => {
        totalExp += e.exp || 0;
        totalMoney += e.money || 0;
      });

      this.game.state.money += totalMoney;
      this.addMessage(`戦闘に勝利した！`);
      this.addMessage(`経験値 ${totalExp} と ${totalMoney} 文を獲得！`);

      aliveParty.forEach(p => {
        p.exp += totalExp;
        while (p.level < 10 && p.exp >= p.nextExp) {
          p.level++;
          p.maxHp += 12;
          p.maxMp += 6;
          p.atk += 4;
          p.def += 3;
          p.matk += 3;
          p.spd += 2;
          p.hp = p.maxHp;
          p.mp = p.maxMp;
          p.nextExp = Math.floor(p.nextExp * 1.8);
          this.addMessage(`${p.name}は レベル ${p.level} に上がった！`);

          if (p.skillLearns) {
            p.skillLearns.forEach(learn => {
              if (learn.level === p.level && !p.skills.includes(learn.skillId)) {
                p.skills.push(learn.skillId);
                this.addMessage(`${p.name}は 【${learn.name}】を習得した！`);
              }
            });
          }
        }
      });
      return true;
    }

    if (aliveParty.length === 0) {
      this.phase = 'DEFEAT';
      this.phaseFrame = 0;
      this.addMessage(`パーティは全滅してしまった……`);
      return true;
    }

    return false;
  }

  finishVictory() {
    this.onVictory?.();
    if (this.phase !== 'ENDING') {
      this.game.changeScene('MAP', { chapterId: this.returnChapter });
    }
  }

  finishDefeat() {
    this.party.forEach(p => {
      p.hp = p.maxHp;
      p.mp = p.maxMp;
    });
    this.syncBack();
    const chapData = MASTER.chapters.find(c => c.id === this.returnChapter) || MASTER.chapters[0];
    this.game.changeScene('MAP', {
      chapterId: this.returnChapter,
      gridX: chapData.revive.x,
      gridY: chapData.revive.y,
      facing: chapData.revive.facing
    });
  }

  getEnemyX(idx) {
    return this.enemies.length === 1 ? 280 : 160 + idx * 220;
  }

  getHeroY(idx) {
    return 70 + idx * 155;
  }

  handleTap(x, y) {
    if (!this.uiStack.isEmpty) {
      this.uiStack.handleTap(x, y);
      return;
    }

    // コマンドタップ判定 (右下 804, 580, 452, 360)
    if (this.phase === 'INPUT' && this.menuState === 'MAIN') {
      const boxX = 804;
      const boxY = 580;
      const cmdH = 74;

      for (let i = 0; i < 4; i++) {
        const cy = boxY + 60 + i * cmdH;
        if (x >= boxX && x <= boxX + 452 && y >= cy && y <= cy + cmdH) {
          this.commandCursor = i;
          this.executeCommandChoice(i);
          return;
        }
      }
    } else if (this.phase === 'INPUT' && this.menuState === 'SKILL_SELECT') {
      const actor = this.party[this.currentActorIndex];
      const skills = actor.skills.map(id => MASTER.skills[id]).filter(Boolean);
      const boxX = 280;
      const boxY = 580;
      const itemH = 64;

      for (let i = 0; i < skills.length; i++) {
        const sy = boxY + 60 + i * itemH;
        if (x >= boxX && x <= boxX + 976 && y >= sy && y <= sy + itemH) {
          this.skillCursor = i;
          const skill = skills[i];
          if (actor.mp < skill.mpCost) {
            this.addMessage('MPが足りません！');
            this.game.audio?.playCancel?.();
            return;
          }
          this.chooseSkillTarget(actor, skill);
          return;
        }
      }
    } else if (['INTRO', 'VICTORY', 'DEFEAT', 'ESCAPE'].includes(this.phase)) {
      this.phaseFrame += 30;
    }
  }

  render(ctx, frame) {
    // 1. 戦闘背景描画
    let bgType = 'night';
    if (this.areaType === 'snow_mountain') bgType = 'snow';
    else if (this.areaType === 'lake_underwater') bgType = 'lake';
    else if (this.returnChapter === 3 || this.areaType === 'tokoyo_corridor') bgType = 'tokoyo';
    this.background.draw(ctx, bgType);

    // 2. 敵魔物スプライト描画 (上部左側)
    this.enemies.forEach((enemy, i) => {
      if (enemy.hp <= 0) return;
      const ex = this.getEnemyX(i);
      const ey = 300;
      const sprite = this.game.graphics?.sprites?.[enemy.spriteKey];
      if (sprite) {
        let ox = 0;
        if (enemy.shakeTimer > 0) {
          enemy.shakeTimer--;
          ox = (enemy.shakeTimer % 2 === 0 ? 10 : -10);
        }
        const size = enemy.isBoss ? 192 : 128;
        ctx.drawImage(sprite, ex - size / 2 + ox, ey - size / 2, size, size);
      }

      // 敵名 (フチ取り付き・28px)
      this.game.graphics?.drawCrispText(ctx, enemy.name, ex, ey + 100, `bold 28px ${FONTS.MAIN}`, COLORS.TEXT_LIGHT, '#000', 3.5, 'center');
    });

    // 3. 味方キャラ ＆ ステータスカード描画 (上部右側)
    this.party.forEach((hero, i) => {
      const isDead = hero.hp <= 0;
      const isActing = this.currentActorIndex === i && this.phase === 'INPUT';
      const hy = this.getHeroY(i);

      // スプライト描画 (128x128)
      let pose = hero.animPose || 'idle';
      if (hero.animTimer > 0) {
        hero.animTimer--;
        if (hero.animTimer === 0) hero.animPose = 'idle';
      }
      const spriteKey = isDead ? `${hero.spriteKey}_battle_hit` : (pose !== 'idle' ? `${hero.spriteKey}_battle_${pose}` : `${hero.spriteKey}_battle_idle`);
      const sprite = this.game.graphics?.sprites?.[spriteKey] || this.game.graphics?.sprites?.[`${hero.spriteKey}_battle_idle`];
      if (sprite) {
        ctx.save();
        if (isDead) ctx.globalAlpha = 0.45;
        ctx.drawImage(sprite, 620, hy, 128, 128);
        ctx.restore();
      }

      // ステータスカード (x: 760, w: 480, h: 140)
      const cardX = 760;
      const cardY = hy;
      const cardW = 480;
      const cardH = 140;

      ctx.save();
      ctx.fillStyle = isActing ? 'rgba(42, 28, 54, 0.95)' : 'rgba(18, 12, 24, 0.88)';
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = isActing ? COLORS.GOLD_LIGHT : (isDead ? '#443344' : COLORS.GOLD_BORDER);
      ctx.lineWidth = isActing ? 3.5 : 2;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      // 名前
      const nameColor = isDead ? '#776677' : (isActing ? COLORS.GOLD_LIGHT : COLORS.TEXT_LIGHT);
      this.game.graphics?.drawCrispText(ctx, (isActing ? '▶ ' : '') + hero.name.split('（')[0], cardX + 20, cardY + 36, `bold 28px ${FONTS.MAIN}`, nameColor, '#000', 3.5);

      // Lv
      this.game.graphics?.drawCrispText(ctx, `Lv.${hero.level}`, cardX + 380, cardY + 36, `bold 22px ${FONTS.MAIN}`, COLORS.TEXT_MUTED, '#000', 3);

      // HPバー
      const barX = cardX + 20;
      const barY = cardY + 48;
      const barW = cardW - 40;
      const barH = 12;
      ctx.fillStyle = '#2a1a1a';
      ctx.fillRect(barX, barY, barW, barH);
      const hpRatio = Math.max(0, Math.min(1, hero.hp / hero.maxHp));
      ctx.fillStyle = hero.hp < hero.maxHp * 0.25 ? COLORS.VERMILION_BRIGHT : (hero.hp < hero.maxHp * 0.5 ? COLORS.GOLD_LIGHT : COLORS.HP_GREEN);
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      // HP/MP 数値表示
      const hpColor = hero.hp < hero.maxHp * 0.25 ? COLORS.VERMILION_BRIGHT : COLORS.WHITE;
      this.game.graphics?.drawCrispText(ctx, `HP: ${hero.hp}/${hero.maxHp}`, cardX + 20, cardY + 104, `bold 24px ${FONTS.MAIN}`, hpColor, '#000', 3);
      this.game.graphics?.drawCrispText(ctx, `MP: ${hero.mp}/${hero.maxMp}`, cardX + 220, cardY + 104, `bold 24px ${FONTS.MAIN}`, COLORS.MP_BLUE, '#000', 3);

      // バフアイコン
      if (hero.buffAtk > 1.0) this.game.graphics?.drawCrispText(ctx, '攻↑', cardX + 380, cardY + 104, `bold 20px ${FONTS.MAIN}`, COLORS.VERMILION_BRIGHT, '#000', 3);
      if (hero.buffDef > 1.0) this.game.graphics?.drawCrispText(ctx, '防↑', cardX + 425, cardY + 104, `bold 20px ${FONTS.MAIN}`, COLORS.HP_GREEN, '#000', 3);

      ctx.restore();
    });

    // 4. メッセージウィンドウ (左下: x: 24, y: 580, w: 760, h: 360)
    UrushiFrame.draw(ctx, 24, 580, 760, 360, '戦況');
    ctx.save();
    const recentMsgs = this.messages.slice(-5);
    recentMsgs.forEach((msg, i) => {
      // 枠内（最大680px）に美しく収まるようにフォントサイズを自動調整
      let fontSize = 24;
      ctx.font = `bold ${fontSize}px ${FONTS.MAIN}`;
      let metrics = ctx.measureText(msg);
      if (metrics.width > 670) {
        fontSize = 20;
        ctx.font = `bold ${fontSize}px ${FONTS.MAIN}`;
      }
      this.game.graphics?.drawCrispText(ctx, msg, 48, 634 + i * 54, `bold ${fontSize}px ${FONTS.MAIN}`, COLORS.TEXT_LIGHT, '#0c0812', 3.5);
    });
    ctx.restore();

    // 5. コマンドメニュー (右下: x: 804, y: 580, w: 452, h: 360)
    if (this.phase === 'INPUT') {
      const actor = this.party[this.currentActorIndex];
      if (actor && this.menuState === 'MAIN') {
        UrushiFrame.draw(ctx, 804, 580, 452, 360, `${actor.name.split('（')[0]}`);
        const commands = ['こうげき', 'わざ・じゅつ', 'どうぐ', 'にげる'];

        commands.forEach((cmd, i) => {
          const isSelected = i === this.commandCursor;
          const col = isSelected ? COLORS.GOLD_LIGHT : COLORS.TEXT_LIGHT;
          this.game.graphics?.drawCrispText(ctx, (isSelected ? '▶ ' : '  ') + cmd, 840, 656 + i * 70, `bold 36px ${FONTS.MAIN}`, col, '#16101c', 4);
        });
      } else if (actor && this.menuState === 'SKILL_SELECT') {
        UrushiFrame.draw(ctx, 280, 580, 976, 360, '技・術選択');
        const skills = actor.skills.map(id => MASTER.skills[id]).filter(Boolean);

        skills.forEach((sk, i) => {
          const isSelected = i === this.skillCursor;
          const canUse = actor.mp >= sk.mpCost;
          const col = isSelected ? COLORS.GOLD_LIGHT : (canUse ? COLORS.TEXT_LIGHT : COLORS.TEXT_MUTED);
          const text = `${isSelected ? '▶ ' : '  '}${sk.name} (${sk.mpCost}MP) - ${sk.desc}`;
          this.game.graphics?.drawCrispText(ctx, text, 310, 646 + i * 52, `bold 24px ${FONTS.MAIN}`, col, '#16101c', 3.5);
        });
      }
    }

    // 6. 技エフェクト描画
    if (this.playbackStep && this.playbackStep.effect) {
      const progress = this.playbackStep.timer / this.playbackStep.duration;
      const target = this.playbackStep.target;
      const tx = target ? (this.enemies.includes(target) ? this.getEnemyX(this.enemies.indexOf(target)) : 820) : 640;
      const ty = target ? (this.enemies.includes(target) ? 300 : this.getHeroY(this.party.indexOf(target)) + 60) : 420;
      Effects.draw(ctx, this.playbackStep.effect, tx, ty, progress);
    }

    // 7. フローティングダメージテキスト (48px 特大)
    this.floatingTexts.forEach(ft => {
      this.game.graphics?.drawCrispText(ctx, ft.text, ft.x, ft.y, `bold 48px ${FONTS.MAIN}`, ft.color, '#000', 4.5, 'center');
    });

    // UIStack
    this.uiStack.render(ctx, frame);
  }
}
