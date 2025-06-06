// js/account.js - Account page functionality for ValueAlign Eleventy
"use strict";

document.addEventListener('DOMContentLoaded', () => {
    console.log('[AccountPage] DOMContentLoaded - Attempting to populate account details.');

    // Use a small timeout to ensure auth service is fully initialized
    setTimeout(() => {
        // Check for auth service
        if (typeof window.authService !== 'object' || !window.authService) {
            console.error('[AccountPage] authService not found. auth-service.js might not be loaded correctly.');
            redirectToLogin();
            return;
        }

        // Get current user from modern auth service
        const user = window.authService.getCurrentUser();

        if (!user) {
            console.error('[AccountPage] No logged-in user data found. Cannot populate account details.');
            redirectToLogin();
            return;
        }
        
        console.log('[AccountPage] User authenticated successfully:', user.email);
        initializeAccountPage(user);
    }, 100);
    
    // Function to redirect to login
    function redirectToLogin() {
        console.log('[AccountPage] Redirecting to login');
        localStorage.setItem('auth_redirect_after_login', window.location.pathname);
        window.location.href = '/login/';
    }
    
    // Function to initialize the account page with user data
    function initializeAccountPage(user) {

        console.log('[AccountPage] Current user data:', user);

        // --- Populate Profile Information ---
        const displayNameEl = document.getElementById('display-name');
        if (displayNameEl) {
            // Use name from user object or fallback to email
            const displayName = user.name || user.email.split('@')[0];
            displayNameEl.value = displayName;
        }

        const emailEl = document.getElementById('email');
        if (emailEl) {
            emailEl.value = user.email;
            // Make email field readonly as it's the primary identifier
            emailEl.setAttribute('readonly', true);
            emailEl.classList.add('bg-gray-100');
        }
        
        // Initialize theme preference controls
        initializeThemeControls();
    }
    
    // Function to initialize theme preference controls
    function initializeThemeControls() {
        console.log('[AccountPage] Initializing theme controls');
        
        // Ensure theme-system.js is loaded
        if (typeof window.themeSystem !== 'object' || !window.themeSystem) {
            console.error('[AccountPage] themeSystem not found. theme-system.js might not be loaded correctly.');
            return;
        }
        
        const themeRadios = document.querySelectorAll('input[name="theme-option"]');
        if (!themeRadios.length) {
            console.warn('[AccountPage] Theme radio buttons not found in the DOM');
            return;
        }
        
        // Get current theme preference
        const currentTheme = window.themeSystem.getCurrentTheme();
        console.log('[AccountPage] Current theme:', currentTheme);
        
        // Set the appropriate radio button based on current theme
        Array.from(themeRadios).forEach(radio => {
            if (radio.value === currentTheme) {
                radio.checked = true;
            }
            
            // Add event listener to each radio button
            radio.addEventListener('change', function() {
                if (this.checked) {
                    console.log('[AccountPage] Theme changed to:', this.value);
                    window.themeSystem.setTheme(this.value);
                    updateAccessibilityStatus(`Theme changed to ${this.value} mode`);
                }
            });
        });
        
        // Listen for theme changes from other parts of the app
        window.addEventListener('themechange', function(e) {
            if (e && e.detail && e.detail.theme) {
                console.log('[AccountPage] Theme changed event received:', e.detail.theme);
                
                // Update radio buttons to match
                Array.from(themeRadios).forEach(radio => {
                    radio.checked = (radio.value === e.detail.theme);
                });
            }
        });
    }

        // --- Populate Account Settings ---
        const notificationEl = document.getElementById('notification-preference');
        if (notificationEl) {
            // Default to 'yes' if not set
            notificationEl.value = user.notificationsEnabled !== false ? 'yes' : 'no';
        }

        const languageEl = document.getElementById('language-preference');
        if (languageEl) {
            // Default to 'en' if not set
            languageEl.value = user.language || 'en';
        }
        
        // --- Add Subscription Information ---
        // You'd populate subscription info here if needed
        
        // Save profile changes button
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                // In a real implementation, we would save to API
                updateAccessibilityStatus('Profile information saved successfully');
                alert('Profile information saved successfully.');
            });
        }

        // Change password button
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                const currentPassword = document.getElementById('current-password');
                const newPassword = document.getElementById('new-password');
                const confirmPassword = document.getElementById('confirm-password');
                
                if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
                    updateAccessibilityStatus('Please fill all password fields');
                    alert('Please fill all password fields');
                    return;
                }
                
                if (newPassword.value !== confirmPassword.value) {
                    updateAccessibilityStatus('New passwords do not match');
                    alert('New passwords do not match');
                    return;
                }
                
                // In a real implementation, we would call the API to change password
                updateAccessibilityStatus('Password changed successfully');
                alert('Password changed successfully');
                
                // Clear fields
                currentPassword.value = '';
                newPassword.value = '';
                confirmPassword.value = '';
            });
        }
        
        // Update payment button
        const updatePaymentBtn = document.getElementById('update-payment-btn');
        if (updatePaymentBtn) {
            updatePaymentBtn.addEventListener('click', () => {
                // In a real implementation, this would open a payment form or redirect to payment provider
                updateAccessibilityStatus('Payment method update feature coming soon');
                alert('Payment method update feature coming soon');
            });
        }
        
        // Export data button
        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                updateAccessibilityStatus('Preparing your data export');
                alert('Your data export is being prepared and will be emailed to you.');
            });
        }
        
        // Delete account button
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
                    updateAccessibilityStatus('Account deletion process initiated');
                    alert('Account deletion process initiated. You will receive a confirmation email.');
                }
            });
        }
    }
    
    /**
     * Update accessibility status for screen readers
     * @param {string} message - The message to announce
     */
    function updateAccessibilityStatus(message) {
        const statusEl = document.getElementById('account-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }
});
