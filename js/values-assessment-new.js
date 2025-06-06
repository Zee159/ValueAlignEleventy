/**
 * Values Assessment - Main Entry Point
 * 
 * The main entry point for the values assessment application
 * Handles initialization of all services and components required for the assessment
 * 
 * Following ValueAlign development rules for authentication, theme management,
 * accessibility, and progressive enhancement
 */

class ValuesAssessment {
  /**
   * Create a values assessment instance
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.options = options;
    this.containerId = options.containerId || 'values-assessment-container';
    this.debug = options.debug || false;
    this.container = null;
    
    // Services from initializer
    this.initializer = null;
    this.coreService = null;
    this.storageService = null;
    this.aiService = null;
    this.exporterService = null;
    this.uiService = null;
    
    // Dependencies
    this.authService = options.authService || window.authService;
    this.themeService = options.themeService || window.themeSystem;
    this.valuesData = options.valuesData || window.valuesData || [];
    
    // State
    this.isInitialized = false;
    this.isInitializing = false;
    this.hasError = false;
    this.errorMessage = '';
    this.currentStep = '';
    this.previousStep = '';
    this.reflectionComponent = null;
    this.resultsComponent = null;
    this.nextStepsComponent = null;
    
    // Debug logging
    this._log('Values Assessment created');
  }
  
  /**
   * Initialize the values assessment
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        this._log('Already initialized');
        return true;
      }
      
      if (this.isInitializing) {
        this._log('Already initializing');
        return false;
      }
      
      this.isInitializing = true;
      this._log('Initializing values assessment');
      
      // Find container
      this.container = document.getElementById(this.containerId);
      if (!this.container) {
        throw new Error(`Container element with ID "${this.containerId}" not found`);
      }
      
      // Show loading indicator
      this._showLoadingIndicator();
      
      // Wait for auth service to be ready
      if (this.authService && typeof this.authService.isReady === 'function') {
        await this.authService.isReady();
      }
      
      // Wait for theme service to be ready
      if (this.themeService && typeof this.themeService.isReady === 'function') {
        await this.themeService.isReady();
      }
      
      // Create and initialize services
      this.initializer = new ValuesAssessmentInitializer({
        authService: this.authService,
        themeService: this.themeService,
        valuesData: this.valuesData,
        container: this.container,
        debug: this.debug
      });
      
      // Initialize all services
      const services = await this.initializer.initialize();
      
      // Store services
      this.coreService = services.coreService;
      this.storageService = services.storageService;
      this.aiService = services.aiService;
      this.exporterService = services.exporterService;
      this.uiService = services.uiService;
      
      // Setup event listeners
      this._setupEventListeners();
      
      // Render initial UI
      await this.uiService.render();
      
      // Set up steps navigation
      this._setupStepsNavigation();
      
      // Mark as initialized
      this.isInitialized = true;
      this.isInitializing = false;
      
      // Remove loading indicator
      this._hideLoadingIndicator();
      
      this._log('Values assessment initialized successfully');
      
      // Dispatch initialized event
      this._dispatchEvent('values-assessment-initialized');
      
      return true;
    } catch (error) {
      this.isInitializing = false;
      this.hasError = true;
      this.errorMessage = error.message || 'Unknown error during initialization';
      
      this._logError('Initialization failed', error);
      this._showErrorMessage();
      
      // Dispatch error event
      this._dispatchEvent('values-assessment-error', {
        error: error,
        message: this.errorMessage
      });
      
      return false;
    }
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Listen for theme changes
    if (this.themeService) {
      document.addEventListener('themechange', (event) => {
        if (this.uiService) {
          this.uiService.updateTheme(event.detail.theme);
        }
      });
    }
    
    // Listen for auth changes
    if (this.authService) {
      document.addEventListener('authchange', async (event) => {
        if (this.coreService) {
          await this.coreService.handleAuthChange(event.detail.isAuthenticated);
          
          // Re-render current step if any
          if (this.currentStep) {
            this._navigateToCurrentStep();
          }
        }
      });
    }
    
    // Window beforeunload - save progress
    window.addEventListener('beforeunload', () => {
      if (this.coreService && this.coreService.hasUnsavedChanges()) {
        this.coreService.saveProgress();
      }
    });
    
    // Listen for UI service events
    if (this.uiService && this.uiService.events) {
      this.uiService.events.addEventListener('results-ready', () => {
        this.showResults();
      });
      
      this.uiService.events.addEventListener('restart-assessment', () => {
        this.restartAssessment();
      });
    }
  }
  
  /**
   * Show a loading indicator in the container
   * @private
   */
  _showLoadingIndicator() {
    if (!this.container) return;
    
    // Create loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'values-assessment-loading';
    loadingEl.setAttribute('role', 'status');
    loadingEl.setAttribute('aria-live', 'polite');
    loadingEl.innerHTML = `
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading your values assessment...</p>
    `;
    
    // Add loading styles
    const style = document.createElement('style');
    style.textContent = `
      .values-assessment-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        padding: 2rem;
      }
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #3b82f6;
        animation: spinner 0.8s linear infinite;
        margin-bottom: 1rem;
      }
      .loading-text {
        color: #6b7280;
        font-size: 1rem;
      }
      @keyframes spinner {
        to { transform: rotate(360deg); }
      }
      .dark .loading-spinner {
        border-color: rgba(255, 255, 255, 0.1);
        border-top-color: #60a5fa;
      }
      .dark .loading-text {
        color: #9ca3af;
      }
    `;
    
    document.head.appendChild(style);
    this.container.appendChild(loadingEl);
  }
  
