/**
 * ValueAlign Core Values Assessment Service
 * Manages the core data, state and business logic of the values assessment
 * 
 * @requires authService for user authentication and data persistence
 * @requires themeSystem for theme integration
 */

class ValuesAssessmentService {
  /**
   * Initialize the Values Assessment Service
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    // External services
    this.authService = options.authService || window.authService;
    this.themeService = options.themeService || window.themeSystem;
    
    // Will be initialized later
    this.storageService = null;
    this.aiService = null;
    
    // Core state
    this.currentStep = 1;
    this.totalSteps = 4; // Will be 5 if premium AI insights are available
    this.selectedValues = [];
    this.prioritizedValues = [];
    this.reflectionResponses = {};
    this.isPremiumUser = false;
    
    // Event system
    this.events = new EventTarget();
    
    // Initialize the service
    this._initialize(options);
  }
  
  /**
   * Initialize the service and check premium status
   * @private
   */
  async _initialize(options) {
    console.log('[ValuesService] Initializing...');
    
    try {
      // Load dependencies
      const { ValuesAssessmentStorage } = await import('./values-assessment-storage.js');
      this.storageService = options.storageService || new ValuesAssessmentStorage();
      
      // Check authentication status
      const isAuthenticated = await this._checkAuthStatus();
      
      // Check premium status for AI features
      if (isAuthenticated) {
        this.isPremiumUser = await this.checkPremiumAccess();
        
        // Adjust steps if premium
        if (this.isPremiumUser) {
          this.totalSteps = 5; // Add AI insights step for premium users
          // Lazy load AI service only for premium users
          const { ValuesAssessmentAI } = await import('./values-assessment-ai.js');
          this.aiService = options.aiService || new ValuesAssessmentAI();
        }
      }
      
      // Load saved progress
      await this.loadProgress();
      
      // Notify initialization complete
      this._emitEvent('initialized', {
        isPremium: this.isPremiumUser,
        currentStep: this.currentStep,
        totalSteps: this.totalSteps
      });
      
      console.log('[ValuesService] Initialized successfully');
    } catch (error) {
      console.error('[ValuesService] Initialization error:', error);
      this._emitEvent('error', { 
        context: 'initialization',
        error: error.message 
      });
    }
  }
  
  /**
   * Check if the user is authenticated
   * @private
   * @returns {Promise<boolean>}
   */
  async _checkAuthStatus() {
    try {
      if (!this.authService) {
        console.warn('[ValuesService] Auth service not available');
        return false;
      }
      
      const isAuthenticated = await this.authService.isAuthenticated();
      return isAuthenticated;
    } catch (error) {
      console.error('[ValuesService] Auth check error:', error);
      return false;
    }
  }
  
  /**
   * Check if the user has premium access for AI features
   * @returns {Promise<boolean>}
   */
  async checkPremiumAccess() {
    try {
      if (!this.authService) return false;
      
      // Check if the user has the AI insights feature
      const hasPremiumAccess = await this.authService.hasFeature('ai_insights');
      return hasPremiumAccess;
    } catch (error) {
      console.error('[ValuesService] Premium check error:', error);
      return false;
    }
  }
  
  /**
   * Load saved progress from storage
   * @returns {Promise<void>}
   */
  async loadProgress() {
    try {
      if (!this.storageService) return;
      
      // Load values and responses
      this.selectedValues = await this.storageService.getSelectedValues() || [];
      this.prioritizedValues = await this.storageService.getPrioritizedValues() || [];
      this.reflectionResponses = await this.storageService.getReflectionResponses() || {};
      
      // Determine current step based on saved data
      if (this.prioritizedValues && this.prioritizedValues.length > 0 && 
          Object.keys(this.reflectionResponses).length > 0) {
        // User has completed reflections, go to AI insights (premium) or summary
        this.currentStep = this.isPremiumUser ? 5 : 4;
      } else if (this.prioritizedValues && this.prioritizedValues.length > 0) {
        // User has prioritized but not reflected
        this.currentStep = 4; // Reflection step
      } else if (this.selectedValues && this.selectedValues.length > 0) {
        // User has selected but not prioritized
        this.currentStep = 3; // Prioritization step
      } else {
        // Fresh start
        this.currentStep = 1;
      }
      
      this._emitEvent('progressLoaded', {
        currentStep: this.currentStep,
        selectedValues: this.selectedValues.length,
        prioritizedValues: this.prioritizedValues.length
      });
      
      console.log('[ValuesService] Progress loaded:', {
        currentStep: this.currentStep,
        selectedValues: this.selectedValues.length,
        prioritizedValues: this.prioritizedValues.length
      });
    } catch (error) {
      console.error('[ValuesService] Error loading progress:', error);
      
      // Reset to default state if error
      this.currentStep = 1;
      this.selectedValues = [];
      this.prioritizedValues = [];
      this.reflectionResponses = {};
      
      this._emitEvent('error', {
        context: 'loadProgress',
        error: error.message
      });
    }
  }
  
