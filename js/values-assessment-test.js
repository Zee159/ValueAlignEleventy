/**
 * Values Assessment Test Harness
 * 
 * Provides utilities for testing and debugging the Values Assessment components.
 * - Tests component initialization
 * - Checks theme integration
 * - Verifies navigation between steps
 * - Tests auth integration
 */

(function() {
  'use strict';

  // Store test results
  const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
  };

  // Test UI elements
  let testControlsContainer;
  let testResultsContainer;
  let testLogContainer;

  // Test harness config
  const config = {
    debug: true,
    autoTest: false,
    showUiControls: true,
    recordLogs: true,
    maxLogItems: 100
  };

  /**
   * Initialize the test harness
   */
  function initialize() {
    console.log('[ValuesAssessmentTest] Initializing test harness');
    
    if (config.showUiControls) {
      createTestUI();
    }
    
    if (config.autoTest) {
      runAllTests();
    }
  }

  /**
   * Create the test UI
   */
  function createTestUI() {
    // Create test controls container if it doesn't exist
    if (!document.getElementById('values-test-controls')) {
      testControlsContainer = document.createElement('div');
      testControlsContainer.id = 'values-test-controls';
      testControlsContainer.className = 'fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 w-80';
      testControlsContainer.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300">Values Assessment Test Harness</h3>
          <button id="test-toggle-button" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Hide</button>
        </div>
        <div id="test-controls-content">
          <div class="flex flex-col space-y-2 mb-3">
            <button id="run-all-tests-button" class="bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700">Run All Tests</button>
            <div class="grid grid-cols-2 gap-2">
              <button id="test-init-button" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs py-1 px-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Test Init</button>
              <button id="test-theme-button" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs py-1 px-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Test Theme</button>
              <button id="test-navigation-button" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs py-1 px-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Test Nav</button>
              <button id="test-auth-button" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs py-1 px-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600">Test Auth</button>
            </div>
          </div>
          <div id="test-results" class="mb-3 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs"></div>
          <div class="mb-1 flex justify-between items-center">
            <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300">Test Log</h4>
            <button id="clear-log-button" class="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Clear</button>
          </div>
          <div id="test-log" class="h-32 overflow-y-auto text-xs p-2 bg-gray-100 dark:bg-gray-900 rounded font-mono"></div>
        </div>
      `;
      document.body.appendChild(testControlsContainer);
      
      // Store references to containers
      testResultsContainer = document.getElementById('test-results');
      testLogContainer = document.getElementById('test-log');
      
      // Set up event listeners
      document.getElementById('run-all-tests-button').addEventListener('click', runAllTests);
      document.getElementById('test-init-button').addEventListener('click', () => runTestSuite('initialization'));
      document.getElementById('test-theme-button').addEventListener('click', () => runTestSuite('theme'));
      document.getElementById('test-navigation-button').addEventListener('click', () => runTestSuite('navigation'));
      document.getElementById('test-auth-button').addEventListener('click', () => runTestSuite('auth'));
      document.getElementById('clear-log-button').addEventListener('click', clearTestLog);
      
      // Set up toggle functionality
      const toggleButton = document.getElementById('test-toggle-button');
      const content = document.getElementById('test-controls-content');
      
      toggleButton.addEventListener('click', () => {
        if (content.style.display === 'none') {
          content.style.display = 'block';
          toggleButton.textContent = 'Hide';
        } else {
          content.style.display = 'none';
          toggleButton.textContent = 'Show';
        }
      });
    }
  }

  /**
   * Log a message to the test harness
   * @param {string} message - The message to log
   * @param {string} level - The log level (info, success, error, warn)
   */
  function log(message, level = 'info') {
    if (!config.recordLogs) return;
    
    // Get timestamp
    const timestamp = new Date().toLocaleTimeString();
    
    // Create log element
    const logItem = document.createElement('div');
    logItem.className = 'mb-1';
    
    // Set class based on level
    let levelClass = 'text-gray-700 dark:text-gray-300';
    let prefix = '🔵 ';
    
    switch (level) {
      case 'success':
        levelClass = 'text-green-600 dark:text-green-400';
        prefix = '✅ ';
        break;
      case 'error':
        levelClass = 'text-red-600 dark:text-red-400';
        prefix = '❌ ';
        break;
      case 'warn':
        levelClass = 'text-yellow-600 dark:text-yellow-400';
        prefix = '⚠️ ';
        break;
    }
    
    logItem.className += ' ' + levelClass;
    logItem.textContent = `${prefix}${timestamp}: ${message}`;
    
    // Add to log container
    if (testLogContainer) {
      // Add new item at the top
      testLogContainer.insertBefore(logItem, testLogContainer.firstChild);
      
      // Limit the number of log items
      if (testLogContainer.childNodes.length > config.maxLogItems) {
        testLogContainer.removeChild(testLogContainer.lastChild);
      }
    }
    
    // Also log to console
    console.log(`[ValuesAssessmentTest] [${level.toUpperCase()}] ${message}`);
  }

  /**
   * Clear the test log
   */
  function clearTestLog() {
    if (testLogContainer) {
      testLogContainer.innerHTML = '';
    }
    log('Test log cleared');
  }

  /**
   * Run all test suites
   */
  function runAllTests() {
    // Reset test results
    testResults.passed = 0;
    testResults.failed = 0;
    testResults.warnings = 0;
    testResults.tests = [];
    
    log('Running all test suites...', 'info');
    
    // Run test suites sequentially
    runTestSuite('initialization')
      .then(() => runTestSuite('theme'))
      .then(() => runTestSuite('navigation'))
      .then(() => runTestSuite('auth'))
      .then(() => {
        updateTestResults();
        log(`All tests completed: ${testResults.passed} passed, ${testResults.failed} failed, ${testResults.warnings} warnings`, 
          testResults.failed === 0 ? 'success' : 'error');
      })
      .catch(error => {
        log(`Error running tests: ${error.message}`, 'error');
      });
  }
  
  /**
   * Run a specific test suite
   * @param {string} suiteName - The name of the test suite to run
   * @returns {Promise} Promise that resolves when the test suite completes
   */
  function runTestSuite(suiteName) {
    return new Promise((resolve, reject) => {
      try {
        log(`Running ${suiteName} test suite...`, 'info');
        
        // Select the appropriate test suite
        switch(suiteName) {
          case 'initialization':
            testComponentInitialization().then(resolve).catch(reject);
            break;
          case 'theme':
            testThemeIntegration().then(resolve).catch(reject);
            break;
          case 'navigation':
            testNavigation().then(resolve).catch(reject);
            break;
          case 'auth':
            testAuthIntegration().then(resolve).catch(reject);
            break;
          default:
            reject(new Error(`Unknown test suite: ${suiteName}`));
        }
      } catch (error) {
        log(`Error in test suite ${suiteName}: ${error.message}`, 'error');
        reject(error);
      }
    });
  }
  
  /**
   * Test component initialization
   * @returns {Promise} Promise that resolves when testing is complete
   */
  function testComponentInitialization() {
    return new Promise((resolve) => {
      log('Testing component initialization...', 'info');
      
      // Check if ValuesAssessment class exists
      if (!window.ValuesAssessment) {
        recordTestResult('Class exists', false, 'ValuesAssessment class not found');
        resolve();
        return;
      }
      
      recordTestResult('Class exists', true, 'ValuesAssessment class found');
      
      // Check if the instance exists
      if (!window.valueAssessmentInstance) {
        // Create one for testing
        try {
          log('Creating new assessment instance for testing', 'info');
          
          // Find or create a test container
          let testContainer = document.getElementById('values-assessment-test-container');
          if (!testContainer) {
            testContainer = document.createElement('div');
            testContainer.id = 'values-assessment-test-container';
            testContainer.style.display = 'none'; // Hide it
            document.body.appendChild(testContainer);
          }
          
          const instance = new window.ValuesAssessment({
            containerId: 'values-assessment-test-container',
            debug: true
          });
          
          // Store instance globally for other tests
          window.valueAssessmentTestInstance = instance;
          
          log('Test instance created', 'success');
          recordTestResult('Create instance', true, 'Created test instance');
          
          // Test initialization
          instance.initialize()
            .then(success => {
              recordTestResult('Initialize', success, 
                success ? 'Successfully initialized' : 'Failed to initialize');
              
              // Test basic properties
              testInstanceProperties(instance);
              resolve();
            })
            .catch(error => {
              recordTestResult('Initialize', false, `Error: ${error.message}`);
              resolve();
            });
        } catch (error) {
          recordTestResult('Create instance', false, `Error: ${error.message}`);
          resolve();
        }
      } else {
        // Use existing instance
        log('Using existing assessment instance', 'info');
        recordTestResult('Instance exists', true, 'Using existing instance');
        
        // Store reference for other tests
        window.valueAssessmentTestInstance = window.valueAssessmentInstance;
        
        // Test basic properties
        testInstanceProperties(window.valueAssessmentInstance);
        resolve();
      }
    });
  }
  
  /**
   * Test instance properties
   * @param {Object} instance - The assessment instance
   */
  function testInstanceProperties(instance) {
    try {
      // Test basic properties
      recordTestResult('Has container', !!instance.container, 
        !!instance.container ? 'Container found' : 'Container missing');
      
      // Test service references
      recordTestResult('Auth service', !!instance.authService, 
        !!instance.authService ? 'Auth service found' : 'Auth service missing');
      
      recordTestResult('Theme service', !!instance.themeService, 
        !!instance.themeService ? 'Theme service found' : 'Theme service missing');
      
      // Test components
      recordTestResult('Has Results component type', 
        typeof instance.resultsComponent === 'object' || typeof instance.showResults === 'function', 
        'Results component or method available');
      
      recordTestResult('Has Reflection component type', 
        typeof instance.reflectionComponent === 'object' || typeof instance.showGuidedReflection === 'function', 
        'Reflection component or method available');
      
      recordTestResult('Has NextSteps component type', 
        typeof instance.nextStepsComponent === 'object' || typeof instance.showNextSteps === 'function', 
        'NextSteps component or method available');
    } catch (error) {
      log(`Error testing instance properties: ${error.message}`, 'error');
    }
  }
  
  /**
   * Test theme integration
   * @returns {Promise} Promise that resolves when testing is complete
   */
  function testThemeIntegration() {
    return new Promise((resolve) => {
      log('Testing theme integration...', 'info');
      
      // Test if theme system exists
      const hasThemeSystem = !!window.themeSystem;
      recordTestResult('Theme system exists', hasThemeSystem, 
        hasThemeSystem ? 'Theme system found' : 'Theme system not found');
      
      if (!hasThemeSystem) {
        log('Cannot test theme integration without theme system', 'warn');
        resolve();
        return;
      }
      
      // Get current theme
      const currentTheme = window.themeSystem.getTheme();
      log(`Current theme: ${currentTheme}`, 'info');
      
      // Toggle theme
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      log(`Switching to ${newTheme} theme for testing...`, 'info');
      
      try {
        // Change theme
        window.themeSystem.setTheme(newTheme);
        
        // Wait for theme change event
        setTimeout(() => {
          const themeAfterChange = window.themeSystem.getTheme();
          
          // Verify theme changed
          const themeChanged = themeAfterChange === newTheme;
          recordTestResult('Theme changed', themeChanged, 
            themeChanged ? `Theme successfully changed to ${newTheme}` : 'Theme change failed');
          
          // Check if body has correct class
          const bodyHasClass = document.body.classList.contains(newTheme === 'dark' ? 'dark' : 'light');
          recordTestResult('Body has theme class', bodyHasClass, 
            bodyHasClass ? 'Body has correct theme class' : 'Body missing theme class');
          
          // Restore original theme
          window.themeSystem.setTheme(currentTheme);
          log(`Restored original theme: ${currentTheme}`, 'info');
          
          resolve();
        }, 500); // Wait for theme change to propagate
      } catch (error) {
        log(`Error testing theme integration: ${error.message}`, 'error');
        recordTestResult('Theme change', false, `Error: ${error.message}`);
        resolve();
      }
    });
  }
  
  /**
   * Test navigation between steps
   * @returns {Promise} Promise that resolves when testing is complete
   */
  function testNavigation() {
    return new Promise((resolve) => {
      log('Testing navigation between steps...', 'info');
      
      // Get the ValuesAssessment instance
      const instance = window.valueAssessmentTestInstance || window.valueAssessmentInstance;
      
      if (!instance) {
        log('No ValuesAssessment instance available for testing navigation', 'error');
        recordTestResult('Navigation', false, 'No instance available');
        resolve();
        return;
      }
      
      // Test if navigation methods exist
      const hasShowResults = typeof instance.showResults === 'function';
      recordTestResult('Has showResults method', hasShowResults, 
        hasShowResults ? 'showResults method exists' : 'showResults method missing');
      
      const hasShowReflection = typeof instance.showGuidedReflection === 'function';
      recordTestResult('Has showGuidedReflection method', hasShowReflection, 
        hasShowReflection ? 'showGuidedReflection method exists' : 'showGuidedReflection method missing');
      
      const hasShowNextSteps = typeof instance.showNextSteps === 'function';
      recordTestResult('Has showNextSteps method', hasShowNextSteps, 
        hasShowNextSteps ? 'showNextSteps method exists' : 'showNextSteps method missing');
      
      const hasRestart = typeof instance.restartAssessment === 'function';
      recordTestResult('Has restartAssessment method', hasRestart, 
        hasRestart ? 'restartAssessment method exists' : 'restartAssessment method missing');
      
      // If we have the necessary methods, test navigation
      if (hasShowResults && hasShowReflection && hasShowNextSteps) {
        try {
          // Create a promise chain for navigation
          Promise.resolve()
            .then(() => {
              log('Testing navigation to Results view...', 'info');
              instance.showResults();
              return new Promise(resolve => setTimeout(resolve, 500));
            })
            .then(() => {
              // Check if results container is visible
              const resultsContainer = document.getElementById('values-results-container');
              const resultsVisible = resultsContainer && 
                !resultsContainer.classList.contains('hidden') && 
                resultsContainer.childElementCount > 0;
              
              recordTestResult('Show Results', resultsVisible, 
                resultsVisible ? 'Results view displayed' : 'Results view not properly displayed');
              
              log('Testing navigation to Guided Reflection view...', 'info');
              instance.showGuidedReflection();
              return new Promise(resolve => setTimeout(resolve, 500));
            })
            .then(() => {
              // Check if reflection container is visible
              const reflectionContainer = document.getElementById('values-reflection-container');
              const reflectionVisible = reflectionContainer && 
                !reflectionContainer.classList.contains('hidden') && 
                reflectionContainer.childElementCount > 0;
              
              recordTestResult('Show Reflection', reflectionVisible, 
                reflectionVisible ? 'Reflection view displayed' : 'Reflection view not properly displayed');
              
              log('Testing navigation to Next Steps view...', 'info');
              instance.showNextSteps();
              return new Promise(resolve => setTimeout(resolve, 500));
            })
            .then(() => {
              // Check if next steps container is visible
              const nextStepsContainer = document.getElementById('values-next-steps-container');
              const nextStepsVisible = nextStepsContainer && 
                !nextStepsContainer.classList.contains('hidden') && 
                nextStepsContainer.childElementCount > 0;
              
              recordTestResult('Show Next Steps', nextStepsVisible, 
                nextStepsVisible ? 'Next Steps view displayed' : 'Next Steps view not properly displayed');
              
              // Return to results for a clean state
              log('Returning to Results view...', 'info');
              instance.showResults();
              
              resolve();
            })
            .catch(error => {
              log(`Error testing navigation: ${error.message}`, 'error');
              recordTestResult('Navigation', false, `Error: ${error.message}`);
              resolve();
            });
        } catch (error) {
          log(`Error setting up navigation tests: ${error.message}`, 'error');
          recordTestResult('Navigation setup', false, `Error: ${error.message}`);
          resolve();
        }
      } else {
        log('Missing required navigation methods', 'warn');
        resolve();
      }
    });
  }
  
  /**
   * Test auth integration
   * @returns {Promise} Promise that resolves when testing is complete
   */
  function testAuthIntegration() {
    return new Promise((resolve) => {
      log('Testing auth integration...', 'info');
      
      // Check if auth service exists
      const hasAuthService = !!window.authService;
      recordTestResult('Auth service exists', hasAuthService, 
        hasAuthService ? 'Auth service found' : 'Auth service not found');
      
      if (!hasAuthService) {
        log('Cannot test auth integration without auth service', 'warn');
        resolve();
        return;
      }
      
      // Get current auth state
      const isAuthenticated = window.authService.isAuthenticated();
      log(`Current auth state: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`, 'info');
      recordTestResult('Auth state accessible', true, 
        `Auth state is: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);
      
      // Test premium status
      const isPremium = window.authService.hasPremiumAccess && window.authService.hasPremiumAccess();
      log(`Premium status: ${isPremium ? 'Premium' : 'Not premium'}`, 'info');
      recordTestResult('Premium status accessible', true, 
        `Premium status is: ${isPremium ? 'Premium' : 'Not premium'}`);
      
      // Get the ValuesAssessment instance
      const instance = window.valueAssessmentTestInstance || window.valueAssessmentInstance;
      
      if (!instance) {
        log('No ValuesAssessment instance available for testing auth', 'error');
        recordTestResult('Auth integration', false, 'No instance available');
        resolve();
        return;
      }
      
      // Check if instance uses auth service
      const usesAuthService = !!instance.authService;
      recordTestResult('Instance uses auth service', usesAuthService, 
        usesAuthService ? 'Instance has auth service reference' : 'Instance missing auth service reference');
      
      // Done with auth tests
      resolve();
    });
  }
  
  /**
   * Record a test result
   * @param {string} name - Test name
   * @param {boolean} passed - Whether the test passed
   * @param {string} message - Test message
   */
  function recordTestResult(name, passed, message) {
    const result = {
      name,
      passed,
      message,
      timestamp: new Date()
    };
    
    testResults.tests.push(result);
    
    if (passed) {
      testResults.passed++;
      log(`✅ ${name}: ${message}`, 'success');
    } else {
      testResults.failed++;
      log(`❌ ${name}: ${message}`, 'error');
    }
    
    // Update UI
    updateTestResults();
  }

  /**
   * Update test results display
   */
  function updateTestResults() {
    if (!testResultsContainer) return;
    
    testResultsContainer.innerHTML = `
      <div class="mb-2">
        <div class="flex justify-between">
          <span>Tests:</span>
          <span>${testResults.passed + testResults.failed} total</span>
        </div>
        <div class="flex justify-between">
          <span class="text-green-600 dark:text-green-400">Passed:</span>
          <span class="text-green-600 dark:text-green-400">${testResults.passed}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-red-600 dark:text-red-400">Failed:</span>
          <span class="text-red-600 dark:text-red-400">${testResults.failed}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-yellow-600 dark:text-yellow-400">Warnings:</span>
          <span class="text-yellow-600 dark:text-yellow-400">${testResults.warnings}</span>
        </div>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
        <div class="bg-green-500 h-full" style="width: ${testResults.passed > 0 ? (testResults.passed / (testResults.passed + testResults.failed) * 100) : 0}%"></div>
      </div>
    `;
  }

  // Export the test harness
  window.ValuesAssessmentTest = {
    initialize,
    runAllTests,
    runTestSuite: (name) => runTestSuite(name),
    log
  };

  // Run on load if we're in a browser environment
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize);
    } else {
      setTimeout(initialize, 1000); // Slight delay to ensure other scripts have loaded
    }
  }
})();
