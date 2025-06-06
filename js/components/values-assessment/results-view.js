/**
 * Results View Component
 * Top-level component that integrates with ValuesAssessment class
 * 
 * Following ValueAlign development rules for accessibility, theme integration,
 * and progressive enhancement
 */

import { ResultsMainComponent } from './results-main.js';
import { ResultsBaseComponent } from './results-base.js';
import { ResultsContentComponent } from './results-content.js';

class ResultsViewComponent extends EventTarget {
  /**
   * Create a results view component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    super();
    
    // Core dependencies
    this.container = options.container;
    this.service = options.service;
    this.ui = options.ui;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.themeService = options.themeService || window.themeSystem;
    this.authService = options.authService || window.authService;
    
    // Configuration
    this.debug = options.debug || false;
    
    // Navigation callbacks
    this.onContinueToReflection = options.onContinueToReflection || (() => {});
    this.onRestartAssessment = options.onRestartAssessment || (() => {});
    
    // State
    this.isInitialized = false;
    this.isInitializing = false;
    this.hasError = false;
    this.errorMessage = '';
    this.mainComponent = null;
    
    // Store reference to updated main component
    this._updateMainComponent();
    
    // Log initialization
    this._debug('Results view component created');
  }
  
  /**
   * Initialize the component
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return true;
      }
      
      if (this.isInitializing) {
        return false;
      }
      
      this._debug('Initializing results view component');
      this.isInitializing = true;
      
      // Make sure we have a container
      if (!this.container) {
        throw new Error('Container element is required');
      }
      
      // Update main component
      this._updateMainComponent();
      
      // Initialize the main component if it exists
      if (this.mainComponent && typeof this.mainComponent.initialize === 'function') {
        await this.mainComponent.initialize();
      }
      
      // Mark as initialized
      this.isInitialized = true;
      this.isInitializing = false;
      this._debug('Results view component initialized');
      
      return true;
    } catch (error) {
      console.error('[ResultsViewComponent] Initialization error:', error);
      this.isInitializing = false;
      this.hasError = true;
      this.errorMessage = error.message || 'Failed to initialize results view';
      return false;
    }
  }
  
  /**
   * Render the component
   * @returns {HTMLElement} The rendered component
   */
  render() {
    try {
      if (!this.container) {
        throw new Error('Container element is required');
      }
      
      // Clear the container
      this.container.innerHTML = '';
      
      // Initialize if not already done
      if (!this.isInitialized && !this.isInitializing) {
        this.initialize().then(() => {
          if (this.isInitialized) {
            this.render();
          }
        });
        
        // Show loading state
        this._renderLoadingState();
        return this.container;
      }
      
      // Show loading state if still initializing
      if (this.isInitializing) {
        this._renderLoadingState();
        return this.container;
      }
      
      // Show error state if there's an error
      if (this.hasError) {
        this._renderErrorState();
        return this.container;
      }
      
      // Render the main component
      if (this.mainComponent && typeof this.mainComponent.render === 'function') {
        this.mainComponent.render();
      } else {
        this._renderErrorState(new Error('Failed to load results component'));
      }
      
      // Make an accessibility announcement
      this._announceForScreenReaders('Values assessment results loaded.');
      
      return this.container;
    } catch (error) {
      console.error('[ResultsViewComponent] Render error:', error);
      this._renderErrorState(error);
      return this.container;
    }
  }
  
  /**
   * Clean up component resources
   */
  destroy() {
    try {
      // Clean up main component if it has a destroy method
      if (this.mainComponent && typeof this.mainComponent.destroy === 'function') {
        this.mainComponent.destroy();
      }
      
      this._debug('Results view component destroyed');
    } catch (error) {
      console.error('[ResultsViewComponent] Destroy error:', error);
    }
  }
  
