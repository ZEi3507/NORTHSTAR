# Sacred Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a multimedia community-driven "Sacred Insights" repository for PDFs, docs, links, and images, gated by login.

**Architecture:** 
- Firestore `sacred-insights` collection for content and file metadata.
- Firebase Storage for file hosting.
- Frontend: New `SacredInsights.tsx` page with Category Slider and upload component.
- Security: Firestore rules ensure only logged-in users can read/write.

**Tech Stack:** React, Firebase Auth/Firestore/Storage, Tailwind CSS.

---

### Task 1: Initialize Firestore Rules & Storage

**Files:**
- Modify: `firestore.rules`
- Configure: Firebase Console (Storage bucket "sacred-insights")

- [ ] **Step 1: Update firestore.rules**

```firestore
    match /sacred-insights/{insightId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && resource.data.authorId == request.auth.uid;
    }
```

- [ ] **Step 2: Deploy rules**

Run: `firebase deploy --only firestore:rules`

---

### Task 2: Create SacredInsights Page UI

**Files:**
- Create: `src/pages/SacredInsights.tsx`
- Modify: `src/App.tsx` (Add route)

- [ ] **Step 1: Implement SacredInsights.tsx with Slider and Upload logic**

```tsx
// src/pages/SacredInsights.tsx
import React, { useState } from 'react';
import { useConductorStore } from '../stores/conductorStore';
import Nav from '../components/Nav';
import { Navigate } from 'react-router-dom';

const categories = ['All', 'Productivity', 'Coding', 'Finance', 'Life'];

const SacredInsights: React.FC = () => {
  const uid = useConductorStore((s) => s.uid);
  const [category, setCategory] = useState('All');

  if (!uid) return <Navigate to="/signin" replace />;

  return (
    <div className="min-h-screen bg-void text-slate-200">
      <Nav />
      <div className="max-w-4xl mx-auto pt-32 px-6">
        <h1 className="text-4xl font-heading font-bold text-white mb-8">Sacred Insights</h1>
        
        {/* Category Slider */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-6 py-2 rounded-full whitespace-nowrap ${category === c ? 'bg-accent text-white' : 'bg-white/5'}`}>
              {c}
            </button>
          ))}
        </div>
        
        {/* Upload/Grid area placeholder */}
        <div className="glass p-12 rounded-2xl text-center">
            <p>Community insights coming soon.</p>
        </div>
      </div>
    </div>
  );
};
export default SacredInsights;
```

---

### Task 3: Integrate into Navigation

**Files:**
- Modify: `src/components/Nav.tsx`

- [ ] **Step 1: Add "Sacred Insights" link to navigation**

```tsx
<Link to="/sacred-insights" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
  Sacred Insights
</Link>
```

---

### Task 4: Deployment

- [ ] **Step 1: Build and deploy**

Run: `npm run build && firebase deploy --only hosting`

---
