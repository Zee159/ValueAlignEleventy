/**
 * User Menu Functionality for Portal Pages
 * Handles the initialization and interaction with the user menu across portal pages
 */
'use strict';

document.addEventListener('DOMContentLoaded', function() {
  initializeUserMenu();
  initializeUserData();
  // Settings menu was replaced with direct theme toggle button
  // initializeSettingsMenu() - removed
});

/**
 * Initialize the user menu dropdown functionality
 */
function initializeUserMenu() {
  const userMenuButton = document.getElementById('user-menu-button');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (!userMenuButton || !userDropdown) {
    console.warn('[UserMenu] User menu elements not found');
    return;
  }

  // Set initial ARIA state
  userMenuButton.setAttribute('aria-expanded', 'false');
  
  // Handle toggle click
  userMenuButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
    userMenuButton.setAttribute('aria-expanded', (!isExpanded).toString());
    userDropdown.classList.toggle('hidden');
    
    // Close settings panel if open
    const settingsPanel = document.getElementById('desktop-settings-panel');
    const settingsButton = document.getElementById('desktop-settings-button');
    if (settingsPanel && !settingsPanel.classList.contains('hidden')) {
      settingsPanel.classList.add('hidden');
      if (settingsButton) settingsButton.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Handle click outside
  document.addEventListener('click', (event) => {
    if (!userDropdown.classList.contains('hidden')) {
      if (!userDropdown.contains(event.target) && !userMenuButton.contains(event.target)) {
        userMenuButton.setAttribute('aria-expanded', 'false');
        userDropdown.classList.add('hidden');
      }
    }
  });
  
  // Handle keyboard accessibility
  userMenuButton.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      userMenuButton.setAttribute('aria-expanded', 'false');
      userDropdown.classList.add('hidden');
    }
  });
  
  // Initialize logout functionality
  const logoutButtons = document.querySelectorAll('.logout-button');
  logoutButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (window.authService && typeof window.authService.logout === 'function') {
        window.authService.logout();
      } else {
        console.warn('[UserMenu] AuthService not available for logout');
        // Fallback to redirect
        window.location.href = '/';
      }
    });
  });
  
  console.log('[UserMenu] User menu initialized successfully');
}

/**
 * Initialize user data in the menu from AuthManager
 */
function initializeUserData() {
  const userNameDisplay = document.getElementById('user-name-display');
  const memberTypeBadge = document.getElementById('member-type-badge');
  
  if (!userNameDisplay) return;
  
  // Get user data from AuthService if available
  if (window.authService && window.authService.getCurrentUser()) {
    const user = window.authService.getCurrentUser();
    
    // Update username display
    if (user.displayName || user.name || user.email) {
      userNameDisplay.textContent = user.displayName || user.name || user.email.split('@')[0];
    }
    
    // Show premium badge if applicable
    if (memberTypeBadge && user.membershipType === 'premium') {
      memberTypeBadge.classList.remove('hidden');
    }
  } else {
    console.log('[UserMenu] No authenticated user found or AuthManager not available');
  }
}

/**
 * Settings menu functionality has been removed
 * The settings dropdown was replaced with a direct theme toggle button
 * which is handled by theme-toggle.js
 */
