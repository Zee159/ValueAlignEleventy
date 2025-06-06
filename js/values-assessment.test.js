/**
 * Values Assessment Accessibility Tests
 * Automated tests to verify the accessibility of the Values Assessment workflow
 */

// Jest/Testing Library setup
const { describe, test, expect, beforeEach, afterEach } = window.jest;
const { screen, waitFor, fireEvent } = window.testingLibrary;

describe('Values Assessment Accessibility', () => {
  let valuesAssessment;
  
  // Mock DOM elements and window objects that would be available in the browser
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div id="assessment-container"></div>
      <div id="progress-announcer" aria-live="polite"></div>
      <div id="status-announcer" aria-live="assertive"></div>
      <button id="prev-button">Previous</button>
      <button id="next-button">Next</button>
    `;
    
    // Mock window.valuesData
    window.valuesData = [
      { id: 'value1', name: 'Honesty', description: 'Being truthful and transparent' },
      { id: 'value2', name: 'Courage', description: 'Facing fear and challenges' },
      { id: 'value3', name: 'Compassion', description: 'Showing kindness to others' },
      { id: 'value4', name: 'Creativity', description: 'Finding new solutions and ideas' }
    ];
    
    // Create values assessment instance
    valuesAssessment = new window.ValuesAssessment();
    valuesAssessment.init();
  });
  
  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    window.valuesData = undefined;
  });
  
  // Test 1: Verify Introduction Screen Accessibility
  test('Introduction screen has proper ARIA attributes and keyboard focus', async () => {
    // Show introduction screen
    valuesAssessment.showIntroduction();
    
    // Check for semantic structure
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('region')).toBeInTheDocument();
    
    // Verify headers have correct hierarchy
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(/values assessment/i);
    
    // Check accessible button
    const beginButton = screen.getByRole('button', { name: /begin assessment/i });
    expect(beginButton).toBeInTheDocument();
    expect(beginButton).toHaveFocus();
    
    // Test keyboard activation
    fireEvent.keyDown(beginButton, { key: 'Enter' });
    await waitFor(() => {
      // Should move to values selection screen
      expect(valuesAssessment.currentStep).toBe(2);
    });
  });
  
  // Test 2: Values Selection Screen Accessibility
  test('Values selection screen has proper ARIA roles and states', async () => {
    // Show values selection screen
    valuesAssessment.currentStep = 2;
    valuesAssessment.showValuesSelection();
    
    // Check for accessible checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(window.valuesData.length);
    
    // Check ARIA states
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'false');
    
    // Test selection via keyboard
    fireEvent.keyDown(checkboxes[0], { key: ' ' });
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true');
    
    // Verify live region announcements
    const announcer = document.getElementById('status-announcer');
    expect(announcer.textContent).toContain('selected');
    
    // Check button states
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();
  });
  
  // Test 3: Values Ranking Screen Accessibility
  test('Values ranking has proper keyboard navigation and ARIA labels', async () => {
    // Set up some selected values first
    valuesAssessment.selectedValues = ['value1', 'value2', 'value3'];
    valuesAssessment.prioritizedValues = ['value1', 'value2', 'value3'];
    
    // Show ranking screen
    valuesAssessment.currentStep = 3;
    valuesAssessment.showValuesRanking();
    
    // Check for accessible list
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(valuesAssessment.prioritizedValues.length);
    
    // Test move up/down buttons
    const moveUpButtons = screen.getAllByRole('button', { name: /move.*up/i });
    const moveDownButtons = screen.getAllByRole('button', { name: /move.*down/i });
    
    // First item's move up button should be disabled
    expect(moveUpButtons[0]).toBeDisabled();
    
    // Last item's move down button should be disabled
    expect(moveDownButtons[moveDownButtons.length - 1]).toBeDisabled();
    
    // Test keyboard handling
    fireEvent.keyDown(listItems[0], { key: 'ArrowDown' });
    expect(valuesAssessment.prioritizedValues[0]).toBe('value2');
    expect(valuesAssessment.prioritizedValues[1]).toBe('value1');
    
    // Verify announcements for screen readers
    const announcer = document.getElementById('progress-announcer');
    expect(announcer.textContent).toContain('moved');
  });
  
  // Test 4: Reflection Screen Accessibility
  test('Reflection screen form fields have proper labels and keyboard access', async () => {
    // Set up some prioritized values first
    valuesAssessment.prioritizedValues = ['value1', 'value2', 'value3'];
    
    // Show reflection screen
    valuesAssessment.currentStep = 4;
    valuesAssessment.showReflection();
    
    // Check form role
    expect(screen.getByRole('form')).toBeInTheDocument();
    
    // Check for labeled form controls
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBeGreaterThan(0);
    
    // Each textarea should have a label
    textareas.forEach(textarea => {
      const labelId = textarea.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
      expect(document.getElementById(labelId)).toBeInTheDocument();
    });
    
    // First textarea should have focus
    expect(textareas[0]).toHaveFocus();
    
    // Test response saving
    fireEvent.change(textareas[0], { target: { value: 'Test reflection response' } });
    expect(Object.keys(valuesAssessment.reflectionResponses).length).toBeGreaterThan(0);
  });
  
  // Test 5: Screen reader announcements
  test('Screen reader announcements are made appropriately', () => {
    // Create spy on announce method
    const announceSpy = jest.spyOn(valuesAssessment, 'announce');
    
    // Initialize and check for initial announcement
    valuesAssessment.showIntroduction();
    expect(announceSpy).toHaveBeenCalledWith(expect.any(String), expect.any(String));
    
    // Check navigation announcement
    valuesAssessment.nextStep();
    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('step'), expect.any(String));
    
    // Check error announcement
    valuesAssessment.prioritizedValues = [];
    valuesAssessment.showReflection();
    expect(announceSpy).toHaveBeenCalledWith(expect.stringContaining('No values'), 'assertive');
  });
  
  // Test 6: Keyboard trap in modals
  test('PDF export modal traps focus correctly', async () => {
    // Mock window.AssessmentExporter
    window.AssessmentExporter = class {
      exportAsPDF() {
        return Promise.resolve();
      }
    };
    
    // Mock AccessibilityHelpers
    window.AccessibilityHelpers = {
      trapFocus: jest.fn(),
      releaseFocus: jest.fn()
    };
    
    // Setup for export
    valuesAssessment.prioritizedValues = ['value1', 'value2'];
    
    // Call export method
    valuesAssessment.exportValuesAsPDF();
    
    // Verify trap was called
    expect(window.AccessibilityHelpers.trapFocus).toHaveBeenCalled();
    
    // Find cancel button in modal
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    
    // Test cancel button releases trap
    fireEvent.click(cancelButton);
    expect(window.AccessibilityHelpers.releaseFocus).toHaveBeenCalled();
  });
});
