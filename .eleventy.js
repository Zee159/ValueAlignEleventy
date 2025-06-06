"use strict";

module.exports = function(eleventyConfig) {
  // Passthrough copy for static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  
  // Standard headers - we only need the main ones, not the _new versions
  eleventyConfig.addPassthroughCopy("_portal_header.html");
  eleventyConfig.addPassthroughCopy("_portal_header_loggedout.html");
  
  // Global data
  eleventyConfig.addGlobalData("currentYear", new Date().getFullYear());
  
  // Define redirects from old portal_* paths to new dashboard/* paths
  const redirects = {
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
  
  // Create redirect pages for each old path
  Object.entries(redirects).forEach(([oldPath, newPath]) => {
    // Create a redirect data file for each old path
    eleventyConfig.addPassthroughCopy({
      "_redirects/redirect.html": oldPath.replace(/\/$/, "/index.html")
    });
    
    // Add redirect data
    eleventyConfig.addGlobalData(`redirect_${oldPath.replace(/[^a-zA-Z0-9]/g, "_")}_data`, {
      layout: "layouts/redirect.njk",
      targetUrl: newPath,
      eleventyExcludeFromCollections: true
    });
  });
  
  // Add a shortcode for creating meta redirect tags
  eleventyConfig.addShortcode("metaRedirect", function(targetUrl) {
    return `<meta http-equiv="refresh" content="0;url=${targetUrl}">`;
  });
  
  // Add a filter to convert portal_* paths to dashboard/* paths
  eleventyConfig.addFilter("portalToDashboard", function(url) {
    if (url && url.startsWith("/portal_")) {
      // Replace portal_ with dashboard/ and convert underscores to hyphens in the path
      return url.replace("/portal_", "/dashboard/")
                .replace(/\.html$/, "/")
                .replace(/_/g, "-");
    }
    return url;
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
