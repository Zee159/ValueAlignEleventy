/**
 * Values Assessment Test Utilities
 * 
 * Helper functions for testing the values assessment migration functionality.
 * Includes tools for generating test data, validating migration results,
 * and visualizing the migration process.
 * 
 * Following ValueAlign development rules for error handling and progressive enhancement.
 */

/**
 * Test utilities for values assessment migration
 */
class ValuesAssessmentTestUtils {
  /**
   * Initialize the test utilities
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.debug = options.debug || false;
    
    // Legacy data keys
    this.legacyKeys = {
      selectedValues: 'valueAssessment_selectedValues',
      prioritizedValues: 'valueAssessment_prioritizedValues',
      reflectionResponses: 'valueAssessment_reflectionResponses',
      completionDate: 'valueAssessment_completionDate',
      previousCompletionDate: 'valueAssessment_previousCompletionDate'
    };
    
    // New storage keys
    this.newKeys = {
      selectedValues: 'values_assessment_selected',
      prioritizedValues: 'values_assessment_prioritized',
      reflectionResponses: 'values_assessment_reflections'
    };
    
    // Sample test values
    this.sampleValues = [
      'achievement', 'adventure', 'authority', 'autonomy', 
      'balance', 'beauty', 'boldness', 'compassion', 
      'contribution', 'creativity', 'curiosity', 'determination', 
      'fairness', 'faith', 'fame', 'friendships',
      'fun', 'growth', 'happiness'
    ];
    
    this._log('Test utilities initialized');
  }
  
  /**
   * Generate sample legacy data and store in localStorage
   * @param {Object} options Options for data generation
   * @returns {Object} Generated data summary
   */
  generateLegacyData(options = {}) {
    try {
      const defaults = {
        selectedCount: 5,
        prioritizedCount: 3,
        withReflections: true,
        withCompletionDate: true
      };
      
      const config = {...defaults, ...options};
      const result = {
        generated: {},
        success: true
      };
      
      // Generate selected values (random selection from sample values)
      const selectedValues = this._getRandomValues(this.sampleValues, config.selectedCount);
      localStorage.setItem(this.legacyKeys.selectedValues, JSON.stringify(selectedValues));
      result.generated.selectedValues = selectedValues;
      
      // Generate prioritized values (subset of selected)
      const prioritizedValues = selectedValues.slice(0, config.prioritizedCount);
      localStorage.setItem(this.legacyKeys.prioritizedValues, JSON.stringify(prioritizedValues));
      result.generated.prioritizedValues = prioritizedValues;
      
      // Generate reflection responses if requested
      if (config.withReflections) {
        const reflections = this._generateReflections(prioritizedValues);
        localStorage.setItem(this.legacyKeys.reflectionResponses, JSON.stringify(reflections));
        result.generated.reflectionResponses = reflections;
      }
      
      // Add completion date if requested
      if (config.withCompletionDate) {
        const completionDate = new Date().toISOString();
        localStorage.setItem(this.legacyKeys.completionDate, completionDate);
        result.generated.completionDate = completionDate;
        
        // Add a previous completion date (30 days earlier)
        const previousDate = new Date();
        previousDate.setDate(previousDate.getDate() - 30);
        const previousCompletionDate = previousDate.toISOString();
        localStorage.setItem(this.legacyKeys.previousCompletionDate, previousCompletionDate);
        result.generated.previousCompletionDate = previousCompletionDate;
      }
      
      this._log('Generated legacy data', result);
      return result;
    } catch (error) {
      this._logError('Error generating legacy data', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Clear all test data from storage (both legacy and new)
   * @returns {boolean} Success status
   */
  clearAllTestData() {
    try {
      // Clear legacy keys
      Object.values(this.legacyKeys).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear new keys
      Object.values(this.newKeys).forEach(key => {
        localStorage.removeItem(key);
      });
      
      this._log('Cleared all test data from storage');
      return true;
    } catch (error) {
      this._logError('Error clearing test data', error);
      return false;
    }
  }
  
  /**
   * Check if legacy data exists in localStorage
   * @returns {Object} Status of legacy data
   */
  checkLegacyData() {
    try {
      const result = {
        hasData: false,
        details: {}
      };
      
      // Check each legacy key
      for (const [key, storageKey] of Object.entries(this.legacyKeys)) {
        const value = localStorage.getItem(storageKey);
        const hasValue = !!value;
        
        result.details[key] = {
          exists: hasValue,
          value: hasValue ? this._parseStoredValue(value, key) : null
        };
        
        if (hasValue) {
          result.hasData = true;
        }
      }
      
      return result;
    } catch (error) {
      this._logError('Error checking legacy data', error);
      return { hasData: false, error: error.message };
    }
  }
  
  /**
   * Check if new format data exists in localStorage
   * @returns {Object} Status of new data
   */
  checkNewData() {
    try {
      const result = {
        hasData: false,
        details: {}
      };
      
      // Check each new key
      for (const [key, storageKey] of Object.entries(this.newKeys)) {
        const value = localStorage.getItem(storageKey);
        const hasValue = !!value;
        
        result.details[key] = {
          exists: hasValue,
          value: hasValue ? JSON.parse(value) : null
        };
        
        if (hasValue) {
          result.hasData = true;
        }
      }
      
      return result;
    } catch (error) {
      this._logError('Error checking new data', error);
      return { hasData: false, error: error.message };
    }
  }
  
  /**
   * Compare legacy and new data to validate migration
   * @returns {Object} Validation results
   */
  validateMigration() {
    try {
      const legacyData = this.checkLegacyData();
      const newData = this.checkNewData();
      
      const result = {
        success: false,
        legacyDataExists: legacyData.hasData,
        newDataExists: newData.hasData,
        details: {}
      };
      
      // Can't validate if either side is missing
      if (!legacyData.hasData || !newData.hasData) {
        return result;
      }
      
      // Compare selected values
      if (legacyData.details.selectedValues?.exists && newData.details.selectedValues?.exists) {
        const legacySelected = legacyData.details.selectedValues.value;
        const newSelected = newData.details.selectedValues.value;
        
        result.details.selectedValues = {
          match: this._arraysMatch(legacySelected, newSelected),
          legacy: legacySelected,
          new: newSelected
        };
      }
      
      // Compare prioritized values
      if (legacyData.details.prioritizedValues?.exists && newData.details.prioritizedValues?.exists) {
        const legacyPrioritized = legacyData.details.prioritizedValues.value;
        const newPrioritized = newData.details.prioritizedValues.value;
        
        result.details.prioritizedValues = {
          match: this._arraysMatch(legacyPrioritized, newPrioritized),
          legacy: legacyPrioritized,
          new: newPrioritized
        };
      }
      
      // Compare reflection responses
      if (legacyData.details.reflectionResponses?.exists && newData.details.reflectionResponses?.exists) {
        const legacyReflections = legacyData.details.reflectionResponses.value;
        const newReflections = newData.details.reflectionResponses.value;
        
        // Create shallow comparison (ignoring migration metadata)
        const newReflectionsWithoutMeta = {...newReflections};
        delete newReflectionsWithoutMeta._migrationMeta;
        
        result.details.reflectionResponses = {
          match: this._objectsMatch(legacyReflections, newReflectionsWithoutMeta),
          legacy: legacyReflections,
          new: newReflections
        };
      }
      
      // Overall success is when all compared items match
      result.success = Object.values(result.details)
        .every(detail => detail.match === true);
      
      return result;
    } catch (error) {
      this._logError('Error validating migration', error);
      return { 
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate HTML status element for test page
   * @returns {string} HTML markup for status display
   */
  generateStatusHTML() {
    try {
      const legacyData = this.checkLegacyData();
      const newData = this.checkNewData();
      
      // Create HTML elements
      let html = `
        <div class="migration-status">
          <h3>Migration Test Status</h3>
          <div class="status-container">
            <div class="status-item ${legacyData.hasData ? 'active' : ''}">
              <strong>Legacy Data:</strong> ${legacyData.hasData ? 'Present' : 'Not found'}
            </div>
            <div class="status-item ${newData.hasData ? 'active' : ''}">
              <strong>New Data:</strong> ${newData.hasData ? 'Present' : 'Not found'}
            </div>
          </div>
          <div class="controls">
            <button type="button" id="generate-test-data">Generate Test Data</button>
            <button type="button" id="clear-test-data">Clear All Test Data</button>
            <button type="button" id="run-migration-test">Run Migration</button>
            <button type="button" id="validate-migration">Validate Results</button>
          </div>
          <div class="result-container" id="migration-results"></div>
        </div>
      `;
      
      return html;
    } catch (error) {
      this._logError('Error generating status HTML', error);
      return `<div class="error">Error generating status: ${error.message}</div>`;
    }
  }
  
  /**
   * Generate random reflection data for the given values
   * @private
   * @param {string[]} values Value IDs to generate reflections for
   * @returns {Object} Reflection data by value ID
   */
  _generateReflections(values) {
    const reflections = {};
    const prompts = [
      'Why is this value important to me?',
      'How does this value show up in my life today?',
      'What would it look like to live this value more fully?'
    ];
    
    const responses = [
      'This value guides my daily decisions and helps me prioritize what matters most.',
      'I express this value through my relationships and work choices.',
      'Living this value gives me purpose and helps me contribute meaningfully to others.',
      'This represents who I want to be and the impact I want to have.',
      'When I honor this value, I feel more aligned and authentic in my actions.'
    ];
    
    // Generate reflection data for each value
    values.forEach(valueId => {
      reflections[valueId] = {};
      
      // Add a random response for each prompt
      prompts.forEach((prompt, index) => {
        const promptKey = `prompt${index + 1}`;
        reflections[valueId][promptKey] = responses[Math.floor(Math.random() * responses.length)];
      });
    });
    
    return reflections;
  }
  
  /**
   * Get random values from an array
   * @private
   * @param {Array} array Source array
   * @param {number} count Number of items to select
   * @returns {Array} Selected items
   */
  _getRandomValues(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  /**
   * Check if two arrays have the same values (order-independent)
   * @private
   * @param {Array} arr1 First array
   * @param {Array} arr2 Second array
   * @returns {boolean} Whether arrays match
   */
  _arraysMatch(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    
    return sorted1.every((val, idx) => val === sorted2[idx]);
  }
  
  /**
   * Check if two objects have the same properties and values
   * @private
   * @param {Object} obj1 First object
   * @param {Object} obj2 Second object
   * @returns {boolean} Whether objects match
   */
  _objectsMatch(obj1, obj2) {
    // Quick check for null/undefined or different types
    if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return obj1 === obj2;
    }
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    // Check if same number of properties
    if (keys1.length !== keys2.length) return false;
    
    // Check each property value
    return keys1.every(key => {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        return this._objectsMatch(obj1[key], obj2[key]);
      }
      return obj1[key] === obj2[key];
    });
  }
  
  /**
   * Parse stored value based on key type
   * @private
   * @param {string} value The stored value
   * @param {string} key The key name
   * @returns {any} Parsed value
   */
  _parseStoredValue(value, key) {
    if (key.includes('Date')) {
      return value; // Keep dates as strings
    }
    return JSON.parse(value); // Parse JSON for other data
  }
  
  /**
   * Log message if debug is enabled
   * @private
   * @param {string} message Message to log
   * @param {Object} [data] Additional data to log
   */
  _log(message, data) {
    if (this.debug) {
      if (data) {
        console.log(`[ValuesTestUtils] ${message}`, data);
      } else {
        console.log(`[ValuesTestUtils] ${message}`);
      }
    }
  }
  
  /**
   * Log error message
   * @private
   * @param {string} message Error message
   * @param {Error} [error] Error object
   */
  _logError(message, error) {
    console.error(`[ValuesTestUtils] ${message}`, error || '');
  }
}

// Export the class
export { ValuesAssessmentTestUtils };
