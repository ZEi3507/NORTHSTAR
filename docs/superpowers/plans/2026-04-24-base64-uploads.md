# SacredInsights Multimedia Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend SacredInsights to support hyperlink uploads in addition to file uploads, using base64 conversion for files.

**Architecture:** Add a new state for input type (file vs hyperlink). Use a `fileToBase64` helper. Modify `handleUpload` to route to either Firebase Storage (for files) or Firestore (for links).

**Tech Stack:** React, TypeScript, Firebase (Firestore, Storage).

---

### Task 1: Add File Base64 helper

**Files:**
- Create: `C:\Users\user\projects\northstar\src\lib\fileHelpers.ts`

- [ ] **Step 1: Write helper**
```typescript
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
```

- [ ] **Step 2: Commit**

### Task 2: Update SacredInsights UI & Logic

**Files:**
- Modify: `C:\Users\user\projects\northstar\src\pages\SacredInsights.tsx`

- [ ] **Step 1: Update state and add inputs**
Add `inputType`, `hyperlink`, `base64Data` state.
Add input toggle (Radio/Select for "File" or "Hyperlink").
Add input field for Hyperlink.

- [ ] **Step 2: Update handleUpload logic**
If `inputType === 'hyperlink'`, save `hyperlink` to Firestore.
If `inputType === 'file'`, convert to base64, save to Firestore (or Storage if size > threshold, but we follow requirement: "file (Base64)").

- [ ] **Step 3: Commit**
