<?php
/**
 * REST API エンドポイント
 *
 * GET  /wp-json/next-theme-json/v1/theme-json     — テーマの theme.json を読み取り（参照用）。
 * GET  /wp-json/next-theme-json/v1/override       — プラグインのオーバーライド設定を取得。
 * POST /wp-json/next-theme-json/v1/override       — プラグインのオーバーライド設定を保存。
 * POST /wp-json/next-theme-json/v1/override/reset — オーバーライド設定を削除（リセット）。
 *
 * @package NExT_Theme_Json_Setup
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API クラス。
 */
class Next_Theme_Json_Rest_Api {

	/**
	 * REST API のネームスペース。
	 *
	 * @var string
	 */
	const NAMESPACE = 'next-theme-json/v1';

	/**
	 * フックを登録する。
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * REST API ルートを登録する。
	 *
	 * @return void
	 */
	public function register_routes(): void {
		// テーマ本体の theme.json 取得（読み取り専用）。
		register_rest_route(
			self::NAMESPACE,
			'/theme-json',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_theme_json' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);

		// プラグインのオーバーライド設定。
		register_rest_route(
			self::NAMESPACE,
			'/override',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_override' ),
					'permission_callback' => array( $this, 'check_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'save_override' ),
					'permission_callback' => array( $this, 'check_permission' ),
					'args'                => array(
						'content' => array(
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'wp_unslash',
						),
					),
				),
			)
		);

		// オーバーライドのリセット。
		register_rest_route(
			self::NAMESPACE,
			'/override/reset',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'reset_override' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);
	}

	/**
	 * 権限チェック。
	 *
	 * @return bool
	 */
	public function check_permission(): bool {
		return current_user_can( 'edit_theme_options' );
	}

	/**
	 * テーマの theme.json を読み取り専用で返す（参照表示用）。
	 *
	 * @return WP_REST_Response
	 */
	public function get_theme_json(): WP_REST_Response {
		$child_path  = get_stylesheet_directory() . '/theme.json';
		$parent_path = get_template_directory() . '/theme.json';
		$path        = file_exists( $child_path ) ? $child_path : $parent_path;

		if ( ! file_exists( $path ) ) {
			return new WP_REST_Response(
				array(
					'data'       => new stdClass(),
					'path'       => '',
					'theme_name' => wp_get_theme()->get( 'Name' ),
				),
				200
			);
		}

		$content = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$data    = json_decode( $content, true );

		// フルパスではなく ABSPATH からの相対パスを返す（内部パスの漏洩防止）。
		$display_path = str_replace( ABSPATH, '', $path );

		return new WP_REST_Response(
			array(
				'theme_name' => wp_get_theme()->get( 'Name' ),
				'path'       => $display_path,
				'data'       => $data ?? new stdClass(),
			),
			200
		);
	}

	/**
	 * プラグインのオーバーライド設定を取得。
	 *
	 * @return WP_REST_Response
	 */
	public function get_override(): WP_REST_Response {
		$data = Next_Theme_Json_Override::get();

		return new WP_REST_Response(
			array(
				'has_override' => ! empty( $data ),
				'data'         => empty( $data ) ? new stdClass() : $data,
			),
			200
		);
	}

	/**
	 * Theme.json のトップレベルキーとして許可するキーの一覧。
	 *
	 * @var string[]
	 */
	const ALLOWED_TOP_KEYS = array( 'version', '$schema', 'settings', 'styles', 'customTemplates', 'templateParts', 'patterns' );

	/**
	 * 保存できる JSON ペイロードの最大バイト数（100KB）。
	 *
	 * @var int
	 */
	const MAX_PAYLOAD_BYTES = 102400;

	/**
	 * プラグインのオーバーライド設定を保存。
	 *
	 * @param WP_REST_Request $request リクエストオブジェクト。
	 * @return WP_REST_Response
	 */
	public function save_override( WP_REST_Request $request ): WP_REST_Response {
		$content = $request->get_param( 'content' );

		// ペイロードサイズ上限チェック（100KB）。
		if ( strlen( $content ) > self::MAX_PAYLOAD_BYTES ) {
			return new WP_REST_Response(
				array( 'error' => __( 'JSON が大きすぎます（上限 100KB）。', 'next-theme-json-setup' ) ),
				400
			);
		}

		$decoded = json_decode( $content, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new WP_REST_Response(
				array(
					'error' => sprintf(
						/* translators: %s: JSON パースエラーメッセージ. */
						__( '不正な JSON です: %s', 'next-theme-json-setup' ),
						json_last_error_msg()
					),
				),
				400
			);
		}

		// トップレベルキーのアローリストチェック（不正キーを拒否）。
		$unknown_keys = array_diff( array_keys( $decoded ), self::ALLOWED_TOP_KEYS );
		if ( ! empty( $unknown_keys ) ) {
			return new WP_REST_Response(
				array(
					'error' => sprintf(
						/* translators: %s: 許可されていないキー名のカンマ区切りリスト. */
						__( '許可されていないキーが含まれています: %s', 'next-theme-json-setup' ),
						implode( ', ', $unknown_keys )
					),
				),
				400
			);
		}

		Next_Theme_Json_Override::save( $decoded );

		return new WP_REST_Response(
			array( 'message' => __( 'オーバーライド設定を保存しました。', 'next-theme-json-setup' ) ),
			200
		);
	}

	/**
	 * オーバーライド設定をリセット（削除）。
	 *
	 * @return WP_REST_Response
	 */
	public function reset_override(): WP_REST_Response {
		Next_Theme_Json_Override::clear();

		return new WP_REST_Response(
			array( 'message' => __( 'オーバーライド設定をリセットしました。', 'next-theme-json-setup' ) ),
			200
		);
	}
}
