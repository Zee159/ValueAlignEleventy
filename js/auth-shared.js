'use strict';

/**
 * Auth Shared - Common authentication functionality shared between public and portal pages
 * Ensures consistent user authentication experience across the entire site
 */

// Flag to indicate auth-shared.js is loaded
window.authSharedLoaded = true;

document.addEventListener('DOMContentLoaded', function() {
  // Initialize authentication state sync across portal and public pages
  initializeAuthSync();
});

/**
 * Initialize authentication synchronization between portal and public pages
 */
function initializeAuthSync() {
  console.log('[AuthSync] Initializing authentication synchronization');
  
  // Wait for authManager to be initialized
  if (typeof window.authManager !== 'undefined') {
    ensureConsistentUI();
  } else {
    // If authManager isn't ready yet, wait a bit and try again
    setTimeout(initializeAuthSync, 100);
    return;
  }
}

/**
 * Ensure the UI is consistent with the authentication state
 */
function ensureConsistentUI() {
  console.log('[AuthSync] Ensuring consistent UI across site');
  
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('valuealign_authenticated') === 'true';
  const userData = localStorage.getItem('valuealign_user');
  
  // Get UI elements that should be updated
  const loginLink = document.getElementById('login-join-link');
  const userMenuContainer = document.getElementById('user-menu-container');
  const userNameDisplay = document.getElementById('user-name-display');
  const userMenuButton = document.getElementById('user-menu-button');
  const userDropdown = document.getElementById('user-dropdown');
  
  console.log('[AuthSync] Authentication state:', { 
    isAuthenticated, 
    hasUserData: !!userData,
    elements: {
      loginLink: !!loginLink,
      userMenuContainer: !!userMenuContainer,
      userNameDisplay: !!userNameDisplay,
      userMenuButton: !!userMenuButton,
      userDropdown: !!userDropdown
    }
  });
  
  // Apply global indication of auth state for CSS targeting
  if (isAuthenticated) {
    document.documentElement.dataset.userAuthenticated = 'true';
    document.body.classList.add('user-authenticated');
  } else {
    document.documentElement.dataset.userAuthenticated = 'false';
    document.body.classList.remove('user-authenticated');
  }
  
  // Update the UI based on authentication state
  if (isAuthenticated && userData) {
    console.log('[AuthSync] User is authenticated, updating public page UI');
    
    // Parse user data
    try {
      const user = JSON.parse(userData);
      
      // Hide login link and show user menu
      if (loginLink) {
        console.log('[AuthSync] Hiding login link');
        loginLink.classList.add('hidden');
      }
      
      if (userMenuContainer) {
        console.log('[AuthSync] Showing user menu container');
        userMenuContainer.classList.remove('hidden');
      }
      
      // Update user name display
      if (userNameDisplay) {
        const displayName = user.displayName || user.name || user.email.split('@')[0];
        userNameDisplay.textContent = displayName;
        userNameDisplay.setAttribute('title', user.email || '');
        console.log('[AuthSync] Updated username display to:', displayName);
      }
      
      // Add dashboard link to user menu if not present
      if (userDropdown) {
        if (!userDropdown.querySelector('a[href="/dashboard/"]')) {
          const dashboardLink = document.createElement('a');
          dashboardLink.href = '/dashboard/';
          dashboardLink.className = 'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';
          dashboardLink.setAttribute('role', 'menuitem');
          dashboardLink.textContent = 'Dashboard';
          
          // Insert as first item
          if (userDropdown.firstChild) {
            userDropdown.insertBefore(dashboardLink, userDropdown.firstChild);
          } else {
            userDropdown.appendChild(dashboardLink);
          }
          console.log('[AuthSync] Added dashboard link to user menu');
        }
      }
      
      // Ensure dropdown menu functionality works
      setupAuthDropdownToggle();
    } catch (e) {
      console.error('[AuthSync] Error parsing user data:', e);
    }
  } else {
    // Handle non-authenticated state explicitly
    console.log('[AuthSync] User is NOT authenticated, resetting UI');
    
    // Show login link and hide user menu
    if (loginLink) {
      loginLink.classList.remove('hidden');
    }
    
    if (userMenuContainer) {
      userMenuContainer.classList.add('hidden');
    }
    
    if (userDropdown) {
      userDropdown.classList.add('hidden');
    }
    
    if (userMenuButton) {
      userMenuButton.setAttribute('aria-expanded', 'false');
    }
  }
  
  // Setup dropdown menu toggle functionality
  setupAuthDropdownToggle();
  
  // Setup logout functionality if not already set
  setupLogoutHandlers();
}

/**
 * Sets up the user dropdown menu toggle functionality
 */
function setupAuthDropdownToggle() {
  console.log('[AuthSync] Setting up user dropdown menu toggle');
  
  const userMenuButton = document.getElementById('user-menu-button');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (!userMenuButton || !userDropdown) {
    console.log('[AuthSync] User menu elements not found, skipping dropdown setup');
    return;
  }
  
  // Skip if already initialized
  if (userMenuButton.dataset.dropdownInitialized === 'true') {
    console.log('[AuthSync] Dropdown menu already initialized');
    return;
  }
  
  console.log('[AuthSync] Initializing dropdown menu button');
  
  // Setup click handler for the dropdown toggle button
  userMenuButton.addEventListener('click', function() {
    console.log('[AuthSync] User menu button clicked');
    const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
    const expanded = !isExpanded;
    
    // Toggle visibility
    userDropdown.classList.toggle('hidden', !expanded);
    userMenuButton.setAttribute('aria-expanded', expanded.toString());
    
    // If expanding, also setup a document click handler to close it when clicking outside
    if (expanded) {
      setTimeout(() => {
        const closeDropdown = function(event) {
          if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
            userDropdown.classList.add('hidden');
            userMenuButton.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', closeDropdown);
          }
        };
        document.addEventListener('click', closeDropdown);
      }, 0);
    }
  });
  
  // Mark as initialized
  userMenuButton.dataset.dropdownInitialized = 'true';
  console.log('[AuthSync] Dropdown menu initialization complete');
}

/**
 * Setup logout handlers on all logout buttons
 */
function setupLogoutHandlers() {
  console.log('[AuthSync] Setting up logout handlers');
  
  // Find all logout buttons
  const logoutButtons = document.querySelectorAll('.logout-button');
  
  // Add event listeners to each logout button
  logoutButtons.forEach(button => {
    // Skip if already initialized
    if (button.dataset.logoutInitialized) return;
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('[AuthSync] Logout button clicked');
      
      // Clear authentication data
      localStorage.removeItem('valuealign_authenticated');
      localStorage.removeItem('valuealign_user');
      localStorage.removeItem('valuealign_session_expiry');
      
      // Update UI
      document.body.classList.remove('user-authenticated');
      document.documentElement.dataset.userAuthenticated = 'false';
      
      // Reload page to complete logout
      window.location.href = '/';
    });
    
    // Mark as initialized
    button.dataset.logoutInitialized = 'true';
    console.log('[AuthSync] Initialized logout button:', button);
  });
}
