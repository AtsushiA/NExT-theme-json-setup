# NExT theme.json Setup — プラグイン仕様書

## プラグイン情報

| 項目 | 値 |
|---|---|
| **プラグイン名** | NExT theme.json Setup |
| **スラッグ** | next-theme-json-setup |
| **テキストドメイン** | next-theme-json-setup |
| **ディレクトリ名** | NExT-theme-json-setup |
| **バージョン** | 0.6.0 |

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
default < blocks < theme（テーマ < このプラグイン） < user
```

- プラグインの設定は `wp_options`（キー: `next_theme_json_setup_overrides`）に JSON 文字列で保存する（autoload しない）。
- `wp_theme_json_data_theme` フィルターで、保存済み設定を `WP_Theme_JSON_Data::update_with()` を使って theme レベル（テーマの theme.json の上）に注入する。
  - **theme レベルに注入する理由**: ブロックテーマでは、投稿エディター・サイトエディターとも `GlobalStylesRenderer` が REST API（`/wp/v2/global-styles/themes/{stylesheet}` ＋ ユーザーのグローバルスタイル投稿の生データ）からエディター設定（`__experimentalFeatures`）を作り直す。前者は theme レベルまでをマージして返し、後者はフィルターを通らないため、user レベル（`wp_theme_json_data_user`）に注入するとフロントの CSS には効いてもエディターの操作欄に反映されなかった（v0.6.0 で変更）。
  - 優先順位: テーマの theme.json（子テーマ・クラシックテーマのテーマサポートを含む）< このプラグイン < サイトエディターでユーザーが保存したグローバルスタイル。
  - `update_with()` は上書き側を独立した `WP_Theme_JSON` として構築してからマージするため、上書き側の `appearanceTools` は上書き側で未指定の項目を true にし、テーマの明示値より優先される。
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
| `background` | 背景画像・背景サイズ・グラデーション・背景のクリップ（`backgroundClip`、7.2 で追加。`true` または許可値の配列）（6.5〜7.2 で順次追加） |
| `border` | 幅・スタイル・色・角丸 |
| `color` | パレット・グラデーション・デュオトーン・要素別カラー（text / link / heading / button / caption） |
| `typography` | フォントサイズ・行間・文字間隔・テキスト配置・縦書き・テキストインデント（`textIndent`、7.0 で追加。`"subsequent"` / `"all"` / `false` をセレクトボックスで編集）・テキストシャドウ（`textShadow` / `defaultTextShadowPresets` / `textShadowPresets`、7.2 で追加）など |
| `spacing` | margin / padding / blockGap・スペーシングプリセット |
| `dimensions` | 最小高さ・アスペクト比・幅／高さ（`width` / `height`、7.0 で追加）・最小幅（`minWidth`、7.1 で追加） |
| `position` | sticky / fixed 対応（7.2 から `@tablet` / `@mobile` のビューポート別指定に対応） |
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
- **WordPress 7.2 で追加**（Raw JSON モードで編集）
  - `background.backgroundClip` — 背景のクリップ（グローバル / ブロック単位。`text` でグラデーション文字などを表現）
  - `elements.label` — フォームの `label` 要素（`button` / `textInput` / `select` に加え、Global Styles でフォーム要素を一括スタイリング可能に）
  - `elements.textInput` の状態 — `:required` / `:user-valid` / `:user-invalid` / `:focus` / `:focus-visible` / `::placeholder`
  - `elements.select` の状態 — `:hover` / `:focus` / `:focus-visible` / `:active`
  - `settings.typography.textShadowPresets` — テキストシャドウのプリセット定義。プリセットごとに CSS 変数 `--wp--preset--text-shadow--{slug}` と CSS クラス `.has-{slug}-text-shadow` が生成される。WP 標準のプリセットは「Light」「Strong」の 2 件（`settings.typography.defaultTextShadowPresets: false` で非表示）
    ```json
    "textShadowPresets": [
      { "name": "Soft", "slug": "soft", "textShadow": "0 1px 2px rgba(0, 0, 0, 0.25)" }
    ]
    ```
  - `styles.blocks.core/group.spacing.blockGap` — Group ブロックで縦・横の間隔を個別に指定可能（`{ "top": "…", "left": "…" }`。flex / grid レイアウト時に有効。[Gutenberg #81476](https://github.com/WordPress/gutenberg/pull/81476)）
  - `position`（sticky / fixed）の `@tablet` / `@mobile` 別指定 — ビューポートごとに位置指定を切り替え可能（[Gutenberg #83094](https://github.com/WordPress/gutenberg/pull/83094)）

#### WordPress 7.2 での挙動の変更（Raw JSON で書く場合の注意）

7.2-beta3 で実際に確認した内容。

- **grid レイアウトの列幅計算では、`(` を含む blockGap が使われない**
  - 対象: `styles.spacing.blockGap` と `styles.blocks.{ブロック名}.spacing.blockGap`（ブロックごとのレイアウト CSS を作る際のフォールバック値として参照される）
  - `wp_sanitize_block_gap_value()` が `(` `&` `=` `}` `/*` を含む値を除外するため、`clamp()` / `calc()` / `var(--…)` は捨てられ、既定の `0.5em` が使われる
  - **プリセット参照（`var:preset|spacing|50`）も影響を受ける**。グローバルスタイルでは `var(--wp--preset--spacing--50)` に変換済みのため `(` を含む
  - 影響が出るのは、列数（`columnCount`）と最小列幅（`minimumColumnWidth`）を両方指定した grid の列幅計算（`(100% - (0.5em * (列数 - 1))) / 列数`）。`:root :where(.is-layout-grid){gap: …}` などの通常の gap 出力には `clamp()` やプリセットもそのまま使われる
  - 列幅計算にも反映させたい場合は `3rem` のような単純な長さで指定する
- **プリセット参照のスラッグがケバブケースに揃えられる** — 例: `var:preset|font-family|n27` は `--wp--preset--font-family--n-27` を指す（以前は存在しない CSS 変数を指していた）
- **形の違う値は無視される** — 例: `"fontFamilies": ["Inter"]` のような値を書いても PHP の致命的エラーにならず、その値だけが捨てられる

---

## 実装済み機能

| # | 機能 | 詳細 |
|---|---|---|
| 1 | **theme.json 読み込み** | 有効テーマ（子→親の順）の `theme.json` を読み取り、参照用に表示（読み取り専用） |
| 2 | **トグルスイッチ UI** | theme.json v3 のブール設定をカテゴリ別に列挙し、ON/OFF で編集 |
| 3 | **状態の可視化** | 各設定について「テーマ/WP のデフォルト値」と「プラグインによるオーバーライド中（カスタム）」をバッジで区別 |
| 4 | **個別クリア** | オーバーライド中の項目だけを解除してデフォルトに戻す |
| 5 | **Raw JSON 編集モード** | 上級者向けに JSON を直接編集 |
| 6 | **保存** | `wp_options` にオーバーライドとして保存（`wp_theme_json_data_theme` で適用） |
| 7 | **バリデーション** | JSON パース・トップレベルキーのアローリスト・ペイロードサイズ上限（100KB） |
| 8 | **リセット** | プラグインによる全オーバーライドを削除 |
| 9 | **ビューポート幅設定** | `settings.viewport.mobile` / `tablet` を有効化トグル＋ WordPress コアの UnitControl（px / em / rem 切り替え）で編集 |
| 10 | **多言語対応（i18n）** | WordPress 標準の翻訳ファイル（.pot/.po/.mo・JS 翻訳 JSON）に対応。管理画面はサイト言語に応じて自動的に翻訳される |
| 11 | **WordPress 7.2 対応** | `background.backgroundClip`・`typography.textShadow`・`typography.defaultTextShadowPresets`・`position.fixed`・`dimensions.width` / `height` のトグル、`typography.textIndent` のセレクトボックスを追加（トグル 48 → 54 項目、セレクト 1 項目） |

### 未実装 / 対象外

- **ライブプレビュー**（変更後のサイト外観プレビュー）は未実装。保存後に Site Editor / フロントで確認する運用。
- `styles` の GUI 編集は Raw JSON モードで対応（専用 UI は未提供）。
- `settings.spacing.blockGap` はトグルで `true`（間隔の CSS を出力し操作欄も表示）/ `false`（CSS は出力するが操作欄は非表示）を保存する。未設定（`null`、テーマが間隔に対応していない扱い）に戻すには「クリア」を使う。
- トグルの表示は、オーバーライド → 外観ツール（オーバーライド側の `appearanceTools`）→ テーマの値 → 外観ツール（テーマ側の `appearanceTools`）→ WP デフォルトの順で決まる。コアは origin ごとに「その origin で未指定の項目だけ」を `appearanceTools` で true にするため、このプラグインで `appearanceTools` を ON にすると、テーマで明示的に OFF にしている項目も有効になる。
- `settings.viewport`・`settings.typography.textIndent` 以外のオブジェクト型・文字列型・配列型の `settings` 項目（`textShadowPresets` などのプリセット、`backgroundClip` の許可値配列など）は、トグル UI 化せず Raw JSON モードで対応。トグル行はテーマ側の値が配列の場合も「有効」として表示する。
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

- **WordPress バージョン**: 6.6+（theme.json v3）。WordPress 7.1 未満の環境では `background.gradient` / `dimensions.minWidth` / `blockVisibility.allowEditing` / `viewport.mobile` / `viewport.tablet` など、7.2 未満の環境では `background.backgroundClip` / `typography.textShadow` / `typography.defaultTextShadowPresets` などの新設定を ON にしても WP 側が未対応のため効果はない（保存自体は可能）。
- **PHP バージョン**: 8.0+
- **権限**: `edit_theme_options`
- **保存方式**: テーマを書き換えず `wp_options` に保存し、`wp_theme_json_data_theme` フィルターで適用（非破壊）
- **REST API**: `register_rest_route` によるカスタムルート（`/next-theme-json/v1/`）
- **フロントエンド**: vanilla JS（`assets/js/admin.js`）。ビルド工程なし。ビューポート幅入力のみ WordPress コアが提供する `wp-element` / `wp-components`（`UnitControl`）をスクリプト依存として読み込み、ビルド不要な `wp.element.createElement` 経由で描画。文字列の翻訳には `wp-i18n`（`wp.i18n.__` / `sprintf`）を使用
- **多言語対応**: WordPress 標準の翻訳ファイル（`.pot`/`.po`/`.mo`・JS 翻訳 JSON）に準拠。詳細は「多言語対応（i18n）」を参照
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

---

## 多言語対応（i18n）

本プラグインのソース文字列（PHP・JS とも）は**日本語**。WordPress 標準の翻訳ファイル形式（.pot/.po/.mo、および JS 翻訳 JSON）に準拠し、サイトの言語設定（`WPLANG` / サイト言語）に応じて自動的に翻訳される。**同梱の翻訳は英語（`en_US`）のみ**。他言語は `languages/next-theme-json-setup.pot` を元に翻訳ファイルを追加することで対応できる。

### 仕組み

- **PHP 文字列**: 全て `__()` / `_e()` / `esc_html__()` 等でラップ（テキストドメイン: `next-theme-json-setup`）。プラグインヘッダーの `Text Domain` / `Domain Path`（`/languages`）により、WordPress 4.6+ の JIT（Just-In-Time）自動読み込みで `languages/next-theme-json-setup-{locale}.mo` を読み込む。**`load_plugin_textdomain()` の明示呼び出しは不要**（本プラグインの最低要件 WordPress 6.6 は 4.6 を大きく上回るため）。
- **JS 文字列**（`assets/js/admin.js` のカテゴリ・設定ラベル/説明など）: `@wordpress/i18n`（`wp.i18n.__` / `wp.i18n.sprintf`）でラップ。`wp_enqueue_script()` に `wp-i18n` を依存として追加し、`wp_set_script_translations( 'next-theme-json-setup-admin', 'next-theme-json-setup', languages ディレクトリ )` を呼ぶことで、`languages/next-theme-json-setup-{locale}-next-theme-json-setup-admin.json` を自動読み込みする。ビルド工程（webpack 等）は不要——`wp.element.createElement` と同様、WordPress コアが提供するグローバルスクリプトを利用するのみ。
- 翻訳ファイルが存在しないロケールでは、ソース文字列（日本語）がそのまま表示される（フォールバック）。

### 翻訳ファイルの構成

```
languages/
├── next-theme-json-setup.pot                                    # 翻訳テンプレート（msgid のみ）
├── next-theme-json-setup-en_US.po                                # 英語翻訳（人間可読）
├── next-theme-json-setup-en_US.mo                                # 英語翻訳（PHP gettext 用バイナリ）
└── next-theme-json-setup-en_US-next-theme-json-setup-admin.json  # 英語翻訳（JS/wp.i18n 用。ファイル名は {domain}-{locale}-{スクリプトハンドル}.json）
```

### 新しい言語を追加する手順

1. `.pot` を最新化（文字列を追加・変更した場合）:
   ```bash
   npx wp-env run cli --env-cwd=wp-content/plugins/NExT-theme-json-setup -- \
     wp i18n make-pot . languages/next-theme-json-setup.pot --domain=next-theme-json-setup --slug=next-theme-json-setup
   ```
2. `languages/next-theme-json-setup.pot` をコピーして `next-theme-json-setup-{locale}.po`（例: `fr_FR`）を作成し、`msgstr` を翻訳する。
3. `.mo` と JS 翻訳 JSON を生成する:
   ```bash
   npx wp-env run cli --env-cwd=wp-content/plugins/NExT-theme-json-setup -- wp i18n make-mo languages
   npx wp-env run cli --env-cwd=wp-content/plugins/NExT-theme-json-setup -- wp i18n make-json languages --no-purge
   ```
4. **`wp i18n make-json` が生成するファイル名は本プラグインの構成では不正**（`wp_set_script_translations()` に明示的な `$path` を渡しているため、WordPress は `{domain}-{locale}-{スクリプトハンドル}.json` というファイル名を最初に探す。`make-json` が生成する md5 ハッシュ名のファイルはこのケースでは参照されない）。生成されたファイルを次の名前にリネームする:
   ```bash
   mv languages/next-theme-json-setup-{locale}-*.json languages/next-theme-json-setup-{locale}-next-theme-json-setup-admin.json
   ```
5. サイト言語を切り替えて（設定 > 一般 > サイトの言語、または `wp site switch-language {locale}`）動作確認する。

### 開発・テスト環境の既定言語

`wp-env` の開発/テスト環境は `lifecycleScripts.afterStart` で日本語（`ja`）に固定している（本プラグインのソース言語と揃え、既存の e2e テストが日本語表示を前提にできるようにするため）。英語表示の検証は `tests/e2e/admin-page.spec.ts` 内の専用テストが `wp site switch-language` で一時的に切り替えて確認する。
