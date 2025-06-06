/**
 * ValueAlign Acts of Alignment Page
 * Core functionality for the acts manager
 */

class ActsManager {
    constructor() {
        // DOM References
        this.createActForm = document.getElementById('create-act-form');
        this.actTitle = document.getElementById('act-title');
        this.actDescription = document.getElementById('act-description');
        this.targetDate = document.getElementById('target-date');
        this.actPriority = document.getElementById('act-priority');
        this.actValuesGrid = document.getElementById('act-values-grid');
        this.valuesError = document.getElementById('values-error');
        this.actsContainer = document.getElementById('acts-container');
        this.noActsMessage = document.getElementById('no-acts-message');
        this.actsLoading = document.getElementById('acts-loading');
        this.actsFilter = document.getElementById('acts-filter');
        this.actsSort = document.getElementById('acts-sort');
        this.statusAnnouncer = document.getElementById('acts-status-announcer');
        this.createActStatus = document.getElementById('create-act-status');
        
        // Dashboard elements
        this.currentActsCount = document.getElementById('current-acts-count');
        this.completedActsCount = document.getElementById('completed-acts-count');
        this.dailyStreakCount = document.getElementById('daily-streak-count');
        this.alignmentScoreBar = document.getElementById('alignment-score-bar');
        this.alignmentScoreText = document.getElementById('alignment-score-text');
        
        // State management
        this.acts = [];
        this.displayedActs = [];
        this.todaysDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        this.editingActId = null; // ID of act being edited, null if creating new
        
        // Core values list - same as in reflection.js for consistency
        this.coreValues = [
            'Honesty', 'Compassion', 'Growth', 'Balance', 'Connection',
            'Courage', 'Creativity', 'Gratitude', 'Respect', 'Responsibility'
        ];
        
        // Initialize
        this.loadActs();
        this.setupEventListeners();
        this.loadUserValues();
        this.updateDashboard();
        this.displayActs();
    }
    
    /**
     * Load all acts from localStorage
     */
    loadActs() {
        try {
            // Show loading state
            if (this.actsLoading) this.actsLoading.classList.remove('hidden');
            if (this.noActsMessage) this.noActsMessage.classList.add('hidden');
            if (this.actsContainer) this.actsContainer.innerHTML = '';
            
            // In a real implementation, this would be an API call
            const savedActs = localStorage.getItem('valueAlignActs');
            this.acts = savedActs ? JSON.parse(savedActs) : [];
            
            // Hide loading state after brief delay (simulating API call)
            setTimeout(() => {
                if (this.actsLoading) this.actsLoading.classList.add('hidden');
            }, 300);
            
            // For demo purposes, if no acts, create sample acts
            if (this.acts.length === 0) {
                this.createSampleActs();
            }
            
            console.log(`Loaded ${this.acts.length} acts`);
        } catch (error) {
            console.error('Error loading acts:', error);
            this.acts = [];
            
            // Hide loading state
            if (this.actsLoading) this.actsLoading.classList.add('hidden');
            this.announce('Error loading acts. Please try refreshing the page.');
        }
    }
    
    /**
     * Save current acts to localStorage
     */
    saveActs() {
        try {
            // In a real implementation, this would be an API call
            localStorage.setItem('valueAlignActs', JSON.stringify(this.acts));
            console.log(`Saved ${this.acts.length} acts`);
        } catch (error) {
            console.error('Error saving acts:', error);
            this.announce('Error saving acts. Please try again.');
        }
    }
    
