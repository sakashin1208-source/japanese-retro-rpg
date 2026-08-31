/**
 * ==========================================================================
 * 妖幻奇譚 〜もののけ草子〜 1280x960 ハイレゾHD-2Dグラフィックエンジン
 * (美麗フォント・文字フチ取り・64pxタイル・128pxキャラ・192pxボス完全対応)
 * ==========================================================================
 */

class GraphicsEngine {
  constructor() {
    this.sprites = {};
    this.portraits = {};
    this.tiles = {};
    this.fontFamily = "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif";
    this.generateAllAssets();
  }

  generateAllAssets() {
    this.generateTiles();
    this.generateCharacterSprites();
    this.generateNpcSprites();
    this.generateMonsterSprites();
    this.generateBossSprites();
    this.generatePortraits();
  }

  // ==========================================
  // テキスト描画ユーティリティ (文字フチ取り＆くっきり描画)
  // ==========================================
  drawCrispText(ctx, text, x, y, fontStr, color = '#ffffff', strokeColor = '#0b0810', lineWidth = 3.5) {
    ctx.save();
    ctx.font = fontStr;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    if (strokeColor && lineWidth > 0) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ==========================================
  // 1. タイル生成 (64x64 ハイレゾ)
  // ==========================================
  generateTiles() {
    const ts = 64;

    // --- 第一章タイル ---
    this.tiles.grass = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#26582a'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#347838';
      for (let x = 2; x < ts; x += 8) {
        for (let y = 2; y < ts; y += 8) {
          if ((x * y) % 3 === 0) {
            ctx.fillRect(x, y, 4, 6);
            ctx.fillRect(x + 2, y - 2, 2, 4);
          }
        }
      }
      ctx.fillStyle = '#429448';
      [[8, 12], [24, 36], [44, 16], [32, 52], [56, 44], [16, 24]].forEach(([gx, gy]) => {
        ctx.fillRect(gx, gy, 4, 4);
        ctx.fillRect(gx + 2, gy - 4, 2, 4);
      });
      ctx.fillStyle = '#1a3e1d';
      for (let x = 4; x < ts; x += 12) ctx.fillRect(x, (x * 7) % ts, 4, 2);
    });

