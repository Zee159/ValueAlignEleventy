/**
 * ValueAlign Exercises Page JavaScript
 * Handles filtering, searching, and interaction with exercise components
 * with proper accessibility support
 */

class ExercisesManager {
    constructor() {
        // DOM References
        this.exerciseGrid = document.getElementById('exercise-grid');
        this.exerciseCards = Array.from(document.querySelectorAll('#exercise-grid > article'));
        this.categoryFilter = document.getElementById('value-filter');
        this.difficultyFilter = document.getElementById('difficulty-filter');
        this.durationFilter = document.getElementById('duration-filter');
        this.searchInput = document.getElementById('exercise-search');
        this.noResultsMessage = document.getElementById('no-results');
        this.resetFiltersBtn = document.getElementById('reset-filters');
        this.applyFiltersBtn = document.getElementById('apply-filters');
        this.exerciseCountElement = document.getElementById('exercise-count');
        
        // State management
        this.activeFilters = {
            category: 'all',
            duration: 'all',
            difficulty: 'all',
            search: ''
        };

        // Status announcement for screen readers
        this.statusAnnouncement = document.createElement('div');
        this.statusAnnouncement.setAttribute('aria-live', 'polite');
        this.statusAnnouncement.setAttribute('class', 'sr-only');
        this.statusAnnouncement.setAttribute('role', 'status');
        document.body.appendChild(this.statusAnnouncement);
        
        // Initialize
        this.setupEventListeners();
    }
    
