"use strict";

module.exports = function(eleventyConfig) {
  // Passthrough copy for static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("scripts");
  
  // Dashboard components - making them available for direct fetch in JS
  eleventyConfig.addPassthroughCopy("_includes/dashboard-header.html");
  eleventyConfig.addPassthroughCopy("_includes/dashboard-header-loggedout.html");
  eleventyConfig.addPassthroughCopy("_includes/dashboard-footer.html");
  
  // Global data
  eleventyConfig.addGlobalData("currentYear", new Date().getFullYear());
  
  // ----- URL STANDARDIZATION AND REDIRECTS -----
  
  // Define redirects from old portal_* paths to new dashboard/* paths
  const legacyRedirects = {
    "/portal_journal/": "/dashboard/journal/",
    "/portal_account/": "/dashboard/account/",
    "/portal_exercises/": "/dashboard/exercises/",
    "/portal_acts/": "/dashboard/acts/",
    "/portal_progress/": "/dashboard/progress/",
    "/portal_reflection/": "/dashboard/reflection/",
    "/portal_values_assessment/": "/dashboard/values-assessment/",
    "/portal_test/": "/dashboard/test/",
    "/portal_todays_reflection.html": "/dashboard/todays-reflection/",
    "/portal_act.html": "/dashboard/act/"
  };
  
  // Add redirects for pages that moved from root to directory-based structure
  const structureRedirects = {
    "/register": "/register/",
    "/login": "/login/",
    "/signup": "/signup/",
    "/discover": "/discover/",
    "/about": "/about/",
    "/faq": "/faq/",
    "/auth-flow-test": "/auth-flow-test/",
    "/test-auth": "/test-auth/",
    "/test-auth-meta": "/test-auth-meta/"
  };
  
  // Combine all redirects into one map
  const allRedirects = {
    ...legacyRedirects,
    ...structureRedirects
  };
  
  // Generate redirect files for all paths
  const redirectsConfig = [];
  
  // Create redirect pages for each path
  Object.entries(allRedirects).forEach(([oldPath, newPath]) => {
    // Handle trailing slash variations
    const oldPathBase = oldPath.replace(/\/$/, "");
    const oldPathWithSlash = oldPathBase + "/";
    const outputPath = oldPathBase + "/index.html";
    
    // Add to Netlify _redirects file config
    redirectsConfig.push(`${oldPathBase} ${newPath} 301`);
    
    // Create a redirect HTML file for servers that don't support _redirects
    // Use a different directory to prevent file/directory conflicts
    eleventyConfig.addPassthroughCopy({
      "_redirect_templates/redirect.html": outputPath
    });
    
    // Add redirect data
    const safeKey = oldPath.replace(/[^a-zA-Z0-9]/g, "_");
    eleventyConfig.addGlobalData(`redirect_${safeKey}_data`, {
      layout: "layouts/redirect.njk",
      targetUrl: newPath,
      eleventyExcludeFromCollections: true
    });
  });
  
  // Generate a _redirects file for Netlify
  eleventyConfig.addPassthroughCopy({
    "_redirects/_redirects": "_redirects"
  });
  
  // Ensure redirects directory is treated as a directory
  eleventyConfig.addPassthroughCopy({
    "_redirects/index.html": "redirect-pages/index.html"
  });
  
  // Add the redirects config to global data for use in templates
  eleventyConfig.addGlobalData("redirectsConfig", redirectsConfig);
  
  // Add a shortcode for creating meta redirect tags
  eleventyConfig.addShortcode("metaRedirect", function(targetUrl) {
    return `<meta http-equiv="refresh" content="0;url=${targetUrl}">`;
  });
  
  // Add URL utility filters for consistent URL handling
  // Convert portal_* paths to dashboard/* paths
  eleventyConfig.addFilter("portalToDashboard", function(url) {
    if (url && url.startsWith("/portal_")) {
      // Replace portal_ with dashboard/ and convert underscores to hyphens in the path
      return url.replace("/portal_", "/dashboard/")
                .replace(/\.html$/, "/")
                .replace(/_/g, "-");
    }
    return url;
  });
  
  // Ensure URL has a trailing slash
  eleventyConfig.addFilter("ensureTrailingSlash", function(url) {
    if (!url) return "/";
    
    // Don't add trailing slash to URLs with file extensions
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(url);
    if (hasExtension) return url;
    
    // Remove any existing trailing slash and add it back
    return url.replace(/\/$/, "") + "/";
  });
  
  // Format dashboard URL
  eleventyConfig.addFilter("dashboardUrl", function(section) {
    if (!section) return "/dashboard/";
    
    // Remove any leading or trailing slashes from section
    const cleanSection = section.replace(/^\/|\/$/g, '');
    
    return `/dashboard/${cleanSection}/`;
  });

  // Return your Object options:
  return {
    dir: {
      input: ".", // Root directory for content files
      includes: "_includes", // Folder for layouts, partials
      layouts: "_includes", // Specify that layouts are in the _includes directory
      output: "_site" // Folder for generated site
    },
    passthroughFileCopy: true,
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
