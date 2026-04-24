# NorthStar — Product Requirements Document
## The Conduct Laboratory & Archive (V2.0)
> Status: Merged Final — Pre-Build Specification
> Stack: React + TypeScript + Firebase (Firestore, Auth, Functions) + Zustand + Tailwind
> Last updated: 2026-04-18

---

## 1. Executive Summary

NorthStar is an elite research platform and life-operating system for the
intentional conductor. It combines a gamified access system with a scholarly
archive and personal conduct laboratory. Access to gated content is earned
through contribution. Contribution passes a human review hold before any
level change fires. The system manages the full entry lifecycle:
draft → pending → approved/rejected → revise → resubmit.

**The Three Pillars:**
- **The Laboratory** — Life as a series of experiments. Structured protocols
  with Hypothesis, Method, and gated Results.
- **The Archive** — A repository of shared scholarly wisdom, gated by
  The Veil. Contribution is the only key.
- **The Conduct** — Mastery over distraction. Intent over impulse.
  Every entry is evidence of deliberate practice.

**In scope for V2.0:**
- Scholar auth + binary level system (Initiate → Archivist)
- Dual entry types: Research Entry and Conduct Protocol
- Experiment Builder with Protocol template and `[redact]` tagging
- 150-word minimum + review hold before level-up fires
- Revise & resubmit flow for returned entries
- Level-down on entry deletion (if only approved entry)
- The Veil — server-enforced redaction, never CSS
- The Review Laboratory — admin panel, owner-only
- Conductor Dashboard — post history, level status, Harmony tracker stub
- Archive layout — 7:3 split (Content : Marginalia column stub)

**Out of scope for V2.0:**
- The Oracle / AI synthesis / RAG — cut permanently
- Level 3+ Scholar Grades
- Marginalia annotation logic (sidebar shell only)
- Email notifications (stub message, wire in V2.1)
- Harmony tracker logic (field stubbed, write logic in V2.1)

---

## 2. Scholar System ("The Conductor")

### 2.1 Scholar Levels

| Level | Title | Access | Requirement |
|---|---|---|---|
| 1 | Initiate | Public Archive, Private Sanctum | Registration |
| 2 | Archivist | Level 1 + The Veil revealed | 1 Approved Entry |

Level system is strictly binary in V2.0. No Level 3+. Do not scaffold for it.

### 2.2 Firestore Schema

```javascript
// /scholars/{userId}
{
  displayName: string,
  scholarGrade: "Initiate" | "Archivist",
  level: number,                  // 1 or 2 only
  postCount: number,              // Approved entries only — never pending
  approvedPostIds: string[],      // Required for level-down logic
  pendingPostId: string | null,   // One pending entry at a time — enforced
  conductStats: {
    focusScore: null,             // Stub — no write logic in V2.0
    experimentsRun: null,         // Stub — no write logic in V2.0
  },
  createdAt: timestamp
}

// /archive/{postId}
{
  authorId: string,
  title: string,
  type: "research" | "protocol",  // Entry type — drives editor template
  publicContent: string,          // Always visible to Level 1+
  redactedContent: string,        // Server-gated — never sent to Level 1 clients
  status: "draft" | "pending" | "approved" | "rejected",
  rejectionReason: string | null, // Shown to user in Conductor Dashboard
  revisionCount: number,          // Increments on each resubmit — audit trail
  wordCount: number,              // Computed on full raw content incl. redacted text
  isFirstApprovedPost: boolean,   // Flags level-up trigger — prevents repeat fires
  createdAt: timestamp,
  submittedAt: timestamp | null,
  publishedAt: timestamp | null
}
```

**Schema integrity notes:**
- `approvedPostIds[]` is the source of truth for level-down. A `postCount`
  counter alone is insufficient — you need the IDs to remove the correct entry.
- `isFirstApprovedPost` prevents the level-up from firing on every subsequent
  approval. It is set to `true` once, on first submission, and never changed.
- `conductStats` fields are initialized as `null`. No logic writes to them
  in V2.0. They exist in the schema so V2.1 can write to them without migration.
- `rejectionReason` is cleared on resubmit (`null`) and re-populated on
  the next rejection if one occurs.

### 2.3 Entry Lifecycle & State Machine

