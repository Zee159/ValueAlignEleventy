/**
 * Newsletter Subscription Service
 * Handles user newsletter signups and integration with backend services
 */

(function() {
    'use strict';

    const ENDPOINT = '/api/newsletter/subscribe'; // This would be replaced with actual API endpoint
    const LOCAL_STORAGE_KEY = 'va_newsletter_subscribed';

    class NewsletterService {
        constructor() {
            this.initialized = false;
            this.subscriptionStatus = {
                subscribed: false,
                email: null,
                timestamp: null
            };
        }

        init() {
            if (this.initialized) return;
            
            // Check if user has already subscribed from this browser
            this._loadSubscriptionState();
            this.initialized = true;
            
            console.log('[NewsletterService] Initialized');
        }

        /**
         * Submit a newsletter subscription
         * @param {Object} data - Subscription data (email, name, etc.)
         * @returns {Promise} - Result of the subscription attempt
         */
        async subscribe(data) {
            if (!data || !data.email) {
                return Promise.reject(new Error('Email is required'));
            }

            try {
                // In production environment, this would call the deployed API endpoint
                // For local development, we'll simulate the request
                
                // Determine if we're in a production environment
                const isProduction = window.location.hostname !== 'localhost' && 
                                    !window.location.hostname.includes('127.0.0.1');
                
                let result;
                
                if (isProduction) {
                    // Production API call to serverless function
                    const response = await fetch('/api/newsletter/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: data.email,
                            source: 'website_footer'
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Server returned ' + response.status);
                    }
                    
                    result = await response.json();
                } else {
                    // Local development simulation
                    console.log('[NewsletterService] Dev mode - simulating API call');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    result = {
                        success: true,
                        message: 'Thank you for subscribing to our newsletter!'
                    };
                }
                
                // Store subscription in local storage to prevent repeated prompts
                this._saveSubscriptionState(data.email);
                
                // Dispatch custom event for any listeners
                window.dispatchEvent(new CustomEvent('newsletter_subscribed', {
                    detail: { email: data.email }
                }));
                
                return result;
            } catch (error) {
                console.error('[NewsletterService] Error:', error);
                return {
                    success: false,
                    message: 'There was an error processing your subscription. Please try again.'
                };
            }
        }

        /**
         * Check if current user appears to be subscribed already
         */
        isSubscribed() {
            return this.subscriptionStatus.subscribed;
        }

        /**
         * Load subscription state from local storage
         * @private
         */
        _loadSubscriptionState() {
            try {
                const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    this.subscriptionStatus = {
                        subscribed: true,
                        email: parsed.email,
                        timestamp: parsed.timestamp
                    };
                }
            } catch (e) {
                console.warn('[NewsletterService] Could not load subscription state', e);
            }
        }

        /**
         * Save subscription state to local storage
         * @private
         * @param {string} email - Email that was subscribed
         */
        _saveSubscriptionState(email) {
            try {
                const data = {
                    email: email,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
                this.subscriptionStatus = {
                    subscribed: true,
                    email: email,
                    timestamp: data.timestamp
                };
            } catch (e) {
                console.warn('[NewsletterService] Could not save subscription state', e);
            }
        }
    }

    // Create a singleton instance
    const newsletterService = new NewsletterService();

    // Register globally
    window.newsletterService = newsletterService;

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        newsletterService.init();
    });

    // Handle newsletter form submissions
    document.addEventListener('submit', (event) => {
        const form = event.target;
        
        // Check if this is a newsletter form
        if (form && form.getAttribute('data-form-type') === 'newsletter') {
            event.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const submitBtn = form.querySelector('button[type="submit"]');
            const statusElement = form.querySelector('.newsletter-status') || document.createElement('div');
            
            if (!emailInput) return;
            
            // Disable form while processing
            if (submitBtn) submitBtn.disabled = true;
            if (!statusElement.classList.contains('newsletter-status')) {
                statusElement.className = 'newsletter-status text-sm mt-2';
                form.appendChild(statusElement);
            }
            
            // Process subscription
            newsletterService.subscribe({
                email: emailInput.value.trim()
            }).then(result => {
                // Show success/error message
                statusElement.textContent = result.message;
                statusElement.className = `newsletter-status text-sm mt-2 ${result.success ? 'text-green-600' : 'text-red-600'}`;
                
                // Reset form on success
                if (result.success) {
                    form.reset();
                    setTimeout(() => {
                        statusElement.textContent = '';
                    }, 5000);
                }
            }).finally(() => {
                if (submitBtn) submitBtn.disabled = false;
            });
        }
    });

})();

// ES Module export for modern usage
if (typeof module !== 'undefined') {
    module.exports = window.newsletterService;
}
