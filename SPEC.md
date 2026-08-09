# NExT theme.json Setup — プラグイン仕様書

## プラグイン情報

| 項目 | 値 |
|---|---|
| **プラグイン名** | NExT theme.json Setup |
| **スラッグ** | next-theme-json-setup |
| **テキストドメイン** | next-theme-json-setup |
| **ディレクトリ名** | NExT-theme-json-setup |
| **バージョン** | 0.4.0 |

---

## 参考ドキュメント

- Global Settings and Styles（テーマハンドブック）: https://developer.wordpress.org/themes/global-settings-and-styles/
- theme.json リファレンス（Living: 最新 v3）: https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/theme-json-living/

---

## 目的

有効化されているテーマの `theme.json` 設定を WordPress 管理画面から **GUI で閲覧・編集・保存** できるプラグイン。
**テーマファイルは一切書き換えない。** オーバーライド設定を DB に保存し、フィルターフックで実行時に適用する。

---

## アーキテクチャ（非破壊オーバーライド方式）

WordPress の theme.json にはカスケード（優先順位）がある。

```
default < blocks < theme < user  ← このプラグインはここに注入
```

- プラグインの設定は `wp_options`（キー: `next_theme_json_setup_overrides`）に JSON 文字列で保存する（autoload しない）。
- `wp_theme_json_data_user` フィルターで、保存済み設定を `WP_Theme_JSON_Data::update_with()` を使って user レベルに注入する。
- これにより**テーマの `theme.json` を書き換えずに**設定をオーバーライドできる。バックアップやファイル書き込みは不要。

> 設計初期は「theme.json への書き戻し／子テーマ出力＋バックアップ」を想定していたが、安全性（テーマ更新時の競合・破壊リスク回避）のため非破壊方式に変更した。

---

## theme.json の主要構造（v3）

```json
{
  "version": 3,
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "settings": { },
  "styles":   { },
  "customTemplates": [ ],
  "templateParts":   [ ],
  "patterns": [ ]
}
```

- **現行バージョンは v3**（`version: 3`、WordPress 6.6 以降）。本プラグインは保存時に `version` が無ければ 3 を補完する。
- 保存できるトップレベルキーはアローリストで制限する: `version` / `$schema` / `settings` / `styles` / `customTemplates` / `templateParts` / `patterns`。

### `settings` — エディター制御 + プリセット定義

| セクション | 内容 |
|---|---|
| `appearanceTools` | 外観ツール群（border / color / dimensions / position / spacing / typography / background）の一括有効化 |
| `useRootPaddingAwareAlignments` | ルートパディングを考慮した全幅整列 |
| `background` | 背景画像・背景サイズ・グラデーション（6.5〜7.1 で順次追加） |
| `border` | 幅・スタイル・色・角丸 |
| `color` | パレット・グラデーション・デュオトーン・要素別カラー（text / link / heading / button / caption） |
| `typography` | フォントサイズ・行間・文字間隔・テキスト配置・縦書きなど |
| `spacing` | margin / padding / blockGap・スペーシングプリセット |
| `dimensions` | 最小高さ・アスペクト比・最小幅（`minWidth`、7.1 で追加） |
| `position` | sticky 対応 |
| `shadow` | ボックスシャドウのプリセット |
| `lightbox` | 画像ブロックのライトボックス（`blocks.core/image.lightbox`） |
| `blockVisibility` | ブロックの表示/非表示編集 UI 制御（`allowEditing`、7.1 で追加） |
| `viewport` | レスポンシブスタイル／ブロック表示条件のブレークポイント定義（`mobile` / `tablet`、7.1 で追加）。専用 UI（有効化トグル＋ UnitControl による px/em/rem 幅指定）で編集可能 |
| `custom` | CSS カスタムプロパティ（変数）の定義 |
| `blocks` | ブロック単位の個別設定 |

### `styles` — 実際のデザイン適用値

- グローバル（`body`）への color / typography / spacing
- 要素別スタイル（`button`, `link`, `heading`, `h1`–`h6` など）
- ブロック別スタイル（`core/paragraph`, `core/heading` など）
- **WordPress 7.1 で追加**（いずれも文字列値のため Raw JSON モードで編集。`settings.viewport` のみ専用 UI あり）
  - `typography.textShadow` — テキストシャドウ（グローバル / ブロック単位 / 要素単位。カンマ区切りで複数指定可）
  - `dimensions.minWidth` — 最小幅（グローバル / ブロック単位。`settings.dimensions.minWidth` を有効化したブロックが対象）
  - `blocks.{blockName}.@tablet` / `@mobile` — `settings.viewport` のブレークポイントに基づくレスポンシブスタイル
  - `blocks.core/navigation-link.-current` / `:hover` / `:focus` / `:focus-visible` / `:active` — ナビゲーションリンクの状態別スタイル拡張

