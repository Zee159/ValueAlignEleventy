/**
 * ValueAlign Form Utilities
 * A collection of reusable form handling utilities for ValueAlign forms
 */

const FormUtils = {
  /**
   * Submit form data to the specified endpoint
   * 
   * @param {Object} formData - Form data to submit
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional request options
   * @returns {Promise} - Resolves with response data or rejects with error
   */
  submitForm: async function(formData, endpoint, options = {}) {
    try {
      console.log('[FormUtils] Submitting form data to:', endpoint);
      
      // In a production environment, this would be a real API call
      // For now, we'll simulate a network request
      // Replace this with an actual fetch call when API is available
      return await this.simulateSubmission(formData, options);
    } catch (error) {
      console.error('[FormUtils] Error submitting form:', error);
      throw error;
    }
  },
  
  /**
   * Validate common form fields
   * 
   * @param {Object} formData - Form data to validate
   * @param {Array} requiredFields - Array of fields that must not be empty
   * @returns {Object} - Object with isValid boolean and any validation errors
   */
  validateForm: function(formData, requiredFields = []) {
    const errors = {};
    
    // Check required fields
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = 'This field is required';
      }
    }
    
    // Email validation if email is present
    if (formData.email && !this.isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  },
  
  /**
   * Check if email is valid format
   * 
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether email is valid
   */
  isValidEmail: function(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  },
  
  /**
   * Simulate a form submission with artificial delay
   * This is a temporary solution until a real API is available
   * 
   * @param {Object} formData - Form data to submit
   * @param {Object} options - Simulation options
   * @returns {Promise} - Resolves with success response or rejects with error
   */
  simulateSubmission: function(formData, { delay = 1500, successRate = 0.9 } = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Log the data that would be sent
        console.log('[FormUtils] Form data:', formData);
        
        // Simulate success most of the time, occasional failure for testing
        if (Math.random() < successRate) {
          resolve({
            success: true,
            message: 'Form submitted successfully',
            id: `form-${Date.now()}`
          });
        } else {
          reject(new Error('Simulated form submission error'));
        }
      }, delay);
    });
  },
  
  /**
   * Format form data from a form element
   * 
   * @param {HTMLFormElement} formElement - The form element to extract data from
   * @returns {Object} - Formatted form data object
   */
  getFormData: function(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }
};

// Make available globally and as a module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormUtils;
} else if (typeof window !== 'undefined') {
  window.FormUtils = FormUtils;
}
