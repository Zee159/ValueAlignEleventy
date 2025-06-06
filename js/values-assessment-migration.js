/**
 * Values Assessment Migration Utility
 * 
 * Handles migration of data from legacy values assessment implementation to new modular components.
 * Provides mapping between data formats, validation, and error handling.
 * 
 * Following ValueAlign development rules for authentication, error handling, and progressive enhancement.
 */

class ValuesAssessmentMigration {
  /**
   * Initialize the migration utility
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    // Dependencies
    this.authService = options.authService || window.authService;
    this.debug = options.debug || false;
    
    // Migration stats
    this.migrationStats = {
      startTime: null,
      endTime: null,
      success: false,
      dataFound: false,
      migratedItems: {
        selectedValues: false,
        prioritizedValues: false,
        reflectionResponses: false,
        completionDate: false
      },
      errors: []
    };

    // Data mapping between legacy and new formats
    this.dataMapping = {
      // Legacy localStorage keys
      legacy: {
        selectedValues: 'valueAssessment_selectedValues',
        prioritizedValues: 'valueAssessment_prioritizedValues',
        reflectionResponses: 'valueAssessment_reflectionResponses',
        completionDate: 'valueAssessment_completionDate',
        previousCompletionDate: 'valueAssessment_previousCompletionDate'
      },
      // New storage service keys
      new: {
        selectedValues: 'values_assessment_selected',
        prioritizedValues: 'values_assessment_prioritized',
        reflectionResponses: 'values_assessment_reflections'
      }
    };
    
    this._log('Migration utility initialized');
  }
  
  /**
   * Check if legacy data exists in localStorage
   * @returns {Promise<boolean>} Whether legacy data exists
   */
  async checkForLegacyData() {
    try {
      let hasLegacyData = false;
      
      // Check for any legacy keys
      for (const key in this.dataMapping.legacy) {
        const value = localStorage.getItem(this.dataMapping.legacy[key]);
        if (value) {
          hasLegacyData = true;
          this._log(`Found legacy data: ${key}`);
          break;
        }
      }
      
      this.migrationStats.dataFound = hasLegacyData;
      return hasLegacyData;
    } catch (error) {
      this._logError('Error checking for legacy data', error);
      return false;
    }
  }
  
  /**
   * Migrate data from legacy format to new format
   * @returns {Promise<boolean>} Migration success status
   */
  async migrateData() {
    try {
      this.migrationStats.startTime = new Date();
      this._log('Starting migration process');
      
      // Check if legacy data exists
      const hasLegacyData = await this.checkForLegacyData();
      if (!hasLegacyData) {
        this._log('No legacy data found, migration not needed');
        
        // Mark as success even though no migration happened
        this.migrationStats.success = true;
        this.migrationStats.endTime = new Date();
        return true;
      }
      
      // Initialize storage service
      const storageService = await this._getStorageService();
      if (!storageService) {
        throw new Error('Failed to initialize storage service');
      }
      
      // Extract legacy data
      const legacyData = this._extractLegacyData();
      
      // Transform and validate data
      const newData = this._transformData(legacyData);
      
      // Save to new storage
      const saved = await this._saveToNewStorage(storageService, newData);
      
      if (saved) {
        this._log('Migration completed successfully');
        this.migrationStats.success = true;
      } else {
        throw new Error('Failed to save migrated data');
      }
      
      this.migrationStats.endTime = new Date();
      return this.migrationStats.success;
    } catch (error) {
      this._logError('Migration failed', error);
      this.migrationStats.errors.push({
        time: new Date(),
        message: error.message,
        stack: error.stack
      });
      this.migrationStats.endTime = new Date();
      this.migrationStats.success = false;
      return false;
    }
  }
  
  /**
   * Extract legacy data from localStorage
   * @private
   * @returns {Object} Extracted legacy data
   */
  _extractLegacyData() {
    const legacyData = {};
    
    // Extract each data type
    for (const key in this.dataMapping.legacy) {
      const storageKey = this.dataMapping.legacy[key];
      const rawData = localStorage.getItem(storageKey);
      
      if (rawData) {
        try {
          // Parse JSON data (except completion dates which are stored as strings)
          if (key.includes('Date')) {
            legacyData[key] = rawData;
          } else {
            legacyData[key] = JSON.parse(rawData);
          }
          this._log(`Extracted legacy ${key}`);
        } catch (error) {
          this._logError(`Error parsing legacy ${key}`, error);
          // Store as-is if parsing fails
          legacyData[key] = rawData;
        }
      }
    }
    
    return legacyData;
  }
  
