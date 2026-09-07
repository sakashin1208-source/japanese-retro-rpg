# 実装計画: 『妖幻奇譚 〜もののけ草子〜』Godot 4 への完全移行

## 🎯 概要
現在 Web ブラウザ（Canvas 2D / ES Modules）で動作している和風レトロRPG『妖幻奇譚 〜もののけ草子〜』を、**Godot Engine（Godot 4.x）プロジェクト**として完全移植・再構築します。
ユーザーからの最重要要求である**「レトロなドット絵風の維持」**を徹底し、既存の高精細ドット絵スプライト・タイル（全166枚）および確定したゲームバランス・計算式を100%継承します。

---

## 👥 ユーザー確認・判断事項 (User Review Required)

> [!IMPORTANT]
> **1. プロジェクトの配置方針（独立性の確保）**
> 既存の Web 版（`src/`, `js/`, `index.html`）は一切削除・上書きせず、プロジェクトルート直下に **`godot/`** ディレクトリを新設して Godot 4 プロジェクトを構築します。これにより、既存の Web 版が壊れるリスクはゼロであり、いつでも動作を比較検証できます。

> [!NOTE]
> **2. レトロなドット絵風の維持方針（ピクセルパーフェクト保証）**
> - **テクスチャフィルタ**: Godot 4 の Project Settings で `rendering/textures/canvas_textures/default_texture_filter = 0 (Nearest)` を設定し、バイリニア補間によるボケや滲みを完全に排除します。
> - **解像度設計**: 内部ベース解像度を `1280x960`（4:3、整数倍ピクセル設計）とし、`stretch/mode = "canvas_items"`, `stretch/aspect = "keep"` に設定して、アスペクト比 4:3 を厳密に維持します。
> - **スプライト資産の抽出**: `tools/export_sprites.html` のレンダリングロジックを用い、全166枚（タイル25種、歩行24種、戦闘キャラ12種、NPC9種、敵50種、ボス9体、ポートレート29種、漆枠等）を高解像度アルファチャンネル付き個別 PNG として `godot/assets/` 配下へ無劣化書き出しします。

> [!TIP]
> **3. 音響（BGM / SE）の移行方式**
> Web版の `AudioEngine` は Web Audio API によるオシレーター波形合成（プログラマブルシンセ）です。Godot への移植にあたっては、このWeb Audioシンセから**4曲のBGM（オープニング、村、戦闘、タイトル）および全12種のSEを無劣化WAV音声ファイルとしてレンダリング抽出**し、Godot の `AudioStreamPlayer` で再生します。これにより、Web版と全く同一のレトロチップチューン音色がそのまま鳴り響きます。

---

## 🏗️ 提案する変更とアーキテクチャ

### ディレクトリ構成案（`godot/`）

```
japanese-retro-rpg/
├── godot/                      ← 【新規】Godot 4 プロジェクトルート
│   ├── project.godot           ← プロジェクト設定（Nearestフィルタ、解像度1280x960、Autoload）
│   ├── assets/
│   │   ├── sprites/            ← キャラクター・敵魔物・ボスのスプライトPNG
│   │   ├── tiles/              ← マップタイルPNG（25種）
│   │   ├── portraits/          ← 会話用顔ポートレートPNG（29種）
│   │   ├── ui/                 ← 漆枠NinePatch、アイコン、ボタン画像
│   │   ├── fonts/              ← 和風ビットマップ/ドット絵フォント
│   │   └── audio/
│   │       ├── bgm/            ← BGM4曲（WAV/OGG）
│   │       └── se/             ← SE12種（WAV/OGG）
│   ├── scripts/
│   │   ├── core/               ← constants.gd, scene_manager.gd
│   │   ├── data/               ← master_data.gd, game_state.gd, save_manager.gd
│   │   ├── audio/              ← audio_manager.gd
│   │   └── ui/                 ← ui_stack.gd, dialog_box.gd, menu_window.gd, item_window.gd
│   ├── scenes/
│   │   ├── main/               ← main.tscn (シーン管理・フェード遷移)
│   │   ├── opening/            ← opening_scene.tscn (四幕の絵巻物演出・長押しスキップ)
│   │   ├── title/              ← title_scene.tscn (タイトル画面・桜吹雪パーティクル)
│   │   ├── map/                ← map_scene.tscn (TileMapLayer, Player, NPC, 章移動)
│   │   ├── battle/             ← battle_scene.tscn (王道JRPG戦闘, 敵AI, 13種エフェクト)
│   │   └── ending/             ← ending_scene.tscn (終幕エピローグ)
│   └── tests/
│       └── run_tests.gd        ← 7大受入テスト再現用GDScriptテストスクリプト
```

---

## 📝 実装ステップ

### ステップ 1: アセット無劣化抽出（Phase 1）
1. **全166枚スプライトの自動抽出**:
   - `tools/export_sprites.html` の描画エンジンを活用し、Headless Chrome または Node.js スクリプト経由で `godot/assets/sprites/`, `tiles/`, `portraits/` に透過PNGとして一括出力。
