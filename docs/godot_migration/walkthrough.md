# 『妖幻奇譚 〜もののけ草子〜』Godot 4 完全移行完了報告書

## 1. 概要
Web版（Canvas 2D / ES Modules）で完成・受入合格した和風レトロRPG『妖幻奇譚 〜もののけ草子〜』の全資産・仕様・計算式を継承し、**Godot Engine 4（4.7.2）向けネイティブゲームプロジェクト**への完全移行・再構築を完了しました。

既存のWeb版コード（`index.html`, `js/`, `src/`）には一切手を加えず、プロジェクトルート直下に独立した `godot/` プロジェクトとして構築しています。

---

## 2. 移行資産・成果物一覧

### (1) 高精細ドット絵アート（全166枚完全抽出・配置）
Web版の動的プロシージャル描画エンジンから、全資産を劣化なしの 32bpp PNG として抽出・配置完了。
- **キャラ・魔物スプライト (112枚)**: `godot/assets/sprites/`
  - 主人公3名（疾風・小夜・朧）の歩行4方向（2コマアニメーション計24枚）
  - 主人公3名の戦闘モーション（待機・攻撃・詠唱・被弾 計12枚）
  - 第一章〜第三章の一般魔物 50種
  - ボス魔物 9体（赤鬼・大天狗・妖狐・雪女氷華・蛟・酒呑童子・茨木童子・無想影・真九尾）
  - NPC 17名（安倍晴明、芦屋道満、琵琶法師、鍛冶屋、巫女見習い、村娘お花 他）
  - 統合スプライトシート（`yougen_sprites.png` / `yougen_sprites.json`）
- **マップタイル (25種)**: `godot/assets/tiles/`
  - 草地、土、竹林、松、岩、深水、水、鳥居（笠木/柱）、社殿（屋根/柱/賽銭箱）、石畳、雪、氷、沼地、畳、壁、闇の柱 他
- **顔ポートレート (29種)**: `godot/assets/portraits/`
  - 主人公3名、ボス9体、主要NPC17名 全員の対話用ポートレート

### (2) 和風シンセ・オーディオ（全14音源レンダリング完了）
Web Audioシンセサイザーの波形生成パラメータを厳密再現し、44.1kHz 16-bit PCM WAVとして出力。
- **BGM (4曲)**: `godot/assets/audio/bgm/`
  - `bgm_opening.wav`: 四幕シネマティック曲（尺八・琴・和太鼓の重厚な旋律）
  - `bgm_village.wav`: 神楽の里・拠点マップ曲（平調子・篠笛の風雅な調べ）
  - `bgm_battle.wav`: 戦闘曲（緊迫のアップテンポ和風バトル）
  - `bgm_title.wav`: タイトル画面曲（静寂と哀愁の調べ）
- **SE (10種)**: `godot/assets/audio/se/`
  - 決定、取消、カーソル移動、打撃、斬撃、術発動、回復、魔物消滅、エンカウント、勝利ジングル

### (3) 不変マスターデータ
- `godot/assets/data/master_data.json` (53.5KB)
  - 主人公3名、技17種、敵59種、NPC17名、全3章（72x48グリッドマップ配置・出現テーブル）を完全移植。

---

## 3. レトロドット絵風・ピクセルパーフェクト維持設定
Godot 4 のレンダリング設定により、Web版のドット絵風合いを完全維持：
- **画面解像度**: 1280x960（王道レトロ 4:3比率）
- **ストレッチモード**: `canvas_items` / `keep`（アスペクト比固定、余白自動レターボックス）
- **テクスチャフィルタ**: `default_texture_filter = 0 (Nearest)`（バイリニア滲みゼロ・ドット輪郭シャープ維持）
- **スナップ設定**: `snap_2d_transforms_to_pixel = true`, `snap_2d_vertices_to_pixel = true`（歩行移動時のドットズレ・歪み防止）

---

## 4. プログラム・シーン構成 (GDScript)

### コア・Autoload（シングルトン）
1. `MasterData` (`godot/scripts/data/master_data.gd`): マスターデータ読込・高速インデックス検索
2. `GameState` (`godot/scripts/data/game_state.gd`): パーティ状態、所持金、章、ボス撃破フラグ、三神具、プレイヤー座標
3. `SaveManager` (`godot/scripts/data/save_manager.gd`): `user://savegame.json` のセーブ/ロード/概要取得
4. `AudioManager` (`godot/scripts/audio/audio_manager.gd`): BGMループ再生、SE8並列プール再生
5. `SceneManager` (`godot/scripts/core/scene_manager.gd`): 画面暗転フェード遷移、戦闘呼び出し

