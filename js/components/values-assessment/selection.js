/**
 * Values Assessment Selection Component
 * Renders the value selection screen where users choose values important to them
 * 
 * @requires ValuesAssessmentUI
 */

class SelectionComponent {
  /**
   * Create a selection component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    
    // Configuration
    this.maxSelections = options.maxSelections || 10;
    this.minSelections = options.minSelections || 3;
    this.valuesData = options.valuesData || window.valuesData || [];
    
    // State
    this.selectedCount = 0;
    this.valueCards = {};
    
    // Content
    this.content = options.content || this._getDefaultContent();
  }
  
  /**
   * Render the values selection screen
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Get selected values from service
      const selectedValues = this.service?.selectedValues || [];
      this.selectedCount = selectedValues.length;
      
      // Create header section
      const header = document.createElement('header');
      header.className = 'mb-6';
      
      const heading = document.createElement('h1');
      heading.className = 'text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100';
      heading.textContent = this.content.title;
      heading.id = 'values-selection-title';
      
      const description = document.createElement('div');
      description.className = 'space-y-2';
      
      const mainDescription = document.createElement('p');
      mainDescription.className = 'text-gray-700 dark:text-gray-300';
      mainDescription.textContent = this.content.description;
      
      const instructionsList = document.createElement('ul');
      instructionsList.className = 'text-sm text-gray-600 dark:text-gray-400 list-disc pl-5';
      
      this.content.instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructionsList.appendChild(li);
      });
      
      // Selection counter
      const counterContainer = document.createElement('div');
      counterContainer.className = 'mt-4 mb-6 flex items-center justify-between';
      
      const counter = document.createElement('div');
      counter.className = 'font-medium';
      counter.id = 'selection-counter';
      counter.setAttribute('aria-live', 'polite');
      counter.textContent = `${this.selectedCount} of ${this.maxSelections} values selected`;
      
      const minNote = document.createElement('div');
      minNote.className = 'text-sm text-gray-600 dark:text-gray-400';
      minNote.textContent = `(minimum ${this.minSelections})`;
      
      counterContainer.appendChild(counter);
      counterContainer.appendChild(minNote);
      
      // Assemble header
      description.appendChild(mainDescription);
      description.appendChild(instructionsList);
      header.appendChild(heading);
      header.appendChild(description);
      
      // Create values grid container
      const valuesContainer = document.createElement('div');
      valuesContainer.className = 'values-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8';
      valuesContainer.setAttribute('role', 'group');
      valuesContainer.setAttribute('aria-labelledby', 'values-selection-title');
      
      // Check if we have values data
      if (!this.valuesData || this.valuesData.length === 0) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'col-span-full p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded';
        errorMessage.textContent = 'Error: Values data not found. Please refresh the page.';
        valuesContainer.appendChild(errorMessage);
      } else {
        // Create value cards
        this._createValueCards(valuesContainer, selectedValues);
      }
      
      // Create navigation buttons
      const navigationContainer = document.createElement('div');
      navigationContainer.className = 'flex justify-between mt-8';
      
      const backButton = document.createElement('button');
      backButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      backButton.setAttribute('type', 'button');
      backButton.textContent = 'Back to Introduction';
      backButton.addEventListener('click', () => this._handleBack());
      
      const continueButton = document.createElement('button');
      continueButton.className = 'px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      continueButton.setAttribute('type', 'button');
      continueButton.setAttribute('id', 'continue-to-prioritize');
      continueButton.textContent = 'Continue';
      continueButton.addEventListener('click', () => this._handleContinue());
      
      // Disable continue button if below minimum
      if (this.selectedCount < this.minSelections) {
        continueButton.disabled = true;
        continueButton.classList.add('opacity-50', 'cursor-not-allowed');
        continueButton.setAttribute('aria-disabled', 'true');
      }
      
      navigationContainer.appendChild(backButton);
      navigationContainer.appendChild(continueButton);
      
      // Assemble the page
      this.container.appendChild(header);
      this.container.appendChild(counterContainer);
      this.container.appendChild(valuesContainer);
      this.container.appendChild(navigationContainer);
      
      // Announce for screen readers
      if (this.ui && this.ui.announce) {
        this.ui.announce(`Values selection screen loaded. ${this.selectedCount} of ${this.maxSelections} values selected.`, 'polite');
      }
      
      return this.container;
    } catch (error) {
      console.error('[SelectionComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <h2 class="font-bold">Error</h2>
          <p>There was a problem loading the values selection screen.</p>
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
   * Create value cards for selection
   * @private
   * @param {HTMLElement} container Container element for cards
   * @param {Array<string>} selectedValues Currently selected value IDs
   */
  _createValueCards(container, selectedValues) {
    // Reset value cards cache
    this.valueCards = {};
    
    // Create a card for each value
    this.valuesData.forEach(value => {
      const isSelected = selectedValues.includes(value.id);
      
      // Create card
      const card = document.createElement('div');
      card.className = `value-card p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800' 
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
      }`;
      card.id = `value-${value.id}`;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'checkbox');
      card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      card.setAttribute('aria-labelledby', `value-title-${value.id}`);
      
      // Inner content
      const checkContainer = document.createElement('div');
      checkContainer.className = 'flex items-center justify-between mb-2';
      
      const valueTitle = document.createElement('h3');
      valueTitle.id = `value-title-${value.id}`;
      valueTitle.className = 'font-medium text-gray-900 dark:text-gray-100';
      valueTitle.textContent = value.name;
      
      const checkIcon = document.createElement('div');
      checkIcon.className = `w-5 h-5 rounded-full border ${
        isSelected 
          ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500' 
          : 'border-gray-400 dark:border-gray-500'
      }`;
      checkIcon.setAttribute('aria-hidden', 'true');
      
      if (isSelected) {
        const checkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        checkSvg.setAttribute('class', 'w-5 h-5 text-white');
        checkSvg.setAttribute('viewBox', '0 0 20 20');
        checkSvg.setAttribute('fill', 'currentColor');
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill-rule', 'evenodd');
        path.setAttribute('d', 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z');
        path.setAttribute('clip-rule', 'evenodd');
        
        checkSvg.appendChild(path);
        checkIcon.innerHTML = '';
        checkIcon.appendChild(checkSvg);
      }
      
      checkContainer.appendChild(valueTitle);
      checkContainer.appendChild(checkIcon);
      
      const valueDescription = document.createElement('p');
      valueDescription.className = 'text-sm text-gray-600 dark:text-gray-400';
      valueDescription.textContent = value.description;
      
      // Assemble card
      card.appendChild(checkContainer);
      card.appendChild(valueDescription);
      
      // Set up event listeners
      card.addEventListener('click', () => this._toggleValue(value.id, card));
      card.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this._toggleValue(value.id, card);
        }
      });
      
