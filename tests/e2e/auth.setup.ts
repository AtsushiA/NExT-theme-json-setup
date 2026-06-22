import { test as setup, expect } from '@wordpress/e2e-test-utils-playwright';

const authFile = 'tests/e2e/.auth/user.json';

setup( 'authenticate', async ( { page, baseURL } ) => {
	await page.goto( `${ baseURL }/wp-login.php` );
	await page.fill( '#user_login', 'admin' );
	await page.fill( '#user_pass', 'password' );
	await page.click( '#wp-submit' );
	await expect( page.locator( 'body.wp-admin' ) ).toBeVisible();
	await page.context().storageState( { path: authFile } );
} );
