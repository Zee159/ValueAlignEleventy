/**
 * Values Assessment Data Migrator
 * 
 * Utility to migrate data from legacy values assessment format to the new format
 * Supports both localStorage migration and API-based migration for authenticated users
 * 
 * Following ValueAlign development rules for authentication, data handling and error management
 */

class ValuesAssessmentMigrator {
  /**
   * Create a migration utility
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.options = options;
    this.debug = options.debug || false;
    this.authService = options.authService || window.authService;
    this.targetStorageService = options.targetStorageService;
    this.legacyStorageKeys = {
      selectedValues: 'valuealign_selected_values',
      prioritizedValues: 'valuealign_prioritized_values',
      reflections: 'valuealign_reflections',
      completedSteps: 'valuealign_completed_steps'
    };
    
    // API endpoints if using server migration
    this.api = options.api || {
      baseUrl: '/api/values-assessment/',
      endpoints: {
        migrate: 'migrate'
      }
    };
    
    // Events
    this.events = new EventTarget();
    
    this._log('Migrator created');
  }
  
  /**
   * Check if legacy data exists
   * @returns {Promise<boolean>} Whether legacy data exists
   */
  async checkForLegacyData() {
    try {
      this._log('Checking for legacy data');
      
      // Check for authenticated user data first
      if (this.authService && this.authService.isAuthenticated()) {
        const hasServerData = await this._checkForServerLegacyData();
        if (hasServerData) {
          return true;
        }
      }
      
      // Check local storage as fallback
      return this._checkForLocalLegacyData();
    } catch (error) {
      this._logError('Error checking for legacy data', error);
      return false;
    }
  }
  
  /**
   * Migrate legacy data to the new format
   * @returns {Promise<Object>} Migration result
   */
  async migrateData() {
    try {
      this._log('Starting data migration');
      
      this._fireEvent('migration-start');
      
      // Select migration method based on auth status
      let migrationResult;
      
      if (this.authService && this.authService.isAuthenticated()) {
        // Try server migration first
        try {
          migrationResult = await this._migrateServerData();
        } catch (serverError) {
          this._logError('Server migration failed, falling back to local', serverError);
          migrationResult = await this._migrateLocalData();
        }
      } else {
        // Only local migration for non-authenticated users
        migrationResult = await this._migrateLocalData();
      }
      
      if (migrationResult.success) {
        // Clean up legacy data if requested
        if (this.options.cleanupAfterMigration) {
          await this._cleanupLegacyData();
        }
        
        this._fireEvent('migration-complete', migrationResult);
      } else {
        this._fireEvent('migration-failed', migrationResult);
      }
      
      return migrationResult;
    } catch (error) {
      this._logError('Migration failed', error);
      
      const result = {
        success: false,
        error: error.message || 'Unknown migration error',
        migratedData: null
      };
      
      this._fireEvent('migration-failed', result);
      
      return result;
    }
  }
  
  /**
   * Register event listener
   * @param {string} eventName Event name
   * @param {Function} handler Event handler
   */
  on(eventName, handler) {
    this.events.addEventListener(eventName, handler);
  }
  
  /**
   * Remove event listener
   * @param {string} eventName Event name
   * @param {Function} handler Event handler
   */
  off(eventName, handler) {
    this.events.removeEventListener(eventName, handler);
  }
  
