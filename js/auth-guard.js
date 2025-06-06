/**
 * Auth Guard Script
 * Provides centralized authentication protection for portal pages
 * Eliminates race conditions and ensures consistent auth checks
 */
"use strict";

class AuthGuard {
  constructor() {
    this.initialized = false;
    this.authCheckComplete = false;
    this.isProtectedPage = document.querySelector('meta[name="requires-auth"]') !== null;
    this.loginPath = '/login/';
    
    // Check if we need to initialize immediately
    if (this.isProtectedPage) {
      console.log('[AuthGuard] Protected page detected, initializing guard');
      this.init();
    } else {
      console.log('[AuthGuard] Public page, no guard needed');
    }
  }
  
  /**
   * Initialize the auth guard
   */
  init() {
    console.log('[AuthGuard] Initializing');
    
    // Wait for auth service to be ready
    if (typeof window.authService === 'undefined') {
      console.log('[AuthGuard] Auth service not ready, waiting...');
      setTimeout(() => this.init(), 50);
      return;
    }
    
    // Check authentication immediately
    const isAuthenticated = window.authService.isAuthenticated();
    console.log('[AuthGuard] Authentication check:', isAuthenticated);
    
    // Handle unauthenticated access to protected pages
    if (this.isProtectedPage && !isAuthenticated) {
      this.redirectToLogin();
    }
    
    // Subscribe to auth state changes
    window.authService.subscribe(state => this.handleAuthChange(state));
    
    this.initialized = true;
    this.authCheckComplete = true;
    console.log('[AuthGuard] Guard initialized');
  }
  
  /**
   * Handle authentication state changes
   */
  handleAuthChange(state) {
    console.log('[AuthGuard] Auth state changed:', state);
    
    // If this is a protected page and user is not authenticated, redirect to login
    if (this.isProtectedPage && !state.authenticated) {
      console.log('[AuthGuard] User not authenticated on protected page, redirecting to login');
      this.redirectToLogin();
    }
  }
  
  /**
   * Redirect to login page with return URL
   */
  redirectToLogin() {
    // Only redirect if we haven't already initiated a redirect
    if (this.redirecting) return;
    
    this.redirecting = true;
    console.log('[AuthGuard] Redirecting to login page');
    
    // Add current URL as return path (for after login)
    const returnPath = encodeURIComponent(window.location.pathname);
    window.location.href = `${this.loginPath}?return=${returnPath}`;
  }
}

// Initialize the auth guard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Global instance of the auth guard
  window.authGuard = new AuthGuard();
});
