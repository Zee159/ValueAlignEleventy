/**
 * Results Base Component
 * Provides foundation for displaying values assessment results
 * 
 * Following ValueAlign development rules for accessibility, theme integration, 
 * and progressive enhancement
 */

class ResultsBaseComponent {
  /**
   * Create a results base component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    // Core services
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.themeService = options.themeService || window.themeSystem;
    this.authService = options.authService || window.authService;
    
    // Navigation callbacks
    this.onContinueToReflection = options.onContinueToReflection || (() => {});
    this.onRestartAssessment = options.onRestartAssessment || (() => {});
    
    // Configuration
    this.isPremiumUser = false; // Will be checked during initialization
    this.debug = options.debug || false;
    
    // State
    this.isInitialized = false;
    this.isInitializing = false;
    this.hasError = false;
    this.errorMessage = '';
    this.assessmentResults = null;
    this.currentTheme = 'light';
    
    // Bind methods
    this._handleThemeChange = this._handleThemeChange.bind(this);
    
    // Log initialization if debugging
    if (this.debug) {
      console.log('[ResultsBaseComponent] Created');
    }
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
      
      if (this.debug) {
        console.log('[ResultsBaseComponent] Initializing...');
      }
      
      // Check premium status
      this.isPremiumUser = this._checkPremiumStatus();
      
      // Set up theme change listener
      document.addEventListener('themechange', this._handleThemeChange);
      this.currentTheme = this._getCurrentTheme();
      
      // Load assessment results
      this.assessmentResults = await this._loadAssessmentResults();
      
      // Mark as initialized
      this.isInitialized = true;
      this.isInitializing = false;
      
      if (this.debug) {
        console.log('[ResultsBaseComponent] Initialized successfully');
      }
      
      return true;
    } catch (error) {
      console.error('[ResultsBaseComponent] Initialization error:', error);
      this.isInitializing = false;
      this.hasError = true;
      this.errorMessage = error.message || 'Failed to initialize results component';
      return false;
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
      console.error('[ResultsBaseComponent] Error checking premium status:', error);
      return false;
    }
  }
  
  /**
   * Log debug message if debugging is enabled
   * @param {string} message Debug message
   */
  _debug(message) {
    if (this.debug) {
      console.log(`[ResultsBaseComponent] ${message}`);
    }
  }

