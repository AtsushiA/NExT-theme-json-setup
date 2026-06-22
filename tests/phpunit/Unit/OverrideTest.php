<?php
/**
 * Unit tests for Next_Theme_Json_Override::get().
 *
 * @package NExT_Theme_Json_Setup
 */

namespace NextThemeJsonSetup\Tests\Unit;

use Brain\Monkey\Functions;
use Next_Theme_Json_Override;
use Yoast\WPTestUtils\BrainMonkey\TestCase;

/**
 * get() の JSON パース挙動を WordPress 非依存で検証する.
 */
class OverrideTest extends TestCase {

	/**
	 * 有効な JSON は連想配列としてデコードされる.
	 *
	 * @return void
	 */
	public function test_get_returns_array_for_valid_json(): void {
		Functions\when( 'get_option' )->justReturn( '{"version":3,"settings":{"color":{"custom":true}}}' );

		$result = Next_Theme_Json_Override::get();

		$this->assertSame( 3, $result['version'] );
		$this->assertTrue( $result['settings']['color']['custom'] );
	}

	/**
	 * 空文字列のオプションは空配列を返す.
	 *
	 * @return void
	 */
	public function test_get_returns_empty_array_when_option_empty(): void {
		Functions\when( 'get_option' )->justReturn( '' );

		$this->assertSame( array(), Next_Theme_Json_Override::get() );
	}

	/**
	 * 不正な JSON は空配列を返す（例外を投げない）.
	 *
	 * @return void
	 */
	public function test_get_returns_empty_array_for_invalid_json(): void {
		Functions\when( 'get_option' )->justReturn( '{ not valid json' );

		$this->assertSame( array(), Next_Theme_Json_Override::get() );
	}
}
