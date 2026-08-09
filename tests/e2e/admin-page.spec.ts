import { execSync } from 'node:child_process';
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

// wp-cli 経由でサイト言語を切り替える（options-general.php の UI 操作より高速・安定）.
function switchSiteLanguage( locale: string ): void {
	execSync( `npx wp-env run tests-cli -- wp site switch-language ${ locale }`, { stdio: 'pipe' } );
}

test.describe( 'NExT theme.json Setup admin page', () => {
	test( '外観メニューから設定ページを開ける', async ( { admin, page } ) => {
		await admin.visitAdminPage(
			'themes.php',
			'page=next-theme-json-setup'
		);

		// 管理画面ページが 404 や権限エラーにならず表示される.
		await expect( page.locator( '#wpbody-content' ) ).toBeVisible();
		await expect( page.locator( 'body' ) ).not.toContainText(
			'You do not have sufficient permissions'
		);
	} );

	test( '外観サブメニューにエントリが存在する', async ( { admin, page } ) => {
		await admin.visitAdminPage( 'index.php' );

		const appearanceMenu = page.locator( '#menu-appearance' );
		await expect( appearanceMenu ).toContainText( 'theme.json' );
	} );

	test( 'v3 で追加された「背景」カテゴリが表示される', async ( { admin, page } ) => {
		await admin.visitAdminPage(
			'themes.php',
			'page=next-theme-json-setup'
		);

		// サイドバーは REST 取得後に描画される.
		const sidebar = page.locator( '#ntjs-sidebar' );
		await expect( sidebar.locator( '.ntjs-nav-item', { hasText: '背景' } ) ).toBeVisible();
	} );

	test( '「ビューポート」カテゴリで幅入力欄（UnitControl）を有効化できる', async ( { admin, page } ) => {
		await admin.visitAdminPage(
			'themes.php',
			'page=next-theme-json-setup'
		);

		const sidebar = page.locator( '#ntjs-sidebar' );
		await sidebar.locator( '.ntjs-nav-item', { hasText: 'ビューポート' } ).click();

		const content = page.locator( '#ntjs-content' );
		const mobileRow = content.locator( '.ntjs-setting-row' ).filter( {
			has: page.locator( '.ntjs-setting-label', { hasText: 'モバイル幅' } ),
		} );
		await expect( mobileRow ).toBeVisible();

		// トグルを有効化すると UnitControl（コアコンポーネント。数値入力＋単位セレクト）が表示される.
		await mobileRow.locator( '.ntjs-switch' ).click();
		const unitControlHost = mobileRow.locator( '.ntjs-unit-control-host' );
		await expect( unitControlHost.locator( 'input' ) ).toBeVisible();
		await expect( unitControlHost.locator( 'select' ) ).toBeVisible();
	} );

	// このテスト環境（wp-env）はサイト言語を日本語（ja）に固定しているため、
	// ここでは一時的に English (United States) へ切り替えて翻訳ファイル（languages/）が
	// PHP 側（gettext）・JS 側（wp.i18n）の両方で正しく読み込まれることを確認し、最後に ja へ戻す.
	test( 'サイト言語を English (United States) に切り替えると翻訳が反映される', async ( { admin, page } ) => {
		switchSiteLanguage( 'en_US' );

		try {
			await admin.visitAdminPage(
				'themes.php',
				'page=next-theme-json-setup'
			);

			// PHP 側（gettext, .mo）由来の文字列.
			await expect( page.locator( '.ntjs-title' ) ).toHaveText( 'theme.json Setup' );
			await expect( page.locator( '#ntjs-btn-save' ) ).toHaveText( 'Save' );

			// JS 側（wp.i18n, wp_set_script_translations の JSON カタログ）由来の文字列.
			const sidebar = page.locator( '#ntjs-sidebar' );
			await expect( sidebar.locator( '.ntjs-nav-item', { hasText: 'General' } ) ).toBeVisible();
			await expect( sidebar.locator( '.ntjs-nav-item', { hasText: 'Viewport' } ) ).toBeVisible();

			const content = page.locator( '#ntjs-content' );
			await expect( content.locator( '.ntjs-setting-label', { hasText: 'Enable all appearance tools' } ) ).toBeVisible();
		} finally {
			// 後続テストが日本語表示を前提としているため、必ず ja に戻す.
			switchSiteLanguage( 'ja' );
		}
	} );
} );
