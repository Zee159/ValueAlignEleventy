/**
 * Values Assessment Guided Reflection Template
 * Provides templates for guided reflection exercises based on user's values
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class GuidedReflectionTemplate {
  /**
   * Create a guided reflection template provider
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.valuesData = options.valuesData || window.valuesData || [];
    this.isPremiumUser = options.isPremiumUser || false;
    this.authService = options.authService || window.authService;
    this.coreService = options.coreService;
    this.debug = options.debug || false;
  }
  
  /**
   * Initialize the template provider
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      this._log('Initializing guided reflection templates');
      return true;
    } catch (error) {
      this._logError('Initialization failed', error);
      return false;
    }
  }
  
  /**
   * Get a reflection exercise template for a specific value
   * @param {string} valueId The ID of the value
   * @returns {Object} The exercise template
   */
  getExerciseForValue(valueId) {
    try {
      // Find the value in the values data
      const value = this.valuesData.find(v => v.id === valueId);
      if (!value) {
        throw new Error(`Value with ID ${valueId} not found`);
      }
      
      // Basic reflection prompts available to all users
      const basicPrompts = [
        `Think about a time when you honored your value of ${value.name}. How did it make you feel?`,
        `In what ways does ${value.name} influence your daily decisions?`,
        `What obstacles prevent you from fully living your value of ${value.name}?`,
        `How might your life be different if you emphasized ${value.name} even more?`,
        `Who in your life embodies the value of ${value.name}? What can you learn from them?`
      ];
      
      // Advanced prompts only available to premium users
      const premiumPrompts = [
        `Consider a challenging situation you're currently facing. How might approaching it with ${value.name} as your guiding value change your perspective or actions?`,
        `Visualize a future version of yourself who perfectly embodies ${value.name}. What specific behaviors and choices characterize this version of you?`,
        `Think about the tension between ${value.name} and another of your top values. When have they been in conflict, and how did you navigate that tension?`,
        `What systems or routines could you implement to better align your daily actions with your value of ${value.name}?`,
        `How might your relationship with others change if you more openly expressed and lived by your value of ${value.name}?`
      ];
      
      // Return the exercise template
      return {
        valueId: value.id,
        valueName: value.name,
        valueDescription: value.description,
        basicPrompts,
        premiumPrompts: this.isPremiumUser ? premiumPrompts : [],
        hasPremiumContent: this.isPremiumUser,
        reflectionAreas: this._getReflectionAreasForValue(value.id, value.name)
      };
    } catch (error) {
      this._logError(`Error getting exercise for value ${valueId}`, error);
      
      // Return a fallback template
      return {
        valueId: valueId,
        valueName: 'Value',
        valueDescription: 'No description available',
        basicPrompts: [
          'What does this value mean to you personally?',
          'How do you currently express this value in your life?',
          'How might you better align your actions with this value?'
        ],
        premiumPrompts: [],
        hasPremiumContent: false,
        reflectionAreas: []
      };
    }
  }
  
  /**
   * Get a comprehensive reflection exercise for all top values
   * @param {number} [limit=3] Maximum number of top values to include
   * @returns {Object} The comprehensive exercise template
   */
  getComprehensiveExercise(limit = 3) {
    try {
      if (!this.coreService) {
        throw new Error('Core service is required for comprehensive exercises');
      }
      
      // Get top prioritized values
      const prioritizedValues = this.coreService.getPrioritizedValues() || [];
      
      if (!prioritizedValues || prioritizedValues.length === 0) {
        throw new Error('No prioritized values found');
      }
      
      // Limit to the requested number
      const topValues = prioritizedValues.slice(0, limit);
      
      // Get exercises for each value
      const valueExercises = topValues.map(valueId => this.getExerciseForValue(valueId));
      
      // Get integration exercises that connect multiple values
      const integrationExercises = this._getIntegrationExercises(topValues);
      
      return {
        topValues,
        valueExercises,
        integrationExercises,
        hasPremiumContent: this.isPremiumUser,
        date: new Date().toLocaleDateString()
      };
    } catch (error) {
      this._logError('Error getting comprehensive exercise', error);
      
      // Return an empty template
      return {
        topValues: [],
        valueExercises: [],
        integrationExercises: [],
        hasPremiumContent: false,
        date: new Date().toLocaleDateString()
      };
    }
  }
  
  /**
   * Get reflection areas specific to a value
   * @private
   * @param {string} valueId Value ID
   * @param {string} valueName Value name
   * @returns {Array<Object>} Reflection areas
   */
  _getReflectionAreasForValue(valueId, valueName) {
    const areas = [
      {
        title: 'Professional Life',
        questions: [
          `How does ${valueName} show up in your work?`,
          `Are there ways you could better align your career with ${valueName}?`,
          `What workplace situations challenge your commitment to ${valueName}?`
        ]
      },
      {
        title: 'Relationships',
        questions: [
          `How does ${valueName} affect your approach to relationships?`,
          `Do the people closest to you know that ${valueName} is important to you?`,
          `How might your relationships improve if you honored ${valueName} more consistently?`
        ]
      },
      {
        title: 'Personal Development',
        questions: [
          `What skills could you develop to better express ${valueName}?`,
          `How does ${valueName} guide your personal growth goals?`,
          `What habits or behaviors conflict with your value of ${valueName}?`
        ]
      }
    ];
    
    // Add value-specific areas based on the value ID
    // These would be customized based on each value's specific domain
    // Just a few examples shown here
    
    if (valueId === 'honesty' || valueId === 'integrity' || valueId === 'truth') {
      areas.push({
        title: 'Truth and Communication',
        questions: [
          'When do you find it most difficult to be completely honest?',
          'How do you respond when others are dishonest with you?',
          'What would radical honesty look like in your life?'
        ]
      });
    }
    
    if (valueId === 'family' || valueId === 'community' || valueId === 'belonging') {
      areas.push({
        title: 'Community Impact',
        questions: [
          'How do you contribute to your community?',
          'What traditions or practices strengthen your sense of belonging?',
          'How could you create more connection in your daily life?'
        ]
      });
    }
    
    if (valueId === 'creativity' || valueId === 'innovation' || valueId === 'expression') {
      areas.push({
        title: 'Creative Expression',
        questions: [
          'What creative outlets do you currently have?',
          'When do you feel most creatively fulfilled?',
          'How could you integrate more creativity into your daily routines?'
        ]
      });
    }
    
    return areas;
  }
  
  /**
   * Get integration exercises for multiple values
   * @private
   * @param {Array<string>} valueIds Array of value IDs
   * @returns {Array<Object>} Integration exercises
   */
  _getIntegrationExercises(valueIds) {
    if (!valueIds || valueIds.length < 2) {
      return [];
    }
    
    // Get value names for the IDs
    const valueNames = valueIds.map(id => {
      const value = this.valuesData.find(v => v.id === id);
      return value ? value.name : id;
    });
    
    // Create integration exercises
    const exercises = [
      {
        title: 'Values in Harmony',
        description: `Explore how your top values of ${valueNames.join(', ')} work together in your life.`,
        instructions: 'Think of a situation where these values reinforced each other. What made this possible? How did it feel?',
        isPremium: false
      },
      {
        title: 'Values in Tension',
        description: `Explore potential conflicts between your values of ${valueNames.join(', ')}.`,
        instructions: 'Describe a situation where two or more of these values were in tension. How did you navigate this conflict? What did you learn?',
        isPremium: false
      },
      {
        title: 'Decision-Making Framework',
        description: 'Create a personal framework for making decisions based on your top values.',
        instructions: `When facing a difficult choice, what questions could you ask yourself to ensure alignment with ${valueNames.join(', ')}?`,
        isPremium: true
      }
    ];
    
    // Only include premium exercises if user has access
    return exercises.filter(ex => !ex.isPremium || this.isPremiumUser);
  }
  
  /**
   * Generate HTML template for an exercise
   * @param {Object} exercise Exercise template
   * @returns {string} HTML content
   */
  generateExerciseHTML(exercise) {
    if (!exercise || !exercise.valueId) {
      return '<p>No exercise available.</p>';
    }
    
    // Create HTML content
    let html = `
      <div class="guided-reflection-exercise bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <header>
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">${exercise.valueName} Reflection Exercise</h2>
          <p class="text-gray-700 dark:text-gray-300 mb-4">${exercise.valueDescription}</p>
        </header>
        
        <section class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Reflection Prompts</h3>
          <ul class="space-y-3">
    `;
    
    // Add basic prompts
    exercise.basicPrompts.forEach(prompt => {
      html += `
        <li class="bg-gray-50 dark:bg-gray-750 p-4 rounded">
          <p class="text-gray-800 dark:text-gray-200">${prompt}</p>
        </li>
      `;
    });
    
    html += `
          </ul>
        </section>
    `;
    
    // Add premium prompts if available
    if (exercise.hasPremiumContent && exercise.premiumPrompts && exercise.premiumPrompts.length > 0) {
      html += `
        <section class="mb-6">
          <div class="flex items-center mb-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Advanced Prompts</h3>
            <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
              PREMIUM
            </span>
          </div>
          
          <ul class="space-y-3">
      `;
      
      exercise.premiumPrompts.forEach(prompt => {
        html += `
          <li class="bg-purple-50 dark:bg-purple-900/30 p-4 rounded border border-purple-100 dark:border-purple-800">
            <p class="text-gray-800 dark:text-gray-200">${prompt}</p>
          </li>
        `;
      });
      
      html += `
          </ul>
        </section>
      `;
    }
    
    // Add reflection areas
    if (exercise.reflectionAreas && exercise.reflectionAreas.length > 0) {
      html += `
        <section class="mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Life Areas for Reflection</h3>
          <div class="space-y-4">
      `;
      
      exercise.reflectionAreas.forEach(area => {
        html += `
          <div class="bg-gray-50 dark:bg-gray-750 p-4 rounded">
            <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">${area.title}</h4>
            <ul class="space-y-2 list-disc pl-5">
        `;
        
        area.questions.forEach(question => {
          html += `<li class="text-gray-700 dark:text-gray-300">${question}</li>`;
        });
        
        html += `
            </ul>
          </div>
        `;
      });
      
      html += `
          </div>
        </section>
      `;
    }
    
    // Close container
    html += `
      </div>
    `;
    
    return html;
  }
  
  /**
   * Log debug message
   * @private
   * @param {string} message Message to log
   */
  _log(message) {
    if (this.debug) {
      console.log(`[GuidedReflectionTemplate] ${message}`);
    }
  }
  
  /**
   * Log error message
   * @private
   * @param {string} message Error message
   * @param {Error} error Error object
   */
  _logError(message, error) {
    console.error(`[GuidedReflectionTemplate] ${message}:`, error);
  }
}

// Export the template provider
export { GuidedReflectionTemplate };
