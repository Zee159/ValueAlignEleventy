/**
 * Values Assessment Results Reflections Component
 * Displays the user's reflections on their top values
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class ResultsReflectionsComponent {
  /**
   * Create a results reflections component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.themeService = options.themeService || window.themeSystem;
    
    // State
    this.reflections = {};
    this.expandedReflections = {};
  }
  
  /**
   * Render the reflections section
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Get prioritized values and reflections from service
      const prioritizedValues = this.service?.prioritizedValues || [];
      this.reflections = this.service?.reflections || {};
      
      if (!prioritizedValues || prioritizedValues.length === 0) {
        // Show message if no values are prioritized
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded';
        emptyMessage.textContent = 'No values have been prioritized yet. Please complete the prioritization step first.';
        this.container.appendChild(emptyMessage);
        return this.container;
      }
      
      const hasReflections = Object.keys(this.reflections).length > 0;
      
      if (!hasReflections) {
        // Show message if no reflections
        const noReflectionsMessage = document.createElement('div');
        noReflectionsMessage.className = 'p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded';
        noReflectionsMessage.textContent = 'No reflections have been provided yet. Please complete the reflection step to see your thoughts here.';
        this.container.appendChild(noReflectionsMessage);
        return this.container;
      }
      
      // Create section introduction
      const intro = document.createElement('div');
      intro.className = 'mb-6';
      
      const introText = document.createElement('p');
      introText.className = 'text-gray-700 dark:text-gray-300';
      introText.textContent = 'Review your personal reflections on your top values:';
      
      intro.appendChild(introText);
      this.container.appendChild(intro);
      
      // Create reflections list
      const reflectionsList = document.createElement('div');
      reflectionsList.className = 'space-y-4';
      reflectionsList.setAttribute('aria-label', 'Your reflections on your values');
      
      // Filter to only values that have reflections
      const valuesWithReflections = prioritizedValues.filter(valueId => 
        this.reflections[valueId] && this.reflections[valueId].trim().length > 0
      );
      
      if (valuesWithReflections.length === 0) {
        const noReflectionsMessage = document.createElement('div');
        noReflectionsMessage.className = 'p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded';
        noReflectionsMessage.textContent = 'No reflections have been provided yet. Please complete the reflection step to see your thoughts here.';
        this.container.appendChild(noReflectionsMessage);
        return this.container;
      }
      
      // Create reflection items
      valuesWithReflections.forEach(valueId => {
        const reflectionItem = this._createReflectionItem(valueId);
        if (reflectionItem) {
          reflectionsList.appendChild(reflectionItem);
        }
      });
      
      // Add reflections list to container
      this.container.appendChild(reflectionsList);
      
      // If there are more values that don't have reflections yet
      if (valuesWithReflections.length < prioritizedValues.length) {
        const incompleteMessage = document.createElement('div');
        incompleteMessage.className = 'mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-sm';
        incompleteMessage.innerHTML = `
          <p>
            <svg class="inline-block w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            You have ${prioritizedValues.length - valuesWithReflections.length} more prioritized values that don't have reflections yet.
            <button class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 ml-1" id="add-more-reflections">
              Add more reflections
            </button>
          </p>
        `;
        
        const addMoreButton = incompleteMessage.querySelector('#add-more-reflections');
        addMoreButton.addEventListener('click', () => this._handleAddMoreReflections());
        
        this.container.appendChild(incompleteMessage);
      }
      
      return this.container;
    } catch (error) {
      console.error('[ResultsReflectionsComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          <p>There was a problem loading your reflections.</p>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Create a reflection item
   * @private
   * @param {string} valueId The ID of the value
   * @returns {HTMLElement} The reflection item element
   */
  _createReflectionItem(valueId) {
    // Find value data
    const valueData = this.valuesData.find(v => v.id === valueId);
    if (!valueData) return null;
    
    // Get reflection text
    const reflectionText = this.reflections[valueId] || '';
    if (!reflectionText || reflectionText.trim().length === 0) return null;
    
    // Create card
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between';
    
    const valueTitle = document.createElement('h3');
    valueTitle.className = 'font-medium text-gray-900 dark:text-gray-100';
    valueTitle.textContent = valueData.name;
    
    const expandButton = document.createElement('button');
    expandButton.className = 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
    expandButton.setAttribute('aria-label', `Toggle reflection for ${valueData.name}`);
    expandButton.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    `;
    expandButton.addEventListener('click', () => this._toggleReflection(valueId));
    
    header.appendChild(valueTitle);
    header.appendChild(expandButton);
    
    // Create body
    const body = document.createElement('div');
    body.className = 'p-4';
    body.id = `reflection-${valueId}`;
    
    // Determine if reflection should be truncated
    const isExpanded = this.expandedReflections[valueId] || false;
    const shouldTruncate = reflectionText.length > 200 && !isExpanded;
    
    // Create reflection text
    const reflectionContent = document.createElement('p');
    reflectionContent.className = 'text-gray-600 dark:text-gray-400 whitespace-pre-line';
    
    if (shouldTruncate) {
      reflectionContent.textContent = reflectionText.substring(0, 200) + '...';
      
      const readMoreButton = document.createElement('button');
      readMoreButton.className = 'text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 ml-1';
      readMoreButton.textContent = 'Read more';
      readMoreButton.addEventListener('click', () => this._toggleReflection(valueId));
      
      reflectionContent.appendChild(readMoreButton);
    } else {
      reflectionContent.textContent = reflectionText;
      
      // Only add "Read less" button if expanded and text is long
      if (isExpanded && reflectionText.length > 200) {
        const readLessButton = document.createElement('button');
        readLessButton.className = 'block mt-2 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500';
        readLessButton.textContent = 'Read less';
        readLessButton.addEventListener('click', () => this._toggleReflection(valueId));
        
        reflectionContent.appendChild(document.createElement('br'));
        reflectionContent.appendChild(readLessButton);
      }
    }
    
    body.appendChild(reflectionContent);
    
    // Assemble card
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
  }
  
  /**
   * Toggle reflection expansion
   * @private
   * @param {string} valueId The ID of the value
   */
  _toggleReflection(valueId) {
    // Toggle expanded state
    this.expandedReflections[valueId] = !this.expandedReflections[valueId];
    
    // Re-render the component
    this.render();
    
    // Announce for screen readers
    if (this.ui && this.ui.announce) {
      const valueData = this.valuesData.find(v => v.id === valueId);
      const valueName = valueData ? valueData.name : 'Value';
      const expanded = this.expandedReflections[valueId];
      
      const message = expanded 
        ? `${valueName} reflection expanded.` 
        : `${valueName} reflection collapsed.`;
        
      this.ui.announce(message, 'polite');
    }
    
    // Scroll to the reflection
    const reflectionElement = document.getElementById(`reflection-${valueId}`);
    if (reflectionElement) {
      reflectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  /**
   * Handle "Add more reflections" button click
   * @private
   */
  _handleAddMoreReflections() {
    if (!this.service) return;
    
    try {
      // Navigate to reflection step
      this.service.goToStep('reflection');
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('add_more_reflections_clicked');
      }
    } catch (error) {
      console.error('[ResultsReflectionsComponent] Add more reflections error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error navigating to reflection step. Please try again.', 'assertive');
      }
    }
  }
}

// Export the component
export { ResultsReflectionsComponent };