      // Add to container
      container.appendChild(card);
      
      // Save reference to card
      this.valueCards[value.id] = card;
    });
  }
  
  /**
   * Toggle a value's selection state
   * @private
   * @param {string} valueId The ID of the value to toggle
   * @param {HTMLElement} card The card element
   */
  _toggleValue(valueId, card) {
    if (!this.service) return;
    
    try {
      // Get current selection state
      const isCurrentlySelected = this.service.selectedValues.includes(valueId);
      
      // Check if adding would exceed max
      if (!isCurrentlySelected && this.selectedCount >= this.maxSelections) {
        if (this.ui && this.ui.announce) {
          this.ui.announce(`Maximum selection reached. You can select up to ${this.maxSelections} values.`, 'assertive');
        }
        return;
      }
      
      // Toggle the value
      const newState = this.service.toggleValue(valueId);
      
      // Update the count
      this.selectedCount = newState 
        ? this.selectedCount + 1 
        : this.selectedCount - 1;
      
      // Update counter text
      const counter = document.getElementById('selection-counter');
      if (counter) {
        counter.textContent = `${this.selectedCount} of ${this.maxSelections} values selected`;
      }
      
      // Update card appearance
      if (card) {
        card.setAttribute('aria-checked', newState ? 'true' : 'false');
        
        if (newState) {
          card.classList.add('bg-blue-50', 'dark:bg-blue-900', 'border-blue-200', 'dark:border-blue-800');
          card.classList.remove('bg-white', 'dark:bg-gray-800', 'border-gray-200', 'dark:border-gray-700');
        } else {
          card.classList.remove('bg-blue-50', 'dark:bg-blue-900', 'border-blue-200', 'dark:border-blue-800');
          card.classList.add('bg-white', 'dark:bg-gray-800', 'border-gray-200', 'dark:border-gray-700');
        }
        
        // Update check icon
        const checkIcon = card.querySelector('div[aria-hidden="true"]');
        if (checkIcon) {
          if (newState) {
            checkIcon.classList.add('bg-blue-600', 'dark:bg-blue-500', 'border-blue-600', 'dark:border-blue-500');
            checkIcon.classList.remove('border-gray-400', 'dark:border-gray-500');
            
            const checkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            checkSvg.setAttribute('class', 'w-5 h-5 text-white');
            checkSvg.setAttribute('viewBox', '0 0 20 20');
            checkSvg.setAttribute('fill', 'currentColor');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('fill-rule', 'evenodd');
            path.setAttribute('d', 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z');
            path.setAttribute('clip-rule', 'evenodd');
            
            checkSvg.appendChild(path);
            checkIcon.innerHTML = '';
            checkIcon.appendChild(checkSvg);
          } else {
            checkIcon.classList.remove('bg-blue-600', 'dark:bg-blue-500', 'border-blue-600', 'dark:border-blue-500');
            checkIcon.classList.add('border-gray-400', 'dark:border-gray-500');
            checkIcon.innerHTML = '';
          }
        }
      }
      
      // Update continue button state
      const continueButton = document.getElementById('continue-to-prioritize');
      if (continueButton) {
        if (this.selectedCount >= this.minSelections) {
          continueButton.disabled = false;
          continueButton.classList.remove('opacity-50', 'cursor-not-allowed');
          continueButton.setAttribute('aria-disabled', 'false');
        } else {
          continueButton.disabled = true;
          continueButton.classList.add('opacity-50', 'cursor-not-allowed');
          continueButton.setAttribute('aria-disabled', 'true');
        }
      }
      
      // Announce change for screen readers
      if (this.ui && this.ui.announce) {
        const value = this.valuesData.find(v => v.id === valueId);
        if (value) {
          if (newState) {
            this.ui.announce(`${value.name} selected. ${this.selectedCount} of ${this.maxSelections} values selected.`, 'polite');
          } else {
            this.ui.announce(`${value.name} removed. ${this.selectedCount} of ${this.maxSelections} values selected.`, 'polite');
          }
        }
      }
      
    } catch (error) {
      console.error('[SelectionComponent] Toggle error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error toggling value selection. Please try again.', 'assertive');
      }
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
      console.error('[SelectionComponent] Back error:', error);
      
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
      // Validate minimum selections
      if (this.selectedCount < this.minSelections) {
        if (this.ui && this.ui.announce) {
          this.ui.announce(`Please select at least ${this.minSelections} values to continue.`, 'assertive');
        }
        return;
      }
      
      // Go to the next step
      this.service.nextStep();
      
      // Log analytics event
      if (window.analytics) {
        window.analytics.track('values_selection_completed', {
          count: this.selectedCount
        });
      }
    } catch (error) {
      console.error('[SelectionComponent] Continue error:', error);
      
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
      title: 'Select Your Values',
      description: 'Choose the values that are most important to you from the list below.',
      instructions: [
        'Click on a card to select or deselect a value',
        `Select at least ${this.minSelections} and up to ${this.maxSelections} values`,
        'You can always come back and change your selections later'
      ]
    };
  }
}

// Export the component
export { SelectionComponent };
