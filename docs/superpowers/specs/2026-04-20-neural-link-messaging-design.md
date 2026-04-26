# Neural Link Messaging System Design

## Architecture
- **Data Model**:
  - `conversations`: { participants: string[], lastMessage: string, lastTimestamp: timestamp }
  - `messages`: { senderId: string, content: string, createdAt: timestamp }
- **Components**:
  - `Messaging.tsx`: Main page layout, 7:3 split conversation list/chat stream.
  - `useMessaging.ts`: Custom hook to manage Firestore real-time subscriptions and message posting.

## UI/UX
- Consistent with NorthStar glass-morphism (CSS classes).
- Responsive layout integrated with the standard Navigation sidebar.

## Implementation Details
- Messaging page will be added to `App.tsx` router.
- Authentication: Secure data access via user UID in the participants array.
