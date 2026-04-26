# Social Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the social experience by adding connection counts to the profile page, sidebar contact list to messages, and a "Scout" feature to the scholars list.

**Architecture:**
1. **Profile Counts:** Add `useConnections` and connection processing in `Profile.tsx` to display follower/following/partner counts.
2. **Messaging Sidebar:** Implement a sidebar in `Messaging.tsx` that fetches and lists connected users.
3. **Scout Feature:** Ensure existing "Scout" button in `Scholars.tsx` works (currently it is a link to `/profile/:id`). Implement `Profile.tsx` to handle dynamic user IDs.

**Tech Stack:** React, TypeScript, Firebase, Zustand

---

### Task 1: Update Profile Page to display Social Counts

**Files:**
- Modify: `src/pages/Profile.tsx`

- [ ] **Step 1: Modify `Profile.tsx` to accept dynamic `id` param**
  Use `useParams` from `react-router-dom` to detect if we are viewing current user or another user.

- [ ] **Step 2: Add social count logic**
  Fetch connections for the target user and calculate:
  - Followers
  - Followings
  - Partners

- [ ] **Step 3: Render counts UI**
  Add a section below the bio to show: `Followers: N | Following: N | Partners: N`

### Task 2: Enhance Messaging Page with Sidebar

**Files:**
- Modify: `src/pages/Messaging.tsx`

- [ ] **Step 1: Implement Sidebar component**
  Create a sidebar that fetches the current user's connections using `useConnections`.

- [ ] **Step 2: List connections**
  Map connections to display names of partners/followed users. Click to initiate chat.

### Task 3: Finalize Scout Feature

**Files:**
- Modify: `src/pages/Scholars.tsx`
- Modify: `src/pages/Profile.tsx`

- [ ] **Step 1: Verify `Scholars.tsx` Scout button**
  Ensure it correctly links to `/profile/:id`.

- [ ] **Step 2: Update `Profile.tsx` to handle dynamic profile loading**
  Ensure the data fetching logic uses the `id` from URL params instead of just `uid` from store if present.
