// js/progress.js - ValueAlign portal progress page functionality
"use strict";

class ProgressManager {
    constructor() {
        // DOM elements
        this.alignmentScoreCircle = document.getElementById('alignment-score-circle');
        this.streakCount = document.getElementById('streak-count');
        this.valuesCount = document.getElementById('values-count');
        this.valuesProgressList = document.getElementById('values-progress-list');
        this.monthlyTrendBtn = document.getElementById('monthly-trend-btn');
        this.yearlyTrendBtn = document.getElementById('yearly-trend-btn');
        this.trendChartPlaceholder = document.getElementById('trend-chart-placeholder');
        this.premiumFeaturePromo = document.getElementById('premium-feature-promo');
        this.statusElement = document.getElementById('progress-status');
        
        // Initialize
        this.currentTrendView = 'monthly';
        this.values = [];
        this.alignmentScore = 0;
        this.streak = 0;
        this.valuesPracticed = 0;
        this.totalValues = 0;
        
        this.initPage();
    }
    
    /**
     * Initialize the progress page
     */
    initPage() {
        console.log('[ProgressManager] Initializing progress page');
        
        // Use a small delay to ensure auth service is fully initialized
        setTimeout(() => {
            // Check if user is authenticated using modern auth system
            if (typeof window.authService !== 'object' || !window.authService) {
                console.error('[ProgressManager] authService not found. auth-service.js might not be loaded correctly.');
                this.redirectToLogin();
                return;
            }
            
            // Get current user
            const user = window.authService.getCurrentUser();
            if (!user) {
                console.error('[ProgressManager] No logged-in user data found.');
                this.redirectToLogin();
                return;
            }
            
            console.log('[ProgressManager] User found:', user.email);
            this.initializeProgressForUser(user);
        }, 100);
    }
    
    /**
     * Redirect to login if not authenticated
     */
    redirectToLogin() {
        console.log('[ProgressManager] Redirecting to login');
        
        // Save current page for redirect after login
        localStorage.setItem('auth_redirect_after_login', window.location.pathname);
        
        // Redirect to login
        window.location.href = '/login/';
    }
    
    /**
     * Initialize progress features after user is authenticated
     */
    initializeProgressForUser(user) {
        
        // Check if user has premium features
        this.isPremium = user.subscription && user.subscription.toLowerCase() !== 'free';
        
        // Show premium promo for non-premium users
        if (!this.isPremium && this.premiumFeaturePromo) {
            this.premiumFeaturePromo.classList.remove('hidden');
        }
        
        // Load progress data for the user
        this.loadProgressData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('[ProgressManager] Progress page initialized');
    }
    
    /**
     * Update accessibility status for screen readers
     * @param {string} message - The message to announce
     */
    updateAccessibilityStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle between monthly and yearly trends
        if (this.monthlyTrendBtn) {
            this.monthlyTrendBtn.addEventListener('click', () => {
                this.setTrendView('monthly');
            });
        }
        
