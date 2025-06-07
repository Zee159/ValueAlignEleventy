/**
 * Accessibility Controller
 * Provides session-based accessibility enhancements without persistent storage
 * Part of ValueAlign's commitment to inclusive design
 */

(function() {
  'use strict';

  class AccessibilityController {
    constructor() {
      this.initialized = false;
      this.textSizeLevel = 0; // 0 = normal, 1 = larger, 2 = largest
      this.highContrast = false;
      this.reducedMotion = false;
      this.enhancedFocus = false;
      
      // Check for system preferences
      this.systemReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.systemHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
    }

    init() {
      if (this.initialized) return;
      
      console.log('[AccessibilityController] Initializing...');
      
      // Apply system preferences
      if (this.systemReducedMotion) {
        this.reducedMotion = true;
        this._applyReducedMotion();
      }
      
      if (this.systemHighContrast) {
        this.highContrast = true;
        this._applyHighContrast();
      }
      
      // Set up accessibility toolbar
      this._createAccessibilityToolbar();
      
      // Set up URL parameter support
      this._checkUrlParameters();
      
      // Initialize page-specific handlers
      this._initPageHandlers();
      
      // Listen for system preference changes
      this._initMediaQueryListeners();
      
      this.initialized = true;
      console.log('[AccessibilityController] Initialized');
    }
    
    /**
     * Create floating accessibility toolbar
     * @private
     */
    _createAccessibilityToolbar() {
      // Only create on non-accessibility pages to avoid duplication
      if (window.location.pathname.includes('/accessibility/')) {
        return;
      }
      
      const toolbar = document.createElement('div');
      toolbar.className = 'a11y-toolbar';
      toolbar.setAttribute('role', 'region');
      toolbar.setAttribute('aria-label', 'Accessibility controls');
      
      // Toggle button
      const toggle = document.createElement('button');
      toggle.className = 'a11y-toolbar-toggle';
      toggle.setAttribute('aria-label', 'Toggle accessibility toolbar');
      toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 6l-8 6 8 6V6z"/></svg>';
      
      // Toolbar buttons
      const textSizeBtn = document.createElement('button');
      textSizeBtn.setAttribute('aria-label', 'Increase text size');
      textSizeBtn.innerHTML = 'A+';
      
      const contrastBtn = document.createElement('button');
      contrastBtn.setAttribute('aria-label', 'Toggle high contrast');
      contrastBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z"/></svg>';
      
      const motionBtn = document.createElement('button');
      motionBtn.setAttribute('aria-label', 'Toggle reduced motion');
      motionBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
      
      // Add buttons to toolbar
      toolbar.appendChild(toggle);
      toolbar.appendChild(textSizeBtn);
      toolbar.appendChild(contrastBtn);
      toolbar.appendChild(motionBtn);
      
      // Add event listeners
      toggle.addEventListener('click', () => {
        toolbar.classList.toggle('collapsed');
      });
      
      textSizeBtn.addEventListener('click', () => {
        this._cycleTextSize();
        this._updateToolbarButtonStates();
      });
      
      contrastBtn.addEventListener('click', () => {
        this.highContrast = !this.highContrast;
        this._applyHighContrast();
        this._updateToolbarButtonStates();
        this._announceToScreenReader(this.highContrast ? 'High contrast mode enabled' : 'High contrast mode disabled');
        this._saveSettingsToUrl();
      });
      
      motionBtn.addEventListener('click', () => {
        this.reducedMotion = !this.reducedMotion;
        this._applyReducedMotion();
        this._updateToolbarButtonStates();
        this._announceToScreenReader(`Reduced motion ${this.reducedMotion ? 'enabled' : 'disabled'}`);
        this._saveSettingsToUrl();
      });
      
      // Start collapsed on mobile
      if (window.innerWidth < 768) {
        toolbar.classList.add('collapsed');
      }
      
      document.body.appendChild(toolbar);
    }
    
    /**
     * Update toolbar button states to reflect current settings
     * @private
     */
    _updateToolbarButtonStates() {
      const toolbar = document.querySelector('.a11y-toolbar');
      if (!toolbar) return;
      
      const [textSizeBtn, contrastBtn, motionBtn] = Array.from(toolbar.querySelectorAll('button')).slice(1);
      
      // Update text size button
      textSizeBtn.classList.toggle('active', this.textSizeLevel > 0);
      
      // Update contrast button
      contrastBtn.classList.toggle('active', this.highContrast);
      
      // Update motion button
      motionBtn.classList.toggle('active', this.reducedMotion);
    }
    
    /**
     * Cycle through text sizes
     * @private
     */
    _cycleTextSize() {
      this.textSizeLevel = (this.textSizeLevel + 1) % 3;
      
      document.documentElement.classList.remove('a11y-text-larger', 'a11y-text-largest');
      
      if (this.textSizeLevel === 1) {
        document.documentElement.classList.add('a11y-text-larger');
      } else if (this.textSizeLevel === 2) {
        document.documentElement.classList.add('a11y-text-largest');
      }
    }
    
    /**
     * Apply high contrast mode
     * @private
     */
    _applyHighContrast() {
      document.documentElement.classList.toggle('a11y-high-contrast', this.highContrast);
      
      // Update UI components that reflect this state
      const highContrastToggle = document.getElementById('high-contrast-toggle');
      if (highContrastToggle) {
        highContrastToggle.setAttribute('aria-pressed', String(this.highContrast));
      }
    }
    
    /**
     * Apply reduced motion settings
     * @private
     */
    _applyReducedMotion() {
      document.documentElement.classList.toggle('a11y-reduced-motion', this.reducedMotion);
      
      // Update UI components that reflect this state
      const reduceMotionToggle = document.getElementById('reduce-motion-toggle');
      if (reduceMotionToggle) {
        reduceMotionToggle.setAttribute('aria-pressed', String(this.reducedMotion));
      }
    }
    
    /**
     * Apply enhanced focus indicators
     * @private
     */
    _applyEnhancedFocus() {
      document.documentElement.classList.toggle('a11y-enhanced-focus', this.enhancedFocus);
      
      // Update UI components that reflect this state
      const enhanceFocusToggle = document.getElementById('enhance-focus-toggle');
      if (enhanceFocusToggle) {
        enhanceFocusToggle.setAttribute('aria-pressed', String(this.enhancedFocus));
      }
    }
    
    /**
     * Initialize page-specific handlers for the accessibility settings page
     * @private
     */
    _initPageHandlers() {
      // Only handle if we're on the accessibility settings page
      if (!window.location.pathname.includes('/accessibility/')) {
        return;
      }
      
      // Get button elements
      const textSizeDecreaseBtn = document.getElementById('text-size-decrease');
      const textSizeResetBtn = document.getElementById('text-size-reset');
      const textSizeIncreaseBtn = document.getElementById('text-size-increase');
      const highContrastToggle = document.getElementById('high-contrast-toggle');
      const reduceMotionToggle = document.getElementById('reduce-motion-toggle');
      const enhanceFocusToggle = document.getElementById('enhance-focus-toggle');
      
      // Set initial states
      if (highContrastToggle) {
        highContrastToggle.setAttribute('aria-pressed', String(this.highContrast));
      }
      
      if (reduceMotionToggle) {
        reduceMotionToggle.setAttribute('aria-pressed', String(this.reducedMotion));
      }
      
      if (enhanceFocusToggle) {
        enhanceFocusToggle.setAttribute('aria-pressed', String(this.enhancedFocus));
      }
      
      // Add event listeners
      if (textSizeDecreaseBtn) {
        textSizeDecreaseBtn.addEventListener('click', () => {
          if (this.textSizeLevel > 0) {
            this.textSizeLevel--;
            document.documentElement.classList.remove('a11y-text-larger', 'a11y-text-largest');
            if (this.textSizeLevel === 1) {
              document.documentElement.classList.add('a11y-text-larger');
              this._announceToScreenReader('Text size decreased to large');
            } else {
              this._announceToScreenReader('Text size decreased to normal');
            }
            this._saveSettingsToUrl();
          }
        });
      }
      
      if (textSizeResetBtn) {
        textSizeResetBtn.addEventListener('click', () => {
          this.textSizeLevel = 0;
          document.documentElement.classList.remove('a11y-text-larger', 'a11y-text-largest');
          this._announceToScreenReader('Text size reset to normal');
          this._saveSettingsToUrl();
        });
      }
      
      if (textSizeIncreaseBtn) {
        textSizeIncreaseBtn.addEventListener('click', () => {
          if (this.textSizeLevel < 2) {
            this.textSizeLevel++;
            document.documentElement.classList.remove('a11y-text-larger', 'a11y-text-largest');
            if (this.textSizeLevel === 1) {
              document.documentElement.classList.add('a11y-text-larger');
              this._announceToScreenReader('Text size increased to large');
            } else {
              document.documentElement.classList.add('a11y-text-largest');
              this._announceToScreenReader('Text size increased to largest');
            }
            this._saveSettingsToUrl();
          }
        });
      }
      
      if (highContrastToggle) {
        highContrastToggle.addEventListener('click', () => {
          this.highContrast = !this.highContrast;
          this._applyHighContrast();
          this._announceToScreenReader(this.highContrast ? 'High contrast mode enabled' : 'High contrast mode disabled');
          this._saveSettingsToUrl();
        });
      }
      
      if (reduceMotionToggle) {
        reduceMotionToggle.addEventListener('click', () => {
          this.reducedMotion = !this.reducedMotion;
          this._applyReducedMotion();
          this._announceToScreenReader(this.reducedMotion ? 'Reduced motion enabled' : 'Reduced motion disabled');
          this._saveSettingsToUrl();
        });
      }
      
      if (enhanceFocusToggle) {
        enhanceFocusToggle.addEventListener('click', () => {
          this.enhancedFocus = !this.enhancedFocus;
          this._applyEnhancedFocus();
          this._announceToScreenReader(this.enhancedFocus ? 'Enhanced focus indicators enabled' : 'Enhanced focus indicators disabled');
          this._saveSettingsToUrl();
        });
      }
    }
    
    /**
     * Check URL parameters for accessibility options
     * @private
     */
    _checkUrlParameters() {
      const params = new URLSearchParams(window.location.search);
      
      // Check for text size parameter
      const textSize = params.get('textSize');
      if (textSize !== null) {
        const sizeLevel = parseInt(textSize, 10);
        if (!isNaN(sizeLevel) && sizeLevel >= 0 && sizeLevel <= 2) {
          this.textSizeLevel = sizeLevel;
          this._applyTextSize();
          console.log(`[AccessibilityController] Applied text size level ${sizeLevel} from URL parameter`);
        }
      }
      
      // Check for high contrast parameter
      const highContrast = params.get('highContrast');
      if (highContrast !== null) {
        this.highContrast = highContrast === 'true';
        this._applyHighContrast();
        console.log(`[AccessibilityController] Set high contrast to ${this.highContrast} from URL parameter`);
      }
      
      // Check for reduced motion parameter
      const reducedMotion = params.get('reducedMotion');
      if (reducedMotion !== null) {
        this.reducedMotion = reducedMotion === 'true';
        this._applyReducedMotion();
        console.log(`[AccessibilityController] Set reduced motion to ${this.reducedMotion} from URL parameter`);
      }
      
      // Check for enhanced focus parameter
      const enhancedFocus = params.get('enhancedFocus');
      if (enhancedFocus !== null) {
        this.enhancedFocus = enhancedFocus === 'true';
        this._applyEnhancedFocus();
        console.log(`[AccessibilityController] Set enhanced focus to ${this.enhancedFocus} from URL parameter`);
      }
      
      // Update toolbar button states if they exist
      if (this.initialized) {
        this._updateToolbarButtonStates();
      }
      
      // Legacy parameters - can be removed after launch
      // These were replaced with more standardized parameter checks above
      
      // Check for text size parameter
      if (params.has('textSize')) {
        const size = params.get('textSize');
        if (size === 'large') {
          this.textSizeLevel = 1;
          document.documentElement.classList.add('a11y-text-larger');
        } else if (size === 'largest') {
          this.textSizeLevel = 2;
          document.documentElement.classList.add('a11y-text-largest');
        }
      }
    }
    
    /**
     * Save current settings to URL parameters
     * @private
     */
    _saveSettingsToUrl() {
      // Only save settings if we're not on the accessibility page
      // to avoid redundant parameters when using controls on that page
      if (window.location.pathname.includes('/accessibility/')) {
        return;
      }
      
      try {
        const params = new URLSearchParams(window.location.search);
        
        // Only set parameters for non-default values to keep URLs clean
        if (this.textSizeLevel > 0) {
          params.set('textSize', this.textSizeLevel);
        } else {
          params.delete('textSize');
        }
        
        if (this.highContrast) {
          params.set('highContrast', 'true');
        } else {
          params.delete('highContrast');
        }
        
        if (this.reducedMotion && !this.systemReducedMotion) {
          params.set('reducedMotion', 'true');
        } else {
          params.delete('reducedMotion');
        }
        
        if (this.enhancedFocus) {
          params.set('enhancedFocus', 'true');
        } else {
          params.delete('enhancedFocus');
        }
        
        // Update URL without page reload - only if we have parameters to add
        const paramString = params.toString();
        let newUrl = window.location.pathname;
        if (paramString) {
          newUrl += '?' + paramString;
        }
        newUrl += window.location.hash;
        
        // Only update if different to avoid unnecessary history entries
        if (window.location.href !== newUrl) {
          window.history.replaceState({}, '', newUrl);
          console.log('[AccessibilityController] Updated URL with accessibility parameters');
        }
      } catch (error) {
        console.error('[AccessibilityController] Error saving settings to URL:', error);
      }
    }

    /**
     * Initialize media query listeners for system preferences
     * @private
     */
    _initMediaQueryListeners() {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const highContrastQuery = window.matchMedia('(prefers-contrast: more)');
      
      // Check if addEventListener is supported
      if (reducedMotionQuery.addEventListener) {
        reducedMotionQuery.addEventListener('change', event => {
          this.systemReducedMotion = event.matches;
          if (!this.reducedMotion) { // Only apply if user hasn't explicitly set
            this.reducedMotion = event.matches;
            this._applyReducedMotion();
            this._updateToolbarButtonStates();
          }
        });
        
        highContrastQuery.addEventListener('change', event => {
          this.systemHighContrast = event.matches;
          if (!this.highContrast) { // Only apply if user hasn't explicitly set
            this.highContrast = event.matches;
            this._applyHighContrast();
            this._updateToolbarButtonStates();
          }
        });
      }
    }
    
    /**
     * Announce a message to screen readers
     * @param {string} message - Message to announce
     * @private
     */
    _announceToScreenReader(message) {
      const statusElement = document.getElementById('a11y-status') || 
                           document.getElementById('public-status');
      
      if (statusElement) {
        statusElement.textContent = message;
        console.log('[AccessibilityController] Announced:', message);
      }
    }
  }
  
  // Create singleton and initialize
  const accessibilityController = new AccessibilityController();
  
  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    accessibilityController.init();
  });
  
  // Export to global scope
  window.accessibilityController = accessibilityController;
})();
