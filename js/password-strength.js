/**
 * Password Strength Meter
 * Uses a combination of rules to determine password strength
 */
"use strict";

const VAPasswordStrength = {
  /**
   * Calculate password strength score (0-100)
   * @param {string} password - The password to analyze
   * @returns {Object} - Score (0-100) and feedback
   */
  calculateStrength: function(password) {
    if (!password) return { score: 0, feedback: "Password is required", level: 'none' };
    
    // Basic strength metrics
    let score = 0;
    let feedback = [];
    
    // Length check (up to 35 points)
    if (password.length >= 12) {
      score += 35;
    } else if (password.length >= 10) {
      score += 25;
    } else if (password.length >= 8) {
      score += 15;
    } else {
      feedback.push("Password should be at least 8 characters");
    }
    
    // Complexity checks (up to 65 points)
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
    
    // Award points for complexity
    if (hasLowercase) score += 15;
    if (hasUppercase) score += 15;
    if (hasNumbers) score += 15;
    if (hasSpecialChars) score += 20;
    
    // Generate feedback
    if (!hasLowercase) feedback.push("Add lowercase letters");
    if (!hasUppercase) feedback.push("Add uppercase letters");
    if (!hasNumbers) feedback.push("Add numbers");
    if (!hasSpecialChars) feedback.push("Add special characters (e.g., !@#$%)");
    
    // Common password checks
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      score = Math.min(score, 10);
      feedback.push("This is a commonly used password");
    }
    
    // Sequential characters check
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/.test(password.toLowerCase())) {
      score = Math.max(score - 15, 0);
      feedback.push("Avoid sequential characters");
    }
    
    // Repeated characters check
    if (/(.)\1{2,}/.test(password)) {
      score = Math.max(score - 15, 0);
      feedback.push("Avoid repeated characters");
    }
    
    // Determine strength level
    let level;
    if (score < 30) {
      level = 'very-weak';
    } else if (score < 50) {
      level = 'weak';
    } else if (score < 70) {
      level = 'medium';
    } else if (score < 90) {
      level = 'strong';
    } else {
      level = 'very-strong';
    }
    
    // Default feedback if none exists but score is low
    if (feedback.length === 0 && score < 50) {
      feedback.push("Try a more complex password");
    }
    
    return {
      score,
      level,
      feedback: feedback.join('. ')
    };
  },
  
  /**
   * Get display text for password strength level
   * @param {string} level - The strength level
   * @returns {string} - Display text
   */
  getLevelText: function(level) {
    const texts = {
      'none': 'Enter a password',
      'very-weak': 'Very weak',
      'weak': 'Weak',
      'medium': 'Medium',
      'strong': 'Strong',
      'very-strong': 'Very strong'
    };
    return texts[level] || 'Unknown';
  },
  
  /**
   * Get color class for password strength level
   * @param {string} level - The strength level
   * @returns {string} - CSS color class
   */
  getLevelColorClass: function(level) {
    const colors = {
      'none': 'bg-gray-300 dark:bg-gray-600',
      'very-weak': 'bg-red-500 dark:bg-red-600',
      'weak': 'bg-orange-500 dark:bg-orange-600',
      'medium': 'bg-yellow-500 dark:bg-yellow-600',
      'strong': 'bg-green-500 dark:bg-green-600',
      'very-strong': 'bg-teal-500 dark:bg-teal-600'
    };
    return colors[level] || 'bg-gray-300 dark:bg-gray-600';
  },
  
  /**
   * Initialize the password strength meter on inputs
   * @param {string|Element} passwordInput - Password input selector or element
   * @param {string|Element} meterElement - Meter element selector or element
   * @param {string|Element} textElement - Text element selector or element
   * @param {string|Element} feedbackElement - Feedback element selector or element (optional)
   */
  initStrengthMeter: function(passwordInput, meterElement, textElement, feedbackElement = null) {
    // Resolve elements
    passwordInput = typeof passwordInput === 'string' ? document.querySelector(passwordInput) : passwordInput;
    meterElement = typeof meterElement === 'string' ? document.querySelector(meterElement) : meterElement;
    textElement = typeof textElement === 'string' ? document.querySelector(textElement) : textElement;
    
    if (feedbackElement) {
      feedbackElement = typeof feedbackElement === 'string' ? document.querySelector(feedbackElement) : feedbackElement;
    }
    
    if (!passwordInput || !meterElement || !textElement) {
      console.error('[PasswordStrength] Missing required elements');
      return;
    }
    
    // Update the meter on password change
    const updateMeter = () => {
      const result = this.calculateStrength(passwordInput.value);
      
      // Update meter width
      meterElement.style.width = `${result.score}%`;
      
      // Remove all color classes and add the appropriate one
      const colorClasses = ['bg-gray-300', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-teal-500',
                           'dark:bg-gray-600', 'dark:bg-red-600', 'dark:bg-orange-600', 'dark:bg-yellow-600', 'dark:bg-green-600', 'dark:bg-teal-600'];
      
      meterElement.classList.remove(...colorClasses);
      meterElement.classList.add(...this.getLevelColorClass(result.level).split(' '));
      
      // Update text
      textElement.textContent = this.getLevelText(result.level);
      
      // Update feedback if element exists
      if (feedbackElement) {
        feedbackElement.textContent = result.feedback || '';
      }
    };
    
    // Setup events
    passwordInput.addEventListener('input', updateMeter);
    passwordInput.addEventListener('change', updateMeter);
    
    // Initial update if password has value
    if (passwordInput.value) {
      updateMeter();
    }
    
    return {
      update: updateMeter
    };
  }
};

// Make available in both module and global contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VAPasswordStrength;
} else {
  window.VAPasswordStrength = VAPasswordStrength;
}

console.log('[PasswordStrength] Password strength meter initialized');
