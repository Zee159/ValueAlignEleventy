/**
 * Next Steps Recommendation Card Component
 * Displays a single recommendation card with action items
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class NextStepsRecommendationCard {
  /**
   * Create a recommendation card component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.value = options.value || {};
    this.isPremiumUser = options.isPremiumUser || false;
    this.onActionClick = options.onActionClick || (() => {});
  }
  
  /**
   * Render the recommendation card
   * @returns {HTMLElement} The rendered card
   */
  render() {
    // Create card container
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow p-5 mb-5';
    
    // Create header with value name
    const header = this._createHeader();
    card.appendChild(header);
    
    // Create recommendation content
    const content = this._createContent();
    card.appendChild(content);
    
    // Create action buttons
    const actions = this._createActions();
    card.appendChild(actions);
    
    return card;
  }
  
  /**
   * Create header with value name and icon
   * @private
   * @returns {HTMLElement} Card header
   */
  _createHeader() {
    const header = document.createElement('div');
    header.className = 'flex items-center mb-3';
    
    // Value icon placeholder
    const iconContainer = document.createElement('div');
    iconContainer.className = 'flex-shrink-0 w-8 h-8 mr-3 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400';
    iconContainer.innerHTML = `
      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    `;
    
    // Value name
    const title = document.createElement('h3');
    title.className = 'text-lg font-medium text-gray-900 dark:text-gray-100';
    title.textContent = this.value.name || 'Value';
    
    header.appendChild(iconContainer);
    header.appendChild(title);
    
    return header;
  }
  
  /**
   * Create recommendation content with descriptions
   * @private
   * @returns {HTMLElement} Content element
   */
  _createContent() {
    const content = document.createElement('div');
    content.className = 'mb-4';
    
    // Description
    const description = document.createElement('p');
    description.className = 'text-gray-700 dark:text-gray-300 mb-2';
    description.textContent = `Here are some ways you can live more aligned with your value of ${this.value.name}.`;
    
    // Action list
    const actionList = document.createElement('ul');
    actionList.className = 'space-y-2 text-sm';
    
    // Generate action items (basic for all users)
    const actions = this._generateActions();
    
    // Add actions to list
    actions.forEach(action => {
      const actionItem = document.createElement('li');
      actionItem.className = 'flex items-start';
      
      const bulletPoint = document.createElement('span');
      bulletPoint.className = 'flex-shrink-0 w-4 h-4 mr-1.5 mt-0.5 text-blue-500 dark:text-blue-400';
      bulletPoint.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      `;
      
      const actionText = document.createElement('span');
      actionText.className = 'text-gray-700 dark:text-gray-300';
      actionText.textContent = action;
      
      actionItem.appendChild(bulletPoint);
      actionItem.appendChild(actionText);
      actionList.appendChild(actionItem);
    });
    
    content.appendChild(description);
    content.appendChild(actionList);
    
    return content;
  }
  
  /**
   * Create action buttons
   * @private
   * @returns {HTMLElement} Actions container
   */
  _createActions() {
    const actions = document.createElement('div');
    actions.className = 'flex justify-end';
    
    // Add to journal action button
    if (this.isPremiumUser) {
      const journalButton = document.createElement('button');
      journalButton.className = 'px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      journalButton.setAttribute('type', 'button');
      journalButton.textContent = 'Add to Journal';
      journalButton.addEventListener('click', () => this._handleActionClick('journal'));
      
      actions.appendChild(journalButton);
    }
    
    return actions;
  }
  
  /**
   * Handle action button clicks
   * @private
   * @param {string} actionType Type of action
   */
  _handleActionClick(actionType) {
    if (this.onActionClick && typeof this.onActionClick === 'function') {
      this.onActionClick(this.value, actionType);
    }
  }
  
  /**
   * Generate action items based on the value
   * @private
   * @returns {Array<string>} Array of action descriptions
   */
  _generateActions() {
    const valueName = this.value.name?.toLowerCase() || '';
    
    // Default actions if no specific matching
    const defaultActions = [
      `Schedule time in your calendar dedicated to ${this.value.name}`,
      `Create a daily reminder to reflect on ${this.value.name}`,
      `Find a community that shares ${this.value.name} as a core value`
    ];
    
    // Value-specific actions
    const specificActions = {
      'creativity': [
        'Set aside 15 minutes each day for creative expression',
        'Try a new creative activity each month',
        'Join a creative community workshop or class'
      ],
      'family': [
        'Schedule regular family activities or traditions',
        'Create a family values statement together',
        'Establish tech-free zones or times to focus on family connection'
      ],
      'health': [
        'Schedule regular health check-ups',
        'Create a sustainable exercise routine',
        'Develop a sleep schedule that prioritizes rest'
      ],
      'knowledge': [
        'Set a goal to learn something new each week',
        'Join a book club or discussion group',
        'Take an online course in a subject that interests you'
      ],
      'leadership': [
        'Volunteer for leadership roles in your community',
        'Mentor someone who could benefit from your experience',
        'Read books on effective leadership principles'
      ],
      'freedom': [
        'Identify constraints in your life you can reduce or eliminate',
        'Build more flexibility into your schedule',
        'Practice saying no to commitments that don't align with your values'
      ]
    };
    
    // Check if we have specific actions for this value
    for (const key in specificActions) {
      if (valueName.includes(key)) {
        return specificActions[key];
      }
    }
    
    return defaultActions;
  }
}

// Export the component
export { NextStepsRecommendationCard };