  /**
   * Transform legacy data to new format
   * @private
   * @param {Object} legacyData Extracted legacy data
   * @returns {Object} Transformed data in new format
   */
  _transformData(legacyData) {
    const newData = {};
    
    // Transform selected values (array of IDs)
    if (Array.isArray(legacyData.selectedValues)) {
      newData.selectedValues = [...legacyData.selectedValues];
      this.migrationStats.migratedItems.selectedValues = true;
    }
    
    // Transform prioritized values (array of IDs)
    if (Array.isArray(legacyData.prioritizedValues)) {
      newData.prioritizedValues = [...legacyData.prioritizedValues];
      this.migrationStats.migratedItems.prioritizedValues = true;
    }
    
    // Transform reflection responses (object with value IDs as keys)
    if (legacyData.reflectionResponses && typeof legacyData.reflectionResponses === 'object') {
      newData.reflectionResponses = {...legacyData.reflectionResponses};
      
      // Add migration timestamp to track when this data was migrated
      newData.reflectionResponses._migrationMeta = {
        migratedAt: new Date().toISOString(),
        source: 'legacy_values_assessment',
        version: '1.0'
      };
      
      this.migrationStats.migratedItems.reflectionResponses = true;
    }
    
    // Handle completion date (not directly stored in new format but can be in metadata)
    if (legacyData.completionDate) {
      if (!newData.reflectionResponses) {
        newData.reflectionResponses = {
          _migrationMeta: {
            migratedAt: new Date().toISOString(),
            source: 'legacy_values_assessment',
            version: '1.0'
          }
        };
      }
      
      newData.reflectionResponses._migrationMeta.completionDate = legacyData.completionDate;
      this.migrationStats.migratedItems.completionDate = true;
    }
    
    this._log('Data transformation complete', newData);
    return newData;
  }
  
  /**
   * Save transformed data to new storage
   * @private
   * @param {Object} storageService Storage service instance
   * @param {Object} newData Transformed data to save
   * @returns {Promise<boolean>} Save success status
   */
  async _saveToNewStorage(storageService, newData) {
    try {
      if (!storageService || typeof storageService.saveFullAssessment !== 'function') {
        throw new Error('Invalid storage service');
      }
      
      const result = await storageService.saveFullAssessment(newData);
      this._log('Saved data to new storage', result);
      return result;
    } catch (error) {
      this._logError('Failed to save to new storage', error);
      return false;
    }
  }
  
  /**
   * Get storage service instance
   * @private
   * @returns {Promise<Object>} Storage service instance
   */
  async _getStorageService() {
    try {
      // Get storage service from window if available (should be initialized by bootstrap)
      if (window.valuesAssessmentServices && window.valuesAssessmentServices.storageService) {
        return window.valuesAssessmentServices.storageService;
      }
      
      // Alternatively, dynamically import and initialize (dependency reduced)
      const { ValuesAssessmentStorage } = await import('./services/values-assessment/values-assessment-storage.js').catch(() => {
        // Attempt with alternate path if first path fails
        return import('./values-assessment-storage.js').catch(() => {
          throw new Error('Could not locate storage service module');
        });
      });
      const storageService = new ValuesAssessmentStorage({
        authService: this.authService
      });
      
      // Check if initialize method exists and call it if it does
      if (typeof storageService.initialize === 'function') {
        await storageService.initialize();
      }
      
      return storageService;
    } catch (error) {
      this._logError('Failed to get storage service', error);
      return null;
    }
  }
  
  /**
   * Clean up legacy data after successful migration
   * @param {boolean} [keepBackup=true] Whether to keep a backup of legacy data
   * @returns {Promise<boolean>} Cleanup success status
   */
  async cleanupLegacyData(keepBackup = true) {
    try {
      if (!this.migrationStats.success) {
        this._log('Skipping cleanup, migration was not successful');
        return false;
      }
      
      this._log('Cleaning up legacy data');
      
      // Create a backup if requested
      if (keepBackup) {
        const backup = {};
        for (const key in this.dataMapping.legacy) {
          const storageKey = this.dataMapping.legacy[key];
          const value = localStorage.getItem(storageKey);
          if (value) {
            backup[storageKey] = value;
          }
        }
        
        // Store backup in special location
        localStorage.setItem('valueAssessment_legacyBackup', JSON.stringify({
          timestamp: new Date().toISOString(),
          data: backup
        }));
        
        this._log('Legacy data backup created');
      }
      
      // Remove legacy data
      for (const key in this.dataMapping.legacy) {
        const storageKey = this.dataMapping.legacy[key];
        localStorage.removeItem(storageKey);
      }
      
      this._log('Legacy data removed from localStorage');
      return true;
    } catch (error) {
      this._logError('Error cleaning up legacy data', error);
      return false;
    }
  }
  
  /**
   * Get migration statistics
   * @returns {Object} Migration statistics
   */
  getMigrationStats() {
    return {...this.migrationStats};
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
        console.log(`[ValuesMigration] ${message}`, data);
      } else {
        console.log(`[ValuesMigration] ${message}`);
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
    console.error(`[ValuesMigration] ${message}`, error || '');
  }
}

// Export the class
export { ValuesAssessmentMigration };
