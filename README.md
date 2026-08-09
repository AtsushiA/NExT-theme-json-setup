# NExT theme.json Setup

[English](README.en.md) | 日本語

有効化されているテーマの `theme.json` 設定を WordPress 管理画面から GUI で管理できるプラグインです。

---

## 特徴

- **テーマファイルを書き換えない** — オーバーライド設定はデータベース（`wp_options`）に保存されます
- **48 項目のトグルスイッチ UI** — theme.json v3 のブール設定をカテゴリ別に一覧表示（WordPress 7.1 の新設定を含む）
- **ビューポート幅設定（コアコンポーネント採用）** — タブレット/モバイルのブレークポイント幅を WordPress コアの `UnitControl` で px / em / rem 指定可能（WordPress 7.1+、[Gutenberg #79104](https://github.com/WordPress/gutenberg/pull/79104)）
- **OnyX 風のサイドバーナビゲーション** — カテゴリを切り替えながら設定を確認・変更
- **カスタム / テーマデフォルトの可視化** — 変更中の項目はバッジで明示、いつでも個別にクリア可能
- **Raw JSON 編集モード** — 上級者向けに JSON を直接編集できるエディターも搭載
- **テーマ参照パネル** — テーマに内包された元の `theme.json` を読み取り専用で確認可能

---

## 動作の仕組み

WordPress の theme.json にはカスケード（優先順位）があります。

```
default < blocks < theme < user  ← このプラグインはここに注入
```

プラグインは `wp_theme_json_data_user` フィルターを使い、保存済みの設定を最高優先度で適用します。テーマの `theme.json` ファイルは一切変更しません。

---

## 設定カテゴリ

| カテゴリ | 設定項目数 | 主な設定 |
|---|---|---|
| 一般 | 2 | 外観ツール一括有効化、ルートパディング整列 |
| 背景 | 3 | 背景画像、背景サイズ・位置（WP 6.5 / 6.6+）、グラデーション背景（WP 7.1+） |
| ボーダー | 4 | カラー・角丸・スタイル・幅 |
| カラー | 12 | 背景色・カスタムカラー・グラデーション・パレット・要素別（text / link / heading / button / caption） |
| タイポグラフィ | 13 | フォントサイズ・行間・文字間隔・テキスト配置・縦書きなど |
| スペーシング | 5 | ブロック間隔・マージン・パディング・スペーシングプリセット |
| ディメンション | 4 | 最小高さ・アスペクト比・最小幅（WP 7.1+） |
| ポジション | 1 | スティッキー配置 |
| シャドウ | 1 | デフォルトシャドウプリセット |
| ライトボックス | 2 | 有効化・編集許可（WP 6.4+） |
| ブロックの表示/非表示 | 1 | 表示/非表示の編集 UI 許可（WP 7.1+） |
| ビューポート | 2 | モバイル/タブレット幅（`UnitControl` による px/em/rem 指定、WP 7.1+） |

---

## 必要環境

- **WordPress**: 6.6 以上（theme.json v3）
- **PHP**: 8.0 以上

---

## インストール

1. プラグインディレクトリを `/wp-content/plugins/NExT-theme-json-setup/` に配置
2. WordPress 管理画面 > プラグイン から **NExT theme.json Setup** を有効化
3. 管理画面 > 外観 > **theme.json 設定** を開く

---

## 使い方

### トグルスイッチで設定を変更する

1. 左のサイドバーからカテゴリを選択
2. 変更したい設定のトグルを ON / OFF に切り替え
3. 画面右上の **保存** ボタンをクリック

### ビューポート幅を設定する（モバイル/タブレット）

「ビューポート」カテゴリでは、トグルを ON にすると WordPress コアの `UnitControl` コンポーネントが表示され、数値入力と単位プルダウン（px / em / rem）で幅を指定できます。

### 設定の状態について

| 表示 | 意味 |
|---|---|
| トグルのみ（バッジなし） | テーマまたは WordPress のデフォルト値を表示中 |
| **カスタム** バッジあり | このプラグインがオーバーライド中 |
| `テーマのデフォルト: true/false` | テーマの `theme.json` に明示された値 |

### 個別のオーバーライドをクリアする

**カスタム** バッジのある行の **× クリア** ボタンをクリックすると、その項目だけオーバーライドを解除してテーマのデフォルトに戻ります。

### すべてのオーバーライドをリセットする

ヘッダーの **リセット** ボタンをクリックすると、プラグインによるすべての変更が削除されます。

---

## ファイル構成

```
NExT-theme-json-setup/
├── next-theme-json-setup.php                    # メインプラグインファイル
├── includes/
│   ├── class-next-theme-json-override.php       # フィルターフック + DB 読み書き
│   ├── class-next-theme-json-rest-api.php       # REST API エンドポイント
│   └── class-next-theme-json-admin-page.php     # 管理画面ページ登録・描画
├── assets/
│   ├── js/admin.js                              # 管理画面フロントエンド
│   └── css/admin.css                            # 管理画面スタイル
├── README.md
├── SPEC.md
├── CLAUDE.md
└── .gitignore
```

---

## REST API

プラグインは以下のエンドポイントを提供します。権限: `edit_theme_options`

| メソッド | エンドポイント | 説明 |
|---|---|---|
| `GET` | `/wp-json/next-theme-json/v1/theme-json` | テーマの theme.json を取得（読み取り専用） |
| `GET` | `/wp-json/next-theme-json/v1/override` | 保存済みオーバーライド設定を取得 |
| `POST` | `/wp-json/next-theme-json/v1/override` | オーバーライド設定を保存 |
| `POST` | `/wp-json/next-theme-json/v1/override/reset` | オーバーライド設定を削除 |

---

## 開発

### 必要ツール

- Node.js 18+ / npm
- Composer
- Docker（`@wordpress/env` 用）

### セットアップ

```bash
composer install   # phpcs / phpunit などの開発依存
npm install        # wp-env / Playwright / husky
npx wp-env start   # ローカル開発環境（dev: :8888 / tests: :8889）
```

`npm install` 時に husky の pre-commit フックが有効化され、コミット前にステージした PHP ファイルへ phpcs が実行されます。

### コーディング規約チェック（phpcs）

```bash
composer run phpcs   # チェック
composer run phpcbf  # 自動修正
```

### PHPUnit テスト

```bash
# Unit テスト（WordPress 非依存・ローカルで実行）
composer run test:unit

# Integration テスト（wp-env の tests 環境で実行）
npx wp-env run tests-cli --env-cwd=wp-content/plugins/NExT-theme-json-setup \
  vendor/bin/phpunit --testsuite integration --bootstrap=tests/phpunit/bootstrap.php
```

### E2E テスト（Playwright）

```bash
npx playwright install chromium  # 初回のみ
npx wp-env start
npm run test:e2e
```

### CI / リリース

- `.github/workflows/ci.yml` — push / PR で phpcs・PHPUnit（WP 最新 + 6.8 × PHP 8.3 / 8.4）・Plugin Check・E2E を実行
- `.github/workflows/release.yml` — `0.0.0` 形式のタグ push で配布用 zip を生成し GitHub Release を作成（タグとプラグインヘッダーの Version 一致を検証）

---

## ライセンス

GPL-2.0-or-later
