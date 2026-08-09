<?php
/**
 * Plugin Name:       NExT theme.json Setup
 * Plugin URI:        https://github.com/AtsushiA/NExT-theme-json-setup
 * Description:       有効化されているテーマの theme.json を管理画面から GUI で閲覧・編集・保存できるプラグイン。テーマファイルは書き換えず、オーバーライド設定として DB に保存して適用します。
 * Version:           0.5.0
 * Requires at least: 6.6
 * Requires PHP:      8.0
 * Author:            NExT
 * Author URI:        https://next-season.net
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       next-theme-json-setup
 * Domain Path:       /languages
 *
 * @package NExT_Theme_Json_Setup
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NEXT_THEME_JSON_SETUP_VERSION', '0.5.0' );
define( 'NEXT_THEME_JSON_SETUP_DIR', plugin_dir_path( __FILE__ ) );
define( 'NEXT_THEME_JSON_SETUP_URL', plugin_dir_url( __FILE__ ) );

require_once NEXT_THEME_JSON_SETUP_DIR . 'includes/class-next-theme-json-override.php';
require_once NEXT_THEME_JSON_SETUP_DIR . 'includes/class-next-theme-json-rest-api.php';

// 管理画面クラスは管理画面または REST API リクエスト時のみ読み込む。
if ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
	require_once NEXT_THEME_JSON_SETUP_DIR . 'includes/class-next-theme-json-admin-page.php';
}

/**
 * プラグインを初期化する。
 *
 * @return void
 */
function next_theme_json_setup_init(): void {
	$override = new Next_Theme_Json_Override();
	$override->register();

	$rest_api = new Next_Theme_Json_Rest_Api();
	$rest_api->register();

	// 管理画面ページはクラスが読み込まれているときのみ登録する（フロントエンドでは不要）。
	if ( class_exists( 'Next_Theme_Json_Admin_Page' ) ) {
		$admin_page = new Next_Theme_Json_Admin_Page();
		$admin_page->register();
	}
}
add_action( 'init', 'next_theme_json_setup_init' );
