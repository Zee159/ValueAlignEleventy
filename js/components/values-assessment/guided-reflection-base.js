/**
 * Guided Reflection Base Component
 * Basic wrapper component for the guided reflection experience
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class GuidedReflectionBaseComponent {
  /**
   * Create a guided reflection base component
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
    this.valueId = options.valueId || null;
    
    // Content
    this.content = {
      title: 'Guided Value Reflection',
      subtitle: 'Deepen your understanding through reflection',
      noValueSelectedMessage: 'Please select a value to begin reflection',
      backButtonText: 'Back to Results',
      nextButtonText: 'Save & Continue',
      loadingMessage: 'Loading reflection prompts...',
      errorMessage: 'There was a problem loading the reflection prompts. Please try again.'
    };
    
    // State
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';
    
    // Template provider
    this.templateProvider = null;
  }
  
  /**
   * Initialize the component
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      // Create template provider
      this.templateProvider = new GuidedReflectionTemplate({
        valuesData: this.valuesData,
        isPremiumUser: this.isPremiumUser,
        authService: this.authService,
        coreService: this.service,
        debug: false
      });
      
      await this.templateProvider.initialize();
      
      this.isLoading = false;
      return true;
    } catch (error) {
      console.error('[GuidedReflectionBaseComponent] Initialization error:', error);
      this.isLoading = false;
      this.hasError = true;
      this.errorMessage = error.message || 'Failed to initialize guided reflection';
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
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'guided-reflection-wrapper';
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', 'Guided value reflection');
      
      // Create header
      const header = this._createHeader();
      wrapper.appendChild(header);
      
      // Create content area
      const content = document.createElement('div');
      content.className = 'guided-reflection-content my-6';
      content.id = 'guided-reflection-content';
      
      // Show appropriate content based on state
      if (this.isLoading) {
        content.appendChild(this._createLoadingState());
      } else if (this.hasError) {
        content.appendChild(this._createErrorState());
      } else if (!this.valueId) {
        content.appendChild(this._createNoValueState());
      } else {
        content.appendChild(this._createContentPlaceholder());
      }
      
      wrapper.appendChild(content);
      
      // Create footer with navigation buttons
      const footer = this._createFooter();
      wrapper.appendChild(footer);
      
      // Add to container
      this.container.appendChild(wrapper);
      
      return this.container;
    } catch (error) {
      console.error('[GuidedReflectionBaseComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <p>There was a problem loading the guided reflection.</p>
          <button 
            class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onclick="window.location.reload()">
            Refresh Page
          </button>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Create header section
   * @private
   * @returns {HTMLElement} Header element
   */
  _createHeader() {
    const header = document.createElement('header');
    header.className = 'text-center mb-6';
    
    const title = document.createElement('h1');
    title.className = 'text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100';
    title.textContent = this.content.title;
    title.id = 'guided-reflection-title';
    
    const subtitle = document.createElement('p');
    subtitle.className = 'text-gray-600 dark:text-gray-400';
    subtitle.textContent = this.content.subtitle;
    
    header.appendChild(title);
    header.appendChild(subtitle);
    
    return header;
  }
  
  /**
   * Create footer with navigation buttons
   * @private
   * @returns {HTMLElement} Footer element
   */
  _createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'mt-8 flex justify-between';
    
    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    backButton.textContent = this.content.backButtonText;
    backButton.setAttribute('type', 'button');
    backButton.setAttribute('aria-label', 'Go back to results');
    backButton.addEventListener('click', () => this._handleBackClick());
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    nextButton.textContent = this.content.nextButtonText;
    nextButton.setAttribute('type', 'button');
    nextButton.setAttribute('aria-label', 'Save and continue');
    nextButton.addEventListener('click', () => this._handleNextClick());
    
    footer.appendChild(backButton);
    footer.appendChild(nextButton);
    
    return footer;
  }
  
  /**
   * Create loading state element
   * @private
   * @returns {HTMLElement} Loading element
   */
  _createLoadingState() {
    const loading = document.createElement('div');
    loading.className = 'flex flex-col items-center justify-center p-6';
    loading.setAttribute('role', 'status');
    loading.setAttribute('aria-live', 'polite');
    
    const spinner = document.createElement('div');
    spinner.className = 'w-12 h-12 border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500 rounded-full animate-spin mb-4';
    
    const message = document.createElement('p');
    message.className = 'text-gray-700 dark:text-gray-300';
    message.textContent = this.content.loadingMessage;
    
    loading.appendChild(spinner);
    loading.appendChild(message);
    
    return loading;
  }
  
  /**
   * Create error state element
   * @private
   * @returns {HTMLElement} Error element
   */
  _createErrorState() {
    const error = document.createElement('div');
    error.className = 'p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg';
    error.setAttribute('role', 'alert');
    
    const message = document.createElement('p');
    message.textContent = this.errorMessage || this.content.errorMessage;
    
    const retryButton = document.createElement('button');
    retryButton.className = 'mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    retryButton.textContent = 'Retry';
    retryButton.addEventListener('click', () => this.initialize().then(() => this.render()));
    
    error.appendChild(message);
    error.appendChild(retryButton);
    
    return error;
  }
  
  /**
   * Create no value selected state element
   * @private
   * @returns {HTMLElement} No value element
   */
  _createNoValueState() {
    const noValue = document.createElement('div');
    noValue.className = 'p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg';
    
    const message = document.createElement('p');
    message.textContent = this.content.noValueSelectedMessage;
    
    noValue.appendChild(message);
    
    return noValue;
  }
  
  /**
   * Create content placeholder
   * @private
   * @returns {HTMLElement} Content placeholder
   */
  _createContentPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'guided-reflection-placeholder p-4';
    placeholder.textContent = 'Guided reflection content will be rendered here by child components.';
    
    return placeholder;
  }
  
  /**
   * Handle back button click
   * @private
   */
  _handleBackClick() {
    if (this.service && typeof this.service.goToStep === 'function') {
      this.service.goToStep('results');
    }
    
    if (this.ui && this.ui.announce) {
      this.ui.announce('Returning to results page', 'polite');
    }
  }
  
  /**
   * Handle next button click
   * @private
   */
  _handleNextClick() {
    // To be implemented by child class
    console.log('Next button clicked, to be implemented by child class');
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
      console.error('[GuidedReflectionBaseComponent] Error checking premium status:', error);
      return false;
    }
  }
}

// Import dependencies
import { GuidedReflectionTemplate } from './guided-reflection-template.js';

// Export component
export { GuidedReflectionBaseComponent };