    /**
     * Create sample acts for demonstration
     */
    createSampleActs() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        this.acts = [
            {
                id: 'act1',
                title: 'Volunteer at community garden',
                description: 'Spend 2 hours helping plant new vegetables',
                values: ['Compassion', 'Responsibility'],
                targetDate: tomorrow.toISOString().split('T')[0],
                priority: 'medium',
                completed: false,
                createdAt: yesterday.toISOString(),
                completedAt: null
            },
            {
                id: 'act2',
                title: 'Have an honest conversation',
                description: 'Talk with Alex about our ongoing project challenges',
                values: ['Honesty', 'Courage'],
                targetDate: today.toISOString().split('T')[0],
                priority: 'high',
                completed: false,
                createdAt: yesterday.toISOString(),
                completedAt: null
            },
            {
                id: 'act3',
                title: 'Daily meditation practice',
                description: '15 minutes of mindful meditation',
                values: ['Balance', 'Growth'],
                targetDate: yesterday.toISOString().split('T')[0],
                priority: 'medium',
                completed: true,
                createdAt: yesterday.toISOString(),
                completedAt: yesterday.toISOString()
            }
        ];
        
        this.saveActs();
    }
    
    /**
     * Filter acts based on current filter selection
     * @returns {Array} Filtered acts
     */
    filterActs() {
        if (!this.actsFilter) return this.acts;
        
        const filterValue = this.actsFilter.value;
        const today = new Date().toISOString().split('T')[0];
        
        switch (filterValue) {
            case 'active':
                return this.acts.filter(act => !act.completed);
            case 'completed':
                return this.acts.filter(act => act.completed);
            case 'overdue':
                return this.acts.filter(act => !act.completed && act.targetDate < today);
            case 'all':
            default:
                return this.acts;
        }
    }
    
    /**
     * Sort acts based on current sort selection
     * @param {Array} acts - Acts to sort
     * @returns {Array} Sorted acts
     */
    sortActs(acts) {
        if (!this.actsSort || !acts.length) return acts;
        
        const sortValue = this.actsSort.value;
        const sortedActs = [...acts]; // Create copy to avoid mutation
        
        switch (sortValue) {
            case 'date-desc':
                return sortedActs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'date-asc':
                return sortedActs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'priority-desc':
                return sortedActs.sort((a, b) => {
                    const priorityValues = { low: 1, medium: 2, high: 3 };
                    return priorityValues[b.priority] - priorityValues[a.priority];
                });
            case 'priority-asc':
                return sortedActs.sort((a, b) => {
                    const priorityValues = { low: 1, medium: 2, high: 3 };
                    return priorityValues[a.priority] - priorityValues[b.priority];
                });
            default:
                return sortedActs;
        }
    }
    
    /**
     * Generate unique ID for a new act
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Set up all necessary event listeners
     */
    setupEventListeners() {
        // Form submission event
        if (this.createActForm) {
            this.createActForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAct();
            });
        }
        
        // Filter and sort change events
        if (this.actsFilter) {
            this.actsFilter.addEventListener('change', () => {
                this.displayActs();
            });
        }
        
        if (this.actsSort) {
            this.actsSort.addEventListener('change', () => {
                this.displayActs();
            });
        }
        
        // Set default target date to today
        if (this.targetDate) {
            this.targetDate.value = this.todaysDate;
        }
    }
    
    /**
     * Announce message for screen readers
     * @param {string} message - Message to announce
     */
    announce(message) {
        if (!this.statusAnnouncer) return;
        this.statusAnnouncer.textContent = message;
        
        // Clear after a few seconds to avoid re-announcements when focus returns
        setTimeout(() => {
            this.statusAnnouncer.textContent = '';
        }, 5000);
    }
    
    /**
     * Load user's personal values and create checkboxes
     */
    loadUserValues() {
        if (!this.actValuesGrid) return;
        
        // Clear previous content
        this.actValuesGrid.innerHTML = '';
        
        // Create accessible checkboxes for each core value
        this.coreValues.forEach((value, index) => {
            // Create checkbox container with proper role
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'flex items-center p-2 border rounded mb-2 value-checkbox';
            checkboxWrapper.setAttribute('role', 'checkbox');
            checkboxWrapper.setAttribute('aria-checked', 'false');
            checkboxWrapper.setAttribute('tabindex', '0');
            checkboxWrapper.setAttribute('aria-label', `Select ${value} as a related value`);
            checkboxWrapper.id = `value-checkbox-${index}`;
            
            // Create hidden actual checkbox (for form submission)
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `value-${index}`;
            checkbox.name = 'act-values[]';
            checkbox.value = value;
            checkbox.className = 'sr-only'; // Visually hidden but available to screen readers
            
            // Create visible checkbox element for custom styling
            const customCheckbox = document.createElement('div');
            customCheckbox.className = 'w-5 h-5 border-2 border-blue-500 rounded flex items-center justify-center mr-2';
            customCheckbox.innerHTML = '<svg class="w-3 h-3 text-white hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>';
            
            // Create value label
            const label = document.createElement('span');
            label.textContent = value;
            
            // Append elements to the wrapper
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(customCheckbox);
            checkboxWrapper.appendChild(label);
            
            // Add click and keyboard event handling
            checkboxWrapper.addEventListener('click', () => this.toggleValueSelection(checkboxWrapper, checkbox, customCheckbox));
            checkboxWrapper.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.toggleValueSelection(checkboxWrapper, checkbox, customCheckbox);
                }
            });
            
            // Add to the values grid
            this.actValuesGrid.appendChild(checkboxWrapper);
        });
        
        // Add error message container for accessibility
        if (!this.valuesError) {
            this.valuesError = document.createElement('div');
            this.valuesError.id = 'values-error';
            this.valuesError.className = 'text-red-500 text-sm mt-1 hidden';
            this.valuesError.setAttribute('role', 'alert');
            this.actValuesGrid.parentNode.insertBefore(this.valuesError, this.actValuesGrid.nextSibling);
        }
    }
    
    /**
     * Toggle selection of a value checkbox
     * @param {HTMLElement} wrapper - The checkbox wrapper element
     * @param {HTMLInputElement} checkbox - The actual input checkbox
     * @param {HTMLElement} customCheckbox - The custom styled checkbox
     */
    toggleValueSelection(wrapper, checkbox, customCheckbox) {
        const isChecked = wrapper.getAttribute('aria-checked') === 'true';
        const newCheckedState = !isChecked;
        
        // Update ARIA state
        wrapper.setAttribute('aria-checked', newCheckedState.toString());
        
        // Update actual checkbox
        checkbox.checked = newCheckedState;
        
        // Update visual representation
        const checkIcon = customCheckbox.querySelector('svg');
        if (newCheckedState) {
            customCheckbox.classList.add('bg-blue-500');
            checkIcon.classList.remove('hidden');
        } else {
            customCheckbox.classList.remove('bg-blue-500');
            checkIcon.classList.add('hidden');
        }
        
        // Hide any previous error message
        if (this.valuesError) {
            this.valuesError.classList.add('hidden');
            this.valuesError.textContent = '';
        }
    }
    
    /**
     * Get the currently selected values from checkboxes
     * @returns {Array} Selected values
     */
    getSelectedValues() {
        const checkboxes = document.querySelectorAll('input[name="act-values[]"]');
        const selectedValues = [];
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedValues.push(checkbox.value);
            }
        });
        
        return selectedValues;
    }
    
    /**
     * Validate that at least one value is selected
     * @returns {boolean} True if validation passes
     */
    validateValueSelection() {
        const selectedValues = this.getSelectedValues();
        
        if (selectedValues.length === 0) {
            if (this.valuesError) {
                this.valuesError.textContent = 'Please select at least one value';
                this.valuesError.classList.remove('hidden');
                this.valuesError.setAttribute('role', 'alert');
            }
            return false;
        }
        
        return true;
    }
    
    /**
     * Display filtered and sorted acts
     */
    displayActs() {
        if (!this.actsContainer) return;
        
        // Get filtered and sorted acts
        const filteredActs = this.filterActs();
        this.displayedActs = this.sortActs(filteredActs);
        
        // Clear the container
        this.actsContainer.innerHTML = '';
        
        // Update UI based on whether there are acts to display
        if (this.displayedActs.length === 0) {
            if (this.noActsMessage) this.noActsMessage.classList.remove('hidden');
            
            // Add aria live region to announce no acts
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.className = 'sr-only';
            liveRegion.textContent = 'No acts found with the current filter settings.';
            this.actsContainer.appendChild(liveRegion);
        } else {
            if (this.noActsMessage) this.noActsMessage.classList.add('hidden');
            
            // Setup acts container with proper accessibility roles
            this.actsContainer.setAttribute('role', 'list');
            this.actsContainer.setAttribute('aria-label', 'List of acts');
            
            // Loop through each act and create a card for it
            this.displayedActs.forEach((act) => {
                const actCard = this.createActCard(act);
                this.actsContainer.appendChild(actCard);
            });
            
            // Announce the number of acts for screen readers
            this.announce(`${this.displayedActs.length} acts displayed`);
        }
    }
    
    /**
     * Create a card element for an act
     * @param {Object} act - The act data
     * @returns {HTMLElement} Act card element
     */
    createActCard(act) {
        // Create card container with proper accessibility attributes
        const card = document.createElement('div');
        card.className = 'border rounded-lg p-4 mb-3 bg-white shadow-sm';
        card.setAttribute('role', 'listitem');
        card.setAttribute('aria-labelledby', `act-title-${act.id}`);
        card.id = `act-${act.id}`;
        
        // Priority indicator
        const priorityColor = this.getPriorityColor(act.priority);
        const priorityBadge = document.createElement('div');
        priorityBadge.className = `${priorityColor} text-xs font-bold py-1 px-2 rounded-full inline-block mb-2`;
        priorityBadge.textContent = act.priority.charAt(0).toUpperCase() + act.priority.slice(1);
        priorityBadge.setAttribute('aria-label', `Priority: ${act.priority}`);
        
        // Title with proper heading level for accessibility
        const title = document.createElement('h3');
        title.className = 'font-bold text-lg mb-2';
        title.textContent = act.completed ? `✓ ${act.title}` : act.title;
        title.id = `act-title-${act.id}`;
        
        // Description
        const description = document.createElement('p');
        description.className = 'text-gray-600 mb-3';
        description.textContent = act.description || 'No description provided';
        
        // Target date with accessible format
        const targetDateLabel = document.createElement('div');
        targetDateLabel.className = 'text-sm font-bold text-gray-600 mb-1';
        targetDateLabel.textContent = 'Target date:';
        
        const targetDateValue = document.createElement('div');
        const targetDate = new Date(act.targetDate);
        const formattedDate = targetDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        targetDateValue.className = 'text-sm mb-3';
        targetDateValue.textContent = formattedDate;
        targetDateValue.setAttribute('aria-label', `Target date: ${formattedDate}`);
        
        // Values pills
        const valuesContainer = document.createElement('div');
        valuesContainer.className = 'flex flex-wrap gap-2 mb-3';
        valuesContainer.setAttribute('aria-label', 'Associated values');
        
        act.values.forEach(value => {
            const valuePill = document.createElement('span');
            valuePill.className = 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded';
            valuePill.textContent = value;
            valuesContainer.appendChild(valuePill);
        });
        
        // Action buttons with proper accessibility
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'flex justify-end gap-2 mt-4';
        
        // Toggle completion button
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'py-1 px-3 text-sm font-medium rounded-md ' + 
            (act.completed ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-green-500 hover:bg-green-600 text-white');
        toggleButton.textContent = act.completed ? 'Mark Incomplete' : 'Complete';
        toggleButton.setAttribute('aria-label', act.completed ? `Mark ${act.title} as incomplete` : `Mark ${act.title} as complete`);
        toggleButton.addEventListener('click', () => this.toggleActCompletion(act.id));
        
        // Edit button
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 text-sm font-medium rounded-md';
        editButton.textContent = 'Edit';
        editButton.setAttribute('aria-label', `Edit act: ${act.title}`);
        editButton.addEventListener('click', () => this.editAct(act.id));
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'bg-red-500 hover:bg-red-600 text-white py-1 px-3 text-sm font-medium rounded-md';
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('aria-label', `Delete act: ${act.title}`);
        deleteButton.addEventListener('click', () => this.confirmDeleteAct(act.id));
        
        // Append all elements to the card
        actionsContainer.appendChild(toggleButton);
        actionsContainer.appendChild(editButton);
        actionsContainer.appendChild(deleteButton);
        
        card.appendChild(priorityBadge);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(targetDateLabel);
        card.appendChild(targetDateValue);
        card.appendChild(valuesContainer);
        card.appendChild(actionsContainer);
        
        // If the act is completed, add completed styling
        if (act.completed) {
            card.classList.add('opacity-75');
            description.classList.add('line-through');
        }
        
        return card;
    }
    
    /**
     * Get color class for priority level
     * @param {string} priority - Priority level (low, medium, high)
     * @returns {string} Tailwind CSS color class
     */
    getPriorityColor(priority) {
        switch (priority) {
            case 'low':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'high':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
    
    /**
     * Toggle completion status of an act
     * @param {string} actId - ID of the act to toggle
     */
    toggleActCompletion(actId) {
        const act = this.acts.find(a => a.id === actId);
        if (!act) {
            console.error('Act not found for toggling');
            return;
        }
        
        act.completed = !act.completed;
        
        // Update completedAt timestamp
        if (act.completed) {
            act.completedAt = new Date().toISOString();
        } else {
            act.completedAt = null;
        }
        
        // Save changes and update UI
        this.saveActs();
        this.updateDashboard();
        this.displayActs();
        
        // Announce for screen readers
        const statusText = act.completed ? 'completed' : 'marked as incomplete';
        this.announce(`Act ${act.title} ${statusText}`);
    }
    
    /**
     * Edit an existing act
     * @param {string} actId - ID of the act to edit
     */
    editAct(actId) {
        const act = this.acts.find(a => a.id === actId);
        if (!act) {
            console.error('Act not found for editing');
            return;
        }
        
        // Set editing state
        this.editingActId = actId;
        
        // Populate form fields
        this.actTitle.value = act.title;
        this.actDescription.value = act.description || '';
        this.targetDate.value = act.targetDate;
        this.actPriority.value = act.priority;
        
        // Reset and update value checkboxes
        const valueCheckboxes = document.querySelectorAll('input[name="act-values[]"]');
        valueCheckboxes.forEach(checkbox => {
            const wrapperDiv = checkbox.closest('[role="checkbox"]');
            const customCheckbox = wrapperDiv.querySelector('div');
            const checkIcon = customCheckbox?.querySelector('svg');
            
            // Check if this value is in the act's values
            const isSelected = act.values.includes(checkbox.value);
            
            // Update visible state
            checkbox.checked = isSelected;
            wrapperDiv.setAttribute('aria-checked', isSelected.toString());
            
            if (isSelected) {
                customCheckbox.classList.add('bg-blue-500');
                checkIcon.classList.remove('hidden');
            } else {
                customCheckbox.classList.remove('bg-blue-500');
                checkIcon.classList.add('hidden');
            }
        });
        
        // Scroll to form and focus the first field
        this.createActForm.scrollIntoView({ behavior: 'smooth' });
        this.actTitle.focus();
        
        // Update form heading and button text for editing context
        const formHeading = document.getElementById('create-act-heading');
        const submitButton = this.createActForm.querySelector('button[type="submit"]');
        
        if (formHeading) formHeading.textContent = 'Edit Act of Alignment';
        if (submitButton) {
            submitButton.textContent = 'Update Act';
            submitButton.setAttribute('aria-label', 'Update act with new information');
        }
        
        // Announce for screen readers
        this.announce(`Editing act: ${act.title}. Form updated with act details.`);
    }
    
    /**
     * Show confirmation dialog for act deletion
     * @param {string} actId - ID of the act to delete
     */
    confirmDeleteAct(actId) {
        const act = this.acts.find(a => a.id === actId);
        if (!act) {
            console.error('Act not found for deletion');
            return;
        }
        
        // Create accessible modal dialog for confirmation
        const modal = this.createConfirmationModal(
            `Delete Act: ${act.title}`,
            'Are you sure you want to delete this act? This action cannot be undone.',
            () => this.deleteAct(actId),
            'Delete',
            'Cancel'
        );
        
        document.body.appendChild(modal);
        
        // Get first focusable element and focus it
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length) focusableElements[0].focus();
        
        // Announce for screen readers
        this.announce(`Confirm deletion of act: ${act.title}`);
    }
    
    /**
     * Create an accessible confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Modal message
     * @param {Function} confirmCallback - Function to call on confirmation
     * @param {string} confirmText - Text for confirm button
     * @param {string} cancelText - Text for cancel button
     * @returns {HTMLElement} Modal element
     */
    createConfirmationModal(title, message, confirmCallback, confirmText = 'Confirm', cancelText = 'Cancel') {
        // Create modal backdrop
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title');
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg p-6 max-w-md w-full';
        
        // Title
        const modalTitle = document.createElement('h3');
        modalTitle.id = 'modal-title';
        modalTitle.className = 'text-lg font-bold mb-4';
        modalTitle.textContent = title;
        
        // Message
        const modalMessage = document.createElement('p');
        modalMessage.className = 'mb-6';
        modalMessage.textContent = message;
        
        // Buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex justify-end gap-3';
        
        // Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'px-4 py-2 border rounded-md hover:bg-gray-100';
        cancelButton.textContent = cancelText;
        cancelButton.setAttribute('data-action', 'cancel');
        
        // Confirm button
        const confirmButton = document.createElement('button');
        confirmButton.type = 'button';
        confirmButton.className = 'px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600';
        confirmButton.textContent = confirmText;
        confirmButton.setAttribute('data-action', 'confirm');
        
        // Add buttons to container
        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.appendChild(confirmButton);
        
        // Add all elements to modal content
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(modalMessage);
        modalContent.appendChild(buttonsContainer);
        
        // Add modal content to modal
        modal.appendChild(modalContent);
        
        // Add event listeners
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        confirmButton.addEventListener('click', () => {
            confirmCallback();
            closeModal();
        });
        
        cancelButton.addEventListener('click', closeModal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Close modal when pressing Escape
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
        
        return modal;
    }
    
    /**
     * Delete an act
     * @param {string} actId - ID of the act to delete
     */
    deleteAct(actId) {
        const act = this.acts.find(a => a.id === actId);
        if (!act) {
            console.error('Act not found for deletion');
            return;
        }
        
        const actTitle = act.title;
        
        // Remove act from array
        this.acts = this.acts.filter(a => a.id !== actId);
        
        // Save changes and update UI
        this.saveActs();
        this.updateDashboard();
        this.displayActs();
        
        // Announce for screen readers
        this.announce(`Act deleted: ${actTitle}`);
    }
    
    /**
     * Save act from form data with validation
     */
    saveAct() {
        if (!this.validateForm()) return;
        
        // Get form data
        const title = this.actTitle.value.trim();
        const description = this.actDescription.value.trim();
        const targetDate = this.targetDate.value;
        const priority = this.actPriority.value;
        const values = this.getSelectedValues();
        
        // Create new act or update existing
        const now = new Date().toISOString();
        let act;
        
        if (this.editingActId) {
            // Editing existing act
            act = this.acts.find(a => a.id === this.editingActId);
            
            if (act) {
                act.title = title;
                act.description = description;
                act.targetDate = targetDate;
                act.priority = priority;
                act.values = values;
                // Don't update createdAt or completed status
            } else {
                console.error('Act not found for editing');
                this.announce('Error updating act. Please try again.');
                return;
            }
        } else {
            // Creating new act
            act = {
                id: this.generateId(),
                title,
                description,
                values,
                targetDate,
                priority,
                completed: false,
                createdAt: now,
                completedAt: null
            };
            
            this.acts.push(act);
        }
        
        // Save to localStorage and update UI
        this.saveActs();
        this.resetForm();
        this.updateDashboard();
        this.displayActs();
        
        // Announce for screen readers
        const actionText = this.editingActId ? 'updated' : 'created';
        this.announce(`Act ${actionText} successfully: ${title}`);
        
        // Update status for visual users
        if (this.createActStatus) {
            this.createActStatus.textContent = `Act ${actionText} successfully`;
            this.createActStatus.classList.remove('hidden', 'text-red-500');
            this.createActStatus.classList.add('text-green-500');
            
            // Clear status after a few seconds
            setTimeout(() => {
                this.createActStatus.textContent = '';
                this.createActStatus.classList.add('hidden');
            }, 5000);
        }
        
        // Reset editing state
        this.editingActId = null;
    }
    
    /**
     * Validate the form before saving
     * @returns {boolean} True if form is valid
     */
    validateForm() {
        let isValid = true;
        
        // Title validation
        if (!this.actTitle || this.actTitle.value.trim() === '') {
            this.showFieldError(this.actTitle, 'Title is required');
            isValid = false;
        } else {
            this.clearFieldError(this.actTitle);
        }
        
        // Target date validation
        if (!this.targetDate || this.targetDate.value === '') {
            this.showFieldError(this.targetDate, 'Target date is required');
            isValid = false;
        } else {
            this.clearFieldError(this.targetDate);
        }
        
        // Values validation (at least one required)
        if (!this.validateValueSelection()) {
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Show validation error for a field
     * @param {HTMLElement} field - The field with error
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        if (!field) return;
        
        // Add error styles
        field.classList.add('border-red-500');
        field.setAttribute('aria-invalid', 'true');
        
        // Create or update error message
        let errorElement = document.getElementById(`${field.id}-error`);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = `${field.id}-error`;
            errorElement.className = 'text-red-500 text-sm mt-1';
            errorElement.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorElement);
            
            // Associate error with field using aria-describedby
            field.setAttribute('aria-describedby', errorElement.id);
        }
        
        errorElement.textContent = message;
    }
    
    /**
     * Clear validation error for a field
     * @param {HTMLElement} field - The field to clear errors for
     */
    clearFieldError(field) {
        if (!field) return;
        
        // Remove error styles
        field.classList.remove('border-red-500');
        field.setAttribute('aria-invalid', 'false');
        
        // Remove error message if it exists
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.className = 'hidden';
        }
    }
    
    /**
     * Reset the form after submission
     */
    resetForm() {
        if (!this.createActForm) return;
        
        // Reset form fields
        this.createActForm.reset();
        
        // Reset target date to today
        if (this.targetDate) {
            this.targetDate.value = this.todaysDate;
        }
        
        // Reset all value checkboxes
        const valueCheckboxWrappers = document.querySelectorAll('[role="checkbox"]');
        valueCheckboxWrappers.forEach(wrapper => {
            const checkbox = wrapper.querySelector('input[type="checkbox"]');
            const customCheckbox = wrapper.querySelector('div');
            const checkIcon = customCheckbox?.querySelector('svg');
            
            wrapper.setAttribute('aria-checked', 'false');
            if (checkbox) checkbox.checked = false;
            if (customCheckbox) customCheckbox.classList.remove('bg-blue-500');
            if (checkIcon) checkIcon.classList.add('hidden');
        });
        
        // Clear any error messages
        const errorElements = document.querySelectorAll('[role="alert"]');
        errorElements.forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        
        // Clear aria-invalid states
        const formInputs = this.createActForm.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.setAttribute('aria-invalid', 'false');
            input.classList.remove('border-red-500');
        });
    }
    
    /**
     * Update all dashboard statistics
     */
    updateDashboard() {
        this.updateActCounts();
        this.updateAlignmentScore();
        this.updateStreakDisplay();
    }
    
    /**
     * Update current and completed acts counts in the dashboard
     */
    updateActCounts() {
        if (!this.currentActsCount || !this.completedActsCount) return;
        
        // Calculate counts
        const currentActs = this.acts.filter(act => !act.completed);
        const completedThisMonth = this.getCompletedActsThisMonth();
        
        // Update UI with accessible labeling
        this.currentActsCount.textContent = currentActs.length;
        this.completedActsCount.textContent = completedThisMonth.length;
        
        // ARIA attributes for screen readers
        this.currentActsCount.setAttribute('aria-label', `${currentActs.length} current acts in progress`);
        this.completedActsCount.setAttribute('aria-label', `${completedThisMonth.length} acts completed this month`);
    }
    
    /**
     * Get acts completed in the current month
     * @returns {Array} Acts completed this month
     */
    getCompletedActsThisMonth() {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        return this.acts.filter(act => {
            if (!act.completed || !act.completedAt) return false;
            const completedDate = new Date(act.completedAt);
            return completedDate >= firstDayOfMonth && completedDate <= now;
        });
    }
    
    /**
     * Update alignment score in the dashboard
     */
    updateAlignmentScore() {
        if (!this.alignmentScoreBar || !this.alignmentScoreText) return;
        
        const score = this.calculateAlignmentScore();
        
        // Update progress bar with accessibility attributes
        this.alignmentScoreBar.style.width = `${score}%`;
        this.alignmentScoreBar.setAttribute('aria-valuenow', score);
        
        // Update text
        this.alignmentScoreText.textContent = `${score}%`;
    }
    
    /**
     * Calculate alignment score based on completed vs overdue acts
     * @returns {number} Alignment score (0-100)
     */
    calculateAlignmentScore() {
        if (this.acts.length === 0) return 0;
        
        const today = new Date().toISOString().split('T')[0];
        const completedOnTime = this.acts.filter(act => 
            act.completed && 
            act.completedAt && 
            new Date(act.completedAt).toISOString().split('T')[0] <= act.targetDate
        ).length;
        
        const overdueActs = this.acts.filter(act => 
            !act.completed && 
            act.targetDate < today
        ).length;
        
        const totalRelevantActs = this.acts.length;
        if (totalRelevantActs === 0) return 0;
        
        // Calculate score: completed on time positively affect score, 
        // overdue acts negatively affect score
        const baseScore = (completedOnTime / totalRelevantActs) * 100;
        const penaltyFactor = overdueActs > 0 ? (overdueActs / totalRelevantActs) * 20 : 0;
        
        // Ensure score is between 0 and 100
        return Math.max(0, Math.min(100, Math.round(baseScore - penaltyFactor)));
    }
    
    /**
     * Update streak display with current streak
     */
    updateStreakDisplay() {
        if (!this.dailyStreakCount) return;
        
        const streak = this.calculateStreak();
        
        // Update UI with proper accessibility attributes
        this.dailyStreakCount.textContent = streak;
        this.dailyStreakCount.setAttribute('aria-label', `${streak} day${streak !== 1 ? 's' : ''} streak of completing acts`);
    }
    
    /**
     * Calculate current streak of completing acts daily
     * @returns {number} Current streak count
     */
    calculateStreak() {
        if (this.acts.length === 0) return 0;
        
        const completedActs = this.acts.filter(act => act.completed && act.completedAt);
        if (completedActs.length === 0) return 0;
        
        // Group completions by date
        const completionsByDate = {};
        completedActs.forEach(act => {
            const dateStr = new Date(act.completedAt).toISOString().split('T')[0];
            completionsByDate[dateStr] = true;
        });
        
        // Get unique completion dates sorted desc
        const completionDates = Object.keys(completionsByDate).sort().reverse();
        if (completionDates.length === 0) return 0;
        
        // Check if there's a completion today
        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        
        // If completed today, start streak at 1
        if (completionsByDate[today]) {
            streak = 1;
            
            // Count back from yesterday
            let checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - 1);
            
            while (true) {
                const checkDateStr = checkDate.toISOString().split('T')[0];
                
                if (completionsByDate[checkDateStr]) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        } else {
            // Check if completed yesterday to start streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (completionsByDate[yesterdayStr]) {
                streak = 1;
                
                // Count back from 2 days ago
                let checkDate = new Date(yesterday);
                checkDate.setDate(checkDate.getDate() - 1);
                
                while (true) {
                    const checkDateStr = checkDate.toISOString().split('T')[0];
                    
                    if (completionsByDate[checkDateStr]) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                    } else {
                        break;
                    }
                }
            }
        }
        
        return streak;
    }
}

// Initialize the acts manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const actsManager = new ActsManager();
});
