/**
 * Simple Test Runner
 * Provides basic test functionality for accessibility testing
 */

// Create basic testing functionality
window.jest = {
    // Test suite
    describe: function(suiteName, testFn) {
        console.group(`Test Suite: ${suiteName}`);
        testFn();
        console.groupEnd();
    },
    
    // Individual test
    test: function(testName, testFn) {
        try {
            testFn();
            console.log(`%c✓ PASS: ${testName}`, 'color: green');
            return true;
        } catch (error) {
            console.error(`%c✗ FAIL: ${testName}`, 'color: red');
            console.error(error);
            return false;
        }
    },
    
    // Alias for test
    it: function(testName, testFn) {
        return window.jest.test(testName, testFn);
    },
    
    // Setup before each test
    beforeEach: function(fn) {
        window.jest.beforeEachFn = fn;
    },
    
    // Cleanup after each test
    afterEach: function(fn) {
        window.jest.afterEachFn = fn;
    },
    
    // Mock function
    fn: function() {
        const mockFn = function() {
            mockFn.calls.push(Array.from(arguments));
            return mockFn.returnValue;
        };
        
        mockFn.calls = [];
        mockFn.returnValue = undefined;
        mockFn.mockReturnValue = function(value) {
            mockFn.returnValue = value;
            return mockFn;
        };
        mockFn.mockImplementation = function(fn) {
            mockFn.implementation = fn;
            return mockFn;
        };
        
        return mockFn;
    },
    
    // Spy on object method
    spyOn: function(obj, methodName) {
        const originalMethod = obj[methodName];
        const spy = window.jest.fn();
        
        obj[methodName] = function() {
            const result = originalMethod.apply(this, arguments);
            spy.apply(this, arguments);
            return result;
        };
        
        obj[methodName].mockRestore = function() {
            obj[methodName] = originalMethod;
        };
        
        return spy;
    },
    
    // Expect assertions
    expect: function(actual) {
        return {
            toBe: function(expected) {
                if (actual !== expected) {
                    throw new Error(`Expected ${actual} to be ${expected}`);
                }
                return true;
            },
            toEqual: function(expected) {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
                }
                return true;
            },
            toContain: function(expected) {
                if (typeof actual === 'string') {
                    if (!actual.includes(expected)) {
                        throw new Error(`Expected "${actual}" to contain "${expected}"`);
                    }
                } else if (Array.isArray(actual)) {
                    if (!actual.includes(expected)) {
                        throw new Error(`Expected array to contain ${expected}`);
                    }
                }
                return true;
            },
            toHaveBeenCalled: function() {
                if (!actual.calls || actual.calls.length === 0) {
                    throw new Error('Expected function to have been called');
                }
                return true;
            },
            toBeInTheDocument: function() {
                if (!document.contains(actual)) {
                    throw new Error('Expected element to be in the document');
                }
                return true;
            },
            toHaveAttribute: function(attr, value) {
                if (!actual.hasAttribute(attr)) {
                    throw new Error(`Expected element to have attribute ${attr}`);
                }
                if (value !== undefined && actual.getAttribute(attr) !== value) {
                    throw new Error(`Expected attribute ${attr} to be ${value}, got ${actual.getAttribute(attr)}`);
                }
                return true;
            },
            toHaveFocus: function() {
                if (document.activeElement !== actual) {
                    throw new Error('Expected element to have focus');
                }
                return true;
            },
            toHaveTextContent: function(expected) {
                const textContent = actual.textContent || '';
                if (typeof expected === 'string') {
                    if (!textContent.includes(expected)) {
                        throw new Error(`Expected text content to contain "${expected}"`);
                    }
                } else if (expected instanceof RegExp) {
                    if (!expected.test(textContent)) {
                        throw new Error(`Expected text content to match ${expected}`);
                    }
                }
                return true;
            },
            not: {
                toBe: function(expected) {
                    if (actual === expected) {
                        throw new Error(`Expected ${actual} not to be ${expected}`);
                    }
                    return true;
                },
                toBeDisabled: function() {
                    if (actual.disabled) {
                        throw new Error('Expected element not to be disabled');
                    }
                    return true;
                }
            }
        };
    }
};