### UI・共通コンポーネント
- `UrushiFrame` (`godot/scripts/ui/urushi_frame.gd`): 和風漆枠カスタム描画（金縁 #d4af37、漆黒紫グラデーション、木札タイトル銘板）
- `UIStack` (`godot/scripts/ui/ui_stack.gd`): スタック型UI管理（Esc/Xキーでの一貫した戻る・閉じる制御）
- `DialogBox` (`godot/scripts/ui/dialog_box.gd`): 顔ポートレート29種表示、和風タイプライター文字送り
- `ItemWindow` (`godot/scripts/ui/item_window.gd`): 道具一覧・使用（マップ・戦闘共用）
- `MenuWindow` (`godot/scripts/ui/menu_window.gd`): 絵巻物手鑑メニュー（つよさ、道具、章移動、記録、所持金表示）
- `StatusWindow` (`godot/scripts/ui/status_window.gd`): 主人公能力画面（パラメータ、習得技一覧、ページ切替）

### ゲームシーン
- `OpeningScene` (`godot/scenes/opening/opening_scene.tscn`): 四幕シネマティック（桜吹雪、スキップ対応）
- `TitleScene` (`godot/scenes/title/title_scene.tscn`): はじめから、つづきから、回想
- `MapScene` (`godot/scenes/map/map_scene.tscn`): 全3章（72x48グリッド、隊列歩行、NPC対話、章移動、賽銭箱回復、エンカウント）
- `BattleScene` (`godot/scenes/battle/battle_scene.tscn`): 新王道JRPGレイアウト（敵上部、味方下部横並びステータスカード、コマンド選択、確定計算式、敵AI重み付き抽選、全滅復帰）
- `EndingScene` (`godot/scenes/ending/ending_scene.tscn`): 大団円エピローグ、スタッフロール

---

## 5. 実機検証・受入テスト結果（Godot 4.7.2 実機実行）

Godot 4.7.2 headless エンジンによる全自動受入テストスイート（`godot/tests/test_scene.tscn`）を実行し、全テスト項目で **100% 合格** を確認しました。

```
========================================
 【 妖幻奇譚 〜もののけ草子〜 】
 Godot 4 統合テストスイート（受入全7項目 ＆ 基盤）
========================================

--- [M1: 基盤＆設定テスト] ---
  [PASS] 画面解像度 1280x960 設定
  [PASS] Nearestテクスチャフィルタ設定 (default_texture_filter == 0)

--- [M2: データ層テスト] ---
  [PASS] 主人公3名 (疾風・小夜・朧)
  [PASS] 技17種データ格納
  [PASS] 敵50種＋ボス9体 (計59種)
  [PASS] NPC 17名
  [PASS] 全3章定義

--- [M3: アセットファイル整合性テスト] ---
  [PASS] 個別キャラ・魔物スプライト 112枚存在 (実測: 112)
  [PASS] マップタイル 25枚存在 (実測: 25)
  [PASS] 顔ポートレート 29枚存在 (実測: 29)
  [PASS] 高精細ドット絵 166枚完全抽出確認

========================================
【 受入テスト全7項目 】
========================================
  [PASS] [受入1] 敵HP=0でVICTORYフェーズへ遷移
  [PASS] [受入1] 戦闘終了後に疾風のEXPがStateへ反映 (EXP: 24)
  [PASS] [受入2] 味方全員HP=0でDEFEATフェーズへ遷移
  [PASS] [受入2] 敗北復帰後に全員のHP・MPが全快している
  [PASS] [受入3] reset() で所持金が0に戻る
  [PASS] [受入3] reset() で第一章に戻る
  [PASS] [受入3] reset() で疾風がLv1に戻る
  [PASS] [受入3] reset() で全ボス未撃破に戻る
  [PASS] [受入4] SaveManager.save_game() が成功する
  [PASS] [受入4] SaveManager.load_game() が成功する
  [PASS] [受入4] ロード後に所持金が完全一致 (3500)
  [PASS] [受入4] ロード後に章番号が完全一致 (2)
  [PASS] [受入4] ロード後にボス撃破フラグが完全一致
  [PASS] [受入4] ロード後に神具フラグが完全一致
  [PASS] [受入4] ロード後にプレイヤー座標・向きが完全一致
  [PASS] [受入5-マップ] マップ上で傷薬を使用してHPが上限まで回復 (実測: 52/52)
  [PASS] [受入5-マップ] 傷薬の所持数が1減る
  [PASS] [受入5-戦闘] 戦闘中アイテム使用で小夜のHP回復 (実測: 38/38)
  [PASS] [受入5-戦闘] 戦闘中アイテム使用で所持数が1減る
  [PASS] [受入6] 素早さ最高の朧(spd 22)が1番手
  [PASS] [受入6] 疾風(spd 15)が2番手
  [PASS] [受入6] 敵(spd 12)が3番手
  [PASS] [受入6] 小夜(spd 11)が4番手
  [PASS] [受入7] Lv1疾風の通常攻撃期待値が 24 (実測: 24)
  [PASS] [受入7] Lv1疾風の居合い一閃期待値が 42 (実測: 42)
  [PASS] [受入7] 居合い一閃が通常攻撃より圧倒的に高いダメージを出す (42 > 24)

========================================
全 37 件中: 成功 37 件 / 失敗 0 件
========================================
>> 全テスト合格 (ALL TESTS PASSED) <<
```