    this.tiles.dirt = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#7a5230'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#94663e';
      for (let x = 0; x < ts; x += 10) {
        for (let y = 0; y < ts; y += 10) ctx.fillRect(x + (y % 2) * 4, y, 8, 6);
      }
      ctx.fillStyle = '#583a20';
      [[6, 14], [30, 8], [50, 36], [20, 48], [40, 56]].forEach(([px, py]) => {
        ctx.fillRect(px, py, 6, 4);
        ctx.fillStyle = '#baa07a'; ctx.fillRect(px + 2, py, 2, 2); ctx.fillStyle = '#583a20';
      });
    });

    this.tiles.stone = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#3a3840'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#64626c';
      ctx.fillRect(2, 2, 28, 28); ctx.fillRect(34, 2, 28, 28);
      ctx.fillRect(2, 34, 28, 28); ctx.fillRect(34, 34, 28, 28);
      ctx.fillStyle = '#82808c';
      ctx.fillRect(4, 4, 24, 4); ctx.fillRect(4, 4, 4, 24);
      ctx.fillRect(36, 4, 24, 4); ctx.fillRect(36, 4, 4, 24);
      ctx.fillRect(4, 36, 24, 4); ctx.fillRect(4, 36, 4, 24);
      ctx.fillRect(36, 36, 24, 4); ctx.fillRect(36, 36, 4, 24);
      ctx.fillStyle = '#222026';
      ctx.fillRect(0, 30, ts, 4); ctx.fillRect(30, 0, 4, ts);
    });

    this.tiles.water = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#143c68'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#1e548e';
      ctx.fillRect(0, 8, ts, 12); ctx.fillRect(0, 32, ts, 16); ctx.fillRect(0, 52, ts, 8);
      ctx.fillStyle = '#4ea4e0';
      ctx.fillRect(8, 12, 16, 4); ctx.fillRect(36, 16, 20, 4);
      ctx.fillRect(4, 40, 24, 4); ctx.fillRect(40, 36, 16, 4);
      ctx.fillStyle = '#a0d8ff';
      ctx.fillRect(12, 12, 8, 2); ctx.fillRect(44, 36, 8, 2);
    });

    this.tiles.swamp = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#261a2c'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#422450';
      ctx.fillRect(4, 8, 24, 20); ctx.fillRect(32, 28, 28, 24);
      ctx.fillStyle = '#7a3498';
      ctx.beginPath(); ctx.arc(16, 18, 8, 0, Math.PI * 2); ctx.arc(44, 40, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c068f0'; ctx.fillRect(14, 16, 4, 4); ctx.fillRect(42, 38, 4, 4);
    });

    this.tiles.bamboo = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#18321c'; ctx.fillRect(0, 0, ts, ts);
      [12, 36, 52].forEach(bx => {
        ctx.fillStyle = '#2a5a30'; ctx.fillRect(bx, 0, 10, ts);
        ctx.fillStyle = '#468e50'; ctx.fillRect(bx + 2, 0, 4, ts);
        ctx.fillStyle = '#142816'; ctx.fillRect(bx, 20, 10, 4); ctx.fillRect(bx, 44, 10, 4);
      });
      ctx.fillStyle = '#5ab864';
      ctx.fillRect(4, 12, 12, 6); ctx.fillRect(24, 28, 16, 6); ctx.fillRect(40, 8, 16, 6);
    });

    this.tiles.pine = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#18321c'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#4e301a'; ctx.fillRect(26, 32, 12, 32);
      ctx.fillStyle = '#6e4428'; ctx.fillRect(30, 32, 4, 32);
      ctx.fillStyle = '#1a4020'; ctx.beginPath(); ctx.arc(32, 26, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#265c2e'; ctx.beginPath(); ctx.arc(32, 22, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3c7e46'; ctx.beginPath(); ctx.arc(30, 18, 12, 0, Math.PI * 2); ctx.fill();
    });

    this.tiles.rock = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#26582a'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#323038'; ctx.beginPath(); ctx.arc(32, 32, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#54505c'; ctx.beginPath(); ctx.arc(30, 28, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7c7688'; ctx.fillRect(20, 18, 16, 12);
      ctx.fillStyle = '#2d6830'; ctx.fillRect(36, 32, 8, 6);
    });

    this.tiles.field = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#58361e'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#7a4e2c';
      for (let x = 0; x < ts; x += 16) ctx.fillRect(x, 0, 8, ts);
      ctx.fillStyle = '#3e8842';
      for (let x = 2; x < ts; x += 16) {
        for (let y = 4; y < ts; y += 12) ctx.fillRect(x, y, 4, 8);
      }
    });

    this.tiles.roof = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#1a1e24'; ctx.fillRect(0, 0, ts, ts);
      for (let y = 0; y < ts; y += 16) {
        ctx.fillStyle = '#363d4a'; ctx.fillRect(0, y + 2, ts, 10);
        ctx.fillStyle = '#525c70'; ctx.fillRect(0, y + 2, ts, 4);
        ctx.fillStyle = '#101216'; ctx.fillRect(0, y + 12, ts, 4);
      }
    });

    this.tiles.wall = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#e4dcc8'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#50301e';
      ctx.fillRect(0, 0, ts, 6); ctx.fillRect(0, ts - 6, ts, 6);
      ctx.fillRect(0, 0, 6, ts); ctx.fillRect(ts - 6, 0, 6, ts);
      ctx.fillRect(28, 0, 8, ts);
      ctx.fillStyle = '#74462c'; ctx.fillRect(30, 0, 4, ts);
    });

    this.tiles.tatami = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#78945a'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#8cae6a';
      for (let y = 4; y < ts; y += 6) ctx.fillRect(4, y, ts - 8, 2);
      ctx.fillStyle = '#22301c';
      ctx.fillRect(0, 0, 4, ts); ctx.fillRect(ts - 4, 0, 4, ts);
      ctx.fillStyle = '#d4af37'; ctx.fillRect(0, 16, 4, 4); ctx.fillRect(ts - 4, 16, 4, 4);
    });

    this.tiles.wood = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#8c5e38'; ctx.fillRect(0, 0, ts, ts);
      for (let y = 0; y < ts; y += 16) {
        ctx.fillStyle = '#aa7648'; ctx.fillRect(0, y + 2, ts, 12);
        ctx.fillStyle = '#583a20'; ctx.fillRect(0, y + 14, ts, 2);
      }
    });

    this.tiles.barrier_stone = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#26582a'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#483858'; ctx.fillRect(12, 8, 40, 48);
      ctx.fillStyle = '#6a5482'; ctx.fillRect(16, 12, 32, 40);
      ctx.fillStyle = '#fce8c0'; ctx.fillRect(8, 20, 48, 8);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(16, 28, 6, 10); ctx.fillRect(42, 28, 6, 10);
      ctx.fillStyle = '#cc44ff'; ctx.fillRect(28, 32, 8, 16);
    });

    this.tiles.torii_top = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#26582a'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#c82424'; ctx.fillRect(0, 20, ts, 20);
      ctx.fillStyle = '#e84444'; ctx.fillRect(0, 20, ts, 6);
      ctx.fillStyle = '#141418'; ctx.fillRect(0, 12, ts, 8); ctx.fillRect(0, 8, ts, 4);
    });

    this.tiles.torii_post = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#26582a'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#c82424'; ctx.fillRect(8, 0, 16, ts); ctx.fillRect(40, 0, 16, ts);
      ctx.fillStyle = '#e84444'; ctx.fillRect(12, 0, 8, ts); ctx.fillRect(44, 0, 8, ts);
      ctx.fillStyle = '#141418'; ctx.fillRect(6, ts - 8, 20, 8); ctx.fillRect(38, ts - 8, 20, 8);
    });

    this.tiles.lantern = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#26582a'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#48444e'; ctx.fillRect(16, 8, 32, 12); ctx.fillRect(20, 48, 24, 12);
      ctx.fillStyle = '#ffea66'; ctx.fillRect(20, 20, 24, 24);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(26, 26, 12, 12);
      ctx.fillStyle = '#323038'; ctx.fillRect(16, 20, 4, 24); ctx.fillRect(44, 20, 4, 24);
    });

    this.tiles.shrine_box = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#3a3840'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#8a3418'; ctx.fillRect(8, 12, 48, 40);
      ctx.fillStyle = '#aa4422'; ctx.fillRect(12, 16, 40, 32);
      ctx.fillStyle = '#d4af37'; ctx.fillRect(26, 24, 12, 16);
      ctx.fillStyle = '#3a1808'; for (let x = 16; x < 48; x += 8) ctx.fillRect(x, 16, 4, 32);
    });

    // --- 第二章タイル ---
    this.tiles.snow = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#d8ebf8'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#ffffff';
      for (let x = 0; x < ts; x += 12) {
        for (let y = 0; y < ts; y += 12) ctx.fillRect(x, y, 8, 8);
      }
      ctx.fillStyle = '#a8cde8'; ctx.fillRect(20, 44, 10, 4); ctx.fillRect(48, 16, 8, 4);
    });

    this.tiles.ice = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#8cc8ee'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#b8e4fc'; ctx.fillRect(4, 4, 56, 24); ctx.fillRect(4, 36, 56, 24);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(8, 8, 48, 4); ctx.fillRect(8, 40, 48, 4);
      ctx.fillStyle = '#5098cc'; ctx.fillRect(0, 30, ts, 4);
    });

    this.tiles.deep_water = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#061830'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#0c2e58'; ctx.fillRect(0, 8, ts, 20); ctx.fillRect(0, 36, ts, 20);
      ctx.fillStyle = '#2068a8'; ctx.fillRect(12, 16, 24, 6); ctx.fillRect(32, 44, 20, 6);
      ctx.fillStyle = '#40c0f0'; ctx.fillRect(20, 18, 8, 2);
    });

    this.tiles.shrine_pillar = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#061830'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#346c84'; ctx.fillRect(12, 4, 40, 56);
      ctx.fillStyle = '#5ca0bc'; ctx.fillRect(20, 12, 24, 40);
      ctx.fillStyle = '#b0f0ff'; ctx.fillRect(26, 20, 12, 24);
    });

    // --- 第三章タイル ---
    this.tiles.capital_stone = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#241a2a'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#3e2a48';
      ctx.fillRect(4, 4, 24, 24); ctx.fillRect(36, 4, 24, 24);
      ctx.fillRect(4, 36, 24, 24); ctx.fillRect(36, 36, 24, 24);
      ctx.fillStyle = '#643872'; ctx.fillRect(8, 8, 16, 16); ctx.fillRect(40, 8, 16, 16);
      ctx.fillStyle = '#140c18'; ctx.fillRect(0, 30, ts, 4); ctx.fillRect(30, 0, 4, ts);
    });

    this.tiles.void_floor = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#06020c'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#160824'; ctx.fillRect(8, 8, 20, 20); ctx.fillRect(36, 36, 20, 20);
      ctx.fillStyle = '#aa20ff'; ctx.fillRect(28, 28, 8, 8);
      ctx.fillStyle = '#ff44aa'; ctx.fillRect(30, 30, 4, 4);
    });

    this.tiles.dark_pillar = this.createTile(ts, (ctx) => {
      ctx.fillStyle = '#06020c'; ctx.fillRect(0, 0, ts, ts);
      ctx.fillStyle = '#1e0a2c'; ctx.fillRect(12, 4, 40, 56);
      ctx.fillStyle = '#a01838'; ctx.fillRect(20, 16, 24, 32);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(28, 24, 8, 16);
    });
  }

  // ==========================================
  // 2. 歩行スプライト (64x64) & 戦闘キャラ (128x128)
  // ==========================================
  generateCharacterSprites() {
    const directions = ['down', 'up', 'left', 'right'];
    directions.forEach(dir => {
      for (let frame = 0; frame < 2; frame++) {
        this.sprites[`samurai_walk_${dir}_${frame}`] = this.createOutlinedTile(64, (ctx) => this.drawSamuraiWalk64(ctx, dir, frame), '#0a0810', 2);
        this.sprites[`miko_walk_${dir}_${frame}`] = this.createOutlinedTile(64, (ctx) => this.drawMikoWalk64(ctx, dir, frame), '#0a0810', 2);
        this.sprites[`ninja_walk_${dir}_${frame}`] = this.createOutlinedTile(64, (ctx) => this.drawNinjaWalk64(ctx, dir, frame), '#0a0810', 2);
      }
    });

    this.sprites.samurai_battle_idle = this.createOutlinedTile(128, (ctx) => this.drawSamuraiBattle128(ctx, 'idle'), '#0a0810', 3);
    this.sprites.samurai_battle_attack = this.createOutlinedTile(128, (ctx) => this.drawSamuraiBattle128(ctx, 'attack'), '#0a0810', 3);
    this.sprites.samurai_battle_cast = this.createOutlinedTile(128, (ctx) => this.drawSamuraiBattle128(ctx, 'cast'), '#0a0810', 3);
    this.sprites.samurai_battle_hit = this.createOutlinedTile(128, (ctx) => this.drawSamuraiBattle128(ctx, 'hit'), '#0a0810', 3);

    this.sprites.miko_battle_idle = this.createOutlinedTile(128, (ctx) => this.drawMikoBattle128(ctx, 'idle'), '#0a0810', 3);
    this.sprites.miko_battle_attack = this.createOutlinedTile(128, (ctx) => this.drawMikoBattle128(ctx, 'attack'), '#0a0810', 3);
    this.sprites.miko_battle_cast = this.createOutlinedTile(128, (ctx) => this.drawMikoBattle128(ctx, 'cast'), '#0a0810', 3);
    this.sprites.miko_battle_hit = this.createOutlinedTile(128, (ctx) => this.drawMikoBattle128(ctx, 'hit'), '#0a0810', 3);

    this.sprites.ninja_battle_idle = this.createOutlinedTile(128, (ctx) => this.drawNinjaBattle128(ctx, 'idle'), '#0a0810', 3);
    this.sprites.ninja_battle_attack = this.createOutlinedTile(128, (ctx) => this.drawNinjaBattle128(ctx, 'attack'), '#0a0810', 3);
    this.sprites.ninja_battle_cast = this.createOutlinedTile(128, (ctx) => this.drawNinjaBattle128(ctx, 'cast'), '#0a0810', 3);
    this.sprites.ninja_battle_hit = this.createOutlinedTile(128, (ctx) => this.drawNinjaBattle128(ctx, 'hit'), '#0a0810', 3);
  }

  drawSamuraiWalk64(ctx, dir, frame) {
    // 髪と鉢金
    ctx.fillStyle = '#100e14'; ctx.fillRect(18, 4, 28, 20); ctx.fillRect(36, 0, 14, 14);
    ctx.fillStyle = '#2c2838'; ctx.fillRect(20, 6, 22, 6); // 髪のハイライト
    ctx.fillStyle = '#c8d4e4'; ctx.fillRect(18, 10, 28, 4); // 鉢金
    ctx.fillStyle = '#d4af37'; ctx.fillRect(30, 9, 6, 6);   // 鉢金の前立て

    // 顔・表情
    ctx.fillStyle = '#f8d0a8'; ctx.fillRect(20, 14, 24, 14);
    ctx.fillStyle = '#e8b890'; ctx.fillRect(20, 24, 24, 4); // 顎の影
    if (dir === 'down') {
      ctx.fillStyle = '#111'; ctx.fillRect(24, 17, 4, 5); ctx.fillRect(36, 17, 4, 5);
      ctx.fillStyle = '#fff'; ctx.fillRect(25, 17, 2, 2); ctx.fillRect(37, 17, 2, 2);
    } else if (dir === 'left') {
      ctx.fillStyle = '#111'; ctx.fillRect(22, 17, 4, 5);
      ctx.fillStyle = '#fff'; ctx.fillRect(23, 17, 2, 2);
    } else if (dir === 'right') {
      ctx.fillStyle = '#111'; ctx.fillRect(38, 17, 4, 5);
      ctx.fillStyle = '#fff'; ctx.fillRect(39, 17, 2, 2);
    }

    // 浅葱色の羽織と着物
    ctx.fillStyle = '#1e4c8a'; ctx.fillRect(16, 28, 32, 20);
    ctx.fillStyle = '#3a78d0'; ctx.fillRect(18, 28, 28, 10); // 羽織ハイライト
    ctx.fillStyle = '#ffffff'; ctx.fillRect(26, 28, 12, 10); // 白襟
    ctx.fillStyle = '#d4af37'; ctx.fillRect(26, 38, 12, 5);  // 金帯
    ctx.fillStyle = '#9e2a2b'; ctx.fillRect(28, 40, 8, 2);   // 帯締め

    // 袴・足元
    ctx.fillStyle = '#141c2c';
    if (frame === 0) {
      ctx.fillRect(16, 46, 13, 16); ctx.fillRect(35, 46, 13, 18);
      ctx.fillStyle = '#fff'; ctx.fillRect(18, 60, 9, 4); ctx.fillRect(37, 62, 9, 4); // 白足袋
    } else {
      ctx.fillRect(16, 46, 13, 18); ctx.fillRect(35, 46, 13, 16);
      ctx.fillStyle = '#fff'; ctx.fillRect(18, 62, 9, 4); ctx.fillRect(37, 60, 9, 4);
    }

    // 帯刀（名刀）
    ctx.fillStyle = '#222'; ctx.fillRect(8, 34, 8, 20);
    ctx.fillStyle = '#d4af37'; ctx.fillRect(6, 32, 12, 4); // 鍔
    ctx.fillStyle = '#c8d4e4'; ctx.fillRect(10, 36, 4, 6); // 刃の輝き
  }

  drawMikoWalk64(ctx, dir, frame) {
    // 艶やかな黒髪
    ctx.fillStyle = '#14121c'; ctx.fillRect(16, 4, 32, 26);
    ctx.fillStyle = '#2a2638'; ctx.fillRect(18, 6, 28, 8); // 髪のツヤ
    ctx.fillStyle = '#14121c'; ctx.fillRect(12, 18, 8, 26); ctx.fillRect(44, 18, 8, 26); // 横髪

    // 髪飾りリボン
    ctx.fillStyle = '#e44444'; ctx.fillRect(24, 2, 16, 5); ctx.fillRect(22, 4, 4, 8); ctx.fillRect(38, 4, 4, 8);

    // 顔・表情
    ctx.fillStyle = '#fce4ce'; ctx.fillRect(20, 12, 24, 16);
    ctx.fillStyle = '#f0c8b0'; ctx.fillRect(20, 24, 24, 4);
    if (dir === 'down') {
      ctx.fillStyle = '#1b1424'; ctx.fillRect(24, 16, 4, 5); ctx.fillRect(36, 16, 4, 5);
      ctx.fillStyle = '#fff'; ctx.fillRect(25, 16, 2, 2); ctx.fillRect(37, 16, 2, 2);
      ctx.fillStyle = '#e86070'; ctx.fillRect(28, 24, 8, 2); // 紅
    } else if (dir === 'left') {
      ctx.fillStyle = '#1b1424'; ctx.fillRect(22, 16, 4, 5);
      ctx.fillStyle = '#fff'; ctx.fillRect(23, 16, 2, 2);
      ctx.fillStyle = '#e86070'; ctx.fillRect(22, 24, 4, 2);
    } else if (dir === 'right') {
      ctx.fillStyle = '#1b1424'; ctx.fillRect(38, 16, 4, 5);
      ctx.fillStyle = '#fff'; ctx.fillRect(39, 16, 2, 2);
      ctx.fillStyle = '#e86070'; ctx.fillRect(38, 24, 4, 2);
    }

    // 白衣（はくえ）
    ctx.fillStyle = '#ffffff'; ctx.fillRect(16, 28, 32, 16);
    ctx.fillStyle = '#d8dce8'; ctx.fillRect(16, 38, 32, 4); // 白衣の影
    ctx.fillStyle = '#cc2424'; ctx.fillRect(16, 42, 32, 4);  // 帯

    // 緋袴（ひばかま）
    ctx.fillStyle = '#c82424'; ctx.fillRect(16, 46, 32, 16);
    ctx.fillStyle = '#9e1818'; ctx.fillRect(22, 46, 4, 16); ctx.fillRect(38, 46, 4, 16); // 袴のプリーツ
    if (frame === 0) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 60, 8, 4);
    } else {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(36, 60, 8, 4);
    }
  }

  drawNinjaWalk64(ctx, dir, frame) {
    // 忍び頭巾と額当て
    ctx.fillStyle = '#161420'; ctx.fillRect(18, 4, 28, 20);
    ctx.fillStyle = '#7a889c'; ctx.fillRect(20, 8, 24, 5); // 額当て
    ctx.fillStyle = '#a8b8cc'; ctx.fillRect(28, 8, 8, 3);  // 額当て光沢

    // 目元・マスク
    ctx.fillStyle = '#f8d0a8'; ctx.fillRect(20, 13, 24, 8);
    ctx.fillStyle = '#111'; ctx.fillRect(24, 15, 4, 4); ctx.fillRect(36, 15, 4, 4);
    ctx.fillStyle = '#fff'; ctx.fillRect(25, 15, 2, 2); ctx.fillRect(37, 15, 2, 2);
    ctx.fillStyle = '#161420'; ctx.fillRect(20, 21, 24, 8); // マスク

    // たなびく朱色マフラー
    ctx.fillStyle = '#d82424'; ctx.fillRect(16, 24, 32, 6);
    if (dir === 'right') {
      ctx.fillRect(4, 24, 16, 6); ctx.fillStyle = '#a01818'; ctx.fillRect(2, 28, 14, 4);
    } else {
      ctx.fillRect(44, 24, 16, 6); ctx.fillStyle = '#a01818'; ctx.fillRect(48, 28, 14, 4);
    }

    // 忍装束（鎖帷子＆黒装束）
    ctx.fillStyle = '#22202e'; ctx.fillRect(16, 30, 32, 16);
    ctx.fillStyle = '#343044'; ctx.fillRect(20, 32, 24, 8); // 胸部ハイライト
    ctx.fillStyle = '#100e18'; ctx.fillRect(16, 42, 32, 4);

    // 足元
    if (frame === 0) {
      ctx.fillStyle = '#161420'; ctx.fillRect(16, 46, 12, 16); ctx.fillRect(36, 46, 12, 14);
      ctx.fillStyle = '#3a3648'; ctx.fillRect(16, 56, 12, 4);
    } else {
      ctx.fillStyle = '#161420'; ctx.fillRect(16, 46, 12, 14); ctx.fillRect(36, 46, 12, 16);
      ctx.fillStyle = '#3a3648'; ctx.fillRect(36, 56, 12, 4);
    }
  }

  drawSamuraiBattle128(ctx, pose) {
    const ox = pose === 'attack' ? -16 : 0;

    // 髪・鉢金
    ctx.fillStyle = '#121018'; ctx.fillRect(48 + ox, 10, 36, 30); ctx.fillRect(74 + ox, 2, 18, 18);
    ctx.fillStyle = '#2c2838'; ctx.fillRect(52 + ox, 12, 28, 8); // 髪の光沢
    ctx.fillStyle = '#c8d4e4'; ctx.fillRect(48 + ox, 20, 36, 6); // 鉢金
    ctx.fillStyle = '#ffd700'; ctx.fillRect(62 + ox, 18, 8, 8); // 前立て

    // 顔・眼光
    ctx.fillStyle = '#f8d0a8'; ctx.fillRect(40 + ox, 26, 36, 26);
    ctx.fillStyle = '#e8b088'; ctx.fillRect(40 + ox, 44, 36, 8);
    ctx.fillStyle = '#111'; ctx.fillRect(44 + ox, 34, 10, 6);
    ctx.fillStyle = '#fff'; ctx.fillRect(46 + ox, 34, 4, 3);

    // 浅葱色の羽織・胴体
    ctx.fillStyle = '#1c4c88'; ctx.fillRect(32 + ox, 52, 60, 42);
    ctx.fillStyle = '#3878cc'; ctx.fillRect(36 + ox, 54, 52, 16); // ハイライト
    ctx.fillStyle = '#ffffff'; ctx.fillRect(48 + ox, 52, 16, 26); // 白襟
    ctx.fillStyle = '#ffd700'; ctx.fillRect(32 + ox, 80, 60, 12); // 金帯
    ctx.fillStyle = '#9e2a2b'; ctx.fillRect(40 + ox, 84, 44, 4);  // 帯締め

    // 袴
    ctx.fillStyle = '#141c2c'; ctx.fillRect(30 + ox, 92, 28, 34); ctx.fillRect(62 + ox, 92, 28, 34);
    ctx.fillStyle = '#26344e'; ctx.fillRect(34 + ox, 94, 8, 30); ctx.fillRect(66 + ox, 94, 8, 30); // プリーツ
    ctx.fillStyle = '#ffffff'; ctx.fillRect(34 + ox, 122, 18, 6); ctx.fillRect(66 + ox, 122, 18, 6); // 白足袋

    // 刀（波紋・刃文つき）
    if (pose === 'idle') {
      ctx.fillStyle = '#222'; ctx.fillRect(16, 52, 18, 56);
      ctx.fillStyle = '#d4af37'; ctx.fillRect(12, 48, 26, 8); // 鍔
      ctx.fillStyle = '#e8f0fe'; ctx.fillRect(18, 56, 12, 48); // 刀身
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 56, 4, 48);  // 刃文ハイライト
    } else if (pose === 'attack') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 16, 64, 16);
      ctx.fillStyle = '#c8e0ff'; ctx.fillRect(0, 20, 64, 8);
      ctx.fillStyle = '#d4af37'; ctx.fillRect(56, 12, 16, 24);
      // 残光エフェクト
      ctx.fillStyle = 'rgba(100, 200, 255, 0.4)'; ctx.fillRect(0, 8, 80, 8);
    }
  }

  drawMikoBattle128(ctx, pose) {
    const ox = pose === 'attack' ? -12 : 0;

    // 黒髪と髪飾り
    ctx.fillStyle = '#14121c'; ctx.fillRect(44 + ox, 6, 44, 42);
    ctx.fillStyle = '#2c263c'; ctx.fillRect(48 + ox, 8, 36, 10);
    ctx.fillStyle = '#e44444'; ctx.fillRect(52 + ox, 2, 24, 6); // リボン

    // 顔・表情
    ctx.fillStyle = '#fce4ce'; ctx.fillRect(36 + ox, 30, 36, 26);
    ctx.fillStyle = '#111'; ctx.fillRect(42 + ox, 38, 8, 6);
    ctx.fillStyle = '#fff'; ctx.fillRect(44 + ox, 38, 3, 3);
    ctx.fillStyle = '#e86070'; ctx.fillRect(44 + ox, 48, 8, 3);

    // 白衣
    ctx.fillStyle = '#ffffff'; ctx.fillRect(32 + ox, 56, 52, 30);
    ctx.fillStyle = '#d8dce8'; ctx.fillRect(32 + ox, 76, 52, 10);
    ctx.fillStyle = '#cc2424'; ctx.fillRect(32 + ox, 82, 52, 6);

    // 緋袴
    ctx.fillStyle = '#cc2424'; ctx.fillRect(26 + ox, 86, 64, 40);
    ctx.fillStyle = '#9e1818'; ctx.fillRect(36 + ox, 88, 8, 36); ctx.fillRect(56 + ox, 88, 8, 36);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(36 + ox, 122, 16, 6); ctx.fillRect(60 + ox, 122, 16, 6);

    // 御幣（神気オーラ）
    ctx.fillStyle = '#8a5c36'; ctx.fillRect(12 + ox, 30, 10, 78);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(2 + ox, 18, 30, 26);
    ctx.fillStyle = '#fff9d0'; ctx.fillRect(6 + ox, 22, 22, 18);
    // 神気パーティクル
    ctx.fillStyle = '#ffea66'; ctx.fillRect(0 + ox, 12, 6, 6); ctx.fillRect(28 + ox, 10, 6, 6);
  }

  drawNinjaBattle128(ctx, pose) {
    const ox = pose === 'attack' ? -20 : 0;

    // 額当て・頭巾
    ctx.fillStyle = '#161420'; ctx.fillRect(48 + ox, 14, 36, 26);
    ctx.fillStyle = '#7a889c'; ctx.fillRect(42 + ox, 18, 36, 12);
    ctx.fillStyle = '#c0d0e4'; ctx.fillRect(50 + ox, 20, 14, 4);

    // 顔・眼光
    ctx.fillStyle = '#f8d0a8'; ctx.fillRect(38 + ox, 30, 36, 14);
    ctx.fillStyle = '#111'; ctx.fillRect(44 + ox, 33, 8, 5);
    ctx.fillStyle = '#00ffff'; ctx.fillRect(46 + ox, 34, 3, 3); // 鋭い碧眼
    ctx.fillStyle = '#161420'; ctx.fillRect(38 + ox, 44, 36, 14); // マスク

    // 朱色マフラー
    ctx.fillStyle = '#d82424'; ctx.fillRect(64 + ox, 50, 48, 14);
    ctx.fillStyle = '#a01818'; ctx.fillRect(72 + ox, 62, 40, 10);

    // 忍装束
    ctx.fillStyle = '#22202e'; ctx.fillRect(32 + ox, 58, 52, 34);
    ctx.fillStyle = '#38344c'; ctx.fillRect(36 + ox, 62, 40, 16);
    ctx.fillStyle = '#12101a'; ctx.fillRect(28 + ox, 92, 26, 34); ctx.fillRect(58 + ox, 92, 26, 34);

    // クナイ（二刀流）
    if (pose === 'idle') {
      ctx.fillStyle = '#c8d4e4'; ctx.fillRect(14, 60, 26, 14);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(18, 62, 16, 4);
    } else if (pose === 'attack') {
      ctx.fillStyle = '#c8d4e4'; ctx.fillRect(0, 38, 40, 18);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 42, 32, 6);
      ctx.fillStyle = 'rgba(0, 255, 255, 0.4)'; ctx.fillRect(0, 32, 50, 6);
    }
  }

  // ==========================================
  // 3. 街人NPC (64x64 全17名 固有専用スプライト)
  // ==========================================
  generateNpcSprites() {
    const s = 64;

    // --- 第一章 (10名) ---
    // 1. 村長（むらおさ）: 白髪髷、深緑羽織、白髭、木彫りの杖
    this.sprites.npc_village_head = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#dcdce8'; ctx.fillRect(22, 6, 20, 16); ctx.fillRect(18, 12, 28, 14); // 白髪
      ctx.fillStyle = '#f8d0a8'; ctx.fillRect(20, 16, 24, 16); // 顔
      ctx.fillStyle = '#111'; ctx.fillRect(24, 20, 4, 4); ctx.fillRect(36, 20, 4, 4);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(22, 26, 20, 8); // 立派な白髭
      ctx.fillStyle = '#244830'; ctx.fillRect(16, 32, 32, 28); // 深緑羽織
      ctx.fillStyle = '#3a6848'; ctx.fillRect(18, 34, 28, 6);
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(48, 24, 6, 36); // 木彫り杖
      ctx.fillStyle = '#ffd700'; ctx.fillRect(46, 22, 10, 6);
    }, '#0a0810', 2);

    // 2. 看板娘・お花: 桃色の桜小袖、前掛け、お団子髪飾り、団子皿
    this.sprites.npc_ohana = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#14121c'; ctx.fillRect(20, 6, 24, 18); // 黒髪
      ctx.fillStyle = '#ff6890'; ctx.beginPath(); ctx.arc(42, 8, 6, 0, Math.PI * 2); ctx.fill(); // 髪飾り
      ctx.fillStyle = '#fce4ce'; ctx.fillRect(20, 16, 24, 16);
      ctx.fillStyle = '#111'; ctx.fillRect(24, 20, 4, 4); ctx.fillRect(36, 20, 4, 4);
      ctx.fillStyle = '#ff88a8'; ctx.fillRect(22, 24, 4, 2); ctx.fillRect(38, 24, 4, 2); // 頬紅
      ctx.fillStyle = '#e85078'; ctx.fillRect(16, 32, 32, 28); // 桃色小袖
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 38, 24, 18); // 白前掛け
      // 団子皿
      ctx.fillStyle = '#d4af37'; ctx.fillRect(6, 38, 14, 4);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(9, 36, 3, 0, Math.PI * 2); ctx.arc(13, 36, 3, 0, Math.PI * 2); ctx.fill();
    }, '#0a0810', 2);

    // 3. 神主: 黒烏帽子、白狩衣、紫袴、手にした御幣
    this.sprites.npc_kannushi = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#14141c'; ctx.fillRect(24, 2, 16, 14); ctx.fillRect(20, 12, 24, 4); // 烏帽子
      ctx.fillStyle = '#f8d0a8'; ctx.fillRect(20, 14, 24, 16);
      ctx.fillStyle = '#111'; ctx.fillRect(24, 18, 4, 4); ctx.fillRect(36, 18, 4, 4);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(16, 28, 32, 16); // 白狩衣
      ctx.fillStyle = '#6a1888'; ctx.fillRect(16, 44, 32, 18); // 紫袴
      // 御幣（幣束）
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(48, 20, 4, 40);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(44, 22, 12, 12); ctx.fillRect(42, 30, 8, 8);
    }, '#0a0810', 2);

    // 4. 鍛冶屋・源蔵: ねじり鉢巻、逞しい赤銅筋肉、革前掛け、金槌
    this.sprites.npc_smith_genzo = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(16, 8, 32, 6); // 鉢巻
      ctx.fillStyle = '#ff2222'; ctx.fillRect(22, 8, 4, 6); ctx.fillRect(34, 8, 4, 6);
      ctx.fillStyle = '#d88c58'; ctx.fillRect(20, 14, 24, 16); // 日焼け顔
      ctx.fillStyle = '#111'; ctx.fillRect(24, 18, 4, 4); ctx.fillRect(36, 18, 4, 4);
      ctx.fillStyle = '#301808'; ctx.fillRect(24, 26, 16, 4); // 髭
      ctx.fillStyle = '#d88c58'; ctx.fillRect(14, 30, 36, 16); // 筋肉上半身
      ctx.fillStyle = '#4a2810'; ctx.fillRect(18, 40, 28, 22); // 革前掛け
      // 大金槌
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(8, 28, 6, 32);
      ctx.fillStyle = '#707888'; ctx.fillRect(4, 24, 14, 10);
    }, '#0a0810', 2);

    // 5. わんぱく小僧・太一: 短髪、青着物、元気な表情、竹刀
    this.sprites.npc_taichi = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#2c1e14'; ctx.fillRect(22, 12, 20, 12); // 短髪
      ctx.fillStyle = '#f8d0a8'; ctx.fillRect(20, 20, 24, 14);
      ctx.fillStyle = '#111'; ctx.fillRect(24, 22, 4, 4); ctx.fillRect(36, 22, 4, 4);
      ctx.fillStyle = '#e84040'; ctx.fillRect(30, 28, 4, 3); // 元気な口
      ctx.fillStyle = '#2068b0'; ctx.fillRect(18, 34, 28, 24); // 青着物
      ctx.fillStyle = '#ffd700'; ctx.fillRect(20, 44, 24, 4); // 黄色帯
      // 竹刀
      ctx.fillStyle = '#d4af37'; ctx.fillRect(46, 26, 4, 32);
    }, '#0a0810', 2);

    // 6. 行商人・甚兵衛: 市松模様羽織、大風呂敷、菅笠
    this.sprites.npc_merchant_jinbei = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#c8a460'; ctx.beginPath(); ctx.moveTo(32, 2); ctx.lineTo(8, 14); ctx.lineTo(56, 14); ctx.closePath(); ctx.fill(); // 菅笠
      ctx.fillStyle = '#f8d0a8'; ctx.fillRect(20, 14, 24, 14);
      ctx.fillStyle = '#111'; ctx.fillRect(24, 18, 4, 4); ctx.fillRect(36, 18, 4, 4);
      // 市松模様の羽織
      ctx.fillStyle = '#246848'; ctx.fillRect(16, 28, 32, 28);
      ctx.fillStyle = '#faecd8'; ctx.fillRect(18, 30, 8, 8); ctx.fillRect(34, 30, 8, 8); ctx.fillRect(26, 38, 8, 8);
      // 背中の大風呂敷
      ctx.fillStyle = '#408848'; ctx.fillRect(4, 24, 14, 24);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(8, 28, 6, 6);
    }, '#0a0810', 2);

    // 7. おばあちゃん・よね: 腰曲がり、白髪団子、小豆色ちゃんちゃんこ、杖
    this.sprites.npc_yone = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#b0b0b8'; ctx.fillRect(22, 14, 20, 14); ctx.fillRect(38, 10, 8, 8); // 白髪団子
      ctx.fillStyle = '#eed0b0'; ctx.fillRect(20, 20, 24, 14);
      ctx.fillStyle = '#302010'; ctx.fillRect(24, 24, 4, 3); ctx.fillRect(36, 24, 4, 3); // 優しい目
      ctx.fillStyle = '#7a3040'; ctx.fillRect(16, 34, 32, 24); // 小豆色ちゃんちゃんこ
      ctx.fillStyle = '#4a2830'; ctx.fillRect(18, 42, 28, 16);
      // 杖
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(48, 32, 4, 28);
    }, '#0a0810', 2);

    // 8. 見習い巫女・すず: 白小袖、朱色緋袴、紅リボン、お札
    this.sprites.npc_suzu = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#181420'; ctx.fillRect(20, 6, 24, 18); // 黒髪
      ctx.fillStyle = '#e82020'; ctx.fillRect(16, 8, 32, 6); ctx.fillRect(38, 6, 8, 8); // 紅リボン
      ctx.fillStyle = '#fff0e4'; ctx.fillRect(20, 16, 24, 14);
      ctx.fillStyle = '#22142c'; ctx.fillRect(24, 20, 4, 4); ctx.fillRect(36, 20, 4, 4);
      ctx.fillStyle = '#ff8898'; ctx.fillRect(22, 24, 4, 2); ctx.fillRect(38, 24, 4, 2);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(18, 30, 28, 16); // 白小袖
      ctx.fillStyle = '#d82020'; ctx.fillRect(16, 44, 32, 18); // 緋袴
      // お札
      ctx.fillStyle = '#ffeed0'; ctx.fillRect(46, 34, 8, 12);
      ctx.fillStyle = '#cc0000'; ctx.fillRect(48, 36, 4, 8);
    }, '#0a0810', 2);

    // 9. 密偵・影丸: 紺碧忍装束、忍頭巾、鋭い眼光、背中の短刀
    this.sprites.npc_kagemaru = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#161a28'; ctx.fillRect(18, 6, 28, 26); // 頭巾
      ctx.fillStyle = '#506888'; ctx.fillRect(20, 12, 24, 6); // 額当て
      ctx.fillStyle = '#f8d0a8'; ctx.fillRect(22, 18, 20, 8); // 目元
      ctx.fillStyle = '#00ffff'; ctx.fillRect(24, 19, 4, 4); ctx.fillRect(36, 19, 4, 4); // 鋭い碧眼
      ctx.fillStyle = '#161a28'; ctx.fillRect(20, 24, 24, 8); // 口元マスク
      ctx.fillStyle = '#d82020'; ctx.fillRect(18, 30, 28, 6); // 赤マフラー
      ctx.fillStyle = '#202638'; ctx.fillRect(16, 36, 32, 24); // 忍装束
      // 背中の短刀
      ctx.fillStyle = '#d0d8e8'; ctx.fillRect(10, 16, 6, 34);
      ctx.fillStyle = '#8b0000'; ctx.fillRect(8, 44, 10, 8);
    }, '#0a0810', 2);

    // 10. 琵琶法師・幽玄: 僧衣、背負った黄金琵琶、数珠
    this.sprites.npc_yugen = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#eae4d4'; ctx.beginPath(); ctx.arc(32, 18, 14, 0, Math.PI * 2); ctx.fill(); // 剃髪頭部
      ctx.fillStyle = '#221810'; ctx.fillRect(24, 20, 6, 2); ctx.fillRect(34, 20, 6, 2); // 閉じた目
      ctx.fillStyle = '#484238'; ctx.fillRect(16, 30, 32, 30); // 法衣
      ctx.fillStyle = '#6e3820'; ctx.beginPath(); ctx.arc(32, 36, 8, 0, Math.PI * 2); ctx.stroke(); // 数珠
      // 背負った黄金琵琶
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(12, 38, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(10, 16, 4, 24);
    }, '#0a0810', 2);

    // --- 第二章 (4名) ---
    // 11. 船頭・長兵衛: 浅葱色法被、大菅笠、木製の櫂
    this.sprites.npc_chobei = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#b89448'; ctx.beginPath(); ctx.moveTo(32, 4); ctx.lineTo(6, 16); ctx.lineTo(58, 16); ctx.closePath(); ctx.fill(); // 菅笠
      ctx.fillStyle = '#d88c58'; ctx.fillRect(20, 16, 24, 14); // 日焼け顔
      ctx.fillStyle = '#111'; ctx.fillRect(24, 20, 4, 4); ctx.fillRect(36, 20, 4, 4);
      ctx.fillStyle = '#201008'; ctx.fillRect(26, 26, 12, 4); // 髭
      ctx.fillStyle = '#287898'; ctx.fillRect(16, 30, 32, 28); // 浅葱色法被
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 32, 24, 6); ctx.fillRect(30, 32, 4, 26); // 白襟
      // 木製の櫂
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(48, 12, 6, 48);
      ctx.fillStyle = '#b87020'; ctx.fillRect(44, 48, 14, 14);
    }, '#0a0810', 2);

    // 12. 湊の女将・お志乃: 濃紫の着物、白割烹着、結い髪、お盆
    this.sprites.npc_oshino = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#14121a'; ctx.fillRect(18, 6, 28, 20); ctx.fillRect(38, 2, 10, 10); // 結い髪
      ctx.fillStyle = '#ffd700'; ctx.fillRect(42, 6, 4, 8); // 簪
      ctx.fillStyle = '#fce4ce'; ctx.fillRect(20, 16, 24, 16);
      ctx.fillStyle = '#111'; ctx.fillRect(24, 20, 4, 4); ctx.fillRect(36, 20, 4, 4);
      ctx.fillStyle = '#e82040'; ctx.fillRect(29, 27, 6, 2); // 紅唇
      ctx.fillStyle = '#4a2058'; ctx.fillRect(16, 32, 32, 28); // 紫着物
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 36, 24, 22); // 白割烹着
      // お盆
      ctx.fillStyle = '#8b1c1c'; ctx.fillRect(6, 40, 16, 6);
    }, '#0a0810', 2);

    // 13. 旅の陰陽師・蘆屋: 青鈍色狩衣、黒烏帽子、光る陰陽符
    this.sprites.npc_ashiya = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#181824'; ctx.fillRect(24, 2, 16, 14); // 烏帽子
      ctx.fillStyle = '#f4e8d8'; ctx.fillRect(20, 14, 24, 16);
      ctx.fillStyle = '#204060'; ctx.fillRect(24, 18, 4, 4); ctx.fillRect(36, 18, 4, 4); // 鋭い目
      ctx.fillStyle = '#385070'; ctx.fillRect(16, 28, 32, 32); // 青鈍色狩衣
      ctx.fillStyle = '#1a2838'; ctx.fillRect(20, 40, 24, 6); // 帯
      // 青白く光る陰陽符 (グロー)
      ctx.save();
      ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#e0ffff'; ctx.fillRect(48, 28, 10, 16);
      ctx.fillStyle = '#ff2222'; ctx.fillRect(51, 32, 4, 8);
      ctx.shadowBlur = 0;
      ctx.restore();
    }, '#0a0810', 2);

    // 14. 漁師の勘助: 逞しい日焼け肌、青腹掛け、銛、魚籠
    this.sprites.npc_kansuke = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#2c2018'; ctx.fillRect(20, 10, 24, 12);
      ctx.fillStyle = '#cc7840'; ctx.fillRect(20, 16, 24, 16); // 強い日焼け肌
      ctx.fillStyle = '#111'; ctx.fillRect(24, 20, 4, 4); ctx.fillRect(36, 20, 4, 4);
      ctx.fillStyle = '#cc7840'; ctx.fillRect(14, 30, 36, 14); // 上半身
      ctx.fillStyle = '#1c4870'; ctx.fillRect(18, 40, 28, 20); // 腹掛け
      // 銛
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(48, 8, 4, 52);
      ctx.fillStyle = '#c0d4e8'; ctx.fillRect(44, 4, 12, 8);
      // 魚籠
      ctx.fillStyle = '#b8860b'; ctx.fillRect(6, 42, 14, 16);
    }, '#0a0810', 2);

    // --- 第三章 (3名) ---
    // 15. 陰陽頭・安倍: 豪奢な公家狩衣（紫金）、金扇子、霊力オーラ
    this.sprites.npc_abe = this.createOutlinedTile(s, (ctx) => {
      // 霊力オーラ (グロー)
      ctx.save();
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(255, 230, 100, 0.2)'; ctx.beginPath(); ctx.arc(32, 32, 28, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      ctx.fillStyle = '#14101c'; ctx.fillRect(24, 2, 16, 14); // 立烏帽子
      ctx.fillStyle = '#fcf4ec'; ctx.fillRect(20, 14, 24, 16);
      ctx.fillStyle = '#301848'; ctx.fillRect(24, 18, 4, 4); ctx.fillRect(36, 18, 4, 4);
      // 豪奢な紫金狩衣
      ctx.fillStyle = '#5c1c78'; ctx.fillRect(16, 28, 32, 32);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(18, 30, 28, 4); ctx.fillRect(18, 44, 28, 4);
      // 金扇子
      ctx.fillStyle = '#ffd700'; ctx.fillRect(46, 32, 14, 14);
      ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.arc(53, 39, 3, 0, Math.PI * 2); ctx.fill();
    }, '#0a0810', 2);

    // 16. 藤原の姫君: 絢爛な十二単（朱・桃・萌黄）、長い黒髪垂髪、金檜扇
    this.sprites.npc_hime = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#100c14'; ctx.fillRect(18, 4, 28, 44); ctx.fillRect(12, 14, 8, 36); ctx.fillRect(44, 14, 8, 36); // 黒髪垂髪
      ctx.fillStyle = '#fff6ee'; ctx.fillRect(20, 14, 24, 16);
      ctx.fillStyle = '#2a1828'; ctx.fillRect(24, 18, 4, 3); ctx.fillRect(36, 18, 4, 3);
      ctx.fillStyle = '#e82040'; ctx.fillRect(29, 25, 6, 2); // 紅唇
      // 十二単の重ね
      ctx.fillStyle = '#e83040'; ctx.fillRect(14, 30, 36, 30); // 朱
      ctx.fillStyle = '#ff88a8'; ctx.fillRect(16, 34, 32, 26); // 桃
      ctx.fillStyle = '#78c850'; ctx.fillRect(18, 40, 28, 20); // 萌黄
      ctx.fillStyle = '#ffd700'; ctx.fillRect(22, 46, 20, 14); // 金檜扇
    }, '#0a0810', 2);

    // 17. 帝都衛士頭: 漆黒大鎧、金前立て兜、長槍
    this.sprites.npc_guardsman = this.createOutlinedTile(s, (ctx) => {
      ctx.fillStyle = '#1c1c24'; ctx.fillRect(20, 6, 24, 18); // 兜
      ctx.fillStyle = '#ffd700'; ctx.fillRect(28, 2, 8, 8); // 金の前立て
      ctx.fillStyle = '#f0c8a0'; ctx.fillRect(22, 16, 20, 10);
      ctx.fillStyle = '#111'; ctx.fillRect(24, 18, 4, 4); ctx.fillRect(36, 18, 4, 4);
      // 漆黒大鎧
      ctx.fillStyle = '#282834'; ctx.fillRect(14, 26, 36, 34);
      ctx.fillStyle = '#a82020'; ctx.fillRect(16, 30, 32, 6); ctx.fillRect(16, 42, 32, 6); // 赤威し
      // 長槍
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(48, 2, 4, 58);
      ctx.fillStyle = '#e0e8f8'; ctx.fillRect(46, 0, 8, 12);
    }, '#0a0810', 2);

    // 後方互換性エイリアス
    this.sprites.npc_elder = this.sprites.npc_village_head;
    this.sprites.npc_priest = this.sprites.npc_kannushi;
    this.sprites.npc_smith = this.sprites.npc_smith_genzo;
    this.sprites.npc_boy = this.sprites.npc_taichi;
    this.sprites.npc_merchant = this.sprites.npc_merchant_jinbei;
    this.sprites.npc_grandma = this.sprites.npc_yone;
    this.sprites.npc_miko_apprentice = this.sprites.npc_suzu;
    this.sprites.npc_shadow_scout = this.sprites.npc_kagemaru;
    this.sprites.npc_biwa_monk = this.sprites.npc_yugen;
  }

  // ==========================================
  // 4. 敵魔物スプライト (128x128 超高精細)
  // ==========================================
  generateMonsterSprites() {
    const s = 128;

    // --- 第一章魔物 (高密度ディテールHD-2D) ---
    this.sprites.karakasa = this.createOutlinedTile(s, (ctx) => {
      // から傘小僧: 破れ傘の赤漆、巨大な光る一つ目、舌をペロリと出す大口、一本足下駄
      const g = ctx.createLinearGradient(0, 10, 0, 80);
      g.addColorStop(0, '#d83434'); g.addColorStop(0.6, '#a81c1c'); g.addColorStop(1, '#680808');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(64, 8); ctx.lineTo(12, 76); ctx.lineTo(116, 76); ctx.closePath(); ctx.fill();
      // 傘の骨組・ハイライト
      ctx.fillStyle = '#ff7070';
      ctx.beginPath(); ctx.moveTo(64, 10); ctx.lineTo(36, 76); ctx.lineTo(92, 76); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#400808';
      ctx.fillRect(16, 74, 96, 4);

      // 巨大な一つ目 (瞳孔・光彩)
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(64, 46, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e89020'; ctx.beginPath(); ctx.arc(64, 46, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111111'; ctx.beginPath(); ctx.arc(64, 46, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(66, 42, 4, 4);

      // 舌と一本足下駄
      ctx.fillStyle = '#e83060'; ctx.fillRect(56, 68, 16, 32); ctx.fillRect(52, 94, 24, 8);
      ctx.fillStyle = '#8a5c36'; ctx.fillRect(60, 78, 8, 38); // 柄
      ctx.fillStyle = '#d4af37'; ctx.fillRect(48, 114, 32, 8); // 下駄
      ctx.fillStyle = '#a01818'; ctx.fillRect(60, 110, 8, 6); // 鼻緒
    }, '#0a0810', 3);

    this.sprites.chochin = this.createOutlinedTile(s, (ctx) => {
      // 提灯お化け: 竹骨提灯、ニヤつく大口、頭頂の青い鬼火
      const g = ctx.createLinearGradient(0, 20, 0, 110);
      g.addColorStop(0, '#f08020'); g.addColorStop(0.5, '#c85010'); g.addColorStop(1, '#782804');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(64, 68, 44, 0, Math.PI * 2); ctx.fill();
      // 竹骨の横縞
      ctx.fillStyle = '#401808';
      for (let y = 36; y < 100; y += 12) {
        ctx.fillRect(26, y, 76, 3);
      }

      // 不気味にニヤつく大口と牙
      ctx.fillStyle = '#110d18';
      ctx.beginPath(); ctx.arc(64, 76, 26, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(48, 76, 6, 8); ctx.fillRect(74, 76, 6, 8);
      ctx.fillStyle = '#e83050'; ctx.fillRect(58, 84, 12, 14); // 舌

      // 切れ長の光る双眼
      ctx.fillStyle = '#ffea66'; ctx.fillRect(40, 48, 16, 8); ctx.fillRect(72, 48, 16, 8);
      ctx.fillStyle = '#111'; ctx.fillRect(46, 50, 6, 6); ctx.fillRect(78, 50, 6, 6);

      // 頭頂の青い鬼火 (グロー)
      ctx.save();
      ctx.shadowColor = '#33ccff'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#66e0ff'; ctx.beginPath(); ctx.arc(64, 16, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(64, 16, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }, '#0a0810', 3);

    this.sprites.ittanmomen = this.createOutlinedTile(s, (ctx) => {
      // 一反木綿: 風になびく白反物の陰影、二筋の黒目
      const g = ctx.createLinearGradient(0, 10, 0, 115);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#d0d8e8'); g.addColorStop(1, '#7888a0');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(30, 20); ctx.quadraticCurveTo(90, 10, 100, 40);
      ctx.quadraticCurveTo(60, 60, 90, 85); ctx.quadraticCurveTo(40, 110, 30, 115);
      ctx.quadraticCurveTo(50, 80, 20, 50); ctx.closePath(); ctx.fill();

      // 二筋の黒い目
      ctx.fillStyle = '#111624';
      ctx.fillRect(46, 30, 8, 12); ctx.fillRect(74, 28, 8, 12);
      ctx.fillStyle = '#60a0ff'; ctx.fillRect(48, 32, 4, 4); ctx.fillRect(76, 30, 4, 4);
    }, '#0a0810', 3);

    this.sprites.tanuki = this.createOutlinedTile(s, (ctx) => {
      // 化け狸: 緑の木の葉、太鼓腹、丸い耳、徳利
      const g = ctx.createRadialGradient(64, 68, 10, 64, 68, 44);
      g.addColorStop(0, '#9e6838'); g.addColorStop(0.7, '#6e401c'); g.addColorStop(1, '#3e200a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 68, 42, 0, Math.PI * 2); ctx.fill();
      // 太鼓腹
      ctx.fillStyle = '#faecd8'; ctx.beginPath(); ctx.arc(64, 76, 26, 0, Math.PI * 2); ctx.fill();

      // 丸耳
      ctx.fillStyle = '#4a2810'; ctx.beginPath(); ctx.arc(36, 36, 12, 0, Math.PI * 2); ctx.arc(92, 36, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fce4ce'; ctx.beginPath(); ctx.arc(36, 36, 6, 0, Math.PI * 2); ctx.arc(92, 36, 6, 0, Math.PI * 2); ctx.fill();

      // 黒ぶち目と鼻
      ctx.fillStyle = '#22140a'; ctx.fillRect(40, 50, 16, 12); ctx.fillRect(72, 50, 16, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(44, 52, 8, 8); ctx.fillRect(76, 52, 8, 8);
      ctx.fillStyle = '#111'; ctx.fillRect(48, 54, 4, 4); ctx.fillRect(80, 54, 4, 4);
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(64, 62, 5, 0, Math.PI * 2); ctx.fill();

      // 頭の木の葉
      ctx.fillStyle = '#34a840';
      ctx.beginPath(); ctx.moveTo(64, 20); ctx.lineTo(82, 30); ctx.lineTo(64, 40); ctx.lineTo(46, 30); ctx.closePath(); ctx.fill();
    }, '#0a0810', 3);

    this.sprites.kitsunebi = this.createOutlinedTile(s, (ctx) => {
      // 狐火: 揺らめく蒼炎の球体、中心の白い核、燐光
      ctx.save();
      ctx.shadowColor = '#00c8ff'; ctx.shadowBlur = 18;
      const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 44);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#80e0ff'); g.addColorStop(0.7, '#1080d8'); g.addColorStop(1, 'rgba(0,40,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 64, 44, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
      // 周囲の燐光
      ctx.fillStyle = '#b0f0ff';
      ctx.fillRect(28, 36, 6, 6); ctx.fillRect(96, 42, 8, 8); ctx.fillRect(40, 92, 6, 6); ctx.fillRect(88, 88, 6, 6);
    }, '#0a0810', 3);

    this.sprites.rokurokubi = this.createOutlinedTile(s, (ctx) => {
      // ろくろ首: 長くとぐろを巻く首、豪奢な着物、妖艶な顔
      const g = ctx.createLinearGradient(0, 70, 0, 120);
      g.addColorStop(0, '#d83868'); g.addColorStop(1, '#781834');
      ctx.fillStyle = g; ctx.fillRect(36, 76, 56, 44);
      // 金帯
      ctx.fillStyle = '#ffd700'; ctx.fillRect(40, 88, 48, 10);

      // とぐろを巻く首
      ctx.strokeStyle = '#f8d0b0'; ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(64, 80); ctx.quadraticCurveTo(24, 60, 48, 40);
      ctx.quadraticCurveTo(80, 20, 96, 32); ctx.stroke();

      // 日本髪と妖艶な顔
      ctx.fillStyle = '#14101c'; ctx.fillRect(80, 12, 38, 28);
      ctx.fillStyle = '#fce4ce'; ctx.fillRect(88, 22, 28, 22);
      ctx.fillStyle = '#cc1838'; ctx.fillRect(94, 26, 8, 4); ctx.fillRect(106, 26, 8, 4);
      ctx.fillStyle = '#e82040'; ctx.fillRect(100, 38, 8, 3); // 紅唇
    }, '#0a0810', 3);

    this.sprites.wanyudo = this.createOutlinedTile(s, (ctx) => {
      // 輪入道: 燃え盛る車輪、中央の憤怒男顔
      ctx.save();
      ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#e04810'; ctx.beginPath(); ctx.arc(64, 64, 48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffaa00'; ctx.beginPath(); ctx.arc(64, 64, 42, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 車輪の木枠
      ctx.fillStyle = '#4a2810'; ctx.beginPath(); ctx.arc(64, 64, 36, 0, Math.PI * 2); ctx.fill();
      // 苦悶・憤怒の巨大男顔
      ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.arc(64, 64, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#cc1010'; ctx.fillRect(52, 54, 8, 6); ctx.fillRect(68, 54, 8, 6);
      ctx.fillStyle = '#300808'; ctx.fillRect(54, 68, 20, 8); // 怒りの口
      ctx.fillStyle = '#22140a'; ctx.fillRect(50, 48, 12, 4); ctx.fillRect(66, 48, 12, 4); // 逆八字眉
    }, '#0a0810', 3);

    this.sprites.kappa = this.createOutlinedTile(s, (ctx) => {
      // 河童: 頭頂の水皿、背中の甲羅、嘴、水かき
      const g = ctx.createLinearGradient(0, 30, 0, 115);
      g.addColorStop(0, '#4a9c50'); g.addColorStop(1, '#1e5424');
      ctx.fillStyle = g; ctx.fillRect(36, 40, 56, 68);
      // 甲羅
      ctx.fillStyle = '#16381a'; ctx.fillRect(28, 52, 10, 48); ctx.fillRect(90, 52, 10, 48);

      // 頭部と水皿
      ctx.fillStyle = '#54aa5c'; ctx.fillRect(40, 18, 48, 30);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(46, 12, 36, 8);
      ctx.fillStyle = '#40c8ff'; ctx.fillRect(52, 14, 24, 4); // 皿の水

      // 嘴と紅眼
      ctx.fillStyle = '#ffaa00'; ctx.fillRect(54, 34, 20, 10);
      ctx.fillStyle = '#ff2200'; ctx.fillRect(48, 26, 8, 6); ctx.fillRect(72, 26, 8, 6);
    }, '#0a0810', 3);

    this.sprites.nurikabe = this.createOutlinedTile(s, (ctx) => {
      // ぬりかべ: 苔むした巨石壁、つぶらな目、足
      const g = ctx.createLinearGradient(0, 15, 0, 115);
      g.addColorStop(0, '#8c8894'); g.addColorStop(0.5, '#686470'); g.addColorStop(1, '#3e3a44');
      ctx.fillStyle = g; ctx.fillRect(16, 16, 96, 96);
      // 苔と石のひび割れ
      ctx.fillStyle = '#446840'; ctx.fillRect(20, 20, 24, 12); ctx.fillRect(76, 84, 32, 16);
      ctx.fillStyle = '#222028'; ctx.fillRect(40, 50, 48, 3); ctx.fillRect(60, 53, 3, 20);

      // つぶらな目
      ctx.fillStyle = '#ffffff'; ctx.fillRect(36, 38, 16, 12); ctx.fillRect(76, 38, 16, 12);
      ctx.fillStyle = '#111111'; ctx.fillRect(42, 42, 6, 6); ctx.fillRect(82, 42, 6, 6);

      // 短い手足
      ctx.fillStyle = '#504c58'; ctx.fillRect(28, 112, 20, 10); ctx.fillRect(80, 112, 20, 10);
    }, '#0a0810', 3);

    this.sprites.kamaitachi = this.createOutlinedTile(s, (ctx) => {
      // 鎌鼬: 鋭利な三日月鎌、疾風イタチ、風切羽
      const g = ctx.createLinearGradient(0, 30, 0, 110);
      g.addColorStop(0, '#b88c50'); g.addColorStop(1, '#684820');
      ctx.fillStyle = g; ctx.fillRect(36, 44, 56, 56);

      // 両手の鋭利な三日月鎌 (金属ハイライト)
      ctx.fillStyle = '#d0f0ff';
      ctx.beginPath(); ctx.arc(24, 50, 22, -Math.PI * 0.4, Math.PI * 0.4); ctx.lineTo(24, 50); ctx.fill();
      ctx.beginPath(); ctx.arc(104, 50, 22, Math.PI * 0.6, Math.PI * 1.4); ctx.lineTo(104, 50); ctx.fill();

      // 顔と鋭い眼光
      ctx.fillStyle = '#d8b070'; ctx.fillRect(42, 20, 44, 28);
      ctx.fillStyle = '#ff2200'; ctx.fillRect(50, 28, 8, 6); ctx.fillRect(70, 28, 8, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(52, 29, 3, 3); ctx.fillRect(72, 29, 3, 3);
    }, '#0a0810', 3);

    this.sprites.dorotabo = this.createOutlinedTile(s, (ctx) => {
      // 泥田坊: 泥沼から突き出る巨躯、光る黄色い単眼、三つ指手
      const g = ctx.createRadialGradient(64, 72, 10, 64, 72, 48);
      g.addColorStop(0, '#5a4634'); g.addColorStop(0.7, '#38281a'); g.addColorStop(1, '#1c120a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 72, 46, 0, Math.PI * 2); ctx.fill();

      // 光る黄色い単眼 (グロー)
      ctx.save();
      ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffff33'; ctx.beginPath(); ctx.arc(64, 52, 16, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(64, 52, 7, 0, Math.PI * 2); ctx.fill();

      // 泥の手（三つ指）
      ctx.fillStyle = '#38281a';
      ctx.fillRect(16, 50, 20, 10); ctx.fillRect(12, 44, 8, 18); ctx.fillRect(10, 56, 8, 16);
    }, '#0a0810', 3);

    this.sprites.akaname = this.createOutlinedTile(s, (ctx) => {
      // 垢嘗: ぬめり赤肌、長大に伸びる舌、怪しい三つ目
      ctx.fillStyle = '#b85840'; ctx.fillRect(36, 36, 56, 68);
      ctx.fillStyle = '#7a3020'; ctx.fillRect(40, 60, 48, 36);

      // 三つ目
      ctx.fillStyle = '#ffea66';
      ctx.fillRect(46, 30, 8, 8); ctx.fillRect(74, 30, 8, 8); ctx.fillRect(60, 20, 8, 8);
      ctx.fillStyle = '#111';
      ctx.fillRect(49, 33, 4, 4); ctx.fillRect(77, 33, 4, 4); ctx.fillRect(63, 23, 4, 4);

      // 長大な赤い舌
      ctx.fillStyle = '#ff2050';
      ctx.beginPath(); ctx.moveTo(56, 44); ctx.quadraticCurveTo(80, 80, 64, 118); ctx.lineTo(54, 118); ctx.quadraticCurveTo(70, 80, 48, 44); ctx.closePath(); ctx.fill();
    }, '#0a0810', 3);

    this.sprites.kodama = this.createOutlinedTile(s, (ctx) => {
      // 木霊: 神木の白い精霊、新緑の若葉、木漏れ日
      const g = ctx.createRadialGradient(64, 58, 8, 64, 58, 38);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#e0f0d8'); g.addColorStop(1, '#90c880');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 58, 36, 0, Math.PI * 2); ctx.fill();

      // 黒い三つ穴（目と口）
      ctx.fillStyle = '#182414';
      ctx.beginPath(); ctx.arc(52, 50, 7, 0, Math.PI * 2); ctx.arc(76, 50, 7, 0, Math.PI * 2); ctx.arc(64, 68, 8, 0, Math.PI * 2); ctx.fill();

      // 頭の新緑の若葉
      ctx.fillStyle = '#40c840';
      ctx.beginPath(); ctx.moveTo(64, 22); ctx.lineTo(78, 10); ctx.lineTo(64, 28); ctx.closePath(); ctx.fill();
    }, '#0a0810', 3);

    this.sprites.tsurube = this.createOutlinedTile(s, (ctx) => {
      // 釣瓶落とし: 古井戸の釣瓶桶、中から覗く狂気顔
      ctx.fillStyle = '#5c3a20'; ctx.fillRect(24, 30, 80, 76);
      ctx.fillStyle = '#3a2210'; ctx.fillRect(28, 34, 72, 10); ctx.fillRect(28, 88, 72, 10); // 鉄の箍

      // 桶から覗く生首・狂気顔
      ctx.fillStyle = '#fce4ce'; ctx.beginPath(); ctx.arc(64, 68, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff0033'; ctx.fillRect(52, 60, 8, 6); ctx.fillRect(68, 60, 8, 6);
      ctx.fillStyle = '#600010'; ctx.fillRect(54, 76, 20, 8); // 哄笑の口
      ctx.fillStyle = '#100c14'; ctx.fillRect(40, 44, 48, 16); // 濡れ髪
    }, '#0a0810', 3);

    this.sprites.nue = this.createOutlinedTile(s, (ctx) => {
      // 鵺: 猿頭・虎胴・蛇尾の魔獣、漆黒雷雲
      const g = ctx.createLinearGradient(0, 30, 0, 110);
      g.addColorStop(0, '#5a3020'); g.addColorStop(0.5, '#381c28'); g.addColorStop(1, '#180a1c');
      ctx.fillStyle = g; ctx.fillRect(32, 40, 64, 60);
      // 虎の縞
      ctx.fillStyle = '#ffaa00'; ctx.fillRect(36, 56, 56, 16);
      ctx.fillStyle = '#111'; ctx.fillRect(44, 56, 8, 16); ctx.fillRect(60, 56, 8, 16); ctx.fillRect(76, 56, 8, 16);

      // 猿の頭と牙
      ctx.fillStyle = '#8b4513'; ctx.fillRect(44, 18, 40, 26);
      ctx.fillStyle = '#ff3300'; ctx.fillRect(50, 24, 8, 6); ctx.fillRect(70, 24, 8, 6);

      // 蛇の尾
      ctx.strokeStyle = '#288844'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(88, 90); ctx.quadraticCurveTo(116, 60, 100, 24); ctx.stroke();
    }, '#0a0810', 3);

    this.sprites.nekomata = this.createOutlinedTile(s, (ctx) => {
      // 猫又: 二股の長尾、鬼火、黒毛並み、金眼
      ctx.fillStyle = '#181622'; ctx.fillRect(36, 38, 56, 64);
      // 猫耳
      ctx.fillStyle = '#181622';
      ctx.beginPath(); ctx.moveTo(40, 38); ctx.lineTo(32, 14); ctx.lineTo(52, 28); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(88, 38); ctx.lineTo(96, 14); ctx.lineTo(76, 28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff88a0'; ctx.fillRect(38, 24, 6, 8); ctx.fillRect(84, 24, 6, 8);

      // 金眼と牙
      ctx.fillStyle = '#ffd700'; ctx.fillRect(46, 44, 12, 6); ctx.fillRect(70, 44, 12, 6);
      ctx.fillStyle = '#000'; ctx.fillRect(50, 44, 4, 6); ctx.fillRect(74, 44, 4, 6);

      // 二股尾と蒼炎 (グロー)
      ctx.save();
      ctx.shadowColor = '#00c8ff'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#40d0ff';
      ctx.beginPath(); ctx.arc(20, 80, 8, 0, Math.PI * 2); ctx.arc(108, 80, 8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }, '#0a0810', 3);

    this.sprites.zashiki = this.createOutlinedTile(s, (ctx) => {
      // 座敷童子: 赤振袖着物、おかっぱ黒髪、手まり
      ctx.fillStyle = '#14121c'; ctx.fillRect(38, 12, 52, 34); // おかっぱ
      ctx.fillStyle = '#fce4ce'; ctx.fillRect(44, 24, 40, 24);
      ctx.fillStyle = '#201824'; ctx.fillRect(50, 30, 6, 6); ctx.fillRect(72, 30, 6, 6);
      ctx.fillStyle = '#ff6888'; ctx.fillRect(46, 38, 6, 4); ctx.fillRect(76, 38, 6, 4); // 頬紅

      // 鮮やかな赤振袖
      const g = ctx.createLinearGradient(0, 45, 0, 115);
      g.addColorStop(0, '#e82838'); g.addColorStop(1, '#98101c');
      ctx.fillStyle = g; ctx.fillRect(32, 48, 64, 64);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(36, 68, 56, 10); // 金帯

      // 手まり
      ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(88, 84, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e82040'; ctx.fillRect(80, 82, 16, 4);
    }, '#0a0810', 3);

    this.sprites.mushakage = this.createOutlinedTile(s, (ctx) => {
      // 武者影: 怨念甲冑、鍬形兜、抜き身太刀
      const g = ctx.createLinearGradient(0, 25, 0, 115);
      g.addColorStop(0, '#383c4c'); g.addColorStop(1, '#181a24');
      ctx.fillStyle = g; ctx.fillRect(36, 36, 56, 76);
      // 金鋲
      ctx.fillStyle = '#d4af37'; ctx.fillRect(40, 52, 48, 6); ctx.fillRect(40, 74, 48, 6);

      // 兜と鍬形
      ctx.fillStyle = '#141620'; ctx.fillRect(42, 14, 44, 24);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.moveTo(64, 24); ctx.lineTo(44, 4); ctx.lineTo(54, 18); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(64, 24); ctx.lineTo(84, 4); ctx.lineTo(74, 18); ctx.closePath(); ctx.fill();

      // 兜の奥の紅蓮眼
      ctx.fillStyle = '#ff1122'; ctx.fillRect(48, 26, 8, 4); ctx.fillRect(72, 26, 8, 4);

      // 太刀
      ctx.fillStyle = '#e8ecf4'; ctx.fillRect(96, 14, 6, 96);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(92, 70, 14, 6);
    }, '#0a0810', 3);

    this.sprites.hyakume = this.createOutlinedTile(s, (ctx) => {
      // 百目: 全身に無数の光る目玉
      const g = ctx.createRadialGradient(64, 64, 10, 64, 64, 48);
      g.addColorStop(0, '#d8c890'); g.addColorStop(0.7, '#a09060'); g.addColorStop(1, '#504828');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 64, 46, 0, Math.PI * 2); ctx.fill();

      // 無数の目玉
      const eyes = [[44, 36], [84, 36], [64, 48], [36, 64], [92, 64], [52, 80], [76, 80]];
      eyes.forEach(([ex, ey]) => {
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#cc0022'; ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.fillRect(ex - 1, ey - 1, 2, 2);
      });
    }, '#0a0810', 3);

    this.sprites.gaki = this.createOutlinedTile(s, (ctx) => {
      // 餓鬼: 骨の浮き出た痩身、太鼓腹、飢えた大口
      ctx.fillStyle = '#8a9a68'; ctx.fillRect(44, 20, 40, 32); // 骨ばった顔
      ctx.fillStyle = '#221810'; ctx.fillRect(50, 26, 6, 8); ctx.fillRect(72, 26, 6, 8);
      ctx.fillStyle = '#e82020'; ctx.fillRect(54, 40, 20, 8); // 飢えた口

      // 膨れた太鼓腹
      const g = ctx.createRadialGradient(64, 76, 6, 64, 76, 36);
      g.addColorStop(0, '#b8cc90'); g.addColorStop(1, '#5a6840');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 76, 34, 0, Math.PI * 2); ctx.fill();
    }, '#0a0810', 3);

    // --- 第二章魔物 (高密度ディテールHD-2D) ---
    this.sprites.yukionna_mob = this.createOutlinedTile(s, (ctx) => {
      // 雪女: 白銀の着物、吹雪オーラ、冷たい紅唇と黒髪
      const g = ctx.createLinearGradient(0, 30, 0, 120);
      g.addColorStop(0, '#e8f4fc'); g.addColorStop(0.5, '#cce6f8'); g.addColorStop(1, '#99c2e8');
      ctx.fillStyle = g; ctx.fillRect(36, 48, 56, 68);
      // 着物の陰影・帯
      ctx.fillStyle = '#6898c8'; ctx.fillRect(36, 112, 56, 8);
      ctx.fillStyle = '#4080b0'; ctx.fillRect(44, 72, 40, 16);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(58, 76, 12, 8);
      // 黒髪と顔
      ctx.fillStyle = '#161424'; ctx.fillRect(40, 16, 48, 36); ctx.fillRect(32, 28, 12, 52); ctx.fillRect(84, 28, 12, 52);
      ctx.fillStyle = '#fff5ea'; ctx.fillRect(44, 28, 40, 28);
      // 目・唇・吹雪結晶
      ctx.fillStyle = '#2070a0'; ctx.fillRect(50, 36, 8, 4); ctx.fillRect(70, 36, 8, 4);
      ctx.fillStyle = '#e83050'; ctx.fillRect(62, 48, 6, 4);
      ctx.fillStyle = '#d0f0ff'; ctx.fillRect(20, 20, 8, 8); ctx.fillRect(100, 40, 8, 8); ctx.fillRect(16, 80, 8, 8);
    }, '#0a0810', 3);

    this.sprites.hyouro = this.createOutlinedTile(s, (ctx) => {
      // 氷狼: 蒼氷色の毛並み、尖った耳、鋭い牙と光る眼
      const g = ctx.createLinearGradient(0, 30, 0, 110);
      g.addColorStop(0, '#d8f0ff'); g.addColorStop(0.6, '#8ec8f0'); g.addColorStop(1, '#4888c0');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(20, 70); ctx.lineTo(44, 30); ctx.lineTo(84, 30); ctx.lineTo(108, 50);
      ctx.lineTo(116, 75); ctx.lineTo(96, 110); ctx.lineTo(30, 110); ctx.closePath(); ctx.fill();
      // 耳・毛束
      ctx.fillStyle = '#306898'; ctx.fillRect(36, 16, 14, 22); ctx.fillRect(72, 16, 14, 22);
      ctx.fillStyle = '#a0d8ff'; ctx.fillRect(40, 22, 6, 12); ctx.fillRect(76, 22, 6, 12);
      // 牙・口・光る眼
      ctx.fillStyle = '#183048'; ctx.fillRect(76, 56, 32, 24);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(80, 68, 8, 10); ctx.fillRect(96, 68, 8, 10);
      ctx.fillStyle = '#ff3344'; ctx.fillRect(64, 44, 10, 6); ctx.fillRect(88, 44, 10, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(66, 44, 3, 3); ctx.fillRect(90, 44, 3, 3);
      // 爪と霜
      ctx.fillStyle = '#e0f4ff'; ctx.fillRect(26, 104, 16, 8); ctx.fillRect(86, 104, 16, 8);
    }, '#0a0810', 3);

    this.sprites.yukiwarashi = this.createOutlinedTile(s, (ctx) => {
      // 雪童子: 愛らしい丸頭巾、赤ほっぺ、舞う雪玉
      ctx.fillStyle = '#f0f8ff'; ctx.beginPath(); ctx.arc(64, 60, 38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c8e2f8'; ctx.beginPath(); ctx.arc(64, 60, 38, Math.PI * 0.2, Math.PI * 0.8); ctx.fill();
      // 赤い頭巾縁取りと着物
      ctx.fillStyle = '#e84058'; ctx.fillRect(40, 84, 48, 32);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(56, 88, 16, 10);
      // 顔
      ctx.fillStyle = '#fff0e4'; ctx.beginPath(); ctx.arc(64, 56, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1824'; ctx.fillRect(52, 52, 6, 6); ctx.fillRect(70, 52, 6, 6);
      ctx.fillStyle = '#ff7088'; ctx.fillRect(46, 60, 8, 6); ctx.fillRect(74, 60, 8, 6);
      ctx.fillStyle = '#e84058'; ctx.fillRect(61, 64, 6, 4);
      // 雪の結晶
      ctx.fillStyle = '#ffffff'; ctx.fillRect(18, 30, 10, 10); ctx.fillRect(98, 40, 12, 12); ctx.fillRect(24, 88, 8, 8);
    }, '#0a0810', 3);

    this.sprites.umibozu = this.createOutlinedTile(s, (ctx) => {
      // 海坊主: 漆黒の巨大頭部、怪しく輝く双眸、激しい白波
      const g = ctx.createRadialGradient(64, 56, 10, 64, 56, 54);
      g.addColorStop(0, '#1c2838'); g.addColorStop(0.7, '#0a1420'); g.addColorStop(1, '#02060c');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 56, 52, 0, Math.PI * 2); ctx.fill();
      // 巨大な光る金眼
      ctx.fillStyle = '#ffe033'; ctx.beginPath(); ctx.arc(44, 48, 14, 0, Math.PI * 2); ctx.arc(84, 48, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff6600'; ctx.beginPath(); ctx.arc(44, 48, 7, 0, Math.PI * 2); ctx.arc(84, 48, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(40, 44, 4, 4); ctx.fillRect(80, 44, 4, 4);
      // 逆巻く白波
      ctx.fillStyle = '#3078a8'; ctx.fillRect(16, 96, 96, 24);
      ctx.fillStyle = '#d8f0ff';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.arc(24 + i * 16, 96, 8, Math.PI, 0); ctx.fill();
      }
    }, '#0a0810', 3);

    this.sprites.funayurei = this.createOutlinedTile(s, (ctx) => {
      // 船幽霊: 水干の幽霊、手にした柄杓、蒼白い人魂
      const g = ctx.createLinearGradient(0, 20, 0, 110);
      g.addColorStop(0, '#d0e0ec'); g.addColorStop(0.6, '#88a8c0'); g.addColorStop(1, '#406080');
      ctx.fillStyle = g; ctx.fillRect(40, 44, 48, 64);
      // 幽霊の足元フェード
      ctx.fillStyle = '#204060'; ctx.fillRect(44, 100, 40, 16);
      // 顔と乱れ髪
      ctx.fillStyle = '#10141c'; ctx.fillRect(40, 16, 48, 32);
      ctx.fillStyle = '#e8f0f8'; ctx.fillRect(46, 26, 36, 22);
      ctx.fillStyle = '#080810'; ctx.fillRect(52, 32, 6, 8); ctx.fillRect(68, 32, 6, 8);
      // 柄杓
      ctx.fillStyle = '#b8860b'; ctx.fillRect(84, 48, 28, 6);
      ctx.fillStyle = '#8b5a2b'; ctx.fillRect(106, 42, 14, 16);
      // 蒼い人魂
      ctx.fillStyle = '#40c8ff'; ctx.beginPath(); ctx.arc(24, 40, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(24, 40, 4, 0, Math.PI * 2); ctx.fill();
    }, '#0a0810', 3);

    this.sprites.ushioni = this.createOutlinedTile(s, (ctx) => {
      // 牛鬼: 巨大な牛の頭、猛毒の蜘蛛脚、鋭い角
      ctx.fillStyle = '#3a1e12'; ctx.fillRect(36, 36, 56, 52);
      // 蜘蛛脚
      ctx.strokeStyle = '#24120a'; ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(36, 50); ctx.lineTo(12, 30); ctx.lineTo(8, 70);
      ctx.moveTo(36, 70); ctx.lineTo(10, 80); ctx.lineTo(16, 116);
      ctx.moveTo(92, 50); ctx.lineTo(116, 30); ctx.lineTo(120, 70);
      ctx.moveTo(92, 70); ctx.lineTo(118, 80); ctx.lineTo(112, 116);
      ctx.stroke();
      // 牛の角
      ctx.fillStyle = '#e0d8b0';
      ctx.beginPath(); ctx.moveTo(40, 36); ctx.lineTo(24, 12); ctx.lineTo(48, 26); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(88, 36); ctx.lineTo(104, 12); ctx.lineTo(80, 26); ctx.closePath(); ctx.fill();
      // 獰猛な目と鼻輪
      ctx.fillStyle = '#ff2200'; ctx.fillRect(48, 48, 10, 8); ctx.fillRect(70, 48, 10, 8);
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(64, 76, 8, 0, Math.PI * 2); ctx.stroke();
    }, '#0a0810', 3);

    this.sprites.suiko = this.createOutlinedTile(s, (ctx) => {
      // 水虎: 紺碧の河童上位種、鋭い甲羅の棘、金色の大皿
      ctx.fillStyle = '#1b4d6e'; ctx.fillRect(36, 44, 56, 60);
      // 背中の甲羅と棘
      ctx.fillStyle = '#0f2d42'; ctx.fillRect(28, 52, 12, 44); ctx.fillRect(88, 52, 12, 44);
      ctx.fillStyle = '#ffaa00'; ctx.fillRect(24, 60, 6, 8); ctx.fillRect(98, 60, 6, 8);
      // 頭部と黄金の皿
      ctx.fillStyle = '#266c99'; ctx.fillRect(40, 20, 48, 30);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(44, 14, 40, 8); ctx.fillStyle = '#40c8ff'; ctx.fillRect(52, 16, 24, 4);
      // 顔・嘴
      ctx.fillStyle = '#ffcc00'; ctx.fillRect(54, 38, 20, 10);
      ctx.fillStyle = '#ff2020'; ctx.fillRect(48, 28, 8, 6); ctx.fillRect(72, 28, 8, 6);
    }, '#0a0810', 3);

    this.sprites.nureonna = this.createOutlinedTile(s, (ctx) => {
      // 濡女子: 長い黒髪、妖艶な女性の顔、大蛇の胴体
      const g = ctx.createLinearGradient(0, 50, 0, 120);
      g.addColorStop(0, '#284858'); g.addColorStop(0.5, '#183040'); g.addColorStop(1, '#0c1a24');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(64, 88, 36, 0, Math.PI * 2); ctx.fill();
      // 蛇の鱗模様
      ctx.fillStyle = '#407080';
      for (let y = 64; y < 110; y += 12) {
        ctx.fillRect(44 + (y % 8), y, 36, 4);
      }
      // 人間の上半身と長い濡れ髪
      ctx.fillStyle = '#101018'; ctx.fillRect(36, 16, 56, 52);
      ctx.fillStyle = '#ffe8d8'; ctx.fillRect(44, 24, 40, 28);
      ctx.fillStyle = '#a01830'; ctx.fillRect(50, 32, 6, 4); ctx.fillRect(72, 32, 6, 4);
      ctx.fillStyle = '#cc2040'; ctx.fillRect(60, 44, 8, 4);
    }, '#0a0810', 3);

    this.sprites.isoonna = this.createOutlinedTile(s, (ctx) => {
      // 磯女: 海藻の髪、血染めの着物、狂気の目
      ctx.fillStyle = '#26382b'; ctx.fillRect(36, 44, 56, 68);
      ctx.fillStyle = '#8b1c2b'; ctx.fillRect(40, 56, 48, 20); // 血染めの帯
      // 髪と顔
      ctx.fillStyle = '#16241a'; ctx.fillRect(32, 16, 64, 44);
      ctx.fillStyle = '#d8e8dc'; ctx.fillRect(42, 26, 44, 26);
      ctx.fillStyle = '#ff0033'; ctx.fillRect(48, 32, 8, 6); ctx.fillRect(72, 32, 8, 6);
      ctx.fillStyle = '#8b0000'; ctx.fillRect(58, 42, 12, 6);
      // 海藻の房
      ctx.fillStyle = '#406848'; ctx.fillRect(28, 36, 8, 48); ctx.fillRect(92, 36, 8, 48);
    }, '#0a0810', 3);

    this.sprites.yamauba = this.createOutlinedTile(s, (ctx) => {
      // 山姥: 乱れ白髪、裂けた大口、凶暴な包丁
      ctx.fillStyle = '#6e3828'; ctx.fillRect(36, 48, 56, 64);
      ctx.fillStyle = '#dcdcdc'; ctx.fillRect(30, 16, 68, 40); // 乱れ白髪
      ctx.fillStyle = '#e8c8b8'; ctx.fillRect(44, 28, 40, 26);
      ctx.fillStyle = '#201010'; ctx.fillRect(48, 32, 6, 6); ctx.fillRect(74, 32, 6, 6);
      ctx.fillStyle = '#8b0000'; ctx.fillRect(52, 44, 24, 8); // 裂けた口
      // 巨大包丁
      ctx.fillStyle = '#c0c8d0'; ctx.fillRect(88, 40, 28, 48);
      ctx.fillStyle = '#402010'; ctx.fillRect(98, 88, 8, 24);
    }, '#0a0810', 3);

    this.sprites.aobozu = this.createOutlinedTile(s, (ctx) => {
      // 青坊主: 紺青の法衣、光る巨大単眼、錫杖
      const g = ctx.createLinearGradient(0, 30, 0, 115);
      g.addColorStop(0, '#2d4d8a'); g.addColorStop(1, '#15254a');
      ctx.fillStyle = g; ctx.fillRect(36, 36, 56, 76);
      // 頭部
      ctx.fillStyle = '#3a62ad'; ctx.beginPath(); ctx.arc(64, 36, 28, 0, Math.PI * 2); ctx.fill();
      // 巨大な一つ目
      ctx.fillStyle = '#fff466'; ctx.beginPath(); ctx.arc(64, 34, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#cc0022'; ctx.beginPath(); ctx.arc(64, 34, 6, 0, Math.PI * 2); ctx.fill();
      // 錫杖
      ctx.fillStyle = '#ffd700'; ctx.fillRect(94, 16, 12, 12); ctx.fillRect(98, 28, 4, 84);
    }, '#0a0810', 3);

    this.sprites.yasha = this.createOutlinedTile(s, (ctx) => {
      // 夜叉: 紫紺の筋肉、双角、三叉戟
      ctx.fillStyle = '#4a2656'; ctx.fillRect(36, 44, 56, 68);
      ctx.fillStyle = '#7a3b8c'; ctx.fillRect(42, 20, 44, 30);
      // 角
      ctx.fillStyle = '#d4af37'; ctx.fillRect(44, 8, 8, 16); ctx.fillRect(76, 8, 8, 16);
      // 怒りの形相
      ctx.fillStyle = '#ffeed0'; ctx.fillRect(48, 30, 8, 6); ctx.fillRect(72, 30, 8, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(54, 42, 20, 6);
      // 三叉の槍
      ctx.fillStyle = '#c0c0c0'; ctx.fillRect(16, 12, 16, 20); ctx.fillRect(22, 30, 4, 84);
    }, '#0a0810', 3);

    this.sprites.ichimoku = this.createOutlinedTile(s, (ctx) => {
      // 一目連: 暴風雨を呼ぶ神竜の単眼、青嵐の渦
      const g = ctx.createRadialGradient(64, 64, 12, 64, 64, 48);
      g.addColorStop(0, '#5080a0'); g.addColorStop(0.6, '#284860'); g.addColorStop(1, '#102030');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 64, 46, 0, Math.PI * 2); ctx.fill();
      // 巨大竜眼
      ctx.fillStyle = '#ffe600'; ctx.beginPath(); ctx.arc(64, 60, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000000'; ctx.fillRect(61, 44, 6, 32); // 縦長瞳孔
      // 竜の角と髭
      ctx.fillStyle = '#d4af37'; ctx.fillRect(36, 16, 12, 20); ctx.fillRect(80, 16, 12, 20);
      ctx.strokeStyle = '#88c8f0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(64, 64, 54, 0, Math.PI * 1.4); ctx.stroke();
    }, '#0a0810', 3);

    this.sprites.kagebozu = this.createOutlinedTile(s, (ctx) => {
      // 影坊主: 虚空の影法師、揺らめく紫炎の瞳
      const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 46);
      g.addColorStop(0, '#241434'); g.addColorStop(0.7, '#12081c'); g.addColorStop(1, '#000000');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(64, 64, 44, 0, Math.PI * 2); ctx.fill();
      // 紫の怪火瞳
      ctx.fillStyle = '#b844ff'; ctx.fillRect(46, 54, 12, 10); ctx.fillRect(70, 54, 12, 10);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(50, 56, 4, 4); ctx.fillRect(74, 56, 4, 4);
      // 影の触手
      ctx.fillStyle = '#180a24'; ctx.fillRect(24, 96, 80, 18);
    }, '#0a0810', 3);

    this.sprites.mizuchi_mob = this.createOutlinedTile(s, (ctx) => {
      // 水蛇精: 碧緑の蛇龍、鋭い牙と金色の大鱗
      const g = ctx.createLinearGradient(0, 20, 0, 115);
      g.addColorStop(0, '#30a090'); g.addColorStop(0.5, '#1c6860'); g.addColorStop(1, '#0e3834');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(64, 16); ctx.lineTo(92, 48); ctx.lineTo(76, 112); ctx.lineTo(52, 112); ctx.lineTo(36, 48); ctx.closePath(); ctx.fill();
      // 金の鱗
      ctx.fillStyle = '#ffd700'; ctx.fillRect(56, 50, 16, 6); ctx.fillRect(52, 70, 24, 6); ctx.fillRect(56, 90, 16, 6);
      // 蛇頭と双眸・二叉舌
      ctx.fillStyle = '#ff2200'; ctx.fillRect(46, 34, 8, 6); ctx.fillRect(74, 34, 8, 6);
      ctx.fillStyle = '#e83050'; ctx.fillRect(62, 10, 4, 10); ctx.fillRect(60, 6, 8, 4);
    }, '#0a0810', 3);

    // --- 第三章魔物 (高密度ディテールHD-2D) ---
    this.sprites.gashadokuro = this.createOutlinedTile(s, (ctx) => {
      // がしゃどくろ: 巨大頭蓋骨、精緻な眼窩・鼻腔・歯列、肋骨
      ctx.fillStyle = '#e8e8f0'; ctx.fillRect(36, 16, 56, 50);
      ctx.fillStyle = '#c0c0cc'; ctx.fillRect(40, 60, 48, 12);
      // 眼窩と鼻腔
      ctx.fillStyle = '#110d18'; ctx.fillRect(44, 28, 14, 18); ctx.fillRect(70, 28, 14, 18);
      ctx.fillStyle = '#ff2020'; ctx.fillRect(48, 34, 6, 6); ctx.fillRect(74, 34, 6, 6); // 赤い燐光
      ctx.fillStyle = '#110d18'; ctx.fillRect(60, 48, 8, 10);
      // 歯列
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(44 + i * 8, 60, 6, 8);
      }
      // 巨大な胸郭・肋骨
      ctx.fillStyle = '#d0d0d8';
      for (let y = 76; y < 115; y += 10) {
        ctx.fillRect(28, y, 72, 6);
      }
    }, '#0a0810', 3);

    this.sprites.tsuchigumo = this.createOutlinedTile(s, (ctx) => {
      // 土蜘蛛: 凶暴な大蜘蛛、紅い八眼、毒毛の腹部
      ctx.fillStyle = '#5a2210'; ctx.beginPath(); ctx.arc(64, 76, 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2c1008'; ctx.beginPath(); ctx.arc(64, 46, 18, 0, Math.PI * 2); ctx.fill();
      // 8本の太い節足
      ctx.strokeStyle = '#7c2810'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(50, 46); ctx.lineTo(16, 24); ctx.lineTo(8, 64);
      ctx.moveTo(50, 56); ctx.lineTo(12, 70); ctx.lineTo(16, 112);
      ctx.moveTo(78, 46); ctx.lineTo(112, 24); ctx.lineTo(120, 64);
      ctx.moveTo(78, 56); ctx.lineTo(116, 70); ctx.lineTo(112, 112);
      ctx.stroke();
      // 紅い複眼と毒牙
      ctx.fillStyle = '#ff0022';
      ctx.fillRect(56, 40, 4, 4); ctx.fillRect(68, 40, 4, 4);
      ctx.fillRect(52, 46, 4, 4); ctx.fillRect(72, 46, 4, 4);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(58, 56, 4, 8); ctx.fillRect(66, 56, 4, 8);
    }, '#0a0810', 3);

    this.sprites.kyokotsu = this.createOutlinedTile(s, (ctx) => {
      // 狂骨: 井戸から湧き出す怨念の骸骨鬼、白煙の尾
      const g = ctx.createLinearGradient(0, 10, 0, 115);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#90a8b8'); g.addColorStop(1, '#284050');
      ctx.fillStyle = g; ctx.fillRect(44, 20, 40, 92);
      // 狂気の髑髏頭部
      ctx.fillStyle = '#e8f0f8'; ctx.fillRect(46, 20, 36, 32);
      ctx.fillStyle = '#081018'; ctx.fillRect(50, 28, 8, 12); ctx.fillRect(70, 28, 8, 12);
      ctx.fillStyle = '#40c8ff'; ctx.fillRect(52, 32, 4, 4); ctx.fillRect(72, 32, 4, 4);
      // 乱れ髪
      ctx.fillStyle = '#102030'; ctx.fillRect(40, 14, 48, 14); ctx.fillRect(36, 24, 10, 48); ctx.fillRect(82, 24, 10, 48);
    }, '#0a0810', 3);

    this.sprites.onmoraki = this.createOutlinedTile(s, (ctx) => {
      // 陰摩羅鬼: 漆黒の怪鳥、吐き出す青炎、死者の顔
      ctx.fillStyle = '#201828'; ctx.fillRect(36, 40, 56, 56);
      // 大翼
      ctx.fillStyle = '#120c1a';
      ctx.beginPath(); ctx.moveTo(36, 44); ctx.lineTo(8, 20); ctx.lineTo(16, 80); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(92, 44); ctx.lineTo(120, 20); ctx.lineTo(112, 80); ctx.closePath(); ctx.fill();
      // 死者の顔と嘴
      ctx.fillStyle = '#e8dcd0'; ctx.fillRect(48, 24, 32, 24);
      ctx.fillStyle = '#ffaa00'; ctx.fillRect(56, 40, 16, 12);
      ctx.fillStyle = '#111111'; ctx.fillRect(52, 28, 6, 6); ctx.fillRect(70, 28, 6, 6);
      // 青炎
      ctx.fillStyle = '#30a8ff'; ctx.beginPath(); ctx.arc(64, 60, 12, 0, Math.PI * 2); ctx.fill();
    }, '#0a0810', 3);

    this.sprites.gozuki = this.createOutlinedTile(s, (ctx) => {
      // 牛頭: 剛勇の牛頭獄卒、黄金の大角、獄炎の金棒
      ctx.fillStyle = '#5c2c1a'; ctx.fillRect(36, 44, 56, 68);
      ctx.fillStyle = '#843e24'; ctx.fillRect(42, 22, 44, 32);
      // 黄金の双角
      ctx.fillStyle = '#d4af37';
      ctx.beginPath(); ctx.moveTo(42, 24); ctx.lineTo(20, 4); ctx.lineTo(44, 14); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(86, 24); ctx.lineTo(108, 4); ctx.lineTo(84, 14); ctx.closePath(); ctx.fill();
      // 怒れる牛眼・鼻輪
      ctx.fillStyle = '#ff1100'; ctx.fillRect(48, 30, 8, 6); ctx.fillRect(72, 30, 8, 6);
      ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(64, 48, 6, 0, Math.PI * 2); ctx.stroke();
      // 鉄の金棒
      ctx.fillStyle = '#222226'; ctx.fillRect(94, 24, 16, 88);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(92, 36, 20, 6); ctx.fillRect(92, 56, 20, 6);
    }, '#0a0810', 3);

    this.sprites.mezuki = this.createOutlinedTile(s, (ctx) => {
      // 馬頭: 白銀の馬頭獄卒、紅蓮の眼、処刑の大鋸
      ctx.fillStyle = '#e8ecf0'; ctx.fillRect(36, 44, 56, 68);
      ctx.fillStyle = '#f8fafc'; ctx.fillRect(44, 18, 40, 36);
      // 鬣と耳
      ctx.fillStyle = '#8898a8'; ctx.fillRect(48, 10, 10, 14); ctx.fillRect(70, 10, 10, 14);
      ctx.fillStyle = '#304050'; ctx.fillRect(40, 16, 8, 40);
      // 紅眼と轡
      ctx.fillStyle = '#ff0033'; ctx.fillRect(52, 28, 8, 6); ctx.fillRect(68, 28, 8, 6);
      ctx.fillStyle = '#d4af37'; ctx.fillRect(54, 46, 20, 4);
      // 大鋸刀
      ctx.fillStyle = '#a8b0b8'; ctx.fillRect(16, 20, 18, 92);
      ctx.fillStyle = '#d03030';
      for (let y = 28; y < 100; y += 12) { ctx.fillRect(12, y, 6, 6); }
    }, '#0a0810', 3);

    this.sprites.oboroguruma = this.createOutlinedTile(s, (ctx) => {
      // 朧車: 車輪の中央に苦悶の巨大怨霊顔、炎の車軸
      ctx.fillStyle = '#5c4834'; ctx.beginPath(); ctx.arc(64, 64, 48, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#38281a'; ctx.beginPath(); ctx.arc(64, 64, 44, 0, Math.PI * 2); ctx.fill();
      // 車輪のスポーク
      ctx.fillStyle = '#8a6e50';
      for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI) / 4;
        ctx.fillRect(64 + Math.cos(rad) * 36 - 2, 64 + Math.sin(rad) * 36 - 2, 6, 6);
      }
      // 苦悶の巨大な顔
      ctx.fillStyle = '#f0d8c0'; ctx.beginPath(); ctx.arc(64, 64, 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#100a14'; ctx.fillRect(50, 54, 10, 10); ctx.fillRect(68, 54, 10, 10);
      ctx.fillStyle = '#ff0000'; ctx.fillRect(52, 56, 4, 4); ctx.fillRect(70, 56, 4, 4);
      ctx.fillStyle = '#600810'; ctx.fillRect(56, 74, 16, 10); // 嘆きの口
    }, '#0a0810', 3);

    this.sprites.hyakki_soldier = this.createOutlinedTile(s, (ctx) => {
      // 百鬼兵: 漆黒の鎧武者、鍬形兜、抜き身の妖刀
      ctx.fillStyle = '#8b1c1c'; ctx.fillRect(36, 44, 56, 68); // 赤備え甲冑
      ctx.fillStyle = '#d4af37'; ctx.fillRect(40, 56, 48, 8); ctx.fillRect(40, 76, 48, 8);
      // 兜と鍬形
      ctx.fillStyle = '#1c1624'; ctx.fillRect(42, 20, 44, 26);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(58, 8, 12, 16); ctx.fillRect(48, 12, 8, 8); ctx.fillRect(72, 12, 8, 8);
      // 面頬の赤い目
      ctx.fillStyle = '#ff2020'; ctx.fillRect(50, 32, 8, 4); ctx.fillRect(70, 32, 8, 4);
      // 妖刀
      ctx.fillStyle = '#e8f0ff'; ctx.fillRect(96, 16, 6, 88);
      ctx.fillStyle = '#d4af37'; ctx.fillRect(92, 80, 14, 6);
    }, '#0a0810', 3);

    this.sprites.jashinkyo = this.createOutlinedTile(s, (ctx) => {
      // 邪神鏡: 黄金の魔鏡、紫に光る邪神の巨大眼球
      ctx.fillStyle = '#d4af37'; ctx.beginPath(); ctx.arc(64, 64, 50, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1b0f2b'; ctx.beginPath(); ctx.arc(64, 64, 42, 0, Math.PI * 2); ctx.fill();
      // 邪神の瞳
      ctx.fillStyle = '#b833ff'; ctx.beginPath(); ctx.arc(64, 64, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffea00'; ctx.beginPath(); ctx.arc(64, 64, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000000'; ctx.fillRect(62, 50, 4, 28);
      // 鏡の装飾鋲
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI) / 4;
        ctx.fillRect(64 + Math.cos(rad) * 46 - 2, 64 + Math.sin(rad) * 46 - 2, 4, 4);
      }
    }, '#0a0810', 3);

    this.sprites.yashahime = this.createOutlinedTile(s, (ctx) => {
      // 夜叉姫: 絢爛な打掛、黄金の簪、般若の面
      const g = ctx.createLinearGradient(0, 40, 0, 115);
      g.addColorStop(0, '#c41e3a'); g.addColorStop(0.6, '#8b1228'); g.addColorStop(1, '#4a0814');
      ctx.fillStyle = g; ctx.fillRect(36, 44, 56, 68);
      // 金糸の刺繍
      ctx.fillStyle = '#ffd700'; ctx.fillRect(44, 60, 40, 6); ctx.fillRect(40, 80, 48, 6);
      // 髪と黄金の簪
      ctx.fillStyle = '#140c1a'; ctx.fillRect(36, 16, 56, 36);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(30, 20, 12, 4); ctx.fillRect(86, 20, 12, 4);
      // 白き夜叉面
      ctx.fillStyle = '#f8f4ea'; ctx.fillRect(44, 26, 40, 26);
      ctx.fillStyle = '#ff0033'; ctx.fillRect(48, 32, 8, 4); ctx.fillRect(72, 32, 8, 4);
      ctx.fillStyle = '#220008'; ctx.fillRect(54, 42, 20, 4);
    }, '#0a0810', 3);

    this.sprites.yomishikome = this.createOutlinedTile(s, (ctx) => {
      // 黄泉醜女: 冥府の鬼女、紫黒の肌、裂けた爪
      ctx.fillStyle = '#3a2048'; ctx.fillRect(36, 44, 56, 68);
      ctx.fillStyle = '#603874'; ctx.fillRect(42, 20, 44, 30);
      ctx.fillStyle = '#100814'; ctx.fillRect(32, 14, 64, 40);
      ctx.fillStyle = '#ff1133'; ctx.fillRect(48, 30, 8, 6); ctx.fillRect(72, 30, 8, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(54, 42, 20, 6);
      // 鋭い毒爪
      ctx.fillStyle = '#a020f0'; ctx.fillRect(24, 64, 14, 28); ctx.fillRect(90, 64, 14, 28);
    }, '#0a0810', 3);

    this.sprites.ibaraki_soldier = this.createOutlinedTile(s, (ctx) => {
      // 茨木親衛隊: 茨の棘鎧、赤銅の角、大金棒
      ctx.fillStyle = '#4a1e58'; ctx.fillRect(36, 44, 56, 68);
      ctx.fillStyle = '#8b2838'; ctx.fillRect(42, 22, 44, 28);
      // 角と棘
      ctx.fillStyle = '#ffcc00'; ctx.fillRect(46, 10, 8, 14); ctx.fillRect(74, 10, 8, 14);
      ctx.fillStyle = '#38a838'; ctx.fillRect(30, 50, 8, 40); ctx.fillRect(90, 50, 8, 40);
      // 金棒
      ctx.fillStyle = '#201824'; ctx.fillRect(98, 20, 16, 92);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(96, 36, 20, 6); ctx.fillRect(96, 60, 20, 6);
    }, '#0a0810', 3);

    this.sprites.nue_mutant = this.createOutlinedTile(s, (ctx) => {
      // 鵺変異体: 猿顔・虎胴・蛇尾の魔獣
      ctx.fillStyle = '#4a2818'; ctx.fillRect(36, 44, 56, 60);
      ctx.fillStyle = '#ffaa00'; ctx.fillRect(40, 56, 48, 20); // 虎の縞
      ctx.fillStyle = '#111111'; ctx.fillRect(48, 58, 8, 16); ctx.fillRect(64, 58, 8, 16); ctx.fillRect(80, 58, 8, 16);
      // 猿の頭部
      ctx.fillStyle = '#8b4513'; ctx.fillRect(44, 20, 40, 28);
      ctx.fillStyle = '#ff4400'; ctx.fillRect(50, 28, 8, 6); ctx.fillRect(70, 28, 8, 6);
      // 蛇の尾
      ctx.strokeStyle = '#208040'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(90, 90); ctx.quadraticCurveTo(116, 60, 104, 30); ctx.stroke();
    }, '#0a0810', 3);

    this.sprites.tokoyo_guard = this.createOutlinedTile(s, (ctx) => {
      // 常夜の衛兵: 冥府の虚無甲冑、紫電の槍
      const g = ctx.createLinearGradient(0, 20, 0, 115);
      g.addColorStop(0, '#281438'); g.addColorStop(0.6, '#140a20'); g.addColorStop(1, '#06020c');
      ctx.fillStyle = g; ctx.fillRect(36, 40, 56, 72);
      // 兜の深淵
      ctx.fillStyle = '#4a2868'; ctx.fillRect(42, 16, 44, 28);
      ctx.fillStyle = '#a030ff'; ctx.fillRect(48, 28, 32, 6); // 紫光のスリット
      // 紫電の長槍
      ctx.fillStyle = '#c080ff'; ctx.fillRect(96, 10, 6, 102);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(92, 10, 14, 18);
    }, '#0a0810', 3);

    this.sprites.tamamo_fox = this.createOutlinedTile(s, (ctx) => {
      // 玉藻妖狐: 黄金の三尾妖狐、紅蓮の狐火
      ctx.fillStyle = '#f8ecd0'; ctx.fillRect(40, 44, 48, 60);
      // 三本の妖狐尾
      ctx.fillStyle = '#e89020';
      ctx.beginPath(); ctx.moveTo(40, 90); ctx.lineTo(12, 60); ctx.lineTo(24, 110); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(88, 90); ctx.lineTo(116, 60); ctx.lineTo(104, 110); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(64, 90); ctx.lineTo(64, 122); ctx.lineTo(76, 100); ctx.closePath(); ctx.fill();
      // 狐耳と顔
      ctx.fillStyle = '#e89020'; ctx.fillRect(40, 16, 14, 18); ctx.fillRect(74, 16, 14, 18);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(44, 22, 6, 10); ctx.fillRect(78, 22, 6, 10);
      ctx.fillStyle = '#fff4e4'; ctx.fillRect(44, 26, 40, 24);
      ctx.fillStyle = '#cc0022'; ctx.fillRect(48, 32, 8, 4); ctx.fillRect(72, 32, 8, 4);
    }, '#0a0810', 3);
  }

  // ==========================================
  // 5. ボスキャラ (192x192 巨大神話級)
  // ==========================================
  generateBossSprites() {
    const s = 192;

    // --- 第一章ボス ---
    this.sprites.akaoni = this.createOutlinedTile(s, (ctx) => {
      // 赤鬼・羅刹 (192x192 巨大獄炎の巨軀)
      const g = ctx.createLinearGradient(0, 30, 0, 170);
      g.addColorStop(0, '#e83030'); g.addColorStop(0.6, '#b01818'); g.addColorStop(1, '#680c0c');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(40, 60); ctx.lineTo(152, 60); ctx.lineTo(160, 160); ctx.lineTo(32, 160); ctx.closePath(); ctx.fill();

      // 筋骨・胸筋の陰影
      ctx.fillStyle = '#800808';
      ctx.fillRect(52, 90, 40, 24); ctx.fillRect(100, 90, 40, 24);
      ctx.fillRect(60, 118, 72, 36);
      ctx.fillStyle = '#ff6060';
      ctx.fillRect(56, 84, 32, 6); ctx.fillRect(104, 84, 32, 6); // 鎖骨ハイライト

      // 虎皮の腰巻
      ctx.fillStyle = '#d4a020'; ctx.fillRect(36, 150, 120, 26);
      ctx.fillStyle = '#111';
      for (let i = 0; i < 7; i++) {
        ctx.fillRect(44 + i * 16, 154, 8, 18);
      }

      // 頭部・逆立つ剛毛
      ctx.fillStyle = '#1c1620';
      ctx.fillRect(52, 16, 88, 52); ctx.fillRect(44, 28, 104, 36);
      ctx.fillStyle = '#3c3044'; ctx.fillRect(60, 18, 72, 12);
      ctx.fillStyle = '#e83030'; ctx.fillRect(56, 36, 80, 44);

      // 黄金の巨大双角
      ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.moveTo(60, 36); ctx.lineTo(36, 4); ctx.lineTo(72, 24); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(132, 36); ctx.lineTo(156, 4); ctx.lineTo(120, 24); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff4a0'; ctx.fillRect(44, 10, 8, 14); ctx.fillRect(140, 10, 8, 14);

      // 獰猛な眼光 (グロー)
      ctx.save();
      ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffff33'; ctx.fillRect(68, 46, 16, 10); ctx.fillRect(108, 46, 16, 10);
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.fillStyle = '#cc0000'; ctx.fillRect(74, 48, 6, 6); ctx.fillRect(114, 48, 6, 6);

      // 牙と大口
      ctx.fillStyle = '#300000'; ctx.fillRect(72, 62, 48, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(76, 58, 8, 12); ctx.fillRect(108, 58, 8, 12); // 上向きの牙
      ctx.fillRect(88, 66, 6, 6); ctx.fillRect(98, 66, 6, 6);

      // 鉄の巨大金棒
      ctx.fillStyle = '#222228'; ctx.fillRect(152, 20, 24, 156);
      ctx.fillStyle = '#444450'; ctx.fillRect(154, 20, 6, 156);
      ctx.fillStyle = '#ffd700';
      for (let y = 30; y < 150; y += 24) {
        ctx.fillRect(146, y, 8, 8); ctx.fillRect(174, y, 8, 8);
      }
    }, '#0a0810', 4);

    this.sprites.tengu = this.createOutlinedTile(s, (ctx) => {
      // 大天狗・疾風坊 (漆黒の大翼・深緑山伏・暴風羽団扇)
      // 漆黒の巨大烏羽翼
      ctx.fillStyle = '#14141e';
      ctx.beginPath(); ctx.moveTo(96, 70); ctx.lineTo(8, 20); ctx.lineTo(24, 160); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(96, 70); ctx.lineTo(184, 20); ctx.lineTo(168, 160); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2c2c3e';
      ctx.fillRect(20, 40, 36, 12); ctx.fillRect(136, 40, 36, 12);
      ctx.fillRect(32, 70, 32, 10); ctx.fillRect(128, 70, 32, 10);

      // 深緑の山伏法衣
      const g = ctx.createLinearGradient(0, 50, 0, 160);
      g.addColorStop(0, '#387848'); g.addColorStop(1, '#1b4024');
      ctx.fillStyle = g; ctx.fillRect(56, 64, 80, 96);
      // 白結袈裟
      ctx.fillStyle = '#ffffff'; ctx.fillRect(72, 64, 12, 96); ctx.fillRect(108, 64, 12, 96);
      ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.arc(78, 80, 8, 0, Math.PI * 2); ctx.arc(114, 80, 8, 0, Math.PI * 2); ctx.fill();

      // 頭巾と朱塗りの天狗面
      ctx.fillStyle = '#181820'; ctx.fillRect(68, 16, 56, 24); // 頭巾
      ctx.fillStyle = '#c82020'; ctx.fillRect(64, 34, 64, 46);
      ctx.fillStyle = '#e84040'; ctx.fillRect(68, 38, 56, 14);

      // 突き出た長鼻
      ctx.fillStyle = '#e83030'; ctx.fillRect(90, 48, 12, 28);
      ctx.fillStyle = '#ff6666'; ctx.fillRect(92, 50, 8, 24);

      // 鋭い金眼 (グロー)
      ctx.save();
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffff40'; ctx.fillRect(72, 44, 12, 8); ctx.fillRect(108, 44, 12, 8);
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.fillStyle = '#000'; ctx.fillRect(76, 46, 4, 4); ctx.fillRect(112, 46, 4, 4);

      // 白髭
      ctx.fillStyle = '#e8e8f0';
      ctx.beginPath(); ctx.moveTo(68, 72); ctx.lineTo(96, 96); ctx.lineTo(124, 72); ctx.closePath(); ctx.fill();

      // 金色の羽団扇
      ctx.fillStyle = '#d4af37';
      ctx.beginPath(); ctx.arc(148, 110, 24, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a5c36'; ctx.fillRect(144, 130, 8, 40);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(132 + i * 8, 96, 6, 20);
      }
    }, '#0a0810', 4);

    this.sprites.youko = this.createOutlinedTile(s, (ctx) => {
      // 九尾の妖狐・茜 (9本の黄金妖狐尾・妖艶な紅化粧・九曜狐火)
      // 9本の巨大な妖狐尾 (扇状展開)
      for (let i = 0; i < 9; i++) {
        const angle = -Math.PI * 0.85 + (i * Math.PI * 0.8) / 8;
        const tx = 96 + Math.cos(angle) * 76; const ty = 108 + Math.sin(angle) * 64;
        const tg = ctx.createRadialGradient(tx, ty, 6, tx, ty, 28);
        tg.addColorStop(0, '#fff2a0'); tg.addColorStop(0.6, '#e09020'); tg.addColorStop(1, '#a04808');
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.arc(tx, ty, 26, 0, Math.PI * 2); ctx.fill();
      }

      // 白銀と黄金の神衣
      const bg = ctx.createLinearGradient(0, 60, 0, 165);
      bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.6, '#f4e8d0'); bg.addColorStop(1, '#d8aa40');
      ctx.fillStyle = bg; ctx.fillRect(56, 68, 80, 96);
      // 朱色の帯と神紋
      ctx.fillStyle = '#c82030'; ctx.fillRect(60, 100, 72, 16);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(88, 102, 16, 12);

      // 狐耳と艶やかな黒髪
      ctx.fillStyle = '#161220'; ctx.fillRect(52, 24, 88, 48);
      ctx.fillStyle = '#e09020'; // 黄金の狐耳
      ctx.beginPath(); ctx.moveTo(56, 32); ctx.lineTo(40, 4); ctx.lineTo(76, 20); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(136, 32); ctx.lineTo(152, 4); ctx.lineTo(116, 20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(48, 10, 10, 14); ctx.fillRect(134, 10, 10, 14);

      // 妖艶な顔・肌
      ctx.fillStyle = '#fff6ee'; ctx.fillRect(56, 36, 80, 40);
      // 額の紅玉印
      ctx.fillStyle = '#d81830';
      ctx.beginPath(); ctx.arc(96, 42, 6, 0, Math.PI * 2); ctx.fill();

      // 切れ長の金眼と紅化粧
      ctx.fillStyle = '#c81838'; ctx.fillRect(64, 48, 20, 10); ctx.fillRect(108, 48, 20, 10);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(68, 50, 12, 6); ctx.fillRect(112, 50, 12, 6);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(72, 51, 4, 3); ctx.fillRect(116, 51, 4, 3);
      ctx.fillStyle = '#d02040'; ctx.fillRect(90, 66, 12, 5); // 艶やかな紅唇

      // 青白く浮遊する狐火 (グロー)
      ctx.save();
      ctx.shadowColor = '#33ccff'; ctx.shadowBlur = 18;
      ctx.fillStyle = '#66e0ff';
      ctx.beginPath(); ctx.arc(28, 40, 12, 0, Math.PI * 2); ctx.arc(164, 40, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(28, 40, 5, 0, Math.PI * 2); ctx.arc(164, 40, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }, '#0a0810', 4);

    // --- 第二章ボス ---
    this.sprites.boss_hyoka = this.createOutlinedTile(s, (ctx) => {
      // 雪女・氷華 (六花氷晶輪・白藍の十二単・冷徹な紅唇)
      // 六花氷晶の神輪
      ctx.save();
      ctx.shadowColor = '#80d8ff'; ctx.shadowBlur = 16;
      ctx.strokeStyle = '#d8f4ff'; ctx.lineWidth = 6;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.beginPath(); ctx.moveTo(96, 96); ctx.lineTo(96 + Math.cos(a) * 88, 96 + Math.sin(a) * 88); ctx.stroke();
        ctx.fillStyle = '#66c8ff';
        ctx.beginPath(); ctx.arc(96 + Math.cos(a) * 88, 96 + Math.sin(a) * 88, 8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      // 白藍の豪奢な十二単
      const jg = ctx.createLinearGradient(0, 50, 0, 175);
      jg.addColorStop(0, '#f0f8ff'); jg.addColorStop(0.5, '#b0d8f8'); jg.addColorStop(1, '#4a80b8');
      ctx.fillStyle = jg; ctx.fillRect(48, 64, 96, 104);
      // 着物の重ね・銀帯
      ctx.fillStyle = '#70a8d8'; ctx.fillRect(52, 96, 88, 14);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(56, 120, 80, 8);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(88, 98, 16, 10);

      // 黒髪と氷柱の簪
      ctx.fillStyle = '#101420'; ctx.fillRect(50, 16, 92, 54);
      ctx.fillStyle = '#283850'; ctx.fillRect(60, 18, 72, 12);
      ctx.fillStyle = '#c0f0ff'; // 氷柱の簪
      ctx.fillRect(42, 24, 18, 6); ctx.fillRect(132, 24, 18, 6);
      ctx.fillRect(46, 20, 6, 24); ctx.fillRect(140, 20, 6, 24);

      // 蒼白い美貌と紅唇
      ctx.fillStyle = '#f4f8fc'; ctx.fillRect(56, 34, 80, 36);
      ctx.fillStyle = '#1b4070'; ctx.fillRect(66, 44, 16, 6); ctx.fillRect(110, 44, 16, 6);
      ctx.fillStyle = '#40c0ff'; ctx.fillRect(70, 45, 8, 5); ctx.fillRect(114, 45, 8, 5);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(72, 45, 3, 3); ctx.fillRect(116, 45, 3, 3);
      ctx.fillStyle = '#e81840'; ctx.fillRect(90, 58, 12, 4); // 鮮烈な紅唇
    }, '#0a0810', 4);

    this.sprites.boss_mizuchi = this.createOutlinedTile(s, (ctx) => {
      // 水神・蛟龍 (荒れ狂う水龍の巨軀・黄金の双角・大牙)
      // 逆巻く大津波オーラ
      const wg = ctx.createRadialGradient(96, 96, 20, 96, 96, 88);
      wg.addColorStop(0, '#2080d0'); wg.addColorStop(0.7, '#0a3870'); wg.addColorStop(1, '#021838');
      ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(96, 96, 84, 0, Math.PI * 2); ctx.fill();

      // 水龍の大蛇胴体（鱗グラデーション）
      const dg = ctx.createLinearGradient(0, 40, 0, 160);
      dg.addColorStop(0, '#30c0e0'); dg.addColorStop(0.5, '#1878b0'); dg.addColorStop(1, '#0c3c68');
      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.moveTo(40, 160); ctx.quadraticCurveTo(96, 30, 152, 160); ctx.lineTo(128, 160);
      ctx.quadraticCurveTo(96, 60, 64, 160); ctx.closePath(); ctx.fill();

      // 黄金の鱗
      ctx.fillStyle = '#ffd700';
      for (let y = 70; y < 140; y += 18) {
        ctx.fillRect(80, y, 12, 6); ctx.fillRect(100, y + 8, 12, 6);
      }

      // 龍頭と大顎
      ctx.fillStyle = '#1878b0'; ctx.fillRect(52, 36, 88, 56);
      // 黄金の長大な双角
      ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.moveTo(60, 36); ctx.lineTo(24, 6); ctx.lineTo(76, 26); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(132, 36); ctx.lineTo(168, 6); ctx.lineTo(116, 26); ctx.closePath(); ctx.fill();

      // 怒りの光る碧眼 (グロー)
      ctx.save();
      ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#40ffff'; ctx.fillRect(66, 48, 16, 10); ctx.fillRect(110, 48, 16, 10);
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.fillStyle = '#003366'; ctx.fillRect(72, 50, 6, 6); ctx.fillRect(116, 50, 6, 6);

      // 鋭利な大牙
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(64, 82, 10, 16); ctx.fillRect(118, 82, 10, 16);
      ctx.fillRect(80, 84, 8, 10); ctx.fillRect(104, 84, 8, 10);
    }, '#0a0810', 4);

    this.sprites.boss_shuten = this.createOutlinedTile(s, (ctx) => {
      // 妖魔将・酒呑童子 (豪快な赤胴・大念珠・酒瓢箪・名刀鬼切丸)
      const g = ctx.createLinearGradient(0, 40, 0, 170);
      g.addColorStop(0, '#c82818'); g.addColorStop(0.6, '#96180c'); g.addColorStop(1, '#5a0a04');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(36, 60); ctx.lineTo(156, 60); ctx.lineTo(150, 165); ctx.lineTo(42, 165); ctx.closePath(); ctx.fill();

      // 首に巻いた大念珠
      ctx.fillStyle = '#4a2810';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath(); ctx.arc(54 + i * 14, 76, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8a5020'; ctx.beginPath(); ctx.arc(54 + i * 14, 74, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4a2810';
      }

      // 荒ぶる赤髪と黄金角
      ctx.fillStyle = '#800808'; ctx.fillRect(50, 12, 92, 48); ctx.fillRect(40, 24, 112, 36);
      ctx.fillStyle = '#d4af37';
      ctx.beginPath(); ctx.moveTo(60, 26); ctx.lineTo(32, 4); ctx.lineTo(74, 18); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(132, 26); ctx.lineTo(160, 4); ctx.lineTo(118, 18); ctx.closePath(); ctx.fill();

      // 豪胆な面構え・金眼・髭
      ctx.fillStyle = '#c82818'; ctx.fillRect(56, 30, 80, 42);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(68, 40, 14, 8); ctx.fillRect(110, 40, 14, 8);
      ctx.fillStyle = '#000'; ctx.fillRect(74, 42, 4, 4); ctx.fillRect(116, 42, 4, 4);
      ctx.fillStyle = '#300808'; ctx.fillRect(60, 62, 72, 16); // 髭
      ctx.fillStyle = '#ffffff'; ctx.fillRect(72, 54, 8, 8); ctx.fillRect(112, 54, 8, 8); // 牙

      // 腰の巨大酒瓢箪
      ctx.fillStyle = '#b87020'; ctx.beginPath(); ctx.arc(36, 128, 22, 0, Math.PI * 2); ctx.arc(36, 104, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d41828'; ctx.fillRect(28, 112, 16, 6); // 瓢箪の紐

      // 剛刀・鬼切丸
      ctx.fillStyle = '#e8ecf4'; ctx.fillRect(156, 16, 12, 156);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(150, 120, 24, 12); // 金鍔
      ctx.fillStyle = '#8b0000'; ctx.fillRect(154, 132, 16, 36); // 柄
    }, '#0a0810', 4);

    // --- 第三章ボス ---
    this.sprites.boss_ibaraki = this.createOutlinedTile(s, (ctx) => {
      // 鬼将・茨木童子 (暗黒の巨大鬼腕・紫電茨甲冑・狂気の紅眼)
      const g = ctx.createLinearGradient(0, 30, 0, 170);
      g.addColorStop(0, '#4a1860'); g.addColorStop(0.6, '#280c38'); g.addColorStop(1, '#100418');
      ctx.fillStyle = g; ctx.fillRect(48, 56, 96, 110);

      // 茨の棘甲冑
      ctx.fillStyle = '#682088'; ctx.fillRect(54, 76, 84, 18); ctx.fillRect(54, 110, 84, 18);
      ctx.fillStyle = '#38a838';
      for (let y = 68; y < 140; y += 18) {
        ctx.fillRect(44, y, 10, 6); ctx.fillRect(138, y, 10, 6);
      }

      // 暗黒の巨大鬼腕 (左腕特大化)
      const ag = ctx.createLinearGradient(0, 40, 0, 160);
      ag.addColorStop(0, '#1a0826'); ag.addColorStop(1, '#06000c');
      ctx.fillStyle = ag;
      ctx.fillRect(8, 60, 40, 100);
      // 鋭い毒爪
      ctx.fillStyle = '#b820f0';
      ctx.fillRect(4, 148, 10, 24); ctx.fillRect(18, 152, 10, 24); ctx.fillRect(32, 150, 10, 24);

      // 白髪と血塗られた角
      ctx.fillStyle = '#dcdce8'; ctx.fillRect(54, 14, 84, 46);
      ctx.fillStyle = '#ffaa00'; ctx.fillRect(58, 4, 12, 22); ctx.fillRect(122, 4, 12, 22);
      ctx.fillStyle = '#cc0022'; ctx.fillRect(58, 4, 12, 8); // 血塗れの角先

      // 狂気の紅蓮眼 (グロー)
      ctx.fillStyle = '#4a1860'; ctx.fillRect(58, 30, 76, 36);
      ctx.save();
      ctx.shadowColor = '#ff0033'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#ff1838'; ctx.fillRect(68, 40, 16, 8); ctx.fillRect(108, 40, 16, 8);
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(72, 41, 4, 4); ctx.fillRect(112, 41, 4, 4);
    }, '#0a0810', 4);

    this.sprites.boss_musokage = this.createOutlinedTile(s, (ctx) => {
      // 亡霊剣聖・無想影 (幽冥の鎧武者・神剣草薙の剣・風塵残影)
      // 風神無想流の残影オーラ
      ctx.save();
      ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 16;
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.4)'; ctx.lineWidth = 4;
      ctx.strokeRect(32, 32, 128, 140);
      ctx.shadowBlur = 0;
      ctx.restore();

      // 幽冥の甲冑 (白銀と深紺)
      const g = ctx.createLinearGradient(0, 40, 0, 170);
      g.addColorStop(0, '#2c3c50'); g.addColorStop(0.5, '#182434'); g.addColorStop(1, '#0c1420');
      ctx.fillStyle = g; ctx.fillRect(48, 56, 96, 110);
      ctx.fillStyle = '#c0d4e8'; ctx.fillRect(56, 76, 80, 14); ctx.fillRect(56, 108, 80, 14);

      // 鍬形兜と面頬
      ctx.fillStyle = '#141c28'; ctx.fillRect(56, 16, 80, 44);
      ctx.fillStyle = '#ffd700'; // 黄金の鍬形
      ctx.beginPath(); ctx.moveTo(96, 32); ctx.lineTo(60, 4); ctx.lineTo(76, 24); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(96, 32); ctx.lineTo(132, 4); ctx.lineTo(116, 24); ctx.closePath(); ctx.fill();

      // 虚無の面頬と光る蒼き眼光
      ctx.fillStyle = '#080c14'; ctx.fillRect(66, 36, 60, 28);
      ctx.save();
      ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#00ffff'; ctx.fillRect(72, 44, 12, 6); ctx.fillRect(108, 44, 12, 6);
      ctx.shadowBlur = 0;
      ctx.restore();

      // 神剣・草薙の剣 (両手構え・金光グロー)
      ctx.save();
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(150, 8, 12, 168);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(144, 120, 24, 14); ctx.fillRect(148, 134, 16, 36);
      ctx.shadowBlur = 0;
      ctx.restore();
    }, '#0a0810', 4);

    this.sprites.boss_shin_youko = this.createOutlinedTile(s, (ctx) => {
      // 真・九尾の天狐・茜 (九曜霊火・神白黄金神衣・神威九尾)
      // 9色に輝く九曜霊火 (グロー付き)
      const fireColors = ['#ff2200', '#ff8800', '#ffea00', '#33ff33', '#00ffff', '#0077ff', '#cc00ff', '#ffffff', '#ffd700'];
      for (let i = 0; i < 9; i++) {
        const a = (i * Math.PI * 2) / 9;
        const ox = 96 + Math.cos(a) * 84; const oy = 96 + Math.sin(a) * 84;
        ctx.save();
        ctx.shadowColor = fireColors[i]; ctx.shadowBlur = 16;
        ctx.fillStyle = fireColors[i];
        ctx.beginPath(); ctx.arc(ox, oy, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(ox, oy, 5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // 神聖なる黄金九尾
      for (let i = 0; i < 9; i++) {
        const angle = -Math.PI * 0.85 + (i * Math.PI * 0.8) / 8;
        const tx = 96 + Math.cos(angle) * 68; const ty = 106 + Math.sin(angle) * 58;
        const tg = ctx.createRadialGradient(tx, ty, 6, tx, ty, 26);
        tg.addColorStop(0, '#ffffff'); tg.addColorStop(0.5, '#ffe066'); tg.addColorStop(1, '#e09810');
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.arc(tx, ty, 24, 0, Math.PI * 2); ctx.fill();
      }

      // 純白と黄金の神衣
      const kg = ctx.createLinearGradient(0, 50, 0, 170);
      kg.addColorStop(0, '#ffffff'); kg.addColorStop(0.6, '#fef6e0'); kg.addColorStop(1, '#ffd700');
      ctx.fillStyle = kg; ctx.fillRect(52, 64, 88, 104);
      // 金糸勾玉の刺繍
      ctx.fillStyle = '#ffd700'; ctx.fillRect(58, 92, 76, 12); ctx.fillRect(58, 120, 76, 12);

      // 神々しい白銀の髪と狐耳
      ctx.fillStyle = '#ffffff'; ctx.fillRect(50, 20, 92, 50);
      ctx.fillStyle = '#ffd700'; // 黄金狐耳
      ctx.beginPath(); ctx.moveTo(56, 28); ctx.lineTo(36, 2); ctx.lineTo(76, 16); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(136, 28); ctx.lineTo(156, 2); ctx.lineTo(116, 16); ctx.closePath(); ctx.fill();

      // 天狐の神聖な面・紅化粧・黄金双眸
      ctx.fillStyle = '#fff9f0'; ctx.fillRect(56, 32, 80, 42);
      // 額の黄金天狐印
      ctx.save();
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath(); ctx.arc(96, 38, 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      // 神威の金眼 (グロー)
      ctx.fillStyle = '#d81838'; ctx.fillRect(64, 46, 20, 10); ctx.fillRect(108, 46, 20, 10);
      ctx.save();
      ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffff55'; ctx.fillRect(68, 48, 12, 6); ctx.fillRect(112, 48, 12, 6);
      ctx.shadowBlur = 0;
      ctx.restore();
      ctx.fillStyle = '#d01838'; ctx.fillRect(90, 64, 12, 4); // 紅唇
    }, '#0a0810', 4);
  }

  // ==========================================
  // 6. ポートレート (会話立ち絵バストアップ描き下ろし)
  // ==========================================
  generatePortraits() {
    const s = 128;
    const sBoss = 192;

    // --- 主人公3名 (128x128) ---
    // 侍「疾風」ポートレート
    this.portraits.samurai = this.createTile(s, (ctx) => {
      ctx.fillStyle = '#181420'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#382848'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
      ctx.fillStyle = '#100e14'; ctx.fillRect(28, 6, 72, 38); ctx.fillRect(20, 22, 88, 44); ctx.fillRect(84, 0, 26, 24);
      ctx.fillStyle = '#2c263c'; ctx.fillRect(36, 8, 56, 10); ctx.fillRect(24, 26, 12, 32);
      ctx.fillStyle = '#7a8c9e'; ctx.fillRect(24, 28, 80, 10);
      ctx.fillStyle = '#c0d4e8'; ctx.fillRect(32, 30, 64, 4);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(58, 24, 12, 12);
      ctx.fillStyle = '#f8d0a8'; ctx.fillRect(32, 38, 64, 58);
      ctx.fillStyle = '#e4b088'; ctx.fillRect(32, 84, 64, 12);
      ctx.fillStyle = '#111'; ctx.fillRect(40, 48, 18, 4); ctx.fillRect(70, 48, 18, 4);
      ctx.fillStyle = '#1b1424'; ctx.fillRect(44, 54, 12, 10); ctx.fillRect(72, 54, 12, 10);
      ctx.fillStyle = '#fff'; ctx.fillRect(46, 55, 4, 4); ctx.fillRect(74, 55, 4, 4);
      ctx.fillStyle = '#d49870'; ctx.fillRect(62, 66, 4, 10);
      ctx.fillStyle = '#a05840'; ctx.fillRect(56, 80, 16, 3);
      ctx.fillStyle = '#1c4c88'; ctx.fillRect(12, 96, 104, 32);
      ctx.fillStyle = '#3878cc'; ctx.fillRect(16, 98, 96, 10);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(52, 96, 24, 32);
      ctx.fillStyle = '#d4af37'; ctx.fillRect(48, 118, 32, 10);
    });

    // 巫女「小夜」ポートレート
    this.portraits.miko = this.createTile(s, (ctx) => {
      ctx.fillStyle = '#181420'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#5a1824'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
      ctx.fillStyle = '#14121c'; ctx.fillRect(24, 6, 80, 40); ctx.fillRect(18, 20, 92, 60);
      ctx.fillStyle = '#2c263c'; ctx.fillRect(32, 8, 64, 10); ctx.fillRect(20, 26, 14, 48); ctx.fillRect(94, 26, 14, 48);
      ctx.fillStyle = '#e44444'; ctx.fillRect(52, 2, 24, 8); ctx.fillRect(48, 6, 8, 16); ctx.fillRect(72, 6, 8, 16);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(58, 4, 12, 4);
      ctx.fillStyle = '#fce4ce'; ctx.fillRect(34, 36, 60, 58);
      ctx.fillStyle = '#f2c8b4'; ctx.fillRect(34, 82, 60, 12);
      ctx.fillStyle = '#2a1a38'; ctx.fillRect(42, 48, 14, 3); ctx.fillRect(72, 48, 14, 3);
      ctx.fillStyle = '#1e1428'; ctx.fillRect(44, 54, 12, 10); ctx.fillRect(72, 54, 12, 10);
      ctx.fillStyle = '#fff'; ctx.fillRect(46, 55, 4, 4); ctx.fillRect(74, 55, 4, 4);
      ctx.fillStyle = '#7a4498'; ctx.fillRect(48, 60, 6, 3); ctx.fillRect(76, 60, 6, 3);
      ctx.fillStyle = '#f8b4c0'; ctx.fillRect(38, 66, 10, 4); ctx.fillRect(80, 66, 10, 4);
      ctx.fillStyle = '#e85868'; ctx.fillRect(58, 78, 12, 4);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(16, 96, 96, 32);
      ctx.fillStyle = '#d8dce8'; ctx.fillRect(16, 112, 96, 16);
      ctx.fillStyle = '#cc2424'; ctx.fillRect(50, 96, 28, 32);
    });

    // 忍び「朧」ポートレート
    this.portraits.ninja = this.createTile(s, (ctx) => {
      ctx.fillStyle = '#14121a'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#283848'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
      ctx.fillStyle = '#161420'; ctx.fillRect(24, 8, 80, 48); ctx.fillRect(16, 24, 96, 64);
      ctx.fillStyle = '#282436'; ctx.fillRect(32, 10, 64, 12);
      ctx.fillStyle = '#647488'; ctx.fillRect(28, 26, 72, 12);
      ctx.fillStyle = '#b8ccdc'; ctx.fillRect(36, 28, 56, 4);
      ctx.fillStyle = '#14141c'; ctx.fillRect(60, 28, 8, 8);
      ctx.fillStyle = '#f8d0a8'; ctx.fillRect(32, 40, 64, 22);
      ctx.fillStyle = '#111'; ctx.fillRect(40, 46, 16, 3); ctx.fillRect(72, 46, 16, 3);
      ctx.fillStyle = '#0a0810'; ctx.fillRect(42, 50, 14, 8); ctx.fillRect(72, 50, 14, 8);
      ctx.fillStyle = '#00ffff'; ctx.fillRect(44, 52, 6, 4); ctx.fillRect(74, 52, 6, 4);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(45, 52, 2, 2); ctx.fillRect(75, 52, 2, 2);
      ctx.fillStyle = '#1a1826'; ctx.fillRect(30, 62, 68, 34);
      ctx.fillStyle = '#2c283c'; ctx.fillRect(34, 64, 60, 10);
      ctx.fillStyle = '#d82424'; ctx.fillRect(12, 96, 104, 32);
      ctx.fillStyle = '#a01818'; ctx.fillRect(16, 110, 96, 18);
      ctx.fillStyle = '#ff5555'; ctx.fillRect(20, 98, 88, 6);
    });

    // --- ボス9体専用描き下ろしバストアップポートレート (192x192) ---
    // 1. 赤鬼・羅刹 (獰猛に咆哮する真紅の鬼面)
    this.portraits.akaoni = this.createTile(sBoss, (ctx) => {
      ctx.fillStyle = '#180808'; ctx.fillRect(0, 0, sBoss, sBoss);
      ctx.strokeStyle = '#b01818'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, sBoss - 4, sBoss - 4);
      // 金剛双角
      ctx.fillStyle = '#141418'; ctx.fillRect(32, 8, 28, 44); ctx.fillRect(132, 8, 28, 44);
      ctx.fillStyle = '#d4af37'; ctx.fillRect(36, 12, 20, 16); ctx.fillRect(136, 12, 20, 16);
      ctx.fillStyle = '#f8e080'; ctx.fillRect(40, 8, 12, 8); ctx.fillRect(140, 8, 12, 8);
      // 逆立つ剛毛
      ctx.fillStyle = '#100c14'; ctx.fillRect(24, 28, 144, 40); ctx.fillRect(16, 44, 160, 36);
      ctx.fillStyle = '#282030'; ctx.fillRect(36, 32, 120, 12);
      // 真紅の鬼貌
      ctx.fillStyle = '#b82020'; ctx.fillRect(36, 56, 120, 92);
      ctx.fillStyle = '#e03838'; ctx.fillRect(44, 60, 104, 24); // 額ハイライト
      ctx.fillStyle = '#801010'; ctx.fillRect(36, 128, 120, 20); // 顎シャドウ
      // 額の血管・眉
      ctx.fillStyle = '#4a0808'; ctx.fillRect(44, 76, 44, 8); ctx.fillRect(104, 76, 44, 8);
      ctx.fillRect(88, 64, 16, 20);
      // 邪眼 (黄金＆血走る瞳)
      ctx.fillStyle = '#ffcc00'; ctx.fillRect(48, 88, 32, 20); ctx.fillRect(112, 88, 32, 20);
      ctx.fillStyle = '#800000'; ctx.fillRect(58, 92, 12, 12); ctx.fillRect(122, 92, 12, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(60, 94, 6, 6); ctx.fillRect(124, 94, 6, 6);
      // 鼻筋・獅子鼻
      ctx.fillStyle = '#700c0c'; ctx.fillRect(86, 96, 20, 24); ctx.fillRect(80, 112, 32, 8);
      // 裂けた大口・鋭利な八重牙
      ctx.fillStyle = '#1a0404'; ctx.fillRect(52, 124, 88, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(56, 124, 12, 16); ctx.fillRect(124, 124, 12, 16); // 上牙
      ctx.fillRect(68, 132, 10, 12); ctx.fillRect(114, 132, 10, 12); // 下牙
      ctx.fillStyle = '#cc2040'; ctx.fillRect(80, 132, 32, 8); // 舌
      // 首元の荒縄＆筋肉
      ctx.fillStyle = '#8b2020'; ctx.fillRect(20, 148, 152, 40);
      ctx.fillStyle = '#c49040'; ctx.fillRect(28, 164, 136, 12);
      ctx.fillStyle = '#6b4010'; ctx.fillRect(40, 160, 16, 20); ctx.fillRect(136, 160, 16, 20);
    });

    // 2. 大天狗・疾風坊 (鋭い眼光の高貴な山の神)
    this.portraits.tengu = this.createTile(sBoss, (ctx) => {
      ctx.fillStyle = '#0c1810'; ctx.fillRect(0, 0, sBoss, sBoss);
      ctx.strokeStyle = '#2e5c38'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, sBoss - 4, sBoss - 4);
      // 頭襟 (ときん)
      ctx.fillStyle = '#4a1860'; ctx.fillRect(80, 12, 32, 24);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(92, 8, 8, 8); ctx.fillRect(84, 32, 24, 4);
      // 漆黒の羽毛・白髪
      ctx.fillStyle = '#101418'; ctx.fillRect(24, 32, 144, 48); ctx.fillRect(16, 60, 40, 80); ctx.fillRect(136, 60, 40, 80);
      ctx.fillStyle = '#d8dce8'; ctx.fillRect(36, 40, 120, 16); ctx.fillRect(24, 80, 24, 60); ctx.fillRect(144, 80, 24, 60);
      // 緋色の天狗貌
      ctx.fillStyle = '#c43428'; ctx.fillRect(44, 52, 104, 96);
      ctx.fillStyle = '#e85848'; ctx.fillRect(52, 56, 88, 20);
      // 長い大鼻
      ctx.fillStyle = '#a02418'; ctx.fillRect(84, 80, 24, 48);
      ctx.fillStyle = '#e85848'; ctx.fillRect(88, 80, 16, 40);
      ctx.fillStyle = '#70140c'; ctx.fillRect(80, 120, 32, 12);
      // 鋭い金色の一対の瞳・白眉
      ctx.fillStyle = '#ffffff'; ctx.fillRect(48, 64, 36, 12); ctx.fillRect(108, 64, 36, 12); // 逆立ち眉
      ctx.fillStyle = '#ffd700'; ctx.fillRect(52, 80, 28, 16); ctx.fillRect(112, 80, 28, 16);
      ctx.fillStyle = '#111111'; ctx.fillRect(60, 82, 10, 12); ctx.fillRect(122, 82, 10, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(62, 84, 4, 4); ctx.fillRect(124, 84, 4, 4);
      // 口髭・白髭
      ctx.fillStyle = '#e8eef8'; ctx.fillRect(60, 132, 72, 28); ctx.fillRect(72, 156, 48, 20);
      // 修験装束 (緑羽織と結袈裟の梵天)
      ctx.fillStyle = '#1c4a28'; ctx.fillRect(20, 156, 152, 32);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(44, 164, 16, 16); ctx.fillRect(132, 164, 16, 16);
      ctx.fillStyle = '#d82424'; ctx.fillRect(76, 168, 40, 20);
    });

    // 3. 九尾の妖狐・茜 (妖艶かつ冷酷な笑みの白銀霊狐)
    this.portraits.youko = this.createTile(sBoss, (ctx) => {
      ctx.fillStyle = '#1c1018'; ctx.fillRect(0, 0, sBoss, sBoss);
      ctx.strokeStyle = '#d48818'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, sBoss - 4, sBoss - 4);
      // 白銀の尖り狐耳
      ctx.fillStyle = '#f0f4f8'; ctx.fillRect(28, 8, 36, 56); ctx.fillRect(128, 8, 36, 56);
      ctx.fillStyle = '#d02050'; ctx.fillRect(36, 16, 20, 40); ctx.fillRect(136, 16, 20, 40);
      // 豊かな白銀の髪
      ctx.fillStyle = '#e8ecf4'; ctx.fillRect(20, 40, 152, 60); ctx.fillRect(12, 70, 36, 90); ctx.fillRect(144, 70, 36, 90);
      ctx.fillStyle = '#c4cce0'; ctx.fillRect(28, 44, 136, 12);
      // 妖艶な素肌
      ctx.fillStyle = '#fff0f4'; ctx.fillRect(44, 56, 104, 88);
      ctx.fillStyle = '#f8d4e0'; ctx.fillRect(44, 120, 104, 24);
      // 額の紅き妖狐霊紋
      ctx.fillStyle = '#d81848'; ctx.fillRect(88, 52, 16, 28); ctx.fillRect(76, 60, 40, 8);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(92, 60, 8, 8);
      // 切れ長の妖艶な紫紅瞳
      ctx.fillStyle = '#3a0820'; ctx.fillRect(48, 80, 36, 6); ctx.fillRect(108, 80, 36, 6);
      ctx.fillStyle = '#c01860'; ctx.fillRect(52, 86, 28, 16); ctx.fillRect(112, 86, 28, 16);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(60, 88, 12, 12); ctx.fillRect(120, 88, 12, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(62, 90, 4, 4); ctx.fillRect(122, 90, 4, 4);
      // 微笑む紅唇
      ctx.fillStyle = '#d81848'; ctx.fillRect(84, 124, 24, 8); ctx.fillRect(80, 122, 8, 4); ctx.fillRect(104, 122, 8, 4);
      // 金糸の打掛と妖火
      ctx.fillStyle = '#a01830'; ctx.fillRect(20, 144, 152, 44);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(40, 148, 112, 12); ctx.fillRect(88, 144, 16, 44);
      // 蒼き狐火グロー
      ctx.save(); ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#00f0ff'; ctx.fillRect(16, 24, 16, 24); ctx.fillRect(160, 24, 16, 24);
      ctx.restore(); ctx.shadowBlur = 0;
    });

    // 4. 雪女・氷華 (哀愁と冷気の儚き氷の妖女)
    this.portraits.boss_hyoka = this.createTile(sBoss, (ctx) => {
      ctx.fillStyle = '#081424'; ctx.fillRect(0, 0, sBoss, sBoss);
      ctx.strokeStyle = '#4098d8'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, sBoss - 4, sBoss - 4);
      // 氷晶の長髪 (吹雪のグラデーション)
      ctx.fillStyle = '#60a0d8'; ctx.fillRect(20, 20, 152, 60); ctx.fillRect(12, 60, 36, 110); ctx.fillRect(144, 60, 36, 110);
      ctx.fillStyle = '#a8d8f8'; ctx.fillRect(28, 24, 136, 16); ctx.fillRect(16, 70, 24, 90); ctx.fillRect(152, 70, 24, 90);
      // 氷晶の額飾り
      ctx.fillStyle = '#ffffff'; ctx.fillRect(84, 28, 24, 24); ctx.fillRect(72, 36, 48, 8);
      ctx.fillStyle = '#00ffff'; ctx.fillRect(90, 34, 12, 12);
      // 透き通る白皙の貌
      ctx.fillStyle = '#f0f8ff'; ctx.fillRect(44, 52, 104, 92);
      ctx.fillStyle = '#cce4f8'; ctx.fillRect(44, 120, 104, 24);
      // 哀愁を湛える蒼氷の瞳
      ctx.fillStyle = '#103058'; ctx.fillRect(52, 80, 32, 6); ctx.fillRect(108, 80, 32, 6);
      ctx.fillStyle = '#2078c8'; ctx.fillRect(56, 86, 24, 18); ctx.fillRect(112, 86, 24, 18);
      ctx.fillStyle = '#a0e8ff'; ctx.fillRect(60, 88, 12, 12); ctx.fillRect(116, 88, 12, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(62, 90, 4, 4); ctx.fillRect(118, 90, 4, 4);
      // 儚い薄紅の唇
      ctx.fillStyle = '#e07898'; ctx.fillRect(86, 126, 20, 6);
      // 純白の白無垢・毛皮
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 144, 152, 44);
      ctx.fillStyle = '#b8d8f0'; ctx.fillRect(36, 152, 120, 12); ctx.fillRect(84, 144, 24, 44);
    });
    this.portraits.hyoka = this.portraits.boss_hyoka;

    // 5. 水神・蛟龍 (荒ぶる水神の龍神相)
    this.portraits.boss_mizuchi = this.createTile(sBoss, (ctx) => {
      ctx.fillStyle = '#041020'; ctx.fillRect(0, 0, sBoss, sBoss);
      ctx.strokeStyle = '#1860a8'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, sBoss - 4, sBoss - 4);
      // 水晶の水神二股角
      ctx.fillStyle = '#2080c0'; ctx.fillRect(28, 6, 28, 48); ctx.fillRect(136, 6, 28, 48);
      ctx.fillStyle = '#80e0ff'; ctx.fillRect(34, 10, 16, 24); ctx.fillRect(142, 10, 16, 24);
      // 蒼碧の龍鱗と背びれ
      ctx.fillStyle = '#0c2848'; ctx.fillRect(20, 32, 152, 44); ctx.fillRect(84, 12, 24, 32);
      ctx.fillStyle = '#145080'; ctx.fillRect(36, 48, 120, 100);
      ctx.fillStyle = '#2888c8'; ctx.fillRect(48, 56, 96, 24);
      // 金眼・縦瞳孔
      ctx.fillStyle = '#ffd700'; ctx.fillRect(48, 80, 32, 20); ctx.fillRect(112, 80, 32, 20);
      ctx.fillStyle = '#041018'; ctx.fillRect(60, 80, 8, 20); ctx.fillRect(124, 80, 8, 20);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(52, 84, 4, 4); ctx.fillRect(116, 84, 4, 4);
      // 龍の長い髭
      ctx.fillStyle = '#80d0ff'; ctx.fillRect(36, 112, 24, 40); ctx.fillRect(132, 112, 24, 40);
      // 龍顎と牙
      ctx.fillStyle = '#081c30'; ctx.fillRect(60, 116, 72, 32);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(64, 116, 12, 16); ctx.fillRect(116, 116, 12, 16);
      ctx.fillRect(76, 132, 10, 12); ctx.fillRect(106, 132, 10, 12);
      // 水神の渦巻く霊水襟
      ctx.fillStyle = '#0a3058'; ctx.fillRect(16, 148, 160, 40);
      ctx.fillStyle = '#38a8e8'; ctx.fillRect(28, 160, 136, 12);
    });
    this.portraits.mizuchi_boss = this.portraits.boss_mizuchi;

    // 6. 妖魔将・酒呑童子 (豪快かつ凶悪な嗤いの一本角頭目)
    this.portraits.boss_shuten = this.createTile(sBoss, (ctx) => {
      ctx.fillStyle = '#180404'; ctx.fillRect(0, 0, sBoss, sBoss);
      ctx.strokeStyle = '#c02818'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, sBoss - 4, sBoss - 4);
      // 巨大な中央一本角
      ctx.fillStyle = '#18141c'; ctx.fillRect(80, 4, 32, 52);
      ctx.fillStyle = '#c02424'; ctx.fillRect(84, 12, 24, 20);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(88, 6, 16, 12);
      // 燃える赤髪
      ctx.fillStyle = '#801010'; ctx.fillRect(20, 36, 152, 52); ctx.fillRect(12, 64, 32, 90); ctx.fillRect(148, 64, 32, 90);
      ctx.fillStyle = '#c82424'; ctx.fillRect(28, 40, 136, 16);
      // 凶悪な鬼貌
      ctx.fillStyle = '#c84434'; ctx.fillRect(40, 56, 112, 92);
      ctx.fillStyle = '#e86454'; ctx.fillRect(48, 60, 96, 20);
      // 狂気の金色邪眼
      ctx.fillStyle = '#200404'; ctx.fillRect(44, 76, 40, 8); ctx.fillRect(108, 76, 40, 8);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(48, 84, 32, 18); ctx.fillRect(112, 84, 32, 18);
      ctx.fillStyle = '#800000'; ctx.fillRect(58, 88, 12, 12); ctx.fillRect(122, 88, 12, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(60, 90, 4, 4); ctx.fillRect(124, 90, 4, 4);
      // 豪快な赤髭と大口
      ctx.fillStyle = '#180404'; ctx.fillRect(56, 120, 80, 24);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(60, 120, 16, 12); ctx.fillRect(116, 120, 16, 12);
      ctx.fillStyle = '#901818'; ctx.fillRect(48, 140, 96, 24); // 顎髭
      // 豪奢な金糸陣羽織＆朱塗りの盃
      ctx.fillStyle = '#3a1810'; ctx.fillRect(20, 152, 152, 36);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(36, 156, 120, 12);
      ctx.fillStyle = '#c02020'; ctx.fillRect(24, 164, 32, 24); // 朱杯
    });
    this.portraits.shuten = this.portraits.boss_shuten;

    // 7. 鬼将・茨木童子 (復讐の炎宿す白銀髪の鬼将)
    this.portraits.boss_ibaraki = this.createTile(sBoss, (ctx) => {
      ctx.fillStyle = '#14081c'; ctx.fillRect(0, 0, sBoss, sBoss);
      ctx.strokeStyle = '#681888'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, sBoss - 4, sBoss - 4);
      // 紅き片角 (左角のみ)
      ctx.fillStyle = '#201028'; ctx.fillRect(36, 8, 28, 48);
      ctx.fillStyle = '#c01848'; ctx.fillRect(40, 14, 20, 24);
      ctx.fillStyle = '#ff4070'; ctx.fillRect(44, 8, 12, 10);
      // 乱れ白銀髪
      ctx.fillStyle = '#d4d8e4'; ctx.fillRect(24, 32, 144, 52); ctx.fillRect(16, 60, 36, 90); ctx.fillRect(140, 60, 36, 90);
      ctx.fillStyle = '#9aa0b8'; ctx.fillRect(32, 36, 128, 14);
      // 凄惨な美貌
      ctx.fillStyle = '#f0e0e8'; ctx.fillRect(44, 56, 104, 88);
      ctx.fillStyle = '#d0b8c8'; ctx.fillRect(44, 116, 104, 24);
      // 頬の古傷
      ctx.fillStyle = '#a02040'; ctx.fillRect(116, 96, 16, 28); ctx.fillRect(112, 106, 24, 4);
      // 血に飢えた真紅の眼
      ctx.fillStyle = '#240818'; ctx.fillRect(48, 78, 36, 6); ctx.fillRect(108, 78, 36, 6);
      ctx.fillStyle = '#c81848'; ctx.fillRect(52, 84, 28, 18); ctx.fillRect(112, 84, 28, 18);
      ctx.fillStyle = '#ff6088'; ctx.fillRect(56, 88, 12, 10); ctx.fillRect(116, 88, 12, 10);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(58, 89, 4, 4); ctx.fillRect(118, 89, 4, 4);
      // 引き締まった紅唇
      ctx.fillStyle = '#981838'; ctx.fillRect(84, 124, 24, 6);
      // 漆黒の南蛮甲冑
      ctx.fillStyle = '#201828'; ctx.fillRect(20, 144, 152, 44);
      ctx.fillStyle = '#802898'; ctx.fillRect(36, 152, 120, 10);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(84, 144, 24, 44);
    });
    this.portraits.ibaraki = this.portraits.boss_ibaraki;

    // 8. 亡霊剣聖・無想影 (冷徹な殺気を纏う亡霊の剣豪)
    this.portraits.boss_musokage = this.createTile(sBoss, (ctx) => {
      ctx.fillStyle = '#081418'; ctx.fillRect(0, 0, sBoss, sBoss);
      ctx.strokeStyle = '#206888'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, sBoss - 4, sBoss - 4);
      // 深網代笠
      ctx.fillStyle = '#242028'; ctx.fillRect(20, 16, 152, 36); ctx.fillRect(12, 36, 168, 20);
      ctx.fillStyle = '#403848'; ctx.fillRect(28, 20, 136, 12); ctx.fillRect(16, 40, 160, 6);
      // 亡霊の虚無素肌
      ctx.fillStyle = '#b8ccd8'; ctx.fillRect(44, 52, 104, 40);
      // 蒼く燐光を放つ虚無の双眸 (グロー)
      ctx.save(); ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#00ffff'; ctx.fillRect(52, 68, 28, 14); ctx.fillRect(112, 68, 28, 14);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(60, 71, 12, 8); ctx.fillRect(120, 71, 12, 8);
      ctx.restore(); ctx.shadowBlur = 0;
      // 黒漆の面頬 (めんぼう)
      ctx.fillStyle = '#14141c'; ctx.fillRect(40, 88, 112, 56);
      ctx.fillStyle = '#282838'; ctx.fillRect(44, 92, 104, 14);
      ctx.fillStyle = '#b02020'; ctx.fillRect(80, 116, 32, 8); // 面頬の朱髭
      // 亡霊の陣羽織と白銀刀身
      ctx.fillStyle = '#182430'; ctx.fillRect(20, 144, 152, 44);
      ctx.fillStyle = '#c0d4e8'; ctx.fillRect(136, 80, 20, 108); // 抜き身の刃
      ctx.fillStyle = '#ffffff'; ctx.fillRect(142, 80, 8, 108);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(132, 140, 28, 12); // 鍔
    });
    this.portraits.musokage = this.portraits.boss_musokage;

    // 9. 真・九尾の天狐・茜 (神々しさと悲哀の九曜天狐)
    this.portraits.boss_shin_youko = this.createTile(sBoss, (ctx) => {
      ctx.fillStyle = '#180c20'; ctx.fillRect(0, 0, sBoss, sBoss);
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, sBoss - 4, sBoss - 4);
      // 神々しい黄金光背オーラ
      ctx.save(); ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 18;
      ctx.strokeStyle = '#ffe860'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(96, 80, 72, 0, Math.PI * 2); ctx.stroke();
      ctx.restore(); ctx.shadowBlur = 0;
      // 天狐耳
      ctx.fillStyle = '#ffffff'; ctx.fillRect(24, 6, 40, 56); ctx.fillRect(128, 6, 40, 56);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(32, 14, 24, 36); ctx.fillRect(136, 14, 24, 36);
      // 神聖な白銀長髪
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 36, 152, 64); ctx.fillRect(8, 68, 40, 96); ctx.fillRect(144, 68, 40, 96);
      ctx.fillStyle = '#f0e8d0'; ctx.fillRect(28, 40, 136, 14);
      // 神聖美貌
      ctx.fillStyle = '#fff8f4'; ctx.fillRect(44, 56, 104, 88);
      ctx.fillStyle = '#fae0d0'; ctx.fillRect(44, 120, 104, 24);
      // 額の九曜神聖宝珠・金紋
      ctx.fillStyle = '#ffd700'; ctx.fillRect(84, 48, 24, 24);
      ctx.fillStyle = '#ff2060'; ctx.fillRect(90, 54, 12, 12);
      // 虹色に輝く神眼
      ctx.fillStyle = '#4a0830'; ctx.fillRect(48, 80, 36, 6); ctx.fillRect(108, 80, 36, 6);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(52, 86, 28, 16); ctx.fillRect(112, 86, 28, 16);
      ctx.fillStyle = '#00ffff'; ctx.fillRect(58, 88, 14, 12); ctx.fillRect(118, 88, 14, 12);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(60, 90, 6, 6); ctx.fillRect(120, 90, 6, 6);
      // 気高き紅唇
      ctx.fillStyle = '#e81848'; ctx.fillRect(84, 122, 24, 8);
      // 天女の羽衣＆神聖装束
      ctx.fillStyle = '#ffffff'; ctx.fillRect(20, 144, 152, 44);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(36, 150, 120, 12); ctx.fillRect(88, 144, 16, 44);
    });
    this.portraits.shin_youko = this.portraits.boss_shin_youko;

    // --- 主要NPC6名専用描き下ろしバストアップポートレート (128x128) ---
    // 1. 村長 (温和で威厳ある老翁)
    this.portraits.npc_village_head = this.createTile(s, (ctx) => {
      ctx.fillStyle = '#141c14'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#2c5838'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
      // 白髪頭
      ctx.fillStyle = '#e0e4ec'; ctx.fillRect(28, 10, 72, 40); ctx.fillRect(20, 24, 88, 44);
      ctx.fillStyle = '#b0b8c8'; ctx.fillRect(36, 12, 56, 10);
      // 老翁の温和な顔
      ctx.fillStyle = '#f6d2b4'; ctx.fillRect(32, 34, 64, 58);
      ctx.fillStyle = '#e0b490'; ctx.fillRect(32, 80, 64, 12);
      // 白眉・細めた優しい目・皺
      ctx.fillStyle = '#ffffff'; ctx.fillRect(38, 44, 20, 5); ctx.fillRect(70, 44, 20, 5);
      ctx.fillStyle = '#2a1a14'; ctx.fillRect(42, 52, 14, 4); ctx.fillRect(72, 52, 14, 4);
      ctx.fillStyle = '#c4906c'; ctx.fillRect(36, 62, 12, 2); ctx.fillRect(80, 62, 12, 2); // 目尻の皺
      // 豊かな白髭
      ctx.fillStyle = '#e8ecf4'; ctx.fillRect(44, 70, 40, 28); ctx.fillRect(48, 92, 32, 16);
      // 深緑の羽織と着物
      ctx.fillStyle = '#264c30'; ctx.fillRect(12, 96, 104, 32);
      ctx.fillStyle = '#447850'; ctx.fillRect(16, 98, 96, 8);
      ctx.fillStyle = '#d8cca8'; ctx.fillRect(52, 96, 24, 32); // 半襟
    });
    this.portraits.npc_elder = this.portraits.npc_village_head;

    // 2. 神主 (祭祀を司る厳格な神官)
    this.portraits.npc_kannushi = this.createTile(s, (ctx) => {
      ctx.fillStyle = '#181024'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#5c1c78'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
      // 漆黒の烏帽子
      ctx.fillStyle = '#14101c'; ctx.fillRect(44, 4, 40, 36); ctx.fillRect(40, 32, 48, 12);
      ctx.fillStyle = '#2c2238'; ctx.fillRect(48, 8, 32, 8);
      // 整った黒髪
      ctx.fillStyle = '#181420'; ctx.fillRect(24, 38, 80, 36);
      // 神官の凛とした顔
      ctx.fillStyle = '#f8d4bc'; ctx.fillRect(32, 40, 64, 54);
      ctx.fillStyle = '#e4b498'; ctx.fillRect(32, 82, 64, 12);
      // 凛々しい眉と瞳
      ctx.fillStyle = '#100e14'; ctx.fillRect(38, 48, 18, 4); ctx.fillRect(72, 48, 18, 4);
      ctx.fillStyle = '#181824'; ctx.fillRect(42, 54, 12, 8); ctx.fillRect(74, 54, 12, 8);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(44, 55, 4, 4); ctx.fillRect(76, 55, 4, 4);
      // 白神官装束 (白衣と紫襟)
      ctx.fillStyle = '#ffffff'; ctx.fillRect(12, 94, 104, 34);
      ctx.fillStyle = '#d8dce8'; ctx.fillRect(16, 110, 96, 18);
      ctx.fillStyle = '#682088'; ctx.fillRect(48, 94, 32, 34); // 紫襟
    });
    this.portraits.npc_priest = this.portraits.npc_kannushi;

    // 3. 陰陽頭安倍 (当代随一の大陰陽師)
    this.portraits.npc_abe = this.createTile(s, (ctx) => {
      ctx.fillStyle = '#1c1428'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
      // 紫の立烏帽子
      ctx.fillStyle = '#3a1854'; ctx.fillRect(46, 2, 36, 40); ctx.fillRect(40, 34, 48, 12);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(56, 36, 16, 8); // 金の烏帽子留め
      // 知的な面立ち
      ctx.fillStyle = '#fae4d0'; ctx.fillRect(32, 40, 64, 54);
      ctx.fillStyle = '#e8c4a8'; ctx.fillRect(32, 82, 64, 12);
      // 鋭い知謀の眼光
      ctx.fillStyle = '#180c24'; ctx.fillRect(38, 48, 20, 4); ctx.fillRect(70, 48, 20, 4);
      ctx.fillStyle = '#4a2078'; ctx.fillRect(42, 54, 14, 8); ctx.fillRect(72, 54, 14, 8);
      ctx.fillStyle = '#00ffff'; ctx.fillRect(46, 55, 4, 4); ctx.fillRect(76, 55, 4, 4); // 霊光
      // 額の呪符
      ctx.fillStyle = '#ffffff'; ctx.fillRect(58, 42, 12, 10);
      ctx.fillStyle = '#d81818'; ctx.fillRect(62, 44, 4, 6);
      // 高貴な紫と白の狩衣
      ctx.fillStyle = '#482068'; ctx.fillRect(12, 94, 104, 34);
      ctx.fillStyle = '#ffd700'; ctx.fillRect(16, 96, 96, 8);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(48, 94, 32, 34);
    });
    this.portraits.onmyo_head = this.portraits.npc_abe;

    // 4. 藤原の姫君 (雅な平安の姫)
    this.portraits.npc_hime = this.createTile(s, (ctx) => {
      ctx.fillStyle = '#201018'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#e84068'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
      // 艶やかな黒髪垂髪
      ctx.fillStyle = '#100e14'; ctx.fillRect(20, 8, 88, 48); ctx.fillRect(14, 24, 100, 72);
      ctx.fillStyle = '#282436'; ctx.fillRect(28, 10, 72, 10); ctx.fillRect(16, 32, 14, 64); ctx.fillRect(98, 32, 14, 64);
      // 気品あふれる白皙の美貌
      ctx.fillStyle = '#fff4ee'; ctx.fillRect(34, 36, 60, 56);
      ctx.fillStyle = '#f6d4c8'; ctx.fillRect(34, 80, 60, 12);
      // 殿上眉・優雅な瞳
      ctx.fillStyle = '#281824'; ctx.fillRect(44, 42, 10, 6); ctx.fillRect(74, 42, 10, 6); // 殿上眉
      ctx.fillStyle = '#18101c'; ctx.fillRect(42, 54, 12, 8); ctx.fillRect(74, 54, 12, 8);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(44, 55, 4, 4); ctx.fillRect(76, 55, 4, 4);
      // おちょぼ口・紅筆
      ctx.fillStyle = '#e83058'; ctx.fillRect(60, 76, 8, 5);
      // 華やかな十二単 (多重襟: 紅・萌黄・白)
      ctx.fillStyle = '#a01838'; ctx.fillRect(12, 92, 104, 36);
      ctx.fillStyle = '#488840'; ctx.fillRect(18, 96, 92, 10);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(48, 92, 32, 36);
    });
    this.portraits.princess = this.portraits.npc_hime;

    // 5. 看板娘お花 (笑顔の元気な町娘)
    this.portraits.npc_ohana = this.createTile(s, (ctx) => {
      ctx.fillStyle = '#24141c'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#d83868'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
      // お団子ヘア＆桃色の桜髪飾り
      ctx.fillStyle = '#141018'; ctx.fillRect(24, 10, 80, 42); ctx.fillRect(88, 2, 24, 24);
      ctx.fillStyle = '#ff6090'; ctx.fillRect(84, 12, 16, 16); ctx.fillRect(90, 8, 8, 8);
      // 愛らしい笑顔の顔
      ctx.fillStyle = '#fce2cc'; ctx.fillRect(32, 36, 64, 56);
      ctx.fillStyle = '#f4c4a4'; ctx.fillRect(32, 80, 64, 12);
      // 大きな瞳・笑顔の口
      ctx.fillStyle = '#201018'; ctx.fillRect(40, 48, 14, 4); ctx.fillRect(74, 48, 14, 4);
      ctx.fillStyle = '#381c28'; ctx.fillRect(42, 54, 12, 10); ctx.fillRect(74, 54, 12, 10);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(44, 55, 4, 4); ctx.fillRect(76, 55, 4, 4);
      ctx.fillStyle = '#f894a8'; ctx.fillRect(36, 66, 10, 4); ctx.fillRect(82, 66, 10, 4); // 頬紅
      ctx.fillStyle = '#e84860'; ctx.fillRect(58, 74, 12, 6); // 笑顔
      // 茶屋の前掛けと小袖
      ctx.fillStyle = '#d84878'; ctx.fillRect(12, 92, 104, 36);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(44, 92, 40, 36); // 前掛け
      ctx.fillStyle = '#cc2040'; ctx.fillRect(56, 94, 16, 34);
    });

    // 6. 琵琶法師幽玄 (盲目の穏やかな法師)
    this.portraits.npc_yugen = this.createTile(s, (ctx) => {
      ctx.fillStyle = '#1c1814'; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = '#584838'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
      // 法師頭巾 (黒頭巾)
      ctx.fillStyle = '#201c24'; ctx.fillRect(24, 8, 80, 48); ctx.fillRect(18, 28, 92, 64);
      ctx.fillStyle = '#383240'; ctx.fillRect(32, 10, 64, 12);
      // 穏やかな顔
      ctx.fillStyle = '#f4d2b4'; ctx.fillRect(32, 40, 64, 52);
      ctx.fillStyle = '#dcb090'; ctx.fillRect(32, 80, 64, 12);
      // 静かに閉じた盲目の目元
      ctx.fillStyle = '#3a2820'; ctx.fillRect(40, 52, 16, 3); ctx.fillRect(72, 52, 16, 3);
      // 僧衣と琵琶の首元
      ctx.fillStyle = '#4a3c2c'; ctx.fillRect(12, 92, 104, 36);
      ctx.fillStyle = '#8b6840'; ctx.fillRect(16, 96, 96, 8);
      ctx.fillStyle = '#d4af37'; ctx.fillRect(80, 64, 16, 64); // 琵琶の棹
      ctx.fillStyle = '#3a1808'; ctx.fillRect(76, 80, 24, 16);
    });
    this.portraits.npc_biwa_monk = this.portraits.npc_yugen;

    // --- その他NPC (64pxスプライトを128pxポートレート枠へ完全な整数2倍拡大描画) ---
    const drawScaledNpcPortrait = (spriteKey, borderCol = '#4a3828') => {
      return this.createTile(s, (ctx) => {
        ctx.fillStyle = '#1c1620'; ctx.fillRect(0, 0, s, s);
        ctx.strokeStyle = borderCol; ctx.lineWidth = 4; ctx.strokeRect(2, 2, s - 4, s - 4);
        if (this.sprites[spriteKey]) {
          ctx.imageSmoothingEnabled = false;
          // 64x64スプライトを完全な整数2倍 (128x128) で等倍拡大
          ctx.drawImage(this.sprites[spriteKey], 0, 0, 64, 64, 0, 0, 128, 128);
        }
      });
    };

    this.portraits.npc_smith_genzo = drawScaledNpcPortrait('npc_smith_genzo', '#883820');
    this.portraits.npc_smith = this.portraits.npc_smith_genzo;
    this.portraits.npc_taichi = drawScaledNpcPortrait('npc_taichi', '#2868a8');
    this.portraits.npc_boy = this.portraits.npc_taichi;
    this.portraits.npc_merchant_jinbei = drawScaledNpcPortrait('npc_merchant_jinbei', '#387848');
    this.portraits.npc_merchant = this.portraits.npc_merchant_jinbei;
    this.portraits.npc_yone = drawScaledNpcPortrait('npc_yone', '#6a4050');
    this.portraits.npc_grandma = this.portraits.npc_yone;
    this.portraits.npc_suzu = drawScaledNpcPortrait('npc_suzu', '#d02030');
    this.portraits.npc_miko_apprentice = this.portraits.npc_suzu;
    this.portraits.npc_kagemaru = drawScaledNpcPortrait('npc_kagemaru', '#204068');
    this.portraits.npc_shadow_scout = this.portraits.npc_kagemaru;

    this.portraits.npc_chobei = drawScaledNpcPortrait('npc_chobei', '#287898');
    this.portraits.captain = this.portraits.npc_chobei;
    this.portraits.npc_oshino = drawScaledNpcPortrait('npc_oshino', '#6a2878');
    this.portraits.inn_keeper = this.portraits.npc_oshino;
    this.portraits.npc_ashiya = drawScaledNpcPortrait('npc_ashiya', '#385878');
    this.portraits.onmyoji = this.portraits.npc_ashiya;
    this.portraits.npc_kansuke = drawScaledNpcPortrait('npc_kansuke', '#8b5028');
    this.portraits.fisherman = this.portraits.npc_kansuke;

    this.portraits.npc_guardsman = drawScaledNpcPortrait('npc_guardsman', '#8b2020');
    this.portraits.guard_captain = this.portraits.npc_guardsman;
  }

  // ==========================================
  // 7. エリア別背景描画 (1280x960)
  // ==========================================
  drawBattleBackground(ctx, w, h, bgType = 'night') {
    if (bgType === 'snow') {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      skyGrad.addColorStop(0, '#102038'); skyGrad.addColorStop(0.6, '#305880'); skyGrad.addColorStop(1, '#6898c0');
      ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, w, h * 0.65);

      const groundGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
      groundGrad.addColorStop(0, '#e8f4fc'); groundGrad.addColorStop(0.4, '#c8e4f8'); groundGrad.addColorStop(1, '#90b8d8');
      ctx.fillStyle = groundGrad; ctx.fillRect(0, h * 0.65, w, h * 0.35);
      return;
    }

    if (bgType === 'lake') {
      const waterGrad = ctx.createLinearGradient(0, 0, 0, h);
      waterGrad.addColorStop(0, '#041428'); waterGrad.addColorStop(0.5, '#082848'); waterGrad.addColorStop(1, '#104068');
      ctx.fillStyle = waterGrad; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0a2038'; ctx.fillRect(0, h * 0.7, w, h * 0.3);
      return;
    }

    if (bgType === 'tokoyo') {
      const voidGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      voidGrad.addColorStop(0, '#06000c'); voidGrad.addColorStop(0.5, '#1e0428'); voidGrad.addColorStop(1, '#480838');
      ctx.fillStyle = voidGrad; ctx.fillRect(0, 0, w, h * 0.65);

      const bloodMoon = ctx.createRadialGradient(960, 180, 8, 960, 180, 112);
      bloodMoon.addColorStop(0, '#ff4040'); bloodMoon.addColorStop(0.6, '#a01010'); bloodMoon.addColorStop(1, 'transparent');
      ctx.fillStyle = bloodMoon; ctx.beginPath(); ctx.arc(960, 180, 112, 0, Math.PI * 2); ctx.fill();

      const groundGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
      groundGrad.addColorStop(0, '#1c0824'); groundGrad.addColorStop(1, '#0c0210');
      ctx.fillStyle = groundGrad; ctx.fillRect(0, h * 0.65, w, h * 0.35);
      return;
    }

    // デフォルト: 満月の和風夜空
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    skyGrad.addColorStop(0, '#0a0814'); skyGrad.addColorStop(0.5, '#161226'); skyGrad.addColorStop(1, '#2c1e38');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, w, h * 0.65);

    ctx.fillStyle = '#ffffff';
    [[120, 80], [320, 60], [560, 140], [840, 72], [1080, 112], [1200, 48], [200, 180], [720, 200]].forEach(([sx, sy]) => ctx.fillRect(sx, sy, 4, 4));

    const moonGrad = ctx.createRadialGradient(960, 180, 8, 960, 180, 120);
    moonGrad.addColorStop(0, '#fffbe6'); moonGrad.addColorStop(0.4, '#ffeaa7'); moonGrad.addColorStop(0.8, 'rgba(255, 234, 167, 0.2)'); moonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGrad; ctx.beginPath(); ctx.arc(960, 180, 120, 0, Math.PI * 2); ctx.fill();

    const groundGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
    groundGrad.addColorStop(0, '#36241a'); groundGrad.addColorStop(0.3, '#2a3a24'); groundGrad.addColorStop(1, '#182414');
    ctx.fillStyle = groundGrad; ctx.fillRect(0, h * 0.65, w, h * 0.35);
  }

  drawUrushiFrame(ctx, x, y, w, h, title = '') {
    ctx.save();
    ctx.fillStyle = '#16101c'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 5; ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    ctx.strokeStyle = '#9e2a2b'; ctx.lineWidth = 3; ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);
    ctx.fillStyle = '#ffd700'; ctx.fillRect(x + 5, y + 5, 6, 6); ctx.fillRect(x + w - 11, y + 5, 6, 6);
    if (title) {
      const titleWidth = title.length * 24 + 36;
      ctx.fillStyle = '#9e2a2b'; ctx.fillRect(x + 32, y - 16, titleWidth, 32);
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5; ctx.strokeRect(x + 32, y - 16, titleWidth, 32);
      this.drawCrispText(ctx, title, x + 48, y + 6, `bold 18px ${this.fontFamily}`, '#fff4e0', '#3b0d11', 3);
    }
    ctx.restore();
  }

  // ==========================================
  // 8. 技エフェクト (1280x960)
  // ==========================================
  drawSlashEffect(ctx, x, y, progress) {
    ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.beginPath();
    const len = 120 * progress; ctx.moveTo(x - len, y - len); ctx.lineTo(x + len, y + len); ctx.stroke();
    ctx.restore();
  }

  drawTornadoEffect(ctx, x, y, progress) {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const radius = 40 + i * 32 + progress * 80; const angle = progress * Math.PI * 6 + i;
      ctx.strokeStyle = i % 2 === 0 ? '#44ffaa' : '#ffffff'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.ellipse(x + Math.sin(angle) * 60, y - i * 40, radius, radius * 0.4, angle, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  drawHolyEffect(ctx, x, y, progress) {
    ctx.save(); ctx.fillStyle = `rgba(255, 235, 120, ${1 - progress})`;
    ctx.beginPath(); ctx.arc(x, y, 40 + progress * 100, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  drawHolyPillarEffect(ctx, x, y, progress) {
    ctx.save();
    const pillarGrad = ctx.createLinearGradient(x - 100, 0, x + 100, 0);
    pillarGrad.addColorStop(0, 'rgba(255, 255, 200, 0)'); pillarGrad.addColorStop(0.5, `rgba(255, 255, 240, ${0.9 * (1 - progress)})`); pillarGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = pillarGrad; ctx.fillRect(x - 140, 0, 280, 960);
    ctx.restore();
  }

  drawFireEffect(ctx, x, y, progress) {
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4; const dist = progress * 120;
      ctx.fillStyle = i % 2 === 0 ? '#ff3300' : '#ffaa00';
      ctx.beginPath(); ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist - progress * 60, Math.max(4, 40 * (1 - progress)), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawBlizzardEffect(ctx, x, y, progress) {
    ctx.save();
    for (let i = 0; i < 20; i++) {
      const bx = x - 200 + ((progress * 600 + i * 60) % 480);
      const by = y - 160 + ((progress * 320 + i * 50) % 320);
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#a0e0ff';
      ctx.beginPath(); ctx.arc(bx, by, 8 + (i % 6), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawIceSpearEffect(ctx, x, y, progress) {
    ctx.save();
    ctx.strokeStyle = '#c8f0ff'; ctx.lineWidth = 8;
    for (let i = 0; i < 4; i++) {
      const sx = x - 80 + i * 56; const sy = y - 200 + progress * 280;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 20, sy - 80); ctx.stroke();
    }
    ctx.restore();
  }

  drawWaterWaveEffect(ctx, x, y, progress) {
    ctx.save();
    const waveGrad = ctx.createLinearGradient(0, y - 120, 0, y + 120);
    waveGrad.addColorStop(0, 'rgba(100, 200, 255, 0.8)'); waveGrad.addColorStop(1, 'rgba(20, 80, 200, 0.9)');
    ctx.fillStyle = waveGrad;
    ctx.beginPath(); ctx.moveTo(x - 240, y + 80); ctx.bezierCurveTo(x - 120, y - 160 * progress, x + 120, y - 160 * progress, x + 240, y + 80); ctx.fill();
    ctx.restore();
  }

  drawThunderEffect(ctx, x, y, progress) {
    ctx.save(); ctx.strokeStyle = '#ffff40'; ctx.lineWidth = 8; ctx.beginPath();
    ctx.moveTo(x, y - 240); ctx.lineTo(x + (Math.random() * 80 - 40), y - 120); ctx.lineTo(x + (Math.random() * 80 - 40), y); ctx.lineTo(x + (Math.random() * 80 - 40), y + 80); ctx.stroke();
    ctx.restore();
  }

  drawPurpleLightningEffect(ctx, x, y, progress) {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = '#b844ff'; ctx.lineWidth = 8; ctx.beginPath();
      ctx.moveTo(x - 120 + i * 100, y - 240); ctx.lineTo(x + (Math.random() * 120 - 60), y - 80); ctx.lineTo(x + (Math.random() * 120 - 60), y + 60); ctx.stroke();
    }
    ctx.restore();
  }

  drawDarkSlashEffect(ctx, x, y, progress) {
    ctx.save(); ctx.strokeStyle = '#aa20ff'; ctx.lineWidth = 12; ctx.beginPath();
    const len = 140 * progress; ctx.moveTo(x + len, y - len); ctx.lineTo(x - len, y + len); ctx.stroke();
    ctx.strokeStyle = '#100020'; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  }

  drawHealEffect(ctx, x, y, progress) {
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4; const px = x + Math.cos(angle) * 72; const py = y - progress * 140 + Math.sin(angle) * 40;
      ctx.fillStyle = '#44ff88'; ctx.beginPath(); ctx.arc(px, py, 12 * (1 - progress * 0.5), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  drawBuffEffect(ctx, x, y, progress) {
    ctx.save(); ctx.strokeStyle = '#ffea66'; ctx.lineWidth = 6; ctx.beginPath();
    ctx.arc(x, y - progress * 80, 60, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  shade(hex, amt) {
    let col = hex.replace('#', '');
    if (col.length === 3) col = col.split('').map(c => c + c).join('');
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00FF) + amt;
    let b = (num & 0x0000FF) + amt;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  createTile(size, renderFn) {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    renderFn(ctx);
    return canvas;
  }

  createOutlinedTile(size, renderFn, outlineColor = '#0a0810', w = 3) {
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = size;
    const tctx = tmp.getContext('2d');
    tctx.imageSmoothingEnabled = false;
    renderFn(tctx);

    const out = document.createElement('canvas');
    out.width = out.height = size;
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = false;

    // シルエットを全方向にずらして描き、黒く塗りつぶす
    for (let dx = -w; dx <= w; dx++) {
      for (let dy = -w; dy <= w; dy++) {
        if (dx || dy) octx.drawImage(tmp, dx, dy);
      }
    }
    octx.globalCompositeOperation = 'source-in';
    octx.fillStyle = outlineColor;
    octx.fillRect(0, 0, size, size);

    // 本体を上に重ねる
    octx.globalCompositeOperation = 'source-over';
    octx.drawImage(tmp, 0, 0);
    return out;
  }
}
