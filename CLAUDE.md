# CSSKube - WordPress Block CSS Editor

## Project Overview

CSSKube is a WordPress plugin that adds custom CSS capabilities to every Gutenberg block through a tabbed interface in the block inspector. It allows administrators to add device-specific CSS (All, Mobile, Tablet, Desktop) with live preview in the editor and automatic media query wrapping on the frontend.

**Key Features:**
- Tabbed UI for managing CSS across 4 breakpoints
- Live CSS preview in both Post Editor and Site Editor
- Visual indicators showing which tabs contain CSS
- Security: Capability checks, CSS sanitization, output escaping
- No build process required - pure JavaScript implementation

## Architecture

### Core Components

1. **PHP Backend** (`csskube.php`)
   - Singleton class pattern
   - Hooks into `render_block` filter for frontend CSS injection
   - Sanitizes CSS to prevent XSS and code injection
   - Wraps CSS in appropriate media queries
   - Adds unique IDs/classes to block elements

2. **JavaScript Frontend** (`js/block-css-control.js`)
   - Uses WordPress Hooks API to extend blocks
   - Adds 4 CSS attributes to all blocks
   - Creates tabbed UI using WordPress components
   - Live preview via injected `<style>` elements
   - Handles iframe targeting for Site Editor

3. **CSS Styling** (`css/editor-styles.css`)
   - Tab styling with hover/active states
   - Visual indicators (blue dots) for tabs with CSS
   - Pulsing animation for non-active tabs with content

## File Structure

```
csskube/
├── csskube.php                 # Main plugin file (314 lines)
├── js/
│   └── block-css-control.js   # Block editor integration (318 lines)
├── css/
│   └── editor-styles.css      # Editor UI styles (82 lines)
├── README.md                   # User documentation
├── SECURITY.md                 # Security documentation
├── REVIEW.md                   # Security audit report
├── TESTING.md                  # Testing guide
├── CLAUDE.md                   # This file
└── test-plugin.sh              # Automated test script
```

## Key Concepts

### Block Attributes

The plugin adds 4 attributes to every block:
- `cssKubeCSS_all` - CSS for all devices (no media query)
- `cssKubeCSS_mobile` - CSS for max-width 767px
- `cssKubeCSS_tablet` - CSS for 768px-1024px
- `cssKubeCSS_desktop` - CSS for min-width 1025px

### CSS Processing Flow

**Editor:**
1. User enters CSS in tabbed interface
2. `useEffect` hook watches for changes
3. CSS processed and scoped to `[data-block="clientId"]`
4. Media queries added
5. `<style>` injected into document head (or iframe for Site Editor)
6. Live preview updates immediately

**Frontend:**
1. `render_block` filter triggered
2. Reads all 4 CSS attributes from block
3. Generates unique block ID via `md5()`
4. Sanitizes each CSS field
5. Processes CSS (scopes selectors, adds media queries)
6. Injects ID into first HTML element
7. Prepends `<style>` tags to block content

### Selector Scoping

CSS can be written in two ways:

**Direct properties:**
```css
background: red;
padding: 20px;
```
Becomes: `#block-id, .block-id { background: red; padding: 20px; }`

**Custom selectors with `&`:**
```css
& { background: red; }
&:hover { background: blue; }
& p { color: white; }
```
Becomes:
```css
#block-id { background: red; }
.block-id { background: red; }
#block-id:hover { background: blue; }
.block-id:hover { background: blue; }
#block-id p { color: white; }
.block-id p { color: white; }
```

Note: CSS is duplicated for both ID and class selectors because blocks may receive either an ID or a class depending on whether they already have an ID attribute.

## Security Model

### Capability-Based Access Control

Only users with `unfiltered_html` capability can use the plugin (Administrators by default).

**Why this capability?**
Users who can add custom HTML can already add custom CSS. This maintains WordPress's existing trust model.

**Customization:**
```php
add_filter('csskube_required_capability', function() {
    return 'edit_theme_options'; // Example: allow editors
});
```

### CSS Sanitization

Located in `csskube.php:145-171`, removes:
- HTML tags
- JavaScript protocols (`javascript:`, `vbscript:`, `data:text/html`)
- `@import` statements (prevent external stylesheet loading)
- IE-specific exploits (`expression()`, `behavior:`)
- Firefox bindings (`-moz-binding`)

