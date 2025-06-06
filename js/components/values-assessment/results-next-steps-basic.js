/**
 * Values Assessment Results Next Steps Basic Component
 * Minimal component that displays recommendations and next steps
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class ResultsNextStepsBasicComponent {
  /**
   * Create a results next steps basic component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.isPremiumUser = options.isPremiumUser || false;
  }
  
  /**
   * Render the next steps section
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Create introduction text
      const introText = document.createElement('p');
      introText.className = 'text-gray-700 dark:text-gray-300 mb-4';
      introText.textContent = 'Now that you understand your core values, here are some suggested next steps:';
      
      // Create steps list
      const stepsList = document.createElement('ul');
      stepsList.className = 'space-y-3 mb-6';
      
      // Add general next steps
      const generalSteps = this._getGeneralNextSteps();
      
      generalSteps.forEach(step => {
        const stepItem = document.createElement('li');
        stepItem.className = 'flex items-start';
        
        const icon = document.createElement('div');
        icon.className = 'mr-3 mt-1 text-green-500 dark:text-green-400 flex-shrink-0';
        icon.innerHTML = `
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        `;
        
        const content = document.createElement('div');
        
        const title = document.createElement('h4');
        title.className = 'font-medium text-gray-900 dark:text-gray-100';
        title.textContent = step.title;
        
        const description = document.createElement('p');
        description.className = 'text-gray-600 dark:text-gray-400 text-sm';
        description.textContent = step.description;
        
        content.appendChild(title);
        content.appendChild(description);
        
        stepItem.appendChild(icon);
        stepItem.appendChild(content);
        stepsList.appendChild(stepItem);
      });
      
      // Premium section
      let premiumSection = null;
      
      if (this.isPremiumUser) {
        premiumSection = this._createPremiumSection(true);
      } else {
        premiumSection = this._createPremiumSection(false);
      }
      
      // Assemble the component
      this.container.appendChild(introText);
      this.container.appendChild(stepsList);
      
      if (premiumSection) {
        this.container.appendChild(premiumSection);
      }
      
      return this.container;
    } catch (error) {
      console.error('[ResultsNextStepsBasicComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          <p>There was a problem loading next steps recommendations.</p>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Get general next steps
   * @private
   * @returns {Array<Object>} Array of next steps
   */
  _getGeneralNextSteps() {
    return [
      {
        title: 'Set reminders to revisit your values',
        description: 'Schedule regular check-ins to review how your actions align with your values.'
      },
      {
        title: 'Share your values with trusted friends or colleagues',
        description: 'Discussing your values with others can provide accountability and new perspectives.'
      },
      {
        title: 'Create a visual reminder of your top values',
        description: 'Consider printing your values report or creating a simple reminder for your workspace.'
      },
      {
        title: 'Practice intentional decision-making',
        description: 'When facing choices, pause to consider how each option aligns with your core values.'
      }
    ];
  }
  
  /**
   * Create premium section
   * @private
   * @param {boolean} isPremium Whether the user is premium
   * @returns {HTMLElement} Premium section element
   */
  _createPremiumSection(isPremium) {
    const section = document.createElement('div');
    
    if (isPremium) {
      // Premium user content
      section.className = 'mt-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800';
      
      const heading = document.createElement('h3');
      heading.className = 'flex items-center text-lg font-medium text-purple-800 dark:text-purple-200 mb-2';
      heading.innerHTML = `
        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Premium Next Steps
      `;
      
      const description = document.createElement('p');
      description.className = 'text-purple-700 dark:text-purple-300 mb-3';
      description.textContent = 'As a premium member, you have access to these additional resources:';
      
      const resourcesList = document.createElement('ul');
      resourcesList.className = 'text-purple-700 dark:text-purple-300 space-y-2';
      
      const resources = [
        'Download your comprehensive values assessment report with AI insights',
        'Schedule a one-on-one values coaching session',
        'Access the premium values implementation course',
        'Use the values conflict resolution tool'
      ];
      
      resources.forEach(resource => {
        const item = document.createElement('li');
        item.className = 'flex items-center';
        item.innerHTML = `
          <svg class="w-4 h-4 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          ${resource}
        `;
        resourcesList.appendChild(item);
      });
      
      section.appendChild(heading);
      section.appendChild(description);
      section.appendChild(resourcesList);
    } else {
      // Non-premium user upgrade prompt
      section.className = 'mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700';
      
      const heading = document.createElement('h3');
      heading.className = 'text-lg font-medium text-gray-900 dark:text-gray-100 mb-2';
      heading.textContent = 'Unlock Premium Features';
      
      const description = document.createElement('p');
      description.className = 'text-gray-600 dark:text-gray-400 mb-3';
      description.textContent = 'Upgrade to premium to access advanced features and personalized guidance:';
      
      const featuresList = document.createElement('ul');
      featuresList.className = 'text-gray-600 dark:text-gray-400 space-y-2 mb-4';
      
      const features = [
        'AI-powered insights and personalized action recommendations',
        'Comprehensive downloadable PDF reports',
        'Advanced values conflict resolution tools',
        'One-on-one values coaching sessions'
      ];
      
      features.forEach(feature => {
        const item = document.createElement('li');
        item.className = 'flex items-center';
        item.innerHTML = `
          <svg class="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          ${feature}
        `;
        featuresList.appendChild(item);
      });
      
      const upgradeButton = document.createElement('button');
      upgradeButton.className = 'w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
      upgradeButton.textContent = 'Upgrade to Premium';
      upgradeButton.addEventListener('click', () => this._handleUpgradeClick());
      
      section.appendChild(heading);
      section.appendChild(description);
      section.appendChild(featuresList);
      section.appendChild(upgradeButton);
    }
    
    return section;
  }
  
  /**
   * Handle upgrade button click
   * @private
   */
  _handleUpgradeClick() {
    try {
      // Redirect to upgrade page
      window.location.href = '/dashboard/settings/subscription/';
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('upgrade_from_values_assessment_clicked');
      }
    } catch (error) {
      console.error('[ResultsNextStepsBasicComponent] Upgrade error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error navigating to upgrade page. Please try again.', 'assertive');
      }
    }
  }
}

// Export the component
export { ResultsNextStepsBasicComponent };
