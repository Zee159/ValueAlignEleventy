/**
 * Auth UI Controller
 * Manages the authentication UI elements across all pages
 * Subscribes to auth service events and updates UI accordingly
 */
"use strict";

class AuthUIController {
  constructor() {
    console.log('[AuthUIController] Initializing');
    this.initialized = false;
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  /**
   * Initialize the controller
   */
  init() {
    // ALWAYS initialize on ALL pages - auth canvas should work everywhere
    // Use standardized dashboard URL format
    const isDashboardPage = window.location.pathname.includes('/dashboard/');
    
    console.log('[AuthUIController] Initializing:', {
      path: window.location.pathname,
      isPortalPage: false, // Removed isPortalPage variable as it was not defined
      alreadyInitialized: this.initialized
    });
    
    // Always initialize, regardless of page type
    // We've removed the conditional that was preventing initialization on public pages
    
    console.log('[AuthUIController] Initializing or reinitializing controller');
    
    // Wait for auth service to be available
    if (typeof window.authService === 'undefined') {
      console.log('[AuthUIController] Auth service not ready, waiting...');
      setTimeout(() => this.init(), 100);
      return;
    }
    
    // Find all auth UI elements
    this.findElements();
    
    // Hook into auth events
    window.authService.subscribe(authState => {
      this.updateUI(authState);
    });
    
    // Listen for theme changes to update UI elements accordingly
    document.addEventListener('themechange', (event) => {
      console.log('[AuthUIController] Theme changed, updating UI elements');
      this.updateThemeRelatedUI(event.detail);
    });
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI with current state immediately
    const authState = {
      authenticated: window.authService.isAuthenticated(),
      user: window.authService.getCurrentUser(),
      memberType: window.authService.getMemberType ? window.authService.getMemberType() : 'basic'
    };
    
    console.log('[AuthUIController] Initial auth state:', authState);
    this.updateUI(authState);
    
    this.initialized = true;
    console.log('[AuthUIController] Controller initialized');
  }
  
  /**
   * Find all auth UI elements with better error handling
   */
  findElements() {
    console.log('[AuthUIController] Finding auth UI elements in DOM');
    
    // Initialize elements map to track what we've found
    this.elements = this.elements || {};
    
    // Auth canvas container - this is critical
    const authCanvas = document.getElementById('auth-canvas');
    this.elements.authCanvas = authCanvas;
    
    if (!authCanvas) {
      console.warn('[AuthUIController] Auth canvas not found in DOM!', {
        currentURL: window.location.href,
        readyState: document.readyState,
        bodyChildren: document.body?.children?.length || 0
      });
      
      // Attempt to address missing auth canvas by waiting a bit
      this.retryElementFindingCount = (this.retryElementFindingCount || 0) + 1;
      if (this.retryElementFindingCount < 5) {
        console.log(`[AuthUIController] Will retry finding elements (attempt ${this.retryElementFindingCount})`);
        setTimeout(() => this.findElements(), 250 * this.retryElementFindingCount);
        return false;
      } else {
        console.warn('[AuthUIController] Max retries reached, continuing with available elements');
        // Create a minimal auth canvas if one doesn't exist after retries
        if (!document.getElementById('auth-canvas')) {
          this.createFallbackAuthCanvas();
        }
      }
    } else {
      console.log('[AuthUIController] Auth canvas found in DOM');
      this.retryElementFindingCount = 0; // Reset counter when found
    }
    
    // Use a helper to safely find elements
    const safeFind = (id, fallbackSelector = null) => {
      let element = document.getElementById(id);
      if (!element && fallbackSelector) {
        // Try a fallback selector if ID not found
        element = document.querySelector(fallbackSelector);
        if (element) console.log(`[AuthUIController] Found ${id} using fallback selector`);
      }
      return element;
    };
    
    // Login/User sections with fallbacks
    this.loginContainer = safeFind('login-container', '.login-section');
    this.userMenuContainer = safeFind('user-menu-container', '.user-menu');
    this.userMenuButton = safeFind('user-menu-button', '.user-button');
    this.userDropdown = safeFind('user-dropdown', '.user-dropdown');
    this.userNameDisplay = safeFind('user-name-display', '.user-name');
    
    // Theme toggle with fallbacks
    this.themeToggleButton = safeFind('theme-toggle-button', '.theme-toggle');
    this.darkThemeIcon = safeFind('dark-theme-icon', '.dark-icon');
    this.lightThemeIcon = safeFind('light-theme-icon', '.light-icon');
    
    // Member type badge with fallback
    this.memberTypeBadge = safeFind('member-type-badge', '.member-badge');
    
    // Logout buttons - these are often class-based
    this.logoutButtons = document.querySelectorAll('.logout-button');
    
    // Store all elements in the elements map
    this.elements = {
      authCanvas: authCanvas,
      loginContainer: this.loginContainer,
      userMenuContainer: this.userMenuContainer,
      userMenuButton: this.userMenuButton,
      userDropdown: this.userDropdown,
      userNameDisplay: this.userNameDisplay,
      themeToggleButton: this.themeToggleButton,
      darkThemeIcon: this.darkThemeIcon,
      lightThemeIcon: this.lightThemeIcon,
      memberTypeBadge: this.memberTypeBadge,
      logoutButtons: this.logoutButtons
    };
    
    // Log what was found/not found
    console.log('[AuthUIController] Found UI elements:', {
      loginContainer: this.loginContainer ? 'Found' : 'Missing',
      userMenuContainer: this.userMenuContainer ? 'Found' : 'Missing',
      userMenuButton: this.userMenuButton ? 'Found' : 'Missing',
      userDropdown: this.userDropdown ? 'Found' : 'Missing',
      userNameDisplay: this.userNameDisplay ? 'Found' : 'Missing',
      themeToggleButton: this.themeToggleButton ? 'Found' : 'Missing',
      memberTypeBadge: this.memberTypeBadge ? 'Found' : 'Missing',
      logoutButtons: this.logoutButtons?.length || 0
    });
    
    return true;
  }
  
  /**
   * Creates a minimal fallback auth canvas when the main one isn't found
   * This ensures some auth UI is always available
   */
  createFallbackAuthCanvas() {
    console.log('[AuthUIController] Creating fallback auth canvas');
    const fallbackCanvas = document.createElement('div');
    fallbackCanvas.id = 'auth-canvas';
    fallbackCanvas.className = 'fixed top-0 right-0 p-4 z-50 bg-transparent';
    fallbackCanvas.innerHTML = `
      <div id="login-container" class="hidden">
        <a href="/login/" class="text-sm font-medium text-va-primary hover:text-va-primaryDark">Login</a>
      </div>
      <div id="user-menu-container" class="hidden relative">
        <button id="user-menu-button" class="rounded-full bg-gray-100 dark:bg-gray-700 p-1">
          <span id="user-name-display" class="sr-only">User menu</span>
          <svg class="h-6 w-6 text-gray-600 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700">
          <div class="py-1">
            <a href="/dashboard/" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</a>
            <a href="/dashboard/account/" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Account</a>
            <a href="/dashboard/values-assessment/" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Values Assessment</a>
          </div>
          <div class="py-1">
            <a href="#" class="logout-button block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Sign out</a>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(fallbackCanvas);
    return fallbackCanvas;
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    console.log('[AuthUIController] Setting up event listeners');
    
    // User menu dropdown toggle
    if (this.userMenuButton && this.userDropdown) {
      this.userMenuButton.addEventListener('click', () => {
        const isOpen = this.userDropdown.classList.contains('hidden');
        this.toggleUserDropdown(!isOpen);
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (event) => {
        if (this.userDropdown.classList.contains('hidden')) return;
        
        if (!this.userMenuButton.contains(event.target) && !this.userDropdown.contains(event.target)) {
          this.toggleUserDropdown(false);
        }
      });
    }
    
    // Logout buttons
    if (this.logoutButtons && this.logoutButtons.length > 0) {
      this.logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('[AuthUIController] Logout button clicked');
          
          if (window.authService) {
            window.authService.logout();
          }
        });
      });
      console.log(`[AuthUIController] Added click listeners to ${this.logoutButtons.length} logout buttons`);
    } else {
      console.log('[AuthUIController] No logout buttons found on this page');
    }
    
    // Theme toggle is now entirely handled by theme-toggle.js
    // This removes potential conflict between multiple theme toggle handlers
    
    // Theme toggle functionality is now directly handled by the theme-toggle-button
  }
  
  /**
   * Toggle user dropdown visibility
   */
  toggleUserDropdown(show) {
    if (!this.userDropdown || !this.userMenuButton) return;
    
    if (show) {
      this.userDropdown.classList.remove('hidden');
      this.userMenuButton.setAttribute('aria-expanded', 'true');
    } else {
      this.userDropdown.classList.add('hidden');
      this.userMenuButton.setAttribute('aria-expanded', 'false');
    }
  }
  
  /**
   * Update theme-related UI elements
   */
  updateThemeRelatedUI(themeDetail) {
    // Get current theme setting
    const isDarkMode = themeDetail ? themeDetail.isDarkMode : 
                      (window.themeSystem ? window.themeSystem.isDarkMode() : 
                      document.documentElement.classList.contains('dark'));
    
    // Update auth canvas theme-specific elements
    const authCanvas = document.getElementById('auth-canvas');
    if (authCanvas) {
      // Adjust auth canvas styling based on theme
      if (isDarkMode) {
        authCanvas.classList.add('dark-theme');
      } else {
        authCanvas.classList.remove('dark-theme');
      }
    }
    
    // Update any theme-specific icons or elements
    const darkModeElements = document.querySelectorAll('[data-theme-mode="dark"]');
    const lightModeElements = document.querySelectorAll('[data-theme-mode="light"]');
    
    darkModeElements.forEach(element => {
      element.classList.toggle('hidden', !isDarkMode);
    });
    
    lightModeElements.forEach(element => {
      element.classList.toggle('hidden', isDarkMode);
    });
  }

  /**
   * Update the UI based on authentication state
   */
  updateUI(authState) {
    console.log('[AuthUIController] Updating UI with state:', authState);
    
    // Skip if elements aren't found yet or attempt to find them with progressive retries
    if (!this.loginContainer || !this.userMenuContainer) {
      console.log('[AuthUIController] UI elements not found or incomplete, attempting to find them now');
      const elementsFound = this.findElements();
      
      if (!elementsFound || !this.loginContainer || !this.userMenuContainer) {
        console.log('[AuthUIController] Critical UI elements still not found, scheduling another update attempt');
        this.uiUpdateRetryCount = (this.uiUpdateRetryCount || 0) + 1;
        if (this.uiUpdateRetryCount < 5) {
          console.log(`[AuthUIController] Will retry UI update in ${this.uiUpdateRetryCount * 200}ms (attempt ${this.uiUpdateRetryCount})`);
          setTimeout(() => this.updateUI(authState), this.uiUpdateRetryCount * 200);
        } else {
          console.error('[AuthUIController] Failed to find UI elements after multiple attempts');
        }
        return;
      }
    }
    
    // Reset UI update retry counter when successful
    this.uiUpdateRetryCount = 0;
    
    // Log all element references for debugging
    console.log('[AuthUIController] Current UI elements before update:', {
      loginContainer: this.loginContainer ? 'Found' : 'Missing',
      userMenuContainer: this.userMenuContainer ? 'Found' : 'Missing',
      userNameDisplay: this.userNameDisplay ? 'Found' : 'Missing',
      memberTypeBadge: this.memberTypeBadge ? 'Found' : 'Missing',
      userDropdown: this.userDropdown ? 'Found' : 'Missing',
      authenticated: authState.authenticated
    });
    
    if (authState.authenticated) {
      // User is logged in
      if (this.loginContainer) this.loginContainer.classList.add('hidden');
      if (this.userMenuContainer) this.userMenuContainer.classList.remove('hidden');
      
      if (this.userNameDisplay && authState.user) {
        const displayName = authState.user.name || authState.user.email.split('@')[0];
        this.userNameDisplay.textContent = displayName;
      }
      
      // Update member type badge
      if (this.memberTypeBadge) {
        const memberTypeDisplay = state.memberType.charAt(0).toUpperCase() + state.memberType.slice(1);
        this.memberTypeBadge.textContent = `${memberTypeDisplay} Member`;
        this.memberTypeBadge.classList.remove('hidden');
        
        // Custom styling based on member type
        this.memberTypeBadge.className = 'px-2 py-1 text-xs font-medium rounded-md text-white';
        
        if (state.memberType === 'premium') {
          this.memberTypeBadge.classList.add('bg-purple-600');
        } else if (state.memberType === 'admin') {
          this.memberTypeBadge.classList.add('bg-red-600');
        } else if (state.memberType === 'basic') {
          this.memberTypeBadge.classList.add('bg-va-accent');
          // Use 'Basic' label explicitly
          this.memberTypeBadge.textContent = 'Basic Member';
        } else {
          this.memberTypeBadge.classList.add('bg-va-accent');
        }
      }
    } else {
      // User is logged out
      if (this.loginContainer) this.loginContainer.classList.remove('hidden');
      if (this.userMenuContainer) this.userMenuContainer.classList.add('hidden');
      if (this.memberTypeBadge) this.memberTypeBadge.classList.add('hidden');
      
      // Hide dropdowns
      this.toggleUserDropdown(false);
    }
  }
}

// Create and initialize the controller
document.addEventListener('DOMContentLoaded', () => {
  console.log('[AuthUIController] DOM loaded, creating controller');
  window.authUIController = new AuthUIController();
});
