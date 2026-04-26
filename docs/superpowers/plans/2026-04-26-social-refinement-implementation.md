# Social Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement professional social media features: Stats-rich Profile, conversation-initiating Messaging, and Scout feature.

---

## Phase 1: Interaction & Navigation
### Task 1.1: Scout Feature
- [ ] Modify `src/pages/Scholars.tsx`: Add "Scout" button to each card.
- [ ] Add route `/profile/:userId` in `src/App.tsx`.
- [ ] Create `src/pages/PublicProfile.tsx` (or update `Profile.tsx` to handle dynamic route `/:userId`).

## Phase 2: Profile Analytics
### Task 2.1: Stat Dashboard
- [ ] Modify `src/pages/Profile.tsx`: Add `StatCard` row showing Following/Followers/Partners counts.

## Phase 3: Messaging UX Overhaul
### Task 3.1: Conversation Initiation
- [ ] Modify `src/pages/Messaging.tsx`: Add sidebar list populated by active "Partners" and "Followers".
- [ ] Implement logic to start a new conversation on click if one doesn't exist.

---

**Plan complete. Proceding with implementation.**