# 【レビュー依頼書】和風レトロRPG『妖幻奇譚 〜もののけ草子〜』

**依頼者**: しんちゃん（オーナー）  
**作成者**: Antigravity（開発チーム）  
**レビュー担当**: Claude Code  
**作成日**: 2026年8月25日  
**プロジェクト配置先**: `C:\dev\japanese-retro-rpg\`

---

## 1. プロジェクト概要

『妖幻奇譚 〜もののけ草子〜』は、スーパーファミコン（SFC）黄金期の和風ファンタジーRPGのプレイフィールを、最新のWeb標準技術（HTML5 Canvas / Vanilla JavaScript / Web Audio API）を用いて現代に蘇らせた、**ブラウザ完結型・ハイレゾHD-2DサイドビューRPG**です。

### 🎮 基本情報
- **ジャンル**: 和風伝奇サイドビューコマンドバトルRPG（全三章完結）
- **対象デバイス**: スマホブラウザ（iOS Safari / Android Chrome）完全対応 ＋ PCブラウザ
- **描画解像度**: 1280×960（フルHD級ハイレゾHD-2D、64pxタイル / 128pxキャラ / 192pxボス）
- **フォント**: Google Fonts（`Noto Sans JP` / `Zen Kaku Gothic New`）＋ 黒輪郭フチ取り描画
- **音響**: Web Audio API による和風都節音階シンセサイズ（外部音声ファイル依存ゼロ）
- **依存ライブラリ**: なし（Vanilla JS 100%、ビルド不要で `index.html` 即実行可能）

---

## 2. ファイル構成とアーキテクチャ

```
C:\dev\japanese-retro-rpg\
├── index.html                   # エントリーポイント (1280x960 Canvas + レスポンシブ筐体)
├── css/
│   └── style.css                # 筐体UI・十字キー/ボタン・レスポンシブスタイル
├── js/
│   ├── data.js                  # パーティ3名・魔物50種・ボス9体・NPC17名・技・遭遇テーブル
│   ├── graphics.js              # 1280x960 ハイレゾHD-2D描画・文字フチ取り・エフェクト・背景
│   ├── map.js                   # 全3章マップ探索・NPC会話・神鏡セーブ・カメラ・章間移動
│   ├── battle.js                # サイドビューバトル・ターン制コマンド・ダメージ計算・技演出
│   ├── audio.js                 # Web Audio和風シンセ音源 (BGM 4種 / SE 12種)
│   ├── opening.js               # シネマティックOP演出 (四幕構成・月蝕・茜覚醒)
│   ├── ending.js                # 大団円ED演出 (スタッフロール・朝焼けの里)
│   ├── save.js                  # LocalStorage 永続セーブ・ロードマネージャー
│   └── main.js                  # 入力判定 (タッチ/D-Pad/キーボード)・メインゲームループ
├── assets/                      # 公式キービジュアル群 (全6作品 / 16:9高精細)
│   ├── key_visual_party3.jpg    # 【主要キャラ】英傑三人衆（疾風・小夜・朧）
│   ├── key_visual_monsters_hyakki.jpg # 【敵魔物】百鬼夜行絵巻（50種妖怪集結）
│   ├── key_visual_bosses.jpg    # 【ボス軍団】妖魔将集結（酒呑童子・茨木童子・大天狗等）
│   ├── key_visual_akane_nine_tails.jpg # 【ラストボス】真・九尾の天狐・茜（神格覚醒）
│   ├── key_visual_grand_finale.jpg # 【完結記念】大団円キービジュアル
│   └── ...
└── docs/japanese_retro_rpg/     # 各章ストーリー・実装計画・設計ドキュメント
```

---

## 3. レビュー依頼の観点（重点確認項目）

Claude Code様には、以下の観点を中心にコードと設計の総合レビューをお願いいたします。

### ① コード品質・可読性・堅牢性
- Vanilla JSとしてのモジュール分割・クラス設計（データとロジックの分離）が適切か。
- `try-catch` や例外処理、`undefined` 参照ガード、エッジケースの安全性が確保されているか。
- 変数名・定数名・メソッド命名規則の統一性と可読性。

### ② パフォーマンス・描画効率
- `requestAnimationFrame` ゲームループにおけるメモリリークや無駄なオブジェクト生成がないか。
- Canvas 2D Context におけるスプライトキャッシュ（オフスクリーンキャンバス）の利用効率。
- スマホ低スペック端末での 60fps 維持可能性。

### ③ スマホ操作性・Web Audioの互換性
- iOS Safari / Android Chrome におけるマルチタッチ・ジェスチャー競合防止対策。
- 画面直接タップ・下部D-Pad・アクションボタンのレスポンスとヒット判定領域の適切さ。
- ユーザー操作（初回収話/タップ）を起点とした Web Audio API の自動アンロックと音量制御の堅牢性。

### ④ ゲームデザイン・戦闘バランス・拡張性
- パーティ3名（侍/物理・巫女/回復術・忍び/速度搦手）の役割分担とスキル設計の完成度。
- レベルアップ曲線・消費MP・ダメージ計算式・敵ボスの行動AIのゲーム的面白さと手応え。
- 今後「第四章」や「追加ボス」「装備アイテム」を追加する際のデータ拡張性。

---

## 4. 動作確認・テスト方法

### ローカルでの起動
1. `C:\dev\japanese-retro-rpg\` をエクスプローラー等で開く。
2. `index.html` を任意のブラウザ（Chrome / Edge / Safari）で直接開く。（Webサーバー不要、ローカルファイルから即実行可能）

### 自動テスト（整合性検証）の実行
プロジェクト内に配置された検証スクリプトを実行して、全データとスプライトの整合性を確認できます。
```bash
node "C:\Users\YAMAMURO\.gemini\antigravity\brain\b88e5c81-d17e-4520-ac5a-7f6af4b87592\scratch\verify.js"
```

---

## 5. Claude Code へのプロンプト例（コピペ用）

Claude Codeにレビューを依頼する際は、以下のプロンプトをそのままご使用いただけます。

```markdown
以下の和風レトロRPGプロジェクト『妖幻奇譚 〜もののけ草子〜』のコードレビューと設計評価をお願いします。

【対象ディレクトリ】: `C:\dev\japanese-retro-rpg\`
【レビュー対象ファイル】:
- `index.html`
- `css/style.css`
- `js/data.js`
- `js/graphics.js`
- `js/map.js`
- `js/battle.js`
- `js/audio.js`
- `js/opening.js`
- `js/ending.js`
- `js/save.js`
- `js/main.js`

【レビュー観点】:
1. コード品質・設計（Vanilla JS / クラス設計 / 例外安全性）
2. パフォーマンス・メモリ管理（1280x960 Canvas 2D / 60fps維持）
3. スマホ操作性・Web Audio互換性（iOS Safari / Android Chrome）
4. ゲームバランス・戦闘システム・拡張性
5. 今後の改善提案・リファクタリング推奨点

詳細なレビューレポートと、改善すべき具体的なコード例があれば提示してください。
```
