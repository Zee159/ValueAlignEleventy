# Authentication Canvas Architecture

## Overview

The Authentication Canvas is a global component that provides a unified authentication UI experience across all pages of the ValueAlign site. It exists as a layer above the regular site navigation, with a consistent look and behavior regardless of whether the user is viewing public or protected portal pages.

## Design Principles

1. **Separation of Concerns**: Authentication UI is decoupled from navigation headers
2. **Single Source of Truth**: Auth state is managed by a central service
3. **Event-Driven Architecture**: UI updates are triggered by state changes 
4. **Role-Based Design**: Supports different member types and permissions
5. **Progressive Enhancement**: Works with or without JavaScript

## Components

### 1. Auth Canvas Component (`_auth_canvas.html`)

The visual component that appears on all pages and contains:
- Login link (when logged out)
- User menu with user icon and name (when logged in)
- Member type badge
- Settings menu

### 2. Auth Service (`auth-service.js`)

Core authentication logic that:
- Manages authentication state
- Provides login/logout methods
- Handles session expiry
- Broadcasts state changes to subscribers
- Acts as single source of truth for auth state

### 3. Auth UI Controller (`auth-ui-controller.js`)

Connects the auth service to the UI:
- Subscribes to auth state changes
- Updates the UI based on state
- Manages dropdowns and interactions
- Handles role-based UI adaptations

## Implementation Details

### Auth State Storage

Authentication state is stored in `localStorage` with the following keys:
- `valuealign_authenticated`: Boolean flag
- `valuealign_user`: JSON user data object
- `valuealign_session_expiry`: Timestamp for session expiry

### Event System

The auth service emits state changes through a subscription system:
```javascript
authService.subscribe(state => {
  // React to auth state changes
});
```

### Member Types

The system supports different member types:
- Anonymous (not logged in)
- Free (default for logged in users)
- Premium (paid tier)
- Admin (site administrators)

Each can have different UI treatments and permissions.

## Testing the Implementation

1. **Login Flow**:
   - Visit the login page
   - Enter credentials
   - Should redirect to dashboard with updated UI

2. **Session Persistence**:
   - After login, refresh the page
   - Auth state should be maintained

3. **Logout Flow**:
   - Click logout in user menu
   - Should redirect to home and update UI

4. **Role Testing**:
   - Try different member types by setting `memberType` in user data

## Future Enhancements

1. **Enhanced Permissions System**: More granular role-based access control
2. **Server-Side Validation**: Secure token management with backend
3. **OAuth Integration**: Support for third-party login providers
4. **Multi-Factor Authentication**: Additional security layer
5. **Personalization**: Member-specific UI adaptations
