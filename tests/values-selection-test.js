/**
 * Test for Values Selection Screen Accessibility
 * Tests the accessibility of the values selection screen
 */

describe('Values Selection Screen Accessibility', () => {
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
    });
    
    test('Values selection screen has proper structure and ARIA roles', () => {
        // Show values selection screen
        valuesAssessment.showValuesSelection();
        
        // Check for required ARIA roles
        const region = container.querySelector('[role="region"]');
        expect(region).toBeInTheDocument();
        
        const heading = container.querySelector('h1, h2');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(/select|choose|values/i);
        
        // Check for list of values
        const valueItems = container.querySelectorAll('.value-item');
        expect(valueItems.length).toBe(window.valuesData.length);
    });
    
    test('Values are selectable via keyboard', () => {
        // Show values selection screen
        valuesAssessment.showValuesSelection();
        
        // Find checkboxes or interactive elements
        const valueItems = container.querySelectorAll('.value-item');
        const firstValueControl = valueItems[0].querySelector('input[type="checkbox"]') || 
                                  valueItems[0].querySelector('[role="checkbox"]');
        
        expect(firstValueControl).toBeInTheDocument();
        
        // Test keyboard activation
        testingLibrary.fireEvent.keyDown(firstValueControl, { key: ' ' }); // Space key
        
        // Check if the value was selected
        const isSelected = valuesAssessment.selectedValues.includes(window.valuesData[0].id);
        expect(isSelected).toBe(true);
    });
    
    test('Selection counter is updated and announced', () => {
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
        
        // Show values selection screen
        valuesAssessment.showValuesSelection();
        
        // Find and select a value
        const valueItems = container.querySelectorAll('.value-item');
        const firstValueControl = valueItems[0].querySelector('input[type="checkbox"]') || 
                                 valueItems[0].querySelector('[role="checkbox"]');
        testingLibrary.fireEvent.click(firstValueControl);
        
        // Check counter
        const counter = container.querySelector('.selection-counter');
        expect(counter).toBeInTheDocument();
        expect(counter).toHaveTextContent(/1/);
        
        // Check if selection was announced
        const selectionAnnounced = announcements.some(a => 
            a.message.includes('selected') || 
            a.message.includes('chosen') ||
            a.message.includes('value')
        );
        expect(selectionAnnounced).toBe(true);
        
        // Restore original
        if (originalAnnounce) {
            valuesAssessment.announce = originalAnnounce;
        }
    });
    
    test('Navigation buttons are accessible', () => {
        // Show values selection screen
        valuesAssessment.showValuesSelection();
        
        // Check for navigation buttons
        const nextButton = container.querySelector('.next-button') || 
                          container.querySelector('button:nth-of-type(2)');
        expect(nextButton).toBeInTheDocument();
        expect(nextButton).toHaveAttribute('type', 'button');
        
        const prevButton = container.querySelector('.prev-button') ||
                          container.querySelector('button:nth-of-type(1)');
        expect(prevButton).toBeInTheDocument();
        expect(prevButton).toHaveAttribute('type', 'button');
    });
});
