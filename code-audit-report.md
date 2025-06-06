# ValueAlign Eleventy Code Audit Report
Generated: 6/4/2025 11:39:16 PM

## Project Summary
- Total Files: 23
- Total Lines of Code: 9838
- Total Size: 352.05 KB

## File Analysis

### JSON Files
- Count: 4
- Total Lines: 4496
- Total Size: 153.86 KB

### CSS Files
- Count: 1
- Total Lines: 2513
- Total Size: 42.28 KB

### JS Files
- Count: 5
- Total Lines: 1102
- Total Size: 43.81 KB

### HTML Files
- Count: 2
- Total Lines: 362
- Total Size: 29.96 KB

### NJK Files
- Count: 10
- Total Lines: 1233
- Total Size: 79.2 KB

### MD Files
- Count: 1
- Total Lines: 132
- Total Size: 2.95 KB

## Largest Files
| File | Size | Lines |
|------|------|-------|
| package-lock.json | 95.21 KB | 2758 |
| test-eleventy\package-lock.json | 57.87 KB | 1698 |
| css\tailwind-output.css | 42.28 KB | 2513 |
| js\portal.js | 30.01 KB | 650 |
| index.html | 17.32 KB | 234 |
| register.njk | 15.27 KB | 209 |
| features.njk | 13.68 KB | 204 |
| _portal_header_loggedout.html | 12.64 KB | 128 |
| src\blog.njk | 11.46 KB | 187 |
| blog.njk | 6.89 KB | 102 |

## Accessibility Audit

### index.html
- ⚠️ No ARIA attributes found
- ⚠️ Links may be missing accessible labels

### features.njk
- ⚠️ No ARIA attributes found
- ⚠️ Links may be missing accessible labels

### src\blog.njk
- ⚠️ No ARIA attributes found
- ⚠️ Links may be missing accessible labels

### blog.njk
- ⚠️ No ARIA attributes found
- ⚠️ Links may be missing accessible labels

### discover.njk
- ⚠️ No ARIA attributes found
- ⚠️ Links may be missing accessible labels

### faq.njk
- ⚠️ No ARIA attributes found
- ⚠️ Links may be missing accessible labels

### about.njk
- ⚠️ No ARIA attributes found

7 files have potential accessibility issues.

## JavaScript Code Quality

### js\portal.js
- ⚠️ Debug console.log statements found

### code-audit.js
- ⚠️ Debug console.log statements found
- ⚠️ Alert statements found - consider more accessible notifications

### dev-server.js
- ⚠️ Debug console.log statements found
- ⚠️ Missing "use strict" directive

### .eleventy.js
- ⚠️ Missing "use strict" directive

4 JavaScript files have potential issues.

## Recommendations

1. **Accessibility Improvements**:
   - Ensure all images have descriptive alt text
   - Add appropriate ARIA attributes to interactive elements
   - Review form elements for proper labeling

2. **Code Optimization**:
   - Minify CSS and JavaScript for production
   - Optimize image assets
   - Consider lazy loading for images

3. **Best Practices**:
   - Add comprehensive documentation
   - Implement consistent naming conventions
   - Add unit tests for JavaScript functionality

