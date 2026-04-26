# Design Spec: Social Network Features Refinement
**Date**: 2026-04-26
**Status**: Draft

## 1. Profile Page Expansion
- **Header Analytics**: A dashboard-style stat bar below the bio, displaying:
    - `Following` (Count)
    - `Followers` (Count)
    - `Partners` (Count)
- **UI Component**: A custom `StatCard` for these metrics.

## 2. Messaging "Messenger-Style" UI
- **Sidebar**: Display a list of all "Partners" or "Followers" with whom you have active connections.
- **Functionality**: Clicking any listed user initiates a conversation (creates a conversation doc if one doesn't exist).
- **Alive UX**: Active user avatars, last message preview, and a "Start Chat" indicator.

## 3. "Scout" Feature
- **Implementation**: On the "Find Scholars" page, replace the "View Profile" link (or add a dedicated "Scout" button) on each scholar card.
- **Redirect**: Navigates the user to `/profile/:userId` (Dynamic Profile Route).

---

**Do you approve of these UI refinements?** Once approved, I will present the final implementation plan to complete these professional social features.