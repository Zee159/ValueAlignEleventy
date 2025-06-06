// Basic Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button'); // Assuming this ID for the button
    const mobileMenu = document.getElementById('mobile-menu'); // Assuming this ID for the menu container

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden'); // Or your preferred class to show/hide

            // Optional: Toggle icons if you have them (e.g., hamburger and close icons)
            const menuOpenIcon = document.getElementById('menu-open-icon');
            const menuCloseIcon = document.getElementById('menu-close-icon');
            if (menuOpenIcon && menuCloseIcon) {
                menuOpenIcon.classList.toggle('hidden');
                menuCloseIcon.classList.toggle('hidden');
            }
        });

        // Optional: Close menu when clicking outside of it
        document.addEventListener('click', (event) => {
            if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target) && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                const menuOpenIcon = document.getElementById('menu-open-icon');
                const menuCloseIcon = document.getElementById('menu-close-icon');
                if (menuOpenIcon && menuCloseIcon) {
                    menuOpenIcon.classList.remove('hidden');
                    menuCloseIcon.classList.add('hidden');
                }
            }
        });
    }
});
