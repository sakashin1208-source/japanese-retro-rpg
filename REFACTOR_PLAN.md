# 『妖幻奇譚 〜もののけ草子〜』Godot版 改修設計案（改訂第2版）

## 1. 改修の目的
Claude Code から受領した詳細コードレビュー（フォント収録実測検証、キー名・固有名詞の誤り、SPEC逸脱・考慮漏れ8件）を全面的に反映し、安全かつ高品質な実装を行うための確定改修設計です。

---

## 2. 改修項目一覧

| No | 重要度 | 項目 | 対象ファイル | 概要 |
| :--- | :---: | :--- | :--- | :--- |
| **①** | **重大** | 技乱数±3・個別ロール・敵威力反映 | `battle_scene.gd` | 技の乱数ブレをSPEC準拠の±3へ修正、全体攻撃の対象別ロール、敵技power乗算 |
| **②** | **重大** | Themeリソース化（.tres）＆ 黒フチ取り | `assets/ui/main_theme.tres`, `project.godot` | DotGothic16設定、フォントサイズ、SPEC必須の黒アウトラインを一括グローバル適用 |
| **③** | **重大** | 章移動のキー名（id/start）修正 ＆ 動的参照 | `menu_window.gd`, `map_scene.gd` | `id` と `start` を正しく参照し実行時エラー防止、章名・ボス名を動的取得 |
| **④** | **中** | 移動用独自アクション新設（WASD・パッド） | `project.godot`, `map_scene.gd` | `ui_*` を汚染せず `move_*` を新設して移動処理を分離、UI操作と完全独立化 |
| **⑤** | **中** | 描画ノード差分更新の網羅（メモリ・警告対策） | `battle_scene.gd` | スプライト・カードに加え、コマンド・技リストの不要な再生成を抑制 |
| **⑥** | **検証** | 統合テストスイート拡張（全66件化） | `tests/test_runner.gd` | 威力、フォント、章移動に加え、「ui_accept混在ゼロ」の静的検査を追加 |

---

## 3. 各改修項目の詳細設計

### ①【重大】ダメージ計算式の完全SPEC準拠化（乱数・個別ロール・power乗算）
- **背景・課題**:
  - 敵行動の `power` 乗算・係数1.2は適用済みだが、SPEC §6.2では**技のみ乱数±3**、通常攻撃と敵行動が±2。現状は技も±2になっていた。
  - 全体攻撃（`shinku_ha` 等）の乱数がループ外で1度しか振られておらず、全対象に同一値が乗っていた。
- **改修設計**:
  1. 通常攻撃・敵行動: `randi_range(-2, 2)`
  2. 技攻撃（物理・魔法）: `randi_range(-3, 3)`
  3. 全体技のループ内個別ロール:
     ```gdscript
     for e in living:
         var variance: int = randi_range(-3, 3) # ループ内で対象ごとに個別ロール
         var dmg: int = 1
         if skill.get("type") == "physical":
             dmg = max(1, int(hero["atk"] * hero["buffAtk"] * 1.4 * skill["power"] - e["def"] * e["buffDef"] * 0.5 + variance))
         else:
             dmg = max(1, int(hero["matk"] * 1.8 * skill["power"] - e["def"] * e["buffDef"] * 0.4 + variance))
         e["hp"] = max(0, e["hp"] - dmg)
     ```

---

### ②【重大】Themeリソース化（.tres）による黒フチ取り ＆ フォント一括適用
- **背景・課題**:
  - `DotGothic16-Regular.ttf` が 1,212文字全網羅していることは実測検証済み。
  - SPEC §10.2 で「全テキストは黒フチ取り必須」と規定されているが未対応だった。
  - `project.godot` の `theme/custom_font_size` は無効な設定。
- **改修設計**:
  1. `godot/assets/ui/main_theme.tres` を新規作成：
     - フォント: `res://assets/fonts/DotGothic16-Regular.ttf`
     - 既定フォントサイズ: `28`
     - `Label/constants/outline_size`: `4` (黒フチ取り)
     - `Label/colors/font_outline_color`: `Color(0, 0, 0, 1)`
     - `RichTextLabel` 等にも同様のアウトラインスタイルを定義。
  2. `project.godot` に設定：
     ```ini
     [gui]
     theme/custom="res://assets/ui/main_theme.tres"
     ```
  3. **Nearestフィルタ据え置きの根拠**:
     本作は16x16/32x32基準の純ドット絵JRPGであり、Linearフィルタを適用すると低解像度スプライトのエッジがボケてレトロ感が損なわれるため、Nearest（`default_texture_filter=0`）を基本とする。

---

### ③【重大】章移動のキー名整合（id / start）＆ 固有名詞の動的取得
- **背景・課題**:
  - 設計案初稿の `ch["chapter"]` や `spawn` は存在しないキーであり、実行時エラーになる。正しくは `ch["id"]` および `ch["start"]`。
  - ボス名「夜叉狐」は本作に実在しない（正しくは「九尾の妖狐・茜」）。
