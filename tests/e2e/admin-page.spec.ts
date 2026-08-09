import { test, expect } from '@wordpress/e2e-test-utils-playwright';

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
} );
