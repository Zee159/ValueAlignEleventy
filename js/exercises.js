/**
 * ValueAlign Exercises Page JavaScript
 * Handles filtering, searching, and interaction with exercise components
 * with proper accessibility support
 */

class ExercisesManager {
    constructor() {
        // DOM References
        this.exerciseGrid = document.getElementById('exercise-grid');
        this.exerciseCards = document.querySelectorAll('.exercise-card');
        this.categoryButtons = document.querySelectorAll('.category-button');
        this.durationButtons = document.querySelectorAll('.duration-filter');
        this.difficultyButtons = document.querySelectorAll('.difficulty-filter');
        this.searchInput = document.getElementById('exercise-search');
        this.noResultsMessage = document.getElementById('no-exercises-message');
        this.resetFiltersBtn = document.getElementById('reset-filters-btn');
        this.loadMoreBtn = document.getElementById('load-more-exercises');
        
        // State management
        this.activeFilters = {
            category: null,
            duration: null,
            difficulty: null,
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
        // Category button filtering
        this.categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                this.toggleCategoryFilter(category, button);
            });
            
            // Keyboard accessibility
            button.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    button.click();
                }
            });
        });
        
        // Duration filtering
        this.durationButtons.forEach(button => {
            button.addEventListener('click', () => {
                const duration = button.dataset.duration;
                this.toggleDurationFilter(duration, button);
            });
        });
        
        // Difficulty filtering
        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const difficulty = button.dataset.difficulty;
                this.toggleDifficultyFilter(difficulty, button);
            });
        });
        
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this.activeFilters.search = this.searchInput.value.toLowerCase().trim();
                this.applyFilters();
            });
            
            // Clear search when 'x' button is clicked
            const clearSearchBtn = document.getElementById('clear-search');
            if (clearSearchBtn) {
                clearSearchBtn.addEventListener('click', () => {
                    this.searchInput.value = '';
                    this.activeFilters.search = '';
                    this.applyFilters();
                    // Focus back on search input for better UX
                    this.searchInput.focus();
                });
            }
        }
        
        // Exercise start buttons
        const startButtons = document.querySelectorAll('.start-exercise-btn');
        startButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const exerciseId = button.dataset.exerciseId;
                this.openExercise(exerciseId, event);
            });
        });
        
        // Reset filters button
        if (this.resetFiltersBtn) {
            this.resetFiltersBtn.addEventListener('click', () => {
                this.resetAllFilters();
            });
        }
        
        // Load more exercises button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMoreExercises();
            });
        }
    }
    
    /**
     * Toggle category filter state and update UI
     * @param {string} category - Selected category
     * @param {HTMLElement} button - Selected category button
     */
    toggleCategoryFilter(category, button) {
        // If same category clicked again, deselect it
        if (this.activeFilters.category === category) {
            this.activeFilters.category = null;
            button.setAttribute('aria-pressed', 'false');
            button.classList.remove('active');
        } else {
            // Deselect previous category if any
            if (this.activeFilters.category) {
                const prevButton = document.querySelector(`.category-button[data-category="${this.activeFilters.category}"]`);
                if (prevButton) {
                    prevButton.setAttribute('aria-pressed', 'false');
                    prevButton.classList.remove('active');
                }
            }
            
            // Select new category
            this.activeFilters.category = category;
            button.setAttribute('aria-pressed', 'true');
            button.classList.add('active');
        }
        
        this.applyFilters();
    }
    
    /**
     * Toggle duration filter state and update UI
     * @param {string} duration - Selected duration
     * @param {HTMLElement} button - Selected duration button
     */
    toggleDurationFilter(duration, button) {
        // If same duration clicked again, deselect it
        if (this.activeFilters.duration === duration) {
            this.activeFilters.duration = null;
            button.setAttribute('aria-pressed', 'false');
            button.classList.remove('active');
        } else {
            // Deselect previous duration if any
            if (this.activeFilters.duration) {
                const prevButton = document.querySelector(`.duration-filter[data-duration="${this.activeFilters.duration}"]`);
                if (prevButton) {
                    prevButton.setAttribute('aria-pressed', 'false');
                    prevButton.classList.remove('active');
                }
            }
            
            // Select new duration
            this.activeFilters.duration = duration;
            button.setAttribute('aria-pressed', 'true');
            button.classList.add('active');
        }
        
        this.applyFilters();
    }
    
    /**
     * Toggle difficulty filter state and update UI
     * @param {string} difficulty - Selected difficulty
     * @param {HTMLElement} button - Selected difficulty button
     */
    toggleDifficultyFilter(difficulty, button) {
        // If same difficulty clicked again, deselect it
        if (this.activeFilters.difficulty === difficulty) {
            this.activeFilters.difficulty = null;
            button.setAttribute('aria-pressed', 'false');
            button.classList.remove('active');
        } else {
            // Deselect previous difficulty if any
            if (this.activeFilters.difficulty) {
                const prevButton = document.querySelector(`.difficulty-filter[data-difficulty="${this.activeFilters.difficulty}"]`);
                if (prevButton) {
                    prevButton.setAttribute('aria-pressed', 'false');
                    prevButton.classList.remove('active');
                }
            }
            
            // Select new difficulty
            this.activeFilters.difficulty = difficulty;
            button.setAttribute('aria-pressed', 'true');
            button.classList.add('active');
        }
        
        this.applyFilters();
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
