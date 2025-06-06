/**
 * Values Assessment Prioritization List Component
 * Handles the prioritized list UI and reordering functionality
 */

class PrioritizationListComponent {
  /**
   * Create a prioritization list component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.valuesData = options.valuesData || window.valuesData || [];
    
    // Bind methods for event listeners
    this.moveValueUp = this.moveValueUp.bind(this);
    this.moveValueDown = this.moveValueDown.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }
  
  /**
   * Render the prioritized list
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      // Get prioritized values from service
      const prioritizedValues = this.service?.prioritizedValues || [];
      
      // Create the list
      const list = document.createElement('ul');
      list.id = 'prioritized-values-list';
      list.className = 'divide-y divide-gray-200 dark:divide-gray-700';
      list.setAttribute('role', 'list');
      list.setAttribute('aria-label', 'Prioritized values');
      
      // Check if we have values
      if (!prioritizedValues || prioritizedValues.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'p-4 text-center text-gray-500 dark:text-gray-400';
        emptyMessage.textContent = 'No values selected. Please go back and select values first.';
        list.appendChild(emptyMessage);
      } else {
        // Populate list with values
        this.populateValuesList(list, prioritizedValues);
      }
      
      // Add list to container
      this.container.appendChild(list);
      
      return this.container;
    } catch (error) {
      console.error('[PrioritizationListComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <h2 class="font-bold">Error</h2>
          <p>There was a problem loading the prioritized values list.</p>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Populate the values list
   * @param {HTMLElement} list The list element to populate
   * @param {Array<string>} prioritizedValues Array of value IDs in priority order
   */
  populateValuesList(list, prioritizedValues) {
    prioritizedValues.forEach((valueId, index) => {
      // Find value data
      const valueData = this.valuesData.find(v => v.id === valueId);
      if (!valueData) return;
      
      // Create list item
      const listItem = document.createElement('li');
      listItem.id = `priority-item-${valueId}`;
      listItem.className = 'p-4 flex items-center justify-between';
      listItem.setAttribute('tabindex', '0');
      listItem.setAttribute('data-index', index.toString());
      listItem.setAttribute('data-value-id', valueId);
      listItem.setAttribute('role', 'listitem');
      listItem.setAttribute('aria-label', `${valueData.name}, priority ${index + 1} of ${prioritizedValues.length}`);
      
      // Add event listener for keyboard navigation
      listItem.addEventListener('keydown', (e) => this.handleKeydown(e, index));
      
      // Create rank indicator and value info
      const leftSection = document.createElement('div');
      leftSection.className = 'flex items-center';
      
      const rankBadge = document.createElement('div');
      rankBadge.className = 'w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold mr-3 flex-shrink-0';
      rankBadge.textContent = (index + 1).toString();
      rankBadge.setAttribute('aria-hidden', 'true');
      
      const valueInfo = document.createElement('div');
      
      const valueName = document.createElement('div');
      valueName.className = 'font-medium text-gray-900 dark:text-gray-100';
      valueName.textContent = valueData.name;
      
      const valueDescription = document.createElement('div');
      valueDescription.className = 'text-sm text-gray-500 dark:text-gray-400';
      valueDescription.textContent = valueData.description;
      
      valueInfo.appendChild(valueName);
      valueInfo.appendChild(valueDescription);
      
      leftSection.appendChild(rankBadge);
      leftSection.appendChild(valueInfo);
      
      // Create control buttons
      const controls = document.createElement('div');
      controls.className = 'flex space-x-1';
      controls.setAttribute('role', 'group');
      controls.setAttribute('aria-label', `Reorder controls for ${valueData.name}`);
      
      // Up button
      const upButton = document.createElement('button');
      upButton.className = `p-2 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500${index === 0 ? ' opacity-50 cursor-not-allowed' : ''}`;
      upButton.setAttribute('type', 'button');
      upButton.setAttribute('aria-label', `Move ${valueData.name} up`);
      upButton.setAttribute('tabindex', '-1'); // List item is focusable, not the buttons
      upButton.disabled = index === 0;
      
      // Up arrow icon
      upButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      `;
      
      upButton.addEventListener('click', () => this.moveValueUp(index));
      
      // Down button
      const downButton = document.createElement('button');
      downButton.className = `p-2 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500${index === prioritizedValues.length - 1 ? ' opacity-50 cursor-not-allowed' : ''}`;
      downButton.setAttribute('type', 'button');
      downButton.setAttribute('aria-label', `Move ${valueData.name} down`);
      downButton.setAttribute('tabindex', '-1'); // List item is focusable, not the buttons
      downButton.disabled = index === prioritizedValues.length - 1;
      
      // Down arrow icon
      downButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      `;
      
      downButton.addEventListener('click', () => this.moveValueDown(index));
      
      controls.appendChild(upButton);
      controls.appendChild(downButton);
      
      // Assemble list item
      listItem.appendChild(leftSection);
      listItem.appendChild(controls);
      
      list.appendChild(listItem);
    });
  }
  
