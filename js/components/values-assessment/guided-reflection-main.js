/**
 * Guided Reflection Main Component
 * Integrates all guided reflection sub-components into a cohesive experience
 * 
 * Following ValueAlign development rules for accessibility, theme integration,
 * authentication, error handling, and progressive enhancement
 */

class GuidedReflectionMainComponent {
  /**
   * Create a guided reflection main component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.themeService = options.themeService || window.themeSystem;
    this.authService = options.authService || window.authService;
    
    // Configuration
    this.isPremiumUser = this._checkPremiumStatus();
    
    // Default to user's top prioritized value if not specified
    this.valueId = options.valueId || this._getTopValueId();
    
    // State
    this.isInitialized = false;
    this.isInitializing = false;
    this.hasError = false;
    this.errorMessage = '';
    this.responses = options.responses || {};
    
    // Sub-components
    this.baseComponent = null;
    this.exerciseComponent = null;
    
    // Internal containers
    this.baseContainer = null;
    this.exerciseContainer = null;
    
    // Theme change handler
    this._handleThemeChange = this._handleThemeChange.bind(this);
  }
  
  /**
   * Initialize the component and its sub-components
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
      
      this.isInitializing = true;
      
      // Create template provider
      this.templateProvider = new GuidedReflectionTemplate({
        valuesData: this.valuesData,
        isPremiumUser: this.isPremiumUser,
        authService: this.authService,
        coreService: this.service,
        debug: false
      });
      
      await this.templateProvider.initialize();
      
      // Set up theme change listener
      document.addEventListener('themechange', this._handleThemeChange);
      
      // Mark as initialized
      this.isInitialized = true;
      this.isInitializing = false;
      
      return true;
    } catch (error) {
      console.error('[GuidedReflectionMainComponent] Initialization error:', error);
      this.isInitializing = false;
      this.hasError = true;
      this.errorMessage = error.message || 'Failed to initialize guided reflection';
      return false;
    }
  }
  
  /**
   * Render the main component
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      if (!this.isInitialized && !this.isInitializing) {
        // Initialize if not already done
        this.initialize().then(() => this.render());
        
        // Show loading state
        this._renderLoadingState();
        return this.container;
      }
      
      if (this.isInitializing) {
        // Show loading state
        this._renderLoadingState();
        return this.container;
      }
      
      if (this.hasError) {
        // Show error state
        this._renderErrorState();
        return this.container;
      }
      
      // Create main structure
      const mainWrapper = document.createElement('div');
      mainWrapper.className = 'guided-reflection-main';
      mainWrapper.setAttribute('role', 'region');
      mainWrapper.setAttribute('aria-label', 'Guided value reflection');
      
      // Create base container
      this.baseContainer = document.createElement('div');
      this.baseContainer.className = 'guided-reflection-base mb-6';
      
      // Create exercise container
      this.exerciseContainer = document.createElement('div');
      this.exerciseContainer.className = 'guided-reflection-exercise';
      
      // Assemble main wrapper
      mainWrapper.appendChild(this.baseContainer);
      mainWrapper.appendChild(this.exerciseContainer);
      
      // Add to container
      this.container.appendChild(mainWrapper);
      
      // Render sub-components
      this._renderSubComponents();
      
      return this.container;
    } catch (error) {
      console.error('[GuidedReflectionMainComponent] Render error:', error);
      
      // Show error message
      this._renderErrorState(error);
      
      return this.container;
    }
  }
  
  /**
   * Clean up when component is destroyed
   */
  destroy() {
    // Remove theme change listener
    document.removeEventListener('themechange', this._handleThemeChange);
    
    // Clean up sub-components if needed
    this.baseComponent = null;
    this.exerciseComponent = null;
  }
  
  /**
   * Set the value ID for reflection
   * @param {string} valueId ID of the value to reflect on
   * @returns {Promise<boolean>} Whether the value was set successfully
   */
  async setValueId(valueId) {
    if (!valueId) return false;
    
    try {
      // Update the value ID
      this.valueId = valueId;
      
      // Re-render if already initialized
      if (this.isInitialized) {
        this.render();
      }
      
      return true;
    } catch (error) {
      console.error('[GuidedReflectionMainComponent] Error setting value ID:', error);
      return false;
    }
  }
  
  /**
   * Get all saved responses
   * @returns {Object} Object mapping value IDs to responses
   */
  getResponses() {
    return { ...this.responses };
  }
  
