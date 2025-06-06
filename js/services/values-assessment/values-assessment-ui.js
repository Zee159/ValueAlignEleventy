/**
 * Values Assessment UI Controller
 * Manages the UI rendering and user interactions for the values assessment
 * 
 * @requires ValuesAssessmentService
 * @requires ValuesAssessmentStorage
 * @requires themeSystem for theme integration per ValueAlign standards
 */

import { componentRegistry } from '../../components/values-assessment/component-registry.js';

class ValuesAssessmentUI {
  /**
   * Initialize the UI controller
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    // Store options for component instantiation
    this.options = options;
    
    // Core services
    this.service = options.service;
    this.storageService = options.storageService;
    this.themeService = options.themeService || window.themeSystem;
    this.logger = options.logger || console;
    
    // DOM elements
    this.container = options.container || document.getElementById('values-assessment-container');
    this.progressContainer = options.progressContainer || document.getElementById('progress-container');
    
    // Accessibility helpers
    this.announcer = {
      polite: document.getElementById('values-assessment-status') || this._createAnnouncer('polite'),
      assertive: document.getElementById('values-assessment-announcer') || this._createAnnouncer('assertive')
    };
    
    // Component management
    this.componentCache = {};
    this.componentCacheExpiration = 5 * 60 * 1000;
    this.renderedComponents = {};
    
    // State tracking
    this.isRendering = false;
    this.renderQueue = [];
    
    // Debug mode
    this.debug = options.debug || false;
    
    // Initialize UI controller
    this._initialize();
    
    this._log('UI controller initialized');
  }
  
  /**
   * Initialize the UI controller
   * @private
   */
  async _initialize() {
    try {
      // Apply theme immediately per ValueAlign standards
      this.applyTheme();
      
      // Add theme change listener
      window.addEventListener('themechange', () => this.applyTheme());
      
      // Set up global event listeners
      this._setupEventListeners();
      
      // Set up service event listeners
      if (this.service) {
        this._setupServiceListeners();
      } else {
        this._logError('Service not provided');
        this.announce('Error initializing values assessment. Please refresh the page.', 'assertive');
      }
    } catch (error) {
      this._logError('Initialization error:', error);
    }
  }
  
  /**
   * Set up global event listeners
   * @private
   */
  _setupEventListeners() {
    if (!this.container) return;
    
    try {
      // Event delegation for all clicks within the assessment container
      this.container.addEventListener('click', (event) => this._handleContainerClick(event));
      
      // Form submission handling
      this.container.addEventListener('submit', (event) => this._handleFormSubmit(event));
      
      // Keyboard event handling for navigation
      this.container.addEventListener('keydown', (event) => this._handleKeyboardNavigation(event));
      
      // Handle drag and drop events for prioritization
      this.container.addEventListener('dragstart', (event) => this._handleDragStart(event));
      this.container.addEventListener('dragover', (event) => this._handleDragOver(event));
      this.container.addEventListener('drop', (event) => this._handleDrop(event));
      
      this._debug('Global event listeners initialized');
    } catch (error) {
      this._logError('Failed to set up event listeners', error);
    }
  }
  
  /**
   * Handle click events within the container using event delegation
   * @private
   * @param {Event} event - The click event
   */
  _handleContainerClick(event) {
    // Skip if propagation has been stopped
    if (!event.bubbles) return;
    
    // Skip if no target
    if (!event.target) return;
    
    try {
      const target = event.target;
      
      // Handle navigation button clicks
      if (target.matches('[data-action="next-step"]')) {
        event.preventDefault();
        this.service.goToNextStep();
        return;
      }
      
      if (target.matches('[data-action="prev-step"]')) {
        event.preventDefault();
        this.service.goToPreviousStep();
        return;
      }
      
      // Handle value selection/deselection
      if (target.matches('[data-action="toggle-value"]') || target.closest('[data-action="toggle-value"]')) {
        const valueCard = target.matches('[data-action="toggle-value"]') ? 
          target : 
          target.closest('[data-action="toggle-value"]');
        
        const valueId = valueCard.dataset.valueId;
        if (valueId) {
          event.preventDefault();
          this._handleValueToggle(valueId, valueCard);
          return;
        }
      }
      
      // Other click handlers can be added here
      
    } catch (error) {
      this._logError('Error handling click event', error);
    }
  }
  
