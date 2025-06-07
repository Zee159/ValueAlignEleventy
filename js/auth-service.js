/**
 * Auth Service - Core authentication business logic
 * Provides a consistent interface for auth operations across the site
 * Serves as a single source of truth for authentication state
 */
"use strict";

class AuthService {
  constructor() {
    console.log('[AuthService] Initializing');
    this.authenticated = false;
    this.user = null;
    this.memberType = 'anonymous'; // 'anonymous', 'basic', 'premium', 'admin', etc.
    this.listeners = [];
    this.sessionCheckIntervalMs = 60000; // Check session every minute
    this.sessionCheckInterval = null;
    this.initialized = false;
    this.authState = {
      isAuthenticated: false,
      user: null,
      sessionExpiry: null,
      emailVerified: false,
      rememberMe: false
    };
    this.subscribers = [];
    this.SESSION_DURATION = 1000 * 60 * 60 * 2; // 2 hours default
    this.EXTENDED_SESSION_DURATION = 1000 * 60 * 60 * 24 * 30; // 30 days for "remember me"
    this.VERIFICATION_TOKEN_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours
    this.RESET_TOKEN_EXPIRY = 1000 * 60 * 60; // 1 hour
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  /**
   * Initialize the service
   */
  init() {
    console.log('[AuthService] Initializing service');
    
    // Load authentication state from storage
    this.loadAuthState();
    
    // Start session monitoring
    this.startSessionMonitoring();
    
    // Dispatch initial state to all subscribers
    this.notifyStateChange();
    
    this.initialized = true;
  }
  
  /**
   * Load authentication state from local storage
   */
  loadAuthState() {
    console.log('[AuthService] Loading auth state from storage');
    
    const storedState = localStorage.getItem('va_auth_state');
    
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState);
        console.log('[AuthService] Auth state loaded from localStorage');
        this.authState = parsedState;
        this.authenticated = this.authState.isAuthenticated;
        this.user = this.authState.user;
        this.memberType = this.authState.user.memberType || 'free';
      } catch (e) {
        console.error('[AuthService] Failed to parse auth state from localStorage', e);
      }
    }
    
    // Check if session has expired
    if (this.isSessionExpired()) {
      console.log('[AuthService] Session expired, logging out');
      this.logout();
      return;
    }
    
    // Set authenticated state
    this.authenticated = this.authState.isAuthenticated;
    this.user = this.authState.user;
    this.memberType = this.authState.user.memberType || 'free';
    
    console.log('[AuthService] User authenticated:', { 
      name: this.user.name, 
      email: this.user.email,
      memberType: this.memberType 
    });
    
    // Set global document attributes
    document.documentElement.dataset.userAuthenticated = this.authenticated ? 'true' : 'false';
    document.documentElement.dataset.memberType = this.memberType;
    document.body.classList.toggle('user-authenticated', this.authenticated);
  }
  
  /**
   * Check if the session has expired
   */
  isSessionExpired() {
    const sessionExpiry = this.authState.sessionExpiry;
    
    if (!sessionExpiry) {
      console.log('[AuthService] isSessionExpired: No expiry timestamp found in localStorage');
      return true; // Consider expired if no timestamp exists
    }
    
    const expiryTime = parseInt(sessionExpiry, 10);
    const currentTime = new Date().getTime();
    
    console.log('[AuthService] isSessionExpired comparison:', {
      expiryTime,
      currentTime,
      difference: expiryTime - currentTime,
      expired: currentTime > expiryTime
    });
    
    if (isNaN(expiryTime)) {
      console.log('[AuthService] isSessionExpired: Invalid expiry timestamp format');
      return true;
    }
    
    if (currentTime > expiryTime) {
      console.log('[AuthService] Session expired');
      return true;
    }
    
    return false;
  }
  
  /**
   * Start session monitoring
   */
  startSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    
    this.sessionCheckInterval = setInterval(() => {
      if (this.authenticated && this.isSessionExpired()) {
        console.log('[AuthService] Session expired during monitoring');
        this.logout();
      }
    }, this.sessionCheckIntervalMs);
    
    console.log('[AuthService] Session monitoring started');
  }
  
  /**
   * Stop session monitoring
   */
  stopSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
      console.log('[AuthService] Session monitoring stopped');
    }
  }
  
  /**
   * Log in a user
   */
  login(userData, rememberMe = false) {
    console.log('[AuthService] Logging in user:', userData.email);
    
    // Ensure minimum properties exist
    if (!userData.memberType) {
      userData.memberType = 'basic';
    }
    
    // Set session expiry - extend to 24 hours to prevent quick expiration
    const expiryDuration = rememberMe ? this.EXTENDED_SESSION_DURATION : this.SESSION_DURATION;
    const expiryTime = new Date().getTime() + expiryDuration;
    userData.expiresAt = expiryTime;
    
    // Update in-memory state
    this.authenticated = true;
    this.user = userData;
    this.memberType = userData.memberType;
    
    // Update document attributes
    document.documentElement.dataset.userAuthenticated = 'true';
    document.documentElement.dataset.memberType = this.memberType;
    document.body.classList.add('user-authenticated');
    
    // Store in localStorage - IMPORTANT: Do this BEFORE redirection
    this.authState.isAuthenticated = true;
    this.authState.user = userData;
    this.authState.sessionExpiry = expiryTime;
    this.authState.rememberMe = rememberMe;
    this._persistAuthState();
    
    // Start session monitoring
    this.startSessionMonitoring();
    
    // Notify listeners
    this.notifyStateChange();
    
    console.log('[AuthService] User logged in successfully');
    
    // Handle redirection to dashboard
    if (window.location.pathname.toLowerCase() === '/login/') {
      let redirectTo = localStorage.getItem('auth_redirect_after_login');
      
      if (!redirectTo) {
        redirectTo = '/dashboard/';
        console.log('[AuthService] No saved redirect path, defaulting to:', redirectTo);
      } else {
        console.log('[AuthService] Found saved redirect path:', redirectTo);
      }
      
      // Clear redirect after using it to prevent future loops
      localStorage.removeItem('auth_redirect_after_login');
      
      console.log('[AuthService] On login page - redirecting to:', redirectTo);
      
      // Use a slight delay to ensure all auth state is properly set before redirecting
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 200);
    }
  }
  
  /**
   * Log out current user
   */
  logout() {
    console.log('[AuthService] Logging out user');
    
    // Update in-memory state
    this.authenticated = false;
    this.user = null;
    this.memberType = 'anonymous';
    
    // Update document attributes
    document.documentElement.dataset.userAuthenticated = 'false';
    document.documentElement.removeAttribute('data-member-type');
    document.body.classList.remove('user-authenticated');
    
    // Clear from localStorage - make sure to clear ALL auth-related items
    this.authState.isAuthenticated = false;
    this.authState.user = null;
    this.authState.sessionExpiry = null;
    this.authState.rememberMe = false;
    this._persistAuthState();
    localStorage.removeItem('auth_redirect_after_login'); // Clear any pending redirects
    
    // Stop session monitoring
    this.stopSessionMonitoring();
    
    // Notify listeners
    this.notifyStateChange();
    
    console.log('[AuthService] User logged out successfully');

    // Redirect to home page only if on a protected page
    const currentPath = window.location.pathname.toLowerCase();
    const isProtectedPage = 
      currentPath.includes('/dashboard/') || 
      document.querySelector('meta[name="requires-auth"][content="true"]');
    
    if (isProtectedPage) {
      console.log('[AuthService] Currently on protected page, redirecting to home');
      window.location.href = '/';
    }
  }
  
  /**
   * Subscribe to authentication state changes
   */
  subscribe(callback) {
    console.log('[AuthService] New subscriber added');
    this.listeners.push(callback);
    
    // Immediately call with current state
    callback({
      authenticated: this.authenticated,
      user: this.user,
      memberType: this.memberType
    });
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
      console.log('[AuthService] Subscriber removed');
    };
  }
  
  /**
   * Notify all listeners of state change
   */
  notifyStateChange() {
    const state = {
      authenticated: this.authenticated,
      user: this.user,
      memberType: this.memberType
    };
    
    console.log('[AuthService] Notifying subscribers of state change:', { 
      authenticated: state.authenticated,
      memberType: state.memberType
    });
    
    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (e) {
        console.error('[AuthService] Error in subscriber callback:', e);
      }
    });
  }
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data (email, password, plan, termsAgreed, privacyAgreed, marketingConsent)
   * @returns {Promise} Promise resolving to user info or rejecting with error
   */
  register(userData) {
    return new Promise((resolve, reject) => {
      // This would be an API call in a real application
      console.log('[AuthService] Registration attempt:', userData.email);
      
      // Basic validation
      if (!userData.email || !userData.password) {
        console.error('[AuthService] Registration failed: Missing required fields');
        reject(new Error('Missing required fields'));
        return;
      }
      
      if (!userData.termsAgreed || !userData.privacyAgreed) {
        console.error('[AuthService] Registration failed: Terms and privacy policy must be accepted');
        reject(new Error('You must accept the terms and privacy policy'));
        return;
      }
      
      // Mock successful registration
      // Create user object - in a real app this would be created on the server
      const user = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: userData.email,
        name: userData.email.split('@')[0], // Simple name extraction from email
        role: 'user',
        // We would NEVER store the password client-side
        plan: userData.plan || 'free',
        emailVerified: false, // Defaults to not verified
        termsAgreed: userData.termsAgreed,
        privacyAgreed: userData.privacyAgreed,
        marketingConsent: !!userData.marketingConsent,
        registeredAt: new Date().toISOString()
      };
      
      // Generate verification token
      const verificationToken = this._generateToken();
      
      // Set verification token expiry (24 hours)
      const verificationExpiry = Date.now() + this.VERIFICATION_TOKEN_EXPIRY;
      
      // In a real app, send verification email here
      console.log(`[AuthService] Would send verification email to ${userData.email} with token: ${verificationToken}`);
      
      // Set regular session expiry
      const expiry = Date.now() + this.SESSION_DURATION;
      
      // Update auth state
      this.authState = {
        isAuthenticated: true,
        user,
        sessionExpiry: expiry,
        emailVerified: false,
        verificationToken: verificationToken,
        verificationExpiry: verificationExpiry,
        rememberMe: false
      };
      
      // Persist to localStorage
      this._persistAuthState();
      
      // Start session monitoring
      this._startSessionMonitoring();
      
      // Notify subscribers of state change
      this._notifySubscribers();
      
      console.log('[AuthService] Registration successful');
      resolve({...user, verificationToken, verificationExpiry});
    });
  }
  
  /**
   * Request password reset
   * @param {string} email - User's email address
   * @returns {Promise} Promise resolving when reset email is sent
   */
  requestPasswordReset(email) {
    return new Promise((resolve, reject) => {
      if (!email) {
        reject(new Error('Email is required'));
        return;
      }
      
      // Generate reset token
      const resetToken = this._generateToken();
      
      // Set token expiry (1 hour)
      const tokenExpiry = Date.now() + this.RESET_TOKEN_EXPIRY;
      
      // In a real app, we would send an email with the reset token
      // and store the token in the database, associated with the user
      console.log(`[AuthService] Would send password reset email to ${email} with token: ${resetToken}`);
      console.log(`[AuthService] Reset link would be: ${window.location.origin}/reset-password/?token=${resetToken}&email=${encodeURIComponent(email)}`);
      
      // For demo purposes, we'll store this token in localStorage to simulate the process
      // In a real app, this would be stored server-side
      const resetRequests = JSON.parse(localStorage.getItem('va_password_reset_requests') || '{}');
      resetRequests[email] = {
        token: resetToken,
        expiry: tokenExpiry
      };
      localStorage.setItem('va_password_reset_requests', JSON.stringify(resetRequests));
      
      resolve();
    });
  }
  
  /**
   * Reset password with token
   * @param {string} email - User's email
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Promise} Promise resolving when password is reset
   */
  resetPassword(email, token, newPassword) {
    return new Promise((resolve, reject) => {
      if (!email || !token || !newPassword) {
        reject(new Error('Email, token and new password are required'));
        return;
      }
      
      // Validate token
      // In a real app, we'd verify this with the server
      const resetRequests = JSON.parse(localStorage.getItem('va_password_reset_requests') || '{}');
      const request = resetRequests[email];
      
      if (!request || request.token !== token) {
        reject(new Error('Invalid or expired token'));
        return;
      }
      
      if (request.expiry < Date.now()) {
        reject(new Error('Token has expired'));
        return;
      }
      
      // Update password
      console.log(`[AuthService] Would reset password for ${email}`);
      
      // Remove reset request
      delete resetRequests[email];
      localStorage.setItem('va_password_reset_requests', JSON.stringify(resetRequests));
      
      // If the user is currently logged in with this email, update their session
      if (this.authState.isAuthenticated && this.authState.user && 
          this.authState.user.email === email) {
        console.log('[AuthService] User is logged in, updating session');
        
        // In a real app, we'd refresh the user's session
        // For now, just extend the session expiry
        this.authState.sessionExpiry = Date.now() + this.SESSION_DURATION;
        this._persistAuthState();
      }
      
      resolve();
    });
  }
  
  /**
   * Verify email with token
   * @param {string} email - User's email
   * @param {string} token - Verification token from email
   * @returns {Promise} Promise resolving when email is verified
   */
  verifyEmail(email, token) {
    return new Promise((resolve, reject) => {
      if (!this.authState.isAuthenticated || !this.authState.user) {
        reject(new Error('User not authenticated'));
        return;
      }
      
      if (this.authState.user.email !== email) {
        reject(new Error('Email does not match authenticated user'));
        return;
      }
      
      if (!this.authState.verificationToken || this.authState.verificationToken !== token) {
        reject(new Error('Invalid verification token'));
        return;
      }
      
      if (this.authState.verificationExpiry < Date.now()) {
        reject(new Error('Verification token has expired'));
        return;
      }
      
      // Update user and auth state
      this.authState.user.emailVerified = true;
      this.authState.emailVerified = true;
      
      // Clear verification token
      delete this.authState.verificationToken;
      delete this.authState.verificationExpiry;
      
      // Persist changes
      this._persistAuthState();
      
      // Notify subscribers
      this._notifySubscribers();
      
      console.log('[AuthService] Email verified successfully');
      resolve();
    });
  }
  
  /**
   * Resend verification email
   * @returns {Promise} Promise resolving when verification email is sent
   */
  resendVerificationEmail() {
    return new Promise((resolve, reject) => {
      if (!this.authState.isAuthenticated || !this.authState.user) {
        reject(new Error('User not authenticated'));
        return;
      }
      
      if (this.authState.emailVerified) {
        reject(new Error('Email already verified'));
        return;
      }
      
      // Generate new verification token
      const verificationToken = this._generateToken();
      
      // Set verification token expiry (24 hours)
      const verificationExpiry = Date.now() + this.VERIFICATION_TOKEN_EXPIRY;
      
      // Update auth state
      this.authState.verificationToken = verificationToken;
      this.authState.verificationExpiry = verificationExpiry;
      
      // Persist changes
      this._persistAuthState();
      
      // In a real app, send verification email here
      console.log(`[AuthService] Would resend verification email to ${this.authState.user.email} with token: ${verificationToken}`);
      console.log(`[AuthService] Verification link would be: ${window.location.origin}/verify-email/?token=${verificationToken}&email=${encodeURIComponent(this.authState.user.email)}`);
      
      resolve();
    });
  }
  
  /**
   * Generate a secure random token
   * @private
   * @returns {string} A random token string
   */
  _generateToken() {
    // In a real application, we'd use a more cryptographically secure method
    // This is just for demonstration purposes
    return Math.random().toString(36).substr(2, 15) + 
           Math.random().toString(36).substr(2, 15) + 
           Date.now().toString(36);
  }
  
  /**
   * Persist auth state to localStorage
   * @private
   */
  _persistAuthState() {
    if (this.authState.isAuthenticated && this.authState.user) {
      localStorage.setItem('va_auth_state', JSON.stringify({
        isAuthenticated: true,
        user: this.authState.user,
        sessionExpiry: this.authState.sessionExpiry,
        emailVerified: this.authState.emailVerified,
        rememberMe: this.authState.rememberMe,
        verificationToken: this.authState.verificationToken,
        verificationExpiry: this.authState.verificationExpiry
      }));
      console.log('[AuthService] Auth state persisted to localStorage');
    } else {
      localStorage.removeItem('va_auth_state');
      console.log('[AuthService] Auth state removed from localStorage');
    }
  }
  
  /**
   * Start session monitoring
   * @private
   */
  _startSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    
    this.sessionCheckInterval = setInterval(() => {
      if (this.authState.isAuthenticated && this.isSessionExpired()) {
        console.log('[AuthService] Session expired during monitoring');
        this.logout();
      }
    }, this.sessionCheckIntervalMs);
    
    console.log('[AuthService] Session monitoring started');
  }
  
  /**
   * Notify all subscribers of state change
   * @private
   */
  _notifySubscribers() {
    const state = {
      authenticated: this.authState.isAuthenticated,
      user: this.authState.user,
      memberType: this.authState.user.memberType || 'free'
    };
    
    console.log('[AuthService] Notifying subscribers of state change:', { 
      authenticated: state.authenticated,
      memberType: state.memberType
    });
    
    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (e) {
        console.error('[AuthService] Error in subscriber callback:', e);
      }
    });
  }
}

// Create and export a singleton instance
window.authService = window.authService || new AuthService();
console.log('[AuthService] Auth service initialized and available as window.authService');