  /**
   * Save current progress to storage
   * @returns {Promise<void>}
   */
  async saveProgress() {
    try {
      if (!this.storageService) return;
      
      await this.storageService.saveFullAssessment({
        selectedValues: this.selectedValues,
        prioritizedValues: this.prioritizedValues,
        reflectionResponses: this.reflectionResponses
      });
      
      this._emitEvent('progressSaved');
      console.log('[ValuesService] Progress saved');
    } catch (error) {
      console.error('[ValuesService] Error saving progress:', error);
      this._emitEvent('error', {
        context: 'saveProgress',
        error: error.message
      });
    }
  }
  
  /**
   * Toggle a value's selection status
   * @param {string} valueId The ID of the value to toggle
   * @param {boolean} [isSelected] Force a specific state (optional)
   * @returns {boolean} The new selection state
   */
  toggleValue(valueId, isSelected) {
    if (!valueId) return false;
    
    // Initialize array if needed
    if (!Array.isArray(this.selectedValues)) {
      this.selectedValues = [];
    }
    
    // Get current selection state
    const currentlySelected = this.selectedValues.includes(valueId);
    
    // Determine new state (if not explicitly provided)
    const newState = isSelected !== undefined ? isSelected : !currentlySelected;
    
    if (newState && !currentlySelected) {
      // Add to selected values
      this.selectedValues.push(valueId);
    } else if (!newState && currentlySelected) {
      // Remove from selected values
      this.selectedValues = this.selectedValues.filter(id => id !== valueId);
    }
    
    // Emit event
    this._emitEvent('valueToggled', {
      valueId,
      isSelected: newState,
      count: this.selectedValues.length
    });
    
    // Save progress
    this.saveProgress();
    
    return newState;
  }
  
  /**
   * Set the prioritized values array
   * @param {Array<string>} orderedValueIds Ordered array of value IDs
   */
  setPrioritizedValues(orderedValueIds) {
    if (!Array.isArray(orderedValueIds)) return;
    
    this.prioritizedValues = [...orderedValueIds];
    
    this._emitEvent('prioritizationChanged', {
      prioritizedValues: this.prioritizedValues
    });
    
    this.saveProgress();
  }
  
  /**
   * Move a value up in priority
   * @param {number} index Current index of the value
   * @returns {boolean} Success status
   */
  moveValueUp(index) {
    if (!Array.isArray(this.prioritizedValues) || 
        index <= 0 || 
        index >= this.prioritizedValues.length) {
      return false;
    }
    
    // Swap positions
    const temp = this.prioritizedValues[index];
    this.prioritizedValues[index] = this.prioritizedValues[index - 1];
    this.prioritizedValues[index - 1] = temp;
    
    this._emitEvent('prioritizationChanged', {
      prioritizedValues: this.prioritizedValues,
      movedValueId: temp,
      newIndex: index - 1,
      direction: 'up'
    });
    
    this.saveProgress();
    return true;
  }
  
  /**
   * Move a value down in priority
   * @param {number} index Current index of the value
   * @returns {boolean} Success status
   */
  moveValueDown(index) {
    if (!Array.isArray(this.prioritizedValues) || 
        index < 0 || 
        index >= this.prioritizedValues.length - 1) {
      return false;
    }
    
    // Swap positions
    const temp = this.prioritizedValues[index];
    this.prioritizedValues[index] = this.prioritizedValues[index + 1];
    this.prioritizedValues[index + 1] = temp;
    
    this._emitEvent('prioritizationChanged', {
      prioritizedValues: this.prioritizedValues,
      movedValueId: temp,
      newIndex: index + 1,
      direction: 'down'
    });
    
    this.saveProgress();
    return true;
  }
  
