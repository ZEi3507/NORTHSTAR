# Neural Link Messaging System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real-time messaging system with NorthStar glass aesthetics.

**Architecture:** Use Firestore real-time listeners in custom hooks for messaging and a full-screen dedicated page layout.

**Tech Stack:** React, TypeScript, Vite, Firebase Firestore, Tailwind CSS, Zustand.

---

### Task 1: Create useMessaging Hook

**Files:**
- Create: `src/hooks/useMessaging.ts`

- [ ] **Step 1: Define Message and Conversation types**

```typescript
import { Timestamp } from 'firebase/firestore';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: Timestamp;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastTimestamp: Timestamp;
}
```

- [ ] **Step 2: Implement useMessaging hook structure**

```typescript
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Message } from '../types';

export const useMessaging = (convId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!convId) return;
    const q = query(collection(db, 'conversations', convId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
  }, [convId]);

  const sendMessage = async (content: string, senderId: string) => {
    if (!convId) return;
    await addDoc(collection(db, 'conversations', convId, 'messages'), {
      content,
      senderId,
      createdAt: serverTimestamp(),
    });
  };

  return { messages, sendMessage };
};
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMessaging.ts
git commit -m "feat: add useMessaging hook"
```

### Task 2: Create Messaging Page

**Files:**
- Create: `src/pages/Messaging.tsx`

- [ ] **Step 1: Create Messaging page component**

```tsx
import React, { useState } from 'react';
import { useMessaging } from '../hooks/useMessaging';
import { useConductorStore } from '../stores/conductorStore';

export const Messaging: React.FC = () => {
  const { uid } = useConductorStore();
  const [convId, setConvId] = useState<string | null>(null);
  const { messages, sendMessage } = useMessaging(convId);
  const [input, setInput] = useState('');

  return (
    <div className="flex h-screen bg-neutral-900/80 backdrop-blur-md p-4">
      <div className="w-1/4 border-r border-neutral-700"> {/* Conversation List */} </div>
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto">
          {messages.map(m => <div key={m.id}>{m.content}</div>)}
        </div>
        <input value={input} onChange={e => setInput(e.target.value)} className="bg-neutral-800 p-2 text-white" />
        <button onClick={() => { sendMessage(input, uid!); setInput(''); }}>Send</button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Messaging.tsx
git commit -m "feat: add Messaging page"
```

### Task 3: Update App Routes

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add Messaging route**

```tsx
// Inside your Router setup
<Route path="/messaging" element={<Messaging />} />
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "chore: add messaging route"
```
