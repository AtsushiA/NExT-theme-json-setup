# NExT theme.json Setup — 実装ガイド

## プラグイン概要

有効化されているテーマの `theme.json` を WordPress 管理画面から GUI で閲覧・編集・保存できるプラグイン。
テーマファイルは**書き換えない**。オーバーライド設定を DB に保存し、フィルターフックで適用する。

- **プラグイン名**: NExT theme.json Setup
- **スラッグ / テキストドメイン**: `next-theme-json-setup`
- **必要 WP バージョン**: 6.6+（theme.json v3）

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
| 2026-06-22 | テスト・リリース環境整備（wp-plugin-dev スキル）。composer/npm/wp-env/phpcs/phpunit（Unit 3・Integration 12）/Playwright e2e（3）/husky pre-commit/GitHub Actions CI・Release を追加。phpcs は日本語コメント前提で体裁系 4 sniff を除外。wp-env は file mapping を外し、tests 環境は lifecycleScripts.afterStart で自動有効化。CI 修正: composer platform を PHP 8.0 固定、Plugin Check に slug 指定＋plugin_repo 除外、MySQL に DB 作成させ Unit/Integration を分離実行。v0.1.0 リリース。 |
| 2026-06-22 | theme.json v3 対応の差分更新（v0.2.0）。SPEC.md を非破壊オーバーライド方式＋v3 に全面改訂。admin.js のトグルを 35→45 に拡充（background、color.heading/button/caption、dimensions.aspectRatio/defaultAspectRatios、spacing.defaultSpacingSizes、typography.textAlign/defaultFontSizes）。v3 のフル機能に合わせ最低 WP を 6.6 に引き上げ（ヘッダー/phpcs/README/CLAUDE）。 |
| 2026-08-07 | WordPress 7.1 の theme.json 変更点を調査（Make WordPress Core 公式記事・Gutenberg trunk スキーマで裏取り）し、追加プロパティに対応（v0.3.0）。admin.js のトグルを 45→48 に拡充: `settings.background.gradient`、`settings.dimensions.minWidth`、新カテゴリ「ブロックの表示/非表示」の `settings.blockVisibility.allowEditing`。`settings.viewport`（オブジェクト型）・`styles.typography.textShadow`・`styles.dimensions.minWidth`・ブロック別 `@tablet`/`@mobile`・`core/navigation-link` の疑似クラス拡張は非ブール／styles 配下のため既存の Raw JSON 編集モードでの対応に留め、SPEC.md に追記。最低 WP バージョンは 6.6 のまま据え置き（新設定は未対応環境でも保存のみ可能・無害）。 |
| 2026-08-09 | Gutenberg PR #79104（`settings.viewport.mobile` / `tablet` のブレークポイント幅指定）に対応した専用 UI を追加（v0.4.0、ブランチ `feature/viewport-breakpoint-settings`）。新カテゴリ「ビューポート」を追加し、有効化トグル＋幅入力を実装。幅入力は px/em/rem の単位切り替えが必要なため、独自実装ではなく WordPress コアの `UnitControl`（`wp-components`）をそのまま採用: `wp-element` / `wp-components` をスクリプト依存に追加し、`wp.element.createElement` で `admin.js`（ビルド工程なし）から直接マウント。コアコンポーネント未読み込み時はテキスト入力にフォールバック。単位はバックエンドの検証パターン（`^(?:\d+|\d*\.\d+)(?:px\|em\|rem)$`）と合わせ px/em/rem のみに制限。SPEC.md に反映、e2e テストを 1 件追加。 |
| 2026-08-09 | WordPress 標準の翻訳ファイルに準拠した多言語対応を追加（v0.5.0、ブランチ `feature/i18n-support`）。PHP: rest-api.php の未ラップだった 5 文字列を `__()`/`sprintf()` で修正。JS: `admin.js` の全文字列（カテゴリ/設定ラベル・説明など約 120 件）を `wp.i18n.__()`/`sprintf()` でラップし、`wp-i18n` をスクリプト依存に追加、`wp_set_script_translations()` を登録。`languages/` に `.pot`（147 msgid）と英語翻訳一式（`.po`/`.mo`/JS 翻訳 JSON）を同梱。**重要な発見**: `wp i18n make-json` は本プラグインの構成（`wp_set_script_translations()` に明示 `$path` あり）では不正なファイル名（md5 ハッシュベース）を生成するバグがあり、WordPress コアが実際に探すのは `{domain}-{locale}-{スクリプトハンドル}.json` 形式のため手動リネームが必要（SPEC.md に手順を明記）。テスト環境の課題: PHPUnit Integration テストはプラグインを muplugins_loaded で直接 require するため `WP_Textdomain_registry` が Domain Path を認識できず JIT 自動読み込みが機能しない → `load_textdomain()` を明示的に呼んで翻訳内容を検証する方式に変更（実サイトでの JIT 動作は wp eval・e2e で別途確認）。wp-env の開発/テスト環境はソース言語（日本語）に合わせ `ja` に固定（既存 e2e テストの日本語表示前提を維持）、英語表示の確認は wp-cli 経由でサイト言語を一時切り替えする専用 e2e テストを追加（ブラウザ UI 経由のフォーム操作は不安定だったため `child_process` 経由の wp-cli 呼び出しに変更）。README.md / README.en.md / SPEC.md に翻訳ファイルの構成・新規言語の追加手順を記載。 |
