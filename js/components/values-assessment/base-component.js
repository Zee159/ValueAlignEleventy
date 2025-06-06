/**
 * Base Component for Values Assessment
 * Provides shared functionality for all assessment components
 */

class BaseComponent {
  /**
   * Create a base component
   * @param {Object} options Configuration options
   * @param {ValuesAssessmentUI} options.ui Reference to the UI controller
   * @param {Object} options.service Reference to the assessment service
   * @param {HTMLElement} options.container The container element to render into
   * @param {Object} options.content Optional content override
   * @param {Object} options.logger Optional logger instance
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.service = options.service;
    this.container = options.container;
    this.content = options.content || {};
    this.logger = options.logger || console;
    
    // Component state
    this.isRendered = false;
    this.isInitialized = false;
    this.elements = {}; // Store references to DOM elements
    
    // If the component has an initialize method, call it
    if (typeof this.initialize === 'function') {
      this.initialize(options);
    }
  }
  
  /**
   * Initialize the component (to be overridden by subclasses)
   * @param {Object} options Configuration options
   */
  initialize(options) {
    // Override in subclass
    this.isInitialized = true;
  }
  
  /**
   * Render the component (must be implemented by subclasses)
   * @returns {HTMLElement} The rendered component
   */
  render() {
    this.log('Render method called but not implemented');
    throw new Error('Component must implement render method');
  }
  
  /**
   * Clean up the component and remove event listeners
   */
  destroy() {
    this.log('Destroying component');
    this.isRendered = false;
    this.isInitialized = false;
    this.elements = {};
    
    // Subclasses should extend this to remove their specific event listeners
  }
  
  /**
   * Update the component with new data
   * @param {Object} data Updated data
   * @returns {HTMLElement} The updated component
   */
  update(data) {
    this.log('Update received', data);
    return this.render(); // Default to full re-render
  }
  
  /**
   * Focus the first focusable element in the component
   */
  focus() {
    if (!this.container) return;
    
    try {
      // Find the first focusable element
      const focusable = this.container.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusable) {
        focusable.focus();
      }
    } catch (error) {
      this.logError('Error focusing component', error);
    }
  }
  
  /**
   * Log a message
   * @param {string} message The message to log
   * @param {*} [data] Optional data to include
   */
  log(message, data) {
    const componentName = this.constructor.name;
    
    if (data) {
      this.logger.log(`[${componentName}] ${message}`, data);
    } else {
      this.logger.log(`[${componentName}] ${message}`);
    }
  }
  
  /**
   * Log an error message
   * @param {string} message The error message
   * @param {Error} [error] Optional error object
   */
  logError(message, error) {
    const componentName = this.constructor.name;
    
    if (error) {
      this.logger.error(`[${componentName}] ${message}`, error);
    } else {
      this.logger.error(`[${componentName}] ${message}`);
    }
  }
  
  /**
   * Create an element with attributes and children
   * @param {string} tag HTML tag name
   * @param {Object} attrs Attributes to set on the element
   * @param {Array|HTMLElement|string} children Child elements or text content
   * @returns {HTMLElement} The created element
   */
  createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Add children
    if (Array.isArray(children)) {
      children.forEach(child => {
        if (child) {
          element.appendChild(
            typeof child === 'string' 
              ? document.createTextNode(child) 
              : child
          );
        }
      });
    } else if (typeof children === 'string') {
      element.textContent = children;
    } else if (children instanceof HTMLElement) {
      element.appendChild(children);
    }
    
    return element;
  }
  
  /**
   * Announce a message to screen readers
   * @param {string} message The message to announce
   * @param {string} priority The announcement priority (polite or assertive)
   */
  announce(message, priority = 'polite') {
    if (this.ui && typeof this.ui.announce === 'function') {
      this.ui.announce(message, priority);
    } else {
      const live = priority === 'assertive' ? 'assertive' : 'polite';
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', live);
      announcer.classList.add('sr-only');
      document.body.appendChild(announcer);
      
      // Use setTimeout to ensure the element is in the DOM before adding content
      setTimeout(() => {
        announcer.textContent = message;
        
        // Remove after announcement
        setTimeout(() => {
          document.body.removeChild(announcer);
        }, 3000);
      }, 100);
    }
  }
}

// Export the component
export { BaseComponent };

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.BaseComponent = BaseComponent;
}
