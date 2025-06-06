/**
 * Values Assessment Storage Service
 * Manages persistent storage of assessment data using appropriate auth service
 * 
 * @requires authService For authenticated data storage
 */

class ValuesAssessmentStorage {
  /**
   * Initialize the storage service
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    // Get authentication service
    this.authService = options.authService || window.authService;
    
    // Storage keys
    this.storageKeys = {
      selectedValues: 'values_assessment_selected',
      prioritizedValues: 'values_assessment_prioritized',
      reflectionResponses: 'values_assessment_reflections'
    };
    
    // In-memory cache for performance
    this.cache = {
      selectedValues: null,
      prioritizedValues: null,
      reflectionResponses: null
    };
    
    console.log('[ValuesStorage] Storage service initialized');
  }
  
  /**
   * Get selected values from storage
   * @returns {Promise<Array<string>>} Selected value IDs
   */
  async getSelectedValues() {
    // Return from cache if available
    if (this.cache.selectedValues) {
      return [...this.cache.selectedValues];
    }
    
    try {
      const data = await this._getData(this.storageKeys.selectedValues);
      this.cache.selectedValues = data || [];
      return [...this.cache.selectedValues];
    } catch (error) {
      console.error('[ValuesStorage] Error loading selected values:', error);
      return [];
    }
  }
  
  /**
   * Get prioritized values from storage
   * @returns {Promise<Array<string>>} Prioritized value IDs
   */
  async getPrioritizedValues() {
    // Return from cache if available
    if (this.cache.prioritizedValues) {
      return [...this.cache.prioritizedValues];
    }
    
    try {
      const data = await this._getData(this.storageKeys.prioritizedValues);
      this.cache.prioritizedValues = data || [];
      return [...this.cache.prioritizedValues];
    } catch (error) {
      console.error('[ValuesStorage] Error loading prioritized values:', error);
      return [];
    }
  }
  
  /**
   * Get reflection responses from storage
   * @returns {Promise<Object>} Reflection responses by value ID
   */
  async getReflectionResponses() {
    // Return from cache if available
    if (this.cache.reflectionResponses) {
      return {...this.cache.reflectionResponses};
    }
    
    try {
      const data = await this._getData(this.storageKeys.reflectionResponses);
      this.cache.reflectionResponses = data || {};
      return {...this.cache.reflectionResponses};
    } catch (error) {
      console.error('[ValuesStorage] Error loading reflection responses:', error);
      return {};
    }
  }
  
  /**
   * Save the full assessment data
   * @param {Object} assessmentData The complete assessment data
   * @returns {Promise<boolean>} Success status
   */
  async saveFullAssessment(assessmentData = {}) {
    try {
      const { selectedValues, prioritizedValues, reflectionResponses } = assessmentData;
      
      // Save each component and update cache
      if (Array.isArray(selectedValues)) {
        await this._setData(this.storageKeys.selectedValues, selectedValues);
        this.cache.selectedValues = [...selectedValues];
      }
      
      if (Array.isArray(prioritizedValues)) {
        await this._setData(this.storageKeys.prioritizedValues, prioritizedValues);
        this.cache.prioritizedValues = [...prioritizedValues];
      }
      
      if (reflectionResponses && typeof reflectionResponses === 'object') {
        await this._setData(this.storageKeys.reflectionResponses, reflectionResponses);
        this.cache.reflectionResponses = {...reflectionResponses};
      }
      
      return true;
    } catch (error) {
      console.error('[ValuesStorage] Error saving assessment data:', error);
      return false;
    }
  }
  
  /**
   * Clear all assessment data
   * @returns {Promise<boolean>} Success status
   */
  async clearAllData() {
    try {
      // Clear each storage key
      await Promise.all([
        this._removeData(this.storageKeys.selectedValues),
        this._removeData(this.storageKeys.prioritizedValues),
        this._removeData(this.storageKeys.reflectionResponses)
      ]);
      
      // Clear cache
      this.cache = {
        selectedValues: null,
        prioritizedValues: null,
        reflectionResponses: null
      };
      
      return true;
    } catch (error) {
      console.error('[ValuesStorage] Error clearing assessment data:', error);
      return false;
    }
  }
  
  /**
   * Get data from storage
   * @private
   * @param {string} key Storage key
   * @returns {Promise<any>} Stored data
   */
  async _getData(key) {
    try {
      if (!key) throw new Error('Storage key required');
      
      // Use auth service if available (preferred method per development rules)
      if (this.authService && typeof this.authService.getPrivateData === 'function') {
        return await this.authService.getPrivateData(key);
      }
      
      // Fall back to localStorage if auth service is not available
      console.warn('[ValuesStorage] Auth service not available, using localStorage fallback');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`[ValuesStorage] Error getting data for key ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Set data in storage
   * @private
   * @param {string} key Storage key
   * @param {any} value Value to store
   * @returns {Promise<boolean>} Success status
   */
  async _setData(key, value) {
    try {
      if (!key) throw new Error('Storage key required');
      
      // Use auth service if available (preferred method per development rules)
      if (this.authService && typeof this.authService.setPrivateData === 'function') {
        await this.authService.setPrivateData(key, value);
        return true;
      }
      
      // Fall back to localStorage if auth service is not available
      console.warn('[ValuesStorage] Auth service not available, using localStorage fallback');
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[ValuesStorage] Error setting data for key ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Remove data from storage
   * @private
   * @param {string} key Storage key
   * @returns {Promise<boolean>} Success status
   */
  async _removeData(key) {
    try {
      if (!key) throw new Error('Storage key required');
      
      // Use auth service if available (preferred method per development rules)
      if (this.authService && typeof this.authService.removePrivateData === 'function') {
        await this.authService.removePrivateData(key);
        return true;
      }
      
      // Fall back to localStorage if auth service is not available
      console.warn('[ValuesStorage] Auth service not available, using localStorage fallback');
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`[ValuesStorage] Error removing data for key ${key}:`, error);
      return false;
    }
  }
}

// Export for ES modules
export { ValuesAssessmentStorage };

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
  window.ValuesAssessmentStorage = ValuesAssessmentStorage;
}