// DOM testing utilities
window.testingLibrary = {
    // Find elements by role
    screen: {
        getByRole: function(role, options = {}) {
            const elements = Array.from(document.querySelectorAll(`[role="${role}"]`));
            
            // Filter by name if provided
            if (options.name) {
                const namePattern = typeof options.name === 'string' 
                    ? new RegExp(options.name, 'i') 
                    : options.name;
                    
                const filtered = elements.filter(el => {
                    const textContent = el.textContent || '';
                    const ariaLabel = el.getAttribute('aria-label') || '';
                    const labelledBy = el.getAttribute('aria-labelledby');
                    let labelText = '';
                    
                    if (labelledBy) {
                        const labelEl = document.getElementById(labelledBy);
                        labelText = labelEl ? labelEl.textContent : '';
                    }
                    
                    return namePattern.test(textContent) || 
                           namePattern.test(ariaLabel) || 
                           namePattern.test(labelText);
                });
                
                if (filtered.length) {
                    return filtered[0];
                }
            } else {
                if (elements.length) {
                    return elements[0];
                }
            }
            
            // Check for elements with implicit roles
            if (role === 'button') {
                const buttons = Array.from(document.querySelectorAll('button'));
                if (buttons.length) return buttons[0];
            }
            
            throw new Error(`Unable to find element with role "${role}"`);
        },
        
        getAllByRole: function(role) {
            const elements = Array.from(document.querySelectorAll(`[role="${role}"]`));
            
            // Check for elements with implicit roles
            if (role === 'button') {
                const buttons = Array.from(document.querySelectorAll('button'));
                elements.push(...buttons);
            }
            
            if (role === 'checkbox') {
                const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
                elements.push(...checkboxes);
            }
            
            if (elements.length === 0) {
                throw new Error(`Unable to find elements with role "${role}"`);
            }
            
            return elements;
        },
        
        getByText: function(text) {
            const pattern = typeof text === 'string' ? new RegExp(text, 'i') : text;
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                { acceptNode: node => pattern.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
            );
            
            const node = walker.nextNode();
            if (!node) {
                throw new Error(`Unable to find element with text "${text}"`);
            }
            
            return node.parentNode;
        },
        
        getByLabelText: function(text) {
            const pattern = typeof text === 'string' ? new RegExp(text, 'i') : text;
            const labels = Array.from(document.querySelectorAll('label'));
            
            for (const label of labels) {
                if (pattern.test(label.textContent)) {
                    const forId = label.getAttribute('for');
                    if (forId) {
                        const element = document.getElementById(forId);
                        if (element) return element;
                    } else {
                        // Check for wrapped inputs
                        const input = label.querySelector('input, textarea, select');
                        if (input) return input;
                    }
                }
            }
            
            throw new Error(`Unable to find element with label text "${text}"`);
        }
    },
    
    // Fire events
    fireEvent: {
        click: function(element) {
            const event = new MouseEvent('click', { bubbles: true });
            element.dispatchEvent(event);
        },
        
        change: function(element, options = {}) {
            if (options.target && options.target.value !== undefined) {
                element.value = options.target.value;
            }
            
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        },
        
        keyDown: function(element, options = {}) {
            const event = new KeyboardEvent('keydown', {
                key: options.key || '',
                code: options.code || '',
                bubbles: true
            });
            element.dispatchEvent(event);
        },
        
        focus: function(element) {
            element.focus();
            const event = new FocusEvent('focus', { bubbles: true });
            element.dispatchEvent(event);
        }
    },
    
    // Wait for something to happen
    waitFor: function(callback, options = {}) {
        const timeout = options.timeout || 1000;
        const interval = options.interval || 50;
        
        return new Promise((resolve, reject) => {
            let timeoutId;
            let intervalId;
            
            const cleanup = () => {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
            };
            
            timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error('waitFor timed out'));
            }, timeout);
            
            const checkCallback = () => {
                try {
                    const result = callback();
                    cleanup();
                    resolve(result);
                } catch (error) {
                    // Keep waiting
                }
            };
            
            intervalId = setInterval(checkCallback, interval);
            checkCallback();
        });
    }
};

// Make testing functions globally available
window.describe = window.jest.describe;
window.test = window.jest.test;
window.it = window.jest.it;
window.beforeEach = function(fn) { window.jest.beforeEachFn = fn; };
window.afterEach = function(fn) { window.jest.afterEachFn = fn; };
window.expect = window.jest.expect;

// Run tests
function runTests() {
    const testContainer = document.getElementById('test-results');
    if (testContainer) {
        testContainer.innerHTML = '<h2>Running tests...</h2>';
    }
    
    // Find and execute all test files
    const testFiles = document.querySelectorAll('script[type="test/javascript"]');
    
    // Summary variables
    let passed = 0;
    let failed = 0;
    
    // Execute each test
    Array.from(testFiles).forEach(script => {
        try {
            // Execute the script content
            const testCode = script.textContent;
            eval(testCode);
            passed++;
        } catch (error) {
            console.error('Test file failed:', error);
            failed++;
        }
    });
    
    // Update results
    if (testContainer) {
        testContainer.innerHTML = `
            <h2>Test Results</h2>
            <div class="test-summary">
                <p class="passed">Passed: ${passed}</p>
                <p class="failed">Failed: ${failed}</p>
            </div>
        `;
    }
    
    console.log(`Test run complete. ${passed} passed, ${failed} failed.`);
}
