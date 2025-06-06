/**
 * Values Assessment Reflection Component
 * Renders the reflection screen for users to reflect on their top values
 * 
 * @requires ReflectionFormComponent
 * Following ValueAlign development rules for accessibility and theme integration
 */

class ReflectionComponent {
  /**
   * Create a reflection component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    this.themeService = options.themeService || window.themeSystem;
    
    // Configuration
    this.topValuesCount = options.topValuesCount || 3;
    this.isPremiumUser = this.service?.isPremiumUser || false;
    
    // Content
    this.content = options.content || this._getDefaultContent();
  }
  
  /**
   * Render the reflection screen
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
      heading.id = 'reflection-heading';
      
      const description = document.createElement('p');
      description.className = 'text-gray-700 dark:text-gray-300';
      description.textContent = this.content.description;
      
      header.appendChild(heading);
      header.appendChild(description);
      
      // Create instructions section
      const instructionsSection = document.createElement('section');
      instructionsSection.className = 'mb-6';
      
      const instructionsList = document.createElement('ul');
      instructionsList.className = 'list-disc pl-5 text-sm text-gray-600 dark:text-gray-400';
      
      this.content.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructionsList.appendChild(li);
      });
      
      instructionsSection.appendChild(instructionsList);
      
      // Create AI assistant badge for premium users
      if (this.isPremiumUser) {
        const aiAssistantSection = this._createAIAssistantSection();
        if (aiAssistantSection) {
          this.container.appendChild(aiAssistantSection);
        }
      }
      
      // Create form container
      const formContainer = document.createElement('div');
      formContainer.id = 'reflection-form-container';
      formContainer.className = 'mb-8';
      formContainer.setAttribute('role', 'region');
      formContainer.setAttribute('aria-labelledby', 'reflection-heading');
      
      // Create reflection form component
      const formComponent = new ReflectionFormComponent({
        ui: this.ui,
        service: this.service,
        container: formContainer,
        valuesData: this.valuesData,
        topValuesCount: this.topValuesCount,
        themeService: this.themeService
      });
      
      formComponent.render();
      
      // Create navigation buttons
      const navigationContainer = document.createElement('div');
      navigationContainer.className = 'flex justify-between mt-8';
      
      const backButton = document.createElement('button');
      backButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      backButton.setAttribute('type', 'button');
      backButton.textContent = this.content.backButtonText;
      backButton.addEventListener('click', () => this._handleBack());
      
      const saveButton = document.createElement('button');
      saveButton.className = 'px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-md shadow-sm text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2';
      saveButton.setAttribute('type', 'button');
      saveButton.textContent = this.content.saveButtonText;
      saveButton.addEventListener('click', () => this._handleSave());
      
      const continueButton = document.createElement('button');
      continueButton.className = 'px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      continueButton.setAttribute('type', 'button');
      continueButton.textContent = this.content.continueButtonText;
      continueButton.addEventListener('click', () => this._handleContinue());
      
      const rightButtons = document.createElement('div');
      rightButtons.className = 'flex space-x-2';
      rightButtons.appendChild(saveButton);
      rightButtons.appendChild(continueButton);
      
      navigationContainer.appendChild(backButton);
      navigationContainer.appendChild(rightButtons);
      
      // Assemble the page
      this.container.appendChild(header);
      this.container.appendChild(instructionsSection);
      this.container.appendChild(formContainer);
      this.container.appendChild(navigationContainer);
      
      // Announce for screen readers
      if (this.ui && this.ui.announce) {
        const prioritizedValues = this.service?.prioritizedValues || [];
        const message = prioritizedValues.length > 0
          ? `Reflection screen loaded. Please reflect on your top ${Math.min(this.topValuesCount, prioritizedValues.length)} values.`
          : 'Reflection screen loaded. No values selected for reflection.';
          
        this.ui.announce(message, 'polite');
      }
      
      return this.container;
    } catch (error) {
      console.error('[ReflectionComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <h2 class="font-bold">Error</h2>
          <p>There was a problem loading the values reflection screen.</p>
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
   * Create the AI assistant section for premium users
   * @private
   * @returns {HTMLElement} The AI assistant section
   */
  _createAIAssistantSection() {
    const aiSection = document.createElement('div');
    aiSection.className = 'mb-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-100 dark:border-purple-800';
    
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'flex items-center mb-2';
    
    const aiPremiumBadge = document.createElement('span');
    aiPremiumBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 mr-2';
    aiPremiumBadge.innerHTML = `
      <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
      </svg>
      PREMIUM AI
    `;
    
    const aiTitle = document.createElement('h3');
    aiTitle.className = 'text-lg font-medium text-purple-800 dark:text-purple-200';
    aiTitle.textContent = 'AI Reflection Assistant';
    
    badgeContainer.appendChild(aiPremiumBadge);
    badgeContainer.appendChild(aiTitle);
    
    const aiDescription = document.createElement('p');
    aiDescription.className = 'text-purple-700 dark:text-purple-300 mb-3';
    aiDescription.textContent = 'As a premium user, you have access to AI-powered reflection assistance. Your reflections will receive personalized insights and action recommendations.';
    
    const aiFeaturesList = document.createElement('ul');
    aiFeaturesList.className = 'text-sm text-purple-700 dark:text-purple-300 list-disc list-inside';
    
    const aiFeatures = [
      'Personalized prompts based on your selected values',
      'Analysis of reflection themes and patterns',
      'Action recommendations to live by your values',
      'Enhanced PDF report with AI insights'
    ];
    
    aiFeatures.forEach(feature => {
      const li = document.createElement('li');
      li.textContent = feature;
      aiFeaturesList.appendChild(li);
    });
    
    aiSection.appendChild(badgeContainer);
    aiSection.appendChild(aiDescription);
    aiSection.appendChild(aiFeaturesList);
    
    return aiSection;
  }
  
