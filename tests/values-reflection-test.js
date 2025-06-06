/**
 * Test for Values Reflection Screen Accessibility
 * Tests the accessibility of the values reflection screen
 */

describe('Values Reflection Screen Accessibility', () => {
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
        
        // Setup ranked values
        valuesAssessment.selectedValues = ['honesty', 'compassion', 'creativity'];
        
        // Mock reflection data
        valuesAssessment.reflections = {
            'honesty': ''
        };
    });
    
    test('Reflection screen has proper structure and ARIA roles', () => {
        // Show reflection screen
        valuesAssessment.showReflection();
        
        // Check for required ARIA roles
        const region = container.querySelector('[role="region"]');
        expect(region).toBeInTheDocument();
        
        const heading = container.querySelector('h1, h2');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(/reflect|reflection/i);
        
        // Check for top values display
        const valuesList = container.querySelector('[role="list"]');
        expect(valuesList).toBeInTheDocument();
        
        // Check for reflection text areas
        const textareas = container.querySelectorAll('textarea');
        expect(textareas.length).toBeGreaterThan(0);
    });
    
    test('Reflection textareas have proper labeling', () => {
        // Show reflection screen
        valuesAssessment.showReflection();
        
        // Find textareas
        const textareas = container.querySelectorAll('textarea');
        
        for (let i = 0; i < textareas.length; i++) {
            const textarea = textareas[i];
            
            // Check for labels
            const hasLabelElement = !!document.querySelector(`label[for="${textarea.id}"]`);
            const hasAriaLabel = !!textarea.getAttribute('aria-label');
            const hasAriaLabelledBy = !!textarea.getAttribute('aria-labelledby');
            
            // Should have at least one form of labeling
            const isLabeled = hasLabelElement || hasAriaLabel || hasAriaLabelledBy;
            expect(isLabeled).toBe(true);
        }
    });
    
    test('Reflection updates are properly saved', () => {
        // Show reflection screen
        valuesAssessment.showReflection();
        
        // Find reflection textarea for "honesty"
        const textareas = container.querySelectorAll('textarea');
        const honestyTextarea = Array.from(textareas).find(ta => {
            // Find by id, name, or nearby label
            return ta.id.includes('honesty') || 
                   ta.name.includes('honesty') ||
                   (ta.previousElementSibling && ta.previousElementSibling.textContent.includes('Honesty'));
        });
        
        expect(honestyTextarea).toBeInTheDocument();
        
        // Enter reflection text
        const reflectionText = "I value honesty because it builds trust.";
        testingLibrary.fireEvent.change(honestyTextarea, { 
            target: { value: reflectionText } 
        });
        
        // Check if reflection was saved
        expect(valuesAssessment.reflections.honesty).toBe(reflectionText);
    });
    
    test('Navigation buttons are accessible', () => {
        // Show reflection screen
        valuesAssessment.showReflection();
        
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
    
    test('Character counters are accessible', () => {
        // Show reflection screen
        valuesAssessment.showReflection();
        
        // Check if character counters are present
        const charCounters = container.querySelectorAll('.char-counter');
        
        if (charCounters.length > 0) {
            // If counters exist, ensure they're accessible
            for (let counter of charCounters) {
                // Should be associated with textarea
                const associatedTextarea = document.getElementById(counter.getAttribute('for') || 
                                                                  counter.getAttribute('aria-controls'));
                expect(associatedTextarea).toBeInTheDocument();
                
                // Should have aria-live attribute for screen reader updates
                expect(counter.getAttribute('aria-live')).toBe('polite');
            }
        }
    });
});
