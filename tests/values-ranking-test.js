/**
 * Test for Values Ranking Screen Accessibility
 * Tests the accessibility of the values ranking screen
 */

describe('Values Ranking Screen Accessibility', () => {
    let valuesAssessment;
    let container;
    
    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <div id="assessment-container"></div>
            <div id="progress-announcer" aria-live="polite"></div>
            <div id="status-announcer" aria-live="assertive"></div>
        `;
        
        container = document.getElementById('assessment-container');
        
        // Mock window.valuesData
        window.valuesData = [
            { id: 'honesty', name: 'Honesty', description: 'Being truthful and transparent' },
            { id: 'compassion', name: 'Compassion', description: 'Showing kindness to others' },
            { id: 'creativity', name: 'Creativity', description: 'Finding new ideas and solutions' }
        ];
        
        // Create values assessment instance
        valuesAssessment = new window.ValuesAssessment();
        valuesAssessment.init();
        
        // Setup selected values
        valuesAssessment.selectedValues = ['honesty', 'compassion', 'creativity'];
    });
    
    test('Ranking screen has proper structure and ARIA roles', () => {
        // Show ranking screen
        valuesAssessment.showValuesRanking();
        
        // Check for required ARIA roles
        const region = container.querySelector('[role="region"]');
        expect(region).toBeInTheDocument();
        
        const heading = container.querySelector('h1, h2');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(/rank|order|prioritize/i);
        
        // Check for ordered list
        const valuesList = container.querySelector('[role="list"]');
        expect(valuesList).toBeInTheDocument();
        
        // Check for list items
        const valueItems = container.querySelectorAll('[role="listitem"]');
        expect(valueItems.length).toBe(valuesAssessment.selectedValues.length);
    });
    
    test('Values can be reordered with keyboard controls', () => {
        // Show ranking screen
        valuesAssessment.showValuesRanking();
        
        // Find move up/down buttons for second item
        const valueItems = container.querySelectorAll('[role="listitem"]');
        const secondItem = valueItems[1];
        const moveUpButton = secondItem.querySelector('[aria-label*="move up"]') || 
                            secondItem.querySelector('button:first-of-type');
        
        expect(moveUpButton).toBeInTheDocument();
        
        // Get initial order
        const initialOrder = [...valuesAssessment.selectedValues];
        const secondValueId = initialOrder[1];
        
        // Move second item up
        testingLibrary.fireEvent.click(moveUpButton);
        
        // Check if order changed
        const newOrder = [...valuesAssessment.selectedValues];
        expect(newOrder[0]).toBe(secondValueId);
    });
    
    test('Rank changes are announced to screen readers', () => {
        // Mock the announce method
        const originalAnnounce = valuesAssessment.announce;
        const announcements = [];
        
        valuesAssessment.announce = function(message, priority) {
            announcements.push({ message, priority });
            
            // Call original if it exists
            if (originalAnnounce) {
                originalAnnounce.call(this, message, priority);
            }
        };
        
        // Show ranking screen
        valuesAssessment.showValuesRanking();
        
        // Find move up button for second item
        const valueItems = container.querySelectorAll('[role="listitem"]');
        const secondItem = valueItems[1];
        const moveUpButton = secondItem.querySelector('[aria-label*="move up"]') || 
                            secondItem.querySelector('button:first-of-type');
        
        // Move second item up
        testingLibrary.fireEvent.click(moveUpButton);
        
        // Check if movement was announced
        const movementAnnounced = announcements.some(a => 
            a.message.includes('moved') || 
            a.message.includes('position') ||
            a.message.includes('rank')
        );
        expect(movementAnnounced).toBe(true);
        
        // Restore original
        if (originalAnnounce) {
            valuesAssessment.announce = originalAnnounce;
        }
    });
    
    test('Navigation buttons are accessible', () => {
        // Show ranking screen
        valuesAssessment.showValuesRanking();
        
        // Check for navigation buttons
        const nextButton = container.querySelector('.next-button') || 
                          container.querySelector('button[aria-label*="next"]');
        expect(nextButton).toBeInTheDocument();
        expect(nextButton).toHaveAttribute('type', 'button');
        
        const prevButton = container.querySelector('.prev-button') ||
                          container.querySelector('button[aria-label*="previous"]');
        expect(prevButton).toBeInTheDocument();
        expect(prevButton).toHaveAttribute('type', 'button');
    });
});
