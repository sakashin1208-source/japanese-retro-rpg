import { VIEW_W, VIEW_H, COLORS, FONTS } from './Constants.js';
import { InputManager } from './InputManager.js';

/**
 * ゲームエンジン・オーケストレータ
 */
export class Game {
  /**
   * @param {HTMLCanvasElement} canvas 
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.frame = 0;
    this.fps = 60;
    this.lastTime = performance.now();
    this.fpsTimer = performance.now();
    this.fpsCounter = 0;

    this.scenes = {};
    this.currentScene = null;

    // 入力管理（Web Audio アンロック連携）
    this.input = new InputManager(canvas, () => {
      this.audio?.unlock?.();
    });

    this.isRunning = false;
  }

  /**
   * シーンを登録
   * @param {string} name 
   * @param {import('./Scene.js').Scene} scene 
   */
  registerScene(name, scene) {
    this.scenes[name] = scene;
  }

  /**
   * シーンを切り替え
   * @param {string} name 
   * @param {Object} params 
   */
  changeScene(name, params = {}) {
    if (this.currentScene) {
      this.currentScene.exit();
    }
    const nextScene = this.scenes[name];
    if (!nextScene) {
      console.error(`Scene '${name}' not found.`);
      return;
    }
    this.currentScene = nextScene;
    this.currentScene.enter(params);
  }

  /**
   * ゲームループ開始（フォント読み込み待ち）
   */
  async start(initialSceneName = null) {
    // Webフォント読み込み待ち（SPEC §12 B-13）
    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
    } catch (e) {
      console.warn('Font loading error:', e);
    }

    if (initialSceneName && this.scenes[initialSceneName]) {
      this.changeScene(initialSceneName);
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._loop(t));
  }

  _loop(currentTime) {
    if (!this.isRunning) return;

    this.frame++;
    this.fpsCounter++;
    if (currentTime - this.fpsTimer >= 1000) {
      this.fps = this.fpsCounter;
      this.fpsCounter = 0;
      this.fpsTimer = currentTime;
    }

    // タップの消費と配送
    const taps = this.input.consumeTaps();
    if (this.currentScene) {
      for (const tap of taps) {
        this.currentScene.handleTap(tap.x, tap.y);
      }
      this.currentScene.update(this.input, this.frame);
    }

    // 描画
    this.ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    if (this.currentScene) {
      this.currentScene.render(this.ctx, this.frame);
    }

    // 入力フレーム終了処理
    this.input.endFrame();

    requestAnimationFrame((t) => this._loop(t));
  }

  stop() {
    this.isRunning = false;
  }
}
