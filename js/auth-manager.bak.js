"use strict";

// Only define AuthManager if not already defined
if (typeof window.AuthManager === 'undefined') {
    // Define in global scope
    window.AuthManager = class {
    constructor() {
        console.log('[AuthManager] CONSTRUCTOR: AuthManager instance created. Current page:', window.location.pathname);
        this.authenticated = false;
        this.user = null;
        this.rememberMe = false;
        this.loginLink = null;
        this.userMenuContainer = null;
        this.userNameDisplay = null;
        this.isInitialized = false;
        this.userDropdown = null;
        this.userMenuButton = null;
        this.mobileMenuUserInfo = null;
        this.mobileLogoutLink = null;
        
        this.SESSION_DURATION_MS = 3600000; // 1 hour
        this.sessionCheckInterval = null;
        
        // Make the instance globally accessible
        window.authManager = this;
        
        this.init();
    }
    
    init() {
        this.checkAuthentication(); // Logs internally
        this.setupDOMListeners();
        
        // Add a small delay to ensure all scripts are loaded and auth state is established
        // before checking if page is protected
        console.log('[AuthManager] init: Adding small delay before checking protected page status');
        setTimeout(() => {
            console.log('[AuthManager] init: Delayed checkProtectedPage starting now');
            this.checkProtectedPage(); // Will now log more
        }, 50); // 50ms delay should be enough for scripts to initialize but not noticeable to users
    }
    
    checkProtectedPage() {
        console.log('[AuthManager] checkProtectedPage: Starting.');
        
        // Enhanced debugging: Log all meta tags for inspection
        console.log('[AuthManager] checkProtectedPage: Current URL:', window.location.href);
        const allMetaTags = document.querySelectorAll('meta');
        console.log('[AuthManager] checkProtectedPage: Number of meta tags found:', allMetaTags.length);
        allMetaTags.forEach(tag => {
            console.log(`[AuthManager] Meta tag - name: ${tag.getAttribute('name')}, content: ${tag.getAttribute('content')}`);
        });
        
        // Check the frontmatter parameter
        console.log('[AuthManager] checkProtectedPage: Checking for requires-auth meta tag');
        const metaAuthRequired = document.querySelector('meta[name="requires-auth"]');
        console.log('[AuthManager] checkProtectedPage: Meta auth tag found?', !!metaAuthRequired);
        if (metaAuthRequired) {
            console.log('[AuthManager] checkProtectedPage: Meta auth content value:', metaAuthRequired.getAttribute('content'));
        }
        
        // Check localStorage state
        console.log('[AuthManager] checkProtectedPage: Current localStorage state:', {
            valuealignAuthenticated: localStorage.getItem('valuealign_authenticated'),
            valuealignUser: localStorage.getItem('valuealign_user'),
            valuealignExpiry: localStorage.getItem('valuealign_session_expiry')
        });
        
        // Determine if this is a protected page by meta tag OR URL pattern
        const hasMetaAuth = metaAuthRequired && metaAuthRequired.getAttribute('content') === 'true';
        const isPortalPage = window.location.pathname.includes('/portal_');
        const isLoginPage = window.location.pathname.includes('/login/');
        
        // Don't check auth on login page to avoid loops
        if (isLoginPage) {
            console.log('[AuthManager] checkProtectedPage: This is the login page. Skipping auth check.');
            return;
        }
        
        // Consider a page protected if it has the meta tag OR is a portal page
        const isProtectedPage = hasMetaAuth || isPortalPage;
        
        if (isProtectedPage) {
            console.log('[AuthManager] checkProtectedPage: Page requires authentication.');

            const sessionExpired = this.isSessionExpired(); // isSessionExpired logs internally
            console.log('[AuthManager] checkProtectedPage: Result of this.isSessionExpired() was:', sessionExpired);
            if (sessionExpired) {
                console.log('[AuthManager] checkProtectedPage: Session IS expired. Calling handleExpiredSession.');
                this.handleExpiredSession();
                return;
            }
            
            const authenticated = this.isAuthenticated(); // isAuthenticated logs internally
            console.log('[AuthManager] checkProtectedPage: Result of this.isAuthenticated() was:', authenticated);
            if (!authenticated) {
                console.log('[AuthManager] checkProtectedPage: User IS NOT authenticated. Redirecting to login.');
                localStorage.setItem('auth_redirect_after_login', window.location.pathname);
                window.location.href = '/login/';
            } else {
                console.log('[AuthManager] checkProtectedPage: User IS authenticated. Access granted.');
            }
        } else {
            console.log('[AuthManager] checkProtectedPage: Page does NOT require authentication.');
        }
    }
    
    handleExpiredSession() {
        console.log('[AuthManager] handleExpiredSession: Called.');
        const message = 'Your session has expired. Please log in again.';
        localStorage.setItem('auth_login_message', message);
        localStorage.setItem('auth_redirect_after_login', window.location.pathname);
        this.logout();
    }
    
    checkAuthentication() {
        console.log('[AuthManager] checkAuthentication: Starting');
        const isAuthenticatedStored = localStorage.getItem('valuealign_authenticated') === 'true';
        const userStored = localStorage.getItem('valuealign_user');
        const sessionExpiryStored = localStorage.getItem('valuealign_session_expiry');

        console.log('[AuthManager] checkAuthentication: localStorage values', { isAuthenticatedStored, userStored, sessionExpiryStored });
        
        if (isAuthenticatedStored) {
            const userData = JSON.parse(userStored || '{}');
            
            if (sessionExpiryStored) {
                userData.expiresAt = parseInt(sessionExpiryStored, 10);
                const currentTime = new Date().getTime();
                
                console.log('[AuthManager] checkAuthentication: Expiry check values', { 
                    parsedExpiresAt: userData.expiresAt, 
                    currentTime: currentTime, 
                    isExpired: currentTime > userData.expiresAt 
                });

                if (currentTime > userData.expiresAt) {
                    console.log('[AuthManager] checkAuthentication: Session deemed EXPIRED here. Calling handleExpiredSession.');
                    this.handleExpiredSession(); 
                    return; 
                }
            } else {
                console.log('[AuthManager] checkAuthentication: valuealign_session_expiry NOT FOUND in localStorage.');
            }
            
            this.authenticated = true;
            this.user = userData; 
            this.rememberMe = localStorage.getItem('valuealign_remember_login') === 'true';
            console.log('[AuthManager] checkAuthentication: User authenticated in memory', { user: this.user });
        } else {
            console.log('[AuthManager] checkAuthentication: Not authenticated via localStorage.');
            this.authenticated = false;
            this.user = null;
        }
    }
    
    setupDOMListeners() {
        console.log('[AuthManager] setupDOMListeners: Setting up DOM event listeners');
        
        // Always get fresh DOM elements in case we've navigated between pages
        this.loginLink = document.getElementById('login-join-link');
        this.userMenuContainer = document.getElementById('user-menu-container');
        this.userNameDisplay = document.getElementById('user-name-display');
        this.userDropdown = document.getElementById('user-dropdown');
        this.userMenuButton = document.getElementById('user-menu-button');
        this.mobileMenuUserInfo = document.getElementById('mobile-menu-user-info');
        this.mobileLoginLink = document.getElementById('mobile-login-join-link');
        this.mobileLogoutLink = document.getElementById('mobile-logout-link');
        
        // Settings panel elements
        this.desktopSettingsButton = document.getElementById('desktop-settings-button');
        this.desktopSettingsPanel = document.getElementById('desktop-settings-panel');
        
        if (this.logoutButtons) {
            this.logoutButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            });
        }
        
        // User menu dropdown functionality
        if (this.userMenuButton && this.userDropdown) {
            console.log('[AuthManager] setupDOMListeners: Setting up user menu dropdown');
            this.userMenuButton.addEventListener('click', () => {
                const isExpanded = this.userMenuButton.getAttribute('aria-expanded') === 'true';
                this.userDropdown.classList.toggle('hidden');
                this.userMenuButton.setAttribute('aria-expanded', !isExpanded);
                
                if (!isExpanded) {
                    const closeDropdown = (event) => {
                        if (!this.userMenuButton.contains(event.target) && !this.userDropdown.contains(event.target)) {
                            this.userDropdown.classList.add('hidden');
                            this.userMenuButton.setAttribute('aria-expanded', 'false');
                            document.removeEventListener('click', closeDropdown);
                        }
                    };
                    setTimeout(() => {
                        document.addEventListener('click', closeDropdown);
                    }, 10);
                }
            });
            
            this.userMenuButton.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && !this.userDropdown.classList.contains('hidden')) {
                    this.userDropdown.classList.add('hidden');
                    this.userMenuButton.setAttribute('aria-expanded', 'false');
                }
            });
        }
        
        // Settings panel functionality
        if (this.desktopSettingsButton && this.desktopSettingsPanel) {
            console.log('[AuthManager] setupDOMListeners: Setting up settings panel');
            this.desktopSettingsButton.addEventListener('click', () => {
                const isExpanded = this.desktopSettingsButton.getAttribute('aria-expanded') === 'true';
                this.desktopSettingsPanel.classList.toggle('hidden');
                this.desktopSettingsButton.setAttribute('aria-expanded', !isExpanded);
                
                if (!isExpanded) {
                    const closePanel = (event) => {
                        if (!this.desktopSettingsButton.contains(event.target) && !this.desktopSettingsPanel.contains(event.target)) {
                            this.desktopSettingsPanel.classList.add('hidden');
                            this.desktopSettingsButton.setAttribute('aria-expanded', 'false');
                            document.removeEventListener('click', closePanel);
                        }
                    };

    console.log('[AuthManager] checkAuthentication: localStorage values', { isAuthenticatedStored, userStored, sessionExpiryStored });
            // Update user name display
            if (this.userNameDisplay) {
                const displayName = this.user.name || (this.user.email ? this.user.email.split('@')[0] : 'User');
                console.log('[AuthManager] updateUI: Setting username display to:', displayName);
                this.userNameDisplay.textContent = displayName;
                this.userNameDisplay.setAttribute('title', this.user.email || displayName); 
                
                // Add member badge if applicable
                const memberBadge = document.getElementById('member-type-badge');
                if (memberBadge && this.user.memberType && this.user.memberType !== 'free') {
                    memberBadge.textContent = this.user.memberType;
                    memberBadge.classList.remove('hidden');
                } else if (memberBadge) {
                    memberBadge.classList.add('hidden');
                }
            } else {
                console.log('[AuthManager] updateUI: userNameDisplay element not found');
            }
            
            // Make sure login/join link is hidden and user menu is shown
            if (this.loginLink) {
                this.loginLink.classList.add('hidden');
            }
            if (this.mobileLoginLink) {
                this.mobileLoginLink.classList.add('hidden');
            }
            if (this.userMenuContainer) {
                this.userMenuContainer.classList.remove('hidden');
            }
        } else {
            console.log('[AuthManager] updateUI: User is not authenticated');
            document.body.classList.remove('user-authenticated');
            document.body.classList.remove('member-free', 'member-basic', 'member-premium');
            
            // Show login links
            if (this.loginLink) {
                this.loginLink.classList.remove('hidden');
            }
            if (this.mobileLoginLink) {
                this.mobileLoginLink.classList.remove('hidden');
            }
            if (this.userMenuContainer) {
                this.userMenuContainer.classList.add('hidden');
            }
        }
    }
    
    startSessionExpirationCheck() {
        this.stopSessionExpirationCheck();
        this.sessionCheckInterval = setInterval(() => {
            if (this.isSessionExpired()) {
                this.handleExpiredSession();
            }
        }, 60000);
    }
    
    stopSessionExpirationCheck() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
    }
    
    updateUI() {
        if (!document.body) return;
        
        if (this.authenticated && this.user) {
            document.body.classList.add('user-authenticated');
            
            if (this.loginLink && this.userMenuContainer) {
                this.loginLink.classList.add('hidden');
                this.userMenuContainer.classList.remove('hidden');
                if (this.userNameDisplay) {
                    this.userNameDisplay.textContent = this.user.name || this.user.email.split('@')[0];
                    this.userNameDisplay.setAttribute('title', this.user.email); 
                }
            }
            
            if (this.mobileLoginLink) {
                this.mobileLoginLink.href = '/dashboard/';
                this.mobileLoginLink.textContent = 'My Dashboard';
                this.mobileLoginLink.setAttribute('aria-label', 'Go to your dashboard');
                
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && !document.getElementById('mobile-logout-link')) {
                    const logoutLink = document.createElement('a');
                    logoutLink.id = 'mobile-logout-link';
                    logoutLink.href = '#';
                    logoutLink.className = 'logout-button block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700 font-montserrat';
                    logoutLink.textContent = 'Log Out';
                    logoutLink.setAttribute('role', 'menuitem');
                    logoutLink.setAttribute('aria-label', 'Sign out of your account');
                    logoutLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                    
                    const firstSeparator = mobileMenu.querySelector('hr');
                    if (firstSeparator && firstSeparator.parentNode) {
                        firstSeparator.parentNode.insertBefore(logoutLink, firstSeparator.nextSibling);
                    }
                    
                    if (!document.getElementById('mobile-user-info')) {
                        const userInfoDiv = document.createElement('div');
                        userInfoDiv.id = 'mobile-user-info';
                        userInfoDiv.className = 'p-3 border-b border-gray-200 dark:border-gray-700 flex items-center';
                        userInfoDiv.innerHTML = `
                            <div class="rounded-full bg-green-100 dark:bg-green-800 p-1 mr-2">
                                <svg class="h-4 w-4 text-green-600 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <span class="text-gray-700 dark:text-gray-300 font-medium">${this.user.name || this.user.email.split('@')[0]}</span>
                        `;
                        
                        if (mobileMenu.firstChild) {
                            mobileMenu.insertBefore(userInfoDiv, mobileMenu.firstChild);
                        } else {
                            mobileMenu.appendChild(userInfoDiv);
                        }
                    }
                }
            }
            
        } else { 
            document.body.classList.remove('user-authenticated');
            
            if (this.loginLink && this.userMenuContainer) {
                this.loginLink.classList.remove('hidden');
                this.userMenuContainer.classList.add('hidden');
                if (this.userDropdown && this.userMenuButton) {
                    this.userDropdown.classList.add('hidden');
                    this.userMenuButton.setAttribute('aria-expanded', 'false');
                }
            }
            
            if (this.mobileLoginLink) {
                this.mobileLoginLink.href = '/login/';
                this.mobileLoginLink.textContent = 'Login / Join';
                this.mobileLoginLink.setAttribute('aria-label', 'Login or create an account');
                
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                    const mobileUserInfo = document.getElementById('mobile-user-info');
                    if (mobileUserInfo) mobileUserInfo.remove();
                    const mobileLogoutLink = document.getElementById('mobile-logout-link');
                    if (mobileLogoutLink) mobileLogoutLink.remove();
                }
            }
        }
    }
    
    login(userData, rememberMe = false) {
        console.log('[AuthManager] login: Called with userData:', userData);
        this.authenticated = true;
        const expiresAt = new Date().getTime() + this.SESSION_DURATION_MS;
        userData.expiresAt = expiresAt; 
        this.user = userData;
        this.rememberMe = rememberMe;
        
        localStorage.setItem('valuealign_authenticated', 'true');
        localStorage.setItem('valuealign_user', JSON.stringify(userData)); 
        localStorage.setItem('valuealign_session_expiry', expiresAt.toString());
        
        if (rememberMe) {
            localStorage.setItem('valuealign_remembered_email', userData.email);
            localStorage.setItem('valuealign_remember_login', 'true');
        } else {
            localStorage.removeItem('valuealign_remembered_email');
            localStorage.removeItem('valuealign_remember_login');
        }
        
        this.updateUI();
        this.startSessionExpirationCheck(); 
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
            // If we're on the login page, redirect to the dashboard
            if (window.location.pathname.includes('/login/')) {
                window.location.href = '/portal_dashboard/';
            } else {
                // For other pages, check if there was a saved redirect
                const redirectPath = localStorage.getItem('auth_redirect_after_login');
                if (redirectPath && redirectPath !== '/login/') {
                    localStorage.removeItem('auth_redirect_after_login');
                    window.location.href = redirectPath;
                }
            }
        }, 100); // Small delay to ensure UI updates first
    }
    
    logout() {
        console.log('[AuthManager] logout: Called.');
        const rememberedEmail = localStorage.getItem('valuealign_remembered_email');
        const rememberLogin = localStorage.getItem('valuealign_remember_login'); 
        
        localStorage.removeItem('valuealign_authenticated');
        localStorage.removeItem('valuealign_user');
        localStorage.removeItem('valuealign_session_expiry');
        
        if (rememberedEmail && rememberLogin === 'true') {
            localStorage.setItem('valuealign_remembered_email', rememberedEmail);
            localStorage.setItem('valuealign_remember_login', 'true'); 
        }
        
        this.authenticated = false;
        this.user = null;
        this.updateUI(); 
        this.stopSessionExpirationCheck(); 

        if (!window.location.pathname.endsWith('/login/')) {
             setTimeout(() => {
                 window.location.href = '/login/'; 
             }, 100); 
        }
        return true; 
    }
    
    isSessionExpired() {
        console.log('[AuthManager] isSessionExpired: Starting check.');
        
        // First check localStorage directly (source of truth)
        const expiryFromStorage = localStorage.getItem('valuealign_session_expiry');
        const userFromStorage = localStorage.getItem('valuealign_user');
        
        if (!expiryFromStorage || !userFromStorage) {
            console.log('[AuthManager] isSessionExpired: Missing expiry or user in localStorage. Returning true (expired).');
            return true;
        }
        
        // If the user object doesn't have the expiresAt, get it from localStorage
        if (!this.user || typeof this.user.expiresAt === 'undefined') { 
            console.log('[AuthManager] isSessionExpired: No user or no user.expiresAt in memory. Checking localStorage.');
            const expiryTime = parseInt(expiryFromStorage, 10);
            if (isNaN(expiryTime)) {
                console.log('[AuthManager] isSessionExpired: Invalid expiry time in localStorage. Returning true (expired).');
                return true;
            }
            
            // Update our in-memory user object if needed
            if (!this.user && userFromStorage) {
                try {
                    this.user = JSON.parse(userFromStorage);
                    this.user.expiresAt = expiryTime;
                } catch (e) {
                    console.log('[AuthManager] isSessionExpired: Error parsing user from localStorage:', e);
                    return true;
                }
            } else if (this.user) {
                this.user.expiresAt = expiryTime;
            }
        }
        
        const currentTime = new Date().getTime();
        const expired = currentTime > this.user.expiresAt;
        console.log('[AuthManager] isSessionExpired: Expiry check values', { 
            userExpiresAt: this.user.expiresAt, 
            currentTime: currentTime, 
            isExpired: expired 
        });
        return expired;
    }
    
    isAuthenticated() {
        console.log('[AuthManager] isAuthenticated: Starting check.');
        
        // First check localStorage directly (source of truth)
        const localStorageAuth = localStorage.getItem('valuealign_authenticated') === 'true';
        console.log('[AuthManager] isAuthenticated: localStorage says authenticated =', localStorageAuth);
        
        // If localStorage says we're authenticated but in-memory state disagrees, update in-memory state
        if (localStorageAuth && !this.authenticated) {
            console.log('[AuthManager] isAuthenticated: Updating in-memory state to match localStorage');
            this.authenticated = true;
            
            // Also restore user data from localStorage if needed
            if (!this.user) {
                const userData = localStorage.getItem('valuealign_user');
                try {
                    if (userData) {
                        this.user = JSON.parse(userData);
                        console.log('[AuthManager] isAuthenticated: Restored user from localStorage');
                    }
                } catch (e) {
                    console.error('[AuthManager] isAuthenticated: Failed to parse user data', e);
                }
            }
        } else if (!localStorageAuth && this.authenticated) {
            // If localStorage says not authenticated but memory says yes, sync to localStorage
            console.log('[AuthManager] isAuthenticated: Syncing to localStorage (not authenticated)');
            this.authenticated = false;
            this.user = null;
        }
        
        // If not authenticated according to localStorage, we're definitely not authenticated
        if (!localStorageAuth) {
            console.log('[AuthManager] isAuthenticated: Not authenticated according to localStorage');
            return false;
        }
        
        // Otherwise check if session is expired
        const sessionExpired = this.isSessionExpired(); // isSessionExpired logs internally
        console.log('[AuthManager] isAuthenticated: Session expired:', sessionExpired);
        return !sessionExpired;
    }
    
    /**
     * Get the current user object if authenticated
     * @returns {Object|null} The user object or null if not authenticated
     */
    getCurrentUser() {
        console.log('[AuthManager] getCurrentUser: Called');
        if (!this.isAuthenticated()) {
            console.log('[AuthManager] getCurrentUser: Not authenticated, returning null');
            return null;
        }
        
        if (this.user) {
            console.log('[AuthManager] getCurrentUser: Returning user from memory');
            return this.user;
        }
        
        // Try to load from localStorage as fallback
        const userJson = localStorage.getItem('valuealign_user');
        if (!userJson) {
            console.log('[AuthManager] getCurrentUser: No user in localStorage, returning null');
            return null;
        }
        
        try {
            this.user = JSON.parse(userJson);
            console.log('[AuthManager] getCurrentUser: Restored user from localStorage');
            return this.user;
        } catch (e) {
            console.error('[AuthManager] getCurrentUser: Failed to parse user from localStorage', e);
            return null;
        }
    }
  }; // End of class definition
} // End of if statement

// Only create a new instance if it doesn't already exist
if (typeof window.authManager === 'undefined') {
    try {
        window.authManager = new window.AuthManager();
        
        // Mark as initialized and dispatch an event for other scripts to detect
        setTimeout(() => {
            window.authManager.isInitialized = true;
            console.log('[AuthManager] Initialization complete, dispatching authManagerInitialized event');
            document.dispatchEvent(new CustomEvent('authManagerInitialized'));
        }, 10);
    } catch (e) {
        console.error('[AuthManager] Error creating instance:', e);
    }
}