```
[DRAFT] ──submit──→ [PENDING]
                        │
              ┌─────────┴─────────┐
           approve              reject
              │                   │
        [APPROVED]          [REJECTED]
              │              (rejectionReason written to doc)
        entry goes public    (shown in Conductor Dashboard)
        level-up fires            │
        (if isFirstApprovedPost)  │
                             user revises same entry
                             (same document ID preserved)
                                  │
                             resubmit
                                  │
                             [PENDING] ← back in queue
                             revisionCount++
                             rejectionReason → null
```

**Rule: One entry in PENDING at a time.**
A Scholar with `pendingPostId !== null` cannot submit another entry.
The submit button is disabled with copy: *"You have an entry awaiting review."*

**Rule: Revision preserves the same document ID.**
On resubmit, the existing Firestore document is updated in-place:
`status → "pending"`, `revisionCount++`, `rejectionReason → null`.
No new document is created. The revision history lives in `revisionCount`.

### 2.4 The Hive Mind — Server Functions

All level changes fire server-side only. The client never writes to `level`
or `scholarGrade` directly.

```javascript
// Firebase Function: onPostStatusChange
// Fires on every status field update to /archive/{postId}
exports.onPostStatusChange = functions.firestore
  .document('archive/{postId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const authorRef = db.collection('scholars').doc(after.authorId);

    // ── APPROVAL PATH ──────────────────────────────────────────
    if (before.status === 'pending' && after.status === 'approved') {
      const author = await authorRef.get();
      const authorData = author.data();

      const updates = {
        postCount: admin.firestore.FieldValue.increment(1),
        pendingPostId: null,
        approvedPostIds: admin.firestore.FieldValue.arrayUnion(
          context.params.postId
        ),
      };

      // Level-up fires only on the first ever approved entry
      if (after.isFirstApprovedPost && authorData.level < 2) {
        updates.level = 2;
        updates.scholarGrade = 'Archivist';
      }

      return authorRef.update(updates);
    }

    // ── REJECTION PATH ─────────────────────────────────────────
    if (before.status === 'pending' && after.status === 'rejected') {
      // Clear pendingPostId so Scholar can revise and resubmit
      return authorRef.update({ pendingPostId: null });
    }
  });


// Firebase Function: onPostDeleted
// Fires when an entry document is deleted from /archive/{postId}
exports.onPostDeleted = functions.firestore
  .document('archive/{postId}')
  .onDelete(async (snap, context) => {
    const post = snap.data();

    // Only approved entries affect Scholar level
    if (post.status !== 'approved') return;

    const authorRef = db.collection('scholars').doc(post.authorId);
    const author = await authorRef.get();
    const authorData = author.data();

    const updatedApprovedIds = authorData.approvedPostIds.filter(
      id => id !== context.params.postId
    );

    const updates = {
      postCount: Math.max(0, authorData.postCount - 1),
      approvedPostIds: updatedApprovedIds,
    };

    // Level-down: no approved entries remaining → demote to Initiate
    if (updatedApprovedIds.length === 0) {
      updates.level = 1;
      updates.scholarGrade = 'Initiate';
    }

    return authorRef.update(updates);
  });
```

**Test both functions in Firebase Emulator only. Never test level logic
in production.**

---

## 3. The Veil — Redaction System

### 3.1 Security Architecture

`redactedContent` is never sent to Level 1 (Initiate) clients. Not hidden
via CSS. Not filtered client-side. Never present in the DOM for Initiates.
Enforced at the Firebase callable function layer before the response leaves
the server.

