// ValueAlign Code Audit Tool
"use strict";

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname);
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'code-audit-report.md');
const EXCLUDE_DIRS = ['node_modules', '_site', '.git', '.vscode'];
const FILE_TYPES = ['.njk', '.js', '.html', '.css', '.md', '.json'];

// Helper functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileStats(filePath) {
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lineCount = content.split('\n').length;
  
  return {
    size: stats.size,
    formattedSize: formatBytes(stats.size),
    lineCount,
    lastModified: stats.mtime,
    path: filePath
  };
}

function getDirectoryFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    // Skip excluded directories
    if (fs.statSync(filePath).isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        getDirectoryFiles(filePath, fileList);
      }
      return;
    }
    
    // Only include specified file types
    const ext = path.extname(file).toLowerCase();
    if (FILE_TYPES.includes(ext)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Generate file statistics
function generateFileStats() {
  const fileList = getDirectoryFiles(PROJECT_ROOT);
  const stats = fileList.map(file => getFileStats(file));
  
  // Sort by size descending
  return stats.sort((a, b) => b.size - a.size);
}

// Check HTML accessibility
function checkAccessibility(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Basic accessibility checks
  if (!content.includes('aria-')) issues.push('No ARIA attributes found');
  if (!content.includes('alt=') && content.includes('<img')) issues.push('Images may be missing alt text');
  if (content.includes('<a') && !content.includes('aria-label') && !content.includes('title=')) 
    issues.push('Links may be missing accessible labels');
  
  return issues;
}

// Check JavaScript issues
function checkJavaScript(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Basic JS checks
  if (content.includes('console.log')) issues.push('Debug console.log statements found');
  if (content.includes('alert(')) issues.push('Alert statements found - consider more accessible notifications');
  if (!content.includes('use strict')) issues.push('Missing "use strict" directive');
  
  return issues;
}

// Generate audit report
function generateReport() {
  const files = generateFileStats();
  
  let report = `# ValueAlign Eleventy Code Audit Report
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

## Project Summary
- Total Files: ${files.length}
- Total Lines of Code: ${files.reduce((sum, file) => sum + file.lineCount, 0)}
- Total Size: ${formatBytes(files.reduce((sum, file) => sum + file.size, 0))}

## File Analysis

`;

  // Group by file type
  const fileTypes = {};
  files.forEach(file => {
    const ext = path.extname(file.path).toLowerCase();
    if (!fileTypes[ext]) fileTypes[ext] = [];
    fileTypes[ext].push(file);
  });
  
  // Add file type summaries
  Object.keys(fileTypes).forEach(ext => {
    const typeFiles = fileTypes[ext];
    report += `### ${ext.substring(1).toUpperCase()} Files
- Count: ${typeFiles.length}
- Total Lines: ${typeFiles.reduce((sum, file) => sum + file.lineCount, 0)}
- Total Size: ${formatBytes(typeFiles.reduce((sum, file) => sum + file.size, 0))}

`;
  });
  
  // Add largest files section
  report += `## Largest Files
| File | Size | Lines |
|------|------|-------|
`;
  
  files.slice(0, 10).forEach(file => {
    const relativePath = path.relative(PROJECT_ROOT, file.path);
    report += `| ${relativePath} | ${file.formattedSize} | ${file.lineCount} |\n`;
  });
  
  // Accessibility check
  report += `\n## Accessibility Audit\n`;
  
  const htmlFiles = files.filter(file => 
    path.extname(file.path).toLowerCase() === '.html' || 
    path.extname(file.path).toLowerCase() === '.njk'
  );
  
  let accessibilityIssues = 0;
  
  htmlFiles.forEach(file => {
    const issues = checkAccessibility(file.path);
    if (issues.length > 0) {
      accessibilityIssues++;
      const relativePath = path.relative(PROJECT_ROOT, file.path);
      report += `\n### ${relativePath}\n`;
      issues.forEach(issue => report += `- ⚠️ ${issue}\n`);
    }
  });
  
  if (accessibilityIssues === 0) {
    report += `\nNo major accessibility issues detected! 👍\n`;
  } else {
    report += `\n${accessibilityIssues} files have potential accessibility issues.\n`;
  }
  
  // JavaScript check
  report += `\n## JavaScript Code Quality\n`;
  
  const jsFiles = files.filter(file => path.extname(file.path).toLowerCase() === '.js');
  
  let jsIssues = 0;
  
  jsFiles.forEach(file => {
    const issues = checkJavaScript(file.path);
    if (issues.length > 0) {
      jsIssues++;
      const relativePath = path.relative(PROJECT_ROOT, file.path);
      report += `\n### ${relativePath}\n`;
      issues.forEach(issue => report += `- ⚠️ ${issue}\n`);
    }
  });
  
  if (jsIssues === 0) {
    report += `\nNo major JavaScript issues detected! 👍\n`;
  } else {
    report += `\n${jsIssues} JavaScript files have potential issues.\n`;
  }
  
  // Recommendations
  report += `
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

`;
  
  // Write report to file
  fs.writeFileSync(OUTPUT_FILE, report);
  
  console.log(`Audit report generated at: ${OUTPUT_FILE}`);
  return report;
}

// Run the report
generateReport();
