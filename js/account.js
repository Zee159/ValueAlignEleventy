// js/account.js - Account page functionality for ValueAlign Eleventy
"use strict";

document.addEventListener('DOMContentLoaded', () => {
    console.log('[AccountPage] DOMContentLoaded - Attempting to populate account details.');

    // Check for auth manager (should be loaded by this point)
    if (typeof authManager !== 'object' || !authManager) {
        console.error('[AccountPage] authManager not found. auth-manager.js might not be loaded correctly before account.js.');
        return;
    }

    // Get current user from auth manager
    const user = authManager.getCurrentUser();

    if (!user) {
        console.error('[AccountPage] No logged-in user data found. Cannot populate account details.');
        // auth-manager.js should handle redirects for protected pages if user is null.
        return;
    }

    console.log('[AccountPage] Current user data:', user);

    // --- Populate Profile Information ---
    const accountNameEl = document.getElementById('account-name');
    if (accountNameEl) {
        // Use name from user object or fallback to email
        const displayName = user.name || user.email.split('@')[0];
        accountNameEl.value = displayName;
    }

    const accountEmailEl = document.getElementById('account-email');
    if (accountEmailEl) {
        accountEmailEl.value = user.email || 'N/A';
    }

    // --- Populate Membership Status ---
    const subscriptionPlanEl = document.getElementById('subscription-plan');
    if (subscriptionPlanEl) {
        const subscription = user.subscription || 'free';
        const tier = subscription.charAt(0).toUpperCase() + subscription.slice(1);
        subscriptionPlanEl.textContent = `${tier} Plan`;
        
        // Update ARIA for accessibility
        updateAccessibilityStatus(`Your current plan is the ${tier} plan`);
    }

    const renewalDateEl = document.getElementById('renewal-date');
    if (renewalDateEl && user.subscriptionExpiry) {
        try {
            const date = new Date(user.subscriptionExpiry);
            renewalDateEl.textContent = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (e) {
            console.error("Error parsing subscription expiry date:", e);
            renewalDateEl.textContent = 'N/A';
        }
    } else if (renewalDateEl) {
        // Default text if no expiry date exists
        const subscriptionType = user.subscription || 'free';
        if (subscriptionType.toLowerCase() === 'free') {
            renewalDateEl.textContent = 'N/A (Free Plan)';
        } else {
            renewalDateEl.textContent = 'Auto-renewal enabled';
        }
    }

    // --- Setup Button Event Listeners ---
    setupButtonListeners();
    
    console.log('[AccountPage] Account details population complete.');
});

/**
 * Setup event listeners for account page buttons
 */
function setupButtonListeners() {
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
