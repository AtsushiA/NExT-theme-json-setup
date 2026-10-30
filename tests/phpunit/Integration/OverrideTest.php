<?php
/**
 * Integration tests for Next_Theme_Json_Override.
 *
 * @package NExT_Theme_Json_Setup
 */

namespace NextThemeJsonSetup\Tests\Integration;

use Next_Theme_Json_Override;
use WP_UnitTestCase;

/**
 * 実 DB に対する save / get / clear のラウンドトリップを検証する.
 */
class OverrideTest extends WP_UnitTestCase {

	/**
	 * 各テスト後にオプションを掃除する.
	 *
	 * @return void
	 */
	public function tear_down(): void {
		Next_Theme_Json_Override::clear();
		parent::tear_down();
	}

	/**
	 * save した内容が get で取り出せる.
	 *
	 * @return void
	 */
	public function test_save_then_get_roundtrip(): void {
		$data = array(
			'version'  => 3,
			'settings' => array( 'color' => array( 'custom' => false ) ),
		);

		Next_Theme_Json_Override::save( $data );

		$this->assertSame( $data, Next_Theme_Json_Override::get() );
	}

	/**
	 * オプションは autoload しない設定で保存される.
	 *
	 * @return void
	 */
	public function test_save_is_not_autoloaded(): void {
		Next_Theme_Json_Override::save( array( 'version' => 3 ) );

		$autoloaded = wp_load_alloptions();

		$this->assertArrayNotHasKey( Next_Theme_Json_Override::OPTION_KEY, $autoloaded );
	}

	/**
	 * clear するとオプションが削除され空配列が返る.
	 *
	 * @return void
	 */
	public function test_clear_removes_option(): void {
		Next_Theme_Json_Override::save( array( 'version' => 3 ) );
		Next_Theme_Json_Override::clear();

		$this->assertSame( array(), Next_Theme_Json_Override::get() );
		$this->assertFalse( get_option( Next_Theme_Json_Override::OPTION_KEY ) );
	}

	/**
	 * apply_overrides は version 未指定でも version 3 を補完する.
	 *
	 * @return void
	 */
	public function test_apply_overrides_injects_default_version(): void {
		Next_Theme_Json_Override::save(
			array( 'settings' => array( 'color' => array( 'custom' => false ) ) )
		);

		$override = new Next_Theme_Json_Override();
		$theme_json = new \WP_Theme_JSON_Data( array( 'version' => 3 ), 'theme' );

		$result = $override->apply_overrides( $theme_json );

		$this->assertInstanceOf( \WP_Theme_JSON_Data::class, $result );

		$settings = $result->get_theme_json()->get_settings();
		$this->assertFalse( $settings['color']['custom'] );
	}

	/**
	 * オーバーライド未設定なら apply_overrides はデータを変更しない.
	 *
	 * @return void
	 */
	public function test_apply_overrides_noop_when_empty(): void {
		$override = new Next_Theme_Json_Override();
		$theme_json = new \WP_Theme_JSON_Data( array( 'version' => 3 ), 'theme' );

		$result = $override->apply_overrides( $theme_json );

		$this->assertInstanceOf( \WP_Theme_JSON_Data::class, $result );
	}

	/**
	 * register は theme レベルのフィルターに登録する.
	 *
	 * @return void
	 */
	public function test_register_hooks_theme_level_filter(): void {
		$override = new Next_Theme_Json_Override();
		$override->register();

		$this->assertNotFalse( has_filter( 'wp_theme_json_data_theme', array( $override, 'apply_overrides' ) ) );
		$this->assertFalse( has_filter( 'wp_theme_json_data_user', array( $override, 'apply_overrides' ) ) );

		remove_filter( 'wp_theme_json_data_theme', array( $override, 'apply_overrides' ) );
	}

	/**
	 * ブロックエディターが参照する REST のテーマ用グローバルスタイルにも上書きが反映される.
	 *
	 * @return void
	 */
	public function test_override_is_exposed_in_rest_theme_global_styles(): void {
		Next_Theme_Json_Override::save(
			array(
				'version'  => 3,
				'settings' => array( 'typography' => array( 'textIndent' => 'all' ) ),
			)
		);

		$override = new Next_Theme_Json_Override();
		$override->register();
		\WP_Theme_JSON_Resolver::clean_cached_data();

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );
		$request  = new \WP_REST_Request( 'GET', '/wp/v2/global-styles/themes/' . get_stylesheet() );
		$response = rest_get_server()->dispatch( $request );
		$data     = $response->get_data();

		remove_filter( 'wp_theme_json_data_theme', array( $override, 'apply_overrides' ) );
		\WP_Theme_JSON_Resolver::clean_cached_data();

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( 'all', $data['settings']['typography']['textIndent'] );
	}
}
