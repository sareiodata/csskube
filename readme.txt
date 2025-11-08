=== CSSKube - Block CSS Editor ===
Contributors: cozmoslabs
Tags: gutenberg, blocks, css, custom css, block editor
Requires at least: 6.0
Tested up to: 6.7
Stable tag: 1.3.1
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Add custom CSS to any Gutenberg block with live preview and responsive breakpoints - no coding required!

== Description ==

CSSKube adds powerful custom CSS capabilities directly to the WordPress block editor. Style any block with device-specific CSS through an intuitive tabbed interface, and see your changes instantly with live preview.

= Key Features =

* **Tabbed Interface** - Manage CSS across 4 breakpoints simultaneously (All, Mobile, Tablet, Desktop)
* **Live Preview** - See CSS changes in real-time as you type in both Post Editor and Site Editor
* **Visual Indicators** - Blue dots and pulsing animations show which tabs contain CSS
* **Responsive Design** - Apply different styles for mobile, tablet, and desktop devices
* **No Build Process** - Pure JavaScript implementation, no compilation required
* **Secure by Default** - Capability checks, CSS sanitization, and output escaping prevent malicious code
* **Performance Optimized** - Inline CSS rendering means no additional HTTP requests

= Perfect For =

* Designers who need precise control over block styling
* Developers prototyping custom block designs
* Site builders creating unique layouts without custom CSS files
* Anyone who wants to quickly customize block appearance

= How It Works =

1. Select any block in the WordPress editor
2. Open the block settings sidebar
3. Find the "Custom CSS" panel
4. Switch between device tabs (All, Mobile, Tablet, Desktop)
5. Enter CSS properties and see them applied instantly
6. Publish your post/page - CSS is rendered inline on the frontend

= Responsive Breakpoints =

* **All Devices** - CSS applies everywhere (no media query)
* **Mobile** - max-width: 767px
* **Tablet** - 768px to 1024px
* **Desktop** - min-width: 1025px

= Two CSS Modes =

**Direct Properties** (like browser console):
`
background-color: #f0f0f0;
padding: 20px;
border-radius: 8px;
`

**Custom Selectors** (using & placeholder):
`
& {
  background-color: #f0f0f0;
}
&:hover {
  background-color: #e0e0e0;
}
& p {
  color: #333;
}
`

= Security =

CSSKube implements multiple security layers:

* Only users with `unfiltered_html` capability (Administrators by default) can add custom CSS
* CSS sanitization removes dangerous properties like `expression()`, `@import`, and JavaScript protocols
* All output is escaped using WordPress security functions
* Optional capability filter for customization

= Browser Compatibility =

Works with all modern browsers that support the WordPress block editor:
* Chrome/Edge (latest 2 versions)
* Firefox (latest 2 versions)
* Safari (latest 2 versions)

= Developer Friendly =

* Filter `csskube_required_capability` to customize who can add CSS
* No build process - edit JavaScript directly
* Comprehensive documentation included
* Clean, well-commented code

== Installation ==

= Automatic Installation =

1. Log in to your WordPress admin panel
2. Navigate to Plugins > Add New
3. Search for "CSSKube"
4. Click "Install Now" and then "Activate"

= Manual Installation =

1. Download the plugin ZIP file
2. Log in to your WordPress admin panel
3. Navigate to Plugins > Add New > Upload Plugin
4. Choose the downloaded ZIP file and click "Install Now"
5. Activate the plugin

= After Activation =

1. Edit any post or page with the block editor
2. Select a block
3. Open the block settings sidebar (click gear icon if not visible)
4. Scroll down to find the "Custom CSS" panel
5. Start styling!

== Frequently Asked Questions ==

= Who can use the custom CSS feature? =

By default, only users with the `unfiltered_html` capability (Administrators) can add custom CSS. This is the same capability required to add custom HTML, maintaining WordPress's security model.

= Can I customize which users can add CSS? =

Yes! Use the `csskube_required_capability` filter in your theme's functions.php:

`
add_filter( 'csskube_required_capability', function() {
    return 'edit_theme_options'; // Example: allow editors
});
`

= Does this work in the Site Editor? =

Yes! CSSKube works in both the Post Editor and Site Editor (for theme/template editing).

= Will CSS appear in the editor exactly as it does on the frontend? =

Yes, the live preview functionality ensures CSS appears the same in both the editor and frontend.

= Can I add CSS to multiple blocks at once? =

Each block has its own CSS textarea. To style multiple blocks identically, you'll need to add CSS to each block individually, or consider using theme CSS for site-wide styles.

= Does this affect page performance? =

Minimal impact. CSS is rendered inline with each block, meaning no additional HTTP requests. For typical use (fewer than 10 blocks with CSS), performance impact is negligible.

= Can I use CSS preprocessors like Sass or Less? =

No, CSSKube uses plain CSS only. For advanced CSS preprocessing, consider using a build tool with your theme.

= What if I enter invalid CSS? =

Invalid CSS will simply not apply. There's no validation or error messaging currently, so it's best to test your CSS as you type using the live preview.

= Can I style elements outside the current block? =

By design, CSS is scoped to the current block only. This prevents unintended styling of other page elements and maintains block independence.

= How do I remove CSS from a block? =

