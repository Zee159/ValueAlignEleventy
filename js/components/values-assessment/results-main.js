/**
 * Values Assessment Results Main Component
 * Integrates all results sub-components into a complete results view
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class ResultsMainComponent {
  /**
   * Create a results main component
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
    
    // Component instances
    this.summaryComponent = null;
    this.topValuesComponent = null;
    this.reflectionsComponent = null;
    this.nextStepsComponent = null;
    
    // Component containers
    this.summaryContainer = null;
    this.topValuesContainer = null;
    this.reflectionsContainer = null;
    this.nextStepsContainer = null;
    
    // Content
    this.content = {
      title: 'Your Values Assessment',
      description: 'Review your personalized values assessment results.',
      exportButtonText: 'Export as PDF',
      startOverButtonText: 'Start Over',
      summaryTitle: 'Summary',
      topValuesTitle: 'Your Top Values',
      reflectionsTitle: 'Your Reflections',
      nextStepsTitle: 'Next Steps'
    };
  }
  
  /**
   * Render the complete results screen
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Create header section
      const header = document.createElement('header');
      header.className = 'mb-6';
      
      const heading = document.createElement('h1');
      heading.className = 'text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100';
      heading.textContent = this.content.title;
      heading.id = 'results-heading';
      
      const description = document.createElement('p');
      description.className = 'text-gray-700 dark:text-gray-300';
      description.textContent = this.content.description;
      
      header.appendChild(heading);
      header.appendChild(description);
      
      // Create action buttons
      const actionButtons = document.createElement('div');
      actionButtons.className = 'flex flex-wrap gap-2 mb-8';
      
      const exportButton = document.createElement('button');
      exportButton.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center';
      exportButton.setAttribute('type', 'button');
      exportButton.setAttribute('aria-label', 'Export assessment as PDF');
      exportButton.innerHTML = `
        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        ${this.content.exportButtonText}
      `;
      exportButton.addEventListener('click', () => this._handleExport());
      
      const startOverButton = document.createElement('button');
      startOverButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      startOverButton.setAttribute('type', 'button');
      startOverButton.setAttribute('aria-label', 'Start the assessment over');
      startOverButton.textContent = this.content.startOverButtonText;
      startOverButton.addEventListener('click', () => this._handleStartOver());
      
      actionButtons.appendChild(exportButton);
      actionButtons.appendChild(startOverButton);
      
      // Create section containers
      this.summaryContainer = this._createSection(this.content.summaryTitle, 'summary');
      this.topValuesContainer = this._createSection(this.content.topValuesTitle, 'top-values');
      this.reflectionsContainer = this._createSection(this.content.reflectionsTitle, 'reflections');
      this.nextStepsContainer = this._createSection(this.content.nextStepsTitle, 'next-steps');
      
      // Assemble the page
      this.container.appendChild(header);
      this.container.appendChild(actionButtons);
      this.container.appendChild(this.summaryContainer);
      this.container.appendChild(this.topValuesContainer);
      this.container.appendChild(this.reflectionsContainer);
      this.container.appendChild(this.nextStepsContainer);
      
      // Initialize sub-components
      this._initializeComponents();
      
      // Announce for screen readers
      if (this.ui && this.ui.announce) {
        this.ui.announce('Assessment results page loaded. Your values assessment results are displayed below.', 'polite');
      }
      
      return this.container;
    } catch (error) {
      console.error('[ResultsMainComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <h2 class="font-bold">Error</h2>
          <p>There was a problem loading the assessment results.</p>
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
   * Create a section container
   * @private
   * @param {string} title Section title
   * @param {string} id Section ID
   * @returns {HTMLElement} Section container
   */
  _createSection(title, id) {
    const section = document.createElement('section');
    section.className = 'mb-12';
    section.setAttribute('aria-labelledby', `${id}-heading`);
    
    const heading = document.createElement('h2');
    heading.id = `${id}-heading`;
    heading.className = 'text-xl font-bold mb-4 text-gray-900 dark:text-gray-100';
    heading.textContent = title;
    
    const content = document.createElement('div');
    content.id = `${id}-content`;
    
    section.appendChild(heading);
    section.appendChild(content);
    
    return section;
  }
  
  /**
   * Initialize sub-components
   * @private
   */
  _initializeComponents() {
    // Summary component
    this.summaryComponent = new ResultsSummaryComponent({
      ui: this.ui,
      service: this.service,
      container: this.summaryContainer.querySelector('#summary-content'),
      valuesData: this.valuesData,
      isPremiumUser: this.isPremiumUser,
      themeService: this.themeService,
      authService: this.authService
    });
    this.summaryComponent.render();
    
    // Top values component
    this.topValuesComponent = new ResultsTopValuesComponent({
      ui: this.ui,
      service: this.service,
      container: this.topValuesContainer.querySelector('#top-values-content'),
      valuesData: this.valuesData,
      isPremiumUser: this.isPremiumUser,
      themeService: this.themeService
    });
    this.topValuesComponent.render();
    
    // Reflections component
    this.reflectionsComponent = new ResultsReflectionsComponent({
      ui: this.ui,
      service: this.service,
      container: this.reflectionsContainer.querySelector('#reflections-content'),
      valuesData: this.valuesData,
      themeService: this.themeService
    });
    this.reflectionsComponent.render();
    
    // Next steps component
    this.nextStepsComponent = new ResultsNextStepsBasicComponent({
      ui: this.ui,
      service: this.service,
      container: this.nextStepsContainer.querySelector('#next-steps-content'),
      isPremiumUser: this.isPremiumUser
    });
    this.nextStepsComponent.render();
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
      console.error('[ResultsMainComponent] Error checking premium status:', error);
      return false;
    }
  }
  
  /**
   * Handle export button click
   * @private
   */
  _handleExport() {
    if (!this.service) return;
    
    try {
      // Call export method from service
      this.service.exportAssessment();
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('assessment_export_clicked', {
          isPremium: this.isPremiumUser
        });
      }
    } catch (error) {
      console.error('[ResultsMainComponent] Export error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error exporting assessment. Please try again.', 'assertive');
      }
    }
  }
  
  /**
   * Handle start over button click
   * @private
   */
  _handleStartOver() {
    if (!this.service) return;
    
    try {
      // Show confirmation dialog
      if (confirm('Are you sure you want to start over? This will reset your assessment progress.')) {
        // Reset assessment
        this.service.resetAssessment();
        
        // Go to introduction step
        this.service.goToStep('introduction');
        
        // Log analytics event
        if (window.analytics) {
          window.analytics.track('assessment_reset');
        }
      }
    } catch (error) {
      console.error('[ResultsMainComponent] Start over error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error resetting assessment. Please try again.', 'assertive');
      }
    }
  }
}

// Import dependencies
import { ResultsSummaryComponent } from './results-summary.js';
import { ResultsTopValuesComponent } from './results-top-values.js';
import { ResultsReflectionsComponent } from './results-reflections.js';
import { ResultsNextStepsBasicComponent } from './results-next-steps-basic.js';

// Export the component
export { ResultsMainComponent };
