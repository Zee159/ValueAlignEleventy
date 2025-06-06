/**
 * Browser Compatibility Test Helper
 * This script helps identify browser-specific issues in the Values Assessment workflow
 */

class BrowserCompatibilityTest {
    /**
     * Initialize the testing tool
     */
    constructor() {
        this.browserInfo = this.detectBrowser();
        this.testResults = {};
        this.initUI();
    }
    
    /**
     * Detect current browser information
     * @returns {Object} Browser information
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        const browsers = {
            chrome: /chrome|chromium|crios/i,
            firefox: /firefox|fxios/i,
            safari: /safari/i,
            edge: /edg/i,
            ie: /msie|trident/i,
            opera: /opera|opr/i
        };
        
        // Detect browser
        let browserName = 'unknown';
        for (const [name, regex] of Object.entries(browsers)) {
            if (regex.test(userAgent)) {
                browserName = name;
                break;
            }
        }
        
        // Safari detection requires special handling (Chrome includes Safari in UA)
        if (browserName === 'safari' && /chrome|chromium|crios/i.test(userAgent)) {
            browserName = 'chrome';
        }
        
        // Get browser version
        let version = 'unknown';
        switch (browserName) {
            case 'chrome':
                version = userAgent.match(/(?:chrome|chromium|crios)\/([\d.]+)/i)?.[1];
                break;
            case 'firefox':
                version = userAgent.match(/(?:firefox|fxios)\/([\d.]+)/i)?.[1];
                break;
            case 'safari':
                version = userAgent.match(/version\/([\d.]+)/i)?.[1];
                break;
            case 'edge':
                version = userAgent.match(/edg\/([\d.]+)/i)?.[1];
                break;
            case 'ie':
                version = userAgent.match(/(?:msie |rv:)([\d.]+)/i)?.[1];
                break;
            case 'opera':
                version = userAgent.match(/(?:opera|opr)\/([\d.]+)/i)?.[1];
                break;
        }
        
        return {
            name: browserName,
            version: version,
            userAgent: userAgent,
            mobile: /Mobi|Android/i.test(userAgent),
            os: this.detectOS()
        };
    }
    
    /**
     * Detect operating system
     * @returns {string} Operating system name
     */
    detectOS() {
        const userAgent = navigator.userAgent;
        
        if (/Windows/i.test(userAgent)) return 'Windows';
        if (/Macintosh|Mac OS X/i.test(userAgent)) return 'macOS';
        if (/Linux/i.test(userAgent)) return 'Linux';
        if (/Android/i.test(userAgent)) return 'Android';
        if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
        
        return 'Unknown';
    }
    
    /**
     * Initialize testing UI
     */
    initUI() {
        // Create test panel if it doesn't exist
        let testPanel = document.getElementById('browser-compatibility-panel');
        if (!testPanel) {
            testPanel = document.createElement('div');
            testPanel.id = 'browser-compatibility-panel';
            testPanel.className = 'browser-test-panel';
            testPanel.style.position = 'fixed';
            testPanel.style.top = '10px';
            testPanel.style.right = '10px';
            testPanel.style.padding = '10px';
            testPanel.style.background = '#f0f0f0';
            testPanel.style.border = '1px solid #ccc';
            testPanel.style.borderRadius = '5px';
            testPanel.style.zIndex = '9999';
            testPanel.style.maxWidth = '350px';
            testPanel.style.fontSize = '14px';
            
            // Add browser info
            const browserInfo = document.createElement('div');
            browserInfo.innerHTML = `
                <h3>Browser: ${this.browserInfo.name} ${this.browserInfo.version}</h3>
                <p>OS: ${this.browserInfo.os}</p>
                <p>Mobile: ${this.browserInfo.mobile ? 'Yes' : 'No'}</p>
            `;
            testPanel.appendChild(browserInfo);
            
            // Add test controls
            const controls = document.createElement('div');
            controls.className = 'test-controls';
            
            const runButton = document.createElement('button');
            runButton.textContent = 'Run Tests';
            runButton.onclick = () => this.runTests();
            
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.style.marginLeft = '10px';
            closeButton.onclick = () => document.body.removeChild(testPanel);
            
            controls.appendChild(runButton);
            controls.appendChild(closeButton);
            testPanel.appendChild(controls);
            
            // Results container
            const results = document.createElement('div');
            results.className = 'test-results';
            testPanel.appendChild(results);
            
            // Add to page
            document.body.appendChild(testPanel);
        }
    }
    
