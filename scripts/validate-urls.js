/**
 * URL Validation Script for ValueAlign
 * 
 * This script validates URLs and permalinks in the Eleventy project to ensure they follow
 * the established standards and don't contain conflicts.
 * 
 * Usage: node scripts/validate-urls.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

// Configuration
const config = {
  // Directories to scan
  directories: [
    '.', 
    'pages', 
    'resources', 
    'dashboard'
  ],
  // File patterns to check
  patterns: ['**/*.{html,njk,md}', '!_site/**', '!node_modules/**'],
  // URL standards
  standards: {
    requireTrailingSlash: true,
    allowedExtensions: ['.html', '.pdf', '.json', '.xml'],
    dashboardPattern: /^\/dashboard\/[-a-z0-9]+\/$/,
    kebabCaseOnly: true
  }
};

// Stores all collected permalinks for conflict detection
const permalinkRegistry = new Map();
// Stores file paths mapped to their output permalinks
const fileToPermalinkMap = new Map();
// Stores detected issues
const issues = [];

/**
 * Extracts and validates permalinks from files
 */
function validatePermalinks() {
  console.log('Starting URL validation...');
  
  config.directories.forEach(dir => {
    config.patterns.forEach(pattern => {
      const files = glob.sync(path.join(dir, pattern));
      
      files.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const frontMatter = matter(content);
          
          // Extract permalink from front matter
          let permalink = frontMatter.data.permalink;
          
          // If no explicit permalink, derive from file path
          if (!permalink) {
            permalink = derivePermalinkFromPath(file);
          }
          
          // Skip if permalink couldn't be determined
          if (!permalink) return;
          
          // Store permalink and file for conflict detection
          if (permalinkRegistry.has(permalink)) {
            issues.push({
              type: 'conflict',
              permalink,
              file1: permalinkRegistry.get(permalink),
              file2: file,
              message: `Permalink conflict: "${permalink}" is used by both "${permalinkRegistry.get(permalink)}" and "${file}"`
            });
          } else {
            permalinkRegistry.set(permalink, file);
            fileToPermalinkMap.set(file, permalink);
          }
          
          // Validate permalink format
          validatePermalinkFormat(permalink, file);
          
        } catch (error) {
          issues.push({
            type: 'error',
            file,
            message: `Error processing file: ${error.message}`
          });
        }
      });
    });
  });
  
  // Output results
  reportResults();
}

/**
 * Derives a permalink from file path if not explicitly specified
 */
function derivePermalinkFromPath(filePath) {
  // Handle index files
  if (path.basename(filePath) === 'index.html' || path.basename(filePath) === 'index.njk' || path.basename(filePath) === 'index.md') {
    const dirPath = path.dirname(filePath);
    if (dirPath === '.') return '/';
    return '/' + dirPath.replace(/\\/g, '/') + '/';
  }
  
  // Handle other files
  const parsed = path.parse(filePath);
  if (parsed.name === 'index') return;
  
  let permalink = '/' + parsed.dir.replace(/\\/g, '/');
  if (permalink !== '/') permalink += '/';
  permalink += parsed.name + '/';
  
  return permalink;
}

/**
 * Validates permalink format according to standards
 */
function validatePermalinkFormat(permalink, file) {
  // Check for trailing slash for non-file URLs
  if (config.standards.requireTrailingSlash) {
    const hasAllowedExtension = config.standards.allowedExtensions.some(ext => permalink.endsWith(ext));
    
    if (!hasAllowedExtension && !permalink.endsWith('/')) {
      issues.push({
        type: 'format',
        file,
        permalink,
        message: `Missing trailing slash: "${permalink}" should end with "/"`
      });
    }
  }
  
  // Validate dashboard URL pattern
  if (permalink.startsWith('/dashboard/') && !permalink.match(config.standards.dashboardPattern)) {
    issues.push({
      type: 'format',
      file,
      permalink,
      message: `Invalid dashboard URL format: "${permalink}" should match pattern "/dashboard/section-name/"`
    });
  }
  
  // Check for kebab-case in multi-word paths
  if (config.standards.kebabCaseOnly) {
    const pathSegments = permalink.split('/').filter(Boolean);
    
    pathSegments.forEach(segment => {
      if (segment.includes('_')) {
        issues.push({
          type: 'format',
          file,
          permalink,
          message: `Invalid path format: "${segment}" in "${permalink}" uses underscores instead of kebab-case`
        });
      }
    });
  }
}

/**
 * Reports validation results to console
 */
function reportResults() {
  if (issues.length === 0) {
    console.log('✓ URL validation complete. No issues found!');
    return;
  }
  
  console.log(`\n⚠️ URL validation found ${issues.length} issues:\n`);
  
  // Group issues by type
  const groupedIssues = {
    conflict: issues.filter(i => i.type === 'conflict'),
    format: issues.filter(i => i.type === 'format'),
    error: issues.filter(i => i.type === 'error')
  };
  
  // Report conflicts first - these are most critical
  if (groupedIssues.conflict.length > 0) {
    console.log(`\n❌ PERMALINK CONFLICTS (${groupedIssues.conflict.length}):`);
    groupedIssues.conflict.forEach(issue => {
      console.log(`   - ${issue.message}`);
    });
  }
  
  // Report format issues
  if (groupedIssues.format.length > 0) {
    console.log(`\n⚠️ FORMAT ISSUES (${groupedIssues.format.length}):`);
    groupedIssues.format.forEach(issue => {
      console.log(`   - ${issue.file}: ${issue.message}`);
    });
  }
  
  // Report processing errors
  if (groupedIssues.error.length > 0) {
    console.log(`\n⚠️ PROCESSING ERRORS (${groupedIssues.error.length}):`);
    groupedIssues.error.forEach(issue => {
      console.log(`   - ${issue.file}: ${issue.message}`);
    });
  }
  
  console.log('\nRecommended actions:');
  console.log('1. Resolve permalink conflicts by moving files to directory-based structure');
  console.log('2. Add explicit permalinks to front matter where missing');
  console.log('3. Ensure all permalinks follow the ValueAlign URL standards');
  
  // Exit with error code if conflicts exist
  if (groupedIssues.conflict.length > 0) {
    process.exit(1);
  }
}

// Run the validation
validatePermalinks();
