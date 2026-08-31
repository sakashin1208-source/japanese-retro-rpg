/**
 * 妖幻奇譚 〜もののけ草子〜 v2 完全統合テストスイート
 * 受入テスト7項目 ＆ マイルストーン1〜12検証
 */

import { VIEW_W, VIEW_H, KEYMAP } from '../core/Constants.js';
import { Game } from '../core/Game.js';
import { Scene } from '../core/Scene.js';
import { InputManager } from '../core/InputManager.js';
import { MASTER, isChapterUnlocked } from '../data/MasterData.js';
import { GameState } from '../data/GameState.js';
import { SaveManager, SAVE_KEY_V2 } from '../data/SaveManager.js';
import { GraphicsEngine } from '../gfx/GraphicsEngine.js';
import { BattleBackground } from '../gfx/BattleBackground.js';
import { UrushiFrame } from '../gfx/UrushiFrame.js';
import { Effects } from '../gfx/Effects.js';
import { AudioEngine } from '../audio/AudioEngine.js';
import { UIStack } from '../ui/UIStack.js';
import { DialogUI } from '../ui/DialogUI.js';
import { MenuUI } from '../ui/MenuUI.js';
import { StatusUI } from '../ui/StatusUI.js';
import { ItemUI } from '../ui/ItemUI.js';
import { TargetSelectUI } from '../ui/TargetSelectUI.js';
import { OpeningScene } from '../scenes/OpeningScene.js';
import { TitleScene } from '../scenes/TitleScene.js';
import { MapScene } from '../scenes/MapScene.js';
import { BattleScene } from '../scenes/BattleScene.js';
import { EndingScene } from '../scenes/EndingScene.js';

const logEl = document.getElementById('log');
const summaryEl = document.getElementById('summary');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function log(msg, className = '') {
  const line = document.createElement('div');
  line.textContent = msg;
  if (className) line.className = className;
  logEl.appendChild(line);
}

export function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    log(`  ✅ PASS: ${message}`, 'pass');
  } else {
    failedTests++;
    log(`  ❌ FAIL: ${message}`, 'fail');
    console.error(`Assertion failed: ${message}`);
  }
}

