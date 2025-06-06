/**
 * Accessibility helpers for the ValueAlign Core Values Assessment
 * These utilities enhance keyboard navigation, screen reader support, and focus management
 */

/**
 * Shows an accessibility help dialog with keyboard shortcuts
 * @param {Function} announce - Function to announce messages to screen readers
 * @param {Object} keyboardTrap - Keyboard trap utility for focus management
 */
function showAccessibilityHelp(announce, keyboardTrap) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'accessibility-help-modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'help-dialog-title');
    
    // Create modal content
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <h2 id="help-dialog-title" class="text-xl font-bold mb-4 flex justify-between items-center">
                Keyboard Navigation Help
                <button id="close-help-dialog" class="text-gray-400 hover:text-gray-600" aria-label="Close help dialog">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </h2>
            
            <p class="mb-4">You can use the following keyboard shortcuts to navigate the assessment:</p>
            
            <table class="w-full border-collapse mb-4">
                <thead>
                    <tr>
                        <th class="border p-2 text-left bg-gray-100">Shortcut</th>
                        <th class="border p-2 text-left bg-gray-100">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="border p-2"><kbd class="bg-gray-200 px-2 py-1 rounded">Tab</kbd></td>
                        <td class="border p-2">Move focus to the next interactive element</td>
                    </tr>
                    <tr>
                        <td class="border p-2"><kbd class="bg-gray-200 px-2 py-1 rounded">Shift + Tab</kbd></td>
                        <td class="border p-2">Move focus to the previous interactive element</td>
                    </tr>
                    <tr>
                        <td class="border p-2"><kbd class="bg-gray-200 px-2 py-1 rounded">Alt + ←</kbd></td>
                        <td class="border p-2">Go to previous step</td>
                    </tr>
                    <tr>
                        <td class="border p-2"><kbd class="bg-gray-200 px-2 py-1 rounded">Alt + →</kbd></td>
                        <td class="border p-2">Go to next step</td>
                    </tr>
                    <tr>
                        <td class="border p-2"><kbd class="bg-gray-200 px-2 py-1 rounded">Alt + (1-4)</kbd></td>
                        <td class="border p-2">Jump to completed steps</td>
                    </tr>
                    <tr>
                        <td class="border p-2"><kbd class="bg-gray-200 px-2 py-1 rounded">Space / Enter</kbd></td>
                        <td class="border p-2">Activate buttons or toggle selections</td>
                    </tr>
                    <tr>
                        <td class="border p-2"><kbd class="bg-gray-200 px-2 py-1 rounded">?</kbd></td>
                        <td class="border p-2">Show this help dialog</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
                <h3 class="font-bold mb-2">Values Selection</h3>
                <ul class="list-disc pl-5">
                    <li>Use <kbd class="bg-gray-200 px-1 rounded">Tab</kbd> to navigate between value cards</li>
                    <li>Press <kbd class="bg-gray-200 px-1 rounded">Space</kbd> to select/deselect a value</li>
                    <li>Use <kbd class="bg-gray-200 px-1 rounded">Tab</kbd> to move between category tabs</li>
                </ul>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
                <h3 class="font-bold mb-2">Values Prioritization</h3>
                <ul class="list-disc pl-5">
                    <li>Use <kbd class="bg-gray-200 px-1 rounded">Tab</kbd> to navigate between values</li>
                    <li>Use <kbd class="bg-gray-200 px-1 rounded">↑/↓</kbd> to move a selected value up/down</li>
                    <li>Press <kbd class="bg-gray-200 px-1 rounded">Space</kbd> to select a value for reordering</li>
                </ul>
            </div>
            
            <div class="mt-6 text-center">
                <button id="help-dismiss" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                    Close Help
                </button>
            </div>
        </div>
    `;
    
    // Add to the document
    document.body.appendChild(modal);
    
    // Set up keyboard trap for the modal
    keyboardTrap.activate(modal);
    
    // Add event listeners for close buttons
    const closeHelpDialog = document.getElementById('close-help-dialog');
    const helpDismiss = document.getElementById('help-dismiss');
    
    const closeModal = () => {
        document.body.removeChild(modal);
        keyboardTrap.deactivate();
    };
    
    closeHelpDialog.addEventListener('click', closeModal);
    helpDismiss.addEventListener('click', closeModal);
    
    // Also close when clicking backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Escape key to close
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
    
    // Announce for screen readers
    announce('Accessibility help dialog opened. Press Escape to close.');
}

/**
 * Creates a keyboard trap for modal dialogs
 * @returns {Object} Keyboard trap object with activate/deactivate methods
 */
function createKeyboardTrap() {
    return {
        active: false,
        container: null,
        focusableElements: null,
        firstFocusableElement: null,
        lastFocusableElement: null,
        previousActiveElement: null,
        
        activate(container) {
            this.active = true;
            this.container = container;
            this.previousActiveElement = document.activeElement;
            
            // Find all focusable elements
            this.focusableElements = container.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (this.focusableElements.length) {
                this.firstFocusableElement = this.focusableElements[0];
                this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1];
                this.firstFocusableElement.focus();
                
                // Add event listener for tab key
                document.addEventListener('keydown', this.handleKeyDown);
            }
        },
        
        deactivate() {
            if (this.active) {
                document.removeEventListener('keydown', this.handleKeyDown);
                if (this.previousActiveElement) {
                    this.previousActiveElement.focus();
                }
                this.active = false;
                this.container = null;
                this.focusableElements = null;
                this.firstFocusableElement = null;
                this.lastFocusableElement = null;
                this.previousActiveElement = null;
            }
        },
        
        handleKeyDown: function(e) {
            const trap = this;
            if (!trap.active || e.key !== 'Tab') return;
            
            // Trap the tab key to cycle within the modal
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === trap.firstFocusableElement) {
                    e.preventDefault();
                    trap.lastFocusableElement.focus();
                }
            } else { // Tab
                if (document.activeElement === trap.lastFocusableElement) {
                    e.preventDefault();
                    trap.firstFocusableElement.focus();
                }
            }
        }
    };
}

/**
 * Adds a skip to content link for keyboard users
 * @param {string} contentId - ID of the main content container 
 */
function addSkipToContentLink(contentId) {
    // Check if there's already a skip link
    let skipLink = document.getElementById('skip-to-content');
    
    if (!skipLink) {
        skipLink = document.createElement('a');
        skipLink.id = 'skip-to-content';
        skipLink.href = `#${contentId}`;
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:p-4 focus:border focus:border-blue-500 focus:rounded-md';
        skipLink.textContent = 'Skip to content';
        
        // Insert at the top of the page
        const mainElement = document.querySelector('[role="main"]');
        if (mainElement && mainElement.firstChild) {
            mainElement.insertBefore(skipLink, mainElement.firstChild);
        }
        
        // Add event listener to set focus when clicked
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const contentElement = document.getElementById(contentId);
            if (contentElement) {
                contentElement.setAttribute('tabindex', '-1');
                contentElement.focus();
                // Remove the tabindex after focus to avoid keyboard navigation issues
                setTimeout(() => contentElement.removeAttribute('tabindex'), 1000);
            }
        });
    }
}

