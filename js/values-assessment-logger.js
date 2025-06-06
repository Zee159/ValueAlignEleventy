/**
 * Values Assessment Logger
 * 
 * Provides enhanced logging for Values Assessment step navigation
 * and component lifecycle events without modifying the core files.
 * 
 * This logger adds event listeners to track navigation between steps
 * and provides visual feedback in the console.
 */

(function() {
  'use strict';
  
  // Configuration
  const config = {
    enabled: true,
    showTimestamps: true,
    trackNavigation: true,
    trackComponents: true,
    trackAuth: true,
    trackTheme: true,
    groupLogs: true,
    logLevel: 'debug' // 'debug', 'info', 'warn', 'error'
  };
  
  // Colors for different steps (for console styling)
  const stepColors = {
    'intro': '#3498db',
    'selection': '#2ecc71',
    'ranking': '#e67e22',
    'results': '#9b59b6',
    'guided-reflection': '#f1c40f',
    'next-steps': '#1abc9c',
    'export': '#e74c3c',
    'default': '#7f8c8d'
  };
  
  // Track current step
  let currentStep = '';
  let previousStep = '';
  let navigationHistory = [];
  let startTime = Date.now();
  
  /**
   * Format a message with timestamp
   * @param {string} message - Message to format
   * @returns {string} Formatted message
   */
  function formatMessage(message) {
    if (!config.showTimestamps) return message;
    
    const now = new Date();
    const elapsed = ((now - startTime) / 1000).toFixed(2);
    return `[${now.toLocaleTimeString()}] (+${elapsed}s) ${message}`;
  }
  
  /**
   * Get color for a step
   * @param {string} step - Step name
   * @returns {string} Color hex code
   */
  function getStepColor(step) {
    return stepColors[step] || stepColors.default;
  }
  
  /**
   * Log a step change
   * @param {string} step - New step
   * @param {string} previous - Previous step
   */
  function logStepChange(step, previous) {
    if (!config.enabled || !config.trackNavigation) return;
    
    const stepColor = getStepColor(step);
    const prevColor = getStepColor(previous);
    
    if (config.groupLogs) {
      console.group(`%c🚶 Navigation: %c${previous || 'none'}%c → %c${step}`, 
        'color: #333; font-weight: bold;', 
        `color: ${prevColor}; font-weight: bold;`, 
        'color: #333;', 
        `color: ${stepColor}; font-weight: bold;`);
    }
    
    console.log(formatMessage(`Changed from "${previous || 'none'}" to "${step}"`));
    
    // Add to navigation history
    navigationHistory.push({
      from: previous,
      to: step,
      timestamp: new Date()
    });
    
    if (config.groupLogs) {
      console.groupEnd();
    }
  }
  
  /**
   * Log component lifecycle event
   * @param {string} componentName - Component name
   * @param {string} event - Lifecycle event
   * @param {Object} data - Additional data
   */
  function logComponentEvent(componentName, event, data = {}) {
    if (!config.enabled || !config.trackComponents) return;
    
    if (config.groupLogs) {
      console.group(`%c🧩 Component: %c${componentName} %c(${event})`, 
        'color: #333; font-weight: bold;', 
        'color: #0066cc; font-weight: bold;', 
        'color: #333; font-style: italic;');
    }
    
    console.log(formatMessage(`${componentName}: ${event}`), data);
    
    if (config.groupLogs) {
      console.groupEnd();
    }
  }
  
  /**
   * Log authentication event
   * @param {string} event - Auth event
   * @param {Object} data - Additional data
   */
  function logAuthEvent(event, data = {}) {
    if (!config.enabled || !config.trackAuth) return;
    
    if (config.groupLogs) {
      console.group(`%c🔑 Auth: %c${event}`, 
        'color: #333; font-weight: bold;', 
        'color: #e74c3c; font-weight: bold;');
    }
    
    console.log(formatMessage(`Auth: ${event}`), data);
    
    if (config.groupLogs) {
      console.groupEnd();
    }
  }
  
  /**
   * Log theme event
   * @param {string} event - Theme event
   * @param {Object} data - Additional data
   */
  function logThemeEvent(event, data = {}) {
    if (!config.enabled || !config.trackTheme) return;
    
    if (config.groupLogs) {
      console.group(`%c🎨 Theme: %c${event}`, 
        'color: #333; font-weight: bold;', 
        'color: #9b59b6; font-weight: bold;');
    }
    
    console.log(formatMessage(`Theme: ${event}`), data);
    
    if (config.groupLogs) {
      console.groupEnd();
    }
  }
  
  /**
   * Initialize the logger
   */
  function initialize() {
    if (!config.enabled) return;
    
    console.log('%cValues Assessment Logger Initialized', 'color: #2ecc71; font-weight: bold; font-size: 14px;');
    
    // Listen for step change events
    document.addEventListener('values-assessment-step-changed', (event) => {
      const { step, previous } = event.detail;
      currentStep = step;
      previousStep = previous;
      logStepChange(step, previous);
    });
    
    // Listen for component events
    document.addEventListener('values-assessment-component-event', (event) => {
      const { component, event: eventName, data } = event.detail;
      logComponentEvent(component, eventName, data);
    });
    
    // Listen for auth events
    document.addEventListener('values-assessment-auth-event', (event) => {
      logAuthEvent(event.detail.event, event.detail.data);
    });
    
    // Listen for theme changes
    document.addEventListener('themechange', (event) => {
      logThemeEvent('changed', { theme: event.detail.theme });
    });
    
    // Patch ValuesAssessment.prototype methods to add logging if available
    if (window.ValuesAssessment) {
      patchValuesAssessmentMethods();
    } else {
      // Wait for ValuesAssessment to be defined
      const checkInterval = setInterval(() => {
        if (window.ValuesAssessment) {
          patchValuesAssessmentMethods();
          clearInterval(checkInterval);
        }
      }, 100);
    }
  }
  
  /**
   * Patch ValuesAssessment methods to add logging
   */
  function patchValuesAssessmentMethods() {
    const proto = window.ValuesAssessment.prototype;
    
    // List of methods to patch
    const methodsToPatch = [
      'showResults',
      'showGuidedReflection',
      'showNextSteps',
      'restartAssessment',
      'navigateToStep'
    ];
    
    // Patch each method
    methodsToPatch.forEach(methodName => {
      const originalMethod = proto[methodName];
      if (typeof originalMethod === 'function') {
        proto[methodName] = async function(...args) {
          console.group(`%c📝 ValuesAssessment.${methodName}()`, 'color: #3498db; font-weight: bold;');
          console.log(formatMessage(`Calling ${methodName}`), { args });
          
          try {
            const result = await originalMethod.apply(this, args);
            console.log(formatMessage(`${methodName} completed`), { result });
            console.groupEnd();
            return result;
          } catch (error) {
            console.error(formatMessage(`${methodName} failed`), { error });
            console.groupEnd();
            throw error;
          }
        };
      }
    });
    
    console.log('%cPatched ValuesAssessment methods for logging', 'color: #2ecc71; font-style: italic;');
  }
  
  /**
   * Get navigation history
   * @returns {Array} Navigation history
   */
  function getNavigationHistory() {
    return [...navigationHistory];
  }
  
  /**
   * Clear navigation history
   */
  function clearNavigationHistory() {
    navigationHistory = [];
  }
  
  /**
   * Print navigation summary
   */
  function printNavigationSummary() {
    if (navigationHistory.length === 0) {
      console.log('No navigation history recorded');
      return;
    }
    
    console.group('%c📊 Navigation Summary', 'color: #3498db; font-weight: bold; font-size: 14px;');
    
    // Print each navigation step
    navigationHistory.forEach((item, index) => {
      const timestamp = item.timestamp.toLocaleTimeString();
      console.log(`${index + 1}. [${timestamp}] ${item.from || 'start'} → ${item.to}`);
    });
    
    console.groupEnd();
  }
  
  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM already loaded, initialize now
    setTimeout(initialize, 0);
  }
  
  // Export to global namespace
  window.ValuesAssessmentLogger = {
    config,
    logStepChange,
    logComponentEvent,
    logAuthEvent,
    logThemeEvent,
    getNavigationHistory,
    clearNavigationHistory,
    printNavigationSummary
  };
})();
