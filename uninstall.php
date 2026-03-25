<?php
/**
 * アンインストール処理
 *
 * プラグインが削除されたときに wp_options に保存したデータを削除する。
 *
 * @package NExT_Theme_Json_Setup
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'next_theme_json_setup_overrides' );