  /**
   * Handle back button click
   * @private
   */
  _handleBack() {
    if (!this.service) return;
    
    try {
      // Save current reflections
      this.service.saveProgress();
      
      // Go to the previous step
      this.service.previousStep();
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('reflection_back_clicked');
      }
    } catch (error) {
      console.error('[ReflectionComponent] Back error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error navigating back. Please try again.', 'assertive');
      }
    }
  }
  
  /**
   * Handle save button click
   * @private
   */
  _handleSave() {
    if (!this.service) return;
    
    try {
      // Save current reflections
      this.service.saveProgress();
      
      // Show feedback message
      const feedbackMessage = document.createElement('div');
      feedbackMessage.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md';
      feedbackMessage.setAttribute('role', 'alert');
      feedbackMessage.textContent = 'Reflections saved successfully!';
      
      // Add to page
      document.body.appendChild(feedbackMessage);
      
      // Remove after delay
      setTimeout(() => {
        if (feedbackMessage.parentNode) {
          feedbackMessage.parentNode.removeChild(feedbackMessage);
        }
      }, 3000);
      
      // Announce for screen readers
      if (this.ui && this.ui.announce) {
        this.ui.announce('Reflections saved successfully.', 'polite');
      }
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('reflections_saved');
      }
    } catch (error) {
      console.error('[ReflectionComponent] Save error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error saving reflections. Please try again.', 'assertive');
      }
    }
  }
  
  /**
   * Handle continue button click
   * @private
   */
  _handleContinue() {
    if (!this.service) return;
    
    try {
      // Save current reflections
      this.service.saveProgress();
      
      // Go to the next step
      this.service.nextStep();
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('reflection_completed');
      }
    } catch (error) {
      console.error('[ReflectionComponent] Continue error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error continuing to next step. Please try again.', 'assertive');
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
      title: 'Reflect on Your Values',
      description: 'Take time to reflect on what your top values mean to you.',
      instructions: [
        'Consider each of your top values and how they guide your decisions',
        'Your reflections will help you better understand your values',
        'These reflections will be included in your final values report'
      ],
      backButtonText: 'Back to Prioritization',
      saveButtonText: 'Save Reflections',
      continueButtonText: 'Continue to Results'
    };
  }
}

// Import dependencies
import { ReflectionFormComponent } from './reflection-form.js';

// Export the component
export { ReflectionComponent };