        if (this.yearlyTrendBtn) {
            this.yearlyTrendBtn.addEventListener('click', () => {
                this.setTrendView('yearly');
            });
        }
    }
    
    /**
     * Set trend view mode (monthly or yearly)
     * @param {string} viewMode - View mode ('monthly' or 'yearly')
     */
    setTrendView(viewMode) {
        if (this.currentTrendView === viewMode) return;
        
        this.currentTrendView = viewMode;
        
        // Update button states
        if (this.monthlyTrendBtn) {
            this.monthlyTrendBtn.setAttribute('aria-pressed', viewMode === 'monthly');
            if (viewMode === 'monthly') {
                this.monthlyTrendBtn.classList.add('bg-va-accent-light', 'dark:bg-gray-700', 'text-va-primary', 'dark:text-green-400');
                this.monthlyTrendBtn.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
            } else {
                this.monthlyTrendBtn.classList.remove('bg-va-accent-light', 'dark:bg-gray-700', 'text-va-primary', 'dark:text-green-400');
                this.monthlyTrendBtn.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
            }
        }
        
        if (this.yearlyTrendBtn) {
            this.yearlyTrendBtn.setAttribute('aria-pressed', viewMode === 'yearly');
            if (viewMode === 'yearly') {
                this.yearlyTrendBtn.classList.add('bg-va-accent-light', 'dark:bg-gray-700', 'text-va-primary', 'dark:text-green-400');
                this.yearlyTrendBtn.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
            } else {
                this.yearlyTrendBtn.classList.remove('bg-va-accent-light', 'dark:bg-gray-700', 'text-va-primary', 'dark:text-green-400');
                this.yearlyTrendBtn.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
            }
        }
        
        // Re-render chart with new data
        this.updateTrendChart();
        
        this.updateAccessibilityStatus(`Switched to ${viewMode} trend view`);
    }
    
    /**
     * Load user's progress data
     */
    loadProgressData() {
        // In a real implementation, we would fetch this data from an API
        // For now, use mock data
        this.alignmentScore = 75;
        this.streak = 14;
        this.valuesPracticed = 5;
        this.totalValues = 7;
        
        // Demo values
        this.values = [
            {
                name: 'Compassion',
                score: 83,
                previousScore: 75,
                change: 8,
                actsThisWeek: 5,
                needsAttention: false
            },
            {
                name: 'Growth',
                score: 67,
                previousScore: 55,
                change: 12,
                actsThisWeek: 3,
                needsAttention: false
            },
            {
                name: 'Connection',
                score: 42,
                previousScore: 47,
                change: -5,
                actsThisWeek: 1,
                needsAttention: true
            },
            {
                name: 'Creativity',
                score: 60,
                previousScore: 58,
                change: 2,
                actsThisWeek: 2,
                needsAttention: false
            },
            {
                name: 'Authenticity',
                score: 89,
                previousScore: 85,
                change: 4,
                actsThisWeek: 3,
                needsAttention: false
            }
        ];
        
        // Update UI with data
        this.updateUIWithProgressData();
    }
    
    /**
     * Update UI elements with progress data
     */
    updateUIWithProgressData() {
        // Update alignment score
        if (this.alignmentScoreCircle) {
            this.alignmentScoreCircle.setAttribute('stroke-dasharray', `${this.alignmentScore}, 100`);
            
            const scoreText = this.alignmentScoreCircle.nextElementSibling;
            if (scoreText) {
                scoreText.textContent = `${this.alignmentScore}%`;
            }
        }
        
        // Update streak count
        if (this.streakCount) {
            this.streakCount.textContent = this.streak;
        }
        
        // Update values count
        if (this.valuesCount) {
            this.valuesCount.textContent = `${this.valuesPracticed}/${this.totalValues}`;
        }
        
        // Update values progress list
        this.renderValuesProgress();
        
        // Update trend chart
        this.updateTrendChart();
        
        this.updateAccessibilityStatus('Progress data loaded and displayed');
    }
    
    /**
     * Render the values progress section
     */
    renderValuesProgress() {
        if (!this.valuesProgressList) return;
        
        // Clear container
        this.valuesProgressList.innerHTML = '';
        
        // Add each value's progress
        this.values.forEach(value => {
            const valueElement = document.createElement('div');
            valueElement.className = 'bg-va-card-bg dark:bg-gray-800 p-6 rounded-lg shadow-md';
            valueElement.setAttribute('role', 'listitem');
            
            // Create trend icon
            const trendIcon = value.change >= 0 
                ? '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>'
                : '<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>';
                
            // Create trend class
            const trendClass = value.change >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400';
                
            valueElement.innerHTML = `
                <div class="flex flex-wrap justify-between items-center mb-3">
                    <h3 class="text-xl font-semibold text-va-text dark:text-gray-200 font-montserrat">${value.name}</h3>
                    <div class="flex items-center">
                        <span class="text-lg font-bold text-va-primary dark:text-green-400 mr-2">${value.score}%</span>
                        <span class="${trendClass} flex items-center text-sm">
                            ${trendIcon}
                            ${value.change > 0 ? '+' : ''}${value.change}%
                        </span>
                    </div>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3" aria-hidden="true">
                    <div class="bg-va-primary dark:bg-green-500 h-2.5 rounded-full" style="width: ${value.score}%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <p>Last week: ${value.previousScore}%</p>
                    <p>${value.actsThisWeek} act${value.actsThisWeek !== 1 ? 's' : ''} this week</p>
                </div>
                ${value.needsAttention ? `
                <div class="mt-3 bg-yellow-50 dark:bg-amber-900/20 border border-yellow-200 dark:border-amber-800 rounded p-3">
                    <p class="text-sm text-yellow-800 dark:text-amber-400">This value needs more attention. Try setting a specific goal to improve.</p>
                </div>
                ` : ''}
            `;
            
            this.valuesProgressList.appendChild(valueElement);
        });
    }
    
    /**
     * Update the trend chart
     * In a real implementation, this would use a charting library
     */
    updateTrendChart() {
        if (!this.trendChartPlaceholder) return;
        
        // Clear container
        this.trendChartPlaceholder.innerHTML = '';
        
        // Get trend data based on current view
        const trendData = this.getTrendData();
        
        // In a real implementation, we would render a chart
        // For this example, show a placeholder with the data
        const chartInfo = document.createElement('div');
        chartInfo.className = 'text-center';
        chartInfo.innerHTML = `
            <p class="text-lg font-medium text-va-primary dark:text-green-400 mb-2">
                ${this.currentTrendView === 'monthly' ? 'Monthly' : 'Yearly'} Alignment Trend
            </p>
            <p class="text-gray-700 dark:text-gray-300">
                This is where a ${this.currentTrendView} chart would be rendered using Chart.js or similar library.
            </p>
            <p class="text-gray-700 dark:text-gray-300 mt-2">
                Trend shows an overall ${trendData.overall > 0 ? 'increase' : 'decrease'} of ${Math.abs(trendData.overall)}% 
                over the past ${trendData.period}.
            </p>
        `;
        
        this.trendChartPlaceholder.appendChild(chartInfo);
    }
    
    /**
     * Get trend data based on current view
     * @returns {Object} Trend data object
     */
    getTrendData() {
        if (this.currentTrendView === 'monthly') {
            return {
                overall: 23,
                period: '3 months'
            };
        } else {
            return {
                overall: 35,
                period: '12 months'
            };
        }
    }
}

// Initialize the progress manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.progressManager = new ProgressManager();
});