### Output Escaping

All CSS output passes through:
- `wp_strip_all_tags()` - Remove HTML
- `wp_kses()` - WordPress sanitization
- `esc_attr()` - Escape attributes

## Development Workflow

### Making Changes

**PHP Changes:**
1. Edit `csskube.php`
2. Run syntax check: `php -l csskube.php`
3. Update version constants
4. Test on frontend

**JavaScript Changes:**
1. Edit `js/block-css-control.js`
2. No build step required - direct modification
3. Increment plugin version for cache busting
4. Test in both Post Editor and Site Editor
5. Check browser console for errors

**CSS Changes:**
1. Edit `css/editor-styles.css`
2. Increment plugin version
3. Hard refresh browser (Ctrl+Shift+R)

### Version Bumping

When making changes, update both:
1. Plugin header: `* Version: X.X.X`
2. Class constant: `const VERSION = 'X.X.X';`

This ensures browser cache is cleared automatically.

### Testing Checklist

- [ ] Test in Post Editor
- [ ] Test in Site Editor (template/theme editing)
- [ ] Test all 4 tabs (All, Mobile, Tablet, Desktop)
- [ ] Verify live preview updates
- [ ] Check frontend output (view source)
- [ ] Test with existing block IDs
- [ ] Verify CSS sanitization
- [ ] Test with different block types
- [ ] Check List View doesn't get styled
- [ ] Verify media queries work on resize

## Common Tasks

### Adding a New Media Query Breakpoint

1. **Add attribute** (`js/block-css-control.js:11-35`):
```javascript
cssKubeCSS_xlarge: {
    type: 'string',
    default: ''
}
```

2. **Add to tabs array** (`js/block-css-control.js:77-122`):
```javascript
{
    name: 'xlarge',
    title: wp.element.createElement('span', ...)
}
```

3. **Add to switch statement** (`js/block-css-control.js:123-148`)

4. **Add to useEffect** (`js/block-css-control.js:194-275`)

5. **Add to PHP processing** (`csskube.php:83-142`)

6. **Update media query function** (`csskube.php:206-218`)

### Changing Breakpoint Values

Edit two locations:
1. **JavaScript:** `js/block-css-control.js:169-181` - `getMediaQuery()` function
2. **PHP:** `csskube.php:206-218` - `get_media_query()` method

Keep them synchronized!

### Modifying CSS Sanitization

Edit `csskube.php:145-171` - `sanitize_css()` method

**Be cautious:** Removing sanitization can create security vulnerabilities. Always test with malicious input:
- `<script>alert('xss')</script>`
- `javascript:alert('xss')`
- `@import url('https://evil.com/malicious.css')`
- `expression(alert('xss'))` (IE)

### Customizing Tab Appearance

Edit `css/editor-styles.css`:
- Line 14-18: Tab container layout
- Line 21-28: Individual tab styling
- Line 30-32: Hover state
- Line 34-38: Active tab styling
- Line 53-61: Blue dot indicator
- Line 69-82: Pulsing animation

## Debugging

### Enable WordPress Debug Mode

