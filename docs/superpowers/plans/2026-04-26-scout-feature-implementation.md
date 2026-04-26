# Scout Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable scholars to view other scholars' profiles.

**Architecture:** Update routing to handle optional user IDs and fetch corresponding data in the Profile component.

**Tech Stack:** React, React Router, Firebase, TypeScript.

---

### Task 1: Update App Routing

**Files:**
- Modify: `C:\Users\user\projects\northstar\src\App.tsx`

- [ ] **Step 1: Change profile route in App.tsx**

Update route for Profile:
```tsx
<Route path="/profile/:uid?" element={<Profile />} />
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: make profile route uid optional"
```

### Task 2: Modify Profile Component

**Files:**
- Modify: `C:\Users\user\projects\northstar\src\pages\Profile.tsx`

- [ ] **Step 1: Import useParams and fetch data based on uid param**

```tsx
import { useParams } from 'react-router-dom';
// ...
const { uid: urlUid } = useParams<{ uid: string }>();
const { uid: authUid } = useConductorStore();
const targetUid = urlUid || authUid;

useEffect(() => {
  if (!targetUid) return;
  const fetchScholar = async () => {
    const snap = await getDoc(doc(db, 'scholars', targetUid));
    if (snap.exists()) {
      const data = snap.data();
      setScholar(data);
      setBio(data.bio || '');
      setDisplayName(data.displayName || '');
    }
  };
  fetchScholar();
}, [targetUid]);
```

- [ ] **Step 2: Hide edit button if viewing other's profile**

```tsx
{isEditing ? (
  <button onClick={saveProfile} className="liquid-glass px-8 py-3 rounded-[2px] bg-mint text-black font-bold">Save Changes</button>
) : targetUid === authUid && (
  <button onClick={() => setIsEditing(true)} className="liquid-glass px-8 py-3 rounded-[2px] border border-white/20 hover:bg-white/5">Edit Profile</button>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Profile.tsx
git commit -m "feat: make profile page dynamic"
```

### Task 3: Update Scholars List

**Files:**
- Modify: `C:\Users\user\projects\northstar\src\pages\Scholars.tsx`

- [ ] **Step 1: Import Link and add Scout button**

```tsx
import { Link } from 'react-router-dom';
// ...
<div className="mt-auto flex flex-wrap gap-2">
  <Link 
    to={`/profile/${scholar.id}`}
    className="px-4 py-2 rounded-full bg-mint text-black text-sm font-semibold hover:bg-mint/80"
  >
    Scout
  </Link>
  {!connection ? (
// ...
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Scholars.tsx
git commit -m "feat: add scout button to scholar cards"
```
