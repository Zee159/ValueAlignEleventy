/**
 * Test stub methods for Values Assessment
 * These methods provide minimal implementations for testing purposes
 */

// Add stub methods to ValuesAssessment prototype
if (typeof ValuesAssessment !== 'undefined') {
  
  ValuesAssessment.prototype.setupTestMethods = function() {
    // Setup stub methods needed for testing
    if (!this.announce) {
      this.announce = function(message, priority = 'polite') {
        const announcer = priority === 'assertive' ? 
          this.statusAnnouncer : this.progressAnnouncer;
        
        if (announcer) {
          announcer.textContent = message;
        }
        console.log(`Announced (${priority}): ${message}`);
        return true;
      };
    }
    
    if (!this.showIntroduction) {
      this.showIntroduction = function() {
        if (!this.assessmentContainer) return;
        
        this.assessmentContainer.innerHTML = `
          <section role="region" aria-labelledby="intro-heading">
            <h2 id="intro-heading">Values Assessment</h2>
            <p>Welcome to the Values Assessment. This tool will help you identify your core values.</p>
            <button type="button" class="begin-button">Begin</button>
          </section>
        `;
        
        this.announce('Values Assessment introduction screen loaded', 'polite');
        return true;
      };
    }
    
    if (!this.showValuesSelection) {
      this.showValuesSelection = function() {
        if (!this.assessmentContainer) return;
        
        let valuesList = '';
        if (window.valuesData && Array.isArray(window.valuesData)) {
          valuesList = window.valuesData.map(value => `
            <div class="value-item" data-value-id="${value.id}">
              <input type="checkbox" id="${value.id}" name="value" value="${value.id}">
              <label for="${value.id}">${value.name}</label>
              <p class="value-description">${value.description}</p>
            </div>
          `).join('');
        }
        
        this.assessmentContainer.innerHTML = `
          <section role="region" aria-labelledby="selection-heading">
            <h2 id="selection-heading">Select Your Values</h2>
            <p>Select the values that resonate with you.</p>
            <div class="selection-counter" aria-live="polite">0 values selected</div>
            <div class="values-list">
              ${valuesList}
            </div>
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
            
            // Update counter
            const counter = this.assessmentContainer.querySelector('.selection-counter');
            if (counter) {
              counter.textContent = `${this.selectedValues.length} values selected`;
              this.announce(`${this.selectedValues.length} values selected`, 'polite');
            }
          });
        });
        
        this.announce('Values selection screen loaded', 'polite');
        return true;
      };
    }
    
    if (!this.showValuesRanking) {
      this.showValuesRanking = function() {
        if (!this.assessmentContainer) return;
        
        // Get selected values data
        const selectedValueData = [];
        if (window.valuesData && Array.isArray(window.valuesData) && Array.isArray(this.selectedValues)) {
          this.selectedValues.forEach(valueId => {
            const valueData = window.valuesData.find(v => v.id === valueId);
            if (valueData) {
              selectedValueData.push(valueData);
            }
          });
        }
        
        // Create ranked values list
        let rankedValuesList = '';
        selectedValueData.forEach((value, index) => {
          rankedValuesList += `
            <li role="listitem" class="ranked-value-item" data-value-id="${value.id}">
              <div class="rank">${index + 1}</div>
              <div class="value-info">
                <span class="value-name">${value.name}</span>
              </div>
              <div class="ranking-controls">
                <button type="button" class="move-up-btn" aria-label="Move ${value.name} up in priority" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button type="button" class="move-down-btn" aria-label="Move ${value.name} down in priority" ${index === selectedValueData.length - 1 ? 'disabled' : ''}>↓</button>
              </div>
            </li>
          `;
        });
        
        this.assessmentContainer.innerHTML = `
          <section role="region" aria-labelledby="ranking-heading">
            <h2 id="ranking-heading">Prioritize Your Values</h2>
            <p>Drag or use the up/down buttons to rank your values in order of importance.</p>
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
        return true;
      };
    }
    
    if (!this.showReflection) {
      this.showReflection = function() {
        if (!this.assessmentContainer) return;
        
        // Get top values data
        const topValues = [];
        if (window.valuesData && Array.isArray(window.valuesData) && Array.isArray(this.selectedValues)) {
          // Get the top 3 values or all if less than 3
          const topCount = Math.min(3, this.selectedValues.length);
          for (let i = 0; i < topCount; i++) {
            const valueId = this.selectedValues[i];
            const valueData = window.valuesData.find(v => v.id === valueId);
            if (valueData) {
              topValues.push(valueData);
            }
          }
        }
        
        // Create reflection form
        let reflectionFormItems = '';
        topValues.forEach(value => {
          const reflectionId = `reflection-${value.id}`;
          const currentReflection = this.reflections && this.reflections[value.id] ? this.reflections[value.id] : '';
          
          reflectionFormItems += `
            <div class="reflection-item">
              <h3>${value.name}</h3>
              <p>Reflect on why this value is important to you:</p>
              <div class="textarea-container">
                <label for="${reflectionId}" class="sr-only">Reflection on ${value.name}</label>
                <textarea 
                  id="${reflectionId}" 
                  name="${reflectionId}" 
                  rows="4" 
                  aria-describedby="${reflectionId}-counter"
                >${currentReflection}</textarea>
                <div id="${reflectionId}-counter" class="char-counter" aria-live="polite">
                  Characters: ${currentReflection.length}/500
                </div>
              </div>
            </div>
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
        return true;
      };
    }
    
    if (!this.exportValuesAsPDF) {
      this.exportValuesAsPDF = function() {
        if (!this.assessmentContainer) return;
        
        // Create export modal
        const modalId = 'export-modal';
        const titleId = 'export-modal-title';
        const modal = document.createElement('div');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', titleId);
        modal.classList.add('export-modal');
        modal.id = modalId;
        
        modal.innerHTML = `
          <div class="modal-content">
            <h2 id="${titleId}">Export Values Assessment</h2>
            <div class="export-progress">
              <div class="progress-message" aria-live="polite">Preparing your PDF...</div>
              <div class="progress-bar-container">
                <div 
                  role="progressbar" 
                  class="progress-bar" 
                  aria-valuemin="0" 
                  aria-valuemax="100" 
                  aria-valuenow="0"
                  style="width: 0%"
                ></div>
              </div>
            </div>
            <div class="modal-buttons">
              <button type="button" class="cancel-button" aria-label="Cancel export">Cancel</button>
            </div>
          </div>
        `;
        
        // Add to DOM
        document.body.appendChild(modal);
        
        // Trap focus if helper available
        if (window.AccessibilityHelpers && window.AccessibilityHelpers.trapFocus) {
          window.AccessibilityHelpers.trapFocus(modal);
        }
        
        // Setup cancellation
        const cancelButton = modal.querySelector('.cancel-button');
        if (cancelButton) {
          cancelButton.addEventListener('click', () => {
            // Release focus if helper available
            if (window.AccessibilityHelpers && window.AccessibilityHelpers.releaseFocus) {
              window.AccessibilityHelpers.releaseFocus();
            }
            
            // Remove modal
            document.body.removeChild(modal);
          });
        }
        
        // Announce export
        this.announce('Exporting values assessment to PDF', 'assertive');
        
        // Simulate progress for testing
        let progress = 0;
        const progressBar = modal.querySelector('.progress-bar');
        const progressMessage = modal.querySelector('.progress-message');
        
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
            
            // Simulate download
            setTimeout(() => {
              // Release focus if helper available
              if (window.AccessibilityHelpers && window.AccessibilityHelpers.releaseFocus) {
                window.AccessibilityHelpers.releaseFocus();
              }
              
              // Remove modal
              if (document.body.contains(modal)) {
                document.body.removeChild(modal);
              }
            }, 1000);
          }
        }, 300);
        
        return true;
      };
    }
  };
}
