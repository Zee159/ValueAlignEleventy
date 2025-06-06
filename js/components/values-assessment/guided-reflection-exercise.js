/**
 * Guided Reflection Exercise Component
 * Displays a focused reflection exercise for a single value
 * 
 * Following ValueAlign development rules for accessibility and theme integration
 */

class GuidedReflectionExerciseComponent {
  /**
   * Create a guided reflection exercise component
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.ui = options.ui;
    this.container = options.container;
    this.valueId = options.valueId;
    this.templateProvider = options.templateProvider;
    this.isPremiumUser = options.isPremiumUser || false;
    this.onSaveResponse = options.onSaveResponse || (() => {});
    
    // State
    this.exercise = null;
    this.responses = options.responses || {};
    this.expandedSections = new Set();
    this.activeSectionIndex = 0;
    
    // Content
    this.content = {
      responsePrompt: 'Your reflection',
      saveButtonText: 'Save',
      savedMessage: 'Saved',
      expandButtonText: 'Show more',
      collapseButtonText: 'Show less',
      premiumFeatureTitle: 'Premium Feature',
      upgradePrompt: 'Upgrade to access premium reflection prompts',
      upgradeButtonText: 'Upgrade to Premium',
      placeholderText: 'Write your reflection here...'
    };
  }
  
  /**
   * Initialize the exercise component
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      if (!this.templateProvider || !this.valueId) {
        throw new Error('Template provider and value ID are required');
      }
      
      // Get the exercise for this value
      this.exercise = this.templateProvider.getExerciseForValue(this.valueId);
      
      // Success
      return true;
    } catch (error) {
      console.error('[GuidedReflectionExerciseComponent] Initialization error:', error);
      return false;
    }
  }
  
  /**
   * Render the exercise component
   * @returns {HTMLElement} The rendered component
   */
  render() {
    if (!this.container) return null;
    
    // Clear the container
    this.container.innerHTML = '';
    
    try {
      if (!this.exercise) {
        throw new Error('Exercise not initialized');
      }
      
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'guided-reflection-exercise bg-white dark:bg-gray-800 rounded-lg shadow p-6';
      
      // Create header
      const header = this._createHeader();
      wrapper.appendChild(header);
      
      // Create basic prompts section
      const basicPromptsSection = this._createBasicPromptsSection();
      wrapper.appendChild(basicPromptsSection);
      
      // Create premium prompts section if applicable
      if (this.isPremiumUser && this.exercise.premiumPrompts && this.exercise.premiumPrompts.length > 0) {
        const premiumPromptsSection = this._createPremiumPromptsSection();
        wrapper.appendChild(premiumPromptsSection);
      } else if (!this.isPremiumUser) {
        const upgradeBanner = this._createUpgradeBanner();
        wrapper.appendChild(upgradeBanner);
      }
      
      // Create response section
      const responseSection = this._createResponseSection();
      wrapper.appendChild(responseSection);
      
      // Add to container
      this.container.appendChild(wrapper);
      
      // Set focus on first element
      setTimeout(() => {
        const firstElement = wrapper.querySelector('button, textarea');
        if (firstElement) firstElement.focus();
      }, 100);
      
      return this.container;
    } catch (error) {
      console.error('[GuidedReflectionExerciseComponent] Render error:', error);
      
      // Show error message
      this.container.innerHTML = `
        <div class="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          <p>There was a problem loading the reflection exercise.</p>
        </div>
      `;
      
      return this.container;
    }
  }
  
  /**
   * Create header section
   * @private
   * @returns {HTMLElement} Header element
   */
  _createHeader() {
    const header = document.createElement('header');
    header.className = 'mb-6';
    
    const heading = document.createElement('h2');
    heading.className = 'text-xl font-bold text-gray-900 dark:text-gray-100 mb-2';
    heading.textContent = `${this.exercise.valueName} Reflection`;
    heading.id = `reflection-heading-${this.exercise.valueId}`;
    
    const description = document.createElement('p');
    description.className = 'text-gray-700 dark:text-gray-300';
    description.textContent = this.exercise.valueDescription;
    
    header.appendChild(heading);
    header.appendChild(description);
    
    return header;
  }
  