**Firestore Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /archive/{postId} {
      // Authenticated users can read approved entries only
      allow read: if request.auth != null
                  && resource.data.status == 'approved';
      allow write: if false; // Server-side only — no client writes
    }

    match /scholars/{userId} {
      allow read: if request.auth != null;
      allow write: if false; // Server-side only
    }

    // Admin collection — owner UID only
    match /admin/{document=**} {
      allow read, write: if request.auth.uid == '[OWNER_UID]';
    }
  }
}
```

**Critical enforcement note:** Direct Firestore reads of `/archive/{postId}`
must never include `redactedContent` in any client query. All entry fetches
route through `getPostForUser`. This is not a guideline — it is the security
boundary. If Gemini CLI writes a direct Firestore read that returns the full
document, that is a build error.

**Callable Function — getPostForUser:**

```javascript
exports.getPostForUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const { postId } = data;
  const [postSnap, scholarSnap] = await Promise.all([
    db.collection('archive').doc(postId).get(),
    db.collection('scholars').doc(context.auth.uid).get(),
  ]);

  if (!postSnap.exists || postSnap.data().status !== 'approved') {
    throw new functions.https.HttpsError('not-found', 'Entry not found.');
  }

  const post = postSnap.data();
  const scholar = scholarSnap.data();

  // Base response — always safe for Level 1
  const response = {
    id: postSnap.id,
    title: post.title,
    type: post.type,
    publicContent: post.publicContent,
    authorId: post.authorId,
    publishedAt: post.publishedAt,
  };

  // Append redactedContent only for Archivists (Level 2+)
  if (scholar.level >= 2) {
    response.redactedContent = post.redactedContent;
  }

  return response;
});
```

### 3.2 The Veil UI Component

```typescript
// components/TheVeil.tsx
interface TheVeilProps {
  children: string;
  userLevel: number;
}

export const TheVeil: React.FC<TheVeilProps> = ({ children, userLevel }) => {
  const isRevealed = userLevel >= 2;
  const barLength = Math.min(children.length, 40);

  return (
    <span className="veil-wrapper">
      {isRevealed ? (
        <span className="veil-revealed">{children}</span>
      ) : (
        <span
          className="veil-bar"
          aria-label="Redacted — publish an entry to reveal"
        >
          {'█'.repeat(barLength)}
          <span className="veil-cta">Publish an entry to reveal</span>
        </span>
      )}
    </span>
  );
};
```

**CSS — NorthStar design tokens:**

```css
:root {
  --color-redaction: #000000;
  --color-redaction-glow: rgba(196, 151, 58, 0.35); /* Aged Gold — dark mode only */
}

.veil-wrapper {
  display: inline;
  position: relative;
}

.veil-bar {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  cursor: not-allowed;
  user-select: none;
}

/* The black bar */
.veil-bar::before {
  content: attr(data-bar);
  display: inline-block;
  background: var(--color-redaction);
  color: transparent;
  border-radius: 2px;
  padding: 0 var(--space-1);
  font-family: var(--font-body);
}

/* Dark mode: Aged Gold glow signals revealability */
[data-theme="dark"] .veil-bar::before {
  box-shadow: 0 0 8px var(--color-redaction-glow);
}

/* CTA below the bar */
.veil-cta {
  font-family: var(--font-body);
  font-size: var(--text-label);       /* 12px */
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent);
  border-bottom: 1px solid transparent;
  transition: border-color 150ms ease;
}

.veil-bar:hover .veil-cta {
  border-bottom-color: var(--color-accent);
}

/* Reveal animation — 400ms as per design spec */
.veil-revealed {
  animation: veilReveal 400ms ease-in-out forwards;
}

@keyframes veilReveal {
  from { opacity: 0; filter: blur(4px); }
  to   { opacity: 1; filter: blur(0); }
}
```

### 3.3 The `[redact]` Parser

```typescript
// lib/parsePostContent.ts
export interface ParsedEntry {
  publicContent: string;    // Full text with [REDACTED] placeholder markers
  redactedContent: string;  // Extracted segments joined by separator
  wordCount: number;        // Computed on full raw content including redacted text
}

export function parsePostContent(rawContent: string): ParsedEntry {
  const redactRegex = /\[redact\]([\s\S]*?)\[\/redact\]/g;
  const segments: string[] = [];

  const publicContent = rawContent.replace(redactRegex, (_, inner) => {
    segments.push(inner.trim());
    return '[REDACTED]';
  });

  // Word count includes redacted text — prevents gaming the 150-word minimum
  const wordCount = rawContent
    .replace(/\[redact\]|\[\/redact\]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    publicContent: publicContent.trim(),
    redactedContent: segments.join('\n---\n'),
    wordCount,
  };
}
```

**Validation on submit:**
```typescript
const MIN_WORD_COUNT = 150;

