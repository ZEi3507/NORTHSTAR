# Sacred Insights Upload Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder in `src/pages/SacredInsights.tsx` with a functional, secure, liquid-glass styled upload interface for PDFs, docs, and images.

**Architecture:**
1. Use `useState` to manage file, category, and upload status.
2. Interface: A drop zone or file input styled with `liquid-glass`.
3. Firebase Storage: Upload file, get download URL, store metadata in `sacred-insights` collection.
4. Feedback: Show progress indicator and error/success messages.

**Tech Stack:** Firebase Storage, Firestore, React, Lucide-React.

---

### Task 1: Initialize Firestore Collection Reference & Interface

**Files:**
- Modify: `src/pages/SacredInsights.tsx`

- [ ] **Step 1: Import required Firebase and Lucide icons**

```typescript
import { useState } from 'react';
import { Upload, File, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth } from '../lib/firebase';
```

- [ ] **Step 2: Add state management for upload**

```typescript
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState(CATEGORIES[1]); // Default to first meaningful category
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
```

### Task 2: Implement File Upload Logic

**Files:**
- Modify: `src/pages/SacredInsights.tsx`

- [ ] **Step 1: Implement `handleUpload` function**

```typescript
  const handleUpload = async () => {
    if (!file || !auth.currentUser) return;
    setUploading(true);
    setStatus('idle');
    
    const storageRef = ref(storage, `sacred-insights/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      (error) => {
        setStatus('error');
        setMessage(error.message);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'sacred-insights'), {
          fileName: file.name,
          category,
          url,
          authorId: auth.currentUser!.uid,
          createdAt: serverTimestamp()
        });
        setStatus('success');
        setMessage('Upload successful');
        setUploading(false);
        setFile(null);
      }
    );
  };
```

### Task 3: Build UI Component

**Files:**
- Modify: `src/pages/SacredInsights.tsx`

- [ ] **Step 1: Replace placeholder with upload UI**

```tsx
        {/* Upload Interface */}
        <div className="liquid-glass p-8 rounded-3xl border border-white/10 mb-16">
          <h2 className="text-2xl font-heading mb-6">Archive New Insight</h2>
          <div className="flex flex-col gap-4">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
            >
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
            />
            
            <button 
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-3 rounded-full bg-accent text-void font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload size={18} /> {uploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Archive File'}
            </button>
          </div>

          {status === 'success' && <p className="text-mint mt-4 flex items-center gap-2"><CheckCircle2 size={16}/> {message}</p>}
          {status === 'error' && <p className="text-red-400 mt-4 flex items-center gap-2"><AlertCircle size={16}/> {message}</p>}
        </div>
```

- [ ] **Step 2: Cleanup and Final Verification**

Run `npm run build` and ensure no type errors.
