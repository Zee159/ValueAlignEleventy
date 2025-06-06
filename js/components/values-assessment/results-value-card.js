/**
 * Results Value Card Component
 * Displays an individual value with score, description, and premium features
 * 
 * Following ValueAlign development rules for accessibility, theme integration, 
 * and progressive enhancement
 */

class ResultsValueCardComponent {
  /**
   * Create a results value card component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    // Required parameters
    this.value = options.value || {}; // Value data object
    this.container = options.container; // Container element
    this.index = options.index || 0; // Position in the list
    
    // Optional parameters
    this.debug = options.debug || false;
    this.isPremiumUser = options.isPremiumUser || false;
    this.onClick = options.onClick || (() => {});
    this.valuesData = options.valuesData || window.valuesData || [];
    this.currentTheme = options.currentTheme || 'light';
    
    // Load full value data if available
    this.fullValueData = this._getFullValueData();
    
    this._debug('Value card created');
  }
  
  /**
   * Get the full value data from global values data
   * @private
   * @returns {Object} Complete value data object
   */
  _getFullValueData() {
    try {
      if (!this.value || !this.value.id) {
        return this.value;
      }
      
      // If we have valuesData, try to find the full value data
      if (Array.isArray(this.valuesData)) {
        const fullData = this.valuesData.find(v => v.id === this.value.id);
        if (fullData) {
          return { ...this.value, ...fullData };
        }
      }
      
      return this.value;
    } catch (error) {
      console.error('[ResultsValueCardComponent] Error getting full value data:', error);
      return this.value;
    }
  }
  
  /**
   * Render the value card
   * @returns {HTMLElement} Rendered card element
   */
  render() {
    try {
      if (!this.value) {
        console.warn('[ResultsValueCardComponent] No value data provided');
        return null;
      }
      
      const { id, name, description, score } = this.fullValueData;
      
      // Create card container
      const card = document.createElement('div');
      card.className = 'value-card mb-4 p-4 border rounded-lg bg-white dark:bg-gray-750 border-gray-100 dark:border-gray-700 shadow-sm';
      card.setAttribute('data-value-id', id || '');
      card.setAttribute('role', 'listitem');
      
      // Header with rank and score
      const header = this._createCardHeader();
      
      // Value name and description
      const content = this._createCardContent();
      
      // Actions area (premium features)
      const actions = this._createCardActions();
      
      // Add sections to card
      card.appendChild(header);
      card.appendChild(content);
      
      // Only add actions if we're premium or there are actions
      if (actions) {
        card.appendChild(actions);
      }
      
      // Make the whole card clickable
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking a button inside the card
        if (e.target.tagName !== 'BUTTON') {
          this._handleCardClick();
        }
      });
      
      // Add keyboard accessibility
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._handleCardClick();
        }
      });
      
      return card;
    } catch (error) {
      console.error('[ResultsValueCardComponent] Error rendering value card:', error);
      return null;
    }
  }
  
  /**
   * Create the card header with rank and score
   * @private
   * @returns {HTMLElement} Card header element
   */
  _createCardHeader() {
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-2';
    
    // Rank indicator (left)
    const rank = document.createElement('div');
    rank.className = 'rounded-full w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium';
    rank.textContent = (this.index + 1).toString();
    
    // Score indicator (right)
    const score = document.createElement('div');
    score.className = 'text-sm font-medium text-gray-600 dark:text-gray-300';
    
    // Format score as percentage if it's a number
    const scoreValue = this.fullValueData.score;
    if (typeof scoreValue === 'number') {
      const percentage = Math.round(scoreValue * 100);
      score.textContent = `${percentage}%`;
    } else {
      score.textContent = scoreValue || 'N/A';
    }
    
    header.appendChild(rank);
    header.appendChild(score);
    
    return header;
  }
  
  /**
   * Create the card content with name and description
   * @private
   * @returns {HTMLElement} Card content element
   */
  _createCardContent() {
    const content = document.createElement('div');
    content.className = 'mb-3';
    
    // Value name
    const name = document.createElement('h3');
    name.className = 'font-medium text-lg text-gray-900 dark:text-gray-100';
    name.textContent = this.fullValueData.name || 'Unnamed Value';
    
    // Value description
    const description = document.createElement('p');
    description.className = 'text-sm text-gray-600 dark:text-gray-300 mt-1';
    description.textContent = this.fullValueData.description || '';
    
    content.appendChild(name);
    content.appendChild(description);
    
    return content;
  }
  
  /**
   * Create card actions (premium features)
   * @private
   * @returns {HTMLElement|null} Card actions element or null if not applicable
   */
  _createCardActions() {
    // Only show actions for premium users or if explicitly configured
    if (!this.isPremiumUser) {
      return null;
    }
    
    const actions = document.createElement('div');
    actions.className = 'pt-3 mt-2 border-t border-gray-100 dark:border-gray-700';
    
    // Learn more / view details button
    const learnBtn = document.createElement('button');
    learnBtn.type = 'button';
    learnBtn.className = 'text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1';
    learnBtn.textContent = 'Learn more';
    learnBtn.setAttribute('aria-label', `Learn more about ${this.fullValueData.name}`);
    
    // Add click handler that stops propagation
    learnBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._handleLearnMoreClick();
    });
    
    actions.appendChild(learnBtn);
    
    return actions;
  }
  
  /**
   * Handle clicking the learn more button
   * @private
   */
  _handleLearnMoreClick() {
    this._debug('Learn more clicked');
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('value_card_action', {
        action: 'learn_more',
        value_id: this.fullValueData.id,
        value_name: this.fullValueData.name
      });
    }
    
    // If we have a modal or details page, open it here
    // For now, just log that this would be implemented
    console.log(`[ValueAlign] Would show details for value: ${this.fullValueData.name}`);
  }
  
  /**
   * Handle clicking the card itself
   * @private
   */
  _handleCardClick() {
    this._debug('Card clicked');
    
    // Track analytics event
    if (window.analytics) {
      window.analytics.track('value_card_action', {
        action: 'select',
        value_id: this.fullValueData.id,
        value_name: this.fullValueData.name
      });
    }
    
    // Call the onClick handler if provided
    if (typeof this.onClick === 'function') {
      this.onClick(this.fullValueData);
    }
  }
  
  /**
   * Log debug message if debugging is enabled
   * @private
   * @param {string} message Debug message
   */
  _debug(message) {
    if (this.debug) {
      console.log(`[ResultsValueCardComponent] ${message}`);
    }
  }
}

// Export the component
export { ResultsValueCardComponent };