if (parsed.wordCount < MIN_WORD_COUNT) {
  return {
    error: `Entries must be at least ${MIN_WORD_COUNT} words.
            Yours is currently ${parsed.wordCount}.`
  };
}
```

---

## 4. The Experiment Builder — Entry Editor

Scholars submit two types of entries. The editor detects type selection
and loads the appropriate template. Both types share the same submission
pipeline and `[redact]` tag system.

### 4.1 Entry Types

**Research Entry (`type: "research"`)**
Free-form scholarly writing. No enforced structure beyond the 150-word minimum
and `[redact]` tagging. The Hypothesis and Method go in `publicContent`.
The Results and Insights go inside `[redact]` tags → stored as `redactedContent`.

**Conduct Protocol (`type: "protocol"`)**
Structured laboratory format. The editor loads a guided template with three
labeled sections:

```
┌─────────────────────────────────────────────────┐
│  CONDUCT PROTOCOL                               │
├─────────────────────────────────────────────────┤
│  HYPOTHESIS                                     │
│  What do I expect to happen or discover?        │
│  [free text field]                              │
├─────────────────────────────────────────────────┤
│  PROTOCOL                                       │
│  What exact steps will I follow?                │
│  [free text field]                              │
├─────────────────────────────────────────────────┤
│  OBSERVATION  [redact]...[/redact] recommended  │
│  What actually happened? What did I learn?      │
│  [free text field]                              │
└─────────────────────────────────────────────────┘
```

The three sections are concatenated into `rawContent` before passing to
`parsePostContent()`. The Observation section is pre-wrapped in `[redact]`
tags by default — the Scholar can remove them if they choose not to gate
the result.

### 4.2 Editor Rules

- Both types enforce the 150-word minimum before submission is allowed.
- The `[redact]` tag is available in both types — not restricted to protocols.
- A Scholar with `pendingPostId !== null` sees a disabled submit button
  with copy: *"You have an entry awaiting review."*
- On submission: `parsePostContent()` runs, word count is validated,
  the Firestore document is created with `status: "pending"`,
  and `scholars/{userId}.pendingPostId` is updated to the new post ID.

---

## 5. The Review Laboratory — Admin Panel

Owner-only route. Protected by Firebase UID. Not linked anywhere in the
public nav — accessible only by navigating directly to the route.

**Route:** `/admin/review`
**Access guard:** `requireAdminAuth` middleware checks `request.auth.uid`
against the hardcoded owner UID before rendering anything.

### 5.1 Panel Features

- **Queue list:** All entries with `status: "pending"`, sorted by
  `submittedAt` ascending (oldest first).
- **Queue item metadata:** Entry title, Scholar display name, entry type
  (`RESEARCH` / `PROTOCOL`), word count, revision count, submission time.
- **Review view:** Side-by-side render of `publicContent` (left) and
  `redactedContent` (right), with the Protocol template sections labelled
  if `type: "protocol"`.
- **Approve:** One-click. Updates `status → "approved"`. The `onPostStatusChange`
  function handles the rest.
- **Reject:** Requires a rejection reason (minimum 20 characters) before
  the button enables. Updates `status → "rejected"`,
  writes `rejectionReason` to the entry document.

### 5.2 Rejection Reason Display

The `rejectionReason` field is read by the Conductor Dashboard and shown
to the Scholar with the copy: *"Your entry was returned for revision."*
followed by the reason text. The Scholar can then edit the same entry and
resubmit.

---

## 6. The Conductor Dashboard

A personal route for each Scholar. Shows their standing, history, and
conduct tracking.

**Route:** `/dashboard`

### 6.1 Dashboard Sections

**Standing Panel**
- Scholar Grade badge (`INITIATE` / `ARCHIVIST`) — monospace, uppercase,
  pipe-bordered: `| ARCHIVIST |`
- Current level indicator
- Approved post count
- Pending entry status (if any): *"1 entry awaiting review"*

**Entry History**
- List of all entries by this Scholar, sorted by `createdAt` descending
- Each row shows: title, type, status, submission date
- Rejected entries show the `rejectionReason` inline with
  a "Revise Entry" action link
- Approved entries link to the published archive entry

**Harmony Tracker (Placeholder)**
- Visual placeholder panel. Copy: *"Harmony tracking coming in V2.1."*
- `conductStats.focusScore` and `conductStats.experimentsRun` are rendered
  as `—` until write logic is implemented in V2.1.
- Do not build any interaction logic for this panel in V2.0.

---

## 7. State Management

**Decision: Zustand. Not React Context.**

Multiple `TheVeil` components mount per archive entry page. React Context
re-renders every consumer on any state change. Zustand uses selector-based
subscriptions — components only re-render when their specific slice changes.
This is not optional — it is a performance boundary.

```typescript
// stores/conductorStore.ts
import { create } from 'zustand';

