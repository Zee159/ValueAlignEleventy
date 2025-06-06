/**
 * Next Steps Base Component
 * Provides a foundation for the final step in the values assessment
 * 
 * Following ValueAlign development rules for accessibility, theme integration, 
 * and progressive enhancement
 */

class NextStepsBaseComponent {
  /**
   * Create a next steps base component
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
    this.debug = options.debug || false;
    
    // Navigation callbacks
    this.onNavigateBack = options.onNavigateBack || (() => {});
    this.onRestartAssessment = options.onRestartAssessment || (() => {});
    
    // State
    this.isInitialized = false;
    this.isInitializing = false;
    this.hasError = false;
    this.errorMessage = '';
    
    // Theme change handler
    this._handleThemeChange = this._handleThemeChange.bind(this);
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
      
      this.isInitializing = true;
      
      // Set up theme change listener
      document.addEventListener('themechange', this._handleThemeChange);
      
      // Load prioritized values
      this.prioritizedValues = await this._loadPrioritizedValues();
      
      // Mark as initialized
      this.isInitialized = true;
      this.isInitializing = false;
      
      return true;
    } catch (error) {
      console.error('[NextStepsBaseComponent] Initialization error:', error);
      this.isInitializing = false;
      this.hasError = true;
      this.errorMessage = error.message || 'Failed to initialize next steps component';
      return false;
    }
  }
  
  /**
   * Render the base component
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
      
      // Create main wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'next-steps-component';
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-labelledby', 'next-steps-heading');
      
      // Create header
      const header = this._createHeader();
      wrapper.appendChild(header);
      
      // Create content
      const content = this._createContent();
      wrapper.appendChild(content);
      
      // Create navigation
      const navigation = this._createNavigation();
      wrapper.appendChild(navigation);
      
      // Add to container
      this.container.appendChild(wrapper);
      
      return this.container;
    } catch (error) {
      console.error('[NextStepsBaseComponent] Render error:', error);
      
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
    heading.textContent = 'Your Next Steps';
    heading.id = 'next-steps-heading';
    
    const description = document.createElement('p');
    description.className = 'text-gray-700 dark:text-gray-300';
    description.textContent = 'Based on your values assessment, here are recommended next steps to help you live more aligned with your core values.';
    
    header.appendChild(heading);
    header.appendChild(description);
    
    return header;
  }
  
  /**
   * Create content section - can be overridden by subclasses
   * @private
   * @returns {HTMLElement} Content element
   */
  _createContent() {
    const content = document.createElement('div');
    content.className = 'next-steps-content mb-8';
    
    // Base implementation just shows a placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'bg-gray-100 dark:bg-gray-750 p-6 rounded-lg text-center';
    placeholder.innerHTML = `
      <p class="text-gray-500 dark:text-gray-400">Next steps content will appear here.</p>
    `;
    
    content.appendChild(placeholder);
    
    return content;
  }
  
  /**
   * Create navigation section
   * @private
   * @returns {HTMLElement} Navigation element
   */
  _createNavigation() {
    const navigation = document.createElement('div');
    navigation.className = 'next-steps-navigation pt-6 border-t border-gray-200 dark:border-gray-700';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-between';
    
    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    backButton.setAttribute('type', 'button');
    backButton.textContent = 'Back to Reflection';
    backButton.addEventListener('click', () => this._handleBackClick());
    
    // Restart button
    const restartButton = document.createElement('button');
    restartButton.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    restartButton.setAttribute('type', 'button');
    restartButton.textContent = 'Start Over';
    restartButton.addEventListener('click', () => this._handleRestartClick());
    
    buttonContainer.appendChild(backButton);
    buttonContainer.appendChild(restartButton);
    
    navigation.appendChild(buttonContainer);
    
    return navigation;
  }
  
  /**
   * Render loading state
   * @private
   */
  _renderLoadingState() {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-8">
        <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-700 dark:text-gray-300">Loading next steps...</p>
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
        <h2 class="text-lg font-bold mb-2">Error Loading Next Steps</h2>
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
   * Handle back button click
   * @private
   */
  _handleBackClick() {
    // Call the back navigation callback
    if (this.onNavigateBack && typeof this.onNavigateBack === 'function') {
      this.onNavigateBack();
    }
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('next_steps_navigation', {
        direction: 'back',
        destination: 'reflection'
      });
    }
  }
  
  /**
   * Handle restart button click
   * @private
   */
  _handleRestartClick() {
    // Call the restart callback
    if (this.onRestartAssessment && typeof this.onRestartAssessment === 'function') {
      this.onRestartAssessment();
    }
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('next_steps_navigation', {
        direction: 'restart',
        destination: 'start'
      });
    }
  }
  
  /**
   * Handle theme change event
   * @private
   * @param {Event} event Theme change event
   */
  _handleThemeChange(event) {
    // Re-render to apply new theme
    if (this.isInitialized) {
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
      console.error('[NextStepsBaseComponent] Error checking premium status:', error);
      return false;
    }
  }
  
  /**
   * Load prioritized values
   * @private
   * @returns {Promise<Array<Object>>} Array of prioritized value objects
   */
  async _loadPrioritizedValues() {
    try {
      if (!this.service) return [];
      
      const prioritizedValueIds = this.service.getPrioritizedValues();
      
      if (!prioritizedValueIds || prioritizedValueIds.length === 0) {
        return [];
      }
      
      // Convert IDs to full value objects
      return prioritizedValueIds
        .map(id => this.valuesData.find(v => v.id === id))
        .filter(Boolean);
    } catch (error) {
      console.error('[NextStepsBaseComponent] Error loading prioritized values:', error);
      return [];
    }
  }
}

// Export the component
export { NextStepsBaseComponent };