  /**
   * Check for legacy data in server storage
   * @private
   * @returns {Promise<boolean>} Whether server legacy data exists
   */
  async _checkForServerLegacyData() {
    try {
      if (!this.authService || !this.authService.isAuthenticated()) {
        return false;
      }
      
      const token = this.authService.getAuthToken();
      if (!token) return false;
      
      const response = await fetch(`${this.api.baseUrl}${this.api.endpoints.migrate}/check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.hasLegacyData === true;
    } catch (error) {
      this._logError('Error checking server legacy data', error);
      return false;
    }
  }
  
  /**
   * Check for legacy data in localStorage
   * @private
   * @returns {boolean} Whether local legacy data exists
   */
  _checkForLocalLegacyData() {
    try {
      // Check for any legacy keys
      for (const key of Object.values(this.legacyStorageKeys)) {
        const value = localStorage.getItem(key);
        if (value) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this._logError('Error checking local legacy data', error);
      return false;
    }
  }
  
  /**
   * Migrate server data
   * @private
   * @returns {Promise<Object>} Migration result
   */
  async _migrateServerData() {
    if (!this.authService || !this.authService.isAuthenticated()) {
      throw new Error('User not authenticated');
    }
    
    const token = this.authService.getAuthToken();
    if (!token) {
      throw new Error('Auth token not available');
    }
    
    this._log('Migrating server data');
    
    const response = await fetch(`${this.api.baseUrl}${this.api.endpoints.migrate}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ migrateToNewFormat: true })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Server migration failed: ${error}`);
    }
    
    const data = await response.json();
    
    // Save migrated data to the target storage service if provided
    if (this.targetStorageService && data.migratedData) {
      await this.targetStorageService.saveAll(data.migratedData);
    }
    
    return {
      success: true,
      source: 'server',
      migratedData: data.migratedData || {}
    };
  }
  
  /**
   * Migrate local data
   * @private
   * @returns {Promise<Object>} Migration result
   */
  async _migrateLocalData() {
    this._log('Migrating local data');
    
    try {
      // Read legacy data from localStorage
      const legacyData = {
        selectedValues: this._parseLegacyStorage(this.legacyStorageKeys.selectedValues),
        prioritizedValues: this._parseLegacyStorage(this.legacyStorageKeys.prioritizedValues),
        reflections: this._parseLegacyStorage(this.legacyStorageKeys.reflections),
        completedSteps: this._parseLegacyStorage(this.legacyStorageKeys.completedSteps)
      };
      
      // Transform to new format
      const migratedData = this._transformToNewFormat(legacyData);
      
      // Save to the new storage service if provided
      if (this.targetStorageService) {
        await this.targetStorageService.saveAll(migratedData);
      }
      
      return {
        success: true,
        source: 'local',
        migratedData
      };
    } catch (error) {
      this._logError('Error migrating local data', error);
      
      return {
        success: false,
        source: 'local',
        error: error.message || 'Local data migration failed',
        migratedData: null
      };
    }
  }
  
  /**
   * Transform legacy data format to new format
   * @private
   * @param {Object} legacyData Legacy data
   * @returns {Object} Data in new format
   */
  _transformToNewFormat(legacyData) {
    const newFormat = {
      selectedValues: [],
      prioritizedValues: [],
      reflections: {},
      completedSteps: [],
      metadata: {
        migratedFrom: 'legacy',
        migratedAt: new Date().toISOString(),
        legacy: true
      }
    };
    
    // Convert selected values
    if (Array.isArray(legacyData.selectedValues)) {
      newFormat.selectedValues = [...legacyData.selectedValues];
    }
    
    // Convert prioritized values
    if (Array.isArray(legacyData.prioritizedValues)) {
      newFormat.prioritizedValues = [...legacyData.prioritizedValues];
    }
    
    // Convert reflections
    if (legacyData.reflections && typeof legacyData.reflections === 'object') {
      // Legacy format might have different structure
      const reflections = legacyData.reflections;
      
      // Check if it's the old array format or the new object format
      if (Array.isArray(reflections)) {
        // Convert array format to object format
        reflections.forEach((reflection) => {
          if (reflection && reflection.valueId && reflection.text) {
            newFormat.reflections[reflection.valueId] = reflection.text;
          }
        });
      } else {
        // Already in object format
        newFormat.reflections = { ...reflections };
      }
    }
    
    // Convert completed steps
    if (Array.isArray(legacyData.completedSteps)) {
      newFormat.completedSteps = [...legacyData.completedSteps];
    }
    
    return newFormat;
  }
  
  /**
   * Clean up legacy data after successful migration
   * @private
   * @returns {Promise<void>}
   */
  async _cleanupLegacyData() {
    try {
      this._log('Cleaning up legacy data');
      
      // Clean up local storage
      Object.values(this.legacyStorageKeys).forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          this._log(`Failed to remove key ${key}: ${e.message}`);
        }
      });
      
      // Clean up server legacy data if authenticated
      if (this.authService && this.authService.isAuthenticated()) {
        const token = this.authService.getAuthToken();
        if (token) {
          await fetch(`${this.api.baseUrl}${this.api.endpoints.migrate}/cleanup`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
    } catch (error) {
      this._logError('Error cleaning up legacy data', error);
      // Non-critical error, don't throw
    }
  }
  
  /**
   * Parse legacy storage item
   * @private
   * @param {string} key Storage key
   * @returns {*} Parsed value or null
   */
  _parseLegacyStorage(key) {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      
      return JSON.parse(value);
    } catch (error) {
      this._log(`Error parsing key ${key}: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Fire custom event
   * @private
   * @param {string} eventName Event name
   * @param {Object} detail Event details
   */
  _fireEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, {
      bubbles: false,
      cancelable: false,
      detail
    });
    
    this.events.dispatchEvent(event);
    
    // Also dispatch on document for wider listeners
    document.dispatchEvent(new CustomEvent(`values-assessment-${eventName}`, {
      bubbles: true,
      cancelable: false,
      detail
    }));
  }
  
  /**
   * Log debug message
   * @private
   * @param {string} message Message to log
   */
  _log(message) {
    if (this.debug) {
      console.log(`[ValuesAssessmentMigrator] ${message}`);
    }
  }
  
  /**
   * Log error message
   * @private
   * @param {string} message Error message
   * @param {Error} error Error object
   */
  _logError(message, error) {
    console.error(`[ValuesAssessmentMigrator] ${message}:`, error);
  }
}

// Export the migrator
export { ValuesAssessmentMigrator };
