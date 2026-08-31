/**
 * ==========================================================================
 * 妖幻奇譚 〜もののけ草子〜 全章完全統合マップ探索システム (1280x960 ハイレゾHD-2D版)
 * ==========================================================================
 */

class MapManager {
  constructor(game) {
    this.game = game;
    this.tileSize = 64;
    this.mapWidth = 72;
    this.mapHeight = 48;
    this.currentChapter = 1;

    this.player = {
      gridX: 12,
      gridY: 14,
      x: 12 * 64,
      y: 14 * 64,
      targetX: 12 * 64,
      targetY: 14 * 64,
      facing: 'down',
      isMoving: false,
      moveSpeed: 6.4,
      animFrame: 0,
      animTimer: 0,
      stepsSinceEncounter: 0
    };

    this.camera = { x: 0, y: 0 };

    this.dialog = {
      active: false,
      speakerName: '',
      messages: [],
      messageIndex: 0,
      charIndex: 0,
      displayedText: '',
      charTimer: 0,
      charSpeed: 25,
      isComplete: false,
      onComplete: null
    };

    this.menu = {
      active: false,
      subState: 'MAIN',
      selectedIndex: 0,
      itemSubIndex: 0,
      items: ['つよさ（能力）', 'どうぐ', '章のいどう', 'きろく（セーブ）', 'とじる']
    };

    this.statusScreen = {
      active: false,
      partyIndex: 0,
      selectedSkillIndex: 0
    };

    this.bossDefeated = {
      akaoni: false,
      tengu: false,
      youko: false,
      hyoka: false,
      mizuchi: false,
      shuten: false,
      ibaraki: false,
      musokage: false,
      shin_youko: false
    };

    this.artifactsObtained = {
      mirror: false,
      magatama: false,
      sword: false
    };

    this.mapGrid = [];
    this.collisionGrid = [];
    this.encounterTypeGrid = [];
    this.bossEventGrid = [];
    this.loadChapterMap(1);
  }

