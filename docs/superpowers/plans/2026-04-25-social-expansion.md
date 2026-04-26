# NorthStar Social Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform NorthStar into a collaborative social platform with a mobile-responsive menu, a three-tier connection system, research sentiment tracking, and real-time private messaging.

**Architecture:** 
- **Navigation**: Responsive React component with Framer Motion sidebar.
- **Social**: Relationship-first data model in Firestore using a flat `connections` collection.
- **Sentiment**: Real-time atomic counters and sub-collection comments.
- **Messaging**: Participant-based conversation rooms with nested message streams.

**Tech Stack:** React, TypeScript, Tailwind CSS, Framer Motion, Firebase Firestore.

---

## Phase 1: Orbital Navigation (Mobile Menu)

### Task 1.1: Mobile Menu Component
**Files:**
- Create: `src/components/MobileMenu.tsx`
- Modify: `src/components/Nav.tsx`

- [ ] **Step 1: Create MobileMenu component with Framer Motion**
```tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Users, MessageSquare, Archive, Layout, LogOut } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  uid: string | null;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onSignOut, uid }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-void/80 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-[280px] h-full bg-void border-l border-white/10 z-[101] p-8 shadow-2xl"
          >
            <div className="flex justify-end mb-8">
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              <Link to="/scholars" onClick={onClose} className="flex items-center gap-4 text-lg font-heading text-slate-300 hover:text-mint transition-colors">
                <Users size={20} /> Find Scholars
              </Link>
              <Link to="/archive" onClick={onClose} className="flex items-center gap-4 text-lg font-heading text-slate-300 hover:text-mint transition-colors">
                <Archive size={20} /> Archive
              </Link>
              {uid && (
                <>
                  <Link to="/messages" onClick={onClose} className="flex items-center gap-4 text-lg font-heading text-slate-300 hover:text-mint transition-colors">
                    <MessageSquare size={20} /> Messages
                  </Link>
                  <Link to="/dashboard" onClick={onClose} className="flex items-center gap-4 text-lg font-heading text-slate-300 hover:text-mint transition-colors">
                    <Layout size={20} /> Dashboard
                  </Link>
                  <button onClick={() => { onSignOut(); onClose(); }} className="flex items-center gap-4 text-lg font-heading text-red-400 hover:text-red-300 transition-colors mt-8">
                    <LogOut size={20} /> Exit
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

- [ ] **Step 2: Integrate Menu Toggle in Nav.tsx**
```tsx
// Add state and Menu icon to Nav.tsx
import { Menu } from 'lucide-react';
import { MobileMenu } from './MobileMenu';

// Inside Nav component:
const [isMenuOpen, setIsMenuOpen] = useState(false);

// Add to the right side of Nav:
<button 
  onClick={() => setIsMenuOpen(true)}
  className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
>
  <Menu size={24} />
</button>

<MobileMenu 
  isOpen={isMenuOpen} 
  onClose={() => setIsMenuOpen(false)} 
  onSignOut={handleSignOut}
  uid={uid}
/>
```

- [ ] **Step 3: Verify responsive visibility**
Check that hamburger only appears on screens < 768px.

---

## Phase 2: Connection Engine (Followers & Partners)

### Task 2.1: Social Hooks
**Files:**
- Create: `src/hooks/useSocial.ts`

- [ ] **Step 1: Implement connection logic**
Handle Follow (Tier 0), Study Partner (Tier 1), Business Partner (Tier 2).

### Task 2.2: Scholars Discovery Page
**Files:**
- Create: `src/pages/Scholars.tsx`
- Modify: `src/App.tsx` (Route)

- [ ] **Step 1: Build Grid UI for scholars**
Show "Follow", "Request Partner" buttons.

---

## Phase 3: Interaction Lab (Sentiment)

### Task 3.1: Research Sentiment UI
**Files:**
- Modify: `src/pages/EntryDetail.tsx`

- [ ] **Step 1: Implement Star (Like) and Dislike buttons**
Use `lucide-react` Star and ThumbsDown icons.

### Task 3.2: Comments Section
**Files:**
- Modify: `src/pages/EntryDetail.tsx`

- [ ] **Step 1: Implement real-time comment list**

---

## Phase 4: Neural Link (Messaging)

### Task 4.1: Chat Infrastructure
**Files:**
- Create: `src/hooks/useMessaging.ts`
- Create: `src/pages/Messaging.tsx`

- [ ] **Step 1: Real-time chat UI with participant selection**

---

## Phase 5: Security & Verification

### Task 5.1: Firestore Rules
**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: Secure all new collections**
Check participant access for messages and connection request validation.
