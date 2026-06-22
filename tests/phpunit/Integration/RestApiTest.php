<?php
/**
 * Integration tests for the REST API endpoints.
 *
 * @package NExT_Theme_Json_Setup
 */

namespace NextThemeJsonSetup\Tests\Integration;

use Next_Theme_Json_Override;
use WP_REST_Request;
use WP_Test_REST_TestCase;

/**
 * /next-theme-json/v1/* エンドポイントの権限・検証ロジックを検証する.
 */
class RestApiTest extends WP_Test_REST_TestCase {

	/**
	 * テスト用の管理者ユーザー ID.
	 *
	 * @var int
	 */
	protected static $admin_id;

	/**
	 * テスト用の購読者ユーザー ID.
	 *
	 * @var int
	 */
	protected static $subscriber_id;

	/**
	 * 共有フィクスチャを作成する.
	 *
	 * @param \WP_UnitTest_Factory $factory ファクトリ.
	 * @return void
	 */
	public static function wpSetUpBeforeClass( $factory ): void {
		self::$admin_id      = $factory->user->create( array( 'role' => 'administrator' ) );
		self::$subscriber_id = $factory->user->create( array( 'role' => 'subscriber' ) );
	}

	/**
	 * 各テスト前に REST サーバーを初期化する.
	 *
	 * @return void
	 */
	public function set_up(): void {
		parent::set_up();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	/**
	 * 各テスト後にユーザーとオプションをリセットする.
	 *
	 * @return void
	 */
	public function tear_down(): void {
		wp_set_current_user( 0 );
		Next_Theme_Json_Override::clear();
		parent::tear_down();
	}

	/**
	 * ルートが登録されている.
	 *
	 * @return void
	 */
	public function test_routes_are_registered(): void {
		$routes = rest_get_server()->get_routes();

		$this->assertArrayHasKey( '/next-theme-json/v1/theme-json', $routes );
		$this->assertArrayHasKey( '/next-theme-json/v1/override', $routes );
		$this->assertArrayHasKey( '/next-theme-json/v1/override/reset', $routes );
	}

	/**
	 * 権限のないユーザーは override を保存できない（403）.
	 *
	 * @return void
	 */
	public function test_save_override_forbidden_for_subscriber(): void {
		wp_set_current_user( self::$subscriber_id );

		$request = new WP_REST_Request( 'POST', '/next-theme-json/v1/override' );
		$request->set_param( 'content', '{"version":3}' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 403, $response->get_status() );
	}

	/**
	 * 管理者は有効な JSON を保存できる（200）.
	 *
	 * @return void
	 */
	public function test_save_override_succeeds_for_admin(): void {
		wp_set_current_user( self::$admin_id );

		$request = new WP_REST_Request( 'POST', '/next-theme-json/v1/override' );
		$request->set_param( 'content', '{"version":3,"settings":{"color":{"custom":false}}}' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame(
			array( 'version' => 3, 'settings' => array( 'color' => array( 'custom' => false ) ) ),
			Next_Theme_Json_Override::get()
		);
	}

	/**
	 * 不正な JSON は 400 で拒否される.
	 *
	 * @return void
	 */
	public function test_save_override_rejects_invalid_json(): void {
		wp_set_current_user( self::$admin_id );

		$request = new WP_REST_Request( 'POST', '/next-theme-json/v1/override' );
		$request->set_param( 'content', '{ not json' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( array(), Next_Theme_Json_Override::get() );
	}

	/**
	 * 許可されていないトップレベルキーは 400 で拒否される.
	 *
	 * @return void
	 */
	public function test_save_override_rejects_disallowed_keys(): void {
		wp_set_current_user( self::$admin_id );

		$request = new WP_REST_Request( 'POST', '/next-theme-json/v1/override' );
		$request->set_param( 'content', '{"version":3,"evil":true}' );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 400, $response->get_status() );
	}

	/**
	 * 100KB を超えるペイロードは 400 で拒否される.
	 *
	 * @return void
	 */
	public function test_save_override_rejects_oversized_payload(): void {
		wp_set_current_user( self::$admin_id );

		$big_value = str_repeat( 'a', 102401 );
		$content   = wp_json_encode( array( 'version' => 3, 'styles' => array( 'note' => $big_value ) ) );

		$request = new WP_REST_Request( 'POST', '/next-theme-json/v1/override' );
		$request->set_param( 'content', $content );

		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 400, $response->get_status() );
	}

	/**
	 * reset はオーバーライドを削除する.
	 *
	 * @return void
	 */
	public function test_reset_clears_override(): void {
		wp_set_current_user( self::$admin_id );
		Next_Theme_Json_Override::save( array( 'version' => 3 ) );

		$request  = new WP_REST_Request( 'POST', '/next-theme-json/v1/override/reset' );
		$response = rest_get_server()->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( array(), Next_Theme_Json_Override::get() );
	}
}
