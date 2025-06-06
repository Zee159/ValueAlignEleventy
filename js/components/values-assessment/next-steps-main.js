/**
 * Next Steps Main Component
 * Integrates base component with content components for the values assessment next steps
 * 
 * Following ValueAlign development rules for accessibility, theme integration, 
 * and progressive enhancement
 */

import { NextStepsBaseComponent } from './next-steps-base.js';
import { NextStepsContentComponent } from './next-steps-content.js';

class NextStepsMainComponent extends NextStepsBaseComponent {
  /**
   * Create a next steps main component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    super(options);
    
    // Initialize event handling
    this.events = new EventTarget();
    
    // Custom options
    this.onJournalAction = options.onJournalAction || (() => {});
    
    // User saved responses
    this.userResponses = {};
    
    // Bind methods
    this._handleActionClick = this._handleActionClick.bind(this);
  }
  
  /**
   * Initialize the component
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      const result = await super.initialize();
      
      if (result) {
        // Load user saved responses if available
        await this._loadUserResponses();
      }
      
      return result;
    } catch (error) {
      console.error('[NextStepsMainComponent] Initialization error:', error);
      this.hasError = true;
      this.errorMessage = error.message || 'Failed to initialize next steps component';
      return false;
    }
  }
  
  /**
   * Create content section - overriding base method
   * @private
   * @returns {HTMLElement} Content element
   */
  _createContent() {
    const content = document.createElement('div');
    content.className = 'next-steps-content mb-8';
    
    try {
      // Create content component with prioritized values
      const contentComponent = new NextStepsContentComponent({
        prioritizedValues: this.prioritizedValues,
        isPremiumUser: this.isPremiumUser,
        onActionClick: this._handleActionClick,
        maxCards: 3
      });
      
      content.appendChild(contentComponent.render());
      
      return content;
    } catch (error) {
      console.error('[NextStepsMainComponent] Error creating content:', error);
      
      // Fallback to basic content
      return super._createContent();
    }
  }
  
  /**
   * Handle action click from recommendation cards
   * @private
   * @param {Object} value Value object
   * @param {string} actionType Type of action clicked
   */
  _handleActionClick(value, actionType) {
    try {
      if (actionType === 'journal' && typeof this.onJournalAction === 'function') {
        this.onJournalAction(value);
      }
      
      // Dispatch event
      const event = new CustomEvent('next-steps-action', {
        detail: {
          value: value,
          actionType: actionType
        }
      });
      
      this.events.dispatchEvent(event);
      
      // Track analytics event
      if (window.analytics) {
        window.analytics.track('next_steps_action', {
          actionType: actionType,
          valueId: value.id,
          valueName: value.name
        });
      }
    } catch (error) {
      console.error('[NextStepsMainComponent] Error handling action click:', error);
    }
  }
  
  /**
   * Load user saved responses from service
   * @private
   * @returns {Promise<Object>} User responses object
   */
  async _loadUserResponses() {
    try {
      if (!this.service) return {};
      
      // Check if service has method to get responses
      if (typeof this.service.getReflectionResponses !== 'function') {
        return {};
      }
      
      const responses = await this.service.getReflectionResponses();
      this.userResponses = responses || {};
      
      return this.userResponses;
    } catch (error) {
      console.error('[NextStepsMainComponent] Error loading user responses:', error);
      return {};
    }
  }
  
  /**
   * Create header section with premium badge if applicable
   * @private
   * @returns {HTMLElement} Header element
   */
  _createHeader() {
    const header = document.createElement('header');
    header.className = 'mb-8';
    
    // Heading row with optional premium badge
    const headingRow = document.createElement('div');
    headingRow.className = 'flex items-center mb-2';
    
    const heading = document.createElement('h1');
    heading.className = 'text-2xl font-bold text-gray-900 dark:text-gray-100 mr-3';
    heading.textContent = 'Your Next Steps';
    heading.id = 'next-steps-heading';
    
    headingRow.appendChild(heading);
    
    // Add premium badge if premium user
    if (this.isPremiumUser) {
      const premiumBadge = document.createElement('span');
      premiumBadge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      premiumBadge.innerHTML = `
        <svg class="-ml-0.5 mr-1.5 h-2 w-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
        Premium
      `;
      
      headingRow.appendChild(premiumBadge);
    }
    
    const description = document.createElement('p');
    description.className = 'text-gray-700 dark:text-gray-300';
    description.textContent = 'Based on your values assessment, here are recommended next steps to help you live more aligned with your core values.';
    
    header.appendChild(headingRow);
    header.appendChild(description);
    
    return header;
  }
  
  /**
   * Create navigation section with additional export button
   * @private
   * @returns {HTMLElement} Navigation element
   */
  _createNavigation() {
    const navigation = document.createElement('div');
    navigation.className = 'next-steps-navigation pt-6 border-t border-gray-200 dark:border-gray-700';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-between';
    
    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    backButton.setAttribute('type', 'button');
    backButton.textContent = 'Back to Reflection';
    backButton.setAttribute('aria-label', 'Go back to guided reflection');
    backButton.addEventListener('click', () => this._handleBackClick());
    
    // Actions container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'space-x-3';
    
    // Export button (for premium users)
    if (this.isPremiumUser) {
      const exportButton = document.createElement('button');
      exportButton.className = 'px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      exportButton.setAttribute('type', 'button');
      exportButton.setAttribute('aria-label', 'Export your values assessment and next steps');
      exportButton.innerHTML = `
        <span class="flex items-center">
          <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Export
        </span>
      `;
      exportButton.addEventListener('click', () => this._handleExport());
      
      actionsContainer.appendChild(exportButton);
    }
    
    // Restart button
    const restartButton = document.createElement('button');
    restartButton.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    restartButton.setAttribute('type', 'button');
    restartButton.textContent = 'Start Over';
    restartButton.setAttribute('aria-label', 'Restart assessment from beginning');
    restartButton.addEventListener('click', () => this._handleRestartClick());
    
    actionsContainer.appendChild(restartButton);
    
    buttonContainer.appendChild(backButton);
    buttonContainer.appendChild(actionsContainer);
    
    navigation.appendChild(buttonContainer);
    
    return navigation;
  }
  
  /**
   * Handle export button click
   * @private
   */
  _handleExport() {
    try {
      // Track analytics event
      if (window.analytics) {
        window.analytics.track('next_steps_export', {
          valueCount: this.prioritizedValues?.length || 0
        });
      }
      
      // Dispatch event for parent components to handle
      const event = new CustomEvent('export-assessment', {
        detail: {
          prioritizedValues: this.prioritizedValues,
          userResponses: this.userResponses
        }
      });
      
      this.events.dispatchEvent(event);
      
      // Show temporary success message
      this._showToast('Assessment data prepared for export.');
    } catch (error) {
      console.error('[NextStepsMainComponent] Error handling export:', error);
      this._showToast('Error exporting data. Please try again.', 'error');
    }
  }
  
  /**
   * Show toast notification
   * @private
   * @param {string} message Message to show
   * @param {string} [type='success'] Type of notification
   */
  _showToast(message, type = 'success') {
    // Use UI service if available
    if (this.ui && typeof this.ui.showToast === 'function') {
      this.ui.showToast(message, type);
      return;
    }
    
    // Fallback implementation
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
      type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200'
    }`;
    toast.textContent = message;
    toast.setAttribute('role', 'alert');
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  }
}

// Export the component
export { NextStepsMainComponent };
