/**
 * Next Steps Content Component
 * Displays recommendations and action items based on the user's values assessment
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

import { NextStepsRecommendationCard } from './next-steps-recommendation-card.js';

class NextStepsContentComponent {
  /**
   * Create a next steps content component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.prioritizedValues = options.prioritizedValues || [];
    this.isPremiumUser = options.isPremiumUser || false;
    this.onActionClick = options.onActionClick || (() => {});
    this.maxCards = options.maxCards || 3;
  }
  
  /**
   * Render the next steps content
   * @returns {HTMLElement} The rendered content
   */
  render() {
    const container = document.createElement('div');
    container.className = 'next-steps-content';
    
    // If no prioritized values, show empty state
    if (!this.prioritizedValues || this.prioritizedValues.length === 0) {
      container.appendChild(this._createEmptyState());
      return container;
    }
    
    // Introduction text
    const intro = document.createElement('p');
    intro.className = 'text-gray-700 dark:text-gray-300 mb-6';
    intro.textContent = `Based on your ${this.prioritizedValues.length > 1 ? 'top values' : 'top value'}, here are some recommendations to help you live more aligned with what matters most to you.`;
    container.appendChild(intro);
    
    // Cards container with grid layout
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'space-y-6';
    
    // Create recommendation cards for top values
    const topValues = this.prioritizedValues.slice(0, this.maxCards);
    
    topValues.forEach(value => {
      const card = new NextStepsRecommendationCard({
        value: value,
        isPremiumUser: this.isPremiumUser,
        onActionClick: this.onActionClick
      });
      
      cardsContainer.appendChild(card.render());
    });
    
    container.appendChild(cardsContainer);
    
    // Premium upsell if not premium
    if (!this.isPremiumUser) {
      container.appendChild(this._createPremiumUpsell());
    }
    
    return container;
  }
  
  /**
   * Create empty state when no values are available
   * @private
   * @returns {HTMLElement} Empty state component
   */
  _createEmptyState() {
    const emptyContainer = document.createElement('div');
    emptyContainer.className = 'bg-gray-50 dark:bg-gray-750 p-8 rounded-lg text-center';
    
    const icon = document.createElement('div');
    icon.className = 'mx-auto mb-4 w-16 h-16 text-gray-400 dark:text-gray-500';
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m3.293-5.707l-.707.707M17.707 7.707l.707-.707M6.343 17.657l-.707.707M18.364 17.657l.707.707" />
      </svg>
    `;
    
    const heading = document.createElement('h3');
    heading.className = 'text-lg font-medium text-gray-900 dark:text-gray-100 mb-2';
    heading.textContent = 'No Values Found';
    
    const message = document.createElement('p');
    message.className = 'text-gray-500 dark:text-gray-400 mb-4';
    message.textContent = 'Please complete the values assessment to see personalized recommendations.';
    
    const button = document.createElement('button');
    button.className = 'px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    button.textContent = 'Start Assessment';
    button.addEventListener('click', () => {
      if (window.location.pathname.includes('/dashboard/values-assessment/')) {
        window.location.reload();
      } else {
        window.location.href = '/dashboard/values-assessment/';
      }
    });
    
    emptyContainer.appendChild(icon);
    emptyContainer.appendChild(heading);
    emptyContainer.appendChild(message);
    emptyContainer.appendChild(button);
    
    return emptyContainer;
  }
  
  /**
   * Create premium upsell component
   * @private
   * @returns {HTMLElement} Premium upsell component
   */
  _createPremiumUpsell() {
    const upsellContainer = document.createElement('div');
    upsellContainer.className = 'mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-5 rounded-lg';
    
    const upsellContent = document.createElement('div');
    upsellContent.className = 'flex items-start';
    
    // Icon
    const icon = document.createElement('div');
    icon.className = 'flex-shrink-0 w-10 h-10 mr-4 text-blue-600 dark:text-blue-400';
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clip-rule="evenodd" />
      </svg>
    `;
    
    // Text content
    const textContainer = document.createElement('div');
    
    const heading = document.createElement('h3');
    heading.className = 'text-lg font-medium text-blue-800 dark:text-blue-300 mb-2';
    heading.textContent = 'Unlock Premium Features';
    
    const description = document.createElement('p');
    description.className = 'text-blue-700 dark:text-blue-200 mb-3';
    description.textContent = 'Upgrade to Premium for personalized journaling prompts, AI-powered recommendations, and progress tracking.';
    
    const button = document.createElement('a');
    button.className = 'inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    button.href = '/dashboard/settings/subscription/';
    button.textContent = 'Upgrade to Premium';
    
    textContainer.appendChild(heading);
    textContainer.appendChild(description);
    textContainer.appendChild(button);
    
    upsellContent.appendChild(icon);
    upsellContent.appendChild(textContainer);
    upsellContainer.appendChild(upsellContent);
    
    return upsellContainer;
  }
}

// Export the component
export { NextStepsContentComponent };