  /**
   * Update the main component reference
   * @private
   */
  _updateMainComponent() {
    try {
      // Determine which component to use based on feature flags or configuration
      // For now, we use the existing ResultsMainComponent
      
      // If an existing mainComponent exists, use that
      if (window.valueAssessmentConfig && window.valueAssessmentConfig.useExistingResultsComponent) {
        this.mainComponent = new ResultsMainComponent({
          container: this.container,
          service: this.service,
          ui: this.ui,
          valuesData: this.valuesData,
          themeService: this.themeService,
          authService: this.authService
        });
      } else {
        // Otherwise, use the new BaseComponent approach
        this.mainComponent = new ResultsBaseComponent({
          container: this.container,
          service: this.service,
          ui: this.ui,
          valuesData: this.valuesData,
          themeService: this.themeService,
          authService: this.authService,
          onContinueToReflection: () => this._handleContinueToReflection(),
          onRestartAssessment: () => this._handleRestartAssessment(),
          debug: this.debug
        });
      }
    } catch (error) {
      console.error('[ResultsViewComponent] Error updating main component:', error);
      this.hasError = true;
      this.errorMessage = error.message || 'Failed to create results component';
    }
  }
  
  /**
   * Handle continue to reflection click
   * @private
   */
  _handleContinueToReflection() {
    this._debug('Continue to reflection clicked');
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('results_navigation', {
        action: 'continue_to_reflection'
      });
    }
    
    try {
      // Send navigation event
      const event = new CustomEvent('results:continue_to_reflection');
      this.dispatchEvent(event);
      
      // Call callback
      if (typeof this.onContinueToReflection === 'function') {
        this.onContinueToReflection();
      }
    } catch (error) {
      console.error('[ResultsViewComponent] Error handling continue to reflection:', error);
    }
  }
  
  /**
   * Handle restart assessment click
   * @private
   */
  _handleRestartAssessment() {
    this._debug('Restart assessment clicked');
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('results_navigation', {
        action: 'restart_assessment'
      });
    }
    
    try {
      // Send restart event
      const event = new CustomEvent('results:restart_assessment');
      this.dispatchEvent(event);
      
      // Call callback
      if (typeof this.onRestartAssessment === 'function') {
        this.onRestartAssessment();
      }
    } catch (error) {
      console.error('[ResultsViewComponent] Error handling restart assessment:', error);
    }
  }
  
  /**
   * Render loading state
   * @private
   */
  _renderLoadingState() {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8">
        <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-700 dark:text-gray-300">Loading your assessment results...</p>
      </div>
    `;
  }
  
  /**
   * Render error state
   * @private
   * @param {Error} [error] Optional error object
   */
  _renderErrorState(error) {
    const errorMessage = error?.message || this.errorMessage || 'An unknown error occurred';
    
    this.container.innerHTML = `
      <div class="p-6 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
        <h2 class="text-lg font-bold mb-2">Error Loading Results</h2>
        <p class="mb-4">${errorMessage}</p>
        <button 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onclick="window.location.reload()">
          Refresh Page
        </button>
      </div>
    `;
    
    // Make an accessibility announcement
    this._announceForScreenReaders('Error loading assessment results.');
  }
  
  /**
   * Make an announcement for screen readers
   * @private
   * @param {string} message Announcement message
   * @param {string} [priority='polite'] Announcement priority
   */
  _announceForScreenReaders(message, priority = 'polite') {
    try {
      // Use UI service if available
      if (this.ui && typeof this.ui.announce === 'function') {
        this.ui.announce(message, priority);
        return;
      }
      
      // Otherwise, create a live region
      let announcer = document.getElementById('results-announcer');
      
      if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'results-announcer';
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcer);
      }
      
      // Set the announcement
      announcer.textContent = message;
      
      // Clean up after a short delay
      setTimeout(() => {
        if (announcer && document.body.contains(announcer)) {
          document.body.removeChild(announcer);
        }
      }, 3000);
    } catch (error) {
      console.error('[ResultsViewComponent] Error making announcement:', error);
    }
  }
  
  /**
   * Log debug message if debugging is enabled
   * @private
   * @param {string} message Debug message
   */
  _debug(message) {
    if (this.debug) {
      console.log(`[ResultsViewComponent] ${message}`);
    }
  }
}

// Export the component
export { ResultsViewComponent };
