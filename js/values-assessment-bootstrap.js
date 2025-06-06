/**
 * Values Assessment Bootstrap
 * 
 * This script initializes the new Values Assessment components based on the user's configuration.
 * It provides a smooth transition between legacy and new components.
 * 
 * Includes data migration capabilities to ensure backward compatibility
 * during the transition from legacy to new modular components.
 */

(function() {
  'use strict';
  
  // Configuration object with feature flags
  const defaultConfig = {
    useNewAssessment: true,
    useNewResults: true,
    useNewReflection: true,
    useNewNextSteps: true,
    enableMigration: true,    // Enable data migration from legacy
    cleanupLegacyData: false, // Cleanup legacy data after migration
    debug: false
  };
  
  // Entry point function
  function initValuesAssessment() {
    console.log('[ValuesAssessmentBootstrap] Initializing Values Assessment');
    
    // Merge default config with any window config
    const config = Object.assign({}, defaultConfig, window.valueAssessmentConfig || {});
    
    // Save config globally for other components to access
    window.valueAssessmentConfig = config;
    
    // Debug output
    if (config.debug) {
      console.log('[ValuesAssessmentBootstrap] Configuration:', config);
    }
    
    // If using new assessment framework, initialize it
    if (config.useNewAssessment) {
      // Use Promise-based approach for async operations
      initializeNewAssessment()
        .catch(error => {
          console.error('[ValuesAssessmentBootstrap] Error initializing new assessment:', error);
          // Fallback to legacy if new assessment fails
          showLegacyAssessment();
        });
    } else {
      // Otherwise, show legacy assessment
      showLegacyAssessment();
    }
  }
  
  // Check and migrate legacy data if needed
  async function checkAndMigrateData(config) {
    if (!config.enableMigration) {
      if (config.debug) {
        console.log('[ValuesAssessmentBootstrap] Migration disabled, skipping');
      }
      return { success: true, migrated: false };
    }
    
    try {
      // Import the migration utility
      const { ValuesAssessmentMigration } = await import('./values-assessment-migration.js');
      
      // Create migration utility
      const migrationUtil = new ValuesAssessmentMigration({
        debug: config.debug
      });
      
      // Check for legacy data
      const hasLegacyData = await migrationUtil.checkForLegacyData();
      
      if (!hasLegacyData) {
        if (config.debug) {
          console.log('[ValuesAssessmentBootstrap] No legacy data found, skipping migration');
        }
        return { success: true, migrated: false };
      }
      
      // Migrate data
      console.log('[ValuesAssessmentBootstrap] Legacy data found, starting migration');
      const migrationSuccess = await migrationUtil.migrateData();
      
      if (migrationSuccess) {
        console.log('[ValuesAssessmentBootstrap] Migration completed successfully');
        
        // Cleanup legacy data if enabled
        if (config.cleanupLegacyData) {
          await migrationUtil.cleanupLegacyData(true);
          console.log('[ValuesAssessmentBootstrap] Legacy data cleaned up');
        }
        
        // Store migration stats in window for debugging
        window.valueAssessmentMigrationStats = migrationUtil.getMigrationStats();
        
        return { success: true, migrated: true, stats: migrationUtil.getMigrationStats() };
      } else {
        console.error('[ValuesAssessmentBootstrap] Migration failed');
        return { success: false, migrated: false, stats: migrationUtil.getMigrationStats() };
      }
    } catch (error) {
      console.error('[ValuesAssessmentBootstrap] Error during migration check:', error);
      return { success: false, migrated: false, error };
    }
  }
  
  // Initialize new assessment framework
  async function initializeNewAssessment() {
    try {
      const config = window.valueAssessmentConfig;
      
      // Check and migrate legacy data if needed
      const migrationResult = await checkAndMigrateData(config);
      if (config.debug) {
        console.log('[ValuesAssessmentBootstrap] Migration result:', migrationResult);
      }
      
      // Import the new assessment class
      const module = await import('./values-assessment-new.js');
      const ValuesAssessment = module.ValuesAssessment;
      
      // Find the container
      const container = document.getElementById('values-assessment-app');
      
      if (!container) {
        console.error('[ValuesAssessmentBootstrap] Container not found');
        showLegacyAssessment();
        return false;
      }
      
      // Create and initialize the new assessment
      const assessment = new ValuesAssessment({
        containerId: 'values-assessment-app',
        debug: window.valueAssessmentConfig.debug
      });
      
      // Store globally for testing and debugging
      window.valueAssessmentInstance = assessment;
      
      // Initialize the assessment
      const success = await assessment.initialize();
      
      if (success) {
        console.log('[ValuesAssessmentBootstrap] New assessment initialized successfully');
        
        // Hide legacy content
        const legacyContainer = document.getElementById('legacy-assessment-container');
        if (legacyContainer) {
          legacyContainer.classList.add('hidden');
        }
        
        // Make the container visible
        container.classList.remove('hidden');
        return true;
      } else {
        console.error('[ValuesAssessmentBootstrap] Failed to initialize new assessment');
        showLegacyAssessment();
        return false;
      }
    } catch (error) {
      console.error('[ValuesAssessmentBootstrap] Error initializing new assessment:', error);
      showLegacyAssessment();
      return false;
    }
  }
  
  // Fallback to legacy assessment
  function showLegacyAssessment() {
    console.log('[ValuesAssessmentBootstrap] Falling back to legacy assessment');
    
    try {
      // Find the legacy container
      const legacyContainer = document.getElementById('legacy-assessment-container');
      
      if (legacyContainer) {
        legacyContainer.classList.remove('hidden');
      }
      
      // Hide new container
      const newContainer = document.getElementById('values-assessment-app');
      if (newContainer) {
        newContainer.classList.add('hidden');
      }
      
      // Initialize legacy assessment if needed
      if (window.ValuesAssessment && typeof window.ValuesAssessment === 'function') {
        const legacyAssessment = new window.ValuesAssessment();
        if (typeof legacyAssessment.init === 'function') {
          legacyAssessment.init();
        }
      }
    } catch (error) {
      console.error('[ValuesAssessmentBootstrap] Error showing legacy assessment:', error);
    }
  }
  
  // Initialize when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initValuesAssessment);
  } else {
    initValuesAssessment();
  }
})();
