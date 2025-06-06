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
            this.SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours by default
            
            this.init();
        }
        
        init() {
            this.checkAuthentication();
            this.setupDOMListeners();
            
            // Add a small delay to ensure all scripts are loaded and auth state is established
            // before checking if page is protected
            console.log('[AuthManager] init: Adding small delay before checking protected page status');
            setTimeout(() => {
                console.log('[AuthManager] init: Delayed checkProtectedPage starting now');
                this.checkProtectedPage();
            }, 50);
        }

        checkProtectedPage() {
            // Logic for checking if the current page requires authentication
            const requiresAuth = document.body.classList.contains('requires-auth');
            console.log('[AuthManager] checkProtectedPage: Page requires auth?', requiresAuth);
            
            if (requiresAuth && !this.authenticated) {
                console.log('[AuthManager] checkProtectedPage: Redirecting to login');
                // Save the current path to redirect back after login
                localStorage.setItem('auth_redirect_after_login', window.location.pathname);
                window.location.href = '/login/';
            }
        }
        
        setupDOMListeners() {
            console.log('[AuthManager] setupDOMListeners: Setting up DOM event listeners');
            
            // Always refresh references to elements to handle dynamic page navigation
            this.loginLink = document.getElementById('login-link');
            this.mobileLoginLink = document.getElementById('mobile-login-link');
            this.userMenuContainer = document.getElementById('user-menu-container');
            this.userNameDisplay = document.getElementById('user-name');
            this.logoutButtons = document.querySelectorAll('.logout-button');
            
            // Set up logout button handlers
            if (this.logoutButtons && this.logoutButtons.length > 0) {
                this.logoutButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.logout();
                    });
                });
            }
            
            this.updateUI();
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
                
                // Add member type class for styling
                if (this.user.memberType) {
                    document.body.classList.add(`member-${this.user.memberType}`);
                }
                
                if (this.userNameDisplay) {
                    // Show either the display name or the first part of the email
                    const displayName = this.user.name || this.user.email.split('@')[0];
                    this.userNameDisplay.textContent = displayName;
                    
                    // Add member badge if applicable
                    const memberBadge = document.getElementById('member-type-badge');
                    if (memberBadge && this.user.memberType && this.user.memberType !== 'free') {
                        memberBadge.textContent = this.user.memberType;
                        memberBadge.classList.remove('hidden');
                    } else if (memberBadge) {
                        memberBadge.classList.add('hidden');
                    }
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
        
        checkAuthentication() {
            console.log('[AuthManager] checkAuthentication: Checking auth state');
            const localStorageAuth = localStorage.getItem('valuealign_authenticated') === 'true';
            const sessionExpiry = localStorage.getItem('valuealign_session_expiry');
            
            if (localStorageAuth && sessionExpiry) {
                console.log('[AuthManager] checkAuthentication: Found auth data in localStorage');
                const now = new Date().getTime();
                if (parseInt(sessionExpiry) > now) {
                    this.authenticated = true;
                    const userData = localStorage.getItem('valuealign_user');
                    if (userData) {
                        try {
                            this.user = JSON.parse(userData);
                            console.log('[AuthManager] checkAuthentication: Session valid, user authenticated');
                        } catch (e) {
                            console.error('[AuthManager] checkAuthentication: Failed to parse user data', e);
                            this.authenticated = false;
                        }
                    }
                } else {
                    console.log('[AuthManager] checkAuthentication: Session expired');
                    this.authenticated = false;
                    this.handleExpiredSession();
                }
            } else {
                console.log('[AuthManager] checkAuthentication: No auth data in localStorage');
                this.authenticated = false;
            }
            
            return this.authenticated;
        }
        
        login(userData, rememberMe = false) {
            console.log('[AuthManager] login: Called with userData:', userData);
            this.authenticated = true;
            const expiresAt = new Date().getTime() + this.SESSION_DURATION_MS;
            userData.expiresAt = expiresAt;
            this.user = userData;
            this.rememberMe = rememberMe;
            
            // Store authentication in localStorage
            localStorage.setItem('valuealign_authenticated', 'true');
            localStorage.setItem('valuealign_user', JSON.stringify(userData));
            localStorage.setItem('valuealign_session_expiry', expiresAt.toString());
            
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
            }, 100);
        }
        
        logout() {
            console.log('[AuthManager] logout: User logging out');
            this.authenticated = false;
            this.user = null;
            
            // Remove authentication from localStorage
            localStorage.removeItem('valuealign_authenticated');
            localStorage.removeItem('valuealign_user');
            localStorage.removeItem('valuealign_session_expiry');
            
            this.updateUI();
            this.stopSessionExpirationCheck();
            
            // Redirect to home page
            window.location.href = '/';
        }
        
        isSessionExpired() {
            if (!this.authenticated) return false;
            
            const expiryTime = localStorage.getItem('valuealign_session_expiry');
            if (!expiryTime) return true;
            
            const now = new Date().getTime();
            return parseInt(expiryTime) <= now;
        }
        
        handleExpiredSession() {
            console.log('[AuthManager] handleExpiredSession: Session expired, logging out');
            this.authenticated = false;
            this.user = null;
            
            localStorage.removeItem('valuealign_authenticated');
            localStorage.removeItem('valuealign_user');
            localStorage.removeItem('valuealign_session_expiry');
            
            this.updateUI();
            this.stopSessionExpirationCheck();
            
            // Only redirect if we're on a page that requires auth
            if (document.body.classList.contains('requires-auth')) {
                alert('Your session has expired. Please log in again.');
                localStorage.setItem('auth_redirect_after_login', window.location.pathname);
                window.location.href = '/login/';
            }
        }
        
        isAuthenticated() {
            return this.checkAuthentication();
        }
        
        getCurrentUser() {
            if (!this.isAuthenticated()) return null;
            return this.user;
        }
    };
}

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
