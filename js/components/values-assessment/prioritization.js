/**
 * Values Assessment Prioritization Component
 * Renders the prioritization screen and integrates list functionality
 * 
 * @requires PrioritizationListComponent
 */

class PrioritizationComponent {
  /**
   * Create a prioritization component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    
    // Content
    this.content = options.content || this._getDefaultContent();
  }
  
  /**
   * Render the prioritization screen
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Get prioritized values from service
      const prioritizedValues = this.service?.prioritizedValues || [];
      
      // Create header section
      const header = document.createElement('header');
      header.className = 'mb-6';
      
      const heading = document.createElement('h1');
      heading.className = 'text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100';
      heading.textContent = this.content.title;
      heading.id = 'prioritization-heading';
      
      const description = document.createElement('p');
      description.className = 'text-gray-700 dark:text-gray-300';
      description.textContent = this.content.description;
      
      header.appendChild(heading);
      header.appendChild(description);
      
      // Create instructions section
      const instructionsSection = document.createElement('section');
      instructionsSection.className = 'mb-6';
      
      const instructionsHeading = document.createElement('h2');
      instructionsHeading.className = 'sr-only';
      instructionsHeading.textContent = 'Instructions';
      
      const instructionsList = document.createElement('ul');
      instructionsList.className = 'list-disc pl-5 text-sm text-gray-600 dark:text-gray-400';
      
      this.content.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructionsList.appendChild(li);
      });
      
      instructionsSection.appendChild(instructionsHeading);
      instructionsSection.appendChild(instructionsList);
      
      // Create prioritized list container
      const listContainer = document.createElement('div');
      listContainer.id = 'prioritized-list-container';
      listContainer.className = 'mb-8 border rounded-lg overflow-hidden bg-white dark:bg-gray-800';
      listContainer.setAttribute('role', 'region');
      listContainer.setAttribute('aria-labelledby', 'prioritization-heading');
      
      // Check if we have values
      if (!prioritizedValues || prioritizedValues.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'p-6 text-center text-gray-500 dark:text-gray-400';
        emptyMessage.textContent = this.content.emptyMessage;
        listContainer.appendChild(emptyMessage);
      } else {
        // Create and render the list component
        const listComponent = new PrioritizationListComponent({
          ui: this.ui,
          service: this.service,
          container: listContainer,
          valuesData: this.valuesData
        });
        
        listComponent.render();
      }
      
      // Create keyboard shortcuts help
      const keyboardHelp = document.createElement('div');
      keyboardHelp.className = 'text-xs text-gray-500 dark:text-gray-400 mb-6';
      keyboardHelp.innerHTML = `
        <strong>Keyboard shortcuts:</strong> 
        Use <kbd class="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">↑</kbd>/<kbd class="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">↓</kbd> to navigate, 
        <kbd class="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">Ctrl</kbd>+<kbd class="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">↑</kbd>/<kbd class="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700">↓</kbd> to move items
      `;
      
      // Create navigation buttons
      const navigationContainer = document.createElement('div');
      navigationContainer.className = 'flex justify-between mt-8';
      
      const backButton = document.createElement('button');
      backButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      backButton.setAttribute('type', 'button');
      backButton.textContent = 'Back to Selection';
      backButton.addEventListener('click', () => this._handleBack());
      
      const continueButton = document.createElement('button');
      continueButton.className = 'px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      continueButton.setAttribute('type', 'button');
      continueButton.textContent = 'Continue to Reflection';
      continueButton.addEventListener('click', () => this._handleContinue());
      
      navigationContainer.appendChild(backButton);
      navigationContainer.appendChild(continueButton);
      
      // Assemble the page
      this.container.appendChild(header);
      this.container.appendChild(instructionsSection);
      this.container.appendChild(listContainer);
      this.container.appendChild(keyboardHelp);
      this.container.appendChild(navigationContainer);
      
      // Announce for screen readers
      if (this.ui && this.ui.announce) {
        const message = prioritizedValues.length > 0
          ? `Value prioritization screen loaded. ${prioritizedValues.length} values to prioritize.`
          : 'Value prioritization screen loaded. No values selected.';
          
        this.ui.announce(message, 'polite');
      }
      
      return this.container;
    } catch (error) {
      console.error('[PrioritizationComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <h2 class="font-bold">Error</h2>
          <p>There was a problem loading the values prioritization screen.</p>
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
   * Handle back button click
   * @private
   */
  _handleBack() {
    if (!this.service) return;
    
    try {
      // Go to the previous step
      this.service.previousStep();
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('prioritization_back_clicked');
      }
    } catch (error) {
      console.error('[PrioritizationComponent] Back error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error navigating back. Please try again.', 'assertive');
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
      // Save current state
      this.service.saveProgress();
      
      // Go to the next step
      this.service.nextStep();
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('prioritization_completed', {
          top_values: this.service.prioritizedValues.slice(0, 3)
        });
      }
    } catch (error) {
      console.error('[PrioritizationComponent] Continue error:', error);
      
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
      title: 'Prioritize Your Values',
      description: 'Arrange your selected values in order of importance to you.',
      instructions: [
        'Use the up and down arrows to move values in the list',
        'Your top values will be used for reflection in the next step',
        'You can return to this screen later to make changes'
      ],
      emptyMessage: 'No values selected. Please go back and select values first.'
    };
  }
}

// Import dependencies
import { PrioritizationListComponent } from './prioritization-list.js';

// Export the component
export { PrioritizationComponent };