  loadChapterMap(chapterNum) {
    this.currentChapter = chapterNum;
    this.mapGrid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill('grass'));
    this.collisionGrid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(false));
    this.encounterTypeGrid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(null));
    this.bossEventGrid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(null));

    if (chapterNum === 1) {
      this.initChapter1Map();
    } else if (chapterNum === 2) {
      this.initChapter2Map();
    } else {
      this.initChapter3Map();
    }
  }

  // --- 第一章マップ ---
  initChapter1Map() {
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

    // ボス出現地点グリッド設定 (L-4)
    for (let y = 39; y <= 41; y++) for (let x = 33; x <= 35; x++) this.bossEventGrid[y][x] = 'akaoni';
    for (let y = 29; y <= 31; y++) for (let x = 51; x <= 53; x++) this.bossEventGrid[y][x] = 'tengu';
    for (let y = 20; y <= 24; y++) for (let x = 63; x <= 66; x++) this.bossEventGrid[y][x] = 'youko';
  }

  // --- 第二章マップ ---
  initChapter2Map() {
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

    // ボス出現地点グリッド設定 (L-4)
    for (let y = 5; y <= 7; y++) for (let x = 48; x <= 52; x++) this.bossEventGrid[y][x] = 'hyoka';
    for (let y = 33; y <= 37; y++) for (let x = 42; x <= 46; x++) this.bossEventGrid[y][x] = 'mizuchi_boss';
    for (let y = 22; y <= 26; y++) for (let x = 62; x <= 66; x++) this.bossEventGrid[y][x] = 'shuten';
  }

  // --- 第三章マップ ---
  initChapter3Map() {
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

    // ボス出現地点グリッド設定 (L-4)
    for (let y = 22; y <= 26; y++) for (let x = 30; x <= 34; x++) this.bossEventGrid[y][x] = 'ibaraki';
    for (let y = 22; y <= 26; y++) for (let x = 46; x <= 50; x++) this.bossEventGrid[y][x] = 'musokage';
    for (let y = 22; y <= 26; y++) for (let x = 62; x <= 66; x++) this.bossEventGrid[y][x] = 'shin_youko';
  }

  handleTap(cx, cy) {
    if (this.dialog.active) {
      this.advanceDialog();
      return;
    }

    if (this.statusScreen.active) {
      if (cx < 160 && cy < 240) {
        this.statusScreen.partyIndex = (this.statusScreen.partyIndex - 1 + GAME_DATA.party.length) % GAME_DATA.party.length;
        this.game.audio.playCursor();
        return;
      }
      if (cx > 1120 && cy < 240) {
        this.statusScreen.partyIndex = (this.statusScreen.partyIndex + 1) % GAME_DATA.party.length;
        this.game.audio.playCursor();
        return;
      }
      if (cy > 820) {
        this.statusScreen.active = false;
        this.game.audio.playCancel();
        return;
      }
      return;
    }

    if (this.menu.active) {
      if (this.menu.subState === 'ITEM') {
        const ix = 320; const iy = 120; const iw = 880; const ih = 720;
        if (cx >= ix && cx <= ix + iw && cy >= iy && cy <= iy + ih) {
          const itemIdx = Math.floor((cy - (iy + 130)) / 80);
          if (itemIdx >= 0 && itemIdx < 3) {
            this.menu.itemSubIndex = itemIdx;
            this.useItemOnMap(itemIdx);
          } else if (itemIdx === 3 || cy > iy + ih - 100) {
            this.menu.subState = 'MAIN';
            this.game.audio.playCancel();
          }
        }
        return;
      }

      const mx = 720; const my = 140; const mw = 500;
      if (cx >= mx && cx <= mx + mw && cy >= my && cy <= my + 460) {
        const idx = Math.floor((cy - (my + 32)) / 72);
        if (idx === 0) {
          this.menu.active = false; this.statusScreen.active = true; this.statusScreen.partyIndex = 0; this.game.audio.playDecide();
        } else if (idx === 1) {
          this.menu.subState = 'ITEM';
          this.menu.itemSubIndex = 0;
          this.game.audio.playDecide();
        } else if (idx === 2) {
          this.menu.active = false;
          this.toggleChapter();
        } else if (idx === 3) {
          this.menu.active = false;
          this.performSave();
        } else if (idx === 4) {
          this.menu.active = false;
          this.game.audio.playCancel();
        }
        return;
      }
    }

    const worldX = cx + this.camera.x;
    const worldY = cy + this.camera.y;
    const targetGridX = Math.floor(worldX / this.tileSize);
    const targetGridY = Math.floor(worldY / this.tileSize);

    if ((this.currentChapter === 1 && targetGridX === 36 && targetGridY === 5) ||
        (this.currentChapter === 2 && targetGridX === 25 && targetGridY === 12) ||
        (this.currentChapter === 3 && targetGridX === 20 && targetGridY === 12)) {
      const dist = Math.hypot(targetGridX - this.player.gridX, targetGridY - this.player.gridY);
      if (dist <= 2) {
        this.performSave();
        return;
      }
    }

    const currentNpcs = GAME_DATA.npcs.filter(npc => npc.chapter === this.currentChapter);
    const clickedNpc = currentNpcs.find(npc => npc.x === targetGridX && npc.y === targetGridY);
    if (clickedNpc) {
      const dist = Math.hypot(clickedNpc.x - this.player.gridX, clickedNpc.y - this.player.gridY);
      if (dist <= 1.8) {
        this.startDialog(clickedNpc.name, clickedNpc.messages, () => {
          if (clickedNpc.healParty) {
            GAME_DATA.party.forEach(ch => { ch.hp = ch.maxHp; ch.mp = ch.maxMp; });
            this.game.audio.playHeal();
          }
        }, clickedNpc.spriteKey);
        return;
      }
    }

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

  toggleChapter() {
    let nextChapter = (this.currentChapter % 3) + 1;

    // M-1: 前章ボス撃破前提条件チェック
    if (this.currentChapter === 1 && nextChapter === 2) {
      if (!this.bossDefeated.youko) {
        this.startDialog('結界の拒絶', [
          '妖しの森の奥に座す『九尾の狐（前哨）』を討伐せねば、\n霊峰白嶺への結界は越えられない……！'
        ]);
        this.game.audio.playCancel();
        return;
      }
    } else if (this.currentChapter === 2 && nextChapter === 3) {
      if (!this.bossDefeated.shuten) {
        this.startDialog('結界の拒絶', [
          '湖底神殿に君臨する『酒呑童子』を討ち果たさねば、\n魔都羅生門への結界は破れない……！'
        ]);
        this.game.audio.playCancel();
        return;
      }
    }

    this.loadChapterMap(nextChapter);

    if (nextChapter === 1) {
      this.player.gridX = 12; this.player.gridY = 14;
      this.player.x = 12 * 64; this.player.y = 14 * 64;
      this.player.targetX = 12 * 64; this.player.targetY = 14 * 64;
      this.startDialog('章の移動', ['【 第一章: 神楽の里と妖しの森 】へ移動しました。']);
    } else if (nextChapter === 2) {
      this.player.gridX = 14; this.player.gridY = 18;
      this.player.x = 14 * 64; this.player.y = 18 * 64;
      this.player.targetX = 14 * 64; this.player.targetY = 18 * 64;
      this.startDialog('章の移動', ['【 第二章: 霊峰白嶺と湖底神殿 】へ移動しました！']);
    } else {
      this.player.gridX = 10; this.player.gridY = 24;
      this.player.x = 10 * 64; this.player.y = 24 * 64;
      this.player.targetX = 10 * 64; this.player.targetY = 24 * 64;
      this.startDialog('章の移動', ['【 第三章: 魔都羅生門と常夜の門（最終章） 】へ突入しました！']);
    }
    this.game.audio.playDecide();
  }

  update(input) {
    if (this.dialog.active) { this.updateDialog(input); return; }
    if (this.statusScreen.active) { this.updateStatusScreen(input); return; }
    if (this.menu.active) { this.updateMenu(input); return; }

    if (input.isJustPressed('KeyX') || input.isJustPressed('Escape') || input.isJustPressed('ShiftLeft')) {
      this.menu.active = true;
      this.menu.subState = 'MAIN';
      this.menu.selectedIndex = 0;
      this.menu.itemSubIndex = 0;
      this.game.audio.playDecide();
      return;
    }

    this.updatePlayerMovement(input);
    this.updateCamera();
  }

  updateMenu(input) {
    const m = this.menu;

    // ITEM サブメニュー操作
    if (m.subState === 'ITEM') {
      const itemCount = 4; // 0:傷薬, 1:神酒, 2:仙豆, 3:もどる
      if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
        m.itemSubIndex = (m.itemSubIndex - 1 + itemCount) % itemCount;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('ArrowDown') || input.isJustPressed('KeyS')) {
        m.itemSubIndex = (m.itemSubIndex + 1) % itemCount;
        this.game.audio.playCursor();
      } else if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
        if (m.itemSubIndex === 3) {
          m.subState = 'MAIN';
          this.game.audio.playCancel();
        } else {
          this.useItemOnMap(m.itemSubIndex);
        }
      } else if (input.isJustPressed('KeyX') || input.isJustPressed('Escape')) {
        m.subState = 'MAIN';
        this.game.audio.playCancel();
      }
      return;
    }

    // MAIN メインメニュー操作
    if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
      m.selectedIndex = (m.selectedIndex - 1 + m.items.length) % m.items.length;
      this.game.audio.playCursor();
    } else if (input.isJustPressed('ArrowDown') || input.isJustPressed('KeyS')) {
      m.selectedIndex = (m.selectedIndex + 1) % m.items.length;
      this.game.audio.playCursor();
    } else if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
      if (m.selectedIndex === 0) {
        m.active = false; this.statusScreen.active = true; this.statusScreen.partyIndex = 0; this.game.audio.playDecide();
      } else if (m.selectedIndex === 1) {
        m.subState = 'ITEM';
        m.itemSubIndex = 0;
        this.game.audio.playDecide();
      } else if (m.selectedIndex === 2) {
        m.active = false;
        this.toggleChapter();
      } else if (m.selectedIndex === 3) {
        m.active = false;
        this.performSave();
      } else if (m.selectedIndex === 4) {
        m.active = false;
        this.game.audio.playCancel();
      }
    } else if (input.isJustPressed('KeyX') || input.isJustPressed('Escape')) {
      m.active = false;
      this.game.audio.playCancel();
    }
  }

  updateStatusScreen(input) {
    const ss = this.statusScreen;
    if (input.isJustPressed('ArrowLeft') || input.isJustPressed('KeyA')) {
      ss.partyIndex = (ss.partyIndex - 1 + GAME_DATA.party.length) % GAME_DATA.party.length;
      this.game.audio.playCursor();
    } else if (input.isJustPressed('ArrowRight') || input.isJustPressed('KeyD')) {
      ss.partyIndex = (ss.partyIndex + 1) % GAME_DATA.party.length;
      this.game.audio.playCursor();
    } else if (input.isJustPressed('KeyX') || input.isJustPressed('Escape') || input.isJustPressed('KeyZ') || input.isJustPressed('Enter')) {
      ss.active = false;
      this.game.audio.playCancel();
    }
  }

  performSave() {
    // R-4: 神鏡への祈りによるHP/MP全快＆蘇生
    GAME_DATA.party.forEach(p => {
      p.hp = p.maxHp;
      p.mp = p.maxMp;
    });

    const success = SaveManager.saveGame(this.game);
    if (success) {
      this.game.audio.playSave();
      this.game.audio.playHeal();
      this.startDialog('神鏡の祈りと記録', [
        '神鏡に手を合わせ、千歳杉の神気に祈りを捧げた……。\n【 パーティ全員のHP・MPが全快した！ 】\n【 冒険の記録（セーブ）を保存しました！ 】'
      ]);
    } else {
      this.startDialog('記録の失敗', ['セーブの保存に失敗しました。']);
    }
  }

  useItemOnMap(itemIdx) {
    const item = GAME_DATA.items[itemIdx];
    if (!item || item.count <= 0) {
      this.startDialog('道具', [`${item ? item.name : 'どうぐ'}を 所持していません。`]);
      return;
    }

    if (item.type === 'heal_hp') {
      const hurt = GAME_DATA.party.find(p => p.hp > 0 && p.hp < p.maxHp);
      if (!hurt) {
        this.startDialog('道具', ['回復の必要はありません（全員HP満タン）。']);
        return;
      }
      item.count--;
      hurt.hp = Math.min(hurt.maxHp, hurt.hp + item.value);
      this.game.audio.playHeal();
      this.startDialog('道具使用', [`${hurt.name}に【${item.name}】を使った！\nHPが ${item.value} 回復した！（残り: ${item.count}個）`]);
    } else if (item.type === 'heal_mp') {
      const mpDown = GAME_DATA.party.find(p => p.hp > 0 && p.mp < p.maxMp);
      if (!mpDown) {
        this.startDialog('道具', ['回復の必要はありません（全員MP満タン）。']);
        return;
      }
      item.count--;
      mpDown.mp = Math.min(mpDown.maxMp, mpDown.mp + item.value);
      this.game.audio.playHeal();
      this.startDialog('道具使用', [`${mpDown.name}に【${item.name}】を使った！\nMPが ${item.value} 回復した！（残り: ${item.count}個）`]);
    } else if (item.type === 'revive') {
      const dead = GAME_DATA.party.find(p => p.hp <= 0);
      if (!dead) {
        this.startDialog('道具', ['倒れている仲間はいません。']);
        return;
      }
      item.count--;
      dead.hp = dead.maxHp;
      this.game.audio.playHeal();
      this.startDialog('仙豆使用', [`倒れていた${dead.name}に【仙豆】を使った！\n息を吹き返し、HP・MPが全快した！（残り: ${item.count}個）`]);
    }
  }

  updatePlayerMovement(input) {
    const p = this.player;
    if (p.isMoving) {
      const dx = p.targetX - p.x; const dy = p.targetY - p.y; const dist = Math.hypot(dx, dy);
      if (dist <= p.moveSpeed) {
        p.x = p.targetX; p.y = p.targetY; p.isMoving = false;
        p.gridX = Math.round(p.x / this.tileSize); p.gridY = Math.round(p.y / this.tileSize);
        this.checkEncounterAndEvents();
      } else {
        p.x += (dx / dist) * p.moveSpeed; p.y += (dy / dist) * p.moveSpeed;
        p.animTimer += 0.15;
        if (p.animTimer >= 1) { p.animTimer = 0; p.animFrame = (p.animFrame + 1) % 2; }
      }
      return;
    }

    let dirX = 0; let dirY = 0; let newFacing = p.facing;
    if (input.isDown('ArrowUp') || input.isDown('KeyW')) { dirY = -1; newFacing = 'up'; }
    else if (input.isDown('ArrowDown') || input.isDown('KeyS')) { dirY = 1; newFacing = 'down'; }
    else if (input.isDown('ArrowLeft') || input.isDown('KeyA')) { dirX = -1; newFacing = 'left'; }
    else if (input.isDown('ArrowRight') || input.isDown('KeyD')) { dirX = 1; newFacing = 'right'; }
    p.facing = newFacing;

    if (dirX !== 0 || dirY !== 0) {
      const nextGridX = p.gridX + dirX; const nextGridY = p.gridY + dirY;
      if (this.canMoveTo(nextGridX, nextGridY)) {
        p.targetX = nextGridX * this.tileSize; p.targetY = nextGridY * this.tileSize;
        p.isMoving = true;
      }
    }

    if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
      this.interactFacing();
    }
  }

  canMoveTo(gx, gy) {
    if (gx < 0 || gx >= this.mapWidth || gy < 0 || gy >= this.mapHeight) return false;
    if (this.collisionGrid[gy][gx]) return false;
    const currentNpcs = GAME_DATA.npcs.filter(npc => npc.chapter === this.currentChapter);
    for (const npc of currentNpcs) {
      if (npc.x === gx && npc.y === gy) return false;
    }
    return true;
  }

  interactFacing() {
    const p = this.player;
    let tx = p.gridX; let ty = p.gridY;
    if (p.facing === 'up') ty -= 1; if (p.facing === 'down') ty += 1; if (p.facing === 'left') tx -= 1; if (p.facing === 'right') tx += 1;

    if ((this.currentChapter === 1 && tx === 36 && ty === 5) ||
        (this.currentChapter === 2 && tx === 25 && ty === 12) ||
        (this.currentChapter === 3 && tx === 20 && ty === 12)) {
      this.performSave();
      return;
    }

    const currentNpcs = GAME_DATA.npcs.filter(npc => npc.chapter === this.currentChapter);
    const targetNpc = currentNpcs.find(npc => npc.x === tx && npc.y === ty);
    if (targetNpc) {
      this.startDialog(targetNpc.name, targetNpc.messages, () => {
        if (targetNpc.healParty) {
          GAME_DATA.party.forEach(ch => { ch.hp = ch.maxHp; ch.mp = ch.maxMp; });
          this.game.audio.playHeal();
        }
      }, targetNpc.spriteKey);
    }
  }

  startDialog(speaker, messages, onComplete = null, portraitKey = null) {
    this.dialog.active = true;
    this.dialog.speakerName = speaker;
    this.dialog.portraitKey = portraitKey;
    this.dialog.messages = messages;
    this.dialog.messageIndex = 0;
    this.dialog.charIndex = 0;
    this.dialog.displayedText = '';
    this.dialog.isComplete = false;
    this.dialog.onComplete = onComplete;
    this.game.audio.playDecide();
  }

  advanceDialog() {
    const d = this.dialog;
    const currentMsg = d.messages[d.messageIndex];
    if (!d.isComplete) {
      d.displayedText = currentMsg; d.charIndex = currentMsg.length; d.isComplete = true;
    } else {
      d.messageIndex++;
      if (d.messageIndex < d.messages.length) {
        d.charIndex = 0; d.displayedText = ''; d.isComplete = false;
        this.game.audio.playCursor();
      } else {
        d.active = false;
        this.game.audio.playCancel();
        if (d.onComplete) d.onComplete();
      }
    }
  }

  updateDialog(input) {
    const d = this.dialog;
    const currentMsg = d.messages[d.messageIndex];
    if (!d.isComplete) {
      d.charTimer += 16;
      if (d.charTimer >= d.charSpeed) {
        d.charTimer = 0; d.charIndex++;
        d.displayedText = currentMsg.substring(0, d.charIndex);
        if (d.charIndex % 2 === 0) this.game.audio.playTone(880, 0.02, 'sine', 0, this.game.audio.seGain, 0.001, 0.01);
        if (d.charIndex >= currentMsg.length) d.isComplete = true;
      }
    }
    if (input.isJustPressed('KeyZ') || input.isJustPressed('Enter') || input.isJustPressed('Space')) {
      this.advanceDialog();
    }
  }

  checkEncounterAndEvents() {
    const p = this.player;

    // ボスイベントグリッド判定 (L-4 統合)
    const bossKey = this.bossEventGrid[p.gridY] && this.bossEventGrid[p.gridY][p.gridX];
    if (bossKey) {
      if (bossKey === 'akaoni' && !this.bossDefeated.akaoni && GAME_DATA.bossEvents.akaoni) {
        this.startDialog(GAME_DATA.bossEvents.akaoni.speaker, GAME_DATA.bossEvents.akaoni.messages, () => {
          this.game.startSpecificBossBattle(['akaoni']); this.bossDefeated.akaoni = true;
        }, 'akaoni');
        return;
      }
      if (bossKey === 'tengu' && !this.bossDefeated.tengu && GAME_DATA.bossEvents.tengu) {
        this.startDialog(GAME_DATA.bossEvents.tengu.speaker, GAME_DATA.bossEvents.tengu.messages, () => {
          this.game.startSpecificBossBattle(['tengu']); this.bossDefeated.tengu = true;
        }, 'tengu');
        return;
      }
      if (bossKey === 'youko' && !this.bossDefeated.youko && GAME_DATA.bossEvents.youko) {
        this.startDialog(GAME_DATA.bossEvents.youko.speaker, GAME_DATA.bossEvents.youko.messages, () => {
          this.game.startSpecificBossBattle(['youko']); this.bossDefeated.youko = true;
        }, 'youko');
        return;
      }
      if (bossKey === 'hyoka' && !this.bossDefeated.hyoka && GAME_DATA.bossEvents.hyoka) {
        this.startDialog(GAME_DATA.bossEvents.hyoka.speaker, GAME_DATA.bossEvents.hyoka.messages, () => {
          this.game.startSpecificBossBattle(['hyoka']); this.bossDefeated.hyoka = true; this.artifactsObtained.mirror = true;
        }, 'boss_hyoka');
        return;
      }
      if (bossKey === 'mizuchi_boss' && !this.bossDefeated.mizuchi && GAME_DATA.bossEvents.mizuchi_boss) {
        this.startDialog(GAME_DATA.bossEvents.mizuchi_boss.speaker, GAME_DATA.bossEvents.mizuchi_boss.messages, () => {
          this.game.startSpecificBossBattle(['mizuchi_boss']); this.bossDefeated.mizuchi = true; this.artifactsObtained.magatama = true;
        }, 'boss_mizuchi');
        return;
      }
      if (bossKey === 'shuten' && !this.bossDefeated.shuten && GAME_DATA.bossEvents.shuten) {
        this.startDialog(GAME_DATA.bossEvents.shuten.speaker, GAME_DATA.bossEvents.shuten.messages, () => {
          this.game.startSpecificBossBattle(['shuten']); this.bossDefeated.shuten = true;
        }, 'boss_shuten');
        return;
      }
      if (bossKey === 'ibaraki' && !this.bossDefeated.ibaraki && GAME_DATA.bossEvents.ibaraki) {
        this.startDialog(GAME_DATA.bossEvents.ibaraki.speaker, GAME_DATA.bossEvents.ibaraki.messages, () => {
          this.game.startSpecificBossBattle(['ibaraki']); this.bossDefeated.ibaraki = true;
        }, 'boss_ibaraki');
        return;
      }
      if (bossKey === 'musokage' && !this.bossDefeated.musokage && GAME_DATA.bossEvents.musokage) {
        this.startDialog(GAME_DATA.bossEvents.musokage.speaker, GAME_DATA.bossEvents.musokage.messages, () => {
          this.game.startSpecificBossBattle(['musokage']); this.bossDefeated.musokage = true; this.artifactsObtained.sword = true;
        }, 'boss_musokage');
        return;
      }
      if (bossKey === 'shin_youko' && !this.bossDefeated.shin_youko && GAME_DATA.bossEvents.shin_youko) {
        this.startDialog(GAME_DATA.bossEvents.shin_youko.speaker, GAME_DATA.bossEvents.shin_youko.messages, () => {
          this.game.startSpecificBossBattle(['shin_youko']); this.bossDefeated.shin_youko = true;
        }, 'boss_shin_youko');
        return;
      }
    }

    const encType = this.encounterTypeGrid[p.gridY][p.gridX];
    if (!encType) return;
    p.stepsSinceEncounter++;
    if (p.stepsSinceEncounter >= 5) {
      const chance = Math.min(0.22, (p.stepsSinceEncounter - 5) * 0.04);
      if (Math.random() < chance) {
        p.stepsSinceEncounter = 0;
        this.game.startAreaBattle(encType);
      }
    }
  }

  updateCamera() {
    const viewWidth = 1280; const viewHeight = 960;
    this.camera.x = this.player.x + this.tileSize / 2 - viewWidth / 2;
    this.camera.y = this.player.y + this.tileSize / 2 - viewHeight / 2;
    const maxCamX = this.mapWidth * this.tileSize - viewWidth;
    const maxCamY = this.mapHeight * this.tileSize - viewHeight;
    this.camera.x = Math.max(0, Math.min(this.camera.x, maxCamX));
    this.camera.y = Math.max(0, Math.min(this.camera.y, maxCamY));
  }

  render(ctx) {
    const viewWidth = 1280; const viewHeight = 960;
    const font = this.game.graphics.fontFamily;
    ctx.save();
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    // タイル描画 (64x64)
    const startTileX = Math.max(0, Math.floor(this.camera.x / this.tileSize));
    const endTileX = Math.min(this.mapWidth - 1, Math.ceil((this.camera.x + viewWidth) / this.tileSize));
    const startTileY = Math.max(0, Math.floor(this.camera.y / this.tileSize));
    const endTileY = Math.min(this.mapHeight - 1, Math.ceil((this.camera.y + viewHeight) / this.tileSize));

    for (let ty = startTileY; ty <= endTileY; ty++) {
      for (let tx = startTileX; tx <= endTileX; tx++) {
        const tileType = this.mapGrid[ty][tx];
        const tileImg = this.game.graphics.tiles[tileType];
        if (tileImg) ctx.drawImage(tileImg, tx * this.tileSize, ty * this.tileSize);
      }
    }

    // NPC描画 (64x64)
    const currentNpcs = GAME_DATA.npcs.filter(npc => npc.chapter === this.currentChapter);
    for (const npc of currentNpcs) {
      const npcSprite = this.game.graphics.sprites[npc.spriteKey];
      if (npcSprite) ctx.drawImage(npcSprite, npc.x * this.tileSize, npc.y * this.tileSize);
    }

    // 3人隊列 (64x64)
    const p = this.player;
    let ninjaX = p.x; let ninjaY = p.y;
    if (p.facing === 'down') ninjaY -= 104; if (p.facing === 'up') ninjaY += 104; if (p.facing === 'left') ninjaX += 104; if (p.facing === 'right') ninjaX -= 104;
    const ninjaSprite = this.game.graphics.sprites[`ninja_walk_${p.facing}_${p.animFrame}`];
    if (ninjaSprite) ctx.drawImage(ninjaSprite, Math.round(ninjaX), Math.round(ninjaY));

    let mikoX = p.x; let mikoY = p.y;
    if (p.facing === 'down') mikoY -= 52; if (p.facing === 'up') mikoY += 52; if (p.facing === 'left') mikoX += 52; if (p.facing === 'right') mikoX -= 52;
    const mikoSprite = this.game.graphics.sprites[`miko_walk_${p.facing}_${p.animFrame}`];
    if (mikoSprite) ctx.drawImage(mikoSprite, Math.round(mikoX), Math.round(mikoY));

    const samuraiSprite = this.game.graphics.sprites[`samurai_walk_${p.facing}_${p.animFrame}`];
    if (samuraiSprite) ctx.drawImage(samuraiSprite, Math.round(p.x), Math.round(p.y));

    ctx.restore();

    // 現在の章表示 (くっきり美麗フォント)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'; ctx.fillRect(24, 24, 380, 50);
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2; ctx.strokeRect(24, 24, 380, 50);
    const chapNames = ['', '【第一章: 妖しの森】', '【第二章: 霊峰と湖底】', '【第三章: 魔都羅生門】'];
    this.game.graphics.drawCrispText(ctx, chapNames[this.currentChapter], 36, 56, `bold 22px ${font}`, '#ffd666', '#2a1a00', 3);

    if (this.menu.active) this.renderMenu(ctx);
    if (this.statusScreen.active) this.renderStatusScreen(ctx);
    if (this.dialog.active) this.renderDialog(ctx);
  }

  renderMenu(ctx) {
    const font = this.game.graphics.fontFamily;
    const m = this.menu;

    if (m.subState === 'ITEM') {
      const ix = 320; const iy = 120; const iw = 880; const ih = 720;
      this.game.graphics.drawUrushiFrame(ctx, ix, iy, iw, ih, '所持品・道具使用');

      // 所持金
      this.game.graphics.drawCrispText(ctx, `【 所持金 】: ${GAME_DATA.money || 0} 文`, ix + 48, iy + 72, `bold 26px ${font}`, '#ffd666', '#16101c', 4);

      // アイテムリスト
      const itemOptions = [
        ...GAME_DATA.items.map(it => `${it.name}  x${it.count}  (${it.desc})`),
        'もどる'
      ];

      itemOptions.forEach((opt, idx) => {
        const isSel = m.itemSubIndex === idx;
        const color = isSel ? '#ffd666' : (idx < 3 && GAME_DATA.items[idx].count === 0 ? '#888888' : '#f0e8f8');
        this.game.graphics.drawCrispText(ctx, (isSel ? '▶ ' : '  ') + opt, ix + 48, iy + 140 + idx * 80, `bold 24px ${font}`, color, '#16101c', 4);
      });

      // 三神具
      ctx.fillStyle = '#18121f'; ctx.fillRect(ix + 40, iy + 480, iw - 80, 180);
      ctx.strokeStyle = '#9e2a2b'; ctx.lineWidth = 2; ctx.strokeRect(ix + 40, iy + 480, iw - 80, 180);

      this.game.graphics.drawCrispText(ctx, '【 三 神 具 の 封 印 解 除 】', ix + 56, iy + 520, `bold 22px ${font}`, '#ffd666', '#000', 3);
      this.game.graphics.drawCrispText(ctx, `・八咫の鏡: ${this.artifactsObtained.mirror ? '所持（霊峰白嶺の光）' : '未所持'}`, ix + 56, iy + 560, `20px ${font}`, this.artifactsObtained.mirror ? '#ffffff' : '#888', '#000', 3);
      this.game.graphics.drawCrispText(ctx, `・八尺瓊勾玉: ${this.artifactsObtained.magatama ? '所持（湖底神殿の加護）' : '未所持'}`, ix + 56, iy + 600, `20px ${font}`, this.artifactsObtained.magatama ? '#ffffff' : '#888', '#000', 3);
      this.game.graphics.drawCrispText(ctx, `・草薙の剣: ${this.artifactsObtained.sword ? '所持（師・無双影の魂）' : '未所持'}`, ix + 56, iy + 640, `20px ${font}`, this.artifactsObtained.sword ? '#ffffff' : '#888', '#000', 3);

      this.game.graphics.drawCrispText(ctx, '【 決定/タップ: 使う | 取消: 戻る 】', ix + 240, iy + ih - 16, `20px ${font}`, '#aaa', '#000', 3);
      return;
    }

    const mx = 680; const my = 100; const mw = 550; const mh = 500;
    this.game.graphics.drawUrushiFrame(ctx, mx, my, mw, mh, '絵巻物手鑑（主献立）');
    this.menu.items.forEach((item, idx) => {
      const iy = my + 96 + idx * 84;
      const isSel = this.menu.selectedIndex === idx;
      const color = isSel ? '#ffd666' : '#f0e8f8';
      this.game.graphics.drawCrispText(ctx, (isSel ? '▶ ' : '  ') + item, mx + 40, iy, `bold 46px ${font}`, color, '#16101c', 4);
    });
  }

  renderStatusScreen(ctx) {
    const font = this.game.graphics.fontFamily;
    const ss = this.statusScreen;
    const char = GAME_DATA.party[ss.partyIndex];
    const portrait = this.game.graphics.portraits[char.spriteKey];

    this.game.graphics.drawUrushiFrame(ctx, 32, 32, 1216, 896, `強 さ（能力） - ${ss.partyIndex + 1}/3`);
    this.game.graphics.drawCrispText(ctx, '◀ [A/左]', 64, 108, `bold 40px ${font}`, '#ffd666', '#000', 4);
    this.game.graphics.drawCrispText(ctx, '[D/右] ▶', 980, 108, `bold 40px ${font}`, '#ffd666', '#000', 4);

    if (portrait) {
      ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 4; ctx.strokeRect(68, 144, 160, 160);
      ctx.drawImage(portrait, 72, 148, 152, 152);
    }

    this.game.graphics.drawCrispText(ctx, char.name, 260, 196, `bold 52px ${font}`, '#ffeed0', '#000', 4.5);
    this.game.graphics.drawCrispText(ctx, `【${char.title}】`, 260, 246, `bold 38px ${font}`, '#d4af37', '#000', 3.5);
    this.game.graphics.drawCrispText(ctx, `職業: ${char.job}   Lv.${char.level}`, 260, 292, `bold 36px ${font}`, '#d0c8e0', '#000', 3.5);

    ctx.fillStyle = '#22192b'; ctx.fillRect(64, 332, 1152, 180);
    ctx.strokeStyle = '#685030'; ctx.lineWidth = 2; ctx.strokeRect(64, 332, 1152, 180);

    this.game.graphics.drawCrispText(ctx, `H P: ${char.hp} / ${char.maxHp}`, 92, 396, `bold 40px ${font}`, '#ffffff', '#000', 4);
    this.game.graphics.drawCrispText(ctx, `M P: ${char.mp} / ${char.maxMp}`, 92, 452, `bold 40px ${font}`, '#ffffff', '#000', 4);
    this.game.graphics.drawCrispText(ctx, `攻撃力: ${char.atk}`, 480, 396, `bold 40px ${font}`, '#ffffff', '#000', 4);
    this.game.graphics.drawCrispText(ctx, `防御力: ${char.def}`, 480, 452, `bold 40px ${font}`, '#ffffff', '#000', 4);
    this.game.graphics.drawCrispText(ctx, `精神力: ${char.matk}`, 760, 396, `bold 40px ${font}`, '#ffffff', '#000', 4);
    this.game.graphics.drawCrispText(ctx, `素早さ: ${char.spd}`, 760, 452, `bold 40px ${font}`, '#ffffff', '#000', 4);
    this.game.graphics.drawCrispText(ctx, `EXP: ${char.exp} (次まで ${char.nextExp - char.exp})`, 92, 498, `bold 32px ${font}`, '#ffd666', '#000', 3.5);

    this.game.graphics.drawCrispText(ctx, '【 習 得 技 ・ 術 一 覧 】', 72, 560, `bold 42px ${font}`, '#ffeed0', '#000', 4);

    const skills = char.skills.map(k => GAME_DATA.skills[k] || { name: '技', mpCost: 0, desc: '奥義' });
    skills.forEach((sk, idx) => {
      const sx = 92 + (idx % 2) * 550; const sy = 616 + Math.floor(idx / 2) * 60;
      const isSel = ss.selectedSkillIndex === idx;
      const col = isSel ? '#ffd666' : '#ffffff';
      this.game.graphics.drawCrispText(ctx, `${isSel ? '▶ ' : '・'}${sk.name} (${sk.mpCost}MP)`, sx, sy, `bold 38px ${font}`, col, '#000', 3.5);
    });

    const selectedSkill = skills[ss.selectedSkillIndex] || skills[0];
    if (selectedSkill) {
      ctx.fillStyle = '#110d16'; ctx.fillRect(64, 748, 1152, 116);
      ctx.strokeStyle = '#9e2a2b'; ctx.lineWidth = 2; ctx.strokeRect(64, 748, 1152, 116);
      this.game.graphics.drawCrispText(ctx, `【${selectedSkill.name}】: ${selectedSkill.desc}`, 84, 816, `bold 36px ${font}`, '#ffeed0', '#000', 3.5);
    }
    this.game.graphics.drawCrispText(ctx, '【 左右: キャラ切替 | B/取消: 閉じる 】', 280, 904, `bold 34px ${font}`, '#aaa', '#000', 3.5);
  }

  renderDialog(ctx) {
    const font = this.game.graphics.fontFamily;
    const d = this.dialog;
    const wx = 36; const wy = 590; const ww = 1208; const wh = 338;
    this.game.graphics.drawUrushiFrame(ctx, wx, wy, ww, wh, d.speakerName);

    // ポートレート立ち絵の解決と描画
    let portrait = null;
    if (d.portraitKey && this.game.graphics.portraits[d.portraitKey]) {
      portrait = this.game.graphics.portraits[d.portraitKey];
    } else if (d.speakerName && this.game.graphics.portraits[d.speakerName]) {
      portrait = this.game.graphics.portraits[d.speakerName];
    }

    let textStartX = wx + 64;
    if (portrait) {
      const px = wx + 32; const py = wy + 56; const pSize = 192;
      // ポートレート枠と背景
      ctx.fillStyle = '#100c14'; ctx.fillRect(px, py, pSize, pSize);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(portrait, 0, 0, portrait.width, portrait.height, px + 4, py + 4, pSize - 8, pSize - 8);
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 3.5; ctx.strokeRect(px, py, pSize, pSize);
      textStartX = wx + 256;
    }

    d.displayedText.split('\n').forEach((line, idx) => {
      this.game.graphics.drawCrispText(ctx, line, textStartX, wy + 96 + idx * 72, `bold 48px ${font}`, '#fcfaf2', '#0c0812', 4.5);
    });
    if (d.isComplete && Math.floor(Date.now() / 300) % 2 === 0) {
      this.game.graphics.drawCrispText(ctx, '▼ (タップで進む)', wx + ww - 340, wy + wh - 32, `bold 36px ${font}`, '#ffd666', '#000', 4);
    }
  }
}
