import { Scene } from '../core/Scene.js';
import { VIEW_W, VIEW_H, TILE_SIZE, COLORS, FONTS } from '../core/Constants.js';
import { MASTER, isChapterUnlocked } from '../data/MasterData.js';
import { SaveManager } from '../data/SaveManager.js';
import { UIStack } from '../ui/UIStack.js';
import { DialogUI } from '../ui/DialogUI.js';
import { MenuUI } from '../ui/MenuUI.js';

/**
 * マップ探索シーン (MapScene)
 */
export class MapScene extends Scene {
  constructor(game) {
    super(game);
    this.mapWidth = 72;
    this.mapHeight = 48;
    this.tileSize = TILE_SIZE;

    this.uiStack = new UIStack();

    this.player = {
      gridX: 12,
      gridY: 14,
      x: 12 * TILE_SIZE,
      y: 14 * TILE_SIZE,
      targetX: 12 * TILE_SIZE,
      targetY: 14 * TILE_SIZE,
      facing: 'down',
      isMoving: false,
      moveSpeed: 6.4,
      animFrame: 0,
      animTimer: 0,
      stepsSinceEncounter: 0,
      history: [] // 隊列用移動履歴 [{x, y, facing}]
    };

    this.camera = { x: 0, y: 0 };

    this.mapGrid = [];
    this.collisionGrid = [];
    this.encounterTypeGrid = [];
    this.bossEventGrid = [];
    this.npcGrid = [];

    // トランジション演出
    this.transitionState = null; // { phase: 'IN'|'OUT', timer: 0, onComplete }
  }

  enter(params = {}) {
    const chapterId = params.chapterId || this.game.state.currentChapter || 1;
    this.loadChapterMap(chapterId);

    // プレイヤー座標の復元または設定
    if (params.gridX !== undefined && params.gridY !== undefined) {
      this.player.gridX = params.gridX;
      this.player.gridY = params.gridY;
      this.player.facing = params.facing || 'down';
    } else if (this.game.state.player) {
      this.player.gridX = this.game.state.player.gridX ?? 12;
      this.player.gridY = this.game.state.player.gridY ?? 14;
      this.player.facing = this.game.state.player.facing ?? 'down';
    }
    this.player.x = this.player.targetX = this.player.gridX * this.tileSize;
    this.player.y = this.player.targetY = this.player.gridY * this.tileSize;
    this.player.isMoving = false;
    this.player.history = [];
    for (let i = 0; i < 30; i++) {
      this.player.history.push({ x: this.player.x, y: this.player.y, facing: this.player.facing });
    }

    this.updateCamera();

    // BGM開始
    this.game.audio?.playBgm?.('village');
  }

  exit() {
    this.uiStack.clear();
    // プレイヤー座標をStateへ保存
    if (this.game.state) {
      this.game.state.player = {
        gridX: this.player.gridX,
        gridY: this.player.gridY,
        facing: this.player.facing
      };
      this.game.state.currentChapter = this.game.state.currentChapter;
    }
  }

