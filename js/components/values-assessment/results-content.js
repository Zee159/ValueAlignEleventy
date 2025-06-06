/**
 * Results Content Component
 * Displays values assessment results with sorted value cards
 * 
 * Following ValueAlign development rules for accessibility, theme integration, 
 * and progressive enhancement
 */

import { ResultsValueCardComponent } from './results-value-card.js';

class ResultsContentComponent {
  /**
   * Create a results content component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.container = options.container;
    this.assessmentResults = options.assessmentResults || {};
    this.valuesData = options.valuesData || window.valuesData || [];
    this.isPremiumUser = options.isPremiumUser || false;
    this.currentTheme = options.currentTheme || 'light';
    this.debug = options.debug || false;
    
    // Callbacks
    this.onValueSelect = options.onValueSelect || (() => {});
    
    // State
    this.isInitialized = false;
    this.values = [];
    
    this._debug('Content component created');
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
      
      this._debug('Initializing content component');
      
      // Process assessment results into values array
      this.values = this._processAssessmentResults();
      
      this.isInitialized = true;
      this._debug('Content component initialized');
      return true;
    } catch (error) {
      console.error('[ResultsContentComponent] Initialization error:', error);
      return false;
    }
  }
  
  /**
   * Process assessment results into sorted values array
   * @private
   * @returns {Array} Sorted values array
   */
  _processAssessmentResults() {
    try {
      if (!this.assessmentResults || !this.assessmentResults.values) {
        this._debug('No assessment results to process');
        return [];
      }
      
      // Convert values object to array with IDs
      const valuesArray = Object.entries(this.assessmentResults.values).map(([id, score]) => {
        return { id, score };
      });
      
      // Add additional value data from valuesData
      const enrichedValues = valuesArray.map(value => {
        const fullData = this.valuesData.find(v => v.id === value.id) || {};
        return { ...value, ...fullData };
      });
      
      // Sort by score in descending order
      const sortedValues = enrichedValues.sort((a, b) => {
        // Handle cases where score might be missing
        const scoreA = typeof a.score === 'number' ? a.score : 0;
        const scoreB = typeof b.score === 'number' ? b.score : 0;
        return scoreB - scoreA;
      });
      
      return sortedValues;
    } catch (error) {
      console.error('[ResultsContentComponent] Error processing results:', error);
      return [];
    }
  }
  
  /**
   * Render the component
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) {
      this._debug('No container provided for rendering');
      return null;
    }
    
    try {
      // Initialize if not already done
      if (!this.isInitialized) {
        this.initialize().then(() => {
          if (this.isInitialized) {
            this.render();
          }
        });
        
        // Show loading state
        this._renderLoadingState();
        return this.container;
      }
      
      // Clear container
      this.container.innerHTML = '';
      
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'results-values-container';
      
      // Show top values heading
      const heading = document.createElement('h3');
      heading.className = 'text-lg font-medium text-gray-800 dark:text-gray-200 mb-4';
      heading.textContent = `Your ${this.isPremiumUser ? 'Top Values' : 'Top 3 Values'}`;
      wrapper.appendChild(heading);
      
      // Create values list wrapper
      const valuesList = document.createElement('div');
      valuesList.className = 'values-list';
      valuesList.setAttribute('role', 'list');
      valuesList.setAttribute('aria-label', 'Your prioritized values');
      
      // Create value cards
      const valuesToShow = this._getValuesToDisplay();
      
      if (valuesToShow.length === 0) {
        this._renderEmptyState(valuesList);
      } else {
        valuesToShow.forEach((value, index) => {
          const cardComponent = new ResultsValueCardComponent({
            value,
            index,
            isPremiumUser: this.isPremiumUser,
            valuesData: this.valuesData,
            currentTheme: this.currentTheme,
            debug: this.debug,
            onClick: (valueData) => this.onValueSelect(valueData)
          });
          
          const cardElement = cardComponent.render();
          if (cardElement) {
            valuesList.appendChild(cardElement);
          }
        });
      }
      
      wrapper.appendChild(valuesList);
      
      // Add premium upsell if not premium
      if (!this.isPremiumUser && this.values.length > 3) {
        const upsell = this._createPremiumUpsell();
        wrapper.appendChild(upsell);
      }
      
      this.container.appendChild(wrapper);
      
      return this.container;
    } catch (error) {
      console.error('[ResultsContentComponent] Render error:', error);
      this._renderErrorState(error);
      return this.container;
    }
  }
  
  /**
   * Get the values to display based on premium status
   * @private
   * @returns {Array} Values to display
   */
  _getValuesToDisplay() {
    // Premium users see all values, non-premium see top 3
    return this.isPremiumUser ? this.values : this.values.slice(0, 3);
  }
  
