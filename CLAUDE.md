# NExT theme.json Setup — 実装ガイド

## プラグイン概要

有効化されているテーマの `theme.json` を WordPress 管理画面から GUI で閲覧・編集・保存できるプラグイン。
テーマファイルは**書き換えない**。オーバーライド設定を DB に保存し、フィルターフックで適用する。

- **プラグイン名**: NExT theme.json Setup
- **スラッグ / テキストドメイン**: `next-theme-json-setup`
- **必要 WP バージョン**: 6.5+

## ディレクトリ構成

```
NExT-theme-json-setup/
├── next-theme-json-setup.php                    # メインプラグインファイル
├── includes/
│   ├── class-next-theme-json-override.php       # wp_theme_json_data_user フィルター + DB 読み書き
│   ├── class-next-theme-json-rest-api.php       # REST API エンドポイント
│   └── class-next-theme-json-admin-page.php    # 管理画面ページ登録・描画
├── assets/
│   ├── js/
│   │   └── admin.js                             # 管理画面フロントエンド（vanilla JS）
│   └── css/
│       └── admin.css                            # 管理画面スタイル
├── SPEC.md
└── CLAUDE.md
```

## 実装方針

### theme.json のオーバーライド方式

テーマの `theme.json` は**読み取り専用**（絶対に書き換えない）。

```
theme.json カスケード（低 → 高）
default < blocks < theme < user ← プラグインはここに注入
```

- プラグインの設定は `wp_options`（キー: `next_theme_json_setup_overrides`）に JSON 文字列で保存
- `wp_theme_json_data_user` フィルターで実行時にマージ → テーマ設定をオーバーライド
- `WP_Theme_JSON_Data::update_with()` を使用

### REST API

- ベースルート: `/wp-json/next-theme-json/v1/`
- `GET  /theme-json`       — テーマの theme.json を読み取り（参照用・読み取り専用）
- `GET  /override`         — プラグインのオーバーライド設定を取得
- `POST /override`         — プラグインのオーバーライド設定を保存（wp_options に書き込み）
- `POST /override/reset`   — オーバーライド設定を削除（wp_options から削除）
- 権限チェック: `current_user_can('edit_theme_options')`
- nonce: `wp_rest`（`wp_create_nonce('wp_rest')`）

### 管理画面

- メニュー位置: 外観（`appearance`）サブメニュー
- ページスラッグ: `next-theme-json-setup`
- タブ①「オーバーライド設定」: 編集可能な JSON エディター
- タブ②「テーマの theme.json（参照）」: 読み取り専用表示

### コーディング規約

- WordPress Coding Standards (WPCS) 準拠
- ファイル名: `class-{クラス名のハイフン化}.php`（例: `Next_Theme_Json_Rest_Api` → `class-next-theme-json-rest-api.php`）
- 配列は `array()` 記法（短縮記法 `[]` は使わない）
- すべてのクラス・メソッドに docblock を付ける
- インラインコメントは `.` `!` `?` で終わる

## 実装ログ

| 日付 | 内容 |
|---|---|
| 2026-03-25 | CLAUDE.md 作成、実装開始 |
| 2026-03-25 | 全ファイル初期実装完了（v0.1.0） |
| 2026-03-25 | テーマファイル非破壊方式に変更。wp_theme_json_data_user フィルター + wp_options 保存に移行。WPCS 違反修正・ファイルリネーム対応 |
| 2026-03-25 | トグルスイッチ UI 実装。theme.json v3 のブール設定 32 項目をカテゴリ別に列挙。OnyX 風サイドバー＋設定行デザイン。 |
| 2026-03-25 | セキュリティ・実装レビュー対応。uninstall.php 追加、フルパス漏洩修正、ペイロードサイズ制限・アローリスト追加、is_admin() ガード追加。 |
| 2026-06-22 | テスト・リリース環境整備（wp-plugin-dev スキル）。composer/npm/wp-env/phpcs/phpunit（Unit 3・Integration 12）/Playwright e2e（3）/husky pre-commit/GitHub Actions CI・Release を追加。phpcs は日本語コメント前提で体裁系 4 sniff を除外。wp-env は file mapping を外し、tests 環境は lifecycleScripts.afterStart で自動有効化。 |
