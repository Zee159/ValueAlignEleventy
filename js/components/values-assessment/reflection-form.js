/**
 * Values Assessment Reflection Form Component
 * Handles the form for entering reflections on individual values
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class ReflectionFormComponent {
  /**
   * Create a reflection form component
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
    this.topValuesCount = options.topValuesCount || 3;
  }
  
  /**
   * Render the reflection form
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Get prioritized values and existing reflections from service
      const prioritizedValues = this.service?.prioritizedValues || [];
      this.reflections = this.service?.reflections || {};
      
      if (!prioritizedValues || prioritizedValues.length === 0) {
        // Show message if no values are selected
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded';
        emptyMessage.textContent = 'No values have been prioritized. Please go back to select and prioritize your values.';
        this.container.appendChild(emptyMessage);
        return this.container;
      }
      
      // Create form
      const form = document.createElement('form');
      form.id = 'reflection-form';
      form.className = 'space-y-8';
      form.setAttribute('aria-label', 'Value reflection form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleFormSubmit();
      });
      
      // Create reflection cards for top values
      const topValues = prioritizedValues.slice(0, this.topValuesCount);
      
      topValues.forEach((valueId, index) => {
        this._createReflectionCard(form, valueId, index);
      });
      
      // Add form to container
      this.container.appendChild(form);
      
      return this.container;
    } catch (error) {
      console.error('[ReflectionFormComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <h2 class="font-bold">Error</h2>
          <p>There was a problem loading the reflection form.</p>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Create a reflection card for a value
   * @private
   * @param {HTMLElement} form The form element to add the card to
   * @param {string} valueId The ID of the value
   * @param {number} index The index of the value
   */
  _createReflectionCard(form, valueId, index) {
    // Find value data
    const valueData = this.valuesData.find(v => v.id === valueId);
    if (!valueData) return;
    
    // Get existing reflection if available
    const existingReflection = this.reflections[valueId] || '';
    
    // Create card
    const card = document.createElement('div');
    card.className = 'p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700';
    
    // Create card header with number badge and value name
    const header = document.createElement('div');
    header.className = 'flex items-center mb-4';
    
    const rankBadge = document.createElement('div');
    rankBadge.className = 'w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold mr-3 flex-shrink-0';
    rankBadge.textContent = (index + 1).toString();
    rankBadge.setAttribute('aria-hidden', 'true');
    
    const valueTitle = document.createElement('h2');
    valueTitle.className = 'text-xl font-bold text-gray-900 dark:text-gray-100';
    valueTitle.id = `reflection-value-${valueId}`;
    valueTitle.textContent = valueData.name;
    
    header.appendChild(rankBadge);
    header.appendChild(valueTitle);
    
    // Create description
    const description = document.createElement('p');
    description.className = 'text-gray-600 dark:text-gray-400 mb-4';
    description.textContent = valueData.description;
    
    // Create reflection prompts
    const promptsContainer = document.createElement('div');
    promptsContainer.className = 'mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded text-sm text-gray-700 dark:text-gray-300';
    
    const promptsHeading = document.createElement('h3');
    promptsHeading.className = 'font-medium mb-2';
    promptsHeading.textContent = 'Reflection prompts:';
    
    const promptsList = document.createElement('ul');
    promptsList.className = 'list-disc list-inside space-y-1';
    
    const prompts = this._getReflectionPrompts(valueData);
    prompts.forEach(prompt => {
      const promptItem = document.createElement('li');
      promptItem.textContent = prompt;
      promptsList.appendChild(promptItem);
    });
    
    promptsContainer.appendChild(promptsHeading);
    promptsContainer.appendChild(promptsList);
    
    // Create textarea for reflection
    const textareaLabel = document.createElement('label');
    textareaLabel.setAttribute('for', `reflection-${valueId}`);
    textareaLabel.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';
    textareaLabel.textContent = `Your reflection on ${valueData.name}:`;
    
    const textarea = document.createElement('textarea');
    textarea.id = `reflection-${valueId}`;
    textarea.name = `reflection-${valueId}`;
    textarea.className = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white';
    textarea.rows = 5;
    textarea.setAttribute('aria-labelledby', `reflection-value-${valueId}`);
    textarea.setAttribute('placeholder', `Share your thoughts about ${valueData.name}...`);
    textarea.value = existingReflection;
    
    // Add auto-save on input
    textarea.addEventListener('input', (e) => {
      this._handleReflectionChange(valueId, e.target.value);
    });
    
    // Create character counter
    const charCounter = document.createElement('div');
    charCounter.className = 'text-xs text-gray-500 dark:text-gray-400 mt-1 text-right';
    charCounter.textContent = `${existingReflection.length} characters`;
    
    // Update character count on input
    textarea.addEventListener('input', (e) => {
      charCounter.textContent = `${e.target.value.length} characters`;
    });
    
    // Assemble card
    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(promptsContainer);
    card.appendChild(textareaLabel);
    card.appendChild(textarea);
    card.appendChild(charCounter);
    
    // Add card to form
    form.appendChild(card);
  }
  
  /**
   * Handle reflection text change
   * @private
   * @param {string} valueId The ID of the value
   * @param {string} text The new reflection text
   */
  _handleReflectionChange(valueId, text) {
    if (!this.service) return;
    
    try {
      // Update the reflection in the service
      this.service.updateReflection(valueId, text);
      
      // Update local copy
      this.reflections[valueId] = text;
    } catch (error) {
      console.error('[ReflectionFormComponent] Reflection change error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error saving reflection. Your changes may not be saved.', 'assertive');
      }
    }
  }
  
  /**
   * Handle form submission
   * @private
   */
  _handleFormSubmit() {
    if (!this.service) return;
    
    try {
      // Save all reflections to service
      this.service.saveProgress();
      
      // Announce success
      if (this.ui && this.ui.announce) {
        this.ui.announce('Reflections saved successfully.', 'polite');
      }
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('reflections_saved');
      }
    } catch (error) {
      console.error('[ReflectionFormComponent] Form submission error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error saving reflections. Please try again.', 'assertive');
      }
    }
  }
  
  /**
   * Get reflection prompts for a value
   * @private
   * @param {Object} valueData The value data
   * @returns {Array<string>} Array of reflection prompts
   */
  _getReflectionPrompts(valueData) {
    // Use custom prompts if available
    if (valueData.reflectionPrompts && valueData.reflectionPrompts.length > 0) {
      return valueData.reflectionPrompts;
    }
    
    // Otherwise use default prompts
    return [
      `How does ${valueData.name} show up in your daily life?`,
      `When have you had to make a difficult decision based on ${valueData.name}?`,
      `How might your commitment to ${valueData.name} shape your future choices?`
    ];
  }
}

// Export the component
export { ReflectionFormComponent };