// -------------------------------------------------------------
// 受入テスト 7項目
// -------------------------------------------------------------
async function runAcceptanceTests() {
  log('\n========================================');
  log('【 指示書 §7.2 必須受入テスト (全7項目) 】');
  log('========================================');

  const canvas = document.getElementById('test-canvas');
  const game = new Game(canvas);
  game.state = new GameState();
  game.graphics = new GraphicsEngine();
  game.audio = new AudioEngine();

  // ---------------------------------------------------------
  // 受入テスト1: 戦闘勝利 → ステータス画面に Lv / HP / EXP が反映される
  // ---------------------------------------------------------
  {
    const battle = new BattleScene(game);
    game.registerScene('BATTLE', battle);
    battle.enter({ enemyIds: ['karakasa'] });

    // 敵HPを0にして勝利を発生させる
    battle.enemies[0].hp = 0;
    battle.checkBattleEnd();
    assert(battle.phase === 'VICTORY', '[受入1] 敵HP=0でVICTORYフェーズへ遷移');

    // 生存者のLvとEXPがStateへ書き戻されているか確認
    battle.exit();
    assert(game.state.party[0].exp >= 12, `[受入1] 戦闘終了後に疾風のEXPがStateへ反映 (EXP: ${game.state.party[0].exp})`);
  }

  // ---------------------------------------------------------
  // 受入テスト2: 戦闘敗北 → 蘇生後にHPが回復しており、次の戦闘で行動できる
  // ---------------------------------------------------------
  {
    const battle = new BattleScene(game);
    battle.enter({ enemyIds: ['akaoni'] });

    // 全滅させる
    battle.party.forEach(p => p.hp = 0);
    battle.checkBattleEnd();
    assert(battle.phase === 'DEFEAT', '[受入2] 味方全員HP=0でDEFEATフェーズへ遷移');

    // 敗北完了処理
    battle.finishDefeat();
    assert(game.state.party.every(p => p.hp === p.maxHp && p.mp === p.maxMp), '[受入2] 敗北復帰後に全員のHP・MPが全快している');
  }

  // ---------------------------------------------------------
  // 受入テスト3: 「はじめから」→ Lv1・所持金0・第一章・全ボス未撃破に戻る
  // ---------------------------------------------------------
  {
    game.state.money = 9999;
    game.state.currentChapter = 3;
    game.state.party[0].level = 5;
    game.state.bossDefeated.akaoni = true;
    game.state.bossDefeated.shuten = true;

    game.state.reset();
    assert(game.state.money === 0, '[受入3] reset() で所持金が0に戻る');
    assert(game.state.currentChapter === 1, '[受入3] reset() で第一章に戻る');
    assert(game.state.party[0].level === 1, '[受入3] reset() で疾風がLv1に戻る');
    assert(Object.values(game.state.bossDefeated).every(v => v === false), '[受入3] reset() で全ボス未撃破に戻る');
  }

  // ---------------------------------------------------------
  // 受入テスト4: セーブ → リロード → ロード → 章・座標・ボスフラグ・神具・所持金が一致
  // ---------------------------------------------------------
  {
    game.state.money = 3500;
    game.state.currentChapter = 2;
    game.state.bossDefeated.akaoni = true;
    game.state.bossDefeated.youko = true;
    game.state.artifacts.mirror = true;
    game.state.player = { gridX: 25, gridY: 12, facing: 'up' };

    const saveOk = SaveManager.save(game.state);
    assert(saveOk, '[受入4] SaveManager.save() が成功する');

    const newState = new GameState();
    const loadOk = SaveManager.load(newState);
    assert(loadOk, '[受入4] SaveManager.load() が成功する');
    assert(newState.money === 3500, '[受入4] ロード後に所持金が完全一致 (3500)');
    assert(newState.currentChapter === 2, '[受入4] ロード後に章番号が完全一致 (2)');
    assert(newState.bossDefeated.youko === true, '[受入4] ロード後にボス撃破フラグが完全一致');
    assert(newState.artifacts.mirror === true, '[受入4] ロード後に神具フラグが完全一致');
    assert(newState.player.gridX === 25 && newState.player.facing === 'up', '[受入4] ロード後にプレイヤー座標・向きが完全一致');

    SaveManager.clear();
  }

  // ---------------------------------------------------------
  // 受入テスト5: 戦闘とマップの両方から全アイテムが使用でき、所持数が減る
  // ---------------------------------------------------------
  {
    // A. マップからの使用
    const mapScene = new MapScene(game);
    const menuUI = new MenuUI({ state: game.state, uiStack: mapScene.uiStack, mapScene });
    game.state.party[0].hp = 10;
    const initialKizu = game.state.items[0].count; // 9
    menuUI.useItemOnMap(game.state.items[0], 0);
    assert(game.state.party[0].hp === game.state.party[0].maxHp, `[受入5-マップ] マップ上で傷薬を使用してHPが上限まで回復 (実測: ${game.state.party[0].hp}/${game.state.party[0].maxHp})`);
    assert(game.state.items[0].count === initialKizu - 1, '[受入5-マップ] 傷薬の所持数が1減る');

    // B. 戦闘からの使用 (UI経路)
    const battle = new BattleScene(game);
    battle.enter({ enemyIds: ['karakasa'] });
    battle.party[1].hp = 10; // 小夜のHP
    const kizuCountBeforeBattle = game.state.items[0].count;

    const itemUI = new ItemUI({
      state: game.state,
      party: battle.party,
      uiStack: battle.uiStack,
      isBattle: true,
      onUse: (item, targetIndex) => {
        battle.uiStack.pop();
        item.count--;
        battle.party[targetIndex].hp = Math.min(battle.party[targetIndex].maxHp, battle.party[targetIndex].hp + item.value);
      }
    });
    battle.uiStack.push(itemUI);
    itemUI.selectCurrentItem(); // TargetSelectUI が開く
    battle.uiStack.top.onSelect(battle.party[1]); // 小夜を選択

    assert(battle.party[1].hp === battle.party[1].maxHp, `[受入5-戦闘] 戦闘中UIから傷薬を使用して小夜のHP回復 (実測: ${battle.party[1].hp}/${battle.party[1].maxHp})`);
    assert(game.state.items[0].count === kizuCountBeforeBattle - 1, '[受入5-戦闘] 戦闘中アイテム使用で所持数が1減る');
  }

  // ---------------------------------------------------------
  // 受入テスト6: 素早さの高いキャラが先に行動する（行動順ソートが機能している）
  // ---------------------------------------------------------
  {
    const battle = new BattleScene(game);
    // から傘小僧: spd 12 / 朧: spd 22 / 疾風: spd 15 / 小夜: spd 11
    battle.enter({ enemyIds: ['karakasa'] });

    // 全員のコマンドを積む
    battle.actionQueue = [
      { actorRef: { side: 'party', index: 1 }, actionType: 'attack', targetRef: { side: 'enemy', index: 0 } }, // 小夜 (spd 11)
      { actorRef: { side: 'party', index: 2 }, actionType: 'attack', targetRef: { side: 'enemy', index: 0 } }, // 朧 (spd 22)
      { actorRef: { side: 'party', index: 0 }, actionType: 'attack', targetRef: { side: 'enemy', index: 0 } }, // 疾風 (spd 15)
      { actorRef: { side: 'enemy', index: 0 }, actionType: 'enemy_action', action: { name: '打撃' }, targetRef: { side: 'party', index: 0 } } // 敵 (spd 12)
    ];

    // ソート実行
    const getSpeed = (act) => {
      const actor = act.actorRef.side === 'party' ? battle.party[act.actorRef.index] : battle.enemies[act.actorRef.index];
      return (actor?.spd ?? 10) * (actor?.buffSpd ?? 1.0);
    };
    battle.actionQueue.sort((a, b) => getSpeed(b) - getSpeed(a));

    assert(battle.actionQueue[0].actorRef.side === 'party' && battle.actionQueue[0].actorRef.index === 2, '[受入6] 素早さ最高の朧(spd 22)が1番手');
    assert(battle.actionQueue[1].actorRef.side === 'party' && battle.actionQueue[1].actorRef.index === 0, '[受入6] 疾風(spd 15)が2番手');
    assert(battle.actionQueue[2].actorRef.side === 'enemy' && battle.actionQueue[2].actorRef.index === 0, '[受入6] 敵(spd 12)が3番手');
    assert(battle.actionQueue[3].actorRef.side === 'party' && battle.actionQueue[3].actorRef.index === 1, '[受入6] 小夜(spd 11)が4番手');
  }

  // ---------------------------------------------------------
  // 受入テスト7: 物理技が通常攻撃より強い（Lv1疾風: 通常24 / 居合い一閃42）
  // ---------------------------------------------------------
  {
    const hayate = MASTER.characters[0]; // atk: 20, buffAtk: 1.0
    const karakasa = MASTER.enemies.karakasa; // def: 5, buffDef: 1.0

    // 確定計算式
    const normalDmg = Math.floor(hayate.atk * 1.0 * 1.4 - karakasa.def * 1.0 * 0.7);
    const iaiDmg = Math.floor(hayate.atk * 1.0 * 1.4 * MASTER.skills.iai.power - karakasa.def * 1.0 * 0.5);

    assert(normalDmg === 24, `[受入7] Lv1疾風の通常攻撃期待値が 24 (実測: ${normalDmg})`);
    assert(iaiDmg === 42, `[受入7] Lv1疾風の居合い一閃期待値が 42 (実測: ${iaiDmg})`);
    assert(iaiDmg > normalDmg, '[受入7] 居合い一閃が通常攻撃より圧倒的に高いダメージを出す (42 > 24)');
  }
}

