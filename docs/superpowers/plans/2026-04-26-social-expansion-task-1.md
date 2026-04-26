# Implementation Plan: Profile Social Counts

- Goal: Add social count logic (Followers, Following, Partners) and render them in the profile UI of `src/pages/Profile.tsx`.
- Approach:
  1. Use `useParams` from `react-router-dom` to get `id` from URL.
  2. Use `useConductorStore` to get current `uid` and identify if profile is own or other.
  3. Use `useConnections` hook to fetch connections for the target user `id` (or `uid`).
  4. Process connections to count followers, following, and partners.
  5. Render the counts UI in `Profile.tsx`.
  6. Ensure data loading logic uses the `id` from URL params.

- TodoWrite:
  - [ ] Implement `useParams` logic in `Profile.tsx`.
  - [ ] Add `useConnections` hook and logic in `Profile.tsx`.
  - [ ] Implement logic to calculate follower/following/partner counts.
  - [ ] Render the counts in UI below bio.
