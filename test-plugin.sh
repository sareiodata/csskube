#!/bin/bash

# Test script for CSSKube plugin
# Run this from inside the DDEV container

echo "======================================"
echo "CSSKube Plugin Test Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if plugin exists
echo -e "${YELLOW}1. Checking if plugin files exist...${NC}"
if [ -f "/var/www/html/wp-content/plugins/csskube/csskube.php" ]; then
    echo -e "${GREEN}✓ Plugin file found${NC}"
else
    echo -e "${RED}✗ Plugin file not found${NC}"
    exit 1
fi

# 2. Activate plugin
echo -e "\n${YELLOW}2. Activating plugin...${NC}"
wp plugin activate csskube --allow-root 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Plugin activated${NC}"
else
    echo -e "${RED}✗ Failed to activate plugin${NC}"
fi

# 3. Check plugin status
echo -e "\n${YELLOW}3. Checking plugin status...${NC}"
wp plugin status csskube --allow-root

# 4. Create test post with direct CSS properties
echo -e "\n${YELLOW}4. Creating test post with direct CSS properties...${NC}"
POST_ID=$(wp post create \
    --post_type=post \
    --post_status=publish \
    --post_title="CSSKube Test - Direct CSS" \
    --post_content='<!-- wp:paragraph {"cssKubeCSS":"background-color: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3;"} -->
<p>This paragraph has direct CSS properties applied.</p>
<!-- /wp:paragraph -->' \
    --porcelain \
    --allow-root)

if [ ! -z "$POST_ID" ]; then
    echo -e "${GREEN}✓ Test post created (ID: $POST_ID)${NC}"
    POST_URL=$(wp post url $POST_ID --allow-root)
    echo -e "   URL: $POST_URL"
else
    echo -e "${RED}✗ Failed to create test post${NC}"
fi

# 5. Create test post with custom selectors
echo -e "\n${YELLOW}5. Creating test post with custom selectors...${NC}"
POST_ID_2=$(wp post create \
    --post_type=post \
    --post_status=publish \
    --post_title="CSSKube Test - Custom Selectors" \
    --post_content='<!-- wp:paragraph {"cssKubeCSS":"& { background: #fff3e0; padding: 20px; } &:hover { background: #ffe0b2; }"} -->
<p>This paragraph uses custom selectors with &amp; placeholder.</p>
<!-- /wp:paragraph -->' \
    --porcelain \
    --allow-root)

if [ ! -z "$POST_ID_2" ]; then
    echo -e "${GREEN}✓ Test post created (ID: $POST_ID_2)${NC}"
    POST_URL_2=$(wp post url $POST_ID_2 --allow-root)
    echo -e "   URL: $POST_URL_2"
else
    echo -e "${RED}✗ Failed to create test post${NC}"
fi

# 6. Fetch first post and check for style tag
echo -e "\n${YELLOW}6. Checking frontend output for direct CSS...${NC}"
if [ ! -z "$POST_ID" ]; then
    HTML=$(curl -s "$POST_URL")

    if echo "$HTML" | grep -q "csskube-"; then
        echo -e "${GREEN}✓ CSSKube ID found in HTML${NC}"
    else
        echo -e "${RED}✗ CSSKube ID not found in HTML${NC}"
    fi

    if echo "$HTML" | grep -q "<style>"; then
        echo -e "${GREEN}✓ Style tag found in HTML${NC}"
    else
        echo -e "${RED}✗ Style tag not found in HTML${NC}"
    fi

    if echo "$HTML" | grep -q "background-color.*#e3f2fd"; then
        echo -e "${GREEN}✓ Custom CSS found in output${NC}"
    else
        echo -e "${RED}✗ Custom CSS not found in output${NC}"
    fi
fi

# 7. Summary
echo -e "\n${YELLOW}======================================"
echo "Test Summary"
echo "======================================${NC}"
echo ""
echo "Test posts created:"
echo "1. Direct CSS: $POST_URL"
echo "2. Custom Selectors: $POST_URL_2"
echo ""
echo "Next steps:"
echo "1. Visit the URLs above to see the CSS in action"
echo "2. Edit the posts in the block editor"
echo "3. Check the 'Custom CSS' panel in block settings"
echo "4. Inspect the HTML source to see the generated IDs and styles"
echo ""