- **改修設計**:
  1. **章データの動的走査 (`menu_window.gd`)**:
     ```gdscript
     func get_selectable_chapters() -> Array[Dictionary]:
         var list: Array[Dictionary] = []
         for ch in MasterData.chapters:
             var num: int = ch["id"] # 正しいキー
             var unlocked: bool = MasterData.is_chapter_unlocked(num, GameState.boss_defeated, GameState.artifacts)
             list.append({
                 "id": num,
                 "name": ch["name"], # 正しい章名をマスターデータから取得
                 "unlocked": unlocked
             })
         return list
     ```
  2. **未解放理由の動的生成**:
     - 対象章の解放に必要なボス名・神具名をハードコードせず、`MasterData` から動的に取得してダイアログ表示。
     - 例: 第2章未解放時 → 「『九尾の妖狐・茜』を討伐する必要があります。」
  3. **マップ側の座標復帰 (`map_scene.gd`)**:
     ```gdscript
     if SceneManager.battle_params.has("chapter_num"):
         GameState.current_chapter = SceneManager.battle_params["chapter_num"]
         var ch_info = MasterData.get_chapter_info(GameState.current_chapter)
         if ch_info and ch_info.has("start"):
             var st: Dictionary = ch_info["start"] # 正しいキー
             player_gx = st.get("x", 12)
             player_gy = st.get("y", 14)
             player_facing = st.get("facing", "down")
             GameState.player_pos = {"grid_x": player_gx, "grid_y": player_gy, "facing": player_facing}
         SceneManager.battle_params.erase("chapter_num")
     ```

---

### ④【中】移動アクションの完全分離（`move_*` 新設）
- **背景・課題**:
  - `ui_*` に WASD を割り当てると、Godot 組み込みの Control フォーカス移動と競合・汚染する。
- **改修設計**:
  1. `project.godot` にプレイヤー移動専用アクションを新設：
     - `move_up`: 矢印上, Wキー, D-Pad Up
     - `move_down`: 矢印下, Sキー, D-Pad Down
     - `move_left`: 矢印左, Aキー, D-Pad Left
     - `move_right`: 矢印右, Dキー, D-Pad Right
  2. `confirm`: Z, Enter, Space, JoypadButton 0 (Aボタン)
  3. `cancel`: X, Esc, JoypadButton 1 (Bボタン)
  4. `map_scene.gd` の探索移動判定は `move_*` を使用。
  5. UI操作（メニュー・ダイアログ）は `ui_*`（フォーカス/選択）および `confirm`/`cancel` を使用し、役割を完全分離。

---

### ⑤【中】戦闘描画ノード再生成の最適化（メモリ・警告対策の網羅）
- **背景・課題**:
  - スプライト・パーティカードだけでなく、`command_list` や `skill_list` も毎度全削除・再生成されており、警告の原因になり得る。
- **改修設計**:
  - スプライト・パーティカードはターンごとの差分更新（プロパティ更新）方式へ移行。
  - `command_list` / `skill_list` も、既存の子ノード数が足りていればテキスト・表示/非表示・接続シグナルの再利用を行い、ノード破棄と再生成の頻度を最小化。

---

### ⑥【検証】統合テストスイートの拡張（全66件化）
- **改修設計**:
  - `godot/tests/test_runner.gd` に以下のテストを追加：
    - **テストM4（Theme・フォント・アウトライン確認）**: Themeリソースがロードされ、フォントおよび黒アウトラインが有効であること。
    - **テスト受入11（技・通常攻撃の乱数幅 ＆ 敵威力検証）**: 通常攻撃が±2、技が±3の範囲内であること、敵技 `power` が正しく乗算されていること。
    - **テスト受入12（章移動の双方向性・キー整合性検証）**: `id` と `start` キーで第1章〜第3章のデータが取得でき、第2章から第1章への後退が可能であること。
    - **テスト受入13（静的コード検査: ui_accept混在ゼロ）**: `godot/scripts/` 配下のGDScript内で、非推奨の `ui_accept` 直書き判定が残存していないこと（`confirm` 統一の保証）。

---

## 4. 着手手順（保全と実装のロードマップ）

1. **現状保全（Gitコミット）**:
   - `godot/`、`docs/`、設計書類を一旦コミットし、クリーンな作業基準点を作成。（※ユーザー承認後に実施）
   - ルート直下のスクリーンショット（3枚）を `godot/tests/artifacts/` へ退避。
2. **Phase 1: 設定・リソース基盤**:
   - `assets/ui/main_theme.tres` の作成と `project.godot` への登録（黒フチ取り・フォント）。
   - `project.godot` の入力マップ整備（`move_*` 新設、`confirm`/`cancel` 統一）。
3. **Phase 2: ロジック・UI改修**:
   - `battle_scene.gd`: 技乱数±3、全体技個別ロール、ノード再生成最適化。
   - `menu_window.gd` / `map_scene.gd`: 章移動の双方向選択リスト化、動的章名・条件表示、`start` 座標復帰。
4. **Phase 3: 自動テスト検証**:
   - `test_runner.gd` に新テストを追加し、全66件合格を確認。