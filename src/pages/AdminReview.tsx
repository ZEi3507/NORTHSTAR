import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ArchiveEntry {
  id: string;
  authorId: string;
  title: string;
  type: 'research' | 'protocol';
  publicContent: string;
  redactedContent: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  revisionCount: number;
  wordCount: number;
  submittedAt: any;
}

const AdminReview: React.FC = () => {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ArchiveEntry | null>(null);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // 1. Fetch real-time queue
  useEffect(() => {
    console.log("AdminReview: Initializing queue listener...");
    
    // Simplified query to avoid index requirement during initial test
    const q = query(
      collection(db, 'archive'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log(`AdminReview: Received snapshot with ${snapshot.size} entries.`);
        const pendingEntries = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ArchiveEntry[];
        
        // Manual sort by date since we removed it from the query
        pendingEntries.sort((a, b) => {
          const timeA = a.submittedAt?.toMillis?.() || 0;
          const timeB = b.submittedAt?.toMillis?.() || 0;
          return timeA - timeB;
        });

        setEntries(pendingEntries);
      },
      (error) => {
        console.error("AdminReview: Firestore listener failed:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Fetch author names as needed
  useEffect(() => {
    const fetchNames = async () => {
      const newNames = { ...authorNames };
      let changed = false;

      for (const entry of entries) {
        if (!newNames[entry.authorId]) {
          try {
            const scholarDoc = await getDoc(doc(db, 'scholars', entry.authorId));
            if (scholarDoc.exists()) {
              newNames[entry.authorId] = scholarDoc.data().displayName;
              changed = true;
            }
          } catch {
            // skip
          }
        }
      }

      if (changed) {
        setAuthorNames(newNames);
      }
    };

    if (entries.length > 0) {
      fetchNames();
    }
  }, [entries]);

  const handleApprove = async () => {
    if (!selectedEntry || isProcessing) return;
    setIsProcessing(true);
    setConfirmation(null);

    try {
      const { writeBatch, arrayUnion, increment } = await import('firebase/firestore');
      const batch = writeBatch(db);

      const postRef = doc(db, 'archive', selectedEntry.id);
      const scholarRef = doc(db, 'scholars', selectedEntry.authorId);

      // 1. Update Post Status
      batch.update(postRef, {
        status: 'approved',
        publishedAt: serverTimestamp(),
      });

      // 2. Update Scholar (Hive Mind logic)
      const scholarSnap = await getDoc(scholarRef);
      const scholarData = scholarSnap.data() || {};
      
      const updates: any = {
        postCount: increment(1),
        pendingPostId: null,
        approvedPostIds: arrayUnion(selectedEntry.id),
      };

      // Check for first approved post level-up
      // Note: we check selectedEntry.isFirstApprovedPost which was set at submission
      const isFirst = (selectedEntry as any).isFirstApprovedPost;
      if (isFirst === true && (scholarData.level || 1) < 2) {
        updates.level = 2;
        updates.scholarGrade = 'Archivist';
      }

      batch.update(scholarRef, updates);

      await batch.commit();
      
      setConfirmation('Entry approved.');
      setSelectedEntry(null);
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEntry || isProcessing || rejectionReason.length < 20) return;
    setIsProcessing(true);
    setConfirmation(null);

    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);

      const postRef = doc(db, 'archive', selectedEntry.id);
      const scholarRef = doc(db, 'scholars', selectedEntry.authorId);

      batch.update(postRef, {
        status: 'rejected',
        rejectionReason: rejectionReason,
      });

      batch.update(scholarRef, { pendingPostId: null });

      await batch.commit();

      setConfirmation('Entry returned for revision.');
      setSelectedEntry(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '...';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const renderContent = (content: string, isProtocol: boolean) => {
    if (!content) return <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No content.</p>;

    if (!isProtocol) {
      return content.split('\n').map((line, i) => (
        <p key={i} className="mb-4">
          {line}
        </p>
      ));
    }

    // Protocol highlighting
    const sections = ['HYPOTHESIS', 'PROTOCOL', 'OBSERVATION'];
    const parts = content.split(new RegExp(`(${sections.join('|')})`, 'g'));

    return parts.map((part, i) => {
      if (sections.includes(part)) {
        return (
          <h4
            key={i}
            className="font-bold uppercase text-xs tracking-widest mt-6 mb-2"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-accent)',
            }}
          >
            {part}
          </h4>
        );
      }
      return part.split('\n').map((line, j) =>
        line.trim() ? (
          <p key={`${i}-${j}`} className="mb-2">
            {line}
          </p>
        ) : null
      );
    });
  };

  return (
    <div
      className="flex flex-col md:flex-row h-screen overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* LEFT PANEL - THE QUEUE */}
      <div
        className="w-full md:w-[40%] flex flex-col h-full overflow-hidden"
        style={{ borderRight: '1px solid var(--color-border-subtle)' }}
      >
        <div
          className="p-6"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <h2
            className="text-xl uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Pending Queue
          </h2>
          {confirmation && (
            <div
              className="mt-4 p-2 text-xs uppercase tracking-widest text-center animate-fade-in rounded-[2px]"
              style={{
                backgroundColor: 'rgba(30, 58, 95, 0.05)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              {confirmation}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div
              className="h-full flex items-center justify-center text-xs uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              No entries awaiting review.
            </div>
          ) : (
            <div>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={async () => {
                    setConfirmation(null);
                    // Fetch gated content before selecting
                    try {
                      const gatedSnap = await getDoc(doc(db, 'archive', entry.id, 'gated', 'content'));
                      const redacted = gatedSnap.exists() ? gatedSnap.data().redactedContent : '';
                      setSelectedEntry({ ...entry, redactedContent: redacted });
                    } catch (err) {
                      console.error("Failed to fetch gated content:", err);
                      setSelectedEntry(entry);
                    }
                  }}
                  className="p-4 cursor-pointer transition-colors"
                  style={{
                    borderBottom: '1px solid var(--color-border-ghost)',
                    backgroundColor:
                      selectedEntry?.id === entry.id
                        ? 'rgba(30, 58, 95, 0.08)'
                        : 'transparent',
                  }}
                >
                  <div className="text-[10px] uppercase tracking-wider leading-relaxed">
                    <span
                      className="font-mono tracking-tighter mr-2"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      | {entry.type.toUpperCase()} |
                    </span>
                    <span
                      className="font-medium text-sm normal-case mr-1"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {entry.title}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      — {authorNames[entry.authorId] || '...'} ·{' '}
                      {entry.wordCount} words · Rev. {entry.revisionCount} ·{' '}
                      {formatDate(entry.submittedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - THE REVIEW VIEW */}
      <div
        className="w-full md:w-[60%] flex flex-col h-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        {!selectedEntry ? (
          <div
            className="h-full flex items-center justify-center text-xs uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Select an entry from the queue.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col p-8 lg:p-12">
            <header className="mb-12">
              <h1
                className="text-4xl mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {selectedEntry.title}
              </h1>
              <div
                className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-widest"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span>{authorNames[selectedEntry.authorId] || '...'}</span>
                <span
                  className="font-mono"
                  style={{ color: 'var(--color-accent)' }}
                >
                  | {selectedEntry.type.toUpperCase()} |
                </span>
                <span>{selectedEntry.wordCount} words</span>
                <span>Revision {selectedEntry.revisionCount}</span>
                <span>Submitted {formatDate(selectedEntry.submittedAt)}</span>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <section>
                <h3
                  className="text-[12px] font-semibold tracking-[0.08em] uppercase mb-6 pb-2"
                  style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                >
                  Public Content
                </h3>
                <div className="text-sm leading-relaxed">
                  {renderContent(
                    selectedEntry.publicContent,
                    selectedEntry.type === 'protocol'
                  )}
                </div>
              </section>

              <section>
                <h3
                  className="text-[12px] font-semibold tracking-[0.08em] uppercase mb-6 pb-2"
                  style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                >
                  Redacted Content
                </h3>
                <div className="text-sm leading-relaxed">
                  {!selectedEntry.redactedContent ? (
                    <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      No redacted content in this entry.
                    </p>
                  ) : (
                    renderContent(selectedEntry.redactedContent, false)
                  )}
                </div>
              </section>
            </div>

            <footer
              className="mt-16 pt-12 space-y-8"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              <div className="flex flex-col space-y-4">
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="w-full py-4 uppercase tracking-[0.2em] text-sm font-semibold transition-opacity disabled:opacity-50 rounded-[2px]"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-surface)',
                  }}
                >
                  {isProcessing ? 'Processing...' : 'APPROVE'}
                </button>

                <div className="pt-4">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[12px] font-semibold tracking-[0.08em] uppercase">
                      Return for Revision
                    </label>
                    <span
                      className="text-[10px]"
                      style={{
                        color:
                          rejectionReason.length < 20
                            ? 'var(--color-error)'
                            : 'var(--color-success)',
                      }}
                    >
                      {rejectionReason.length} / 20 minimum
                    </span>
                  </div>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain what needs to change. Be specific."
                    className="w-full h-32 bg-transparent p-4 text-sm focus:outline-none rounded-[2px] resize-none"
                    style={{
                      border: '1px solid var(--color-border-subtle)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <button
                    onClick={handleReject}
                    disabled={isProcessing || rejectionReason.length < 20}
                    className="w-full mt-4 py-4 uppercase tracking-[0.2em] text-sm font-semibold transition-opacity disabled:opacity-30 disabled:cursor-not-allowed rounded-[2px]"
                    style={{
                      border: '1px solid var(--color-accent)',
                      color: 'var(--color-accent)',
                      backgroundColor: 'transparent',
                    }}
                  >
                    RETURN FOR REVISION
                  </button>
                </div>
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReview;