---

## 6. キャラクター描画不具合（白四角）改修と実機検証

### (1) 発生原因の特定
1. **Vulkan描画パイプラインとの競合**:
   旧実装では `_draw()` 内部で毎フレーム動的に `load()` を呼び出していたため、Vulkan Forward+ レンダラーにおいてテクスチャ記述子セットのバインドがフレーム提出に間に合わず、Vulkanがフォールバックとして 1x1 のダミー白テクスチャを 64x64 に引き伸ばして描画していた。
2. **マスターデータ spriteKey と個別ファイル名の差異**:
   マスターデータ上の名前（`npc_smith_genzo`, `npc_taichi`, `npc_merchant_jinbei` 等）と書き出しファイル名（`npc_smith.png`, `npc_boy.png`, `npc_merchant.png` 等）のエイリアス解決が行われておらず、一部NPCのテクスチャが null となっていた。

### (2) 改修内容
1. **Sprite2D ノードシステムへの完全移行**:
   - `map_scene.gd` において、`_ready()` 時に全キャラクタースプライトを一括プリロード。
   - パーティ3名（疾風・小夜・朧）および全NPCを個別の `Sprite2D` ノードとしてシーングラフに登録し、テクスチャを恒久バインド。
   - 楕円影（`Polygon2D`）に `show_behind_parent = true` を設定し、キャラクターの足元背面に正確に描画。
2. **後方互換エイリアスマッピングの追加**:
   - `map_scene.gd` および `dialog_box.gd` にマスターデータと個別ファイル名の相互変換テーブルを実装。全17名のNPCスプライトおよび顔ポートレートの完全描画を達成。
3. **隊列歩行アニメーションの強化**:
   - 先頭の疾風だけでなく、小夜・朧も移動時に歩行コマ送り（2コマ）が連動するように改善。

### (3) 実機キャプチャ検証
Godot 4.7.2（Forward+ レンダラー）による実機描画テストを実施し、疾風・小夜・朧の3人隊列歩行スプライト、NPC（長老、茶屋の娘、琵琶法師、村人等）が鮮明なレトロドット絵でカラー描画されていることを目視・キャプチャで完全確認済み。

---

## 7. 起動・プレイ方法

以下のいずれかの方法ですぐに本編をプレイできます。

1. **ワンクリック起動バッチ（最も簡単）**:
   - `C:\dev\japanese-retro-rpg\run_game.bat` をダブルクリックするだけでゲームが即座に起動します。

2. **コマンドラインから直接実行する場合**:
   ```powershell
   & "C:\Users\YAMAMURO\Desktop\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64_console.exe" --path "C:\dev\japanese-retro-rpg\godot"
   ```

3. **Godot エディタで開く場合**:
   - `C:\Users\YAMAMURO\Desktop\Godot_v4.7.2-stable_win64.exe\Godot_v4.7.2-stable_win64.exe` を起動
   - プロジェクトリストから「妖幻奇譚 〜もののけ草子〜」を選択して「編集」または「実行」

4. **操作方法**:
   - **移動**: 方向キー (↑ / ↓ / ← / →)
   - **決定 / 会話 / 調べる**: `Z` / `Enter` / `Space` または マウスクリック
   - **取消 / メニュー開閉**: `X` / `Esc`