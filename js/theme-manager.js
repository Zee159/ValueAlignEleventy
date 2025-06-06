/**
 * Theme Manager for ValueAlign Portal
 * Manages theme preferences (light, dark, system) and applies them
 */
class ThemeManager {
    constructor() {
        this.themeOptions = document.querySelectorAll('[data-theme-value]');
        this.currentTheme = localStorage.getItem('valuealign_theme') || 'system';
        
        this.init();
    }
    
    init() {
        console.log('[ThemeManager] Initializing with theme:', this.currentTheme);
        
        // Set up event listeners for theme option buttons
        this.themeOptions.forEach(option => {
            const themeValue = option.getAttribute('data-theme-value');
            
            // Mark the current theme as selected
            if (themeValue === this.currentTheme) {
                this.markAsSelected(option);
            }
            
            option.addEventListener('click', () => {
                this.setTheme(themeValue);
                
                // Update UI to show selected theme
                this.themeOptions.forEach(opt => {
                    if (opt === option) {
                        this.markAsSelected(opt);
                    } else {
                        this.markAsUnselected(opt);
                    }
                });
            });
        });
        
        // Apply the current theme
        this.applyTheme();
    }
    
    markAsSelected(element) {
        // Find the checkmark element within the button
        const checkmark = element.querySelector('svg');
        if (checkmark) {
            checkmark.classList.remove('hidden');
        }
    }
    
    markAsUnselected(element) {
        // Find the checkmark element within the button
        const checkmark = element.querySelector('svg');
        if (checkmark) {
            checkmark.classList.add('hidden');
        }
    }
    
    setTheme(theme) {
        console.log('[ThemeManager] Setting theme to:', theme);
        this.currentTheme = theme;
        localStorage.setItem('valuealign_theme', theme);
        this.applyTheme();
    }
    
    applyTheme() {
        const isDarkMode = this.shouldUseDarkMode();
        console.log('[ThemeManager] Applying theme, dark mode:', isDarkMode);
        
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    shouldUseDarkMode() {
        if (this.currentTheme === 'dark') {
            return true;
        }
        
        if (this.currentTheme === 'light') {
            return false;
        }
        
        // If theme is 'system', check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Listen for system theme changes if using system preference
    setupSystemThemeListener() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (this.currentTheme === 'system') {
                this.applyTheme();
            }
        });
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});