  /**
   * Create basic prompts section
   * @private
   * @returns {HTMLElement} Basic prompts section
   */
  _createBasicPromptsSection() {
    const section = document.createElement('section');
    section.className = 'mb-6';
    section.setAttribute('aria-labelledby', `basic-prompts-heading-${this.exercise.valueId}`);
    
    const heading = document.createElement('h3');
    heading.className = 'text-lg font-medium text-gray-900 dark:text-gray-100 mb-3';
    heading.textContent = 'Reflection Prompts';
    heading.id = `basic-prompts-heading-${this.exercise.valueId}`;
    
    const promptsList = document.createElement('ul');
    promptsList.className = 'space-y-3';
    promptsList.setAttribute('role', 'list');
    
    // Add basic prompts
    this.exercise.basicPrompts.forEach((prompt, index) => {
      const promptItem = document.createElement('li');
      promptItem.className = 'bg-gray-50 dark:bg-gray-750 p-4 rounded';
      
      const promptText = document.createElement('p');
      promptText.className = 'text-gray-800 dark:text-gray-200';
      promptText.textContent = prompt;
      
      promptItem.appendChild(promptText);
      promptsList.appendChild(promptItem);
    });
    
    section.appendChild(heading);
    section.appendChild(promptsList);
    
    return section;
  }
  
  /**
   * Create premium prompts section
   * @private
   * @returns {HTMLElement} Premium prompts section
   */
  _createPremiumPromptsSection() {
    const section = document.createElement('section');
    section.className = 'mb-6';
    section.setAttribute('aria-labelledby', `premium-prompts-heading-${this.exercise.valueId}`);
    
    const headingContainer = document.createElement('div');
    headingContainer.className = 'flex items-center mb-3';
    
    const heading = document.createElement('h3');
    heading.className = 'text-lg font-medium text-gray-900 dark:text-gray-100';
    heading.textContent = 'Advanced Prompts';
    heading.id = `premium-prompts-heading-${this.exercise.valueId}`;
    
    const premiumBadge = document.createElement('span');
    premiumBadge.className = 'ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200';
    premiumBadge.textContent = 'PREMIUM';
    
    headingContainer.appendChild(heading);
    headingContainer.appendChild(premiumBadge);
    
    const promptsList = document.createElement('ul');
    promptsList.className = 'space-y-3';
    promptsList.setAttribute('role', 'list');
    
    // Add premium prompts
    this.exercise.premiumPrompts.forEach((prompt, index) => {
      const promptItem = document.createElement('li');
      promptItem.className = 'bg-purple-50 dark:bg-purple-900/30 p-4 rounded border border-purple-100 dark:border-purple-800';
      
      const promptText = document.createElement('p');
      promptText.className = 'text-gray-800 dark:text-gray-200';
      promptText.textContent = prompt;
      
      promptItem.appendChild(promptText);
      promptsList.appendChild(promptItem);
    });
    
    section.appendChild(headingContainer);
    section.appendChild(promptsList);
    
    return section;
  }
  
  /**
   * Create upgrade banner for non-premium users
   * @private
   * @returns {HTMLElement} Upgrade banner
   */
  _createUpgradeBanner() {
    const banner = document.createElement('div');
    banner.className = 'mb-6 p-4 bg-gray-100 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700';
    
    const content = document.createElement('div');
    content.className = 'flex items-start';
    
    const iconContainer = document.createElement('div');
    iconContainer.className = 'flex-shrink-0 mr-3';
    iconContainer.innerHTML = `
      <svg class="w-6 h-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    `;
    
    const textContainer = document.createElement('div');
    
    const title = document.createElement('h3');
    title.className = 'text-sm font-medium text-gray-900 dark:text-gray-100';
    title.textContent = this.content.premiumFeatureTitle;
    
    const description = document.createElement('p');
    description.className = 'mt-1 text-sm text-gray-500 dark:text-gray-400';
    description.textContent = this.content.upgradePrompt;
    
    const upgradeLink = document.createElement('a');
    upgradeLink.className = 'mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500';
    upgradeLink.href = '/dashboard/settings/subscription/';
    upgradeLink.textContent = this.content.upgradeButtonText;
    
    textContainer.appendChild(title);
    textContainer.appendChild(description);
    textContainer.appendChild(upgradeLink);
    
    content.appendChild(iconContainer);
    content.appendChild(textContainer);
    
    banner.appendChild(content);
    
    return banner;
  }
  
