/**
 * ==========================================================================
 * 妖幻奇譚 〜もののけ草子〜 メインゲームループ (1280x960 ハイレゾHD-2D版)
 * ==========================================================================
 */

class MobileInputManager {
  constructor(game) {
    this.game = game;
    this.keys = {};
    this.justPressedKeys = {};

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyZ', 'KeyX', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Enter', 'Escape', 'ShiftLeft'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keys[e.code]) {
        this.justPressedKeys[e.code] = true;
      }
      this.keys[e.code] = true;
      this.game.audio.unlockAudio();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.setupVirtualControls();
    this.setupCanvasTouch();
  }

  setupVirtualControls() {
    const dpad = document.getElementById('dpad');
    const dpadBtns = document.querySelectorAll('.dpad-btn');
    const actionBtns = document.querySelectorAll('.btn-action');

    if (dpad) {
      const handleDpadTouch = (e) => {
        e.preventDefault();
        this.game.audio.unlockAudio();
        const touch = e.touches ? e.touches[0] : e;
        const rect = dpad.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const deadzone = 12;

        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(k => {
          this.keys[k] = false;
        });
        dpadBtns.forEach(btn => btn.classList.remove('active'));

        if (Math.hypot(dx, dy) > deadzone) {
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
              this.setKey('ArrowRight', true);
              document.querySelector('.dpad-btn.right')?.classList.add('active');
            } else {
              this.setKey('ArrowLeft', true);
              document.querySelector('.dpad-btn.left')?.classList.add('active');
            }
          } else {
            if (dy > 0) {
              this.setKey('ArrowDown', true);
              document.querySelector('.dpad-btn.down')?.classList.add('active');
            } else {
              this.setKey('ArrowUp', true);
              document.querySelector('.dpad-btn.up')?.classList.add('active');
            }
          }
        }
      };

      const clearDpad = (e) => {
        e.preventDefault();
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(k => {
          this.keys[k] = false;
        });
        dpadBtns.forEach(btn => btn.classList.remove('active'));
      };

      dpad.addEventListener('touchstart', handleDpadTouch, { passive: false });
      dpad.addEventListener('touchmove', handleDpadTouch, { passive: false });
      dpad.addEventListener('touchend', clearDpad, { passive: false });
      dpad.addEventListener('touchcancel', clearDpad, { passive: false });

      dpadBtns.forEach(btn => {
        const key = btn.getAttribute('data-key');
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.game.audio.unlockAudio();
          this.setKey(key, true);
        });
        btn.addEventListener('mouseup', (e) => {
          e.preventDefault();
          this.keys[key] = false;
        });
      });
    }

    actionBtns.forEach(btn => {
      const key = btn.getAttribute('data-key');
      if (!key) return;

      const press = (e) => {
        e.preventDefault();
        this.game.audio.unlockAudio();
        this.setKey(key, true);
        btn.classList.add('active');
      };

      const release = (e) => {
        e.preventDefault();
        this.keys[key] = false;
        btn.classList.remove('active');
      };

      btn.addEventListener('touchstart', press, { passive: false });
      btn.addEventListener('touchend', release, { passive: false });
      btn.addEventListener('touchcancel', release, { passive: false });
      btn.addEventListener('mousedown', press);
      btn.addEventListener('mouseup', release);
    });
  }

  setupCanvasTouch() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const handleCanvasTap = (e) => {
      e.preventDefault();
      this.game.audio.unlockAudio();

      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const canvasX = ((clientX - rect.left) / rect.width) * 1280;
      const canvasY = ((clientY - rect.top) / rect.height) * 960;

      this.game.handleDirectTap(canvasX, canvasY);
    };

    canvas.addEventListener('touchstart', handleCanvasTap, { passive: false });
    canvas.addEventListener('mousedown', handleCanvasTap);
  }

  setKey(key, state) {
    if (state && !this.keys[key]) {
      this.justPressedKeys[key] = true;
    }
    this.keys[key] = state;
  }

  isDown(code) { return !!this.keys[code]; }
  isJustPressed(code) { return !!this.justPressedKeys[code]; }
  clearJustPressed() { this.justPressedKeys = {}; }
}

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.audio = new AudioManager();
    this.graphics = new GraphicsEngine();
    this.opening = new OpeningManager(this);
    this.ending = new EndingManager(this);
    this.map = new MapManager(this);
    this.battle = new BattleManager(this);
    this.input = new MobileInputManager(this);

    this.state = 'OPENING';
    this.titleMenu = {
      items: ['はじめから', 'つづきから', '序幕（オープニング）', '終幕（エンディング）'],
      selectedIndex: 0,
      hasSave: false,
      summary: null
    };

    this.titleIdleTimer = 0;
    this.transitionTimer = 0;
    this.transitionDuration = 35;
    this.pendingBattle = null;

    this.petals = [];
    for (let i = 0; i < 50; i++) {
      this.petals.push({
        x: Math.random() * 1280,
        y: Math.random() * 960,
        vx: 1.2 + Math.random() * 1.8,
        vy: 1.5 + Math.random() * 2.5,
        size: 6 + Math.random() * 5,
        angle: Math.random() * Math.PI * 2
      });
    }

    this.setupAudioToggle();
    this.setupRotatePrompt();
    this.checkSavedGame();
  }

  setupRotatePrompt() {
    const btn = document.getElementById('rotate-dismiss');
    if (!btn) return;
    const dismiss = (e) => {
      e.preventDefault();
      document.body.classList.add('rotate-dismissed');
      // ユーザー操作契機でWeb Audioを解錠
      this.audio.unlockAudio();
    };
    btn.addEventListener('click', dismiss);
    btn.addEventListener('touchstart', dismiss, { passive: false });
  }

  checkSavedGame() {
    this.titleMenu.hasSave = SaveManager.hasSaveData();
    if (this.titleMenu.hasSave) {
      this.titleMenu.summary = SaveManager.getSaveSummary();
      this.titleMenu.selectedIndex = 1;
    }
  }

  setupAudioToggle() {
    const btn = document.getElementById('btn-sound-toggle');
    const icon = document.getElementById('sound-icon');
    if (btn && icon) {
      const toggle = (e) => {
        e.preventDefault();
        this.audio.unlockAudio();
        const isMuted = this.audio.toggleMute();
        icon.textContent = isMuted ? '🔇' : '🔊';
      };
      btn.addEventListener('click', toggle);
      btn.addEventListener('touchstart', toggle, { passive: false });
    }
  }

  start() {
    this.opening.start();
    requestAnimationFrame(this.loop.bind(this));
  }

  endOpening() {
    this.state = 'TITLE';
    this.titleIdleTimer = 0;
    this.checkSavedGame();
    this.audio.playBgm('title');
  }

  startEnding() {
    this.state = 'ENDING';
    this.ending.start();
  }

  endEnding() {
    this.state = 'TITLE';
    this.titleIdleTimer = 0;
    this.checkSavedGame();
    this.audio.playBgm('title');
  }

  handleDirectTap(cx, cy) {
    if (this.state === 'OPENING') {
      this.opening.handleTap(cx, cy);
    } else if (this.state === 'ENDING') {
      this.ending.handleTap(cx, cy);
    } else if (this.state === 'TITLE') {
      this.audio.unlockAudio();
      this.titleIdleTimer = 0;

      if (cy >= 600 && cy <= 672) {
        this.titleMenu.selectedIndex = 0;
        this.startNewGame();
      } else if (cy > 672 && cy <= 744 && this.titleMenu.hasSave) {
        this.titleMenu.selectedIndex = 1;
        this.loadSavedGame();
      } else if (cy > 744 && cy <= 816) {
        this.state = 'OPENING';
        this.opening.start();
      } else if (cy > 816 && cy <= 900) {
        this.startEnding();
      } else {
        if (this.titleMenu.selectedIndex === 1 && this.titleMenu.hasSave) {
          this.loadSavedGame();
        } else if (this.titleMenu.selectedIndex === 2) {
          this.state = 'OPENING';
          this.opening.start();
        } else if (this.titleMenu.selectedIndex === 3) {
          this.startEnding();
        } else {
          this.startNewGame();
        }
      }
    } else if (this.state === 'MAP') {
      this.map.handleTap(cx, cy);
    } else if (this.state === 'BATTLE') {
      this.battle.handleTap(cx, cy);
    }
  }

  startNewGame() {
    this.audio.playDecide();

    // R-2: マスター初期データへの完全リセット
    if (typeof GAME_DATA.resetToInitial === 'function') {
      GAME_DATA.resetToInitial();
    }
    this.map.loadChapterMap(1);
    this.map.bossDefeated = {
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
    this.map.artifactsObtained = {
      mirror: false,
      magatama: false,
      sword: false
    };
    this.map.player.gridX = 12;
    this.map.player.gridY = 14;
    this.map.player.x = 12 * this.map.tileSize;
    this.map.player.y = 14 * this.map.tileSize;
    this.map.player.targetX = this.map.player.x;
    this.map.player.targetY = this.map.player.y;
    this.map.player.facing = 'down';
    this.map.player.isMoving = false;

    this.state = 'MAP';
    this.audio.playBgm('village');
  }

  loadSavedGame() {
    const success = SaveManager.loadGame(this);
    if (success) {
      this.audio.playSave();
      this.state = 'MAP';
      this.audio.playBgm('village');
    } else {
      this.startNewGame();
    }
  }

  loop() {
    this.update();
    this.render();
    this.input.clearJustPressed();
    requestAnimationFrame(this.loop.bind(this));
  }

  update() {
    if (this.state === 'OPENING') {
      this.opening.update(this.input);
    } else if (this.state === 'ENDING') {
      this.ending.update(this.input);
    } else if (this.state === 'TITLE') {
      this.updateTitle();
    } else if (this.state === 'MAP') {
      this.map.update(this.input);
    } else if (this.state === 'TRANSITION') {
      this.updateTransition();
    } else if (this.state === 'BATTLE') {
      this.battle.update(this.input);
    }
  }

  updateTitle() {
    this.titleIdleTimer++;
    if (this.titleIdleTimer > 1200) {
      this.state = 'OPENING';
      this.opening.start();
      return;
    }

    this.petals.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.angle += 0.03;
      if (p.y > 960) p.y = -10;
      if (p.x > 1280) p.x = -10;
    });

    const menuCount = this.titleMenu.items.length;

    if (this.input.isJustPressed('ArrowUp') || this.input.isJustPressed('KeyW')) {
      this.titleIdleTimer = 0;
      this.titleMenu.selectedIndex = (this.titleMenu.selectedIndex - 1 + menuCount) % menuCount;
      this.audio.playCursor();
    } else if (this.input.isJustPressed('ArrowDown') || this.input.isJustPressed('KeyS')) {
      this.titleIdleTimer = 0;
      this.titleMenu.selectedIndex = (this.titleMenu.selectedIndex + 1) % menuCount;
      this.audio.playCursor();
    }

    if (this.input.isJustPressed('KeyZ') || this.input.isJustPressed('Enter') || this.input.isJustPressed('Space')) {
      this.audio.unlockAudio();
      this.titleIdleTimer = 0;
      if (this.titleMenu.selectedIndex === 1 && this.titleMenu.hasSave) {
        this.loadSavedGame();
      } else if (this.titleMenu.selectedIndex === 2) {
        this.state = 'OPENING';
        this.opening.start();
      } else if (this.titleMenu.selectedIndex === 3) {
        this.startEnding();
      } else {
        this.startNewGame();
      }
    }
  }

  updateTransition() {
    this.transitionTimer++;
    if (this.transitionTimer >= this.transitionDuration) {
      this.state = 'BATTLE';
      if (this.pendingBattle) {
        this.battle.startBattle(this.pendingBattle.enemies, this.pendingBattle.isBoss);
        this.pendingBattle = null;
      }
    }
  }

  startAreaBattle(areaType) {
    this.audio.playEncounter();
    this.state = 'TRANSITION';
    this.transitionTimer = 0;

    const encounters = GAME_DATA.encounters[areaType] || GAME_DATA.encounters.plains;
    const roll = Math.random() * 100;
    let sum = 0;
    let chosen = encounters[0];
    for (const enc of encounters) {
      sum += enc.weight;
      if (roll <= sum) {
        chosen = enc;
        break;
      }
    }

    this.pendingBattle = {
      enemies: chosen.enemies,
      isBoss: false
    };
  }

  startSpecificBossBattle(enemyIds) {
    this.audio.playEncounter();
    this.state = 'TRANSITION';
    this.transitionTimer = 0;
    this.pendingBattle = {
      enemies: enemyIds,
      isBoss: true
    };
  }

  endBattle(wasFled) {
    if (this.map.bossDefeated.shin_youko) {
      this.startEnding();
      return;
    }

    this.state = 'MAP';
    this.audio.playBgm('village');
  }

  reviveAtShrine() {
    // R-1: 全滅後のHP/MP全快と現在章の拠点祠への安全復帰
    GAME_DATA.party.forEach(p => {
      p.hp = p.maxHp;
      p.mp = p.maxMp;
    });

    const chapter = this.map.currentChapter || 1;
    this.map.loadChapterMap(chapter);

    if (chapter === 2) {
      this.map.player.gridX = 25;
      this.map.player.gridY = 12;
    } else if (chapter === 3) {
      this.map.player.gridX = 20;
      this.map.player.gridY = 12;
    } else {
      this.map.player.gridX = 36;
      this.map.player.gridY = 8;
    }

    this.map.player.x = this.map.player.gridX * this.map.tileSize;
    this.map.player.y = this.map.player.gridY * this.map.tileSize;
    this.map.player.targetX = this.map.player.x;
    this.map.player.targetY = this.map.player.y;
    this.map.player.facing = 'down';
    this.map.player.isMoving = false;

    this.state = 'MAP';
    this.audio.playBgm('village');
    this.audio.playHeal();
    this.map.startDialog('千歳杉の神気の奇跡', [
      '千歳杉の神気が、倒れたそなたらを拠点の祠へと導いた……。\n【 パーティ全員のHPとMPが全快した！ 】'
    ]);
  }

  render() {
    this.ctx.clearRect(0, 0, 1280, 960);

    if (this.state === 'OPENING') {
      this.opening.render(this.ctx);
    } else if (this.state === 'ENDING') {
      this.ending.render(this.ctx);
    } else if (this.state === 'TITLE') {
      this.renderTitle();
    } else if (this.state === 'MAP') {
      this.map.render(this.ctx);
    } else if (this.state === 'TRANSITION') {
      this.map.render(this.ctx);
      this.renderTransition();
    } else if (this.state === 'BATTLE') {
      this.battle.render(this.ctx);
    }
  }

  renderTitle() {
    const ctx = this.ctx;
    const font = this.graphics.fontFamily;
    this.graphics.drawBattleBackground(ctx, 1280, 960);

    ctx.fillStyle = '#ffb7c5';
    this.petals.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      ctx.restore();
    });

    const samurai = this.graphics.sprites['samurai_battle_idle'];
    const miko = this.graphics.sprites['miko_battle_idle'];
    const ninja = this.graphics.sprites['ninja_battle_idle'];
    if (samurai) ctx.drawImage(samurai, 360, 420);
    if (miko) ctx.drawImage(miko, 560, 420);
    if (ninja) ctx.drawImage(ninja, 760, 420);

    this.graphics.drawUrushiFrame(ctx, 140, 40, 1000, 240);
    this.graphics.drawCrispText(ctx, '妖  幻  奇  譚', 420, 144, `bold 72px ${font}`, '#ffeed0', '#3b0d11', 6);
    this.graphics.drawCrispText(ctx, '〜 もののけ草子 〜 【全三章完結 ハイレゾHD-2D】', 300, 224, `bold 36px ${font}`, '#f09199', '#000', 4);

    this.graphics.drawUrushiFrame(ctx, 300, 580, 680, 340);

    const items = ['は じ め か ら', 'つ づ き か ら', '序 幕（オープニング）', '終 幕（エンディング）'];
    items.forEach((item, idx) => {
      const iy = 648 + idx * 72;
      const isSel = this.titleMenu.selectedIndex === idx;
      if (idx === 1 && !this.titleMenu.hasSave) {
        this.graphics.drawCrispText(ctx, '  つ づ き か ら (無)', 360, iy, `bold 36px ${font}`, '#888', '#111', 4);
      } else {
        const col = isSel ? '#ffd666' : '#eee';
        this.graphics.drawCrispText(ctx, (isSel ? '▶ ' : '  ') + item, 360, iy, `bold 36px ${font}`, col, '#16101c', 4);
      }
    });
  }

  renderTransition() {
    const ctx = this.ctx;
    const t = this.transitionTimer;
    if (t % 4 < 2) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(0, 0, 1280, 960);
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      for (let y = 0; y < 960; y += 48) {
        ctx.fillRect(0, y, 1280, 24);
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const launch = () => {
    const game = new Game();
    window.game = game;
    game.start();
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(launch).catch(launch);
  } else {
    launch();
  }
});
