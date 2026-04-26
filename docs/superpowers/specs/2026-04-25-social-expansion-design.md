# Design Spec: NorthStar Social Expansion & Neural Link
**Date**: 2026-04-25
**Status**: Draft

## 1. Overview
This expansion transforms NorthStar from a research archive into a collaborative social platform for scholars. It introduces three primary subsystems:
1. **The Orbital Navigation**: A mobile-responsive menu system.
2. **The Connection Engine**: A multi-tiered relationship system (Followers, Study Partners, Business Partners).
3. **Sentiment & Dialogue**: Enhanced research interaction (Stars, Dislikes, Comments).
4. **Neural Link**: A real-time private messaging system.

## 2. Architecture & Data Model (Firestore)

### `connections` (Collection)
Tracks all relationships between scholars.
- `id`: `string` (Auto-generated)
- `fromId`: `string` (Initiator)
- `toId`: `string` (Receiver)
- `type`: `'follower' | 'study_partner' | 'business_partner'`
- `status`: `'pending' | 'accepted'` (Followers are always `accepted`)
- `createdAt`: `timestamp`

### `archive/{postId}/interactions` (Sub-collection)
Tracks sentiment on research.
- `userId`: `string` (Primary Key)
- `type`: `'star' | 'dislike'`
- `updatedAt`: `timestamp`

### `archive/{postId}/comments` (Sub-collection)
- `id`: `string`
- `userId`: `string`
- `content`: `string` (Max 1000 chars)
- `createdAt`: `timestamp`

### `conversations` (Collection)
- `participants`: `string[]` (UIDs)
- `lastMessage`: `string`
- `lastTimestamp`: `timestamp`

### `conversations/{convId}/messages` (Sub-collection)
- `senderId`: `string`
- `content`: `string`
- `createdAt`: `timestamp`

## 3. Component Details

### 3.1 Orbital Menu (Nav.tsx)
- **Desktop**: Existing pill-nav remains.
- **Mobile**:
    - Hamburger icon (3 lines) replaces links.
    - Animation: `framer-motion` `x: [100%, 0]` slide-in from right.
    - Overlay: 40% blur backdrop.
    - Items: "Find Scholars", "Archive", "Dashboard", "Messages", "Sign Out".

### 3.2 Find Scholars (Scholars.tsx)
- Fetches all documents from `scholars` collection.
- Search bar for display names.
- Card UI: Name, Grade, Level, and "Connection Cluster" (Follow/Partner buttons).

### 3.3 Neural Link (Messaging)
- **Real-time**: `onSnapshot` listener on `messages`.
- **UI**: 
    - Left Pane: Active conversations.
    - Right Pane: Message bubble stream.
    - Mobile: Full-screen view for active chat.

### 3.4 Interaction Lab (EntryDetail.tsx)
- Located below `redactedSegments`.
- **Star Button**: Gold SVG icon, increments `starCount` (Atomic update).
- **Dislike Button**: Red Thumbs Down SVG.
- **Comment Section**: Real-time list of scholar annotations.

## 4. Security Rules Updates
- `connections`: Only `fromId` can create. Only `toId` can update status. Both can read.
- `interactions`: One entry per user per post.
- `messages`: Only `participants` in the parent `conversation` can read/write.

## 5. Success Criteria
- [ ] Hamburger menu opens/closes smoothly on mobile.
- [ ] "Follow" is instant; "Partner" requests appear in target's notifications.
- [ ] Stars/Dislikes update in real-time across multiple tabs.
- [ ] Private messages delivered < 500ms (real-time).
