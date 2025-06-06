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
  }
  
  /**
   * Load authentication state from local storage
   */
  loadAuthState() {
    console.log('[AuthService] Loading auth state from storage');
    
    const isAuthenticated = localStorage.getItem('valuealign_authenticated') === 'true';
    const userJson = localStorage.getItem('valuealign_user');
    
    if (isAuthenticated && userJson) {
      try {
        const userData = JSON.parse(userJson);
        
        // Check if session has expired
        if (this.isSessionExpired()) {
          console.log('[AuthService] Session expired, logging out');
          this.logout();
          return;
        }
        
        // Set authenticated state
        this.authenticated = true;
        this.user = userData;
        this.memberType = userData.memberType || 'free';
        
        console.log('[AuthService] User authenticated:', { 
          name: this.user.name, 
          email: this.user.email,
          memberType: this.memberType 
        });
        
        // Set global document attributes
        document.documentElement.dataset.userAuthenticated = 'true';
        document.documentElement.dataset.memberType = this.memberType;
        document.body.classList.add('user-authenticated');
      } catch (e) {
        console.error('[AuthService] Error parsing user data:', e);
        this.logout();
      }
    } else {
      // Not authenticated
      this.authenticated = false;
      this.user = null;
      this.memberType = 'anonymous';
      
      // Update global document attributes
      document.documentElement.dataset.userAuthenticated = 'false';
      document.documentElement.removeAttribute('data-member-type');
      document.body.classList.remove('user-authenticated');
      
      console.log('[AuthService] User not authenticated');
    }
  }
  
  /**
   * Check if the session has expired
   */
  isSessionExpired() {
    const sessionExpiry = localStorage.getItem('valuealign_session_expiry');
    console.log('[AuthService] isSessionExpired check - Session expiry from localStorage:', sessionExpiry);
    
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
    const expiryDuration = 86400000; // 24 hours
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
    localStorage.setItem('valuealign_authenticated', 'true');
    localStorage.setItem('valuealign_user', JSON.stringify(userData));
    localStorage.setItem('valuealign_session_expiry', expiryTime.toString());
    
    if (rememberMe) {
      localStorage.setItem('valuealign_remembered_email', userData.email);
    } else {
      localStorage.removeItem('valuealign_remembered_email');
    }
    
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
    localStorage.removeItem('valuealign_authenticated');
    localStorage.removeItem('valuealign_user');
    localStorage.removeItem('valuealign_session_expiry');
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
      currentPath.includes('/portal_') || 
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
 * Get the current user's member type (property)
 */
get memberType() {
  return this._memberType || 'anonymous';
}

/**
 * Get the current user's member type (method)
 */
getMemberType() {
  return this.memberType;
}

/**
 * Redirect to login page, saving current location for after login
 */
redirectToLogin() {
  console.log('[AuthService] Redirecting to login from:', window.location.pathname);
  
  // Save current path for redirect after login
  localStorage.setItem('auth_redirect_after_login', window.location.pathname);
  
  // Redirect to login page
  window.location.href = '/login/';
}

set memberType(value) {
  this._memberType = value;
}

/**
 * Get current user information
 * @returns {Object|null} User object or null if not authenticated
 */
getCurrentUser() {
  return this.authenticated ? this.user : null;
}

/**
 * Get complete auth state
 * @returns {Object} Object containing authenticated status, user info and member type
 */
getAuthState() {
  return {
    authenticated: this.authenticated,
    user: this.user,
    memberType: this.memberType
  };
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
isAuthenticated() {
  return this.authenticated;
}

/**
 * Redirect to login page, saving current path for redirect back
 */
redirectToLogin() {
  console.log('[AuthService] Redirecting to login page');
  const currentPath = window.location.pathname;
  if (currentPath !== '/login/') {
    localStorage.setItem('auth_redirect_after_login', currentPath);
  }
  window.location.href = '/login/';
}

}

// Create and export a singleton instance
window.authService = window.authService || new AuthService();
console.log('[AuthService] Auth service initialized and available as window.authService');
