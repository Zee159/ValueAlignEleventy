/**
 * Values Assessment Introduction Component
 * Renders the introduction screen for the values assessment
 * 
 * @requires ValuesAssessmentUI
 */

class IntroductionComponent {
  /**
   * Create an introduction component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    
    // Content and translation
    this.content = options.content || this._getDefaultContent();
  }
  
  /**
   * Render the introduction screen
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Create header section
      const header = document.createElement('header');
      header.className = 'mb-8';
      
      const heading = document.createElement('h1');
      heading.className = 'text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100';
      heading.textContent = this.content.title;
      
      const description = document.createElement('p');
      description.className = 'text-lg mb-2 text-gray-700 dark:text-gray-300';
      description.textContent = this.content.description;
      
      header.appendChild(heading);
      header.appendChild(description);
      
      // Create steps section
      const stepsSection = document.createElement('section');
      stepsSection.setAttribute('aria-label', 'Assessment steps');
      stepsSection.className = 'mb-8';
      
      const stepsHeading = document.createElement('h2');
      stepsHeading.className = 'text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200';
      stepsHeading.textContent = 'How It Works';
      
      const stepsList = document.createElement('ol');
      stepsList.className = 'space-y-4';
      
      // Create each step item
      this.content.steps.forEach((step, index) => {
        const stepItem = document.createElement('li');
        stepItem.className = 'flex items-start';
        
        const stepNumber = document.createElement('span');
        stepNumber.className = 'flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 w-8 h-8 font-bold mr-3 flex-shrink-0';
        stepNumber.textContent = (index + 1).toString();
        
        const stepContent = document.createElement('div');
        stepContent.className = 'flex-1';
        
        const stepTitle = document.createElement('h3');
        stepTitle.className = 'font-medium text-gray-900 dark:text-gray-100';
        stepTitle.textContent = step.title;
        
        const stepDescription = document.createElement('p');
        stepDescription.className = 'text-gray-600 dark:text-gray-400';
        stepDescription.textContent = step.description;
        
        stepContent.appendChild(stepTitle);
        stepContent.appendChild(stepDescription);
        
        stepItem.appendChild(stepNumber);
        stepItem.appendChild(stepContent);
        stepsList.appendChild(stepItem);
      });
      
      stepsSection.appendChild(stepsHeading);
      stepsSection.appendChild(stepsList);
      
      // Create CTA button
      const ctaContainer = document.createElement('div');
      ctaContainer.className = 'mt-8 flex justify-center';
      
      const startButton = document.createElement('button');
      startButton.id = 'start-assessment';
      startButton.className = 'px-6 py-3 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white font-medium rounded-lg transition-all duration-200';
      startButton.setAttribute('type', 'button');
      startButton.textContent = this.content.startButtonText;
      startButton.addEventListener('click', () => this._handleStart());
      
      ctaContainer.appendChild(startButton);
      
      // Add premium badge if user is premium
      if (this.service && this.service.isPremiumUser) {
        const premiumSection = this._createPremiumSection();
        if (premiumSection) {
          this.container.appendChild(premiumSection);
        }
      }
      
      // Assemble the page
      this.container.appendChild(header);
      this.container.appendChild(stepsSection);
      this.container.appendChild(ctaContainer);
      
      // Announce for screen readers
      if (this.ui && this.ui.announce) {
        this.ui.announce('Values assessment introduction loaded. Press the start button to begin.', 'polite');
      }
      
      return this.container;
    } catch (error) {
      console.error('[IntroductionComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 text-red-800 rounded-lg">
          <h2 class="font-bold">Error</h2>
          <p>There was a problem loading the introduction.</p>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Handle the start button click
   * @private
   */
  _handleStart() {
    if (!this.service) return;
    
    try {
      // Go to the next step
      this.service.nextStep();
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('values_assessment_started');
      }
    } catch (error) {
      console.error('[IntroductionComponent] Start error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error starting the assessment. Please try again.', 'assertive');
      }
    }
  }
  
  /**
   * Get default content for the component
   * @private
   * @returns {Object} Default content
   */
  _getDefaultContent() {
    return {
      title: 'Discover Your Core Values',
      description: 'Understanding your personal values helps you make decisions that align with what truly matters to you.',
      steps: [
        {
          title: 'Select Values',
          description: 'Choose from a comprehensive list of values that resonate with you.'
        },
        {
          title: 'Prioritize',
          description: 'Arrange your selected values in order of importance to you.'
        },
        {
          title: 'Reflect',
          description: 'Consider how your top values influence your decisions and actions.'
        },
        {
          title: 'Review & Export',
          description: 'Get a summary of your values assessment that you can save and reference.'
        }
      ],
      startButtonText: 'Start Assessment',
      premiumTitle: 'Premium Features Unlocked',
      premiumDescription: 'Your account includes AI-powered insights to help you better understand your values.'
    };
  }
  
  /**
   * Create premium features section
   * @private
   * @returns {HTMLElement} Premium section
   */
  _createPremiumSection() {
    const premiumSection = document.createElement('div');
    premiumSection.className = 'my-6 p-4 bg-purple-100 dark:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-800';
    
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'flex items-center mb-2';
    
    const premiumBadge = document.createElement('span');
    premiumBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 mr-2';
    premiumBadge.textContent = 'PREMIUM';
    
    const premiumTitle = document.createElement('h3');
    premiumTitle.className = 'text-lg font-medium text-purple-800 dark:text-purple-200';
    premiumTitle.textContent = this.content.premiumTitle;
    
    badgeContainer.appendChild(premiumBadge);
    badgeContainer.appendChild(premiumTitle);
    
    const premiumDescription = document.createElement('p');
    premiumDescription.className = 'text-purple-700 dark:text-purple-300';
    premiumDescription.textContent = this.content.premiumDescription;
    
    premiumSection.appendChild(badgeContainer);
    premiumSection.appendChild(premiumDescription);
    
    return premiumSection;
  }
}

// Export the component
export { IntroductionComponent };
