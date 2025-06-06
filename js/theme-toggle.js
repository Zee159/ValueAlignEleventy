// Basic Theme Toggle Functionality

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.querySelector('[data-theme-toggle-button]');
    const currentTheme = localStorage.getItem('theme') || 'light';

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
        if (themeToggleButton) {
            themeToggleButton.setAttribute('aria-pressed', theme === 'dark');
        }
    }

    applyTheme(currentTheme);

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            let newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }
});