  /**
   * Handle form submissions
   * @private
   * @param {Event} event - The submit event
   */
  _handleFormSubmit(event) {
    // Skip if no target
    if (!event.target) return;
    
    try {
      const form = event.target;
      
      // Handle reflection form submissions
      if (form.matches('[data-form="reflection"]')) {
        event.preventDefault();
        
        const formData = new FormData(form);
        const reflectionData = {};
        
        for (const [key, value] of formData.entries()) {
          reflectionData[key] = value;
        }
        
        this.service.saveReflectionData(reflectionData);
        this.announce('Reflection saved', 'polite');
        return;
      }
      
      // Other form handlers can be added here
      
    } catch (error) {
      this._logError('Error handling form submission', error);
    }
  }
  
  /**
   * Handle keyboard navigation for accessibility
   * @private
   * @param {KeyboardEvent} event - The keydown event
   */
  _handleKeyboardNavigation(event) {
    // Skip if no target or if modifier keys are pressed
    if (!event.target || event.metaKey || event.ctrlKey) return;
    
    try {
      const target = event.target;
      const key = event.key;
      
      // Handle value card keyboard navigation
      if (target.matches('[data-value-card]') || target.closest('[data-value-card]')) {
        const card = target.matches('[data-value-card]') ? 
          target : 
          target.closest('[data-value-card]');
        
        if (['Enter', ' '].includes(key)) {
          // Enter or Space activates the card
          event.preventDefault();
          card.click();
          return;
        }
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
          // Arrow keys navigate between cards
          event.preventDefault();
          this._navigateCards(card, key);
          return;
        }
      }
      
      // Handle prioritization list keyboard navigation
      if (target.matches('[data-priority-item]') || target.closest('[data-priority-item]')) {
        const item = target.matches('[data-priority-item]') ? 
          target : 
          target.closest('[data-priority-item]');
        
        if (key === 'ArrowUp' && !event.shiftKey) {
          // Arrow up moves focus to previous item
          event.preventDefault();
          this._focusPriorityItem(item, 'previous');
          return;
        }
        
        if (key === 'ArrowDown' && !event.shiftKey) {
          // Arrow down moves focus to next item
          event.preventDefault();
          this._focusPriorityItem(item, 'next');
          return;
        }
        
        if ((key === 'ArrowUp' && event.shiftKey) || key === 'PageUp') {
          // Shift+Arrow up moves item up in priority
          event.preventDefault();
          this._movePriorityItem(item, 'up');
          return;
        }
        
        if ((key === 'ArrowDown' && event.shiftKey) || key === 'PageDown') {
          // Shift+Arrow down moves item down in priority
          event.preventDefault();
          this._movePriorityItem(item, 'down');
          return;
        }
      }
      
    } catch (error) {
      this._logError('Error handling keyboard navigation', error);
    }
  }
  
  /**
   * Apply the current theme to assessment UI
   * Following ValueAlign theme management standards
   */
  applyTheme() {
    if (!this.themeService) {
      console.warn('[ValuesUI] Theme system not available');
      return;
    }
    
    try {
      const currentTheme = this.themeService.getCurrentTheme();
      
      if (this.container) {
        // Remove any existing theme classes
        this.container.classList.remove('theme-light', 'theme-dark');
        
        // Add current theme class
        this.container.classList.add(`theme-${currentTheme}`);
        
        console.log(`[ValuesUI] Applied theme: ${currentTheme}`);
      }
    } catch (error) {
      console.error('[ValuesUI] Theme application error:', error);
    }
  }
  
  /**
   * Set up event listeners from the assessment service
   * @private
   */
  _setupServiceListeners() {
    if (!this.service || !this.service.on) {
      this._logError('Service does not have event support');
      return;
    }
    
    // Core events
    this.service.on('initialized', (data) => {
      this._log('Service initialized', data);
      this.render();
    });
    
    this.service.on('stepChanged', (data) => {
      this._log('Step changed', data);
      this.updateProgress(data.step);
      this.render();
    });
    
    this.service.on('error', (data) => {
      this._logError('Service error:', data);
      this.announce(`Error: ${data.message || data.error}`, 'assertive');
    });
    
    // Data events
    this.service.on('dataLoaded', (data) => {
      this._log('Assessment data loaded', data);
    });
    
    this.service.on('dataSaved', (data) => {
      this._log('Assessment data saved', data);
      this.announce('Your progress has been saved', 'polite');
    });
    
    // Selection events
    this.service.on('valueSelected', (data) => {
      this._log('Value selected', data);
      this._updateValueCardState(data.valueId, true);
    });
    
    this.service.on('valueDeselected', (data) => {
      this._log('Value deselected', data);
      this._updateValueCardState(data.valueId, false);
    });
    
    // Prioritization events
    this.service.on('valuesPrioritized', (data) => {
      this._log('Values prioritized', data);
      this.announce('Values have been prioritized', 'polite');
    });
    
    // Premium events
    this.service.on('premiumFeatureAccessed', (data) => {
      this._log('Premium feature accessed', data);
    });
    
    this._log('Service event listeners initialized');
  }
  
  /**
   * Handle drag start event for prioritization
   * @private
   * @param {DragEvent} event - The drag start event
   */
  _handleDragStart(event) {
    try {
      // Only handle drag events for priority items
      const item = event.target.closest('[data-priority-item]');
      if (!item) return;
      
      const valueId = item.dataset.valueId;
      if (!valueId) return;
      
      // Set drag data
      event.dataTransfer.setData('text/plain', valueId);
      event.dataTransfer.effectAllowed = 'move';
      
      // Add dragging class for styling
      item.classList.add('dragging');
      
      // Set custom drag image if supported
      if (event.dataTransfer.setDragImage) {
        const dragImage = item.cloneNode(true);
        dragImage.style.opacity = '0.8';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        
        event.dataTransfer.setDragImage(dragImage, 10, 10);
        
        // Clean up after drag
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 0);
      }
      
      // Announce for screen readers
      this.announce(`Started dragging ${item.textContent.trim()}. Use arrow keys with shift to reorder.`, 'polite');
      
    } catch (error) {
      this._logError('Error handling drag start', error);
    }
  }
  
  /**
   * Handle drag over event for prioritization
   * @private
   * @param {DragEvent} event - The drag over event
   */
  _handleDragOver(event) {
    try {
      // Find the nearest priority item container
      const container = event.target.closest('[data-priority-container]');
      if (!container) return;
      
      // Allow drop
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      
      // Find closest drop target
      const item = event.target.closest('[data-priority-item]');
      if (!item) return;
      
      // Get all items
      const items = Array.from(container.querySelectorAll('[data-priority-item]'));
      if (!items.includes(item)) return;
      
      // Add drop target indicator
      const rect = item.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      
      // Remove all drop indicators
      items.forEach(i => {
        i.classList.remove('drop-above', 'drop-below');
      });
      
      // Add drop indicator to current target
      if (event.clientY < midpoint) {
        item.classList.add('drop-above');
      } else {
        item.classList.add('drop-below');
      }
      
    } catch (error) {
      this._logError('Error handling drag over', error);
    }
  }
  
  /**
   * Handle drop event for prioritization
   * @private
   * @param {DragEvent} event - The drop event
   */
  _handleDrop(event) {
    try {
      // Find the priority container
      const container = event.target.closest('[data-priority-container]');
      if (!container) return;
      
      // Allow drop
      event.preventDefault();
      
      // Get the value ID being dragged
      const valueId = event.dataTransfer.getData('text/plain');
      if (!valueId) return;
      
      // Find source and target elements
      const sourceItem = container.querySelector(`[data-value-id="${valueId}"]`);
      if (!sourceItem) return;
      
      const targetItem = event.target.closest('[data-priority-item]');
      if (!targetItem || targetItem === sourceItem) return;
      
      // Determine drop position
      const rect = targetItem.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const insertBefore = event.clientY < midpoint;
      
      // Clean up drag state
      sourceItem.classList.remove('dragging');
      const allItems = Array.from(container.querySelectorAll('[data-priority-item]'));
      allItems.forEach(item => {
        item.classList.remove('drop-above', 'drop-below');
      });
      
      // Get all value IDs in current order
      const valueIds = allItems.map(item => item.dataset.valueId);
      
      // Calculate the new index
      let sourceIndex = valueIds.indexOf(valueId);
      let targetIndex = valueIds.indexOf(targetItem.dataset.valueId);
      
      if (sourceIndex < 0 || targetIndex < 0) return;
      
      // If dragging downward and inserting after, adjust the target index
      if (sourceIndex < targetIndex && !insertBefore) {
        targetIndex++;
      }
      
      // If dragging upward and inserting before, adjust the target index
      if (sourceIndex > targetIndex && insertBefore) {
        targetIndex--;
      }
      
      // Remove the source from current position
      valueIds.splice(sourceIndex, 1);
      
      // Calculate the new target position
      const newTargetIndex = insertBefore ? 
        targetIndex > sourceIndex ? targetIndex - 1 : targetIndex : 
        targetIndex < sourceIndex ? targetIndex + 1 : targetIndex;
      
      // Insert at the new position
      valueIds.splice(newTargetIndex, 0, valueId);
      
      // Save the new order
      if (this.service && typeof this.service.updatePriorities === 'function') {
        this.service.updatePriorities(valueIds);
        
        // Announce for screen readers
        const sourceName = sourceItem.querySelector('[data-value-name]')?.textContent || 'Value';
        const position = newTargetIndex + 1;
        this.announce(`${sourceName} moved to priority position ${position}`, 'polite');
      }
      
    } catch (error) {
      this._logError('Error handling drop', error);
    }
  }
  
  /**
   * Handle value selection/deselection
   * @private
   * @param {string} valueId - The ID of the value to toggle
   * @param {HTMLElement} valueCard - The value card element
   */
  _handleValueToggle(valueId, valueCard) {
    if (!this.service || !valueId) return;
    
    try {
      // Check if this value is currently selected
      const isSelected = valueCard.classList.contains('selected');
      
      // Get maximum allowed selections
      const maxSelections = this.service.maxSelections || 5;
      
      // Get current selections count
      const currentSelections = this.service.getSelectedValues().length;
      
      if (isSelected) {
        // Deselect the value
        this.service.deselectValue(valueId);
        valueCard.classList.remove('selected');
        valueCard.setAttribute('aria-selected', 'false');
        
        // Update accessible label
        const valueName = valueCard.querySelector('[data-value-name]')?.textContent || 'Value';
        this.announce(`${valueName} deselected`, 'polite');
      } else {
        // Check if we've reached the maximum selections
        if (!isSelected && currentSelections >= maxSelections) {
          this.announce(`Maximum of ${maxSelections} values already selected`, 'assertive');
          return;
        }
        
        // Select the value
        this.service.selectValue(valueId);
        valueCard.classList.add('selected');
        valueCard.setAttribute('aria-selected', 'true');
        
        // Update accessible label
        const valueName = valueCard.querySelector('[data-value-name]')?.textContent || 'Value';
        this.announce(`${valueName} selected. ${currentSelections + 1} of ${maxSelections} values selected`, 'polite');
      }
      
      // Update selection counter if it exists
      this._updateSelectionCounter();
      
    } catch (error) {
      this._logError('Error toggling value selection', error);
    }
  }
  
  /**
   * Update the selection counter UI
   * @private
   */
  _updateSelectionCounter() {
    if (!this.service) return;
    
    try {
      // Find counter element
      const counterElement = this.container.querySelector('[data-selection-counter]');
      if (!counterElement) return;
      
      // Get current selections and maximum
      const currentSelections = this.service.getSelectedValues().length;
      const maxSelections = this.service.maxSelections || 5;
      
      // Update counter text
      counterElement.textContent = `${currentSelections}/${maxSelections}`;
      
      // Update progress bar if it exists
      const progressBar = this.container.querySelector('[data-selection-progress]');
      if (progressBar) {
        const percentage = Math.round((currentSelections / maxSelections) * 100);
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', currentSelections);
        progressBar.setAttribute('aria-valuemax', maxSelections);
      }
      
    } catch (error) {
      this._logError('Error updating selection counter', error);
    }
  }
  
  /**
   * Update visual state of a value card
   * @private
   * @param {string} valueId - The ID of the value to update
   * @param {boolean} isSelected - Whether the value is selected
   */
  _updateValueCardState(valueId, isSelected) {
    if (!this.container || !valueId) return;
    
    try {
      // Find the card
      const valueCard = this.container.querySelector(`[data-value-id="${valueId}"]`);
      if (!valueCard) return;
      
      // Update selection state
      if (isSelected) {
        valueCard.classList.add('selected');
        valueCard.setAttribute('aria-selected', 'true');
      } else {
        valueCard.classList.remove('selected');
        valueCard.setAttribute('aria-selected', 'false');
      }
      
      // Update counter
      this._updateSelectionCounter();
      
    } catch (error) {
      this._logError('Error updating value card state', error);
    }
  }
  
  /**
   * Navigate between value cards with keyboard
   * @private
   * @param {HTMLElement} currentCard - The currently focused card
   * @param {string} direction - The direction to navigate (ArrowUp, ArrowDown, ArrowLeft, ArrowRight)
   */
  _navigateCards(currentCard, direction) {
    if (!this.container || !currentCard) return;
    
    try {
      // Get all cards in the grid
      const allCards = Array.from(this.container.querySelectorAll('[data-value-card]'));
      if (!allCards.includes(currentCard)) return;
      
      // Get current card index
      const currentIndex = allCards.indexOf(currentCard);
      
      // Find the number of cards per row (query one card's computed style)
      const cardStyle = window.getComputedStyle(currentCard);
      const containerStyle = window.getComputedStyle(currentCard.parentElement);
      const cardWidth = parseFloat(cardStyle.width) + parseFloat(cardStyle.marginLeft) + parseFloat(cardStyle.marginRight);
      const containerWidth = parseFloat(containerStyle.width);
      const cardsPerRow = Math.max(1, Math.floor(containerWidth / cardWidth));
      
      // Calculate the target index based on direction
      let targetIndex;
      
      switch (direction) {
        case 'ArrowLeft':
          targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
          break;
        case 'ArrowRight':
          targetIndex = currentIndex < allCards.length - 1 ? currentIndex + 1 : currentIndex;
          break;
        case 'ArrowUp':
          targetIndex = currentIndex >= cardsPerRow ? currentIndex - cardsPerRow : currentIndex;
          break;
        case 'ArrowDown':
          targetIndex = currentIndex + cardsPerRow < allCards.length ? currentIndex + cardsPerRow : currentIndex;
          break;
        default:
          return;
      }
      
      // Focus the new card
      if (targetIndex !== currentIndex && allCards[targetIndex]) {
        allCards[targetIndex].focus();
        
        // Announce for screen readers
        const valueName = allCards[targetIndex].querySelector('[data-value-name]')?.textContent || 'Value';
        this.announce(`${valueName}. Press Enter or Space to select.`, 'polite');
      }
      
    } catch (error) {
      this._logError('Error navigating cards', error);
    }
  }
  
  /**
   * Focus on a priority item in the specified direction
   * @private
   * @param {HTMLElement} currentItem - The currently focused item
   * @param {string} direction - The direction to move focus (previous or next)
   */
  _focusPriorityItem(currentItem, direction) {
    if (!this.container || !currentItem) return;
    
    try {
      // Get all priority items
      const container = currentItem.closest('[data-priority-container]');
      if (!container) return;
      
      const allItems = Array.from(container.querySelectorAll('[data-priority-item]'));
      if (!allItems.includes(currentItem)) return;
      
      // Get current item index
      const currentIndex = allItems.indexOf(currentItem);
      
      // Calculate the target index based on direction
      let targetIndex;
      
      if (direction === 'previous') {
        targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      } else if (direction === 'next') {
        targetIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : currentIndex;
      } else {
        return;
      }
      
      // Focus the new item
      if (targetIndex !== currentIndex && allItems[targetIndex]) {
        allItems[targetIndex].focus();
        
        // Announce for screen readers
        const valueName = allItems[targetIndex].querySelector('[data-value-name]')?.textContent || 'Value';
        const position = targetIndex + 1;
        this.announce(`${valueName}, priority ${position} of ${allItems.length}`, 'polite');
      }
      
    } catch (error) {
      this._logError('Error focusing priority item', error);
    }
  }
  
  /**
   * Move a priority item up or down in the list
   * @private
   * @param {HTMLElement} currentItem - The item to move
   * @param {string} direction - The direction to move (up or down)
   */
  _movePriorityItem(currentItem, direction) {
    if (!this.container || !currentItem || !this.service) return;
    
    try {
      // Get the container and all items
      const container = currentItem.closest('[data-priority-container]');
      if (!container) return;
      
      const allItems = Array.from(container.querySelectorAll('[data-priority-item]'));
      if (!allItems.includes(currentItem)) return;
      
      // Get current item index
      const currentIndex = allItems.indexOf(currentItem);
      
      // Calculate the target index based on direction
      let targetIndex;
      
      if (direction === 'up') {
        targetIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
      } else if (direction === 'down') {
        targetIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : currentIndex;
      } else {
        return;
      }
      
      // Skip if there's no change
      if (targetIndex === currentIndex) return;
      
      // Get all value IDs in current order
      const valueIds = allItems.map(item => item.dataset.valueId);
      
      // Get the value ID to move
      const valueId = currentItem.dataset.valueId;
      if (!valueId) return;
      
      // Remove the value from its current position
      valueIds.splice(currentIndex, 1);
      
      // Insert it at the new position
      valueIds.splice(targetIndex, 0, valueId);
      
      // Save the new order
      if (typeof this.service.updatePriorities === 'function') {
        this.service.updatePriorities(valueIds);
        
        // Announce for screen readers
        const valueName = currentItem.querySelector('[data-value-name]')?.textContent || 'Value';
        const newPosition = targetIndex + 1;
        this.announce(`${valueName} moved to priority ${newPosition}`, 'polite');
        
        // Focus will be handled by the component after rerendering
      }
      
    } catch (error) {
      this._logError('Error moving priority item', error);
    }
  }
  
  /**
   * Render the current step UI
   * @returns {Promise<void>}
   */
  async render() {
    if (!this.container || !this.service) return;
    
    // Prevent multiple concurrent renders
    if (this.isRendering) {
      this._debug('Render already in progress, queueing this request');
      this.renderQueue.push(true);
      return;
    }
    
    this.isRendering = true;
    const currentStep = this.service.currentStep;
    
    try {
      // Show loading state
      this._showLoading();
      
      // Load and render appropriate content based on step
      let componentName;
      let data = this.service.getCurrentStepData();
      
      switch (currentStep) {
        case 1:
          componentName = 'introduction';
          break;
        case 2:
          componentName = 'selection';
          break;
        case 3:
          componentName = 'prioritization';
          break;
        case 4:
          componentName = 'reflection';
          break;
        case 5:
          // Only for premium users
          componentName = this.service.isPremiumUser ? 'ai-insights' : 'summary';
          break;
        default:
          componentName = 'introduction';
      }
      
      // Update progress indicator
      this.updateProgress(currentStep);
      
      // Load and render the component
      const component = await this._loadComponent(componentName);
      
      // Clear existing content
      this.container.innerHTML = '';
      
      // Render the component if it has a render method
      if (typeof component.render === 'function') {
        await component.render(data);
        this._debug(`Component '${componentName}' rendered with data:`, data);
      } else {
        this._logError(`Component '${componentName}' has no render method`);
        this._renderFallback(componentName);
      }
      
      // Focus on first focusable element for accessibility
      this._setInitialFocus();
      
      // Announce for screen readers
      this.announce(`${this._getStepName(currentStep)} screen loaded`, 'polite');
      
    } catch (error) {
      this._logError('Render error:', error);
      this.announce('Error rendering assessment. Please refresh the page.', 'assertive');
      
      // Show error message in container
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 text-red-800 rounded-lg">
          <h2 class="font-bold">Error</h2>
          <p>There was a problem loading the values assessment.</p>
          <button 
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            onclick="window.location.reload()">
            Refresh Page
          </button>
        </div>
      `;
    } finally {
      this.isRendering = false;
      
      // Check if there are queued render requests
      if (this.renderQueue.length > 0) {
        this._debug('Processing queued render request');
        this.renderQueue.shift();
        setTimeout(() => this.render(), 10);
      }
    }
  }
  
  /**
   * Update progress indicator
   * @param {number} step Current step
   */
  updateProgress(step) {
    if (!this.progressContainer) return;
    
    const totalSteps = this.service.totalSteps || 4;
    const percentage = Math.round((step / totalSteps) * 100);
    
    try {
      // Create progress elements if they don't exist
      if (!this.renderedComponents.progressBar) {
        this._createProgressElements();
      }
      
      // Update progress bar
      const progressBar = this.renderedComponents.progressBar;
      if (progressBar) {
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
      }
      
      // Update progress text
      const progressText = this.renderedComponents.progressText;
      if (progressText) {
        progressText.textContent = `Step ${step} of ${totalSteps}`;
      }
      
      // Announce progress for accessibility
      this.announce(`Step ${step} of ${totalSteps}, ${percentage}% complete`, 'polite');
    } catch (error) {
      console.error('[ValuesUI] Progress update error:', error);
    }
  }
  
  /**
   * Create progress indicator elements
   * @private
   */
  _createProgressElements() {
    if (!this.progressContainer) return;
    
    try {
      // Clear existing content
      this.progressContainer.innerHTML = '';
      
      // Create progress text
      const progressText = document.createElement('div');
      progressText.className = 'text-sm font-medium mb-1';
      progressText.id = 'progress-text';
      progressText.setAttribute('aria-live', 'polite');
      
      // Create progress bar container
      const progressBarContainer = document.createElement('div');
      progressBarContainer.className = 'h-2 bg-gray-200 rounded overflow-hidden';
      progressBarContainer.setAttribute('role', 'progressbar');
      progressBarContainer.setAttribute('aria-valuemin', '0');
      progressBarContainer.setAttribute('aria-valuemax', '100');
      
      // Create progress bar
      const progressBar = document.createElement('div');
      progressBar.className = 'h-full bg-blue-600 rounded transition-all duration-300 ease-out';
      progressBar.id = 'assessment-progress';
      
      // Assemble elements
      progressBarContainer.appendChild(progressBar);
      this.progressContainer.appendChild(progressText);
      this.progressContainer.appendChild(progressBarContainer);
      
      // Store references
      this.renderedComponents.progressText = progressText;
      this.renderedComponents.progressBar = progressBar;
    } catch (error) {
      console.error('[ValuesUI] Error creating progress elements:', error);
    }
  }
  
  /**
   * Make an accessibility announcement
   * @param {string} message The message to announce
   * @param {string} priority Priority level (polite or assertive)
   */
  announce(message, priority = 'polite') {
    if (!message) return;
    
    try {
      const announcer = this.announcer[priority];
      if (announcer) {
        announcer.textContent = message;
        
        // Log for debugging
        console.log(`[ValuesUI] Announced (${priority}): ${message}`);
      }
    } catch (error) {
      console.error('[ValuesUI] Announcement error:', error);
    }
  }
  
  /**
   * Create a screen reader announcer element
   * @private
   * @param {string} type Announcer type (polite or assertive)
   * @returns {HTMLElement} The announcer element
   */
  _createAnnouncer(type) {
    const id = type === 'assertive' ? 'values-assessment-announcer' : 'values-assessment-status';
    
    // Check if announcer already exists
    let announcer = document.getElementById(id);
    if (announcer) return announcer;
    
    // Create new announcer
    announcer = document.createElement('div');
    announcer.id = id;
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', type);
    announcer.setAttribute('aria-atomic', 'true');
    
    // Add to document
    document.body.appendChild(announcer);
    
    return announcer;
  }
  
  /**
   * Logger wrapper for consistent logging
   * @private
   * @param {string} message - Message to log
   * @param {*} [data] - Optional data to log
   */
  _log(message, data) {
    if (!this.debug && message.toLowerCase().includes('debug')) return;
    
    const prefix = '[ValuesUI]';
    if (data) {
      this.logger.log(`${prefix} ${message}`, data);
    } else {
      this.logger.log(`${prefix} ${message}`);
    }
  }
  
  /**
   * Error logger wrapper
   * @private
   * @param {string} message - Error message
   * @param {Error} [error] - Optional error object
   */
  _logError(message, error) {
    const prefix = '[ValuesUI]';
    if (error) {
      this.logger.error(`${prefix} ${message}`, error);
    } else {
      this.logger.error(`${prefix} ${message}`);
    }
  }
  
  /**
   * Debug logger wrapper - only logs when debug is true
   * @private
   * @param {string} message - Debug message
   * @param {*} [data] - Optional data to log
   */
  _debug(message, data) {
    if (!this.debug) return;
    
    const prefix = '[ValuesUI:DEBUG]';
    if (data) {
      this.logger.log(`${prefix} ${message}`, data);
    } else {
      this.logger.log(`${prefix} ${message}`);
    }
  }
  
  /**
   * Load a component module dynamically
   * @private
   * @param {string} componentName - The name of the component to load
   * @returns {Promise<Object>} The loaded component
   */
  async _loadComponent(componentName) {
    try {
      // Check if we have this component in the registry
      if (!componentRegistry.getModulePath(componentName)) {
        this._logError(`Component ${componentName} not found in registry`);
        return null;
      }
      
      // Check cache first
      if (this.componentCache[componentName]) {
        const cached = this.componentCache[componentName];
        
        // Check if cache is still valid (5 minute expiration)
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
          this._log(`Using cached component ${componentName}`);
          return cached.component;
        } else {
          this._log(`Cache expired for ${componentName}`);
          delete this.componentCache[componentName];
        }
      }
      
      this._log(`Loading component ${componentName}`);
      
      try {
        // Use component registry to create component instance
        const component = await componentRegistry.createComponent(componentName, {
          ui: this,
          service: this.service,
          container: this.container,
          themeService: this.themeService,
          logger: this.options.logger || console,
          storageService: this.storageService
        });
        
        // Cache the component
        this.componentCache[componentName] = {
          component,
          timestamp: Date.now()
        };
        
        return component;
      } catch (e) {
        this._logError(`Failed to load component ${componentName} using registry`, e);
        
        // Try to get from global scope as fallback
        const globalComponentName = `ValuesAssessment${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Component`;
        const GlobalComponent = window[globalComponentName];
        
        if (!GlobalComponent) {
          throw new Error(`Component '${componentName}' not found in dynamic import or global scope`);
        }
        
        // Create instance from global
        const options = {
          ui: this,
          container: this.container,
          service: this.service,
          storageService: this.storageService,
          themeService: this.themeService,
          logger: this.options.logger || console
        };
        
        const component = new GlobalComponent(options);
        
        // Cache the component
        this.componentCache[componentName] = {
          component,
          timestamp: Date.now()
        };
        
        this._log(`Component '${componentName}' loaded from global scope`);
        return component;
      }
    } catch (error) {
      this._logError(`Failed to load component '${componentName}'`, error);
      return null;
    }
  }
  
  /**
   * Show loading state in the container
   * @private
   */
  _showLoading() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="p-8 text-center" role="status" aria-live="polite">
        <svg class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <p class="mt-4">Loading values assessment...</p>
      </div>
    `;
    
    this._debug('Showing loading state');
  }

  /**
   * Set initial focus on first interactive element for accessibility
   * @private
   */
  _setInitialFocus() {
    if (!this.container) return;
    
    try {
      // Find the first focusable element and focus it
      const focusableElements = this.container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        this._debug('Set focus on first interactive element');
      }
    } catch (error) {
      this._logError('Failed to set initial focus', error);
    }
  }
  
  /**
   * Get human-readable name for a step
   * @private
   * @param {number} step - The step number
   * @returns {string} - The step name
   */
  _getStepName(step) {
    const stepNames = {
      1: 'Introduction',
      2: 'Value Selection',
      3: 'Value Prioritization',
      4: 'Value Reflection',
      5: this.service.isPremiumUser ? 'AI Insights' : 'Values Summary'
    };
    
    return stepNames[step] || 'Unknown';
  }
  
  /**
   * Render fallback UI when component loading fails
   * @private
   * @param {string} componentName - The name of the component that failed
   */
  _renderFallback(componentName) {
    const stepName = this._getStepName(this.service.currentStep);
    
    this.container.innerHTML = `
      <div class="p-4">
        <h1 class="text-xl font-bold">${stepName}</h1>
        <p class="my-4">This part of the values assessment is currently being updated.</p>
        <div class="flex space-x-4">
          <button 
            id="retry-component-btn"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Try Again
          </button>
          <button 
            id="continue-assessment-btn"
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Continue to Next Step
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('retry-component-btn')?.addEventListener('click', () => {
      this.render();
    });
    
    document.getElementById('continue-assessment-btn')?.addEventListener('click', () => {
      this.service.goToNextStep();
    });
    
    this._logError(`Used fallback for component '${componentName}'`);
  }
}

// Export for ES modules
export { ValuesAssessmentUI };

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.ValuesAssessmentUI = ValuesAssessmentUI;
}
