/**
 * Next Steps View Component
 * Top-level component for the values assessment next steps page
 * 
 * Following ValueAlign development rules for accessibility, theme integration, 
 * and progressive enhancement
 */

import { NextStepsMainComponent } from './next-steps-main.js';

class NextStepsViewComponent {
  /**
   * Create a next steps view component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.container = options.container;
    this.service = options.service;
    this.ui = options.ui;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.themeService = options.themeService || window.themeSystem;
    this.authService = options.authService || window.authService;
    
    // Navigation callbacks
    this.onNavigateBack = options.onNavigateBack || (() => {});
    this.onRestartAssessment = options.onRestartAssessment || (() => {});
    this.onExportAssessment = options.onExportAssessment || (() => {});
    
    // State
    this.isInitialized = false;
    this.hasError = false;
    this.nextStepsComponent = null;
    
    // Event handling
    this.events = new EventTarget();
    this._handleComponentEvent = this._handleComponentEvent.bind(this);
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
      
      if (!this.container) {
        throw new Error('Container element is required');
      }
      
      // Create next steps main component
      this.nextStepsComponent = new NextStepsMainComponent({
        container: this.container,
        service: this.service,
        ui: this.ui,
        valuesData: this.valuesData,
        themeService: this.themeService,
        authService: this.authService,
        onNavigateBack: this.onNavigateBack,
        onRestartAssessment: this.onRestartAssessment,
        onJournalAction: (value) => this._handleJournalAction(value)
      });
      
      // Initialize component
      const result = await this.nextStepsComponent.initialize();
      
      if (result) {
        // Add event listeners
        if (this.nextStepsComponent.events) {
          this.nextStepsComponent.events.addEventListener('export-assessment', this._handleComponentEvent);
          this.nextStepsComponent.events.addEventListener('next-steps-action', this._handleComponentEvent);
        }
        
        this.isInitialized = true;
        
        // Announce to screen readers
        this._announceForScreenReaders('Next steps view loaded');
      }
      
      return result;
    } catch (error) {
      console.error('[NextStepsViewComponent] Initialization error:', error);
      this.hasError = true;
      return false;
    }
  }
  
  /**
   * Render the component
   * @returns {HTMLElement} The container element
   */
  render() {
    try {
      if (!this.isInitialized) {
        // Initialize first if needed
        this.initialize().then(() => {
          if (this.isInitialized) {
            this.render();
          }
        });
        
        return this.container;
      }
      
      // Render next steps component
      if (this.nextStepsComponent) {
        this.nextStepsComponent.render();
      }
      
      // Track analytics event
      if (window.analytics) {
        window.analytics.track('view_next_steps', {
          hasValues: Boolean(this.nextStepsComponent?.prioritizedValues?.length)
        });
      }
      
      return this.container;
    } catch (error) {
      console.error('[NextStepsViewComponent] Render error:', error);
      
      // Show error state
      this._renderErrorState(error);
      
      return this.container;
    }
  }
  
  /**
   * Clean up when component is destroyed
   */
  destroy() {
    try {
      // Remove event listeners
      if (this.nextStepsComponent?.events) {
        this.nextStepsComponent.events.removeEventListener('export-assessment', this._handleComponentEvent);
        this.nextStepsComponent.events.removeEventListener('next-steps-action', this._handleComponentEvent);
      }
      
      // Clean up next steps component
      if (this.nextStepsComponent && typeof this.nextStepsComponent.destroy === 'function') {
        this.nextStepsComponent.destroy();
      }
      
      this.nextStepsComponent = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('[NextStepsViewComponent] Destroy error:', error);
    }
  }
  
  /**
   * Handle component events
   * @private
   * @param {CustomEvent} event Custom event
   */
  _handleComponentEvent(event) {
    try {
      switch (event.type) {
        case 'export-assessment':
          if (typeof this.onExportAssessment === 'function') {
            this.onExportAssessment(event.detail);
          }
          break;
          
        case 'next-steps-action':
          // Forward event to parent listeners
          this.events.dispatchEvent(new CustomEvent('next-steps-action', {
            detail: event.detail
          }));
          break;
      }
    } catch (error) {
      console.error('[NextStepsViewComponent] Error handling component event:', error);
    }
  }
  
  /**
   * Handle journal action
   * @private
   * @param {Object} value Value to journal about
   */
  _handleJournalAction(value) {
    try {
      // Check if premium user
      const isPremium = this.authService?.hasPremiumAccess?.() || false;
      
      if (!isPremium) {
        // Show premium upsell
        if (this.ui?.showPremiumUpsell) {
          this.ui.showPremiumUpsell('journal');
        } else {
          window.location.href = '/dashboard/settings/subscription/';
        }
        return;
      }
      
      // If premium, navigate to journal
      const journalUrl = `/dashboard/journal/new/?valueId=${value.id}&source=next-steps`;
      window.location.href = journalUrl;
      
    } catch (error) {
      console.error('[NextStepsViewComponent] Error handling journal action:', error);
    }
  }
  
  /**
   * Render error state
   * @private
   * @param {Error} [error] Optional error object
   */
  _renderErrorState(error) {
    if (!this.container) return;
    
    const errorMessage = error?.message || 'An error occurred while loading the next steps view.';
    
    this.container.innerHTML = `
      <div class="p-6 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
        <h2 class="text-lg font-bold mb-2">Error</h2>
        <p class="mb-4">${errorMessage}</p>
        <button 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onclick="window.location.reload()">
          Refresh Page
        </button>
      </div>
    `;
  }
  
  /**
   * Announce message for screen readers
   * @private
   * @param {string} message Message to announce
   */
  _announceForScreenReaders(message) {
    try {
      // Use UI service if available
      if (this.ui && typeof this.ui.announce === 'function') {
        this.ui.announce(message, 'polite');
        return;
      }
      
      // Fallback implementation
      const announcer = document.createElement('div');
      announcer.className = 'sr-only';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.textContent = message;
      
      document.body.appendChild(announcer);
      
      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 3000);
    } catch (error) {
      console.error('[NextStepsViewComponent] Error announcing to screen readers:', error);
    }
  }
}

// Export the component
export { NextStepsViewComponent };
