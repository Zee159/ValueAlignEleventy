/**
 * Enhanced Theme Toggle Functionality
 * Handles both standard buttons and the auth canvas toggle
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('[ThemeToggle] Initializing theme toggle functionality');
    
    // Find all theme toggle buttons
    const themeToggleButtons = document.querySelectorAll('[data-theme-toggle-button], #theme-toggle-button');
    const currentTheme = localStorage.getItem('theme') || 'light';

    function applyTheme(theme) {
        console.log('[ThemeToggle] Applying theme:', theme);
        
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        localStorage.setItem('theme', theme);
        
        // Update all theme toggle buttons
        themeToggleButtons.forEach(button => {
            button.setAttribute('aria-pressed', theme === 'dark');
            
            // Update icon visibility if using our special auth canvas toggle
            if (button.id === 'theme-toggle-button') {
                const darkIcon = document.getElementById('dark-theme-icon');
                const lightIcon = document.getElementById('light-theme-icon');
                
                if (darkIcon && lightIcon) {
                    if (theme === 'dark') {
                        darkIcon.classList.add('hidden');
                        lightIcon.classList.remove('hidden');
                    } else {
                        darkIcon.classList.remove('hidden');
                        lightIcon.classList.add('hidden');
                    }
                }
            }
        });
    }

    // Apply the initial theme
    applyTheme(currentTheme);

    // Add click handlers to all theme toggle buttons
    themeToggleButtons.forEach(button => {
        console.log('[ThemeToggle] Adding listener to button:', button.id || 'unnamed');
        
        button.addEventListener('click', () => {
            console.log('[ThemeToggle] Button clicked');
            let newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    });
});