Simply delete the CSS from the textarea and the inline styles will be removed from both the editor and frontend.

= Is there a limit to how much CSS I can add? =

No hard limit, but keep it reasonable. Large amounts of inline CSS on many blocks could impact page size. For extensive styling, consider theme CSS instead.

= Can I import/export CSS between blocks? =

Not currently. This is a potential future enhancement. For now, you can copy/paste CSS manually between block textareas.

= Does this work with any WordPress theme? =

Yes, CSSKube is theme-independent and works with any theme that supports the block editor.

= Will CSS be lost if I deactivate the plugin? =

CSS is stored in block attributes within post content, so it's preserved in your database. However, it won't be rendered on the frontend until you reactivate the plugin.

= Can I use this with the Classic Editor? =

No, CSSKube is designed specifically for the block editor (Gutenberg). It requires WordPress 6.0 or higher with the block editor enabled.

== Screenshots ==

1. Tabbed interface for managing CSS across all breakpoints
2. Visual indicators show which tabs contain CSS
3. Live preview in the block editor
4. CSS applied to blocks on the frontend
5. Custom CSS panel in the block settings sidebar

== Changelog ==

= 1.3.1 =
* UX: Added visual indicators (blue dots) on tabs that contain CSS
* UX: Tabs with CSS show a subtle pulsing animation to draw attention
* UX: Panel now opens to the first tab that has CSS content
* Improved tab discovery and navigation

= 1.3.0 =
* NEW: Tabbed interface for managing CSS across all breakpoints simultaneously
* Added 4 device tabs with icons: All, Mobile, Tablet, Desktop
* Each tab has its own textarea - add CSS for multiple devices at once
* Removed single dropdown in favor of tabbed interface
* All 4 CSS fields are processed and output together
* Live preview in editor shows all breakpoints simultaneously
* Updated attributes: cssKubeCSS_all, cssKubeCSS_mobile, cssKubeCSS_tablet, cssKubeCSS_desktop
* Improved tab styling with hover effects and active states
* Icons for each device type using WordPress Dashicons

= 1.2.0 =
* NEW: Added responsive design support with device-specific CSS
* Added "Apply CSS to" dropdown with options: All Devices, Mobile, Tablet, Desktop
* CSS is automatically wrapped in appropriate media queries
* Breakpoints: Mobile (max-width 767px), Tablet (768px-1024px), Desktop (min-width 1025px)
* Live preview works with media queries in the editor
* Frontend rendering respects media query settings

= 1.1.1 =
* BUGFIX: Fixed & placeholder replacement for descendant selectors
* "& button" now correctly outputs "#id button, .class button"
* Ensures CSS targeting child elements works properly

= 1.1.0 =
* SECURITY: Added capability checks - requires unfiltered_html capability (Administrators only)
* SECURITY: Comprehensive CSS sanitization to prevent malicious code injection
* SECURITY: Output escaping with wp_kses() for all CSS content
* SECURITY: Blocks dangerous CSS properties: expression(), @import, behavior, -moz-binding
* SECURITY: Removes JavaScript protocols: javascript:, vbscript:, data:text/html
* Added csskube_required_capability filter for customization
* Added SECURITY.md with detailed security documentation
* Replaced serialize() with wp_json_encode() for better performance

= 1.0.3 =
* Fixed Site Editor live preview - CSS now properly injected into iframe document
* Simplified CSS selectors for better compatibility
* Improved handling of iframe document for Site Editor

= 1.0.2 =
* Fixed CSS being applied to List View sidebar (unintended side effect)
* Added Site Editor compatibility - CSS now works in template/theme editor
* Made CSS selectors more specific to target only block canvas

= 1.0.1 =
* Added live CSS preview in the editor
* CSS is now applied in real-time as you type
* Removed CSS badge indicator in favor of live styling
* Improved block ID injection reliability

= 1.0.0 =
* Initial release
* CSS textarea for all blocks
* Inline rendering on frontend
* No build process required

== Upgrade Notice ==

= 1.3.1 =
Improved user experience with visual indicators showing which tabs contain CSS and better tab navigation.

= 1.3.0 =
Major interface upgrade! Now features tabbed UI for managing CSS across all device breakpoints simultaneously.

= 1.1.0 =
Important security update. Adds capability checks and CSS sanitization. All users should upgrade immediately.

= 1.0.0 =
Initial release of CSSKube.

== Additional Information ==

= Support =

For support, bug reports, or feature requests, please visit [Cozmoslabs](https://cozmoslabs.com) or contact us directly.

= Documentation =

Comprehensive documentation is included with the plugin:
* README.md - User guide with examples
* SECURITY.md - Security documentation
* TESTING.md - Testing procedures
* CLAUDE.md - Developer documentation

= Contributing =

This plugin follows WordPress coding standards and security best practices. When contributing:
* Never remove or weaken CSS sanitization
* Keep capability checks in place
* Test in both Post Editor and Site Editor
* Follow WordPress coding standards
* Document all changes

= Privacy Policy =

CSSKube does not collect, store, or transmit any user data. All CSS is stored locally in your WordPress database as block attributes.

= License =

This plugin is licensed under GPL v2 or later.

Copyright (C) 2024 Cozmoslabs

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
