# Social UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a 2-pane Messenger-style UI, a high-fidelity editable Profile page, and integrate Profile into the Orbital Menu.

---

## Phase 1: Orbital Menu Integration
### Task 1.1: Orbital Menu Profile Link
- [ ] Modify `src/components/OrbitalMenu.tsx`: Ensure "Profile" link is prominently displayed.

## Phase 2: Messenger UI Overhaul
### Task 2.1: Messaging Page Implementation
- [ ] Create `src/pages/Messaging.tsx` (using 2-pane layout).
- [ ] Implement master-detail logic (Conversation list & Chat stream).
- [ ] Ensure real-time updates for chat messages.

## Phase 3: Profile UX Overhaul
### Task 3.1: Profile Component
- [ ] Create `src/pages/Profile.tsx`:
    - Header with Avatar, Edit Bio/Username (editable fields).
    - Grid/Tabbed lists for "Following", "Followers", "Partners".
- [ ] Modify `src/App.tsx`: Confirm route `/profile` points to the new `Profile` page.

---

**Plan complete. Would you like to proceed with the Subagent-Driven approach?**
