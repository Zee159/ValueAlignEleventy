"use strict";

module.exports = function(eleventyConfig) {
  // Passthrough copy for static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("_portal_header_loggedout.html"); // Ensure this is copied to the output directory

  eleventyConfig.addGlobalData("currentYear", new Date().getFullYear());

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