  loadChapterMap(chapterNum) {
    this.game.state.currentChapter = chapterNum;
    this.mapGrid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill('grass'));
    this.collisionGrid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(false));
    this.encounterTypeGrid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(null));
    this.bossEventGrid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(null));
    this.npcGrid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(null));

    if (chapterNum === 1) {
      this._buildChapter1();
    } else if (chapterNum === 2) {
      this._buildChapter2();
    } else {
      this._buildChapter3();
    }

    // NPCグリッドの構築 (O(1) 判定用)
    const currentNpcs = MASTER.npcs.filter(npc => npc.chapter === chapterNum);
    for (const npc of currentNpcs) {
      this.npcGrid[npc.y][npc.x] = npc;
      this.collisionGrid[npc.y][npc.x] = true;
    }
  }

  _buildChapter1() {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        if (x === 0 || x === this.mapWidth - 1 || y === 0 || y === this.mapHeight - 1) {
          this.mapGrid[y][x] = 'pine';
          this.collisionGrid[y][x] = true;
        }
      }
    }
    for (let x = 8; x <= 16; x++) { this.mapGrid[5][x] = 'roof'; this.collisionGrid[5][x] = true; this.mapGrid[6][x] = 'wall'; this.collisionGrid[6][x] = true; }
    for (let y = 7; y <= 10; y++) { for (let x = 9; x <= 15; x++) this.mapGrid[y][x] = 'tatami'; }
    this.mapGrid[10][12] = 'wood';
    for (let x = 17; x <= 22; x++) { this.mapGrid[11][x] = 'roof'; this.collisionGrid[11][x] = true; for (let y = 12; y <= 15; y++) this.mapGrid[y][x] = 'wood'; }
    for (let x = 5; x <= 10; x++) { this.mapGrid[16][x] = 'roof'; this.collisionGrid[16][x] = true; this.mapGrid[17][x] = 'wall'; this.collisionGrid[17][x] = true; for (let y = 18; y <= 20; y++) this.mapGrid[y][x] = 'wood'; }
    for (let y = 22; y <= 26; y++) { for (let x = 5; x <= 10; x++) this.mapGrid[y][x] = 'field'; }
    for (let y = 8; y <= 28; y++) { this.mapGrid[y][12] = 'dirt'; this.mapGrid[y][13] = 'dirt'; }
    for (let x = 4; x <= 26; x++) { this.mapGrid[14][x] = 'dirt'; this.mapGrid[15][x] = 'dirt'; }
    for (let y = 2; y <= 30; y++) { this.mapGrid[y][25] = 'water'; this.collisionGrid[y][25] = true; }
    this.mapGrid[14][25] = 'wood'; this.collisionGrid[14][25] = false; this.mapGrid[15][25] = 'wood'; this.collisionGrid[15][25] = false;

    for (let x = 26; x <= 46; x++) { this.mapGrid[14][x] = 'stone'; this.mapGrid[15][x] = 'stone'; }
    for (let y = 5; y <= 14; y++) { this.mapGrid[y][36] = 'stone'; this.mapGrid[y][37] = 'stone'; }
    this.mapGrid[13][28] = 'torii_top'; this.mapGrid[14][28] = 'torii_post';
    [30, 34, 40, 44].forEach(lx => { this.mapGrid[13][lx] = 'lantern'; this.collisionGrid[13][lx] = true; this.mapGrid[16][lx] = 'lantern'; this.collisionGrid[16][lx] = true; });
    for (let x = 33; x <= 40; x++) { this.mapGrid[3][x] = 'roof'; this.collisionGrid[3][x] = true; this.mapGrid[4][x] = 'wall'; this.collisionGrid[4][x] = true; }
    this.mapGrid[5][36] = 'shrine_box'; this.collisionGrid[5][36] = true;

    for (let y = 30; y <= 46; y++) {
      for (let x = 4; x <= 35; x++) {
        if ((x + y * 2) % 4 === 0 && (x < 18 || x > 24)) { this.mapGrid[y][x] = 'bamboo'; this.collisionGrid[y][x] = true; }
        if ((x * y) % 19 === 0) { this.mapGrid[y][x] = 'rock'; this.collisionGrid[y][x] = true; }
        this.encounterTypeGrid[y][x] = 'bamboo';
      }
    }
    for (let y = 30; y <= 45; y++) { this.mapGrid[y][20] = 'dirt'; this.mapGrid[y][21] = 'dirt'; }
    for (let x = 20; x <= 35; x++) { this.mapGrid[40][x] = 'dirt'; this.mapGrid[41][x] = 'dirt'; }

    for (let y = 18; y <= 46; y++) {
      for (let x = 36; x <= 56; x++) {
        if ((x + y) % 3 === 0 && (y < 28 || y > 34)) { this.mapGrid[y][x] = 'pine'; this.collisionGrid[y][x] = true; }
        if ((x * y) % 13 === 0) this.mapGrid[y][x] = 'swamp';
        this.encounterTypeGrid[y][x] = 'forest';
      }
    }
    for (let y = 18; y <= 42; y++) { this.mapGrid[y][48] = 'dirt'; this.mapGrid[y][49] = 'dirt'; }
    for (let x = 36; x <= 56; x++) { this.mapGrid[30][x] = 'dirt'; this.mapGrid[31][x] = 'dirt'; }

    for (let y = 10; y <= 38; y++) {
      for (let x = 57; x <= 70; x++) {
        this.encounterTypeGrid[y][x] = 'deep_forest';
        if ((x + y) % 5 === 0) this.mapGrid[y][x] = 'swamp';
      }
    }
    for (let y = 16; y <= 28; y++) { for (let x = 60; x <= 68; x++) this.mapGrid[y][x] = 'stone'; }
    this.mapGrid[15][60] = 'barrier_stone'; this.collisionGrid[15][60] = true;
    this.mapGrid[15][68] = 'barrier_stone'; this.collisionGrid[15][68] = true;
    this.mapGrid[29][60] = 'barrier_stone'; this.collisionGrid[29][60] = true;
    this.mapGrid[29][68] = 'barrier_stone'; this.collisionGrid[29][68] = true;
    this.mapGrid[21][59] = 'torii_top'; this.mapGrid[22][59] = 'torii_post';

    // ボスイベントグリッド
    for (let y = 39; y <= 41; y++) for (let x = 33; x <= 35; x++) this.bossEventGrid[y][x] = 'akaoni';
    for (let y = 29; y <= 31; y++) for (let x = 51; x <= 53; x++) this.bossEventGrid[y][x] = 'tengu';
    for (let y = 20; y <= 24; y++) for (let x = 63; x <= 66; x++) this.bossEventGrid[y][x] = 'youko';
  }

  _buildChapter2() {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        this.mapGrid[y][x] = 'water';
        this.collisionGrid[y][x] = true;
      }
    }
    for (let y = 10; y <= 32; y++) {
      for (let x = 4; x <= 26; x++) {
        this.mapGrid[y][x] = 'dirt';
        this.collisionGrid[y][x] = false;
      }
    }
    for (let x = 2; x <= 8; x++) { this.mapGrid[22][x] = 'wood'; this.collisionGrid[22][x] = false; }
    for (let x = 18; x <= 24; x++) {
      this.mapGrid[10][x] = 'roof'; this.collisionGrid[10][x] = true;
      this.mapGrid[11][x] = 'wall'; this.collisionGrid[11][x] = true;
      for (let y = 12; y <= 14; y++) this.mapGrid[y][x] = 'wood';
    }
    this.mapGrid[12][25] = 'shrine_box'; this.collisionGrid[12][25] = true;

    for (let y = 2; y <= 22; y++) {
      for (let x = 28; x <= 54; x++) {
        this.mapGrid[y][x] = (x + y) % 4 === 0 ? 'ice' : 'snow';
        this.collisionGrid[y][x] = false;
        this.encounterTypeGrid[y][x] = 'snow_mountain';
        if ((x * y) % 17 === 0) { this.mapGrid[y][x] = 'rock'; this.collisionGrid[y][x] = true; }
      }
    }
    for (let y = 4; y <= 8; y++) { for (let x = 48; x <= 53; x++) this.mapGrid[y][x] = 'ice'; }

    for (let y = 24; y <= 46; y++) {
      for (let x = 28; x <= 54; x++) {
        this.mapGrid[y][x] = 'deep_water';
        this.collisionGrid[y][x] = false;
        this.encounterTypeGrid[y][x] = 'lake_underwater';
      }
    }
    for (let y = 30; y <= 40; y++) { for (let x = 34; x <= 48; x++) this.mapGrid[y][x] = 'stone'; }
    [34, 40, 46].forEach(px => {
      this.mapGrid[28][px] = 'shrine_pillar'; this.collisionGrid[28][px] = true;
      this.mapGrid[42][px] = 'shrine_pillar'; this.collisionGrid[42][px] = true;
    });

    for (let y = 14; y <= 34; y++) {
      for (let x = 56; x <= 70; x++) {
        this.mapGrid[y][x] = 'stone';
        this.collisionGrid[y][x] = false;
        this.encounterTypeGrid[y][x] = 'port_coast';
      }
    }
    this.mapGrid[20][56] = 'torii_top'; this.mapGrid[21][56] = 'torii_post';
    for (let x = 22; x <= 30; x++) { this.mapGrid[16][x] = 'wood'; this.mapGrid[28][x] = 'wood'; }
    for (let x = 52; x <= 58; x++) { this.mapGrid[24][x] = 'stone'; this.mapGrid[25][x] = 'stone'; }

    // ボスイベントグリッド
    for (let y = 5; y <= 7; y++) for (let x = 48; x <= 52; x++) this.bossEventGrid[y][x] = 'hyoka';
    for (let y = 33; y <= 37; y++) for (let x = 42; x <= 46; x++) this.bossEventGrid[y][x] = 'mizuchi_boss';
    for (let y = 22; y <= 26; y++) for (let x = 62; x <= 66; x++) this.bossEventGrid[y][x] = 'shuten';
  }

  _buildChapter3() {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        this.mapGrid[y][x] = 'void_floor';
        this.collisionGrid[y][x] = true;
      }
    }

    for (let y = 10; y <= 36; y++) {
      for (let x = 4; x <= 24; x++) {
        this.mapGrid[y][x] = 'capital_stone';
        this.collisionGrid[y][x] = false;
        this.encounterTypeGrid[y][x] = 'capital_street';
      }
    }
    for (let x = 8; x <= 16; x++) {
      this.mapGrid[8][x] = 'roof'; this.collisionGrid[8][x] = true;
      this.mapGrid[9][x] = 'wall'; this.collisionGrid[9][x] = true;
    }
    this.mapGrid[12][20] = 'shrine_box'; this.collisionGrid[12][20] = true;

    for (let y = 15; y <= 32; y++) {
      for (let x = 25; x <= 40; x++) {
        this.mapGrid[y][x] = 'stone';
        this.collisionGrid[y][x] = false;
        this.encounterTypeGrid[y][x] = 'rashomon_gate';
      }
    }
    this.mapGrid[20][32] = 'torii_top'; this.mapGrid[21][32] = 'torii_post';
    this.mapGrid[26][32] = 'torii_top'; this.mapGrid[27][32] = 'torii_post';

    for (let y = 10; y <= 38; y++) {
      for (let x = 41; x <= 56; x++) {
        this.mapGrid[y][x] = 'void_floor';
        this.collisionGrid[y][x] = false;
        this.encounterTypeGrid[y][x] = 'tokoyo_corridor';
      }
    }
    [43, 49, 55].forEach(px => {
      this.mapGrid[12][px] = 'dark_pillar'; this.collisionGrid[12][px] = true;
      this.mapGrid[36][px] = 'dark_pillar'; this.collisionGrid[36][px] = true;
    });

    for (let y = 14; y <= 34; y++) {
      for (let x = 57; x <= 69; x++) {
        this.mapGrid[y][x] = 'capital_stone';
        this.collisionGrid[y][x] = false;
        this.encounterTypeGrid[y][x] = 'tokoyo_corridor';
      }
    }
    this.mapGrid[16][60] = 'dark_pillar'; this.collisionGrid[16][60] = true;
    this.mapGrid[16][66] = 'dark_pillar'; this.collisionGrid[16][66] = true;
    this.mapGrid[32][60] = 'dark_pillar'; this.collisionGrid[32][60] = true;
    this.mapGrid[32][66] = 'dark_pillar'; this.collisionGrid[32][66] = true;

    for (let x = 20; x <= 60; x++) {
      this.mapGrid[23][x] = 'capital_stone'; this.collisionGrid[23][x] = false;
      this.mapGrid[24][x] = 'capital_stone'; this.collisionGrid[24][x] = false;
    }

    // ボスイベントグリッド
    for (let y = 22; y <= 26; y++) for (let x = 30; x <= 34; x++) this.bossEventGrid[y][x] = 'ibaraki';
    for (let y = 22; y <= 26; y++) for (let x = 46; x <= 50; x++) this.bossEventGrid[y][x] = 'musokage';
    for (let y = 22; y <= 26; y++) for (let x = 62; x <= 66; x++) this.bossEventGrid[y][x] = 'shin_youko';
  }

  update(input, frame) {
    if (!this.uiStack.isEmpty) {
      this.uiStack.update(input, frame);
      return;
    }

    if (input.isPressed('CANCEL')) {
      this.openMenu();
      return;
    }

    this.updatePlayerMovement(input);
    this.updateCamera();
  }

  handleTap(x, y) {
    if (!this.uiStack.isEmpty) {
      this.uiStack.handleTap(x, y);
      return;
    }

    const worldX = x + this.camera.x;
    const worldY = y + this.camera.y;
    const targetGridX = Math.floor(worldX / this.tileSize);
    const targetGridY = Math.floor(worldY / this.tileSize);

    // 神鏡タップ (セーブ)
    const curChap = this.game.state.currentChapter;
    if ((curChap === 1 && targetGridX === 36 && targetGridY === 5) ||
        (curChap === 2 && targetGridX === 25 && targetGridY === 12) ||
        (curChap === 3 && targetGridX === 20 && targetGridY === 12)) {
      const dist = Math.hypot(targetGridX - this.player.gridX, targetGridY - this.player.gridY);
      if (dist <= 2) {
        this.performSave();
        return;
      }
    }

    // NPCタップ
    if (targetGridX >= 0 && targetGridX < this.mapWidth && targetGridY >= 0 && targetGridY < this.mapHeight) {
      const targetNpc = this.npcGrid[targetGridY][targetGridX];
      if (targetNpc) {
        const dist = Math.hypot(targetNpc.x - this.player.gridX, targetNpc.y - this.player.gridY);
        if (dist <= 1.8) {
          this.talkToNpc(targetNpc);
          return;
        }
      }
    }

    // マップタップ移動
    const dx = targetGridX - this.player.gridX;
    const dy = targetGridY - this.player.gridY;
    if (!this.player.isMoving && (dx !== 0 || dy !== 0)) {
      let stepX = 0; let stepY = 0; let facing = this.player.facing;
      if (Math.abs(dx) > Math.abs(dy)) {
        stepX = dx > 0 ? 1 : -1; facing = dx > 0 ? 'right' : 'left';
      } else {
        stepY = dy > 0 ? 1 : -1; facing = dy > 0 ? 'down' : 'up';
      }
      this.player.facing = facing;
      const nextX = this.player.gridX + stepX;
      const nextY = this.player.gridY + stepY;
      if (this.canMoveTo(nextX, nextY)) {
        this.player.targetX = nextX * this.tileSize;
        this.player.targetY = nextY * this.tileSize;
        this.player.isMoving = true;
      }
    }
  }

  updatePlayerMovement(input) {
    const p = this.player;

    if (p.isMoving) {
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= p.moveSpeed) {
        p.x = p.targetX;
        p.y = p.targetY;
        p.isMoving = false;
        p.gridX = Math.round(p.x / this.tileSize);
        p.gridY = Math.round(p.y / this.tileSize);
        this.onStepComplete();
      } else {
        p.x += (dx / dist) * p.moveSpeed;
        p.y += (dy / dist) * p.moveSpeed;
        p.animTimer += 0.15;
        if (p.animTimer >= 1) {
          p.animTimer = 0;
          p.animFrame = (p.animFrame + 1) % 2;
        }
      }
      // 移動履歴記録 (隊列用)
      p.history.unshift({ x: p.x, y: p.y, facing: p.facing });
      if (p.history.length > 50) p.history.pop();
      return;
    }

    // 入力受付
    let dirX = 0; let dirY = 0; let newFacing = p.facing;
    if (input.isDown('UP')) { dirY = -1; newFacing = 'up'; }
    else if (input.isDown('DOWN')) { dirY = 1; newFacing = 'down'; }
    else if (input.isDown('LEFT')) { dirX = -1; newFacing = 'left'; }
    else if (input.isDown('RIGHT')) { dirX = 1; newFacing = 'right'; }

    p.facing = newFacing;

    if (dirX !== 0 || dirY !== 0) {
      const nextX = p.gridX + dirX;
      const nextY = p.gridY + dirY;
      if (this.canMoveTo(nextX, nextY)) {
        p.targetX = nextX * this.tileSize;
        p.targetY = nextY * this.tileSize;
        p.isMoving = true;
      }
    }

    if (input.isPressed('CONFIRM')) {
      this.interactFacing();
    }
  }

  canMoveTo(gx, gy) {
    if (gx < 0 || gx >= this.mapWidth || gy < 0 || gy >= this.mapHeight) return false;
    if (this.collisionGrid[gy][gx]) return false;
    return true;
  }

  interactFacing() {
    const p = this.player;
    let tx = p.gridX; let ty = p.gridY;
    if (p.facing === 'up') ty -= 1;
    if (p.facing === 'down') ty += 1;
    if (p.facing === 'left') tx -= 1;
    if (p.facing === 'right') tx += 1;

    // 神鏡判定
    const curChap = this.game.state.currentChapter;
    if ((curChap === 1 && tx === 36 && ty === 5) ||
        (curChap === 2 && tx === 25 && ty === 12) ||
        (curChap === 3 && tx === 20 && ty === 12)) {
      this.performSave();
      return;
    }

    // NPC判定
    if (tx >= 0 && tx < this.mapWidth && ty >= 0 && ty < this.mapHeight) {
      const targetNpc = this.npcGrid[ty][tx];
      if (targetNpc) {
        this.talkToNpc(targetNpc);
      }
    }
  }

  talkToNpc(npc) {
    const portrait = this.game.graphics?.portraits?.[npc.spriteKey] || null;
    this.game.audio?.playDecide?.();

    this.uiStack.push(new DialogUI({
      speaker: npc.name,
      messages: npc.messages,
      portrait,
      onCharSound: () => this.game.audio?.playTone?.(880, 0.02, 'sine', 0, this.game.audio.seGain, 0.001, 0.01),
      onClose: () => this.uiStack.pop(),
      onComplete: () => {
        if (npc.healParty) {
          this.game.state.party.forEach(ch => {
            ch.hp = ch.maxHp;
            ch.mp = ch.maxMp;
          });
          this.game.audio?.playHeal?.();
        }
      }
    }));
  }

  performSave() {
    // HP/MP全快
    this.game.state.party.forEach(p => {
      p.hp = p.maxHp;
      p.mp = p.maxMp;
    });

    const success = SaveManager.save(this.game.state);
    if (success) {
      this.game.audio?.playSave?.();
      this.game.audio?.playHeal?.();
      this.uiStack.push(new DialogUI({
        speaker: '神鏡の祈りと記録',
        messages: ['神鏡に手を合わせ、千歳杉の神気に祈りを捧げた……。\n【 パーティ全員のHP・MPが全快した！ 】\n【 冒険の記録（セーブ）を保存しました！ 】'],
        onClose: () => this.uiStack.pop()
      }));
    } else {
      this.uiStack.push(new DialogUI({
        speaker: '記録の失敗',
        messages: ['セーブの保存に失敗しました。'],
        onClose: () => this.uiStack.pop()
      }));
    }
  }

  onStepComplete() {
    const p = this.player;

    // ボスイベント判定
    const bossId = this.bossEventGrid[p.gridY]?.[p.gridX];
    if (bossId && !this.game.state.bossDefeated[bossId]) {
      this.triggerBoss(bossId);
      return;
    }

    // ランダムエンカウント判定
    const encType = this.encounterTypeGrid[p.gridY][p.gridX];
    if (!encType) return; // 安全地帯

    p.stepsSinceEncounter++;
    if (p.stepsSinceEncounter >= 5) {
      const chance = Math.min(0.22, (p.stepsSinceEncounter - 5) * 0.04);
      if (Math.random() < chance) {
        p.stepsSinceEncounter = 0;
        this.triggerEncounter(encType);
      }
    }
  }

  triggerBoss(bossId) {
    const event = MASTER.bossEvents[bossId];
    const enemyData = MASTER.enemies[bossId];
    const portrait = this.game.graphics?.portraits?.[bossId] || this.game.graphics?.portraits?.[enemyData?.spriteKey] || null;

    if (event) {
      this.uiStack.push(new DialogUI({
        speaker: event.speaker,
        messages: event.messages,
        portrait,
        onClose: () => this.uiStack.pop(),
        onComplete: () => {
          this.startBattle({
            enemyIds: [bossId],
            isBoss: true,
            bossId: bossId,
            onVictory: () => {
              this.game.state.bossDefeated[bossId] = true;
              // 神具獲得判定
              if (bossId === 'hyoka') this.game.state.artifacts.mirror = true;
              if (bossId === 'mizuchi_boss') this.game.state.artifacts.magatama = true;
              if (bossId === 'musokage') this.game.state.artifacts.sword = true;
              if (bossId === 'shin_youko') {
                this.game.changeScene('ENDING');
              }
            }
          });
        }
      }));
    }
  }

  triggerEncounter(encArea) {
    const table = MASTER.encounters[encArea];
    if (!table || table.length === 0) return;

    // 重み付き抽選
    const totalWeight = table.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;
    let selectedEnemies = table[0].enemies;
    for (const item of table) {
      roll -= item.weight;
      if (roll <= 0) {
        selectedEnemies = item.enemies;
        break;
      }
    }

    this.game.audio?.playEncounter?.();
    this.startBattle({
      enemyIds: selectedEnemies,
      isBoss: false,
      areaType: encArea
    });
  }

  startBattle(battleParams) {
    this.game.changeScene('BATTLE', {
      ...battleParams,
      returnChapter: this.game.state.currentChapter
    });
  }

  openMenu() {
    this.game.audio?.playDecide?.();
    this.uiStack.push(new MenuUI({
      state: this.game.state,
      uiStack: this.uiStack,
      audio: this.game.audio,
      graphics: this.game.graphics,
      mapScene: this
    }));
  }

  updateCamera() {
    this.camera.x = this.player.x + this.tileSize / 2 - VIEW_W / 2;
    this.camera.y = this.player.y + this.tileSize / 2 - VIEW_H / 2;
    const maxCamX = this.mapWidth * this.tileSize - VIEW_W;
    const maxCamY = this.mapHeight * this.tileSize - VIEW_H;
    this.camera.x = Math.max(0, Math.min(this.camera.x, maxCamX));
    this.camera.y = Math.max(0, Math.min(this.camera.y, maxCamY));
  }

  render(ctx, frame) {
    ctx.save();
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    // タイルカリング計算
    const startTileX = Math.max(0, Math.floor(this.camera.x / this.tileSize));
    const endTileX = Math.min(this.mapWidth - 1, Math.ceil((this.camera.x + VIEW_W) / this.tileSize));
    const startTileY = Math.max(0, Math.floor(this.camera.y / this.tileSize));
    const endTileY = Math.min(this.mapHeight - 1, Math.ceil((this.camera.y + VIEW_H) / this.tileSize));

    // 1. 地形・障害物タイル描画
    const tiles = this.game.graphics?.tiles;
    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const tileKey = this.mapGrid[ty][tx];
        const tileImg = tiles?.[tileKey];
        if (tileImg) {
          ctx.drawImage(tileImg, tx * this.tileSize, ty * this.tileSize, this.tileSize, this.tileSize);
        } else {
          // フォールバック
          ctx.fillStyle = '#2d5a27';
          ctx.fillRect(tx * this.tileSize, ty * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }

    // 2. NPC描画
    const currentNpcs = MASTER.npcs.filter(npc => npc.chapter === this.game.state.currentChapter);
    const sprites = this.game.graphics?.sprites;
    for (const npc of currentNpcs) {
      if (npc.x >= startTileX - 1 && npc.x <= endTileX + 1 && npc.y >= startTileY - 1 && npc.y <= endTileY + 1) {
        const npcSprite = sprites?.[npc.spriteKey];
        if (npcSprite) {
          ctx.drawImage(npcSprite, npc.x * this.tileSize, npc.y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }

    // 3. パーティ隊列描画 (後衛: 朧 -> 中衛: 小夜 -> 先頭: 疾風 の順)
    const hist = this.player.history;
    const p1 = hist[0] || { x: this.player.x, y: this.player.y, facing: this.player.facing };
    const p2 = hist[8] || p1;  // 小夜
    const p3 = hist[16] || p2; // 朧

    const drawHero = (spriteKey, pState, animFrame) => {
      const key = `${spriteKey}_walk_${pState.facing}_${animFrame}`;
      const img = sprites?.[key] || sprites?.[`${spriteKey}_${pState.facing}_${animFrame}`];
      if (img) {
        ctx.drawImage(img, Math.round(pState.x), Math.round(pState.y), this.tileSize, this.tileSize);
      }
    };

    const isMoving = this.player.isMoving;
    drawHero('ninja', p3, isMoving ? this.player.animFrame : 0);
    drawHero('miko', p2, isMoving ? this.player.animFrame : 0);
    drawHero('samurai', p1, isMoving ? this.player.animFrame : 0);

    ctx.restore();

    // HUD (章表示)
    const chapData = MASTER.chapters.find(c => c.id === this.game.state.currentChapter);
    if (chapData) {
      ctx.fillStyle = 'rgba(10, 8, 16, 0.8)';
      ctx.fillRect(16, 16, 360, 44);
      ctx.strokeStyle = COLORS.GOLD_BORDER;
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 16, 360, 44);

      ctx.font = `bold 20px ${FONTS.MAIN}`;
      ctx.fillStyle = COLORS.GOLD_LIGHT;
      ctx.textAlign = 'left';
      ctx.fillText(chapData.name, 30, 45);
    }

    // UIスタック描画 (ダイアログ、メニュー等)
    this.uiStack.render(ctx, frame);
  }
}
