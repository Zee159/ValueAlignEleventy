/**
 * ValueAlign Today's Reflection Page
 * Core functionality for the reflection manager
 */

class ReflectionManager {
    constructor() {
        // DOM References
        this.reflectionForm = document.getElementById('reflection-form');
        this.reflectionText = document.getElementById('reflection-text');
        this.alignmentScore = document.getElementById('alignment-score');
        this.scoreValue = document.getElementById('score-value');
        this.charCount = document.getElementById('char-count');
        this.submitButton = document.getElementById('submit-reflection');
        this.dailyPrompt = document.getElementById('daily-prompt');
        this.valuesGrid = document.getElementById('values-grid');
        this.valuesError = document.getElementById('values-error');
        this.statusAnnouncer = document.getElementById('reflection-status-announcer');
        this.pastReflectionsList = document.getElementById('past-reflections-list');
        this.noReflectionsMessage = document.getElementById('no-reflections-message');
        this.reflectionFilter = document.getElementById('reflection-filter');
        this.currentStreakEl = document.getElementById('current-streak');
        this.longestStreakEl = document.getElementById('longest-streak');
        this.streakCalendarEl = document.getElementById('streak-calendar');
        
        // State management
        this.maxCharCount = 500;
        this.currentReflection = null;
        this.reflectionSaved = false;
        this.todaysDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        this.reflections = [];
        this.displayedReflections = [];
        
        // Core values list
        this.coreValues = [
            'Honesty', 'Compassion', 'Growth', 'Balance', 'Connection',
            'Courage', 'Creativity', 'Gratitude', 'Respect', 'Responsibility'
        ];
        
        // Initialize
        this.loadReflections();
        this.setupEventListeners();
        this.loadUserValues();
        this.initializeReflectionStatus();
        this.updateStreakDisplay();
        this.loadPastReflections();
    }
    