2. **Web Audio 音源のレンダリング**:
   - `src/audio/AudioEngine.js` の音階・エンベロープ・スケジューラから、4曲のループBGMおよび12種類のSEをWAVファイルとして自動生成・出力。

### ステップ 2: プロジェクト初期設定（Phase 2）
1. `godot/project.godot` の生成:
   - レンダリング設定: `default_texture_filter = 0 (Nearest)`（ドット絵ピクセルパーフェクト）
   - ディスプレイ設定: `width = 1280, height = 960`, `stretch/mode = "canvas_items"`, `stretch/aspect = "keep"`
   - 入力マップ（InputMap）設定: `ui_up`, `ui_down`, `ui_left`, `ui_right`, `confirm` (Z/Enter/Space), `cancel` (X/Esc)
   - Autoload設定: `MasterData`, `GameState`, `SaveManager`, `AudioManager`, `SceneManager`

### ステップ 3: データ層・基盤（Phase 3）
1. **`master_data.gd`**:
   - `src/data/MasterData.js` の主人公3名（Lv1〜30曲線）、技17種（物理ATK/魔法MATK完全準拠）、敵50種＋ボス9体（パラメータ、重み付き行動 `rate`）、アイテム、NPC、全3章データを辞書型定数として移植。
2. **`game_state.gd`**:
   - パーティ状態、所持金、フラグ（ボス撃破、三神具、訪問章）、座標を管理。`reset_to_initial()` を実装。
3. **`save_manager.gd`**:
   - `user://savegame.json` への永続化とロード。スキーマバージョン対応。
4. **`audio_manager.gd`**:
   - BGM/SE再生、音量・ミュート制御、フェードイン・アウト。

### ステップ 4: UI共通基盤（Phase 4）
1. **漆枠フレーム**: `NinePatchRect` を使用し、伝統の和風漆枠（金縁＋深紅グラデーション）を再現。
2. **`UIStack`**: 排他制御スタック。キャンセルキーで最前面のUIを即時閉じる統一動作。
3. **`DialogUI`**: 顔ポートレート（29種対応）付き和風ダイアログ、タイプライター文字送り。
4. **`ItemUI`**: マップ上・戦闘中の双方で同一コンポーネントを使用（傷薬、仙豆等）。

### ステップ 5: メインゲームシーン群（Phase 5）
1. **`OpeningScene` / `TitleScene`**:
   - 四幕の口上演出（キー長押しスキップ対応）。
   - タイトル画面（桜吹雪の `GPUParticles2D`、はじめから/つづきから）。
2. **`MapScene`**:
   - `TileMapLayer` を用いた25種タイル（地面、畳、瓦屋根、鳥居、木々等）の配置とコリジョン。
   - `CharacterBody2D` による主人公の4方向歩行アニメーションおよび隊列追従（2番手・3番手）。
   - NPC（17名）との対話・回復イベント・章移動トリガー。
   - ランダムエンカウント判定および画面切り替え演出。
3. **`BattleScene`**:
   - 前回のUI改修で確立した「新王道レイアウト」（スプライト横並びステータスカード、HPバーゲージ、行動中ハイライト）。
   - 敵の呼吸アニメーション、フローティングダメージテキスト。
   - 物理/魔法の正規計算式、バフ一貫適用、敵AIの重み付き行動（自己回復・防御・全体攻撃）。
   - エフェクト13種（斬撃、雷、炎、吹雪、回復、バフ等）。
   - 全滅時の白鷺神社安全復帰（HP/MP全快）。
4. **`EndingScene`**:
   - 茜の浄化、三神具の返還、スタッフロール。

---

## 🧪 検証計画 (Verification Plan)

### 自動テスト（GDScript）
- Web版の受入テスト（7項目）を完全に踏襲した `run_tests.gd` を作成・実行:
  1. 戦闘勝利 → Lv / HP / EXP が State へ正確に書き戻されること
  2. 戦闘敗北 → 白鷺神社へ全員HP/MP全快で安全復帰すること
  3. `reset_to_initial()` で初期状態（Lv1・所持金0・第1章）に戻ること
  4. セーブ → ロードで全状態（所持金・章・ボスフラグ・三神具・座標）が完全一致すること
  5. マップ上および戦闘中の道具使用（HP/MP回復・仙豆蘇生）が正常動作すること
  6. 行動順ソートが素早さ（SPD × バフ）で厳密に順序付けされること
  7. 物理技ダメージが通常攻撃より圧倒的に高いこと（Lv1居合い一閃42 vs 通常攻撃24）

### 視覚・プレイアビリティ検証
- **ドット絵のピクセルパーフェクト確認**: スプライト境界の滲み・ボケ・ちらつきが一切ないこと（Nearestフィルタ検証）。
- **アスペクト比（4:3）確認**: 画面リサイズ時も歪まず、レターボックス/ピラーボックスで正確に縦横比を維持すること。
- **通しプレイ確認**: 起動からオープニング、探索、戦闘、ボス撃破、章移動、エンディングまで一本道で通ることを確認。
