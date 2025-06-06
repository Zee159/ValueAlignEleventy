/**
 * ValueAlign Core Values Assessment
 * Helps users identify, prioritize and reflect on their core values
 * 
 * @requires accessibility-helpers.js for keyboard handling, focus management and screen reader support
 */

// Make ValuesAssessment available globally for testing
window.ValuesAssessment = class ValuesAssessment {
    /**
     * Initialize the Values Assessment component
     */
    constructor() {
        // DOM elements
        this.assessmentContainer = document.getElementById('assessment-container');
        this.progressTracker = document.getElementById('progress-tracker');
        this.prevButton = document.getElementById('prev-button');
        this.nextButton = document.getElementById('next-button');
        this.progressAnnouncer = document.getElementById('progress-announcer');
        this.statusAnnouncer = document.createElement('div');
        this.statusAnnouncer.setAttribute('aria-live', 'assertive');
        this.statusAnnouncer.classList.add('sr-only');
        document.body.appendChild(this.statusAnnouncer);
        
        // State management
        this.currentStep = 1;
        this.totalSteps = 4;
        this.selectedValues = [];
        this.prioritizedValues = [];
        this.reflectionResponses = {};
        this.completionDate = new Date();
        this.previousAssessments = [];
        
        // Load any previous assessment data
        this.loadSavedProgress();
    }
    
    /**
     * Initialize the assessment
     */
    /**
     * Announce a message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    announce(message, priority = 'polite') {
        const announcer = priority === 'assertive' ? 
            this.statusAnnouncer : this.progressAnnouncer;
        
        if (announcer) {
            announcer.textContent = message;
        }
        console.log(`Announced (${priority}): ${message}`);
    }
    
    /**
     * Show the introduction screen
     */
    showIntroduction() {
        if (!this.assessmentContainer) return;
        
        this.assessmentContainer.innerHTML = `
          <section role="region" aria-labelledby="intro-heading">
            <h2 id="intro-heading">Values Assessment</h2>
            <p>Welcome to the Values Assessment. This tool will help you identify your core values.</p>
            <button type="button" class="begin-button">Begin</button>
          </section>
        `;
        
        // Add event listener to the begin button
        const beginButton = this.assessmentContainer.querySelector('.begin-button');
        if (beginButton) {
            beginButton.addEventListener('click', () => this.showValuesSelection());
        }
        
        this.announce('Values Assessment introduction screen loaded', 'polite');
    }
    
    /**
     * Show the values selection screen
     */
    showValuesSelection() {
        if (!this.assessmentContainer) return;
        
        let valuesList = '';
        if (window.valuesData && Array.isArray(window.valuesData)) {
          valuesList = window.valuesData.map(value => `
            <li class="value-item" data-value-id="${value.id}">
              <input type="checkbox" id="${value.id}" name="value" value="${value.id}" aria-describedby="desc-${value.id}">
              <label for="${value.id}">${value.name}</label>
              <p id="desc-${value.id}" class="value-description">${value.description}</p>
            </li>
          `).join('');
        }
        
        this.assessmentContainer.innerHTML = `
          <section role="region" aria-labelledby="selection-heading">
            <h2 id="selection-heading">Select Your Values</h2>
            <p>Select the values that resonate with you.</p>
            <div class="selection-counter" aria-live="polite">0 values selected</div>
            <ul class="values-list" role="list">
              ${valuesList}
            </ul>
            <div class="navigation-buttons">
              <button type="button" class="prev-button" aria-label="Previous step">Back</button>
              <button type="button" class="next-button" aria-label="Next step">Next</button>
            </div>
          </section>
        `;
        
        // Add event listeners to track selection
        const checkboxes = this.assessmentContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', () => {
            // Update selected values
            this.selectedValues = Array.from(this.assessmentContainer.querySelectorAll('input[type="checkbox"]:checked'))
              .map(cb => cb.value);
            
            // Update counter and announce to screen readers
            const counter = this.assessmentContainer.querySelector('.selection-counter');
            if (counter) {
              counter.textContent = `${this.selectedValues.length} values selected`;
              this.announce(`${this.selectedValues.length} values selected`, 'polite');
            }
          });
        });
        
        this.announce('Values selection screen loaded', 'polite');
    }
    
    /**
     * Show the values ranking screen
     */
    showValuesRanking() {
        if (!this.assessmentContainer) return;
        
        // Get selected values data or use sample data if none selected
        let selectedValueData = [];
        if (window.valuesData && Array.isArray(window.valuesData)) {
          if (Array.isArray(this.selectedValues) && this.selectedValues.length > 0) {
            this.selectedValues.forEach(valueId => {
              const valueData = window.valuesData.find(v => v.id === valueId);
              if (valueData) {
                selectedValueData.push(valueData);
              }
            });
          } else {
            // Use the first 3 values as sample if none selected
            selectedValueData = window.valuesData.slice(0, 3);
          }
        }
        
        this.prioritizedValues = [...selectedValueData]; // Copy for ranking
        
        // Create ranked values list
        let rankedValuesList = '';
        this.prioritizedValues.forEach((value, index) => {
          rankedValuesList += `
            <li role="listitem" class="ranked-value-item" data-value-id="${value.id}" tabindex="0">
              <div class="rank" aria-label="Priority ${index + 1}">${index + 1}</div>
              <div class="value-info">
                <span class="value-name">${value.name}</span>
              </div>
              <div class="ranking-controls">
                <button type="button" class="move-up-btn" aria-label="Move ${value.name} up in priority" ${index === 0 ? 'disabled' : ''}>
                  <span aria-hidden="true">↑</span>
                </button>
                <button type="button" class="move-down-btn" aria-label="Move ${value.name} down in priority" ${index === this.prioritizedValues.length - 1 ? 'disabled' : ''}>
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            </li>
          `;
        });
        
        this.assessmentContainer.innerHTML = `
          <section role="region" aria-labelledby="ranking-heading">
            <h2 id="ranking-heading">Prioritize Your Values</h2>
            <p>Use the up/down buttons to rank your values in order of importance.</p>
            <ul role="list" class="ranked-values-list">
              ${rankedValuesList}
            </ul>
            <div class="navigation-buttons">
              <button type="button" class="prev-button" aria-label="Previous step">Back</button>
              <button type="button" class="next-button" aria-label="Next step">Next</button>
            </div>
          </section>
        `;
        
        // Add event listeners for move buttons
        const moveUpButtons = this.assessmentContainer.querySelectorAll('.move-up-btn');
        const moveDownButtons = this.assessmentContainer.querySelectorAll('.move-down-btn');
        
        moveUpButtons.forEach((btn, index) => {
          btn.addEventListener('click', () => {
            if (index > 0) {
              // Swap in the UI
              const items = this.assessmentContainer.querySelectorAll('.ranked-value-item');
              const list = this.assessmentContainer.querySelector('.ranked-values-list');
              list.insertBefore(items[index], items[index - 1]);
              
              // Swap in the data
              const temp = this.selectedValues[index];
              this.selectedValues[index] = this.selectedValues[index - 1];
              this.selectedValues[index - 1] = temp;
              
              this.announce(`${selectedValueData[index].name} moved up to position ${index}`, 'polite');
            }
          });
        });
        
        moveDownButtons.forEach((btn, index) => {
          btn.addEventListener('click', () => {
            if (index < this.selectedValues.length - 1) {
              // Swap in the UI
              const items = this.assessmentContainer.querySelectorAll('.ranked-value-item');
              const list = this.assessmentContainer.querySelector('.ranked-values-list');
              list.insertBefore(items[index + 1], items[index]);
              
              // Swap in the data
              const temp = this.selectedValues[index];
              this.selectedValues[index] = this.selectedValues[index + 1];
              this.selectedValues[index + 1] = temp;
              
              this.announce(`${selectedValueData[index].name} moved down to position ${index + 2}`, 'polite');
            }
          });
        });
        
        this.announce('Values ranking screen loaded', 'polite');
    }
    
    /**
     * Show the reflection screen for top values
     */
    showReflection() {
        if (!this.assessmentContainer) return;
        
        // Get top values data
        const topValues = [];
        if (window.valuesData && Array.isArray(window.valuesData)) {
          // If we have selected/prioritized values, use them
          if (Array.isArray(this.prioritizedValues) && this.prioritizedValues.length > 0) {
            // Get the top 3 values or all if less than 3
            const topCount = Math.min(3, this.prioritizedValues.length);
            for (let i = 0; i < topCount; i++) {
              topValues.push(this.prioritizedValues[i]);
            }
          } else if (Array.isArray(this.selectedValues) && this.selectedValues.length > 0) {
            // Fallback to selectedValues if available
            const topCount = Math.min(3, this.selectedValues.length);
            for (let i = 0; i < topCount; i++) {
              const valueId = this.selectedValues[i];
              const valueData = window.valuesData.find(v => v.id === valueId);
              if (valueData) {
                topValues.push(valueData);
              }
            }
          } else {
            // Use sample values if no selected values
            const sampleCount = Math.min(3, window.valuesData.length);
            for (let i = 0; i < sampleCount; i++) {
              topValues.push(window.valuesData[i]);
            }
          }
        }
        
        // Initialize reflections object if needed
        if (!this.reflectionResponses) {
          this.reflectionResponses = {};
        }
        
        // Create reflection form
        let reflectionFormItems = '';
        topValues.forEach(value => {
          const reflectionId = `reflection-${value.id}`;
          const currentReflection = this.reflectionResponses[value.id] || '';
          
          reflectionFormItems += `
            <fieldset class="reflection-item">
              <legend><h3>${value.name}</h3></legend>
              <p id="${reflectionId}-instruction">Reflect on why this value is important to you:</p>
              <div class="textarea-container">
                <label for="${reflectionId}">Your reflection:</label>
                <textarea 
                  id="${reflectionId}" 
                  name="${reflectionId}" 
                  rows="4" 
                  maxlength="500"
                  aria-describedby="${reflectionId}-instruction ${reflectionId}-counter"
                >${currentReflection}</textarea>
                <div id="${reflectionId}-counter" class="char-counter" aria-live="polite">
                  Characters: ${currentReflection.length}/500
                </div>
              </div>
            </fieldset>
          `;
        });
        
        this.assessmentContainer.innerHTML = `
          <section role="region" aria-labelledby="reflection-heading">
            <h2 id="reflection-heading">Reflect on Your Values</h2>
            <p>Take a moment to reflect on why your top values are meaningful to you.</p>
            <div class="top-values-list" role="list">
              ${topValues.map((v, i) => `
                <div role="listitem" class="top-value">
                  <span class="rank">${i + 1}</span>
                  <span class="value-name">${v.name}</span>
                </div>
              `).join('')}
            </div>
            <form class="reflection-form">
              ${reflectionFormItems}
            </form>
            <div class="navigation-buttons">
              <button type="button" class="prev-button" aria-label="Previous step">Back</button>
              <button type="button" class="next-button" aria-label="Next step">Next</button>
            </div>
          </section>
        `;
        
        // Add event listeners for textareas
        const textareas = this.assessmentContainer.querySelectorAll('textarea');
        textareas.forEach(textarea => {
          const valueId = textarea.id.replace('reflection-', '');
          const counter = document.getElementById(`${textarea.id}-counter`);
          
          textarea.addEventListener('input', () => {
            // Update reflections object
            if (!this.reflections) this.reflections = {};
            this.reflections[valueId] = textarea.value;
            
            // Update character counter
            if (counter) {
              counter.textContent = `Characters: ${textarea.value.length}/500`;
            }
          });
        });
        
        this.announce('Values reflection screen loaded', 'polite');
    }
    
    /**
     * Export values assessment as PDF
     * Creates an accessible modal dialog with progress indicators
     */
    exportValuesAsPDF() {
        console.log('Starting exportValuesAsPDF method');
        
        try {
            // Clean up any existing modals
            this._removeExistingModals();
            
            // Create and append the modal elements
            const { modal, modalOverlay, cancelButton, progressBar, progressMessage, previouslyFocused } = 
                this._createAccessibleModal();
            
            // Announce export to screen readers
            this.announce('Exporting values assessment to PDF', 'assertive');
            
            // Simulate progress for testing
            this._simulateProgressForTesting(modal, progressBar, progressMessage, modalOverlay, previouslyFocused);
            
        } catch (error) {
            console.error('Error in exportValuesAsPDF:', error);
            this.announce('Error exporting PDF. Please try again.', 'assertive');
        }
    }
    
    /**
     * Remove any existing modal elements
     * @private
     */
    _removeExistingModals() {
        const existingModal = document.getElementById('export-modal');
        if (existingModal) {
            existingModal.parentNode.removeChild(existingModal);
        }
        
        const existingOverlay = document.querySelector('.modal-overlay');
        if (existingOverlay) {
            existingOverlay.parentNode.removeChild(existingOverlay);
        }
    }
    
    /**
     * Create an accessible modal dialog
     * @private
     * @returns {Object} Modal elements and references
     */
    _createAccessibleModal() {
        // Create modal IDs
        const modalId = 'export-modal';
        const titleId = 'export-modal-title';
        const descId = 'export-modal-description';
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.classList.add('modal-overlay');
        modalOverlay.setAttribute('aria-hidden', 'true');
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modalOverlay.style.zIndex = '1000';
        
        // Create modal dialog
        const modal = document.createElement('div');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', titleId);
        modal.setAttribute('aria-describedby', descId);
        modal.classList.add('export-modal');
        modal.id = modalId;
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'white';
        modal.style.padding = '20px';
        modal.style.borderRadius = '8px';
        modal.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        modal.style.zIndex = '1001';
        modal.style.width = '90%';
        modal.style.maxWidth = '500px';
        
        // Add modal content
        modal.innerHTML = `
          <div class="modal-content">
            <h2 id="${titleId}">Export Values Assessment</h2>
            <p id="${descId}">Your values assessment is being exported as a PDF document. This may take a few moments.</p>
            <div class="export-progress">
              <div class="progress-message" aria-live="polite">Preparing your PDF...</div>
              <div class="progress-bar-container" role="presentation" style="height: 20px; background-color: #eee; border-radius: 4px; overflow: hidden; margin: 10px 0;">
                <div 
                  role="progressbar" 
                  class="progress-bar" 
                  aria-valuemin="0" 
                  aria-valuemax="100" 
                  aria-valuenow="0"
                  aria-label="Export progress"
                  style="width: 0%; height: 100%; background-color: #4299e1;"
                ></div>
              </div>
            </div>
            <div class="modal-buttons">
              <button type="button" class="cancel-button" style="padding: 8px 16px; background: #e53e3e; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
          </div>
        `;
        
        // Store previously focused element
        const previouslyFocused = document.activeElement;
        
        // Add elements to DOM
        document.body.appendChild(modalOverlay);
        document.body.appendChild(modal);
        
        console.log('Modal elements created and added to DOM');
        console.log('Modal visible:', modal.style.display !== 'none');
        
        // Get references to important elements
        const cancelButton = modal.querySelector('.cancel-button');
        const progressBar = modal.querySelector('.progress-bar');
        const progressMessage = modal.querySelector('.progress-message');
        
        // Trap focus in modal
        if (window.AccessibilityHelpers && window.AccessibilityHelpers.trapFocus) {
            window.AccessibilityHelpers.trapFocus(modal);
        }
        
        // Set up cancel button
        if (cancelButton) {
            cancelButton.focus();
            
            cancelButton.addEventListener('click', () => {
                // Release focus
                if (window.AccessibilityHelpers && window.AccessibilityHelpers.releaseFocus) {
                    window.AccessibilityHelpers.releaseFocus();
                }
                
                // Remove modal elements
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                if (document.body.contains(modalOverlay)) {
                    document.body.removeChild(modalOverlay);
                }
                
                // Restore focus
                if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                    previouslyFocused.focus();
                }
                
                this.announce('PDF export canceled', 'assertive');
            });
        }
        
        return { modal, modalOverlay, cancelButton, progressBar, progressMessage, previouslyFocused };
    }
    
    /**
     * Simulate progress updates for testing
     * @private
     */
    _simulateProgressForTesting(modal, progressBar, progressMessage, modalOverlay, previouslyFocused) {
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
                progressBar.setAttribute('aria-valuenow', progress);
            }
            
            if (progressMessage) {
                progressMessage.textContent = `Preparing your PDF... ${progress}%`;
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                if (progressMessage) {
                    progressMessage.textContent = 'PDF export complete!';
                }
                
                this.announce('PDF export complete', 'assertive');
                
                // Simulate download completion
                setTimeout(() => {
                    // Release focus if helper available
                    if (window.AccessibilityHelpers && window.AccessibilityHelpers.releaseFocus) {
                        window.AccessibilityHelpers.releaseFocus();
                    }
                    
                    // Remove modal
                    if (document.body.contains(modal)) {
                        document.body.removeChild(modal);
                    }
                    if (document.body.contains(modalOverlay)) {
                        document.body.removeChild(modalOverlay);
                    }
                    
                    // Restore focus
                    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                        previouslyFocused.focus();
                    }
                }, 1000);
            }
        }, 300);
    }

    
    init() {
        // Check if container exists
        if (!this.assessmentContainer) {
            console.error('Assessment container not found');
            return;
        }
        
        // Load any previously saved progress
        this.loadSavedProgress();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize keyboard shortcuts for accessibility
        this.setupKeyboardShortcuts();
        
        // Show the appropriate screen based on current step
        this.showCurrentStep();
        
        // Update the step indicator
        this.updateProgressIndicator();
        
        // Announce for screen readers
        this.announce('Values assessment initialized. Step 1 of 4 displayed.');
        
        console.log('Values Assessment initialized');
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Set up navigation button listeners
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => {
                this.previousStep();
            });
        }
        
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => {
                this.nextStep();
            });
        }
        
        // Handle window beforeunload to save progress
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
    }
    
    /**
     * Makes screen reader announcements
     * @param {string} message - The message to announce
     * @param {string} [priority='polite'] - The priority of the announcement ('polite' or 'assertive')
     */
    announce(message, priority = 'polite') {
        if (!message) return;
        
        let announcer = this.progressAnnouncer;
        if (priority === 'assertive' && this.statusAnnouncer) {
            announcer = this.statusAnnouncer;
        }
        
        if (announcer) {
            announcer.textContent = message;
            announcer.setAttribute('aria-live', priority);
            
            // Clear after a delay for repeated announcements of the same message
            setTimeout(() => {
                announcer.textContent = '';
            }, 3000);
        } else {
            console.log(`Announcement (${priority}): ${message}`);
        }
    }
    
    /**
     * Load any previously saved progress from localStorage
     */
    loadSavedProgress() {
        try {
            // Load selected values
            const savedValues = localStorage.getItem('valueAssessment_selectedValues');
            if (savedValues) {
                this.selectedValues = JSON.parse(savedValues);
            }
            
            // Load prioritized values
            const savedPrioritizedValues = localStorage.getItem('valueAssessment_prioritizedValues');
            if (savedPrioritizedValues) {
                this.prioritizedValues = JSON.parse(savedPrioritizedValues);
            }
            
            // Load reflection responses
            const savedReflections = localStorage.getItem('valueAssessment_reflectionResponses');
            if (savedReflections) {
                this.reflectionResponses = JSON.parse(savedReflections);
            }
            
            // Load completion date
            const savedCompletionDate = localStorage.getItem('valueAssessment_completionDate');
            if (savedCompletionDate) {
                this.completionDate = savedCompletionDate;
            }
            
            // Load previous completion date
            const previousDate = localStorage.getItem('valueAssessment_previousCompletionDate');
            if (previousDate) {
                this.previousCompletionDate = previousDate;
            }
            
            // Determine current step based on saved data
            if (this.prioritizedValues && this.prioritizedValues.length > 0) {
                this.currentStep = 4; // Reflection step
            } else if (this.selectedValues && this.selectedValues.length > 0) {
                this.currentStep = 3; // Prioritization step
            } else {
                this.currentStep = 1; // Start fresh
            }
            
            console.log('Loaded saved progress', {
                currentStep: this.currentStep,
                selectedValues: this.selectedValues.length,
                prioritizedValues: this.prioritizedValues.length
            });
        } catch (error) {
            console.error('Error loading saved progress:', error);
            // Reset to default state if error
            this.currentStep = 1;
            this.selectedValues = [];
            this.prioritizedValues = [];
            this.reflectionResponses = {};
        }
    }
    
    /**
     * Save current progress to localStorage
     */
    saveProgress() {
        try {
            // Save selected values
            if (this.selectedValues && this.selectedValues.length) {
                localStorage.setItem('valueAssessment_selectedValues', JSON.stringify(this.selectedValues));
            } else {
                localStorage.removeItem('valueAssessment_selectedValues');
            }
            
            // Save prioritized values
            if (this.prioritizedValues && this.prioritizedValues.length) {
                localStorage.setItem('valueAssessment_prioritizedValues', JSON.stringify(this.prioritizedValues));
            } else {
                localStorage.removeItem('valueAssessment_prioritizedValues');
            }
            
            // Save reflection responses
            if (this.reflectionResponses && Object.keys(this.reflectionResponses).length) {
                localStorage.setItem('valueAssessment_reflectionResponses', JSON.stringify(this.reflectionResponses));
            } else {
                localStorage.removeItem('valueAssessment_reflectionResponses');
            }
            
            // Save completion date
            if (this.completionDate) {
                localStorage.setItem('valueAssessment_completionDate', this.completionDate);
            } else {
                localStorage.removeItem('valueAssessment_completionDate');
            }
            
            console.log('Progress saved');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }
    
    /**
     * Checks if external dependencies are available
     * @returns {Object} Object containing availability status of dependencies
     */
    checkDependencies() {
        const dependencies = {
            accessibilityHelpers: false,
            assessmentExporter: false,
            html2pdf: false
        };
        
        // Check for AccessibilityHelpers
        if (typeof window.AccessibilityHelpers !== 'undefined' && window.AccessibilityHelpers) {
            dependencies.accessibilityHelpers = true;
        } else {
            console.warn('AccessibilityHelpers module not found. Some accessibility features may be limited.');
        }
        
        // Check for AssessmentExporter
        if (typeof window.AssessmentExporter !== 'undefined' && window.AssessmentExporter) {
            dependencies.assessmentExporter = true;
        } else {
            console.warn('AssessmentExporter module not found. PDF export will use fallback method.');
        }
        
        // Check for html2pdf
        if (typeof html2pdf !== 'undefined') {
            dependencies.html2pdf = true;
        } else {
            console.warn('html2pdf library not found. PDF export will use browser print dialog as fallback.');
        }
        
        return dependencies;
    }
    
    /**
     * Show the current step based on this.currentStep value
     */
    showCurrentStep() {
        if (!this.assessmentContainer) return;
        
        // Clear container
        this.assessmentContainer.innerHTML = '';
        
        // Show appropriate step content
        switch (this.currentStep) {
            case 1:
                this.showIntroduction();
                break;
            case 2:
                this.showValuesSelection();
                break;
            case 3:
                this.showValuesRanking();
                break;
            case 4:
                this.showReflection();
                break;
            default:
                this.showIntroduction();
                break;
        }
        
        // Update buttons state
        this.updateNavigationButtons();
    }
    
    /**
     * Update the state of navigation buttons based on current step
     */
    updateNavigationButtons() {
        if (this.prevButton) {
            // Disable prev button on first step
            if (this.currentStep === 1) {
                this.prevButton.disabled = true;
                this.prevButton.setAttribute('aria-disabled', 'true');
            } else {
                this.prevButton.disabled = false;
                this.prevButton.setAttribute('aria-disabled', 'false');
            }
        }
        
        if (this.nextButton) {
            // Update next button text based on step
            if (this.currentStep === this.totalSteps) {
                this.nextButton.textContent = 'Finish';
                this.nextButton.setAttribute('aria-label', 'Finish assessment');
            } else {
                this.nextButton.textContent = 'Next';
                this.nextButton.setAttribute('aria-label', 'Next step');
            }
            
            // Disable next button if requirements not met
            const canProceed = this.canProceedToNextStep();
            this.nextButton.disabled = !canProceed;
            this.nextButton.setAttribute('aria-disabled', !canProceed ? 'true' : 'false');
        }
    }
    
    /**
     * Check if user can proceed to next step
     * @returns {boolean} True if user can proceed to next step
     */
    canProceedToNextStep() {
        switch (this.currentStep) {
            case 1:
                return true; // Can always proceed from intro
            case 2:
                return this.selectedValues && this.selectedValues.length >= 5; // Require at least 5 values
            case 3:
                return this.prioritizedValues && this.prioritizedValues.length >= 3; // Require at least 3 prioritized
            case 4:
                return false; // Last step, can't proceed further
            default:
                return true;
        }
    }
    
    /**
     * Go to previous step
     */
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateProgressIndicator();
            this.showCurrentStep();
            this.announce(`Moving to step ${this.currentStep} of ${this.totalSteps}`);
        }
    }
    
    /**
     * Go to next step
     */
    nextStep() {
        if (this.currentStep < this.totalSteps && this.canProceedToNextStep()) {
            this.currentStep++;
            this.updateProgressIndicator();
            this.showCurrentStep();
            this.announce(`Moving to step ${this.currentStep} of ${this.totalSteps}`);
            
            // Save progress after each step advancement
            this.saveProgress();
            
            // If we've reached the final step, mark as completed
            if (this.currentStep === this.totalSteps) {
                this.completionDate = new Date().toISOString();
                this.saveProgress();
            }
        } else if (this.currentStep === this.totalSteps) {
            // Final step - save and show completion message
            this.saveProgress();
            this.announce('Assessment complete! Your values have been saved.');
        }
    }
    
    /**
     * Setup keyboard shortcuts for accessibility
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only process shortcuts if not in a form field
            const isInFormField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
            if (isInFormField) return;
            
            // Alt + arrow shortcuts for navigation
            if (e.altKey) {
                switch (e.key) {
                    case 'ArrowLeft': // Previous step
                        if (this.prevButton && !this.prevButton.disabled) {
                            e.preventDefault();
                            this.prevButton.click();
                            this.announce('Moving to previous step');
                        }
                        break;
                        
                    case 'ArrowRight': // Next step
                        if (this.nextButton && !this.nextButton.disabled) {
                            e.preventDefault();
                            this.nextButton.click();
                            this.announce('Moving to next step');
                        }
                        break;
                        
                    case '1': case '2': case '3': case '4': // Jump to step
                        e.preventDefault();
                        const stepNum = parseInt(e.key);
                        if (stepNum <= this.currentStep) {
                            this.currentStep = stepNum;
                            this.updateProgressIndicator();
                            this.showCurrentStep();
                            this.announce(`Moving to step ${stepNum}`);
                        } else {
                            this.announce(`You must complete the current step before moving to step ${stepNum}`);
                        }
                        break;
                }
            }
            
            // Help dialog with ?
            if (e.key === '?') {
                e.preventDefault();
                this.showAccessibilityHelp();
            }
        });
    }
    
    /**
     * Show accessibility help dialog
     */
    showAccessibilityHelp() {
        // Implementation details will be added in Phase 3
        this.announce('Accessibility help: Alt+Left Arrow for previous step, Alt+Right Arrow for next step, Alt+1 through Alt+4 to jump to completed steps, Question mark for this help.');
    }
    
    /**
     * Update progress indicator based on current step
     */
    updateProgressIndicator() {
        const steps = document.querySelectorAll('.step');
        if (!steps.length) return;
        
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            const stepCircle = step.querySelector('div');
            
            if (stepNumber < this.currentStep) {
                // Completed steps
                step.classList.add('completed');
                step.classList.remove('active');
                stepCircle?.setAttribute('aria-label', `Step ${stepNumber} completed`);
            } else if (stepNumber === this.currentStep) {
                // Current step
                step.classList.add('active');
                step.classList.remove('completed');
                stepCircle?.setAttribute('aria-label', `Step ${stepNumber} current`);
                stepCircle?.setAttribute('aria-current', 'step');
            } else {
                // Future steps
                step.classList.remove('active', 'completed');
                stepCircle?.setAttribute('aria-label', `Step ${stepNumber} not yet reached`);
                stepCircle?.removeAttribute('aria-current');
            }
        });
    }
    
    /**
     * Show introduction screen with assessment overview and instructions
     * @returns {void}
     */
    showIntroduction() {
        if (!this.assessmentContainer) return;
        
        // Clear previous content
        this.assessmentContainer.innerHTML = '';
        
        // Create header section
        const header = document.createElement('header');
        header.setAttribute('role', 'banner');
        header.className = 'mb-8';
        
        const heading = document.createElement('h2');
        heading.id = 'values-intro-title';
        heading.className = 'text-2xl font-bold mb-4';
        heading.textContent = 'Values Assessment';
        
        const description = document.createElement('p');
        description.className = 'mb-4';
        description.textContent = 'Welcome to the Values Assessment. This tool will help you identify and reflect on your core values.';
        
        header.appendChild(heading);
        header.appendChild(description);
        
        // Create main content section
        const mainContent = document.createElement('div');
        mainContent.className = 'mb-8';
        mainContent.setAttribute('role', 'region');
        mainContent.setAttribute('aria-labelledby', 'values-intro-title');
        
        // Add steps explanation
        const stepsSection = document.createElement('div');
        stepsSection.className = 'mb-6';
        
        const stepsTitle = document.createElement('h3');
        stepsTitle.className = 'text-xl font-bold mb-2';
        stepsTitle.textContent = 'The Process';
        
        const stepsList = document.createElement('ol');
        stepsList.className = 'list-decimal pl-6';
        stepsList.setAttribute('role', 'list');
        
        // Create step items
        const steps = [
            'Select values that resonate with you',
            'Prioritize your selected values',
            'Reflect on your top values',
            'Export your assessment'
        ];
        
        steps.forEach(step => {
            const li = document.createElement('li');
            li.className = 'mb-1';
            li.textContent = step;
            li.setAttribute('role', 'listitem');
            stepsList.appendChild(li);
        });
        
        stepsSection.appendChild(stepsTitle);
        stepsSection.appendChild(stepsList);
        
        // Add benefits section
        const benefitsSection = document.createElement('div');
        
        const benefitsTitle = document.createElement('h3');
        benefitsTitle.className = 'text-xl font-bold mb-2';
        benefitsTitle.textContent = 'Benefits';
        
        const benefitsText = document.createElement('p');
        benefitsText.textContent = 'Understanding your core values helps you make more aligned decisions, set meaningful goals, and find greater satisfaction in your personal and professional life.';
        
        benefitsSection.appendChild(benefitsTitle);
        benefitsSection.appendChild(benefitsText);
        
        // Add sections to main content
        mainContent.appendChild(stepsSection);
        mainContent.appendChild(benefitsSection);
        
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex justify-end mt-8';
        
        const nextButton = document.createElement('button');
        nextButton.className = 'px-4 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
        nextButton.textContent = 'Begin Assessment';
        nextButton.setAttribute('aria-label', 'Begin the values assessment');
        nextButton.addEventListener('click', () => this.nextStep());
        
        buttonContainer.appendChild(nextButton);
        
        // Assemble the UI
        this.assessmentContainer.appendChild(header);
        this.assessmentContainer.appendChild(mainContent);
        this.assessmentContainer.appendChild(buttonContainer);
        
        // Update progress indicator and focus
        this.updateProgressIndicator(1);
        nextButton.focus();
        
        // Announce for screen readers
        this.announce('Introduction to values assessment. Press the Begin Assessment button to start.', 'polite');
    }
    
    /**
     * Populate the values grid with interactive value selection cards
     */
    populateValuesGrid() {
        // Get values grid element
        const valuesGrid = document.getElementById('values-grid');
        if (!valuesGrid) return;
        
        // Clear existing content
        valuesGrid.innerHTML = '';
        
        // Get values data or use empty array as fallback
        const valuesData = window.valuesData || [];
        
        // If no values data available, display an error message
        if (!valuesData.length) {
            const errorMessage = document.createElement('p');
            errorMessage.className = 'text-red-600';
            errorMessage.textContent = 'Error: Values data not found. Please refresh the page or contact support.';
            valuesGrid.appendChild(errorMessage);
            return;
        }
        
        // Create value selection cards
        valuesData.forEach(value => {
            // Create the value card using the HTML structure from the template
            const cardTemplate = `
                <div class="value-card" data-value-id="${value.id}" data-category="${value.category || ''}">
                    <div class="cursor-pointer p-4 rounded-md border-2 border-gray-200 dark:border-gray-700 hover:border-va-primary dark:hover:border-va-primary-light bg-white dark:bg-gray-800 transition-all duration-200 flex flex-col h-full">
                        <div class="flex justify-between items-start">
                            <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200">${value.name}</h4>
                            <div class="value-checkbox h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">${value.description || ''}</p>
                    </div>
                </div>
            `;
            
            // Add the card to the grid
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = cardTemplate.trim();
            valuesGrid.appendChild(tempContainer.firstChild);
        });
    }
    
    /**
     * Set up search and filter functionality for the values selection screen
     */
    setupValuesSearchAndFilter() {
        const searchInput = document.getElementById('values-search');
        const categoryFilter = document.getElementById('category-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterValues();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterValues();
            });
        }
    }
    
    /**
     * Filter values based on search input and category selection
     */
    filterValues() {
        const searchInput = document.getElementById('values-search');
        const categoryFilter = document.getElementById('category-filter');
        const valueCards = document.querySelectorAll('.value-card');
        
        if (!searchInput || !categoryFilter || !valueCards.length) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const categoryTerm = categoryFilter.value;
        
        // Count how many cards are visible
        let visibleCount = 0;
        
        valueCards.forEach(card => {
            // Get value name and description from the card
            const valueName = card.querySelector('h4').textContent.toLowerCase();
            const valueDescription = card.querySelector('p').textContent.toLowerCase();
            const valueCategory = card.dataset.category || '';
            
            // Check if card matches both filters
            const matchesSearch = !searchTerm || 
                valueName.includes(searchTerm) || 
                valueDescription.includes(searchTerm);
                
            const matchesCategory = categoryTerm === 'all' || 
                valueCategory.split(',').includes(categoryTerm);
            
            // Show or hide based on filters
            if (matchesSearch && matchesCategory) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Update no results message
        const noResultsMessage = document.getElementById('no-values-found');
        if (noResultsMessage) {
            if (visibleCount === 0) {
                noResultsMessage.classList.remove('hidden');
            } else {
                noResultsMessage.classList.add('hidden');
            }
        }
        
        this.announce(`${visibleCount} values displayed based on current filters`, 'polite');
    }
    
    /**
     * Adds click handlers to value selection cards to toggle selection
     */
    setupValueCardHandlers() {
        // Get all value cards
        const valueCards = document.querySelectorAll('.value-card');
        if (!valueCards.length) return;
        
        // Get selection counter
        const selectionCounter = document.getElementById('selection-counter');
        
        // Initialize counter with current selection count
        if (selectionCounter && this.selectedValues) {
            selectionCounter.textContent = `${this.selectedValues.length} of ${valueCards.length} values selected`;
        }
        
        // Add click handlers to each card
        valueCards.forEach(card => {
            const valueId = card.dataset.valueId;
            const checkmark = card.querySelector('.value-checkbox');
            
            // Set initial selected state if value is in selectedValues array
            if (this.selectedValues && this.selectedValues.includes(valueId)) {
                card.classList.add('selected');
                card.querySelector('.cursor-pointer').classList.add('border-va-primary', 'dark:border-va-primary-light');
                if (checkmark) {
                    checkmark.classList.add('bg-va-primary', 'dark:bg-va-primary-light');
                }
            }
            
            // Add click event listener
            card.addEventListener('click', () => this.toggleValueSelection(valueId, card));
            
            // Add keyboard support
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.toggleValueSelection(valueId, card);
                }
            });
        });
    }
    
    /**
     * Toggle selection state for a value card
     * @param {string} valueId - ID of the value to toggle
     * @param {HTMLElement} card - The card element
     */
    toggleValueSelection(valueId, card) {
        if (!valueId || !card) return;
        
        // Get checkmark element
        const checkmark = card.querySelector('.value-checkbox');
        
        // Initialize selectedValues array if it doesn't exist
        if (!this.selectedValues) {
            this.selectedValues = [];
        }
        
        // Toggle selection
        const isSelected = this.selectedValues.includes(valueId);
        const cardContainer = card.querySelector('.cursor-pointer');
        
        if (isSelected) {
            // Remove value from selection
            this.selectedValues = this.selectedValues.filter(id => id !== valueId);
            card.classList.remove('selected');
            if (cardContainer) {
                cardContainer.classList.remove('border-va-primary', 'dark:border-va-primary-light');
            }
            if (checkmark) {
                checkmark.classList.remove('bg-va-primary', 'dark:bg-va-primary-light');
            }
        } else {
            // Add value to selection
            this.selectedValues.push(valueId);
            card.classList.add('selected');
            if (cardContainer) {
                cardContainer.classList.add('border-va-primary', 'dark:border-va-primary-light');
            }
            if (checkmark) {
                checkmark.classList.add('bg-va-primary', 'dark:bg-va-primary-light');
            }
        }
        
        // Update selection counter and next button state
        this.updateSelectionCounter();
    }
    
    /**
     * Updates the selection counter based on currently selected values
     */
    updateSelectionCounter() {
        // Find selection counter element
        const selectionCounter = document.getElementById('selection-counter');
        if (!selectionCounter) return;
        
        // Get total number of value cards
        const totalCards = document.querySelectorAll('.value-card').length;
        
        // Update counter text
        if (this.selectedValues && Array.isArray(this.selectedValues)) {
            selectionCounter.textContent = `${this.selectedValues.length} of ${totalCards} values selected`;
            
            // Announce for screen readers
            this.announce(`${this.selectedValues.length} of ${totalCards} values selected`, 'polite');
        } else {
            selectionCounter.textContent = `0 of ${totalCards} values selected`;
        }
        
        // Update next button state
        this.updateNextButtonState();
    }
    
    /**
     * Updates the next button state based on current selection
     */
    updateNextButtonState() {
        const nextButton = document.getElementById('next-button');
        if (!nextButton) return;
        
        // Enable next button if at least one value is selected
        if (this.selectedValues && this.selectedValues.length > 0) {
            nextButton.removeAttribute('disabled');
            nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            nextButton.setAttribute('disabled', 'disabled');
            nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }
    
    /**
     * Sets up navigation buttons for the values selection screen
     */
    setupNavigationButtons() {
        const nextButton = document.getElementById('next-button');
        const prevButton = document.getElementById('prev-button');
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.showValuesPrioritization();
            });
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                this.showIntroduction();
            });
        }
        
        // Update next button state based on current selection
        this.updateNextButtonState();
    }
    
    /**
     * Shows the values prioritization screen
     */
    showValuesPrioritization() {
        if (!this.assessmentContainer) return;
        
        // Check if we have selected values
        if (!this.selectedValues || this.selectedValues.length === 0) {
            this.announce('No values selected. Please select at least one value to continue.', 'assertive');
            return;
        }
        
        // Copy selected values to prioritized values if not already populated
        if (!this.prioritizedValues || this.prioritizedValues.length === 0) {
            this.prioritizedValues = [...this.selectedValues];
        }
        
        // Set up prioritization screen HTML structure
        this.assessmentContainer.innerHTML = `
            <section role="region" aria-labelledby="priority-heading">
                <h2 id="priority-heading">Prioritize Your Values</h2>
                <p>Arrange your selected values in order of importance to you.</p>
                <div id="priority-list-container" class="my-6">
                    <ul id="priority-list" class="space-y-2" role="list" aria-label="Prioritized values list. Use up and down buttons to reorder values."></ul>
                </div>
                <div class="flex justify-between mt-6">
                    <button id="back-to-selection" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded">Back</button>
                    <button id="go-to-reflection" class="px-4 py-2 bg-va-primary text-white rounded">Continue</button>
                </div>
            </section>
        `;
        
        // Populate the priority list
        this.populatePriorityList();
        
        // Set up navigation buttons
        this.setupPrioritizationNavigation();
        
        // Announce for screen readers
        this.announce('Values prioritization screen loaded. Arrange your selected values in order of importance using the up and down buttons.', 'polite');
    }
    
    /**
     * Populates the priority list with the selected values for ranking
     */
    populatePriorityList() {
        const priorityList = document.getElementById('priority-list');
        if (!priorityList || !this.prioritizedValues || !Array.isArray(this.prioritizedValues)) return;
        
        // Clear existing items
        priorityList.innerHTML = '';
        
        // Get values data
        const valuesData = window.valuesData || [];
        if (!valuesData.length) return;
        
        // Create ranking items from prioritizedValues
        this.prioritizedValues.forEach((valueId, index) => {
            // Find the value data
            const valueData = valuesData.find(v => v.id === valueId);
            if (!valueData) return; // Skip if not found
            
            // Create list item for each value
            const listItem = document.createElement('li');
            listItem.className = 'flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3';
            listItem.setAttribute('role', 'listitem');
            listItem.setAttribute('data-value-id', valueId);
            listItem.setAttribute('tabindex', '0');
            listItem.setAttribute('aria-label', `${valueData.name} ranked ${index + 1} of ${this.prioritizedValues.length}`);
            
            // Left side with rank number and value name
            const valueInfo = document.createElement('div');
            valueInfo.className = 'flex items-center space-x-3';
            
            // Rank number
            const rankBadge = document.createElement('span');
            rankBadge.className = 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold';
            rankBadge.textContent = (index + 1).toString();
            rankBadge.setAttribute('aria-hidden', 'true'); // Hidden from screen readers as rank is in the parent aria-label
            
            // Value name and description
            const valueContent = document.createElement('div');
            valueContent.className = 'ml-2';
            
            const valueName = document.createElement('div');
            valueName.className = 'font-medium text-gray-900 dark:text-gray-100';
            valueName.textContent = valueData.name;
            
            valueContent.appendChild(valueName);
            valueInfo.appendChild(rankBadge);
            valueInfo.appendChild(valueContent);
            
            // Right side with up/down controls
            const controls = document.createElement('div');
            controls.className = 'flex space-x-2';
            
            // Move up button
            const upButton = document.createElement('button');
            upButton.className = 'p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600';
            upButton.setAttribute('type', 'button');
            upButton.setAttribute('aria-label', `Move ${valueData.name} up in ranking`);
            upButton.disabled = index === 0; // Disable if first item
            if (upButton.disabled) {
                upButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
            
            // Up arrow icon
            const upIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            upIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            upIcon.setAttribute('width', '16');
            upIcon.setAttribute('height', '16');
            upIcon.setAttribute('fill', 'currentColor');
            upIcon.setAttribute('viewBox', '0 0 20 20');
            upIcon.setAttribute('aria-hidden', 'true');
            
            const upPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            upPath.setAttribute('fill-rule', 'evenodd');
            upPath.setAttribute('d', 'M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z');
            upPath.setAttribute('clip-rule', 'evenodd');
            
            upIcon.appendChild(upPath);
            upButton.appendChild(upIcon);
            
            // Move down button
            const downButton = document.createElement('button');
            downButton.className = 'p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600';
            downButton.setAttribute('type', 'button');
            downButton.setAttribute('aria-label', `Move ${valueData.name} down in ranking`);
            downButton.disabled = index === this.prioritizedValues.length - 1; // Disable if already at the bottom
            if (downButton.disabled) {
                downButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
            
            const downIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            downIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            downIcon.setAttribute('width', '16');
            downIcon.setAttribute('height', '16');
            downIcon.setAttribute('fill', 'currentColor');
            downIcon.setAttribute('viewBox', '0 0 20 20');
            downIcon.setAttribute('aria-hidden', 'true');
            
            const downPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            downPath.setAttribute('fill-rule', 'evenodd');
            downPath.setAttribute('d', 'M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z');
            downPath.setAttribute('clip-rule', 'evenodd');
            
            downIcon.appendChild(downPath);
            downButton.appendChild(downIcon);
            
            // Add event listeners
            upButton.addEventListener('click', () => this.moveValueUp(index));
            downButton.addEventListener('click', () => this.moveValueDown(index));
            
            // Add keyboard navigation
            listItem.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp' && !upButton.disabled) {
                    e.preventDefault();
                    this.moveValueUp(index);
                } else if (e.key === 'ArrowDown' && !downButton.disabled) {
                    e.preventDefault();
                    this.moveValueDown(index);
                }
            });
            
            // Add controls to the controls container
            controls.appendChild(upButton);
            controls.appendChild(downButton);
            
            // Add all components to the list item
            listItem.appendChild(valueInfo);
            listItem.appendChild(controls);
            
            // Add to the priority list
            priorityList.appendChild(listItem);
        });
    }

    /**
     * Set up navigation buttons for the prioritization screen
     */
    setupPrioritizationNavigation() {
        const backButton = document.getElementById('back-to-selection');
        const continueButton = document.getElementById('go-to-reflection');
        
        if (backButton) {
            backButton.addEventListener('click', () => {
                // Go back to values selection
                this.announce('Returning to values selection screen', 'polite');
                this.showValuesSelection();
            });
        }
        
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                // Proceed to reflection
                this.announce('Proceeding to values reflection', 'polite');
                this.showReflection();
            });
        }
    }
    
    /**
     * Move a value up in the ranking
     * @param {number} index - Current index of the value
     */
    moveValueUp(index) {
        // Can't move the top item up
        if (index <= 0 || !this.prioritizedValues || index >= this.prioritizedValues.length) return;
        
        // Swap items in the array
        const temp = this.prioritizedValues[index];
        this.prioritizedValues[index] = this.prioritizedValues[index - 1];
        this.prioritizedValues[index - 1] = temp;
        
        // Update the UI
        this.populatePriorityList();
        
        // Get the value that was moved for screen reader announcement
        const valuesData = window.valuesData || [];
        const valueData = valuesData.find(v => v.id === temp);
        if (valueData) {
            this.announce(`${valueData.name} moved up to position ${index}`, 'polite');
        }
        
        // Focus the item after re-render
        setTimeout(() => {
            const items = document.querySelectorAll('#priority-list li');
            if (items[index - 1]) {
                items[index - 1].focus();
            }
        }, 50);
    }
    
    /**
     * Move a value down in the ranking
     * @param {number} index - Current index of the value
     */
    moveValueDown(index) {
        // Can't move the bottom item down
        if (!this.prioritizedValues || index >= this.prioritizedValues.length - 1 || index < 0) return;
        
        // Swap items in the array
        const temp = this.prioritizedValues[index];
        this.prioritizedValues[index] = this.prioritizedValues[index + 1];
        this.prioritizedValues[index + 1] = temp;
        
        // Update the UI
        this.populatePriorityList();
        
        // Get the value that was moved for screen reader announcement
        const valuesData = window.valuesData || [];
        const valueData = valuesData.find(v => v.id === temp);
        if (valueData) {
            this.announce(`${valueData.name} moved down to position ${index + 2}`, 'polite');
        }
        
        // Focus the item after re-render
        setTimeout(() => {
            const items = document.querySelectorAll('#priority-list li');
            if (items[index + 1]) {
                items[index + 1].focus();
            }
        }, 50);
    }
    
    /**
     * Update the progress indicator based on current step
     * @param {number} step - Current step number
     */
    updateProgressIndicator(step) {
        const progressBar = document.getElementById('assessment-progress');
        if (!progressBar) return;
        
        // Calculate progress percentage
        const totalSteps = this.totalSteps || 4;
        const percentage = Math.round((step / totalSteps) * 100);
        
        // Update the progress bar
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
        
        // Update any progress text
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = `Step ${step} of ${totalSteps}`;
        }
    }
    
    /**
     * Show the reflection screen for top values
     */
    showReflection() {
        if (!this.assessmentContainer) return;
        
        // Check if we have prioritized values
        if (!this.prioritizedValues || this.prioritizedValues.length === 0) {
            this.announce('No values prioritized. Please select and prioritize at least one value to continue.', 'assertive');
            return;
        }
        
        this.assessmentContainer.innerHTML = '';
        
        // Create header section
        const header = document.createElement('header');
        header.setAttribute('role', 'banner');
        header.className = 'mb-6';
        
        const heading = document.createElement('h2');
        heading.id = 'values-reflection-title';
        heading.className = 'text-2xl font-bold mb-3';
        heading.textContent = 'Reflect On Your Values';
        
        const description = document.createElement('p');
        description.className = 'mb-2';
        description.textContent = 'Arrange your values in order of importance to you. Use the up and down buttons to change the ranking.';
        
        const instructionsList = document.createElement('ul');
        instructionsList.className = 'mb-4 text-sm text-gray-600 list-disc pl-5';
        instructionsList.setAttribute('role', 'list');
        
        const instructions = [
            'Higher ranked values appear at the top of the list',
            'Use the arrow buttons to move values up or down',
            'You can also use keyboard arrow keys when a value is focused'
        ];
        
        instructions.forEach(instruction => {
            const li = document.createElement('li');
            li.textContent = instruction;
            li.setAttribute('role', 'listitem');
            instructionsList.appendChild(li);
        });
        
        // Assemble header
        header.appendChild(heading);
        header.appendChild(description);
        header.appendChild(instructionsList);
        
        // Create the ranking container
        const rankingContainer = document.createElement('div');
        rankingContainer.className = 'mb-8 border rounded-lg p-4';
        rankingContainer.setAttribute('role', 'region');
        rankingContainer.setAttribute('aria-labelledby', 'values-ranking-title');
        
        // Create ordered list for ranked values
        const rankedList = document.createElement('ol');
        rankedList.className = 'space-y-2';
        rankedList.setAttribute('role', 'list');
        rankedList.setAttribute('aria-label', 'Ranked values list, highest priority first');
        
        // Get values data
        const valuesData = window.valuesData || [];
        
        // Display error if no values data
        if (!valuesData.length) {
            const errorMessage = document.createElement('p');
            errorMessage.className = 'text-red-600';
            errorMessage.textContent = 'Error: Values data not found. Please refresh the page or contact support.';
            rankingContainer.appendChild(errorMessage);
        } else {
            // Create ranking items from prioritizedValues
            this.prioritizedValues.forEach((valueId, index) => {
                // Find the value data
                const valueData = valuesData.find(v => v.id === valueId);
                if (!valueData) return; // Skip if not found
                
                // Create list item for each value
                const listItem = document.createElement('li');
                listItem.className = 'flex items-center justify-between bg-white border rounded p-3';
                listItem.setAttribute('role', 'listitem');
                listItem.setAttribute('data-value-id', valueId);
                listItem.setAttribute('tabindex', '0');
                listItem.setAttribute('aria-label', `${valueData.name} ranked ${index + 1} of ${this.prioritizedValues.length}`);
                
                // Left side with rank number and value name
                const valueInfo = document.createElement('div');
                valueInfo.className = 'flex items-center space-x-3';
                
                // Rank number
                const rankBadge = document.createElement('span');
                rankBadge.className = 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold';
                rankBadge.textContent = (index + 1).toString();
                rankBadge.setAttribute('aria-hidden', 'true'); // Hidden from screen readers as rank is in the parent aria-label
                
                // Value name and description
                const valueContent = document.createElement('div');
                
                const valueName = document.createElement('div');
                valueName.className = 'font-bold';
                valueName.textContent = valueData.name;
                
                const valueDesc = document.createElement('div');
                valueDesc.className = 'text-sm text-gray-600';
                valueDesc.textContent = valueData.description;
                
                valueContent.appendChild(valueName);
                valueContent.appendChild(valueDesc);
                
                valueInfo.appendChild(rankBadge);
                valueInfo.appendChild(valueContent);
                
                // Controls for ranking
                const controls = document.createElement('div');
                controls.className = 'flex space-x-1';
                
                // Move up button
                const upButton = document.createElement('button');
                upButton.className = 'p-2 border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';
                upButton.setAttribute('aria-label', `Move ${valueData.name} up in ranking`);
                upButton.disabled = index === 0; // Disable if already at the top
                if (upButton.disabled) {
                    upButton.classList.add('opacity-50', 'cursor-not-allowed');
                }
                
                const upIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                upIcon.setAttribute('class', 'w-4 h-4');
                upIcon.setAttribute('viewBox', '0 0 20 20');
                upIcon.setAttribute('fill', 'currentColor');
                
                const upPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                upPath.setAttribute('fill-rule', 'evenodd');
                upPath.setAttribute('d', 'M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z');
                upPath.setAttribute('clip-rule', 'evenodd');
                
                upIcon.appendChild(upPath);
                upButton.appendChild(upIcon);
                
                // Move down button
                const downButton = document.createElement('button');
                downButton.className = 'p-2 border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';
                downButton.setAttribute('aria-label', `Move ${valueData.name} down in ranking`);
                downButton.disabled = index === this.prioritizedValues.length - 1; // Disable if already at the bottom
                if (downButton.disabled) {
                    downButton.classList.add('opacity-50', 'cursor-not-allowed');
                }
                
                const downIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                downIcon.setAttribute('class', 'w-4 h-4');
                downIcon.setAttribute('viewBox', '0 0 20 20');
                downIcon.setAttribute('fill', 'currentColor');
                
                const downPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                downPath.setAttribute('fill-rule', 'evenodd');
                downPath.setAttribute('d', 'M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z');
                downPath.setAttribute('clip-rule', 'evenodd');
                
                downIcon.appendChild(downPath);
                downButton.appendChild(downIcon);
                
                // Add event listeners
                upButton.addEventListener('click', () => this.moveValueUp(index));
                downButton.addEventListener('click', () => this.moveValueDown(index));
                
                // Add keyboard navigation
                listItem.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowUp' && !upButton.disabled) {
                        e.preventDefault();
                        this.moveValueUp(index);
                    } else if (e.key === 'ArrowDown' && !downButton.disabled) {
                        e.preventDefault();
                        this.moveValueDown(index);
                    }
                });
                
                // Add controls to the controls container
                controls.appendChild(upButton);
                controls.appendChild(downButton);
                
                // Assemble the list item
                listItem.appendChild(valueInfo);
                listItem.appendChild(controls);
                
                // Add to the ranked list
                rankedList.appendChild(listItem);
            });
        }
        
        // Add ranked list to container
        rankingContainer.appendChild(rankedList);
        
        
        // Create navigation buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex justify-between mt-8';
        
        const backButton = document.createElement('button');
        backButton.type = 'button';
        backButton.className = 'px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded';
        backButton.textContent = 'Back';
        backButton.setAttribute('aria-label', 'Return to prioritization');
        
        const finishButton = document.createElement('button');
        finishButton.type = 'button';
        finishButton.className = 'px-4 py-2 bg-va-primary text-white rounded';
        finishButton.textContent = 'Finish';
        finishButton.setAttribute('aria-label', 'Complete assessment');
        
        // Add event listeners
        backButton.addEventListener('click', () => {
            this.announce('Returning to values prioritization', 'polite');
            this.showValuesPrioritization();
        });
        
        finishButton.addEventListener('click', () => {
            this.announce('Assessment completed', 'polite');
            // Add completion logic here
            this.saveProgress();
            // Redirect or show completion screen
        });
        
        buttonContainer.appendChild(backButton);
        buttonContainer.appendChild(finishButton);
        
        // Assemble the UI
        this.assessmentContainer.appendChild(header);
        this.assessmentContainer.appendChild(rankingContainer);
        this.assessmentContainer.appendChild(buttonContainer);
        
        // Focus first item
        setTimeout(() => {
            const firstItem = this.assessmentContainer.querySelector('li');
            if (firstItem) {
                firstItem.focus();
            }
        }, 100);
        
        // Announce for screen readers
        this.announce('Values reflection screen loaded. Review your prioritized values.', 'polite');
    }

        // Announce for screen readers
        this.announce('Values ranking screen. Use arrow keys or buttons to reorder your values by importance.', 'polite');
    }
    
    /**
     * Move a value up in the ranking
     * @param {number} index - Current index of the value
     * @returns {void}
     */
    moveValueUp(index) {
        if (!this.prioritizedValues || index <= 0) return;
        
        // Swap with the item above
        const temp = this.prioritizedValues[index - 1];
        this.prioritizedValues[index - 1] = this.prioritizedValues[index];
        this.prioritizedValues[index] = temp;
        
        // Save progress
        this.saveProgress();
        
        // Re-render the ranking screen
        this.showValuesRanking();
        
        // Get the moved value name for announcement
        const valuesData = window.valuesData || [];
        const movedValueData = valuesData.find(v => v.id === this.prioritizedValues[index - 1]);
        const valueName = movedValueData ? movedValueData.name : 'Value';
        
        // Announce the change
        this.announce(`${valueName} moved up to rank ${index}.`, 'polite');
    }
    
    /**
     * Move a value down in the ranking
     * @param {number} index - Current index of the value
     * @returns {void}
     */
    moveValueDown(index) {
        if (!this.prioritizedValues || index >= this.prioritizedValues.length - 1) return;
        
        // Swap with the item below
        const temp = this.prioritizedValues[index + 1];
        this.prioritizedValues[index + 1] = this.prioritizedValues[index];
        this.prioritizedValues[index] = temp;
        
        // Save progress
        this.saveProgress();
        
        // Re-render the ranking screen
        this.showValuesRanking();
        
        // Get the moved value name for announcement
        const valuesData = window.valuesData || [];
        const movedValueData = valuesData.find(v => v.id === this.prioritizedValues[index + 1]);
        const valueName = movedValueData ? movedValueData.name : 'Value';
        
        // Announce the change
        this.announce(`${valueName} moved down to rank ${index + 2}.`, 'polite');
    }
    
    /**
     * Show reflection screen with form inputs for reflecting on top values
     * @returns {void}
     */
    showReflection() {
        if (!this.assessmentContainer) return;
        
        // Check if we have prioritized values
        if (!this.prioritizedValues || this.prioritizedValues.length === 0) {
            // No values prioritized, redirect to selection screen
            this.currentStep = 2;
            this.showValuesSelection();
            this.announce('No values have been prioritized. Please select and rank your values first.', 'assertive');
            return;
        }
        
        // Initialize reflectionResponses if empty
        if (!this.reflectionResponses) {
            this.reflectionResponses = {};
        }
        
        // Clear previous content
        this.assessmentContainer.innerHTML = '';
        
        // Create header section
        const header = document.createElement('header');
        header.setAttribute('role', 'banner');
        header.className = 'mb-6';
        
        const heading = document.createElement('h2');
        heading.id = 'values-reflection-title';
        heading.className = 'text-2xl font-bold mb-3';
        heading.textContent = 'Reflect on Your Values';
        
        const description = document.createElement('p');
        description.className = 'mb-4';
        description.textContent = 'Consider how your top values influence your decisions and actions. Reflect on why these values are important to you.';
        
        // Assemble header
        header.appendChild(heading);
        header.appendChild(description);
        
        // Create form container
        const formContainer = document.createElement('div');
        formContainer.setAttribute('role', 'form');
        formContainer.setAttribute('aria-labelledby', 'values-reflection-title');
        
        // Get values data
        const valuesData = window.valuesData || [];
        
        // Display error if no values data
        if (!valuesData.length) {
            const errorMessage = document.createElement('p');
            errorMessage.className = 'text-red-600';
            errorMessage.textContent = 'Error: Values data not found. Please refresh the page or contact support.';
            formContainer.appendChild(errorMessage);
        } else {
            // Get top 3 values or all if less than 3
            const topValues = this.prioritizedValues.slice(0, 3);
            
            // For each top value, create a reflection section
            topValues.forEach((valueId, index) => {
                // Find value data
                const valueData = valuesData.find(v => v.id === valueId);
                if (!valueData) return; // Skip if not found
                
                // Create section container
                const section = document.createElement('div');
                section.className = 'mb-8 p-4 border rounded bg-gray-50';
                
                // Value heading
                const valueHeading = document.createElement('h3');
                valueHeading.id = `reflection-${valueId}-heading`;
                valueHeading.className = 'text-xl font-bold mb-2';
                valueHeading.textContent = `${index + 1}. ${valueData.name}`;
                
                // Value description
                const valueDesc = document.createElement('p');
                valueDesc.className = 'mb-4 text-gray-700';
                valueDesc.textContent = valueData.description;
                
                // Reflection prompts
                const prompts = [
                    `How does ${valueData.name} guide your decisions?`,
                    `When have you demonstrated this value recently?`,
                    `What obstacles prevent you from fully living this value?`
                ];
                
                // Create form fields for each prompt
                prompts.forEach((prompt, promptIndex) => {
                    const fieldId = `reflection-${valueId}-${promptIndex}`;
                    
                    // Prompt container
                    const promptContainer = document.createElement('div');
                    promptContainer.className = 'mb-4';
                    
                    // Label
                    const label = document.createElement('label');
                    label.setAttribute('for', fieldId);
                    label.className = 'block mb-2 font-medium';
                    label.textContent = prompt;
                    
                    // Textarea
                    const textarea = document.createElement('textarea');
                    textarea.id = fieldId;
                    textarea.className = 'w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none';
                    textarea.setAttribute('rows', '3');
                    textarea.setAttribute('aria-labelledby', `reflection-${valueId}-heading`);
                    
                    // Set value from saved responses if available
                    const responseKey = `${valueId}-${promptIndex}`;
                    if (this.reflectionResponses[responseKey]) {
                        textarea.value = this.reflectionResponses[responseKey];
                    }
                    
                    // Add change event listener to save responses
                    textarea.addEventListener('change', () => {
                        this.reflectionResponses[responseKey] = textarea.value;
                        this.saveProgress();
                        this.announce('Response saved', 'polite');
                    });
                    
                    // Assemble prompt container
                    promptContainer.appendChild(label);
                    promptContainer.appendChild(textarea);
                    
                    // Add to section
                    section.appendChild(promptContainer);
                });
                
                // Add the value section to the form
                section.insertBefore(valueHeading, section.firstChild);
                section.insertBefore(valueDesc, section.children[1]);
                formContainer.appendChild(section);
            });
        }
        
        // Create completion section
        const completionSection = document.createElement('div');
        completionSection.className = 'mt-8 mb-4';
        
        const completionHeading = document.createElement('h3');
        completionHeading.className = 'text-xl font-bold mb-3';
        completionHeading.textContent = 'Completion';
        
        const completionText = document.createElement('p');
        completionText.textContent = 'Once you have completed your reflections, you can export your values assessment as a PDF document.';
        
        completionSection.appendChild(completionHeading);
        completionSection.appendChild(completionText);
        
        // Create export button
        const exportButton = document.createElement('button');
        exportButton.className = 'mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500';
        exportButton.textContent = 'Export Assessment';
        exportButton.setAttribute('aria-label', 'Export your values assessment as PDF');
        exportButton.addEventListener('click', () => this.exportValuesAsPDF());
        
        completionSection.appendChild(exportButton);
        
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex justify-between mt-8';
        
        // Back button
        const backButton = document.createElement('button');
        backButton.className = 'px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500';
        backButton.setAttribute('aria-label', 'Back to values ranking');
        backButton.textContent = 'Back';
        backButton.addEventListener('click', () => this.previousStep());
        
        // Next/Complete button
        const completeButton = document.createElement('button');
        completeButton.className = 'px-4 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
        completeButton.textContent = 'Complete';
        completeButton.setAttribute('aria-label', 'Complete the assessment');
        completeButton.addEventListener('click', () => {
            // Mark assessment as complete
            this.completionDate = new Date().toISOString();
            this.saveProgress();
            this.nextStep();
            this.announce('Assessment completed successfully!', 'assertive');
        });
        
        // Add buttons to container
        buttonContainer.appendChild(backButton);
        buttonContainer.appendChild(completeButton);
        
        // Assemble the UI
        this.assessmentContainer.appendChild(header);
        this.assessmentContainer.appendChild(formContainer);
        this.assessmentContainer.appendChild(completionSection);
        this.assessmentContainer.appendChild(buttonContainer);
        
        // Focus first textarea
        const firstTextarea = this.assessmentContainer.querySelector('textarea');
        if (firstTextarea) firstTextarea.focus();
        
        // Announce for screen readers
        this.announce('Reflection screen. Please reflect on your top values by answering the prompts for each value.', 'polite');
    }
    
    /**
     * Export values assessment as PDF document with accessibility support
     * Uses the AssessmentExporter module for PDF generation if available
     * Falls back to browser print dialog if necessary
     */
    exportValuesAsPDF() {
        // Check dependencies before starting export process
        const dependencies = this.checkDependencies();
        
        // Create modal to show export progress with accessibility features
        const exportModal = document.createElement('div');
        exportModal.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50';
        exportModal.setAttribute('role', 'dialog');
        exportModal.setAttribute('aria-modal', 'true');
        exportModal.setAttribute('aria-labelledby', 'export-progress-title');
        
        // Create modal content using DOM API
        const exportModalContent = document.createElement('div');
        exportModalContent.className = 'bg-white p-6 rounded-lg shadow-xl max-w-md w-full';
        
        // Create title
        const exportTitle = document.createElement('h2');
        exportTitle.id = 'export-progress-title';
        exportTitle.className = 'text-xl font-bold mb-4';
        exportTitle.textContent = 'Exporting Values Assessment';
        
        // Create progress container
        const exportProgressContainer = document.createElement('div');
        exportProgressContainer.className = 'mb-4';
        
        // Create progress message
        const exportProgressMessage = document.createElement('p');
        exportProgressMessage.id = 'export-progress-message';
        exportProgressMessage.className = 'mb-2';
        exportProgressMessage.textContent = 'Preparing your values assessment PDF...';
        exportProgressMessage.setAttribute('aria-live', 'polite');
        
        // Create progress bar (outer container)
        const exportProgressBarOuter = document.createElement('div');
        exportProgressBarOuter.className = 'w-full bg-gray-200 rounded-full h-2.5';
        exportProgressBarOuter.setAttribute('role', 'progressbar');
        exportProgressBarOuter.setAttribute('aria-valuemin', '0');
        exportProgressBarOuter.setAttribute('aria-valuemax', '100');
        exportProgressBarOuter.setAttribute('aria-valuenow', '0');
        exportProgressBarOuter.setAttribute('aria-labelledby', 'export-progress-message');
        
        // Create progress bar (inner fill)
        const exportProgressBar = document.createElement('div');
        exportProgressBar.id = 'export-progress-bar';
        exportProgressBar.className = 'bg-blue-600 h-2.5 rounded-full';
        exportProgressBar.style.width = '0%';
        
        // Assemble progress bar components
        exportProgressBarOuter.appendChild(exportProgressBar);
        exportProgressContainer.appendChild(exportProgressMessage);
        exportProgressContainer.appendChild(exportProgressBarOuter);
        
        // Function to update progress
        const updateExportProgress = (percent, message) => {
            // Update visual progress bar
            exportProgressBar.style.width = `${percent}%`;
            exportProgressBarOuter.setAttribute('aria-valuenow', percent.toString());
            
            // Update message if provided
            if (message) {
                exportProgressMessage.textContent = message;
                
                // Announce progress update to screen readers
                this.announce(message, 'polite');
            }
        };
        
        // Create button container
        const exportButtonContainer = document.createElement('div');
        exportButtonContainer.className = 'text-right';
        exportButtonContainer.setAttribute('role', 'region');
        exportButtonContainer.setAttribute('aria-label', 'Export actions');
        
        // Create cancel button
        const exportCancelButton = document.createElement('button');
        exportCancelButton.id = 'export-cancel';
        exportCancelButton.className = 'px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500';
        exportCancelButton.setAttribute('aria-label', 'Cancel export process');
        exportCancelButton.textContent = 'Cancel';
        
        // Function to clean up modal and associated resources
        const cleanupExportModal = () => {
            // Remove modal if it exists in DOM
            if (document.body.contains(exportModal)) {
                document.body.removeChild(exportModal);
            }
            
            // Release keyboard trap if AccessibilityHelpers is available
            if (window.AccessibilityHelpers && window.AccessibilityHelpers.releaseFocus) {
                window.AccessibilityHelpers.releaseFocus();
            }
            
            // Clean up event listeners
            if (exportCancelButton) {
                exportCancelButton.removeEventListener('click', handleCancelExport);
            }
        };
        
        // Add click handler for cancel button
        const handleCancelExport = () => {
            // Announce cancellation
            this.announce('PDF export cancelled', 'polite');
            
            // Clean up modal and resources
            cleanupExportModal();
        };
        
        // Add click event listener
        exportCancelButton.addEventListener('click', handleCancelExport);
        exportButtonContainer.appendChild(exportCancelButton);
        
        // Assemble modal structure
        exportModalContent.appendChild(exportTitle);
        exportModalContent.appendChild(exportProgressContainer);
        exportModalContent.appendChild(exportButtonContainer);
        exportModal.appendChild(exportModalContent);
        document.body.appendChild(exportModal);
        
        // Set up keyboard trap for the modal for accessibility
        if (window.AccessibilityHelpers && window.AccessibilityHelpers.trapFocus) {
            window.AccessibilityHelpers.trapFocus(exportModal);
        }
        
        // Focus the cancel button after a short delay to ensure modal is rendered
        setTimeout(() => exportCancelButton.focus(), 100);
        
        // Handle ESC key to cancel export
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                handleCancelExport();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);
        
        // Announce for screen readers
        this.announce('Export modal opened. Preparing to export your values assessment.', 'assertive');
        
        // Start progress at 5%
        updateExportProgress(5, 'Initializing export process...');
        
        // Begin actual export process
        this.#performExport({
            updateExportProgress,
            cleanupExportModal,
            handleCancelExport
        });
    }
    
    /**
     * Private method to perform the actual PDF export using available methods
     * @param {Object} options - Configuration options for the export process
     * @param {Function} options.updateExportProgress - Function to update progress display
     * @param {Function} options.cleanupExportModal - Function to clean up the modal
     * @param {Function} options.handleCancelExport - Function to handle export cancellation
     */
    #performExport(options) {
        const { updateExportProgress, cleanupExportModal } = options;
        
        // Extract selected values and reflection content
        const selectedValues = this.selectedValues || [];
        const reflectionText = document.getElementById('values-reflection')
            ? document.getElementById('values-reflection').value || ''
            : '';
        
        // Verify we have values to export
        if (!selectedValues || selectedValues.length === 0) {
            this.announce('No values selected to export. Export cancelled.', 'assertive');
            cleanupExportModal();
            return;
        }
        
        // Update progress
        updateExportProgress(10, 'Preparing export data...');
        
        // Check if we have the AssessmentExporter module
        if (window.AssessmentExporter && typeof window.AssessmentExporter.exportToPdf === 'function') {
            // Prepare export data
            const exportData = {
                title: 'My Values Assessment',
                date: new Date().toLocaleDateString(),
                values: selectedValues,
                reflection: reflectionText,
                userName: this.userName || 'User'
            };
            
            updateExportProgress(20, 'Generating accessible PDF...');
            
            // Use AssessmentExporter module for PDF generation
            window.AssessmentExporter.exportToPdf(exportData, {
                onProgress: (percent) => {
                    // Scale progress between 20% and 90%
                    const scaledPercent = 20 + (percent * 0.7);
                    updateExportProgress(
                        Math.round(scaledPercent), 
                        percent < 50 
                            ? 'Creating accessible document structure...' 
                            : 'Finalizing PDF export...'
                    );
                },
                onSuccess: (pdfUrl) => {
                    // Update progress to 100%
                    updateExportProgress(100, 'PDF export complete!');
                    
                    // Create success message and download link
                    const successMsg = document.createElement('div');
                    successMsg.className = 'text-green-600 font-bold mt-4';
                    successMsg.textContent = 'Export completed successfully!';
                    
                    // Add download link if a URL was provided
                    if (pdfUrl) {
                        const downloadLink = document.createElement('a');
                        downloadLink.href = pdfUrl;
                        downloadLink.download = 'values-assessment.pdf';
                        downloadLink.className = 'block mt-2 text-blue-600 underline focus:outline-none focus:ring-2 focus:ring-blue-500';
                        downloadLink.textContent = 'Download PDF';
                        downloadLink.setAttribute('role', 'button');
                        downloadLink.setAttribute('aria-label', 'Download your values assessment PDF');
                        
                        successMsg.appendChild(document.createElement('br'));
                        successMsg.appendChild(downloadLink);
                        
                        // Move focus to download link
                        setTimeout(() => downloadLink.focus(), 100);
                    }
                    
                    // Find modal content for appending
                    const modalContent = document.getElementById('export-modal-content');
                    if (modalContent) {
                        modalContent.appendChild(successMsg);
                    }
                    
                    // Announce success to screen readers
                    this.announce('PDF export complete. Use the download link to save your PDF.', 'assertive');
                    
                    // Auto cleanup after a delay to allow user to download
                    setTimeout(() => {
                        cleanupExportModal();
                    }, 8000);
                },
                onError: (error) => {
                    console.error('PDF export error:', error);
                    updateExportProgress(100, 'Export failed. Trying fallback method...');
                    
                    // Try fallback after a slight delay to let the user see the message
                    setTimeout(() => {
                        this.#handleExportFallback({
                            selectedValues,
                            reflectionText,
                            cleanupExportModal
                        });
                    }, 1500);
                }
            });
        } else {
            // No AssessmentExporter available, try direct fallback
            updateExportProgress(15, 'Primary export module not available. Using fallback method...');
            
            setTimeout(() => {
                this.#handleExportFallback({
                    selectedValues,
                    reflectionText,
                    cleanupExportModal
                });
            }, 1000);
        }
    }
    
    /**
     * Private method to handle fallback export using browser print dialog
     * @param {Object} options - Options for the fallback export
     * @param {Array} options.selectedValues - Array of selected values
     * @param {string} options.reflectionText - User's reflection text
     * @param {Function} options.cleanupExportModal - Function to clean up the export modal
     */
    #handleExportFallback(options) {
        const { selectedValues, reflectionText, cleanupExportModal } = options;
        
        // Create a hidden div to hold printable content
        const printContainer = document.createElement('div');
        printContainer.id = 'values-print-container';
        printContainer.setAttribute('aria-hidden', 'true'); // Hide from screen readers until print
        printContainer.style.position = 'absolute';
        printContainer.style.width = '8.5in';
        printContainer.style.visibility = 'hidden';
        
        // Create print content with accessible structure
        const printContent = document.createElement('div');
        printContent.className = 'p-8 font-sans';
        
        // Create header
        const header = document.createElement('header');
        header.setAttribute('role', 'banner');
        
        const title = document.createElement('h1');
        title.className = 'text-3xl font-bold mb-4 text-center';
        title.textContent = 'My Values Assessment';
        
        const date = document.createElement('p');
        date.className = 'text-right text-gray-600 mb-8';
        date.textContent = `Generated on ${new Date().toLocaleDateString()}`;
        
        header.appendChild(title);
        header.appendChild(date);
        
        // Create main content area
        const main = document.createElement('main');
        main.setAttribute('role', 'main');
        
        // Add values section
        const valuesSection = document.createElement('section');
        valuesSection.setAttribute('role', 'region');
        valuesSection.setAttribute('aria-labelledby', 'values-heading');
        
        const valuesHeading = document.createElement('h2');
        valuesHeading.id = 'values-heading';
        valuesHeading.className = 'text-2xl font-bold mb-4';
        valuesHeading.textContent = 'My Top Values';
        
        const valuesList = document.createElement('ol');
        valuesList.className = 'list-decimal pl-8 mb-8';
        valuesList.setAttribute('role', 'list');
        
        // Add each value with description if available
        selectedValues.forEach(value => {
            const valueItem = document.createElement('li');
            valueItem.className = 'mb-4';
            valueItem.setAttribute('role', 'listitem');
            
            const valueName = document.createElement('div');
            valueName.className = 'font-bold text-xl mb-1';
            valueName.textContent = value;
            
            valueItem.appendChild(valueName);
            
            // Add description if available from window.valuesData
            if (window.valuesData && window.valuesData[value] && window.valuesData[value].description) {
                const valueDesc = document.createElement('p');
                valueDesc.className = 'text-gray-700';
                valueDesc.textContent = window.valuesData[value].description;
                valueItem.appendChild(valueDesc);
            }
            
            valuesList.appendChild(valueItem);
        });
        
        valuesSection.appendChild(valuesHeading);
        valuesSection.appendChild(valuesList);
        
        // Add reflection section if there is reflection text
        if (reflectionText && reflectionText.trim()) {
            const reflectionSection = document.createElement('section');
            reflectionSection.setAttribute('role', 'region');
            reflectionSection.setAttribute('aria-labelledby', 'reflection-heading');
            
            const reflectionHeading = document.createElement('h2');
            reflectionHeading.id = 'reflection-heading';
            reflectionHeading.className = 'text-2xl font-bold mb-4';
            reflectionHeading.textContent = 'My Reflection';
            
            const reflectionParagraph = document.createElement('p');
            reflectionParagraph.className = 'mb-8 whitespace-pre-line';
            reflectionParagraph.textContent = reflectionText;
            
            reflectionSection.appendChild(reflectionHeading);
            reflectionSection.appendChild(reflectionParagraph);
            
            main.appendChild(reflectionSection);
        }
        
        // Add how to use section
        const howToUseSection = document.createElement('section');
        howToUseSection.setAttribute('role', 'complementary');
        
        const howToUseHeading = document.createElement('h2');
        howToUseHeading.className = 'text-2xl font-bold mb-4';
        howToUseHeading.textContent = 'How to Use This Assessment';
        
        const howToUseText = document.createElement('p');
        howToUseText.className = 'mb-4';
        howToUseText.textContent = 'Your values assessment represents your core principles and beliefs that guide your decisions and actions. Use this assessment to help align your daily choices with what matters most to you.';
        
        howToUseSection.appendChild(howToUseHeading);
        howToUseSection.appendChild(howToUseText);
        
        // Assemble all sections
        main.appendChild(valuesSection);
        main.appendChild(howToUseSection);
        
        // Add footer
        const footer = document.createElement('footer');
        footer.setAttribute('role', 'contentinfo');
        footer.className = 'mt-8 pt-4 border-t border-gray-300 text-center text-gray-600';
        footer.textContent = '© ValueAlign - Generated via Values Assessment Tool';
        
        // Assemble print document
        printContent.appendChild(header);
        printContent.appendChild(main);
        printContent.appendChild(footer);
        printContainer.appendChild(printContent);
        
        // Add to document body
        document.body.appendChild(printContainer);
        
        // Add print-specific styles
        const printStyle = document.createElement('style');
        printStyle.textContent = `
            @media print {
                body * {
                    visibility: hidden;
                }
                #values-print-container, #values-print-container * {
                    visibility: visible;
                }
                #values-print-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                @page {
                    size: portrait;
                    margin: 0.5in;
                }
                h1 { font-size: 24pt; }
                h2 { font-size: 18pt; }
                p, li { font-size: 12pt; line-height: 1.5; }
            }
        `;
        document.head.appendChild(printStyle);
        
        // Update modal progress if it exists
        try {
            const progressMessage = document.getElementById('export-progress-message');
            if (progressMessage) {
                progressMessage.textContent = 'Using browser print dialog...';
            }
            
            // Announce for screen readers
            this.announce('Using browser print dialog for export. Please use your browser\'s print options to save as PDF.', 'assertive');
            
            // Print the content
            window.print();
            
            // Clean up modal after a short delay to avoid visual confusion
            setTimeout(() => {
                if (cleanupExportModal) {
                    cleanupExportModal();
                }
                
                // Short delay before print dialog to ensure content is ready
                setTimeout(() => {
                    // Open print dialog
                    window.print();
                    
                    // Clean up after print dialog is closed
                    setTimeout(() => {
                        // Remove print content and styles
                        if (document.body.contains(printContainer)) {
                            document.body.removeChild(printContainer);
                        }
                        if (document.head.contains(printStyle)) {
                            document.head.removeChild(printStyle);
                        }
                    }, 1000);
                }, 500);
            }, 1500);
            
        } catch (error) {
            console.error('Error in print fallback:', error);
            // Try direct print if modal update fails
            window.print();
            
            // Clean up after delay
            setTimeout(() => {
                if (document.body.contains(printContainer)) {
                    document.body.removeChild(printContainer);
                }
                if (document.head.contains(printStyle)) {
                    document.head.removeChild(printStyle);
                }
                if (cleanupExportModal) {
                    cleanupExportModal();
                }
            }, 1000);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const valuesAssessment = new ValuesAssessment();
    valuesAssessment.init();
    
    // Make it globally accessible if needed
    window.valuesAssessment = valuesAssessment;
});
