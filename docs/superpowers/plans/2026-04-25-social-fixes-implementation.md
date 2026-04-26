# Social Features Fixes & Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement UI fixes for navigation, relationship buttons, profile management, and messaging.

---

## Phase 1: Navigation & Messaging Recovery

### Task 1.1: Universal Orbital Menu
- [ ] Modify `src/components/Nav.tsx`: Remove `md:hidden` / `lg:hidden` logic for the menu toggle.
- [ ] Rename `src/components/MobileMenu.tsx` to `src/components/OrbitalMenu.tsx`.

### Task 1.2: Neural Link Recovery
- [ ] Create `src/hooks/useMessaging.ts`.
- [ ] Create `src/pages/Messaging.tsx` (ensure it exports a valid component).
- [ ] Modify `src/App.tsx`: Confirm route `/messaging` points to the new `Messaging` page.

## Phase 2: Relationship Logic & Profile

### Task 2.1: Persistent Connection Toggle
- [ ] Modify `src/pages/Scholars.tsx`: Refactor connection buttons to remain visible and toggle state (e.g., "Follow" -> "Following/Remove").

### Task 2.2: Profile Management
- [ ] Create `src/pages/Profile.tsx`: Bio editing, relationship stats.
- [ ] Modify `src/App.tsx`: Add `/profile` route.

---

**Plan complete. Would you like to proceed with the Subagent-Driven approach?**