  /**
   * Hide the loading indicator
   * @private
   */
  _hideLoadingIndicator() {
    if (!this.container) return;
    
    const loadingEl = this.container.querySelector('.values-assessment-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
  }
  
  /**
   * Show error message in the container
   * @private
   */
  _showErrorMessage() {
    if (!this.container) return;
    
    // Clear container
    this.container.innerHTML = '';
    
    // Create error message
    const errorEl = document.createElement('div');
    errorEl.className = 'values-assessment-error p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg';
    errorEl.setAttribute('role', 'alert');
    
    const errorTitle = document.createElement('h2');
    errorTitle.className = 'font-bold text-lg mb-2';
    errorTitle.textContent = 'Error Loading Values Assessment';
    
    const errorMessage = document.createElement('p');
    errorMessage.className = 'mb-4';
    errorMessage.textContent = this.errorMessage || 'There was a problem loading the values assessment. Please try again.';
    
    const reloadButton = document.createElement('button');
    reloadButton.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    reloadButton.textContent = 'Reload';
    reloadButton.addEventListener('click', () => window.location.reload());
    
    errorEl.appendChild(errorTitle);
    errorEl.appendChild(errorMessage);
    errorEl.appendChild(reloadButton);
    
    this.container.appendChild(errorEl);
  }
  
  /**
   * Dispatch a custom event
   * @private
   * @param {string} eventName Event name
   * @param {Object} detail Event detail object
   */
  _dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: detail
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Log debug message
   * @private
   * @param {string} message Message to log
   */
  _log(message) {
    if (this.debug) {
      console.log(`[ValuesAssessment] ${message}`);
    }
  }
  
  /**
   * Internal debug logging method
   * @private
   * @param {string} message - Message to log
   * @param {Object} [data] - Optional data to log
   */
  _debug(message, data) {
    if (this.debug) {
      if (data) {
        console.debug(`[ValuesAssessment] ${message}`, data);
      } else {
        console.debug(`[ValuesAssessment] ${message}`);
      }
    }
  }
  
  /**
   * Log error message
   * @private
   * @param {string} message Error message
   * @param {Error} error Error object
   */
  _logError(message, error) {
    console.error(`[ValuesAssessment] ${message}:`, error);
  }

  /**
   * Show guided reflection view
   * @returns {Promise<boolean>} Whether the view was successfully shown
   */
  async showGuidedReflection() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      this._log('Showing guided reflection view');
      this.previousStep = this.currentStep;
      this.currentStep = 'guided-reflection';
      
      // Clear the container
      this.container.innerHTML = '';
      
      // Create reflection container
      const reflectionContainer = document.createElement('div');
      reflectionContainer.className = 'values-assessment-reflection';
      reflectionContainer.setAttribute('role', 'region');
      reflectionContainer.setAttribute('aria-label', 'Guided value reflection');
      
      // Add to main container
      this.container.appendChild(reflectionContainer);
      
      // Create and render the reflection component
      this.reflectionComponent = new GuidedReflectionViewComponent({
        ui: this.uiService,
        service: this.coreService,
        container: reflectionContainer,
        valuesData: this.valuesData,
        themeService: this.themeService,
        authService: this.authService,
        onNavigateBack: () => this.showResults(),
        onNavigateNext: () => this.showNextSteps()
      });
      
      await this.reflectionComponent.initialize();
      this.reflectionComponent.render();
      
      // Dispatch event
      this._dispatchEvent('values-assessment-step-changed', { 
        step: 'guided-reflection',
        previous: this.previousStep 
      });
      
      return true;
    } catch (error) {
      this._logError('Error showing guided reflection', error);
      return false;
    }
  }

  /**
   * Show results view
   * @returns {Promise<boolean>} Whether the view was successfully shown
   */
  async showResults() {
    try {
      this._debug('Showing results');
      this.previousStep = this.currentStep;
      this.currentStep = 'results';
      
      // Clear container
      this.container.innerHTML = '';
      
      // Create results container if needed
      if (!this.resultsContainer) {
        this.resultsContainer = document.createElement('div');
        this.resultsContainer.className = 'values-results';
        this.resultsContainer.setAttribute('id', 'values-results-container');
      }
      
      // Add results container to main container
      this.container.appendChild(this.resultsContainer);
      
      // Track page view
      if (window.analytics) {
        window.analytics.page('values_results', {
          title: 'Values Assessment Results'
        });
      }
      
      // Clean up previous component if it exists
      if (this.resultsComponent) {
        if (typeof this.resultsComponent.destroy === 'function') {
          this.resultsComponent.destroy();
        }
        this.resultsComponent = null;
      }
      
      // Initialize the ResultsViewComponent
      this.resultsComponent = new ResultsViewComponent({
        container: this.resultsContainer,
        service: this.service,
        ui: this.uiService,
        valuesData: window.valuesData,
        themeService: window.themeSystem,
        authService: window.authService,
        debug: this.debug,
        onContinueToReflection: () => this.showGuidedReflection(),
        onRestartAssessment: () => this.restartAssessment()
      });
      
      // Initialize and render the component
      this.resultsComponent.initialize().then(() => {
        this.resultsComponent.render();
      });
      
      // Dispatch step change event
      this._dispatchStepChangeEvent('results');
      
    } catch (error) {
      this._logError('Error showing results', error);
      
      // Show error UI
      if (this.resultsContainer) {
        this.resultsContainer.innerHTML = `
          <div class="p-6 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
            <h2 class="text-lg font-bold mb-2">Error Loading Results</h2>
            <p class="mb-4">${error.message || 'An unknown error occurred'}</p>
            <button 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onclick="window.location.reload()">
              Refresh Page
            </button>
          </div>
        `;
      }
    }
  }

  /**
   * Show next steps view
   * @returns {Promise<boolean>} Whether the view was successfully shown
   */
  async showNextSteps() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      this._log('Showing next steps view');
      this.previousStep = this.currentStep;
      this.currentStep = 'next-steps';
      
      // Clear the container
      this.container.innerHTML = '';
      
      // Create next steps container
      const nextStepsContainer = document.createElement('div');
      nextStepsContainer.className = 'values-assessment-next-steps';
      nextStepsContainer.setAttribute('role', 'region');
      nextStepsContainer.setAttribute('aria-label', 'Next steps based on your values');
      
      // Add to main container
      this.container.appendChild(nextStepsContainer);
      
      // Create and render the next steps component
      this.nextStepsComponent = new NextStepsViewComponent({
        ui: this.uiService,
        service: this.coreService,
        container: nextStepsContainer,
        valuesData: this.valuesData,
        themeService: this.themeService,
        authService: this.authService,
        onNavigateBack: () => this.showGuidedReflection(),
        onRestartAssessment: () => this.restartAssessment(),
        onExportAssessment: (data) => this._handleExportAssessment(data)
      });
      
      await this.nextStepsComponent.initialize();
      this.nextStepsComponent.render();
      
      // Dispatch event
      this._dispatchEvent('values-assessment-step-changed', { 
        step: 'next-steps',
        previous: this.previousStep 
      });
      
      return true;
    } catch (error) {
      this._logError('Error showing next steps', error);
      return false;
    }
  }
  
  /**
   * Set up steps navigation
   * @private
   */
  _setupStepsNavigation() {
    try {
      // Add navigation to core service events if available
      if (this.coreService && this.coreService.events) {
        this.coreService.events.addEventListener('assessment-completed', () => {
          this.showResults();
        });
      }
    } catch (error) {
      this._logError('Error setting up steps navigation', error);
    }
  }
  
  /**
   * Navigate to the current step based on state
   * @private
   */
  _navigateToCurrentStep() {
    try {
      switch (this.currentStep) {
        case 'results':
          this.showResults();
          break;
        case 'guided-reflection':
          this.showGuidedReflection();
          break;
        case 'next-steps':
          this.showNextSteps();
          break;
        default:
          // If no specific step, let the UI service handle initial rendering
          this.uiService.render();
      }
    } catch (error) {
      this._logError('Error navigating to current step', error);
    }
  }

  /**
   * Restart the assessment
   * @returns {Promise<boolean>} Whether the assessment was successfully restarted
   */
  async restartAssessment() {
    try {
      this._log('Restarting assessment');
      
      // Clear current state
      this.currentStep = '';
      this.previousStep = '';
      
      // Reset core service if available
      if (this.coreService && typeof this.coreService.resetAssessment === 'function') {
        await this.coreService.resetAssessment();
      }
      
      // Reinitialize UI
      if (this.uiService) {
        await this.uiService.render();
      }
      
      // Dispatch event
      this._dispatchEvent('values-assessment-restarted');
      
      return true;
    } catch (error) {
      this._logError('Error restarting assessment', error);
      return false;
    }
  }
  
  /**
   * Handle export assessment data
   * @private
   * @param {Object} data Assessment data to export
   */
  _handleExportAssessment(data) {
    try {
      this._log('Handling assessment export');
      
      // Create the export data structure
      const exportData = {
        date: new Date().toISOString(),
        prioritizedValues: data.prioritizedValues || [],
        reflectionResponses: data.userResponses || {}
      };
      
      // Convert to JSON string with nice formatting
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Create a Blob with the JSON data
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `values-assessment-${new Date().toISOString().split('T')[0]}.json`;
      
      // Add link to document, click it, and remove it
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Track analytics
      if (window.analytics) {
        window.analytics.track('assessment_exported', {
          valueCount: exportData.prioritizedValues.length,
          hasReflections: Object.keys(exportData.reflectionResponses).length > 0
        });
      }
      
      return true;
    } catch (error) {
      this._logError('Error exporting assessment data', error);
      return false;
    }
  }
  
  /**
   * Navigate to a specific step in the assessment
   * @param {string} stepName Name of the step to navigate to
   * @returns {Promise<boolean>} Whether navigation was successful
   */
  async navigateToStep(stepName) {
    try {
      if (!stepName) {
        throw new Error('Step name is required');
      }
      
      this._log(`Navigating to step: ${stepName}`);
      
      // Ensure services are initialized
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Handle navigation based on step name
      switch (stepName) {
        case 'results':
          return this.showResults();
        case 'reflection':
        case 'guided-reflection':
          return this.showGuidedReflection();
        case 'next-steps':
          return this.showNextSteps();
        case 'restart':
          return this.restartAssessment();
        default:
          // For other steps, delegate to UI service
          if (this.uiService && typeof this.uiService.showStep === 'function') {
            return this.uiService.showStep(stepName);
          }
          throw new Error(`Unknown step: ${stepName}`);
      }
    } catch (error) {
      this._logError(`Error navigating to step: ${stepName}`, error);
      
      // Show error message to user
      if (this.uiService && typeof this.uiService.announce === 'function') {
        this.uiService.announce(`There was an error navigating to ${stepName}. Please try again.`, 'assertive');
      }
      
      return false;
    }
  }
}

// Import dependencies
import { ValuesAssessmentInitializer } from './services/values-assessment/values-assessment-initializer.js';
import { GuidedReflectionViewComponent } from './components/values-assessment/guided-reflection-view.js';
import { ResultsViewComponent } from './components/values-assessment/results-view.js';
import { NextStepsViewComponent } from './components/values-assessment/next-steps-view.js';
import { ResultsMainComponent } from './components/values-assessment/results-main.js';

// Add global initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Check if auto-initialization is enabled
  const container = document.getElementById('values-assessment-container');
  if (container && container.hasAttribute('data-auto-init')) {
    const valuesAssessment = new ValuesAssessment({
      debug: container.hasAttribute('data-debug')
    });
    
    await valuesAssessment.initialize();
  }
});

// Export the class and additional components
export { ValuesAssessment };
export { GuidedReflectionViewComponent } from './components/values-assessment/guided-reflection-view.js';
export { ResultsMainComponent } from './components/values-assessment/results-main.js';
export { NextStepsViewComponent } from './components/values-assessment/next-steps-view.js';
