# Design: Scout Feature (Task 1.1)

## Overview
Enable scholars to view each other's profiles to foster community.

## Components
1. **Scholars.tsx**: Add a "Scout" button on each scholar card. Clicking it navigates to `/profile/:userId`.
2. **App.tsx**: Update route `/profile` to `/profile/:uid?`.
3. **Profile.tsx**: Update to fetch scholar data based on URL parameter or current user's UID.

## Data Flow
- Use `useParams` from `react-router-dom` to detect the requested UID.
- If UID is present, fetch that user's profile.
- If no UID, fetch the authenticated user's profile.
- Display "Edit" button only if viewing own profile.

## Verification
1. Click "Scout" in Scholars list.
2. Confirm URL updates to `/profile/<userId>`.
3. Confirm profile content reflects that specific user.
