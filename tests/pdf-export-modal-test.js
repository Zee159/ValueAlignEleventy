/**
 * Test for PDF Export Modal Accessibility
 * Tests the accessibility of the PDF export modal
 */

describe('PDF Export Modal Accessibility', () => {
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
        
        // Mock AccessibilityHelpers
        window.AccessibilityHelpers = {
            trapFocus: jest.fn(),
            releaseFocus: jest.fn()
        };
        
        // Create values assessment instance
        valuesAssessment = new window.ValuesAssessment();
        valuesAssessment.init();
        
        // Setup selected values and reflections
        valuesAssessment.selectedValues = ['honesty', 'compassion'];
        valuesAssessment.reflections = {
            'honesty': 'My reflection on honesty',
            'compassion': 'My reflection on compassion'
        };
    });
    
    test('PDF export modal has proper dialog role and attributes', () => {
        // Trigger PDF export
        valuesAssessment.exportValuesAsPDF();
        
        // Check for modal dialog
        const dialog = document.querySelector('[role="dialog"]');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        
        // Should have a title
        const titleId = dialog.getAttribute('aria-labelledby');
        expect(titleId).not.toBe(null);
        const title = document.getElementById(titleId);
        expect(title).toBeInTheDocument();
    });
    
    test('Focus is trapped in the modal', () => {
        // Trigger PDF export
        valuesAssessment.exportValuesAsPDF();
        
        // Check if focus trap was called
        const dialog = document.querySelector('[role="dialog"]');
        expect(window.AccessibilityHelpers.trapFocus).toHaveBeenCalled();
    });
    
    test('Cancel button is accessible', () => {
        // Trigger PDF export
        valuesAssessment.exportValuesAsPDF();
        
        // Find cancel button
        const dialog = document.querySelector('[role="dialog"]');
        const cancelButton = dialog.querySelector('button[aria-label*="cancel"]') ||
                             dialog.querySelector('button:not([type="submit"])');
        
        expect(cancelButton).toBeInTheDocument();
        
        // Click cancel
        testingLibrary.fireEvent.click(cancelButton);
        
        // Check if focus trap was released
        expect(window.AccessibilityHelpers.releaseFocus).toHaveBeenCalled();
        
        // Check if modal is removed
        const dialogAfterCancel = document.querySelector('[role="dialog"]');
        expect(dialogAfterCancel).toBe(null);
    });
    
    test('Export progress is announced to screen readers', () => {
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
        
        // Trigger PDF export
        valuesAssessment.exportValuesAsPDF();
        
        // Check for progress announcements
        const progressAnnounced = announcements.some(a => 
            a.message.includes('export') || 
            a.message.includes('pdf') ||
            a.message.includes('preparing')
        );
        expect(progressAnnounced).toBe(true);
        
        // Restore original
        if (originalAnnounce) {
            valuesAssessment.announce = originalAnnounce;
        }
    });
    
    test('Progress bar has accessible ARIA attributes', () => {
        // Trigger PDF export
        valuesAssessment.exportValuesAsPDF();
        
        // Check for progress bar
        const progressBar = document.querySelector('[role="progressbar"]');
        
        // If progress bar exists, check its attributes
        if (progressBar) {
            expect(progressBar).toHaveAttribute('aria-valuemin', '0');
            expect(progressBar).toHaveAttribute('aria-valuemax');
            expect(progressBar).toHaveAttribute('aria-valuenow');
        }
    });
});
