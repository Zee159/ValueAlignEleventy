/**
 * ValueAlign URL Utilities
 * Standardizes URL handling across the site to ensure consistent trailing slashes and URL patterns.
 */

const VAUrlUtils = {
  /**
   * Ensures a path has a trailing slash
   * @param {string} path - The URL path to normalize
   * @returns {string} - The normalized path with trailing slash
   */
  getPageUrl: function(path) {
    if (!path) return '/';
    
    // Remove any query parameters or hash fragments before processing
    let cleanPath = path.split('?')[0].split('#')[0];
    
    // Add trailing slash if not present and not a file path
    if (!cleanPath.endsWith('/') && !cleanPath.includes('.')) {
      cleanPath = `${cleanPath}/`;
    }
    
    // Reconstruct the URL with any query params or hash
    const queryPart = path.includes('?') ? path.substring(path.indexOf('?')) : '';
    const hashPart = path.includes('#') ? path.substring(path.indexOf('#')) : '';
    
    return cleanPath + queryPart + hashPart;
  },
  
  /**
   * Creates a dashboard section URL
   * @param {string} section - The dashboard section (without /dashboard/ prefix)
   * @returns {string} - The full dashboard URL with trailing slash
   */
  getDashboardUrl: function(section) {
    if (!section) return '/dashboard/';
    
    // Remove any leading or trailing slashes from section
    const cleanSection = section.replace(/^\/|\/$/g, '');
    
    return `/dashboard/${cleanSection}/`;
  },
  
  /**
   * Converts legacy portal URLs to dashboard URLs
   * @param {string} url - The legacy portal URL to convert
   * @returns {string} - The converted dashboard URL
   */
  portalToDashboard: function(url) {
    if (!url || !url.includes('portal_')) return url;
    
    // Replace portal_ with dashboard/ and convert underscores to hyphens in the path
    return url.replace('/portal_', '/dashboard/')
              .replace(/\.html$/, '/')
              .replace(/_/g, '-');
  },
  
  /**
   * Gets the base URL without path
   * @returns {string} - Base URL of the current site
   */
  getBaseUrl: function() {
    return window.location.protocol + '//' + window.location.host;
  },
  
  /**
   * Checks if a URL is internal to the site
   * @param {string} url - The URL to check
   * @returns {boolean} - True if the URL is internal
   */
  isInternalUrl: function(url) {
    if (!url) return false;
    if (url.startsWith('/')) return true;
    
    const baseUrl = this.getBaseUrl();
    return url.startsWith(baseUrl);
  }
};

// Export for both browser and module contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VAUrlUtils;
} else if (typeof window !== 'undefined') {
  window.VAUrlUtils = VAUrlUtils;
}
