# ValueAlign URL Standards

This document outlines the URL structure and permalink standards for the ValueAlign website and application.

## URL Structure Rules

### General URL Guidelines

1. **Directory-Based Structure**
   - All pages should follow a directory-based structure
   - Use `directory/index.html` instead of `directory.njk` or `directory.html`
   - Example: `/about/index.html` outputs to `/about/` URL

2. **Trailing Slashes**
   - All URLs must end with a trailing slash
   - Example: `/login/` not `/login`
   - Exception: Direct file downloads (PDF, images, etc.)

3. **Explicit Permalinks**
   - Set explicit permalinks in front matter for all pages
   - Example:
     ```yaml
     ---
     permalink: /about/
     ---
     ```

4. **Case Format**
   - Use kebab-case (hyphen-separated) for multi-word paths
   - Example: `/values-assessment/` not `/values_assessment/` or `/valuesAssessment/`

### Specific Section Rules

1. **Dashboard Pages**
   - All dashboard pages must be under `/dashboard/` URL path
   - Legacy `/portal_*` URLs are being phased out
   - Example: `/dashboard/values-assessment/`

2. **Public Pages**
   - Public pages like `/login/` and `/register/` should be at the root level
   - Content sections should be grouped in subdirectories
   - Example: `/resources/faq/`

3. **Test Pages**
   - Test pages should follow the same directory structure
   - Example: `/test-auth/` instead of `test-auth.njk`

## Permalink Conflict Prevention

Permalink conflicts occur when multiple files generate the same output URL. To prevent these:

1. **Remove Duplicate Source Files**
   - When migrating from root-level files to directory structure, remove the root file
   - Example: Delete `register.njk` when creating `register/index.html`

2. **Run Validation Script**
   - Use the URL validation script to detect conflicts before build
   - Example: `npm run validate-urls`

3. **Check Build Output**
   - Review Eleventy build logs for "Multiple files write to the same path" warnings

## URL Redirects

1. **Legacy to New URL Redirects**
   - Configure redirects in `.eleventy.js` for changed URLs
   - Ensure old URLs are redirected to their new counterparts

2. **No-Trailing-Slash Redirects**
   - URLs without trailing slashes should automatically redirect to URLs with trailing slashes

## Implementation Guidelines

1. **Front Matter**
   ```yaml
   ---
   layout: base.njk
   title: Page Title
   permalink: /section/page-name/
   ---
   ```

2. **URL Generation in Templates**
   - Use the ensureTrailingSlash filter for generating links
   - Example:
     ```html
     <a href="{% raw %}{{ '/about' | ensureTrailingSlash }}{% endraw %}">About Us</a>
     <!-- Outputs: <a href="/about/">About Us</a> -->
     ```

3. **Dashboard Links**
   - Use the dashboardUrl filter
   - Example:
     ```html
     <a href="{% raw %}{{ 'values-assessment' | dashboardUrl }}{% endraw %}">Values Assessment</a>
     <!-- Outputs: <a href="/dashboard/values-assessment/">Values Assessment</a> -->
     ```

## Validation

The project includes a URL validation script that checks:
- Permalink conflicts between files
- Missing trailing slashes
- Invalid URL formats
- Underscore usage in URLs

Run the validation with:
```
node scripts/validate-urls.js
```

or

```
npm run validate-urls
```

## Best Practices

1. Always add explicit permalinks in front matter
2. Use directory/index.html pattern for all new pages
3. Check for permalink conflicts when adding new pages
4. Use kebab-case for all multi-word URL segments
5. Include trailing slashes in all internal links
