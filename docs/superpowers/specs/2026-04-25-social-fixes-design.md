# Design Spec: Social Features Fixes & Profile
**Date**: 2026-04-25
**Status**: Draft

## 1. Overview
This update addresses usability issues and feature gaps identified in the social expansion:
1. **Universal Orbital Menu**: Hamburger menu available on all screens.
2. **Persistent Social Buttons**: Toggle-style buttons for connections (Follow -> Following).
3. **Scholar Profile Page**: Centralized hub for bio editing, level/grade display, and relationship management.
4. **Messaging Recovery**: Properly implement `Messaging.tsx` and `useMessaging.ts`.

## 2. Component Design

### 2.1 Orbital Menu (Nav.tsx / MobileMenu.tsx)
- Remove `lg:hidden`/`md:hidden` wrappers.
- The 3-line icon will now trigger the `MobileMenu` sidebar on all devices.
- `MobileMenu` will be renamed to `OrbitalMenu` for clarity.

### 2.2 Connection Buttons (Scholars.tsx)
- State-based logic:
    - If `status == 'accepted'`: Button shows "Following" or "Partner" (toggle-able to "Remove").
    - If `status == 'pending'`: Button shows "Pending".
    - Buttons will not disappear; they will reflect the state.

### 2.3 User Profile (Profile.tsx)
- **Data**: Fetch current user's `scholar` record.
- **Editing**: Editable `bio` field. "Update Profile" button commits to Firestore.
- **Relationships**: Three lists: "Following", "Partners", "Followers".

### 2.4 Messaging Recovery
- Correct implementation of `src/pages/Messaging.tsx` and `src/hooks/useMessaging.ts`.
- `App.tsx` routing verification.

## 3. Success Criteria
- [ ] Orbital Menu visible on desktop and mobile.
- [ ] Connection buttons act as toggles, not vanishing items.
- [ ] Profile page allows bio editing and shows connections.
- [ ] Messaging page renders the conversation list and chat stream correctly.