interface ConductorState {
  uid: string | null;
  level: number;
  scholarGrade: 'Initiate' | 'Archivist';
  postCount: number;
  approvedPostIds: string[];
  pendingPostId: string | null;
  conductStats: { focusScore: null; experimentsRun: null };
  isLoading: boolean;
  setConductor: (data: Partial<ConductorState>) => void;
  clearConductor: () => void;
}

export const useConductorStore = create<ConductorState>((set) => ({
  uid: null,
  level: 1,
  scholarGrade: 'Initiate',
  postCount: 0,
  approvedPostIds: [],
  pendingPostId: null,
  conductStats: { focusScore: null, experimentsRun: null },
  isLoading: true,
  setConductor: (data) => set((state) => ({ ...state, ...data })),
  clearConductor: () => set({
    uid: null,
    level: 1,
    scholarGrade: 'Initiate',
    postCount: 0,
    approvedPostIds: [],
    pendingPostId: null,
    conductStats: { focusScore: null, experimentsRun: null },
    isLoading: false,
  }),
}));
```

Populate via `onAuthStateChanged` → fetch `/scholars/{uid}` → `setConductor()`.
Any component needing `level` reads only `useConductorStore(s => s.level)`.
No prop drilling. No Context provider wrapping.

---

## 8. Design System

All components reference tokens from `globals.css`. No hardcoded hex values
in any component file.

### 8.1 Visual Philosophy

NorthStar reads like a laboratory journal, not a blog. The aesthetic signals
precision, not decoration. Two rules govern everything:

- **High-Signal, Low-Noise:** Monochrome base. One accent at a time.
  No decorative color.
- **Technical Elegance:** Metadata displayed with pipes and monospace.
  `| ARCHIVIST |` not a badge with rounded corners.
  Scholar Grade: `font-family: monospace`, uppercase, pipe-bordered.

### 8.2 Design Tokens

| Element | Spec |
|---|---|
| Font Display | Cormorant Garamond — display titles only, never below 28px |
| Font Heading | EB Garamond — section headings H2–H4 |
| Font Body / UI | Inter — all prose, metadata, labels |
| Accent (Light mode) | `#1E3A5F` Prussian Navy |
| Accent (Dark mode) | `#C4973A` Aged Gold |
| Background (Light) | `#F8F7F4` warm off-white |
| Background (Dark) | `#0F0E0D` near-black warm |
| Veil bar | `--color-redaction: #000000`, `border-radius: 2px` |
| Veil CTA | `--text-label` (12px), `--color-accent`, uppercase, `letter-spacing: 0.08em` |
| Dark mode veil glow | `box-shadow: 0 0 8px rgba(196,151,58,0.35)` |
| Veil reveal animation | `400ms ease-in-out` |
| Article body | `--font-body`, 18px, `line-height: 1.75`, `max-width: 68ch` |
| Card hover | `translateY(-1px)` — no scale, no box-shadow |
| Border radius | `2px` system default — no exceptions |
| Sidebar width | `320px` fixed |
| Content column | `max-width: 68ch` centered |
| UI transitions | `150ms` — nothing above `400ms` |
| Scholar Grade display | `\| ARCHIVIST \|` — monospace, uppercase, pipe-bordered |

### 8.3 Archive Layout

```
┌────────────────────────────────────────────────────────────┐
│  NORTHSTAR                                    [nav items]  │
├──────────────────────────────────────┬─────────────────────┤
│                                      │                     │
│   CONTENT COLUMN                     │  MARGINALIA         │
│   (flex — ~72% at 1280px)            │  (320px fixed)      │
│                                      │                     │
│   Entry title                        │  Related entries    │
│   Author · Date · Type               │  (compact cards)    │
│                                      │                     │
│   Public content...                  │  Author profile     │
│                                      │  strip              │
│   ██████████████████                 │                     │
│   Publish an entry to reveal         │  [Annotation stub   │
│                                      │   — V2.2]           │
│   More public content...             │                     │
│                                      │                     │
└──────────────────────────────────────┴─────────────────────┘

Collapses to single column below 1024px.
Marginalia moves below content on tablet/mobile.
No annotation logic in V2.0 — sidebar stub only.
```