/**
 * Sets up keyboard shortcuts for navigation
 * @param {Object} options - Configuration options
 * @param {Function} options.announce - Function to announce messages
 * @param {Function} options.goToPrevStep - Function to go to previous step
 * @param {Function} options.goToNextStep - Function to go to next step
 * @param {Function} options.jumpToStep - Function to jump to a specific step
 * @param {Function} options.showHelp - Function to show help dialog
 * @param {HTMLElement} options.prevButton - Previous button element
 * @param {HTMLElement} options.nextButton - Next button element
 */
function setupKeyboardShortcuts(options) {
    document.addEventListener('keydown', (e) => {
        // Only process shortcuts if not in a form field
        const isInFormField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
        if (isInFormField) return;
        
        // Alt + arrow shortcuts for navigation
        if (e.altKey) {
            switch (e.key) {
                case 'ArrowLeft': // Previous step
                    if (options.prevButton && !options.prevButton.disabled) {
                        e.preventDefault();
                        options.goToPrevStep();
                        options.announce('Moving to previous step');
                    }
                    break;
                    
                case 'ArrowRight': // Next step
                    if (options.nextButton && !options.nextButton.disabled) {
                        e.preventDefault();
                        options.goToNextStep();
                        options.announce('Moving to next step');
                    }
                    break;
                    
                case '1': case '2': case '3': case '4': // Jump to step
                    e.preventDefault();
                    const stepNum = parseInt(e.key);
                    options.jumpToStep(stepNum);
                    break;
            }
        }
        
        // Help dialog
        if (e.key === '?') {
            e.preventDefault();
            options.showHelp();
        }
    });
}

// Export functions for use in values-assessment.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showAccessibilityHelp,
        createKeyboardTrap,
        addSkipToContentLink,
        setupKeyboardShortcuts
    };
} else if (typeof window !== 'undefined') {
    // Add to window for browser usage
    window.accessibilityHelpers = {
        showAccessibilityHelp,
        createKeyboardTrap,
        addSkipToContentLink,
        setupKeyboardShortcuts
    };
}