---

## 実装済み機能

| # | 機能 | 詳細 |
|---|---|---|
| 1 | **theme.json 読み込み** | 有効テーマ（子→親の順）の `theme.json` を読み取り、参照用に表示（読み取り専用） |
| 2 | **トグルスイッチ UI** | theme.json v3 のブール設定をカテゴリ別に列挙し、ON/OFF で編集 |
| 3 | **状態の可視化** | 各設定について「テーマ/WP のデフォルト値」と「プラグインによるオーバーライド中（カスタム）」をバッジで区別 |
| 4 | **個別クリア** | オーバーライド中の項目だけを解除してデフォルトに戻す |
| 5 | **Raw JSON 編集モード** | 上級者向けに JSON を直接編集 |
| 6 | **保存** | `wp_options` にオーバーライドとして保存（`wp_theme_json_data_user` で適用） |
| 7 | **バリデーション** | JSON パース・トップレベルキーのアローリスト・ペイロードサイズ上限（100KB） |
| 8 | **リセット** | プラグインによる全オーバーライドを削除 |
| 9 | **ビューポート幅設定** | `settings.viewport.mobile` / `tablet` を有効化トグル＋ WordPress コアの UnitControl（px / em / rem 切り替え）で編集 |

### 未実装 / 対象外

- **ライブプレビュー**（変更後のサイト外観プレビュー）は未実装。保存後に Site Editor / フロントで確認する運用。
- `styles` の GUI 編集は Raw JSON モードで対応（専用 UI は未提供）。
- `settings.viewport` 以外のオブジェクト型・文字列型の `settings` 項目は、ブール値ではないためトグル UI 化せず Raw JSON モードで対応。
- スタイルバリエーション（`styles/` ディレクトリ）の管理は対象外。

---

## REST API

ベースルート: `/wp-json/next-theme-json/v1/`。権限チェック: `current_user_can('edit_theme_options')`。nonce: `wp_rest`。

| メソッド | エンドポイント | 説明 |
|---|---|---|
| `GET`  | `/theme-json` | テーマの theme.json を取得（参照用・読み取り専用） |
| `GET`  | `/override` | 保存済みオーバーライド設定を取得 |
| `POST` | `/override` | オーバーライド設定を保存（アローリスト・サイズ上限を検証） |
| `POST` | `/override/reset` | オーバーライド設定を削除（リセット） |

---

## 技術要件

- **WordPress バージョン**: 6.6+（theme.json v3）。WordPress 7.1 未満の環境では `background.gradient` / `dimensions.minWidth` / `blockVisibility.allowEditing` / `viewport.mobile` / `viewport.tablet` などの新設定を ON にしても WP 側が未対応のため効果はない（保存自体は可能）。
- **PHP バージョン**: 8.0+
- **権限**: `edit_theme_options`
- **保存方式**: テーマを書き換えず `wp_options` に保存し、`wp_theme_json_data_user` フィルターで適用（非破壊）
- **REST API**: `register_rest_route` によるカスタムルート（`/next-theme-json/v1/`）
- **フロントエンド**: vanilla JS（`assets/js/admin.js`）。ビルド工程なし。ビューポート幅入力のみ WordPress コアが提供する `wp-element` / `wp-components`（`UnitControl`）をスクリプト依存として読み込み、ビルド不要な `wp.element.createElement` 経由で描画
- **アンインストール**: `uninstall.php` でオプションを削除

---

## 画面構成

```
管理画面 > 外観 > theme.json 設定
├── ヘッダー（テーマ名・オーバーライド適用状態・保存/リセット）
├── サイドバー（カテゴリナビゲーション）
│   ├── 一般（appearanceTools / useRootPaddingAwareAlignments）
│   ├── 背景（background）
│   ├── ボーダー（border）
│   ├── カラー（color）
│   ├── タイポグラフィ（typography）
│   ├── スペーシング（spacing）
│   ├── ディメンション（dimensions）
│   ├── ポジション（position）
│   ├── シャドウ（shadow）
│   ├── ライトボックス（blocks.core/image.lightbox）
│   ├── ブロックの表示/非表示（blockVisibility）
│   └── ビューポート（viewport.mobile / tablet）
├── 設定行（トグル＋デフォルト/カスタムのバッジ＋個別クリア）
└── Raw JSON エディター（参照: テーマの theme.json / 編集: オーバーライド）
```
