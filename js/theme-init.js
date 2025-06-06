/**
 * Theme Initialization - Runs before DOM is fully loaded
 * This script prevents flash of wrong theme by applying theme immediately
 */
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme immediately to prevent flash of wrong theme
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Set theme-mode attribute for potential CSS selectors
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    console.log('[ThemeInit] Initial theme applied:', savedTheme);
})();
