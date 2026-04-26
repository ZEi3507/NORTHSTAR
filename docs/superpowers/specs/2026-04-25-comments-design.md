# Task 3.2: Comments Section Design

## Architecture
- **Firestore Sub-collection**: `archive/{postId}/comments`
- **Comment Structure**:
  - `authorId`: string
  - `authorName`: string
  - `content`: string
  - `createdAt`: Timestamp

## UI Components
- **`CommentsSection` (Internal Component)**:
  - `textarea` for new comment input.
  - "Submit" button with `liquid-glass` style.
  - Comment list: map over comments, display name, content, timestamp.
- **Integration**:
  - Embedded into `EntryDetail.tsx` (Sidebar).
  - Use `onSnapshot` for real-time updates.

## Data Fetching
- Fetch `displayName` at time of comment creation (or cache in comment sub-doc) to avoid extra round trips.

## Design
- Use Tailwind CSS with existing `glass-card` styling for the comment section.
- Match existing NorthStar design tokens (colors, spacing, font).

## Testing
- Verify real-time updates.
- Verify author name display.
- Ensure 150-word constraint logic is NOT applied here, only for experiment submissions.