  /**
   * Create response section for user input
   * @private
   * @returns {HTMLElement} Response section
   */
  _createResponseSection() {
    const section = document.createElement('section');
    section.className = 'mt-8';
    section.setAttribute('aria-labelledby', `response-heading-${this.exercise.valueId}`);
    
    const heading = document.createElement('h3');
    heading.className = 'text-lg font-medium text-gray-900 dark:text-gray-100 mb-3';
    heading.textContent = this.content.responsePrompt;
    heading.id = `response-heading-${this.exercise.valueId}`;
    
    // Create form
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.setAttribute('aria-label', `Reflection form for ${this.exercise.valueName}`);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      this._handleSaveClick();
    });
    
    // Create textarea for response
    const textareaContainer = document.createElement('div');
    
    const textarea = document.createElement('textarea');
    textarea.className = 'w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';
    textarea.rows = 6;
    textarea.placeholder = this.content.placeholderText;
    textarea.setAttribute('aria-label', `Your reflection on ${this.exercise.valueName}`);
    textarea.id = `reflection-input-${this.exercise.valueId}`;
    
    // Set value if we have a saved response
    if (this.responses && this.responses[this.exercise.valueId]) {
      textarea.value = this.responses[this.exercise.valueId];
    }
    
    // Add autosave on change
    textarea.addEventListener('change', () => {
      this._handleSaveClick(true);
    });
    
    textareaContainer.appendChild(textarea);
    
    // Create save button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-end';
    
    const saveButton = document.createElement('button');
    saveButton.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
    saveButton.setAttribute('type', 'submit');
    saveButton.textContent = this.content.saveButtonText;
    
    buttonContainer.appendChild(saveButton);
    
    // Add saved indicator
    const savedIndicator = document.createElement('div');
    savedIndicator.className = 'hidden ml-3 text-sm text-green-600 dark:text-green-400 flex items-center';
    savedIndicator.id = `saved-indicator-${this.exercise.valueId}`;
    savedIndicator.innerHTML = `
      <svg class="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      ${this.content.savedMessage}
    `;
    
    buttonContainer.appendChild(savedIndicator);
    
    // Assemble form
    form.appendChild(textareaContainer);
    form.appendChild(buttonContainer);
    
    section.appendChild(heading);
    section.appendChild(form);
    
    return section;
  }
  
  /**
   * Handle save button click
   * @private
   * @param {boolean} [isAutoSave=false] Whether this is an auto-save event
   */
  _handleSaveClick(isAutoSave = false) {
    try {
      const textarea = document.getElementById(`reflection-input-${this.exercise.valueId}`);
      if (!textarea) return;
      
      const value = textarea.value.trim();
      
      // Save the response
      this.responses[this.exercise.valueId] = value;
      
      // Call the save callback
      if (this.onSaveResponse && typeof this.onSaveResponse === 'function') {
        this.onSaveResponse(this.exercise.valueId, value);
      }
      
      // Show saved indicator
      const savedIndicator = document.getElementById(`saved-indicator-${this.exercise.valueId}`);
      if (savedIndicator) {
        savedIndicator.classList.remove('hidden');
        savedIndicator.classList.add('flex');
        
        // Hide after 3 seconds
        setTimeout(() => {
          savedIndicator.classList.add('hidden');
          savedIndicator.classList.remove('flex');
        }, 3000);
      }
      
      // Announce for screen readers if not auto-save
      if (!isAutoSave && this.ui && this.ui.announce) {
        this.ui.announce('Reflection saved', 'polite');
      }
    } catch (error) {
      console.error('[GuidedReflectionExerciseComponent] Save error:', error);
    }
  }
}

// Export the component
export { GuidedReflectionExerciseComponent };
