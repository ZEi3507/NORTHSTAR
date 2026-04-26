# Comments Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-time comments section to `EntryDetail.tsx` for community engagement in the NorthStar archive.

**Architecture:** A new `CommentsSection` component will be created, using Firestore `onSnapshot` to listen to an `archive/{postId}/comments` sub-collection for real-time updates. Authors' names will be fetched and cached within the `CommentsSection` to ensure optimal performance.

**Tech Stack:** Firebase Firestore, React, Tailwind CSS.

---

### Task 1: Create `CommentsSection` Component

**Files:**
- Create: `src/components/CommentsSection.tsx`

- [ ] **Step 1: Define component structure with basic UI**

```tsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useConductorStore } from '../stores/conductorStore';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

export const CommentsSection: React.FC<{ postId: string }> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { uid, displayName } = useConductorStore();

  useEffect(() => {
    const q = query(
      collection(db, 'archive', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    });
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !uid) return;
    await addDoc(collection(db, 'archive', postId, 'comments'), {
      authorId: uid,
      authorName: displayName || 'Scholar',
      content: newComment,
      createdAt: serverTimestamp(),
    });
    setNewComment('');
  };

  return (
    <div className="glass-card p-6 border border-white/5 space-y-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comments</h3>
      <div className="space-y-4">
        {comments.map(c => (
          <div key={c.id} className="p-4 rounded-lg bg-white/5 border border-white/5">
            <div className="text-xs font-bold text-accent-light mb-1">{c.authorName}</div>
            <p className="text-sm text-slate-300">{c.content}</p>
          </div>
        ))}
      </div>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="w-full p-4 rounded-lg bg-void border border-white/10 text-slate-200 text-sm focus:border-accent/50 outline-none transition-colors"
        placeholder="Share your insights..."
      />
      <button 
        onClick={handleSubmit}
        className="w-full py-3 bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-accent/10 transition-colors rounded-lg text-slate-300"
      >
        Submit
      </button>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CommentsSection.tsx
git commit -m "feat: add CommentsSection component"
```

### Task 2: Integrate `CommentsSection` into `EntryDetail`

**Files:**
- Modify: `src/pages/EntryDetail.tsx`

- [ ] **Step 1: Import and add to sidebar**

Modify `src/pages/EntryDetail.tsx` to include `CommentsSection` in the sidebar (`aside` element).

```tsx
// At top
import { CommentsSection } from '../components/CommentsSection';

// Inside <aside className="space-y-12">, add:
<CommentsSection postId={post.id} />
```

- [ ] **Step 2: Verify integration**

Ensure it renders correctly when an entry is viewed.

- [ ] **Step 3: Commit**

```bash
git add src/pages/EntryDetail.tsx
git commit -m "feat: integrate CommentsSection into EntryDetail"
```
