/**
 * User Menu Functionality for Portal Pages
 * Handles the initialization and interaction with the user menu across portal pages
 */
'use strict';

document.addEventListener('DOMContentLoaded', function() {
  initializeUserMenu();
  initializeUserData();
  initializeSettingsMenu();
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
      if (window.authManager && typeof window.authManager.logout === 'function') {
        window.authManager.logout();
      } else {
        console.warn('[UserMenu] AuthManager not available for logout');
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
  
  // Get user data from AuthManager if available
  if (window.authManager && window.authManager.user) {
    const user = window.authManager.user;
    
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
 * Initialize settings menu functionality
 */
function initializeSettingsMenu() {
  const settingsButton = document.getElementById('desktop-settings-button');
  const settingsPanel = document.getElementById('desktop-settings-panel');
  
  if (!settingsButton || !settingsPanel) {
    console.warn('[Settings] Settings menu elements not found');
    return;
  }

  // Set initial ARIA state
  settingsButton.setAttribute('aria-expanded', 'false');
  
  // Handle toggle click
  settingsButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const isExpanded = settingsButton.getAttribute('aria-expanded') === 'true';
    settingsButton.setAttribute('aria-expanded', (!isExpanded).toString());
    settingsPanel.classList.toggle('hidden');
    
    // Close user dropdown if open
    const userDropdown = document.getElementById('user-dropdown');
    const userMenuButton = document.getElementById('user-menu-button');
    if (userDropdown && !userDropdown.classList.contains('hidden')) {
      userDropdown.classList.add('hidden');
      if (userMenuButton) userMenuButton.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Handle click outside
  document.addEventListener('click', (event) => {
    if (!settingsPanel.classList.contains('hidden')) {
      if (!settingsPanel.contains(event.target) && !settingsButton.contains(event.target)) {
        settingsButton.setAttribute('aria-expanded', 'false');
        settingsPanel.classList.add('hidden');
      }
    }
  });
  
  // Handle keyboard accessibility
  settingsButton.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      settingsButton.setAttribute('aria-expanded', 'false');
      settingsPanel.classList.add('hidden');
    }
  });
  
  console.log('[Settings] Settings menu initialized successfully');
}
