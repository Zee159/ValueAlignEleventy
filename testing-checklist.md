# ValueAlign Authentication Flow Testing Checklist

This document provides a structured approach to testing the authentication system and navigation flow after implementing fixes. Follow these steps to verify that all components are working as expected.

## Setup

1. Start the development server
   - Run `npx @11ty/eleventy --serve`
   - Open the site in a private/incognito window to ensure a clean session state

## Basic Authentication Flow Tests

### Initial State

- [ ] Verify the site loads correctly with no authentication errors
- [ ] Confirm that public pages are accessible without login
- [ ] Check that theme settings apply correctly on initial load

### Login Process

- [ ] Navigate to the login page (`/login/`)
- [ ] Verify that the login form renders correctly
- [ ] Attempt login with valid credentials
- [ ] Confirm redirect to dashboard after successful login
- [ ] Verify that the auth canvas appears after login
- [ ] Check that the proper username appears in the auth canvas

### Return URL Functionality

- [ ] Try accessing a protected page (like `/dashboard/values-assessment/`) while logged out
- [ ] Verify redirect to login page
- [ ] After logging in, confirm redirect back to the original protected page

### Logout Process

- [ ] Click the logout button in the auth canvas dropdown
- [ ] Verify successful logout
- [ ] Confirm redirect to the homepage or login page
- [ ] Attempt to access a protected page and verify redirect to login

## Navigation and URL Structure

### URL Standardization

- [ ] Verify that all navigation links in portal header use `/dashboard/*` format
- [ ] Check that legacy `/portal_*` URLs redirect properly to `/dashboard/*` equivalents
- [ ] Test deep links to ensure redirects maintain proper routing

### Menu and Navigation

- [ ] Test main menu navigation in both mobile and desktop views
- [ ] Verify that the correct navigation item is highlighted based on current page
- [ ] Check that dropdowns and submenus function correctly

## Theme System

### Theme Toggle

- [ ] Test the theme toggle button in the header
- [ ] Verify that theme changes persist across page navigation
- [ ] Confirm that theme preference is saved between sessions

### Theme Settings

- [ ] Access theme settings (if available in UI)
- [ ] Test switching between light, dark, and system themes
- [ ] Verify visual indicators showing the currently selected theme

## Authentication Guards

### Protected Pages

- [ ] Verify all dashboard pages require authentication
- [ ] Test that auth guard prevents access to protected content when logged out
- [ ] Confirm that public pages remain accessible regardless of auth state

### Session Handling

- [ ] Test session expiry handling (can simulate by manually clearing localStorage)
- [ ] Verify "remember me" functionality works across browser sessions
- [ ] Check for proper error messages when session expires

## Edge Cases

### Error Handling

- [ ] Test failed login attempts and verify error messages
- [ ] Check behavior when JavaScript is disabled
- [ ] Verify proper handling of network errors during authentication

### Browser Compatibility

- [ ] Test in Chrome, Firefox, Safari, and Edge
- [ ] Verify mobile responsiveness on different devices
- [ ] Check that authentication flow works on all supported browsers

## Performance

- [ ] Measure and verify load time for authentication scripts
- [ ] Check for any visible UI flashes during theme application
- [ ] Confirm smooth transitions between authenticated and non-authenticated states

## Security

- [ ] Verify that protected pages cannot be accessed by directly typing URL when logged out
- [ ] Check that auth tokens are properly stored and managed
- [ ] Confirm that logout properly clears all authentication data

## Accessibility

- [ ] Test keyboard navigation throughout auth flow
- [ ] Verify screen reader compatibility with auth elements
- [ ] Check color contrast in both light and dark themes

---

**Instructions for Issue Reporting**

If any test fails, please document:
1. The specific test that failed
2. Expected behavior
3. Actual behavior 
4. Any error messages (check browser console)
5. Steps to reproduce
6. Browser/device information
