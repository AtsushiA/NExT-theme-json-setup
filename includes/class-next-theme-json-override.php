<?php
/**
 * theme.json オーバーライド
 *
 * wp_theme_json_data_user フィルターを使って、プラグインが保存した設定を
 * テーマの theme.json より高い優先度で注入する。
 *
 * WordPress theme.json カスケード（低 → 高）:
 *   default < blocks < theme < user ← ここに注入。
 *
 * @package NExT_Theme_Json_Setup
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * theme.json オーバーライドを管理するクラス。
 */
class Next_Theme_Json_Override {

	/**
	 * wp_options に保存するオプションキー。
	 *
	 * @var string
	 */
	const OPTION_KEY = 'next_theme_json_setup_overrides';

	/**
	 * フックを登録する。
	 *
	 * @return void
	 */
	public function register(): void {
		add_filter( 'wp_theme_json_data_user', array( $this, 'apply_overrides' ) );
	}

	/**
	 * プラグインの設定を user レベルの theme.json に注入する。
	 *
	 * @param WP_Theme_JSON_Data $theme_json theme.json データオブジェクト。
	 * @return WP_Theme_JSON_Data
	 */
	public function apply_overrides( WP_Theme_JSON_Data $theme_json ): WP_Theme_JSON_Data {
		$json = get_option( self::OPTION_KEY, '' );

		if ( empty( $json ) ) {
			return $theme_json;
		}

		$data = json_decode( $json, true );

		if ( json_last_error() !== JSON_ERROR_NONE || empty( $data ) ) {
			return $theme_json;
		}

		// version が無ければ付与する。
		if ( empty( $data['version'] ) ) {
			$data['version'] = 3;
		}

		$theme_json->update_with( $data );

		return $theme_json;
	}

	/**
	 * 保存済みオーバーライドを取得（連想配列）。
	 *
	 * @return array
	 */
	public static function get(): array {
		$json = get_option( self::OPTION_KEY, '' );

		if ( empty( $json ) ) {
			return array();
		}

		$data = json_decode( $json, true );
		return ( json_last_error() === JSON_ERROR_NONE && is_array( $data ) ) ? $data : array();
	}

	/**
	 * オーバーライドを保存する。
	 *
	 * @param array $data 保存するデータ。
	 * @return void
	 */
	public static function save( array $data ): void {
		$json = wp_json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
		update_option( self::OPTION_KEY, $json, false );
	}

	/**
	 * オーバーライドを削除する（リセット）。
	 *
	 * @return void
	 */
	public static function clear(): void {
		delete_option( self::OPTION_KEY );
	}
}
