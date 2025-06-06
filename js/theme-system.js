/**
 * Unified Theme System for ValueAlign
 * Handles theme initialization, toggle and persistence with consistent localStorage keys
 */
"use strict";

// Use a self-executing function to create a closure and prevent global namespace pollution
(function() {
    // Skip if already initialized
    if (window.themeSystem) {
        console.log('[ThemeSystem] Already initialized, skipping duplicate initialization');
        return;
    }

    // Apply theme immediately to prevent flash of wrong theme
    function applyInitialTheme() {
        // Standardized localStorage key
        const THEME_STORAGE_KEY = 'valuealign_theme';
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
        
        // Determine if dark mode should be applied
        let isDarkMode = false;
        
        if (savedTheme === 'dark') {
            isDarkMode = true;
        } else if (savedTheme === 'light') {
            isDarkMode = false;
        } else {
            // System preference
            isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        // Apply theme immediately to prevent flash of wrong theme
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Set theme attributes for CSS selectors
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        console.log('[ThemeSystem] Initial theme applied:', savedTheme, 'isDarkMode:', isDarkMode);
    }
    
    // Apply theme immediately
    applyInitialTheme();

    // Theme System Class Definition
class ThemeSystem {
    constructor() {
        this.THEME_STORAGE_KEY = 'valuealign_theme';
        this.currentTheme = localStorage.getItem(this.THEME_STORAGE_KEY) || 'system';
        this.initialized = false;
        
        // Initialize on DOM content loaded
        this.initOnDOMReady();
    }
    
    initOnDOMReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        if (this.initialized) return;
        console.log('[ThemeSystem] Initializing with theme:', this.currentTheme);
        
        // Find theme controls
        this.findThemeControls();
        
        // Set up theme toggle buttons
        this.setupThemeToggles();
        
        // Set up theme selector radio buttons
        this.setupThemeSelectors();
        
        // Listen for system theme changes
        this.setupSystemThemeListener();
        
        // Update UI to match current theme
        this.updateUI();
        
        this.initialized = true;
        
        // Make theme system globally available
        window.themeSystem = this;
        
        console.log('[ThemeSystem] Initialization complete');
    }
    
    findThemeControls() {
        // Theme toggle buttons (simple dark/light toggle)
        this.themeToggleButtons = document.querySelectorAll('[data-theme-toggle-button], #theme-toggle-button');
        console.log('[ThemeSystem] Found', this.themeToggleButtons.length, 'toggle buttons');
        
        // Theme selector options (full light/dark/system selector)
        this.themeOptions = document.querySelectorAll('[data-theme-value]');
        console.log('[ThemeSystem] Found', this.themeOptions.length, 'theme options');
    }
    
    setupThemeToggles() {
        this.themeToggleButtons.forEach(button => {
            console.log('[ThemeSystem] Adding listener to toggle button:', button.id || 'unnamed');
            
            button.addEventListener('click', () => {
                // Toggle between light/dark only
                const newTheme = this.isDarkMode() ? 'light' : 'dark';
                this.setTheme(newTheme);
            });
        });
    }
    
    setupThemeSelectors() {
        this.themeOptions.forEach(option => {
            const themeValue = option.getAttribute('data-theme-value');
            
            option.addEventListener('click', () => {
                this.setTheme(themeValue);
                
                // Update UI to show selected theme
                this.themeOptions.forEach(opt => {
                    const optValue = opt.getAttribute('data-theme-value');
                    if (optValue === this.currentTheme) {
                        this.markAsSelected(opt);
                    } else {
                        this.markAsUnselected(opt);
                    }
                });
            });
        });
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
    
    setupSystemThemeListener() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Only update if using system theme
            if (this.currentTheme === 'system') {
                this.applyTheme();
                this.updateUI();
            }
        });
    }
    
    setTheme(theme) {
        console.log('[ThemeSystem] Setting theme to:', theme);
        this.currentTheme = theme;
        localStorage.setItem(this.THEME_STORAGE_KEY, theme);
        
        // Apply and update UI
        this.applyTheme();
        this.updateUI();
        
        // Trigger custom event for other components to react
        const event = new CustomEvent('themechange', { detail: { theme: theme, isDarkMode: this.isDarkMode() }});
        document.dispatchEvent(event);
    }
    
    applyTheme() {
        const isDarkMode = this.isDarkMode();
        console.log('[ThemeSystem] Applying theme, dark mode:', isDarkMode);
        
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Set theme attribute
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
    
    isDarkMode() {
        if (this.currentTheme === 'dark') {
            return true;
        }
        
        if (this.currentTheme === 'light') {
            return false;
        }
        
        // If theme is 'system', check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    updateUI() {
        const isDarkMode = this.isDarkMode();
        
        // Update toggle buttons
        this.themeToggleButtons.forEach(button => {
            button.setAttribute('aria-pressed', isDarkMode.toString());
            
            // Handle special case for auth canvas toggle
            if (button.id === 'theme-toggle-button') {
                const darkIcon = document.getElementById('dark-theme-icon');
                const lightIcon = document.getElementById('light-theme-icon');
                
                if (darkIcon && lightIcon) {
                    if (isDarkMode) {
                        darkIcon.classList.add('hidden');
                        lightIcon.classList.remove('hidden');
                    } else {
                        darkIcon.classList.remove('hidden');
                        lightIcon.classList.add('hidden');
                    }
                }
            }
        });
        
        // Update theme selector options
        this.themeOptions.forEach(option => {
            const optionValue = option.getAttribute('data-theme-value');
            
            if (optionValue === this.currentTheme) {
                this.markAsSelected(option);
            } else {
                this.markAsUnselected(option);
            }
        });
    }
    
    // Public API methods for other scripts to use
    getTheme() {
        return this.currentTheme;
    }
    
    getIsDarkMode() {
        return this.isDarkMode();
    }
}

    // Initialize the theme system
    window.themeSystem = new ThemeSystem();
})();
