# NorthStar Security & Consistency Reconciliation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the "Safe Gateway" security pattern, wire the Harmony Tracker stubs, and standardize design tokens across the application.

**Architecture:** 
1. **Security:** Consolidate `redactedContent` back into the main `archive` document and strictly enforce its retrieval via the `getPostForUser` Cloud Function. 
2. **Data:** Initialize `conductStats` at signup and derive dashboard metrics from real data.
3. **Styling:** Unified design token application using Tailwind classes and CSS variables.

**Tech Stack:** React, TypeScript, Firebase (Auth, Firestore, Functions), Zustand, Tailwind CSS.

---

### Task 1: Consolidate Redacted Content & Update Cloud Functions

**Files:**
- Modify: `functions/src/index.ts`
- Modify: `src/pages/SubmitEntry.tsx`
- Modify: `src/pages/ReviseEntry.tsx`
- Modify: `firestore.rules`

- [ ] **Step 1: Update `index.ts` to expect `redactedContent` in the main document and enhance security**
```typescript
// functions/src/index.ts (getPostForUser)
// Ensure it only returns redactedContent if level >= 2
// ... existing checks ...
const post = postSnap.data()!;
const scholar = scholarSnap.data()!;

const response: any = {
  id: postSnap.id,
  title: post.title,
  type: post.type,
  publicContent: post.publicContent,
  authorId: post.authorId,
  publishedAt: post.publishedAt,
  wordCount: post.wordCount,
};

// Return redactedContent ONLY if scholar is Lvl 2+ OR is the author
if ((scholar.level || 1) >= 2 || post.authorId === context.auth.uid) {
  response.redactedContent = post.redactedContent;
}
return response;
```

- [ ] **Step 2: Update `SubmitEntry.tsx` and `ReviseEntry.tsx` to write to the main document**
Remove subcollection writes (`gated/content`) and put `redactedContent` in the main `archive` document.

- [ ] **Step 3: Update `firestore.rules` to prevent direct read of `redactedContent`**
Since Firestore doesn't have field-level rules, we must explicitly document that client-side code *must* use the callable. However, we can remove the `gated` subcollection rules.

- [ ] **Step 4: Deploy Cloud Functions**
Run: `firebase deploy --only functions`

---

### Task 2: Force "Safe Gateway" in Frontend

**Files:**
- Modify: `src/pages/EntryDetail.tsx`
- Modify: `src/pages/AdminReview.tsx`
- Modify: `src/pages/ReviseEntry.tsx`

- [ ] **Step 1: Refactor `EntryDetail.tsx` to use `getPostForUser` callable**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const getPostForUser = httpsCallable(functions, 'getPostForUser');

// Inside useEffect:
const { data } = await getPostForUser({ postId });
setPost(data as PostResponse);
```

- [ ] **Step 2: Update `AdminReview.tsx` to use the same logic or direct read (since admin has bypass)**
Admin actually has `read` access to the whole doc in rules, but for consistency, use the callable or ensure the UI handles the consolidated field.

---

### Task 3: Wire Harmony Tracker & Signup Logic

**Files:**
- Modify: `src/pages/SignUp.tsx`
- Modify: `src/pages/ConductorDashboard.tsx`

- [ ] **Step 1: Initialize `conductStats` in `SignUp.tsx`**
```typescript
await setDoc(doc(db, 'scholars', user.uid), {
  displayName,
  scholarGrade: 'Initiate',
  level: 1,
  postCount: 0,
  approvedPostIds: [],
  pendingPostId: null,
  conductStats: {
    focusScore: 0,
    experimentsRun: 0
  },
  createdAt: serverTimestamp()
});
```

- [ ] **Step 2: Calculate "Archive Sync" in `ConductorDashboard.tsx`**
```typescript
const syncPercentage = Math.min(100, (postCount / 5) * 100);
// Use syncPercentage in the UI bar
```

---

### Task 4: Standardize Design Tokens

**Files:**
- Modify: `src/pages/Profile.tsx`
- Sweep: `src/components/ui/`

- [ ] **Step 1: Replace hardcoded hex in `Profile.tsx` with `bg-void` or `--color-bg`**
- [ ] **Step 2: Verify `Nav.tsx` consistency with `Sigil.tsx`**

---

### Task 5: Verification

- [ ] **Step 1: Register a new user and verify `conductStats` are 0, not null.**
- [ ] **Step 2: Submit a post as Level 1 and verify `redactedContent` is NOT in the network response for `getPostForUser`.**
- [ ] **Step 3: Approve post as Admin and verify user levels up to Level 2.**
- [ ] **Step 4: Verify Level 2 user CAN see redacted content via the callable.**