  /**
   * Move a value up in the prioritized list
   * @param {number} index The current index of the value
   */
  moveValueUp(index) {
    if (!this.service || index <= 0) return;
    
    try {
      // Move the value up in the service
      const success = this.service.moveValueUp(index);
      
      if (success) {
        // Re-render the component
        this.render();
        
        // Focus the moved item
        this.focusItemByIndex(index - 1);
        
        // Announce change for screen readers
        if (this.ui && this.ui.announce) {
          const valueData = this.valuesData.find(v => v.id === this.service.prioritizedValues[index - 1]);
          if (valueData) {
            this.ui.announce(`Moved ${valueData.name} up to position ${index}`, 'polite');
          }
        }
      }
    } catch (error) {
      console.error('[PrioritizationListComponent] Move up error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error moving value. Please try again.', 'assertive');
      }
    }
  }
  
  /**
   * Move a value down in the prioritized list
   * @param {number} index The current index of the value
   */
  moveValueDown(index) {
    if (!this.service) return;
    
    const prioritizedValues = this.service.prioritizedValues || [];
    if (index >= prioritizedValues.length - 1) return;
    
    try {
      // Move the value down in the service
      const success = this.service.moveValueDown(index);
      
      if (success) {
        // Re-render the component
        this.render();
        
        // Focus the moved item
        this.focusItemByIndex(index + 1);
        
        // Announce change for screen readers
        if (this.ui && this.ui.announce) {
          const valueData = this.valuesData.find(v => v.id === this.service.prioritizedValues[index + 1]);
          if (valueData) {
            this.ui.announce(`Moved ${valueData.name} down to position ${index + 2}`, 'polite');
          }
        }
      }
    } catch (error) {
      console.error('[PrioritizationListComponent] Move down error:', error);
      
      if (this.ui && this.ui.announce) {
        this.ui.announce('Error moving value. Please try again.', 'assertive');
      }
    }
  }
  
  /**
   * Handle keydown events for keyboard navigation
   * @param {KeyboardEvent} event The keyboard event
   * @param {number} index The index of the current item
   */
  handleKeydown(event, index) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          // Move the item up
          this.moveValueUp(index);
        } else {
          // Focus previous item
          this.focusItemByIndex(index - 1);
        }
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        if (event.ctrlKey || event.metaKey) {
          // Move the item down
          this.moveValueDown(index);
        } else {
          // Focus next item
          this.focusItemByIndex(index + 1);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        // Focus first item
        this.focusItemByIndex(0);
        break;
        
      case 'End':
        event.preventDefault();
        // Focus last item
        const lastIndex = (this.service?.prioritizedValues?.length || 1) - 1;
        this.focusItemByIndex(lastIndex);
        break;
    }
  }
  
  /**
   * Focus a list item by its index
   * @param {number} index The index of the item to focus
   */
  focusItemByIndex(index) {
    if (index < 0) return;
    
    const prioritizedValues = this.service?.prioritizedValues || [];
    if (index >= prioritizedValues.length) return;
    
    // Find and focus the item
    const item = document.getElementById(`priority-item-${prioritizedValues[index]}`);
    if (item) {
      item.focus();
    }
  }
}

// Export the component
export { PrioritizationListComponent };
