/**
 * Guided Reflection Value Selector Component
 * Allows users to select which value they want to reflect on
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class GuidedReflectionSelectorComponent {
  /**
   * Create a guided reflection selector component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.themeService = options.themeService || window.themeSystem;
    
    // Configuration
    this.onValueSelect = options.onValueSelect || (() => {});
    this.currentValueId = options.currentValueId || null;
    this.maxDisplayed = options.maxDisplayed || 5;
    this.showAllValues = options.showAllValues || false;
    
    // State
    this.isExpanded = false;
    
    // Content
    this.content = {
      title: 'Select a Value to Reflect On',
      showMoreButtonText: 'Show All Values',
      showLessButtonText: 'Show Top Values',
      noPrioritizedMessage: 'No values have been prioritized yet.',
      prioritizedValuesHeading: 'Your Top Values',
      allValuesHeading: 'All Values'
    };
  }
  
  /**
   * Initialize the component
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      // Nothing complex to initialize in this component
      return true;
    } catch (error) {
      console.error('[GuidedReflectionSelectorComponent] Initialization error:', error);
      return false;
    }
  }
  
  /**
   * Render the selector component
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Get prioritized values
      const prioritizedValues = this._getPrioritizedValues();
      const hasValues = prioritizedValues && prioritizedValues.length > 0;
      
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'guided-reflection-selector bg-white dark:bg-gray-800 rounded-lg shadow p-6';
      
      // Create header
      const header = document.createElement('header');
      header.className = 'mb-4';
      
      const title = document.createElement('h2');
      title.className = 'text-lg font-medium text-gray-900 dark:text-gray-100';
      title.textContent = this.content.title;
      
      header.appendChild(title);
      wrapper.appendChild(header);
      
      // Create value selector
      if (hasValues) {
        const valueSelector = this._createValueSelector(prioritizedValues);
        wrapper.appendChild(valueSelector);
      } else {
        const emptyState = this._createEmptyState();
        wrapper.appendChild(emptyState);
      }
      
      // Add to container
      this.container.appendChild(wrapper);
      
      return this.container;
    } catch (error) {
      console.error('[GuidedReflectionSelectorComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <p>There was a problem loading the value selector.</p>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Set the current value ID
   * @param {string} valueId Value ID to set as current
   */
  setCurrentValueId(valueId) {
    if (this.currentValueId === valueId) return;
    
    this.currentValueId = valueId;
    
    // Re-render to update the UI
    this.render();
  }
  
  /**
   * Toggle expanded/collapsed state
   */
  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
    this.render();
    
    // Announce for screen readers
    if (this.ui && this.ui.announce) {
      const message = this.isExpanded ? 'Showing all values.' : 'Showing top values only.';
      this.ui.announce(message, 'polite');
    }
  }
  
  /**
   * Create value selector UI
   * @private
   * @param {Array<string>} prioritizedValues Array of prioritized value IDs
   * @returns {HTMLElement} Value selector element
   */
  _createValueSelector(prioritizedValues) {
    const container = document.createElement('div');
    
    // Determine which values to show
    const displayedValues = this.isExpanded
      ? this._getAllValuesGrouped(prioritizedValues)
      : this._getTopValues(prioritizedValues);
    
    // Create prioritized values section
    if (displayedValues.prioritized && displayedValues.prioritized.length > 0) {
      const prioritizedSection = this._createValueSection(
        this.content.prioritizedValuesHeading,
        displayedValues.prioritized,
        'prioritized'
      );
      container.appendChild(prioritizedSection);
    }
    
    // Create all values section if expanded
    if (this.isExpanded && displayedValues.other && displayedValues.other.length > 0) {
      const allValuesSection = this._createValueSection(
        this.content.allValuesHeading,
        displayedValues.other,
        'all'
      );
      container.appendChild(allValuesSection);
    }
    
    // Add toggle button if we have more than max displayed values
    if (prioritizedValues.length > this.maxDisplayed || this.valuesData.length > prioritizedValues.length) {
      const toggleButton = document.createElement('button');
      toggleButton.className = 'mt-4 text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
      toggleButton.textContent = this.isExpanded ? this.content.showLessButtonText : this.content.showMoreButtonText;
      toggleButton.setAttribute('type', 'button');
      toggleButton.addEventListener('click', () => this.toggleExpanded());
      
      container.appendChild(toggleButton);
    }
    
    return container;
  }
  
  /**
   * Create a section of value buttons
   * @private
   * @param {string} title Section title
   * @param {Array<Object>} values Array of value objects
   * @param {string} sectionId Section identifier
   * @returns {HTMLElement} Value section element
   */
  _createValueSection(title, values, sectionId) {
    const section = document.createElement('div');
    section.className = 'mb-4';
    
    if (title) {
      const heading = document.createElement('h3');
      heading.className = 'text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';
      heading.textContent = title;
      heading.id = `values-section-${sectionId}`;
      section.appendChild(heading);
    }
    
    const valueGrid = document.createElement('div');
    valueGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-2';
    valueGrid.setAttribute('role', 'group');
    valueGrid.setAttribute('aria-labelledby', `values-section-${sectionId}`);
    
    // Create buttons for each value
    values.forEach(value => {
      const valueButton = this._createValueButton(value);
      valueGrid.appendChild(valueButton);
    });
    
    section.appendChild(valueGrid);
    
    return section;
  }
  
  /**
   * Create a button for a single value
   * @private
   * @param {Object} value Value object
   * @returns {HTMLElement} Value button element
   */
  _createValueButton(value) {
    const isSelected = value.id === this.currentValueId;
    
    const button = document.createElement('button');
    button.className = `flex items-center w-full text-left p-3 rounded-md transition ${
      isSelected 
        ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700'
        : 'bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;
    button.setAttribute('type', 'button');
    button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    button.setAttribute('aria-label', `Select ${value.name} for reflection`);
    
    // Add click handler
    button.addEventListener('click', () => this._handleValueSelect(value.id));
    
    // Add selected indicator
    if (isSelected) {
      const checkIcon = document.createElement('span');
      checkIcon.className = 'flex-shrink-0 mr-2 text-blue-600 dark:text-blue-400';
      checkIcon.innerHTML = `
        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      `;
      button.appendChild(checkIcon);
    }
    
    // Add value name
    const nameDiv = document.createElement('div');
    nameDiv.className = 'flex-grow';
    
    const name = document.createElement('div');
    name.className = 'font-medium text-gray-900 dark:text-gray-100';
    name.textContent = value.name;
    
    const description = document.createElement('div');
    description.className = 'text-xs text-gray-500 dark:text-gray-400 line-clamp-1';
    description.textContent = value.description;
    
    nameDiv.appendChild(name);
    nameDiv.appendChild(description);
    button.appendChild(nameDiv);
    
    return button;
  }
  
  /**
   * Create empty state element
   * @private
   * @returns {HTMLElement} Empty state element
   */
  _createEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded';
    emptyState.textContent = this.content.noPrioritizedMessage;
    
    return emptyState;
  }
  
  /**
   * Handle value selection
   * @private
   * @param {string} valueId Selected value ID
   */
  _handleValueSelect(valueId) {
    this.currentValueId = valueId;
    
    // Call the selection callback
    if (this.onValueSelect && typeof this.onValueSelect === 'function') {
      this.onValueSelect(valueId);
    }
    
    // Re-render to update selection
    this.render();
    
    // Announce for screen readers
    if (this.ui && this.ui.announce) {
      const value = this._getValueById(valueId);
      const name = value ? value.name : 'selected value';
      this.ui.announce(`${name} selected for reflection`, 'polite');
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
      console.error('[GuidedReflectionSelectorComponent] Error getting prioritized values:', error);
      return [];
    }
  }
  
  /**
   * Get top prioritized values
   * @private
   * @param {Array<string>} prioritizedValues Array of prioritized value IDs
   * @returns {Object} Object containing prioritized value objects
   */
  _getTopValues(prioritizedValues) {
    // Get limited number of prioritized values
    const topIds = prioritizedValues.slice(0, this.maxDisplayed);
    
    // Convert to value objects
    const topValues = topIds.map(id => this._getValueById(id)).filter(Boolean);
    
    return {
      prioritized: topValues
    };
  }
  
  /**
   * Get all values grouped by prioritized and other
   * @private
   * @param {Array<string>} prioritizedValues Array of prioritized value IDs
   * @returns {Object} Object with prioritized and other value arrays
   */
  _getAllValuesGrouped(prioritizedValues) {
    // Get all prioritized values
    const prioritizedObjects = prioritizedValues
      .map(id => this._getValueById(id))
      .filter(Boolean);
    
    // Get all other values
    const otherObjects = this.valuesData
      .filter(value => !prioritizedValues.includes(value.id))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      prioritized: prioritizedObjects,
      other: otherObjects
    };
  }
  
  /**
   * Get a value object by its ID
   * @private
   * @param {string} id Value ID
   * @returns {Object|null} Value object or null if not found
   */
  _getValueById(id) {
    if (!id || !this.valuesData) return null;
    
    return this.valuesData.find(v => v.id === id) || null;
  }
}

// Export the component
export { GuidedReflectionSelectorComponent };
