/**
 * Guided Reflection View Component
 * Integrates guided reflection into the values assessment flow with navigation controls
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class GuidedReflectionViewComponent {
  /**
   * Create a guided reflection view component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.themeService = options.themeService || window.themeSystem;
    this.authService = options.authService || window.authService;
    
    // Navigation callbacks
    this.onNavigateBack = options.onNavigateBack || (() => {});
    this.onNavigateNext = options.onNavigateNext || (() => {});
    
    // Elements
    this.selectorContainer = null;
    this.reflectionContainer = null;
    this.navigationContainer = null;
    
    // Components
    this.selectorComponent = null;
    this.mainComponent = null;
    
    // State
    this.isInitialized = false;
    this.hasError = false;
    this.isPremiumUser = this._checkPremiumStatus();
    this.selectedValueId = null;
    this.responses = {};
    this.valueIds = this._getPrioritizedValues();
    
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
      
      // Set up theme change listener
      document.addEventListener('themechange', this._handleThemeChange);
      
      // Load saved responses if available
      await this._loadSavedResponses();
      
      // Get prioritized values
      this.valueIds = this._getPrioritizedValues();
      
      // Select first value if there are any
      if (this.valueIds && this.valueIds.length > 0) {
        this.selectedValueId = this.valueIds[0];
      }
      
      // Mark as initialized
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('[GuidedReflectionViewComponent] Initialization error:', error);
      this.hasError = true;
      return false;
    }
  }
  
  /**
   * Render the view component
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'guided-reflection-view';
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', 'Guided Value Reflection');
      
      // Create header
      const header = this._createHeader();
      wrapper.appendChild(header);
      
      // Create main content area with two columns for selector and reflection
      const contentArea = document.createElement('div');
      contentArea.className = 'md:flex md:gap-6';
      
      // Create selector column
      this.selectorContainer = document.createElement('div');
      this.selectorContainer.className = 'md:w-1/3 mb-6 md:mb-0';
      contentArea.appendChild(this.selectorContainer);
      
      // Create reflection column
      this.reflectionContainer = document.createElement('div');
      this.reflectionContainer.className = 'md:w-2/3';
      contentArea.appendChild(this.reflectionContainer);
      
      wrapper.appendChild(contentArea);
      
      // Create navigation footer
      this.navigationContainer = document.createElement('div');
      this.navigationContainer.className = 'mt-8 pt-6 border-t border-gray-200 dark:border-gray-700';
      wrapper.appendChild(this.navigationContainer);
      
      // Add to container
      this.container.appendChild(wrapper);
      
      // Render sub-components
      this._renderSubComponents();
      
      // Render navigation buttons
      this._renderNavigation();
      
      return this.container;
    } catch (error) {
      console.error('[GuidedReflectionViewComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-6 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <h2 class="text-lg font-bold mb-2">Error Loading Reflection View</h2>
          <p class="mb-4">There was a problem loading the guided reflection tools.</p>
          <button 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onclick="window.location.reload()">
            Refresh Page
          </button>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Clean up when component is destroyed
   */
  destroy() {
    // Remove theme change listener
    document.removeEventListener('themechange', this._handleThemeChange);
    
    // Destroy sub-components if they have destroy methods
    if (this.mainComponent && typeof this.mainComponent.destroy === 'function') {
      this.mainComponent.destroy();
    }
    
    // Clear references
    this.selectorComponent = null;
    this.mainComponent = null;
  }
  
  /**
   * Get all reflection responses
   * @returns {Object} Object mapping value IDs to responses
   */
  getResponses() {
    return { ...this.responses };
  }
  
  /**
   * Create header section
   * @private
   * @returns {HTMLElement} Header element
   */
  _createHeader() {
    const header = document.createElement('header');
    header.className = 'mb-8';
    
    const heading = document.createElement('h1');
    heading.className = 'text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2';
    heading.textContent = 'Guided Value Reflection';
    
    const description = document.createElement('p');
    description.className = 'text-lg text-gray-700 dark:text-gray-300';
    description.textContent = 'Take time to reflect on your core values and integrate them into your life.';
    
    header.appendChild(heading);
    header.appendChild(description);
    
    return header;
  }
  
  /**
   * Render selector and main reflection components
   * @private
   */
  _renderSubComponents() {
    // Create and render selector component
    this.selectorComponent = new GuidedReflectionSelectorComponent({
      ui: this.ui,
      service: this.service,
      container: this.selectorContainer,
      valuesData: this.valuesData,
      themeService: this.themeService,
      currentValueId: this.selectedValueId,
      onValueSelect: (valueId) => this._handleValueSelect(valueId)
    });
    
    this.selectorComponent.initialize().then(() => {
      this.selectorComponent.render();
    });
    
    // Create and render main component
    this.mainComponent = new GuidedReflectionMainComponent({
      ui: this.ui,
      service: this.service,
      container: this.reflectionContainer,
      valuesData: this.valuesData,
      themeService: this.themeService,
      authService: this.authService,
      valueId: this.selectedValueId,
      responses: this.responses
    });
    
    this.mainComponent.initialize().then(() => {
      this.mainComponent.render();
    });
  }
  
  /**
   * Render navigation buttons
   * @private
   */
  _renderNavigation() {
    if (!this.navigationContainer) return;
    
    this.navigationContainer.innerHTML = '';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-between';
    
    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    backButton.setAttribute('type', 'button');
    backButton.textContent = 'Back to Results';
    backButton.addEventListener('click', () => this._handleBackClick());
    
    // Next button (conditional based on whether there are values to reflect on)
    const nextButton = document.createElement('button');
    nextButton.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    nextButton.setAttribute('type', 'button');
    nextButton.textContent = 'Continue to Next Steps';
    nextButton.addEventListener('click', () => this._handleNextClick());
    
    buttonContainer.appendChild(backButton);
    buttonContainer.appendChild(nextButton);
    
    this.navigationContainer.appendChild(buttonContainer);
  }
  
  /**
   * Handle back button click
   * @private
   */
  _handleBackClick() {
    // Save any unsaved responses first
    this._saveAllResponses();
    
    // Call the back navigation callback
    if (this.onNavigateBack && typeof this.onNavigateBack === 'function') {
      this.onNavigateBack();
    }
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('reflection_navigation', {
        direction: 'back',
        destination: 'results',
        completedValues: Object.keys(this.responses).length,
        totalValues: this.valueIds.length
      });
    }
  }
  
  /**
   * Handle next button click
   * @private
   */
  _handleNextClick() {
    // Save any unsaved responses first
    this._saveAllResponses();
    
    // Call the next navigation callback
    if (this.onNavigateNext && typeof this.onNavigateNext === 'function') {
      this.onNavigateNext();
    }
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('reflection_navigation', {
        direction: 'next',
        destination: 'next_steps',
        completedValues: Object.keys(this.responses).length,
        totalValues: this.valueIds.length
      });
    }
  }
  
  /**
   * Handle value selection
   * @private
   * @param {string} valueId Selected value ID
   */
  _handleValueSelect(valueId) {
    if (!valueId || valueId === this.selectedValueId) return;
    
    // Save current responses before switching
    this._saveAllResponses();
    
    // Update selected value ID
    this.selectedValueId = valueId;
    
    // Update the main component
    if (this.mainComponent) {
      this.mainComponent.setValueId(valueId);
    }
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('reflection_value_selected', {
        valueId: valueId,
        isPremiumUser: this.isPremiumUser
      });
    }
  }
  
  /**
   * Handle theme change event
   * @private
   * @param {Event} event Theme change event
   */
  _handleThemeChange(event) {
    // Re-render if initialized
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
      console.error('[GuidedReflectionViewComponent] Error checking premium status:', error);
      return false;
    }
  }
  
  /**
   * Get prioritized values from the service
   * @private
   * @returns {Array<string>} Array of prioritized value IDs
   */
  _getPrioritizedValues() {
    try {
      if (!this.service) return [];
      
      const prioritizedValues = this.service.getPrioritizedValues();
      return Array.isArray(prioritizedValues) ? prioritizedValues : [];
    } catch (error) {
      console.error('[GuidedReflectionViewComponent] Error getting prioritized values:', error);
      return [];
    }
  }
  
  /**
   * Load saved reflection responses
   * @private
   * @returns {Promise<void>}
   */
  async _loadSavedResponses() {
    try {
      if (!this.service) return;
      
      // Get all reflection responses from service
      const responses = await this.service.getReflectionResponses();
      
      if (responses && typeof responses === 'object') {
        this.responses = responses;
      }
    } catch (error) {
      console.error('[GuidedReflectionViewComponent] Error loading saved responses:', error);
    }
  }
  
  /**
   * Save all responses to the service
   * @private
   */
  _saveAllResponses() {
    try {
      if (!this.service || !this.mainComponent) return;
      
      // Get responses from main component
      const currentResponses = this.mainComponent.getResponses();
      
      // Merge with existing responses
      this.responses = { ...this.responses, ...currentResponses };
      
      // Save to service
      if (this.service && typeof this.service.saveAllReflections === 'function') {
        this.service.saveAllReflections(this.responses).catch(error => {
          console.error('[GuidedReflectionViewComponent] Error saving all reflections:', error);
        });
      }
    } catch (error) {
      console.error('[GuidedReflectionViewComponent] Error saving responses:', error);
    }
  }
}

// Import dependencies
import { GuidedReflectionSelectorComponent } from './guided-reflection-selector.js';
import { GuidedReflectionMainComponent } from './guided-reflection-main.js';

// Export the component
export { GuidedReflectionViewComponent };
