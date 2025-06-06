/**
 * Values Assessment Prioritization Component - Basic Structure
 * Minimal structure for prioritizing selected values
 */

class PrioritizationBasicComponent {
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
    this.content = {
      title: 'Prioritize Your Values',
      description: 'Arrange your selected values in order of importance to you.',
      instructions: 'Use the arrows to move values up or down in the list.'
    };
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
      
      // Create header
      const header = document.createElement('header');
      header.className = 'mb-6';
      
      const heading = document.createElement('h1');
      heading.className = 'text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100';
      heading.textContent = this.content.title;
      
      const description = document.createElement('p');
      description.className = 'text-gray-700 dark:text-gray-300';
      description.textContent = this.content.description;
      
      header.appendChild(heading);
      header.appendChild(description);
      
      // Create instructions
      const instructions = document.createElement('p');
      instructions.className = 'text-sm text-gray-600 dark:text-gray-400 mb-6';
      instructions.textContent = this.content.instructions;
      
      // Create prioritized list container
      const listContainer = document.createElement('div');
      listContainer.className = 'mb-8 border rounded-lg overflow-hidden bg-white dark:bg-gray-800';
      
      // Create navigation buttons
      const navigationContainer = document.createElement('div');
      navigationContainer.className = 'flex justify-between mt-8';
      
      const backButton = document.createElement('button');
      backButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      backButton.setAttribute('type', 'button');
      backButton.textContent = 'Back';
      backButton.addEventListener('click', () => this._handleBack());
      
      const continueButton = document.createElement('button');
      continueButton.className = 'px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      continueButton.setAttribute('type', 'button');
      continueButton.textContent = 'Continue';
      continueButton.addEventListener('click', () => this._handleContinue());
      
      navigationContainer.appendChild(backButton);
      navigationContainer.appendChild(continueButton);
      
      // Assemble the page
      this.container.appendChild(header);
      this.container.appendChild(instructions);
      this.container.appendChild(listContainer);
      this.container.appendChild(navigationContainer);
      
      // Announce for screen readers
      if (this.ui && this.ui.announce) {
        this.ui.announce('Value prioritization screen loaded. Arrange your values in order of importance.', 'polite');
      }
      
      return this.container;
    } catch (error) {
      console.error('[PrioritizationBasicComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <h2 class="font-bold">Error</h2>
          <p>There was a problem loading the values prioritization screen.</p>
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
    } catch (error) {
      console.error('[PrioritizationBasicComponent] Back error:', error);
      
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
      // Go to the next step
      this.service.nextStep();
    } catch (error) {
      console.error('[PrioritizationBasicComponent] Continue error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error continuing to next step. Please try again.', 'assertive');
      }
    }
  }
}

// Export the component
export { PrioritizationBasicComponent };
