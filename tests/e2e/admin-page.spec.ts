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
} );
