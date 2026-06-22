<?php
/**
 * PHPUnit bootstrap file for Unit tests (WordPress を読み込まない).
 *
 * @package NExT_Theme_Json_Setup
 */

require_once dirname( __DIR__, 3 ) . '/vendor/autoload.php';

// プラグインクラスは ABSPATH ガードを持つため、読み込み前に定義しておく.
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __DIR__, 3 ) . '/' );
}

require_once dirname( __DIR__, 3 ) . '/includes/class-next-theme-json-override.php';