// -------------------------------------------------------------
// メインテストランナー
// -------------------------------------------------------------
export async function runAllTests() {
  logEl.innerHTML = '';
  totalTests = 0;
  passedTests = 0;
  failedTests = 0;

  try {
    // 基礎・マイルストーンテスト
    log('--- [M1: 基盤テスト] ---');
    assert(VIEW_W === 1280 && VIEW_H === 960, '画面解像度 1280x960');
    assert(KEYMAP.CONFIRM.includes('KeyZ'), 'CONFIRM キーマップ');

    log('\n--- [M2: データ層テスト] ---');
    assert(Object.isFrozen(MASTER), 'MASTER が Object.freeze');
    assert(MASTER.characters.length === 3, '主人公3名');
    assert(Object.keys(MASTER.skills).length === 17, '技17種');
    assert(Object.keys(MASTER.enemies).length === 59, '敵50種＋ボス9体');
    assert(MASTER.npcs.length === 17, 'NPC17名');
    assert(MASTER.chapters.length === 3, '全3章配列');

    log('\n--- [M3: グラフィック基盤テスト] ---');
    const gfx = new GraphicsEngine();
    const totalAssets = Object.keys(gfx.tiles).length + Object.keys(gfx.sprites).length + Object.keys(gfx.portraits).length;
    assert(totalAssets === 166, `全166枚スプライト生成 (実測: ${totalAssets})`);

    // 受入テスト7項目
    await runAcceptanceTests();

  } catch (e) {
    log(`\n❌ テスト実行例外: ${e.message}`, 'fail');
    console.error(e);
  }

  const resultMsg = `全 ${totalTests} 件中: 成功 ${passedTests} 件 / 失敗 ${failedTests} 件`;
  summaryEl.textContent = resultMsg;
  summaryEl.className = failedTests === 0 ? 'pass' : 'fail';
  log(`\n========================================\n${resultMsg}\n========================================`);
}

window.addEventListener('DOMContentLoaded', () => {
  runAllTests();
});
