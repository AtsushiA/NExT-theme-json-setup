# NExT theme.json Setup — プラグイン仕様書

## プラグイン情報

| 項目 | 値 |
|---|---|
| **プラグイン名** | NExT theme.json Setup |
| **スラッグ** | next-theme-json-setup |
| **テキストドメイン** | next-theme-json-setup |
| **ディレクトリ名** | NExT-theme-json-setup |

---

## 参考ドキュメント

https://developer.wordpress.org/themes/global-settings-and-styles/

---

## 目的

有効化されているテーマの `theme.json` を WordPress 管理画面から **GUI で閲覧・編集・保存** できるプラグイン。

---

## theme.json の主要構造

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

### `settings` — エディター制御 + プリセット定義

| セクション | 内容 |
|---|---|
| `color` | パレット・グラデーション・デュオトーン |
| `typography` | フォントサイズ・フォントファミリー・行間・装飾 |
| `spacing` | margin / padding のプリセット・単位 |
| `border` | 幅・スタイル・色・角丸 |
| `layout` | コンテンツ幅・ワイド幅 |
| `shadow` | ボックスシャドウのプリセット |
| `dimensions` | 最小高さ |
| `position` | sticky 対応 |
| `custom` | CSS カスタムプロパティ（変数）の定義 |
| `blocks` | ブロック単位の個別設定 |
| `appearanceTools` | 外観ツール群の一括有効化 |

### `styles` — 実際のデザイン適用値

- グローバル（`body`）への color / typography / spacing
- 要素別スタイル（`button`, `link`, `h1`–`h6` など）
- ブロック別スタイル（`core/paragraph`, `core/heading` など）

---

## プラグインが持つべき機能

### 必須機能

| # | 機能 | 詳細 |
|---|---|---|
| 1 | **theme.json 読み込み** | 有効テーマの `theme.json` を読み取り |
| 2 | **設定エディター UI** | `settings` / `styles` をセクション別に GUI 編集 |
| 3 | **保存** | 編集結果を `theme.json` へ書き戻し（または wp-content 配下に child theme として出力） |
| 4 | **プレビュー** | 変更後のサイト外観を確認できる |
| 5 | **バリデーション** | JSON スキーマ（v3）に沿った入力チェック |
| 6 | **バックアップ** | 上書き前に元ファイルをバックアップ |

### 推奨機能

| # | 機能 | 詳細 |
|---|---|---|
| 7 | **カラーパレット管理** | パレット一覧の追加・編集・削除 |
| 8 | **タイポグラフィ管理** | フォントサイズプリセットの管理 |
| 9 | **スタイルバリエーション対応** | `styles/` ディレクトリ内のバリエーションも管理 |
| 10 | **Raw JSON 編集モード** | コードエディターで直接 JSON 編集 |
| 11 | **リセット機能** | テーマ標準の `theme.json` へ戻す |
| 12 | **エクスポート** | 編集済み `theme.json` をダウンロード |

---

## 技術要件

- **WordPress バージョン**: 6.0+（theme.json v2）、6.5+ 推奨（v3）
- **権限**: `manage_options` または `edit_theme_options`
- **書き込み方式**: 親テーマを直接書き換えず、**子テーマ or wp-content/uploads 配下** に保存するのが安全
- **REST API**: `WP_REST_Controller` を使い JS フロントエンドから読み書き
- **フロントエンド**: React（`@wordpress/components`）または vanilla JS

---

## 想定する画面構成

```
管理画面 > 外観 > Theme.json 設定
├── 概要（現在の theme.json バージョン・テーマ名）
├── カラー設定
├── タイポグラフィ設定
├── スペーシング設定
├── レイアウト設定
├── ブロック別設定
├── Raw JSON エディター
└── バックアップ / リセット
```
