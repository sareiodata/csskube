# Testing CSSKube Plugin

This guide will help you test the CSSKube plugin functionality.

## Activation

From inside the DDEV container, run:

```bash
wp plugin activate csskube
```

Or activate from WordPress Admin:
1. Go to https://translatepress.ddev.site/wp-admin/plugins.php
2. Find "CSSKube - Block CSS Editor"
3. Click "Activate"

## Testing Steps

### 1. Create a Test Post

```bash
# Create a test post with a paragraph block
wp post create --post_type=post --post_status=publish --post_title="CSSKube Test" --post_content="<!-- wp:paragraph -->
<p>This is a test paragraph.</p>
<!-- /wp:paragraph -->"
```

### 2. Edit in Block Editor

1. Go to https://translatepress.ddev.site/wp-admin/
2. Navigate to Posts → All Posts
3. Click "Edit" on the "CSSKube Test" post
4. Select the paragraph block

### 3. Add Custom CSS

1. Open the block settings sidebar (gear icon in top-right)
2. Scroll down to find "Custom CSS" panel
3. Click to expand it
4. Add some test CSS:
   ```css
   background-color: #e3f2fd;
   padding: 20px;
   border-left: 4px solid #2196f3;
   border-radius: 4px;
   font-size: 18px;
   ```
5. Update/Publish the post

### 4. Verify Frontend

1. View the post on the frontend
2. Inspect the block element
3. You should see:
   - An inline `<style>` tag before the block
   - The block element with a unique ID
   - The CSS rules applied to that specific block

### 5. Test Multiple Blocks

1. Add several different blocks (paragraph, heading, image, etc.)
2. Add different CSS to each block
3. Verify each block has its own unique styling
4. Check that styles don't conflict with each other

## Expected Results

### In Editor:
- "Custom CSS" panel appears in block settings for all blocks
- Blocks with custom CSS show a blue "CSS" badge
- Textarea accepts CSS input and saves it

### On Frontend:
- Custom CSS is applied to blocks
- Each block has a unique ID (format: `csskube-[hash]`)
- Inline `<style>` tag contains the CSS scoped to the block ID
- No JavaScript errors in browser console

## Testing CSS Examples

### Paragraph Block
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 30px;
border-radius: 10px;
```

### Heading Block
```css
color: #2c3e50;
border-bottom: 3px solid #3498db;
padding-bottom: 10px;
margin-bottom: 20px;
```

### Image Block
```css
border: 5px solid #ecf0f1;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
transition: transform 0.3s ease;
```

### List Block
```css
background-color: #fff9c4;
padding: 20px;
border-radius: 8px;
list-style-position: inside;
```

## Troubleshooting

### Plugin Not Showing Up

```bash
# Check if plugin files exist
ls -la /var/www/html/wp-content/plugins/csskube/

# Check WordPress can read the plugin
wp plugin list | grep csskube
```

### CSS Not Appearing in Editor

1. Check browser console for JavaScript errors
2. Verify block editor assets are loading:
   ```bash
   curl -I https://translatepress.ddev.site/wp-content/plugins/csskube/js/block-css-control.js
   ```
3. Clear browser cache and reload editor

### CSS Not Rendering on Frontend

1. Check post content has the CSS attribute:
   ```bash
   wp post get [POST_ID] --field=post_content
   ```
2. Look for `cssKubeCSS` in the block attributes
3. View page source to verify `<style>` tags are present

### Debug Mode

Enable WordPress debug mode to see any PHP errors:

```bash
# Check debug log
tail -f /var/www/html/wp-content/debug.log
```

## Manual Testing Checklist

- [ ] Plugin activates without errors
- [ ] "Custom CSS" panel appears in block settings
- [ ] CSS can be entered in textarea
- [ ] CSS is saved with the block
- [ ] "CSS" badge appears on blocks with custom CSS
- [ ] CSS renders correctly on frontend
- [ ] Multiple blocks can have different CSS
- [ ] CSS is scoped to individual blocks only
- [ ] No console errors in browser
- [ ] Works with different block types (paragraph, heading, image, etc.)
- [ ] CSS persists after saving and reloading
- [ ] Plugin can be deactivated without errors

## Test Post Content

You can use this full test post content:

```bash
wp post create --post_type=post --post_status=publish --post_title="CSSKube Full Test" --post_content='<!-- wp:heading -->
<h2>Welcome to CSSKube Test</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This is a regular paragraph that you can style.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>
<!-- /wp:list -->

<!-- wp:image -->
<figure class="wp-block-image"><img src="https://via.placeholder.com/800x400" alt="Test image"/></figure>
<!-- /wp:image -->

<!-- wp:quote -->
<blockquote class="wp-block-quote"><p>This is a quote block for testing.</p></blockquote>
<!-- /wp:quote -->'
```

## Success Criteria

The plugin is working correctly when:
1. You can add CSS to any block via the inspector panel
2. The CSS appears inline on the frontend
3. Each block maintains its own unique styling
4. No conflicts between block styles
5. Performance is good (no slowdowns in editor or frontend)