    /**
     * Run all compatibility tests
     */
    runTests() {
        const resultsContainer = document.querySelector('#browser-compatibility-panel .test-results');
        resultsContainer.innerHTML = '<h3>Running tests...</h3>';
        
        // Run tests asynchronously
        setTimeout(() => {
            this.testResults = {
                ariaSupport: this.testAriaSupport(),
                keyboardNavigation: this.testKeyboardNavigation(),
                focusHandling: this.testFocusHandling(),
                cssSupport: this.testCSSFeatures()
            };
            
            this.displayResults(resultsContainer);
        }, 100);
    }
    
    /**
     * Test ARIA attribute support
     * @returns {Object} Test results
     */
    testAriaSupport() {
        const results = {
            passed: [],
            failed: []
        };
        
        // Test aria-label support
        try {
            const testElement = document.createElement('div');
            testElement.setAttribute('aria-label', 'Test Label');
            document.body.appendChild(testElement);
            
            // Check if attribute was set correctly
            if (testElement.getAttribute('aria-label') === 'Test Label') {
                results.passed.push('aria-label');
            } else {
                results.failed.push('aria-label');
            }
            
            document.body.removeChild(testElement);
        } catch (e) {
            results.failed.push('aria-label');
        }
        
        // Test aria-live support
        try {
            const testElement = document.createElement('div');
            testElement.setAttribute('aria-live', 'polite');
            document.body.appendChild(testElement);
            
            if (testElement.getAttribute('aria-live') === 'polite') {
                results.passed.push('aria-live');
            } else {
                results.failed.push('aria-live');
            }
            
            document.body.removeChild(testElement);
        } catch (e) {
            results.failed.push('aria-live');
        }
        
        // Test role support
        try {
            const testElement = document.createElement('div');
            testElement.setAttribute('role', 'button');
            document.body.appendChild(testElement);
            
            if (testElement.getAttribute('role') === 'button') {
                results.passed.push('role');
            } else {
                results.failed.push('role');
            }
            
            document.body.removeChild(testElement);
        } catch (e) {
            results.failed.push('role');
        }
        
        return results;
    }
    
    /**
     * Test keyboard navigation support
     * @returns {Object} Test results
     */
    testKeyboardNavigation() {
        const results = {
            passed: [],
            failed: []
        };
        
        // Test tab key handling
        if (typeof document.activeElement !== 'undefined') {
            results.passed.push('activeElement');
        } else {
            results.failed.push('activeElement');
        }
        
        // Test key event handling
        const keyEvents = ['keydown', 'keyup', 'keypress'];
        keyEvents.forEach(event => {
            try {
                const testHandler = () => {};
                document.addEventListener(event, testHandler);
                document.removeEventListener(event, testHandler);
                results.passed.push(event);
            } catch (e) {
                results.failed.push(event);
            }
        });
        
        return results;
    }
    
    /**
     * Test focus handling
     * @returns {Object} Test results
     */
    testFocusHandling() {
        const results = {
            passed: [],
            failed: []
        };
        
        // Test focus/blur events
        try {
            const testElement = document.createElement('button');
            document.body.appendChild(testElement);
            
            let focusFired = false;
            let blurFired = false;
            
            testElement.addEventListener('focus', () => { focusFired = true; });
            testElement.addEventListener('blur', () => { blurFired = true; });
            
            testElement.focus();
            if (document.activeElement === testElement) {
                results.passed.push('focus');
            } else {
                results.failed.push('focus');
            }
            
            document.body.focus();
            if (document.activeElement !== testElement) {
                results.passed.push('blur');
            } else {
                results.failed.push('blur');
            }
            
            document.body.removeChild(testElement);
        } catch (e) {
            results.failed.push('focus-events');
        }
        
        return results;
    }
    
