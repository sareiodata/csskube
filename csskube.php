<?php
/**
 * Plugin Name: CSSKube - Block CSS Editor
 * Plugin URI: https://github.com/cozmoslabs/csskube
 * Description: Adds a CSS textarea to each WordPress block for custom styling. CSS is rendered inline with each block.
 * Version: 1.3.1
 * Author: sareiodata
 * Author URI: https://cozmoslabs.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: csskube
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class CSSKube {
	/**
	 * Plugin version
	 */
	const VERSION = '1.3.1';

	/**
	 * Instance of this class
	 */
	private static $instance = null;

	/**
	 * Get instance
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_filter( 'render_block', array( $this, 'render_block_css' ), 10, 2 );
	}

	/**
	 * Enqueue editor assets
	 */
	public function enqueue_editor_assets() {
		// Only allow users with unfiltered_html capability to use custom CSS
		// This is typically Administrators and Super Admins in multisite
		// Filter allows customization: apply_filters( 'csskube_required_capability', 'unfiltered_html' )
		$required_capability = apply_filters( 'csskube_required_capability', 'unfiltered_html' );

		if ( ! current_user_can( $required_capability ) ) {
			return;
		}

		// Enqueue the block editor JavaScript
		wp_enqueue_script(
			'csskube-block-css-control',
			plugins_url( 'js/block-css-control.js', __FILE__ ),
			array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-hooks', 'wp-compose' ),
			self::VERSION,
			true
		);

		// Enqueue editor styles
		wp_enqueue_style(
			'csskube-editor-styles',
			plugins_url( 'css/editor-styles.css', __FILE__ ),
			array(),
			self::VERSION
		);
	}

	/**
	 * Render inline CSS for blocks on the frontend
	 */
	public function render_block_css( $block_content, $block ) {
		// Check if block has any custom CSS
		$css_all = isset( $block['attrs']['cssKubeCSS_all'] ) ? $block['attrs']['cssKubeCSS_all'] : '';
		$css_mobile = isset( $block['attrs']['cssKubeCSS_mobile'] ) ? $block['attrs']['cssKubeCSS_mobile'] : '';
		$css_tablet = isset( $block['attrs']['cssKubeCSS_tablet'] ) ? $block['attrs']['cssKubeCSS_tablet'] : '';
		$css_desktop = isset( $block['attrs']['cssKubeCSS_desktop'] ) ? $block['attrs']['cssKubeCSS_desktop'] : '';

		// Check if any CSS exists
		$has_css = ! empty( $css_all ) || ! empty( $css_mobile ) || ! empty( $css_tablet ) || ! empty( $css_desktop );

		if ( ! $has_css ) {
			return $block_content;
		}

		// Generate a unique ID for this block instance
		$block_id = 'csskube-' . md5( wp_json_encode( $block['attrs'] ) . wp_json_encode( $block ) );

		// Add the ID to the block wrapper
		if ( ! empty( $block_content ) ) {
			$block_content = $this->add_id_to_block( $block_content, $block_id );

			// Process and combine all CSS types
			$all_inline_css = '';

			if ( ! empty( $css_all ) ) {
				$sanitized_css = $this->sanitize_css( $css_all );
				if ( ! empty( $sanitized_css ) ) {
					$all_inline_css .= $this->process_css( $sanitized_css, $block_id, 'all' );
				}
			}

			if ( ! empty( $css_mobile ) ) {
				$sanitized_css = $this->sanitize_css( $css_mobile );
				if ( ! empty( $sanitized_css ) ) {
					$all_inline_css .= $this->process_css( $sanitized_css, $block_id, 'mobile' );
				}
			}

			if ( ! empty( $css_tablet ) ) {
				$sanitized_css = $this->sanitize_css( $css_tablet );
				if ( ! empty( $sanitized_css ) ) {
					$all_inline_css .= $this->process_css( $sanitized_css, $block_id, 'tablet' );
				}
			}

			if ( ! empty( $css_desktop ) ) {
				$sanitized_css = $this->sanitize_css( $css_desktop );
				if ( ! empty( $sanitized_css ) ) {
					$all_inline_css .= $this->process_css( $sanitized_css, $block_id, 'desktop' );
				}
			}

			// Prepend all style tags to the block content
			if ( ! empty( $all_inline_css ) ) {
				$block_content = $all_inline_css . $block_content;
			}
		}

		return $block_content;
	}

	/**
	 * Sanitize CSS to prevent malicious code injection
	 *
	 * @param string $css Raw CSS input
	 * @return string Sanitized CSS
	 */
	private function sanitize_css( $css ) {
		// Remove any HTML tags
		$css = wp_strip_all_tags( $css );

		// Remove any script tags or javascript: protocols that might have escaped
		$css = preg_replace( '/<script[^>]*>.*?<\/script>/is', '', $css );
		$css = preg_replace( '/javascript:/i', '', $css );
		$css = preg_replace( '/vbscript:/i', '', $css );
		$css = preg_replace( '/data:text\/html/i', '', $css );

		// Remove @import statements to prevent loading external stylesheets
		$css = preg_replace( '/@import\s+/i', '', $css );

		// Remove behavior property (IE specific)
		$css = preg_replace( '/behavior\s*:/i', '', $css );

		// Remove expression() (IE specific JavaScript execution)
		$css = preg_replace( '/expression\s*\(/i', '', $css );

		// Remove -moz-binding (Firefox specific)
		$css = preg_replace( '/-moz-binding\s*:/i', '', $css );

		return trim( $css );
	}

	/**
	 * Add ID to the first HTML element in the block content
	 */
	private function add_id_to_block( $block_content, $block_id ) {
		// If content is empty, return as-is
		if ( empty( $block_content ) ) {
			return $block_content;
		}

		// Match the first opening HTML tag with or without attributes
		// This pattern matches: <tagname ... >
		$pattern = '/(<([a-z][a-z0-9]*)\b)([^>]*)(>)/i';

		// Track if we made a replacement
		$replaced = false;

		$block_content = preg_replace_callback(
			$pattern,
			function( $matches ) use ( $block_id, &$replaced ) {
				// Only process the first match
				if ( $replaced ) {
					return $matches[0];
				}

				$tag_start = $matches[1];  // "<tagname"
				$tag_name = $matches[2];   // "tagname"
				$attributes = $matches[3]; // existing attributes (may be empty or with spaces)
				$tag_end = $matches[4];    // ">"

				$replaced = true;

				// Check if ID already exists in attributes
				if ( preg_match( '/\bid\s*=\s*["\']/', $attributes ) ) {
					// ID exists, add as class instead
					if ( preg_match( '/\bclass\s*=\s*["\']([^"\']*)["\']/', $attributes ) ) {
						// Class attribute exists, append to it
						$attributes = preg_replace(
							'/(\bclass\s*=\s*["\'])([^"\']*)(["\'])/i',
							'$1$2 ' . esc_attr( $block_id ) . '$3',
							$attributes
						);
					} else {
						// No class attribute, add one
						$attributes .= ' class="' . esc_attr( $block_id ) . '"';
					}
				} else {
					// No ID exists, add ID attribute
					$attributes .= ' id="' . esc_attr( $block_id ) . '"';
				}

				return $tag_start . $attributes . $tag_end;
			},
			$block_content,
			1  // Only replace the first occurrence
		);

		return $block_content;
	}

	/**
	 * Get media query string based on selection
	 *
	 * @param string $media_query_type The media query type (mobile, tablet, desktop, all)
	 * @return string The media query string or empty string for 'all'
	 */
	private function get_media_query( $media_query_type ) {
		switch ( $media_query_type ) {
			case 'mobile':
				return '@media (max-width: 767px)';
			case 'tablet':
				return '@media (min-width: 768px) and (max-width: 1024px)';
			case 'desktop':
				return '@media (min-width: 1025px)';
			case 'all':
			default:
				return '';
		}
	}

	/**
	 * Process CSS and wrap with appropriate selectors
	 *
	 * @param string $css The CSS to process
	 * @param string $block_id The unique block ID
	 * @param string $media_query The media query type
	 * @return string The processed CSS wrapped in a style tag
	 */
	private function process_css( $css, $block_id, $media_query = 'all' ) {
		$css = trim( $css );

		if ( empty( $css ) ) {
			return '';
		}

		// Escape block ID for use in CSS selectors
		$escaped_block_id = esc_attr( $block_id );

		// Get media query string
		$media_query_str = $this->get_media_query( $media_query );

		// Check if CSS contains selectors (has { and })
		if ( strpos( $css, '{' ) !== false && strpos( $css, '}' ) !== false ) {
			// CSS has custom selectors with &
			// We need to create two versions: one for ID selector, one for class selector
			// This is because the block element has either an ID or a class, not both
			$id_css = str_replace( '&', '#' . $escaped_block_id, $css );
			$class_css = str_replace( '&', '.' . $escaped_block_id, $css );

			// Combine both CSS versions
			$combined_css = wp_kses( $id_css, array() ) . ' ' . wp_kses( $class_css, array() );

			// Wrap in media query if specified
			if ( ! empty( $media_query_str ) ) {
				$combined_css = $media_query_str . ' { ' . $combined_css . ' }';
			}

			// Output both versions so the CSS works regardless of whether block has ID or class
			return sprintf( '<style>%s</style>', $combined_css );
		} else {
			// Direct CSS properties (like browser console element {})
			// Wrap with block selector
			$selector_css = sprintf(
				'#%s, .%s { %s }',
				$escaped_block_id,
				$escaped_block_id,
				wp_kses( $css, array() )
			);

			// Wrap in media query if specified
			if ( ! empty( $media_query_str ) ) {
				$selector_css = $media_query_str . ' { ' . $selector_css . ' }';
			}

			return sprintf( '<style>%s</style>', $selector_css );
		}
	}
}

// Initialize the plugin
CSSKube::get_instance();
