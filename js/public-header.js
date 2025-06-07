/**
 * Public header controller for mobile menu and theme toggling
 */
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu functionality
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuIconOpen = document.getElementById('mobile-menu-icon-open');
  const mobileMenuIconClose = document.getElementById('mobile-menu-icon-close');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      
      // Toggle menu visibility
      mobileMenu.classList.toggle('hidden');
      
      // Update button state
      mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
      
      // Toggle icons
      if (mobileMenuIconOpen && mobileMenuIconClose) {
        mobileMenuIconOpen.classList.toggle('hidden');
        mobileMenuIconClose.classList.toggle('hidden');
      }
      
      // Announce state change to screen readers
      const statusElement = document.getElementById('public-status');
      if (statusElement) {
        statusElement.textContent = !isExpanded ? 'Mobile menu opened' : 'Mobile menu closed';
      }
    });
  }

  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
  const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

  // Set initial icon visibility based on current theme
  if (themeToggleDarkIcon && themeToggleLightIcon) {
    // Check if theme-system.js has initialized the theme
    if (document.documentElement.classList.contains('dark')) {
      themeToggleDarkIcon.classList.add('hidden');
      themeToggleLightIcon.classList.remove('hidden');
    } else {
      themeToggleDarkIcon.classList.remove('hidden');
      themeToggleLightIcon.classList.add('hidden');
    }
  }

  // Add event listener to theme toggle button if it exists
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      // If theme-system.js is available, use it to toggle theme
      if (window.ThemeSystem && typeof window.ThemeSystem.toggleTheme === 'function') {
        window.ThemeSystem.toggleTheme();
      } else {
        // Fallback manual toggle if theme-system.js is not available
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('valuealign_theme', 'light');
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('valuealign_theme', 'dark');
        }
        
        // Toggle icons
        if (themeToggleDarkIcon && themeToggleLightIcon) {
          themeToggleDarkIcon.classList.toggle('hidden');
          themeToggleLightIcon.classList.toggle('hidden');
        }
      }
      
      // Announce theme change to screen readers
      const statusElement = document.getElementById('public-status');
      if (statusElement) {
        const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        statusElement.textContent = `Theme changed to ${newTheme} mode`;
      }
    });
  }

  // Listen for themechange custom event (from theme-system.js)
  document.addEventListener('themechange', function(e) {
    if (themeToggleDarkIcon && themeToggleLightIcon) {
      const isDark = e.detail && e.detail.theme === 'dark';
      
      // Update icon visibility
      if (isDark) {
        themeToggleDarkIcon.classList.add('hidden');
        themeToggleLightIcon.classList.remove('hidden');
      } else {
        themeToggleDarkIcon.classList.remove('hidden');
        themeToggleLightIcon.classList.add('hidden');
      }
    }
  });
});