  /**
   * Save reflection text for a specific value
   * @param {string} valueId The value ID
   * @param {string} text Reflection text
   */
  saveReflection(valueId, text) {
    if (!valueId) return;
    
    // Initialize if needed
    if (!this.reflectionResponses) {
      this.reflectionResponses = {};
    }
    
    this.reflectionResponses[valueId] = text;
    
    this._emitEvent('reflectionSaved', {
      valueId,
      textLength: text.length
    });
    
    this.saveProgress();
  }
  
  /**
   * Move to the next step in the assessment
   * @returns {number} The new current step
   */
  nextStep() {
    // Validate current step can proceed
    if (!this._canProceedToStep(this.currentStep + 1)) {
      this._emitEvent('navigationBlocked', {
        reason: 'requirementNotMet',
        currentStep: this.currentStep
      });
      return this.currentStep;
    }
    
    // Move to next step if not at end
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this._emitEvent('stepChanged', {
        step: this.currentStep,
        direction: 'forward'
      });
    }
    
    return this.currentStep;
  }
  
  /**
   * Move to the previous step in the assessment
   * @returns {number} The new current step
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this._emitEvent('stepChanged', {
        step: this.currentStep,
        direction: 'backward'
      });
    }
    
    return this.currentStep;
  }
  
  /**
   * Go to a specific step (with validation)
   * @param {number} step The step to go to
   * @returns {number} The new current step
   */
  goToStep(step) {
    if (step < 1 || step > this.totalSteps) {
      return this.currentStep;
    }
    
    // Check if requirements are met
    if (step > this.currentStep && !this._canProceedToStep(step)) {
      this._emitEvent('navigationBlocked', {
        reason: 'requirementNotMet',
        currentStep: this.currentStep,
        targetStep: step
      });
      return this.currentStep;
    }
    
    // Set new step
    const oldStep = this.currentStep;
    this.currentStep = step;
    
    this._emitEvent('stepChanged', {
      step: this.currentStep,
      direction: step > oldStep ? 'forward' : 'backward'
    });
    
    return this.currentStep;
  }
  
  /**
   * Check if the user can proceed to a specific step
   * @private
   * @param {number} targetStep The step to check
   * @returns {boolean} Whether progress is allowed
   */
  _canProceedToStep(targetStep) {
    switch (targetStep) {
      case 1:
      case 2:
        // Introduction and selection are always accessible
        return true;
      case 3:
        // Prioritization requires at least one value selected
        return this.selectedValues && this.selectedValues.length > 0;
      case 4:
        // Reflection requires prioritization
        return this.prioritizedValues && this.prioritizedValues.length > 0;
      case 5:
        // AI insights requires premium access and completed reflections
        return this.isPremiumUser && 
               this.reflectionResponses && 
               Object.keys(this.reflectionResponses).length > 0;
      default:
        return false;
    }
  }
  
  /**
   * Get top prioritized values (for reflection)
   * @param {number} [count=3] Number of top values to return
   * @returns {Array<string>} Array of value IDs
   */
  getTopValues(count = 3) {
    if (!Array.isArray(this.prioritizedValues)) {
      return [];
    }
    
    return this.prioritizedValues.slice(0, Math.min(count, this.prioritizedValues.length));
  }
  
  /**
   * Register an event listener
   * @param {string} eventName Event name to listen for
   * @param {function} callback Callback function
   */
  on(eventName, callback) {
    if (typeof callback !== 'function') return;
    
    this.events.addEventListener(eventName, (event) => {
      callback(event.detail);
    });
  }
  
  /**
   * Remove an event listener
   * @param {string} eventName Event name
   * @param {function} callback Callback to remove
   */
  off(eventName, callback) {
    if (typeof callback !== 'function') return;
    
    this.events.removeEventListener(eventName, callback);
  }
  
  /**
   * Emit an event
   * @private
   * @param {string} eventName Event name
   * @param {Object} detail Event data
   */
  _emitEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    this.events.dispatchEvent(event);
  }
}

// Export for ES modules
export { ValuesAssessmentService };

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.ValuesAssessmentService = ValuesAssessmentService;
}
