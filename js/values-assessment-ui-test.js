/**
 * Values Assessment UI Test
 * 
 * This script demonstrates the enhanced UI controller with component registry
 * integration and dynamic component loading.
 */

// Sample values data for testing
const sampleValues = [
  { id: 'achievement', name: 'Achievement', description: 'Success, accomplishment, and mastery' },
  { id: 'balance', name: 'Balance', description: 'Stability and equilibrium in different areas of life' },
  { id: 'creativity', name: 'Creativity', description: 'Innovation, imagination, and original thinking' },
  { id: 'freedom', name: 'Freedom', description: 'Independence, autonomy, and self-determination' },
  { id: 'growth', name: 'Growth', description: 'Development, improvement, and personal expansion' },
  { id: 'harmony', name: 'Harmony', description: 'Peace, tranquility, and alignment with others' },
  { id: 'health', name: 'Health', description: 'Physical, mental, and emotional well-being' },
  { id: 'honesty', name: 'Honesty', description: 'Truthfulness, integrity, and authentic expression' },
  { id: 'kindness', name: 'Kindness', description: 'Compassion, empathy, and consideration for others' },
  { id: 'loyalty', name: 'Loyalty', description: 'Faithfulness, commitment, and dedication to relationships' }
];

// Make the test class available globally
window.ValuesAssessmentUITest = class ValuesAssessmentUITest {
  constructor() {
    this.container = document.getElementById('values-assessment-app');
    this.testConsole = document.getElementById('test-console');
    this.simulatePremiumCheckbox = document.getElementById('test-simulate-premium');
    this.services = {};
    this.ui = null;
    
    // Initialize event listeners
    this.initEventListeners();
    
    this.log('Values Assessment UI Test initialized');
  }
  
  /**
   * Initialize event listeners for test controls
   */
  initEventListeners() {
    // Initialize components button
    const initButton = document.getElementById('test-initialize-button');
    if (initButton) {
      initButton.addEventListener('click', () => this.initializeComponents());
    }
    
    // Test buttons for specific views
    const resultsButton = document.getElementById('test-results-button');
    if (resultsButton) {
      resultsButton.addEventListener('click', () => this.testResultsView());
    }
    
    const reflectionButton = document.getElementById('test-reflection-button');
    if (reflectionButton) {
      reflectionButton.addEventListener('click', () => this.testReflectionView());
    }
    
    // Theme testing
    const themeSelect = document.getElementById('test-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (event) => {
        this.setTheme(event.target.value);
      });
      
      // Set initial value based on current theme
      const currentTheme = localStorage.getItem('valuealign_theme') || 'system';
      themeSelect.value = currentTheme;
    }
  }
  
  /**
   * Initialize the UI components and services
   */
  async initializeComponents() {
    try {
      this.log('Initializing components...');
      
      // Clear placeholder
      const placeholder = document.getElementById('values-test-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      
      // Check if container exists
      if (!this.container) {
        throw new Error('Container element not found');
      }
      
      try {
        // Check if ValuesAssessmentStorage exists
        if (typeof ValuesAssessmentStorage !== 'function') {
          this.log('ValuesAssessmentStorage not found, creating mock storage');
          // Create a mock storage service if real one isn't available
          window.ValuesAssessmentStorage = class MockStorage {
            constructor(options) {
              this.options = options;
              this.data = {};
            }
            async initialize() { return true; }
            async save(key, data) { this.data[key] = data; return true; }
            async load(key) { return this.data[key] || null; }
          };
        }
        
        if (typeof ValuesAssessmentService !== 'function') {
          this.log('ValuesAssessmentService not found, creating mock service');
          // Create a mock service if real one isn't available
          window.ValuesAssessmentService = class MockService {
            constructor(options) {
              this.options = options;
              this.valuesData = options.valuesData || [];
              this.selectedValues = [];
              this.prioritizedValues = [];
              this.currentStep = 1;
              this.totalSteps = 5;
              this.maxSelections = 5;
              this.isPremiumUser = options.isPremiumUser || false;
              this.eventHandlers = {};
            }
            async initialize() { return true; }
            getSelectedValues() { return this.selectedValues; }
            selectValue(id) { if (!this.selectedValues.includes(id)) this.selectedValues.push(id); }
            deselectValue(id) { this.selectedValues = this.selectedValues.filter(v => v !== id); }
            setStep(step) { 
              this.currentStep = step; 
              if (this.eventHandlers.stepChanged) {
                this.eventHandlers.stepChanged({step});
              }
            }
            goToNextStep() { this.setStep(Math.min(this.currentStep + 1, this.totalSteps)); }
            goToPreviousStep() { this.setStep(Math.max(this.currentStep - 1, 1)); }
            getCurrentStepData() { return {}; }
            updatePriorities(values) { this.prioritizedValues = [...values]; }
            on(event, handler) { this.eventHandlers[event] = handler; }
          };
        }
      } catch (e) {
        this.logError('Error setting up mock services', e);
      }
      
      // Create storage service
      const storage = new window.ValuesAssessmentStorage({
        debug: true,
        localStorage: true,
        api: { baseUrl: '/api/values-assessment/' }
      });
      this.services.storage = storage;
      
      // Create service with sample data
      const service = new window.ValuesAssessmentService({
        valuesData: sampleValues,
        storageService: storage,
        debug: true,
        isPremiumUser: this.simulatePremiumCheckbox?.checked || false
      });
      this.services.service = service;
      
      // Create UI controller
      if (typeof window.ValuesAssessmentUI !== 'function') {
        this.log('ValuesAssessmentUI class not found, creating mock UI controller', true);
        // Create a mock UI controller if real one isn't available
        window.ValuesAssessmentUI = class MockUI {
          constructor(options) {
            this.options = options;
            this.container = options.container;
            this.service = options.service;
            this.storageService = options.storageService;
            this.debug = options.debug || false;
          }
          initialize() { return Promise.resolve(); }
          render() { 
            if (this.container) {
              this.container.innerHTML = '<div class="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg"><h2 class="text-xl font-bold">Mock UI</h2><p>This is a mock UI component</p></div>'; 
            }
            return Promise.resolve(); 
          }
        };
      }
      
      // Create UI controller using global reference
      this.ui = new window.ValuesAssessmentUI({
        container: this.container,
        service: service,
        storageService: storage,
        themeService: window.themeSystem,
        debug: true
      });
      
      // Initialize UI only - we'll handle the services directly
      if (typeof this.ui.initialize === 'function') {
        await this.ui.initialize();
      } else {
        this.log('UI controller does not have an initialize method, proceeding with render');
      }
      
      try {
        // Show introduction step
        if (typeof this.ui.render === 'function') {
          await this.ui.render();
          this.log('UI rendered successfully');
        } else {
          this.logError('UI controller does not have a render method');
          throw new Error('UI controller missing render method');
        }
        
        this.log('Components initialized successfully');
        this.log(`Current step: ${this.services.service.currentStep}`);
      } catch (error) {
        this.logError('Error rendering UI', error);
        
        // Show fallback UI
        this.container.innerHTML = `
          <div class="p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-lg">
            <h2 class="text-xl font-bold mb-2">Values Assessment</h2>
            <p class="mb-4">This is a basic fallback view of the Values Assessment.</p>
            <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onclick="document.getElementById('values-test-placeholder').style.display = 'flex'">
              Show Introduction
            </button>
          </div>
        `;
      }
      
      // Listen for step changes
      this.services.service.on('stepChanged', (data) => {
        this.log(`Step changed: ${data.step}`);
      });
      
      return true;
    } catch (error) {
      this.logError('Error initializing components', error);
      return false;
    }
  }
  
  /**
   * Test the results view
   */
  async testResultsView() {
    try {
      if (!this.ui || !this.services.service) {
        await this.initializeComponents();
      }
      
      this.log('Testing results view...');
      
      // Set some selected values
      this.services.service.selectedValues = ['achievement', 'growth', 'freedom', 'honesty', 'kindness'];
      this.services.service.prioritizedValues = ['growth', 'freedom', 'honesty', 'achievement', 'kindness'];
      
      // Set some reflection data
      this.services.service.reflections = {
        'growth': 'I value continuous personal and professional development.',
        'freedom': 'Having independence in my choices is important to me.',
        'honesty': 'Being truthful and authentic in all situations guides my decisions.'
      };
      
      // Go to summary step
      this.services.service.setStep(5);
      
      this.log('Results view loaded');
      return true;
    } catch (error) {
      this.logError('Error loading results view', error);
      return false;
    }
  }
  
  /**
   * Test the reflection view
   */
  async testReflectionView() {
    try {
      if (!this.ui || !this.services.service) {
        await this.initializeComponents();
      }
      
      this.log('Testing reflection view...');
      
      // Set some selected values
      this.services.service.selectedValues = ['achievement', 'growth', 'freedom', 'honesty', 'kindness'];
      this.services.service.prioritizedValues = ['growth', 'freedom', 'honesty', 'achievement', 'kindness'];
      
      // Go to reflection step
      this.services.service.setStep(4);
      
      this.log('Reflection view loaded');
      return true;
    } catch (error) {
      this.logError('Error loading reflection view', error);
      return false;
    }
  }
  
  /**
   * Set the theme
   * @param {string} theme - Theme to set (light, dark, system)
   */
  setTheme(theme) {
    if (!theme || !['light', 'dark', 'system'].includes(theme)) {
      theme = 'system';
    }
    
    this.log(`Setting theme to: ${theme}`);
    
    // Set theme in localStorage
    localStorage.setItem('valuealign_theme', theme);
    
    // Apply theme
    if (window.themeSystem && typeof window.themeSystem.setTheme === 'function') {
      window.themeSystem.setTheme(theme);
      this.log('Theme applied via themeSystem');
    } else {
      // Fallback theme implementation
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.add('light-theme');
      }
      this.log('Theme applied via fallback method');
    }
  }
  
  /**
   * Log a message to the test console
   * @param {string} message - Message to log
   * @param {*} [data] - Optional data to log
   */
  log(message, data) {
    const timestamp = new Date().toLocaleTimeString();
    
    // Log to test console if available
    if (this.testConsole) {
      const logItem = document.createElement('div');
      logItem.className = 'log-item';
      
      if (data) {
        let dataString;
        try {
          dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
        } catch (e) {
          dataString = '[Object]';
        }
        
        logItem.textContent = `${timestamp} 🔵 ${message} - ${dataString}`;
        console.log(`[ValuesTest] ${message}`, data);
      } else {
        logItem.textContent = `${timestamp} 🔵 ${message}`;
        console.log(`[ValuesTest] ${message}`);
      }
      
      this.testConsole.appendChild(logItem);
      this.testConsole.scrollTop = this.testConsole.scrollHeight;
    } else {
      console.log(`[ValuesTest] ${message}`, data || '');
    }
  }
  
  /**
   * Log an error to the test console
   * @param {string} message - Error message
   * @param {Error} [error] - Optional error object
   */
  logError(message, error) {
    const timestamp = new Date().toLocaleTimeString();
    
    // Log to test console if available
    if (this.testConsole) {
      const logItem = document.createElement('div');
      logItem.className = 'log-item log-error';
      
      if (error) {
        logItem.textContent = `${timestamp} 🔴 ${message}: ${error.message}`;
        console.error(`[ValuesTest] ${message}:`, error);
      } else {
        logItem.textContent = `${timestamp} 🔴 ${message}`;
        console.error(`[ValuesTest] ${message}`);
      }
      
      this.testConsole.appendChild(logItem);
      this.testConsole.scrollTop = this.testConsole.scrollHeight;
    } else {
      console.error(`[ValuesTest] ${message}`, error || '');
    }
  }
}

/**
 * Make sure the class is available globally first
 */
if (typeof window !== 'undefined') {
  window.ValuesAssessmentUITest = ValuesAssessmentUITest;
}

/**
 * Support ES module export if possible
 */
try {
  // Check if we're in a module context
  if (typeof module !== 'undefined') {
    module.exports = { ValuesAssessmentUITest };
  } else if (typeof exports !== 'undefined') {
    exports.ValuesAssessmentUITest = ValuesAssessmentUITest;
  }
} catch (e) {
  // Silently fail for browsers without module support
  console.log('Module exports not supported in this context');
}

// Also try ES module export syntax in a way that won't break in regular scripts
try {
  Object.defineProperty(window, '__moduleExports', {
    value: { ValuesAssessmentUITest },
    writable: false
  });
} catch (e) {
  // Silently continue if this fails
}

