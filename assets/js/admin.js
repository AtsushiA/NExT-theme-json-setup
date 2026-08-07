/* global nextThemeJsonSetup */

( function () {
	'use strict';

	const { apiBase, nonce, i18n } = nextThemeJsonSetup;

	// =========================================================================
	// 設定スキーマ定義（theme.json v3 のブール設定をカテゴリ別に列挙）
	// key: ネストしたパスをキーの配列で表現（'core/image' のようなスラッシュ含むキーに対応）
	// wpDefault: WordPress 本体のデフォルト値
	// =========================================================================
	const CATEGORIES = [
		{
			id: 'general',
			label: '一般',
			icon: '⚙',
			settings: [
				{
					key: [ 'settings', 'appearanceTools' ],
					label: '外観ツール一括有効化',
					description: 'ボーダー・カラー・タイポグラフィなどの外観コントロールをまとめて有効化します。各カテゴリの個別設定より優先されます。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'useRootPaddingAwareAlignments' ],
					label: 'ルートパディング対応の整列',
					description: 'コンテンツのパディングを考慮し、フルワイドブロックが正しく端まで伸びるよう調整します。',
					wpDefault: false,
				},
			],
		},
		{
			id: 'background',
			label: '背景',
			icon: '▤',
			settings: [
				{
					key: [ 'settings', 'background', 'backgroundImage' ],
					label: '背景画像',
					description: 'ブロックに背景画像を設定できるようにします。WordPress 6.5 以降で利用可能。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'background', 'backgroundSize' ],
					label: '背景画像のサイズ・位置',
					description: '背景画像のサイズ・繰り返し・位置（focal point）を設定できるようにします。WordPress 6.6 以降で利用可能。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'background', 'gradient' ],
					label: 'グラデーション背景',
					description: 'ブロックの背景としてグラデーションを設定できるようにします。背景画像と併用できます。WordPress 7.1 以降で利用可能。',
					wpDefault: false,
				},
			],
		},
		{
			id: 'border',
			label: 'ボーダー',
			icon: '▢',
			settings: [
				{
					key: [ 'settings', 'border', 'color' ],
					label: 'ボーダーカラー',
					description: 'ブロックのボーダーカラーを Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'border', 'radius' ],
					label: '角丸（border-radius）',
					description: 'ブロックの角丸を Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'border', 'style' ],
					label: 'ボーダースタイル',
					description: 'solid / dashed / dotted などのボーダースタイルを Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'border', 'width' ],
					label: 'ボーダー幅',
					description: 'ボーダーの幅を Site Editor で設定できるようにします。',
					wpDefault: false,
				},
			],
		},
		{
			id: 'color',
			label: 'カラー',
			icon: '◉',
			settings: [
				{
					key: [ 'settings', 'color', 'background' ],
					label: '背景色',
					description: 'ブロックの背景色を Site Editor で設定できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'custom' ],
					label: 'カスタムカラー',
					description: 'カラーピッカーで任意の色を指定できるようにします。false にするとテーマのプリセットのみに制限されます。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'customDuotone' ],
					label: 'カスタムデュオトーン',
					description: 'ユーザーが独自のデュオトーンフィルターを作成できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'customGradient' ],
					label: 'カスタムグラデーション',
					description: 'ユーザーが独自のグラデーションを作成できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'defaultDuotone' ],
					label: 'デフォルトデュオトーン',
					description: 'WordPress が提供するデフォルトのデュオトーンフィルタープリセットを表示します。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'defaultGradients' ],
					label: 'デフォルトグラデーション',
					description: 'WordPress が提供するデフォルトのグラデーションプリセットを表示します。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'defaultPalette' ],
					label: 'デフォルトカラーパレット',
					description: 'WordPress が提供するデフォルトのカラーパレットを表示します。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'link' ],
					label: 'リンクカラー',
					description: 'リンクテキストの色を Site Editor で設定できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'text' ],
					label: 'テキストカラー',
					description: 'ブロックのテキスト色を Site Editor で設定できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'color', 'heading' ],
					label: '見出しカラー',
					description: '見出し要素の色を Site Editor で個別に設定できるようにします。WordPress 6.6 以降で利用可能。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'color', 'button' ],
					label: 'ボタンカラー',
					description: 'ボタン要素の色を Site Editor で個別に設定できるようにします。WordPress 6.6 以降で利用可能。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'color', 'caption' ],
					label: 'キャプションカラー',
					description: 'キャプション要素の色を Site Editor で個別に設定できるようにします。WordPress 6.6 以降で利用可能。',
					wpDefault: false,
				},
			],
		},
		{
			id: 'typography',
			label: 'タイポグラフィ',
			icon: 'Aa',
			settings: [
				{
					key: [ 'settings', 'typography', 'customFontSize' ],
					label: 'カスタムフォントサイズ',
					description: 'プリセット以外の任意のフォントサイズを入力できるようにします。false にするとプリセットのみに制限されます。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'dropCap' ],
					label: 'ドロップキャップ',
					description: '段落の最初の文字を大きく装飾するドロップキャップを使用できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'fluid' ],
					label: 'フルードタイポグラフィ',
					description: 'ビューポートサイズに応じてフォントサイズが滑らかに変化するレスポンシブなタイポグラフィを有効にします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'typography', 'fontStyle' ],
					label: 'フォントスタイル',
					description: 'イタリックなどのフォントスタイルを Site Editor で設定できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'fontWeight' ],
					label: 'フォントウェイト',
					description: 'フォントの太さ（Thin 〜 Black）を Site Editor で設定できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'letterSpacing' ],
					label: '文字間隔（letter-spacing）',
					description: '文字間隔を Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'typography', 'lineHeight' ],
					label: '行の高さ（line-height）',
					description: '行間を Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'typography', 'textColumns' ],
					label: 'テキストカラム数',
					description: 'テキストを複数カラムで表示する設定を Site Editor で使用できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'typography', 'textDecoration' ],
					label: 'テキスト装飾',
					description: '下線・打ち消し線などのテキスト装飾を Site Editor で設定できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'textTransform' ],
					label: 'テキスト変換（大文字/小文字）',
					description: 'uppercase / lowercase / capitalize などのテキスト変換を Site Editor で設定できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'writingMode' ],
					label: '縦書き（writing-mode）',
					description: '縦書きなどのテキスト方向を Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'typography', 'textAlign' ],
					label: 'テキスト配置',
					description: 'テキストの左揃え・中央揃え・右揃えを Site Editor で設定できるようにします。WordPress 6.6 以降で利用可能。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'typography', 'defaultFontSizes' ],
					label: 'デフォルトフォントサイズ',
					description: 'WordPress が提供するデフォルトのフォントサイズプリセット（Small 〜 Extra Large）を表示します。WordPress 6.6 以降で利用可能。',
					wpDefault: true,
				},
			],
		},
		{
			id: 'spacing',
			label: 'スペーシング',
			icon: '⇔',
			settings: [
				{
					key: [ 'settings', 'spacing', 'blockGap' ],
					label: 'ブロック間隔（blockGap）',
					description: 'ブロック間の余白を Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'spacing', 'customSpacingSize' ],
					label: 'カスタムスペーシングサイズ',
					description: 'プリセット以外の任意の余白サイズを入力できるようにします。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'spacing', 'margin' ],
					label: 'マージン（外側の余白）',
					description: 'ブロックの外側の余白（margin）を Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'spacing', 'padding' ],
					label: 'パディング（内側の余白）',
					description: 'ブロックの内側の余白（padding）を Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'spacing', 'defaultSpacingSizes' ],
					label: 'デフォルトスペーシングサイズ',
					description: 'WordPress が提供するデフォルトのスペーシングサイズプリセットを表示します。WordPress 6.6 以降で利用可能。',
					wpDefault: true,
				},
			],
		},
		{
			id: 'dimensions',
			label: 'ディメンション',
			icon: '↕',
			settings: [
				{
					key: [ 'settings', 'dimensions', 'minHeight' ],
					label: '最小高さ（min-height）',
					description: '対応ブロックの最小高さを Site Editor で設定できるようにします。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'dimensions', 'aspectRatio' ],
					label: 'アスペクト比',
					description: '対応ブロックのアスペクト比（縦横比）を Site Editor で設定できるようにします。WordPress 6.5 以降で利用可能。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'dimensions', 'defaultAspectRatios' ],
					label: 'デフォルトアスペクト比プリセット',
					description: 'WordPress が提供するデフォルトのアスペクト比プリセット（1:1 / 4:3 / 16:9 など）を表示します。WordPress 6.6 以降で利用可能。',
					wpDefault: true,
				},
				{
					key: [ 'settings', 'dimensions', 'minWidth' ],
					label: '最小幅（min-width）',
					description: '対応ブロックの最小幅を Site Editor で設定できるようにします。WordPress 7.1 以降で利用可能。',
					wpDefault: false,
				},
			],
		},
		{
			id: 'position',
			label: 'ポジション',
			icon: '⊡',
			settings: [
				{
					key: [ 'settings', 'position', 'sticky' ],
					label: 'スティッキーポジション',
					description: 'ブロックをスクロール時に画面上部に固定する sticky 配置を対応ブロックで使用できるようにします。',
					wpDefault: false,
				},
			],
		},
		{
			id: 'shadow',
			label: 'シャドウ',
			icon: '◫',
			settings: [
				{
					key: [ 'settings', 'shadow', 'defaultPresets' ],
					label: 'デフォルトシャドウプリセット',
					description: 'WordPress が提供する Natural / Deep / Sharp / Outlined / Crisp などのシャドウプリセットを表示します。',
					wpDefault: true,
				},
			],
		},
		{
			id: 'lightbox',
			label: 'ライトボックス',
			icon: '⊞',
			settings: [
				{
					key: [ 'settings', 'blocks', 'core/image', 'lightbox', 'enabled' ],
					label: 'ライトボックスを有効化',
					description: '画像ブロックをクリックしたときにライトボックス（拡大表示）を使用します。WordPress 6.4 以降で利用可能。',
					wpDefault: false,
				},
				{
					key: [ 'settings', 'blocks', 'core/image', 'lightbox', 'allowEditing' ],
					label: 'ライトボックス編集を許可',
					description: 'ユーザーが画像ブロックごとにライトボックスの有効・無効を変更できるようにします。',
					wpDefault: true,
				},
			],
		},
		{
			id: 'blockVisibility',
			label: 'ブロックの表示/非表示',
			icon: '◐',
			settings: [
				{
					key: [ 'settings', 'blockVisibility', 'allowEditing' ],
					label: '表示/非表示設定の編集を許可',
					description: 'エディター上でブロックごとの表示・非表示（デバイス別の切り替えなど）を編集できるようにします。false にすると編集 UI が非表示になりますが、既存の表示設定自体は変更されません。WordPress 7.1 以降で利用可能。',
					wpDefault: true,
				},
			],
		},
	];

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
			list.appendChild( buildSettingRow( setting ) );
		} );

		content.appendChild( list );
	}

	function buildSettingRow( setting ) {
		var overrideVal = getNestedValue( overrideData, setting.key );
		var themeVal    = getNestedValue( themeData, setting.key );
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

		// テーマのデフォルト値の表示
		if ( themeVal !== undefined ) {
			var themeValEl  = document.createElement( 'div' );
			themeValEl.className   = 'ntjs-setting-theme-val';
			themeValEl.textContent = 'テーマのデフォルト: ' + ( themeVal ? 'true' : 'false' );
			info.appendChild( themeValEl );
		}

		row.appendChild( info );

		// 右側：バッジ + トグル + クリアボタン
		var control = document.createElement( 'div' );
		control.className = 'ntjs-setting-control';

		if ( isOverridden ) {
			var badge  = document.createElement( 'span' );
			badge.className   = 'ntjs-badge ntjs-badge--custom';
			badge.textContent = 'カスタム';
			control.appendChild( badge );
		}

		// トグルスイッチ
		var label      = document.createElement( 'label' );
		label.className   = 'ntjs-switch';
		label.title = effectiveVal ? 'ON' : 'OFF';

		var checkbox = document.createElement( 'input' );
		checkbox.type    = 'checkbox';
		checkbox.checked = effectiveVal === true;

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
			clearBtn.textContent = '× クリア';
			clearBtn.title       = 'このオーバーライドを削除';
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
			showNotice( '読み込みに失敗しました: ' + err.message, 'error' );
		} );
	}

	loadAll();
} )();