  /**
   * Render the component
   * @returns {HTMLElement} The rendered component or container
   */
  render() {
    if (!this.container) {
      this._debug('No container provided for rendering');
      return null;
    }
    
    try {
      // Clear the container
      this.container.innerHTML = '';
      
      if (!this.isInitialized && !this.isInitializing) {
        // Initialize if not already done
        this.initialize().then(() => {
          if (this.isInitialized) {
            this.render();
          }
        });
        
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
      
      // Render the actual content
      this._renderContent();
      
      return this.container;
    } catch (error) {
      console.error('[ResultsBaseComponent] Render error:', error);
      this._renderErrorState(error);
      return this.container;
    }
  }
  
  /**
   * Render the main content
   * @private
   */
  _renderContent() {
    // Create main container with proper accessibility attributes
    const wrapper = document.createElement('div');
    wrapper.className = 'results-component p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow';
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-labelledby', 'results-heading');
    
    // Add header section
    const header = this._createHeader();
    wrapper.appendChild(header);
    
    // Add content section (placeholder in base component)
    const content = this._createContentSection();
    wrapper.appendChild(content);
    
    // Add navigation section
    const navigation = this._createNavigation();
    wrapper.appendChild(navigation);
    
    // Add to container
    this.container.appendChild(wrapper);
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
      <div class="p-6 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
        <h2 class="text-lg font-bold mb-2">Error Loading Results</h2>
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
   * Get the current theme
   * @private
   * @returns {string} Current theme name
   */
  _getCurrentTheme() {
    if (this.themeService && typeof this.themeService.getCurrentTheme === 'function') {
      return this.themeService.getCurrentTheme();
    }
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  
  /**
   * Handle theme change events
   * @private
   * @param {Event} event The theme change event
   */
  _handleThemeChange(event) {
    try {
      this.currentTheme = event?.detail?.theme || this._getCurrentTheme();
      this._debug(`Theme changed to ${this.currentTheme}`);
      
      // Re-render if already initialized
      if (this.isInitialized) {
        this.render();
      }
    } catch (error) {
      console.error('[ResultsBaseComponent] Error handling theme change:', error);
    }
  }
  
  /**
   * Load assessment results from service
   * @private
   * @returns {Promise<Object>} Assessment results
   */
  async _loadAssessmentResults() {
    try {
      if (!this.service) {
        throw new Error('Assessment service not available');
      }
      
      // Check if the service has results
      if (typeof this.service.getResults !== 'function') {
        throw new Error('Assessment service does not provide results method');
      }
      
      const results = await this.service.getResults();
      
      if (!results) {
        throw new Error('No assessment results available');
      }
      
      return results;
    } catch (error) {
      console.error('[ResultsBaseComponent] Error loading assessment results:', error);
      throw error;
    }
  }
  
  /**
   * Clean up component resources
   */
  destroy() {
    try {
      // Remove event listeners
      document.removeEventListener('themechange', this._handleThemeChange);
      
      this._debug('Component destroyed');
    } catch (error) {
      console.error('[ResultsBaseComponent] Error destroying component:', error);
    }
  }
  
  /**
   * Create header section with title and description
   * @private
   * @returns {HTMLElement} The header element
   */
  _createHeader() {
    const header = document.createElement('header');
    header.className = 'mb-6';
    
    const heading = document.createElement('h2');
    heading.id = 'results-heading';
    heading.className = 'text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3';
    heading.textContent = 'Your Values Assessment Results';
    
    const description = document.createElement('p');
    description.className = 'text-gray-600 dark:text-gray-300';
    description.textContent = 'Below are your top values based on your assessment responses. Use these insights to guide your reflection process.';
    
    header.appendChild(heading);
    header.appendChild(description);
    
    return header;
  }
  
  /**
   * Create content section with placeholder (to be overridden by subclasses)
   * @private
   * @returns {HTMLElement} The content element
   */
  _createContentSection() {
    const content = document.createElement('div');
    content.className = 'results-content mb-8';
    content.id = 'results-content';
    
    // Placeholder content (subclasses should override this)
    const placeholder = document.createElement('div');
    placeholder.className = 'bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center';
    placeholder.innerHTML = `
      <p class="text-gray-500 dark:text-gray-400">Results content will display here.</p>
      <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
        This component should be extended with actual results rendering.
      </p>
    `;
    
    content.appendChild(placeholder);
    
    return content;
  }
  
  /**
   * Create navigation section with buttons
   * @private
   * @returns {HTMLElement} The navigation element
   */
  _createNavigation() {
    const navigation = document.createElement('div');
    navigation.className = 'results-navigation flex justify-between pt-4 mt-6 border-t border-gray-100 dark:border-gray-700';
    
    // Restart assessment button (left side)
    const restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.className = 'btn-secondary px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500';
    restartBtn.textContent = 'Restart Assessment';
    restartBtn.setAttribute('aria-label', 'Restart the values assessment');
    
    // Continue to reflection button (right side)
    const continueBtn = document.createElement('button');
    continueBtn.type = 'button';
    continueBtn.className = 'btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    continueBtn.textContent = 'Continue to Reflection';
    continueBtn.setAttribute('aria-label', 'Continue to guided reflection');
    
    // Add event listeners
    restartBtn.addEventListener('click', () => this._handleRestartClick());
    continueBtn.addEventListener('click', () => this._handleContinueClick());
    
    navigation.appendChild(restartBtn);
    navigation.appendChild(continueBtn);
    
    return navigation;
  }
  
  /**
   * Handle continue button click
   * @private
   */
  _handleContinueClick() {
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('results_navigation', {
        direction: 'forward',
        destination: 'guided_reflection'
      });
    }
    
    // Call continue callback
    if (typeof this.onContinueToReflection === 'function') {
      this.onContinueToReflection();
    }
  }
  
  /**
   * Handle restart button click
   * @private
   */
  _handleRestartClick() {
    // Confirm before restarting
    if (confirm('Are you sure you want to restart the values assessment? Your current results will be lost.')) {
      // Track analytics event
      if (window.analytics) {
        window.analytics.track('results_navigation', {
          direction: 'restart',
          destination: 'assessment_start'
        });
      }
      
      // Call restart callback
      if (typeof this.onRestartAssessment === 'function') {
        this.onRestartAssessment();
      }
    }
  }
}

// Export the component
export { ResultsBaseComponent };