  /**
   * Save a new reflection response
   * @param {string} valueId Value ID
   * @param {string} response User response
   */
  saveResponse(valueId, response) {
    if (!valueId) return;
    
    // Update local responses
    this.responses[valueId] = response;
    
    // Send to service if available
    if (this.service && typeof this.service.saveReflection === 'function') {
      this.service.saveReflection(valueId, response).catch(error => {
        console.error('[GuidedReflectionMainComponent] Error saving reflection to service:', error);
      });
    }
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('reflection_saved', {
        valueId: valueId,
        responseLength: response.length,
        isPremiumUser: this.isPremiumUser
      });
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
        <p class="text-gray-700 dark:text-gray-300">Loading reflection tools...</p>
      </div>
    `;
  }
  
  /**
   * Render error state
   * @private
   * @param {Error} [error] Optional error object
   */
  _renderErrorState(error) {
    const errorMessage = error ? error.message : (this.errorMessage || 'An unknown error occurred');
    
    this.container.innerHTML = `
      <div class="p-6 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
        <h2 class="text-lg font-bold mb-2">Error Loading Reflection Tools</h2>
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
   * Render sub-components
   * @private
   */
  _renderSubComponents() {
    // Create and render base component
    this.baseComponent = new GuidedReflectionBaseComponent({
      ui: this.ui,
      service: this.service,
      container: this.baseContainer,
      valuesData: this.valuesData,
      themeService: this.themeService,
      authService: this.authService,
      valueId: this.valueId
    });
    
    this.baseComponent.initialize().then(() => {
      this.baseComponent.render();
    });
    
    // Create and render exercise component for the selected value
    this.exerciseComponent = new GuidedReflectionExerciseComponent({
      ui: this.ui,
      container: this.exerciseContainer,
      valueId: this.valueId,
      templateProvider: this.templateProvider,
      isPremiumUser: this.isPremiumUser,
      responses: this.responses,
      onSaveResponse: (valueId, response) => this.saveResponse(valueId, response)
    });
    
    this.exerciseComponent.initialize().then(() => {
      this.exerciseComponent.render();
    });
    
    // Announce for screen readers
    if (this.ui && this.ui.announce) {
      const value = this._getValueName(this.valueId);
      this.ui.announce(`Guided reflection for ${value} loaded`, 'polite');
    }
  }
  
  /**
   * Handle theme change event
   * @private
   * @param {Event} event Theme change event
   */
  _handleThemeChange(event) {
    // Re-render if needed to apply new theme
    if (this.isInitialized && this.container) {
      this.render();
    }
  }
  
  /**
   * Check if user has premium status
   * @private
   * @returns {boolean} Whether user has premium status
   */
  _checkPremiumStatus() {
    try {
      if (this.service && typeof this.service.isPremiumUser === 'boolean') {
        return this.service.isPremiumUser;
      }
      
      if (this.authService && typeof this.authService.hasPremiumAccess === 'function') {
        return this.authService.hasPremiumAccess();
      }
      
      return false;
    } catch (error) {
      console.error('[GuidedReflectionMainComponent] Error checking premium status:', error);
      return false;
    }
  }
  
  /**
   * Get the top prioritized value ID
   * @private
   * @returns {string|null} Top value ID or null
   */
  _getTopValueId() {
    try {
      if (!this.service) return null;
      
      const prioritizedValues = this.service.getPrioritizedValues();
      if (!prioritizedValues || prioritizedValues.length === 0) {
        return null;
      }
      
      return prioritizedValues[0];
    } catch (error) {
      console.error('[GuidedReflectionMainComponent] Error getting top value ID:', error);
      return null;
    }
  }
  
  /**
   * Get the value name from its ID
   * @private
   * @param {string} valueId Value ID
   * @returns {string} Value name or fallback text
   */
  _getValueName(valueId) {
    if (!valueId || !this.valuesData) return 'selected value';
    
    const value = this.valuesData.find(v => v.id === valueId);
    return value ? value.name : 'selected value';
  }
}

// Import dependencies
import { GuidedReflectionTemplate } from './guided-reflection-template.js';
import { GuidedReflectionBaseComponent } from './guided-reflection-base.js';
import { GuidedReflectionExerciseComponent } from './guided-reflection-exercise.js';

// Export the component
export { GuidedReflectionMainComponent };
