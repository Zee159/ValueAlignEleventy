/**
 * Test for Introduction Screen Accessibility
 * Tests the accessibility of the values assessment introduction screen
 */

describe('Introduction Screen Accessibility', () => {
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
            { id: 'compassion', name: 'Compassion', description: 'Showing kindness to others' }
        ];
        
        // Create values assessment instance
        valuesAssessment = new window.ValuesAssessment();
        valuesAssessment.init();
    });
    
    test('Introduction screen has proper ARIA roles', () => {
        // Show introduction screen
        valuesAssessment.showIntroduction();
        
        // Check for required ARIA roles
        const mainRegion = container.querySelector('[role="region"]');
        expect(mainRegion).toBeInTheDocument();
        
        const heading = container.querySelector('h1, h2');
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(/values assessment/i);
        
        const description = container.querySelector('p');
        expect(description).toBeInTheDocument();
    });
    
    test('Begin button has proper accessibility attributes', () => {
        // Show introduction screen
        valuesAssessment.showIntroduction();
        
        // Find the begin button
        const beginButton = container.querySelector('button');
        expect(beginButton).toBeInTheDocument();
        expect(beginButton).toHaveAttribute('type', 'button');
        expect(beginButton).toHaveTextContent(/begin|start/i);
    });
    
    test('Screen reader announcements are made', () => {
        // Mock the announce method to test it's called
        const originalAnnounce = valuesAssessment.announce;
        let announceCalled = false;
        let announceMessage = '';
        
        valuesAssessment.announce = function(message, priority) {
            announceCalled = true;
            announceMessage = message;
            
            // Also call original if it exists
            if (originalAnnounce) {
                originalAnnounce.call(this, message, priority);
            }
        };
        
        // Show introduction screen
        valuesAssessment.showIntroduction();
        
        // Check if announce was called
        expect(announceCalled).toBe(true);
        expect(announceMessage).toContain('introduction');
        
        // Restore original
        if (originalAnnounce) {
            valuesAssessment.announce = originalAnnounce;
        }
    });
});
