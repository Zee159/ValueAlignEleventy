// Settings functionality
'use strict';
class SettingsPanel {
    constructor() {
        this.settingsButton = document.getElementById('desktop-settings-button');
        this.settingsPanel = document.getElementById('desktop-settings-panel');
        
        // Theme options
        this.themeButtons = document.querySelectorAll('[data-theme-value]');
        this.fontSizeButtons = document.querySelectorAll('[data-fontsize-value]');
        
        // Default values
        this.THEME_KEY = 'valuealign_theme';
        this.FONT_SIZE_KEY = 'valuealign_font_size';
        
        this.init();
    }
    
    init() {
        if (!this.settingsButton || !this.settingsPanel) return;
        
        // Toggle settings panel
        this.settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePanel();
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target) && 
                !this.settingsButton.contains(e.target)) {
                this.closePanel();
            }
        });
        
        // Theme selection
        this.themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.themeValue;
                this.setTheme(theme);
            });
        });
        
        // Font size selection
        this.fontSizeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const size = button.dataset.fontsizeValue;
                this.setFontSize(size);
            });
        });
        
        // Initialize from saved preferences
        this.loadPreferences();
    }
    
    togglePanel() {
        const isExpanded = this.settingsButton.getAttribute('aria-expanded') === 'true';
        this.settingsPanel.classList.toggle('hidden', isExpanded);
        this.settingsButton.setAttribute('aria-expanded', String(!isExpanded));
    }
    
    closePanel() {
        this.settingsPanel.classList.add('hidden');
        this.settingsButton.setAttribute('aria-expanded', 'false');
    }
    
    setTheme(theme) {
        document.documentElement.classList.remove('light', 'dark');
        
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
        } else if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
        
        localStorage.setItem(this.THEME_KEY, theme);
        this.updateActiveButton(this.themeButtons, 'theme-value', theme);
    }
    
    setFontSize(size) {
        document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
        if (size !== 'base') {
            document.documentElement.classList.add(`text-${size}`);
        }
        localStorage.setItem(this.FONT_SIZE_KEY, size);
        this.updateActiveButton(this.fontSizeButtons, 'fontsize-value', size);
    }
    
    updateActiveButton(buttons, dataAttr, value) {
        buttons.forEach(btn => {
            const isActive = btn.getAttribute(`data-${dataAttr}`) === value;
            btn.classList.toggle('bg-va-accent', isActive);
            btn.classList.toggle('text-white', isActive);
        });
    }
    
    loadPreferences() {
        // Load theme
        const savedTheme = localStorage.getItem(this.THEME_KEY) || 'system';
        this.setTheme(savedTheme);
        
        // Load font size
        const savedSize = localStorage.getItem(this.FONT_SIZE_KEY) || 'base';
        this.setFontSize(savedSize);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SettingsPanel());
} else {
    new SettingsPanel();
}
