/* global nextThemeJsonSetup */

( function () {
	'use strict';

	const { apiBase, nonce, i18n } = nextThemeJsonSetup;

	// WordPress 標準の JS 翻訳（wp.i18n / wp_set_script_translations）を使用する.
	// wp-i18n は依存スクリプトとして必ず読み込まれるが、念のためフォールバックも用意する.
	var __ = ( window.wp && wp.i18n && wp.i18n.__ )
		? wp.i18n.__
		: function ( text ) { return text; };
	var sprintf = ( window.wp && wp.i18n && wp.i18n.sprintf )
		? wp.i18n.sprintf
		: function ( format ) {
			var args = Array.prototype.slice.call( arguments, 1 );
			var i    = 0;
			return format.replace( /%s/g, function () { return args[ i++ ]; } );
		};

	// =========================================================================
	// 設定スキーマ定義（theme.json v3 のブール設定をカテゴリ別に列挙）
	// key: ネストしたパスをキーの配列で表現（'core/image' のようなスラッシュ含むキーに対応）
	// wpDefault: WordPress 本体のデフォルト値
	// =========================================================================
	const CATEGORIES = [
		{
			id: 'general',
			label: __( '一般', 'next-theme-json-setup' ),
			icon: '⚙',
			settings: [
				{
					key: [ 'settings', 'appearanceTools' ],
					label: __( '外観ツール一括有効化', 'next-theme-json-setup' ),
					description: __( 'ボーダー・カラー・タイポグラフィなどの外観コントロールをまとめて有効化します。明示的に値を指定していない項目だけが有効になります（このプラグインで ON にした場合は、テーマ側で OFF にしている項目も有効になります）。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'useRootPaddingAwareAlignments' ],
					label: __( 'ルートパディング対応の整列', 'next-theme-json-setup' ),
					description: __( 'コンテンツのパディングを考慮し、フルワイドブロックが正しく端まで伸びるよう調整します。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
			],
		},
		{
			id: 'background',
			label: __( '背景', 'next-theme-json-setup' ),
			icon: '▤',
			settings: [
				{
					key: [ 'settings', 'background', 'backgroundImage' ],
					label: __( '背景画像', 'next-theme-json-setup' ),
					description: __( 'ブロックに背景画像を設定できるようにします。WordPress 6.5 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'background', 'backgroundSize' ],
					label: __( '背景画像のサイズ・位置', 'next-theme-json-setup' ),
					description: __( '背景画像のサイズ・繰り返し・位置（focal point）を設定できるようにします。WordPress 6.6 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'background', 'gradient' ],
					label: __( 'グラデーション背景', 'next-theme-json-setup' ),
					description: __( 'ブロックの背景としてグラデーションを設定できるようにします。背景画像と併用できます。WordPress 7.1 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'background', 'backgroundClip' ],
					label: __( '背景のクリップ（background-clip）', 'next-theme-json-setup' ),
					description: __( '背景（色・グラデーション・画像）の描画範囲を設定できるようにします。「text」を選ぶと背景を文字の形に切り抜くグラデーション文字などを表現できます。ON にするとすべての値を許可します（許可する値を配列で限定する場合は Raw JSON モードで指定）。WordPress 7.2 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
			],
		},
		{
			id: 'border',
			label: __( 'ボーダー', 'next-theme-json-setup' ),
			icon: '▢',
			settings: [
				{
					key: [ 'settings', 'border', 'color' ],
					label: __( 'ボーダーカラー', 'next-theme-json-setup' ),
					description: __( 'ブロックのボーダーカラーを Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'border', 'radius' ],
					label: __( '角丸（border-radius）', 'next-theme-json-setup' ),
					description: __( 'ブロックの角丸を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'border', 'style' ],
					label: __( 'ボーダースタイル', 'next-theme-json-setup' ),
					description: __( 'solid / dashed / dotted などのボーダースタイルを Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'border', 'width' ],
					label: __( 'ボーダー幅', 'next-theme-json-setup' ),
					description: __( 'ボーダーの幅を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
			],
		},
		{
			id: 'color',
			label: __( 'カラー', 'next-theme-json-setup' ),
			icon: '◉',
			settings: [
				{
					key: [ 'settings', 'color', 'background' ],
					label: __( '背景色', 'next-theme-json-setup' ),
					description: __( 'ブロックの背景色を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'custom' ],
					label: __( 'カスタムカラー', 'next-theme-json-setup' ),
					description: __( 'カラーピッカーで任意の色を指定できるようにします。false にするとテーマのプリセットのみに制限されます。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'customDuotone' ],
					label: __( 'カスタムデュオトーン', 'next-theme-json-setup' ),
					description: __( 'ユーザーが独自のデュオトーンフィルターを作成できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'customGradient' ],
					label: __( 'カスタムグラデーション', 'next-theme-json-setup' ),
					description: __( 'ユーザーが独自のグラデーションを作成できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'defaultDuotone' ],
					label: __( 'デフォルトデュオトーン', 'next-theme-json-setup' ),
					description: __( 'WordPress が提供するデフォルトのデュオトーンフィルタープリセットを表示します。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'defaultGradients' ],
					label: __( 'デフォルトグラデーション', 'next-theme-json-setup' ),
					description: __( 'WordPress が提供するデフォルトのグラデーションプリセットを表示します。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'defaultPalette' ],
					label: __( 'デフォルトカラーパレット', 'next-theme-json-setup' ),
					description: __( 'WordPress が提供するデフォルトのカラーパレットを表示します。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'link' ],
					label: __( 'リンクカラー', 'next-theme-json-setup' ),
					description: __( 'リンクテキストの色を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'color', 'text' ],
					label: __( 'テキストカラー', 'next-theme-json-setup' ),
					description: __( 'ブロックのテキスト色を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'heading' ],
					label: __( '見出しカラー', 'next-theme-json-setup' ),
					description: __( '見出し要素の色を Site Editor で個別に設定できるようにします。WordPress 6.6 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'button' ],
					label: __( 'ボタンカラー', 'next-theme-json-setup' ),
					description: __( 'ボタン要素の色を Site Editor で個別に設定できるようにします。WordPress 6.6 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'caption' ],
					label: __( 'キャプションカラー', 'next-theme-json-setup' ),
					description: __( 'キャプション要素の色を Site Editor で個別に設定できるようにします。WordPress 6.6 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
			],
		},
		{
			id: 'typography',
			label: __( 'タイポグラフィ', 'next-theme-json-setup' ),
			icon: 'Aa',
			settings: [
				{
					key: [ 'settings', 'typography', 'customFontSize' ],
					label: __( 'カスタムフォントサイズ', 'next-theme-json-setup' ),
					description: __( 'プリセット以外の任意のフォントサイズを入力できるようにします。false にするとプリセットのみに制限されます。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'dropCap' ],
					label: __( 'ドロップキャップ', 'next-theme-json-setup' ),
					description: __( '段落の最初の文字を大きく装飾するドロップキャップを使用できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'fluid' ],
					label: __( 'フルードタイポグラフィ', 'next-theme-json-setup' ),
					description: __( 'ビューポートサイズに応じてフォントサイズが滑らかに変化するレスポンシブなタイポグラフィを有効にします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'typography', 'fontStyle' ],
					label: __( 'フォントスタイル', 'next-theme-json-setup' ),
					description: __( 'イタリックなどのフォントスタイルを Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'fontWeight' ],
					label: __( 'フォントウェイト', 'next-theme-json-setup' ),
					description: __( 'フォントの太さ（Thin 〜 Black）を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'letterSpacing' ],
					label: __( '文字間隔（letter-spacing）', 'next-theme-json-setup' ),
					description: __( '文字間隔を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'lineHeight' ],
					label: __( '行の高さ（line-height）', 'next-theme-json-setup' ),
					description: __( '行間を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'typography', 'textColumns' ],
					label: __( 'テキストカラム数', 'next-theme-json-setup' ),
					description: __( 'テキストを複数カラムで表示する設定を Site Editor で使用できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'typography', 'textDecoration' ],
					label: __( 'テキスト装飾', 'next-theme-json-setup' ),
					description: __( '下線・打ち消し線などのテキスト装飾を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'textTransform' ],
					label: __( 'テキスト変換（大文字/小文字）', 'next-theme-json-setup' ),
					description: __( 'uppercase / lowercase / capitalize などのテキスト変換を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'writingMode' ],
					label: __( '縦書き（writing-mode）', 'next-theme-json-setup' ),
					description: __( '縦書きなどのテキスト方向を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'typography', 'textAlign' ],
					label: __( 'テキスト配置', 'next-theme-json-setup' ),
					description: __( 'テキストの左揃え・中央揃え・右揃えを Site Editor で設定できるようにします。WordPress 6.6 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'defaultFontSizes' ],
					label: __( 'デフォルトフォントサイズ', 'next-theme-json-setup' ),
					description: __( 'WordPress が提供するデフォルトのフォントサイズプリセット（Small 〜 Extra Large）を表示します。WordPress 6.6 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'textShadow' ],
					label: __( 'テキストシャドウ', 'next-theme-json-setup' ),
					description: __( 'テキストシャドウを Site Editor やブロックで設定できるようにします。WordPress 7.2 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'defaultTextShadowPresets' ],
					label: __( 'デフォルトテキストシャドウプリセット', 'next-theme-json-setup' ),
					description: __( 'WordPress が提供するデフォルトのテキストシャドウプリセットを表示します。独自プリセットは Raw JSON モードで settings.typography.textShadowPresets に定義します。WordPress 7.2 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'textIndent' ],
					label: __( 'テキストインデント（text-indent）', 'next-theme-json-setup' ),
					description: __( '段落の 1 行目の字下げを設定できるようにします。「2 段落目以降」は連続する段落の 2 つ目以降のみ、「すべての段落」は全段落に字下げを適用します。WordPress 7.0 以降で利用可能。', 'next-theme-json-setup' ),
					// ブール値ではなく文字列の選択肢を持つため、セレクトボックス（buildSelectSettingRow）で描画する.
					type: 'select',
					options: [
						{ value: 'subsequent', label: __( '2 段落目以降', 'next-theme-json-setup' ) },
						{ value: 'all', label: __( 'すべての段落', 'next-theme-json-setup' ) },
						{ value: false, label: __( '無効', 'next-theme-json-setup' ) },
					],
					wpDefault: 'subsequent',
				},
			],
		},
		{
			id: 'spacing',
			label: __( 'スペーシング', 'next-theme-json-setup' ),
			icon: '⇔',
			settings: [
				{
					key: [ 'settings', 'spacing', 'blockGap' ],
					label: __( 'ブロック間隔（blockGap）', 'next-theme-json-setup' ),
					description: __( 'ブロック間の余白を Site Editor で設定できるようにします。ON で true（間隔の CSS を出力し操作欄も表示）、OFF で false（間隔の CSS は出力するが操作欄は非表示）を保存します。未設定（null）の場合はテーマが間隔に対応していない扱いになり、ブロックごとの既定の間隔が使われます（未設定に戻すには「クリア」を使用）。', 'next-theme-json-setup' ),
					wpDefault: null,
				},
				{
					key: [ 'settings', 'spacing', 'customSpacingSize' ],
					label: __( 'カスタムスペーシングサイズ', 'next-theme-json-setup' ),
					description: __( 'プリセット以外の任意の余白サイズを入力できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'spacing', 'margin' ],
					label: __( 'マージン（外側の余白）', 'next-theme-json-setup' ),
					description: __( 'ブロックの外側の余白（margin）を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'spacing', 'padding' ],
					label: __( 'パディング（内側の余白）', 'next-theme-json-setup' ),
					description: __( 'ブロックの内側の余白（padding）を Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'spacing', 'defaultSpacingSizes' ],
					label: __( 'デフォルトスペーシングサイズ', 'next-theme-json-setup' ),
					description: __( 'WordPress が提供するデフォルトのスペーシングサイズプリセットを表示します。WordPress 6.6 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
			],
		},
		{
			id: 'dimensions',
			label: __( 'ディメンション', 'next-theme-json-setup' ),
			icon: '↕',
			settings: [
				{
					key: [ 'settings', 'dimensions', 'minHeight' ],
					label: __( '最小高さ（min-height）', 'next-theme-json-setup' ),
					description: __( '対応ブロックの最小高さを Site Editor で設定できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'dimensions', 'aspectRatio' ],
					label: __( 'アスペクト比', 'next-theme-json-setup' ),
					description: __( '対応ブロックのアスペクト比（縦横比）を Site Editor で設定できるようにします。WordPress 6.5 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'dimensions', 'defaultAspectRatios' ],
					label: __( 'デフォルトアスペクト比プリセット', 'next-theme-json-setup' ),
					description: __( 'WordPress が提供するデフォルトのアスペクト比プリセット（1:1 / 4:3 / 16:9 など）を表示します。WordPress 6.6 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
				{
					key: [ 'settings', 'dimensions', 'minWidth' ],
					label: __( '最小幅（min-width）', 'next-theme-json-setup' ),
					description: __( '対応ブロックの最小幅を Site Editor で設定できるようにします。WordPress 7.1 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'dimensions', 'width' ],
					label: __( '幅（width）', 'next-theme-json-setup' ),
					description: __( '対応ブロックの幅を Site Editor で設定できるようにします。WordPress 7.0 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'dimensions', 'height' ],
					label: __( '高さ（height）', 'next-theme-json-setup' ),
					description: __( '対応ブロックの高さを Site Editor で設定できるようにします。WordPress 7.0 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
			],
		},
		{
			id: 'position',
			label: __( 'ポジション', 'next-theme-json-setup' ),
			icon: '⊡',
			settings: [
				{
					key: [ 'settings', 'position', 'sticky' ],
					label: __( 'スティッキーポジション', 'next-theme-json-setup' ),
					description: __( 'ブロックをスクロール時に画面上部に固定する sticky 配置を対応ブロックで使用できるようにします。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'position', 'fixed' ],
					label: __( '固定ポジション', 'next-theme-json-setup' ),
					description: __( 'ブロックを画面に固定表示する fixed 配置を対応ブロックで使用できるようにします。WordPress 7.2 以降はビューポート（@tablet / @mobile）ごとの切り替えにも対応。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
			],
		},
		{
			id: 'shadow',
			label: __( 'シャドウ', 'next-theme-json-setup' ),
			icon: '◫',
			settings: [
				{
					key: [ 'settings', 'shadow', 'defaultPresets' ],
					label: __( 'デフォルトシャドウプリセット', 'next-theme-json-setup' ),
					description: __( 'WordPress が提供する Natural / Deep / Sharp / Outlined / Crisp などのシャドウプリセットを表示します。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
			],
		},
		{
			id: 'lightbox',
			label: __( 'ライトボックス', 'next-theme-json-setup' ),
			icon: '⊞',
			settings: [
				{
					key: [ 'settings', 'blocks', 'core/image', 'lightbox', 'enabled' ],
					label: __( 'ライトボックスを有効化', 'next-theme-json-setup' ),
					description: __( '画像ブロックをクリックしたときにライトボックス（拡大表示）を使用します。WordPress 6.4 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: false,
				},
				{
					key: [ 'settings', 'blocks', 'core/image', 'lightbox', 'allowEditing' ],
					label: __( 'ライトボックス編集を許可', 'next-theme-json-setup' ),
					description: __( 'ユーザーが画像ブロックごとにライトボックスの有効・無効を変更できるようにします。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
			],
		},
		{
			id: 'blockVisibility',
			label: __( 'ブロックの表示/非表示', 'next-theme-json-setup' ),
			icon: '◐',
			settings: [
				{
					key: [ 'settings', 'blockVisibility', 'allowEditing' ],
					label: __( '表示/非表示設定の編集を許可', 'next-theme-json-setup' ),
					description: __( 'エディター上でブロックごとの表示・非表示（デバイス別の切り替えなど）を編集できるようにします。false にすると編集 UI が非表示になりますが、既存の表示設定自体は変更されません。WordPress 7.1 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: true,
				},
			],
		},
		{
			id: 'viewport',
			label: __( 'ビューポート', 'next-theme-json-setup' ),
			icon: '⛶',
			// ブール値ではなく単位付き文字列（例: "480px"）を扱うため、専用の行 UI（buildViewportSettingRow）で描画する。
			type: 'viewport',
			settings: [
				{
					key: [ 'settings', 'viewport', 'mobile' ],
					label: __( 'モバイル幅', 'next-theme-json-setup' ),
					description: __( 'モバイル向けスタイル（@mobile）が適用される上限幅です。この幅以下の画面がモバイル扱いになります。WordPress 7.1 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: '480px',
				},
				{
					key: [ 'settings', 'viewport', 'tablet' ],
					label: __( 'タブレット幅', 'next-theme-json-setup' ),
					description: __( 'タブレット向けスタイル（@tablet）が適用される上限幅です。モバイル幅を上回る値を指定してください（下回る場合は WP 側でモバイル幅のみが使用されます）。WordPress 7.1 以降で利用可能。', 'next-theme-json-setup' ),
					wpDefault: '782px',
				},
			],
		},
	];

	// =========================================================================
	// ビューポート幅入力で選択できる単位（バックエンドの検証パターンと一致させる）。
	// =========================================================================
	var VIEWPORT_UNITS = [
		{ value: 'px', label: 'px', default: 0 },
		{ value: 'em', label: 'em', default: 0 },
		{ value: 'rem', label: 'rem', default: 0 },
	];

	// =========================================================================
	// 外観ツール（appearanceTools）で有効化される設定（WP_Theme_JSON::APPEARANCE_TOOLS_OPT_INS と一致させる）。
	// コアは origin（テーマ / ユーザー）ごとに、その origin で未指定の項目だけを true にする。
	// =========================================================================
	var APPEARANCE_TOOLS_OPT_INS = [
		'background.backgroundImage',
		'background.backgroundSize',
		'background.gradient',
		'border.color',
		'border.radius',
		'border.style',
		'border.width',
		'color.link',
		'color.heading',
		'color.button',
		'color.caption',
		'dimensions.aspectRatio',
		'dimensions.height',
		'dimensions.minHeight',
		'dimensions.minWidth',
		'dimensions.width',
		'position.sticky',
		'spacing.blockGap',
		'spacing.margin',
		'spacing.padding',
		'typography.lineHeight',
		'typography.textColumns',
	];

	function isAppearanceToolsOptIn( keyArray ) {
		return keyArray.length === 3 &&
			keyArray[ 0 ] === 'settings' &&
			APPEARANCE_TOOLS_OPT_INS.indexOf( keyArray[ 1 ] + '.' + keyArray[ 2 ] ) !== -1;
	}

	// オーバーライドが無い場合に適用される値と、その出どころを返す.
	// オーバーライド側で appearanceTools を ON にすると、ユーザー origin の未指定項目が true になり、テーマの明示値より優先される.
	function getInheritedValue( setting ) {
		var themeVal = getNestedValue( themeData, setting.key );
		var isOptIn  = isAppearanceToolsOptIn( setting.key );

		if ( isOptIn && getNestedValue( overrideData, [ 'settings', 'appearanceTools' ] ) === true ) {
			return { value: true, source: 'appearanceTools' };
		}
		if ( themeVal !== undefined ) {
			return { value: themeVal, source: 'theme' };
		}
		if ( isOptIn && getNestedValue( themeData, [ 'settings', 'appearanceTools' ] ) === true ) {
			return { value: true, source: 'appearanceTools' };
		}
		return { value: setting.wpDefault, source: 'wp' };
	}

	// =========================================================================
	// ネストパスのユーティリティ
	// =========================================================================

	function getNestedValue( obj, keyArray ) {
		return keyArray.reduce( function ( o, k ) {
			return ( o !== null && o !== undefined && typeof o === 'object' ) ? o[ k ] : undefined;
		}, obj );
	}

	function setNestedValue( obj, keyArray, value ) {
		var current = obj;
		for ( var i = 0; i < keyArray.length - 1; i++ ) {
			var k = keyArray[ i ];
			if ( current[ k ] === null || current[ k ] === undefined || typeof current[ k ] !== 'object' ) {
				current[ k ] = {};
			}
			current = current[ k ];
		}
		current[ keyArray[ keyArray.length - 1 ] ] = value;
	}

	function deleteNestedValue( obj, keyArray ) {
		var current = obj;
		for ( var i = 0; i < keyArray.length - 1; i++ ) {
			var k = keyArray[ i ];
			if ( ! current[ k ] ) {
				return;
			}
			current = current[ k ];
		}
		delete current[ keyArray[ keyArray.length - 1 ] ];
	}

	// =========================================================================
	// 状態
	// =========================================================================

	var overrideData = {};
	var themeData    = {};
	var activeCatId  = CATEGORIES[ 0 ].id;

	// =========================================================================
	// DOM 参照
	// =========================================================================

	var notice        = document.getElementById( 'ntjs-notice' );
	var themeNameEl   = document.getElementById( 'ntjs-theme-name' );
	var overrideBadge = document.getElementById( 'ntjs-override-badge' );
	var btnSave       = document.getElementById( 'ntjs-btn-save' );
	var btnReset      = document.getElementById( 'ntjs-btn-reset' );
	var sidebar       = document.getElementById( 'ntjs-sidebar' );
	var content       = document.getElementById( 'ntjs-content' );
	var rawEditor     = document.getElementById( 'ntjs-raw-editor' );
	var themeEditor   = document.getElementById( 'ntjs-theme-editor' );
	var filePathEl    = document.getElementById( 'ntjs-file-path' );
	var tabs          = document.querySelectorAll( '.ntjs-tab' );
	var panels        = document.querySelectorAll( '.ntjs-panel' );

	// =========================================================================
	// 通知
	// =========================================================================

	function showNotice( message, type ) {
		type = type || 'success';
		notice.textContent   = message;
		notice.className     = 'ntjs-notice ntjs-notice--' + type;
		notice.style.display = 'block';
		clearTimeout( notice._timer );
		notice._timer = setTimeout( function () {
			notice.style.display = 'none';
		}, 3500 );
	}

	// =========================================================================
	// API
	// =========================================================================

	function apiFetch( path, options ) {
		options = options || {};
		return fetch( apiBase + path, Object.assign(
			{
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': nonce,
				},
			},
			options
		) ).then( function ( res ) {
			return res.json();
		} );
	}

	// =========================================================================
	// オーバーライドバッジの更新
	// =========================================================================

	function updateOverrideBadge() {
		var hasOverride = Object.keys( overrideData ).length > 0;
		overrideBadge.style.display = hasOverride ? 'inline-flex' : 'none';
	}

	// =========================================================================
	// サイドバー描画
	// =========================================================================

	function renderSidebar() {
		sidebar.innerHTML = '';
		CATEGORIES.forEach( function ( cat ) {
			var customCount = countCustomInCategory( cat );
			var btn         = document.createElement( 'button' );
			btn.className   = 'ntjs-nav-item' + ( cat.id === activeCatId ? ' is-active' : '' );
			btn.dataset.cat = cat.id;

			var iconEl  = document.createElement( 'span' );
			iconEl.className   = 'ntjs-nav-icon';
			iconEl.textContent = cat.icon;

			var labelEl  = document.createElement( 'span' );
			labelEl.className   = 'ntjs-nav-label';
			labelEl.textContent = cat.label;

			btn.appendChild( iconEl );
			btn.appendChild( labelEl );

			if ( customCount > 0 ) {
				var countEl  = document.createElement( 'span' );
				countEl.className   = 'ntjs-nav-count';
				countEl.textContent = customCount;
				btn.appendChild( countEl );
			}

			btn.addEventListener( 'click', function () {
				activeCatId = cat.id;
				renderSidebar();
				renderContent();
			} );

			sidebar.appendChild( btn );
		} );
	}

	function countCustomInCategory( cat ) {
		var count = 0;
		cat.settings.forEach( function ( setting ) {
			if ( getNestedValue( overrideData, setting.key ) !== undefined ) {
				count++;
			}
		} );
		return count;
	}

	// =========================================================================
	// コンテンツ描画
	// =========================================================================

	function renderContent() {
		content.innerHTML = '';
		var cat = CATEGORIES.find( function ( c ) { return c.id === activeCatId; } );
		if ( ! cat ) {
			return;
		}

		var header  = document.createElement( 'div' );
		header.className   = 'ntjs-content-header';

		var title  = document.createElement( 'h2' );
		title.className   = 'ntjs-content-title';
		title.textContent = cat.label;
		header.appendChild( title );
		content.appendChild( header );

		var list = document.createElement( 'div' );
		list.className = 'ntjs-setting-list';

		cat.settings.forEach( function ( setting ) {
			var row;
			if ( cat.type === 'viewport' ) {
				row = buildViewportSettingRow( setting );
			} else if ( setting.type === 'select' ) {
				row = buildSelectSettingRow( setting );
			} else {
				row = buildSettingRow( setting );
			}
			list.appendChild( row );
		} );

		content.appendChild( list );
	}

	function buildSettingRow( setting ) {
		var overrideVal = getNestedValue( overrideData, setting.key );
		var themeVal    = getNestedValue( themeData, setting.key );
		var isOverridden = overrideVal !== undefined;

		var inherited    = getInheritedValue( setting );

		// 実効値: オーバーライド → 外観ツール（オーバーライド）→ テーマ → 外観ツール（テーマ）→ WP デフォルト の優先順
		var effectiveVal = isOverridden ? overrideVal : inherited.value;

		var row = document.createElement( 'div' );
		row.className = 'ntjs-setting-row' + ( isOverridden ? ' is-overridden' : '' );

		// 左側：ラベル + 説明
		var info = document.createElement( 'div' );
		info.className = 'ntjs-setting-info';

		var labelEl  = document.createElement( 'div' );
		labelEl.className   = 'ntjs-setting-label';
		labelEl.textContent = setting.label;
		info.appendChild( labelEl );

		var descEl  = document.createElement( 'div' );
		descEl.className   = 'ntjs-setting-desc';
		descEl.textContent = setting.description;
		info.appendChild( descEl );

		// テーマのデフォルト値（または外観ツール・WP デフォルトによる値）の表示
		var inheritedText = '';
		if ( inherited.source === 'appearanceTools' ) {
			inheritedText = __( '外観ツール（appearanceTools）により有効', 'next-theme-json-setup' );
		} else if ( themeVal !== undefined ) {
			/* translators: %s: 現在の値. */
			inheritedText = sprintf( __( 'テーマのデフォルト: %s', 'next-theme-json-setup' ), formatSettingValue( themeVal ) );
		} else if ( setting.wpDefault === null ) {
			inheritedText = __( 'WP のデフォルト: 未設定（テーマが対応していない扱い）', 'next-theme-json-setup' );
		}
		if ( inheritedText ) {
			var themeValEl  = document.createElement( 'div' );
			themeValEl.className   = 'ntjs-setting-theme-val';
			themeValEl.textContent = inheritedText;
			info.appendChild( themeValEl );
		}

		row.appendChild( info );

		// 右側：バッジ + トグル + クリアボタン
		var control = document.createElement( 'div' );
		control.className = 'ntjs-setting-control';

		if ( isOverridden ) {
			var badge  = document.createElement( 'span' );
			badge.className   = 'ntjs-badge ntjs-badge--custom';
			badge.textContent = __( 'カスタム', 'next-theme-json-setup' );
			control.appendChild( badge );
		}

		// トグルスイッチ
		var label      = document.createElement( 'label' );
		label.className   = 'ntjs-switch';
		label.title = isSettingEnabled( effectiveVal ) ? __( 'ON', 'next-theme-json-setup' ) : __( 'OFF', 'next-theme-json-setup' );

		var checkbox = document.createElement( 'input' );
		checkbox.type    = 'checkbox';
		checkbox.checked = isSettingEnabled( effectiveVal );

		var track = document.createElement( 'span' );
		track.className = 'ntjs-switch-track';

		label.appendChild( checkbox );
		label.appendChild( track );

		checkbox.addEventListener( 'change', function () {
			setNestedValue( overrideData, setting.key, checkbox.checked );
			syncRawEditor();
			updateOverrideBadge();
			renderSidebar();
			renderContent();
		} );

		control.appendChild( label );

		// クリアボタン（オーバーライド中のみ表示）
		if ( isOverridden ) {
			var clearBtn  = document.createElement( 'button' );
			clearBtn.className   = 'ntjs-clear-btn';
			clearBtn.textContent = __( '× クリア', 'next-theme-json-setup' );
			clearBtn.title       = __( 'このオーバーライドを削除', 'next-theme-json-setup' );
			clearBtn.addEventListener( 'click', function () {
				deleteNestedValue( overrideData, setting.key );
				syncRawEditor();
				updateOverrideBadge();
				renderSidebar();
				renderContent();
			} );
			control.appendChild( clearBtn );
		}

		row.appendChild( control );
		return row;
	}

	// 設定値が「有効」とみなせるかを判定する.
	// background.backgroundClip のように、true の代わりに許可値の配列（例: [ "text" ]）を取る設定もあるため配列も考慮する.
	function isSettingEnabled( value ) {
		if ( Array.isArray( value ) ) {
			return value.length > 0;
		}
		return value === true;
	}

	// テーマのデフォルト値を表示用の文字列に変換する.
	function formatSettingValue( value ) {
		if ( typeof value === 'boolean' ) {
			return value ? 'true' : 'false';
		}
		return JSON.stringify( value );
	}

	// =========================================================================
	// セレクト設定行（settings.typography.textIndent など、文字列の選択肢を持つ設定）
	// =========================================================================

	function buildSelectSettingRow( setting ) {
		var overrideVal  = getNestedValue( overrideData, setting.key );
		var themeVal     = getNestedValue( themeData, setting.key );
		var isOverridden = overrideVal !== undefined;

		// 実効値: オーバーライド → テーマ → WP デフォルト の優先順
		var effectiveVal = isOverridden ? overrideVal : ( themeVal !== undefined ? themeVal : setting.wpDefault );

		var row = document.createElement( 'div' );
		row.className = 'ntjs-setting-row' + ( isOverridden ? ' is-overridden' : '' );

		// 左側：ラベル + 説明
		var info = document.createElement( 'div' );
		info.className = 'ntjs-setting-info';

		var labelEl  = document.createElement( 'div' );
		labelEl.className   = 'ntjs-setting-label';
		labelEl.textContent = setting.label;
		info.appendChild( labelEl );

		var descEl  = document.createElement( 'div' );
		descEl.className   = 'ntjs-setting-desc';
		descEl.textContent = setting.description;
		info.appendChild( descEl );

		var defaultValEl  = document.createElement( 'div' );
		defaultValEl.className   = 'ntjs-setting-theme-val';
		if ( themeVal !== undefined ) {
			/* translators: %s: 現在の値. */
			defaultValEl.textContent = sprintf( __( 'テーマのデフォルト: %s', 'next-theme-json-setup' ), formatSettingValue( themeVal ) );
		} else {
			/* translators: %s: 現在の値. */
			defaultValEl.textContent = sprintf( __( 'WP のデフォルト: %s', 'next-theme-json-setup' ), formatSettingValue( setting.wpDefault ) );
		}
		info.appendChild( defaultValEl );

		row.appendChild( info );

		// 右側：バッジ + セレクトボックス + クリアボタン
		var control = document.createElement( 'div' );
		control.className = 'ntjs-setting-control';

		if ( isOverridden ) {
			var badge  = document.createElement( 'span' );
			badge.className   = 'ntjs-badge ntjs-badge--custom';
			badge.textContent = __( 'カスタム', 'next-theme-json-setup' );
			control.appendChild( badge );
		}

		// option の value は文字列しか持てないため、選択肢のインデックスで値を対応付ける.
		var select = document.createElement( 'select' );
		select.className = 'ntjs-select';
		select.setAttribute( 'aria-label', setting.label );

		setting.options.forEach( function ( option, index ) {
			var optionEl  = document.createElement( 'option' );
			optionEl.value       = String( index );
			optionEl.textContent = option.label;
			optionEl.selected    = option.value === effectiveVal;
			select.appendChild( optionEl );
		} );

		select.addEventListener( 'change', function () {
			setNestedValue( overrideData, setting.key, setting.options[ Number( select.value ) ].value );
			syncRawEditor();
			updateOverrideBadge();
			renderSidebar();
			renderContent();
		} );

		control.appendChild( select );

		// クリアボタン（オーバーライド中のみ表示）
		if ( isOverridden ) {
			var clearBtn  = document.createElement( 'button' );
			clearBtn.className   = 'ntjs-clear-btn';
			clearBtn.textContent = __( '× クリア', 'next-theme-json-setup' );
			clearBtn.title       = __( 'このオーバーライドを削除', 'next-theme-json-setup' );
			clearBtn.addEventListener( 'click', function () {
				deleteNestedValue( overrideData, setting.key );
				syncRawEditor();
				updateOverrideBadge();
				renderSidebar();
				renderContent();
			} );
			control.appendChild( clearBtn );
		}

		row.appendChild( control );
		return row;
	}

	// =========================================================================
	// ビューポート設定行（settings.viewport.mobile / tablet）
	// ブール値ではなく単位付き文字列（例: "480px"）を扱うため、buildSettingRow とは別に描画する。
	// =========================================================================

	function isValidViewportValue( value ) {
		return typeof value === 'string' && /^(?:\d+|\d*\.\d+)(?:px|em|rem)$/.test( value.trim() );
	}

	function buildViewportSettingRow( setting ) {
		var overrideVal  = getNestedValue( overrideData, setting.key );
		var themeVal     = getNestedValue( themeData, setting.key );
		var isOverridden = overrideVal !== undefined;

		var row = document.createElement( 'div' );
		row.className = 'ntjs-setting-row' + ( isOverridden ? ' is-overridden' : '' );

		// 左側：ラベル + 説明
		var info = document.createElement( 'div' );
		info.className = 'ntjs-setting-info';

		var labelEl  = document.createElement( 'div' );
		labelEl.className   = 'ntjs-setting-label';
		labelEl.textContent = setting.label;
		info.appendChild( labelEl );

		var descEl  = document.createElement( 'div' );
		descEl.className   = 'ntjs-setting-desc';
		descEl.textContent = setting.description;
		info.appendChild( descEl );

		var defaultValEl  = document.createElement( 'div' );
		defaultValEl.className   = 'ntjs-setting-theme-val';
		if ( isValidViewportValue( themeVal ) ) {
			/* translators: %s: 現在の値. */
			defaultValEl.textContent = sprintf( __( 'テーマのデフォルト: %s', 'next-theme-json-setup' ), themeVal );
		} else {
			/* translators: %s: 現在の値. */
			defaultValEl.textContent = sprintf( __( 'WP のデフォルト: %s', 'next-theme-json-setup' ), setting.wpDefault );
		}
		info.appendChild( defaultValEl );

		row.appendChild( info );

		// 右側：バッジ + 有効化トグル + 単位付き数値入力（UnitControl） + クリアボタン
		var control = document.createElement( 'div' );
		control.className = 'ntjs-setting-control ntjs-setting-control--viewport';

		if ( isOverridden ) {
			var badge  = document.createElement( 'span' );
			badge.className   = 'ntjs-badge ntjs-badge--custom';
			badge.textContent = __( 'カスタム', 'next-theme-json-setup' );
			control.appendChild( badge );
		}

		// 有効/無効トグル。
		var label      = document.createElement( 'label' );
		label.className = 'ntjs-switch';
		label.title      = isOverridden ? __( 'ON', 'next-theme-json-setup' ) : __( 'OFF', 'next-theme-json-setup' );

		var checkbox = document.createElement( 'input' );
		checkbox.type    = 'checkbox';
		checkbox.checked = isOverridden;

		var track = document.createElement( 'span' );
		track.className = 'ntjs-switch-track';

		label.appendChild( checkbox );
		label.appendChild( track );

		checkbox.addEventListener( 'change', function () {
			if ( checkbox.checked ) {
				var initialValue = isValidViewportValue( themeVal ) ? themeVal : setting.wpDefault;
				setNestedValue( overrideData, setting.key, initialValue );
			} else {
				deleteNestedValue( overrideData, setting.key );
			}
			syncRawEditor();
			updateOverrideBadge();
			renderSidebar();
			renderContent();
		} );

		control.appendChild( label );

		// 単位付き数値入力（有効時のみ表示）。
		if ( isOverridden ) {
			var unitControlHost = document.createElement( 'div' );
			unitControlHost.className = 'ntjs-unit-control-host';
			control.appendChild( unitControlHost );

			mountViewportUnitControl(
				unitControlHost,
				isValidViewportValue( overrideVal ) ? overrideVal : setting.wpDefault,
				setting.label,
				function ( newValue ) {
					setNestedValue( overrideData, setting.key, newValue );
					syncRawEditor();
					updateOverrideBadge();
				}
			);
		}

		// クリアボタン（オーバーライド中のみ表示）
		if ( isOverridden ) {
			var clearBtn  = document.createElement( 'button' );
			clearBtn.className   = 'ntjs-clear-btn';
			clearBtn.textContent = __( '× クリア', 'next-theme-json-setup' );
			clearBtn.title       = __( 'このオーバーライドを削除', 'next-theme-json-setup' );
			clearBtn.addEventListener( 'click', function () {
				deleteNestedValue( overrideData, setting.key );
				syncRawEditor();
				updateOverrideBadge();
				renderSidebar();
				renderContent();
			} );
			control.appendChild( clearBtn );
		}

		row.appendChild( control );
		return row;
	}

	/**
	 * 幅入力欄を WordPress コアの UnitControl（wp.components）でマウントする。
	 * コアコンポーネントが利用できない環境（読み込み失敗など）ではテキスト入力にフォールバックする。
	 */
	function mountViewportUnitControl( container, initialValue, label, onChange ) {
		var UnitControl = window.wp && window.wp.components
			? ( wp.components.UnitControl || wp.components.__experimentalUnitControl )
			: null;

		if ( ! UnitControl || ! window.wp.element ) {
			var fallback = document.createElement( 'input' );
			fallback.type      = 'text';
			fallback.className = 'ntjs-unit-fallback-input';
			fallback.value     = initialValue;
			fallback.addEventListener( 'change', function () {
				onChange( fallback.value );
			} );
			container.appendChild( fallback );
			return;
		}

		var el           = wp.element.createElement;
		var currentValue = initialValue;

		// UnitControl は制御コンポーネントのため、onChange のたびに value を持ち回して
		// 同じルートに再描画する（DOM ノードは React が差分更新するのでフォーカスは失われない）。
		function renderControl() {
			var element = el( UnitControl, {
				value: currentValue,
				units: VIEWPORT_UNITS,
				min: 0,
				size: 'compact',
				label: label,
				hideLabelFromVision: true,
				onChange: function ( newValue ) {
					currentValue = newValue || '';
					onChange( currentValue );
					renderControl();
				},
			} );

			if ( wp.element.createRoot ) {
				if ( ! container._ntjsRoot ) {
					container._ntjsRoot = wp.element.createRoot( container );
				}
				container._ntjsRoot.render( element );
			} else {
				wp.element.render( element, container );
			}
		}

		renderControl();
	}

	// =========================================================================
	// Raw エディターとの同期
	// =========================================================================

	function syncRawEditor() {
		rawEditor.value = JSON.stringify( overrideData, null, 2 );
		rawEditor.classList.remove( 'ntjs-invalid' );
	}

	rawEditor.addEventListener( 'input', function () {
		try {
			overrideData = JSON.parse( rawEditor.value );
			rawEditor.classList.remove( 'ntjs-invalid' );
			updateOverrideBadge();
			renderSidebar();
			renderContent();
		} catch ( e ) {
			rawEditor.classList.add( 'ntjs-invalid' );
		}
	} );

	// =========================================================================
	// タブ切り替え
	// =========================================================================

	tabs.forEach( function ( tab ) {
		tab.addEventListener( 'click', function () {
			tabs.forEach( function ( t ) { t.classList.remove( 'active' ); } );
			panels.forEach( function ( p ) { p.style.display = 'none'; } );
			tab.classList.add( 'active' );
			document.getElementById( 'ntjs-panel-' + tab.dataset.tab ).style.display = 'block';
		} );
	} );

	// =========================================================================
	// 保存
	// =========================================================================

	btnSave.addEventListener( 'click', function () {
		if ( rawEditor.classList.contains( 'ntjs-invalid' ) ) {
			showNotice( i18n.invalidJson, 'error' );
			return;
		}

		btnSave.disabled = true;

		apiFetch( '/override', {
			method: 'POST',
			body: JSON.stringify( { content: JSON.stringify( overrideData ) } ),
		} ).then( function ( result ) {
			btnSave.disabled = false;
			if ( result.error ) {
				showNotice( result.error, 'error' );
			} else {
				showNotice( i18n.saved );
			}
		} ).catch( function () {
			btnSave.disabled = false;
			showNotice( i18n.saveError, 'error' );
		} );
	} );

	// =========================================================================
	// リセット
	// =========================================================================

	btnReset.addEventListener( 'click', function () {
		if ( ! window.confirm( i18n.confirmReset ) ) {
			return;
		}

		apiFetch( '/override/reset', { method: 'POST' } ).then( function ( result ) {
			if ( result.error ) {
				showNotice( result.error, 'error' );
			} else {
				overrideData = {};
				syncRawEditor();
				updateOverrideBadge();
				renderSidebar();
				renderContent();
				showNotice( i18n.resetDone );
			}
		} );
	} );

	// =========================================================================
	// 初期読み込み
	// =========================================================================

	function loadAll() {
		Promise.all( [
			apiFetch( '/theme-json' ),
			apiFetch( '/override' ),
		] ).then( function ( results ) {
			var themeResult    = results[ 0 ];
			var overrideResult = results[ 1 ];

			themeData = themeResult.data || {};
			themeNameEl.textContent = themeResult.theme_name || '—';

			if ( filePathEl ) {
				filePathEl.textContent = themeResult.path || '';
			}

			themeEditor.value = JSON.stringify( themeData, null, 2 );

			overrideData = ( overrideResult.has_override && overrideResult.data )
				? overrideResult.data
				: {};

			syncRawEditor();
			updateOverrideBadge();
			renderSidebar();
			renderContent();

			btnSave.disabled = false;
		} ).catch( function ( err ) {
			showNotice(
				/* translators: %s: エラーメッセージ. */
				sprintf( __( '読み込みに失敗しました: %s', 'next-theme-json-setup' ), err.message ),
				'error'
			);
		} );
	}

	loadAll();
} )();