    /**
     * Test CSS feature support
     * @returns {Object} Test results
     */
    testCSSFeatures() {
        const results = {
            passed: [],
            failed: []
        };
        
        // Test CSS features using feature detection
        const cssFeatures = [
            { name: 'flexbox', prop: 'display', value: 'flex' },
            { name: 'grid', prop: 'display', value: 'grid' },
            { name: 'transitions', prop: 'transition', value: 'all 0.5s' },
            { name: 'animations', prop: 'animation', value: 'test 1s' },
            { name: 'transforms', prop: 'transform', value: 'translateX(10px)' }
        ];
        
        const testEl = document.createElement('div');
        document.body.appendChild(testEl);
        
        cssFeatures.forEach(feature => {
            try {
                testEl.style[feature.prop] = feature.value;
                if (testEl.style[feature.prop]) {
                    results.passed.push(feature.name);
                } else {
                    results.failed.push(feature.name);
                }
            } catch (e) {
                results.failed.push(feature.name);
            }
        });
        
        document.body.removeChild(testEl);
        
        return results;
    }
    
    /**
     * Display test results
     * @param {HTMLElement} container - The container to display results in
     */
    displayResults(container) {
        container.innerHTML = '';
        
        const resultsTitle = document.createElement('h3');
        resultsTitle.textContent = 'Test Results';
        container.appendChild(resultsTitle);
        
        // Display each test category
        for (const [category, results] of Object.entries(this.testResults)) {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'test-category';
            categoryElement.innerHTML = `<h4>${this.formatCategoryName(category)}</h4>`;
            
            // Show passed tests
            if (results.passed.length > 0) {
                const passedList = document.createElement('div');
                passedList.className = 'passed-tests';
                passedList.innerHTML = `
                    <span style="color: green;">✓ Passed:</span>
                    ${results.passed.join(', ')}
                `;
                categoryElement.appendChild(passedList);
            }
            
            // Show failed tests
            if (results.failed.length > 0) {
                const failedList = document.createElement('div');
                failedList.className = 'failed-tests';
                failedList.innerHTML = `
                    <span style="color: red;">✗ Failed:</span>
                    ${results.failed.join(', ')}
                `;
                categoryElement.appendChild(failedList);
            }
            
            container.appendChild(categoryElement);
        }
        
        // Add copy results button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Results';
        copyButton.style.marginTop = '10px';
        copyButton.onclick = () => this.copyResults();
        container.appendChild(copyButton);
    }
    
    /**
     * Format category name for display
     * @param {string} name - The category name
     * @returns {string} Formatted name
     */
    formatCategoryName(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }
    
    /**
     * Copy test results to clipboard
     */
    copyResults() {
        let resultsText = `Browser Compatibility Test Results\n`;
        resultsText += `Browser: ${this.browserInfo.name} ${this.browserInfo.version}\n`;
        resultsText += `OS: ${this.browserInfo.os}\n`;
        resultsText += `Mobile: ${this.browserInfo.mobile ? 'Yes' : 'No'}\n\n`;
        
        for (const [category, results] of Object.entries(this.testResults)) {
            resultsText += `${this.formatCategoryName(category)}:\n`;
            resultsText += `  Passed: ${results.passed.join(', ')}\n`;
            resultsText += `  Failed: ${results.failed.join(', ')}\n\n`;
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(resultsText)
            .then(() => {
                alert('Results copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy results:', err);
                alert('Failed to copy results. See console for details.');
            });
    }
}

// Initialize the test helper when the script is loaded
window.addEventListener('DOMContentLoaded', () => {
    window.browserTest = new BrowserCompatibilityTest();
    console.log('Browser compatibility test helper loaded');
});