---

## 9. Build Sequence for Gemini CLI

One step per session. Do not batch steps. Each verification gate must pass
before the next session opens.

| Step | Name | What to Build | Verification Gate |
|---|---|---|---|
| 1 | **Foundation** | Firebase Auth + Scholar document on sign-up | Firestore shows `level:1, scholarGrade:"Initiate", postCount:0, conductStats:{focusScore:null, experimentsRun:null}` after registration |
| 2 | **The Veil** | `TheVeil.tsx` component with hardcoded `userLevel` prop | Level 1 → black bar + CTA. Level 2 → `veilReveal` fade-in. No redacted text present in DOM for Level 1 — verify in DevTools. |
| 3 | **The Experiment Builder** | Post editor with type selector, Protocol template, `[redact]` parser, 150-word gate | Parser splits fields correctly. Protocol template pre-wraps Observation in `[redact]` tags. Submission blocked under 150 words with error. Post writes to Firestore as `status:"pending"`. |
| 4 | **Revise & Resubmit** | Rejected entry revision flow | Same document ID preserved. `revisionCount` increments. `rejectionReason` cleared on resubmit. `pendingPostId` re-set. Submit disabled while pending. |
| 5 | **The Review Laboratory** | Admin panel at `/admin/review` | Only owner UID can access. Queue shows entry type label. Approve/reject updates post status. Rejection requires ≥ 20 char reason before button enables. |
| 6 | **The Hive Mind** | `onPostStatusChange` + `onPostDeleted` Firebase Functions | Approval: `postCount++`, `level→2` on first approval, `pendingPostId→null`. Rejection: `pendingPostId→null`. Deletion of only approved entry: `level→1`, `scholarGrade→"Initiate"`. **Test in Firebase Emulator only.** |
| 7 | **Security Wire** | `getPostForUser` callable function + Zustand `conductorStore` wired to `TheVeil` | Call `getPostForUser` with Level 1 token in Emulator. Confirm `redactedContent` field is absent in response. Level 1 Scholar sees veil. Level 2 Scholar sees revealed content with animation. |
| 8 | **The Conductor Dashboard** | `/dashboard` route with Standing Panel, Entry History, Harmony stub | Rejected entries show reason + revise link. Harmony panel renders `—` placeholders. No interaction logic on Harmony panel. |
| 9 | **The Archive Layout** | 7:3 split layout, sidebar with compact cards + author strip stub | Sidebar renders correctly. No annotation logic. Collapses to 1 column below 1024px. |

---

## 10. Gemini CLI Session Prompt Template

Paste this at the start of every Gemini CLI session. Replace the final line.

```
System context: Building NorthStar V2.0 — The Conduct Laboratory & Archive.
Design spec: DESIGN.md (Cormorant Garamond display, EB Garamond headings, Inter body/UI).
Visual philosophy: High-signal low-noise. Monospace pipe notation for Scholar Grade metadata.
Accent light mode: #1E3A5F (Prussian Navy). Dark mode: #C4973A (Aged Gold).
Stack: React + TypeScript + Tailwind + Firebase (Auth, Firestore, Functions) + Zustand.
State: Zustand via conductorStore — NOT React Context.
Security: redactedContent must never appear in the DOM or any API response for Level 1 Initiates.
All archive entry fetches route through getPostForUser callable function only.
Level-up and level-down: server-side only via onPostStatusChange and onPostDeleted Firebase Functions.
Entry types: "research" (free-form) and "protocol" (Hypothesis → Protocol → Observation template).
Review hold: admin-only at /admin/review. Sole reviewer is the platform owner.
conductStats fields are null stubs — no write logic in V2.0.
Current build step: [INSERT STEP NUMBER AND NAME FROM SECTION 9]
```

---

*End of Document — NorthStar V2.0 PRD (Merged Final)*
*All decisions sourced from owner Q&A and prior analysis.*
*No open assumptions. No unresolved conflicts.*
