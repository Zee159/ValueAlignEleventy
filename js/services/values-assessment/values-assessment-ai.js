/**
 * Values Assessment AI Service
 * Provides AI-powered insights and recommendations for premium users
 * 
 * @requires authService For authentication and feature access verification
 */

class ValuesAssessmentAI {
  /**
   * Initialize the AI service for premium features
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.authService = options.authService || window.authService;
    this.apiEndpoint = options.apiEndpoint || '/api/ai/values-insights';
    this.cache = {}; // Cache AI responses for performance
    
    // Event system
    this.events = new EventTarget();
    
    console.log('[ValuesAI] AI service initialized for premium features');
  }
  
  /**
   * Generate AI insights based on user's values and reflections
   * @param {Object} assessmentData User's values assessment data
   * @returns {Promise<Object>} AI insights and recommendations
   */
  async generateInsights(assessmentData) {
    try {
      // Verify premium access first
      await this._verifyPremiumAccess();
      
      // Emit status event
      this._emitEvent('processingStarted', { step: 'insights' });
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this._getAuthToken()}`
        },
        body: JSON.stringify({
          selectedValues: assessmentData.selectedValues,
          prioritizedValues: assessmentData.prioritizedValues,
          reflections: assessmentData.reflectionResponses,
          requestId: this._generateRequestId()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to generate AI insights: ${errorData.message || response.statusText}`);
      }
      
      const insights = await response.json();
      
      // Cache the results
      this.cache.insights = insights;
      
      // Emit success event
      this._emitEvent('processingComplete', { 
        step: 'insights', 
        dataSize: JSON.stringify(insights).length 
      });
      
      return insights;
    } catch (error) {
      console.error('[ValuesAI] Error generating insights:', error);
      
      // Emit error event
      this._emitEvent('error', {
        context: 'insights',
        error: error.message,
        recoverable: false
      });
      
      throw error;
    }
  }
  
  /**
   * Get AI-recommended values based on user's existing selections
   * @param {Array<string>} selectedValues Currently selected value IDs
   * @returns {Promise<Array<Object>>} Recommended additional values
   */
  async getRecommendedValues(selectedValues) {
    try {
      // Verify premium access first
      await this._verifyPremiumAccess();
      
      // Return from cache if available
      const cacheKey = `recommendations_${selectedValues.join('_')}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      // Emit status event
      this._emitEvent('processingStarted', { step: 'recommendations' });
      
      const response = await fetch(`${this.apiEndpoint}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this._getAuthToken()}`
        },
        body: JSON.stringify({
          selectedValues,
          requestId: this._generateRequestId()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get recommended values: ${errorData.message || response.statusText}`);
      }
      
      const recommendations = await response.json();
      
      // Cache the results
      this.cache[cacheKey] = recommendations;
      
      // Emit success event
      this._emitEvent('processingComplete', { 
        step: 'recommendations', 
        count: recommendations.length 
      });
      
      return recommendations;
    } catch (error) {
      console.error('[ValuesAI] Error getting value recommendations:', error);
      
      // Emit error event
      this._emitEvent('error', {
        context: 'recommendations',
        error: error.message,
        recoverable: true
      });
      
      // Return empty array on error
      return [];
    }
  }
  
  /**
   * Get AI-suggested reflection prompts based on selected value
   * @param {string} valueId The value ID
   * @returns {Promise<Array<string>>} Suggested reflection prompts
   */
  async getSuggestedPrompts(valueId) {
    try {
      // Verify premium access first
      await this._verifyPremiumAccess();
      
      // Return from cache if available
      const cacheKey = `prompts_${valueId}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      // Emit status event
      this._emitEvent('processingStarted', { step: 'prompts', valueId });
      
      const response = await fetch(`${this.apiEndpoint}/prompts/${valueId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this._getAuthToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get reflection prompts: ${errorData.message || response.statusText}`);
      }
      
      const prompts = await response.json();
      
      // Cache the results
      this.cache[cacheKey] = prompts;
      
      // Emit success event
      this._emitEvent('processingComplete', { 
        step: 'prompts', 
        valueId,
        count: prompts.length 
      });
      
      return prompts;
    } catch (error) {
      console.error('[ValuesAI] Error getting reflection prompts:', error);
      
      // Emit error event
      this._emitEvent('error', {
        context: 'prompts',
        error: error.message,
        recoverable: true
      });
      
      // Return fallback prompts on error
      return [
        'What does this value mean to you personally?',
        'How does this value influence your daily decisions?',
        'When did you first recognize this value was important to you?'
      ];
    }
  }
  
  /**
   * Analyze a user's reflection using AI
   * @param {string} valueId Value ID
   * @param {string} reflectionText User's reflection text
   * @returns {Promise<Object>} Analysis and feedback
   */
  async analyzeReflection(valueId, reflectionText) {
    try {
      // Verify premium access first
      await this._verifyPremiumAccess();
      
      // Don't analyze if text is too short
      if (!reflectionText || reflectionText.length < 10) {
        return { 
          success: false,
          message: 'Reflection text is too short to analyze'
        };
      }
      
      // Emit status event
      this._emitEvent('processingStarted', { step: 'analysis', valueId });
      
      const response = await fetch(`${this.apiEndpoint}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this._getAuthToken()}`
        },
        body: JSON.stringify({
          valueId,
          reflectionText,
          requestId: this._generateRequestId()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to analyze reflection: ${errorData.message || response.statusText}`);
      }
      
      const analysis = await response.json();
      
      // Emit success event
      this._emitEvent('processingComplete', { 
        step: 'analysis', 
        valueId
      });
      
      return analysis;
    } catch (error) {
      console.error('[ValuesAI] Error analyzing reflection:', error);
      
      // Emit error event
      this._emitEvent('error', {
        context: 'analysis',
        error: error.message,
        recoverable: true
      });
      
      // Return graceful error response
      return {
        success: false,
        message: 'Unable to analyze reflection at this time'
      };
    }
  }
  
  /**
   * Get action recommendations based on prioritized values
   * @param {Array<string>} prioritizedValues User's prioritized values
   * @returns {Promise<Array<Object>>} Action recommendations
   */
  async getActionRecommendations(prioritizedValues) {
    try {
      // Verify premium access first
      await this._verifyPremiumAccess();
      
      // Limit to top 3 values
      const topValues = prioritizedValues.slice(0, 3);
      
      // Return from cache if available
      const cacheKey = `actions_${topValues.join('_')}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      
      // Emit status event
      this._emitEvent('processingStarted', { step: 'actions' });
      
      const response = await fetch(`${this.apiEndpoint}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this._getAuthToken()}`
        },
        body: JSON.stringify({
          prioritizedValues: topValues,
          requestId: this._generateRequestId()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get action recommendations: ${errorData.message || response.statusText}`);
      }
      
      const recommendations = await response.json();
      
      // Cache the results
      this.cache[cacheKey] = recommendations;
      
      // Emit success event
      this._emitEvent('processingComplete', { 
        step: 'actions', 
        count: recommendations.length 
      });
      
      return recommendations;
    } catch (error) {
      console.error('[ValuesAI] Error getting action recommendations:', error);
      
      // Emit error event
      this._emitEvent('error', {
        context: 'actions',
        error: error.message,
        recoverable: true
      });
      
      // Return empty array on error
      return [];
    }
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
   * Generate a unique request ID
   * @private
   * @returns {string} Unique ID
   */
  _generateRequestId() {
    return `values_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Get authentication token
   * @private
   * @returns {Promise<string>} Auth token
   */
  async _getAuthToken() {
    if (!this.authService) {
      throw new Error('Authentication service not available');
    }
    
    try {
      return await this.authService.getAccessToken();
    } catch (error) {
      console.error('[ValuesAI] Error getting auth token:', error);
      throw new Error('Authentication failed');
    }
  }
  
  /**
   * Verify user has premium access
   * @private
   * @returns {Promise<void>}
   * @throws {Error} If user doesn't have premium access
   */
  async _verifyPremiumAccess() {
    if (!this.authService) {
      throw new Error('Authentication service not available');
    }
    
    try {
      const hasPremiumAccess = await this.authService.hasFeature('ai_insights');
      
      if (!hasPremiumAccess) {
        throw new Error('Premium access required for AI features');
      }
    } catch (error) {
      console.error('[ValuesAI] Premium access verification failed:', error);
      throw error;
    }
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
  
  /**
   * Clear the cache
   */
  clearCache() {
    this.cache = {};
    console.log('[ValuesAI] Cache cleared');
  }
}

// Export the class
export { ValuesAssessmentAI };