  /**
   * Render empty state when no values are available
   * @private
   * @param {HTMLElement} container Container to render into
   */
  _renderEmptyState(container) {
    const emptyState = document.createElement('div');
    emptyState.className = 'bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center';
    emptyState.innerHTML = `
      <p class="text-gray-500 dark:text-gray-400">No values data available.</p>
      <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
        Start Assessment
      </button>
    `;
    
    // Add click handler to restart button
    const restartButton = emptyState.querySelector('button');
    if (restartButton) {
      restartButton.addEventListener('click', () => {
        if (typeof window.restartAssessment === 'function') {
          window.restartAssessment();
        } else {
          window.location.reload();
        }
      });
    }
    
    container.appendChild(emptyState);
  }
  
  /**
   * Create premium upsell section
   * @private
   * @returns {HTMLElement} Premium upsell element
   */
  _createPremiumUpsell() {
    const upsellContainer = document.createElement('div');
    upsellContainer.className = 'mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800';
    
    const upsellContent = document.createElement('div');
    upsellContent.className = 'flex items-start';
    
    // Premium badge
    const badge = document.createElement('div');
    badge.className = 'flex-shrink-0 mr-3';
    badge.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-blue-600 dark:text-blue-400">
        <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd" />
      </svg>
    `;
    
    // Upsell text
    const text = document.createElement('div');
    text.className = 'flex-1';
    
    const heading = document.createElement('h4');
    heading.className = 'text-sm font-medium text-blue-800 dark:text-blue-300';
    heading.textContent = 'Unlock All Your Values';
    
    const description = document.createElement('p');
    description.className = 'text-sm text-blue-700 dark:text-blue-400 mt-1';
    description.textContent = `Upgrade to premium to see all ${this.values.length} of your values and get access to guided reflection exercises.`;
    
    // Upgrade button
    const upgradeBtn = document.createElement('button');
    upgradeBtn.type = 'button';
    upgradeBtn.className = 'mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    upgradeBtn.textContent = 'Upgrade to Premium';
    
    // Add click handler for upgrade
    upgradeBtn.addEventListener('click', () => this._handleUpgradeClick());
    
    // Assemble the components
    text.appendChild(heading);
    text.appendChild(description);
    text.appendChild(upgradeBtn);
    
    upsellContent.appendChild(badge);
    upsellContent.appendChild(text);
    
    upsellContainer.appendChild(upsellContent);
    
    return upsellContainer;
  }
  
  /**
   * Handle upgrade button click
   * @private
   */
  _handleUpgradeClick() {
    this._debug('Upgrade clicked');
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('premium_upsell', {
        source: 'values_results',
        action: 'click_upgrade'
      });
    }
    
    // Navigate to subscription page
    window.location.href = '/dashboard/settings/subscription/';
  }
  
  /**
   * Render loading state
   * @private
   */
  _renderLoadingState() {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center p-6">
        <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p class="text-gray-700 dark:text-gray-300">Loading your values...</p>
      </div>
    `;
  }
  
  /**
   * Render error state
   * @private
   * @param {Error} [error] Optional error object
   */
  _renderErrorState(error) {
    const errorMessage = error?.message || 'An unknown error occurred';
    
    this.container.innerHTML = `
      <div class="p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
        <h3 class="font-medium">Error Loading Values</h3>
        <p class="text-sm mt-1">${errorMessage}</p>
      </div>
    `;
  }
  
  /**
   * Log debug message if debugging is enabled
   * @private
   * @param {string} message Debug message
   */
  _debug(message) {
    if (this.debug) {
      console.log(`[ResultsContentComponent] ${message}`);
    }
  }
}

// Export the component
export { ResultsContentComponent };
