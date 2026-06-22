<?php
/**
 * PHPUnit bootstrap file for Integration tests (WordPress テスト環境を読み込む).
 *
 * @package NExT_Theme_Json_Setup
 */

// Composer autoloader.
require_once dirname( __DIR__, 2 ) . '/vendor/autoload.php';

$next_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $next_tests_dir ) {
	$next_tests_dir = '/tmp/wordpress-tests-lib';
}

require $next_tests_dir . '/includes/functions.php';

/**
 * テスト対象プラグインを手動で読み込む.
 *
 * @return void
 */
function next_theme_json_setup_manually_load_plugin() {
	require dirname( __DIR__, 2 ) . '/next-theme-json-setup.php';
}
tests_add_filter( 'muplugins_loaded', 'next_theme_json_setup_manually_load_plugin' );

// WordPress テスト環境を起動.
require $next_tests_dir . '/includes/bootstrap.php';