    /**
     * Set up all necessary event listeners
     */
    setupEventListeners() {
        // Character count for reflection text
        if (this.reflectionText) {
            this.reflectionText.addEventListener('input', () => {
                const currentLength = this.reflectionText.value.length;
                this.charCount.textContent = `${currentLength}/${this.maxCharCount}`;
                
                // Visual feedback if approaching limit
                if (currentLength > this.maxCharCount * 0.9) {
                    this.charCount.classList.add('text-amber-600');
                    this.charCount.classList.remove('text-gray-500', 'text-red-600');
                } else if (currentLength > this.maxCharCount) {
                    this.charCount.classList.add('text-red-600');
                    this.charCount.classList.remove('text-gray-500', 'text-amber-600');
                } else {
                    this.charCount.classList.add('text-gray-500');
                    this.charCount.classList.remove('text-amber-600', 'text-red-600');
                }
            });
        }
        
        // Alignment score slider
        if (this.alignmentScore) {
            this.alignmentScore.addEventListener('input', () => {
                this.scoreValue.textContent = this.alignmentScore.value;
            });
        }
        
        // Form submission
        if (this.reflectionForm) {
            this.reflectionForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.saveReflection();
            });
        }
    }
    
    /**
     * Load user's personal values and create checkboxes
     */
    loadUserValues() {
        if (!this.valuesGrid) return;
        
        // Clear existing content
        this.valuesGrid.innerHTML = '';
        
        // Create a checkbox for each value
        this.coreValues.forEach(value => {
            const valueId = value.toLowerCase().replace(/\s+/g, '-');
            
            const valueContainer = document.createElement('div');
            valueContainer.className = 'value-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `value-${valueId}`;
            checkbox.name = 'values';
            checkbox.value = value;
            checkbox.className = 'hidden';
            
            const label = document.createElement('label');
            label.htmlFor = `value-${valueId}`;
            label.className = 'flex items-center p-2 border border-gray-300 dark:border-gray-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
            label.setAttribute('role', 'checkbox');
            label.setAttribute('aria-checked', 'false');
            label.setAttribute('tabindex', '0');
            
            const checkIcon = document.createElement('span');
            checkIcon.className = 'check-icon mr-2 hidden';
            checkIcon.innerHTML = '<svg class="w-4 h-4 text-va-primary dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
            
            const valueText = document.createElement('span');
            valueText.textContent = value;
            
            label.appendChild(checkIcon);
            label.appendChild(valueText);
            valueContainer.appendChild(checkbox);
            valueContainer.appendChild(label);
            this.valuesGrid.appendChild(valueContainer);
            
            // Add click and keyboard handling for accessibility
            label.addEventListener('click', () => {
                checkbox.checked = !checkbox.checked;
                label.setAttribute('aria-checked', checkbox.checked ? 'true' : 'false');
                checkIcon.classList.toggle('hidden', !checkbox.checked);
                label.classList.toggle('bg-va-primary-light', checkbox.checked);
                label.classList.toggle('text-va-primary', checkbox.checked);
                
                // Hide error when at least one value is selected
                if (checkbox.checked) {
                    this.valuesError.classList.add('hidden');
                }
            });
            
            // Keyboard accessibility
            label.addEventListener('keydown', (event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault();
                    label.click();
                }
            });
        });
    }
    
    /**
     * Load all saved reflections
     */
    loadReflections() {
        try {
            this.reflections = JSON.parse(localStorage.getItem('valueAlignReflections')) || [];
        } catch (error) {
            console.error('Error loading reflections:', error);
            this.reflections = [];
        }
    }
    
    /**
     * Initialize reflection status based on whether user has already reflected today
     */
    initializeReflectionStatus() {
        const statusContainer = document.getElementById('reflection-status');
        if (!statusContainer) return;
        
        // Check if user has already reflected today (from localStorage for demo)
        const todaysReflection = this.getTodaysReflection();
        
        if (todaysReflection) {
            // User has already reflected today
            this.reflectionSaved = true;
            this.currentReflection = todaysReflection;
            
            statusContainer.innerHTML = `
                <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm text-green-700 dark:text-green-300">
                            You've already completed your reflection for today. You can edit it below.
                        </p>
                    </div>
                </div>
            `;
            
            // Pre-fill form with today's reflection
            this.populateForm(todaysReflection);
            
            // Change button text to "Update Reflection"
            if (this.submitButton) {
                this.submitButton.textContent = 'Update Reflection';
            }
            
            // Announce for screen readers
            this.announce('Your reflection for today has been loaded. You can review or edit it.');
        } else {
            // User has not reflected today
            statusContainer.innerHTML = `
                <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                    <div class="flex items-center">
                        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm text-blue-700 dark:text-blue-300">
                            You haven't reflected yet today. Take a moment to record your thoughts.
                        </p>
                    </div>
                </div>
            `;
            
            // Generate today's prompt
            this.setDailyPrompt();
        }
    }
    
    /**
     * Get today's reflection from storage
     * @returns {Object|null} Today's reflection or null if not found
     */
    getTodaysReflection() {
        return this.reflections.find(r => r.date === this.todaysDate) || null;
    }
    
    /**
     * Populate form with reflection data
     * @param {Object} reflection - Reflection data
     */
    populateForm(reflection) {
        if (!reflection || !this.reflectionForm) return;
        
        // Set reflection text
        if (this.reflectionText) {
            this.reflectionText.value = reflection.text || '';
            // Trigger input event to update character count
            const event = new Event('input', { bubbles: true });
            this.reflectionText.dispatchEvent(event);
        }
        
        // Set alignment score
        if (this.alignmentScore && this.scoreValue) {
            this.alignmentScore.value = reflection.alignmentScore || 5;
            this.scoreValue.textContent = reflection.alignmentScore || 5;
        }
        
        // Check values checkboxes
        if (reflection.values && reflection.values.length > 0) {
            reflection.values.forEach(value => {
                const valueId = value.toLowerCase().replace(/\s+/g, '-');
                const checkbox = document.getElementById(`value-${valueId}`);
                if (checkbox) {
                    checkbox.checked = true;
                    
                    // Update label styling
                    const label = document.querySelector(`label[for="value-${valueId}"]`);
                    if (label) {
                        label.setAttribute('aria-checked', 'true');
                        label.classList.add('bg-va-primary-light', 'text-va-primary');
                        
                        // Show check icon
                        const checkIcon = label.querySelector('.check-icon');
                        if (checkIcon) {
                            checkIcon.classList.remove('hidden');
                        }
                    }
                }
            });
        }
    }
    
    /**
     * Save current reflection to storage
     */
    saveReflection() {
        if (!this.reflectionForm || !this.reflectionText) return;
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Get selected values
        const selectedValues = Array.from(
            document.querySelectorAll('input[name="values"]:checked')
        ).map(checkbox => checkbox.value);
        
        // Create reflection object
        const reflection = {
            id: this.currentReflection ? this.currentReflection.id : Date.now().toString(),
            date: this.todaysDate,
            text: this.reflectionText.value.trim(),
            alignmentScore: parseInt(this.alignmentScore.value, 10),
            values: selectedValues,
            prompt: this.dailyPrompt ? this.dailyPrompt.textContent : '',
            timestamp: new Date().toISOString()
        };
        
        try {
            // Update or add reflection
            const existingIndex = this.reflections.findIndex(r => r.date === this.todaysDate);
            
            if (existingIndex >= 0) {
                // Update existing reflection
                this.reflections[existingIndex] = reflection;
            } else {
                // Add new reflection
                this.reflections.push(reflection);
            }
            
            // Sort reflections by date (newest first)
            this.reflections.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Save to localStorage
            localStorage.setItem('valueAlignReflections', JSON.stringify(this.reflections));
            
            // Update UI
            this.showSaveSuccess();
            this.currentReflection = reflection;
            this.reflectionSaved = true;
            
            // Update past reflections and streak
            this.loadPastReflections();
            this.updateStreakDisplay();
            
        } catch (error) {
            console.error('Error saving reflection:', error);
            this.showSaveError();
        }
    }
    
    /**
     * Validate reflection form
     * @returns {boolean} True if form is valid
     */
    validateForm() {
        let isValid = true;
        
        // Check reflection text
        if (!this.reflectionText.value.trim()) {
            this.reflectionText.classList.add('border-red-500');
            isValid = false;
            this.reflectionText.setAttribute('aria-invalid', 'true');
            this.announce('Please enter your reflection text');
        } else {
            this.reflectionText.classList.remove('border-red-500');
            this.reflectionText.setAttribute('aria-invalid', 'false');
        }
        
        // Check values
        const selectedValues = document.querySelectorAll('input[name="values"]:checked');
        if (selectedValues.length === 0) {
            this.valuesError.classList.remove('hidden');
            isValid = false;
            this.announce('Please select at least one value');
        } else {
            this.valuesError.classList.add('hidden');
        }
        
        return isValid;
    }
    
    /**
     * Set today's reflection prompt
     */
    setDailyPrompt() {
        if (!this.dailyPrompt) return;
        
        // Prompts rotate based on day of year
        const dayOfYear = this.getDayOfYear(new Date());
        const prompts = [
            "How did your actions today align with your values?",
            "What value did you find most challenging to honor today?",
            "Which of your core values brought you the most joy today?",
            "Was there a moment today when your values guided a decision?",
            "How might you better express your values tomorrow?",
            "Did you notice any conflict between your values today?",
            "What value would you like to focus on strengthening tomorrow?"
        ];
        
        const promptIndex = dayOfYear % prompts.length;
        this.dailyPrompt.textContent = prompts[promptIndex];
    }
    
    /**
     * Helper method to get day of year (0-365)
     * @param {Date} date - Date to get day of year for
     * @returns {number} Day of year
     */
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }
    
    /**
     * Show save success message
     */
    showSaveSuccess() {
        const statusContainer = document.getElementById('reflection-status');
        if (!statusContainer) return;
        
        statusContainer.innerHTML = `
            <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-sm text-green-700 dark:text-green-300">
                        Your reflection has been saved successfully.
                    </p>
                </div>
            </div>
        `;
        
        // Update button text
        if (this.submitButton) {
            this.submitButton.textContent = 'Update Reflection';
        }
        
        // Announce for screen readers
        this.announce('Your reflection has been saved successfully.');
    }
    
    /**
     * Show save error message
     */
    showSaveError() {
        const statusContainer = document.getElementById('reflection-status');
        if (!statusContainer) return;
        
        statusContainer.innerHTML = `
            <div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-sm text-red-700 dark:text-red-300">
                        There was an error saving your reflection. Please try again.
                    </p>
                </div>
            </div>
        `;
        
        // Announce for screen readers
        this.announce('Error saving your reflection. Please try again.');
    }
    
    /**
     * Update streak display with current and longest streak
     */
    updateStreakDisplay() {
        if (!this.currentStreakEl || !this.longestStreakEl || !this.streakCalendarEl) return;
        
        // Calculate streaks
        const streakData = this.calculateStreaks();
        
        // Display current streak
        this.currentStreakEl.textContent = `${streakData.currentStreak} day${streakData.currentStreak !== 1 ? 's' : ''}`;
        
        // Display longest streak
        this.longestStreakEl.textContent = `${streakData.longestStreak} day${streakData.longestStreak !== 1 ? 's' : ''}`;
        
        // Generate calendar visualization
        this.generateStreakCalendar(streakData.recentDays);
    }
    
    /**
     * Calculate current and longest reflection streaks
     * @returns {Object} Streak data
     */
    calculateStreaks() {
        // Sort reflections by date (oldest first for streak calculation)
        const sortedReflections = [...this.reflections].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        // Get dates as strings in YYYY-MM-DD format
        const reflectionDates = sortedReflections.map(r => r.date);
        
        // Recent 28 days for calendar
        const recentDays = [];
        const today = new Date();
        
        for (let i = 27; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            recentDays.push({
                date: dateStr,
                hasReflection: reflectionDates.includes(dateStr)
            });
        }
        
        // Calculate streaks
        if (reflectionDates.length === 0) {
            return { currentStreak: 0, longestStreak: 0, recentDays };
        }
        
        // Check for current streak (consecutive days including today)
        const todayDate = today.toISOString().split('T')[0];
        const yesterdayDate = new Date(today);
        yesterdayDate.setDate(today.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
        
        // If reflected today, start streak count at 1
        if (reflectionDates.includes(todayDate)) {
            currentStreak = 1;
            
            // Count backwards from yesterday
            let checkDate = yesterdayDate;
            while (true) {
                const checkDateStr = checkDate.toISOString().split('T')[0];
                
                if (reflectionDates.includes(checkDateStr)) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        } else if (reflectionDates.includes(yesterdayStr)) {
            // If reflected yesterday but not today, check for streak
            currentStreak = 1;
            
            // Count backwards from 2 days ago
            let checkDate = new Date(yesterdayDate);
            checkDate.setDate(checkDate.getDate() - 1);
            
            while (true) {
                const checkDateStr = checkDate.toISOString().split('T')[0];
                
                if (reflectionDates.includes(checkDateStr)) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        } else {
            // No current streak
            currentStreak = 0;
        }
        
        // Calculate longest streak
        tempStreak = 1;
        longestStreak = 1;
        
        for (let i = 1; i < reflectionDates.length; i++) {
            const currentDate = new Date(reflectionDates[i]);
            const prevDate = new Date(reflectionDates[i - 1]);
            
            // Check if dates are consecutive
            const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else if (diffDays > 1) {
                // Break in streak
                tempStreak = 1;
            }
        }
        
        return {
            currentStreak,
            longestStreak,
            recentDays
        };
    }
    
    /**
     * Generate streak calendar visualization
     * @param {Array} recentDays - Recent days with reflection status
     */
    generateStreakCalendar(recentDays) {
        if (!this.streakCalendarEl) return;
        
        // Get calendar container
        const calendarGrid = this.streakCalendarEl.querySelector('.grid');
        if (!calendarGrid) return;
        
        // Keep day headers but remove previous calendar cells
        const dayHeaders = Array.from(calendarGrid.children).slice(0, 7);
        calendarGrid.innerHTML = '';
        
        // Re-add day headers
        dayHeaders.forEach(header => {
            calendarGrid.appendChild(header);
        });
        
        // Generate calendar cells
        recentDays.forEach(day => {
            const cell = document.createElement('div');
            const date = new Date(day.date);
            const isToday = day.date === this.todaysDate;
            
            cell.className = `h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs ${isToday ? 'border-2 border-va-secondary' : ''} ${
                day.hasReflection ? 
                'bg-va-primary text-white dark:bg-green-700' : 
                'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
            }`;
            cell.textContent = date.getDate();
            cell.setAttribute('aria-label', `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.hasReflection ? 'Reflection completed' : 'No reflection'}`); 
            
            calendarGrid.appendChild(cell);
        });
    }
    
    /**
     * Load and display past reflections
     */
    loadPastReflections() {
        if (!this.pastReflectionsList || !this.noReflectionsMessage) return;
        
        // Apply filter if available
        let filteredReflections = [...this.reflections];
        
        if (this.reflectionFilter) {
            const filterValue = this.reflectionFilter.value;
            
            switch (filterValue) {
                case 'recent':
                    // Already sorted by date (newest first)
                    break;
                case 'highest':
                    filteredReflections.sort((a, b) => b.alignmentScore - a.alignmentScore);
                    break;
                case 'lowest':
                    filteredReflections.sort((a, b) => a.alignmentScore - b.alignmentScore);
                    break;
            }
            
            // Add event listener for filter changes, if not already added
            if (!this.reflectionFilter.dataset.initialized) {
                this.reflectionFilter.addEventListener('change', () => this.loadPastReflections());
                this.reflectionFilter.dataset.initialized = 'true';
            }
        }
        
        // Store the displayed reflections
        this.displayedReflections = filteredReflections.slice(0, 5); // Show only the first 5
        
        // Clear previous content
        this.pastReflectionsList.innerHTML = '';
        
        // Show/hide empty state
        if (filteredReflections.length === 0) {
            this.noReflectionsMessage.classList.remove('hidden');
            this.announce('No past reflections found.');
            return;
        } else {
            this.noReflectionsMessage.classList.add('hidden');
        }
        
        // Create reflection items
        this.displayedReflections.forEach((reflection, index) => {
            const reflectionDate = new Date(reflection.date);
            const formattedDate = reflectionDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            
            const article = document.createElement('article');
            article.className = 'reflection-item border-b border-gray-200 dark:border-gray-700 pb-5 mb-5 last:border-b-0 last:pb-0 last:mb-0';
            article.setAttribute('role', 'listitem');
            
            const scoreColorClass = reflection.alignmentScore >= 7 ? 'text-green-600 dark:text-green-400' :
                                      reflection.alignmentScore >= 4 ? 'text-amber-600 dark:text-amber-400' :
                                      'text-red-600 dark:text-red-400';
            
            article.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-lg font-medium text-va-text dark:text-white">${formattedDate}</h3>
                    <div class="flex items-center">
                        <svg class="w-5 h-5 ${scoreColorClass} mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path fill-rule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="font-medium">${reflection.alignmentScore}/10</span>
                    </div>
                </div>
                
                <p class="text-gray-700 dark:text-gray-300 mb-3">${reflection.text}</p>
                
                <div class="flex flex-wrap gap-2 mt-3">
                    ${reflection.values.map(value => `
                        <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-va-primary/10 dark:bg-green-900/30 text-va-primary dark:text-green-400">
                            ${value}
                        </span>
                    `).join('')}
                </div>
            `;
            
            this.pastReflectionsList.appendChild(article);
        });
        
        // Add View All button handler if not already added
        const viewAllButton = document.getElementById('view-all-reflections');
        if (viewAllButton && !viewAllButton.dataset.initialized) {
            viewAllButton.addEventListener('click', () => this.showAllReflections());
            viewAllButton.dataset.initialized = 'true';
        }
    }
    
    /**
     * Show all reflections in a modal/expanded view
     */
    showAllReflections() {
        // This would be implemented with a modal or a separate page
        // For the demo, we'll just log to console
        console.log('Show all reflections clicked - would display all', this.reflections.length, 'reflections');
        this.announce('View all reflections was clicked. This feature would show all your past reflections.');
    }
    
    /**
     * Announce message for screen readers
     * @param {string} message - Message to announce
     */
    announce(message) {
        if (this.statusAnnouncer) {
            this.statusAnnouncer.textContent = message;
        }
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Character count event listener
        if (this.reflectionText) {
            this.reflectionText.addEventListener('input', () => {
                const current = this.reflectionText.value.length;
                if (this.charCount) {
                    this.charCount.textContent = `${current}/${this.maxCharCount}`;
                    
                    // Visual feedback as user approaches limit
                    if (current > this.maxCharCount) {
                        this.charCount.classList.add('text-red-500');
                        this.reflectionText.classList.add('border-red-500');
                    } else {
                        this.charCount.classList.remove('text-red-500');
                        this.reflectionText.classList.remove('border-red-500');
                    }
                }
            });
        }
        
        // Alignment score slider event listener
        if (this.alignmentScore && this.scoreValue) {
            this.alignmentScore.addEventListener('input', () => {
                const score = this.alignmentScore.value;
                this.scoreValue.textContent = score;
                
                // Announce score change to screen readers
                this.announce(`Alignment score changed to ${score} out of 10`);
            });
            
            // Keyboard accessibility for slider
            this.alignmentScore.addEventListener('keydown', (e) => {
                let newValue = parseInt(this.alignmentScore.value, 10);
                
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    newValue = Math.min(10, newValue + 1);
                    this.alignmentScore.value = newValue;
                    this.scoreValue.textContent = newValue;
                    this.announce(`Alignment score increased to ${newValue} out of 10`);
                    e.preventDefault();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    newValue = Math.max(1, newValue - 1);
                    this.alignmentScore.value = newValue;
                    this.scoreValue.textContent = newValue;
                    this.announce(`Alignment score decreased to ${newValue} out of 10`);
                    e.preventDefault();
                }
            });
        }
        
        // Form submission listener
        if (this.reflectionForm) {
            this.reflectionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveReflection();
            });
        }
        
        // Filter listener for past reflections
        if (this.reflectionFilter) {
            this.reflectionFilter.addEventListener('change', () => {
                this.loadPastReflections();
            });
        }
    }
}

// Initialize the reflection manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const reflectionManager = new ReflectionManager();
});
