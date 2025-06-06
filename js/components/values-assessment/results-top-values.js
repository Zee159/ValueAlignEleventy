/**
 * Values Assessment Results Top Values Component
 * Displays the user's top prioritized values with visuals and descriptions
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class ResultsTopValuesComponent {
  /**
   * Create a results top values component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.themeService = options.themeService || window.themeSystem;
    
    // Configuration
    this.topValuesCount = options.topValuesCount || 5;
    this.isPremiumUser = options.isPremiumUser || false;
  }
  
  /**
   * Render the top values section
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Get prioritized values from the service
      const prioritizedValues = this.service?.prioritizedValues || [];
      
      if (!prioritizedValues || prioritizedValues.length === 0) {
        // Show message if no values are prioritized
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded';
        emptyMessage.textContent = 'No values have been prioritized yet. Please complete the prioritization step first.';
        this.container.appendChild(emptyMessage);
        return this.container;
      }
      
      // Create section introduction
      const intro = document.createElement('div');
      intro.className = 'mb-6';
      
      const introText = document.createElement('p');
      introText.className = 'text-gray-700 dark:text-gray-300';
      introText.textContent = 'These are the values you identified as most important to you, in order of priority:';
      
      intro.appendChild(introText);
      this.container.appendChild(intro);
      
      // Create values list container
      const valuesList = document.createElement('div');
      valuesList.className = 'space-y-4';
      valuesList.setAttribute('aria-label', 'Your top prioritized values');
      
      // Get top values
      const topValues = prioritizedValues.slice(0, this.topValuesCount);
      
      // Create value items
      topValues.forEach((valueId, index) => {
        const valueItem = this._createValueItem(valueId, index);
        if (valueItem) {
          valuesList.appendChild(valueItem);
        }
      });
      
      // Add values list to container
      this.container.appendChild(valuesList);
      
      // Add a "View all values" link if there are more values
      if (prioritizedValues.length > this.topValuesCount) {
        const viewAllContainer = document.createElement('div');
        viewAllContainer.className = 'mt-4 text-center';
        
        const viewAllLink = document.createElement('button');
        viewAllLink.className = 'text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
        viewAllLink.textContent = `View all ${prioritizedValues.length} prioritized values`;
        viewAllLink.addEventListener('click', () => this._handleViewAllClick());
        
        viewAllContainer.appendChild(viewAllLink);
        this.container.appendChild(viewAllContainer);
      }
      
      return this.container;
    } catch (error) {
      console.error('[ResultsTopValuesComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          <p>There was a problem loading your top values.</p>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Create a value item
   * @private
   * @param {string} valueId The ID of the value
   * @param {number} index The index of the value (0-based)
   * @returns {HTMLElement} The value item element
   */
  _createValueItem(valueId, index) {
    // Find value data
    const valueData = this.valuesData.find(v => v.id === valueId);
    if (!valueData) return null;
    
    // Create card
    const card = document.createElement('div');
    card.className = 'flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700';
    
    // Create rank badge
    const rankBadge = document.createElement('div');
    rankBadge.className = 'w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold mr-4 flex-shrink-0';
    rankBadge.textContent = (index + 1).toString();
    rankBadge.setAttribute('aria-hidden', 'true');
    
    // Create content
    const content = document.createElement('div');
    content.className = 'flex-1';
    
    // Create name
    const name = document.createElement('h3');
    name.className = 'text-lg font-bold text-gray-900 dark:text-gray-100 mb-1';
    name.textContent = valueData.name;
    
    // Create description
    const description = document.createElement('p');
    description.className = 'text-gray-600 dark:text-gray-400';
    description.textContent = valueData.description;
    
    // Add premium insights if applicable
    if (this.isPremiumUser && valueData.insights) {
      const insightsContainer = document.createElement('div');
      insightsContainer.className = 'mt-2 pt-2 border-t border-gray-200 dark:border-gray-700';
      
      const insightsLabel = document.createElement('div');
      insightsLabel.className = 'text-sm font-medium text-purple-600 dark:text-purple-400 mb-1 flex items-center';
      insightsLabel.innerHTML = `
        <svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        AI Insight
      `;
      
      const insightsText = document.createElement('p');
      insightsText.className = 'text-sm text-gray-600 dark:text-gray-400';
      insightsText.textContent = valueData.insights;
      
      insightsContainer.appendChild(insightsLabel);
      insightsContainer.appendChild(insightsText);
      
      content.appendChild(insightsContainer);
    }
    
    // Assemble content
    content.appendChild(name);
    content.appendChild(description);
    
    // Assemble card
    card.appendChild(rankBadge);
    card.appendChild(content);
    
    return card;
  }
  
  /**
   * Handle "View all values" click
   * @private
   */
  _handleViewAllClick() {
    try {
      // Toggle between showing top values and all values
      this.topValuesCount = this.topValuesCount === 5 ? 999 : 5;
      
      // Re-render
      this.render();
      
      // Announce for screen readers
      if (this.ui && this.ui.announce) {
        const message = this.topValuesCount === 5 
          ? 'Showing top 5 values.' 
          : 'Showing all prioritized values.';
        this.ui.announce(message, 'polite');
      }
    } catch (error) {
      console.error('[ResultsTopValuesComponent] View all click error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error updating values display. Please try again.', 'assertive');
      }
    }
  }
}

// Export the component
export { ResultsTopValuesComponent };
