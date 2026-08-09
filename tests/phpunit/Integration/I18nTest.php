<?php
/**
 * Integration tests for translation loading (languages/ 以下の .mo).
 *
 * @package NExT_Theme_Json_Setup
 */

namespace NextThemeJsonSetup\Tests\Integration;

use WP_UnitTestCase;

/**
 * PHP 側（gettext）の翻訳読み込みを検証する.
 */
class I18nTest extends WP_UnitTestCase {

	/**
	 * 各テスト後に読み込んだテキストドメインを解除する.
	 *
	 * PHPUnit の Integration テストはプラグインを muplugins_loaded で直接 require するため
	 * （通常の activate_plugin() を経由しない）、WP_Textdomain_registry がこのプラグインの
	 * Domain Path を認識できず、__() の JIT 自動読み込みが機能しない。
	 * そのため本テストでは load_textdomain() で languages/*.mo を明示的に読み込み、
	 * 翻訳ファイルの中身（翻訳結果）を直接検証する。
	 * JIT 自動読み込み自体（実サイトでの動作）は wp eval 実行および e2e テストで確認済み.
	 *
	 * @return void
	 */
	public function tear_down(): void {
		unload_textdomain( 'next-theme-json-setup' );
		parent::tear_down();
	}

	/**
	 * languages/next-theme-json-setup-en_US.mo を読み込むと英語に翻訳される.
	 *
	 * @return void
	 */
	public function test_strings_are_translated_when_mo_file_is_loaded(): void {
		load_textdomain( 'next-theme-json-setup', NEXT_THEME_JSON_SETUP_DIR . 'languages/next-theme-json-setup-en_US.mo' );

		$this->assertSame( 'General', __( '一般', 'next-theme-json-setup' ) );
		$this->assertSame( 'Viewport', __( 'ビューポート', 'next-theme-json-setup' ) );
		$this->assertSame( 'Saved.', __( '保存しました。', 'next-theme-json-setup' ) );
	}

	/**
	 * REST API のエラーメッセージ（sprintf を含む）も翻訳される.
	 *
	 * @return void
	 */
	public function test_rest_api_messages_are_translated_when_mo_file_is_loaded(): void {
		load_textdomain( 'next-theme-json-setup', NEXT_THEME_JSON_SETUP_DIR . 'languages/next-theme-json-setup-en_US.mo' );

		$message = sprintf(
			/* translators: %s: JSON パースエラーメッセージ. */
			__( '不正な JSON です: %s', 'next-theme-json-setup' ),
			'Syntax error'
		);

		$this->assertSame( 'Invalid JSON: Syntax error', $message );
	}

	/**
	 * 対応する .mo ファイルが存在しない場合は、ソース文字列（日本語）がそのまま返る（フォールバック）.
	 *
	 * @return void
	 */
	public function test_falls_back_to_source_string_when_no_mo_file_matches(): void {
		load_textdomain( 'next-theme-json-setup', NEXT_THEME_JSON_SETUP_DIR . 'languages/next-theme-json-setup-fr_FR.mo' );

		$this->assertSame( '一般', __( '一般', 'next-theme-json-setup' ) );
	}

	/**
	 * プラグインヘッダーの Text Domain / Domain Path が languages/ を指している.
	 *
	 * @return void
	 */
	public function test_plugin_header_declares_correct_textdomain(): void {
		$headers = get_file_data(
			NEXT_THEME_JSON_SETUP_DIR . 'next-theme-json-setup.php',
			array(
				'TextDomain' => 'Text Domain',
				'DomainPath' => 'Domain Path',
			)
		);

		$this->assertSame( 'next-theme-json-setup', $headers['TextDomain'] );
		$this->assertSame( '/languages', $headers['DomainPath'] );
	}
}
