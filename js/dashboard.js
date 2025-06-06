/**
 * ValueAlign Dashboard functionality
 * Handles dashboard-specific UI interactions and data display
 */

class DashboardManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.user = authManager.user; // Directly access user property instead of using getUser()
        
        // Dashboard elements
        this.welcomeHeading = document.getElementById('portal-welcome-heading');
        this.alignmentScore = document.getElementById('alignment-score-value');
        this.alignmentTrend = document.getElementById('alignment-score-trend');
        this.reflectionPrompt = document.getElementById('daily-reflection-prompt');
        this.reflectButton = document.getElementById('go-to-reflect-button');
        this.microActionsContainer = document.getElementById('micro-actions-container');
        this.streakValue = document.getElementById('streak-value');
        this.streakProgressBar = document.getElementById('streak-progress-bar');
        this.streakProgressRegion = document.getElementById('streak-progress-label');
        this.badgeValue = document.getElementById('badge-value');
        this.premiumCard = document.getElementById('upgrade-premium-card');
        this.dashboardStatus = document.getElementById('dashboard-status');
        
        // User subscription status
        this.isPremiumUser = this.user && this.user.subscription === 'premium';
    }

    /**
     * Initialize the dashboard
     */
    initialize() {
        if (!this.user) {
            console.error('No user data available for dashboard');
            return;
        }

        this.updateWelcomeMessage();
        this.setupReflectionButton();
        
        // Fetch user progress data (will use mock data for now)
        this.fetchUserProgressData()
            .then(userData => {
                this.displayUserProgress(userData);
                this.handlePremiumContent();
                
                // Add transition effects for cards
                document.querySelectorAll('.card-hover-lift').forEach(card => {
                    card.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';
                });
                
                // Announce page is ready for screen readers
                this.announcePageReady();
            })
            .catch(error => {
                this.handleError('Could not load user progress data', error);
            });
    }
    
    /**
     * Fetch user progress data from API or use mock data
     * @returns {Promise} A promise that resolves with the user data
     */
    async fetchUserProgressData() {
        // In a real implementation, this would be an API call
        // For now, return mock data after a small delay to simulate network request
        
        try {
            // Update status for screen readers
            this.updateAccessibilityStatus('Loading your dashboard data...');
            
            // Simulate API request with a delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Mock data to return
            return {
                alignmentScore: 76,
                trend: 'up',
                streak: 7,
                streakPercentage: 23,
                badge: 'Value Explorer',
                reflectionPrompt: 'How have your actions today aligned with your core values?',
                microActions: [
                    'Take 5 minutes to meditate and reflect on your values.',
                    'Connect with a family member and express gratitude.'
                ]
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    }
    
    /**
     * Handle errors in a user-friendly way
     * @param {string} message - User-friendly error message
     * @param {Error} error - The actual error object
     */
    handleError(message, error) {
        console.error(`${message}:`, error);
        
        // Create an error message element if it doesn't exist
        let errorEl = document.getElementById('dashboard-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'dashboard-error';
            errorEl.className = 'bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-6 rounded';
            errorEl.setAttribute('role', 'alert');
            errorEl.setAttribute('aria-live', 'assertive');
            
            // Insert at the top of the dashboard
            const dashboardEl = document.querySelector('main');
            if (dashboardEl && dashboardEl.firstChild) {
                dashboardEl.insertBefore(errorEl, dashboardEl.querySelector('header').nextSibling);
            }
        }
        
        // Set the error message
        errorEl.innerHTML = `
            <div class="flex items-center">
                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <p>${message}</p>
            </div>
            <button class="mt-2 text-sm text-red-600 dark:text-red-300 underline focus:outline-none" 
                onclick="location.reload()" aria-label="Reload the dashboard page">Reload page</button>
        `;
        
        // Update accessibility status
        this.updateAccessibilityStatus(`Error: ${message}. Use the reload button to try again.`);
    }
    
    /**
     * Handle premium content visibility based on user subscription
     */
    handlePremiumContent() {
        // Check if premium card exists
        if (this.premiumCard) {
            if (this.isPremiumUser) {
                // Hide the premium upgrade card for premium users
                this.premiumCard.classList.add('hidden');
                this.premiumCard.setAttribute('aria-hidden', 'true');
                this.updateAccessibilityStatus('Premium features are already unlocked on your account');
            } else {
                // Show premium upgrade card for non-premium users
                this.premiumCard.classList.remove('hidden');
                this.premiumCard.setAttribute('aria-hidden', 'false');
            }
        }
    }

    /**
     * Update welcome message with user name
     */
    updateWelcomeMessage() {
        if (this.welcomeHeading) {
            const displayName = this.user.name || this.user.email.split('@')[0];
            this.welcomeHeading.textContent = `Welcome, ${displayName}!`;
            this.welcomeHeading.setAttribute('aria-label', `Welcome, ${displayName}!`);
        }
    }

    /**
     * Setup reflection button click handler
     */
    setupReflectionButton() {
        if (this.reflectButton) {
            this.reflectButton.addEventListener('click', () => {
                window.location.href = '/reflect/';
            });
            
            // Make the button more accessible
            this.reflectButton.setAttribute('aria-label', 'Start today\'s reflection');
        }
    }

    /**
     * Display user progress information
     * @param {Object} userData - User dashboard data from API or mock source
     */
    displayUserProgress(userData) {
        if (!userData) {
            console.error('No user data provided to displayUserProgress');
            return;
        }

        // Update alignment score
        if (this.alignmentScore) {
            this.alignmentScore.textContent = userData.alignmentScore;
            this.alignmentScore.setAttribute('aria-valuenow', userData.alignmentScore);
        }

        // Update trend indicator
        if (this.alignmentTrend) {
            // Define trend messages for accessibility
            const trendMessages = {
                up: 'increasing from last week',
                down: 'decreasing from last week',
                same: 'unchanged from last week'
            };
            
            if (userData.trend === 'up') {
                this.alignmentTrend.textContent = '↑';
                this.alignmentTrend.className = 'ml-2 text-2xl text-green-500';
                this.alignmentTrend.setAttribute('aria-label', trendMessages.up);
                this.updateAccessibilityStatus(`Alignment score is ${userData.alignmentScore}, ${trendMessages.up}`); 
            } else if (userData.trend === 'down') {
                this.alignmentTrend.textContent = '↓';
                this.alignmentTrend.className = 'ml-2 text-2xl text-red-500';
                this.alignmentTrend.setAttribute('aria-label', trendMessages.down);
                this.updateAccessibilityStatus(`Alignment score is ${userData.alignmentScore}, ${trendMessages.down}`);
            } else {
                this.alignmentTrend.textContent = '→';
                this.alignmentTrend.className = 'ml-2 text-2xl text-gray-500';
                this.alignmentTrend.setAttribute('aria-label', trendMessages.same);
                this.updateAccessibilityStatus(`Alignment score is ${userData.alignmentScore}, ${trendMessages.same}`);
            }
        }

        // Update streak
        if (this.streakValue) {
            this.streakValue.textContent = `${userData.streak} days`;
            this.streakValue.setAttribute('aria-label', `Current streak: ${userData.streak} days`);
        }

        // Update progress bar and associated accessibility elements
        if (this.streakProgressBar && this.streakProgressRegion) {
            this.streakProgressBar.style.width = `${userData.streakPercentage}%`;
            
            // Update the parent container's ARIA attributes for accessibility
            const progressContainer = this.streakProgressBar.parentElement;
            if (progressContainer) {
                progressContainer.setAttribute('aria-valuenow', userData.streakPercentage);
                progressContainer.setAttribute('aria-valuemin', '0');
                progressContainer.setAttribute('aria-valuemax', '100');
                
                const progressText = `${userData.streak} day streak, ${userData.streakPercentage}% progress toward next badge`;
                this.streakProgressRegion.textContent = progressText;
                progressContainer.setAttribute('aria-label', progressText);
            }
        }

        // Update badge
        if (this.badgeValue) {
            this.badgeValue.textContent = userData.badge;
            this.badgeValue.setAttribute('aria-label', `Your current badge: ${userData.badge}`);
            // Announce badge update for screen readers
            this.updateAccessibilityStatus(`Your current badge is ${userData.badge}`);
        }
        
        // Update reflection prompt if available
        if (this.reflectionPrompt && userData.reflectionPrompt) {
            this.reflectionPrompt.textContent = userData.reflectionPrompt;
        }
        
        // Update micro-actions if available
        if (this.microActionsContainer && userData.microActions && userData.microActions.length > 0) {
            this.microActionsContainer.innerHTML = '';
            
            userData.microActions.forEach((action, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'p-2 flex items-center';
                listItem.setAttribute('role', 'listitem');
                
                listItem.innerHTML = `
                    <span class="text-va-primary dark:text-va-accent mr-2" aria-hidden="true">•</span>
                    <span>${action}</span>
                `;
                
                this.microActionsContainer.appendChild(listItem);
            });
        }
    }

    /**
     * Update accessibility status with a message for screen readers
     * @param {string} message - The message to announce
     */
    updateAccessibilityStatus(message) {
        if (this.dashboardStatus) {
            this.dashboardStatus.textContent = message;
        }
    }

    /**
     * Announce the page is ready to screen readers
     */
    announcePageReady() {
        // Use the dedicated dashboard status region instead of creating a new one
        setTimeout(() => {
            this.updateAccessibilityStatus('Dashboard page loaded. Your alignment score, reflection prompt, quick actions, and progress information are available.');
        }, 1000);

        // Add keyboard navigation enhancement
        this.enhanceKeyboardNavigation();
    }

    /**
     * Enhance keyboard navigation between dashboard cards
     */
    enhanceKeyboardNavigation() {
        // Find all focusable elements in the dashboard
        const focusableElements = document.querySelectorAll('a[href], button, [tabindex]:not([tabindex="-1"])');
        
        // Add keydown event listeners to handle improved focus management
        focusableElements.forEach((element) => {
            element.addEventListener('keydown', (e) => {
                // If Escape key is pressed in any element, focus the heading
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.welcomeHeading.setAttribute('tabindex', '-1');
                    this.welcomeHeading.focus();
                    this.welcomeHeading.removeAttribute('tabindex');
                }
            });
        });
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the auth manager instance
    const authManager = window.authManager;
    
    if (!authManager || !authManager.isAuthenticated()) {
        // Redirect to login if not authenticated
        window.location.href = '/login/';
        return;
    }
    
    // Initialize dashboard
    const dashboardManager = new DashboardManager(authManager);
    dashboardManager.initialize();
});
