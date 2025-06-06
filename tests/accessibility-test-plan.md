# Values Assessment Accessibility Test Plan

## Overview
This test plan outlines the procedures for verifying accessibility and cross-browser compatibility of the Values Assessment workflow.

## Testing Matrix

### Browsers to Test
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Chrome & Safari

### Screen Readers to Test
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

## Test Areas

### 1. Introduction Screen
- [ ] All content is properly announced by screen readers
- [ ] Begin Assessment button is keyboard accessible
- [ ] Focus is properly managed

### 2. Values Selection Screen
- [ ] Values are properly announced by screen readers
- [ ] Checkboxes are keyboard accessible
- [ ] Selected values are announced properly
- [ ] Navigation buttons are keyboard accessible
- [ ] Selection counter is announced when updated

### 3. Values Ranking Screen
- [ ] List items are properly announced by screen readers
- [ ] Up/down buttons are keyboard accessible
- [ ] List order changes are announced
- [ ] Focus is maintained appropriately after reordering
- [ ] Keyboard shortcuts for reordering work correctly

### 4. Values Reflection Screen
- [ ] Form fields are properly labeled
- [ ] Textareas are keyboard accessible
- [ ] Auto-saving is announced appropriately
- [ ] Navigation buttons are keyboard accessible
- [ ] Error messages are clearly announced

### 5. PDF Export
- [ ] Modal dialog is accessible
- [ ] Focus is trapped within the modal
- [ ] Progress updates are announced
- [ ] Error messages are clearly announced
- [ ] Return focus after modal close

### 6. Premium Features
- [ ] Premium export options are keyboard accessible
- [ ] Visualization components have proper ARIA labels
- [ ] Charts have text alternatives for screen readers
- [ ] Visualizations use appropriate color contrast
- [ ] Dashboard navigation is properly announced