In `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Check logs: `wp-content/debug.log`

### Browser Console

Check for JavaScript errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors related to `csskube`

### Verify CSS Output

1. View page source (Ctrl+U)
2. Search for `csskube-`
3. Verify `<style>` tags exist
4. Check that block element has matching ID/class

### Live Preview Not Working

**Possible causes:**
1. JavaScript errors - check console
2. Wrong document targeted - check `targetDocument` in useEffect
3. CSS not being processed - add `console.log()` statements
4. Cached JavaScript - hard refresh (Ctrl+Shift+R)

**Site Editor specific:**
- Verify iframe detection: `document.querySelector('iframe[name="editor-canvas"]')`
- Check if `contentDocument` is accessible
- Ensure styles are injected into iframe, not main document

### CSS Not Appearing on Frontend

**Possible causes:**
1. Capability check failing - verify user is Administrator
2. CSS sanitization removing all content - check `sanitize_css()`
3. Block attributes not saved - check post content
4. Caching - clear WordPress cache and browser cache

**Debug steps:**
```php
// Add to render_block_css() method
error_log('CSS All: ' . print_r($css_all, true));
error_log('Block ID: ' . $block_id);
error_log('Processed CSS: ' . $all_inline_css);
```

## WordPress Hooks Used

### Actions
- `enqueue_block_editor_assets` - Load editor JavaScript and CSS

### Filters
- `render_block` - Inject CSS into block content on frontend
- `blocks.registerBlockType` (JS) - Add CSS attributes to blocks
- `editor.BlockEdit` (JS) - Add inspector controls
- `editor.BlockListBlock` (JS) - Apply live preview CSS

### Custom Filters
- `csskube_required_capability` - Customize required user capability

## Browser Compatibility

**Supported:**
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

**Requirements:**
- JavaScript enabled
- CSS Grid support
- Flexbox support
- Media queries support

## Performance Considerations

### Frontend
- Each block with CSS adds 1-4 `<style>` tags (one per breakpoint with CSS)
- Inline styles = no additional HTTP requests
- Minimal performance impact for typical use (< 10 blocks with CSS)

### Editor
- Live preview uses single `<style>` element per block
- Updates on every keystroke (debounced by React)
- Minimal impact even with many blocks

### Optimization Tips
- Avoid adding CSS to many blocks unnecessarily
- Use "All" tab for styles that don't need media queries
- Consider using theme CSS for site-wide styles

## Known Limitations

1. **No CSS preprocessing** - No Sass, Less, or PostCSS support
2. **No CSS validation** - Invalid CSS won't show errors
3. **No autocomplete** - Plain textarea, no IntelliSense
4. **Block scope only** - Can't style elements outside the block (by design)
5. **List View interference** - CSS is not applied to List View (by design)

## Future Enhancement Ideas

- [ ] CSS syntax highlighting in textarea
- [ ] CSS autocomplete/IntelliSense
- [ ] CSS validation with error messages
- [ ] Import/export CSS between blocks
- [ ] CSS templates/presets
- [ ] Visual CSS builder
- [ ] CSS minification
- [ ] Dark mode support for tabs
- [ ] Keyboard shortcuts for tab switching
- [ ] Undo/redo within textarea

## Troubleshooting Guide

### Plugin Won't Activate
- Check PHP version (requires 7.4+)
- Check WordPress version (requires 6.0+)
- Check for PHP errors in debug log

### Tabs Don't Show Up
- Verify user is Administrator
- Check capability filter if customized
- Clear browser cache
- Check JavaScript console for errors

### CSS Not Saving
- Check if blocks are being saved properly
- Verify post content contains CSS attributes
- Check for conflicts with other plugins
- Try Classic Editor temporarily to debug

### CSS Conflicts
- Check for `!important` usage in theme CSS
- Verify block ID is being added correctly
- Check CSS specificity (block ID should win)
- View page source to see actual CSS output

## Resources

**WordPress Documentation:**
- [Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [Plugin Development](https://developer.wordpress.org/plugins/)
- [Security Best Practices](https://developer.wordpress.org/plugins/security/)

**CSSKube Documentation:**
- `README.md` - User guide
- `SECURITY.md` - Security documentation
- `TESTING.md` - Testing procedures
- `REVIEW.md` - Security audit report

## Contributing Guidelines

When contributing to this plugin:

1. **Maintain Security:**
   - Never remove or weaken CSS sanitization
   - Keep capability checks in place
   - Test all changes for XSS vulnerabilities

2. **Follow WordPress Standards:**
   - Use WordPress coding standards
   - Escape all output
   - Sanitize all input
   - Use WordPress functions over native PHP when available

3. **Test Thoroughly:**
   - Test in both Post Editor and Site Editor
   - Test with various block types
   - Verify frontend output
   - Check browser console for errors
   - Test with different user roles

4. **Document Changes:**
   - Update README.md changelog
   - Add inline code comments
   - Update this CLAUDE.md if architecture changes
   - Bump version number

5. **Version Management:**
   - Use semantic versioning (MAJOR.MINOR.PATCH)
   - MAJOR: Breaking changes
   - MINOR: New features (backward compatible)
   - PATCH: Bug fixes

## Contact & Support

**Developer:** Cozmoslabs
**Repository:** https://github.com/cozmoslabs/csskube (if public)
**Issues:** Contact Cozmoslabs directly

## License

GPL v2 or later - See plugin header for full license information.

---

**Last Updated:** 2025-11-07
**Plugin Version:** 1.3.1
**WordPress Version:** 6.0+
**PHP Version:** 7.4+
