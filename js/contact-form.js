/**
 * Contact Form Handler
 * Manages form submission, validation and feedback for the contact form
 * Follows ValueAlign's progressive enhancement and accessibility standards
 */

(function() {
  'use strict';

  // Initialize when DOM is ready or when FormUtils is available
  function initContactForm() {
    // Check if dependencies are available
    if (typeof FormUtils === 'undefined') {
      console.warn('[ContactForm] FormUtils module not found, retrying in 200ms');
      setTimeout(initContactForm, 200); // Retry initialization
      return;
    }
    
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitButton = document.getElementById('submit-button');
    const spinner = document.getElementById('spinner');
    
    // Exit if form doesn't exist on this page
    if (!contactForm) {
      console.log('[ContactForm] Contact form not found on this page');
      return;
    }
    
    console.log('[ContactForm] Initializing contact form handler');
    
    // Add accessible announcement for screen readers when form status changes
    const createStatusAnnouncer = function() {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.classList.add('sr-only'); // Screen reader only
      document.body.appendChild(announcer);
      return announcer;
    };
    
    const statusAnnouncer = createStatusAnnouncer();
    
    // Form submission handler
    contactForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // Reset form status
      formStatus.className = 'hidden';
      formStatus.textContent = '';
      
      // Show loading spinner and update button state
      submitButton.disabled = true;
      spinner.classList.remove('hidden');
      submitButton.setAttribute('aria-busy', 'true');
      
      // Collect form data
      const formData = FormUtils.getFormData(contactForm);
      
      // Validate the form data
      const validation = FormUtils.validateForm(formData, ['name', 'email', 'subject', 'message']);
      
      if (!validation.isValid) {
        // Show first validation error
        const firstError = Object.values(validation.errors)[0];
        showFormError(firstError);
        return;
      }
      
      try {
        // Submit the form data (using simulation for now)
        const response = await FormUtils.submitForm(formData, '/api/contact', {
          delay: 1500,
          successRate: 0.9 // 90% success rate for testing
        });
        
        // Show success message
        showFormSuccess('Thank you for your message! We\'ll get back to you soon.');
        
        // Track form submission success if analytics is available
        if (typeof window.analytics !== 'undefined') {
          window.analytics.track('Contact Form Submitted', {
            formType: 'contact',
            page: window.location.pathname
          });
        }
        
        // Reset the form
        contactForm.reset();
        
      } catch (error) {
        // Show error message
        showFormError('Sorry, there was a problem sending your message. Please try again later.');
        console.error('[ContactForm] Submission error:', error);
      }
    });
    
    /**
     * Display a form error message
     * @param {string} message - The error message to display
     */
    function showFormError(message) {
      formStatus.className = 'p-4 mb-4 text-sm rounded-md bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      formStatus.textContent = message;
      formStatus.setAttribute('aria-live', 'assertive');
      
      // Announce to screen readers
      statusAnnouncer.textContent = 'Error: ' + message;
      
      // Reset button state
      submitButton.disabled = false;
      spinner.classList.add('hidden');
      submitButton.setAttribute('aria-busy', 'false');
      
      // Focus on the status message for screen readers
      formStatus.tabIndex = -1;
      formStatus.focus();
    }
    
    /**
     * Display a form success message
     * @param {string} message - The success message to display
     */
    function showFormSuccess(message) {
      formStatus.className = 'p-4 mb-4 text-sm rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      formStatus.textContent = message;
      formStatus.setAttribute('aria-live', 'polite');
      
      // Announce to screen readers
      statusAnnouncer.textContent = message;
      
      // Reset button state
      submitButton.disabled = false;
      spinner.classList.add('hidden');
      submitButton.setAttribute('aria-busy', 'false');
      
      // Focus on the status message for screen readers
      formStatus.tabIndex = -1;
      formStatus.focus();
    }
    
    // Initialize form with default state
    formStatus.className = 'hidden';
    formStatus.setAttribute('role', 'status');
  }
  
  // Start form initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