    /**
     * Set up all event listeners for the exercises page
     */
    setupEventListeners() {
        // Apply filters button
        if (this.applyFiltersBtn) {
            this.applyFiltersBtn.addEventListener('click', () => {
                this.getFilterValues();
                this.applyFilters();
            });
        }
        
        // Search input for real-time filtering
        if (this.searchInput) {
            this.searchInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    this.getFilterValues();
                    this.applyFilters();
                } else {
                    // Update search term but don't apply yet (wait for Enter or button click)
                    this.activeFilters.search = this.searchInput.value.toLowerCase().trim();
                }
            });
        }
        
        // Reset filters button
        if (this.resetFiltersBtn) {
            this.resetFiltersBtn.addEventListener('click', () => {
                this.resetAllFilters();
            });
        }
        
        // Make exercise cards accessible
        this.exerciseCards.forEach(card => {
            const startButton = card.querySelector('a');
            if (startButton) {
                // Add keyboard focus handler for better accessibility
                startButton.addEventListener('focus', () => {
                    card.classList.add('ring-2', 'ring-va-primary', 'ring-opacity-50');
                });
                
                startButton.addEventListener('blur', () => {
                    card.classList.remove('ring-2', 'ring-va-primary', 'ring-opacity-50');
                });
            }
        });
    }
    
    /**
     * Get current values from all filter dropdowns
     */
    getFilterValues() {
        if (this.categoryFilter) {
            this.activeFilters.category = this.categoryFilter.value;
        }
        
        if (this.difficultyFilter) {
            this.activeFilters.difficulty = this.difficultyFilter.value;
        }
        
        if (this.durationFilter) {
            this.activeFilters.duration = this.durationFilter.value;
        }
        
        if (this.searchInput) {
            this.activeFilters.search = this.searchInput.value.toLowerCase().trim();
        }
    }
    
    /**
     * Apply all active filters to the exercise cards
     */
    applyFilters() {
        let visibleCount = 0;
        let totalCount = this.exerciseCards.length;
        
        // Apply filters to each card
        this.exerciseCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const difficulty = card.getAttribute('data-difficulty');
            const duration = card.getAttribute('data-duration');
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';
            
            // Check if card matches all active filters
            const matchesCategory = this.activeFilters.category === 'all' || this.activeFilters.category === category;
            const matchesDifficulty = this.activeFilters.difficulty === 'all' || this.activeFilters.difficulty === difficulty;
            const matchesDuration = this.activeFilters.duration === 'all' || this.activeFilters.duration === duration;
            const matchesSearch = !this.activeFilters.search || 
                                title.includes(this.activeFilters.search) || 
                                description.includes(this.activeFilters.search);
            
            // Show or hide based on filter matches
            if (matchesCategory && matchesDifficulty && matchesDuration && matchesSearch) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Update exercise count
        if (this.exerciseCountElement) {
            this.exerciseCountElement.textContent = `Showing ${visibleCount} of ${totalCount} exercises`;
        }
        
        // Show/hide no results message
        if (visibleCount === 0) {
            this.noResultsMessage.classList.remove('hidden');
        } else {
            this.noResultsMessage.classList.add('hidden');
        }
        
        // Announce filter results for screen readers
        this.announceFilterResults(visibleCount, totalCount);
    }
    
    /**
     * Reset all filters to their default state
     */
    resetAllFilters() {
        // Reset dropdown selects
        if (this.categoryFilter) this.categoryFilter.value = 'all';
        if (this.durationFilter) this.durationFilter.value = 'all';
        if (this.difficultyFilter) this.difficultyFilter.value = 'all';
        
        // Clear search input
        if (this.searchInput) this.searchInput.value = '';
        
        // Reset active filters state
        this.activeFilters = {
            category: 'all',
            duration: 'all',
            difficulty: 'all',
            search: ''
        };
        
        // Apply the reset filters
        this.applyFilters();
        
        // Focus on the first filter for better UX
        if (this.categoryFilter) this.categoryFilter.focus();
    }
    
    /**
     * Announce filter results for accessibility
     * @param {number} visibleCount - Number of visible exercises
     * @param {number} totalCount - Total number of exercises
     */
    announceFilterResults(visibleCount, totalCount) {
        let message = '';
        
        if (visibleCount === 0) {
            message = 'No matching exercises found. Try changing your filters.';
        } else if (visibleCount === 1) {
            message = '1 matching exercise found.';
        } else {
            message = `${visibleCount} matching exercises found.`;
        }
        
        // Update screen reader announcement
        this.statusAnnouncement.textContent = message;
    }
    
    /**
     * Apply all active filters to exercise cards
     */
    applyFilters() {
        let visibleCount = 0;
        let totalCount = this.exerciseCards.length;
        
        this.exerciseCards.forEach(card => {
            // Get card data attributes for filtering
            const category = card.dataset.category;
            const duration = card.dataset.duration;
            const difficulty = card.dataset.difficulty;
            const cardText = card.textContent.toLowerCase();
            
            // Check if card passes all active filters
            const passesCategory = !this.activeFilters.category || category === this.activeFilters.category;
            const passesDuration = !this.activeFilters.duration || duration === this.activeFilters.duration;
            const passesDifficulty = !this.activeFilters.difficulty || difficulty === this.activeFilters.difficulty;
            const passesSearch = !this.activeFilters.search || cardText.includes(this.activeFilters.search);
            
            // Show or hide card based on filter results
            if (passesCategory && passesDuration && passesDifficulty && passesSearch) {
                card.classList.remove('hidden');
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        });
        
        // Show or hide "no results" message
        if (visibleCount === 0) {
            this.noResultsMessage.classList.remove('hidden');
            this.loadMoreBtn.classList.add('hidden');
        } else {
            this.noResultsMessage.classList.add('hidden');
            this.loadMoreBtn.classList.remove('hidden');
        }
        
        // Announce filter results for screen readers
        this.announceFilterResults(visibleCount, totalCount);
    }
    
    /**
     * Reset all active filters and return to initial state
     */
    resetAllFilters() {
        // Clear all active filters
        this.activeFilters = {
            category: null,
            duration: null,
            difficulty: null,
            search: ''
        };
        
        // Reset category buttons
        this.categoryButtons.forEach(button => {
            button.setAttribute('aria-pressed', 'false');
            button.classList.remove('active');
        });
        
        // Reset duration buttons
        this.durationButtons.forEach(button => {
            button.setAttribute('aria-pressed', 'false');
            button.classList.remove('active');
        });
        
        // Reset difficulty buttons
        this.difficultyButtons.forEach(button => {
            button.setAttribute('aria-pressed', 'false');
            button.classList.remove('active');
        });
        
        // Clear search input
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // Apply reset filters
        this.applyFilters();
        
        // Focus on first category button for better keyboard navigation
        if (this.categoryButtons.length > 0) {
            this.categoryButtons[0].focus();
        }
        
        // Announce reset for accessibility
        this.statusAnnouncement.textContent = 'All filters have been reset. Showing all exercises.';
    }
    
    /**
     * Open selected exercise
     * @param {string} exerciseId - ID of the selected exercise
     * @param {Event} event - Click event
     */
    openExercise(exerciseId, event) {
        // Prevent navigation if premium exercise for non-premium users
        const card = event.target.closest('.exercise-card');
        const isPremium = card.classList.contains('premium-exercise');
        const userIsPremium = this.checkUserPremiumStatus();
        
        if (isPremium && !userIsPremium) {
            // Show upgrade prompt
            this.showPremiumUpgradePrompt();
            return;
        }
        
        // Announce loading for accessibility
        this.statusAnnouncement.textContent = `Loading ${exerciseId} exercise. Please wait.`;
        
        // TODO: Implement actual exercise loading/navigation
        console.log(`Opening exercise: ${exerciseId}`);
        
        // For demo purposes, we'll just show an alert
        alert(`Opening exercise: ${exerciseId}`);
    }
    
    /**
     * Load more exercises (would normally fetch from server)
     */
    loadMoreExercises() {
        // In a real implementation, this would fetch more exercises from the server
        // For demo purposes, we'll just show a message
        this.loadMoreBtn.textContent = 'Loading...';
        
        // Simulate loading delay
        setTimeout(() => {
            this.loadMoreBtn.textContent = 'No more exercises available';
            this.loadMoreBtn.disabled = true;
            
            // Announce for screen readers
            this.statusAnnouncement.textContent = 'No additional exercises are available at this time.';
        }, 1500);
    }
    
    /**
     * Check if current user has premium access
     * @returns {boolean} - True if user has premium access
     */
    checkUserPremiumStatus() {
        // Mock implementation - would normally check against user data
        // For demo purposes, return false to test premium upgrade flow
        return false;
    }
    
    /**
     * Show premium upgrade prompt for premium-only exercises
     */
    showPremiumUpgradePrompt() {
        // For demo purposes, we'll just show an alert
        alert('This is a premium exercise. Please upgrade your membership to access this content.');
        
        // Announce for screen readers
        this.statusAnnouncement.textContent = 'This exercise requires a premium membership. Please upgrade to access this content.';
    }
    
    /**
     * Announce filter results for screen readers
     * @param {number} visibleCount - Number of visible exercise cards
     * @param {number} totalCount - Total number of exercise cards
     */
    announceFilterResults(visibleCount, totalCount) {
        let message = '';
        
        if (visibleCount === 0) {
            message = 'No exercises match your current filters. Try adjusting your search criteria.';
        } else if (visibleCount === 1) {
            message = '1 exercise matches your filters.';
        } else if (visibleCount === totalCount) {
            message = `All ${totalCount} exercises are displayed.`;
        } else {
            message = `${visibleCount} exercises match your filters out of ${totalCount} total exercises.`;
        }
        
        this.statusAnnouncement.textContent = message;
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const exercisesManager = new ExercisesManager();
});
