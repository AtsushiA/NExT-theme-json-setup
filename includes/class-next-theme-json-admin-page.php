<?php
/**
 * 管理画面ページ登録
 *
 * @package NExT_Theme_Json_Setup
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 管理画面ページを登録・描画するクラス。
 */
class Next_Theme_Json_Admin_Page {

	/**
	 * フックを登録する。
	 *
	 * @return void
	 */
	public function register(): void {
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	/**
	 * 管理画面メニューを追加する。
	 *
	 * @return void
	 */
	public function add_menu(): void {
		add_theme_page(
			__( 'theme.json 設定', 'next-theme-json-setup' ),
			__( 'theme.json 設定', 'next-theme-json-setup' ),
			'edit_theme_options',
			'next-theme-json-setup',
			array( $this, 'render_page' )
		);
	}

	/**
	 * 管理画面ページのアセットを読み込む。
	 *
	 * @param string $hook 現在の管理画面ページフック。
	 * @return void
	 */
	public function enqueue_assets( string $hook ): void {
		if ( 'appearance_page_next-theme-json-setup' !== $hook ) {
			return;
		}

		// ビューポート幅の単位選択に WordPress コアの UnitControl コンポーネントを使用する。
		wp_enqueue_style( 'wp-components' );

		wp_enqueue_style(
			'next-theme-json-setup-admin',
			NEXT_THEME_JSON_SETUP_URL . 'assets/css/admin.css',
			array( 'wp-components' ),
			NEXT_THEME_JSON_SETUP_VERSION
		);

		wp_enqueue_script(
			'next-theme-json-setup-admin',
			NEXT_THEME_JSON_SETUP_URL . 'assets/js/admin.js',
			array( 'wp-element', 'wp-components', 'wp-i18n' ),
			NEXT_THEME_JSON_SETUP_VERSION,
			true
		);

		// admin.js 内の wp.i18n.__() 呼び出しに languages/ の翻訳データを紐付ける.
		wp_set_script_translations( 'next-theme-json-setup-admin', 'next-theme-json-setup', NEXT_THEME_JSON_SETUP_DIR . 'languages' );

		wp_localize_script(
			'next-theme-json-setup-admin',
			'nextThemeJsonSetup',
			array(
				'apiBase' => rest_url( 'next-theme-json/v1' ),
				'nonce'   => wp_create_nonce( 'wp_rest' ),
				'i18n'    => array(
					'saved'        => __( '保存しました。', 'next-theme-json-setup' ),
					'saveError'    => __( '保存に失敗しました。', 'next-theme-json-setup' ),
					'resetDone'    => __( 'オーバーライド設定をリセットしました。', 'next-theme-json-setup' ),
					'confirmReset' => __( 'オーバーライド設定をリセットしますか？プラグインによる変更がすべて削除されます。', 'next-theme-json-setup' ),
					'invalidJson'  => __( '不正な JSON です。保存できません。', 'next-theme-json-setup' ),
				),
			)
		);
	}

	/**
	 * 管理画面ページを描画する。
	 *
	 * @return void
	 */
	public function render_page(): void {
		?>
		<div class="ntjs-wrap" id="next-theme-json-setup">

			<!-- ヘッダー -->
			<div class="ntjs-header">
				<div class="ntjs-header-left">
					<h1 class="ntjs-title">
						<?php esc_html_e( 'theme.json 設定', 'next-theme-json-setup' ); ?>
					</h1>
					<div class="ntjs-meta">
						<span class="ntjs-meta-theme">
							<?php esc_html_e( 'テーマ:', 'next-theme-json-setup' ); ?>
							<strong id="ntjs-theme-name">—</strong>
						</span>
						<span id="ntjs-override-badge" class="ntjs-badge ntjs-badge--active" style="display:none;">
							<?php esc_html_e( 'オーバーライド適用中', 'next-theme-json-setup' ); ?>
						</span>
					</div>
				</div>
				<div class="ntjs-header-right">
					<div id="ntjs-notice" class="ntjs-notice" style="display:none;" role="alert"></div>
					<button id="ntjs-btn-reset" class="ntjs-btn ntjs-btn--ghost">
						<?php esc_html_e( 'リセット', 'next-theme-json-setup' ); ?>
					</button>
					<button id="ntjs-btn-save" class="ntjs-btn ntjs-btn--primary" disabled>
						<?php esc_html_e( '保存', 'next-theme-json-setup' ); ?>
					</button>
				</div>
			</div>

			<!-- タブナビゲーション -->
			<div class="ntjs-tabs" role="tablist">
				<button class="ntjs-tab active" data-tab="switches" role="tab">
					<?php esc_html_e( '設定', 'next-theme-json-setup' ); ?>
				</button>
				<button class="ntjs-tab" data-tab="raw" role="tab">
					<?php esc_html_e( 'Raw JSON', 'next-theme-json-setup' ); ?>
				</button>
				<button class="ntjs-tab" data-tab="reference" role="tab">
					<?php esc_html_e( 'テーマ参照', 'next-theme-json-setup' ); ?>
				</button>
			</div>

			<!-- 設定パネル（トグルスイッチ UI） -->
			<div class="ntjs-panel" id="ntjs-panel-switches" role="tabpanel">
				<div class="ntjs-app-body">
					<nav class="ntjs-sidebar" id="ntjs-sidebar" aria-label="設定カテゴリ"></nav>
					<main class="ntjs-content" id="ntjs-content"></main>
				</div>
			</div>

			<!-- Raw JSON パネル -->
			<div class="ntjs-panel" id="ntjs-panel-raw" role="tabpanel" style="display:none;">
				<p class="ntjs-hint">
					<?php esc_html_e( 'オーバーライド設定を JSON で直接編集できます。トグルスイッチで変更した内容はここにも反映されます。', 'next-theme-json-setup' ); ?>
				</p>
				<textarea
					id="ntjs-raw-editor"
					rows="40"
					spellcheck="false"
					aria-label="<?php esc_attr_e( 'Raw JSON エディター', 'next-theme-json-setup' ); ?>"
				></textarea>
			</div>

			<!-- テーマ参照パネル -->
			<div class="ntjs-panel" id="ntjs-panel-reference" role="tabpanel" style="display:none;">
				<p class="ntjs-hint">
					<?php esc_html_e( 'テーマに内包されている theme.json の内容です（読み取り専用・編集不可）。', 'next-theme-json-setup' ); ?>
					<code id="ntjs-file-path"></code>
				</p>
				<textarea
					id="ntjs-theme-editor"
					rows="40"
					spellcheck="false"
					readonly
					aria-label="<?php esc_attr_e( 'テーマの theme.json（参照）', 'next-theme-json-setup' ); ?>"
				></textarea>
			</div>

		</div>
		<?php
	}
}
