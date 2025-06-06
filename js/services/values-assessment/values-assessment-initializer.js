/**
 * Values Assessment Initializer
 * Responsible for initializing and configuring all services required for the values assessment
 * 
 * Following ValueAlign development rules for service organization and auth integration
 */

class ValuesAssessmentInitializer {
  /**
   * Create an initializer
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.options = options;
    this.authService = options.authService || window.authService;
    this.themeService = options.themeService || window.themeSystem;
    this.valuesData = options.valuesData || window.valuesData || [];
    
    // Services
    this.coreService = null;
    this.storageService = null;
    this.aiService = null;
    this.exporterService = null;
    this.uiService = null;
    
    // Configuration
    this.config = {
      debug: options.debug || false,
      autosave: options.autosave !== false,  // Defaults to true
      container: options.container || document.getElementById('values-assessment-container'),
      api: options.api || {
        baseUrl: '/api/values-assessment/',
        endpoints: {
          save: 'save',
          load: 'load',
          insights: 'insights',
          export: 'export'
        }
      }
    };
    
    // Debug logging
    this._log('Initializer created');
  }
  
  /**
   * Initialize all services
   * @returns {Object} Object containing all initialized services
   */
  async initialize() {
    try {
      this._log('Initializing services');
      
      // Check auth state
      const isAuthenticated = this.authService ? this.authService.isAuthenticated() : false;
      const isPremiumUser = this.authService ? this.authService.hasPremiumAccess() : false;
      
      this._log(`Auth state: authenticated=${isAuthenticated}, premium=${isPremiumUser}`);
      
      // 1. Initialize storage service
      this.storageService = await this._initializeStorageService({
        authService: this.authService,
        isAuthenticated,
        debug: this.config.debug,
        api: this.config.api
      });
      
      // 2. Initialize AI service (if premium)
      if (isPremiumUser) {
        this.aiService = await this._initializeAIService({
          authService: this.authService,
          debug: this.config.debug,
          api: this.config.api
        });
      }
      
      // 3. Initialize core service
      this.coreService = await this._initializeCoreService({
        storageService: this.storageService,
        aiService: this.aiService,
        valuesData: this.valuesData,
        isPremiumUser,
        isAuthenticated,
        autosave: this.config.autosave,
        debug: this.config.debug
      });
      
      // 4. Initialize exporter service
      this.exporterService = await this._initializeExporterService({
        coreService: this.coreService,
        authService: this.authService,
        isPremiumUser,
        debug: this.config.debug,
        api: this.config.api
      });
      
      // 5. Initialize UI service
      this.uiService = await this._initializeUIService({
        coreService: this.coreService,
        container: this.config.container,
        themeService: this.themeService,
        debug: this.config.debug
      });
      
      // Connect services
      this.coreService.setUIService(this.uiService);
      this.coreService.setExporterService(this.exporterService);
      
      this._log('All services initialized successfully');
      
      // Return all services
      return {
        coreService: this.coreService,
        storageService: this.storageService,
        aiService: this.aiService,
        exporterService: this.exporterService,
        uiService: this.uiService
      };
    } catch (error) {
      this._logError('Failed to initialize services', error);
      throw error;
    }
  }
  
  /**
   * Initialize storage service
   * @private
   * @param {Object} options Storage service options
   * @returns {ValuesAssessmentStorage} Initialized storage service
   */
  async _initializeStorageService(options) {
    try {
      this._log('Initializing storage service');
      
      const storageService = new ValuesAssessmentStorage({
        authService: options.authService,
        isAuthenticated: options.isAuthenticated,
        debug: options.debug,
        api: options.api
      });
      
      await storageService.initialize();
      
      return storageService;
    } catch (error) {
      this._logError('Failed to initialize storage service', error);
      throw error;
    }
  }
  
  /**
   * Initialize AI service
   * @private
   * @param {Object} options AI service options
   * @returns {ValuesAssessmentAI} Initialized AI service
   */
  async _initializeAIService(options) {
    try {
      this._log('Initializing AI service');
      
      const aiService = new ValuesAssessmentAI({
        authService: options.authService,
        debug: options.debug,
        api: options.api
      });
      
      await aiService.initialize();
      
      return aiService;
    } catch (error) {
      this._logError('Failed to initialize AI service', error);
      
      // AI service is optional, so we can continue without it
      this._log('Continuing without AI service');
      return null;
    }
  }
  
  /**
   * Initialize core service
   * @private
   * @param {Object} options Core service options
   * @returns {ValuesAssessmentService} Initialized core service
   */
  async _initializeCoreService(options) {
    try {
      this._log('Initializing core service');
      
      const coreService = new ValuesAssessmentService({
        storageService: options.storageService,
        aiService: options.aiService,
        valuesData: options.valuesData,
        isPremiumUser: options.isPremiumUser,
        isAuthenticated: options.isAuthenticated,
        autosave: options.autosave,
        debug: options.debug
      });
      
      await coreService.initialize();
      
      return coreService;
    } catch (error) {
      this._logError('Failed to initialize core service', error);
      throw error;
    }
  }
  
  /**
   * Initialize exporter service
   * @private
   * @param {Object} options Exporter service options
   * @returns {ValuesAssessmentExporter} Initialized exporter service
   */
  async _initializeExporterService(options) {
    try {
      this._log('Initializing exporter service');
      
      const exporterService = new ValuesAssessmentExporter({
        coreService: options.coreService,
        authService: options.authService,
        isPremiumUser: options.isPremiumUser,
        debug: options.debug,
        api: options.api
      });
      
      await exporterService.initialize();
      
      return exporterService;
    } catch (error) {
      this._logError('Failed to initialize exporter service', error);
      
      // Exporter service is not critical, so we can continue without it
      this._log('Continuing without exporter service');
      return null;
    }
  }
  
  /**
   * Initialize UI service
   * @private
   * @param {Object} options UI service options
   * @returns {ValuesAssessmentUI} Initialized UI service
   */
  async _initializeUIService(options) {
    try {
      this._log('Initializing UI service');
      
      const uiService = new ValuesAssessmentUI({
        coreService: options.coreService,
        container: options.container,
        themeService: options.themeService,
        debug: options.debug
      });
      
      await uiService.initialize();
      
      return uiService;
    } catch (error) {
      this._logError('Failed to initialize UI service', error);
      throw error;
    }
  }
  
  /**
   * Log debug message
   * @private
   * @param {string} message Message to log
   */
  _log(message) {
    if (this.config.debug) {
      console.log(`[ValuesAssessmentInitializer] ${message}`);
    }
  }
  
  /**
   * Log error message
   * @private
   * @param {string} message Error message
   * @param {Error} error Error object
   */
  _logError(message, error) {
    console.error(`[ValuesAssessmentInitializer] ${message}:`, error);
  }
}

// Import dependencies
import { ValuesAssessmentService } from './values-assessment-service.js';
import { ValuesAssessmentStorage } from './values-assessment-storage.js';
import { ValuesAssessmentAI } from './values-assessment-ai.js';
import { ValuesAssessmentExporter } from './values-assessment-exporter.js';
import { ValuesAssessmentUI } from './values-assessment-ui.js';

// Export the initializer
export { ValuesAssessmentInitializer };
