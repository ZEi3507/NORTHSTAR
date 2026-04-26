# Task 2: Enhance Messaging Page with Sidebar

## Description
Implement a sidebar in `Messaging.tsx` that fetches and lists the user's connections (partners/followers/following) using `useConnections`, allowing easy initiation of new chats.

## Checklist
- [ ] Implement Sidebar component in `src/pages/Messaging.tsx`
- [ ] Use `useConnections` hook to fetch data
- [ ] Map connections to display names
- [ ] Ensure sidebar UI integrates seamlessly with Messaging page layout
- [ ] Validate and commit changes

## Context
- `src/pages/Messaging.tsx`: Target file.
- `src/hooks/useSocial.ts`: Use `useConnections(uid)` hook.
- `src/stores/conductorStore.ts`: Use `uid` to get connections.
- Existing sidebar displays "Neural Links" (conversations). New sidebar should show "Contacts" or "Connections".

## Review Criteria
- Sidebar is responsive and matches NorthStar styling.
- Connections are correctly fetched and displayed.
- Interaction (clicking a connection) is handled (at least defined, even if chat initiation is stubbed).
