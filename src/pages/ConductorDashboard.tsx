import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { useConductorStore } from '../stores/conductorStore';
import Nav from '../components/Nav';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  runTransaction,
} from 'firebase/firestore';
import { Trash2 } from 'lucide-react';

interface Entry {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  type: 'research' | 'protocol';
  rejectionReason?: string | null;
  submittedAt?: any;
  revisionCount: number;
}

const ConductorDashboard: React.FC = () => {
  const uid = useConductorStore((s) => s.uid);
  const level = useConductorStore((s) => s.level);
  const scholarGrade = useConductorStore((s) => s.scholarGrade);
  const postCount = useConductorStore((s) => s.postCount);
  const pendingPostId = useConductorStore((s) => s.pendingPostId);
  const isLoading = useConductorStore((s) => s.isLoading);

  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!uid) {
      navigate('/signin');
      return;
    }

    const q = query(
      collection(db, 'archive'),
      where('authorId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Entry[];
      setEntries(data);
      setEntriesLoading(false);
    });

    return () => unsubscribe();
  }, [uid, isLoading, navigate]);

  const handleDelete = async (postId: string) => {
    if (!window.confirm("Are you sure you want to permanently erase this entry? This action cannot be undone.")) return;
    
    setIsDeleting(postId);
    try {
      await runTransaction(db, async (transaction) => {
        const postRef = doc(db, 'archive', postId);
        const postSnap = await transaction.get(postRef);
        
        if (!postSnap.exists()) return;
        const postData = postSnap.data();

        // 1. Delete the post
        transaction.delete(postRef);

        // 2. If it was pending, clear the scholar's pending pointer
        if (postData.status === 'pending' && uid) {
          const scholarRef = doc(db, 'scholars', uid);
          transaction.update(scholarRef, { pendingPostId: null });
        }
      });
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete entry. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-void text-slate-200 selection:bg-accent/30">
      <Nav />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-mint/20 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto py-24 px-6 relative z-10">
        <header className="mb-12">
          <h1 className="text-4xl font-heading font-bold tracking-tight text-white mb-2">
            CONDUCTOR DASHBOARD
          </h1>
          <p className="text-slate-400 font-medium">Monitoring the Archive's development.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* STATS PANEL */}
            <div className="glass-card relative group p-8 border border-white/5 hover:border-accent/30 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-all" />
              
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-light font-bold">
                    Authenticated Scholar
                  </div>
                  <div className="text-3xl font-heading text-white">{scholarGrade}</div>
                </div>

                <div className="flex gap-8">
                  <div className="space-y-1 text-center">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Level</div>
                    <div className="text-2xl font-mono text-mint">{level}</div>
                  </div>
                  <div className="space-y-1 text-center">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Approved</div>
                    <div className="text-2xl font-mono text-white">{postCount}</div>
                  </div>
                </div>
              </div>

              {pendingPostId && (
                <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  <span className="text-xs font-mono uppercase tracking-widest text-accent-light">
                    1 Entry Awaiting Validation
                  </span>
                </div>
              )}
            </div>

            {/* ENTRY HISTORY */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-slate-800" />
                  ENTRY HISTORY
                </h2>

                <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5 w-fit">
                  {(['all', 'approved', 'pending', 'rejected'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest transition-all ${
                        filter === f 
                        ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                        : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              
              {entriesLoading ? (
                <div className="p-12 glass rounded-xl flex items-center justify-center">
                  <div className="text-slate-500 font-mono animate-pulse">Synchronizing...</div>
                </div>
              ) : entries.length === 0 ? (
                <div className="p-12 glass rounded-xl border border-white/5 text-center">
                  <p className="text-slate-400 mb-4">No data points recovered yet.</p>
                  <Link
                    to="/submit"
                    className="inline-flex px-6 py-2 rounded-full bg-violet-green text-white text-sm font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all"
                  >
                    Initiate First Experiment
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries
                    .filter((e) => filter === 'all' || e.status === filter)
                    .map((entry) => (
                    <div 
                      key={entry.id}
                      className="glass-card group p-5 border border-white/5 hover:bg-white/[0.04] transition-all flex items-center gap-6"
                    >
                      <div
                        className={`w-3 h-3 rounded-full shadow-lg ${
                          entry.status === 'approved'
                            ? 'bg-mint shadow-mint/20'
                            : entry.status === 'pending'
                            ? 'bg-accent shadow-accent/20'
                            : entry.status === 'rejected'
                            ? 'bg-red-500 shadow-red-500/20'
                            : 'bg-slate-700 shadow-none'
                        }`}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          {entry.status === 'approved' ? (
                            <Link
                              to={`/archive/${entry.id}`}
                              className="text-lg font-heading text-white hover:text-mint transition-colors truncate block"
                            >
                              {entry.title}
                            </Link>
                          ) : (
                            <span className="text-lg font-heading text-slate-300 truncate block">
                              {entry.title}
                            </span>
                          )}
                          <span className="text-xs font-mono text-slate-500 whitespace-nowrap ml-4">
                            {formatDate(entry.submittedAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                            [{entry.type}]
                          </span>
                          {entry.revisionCount > 0 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                              v{entry.revisionCount + 1}
                            </span>
                          )}
                        </div>

                        {entry.status === 'rejected' && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                            <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                              Protocol Refused by Conductor
                            </div>
                            <p className="text-sm text-slate-400 italic bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                              "{entry.rejectionReason}"
                            </p>
                            <Link
                              to={`/revise/${entry.id}`}
                              className="inline-block text-xs font-bold text-accent-light hover:text-white transition-colors"
                            >
                              Revise & Resubmit →
                            </Link>
                          </div>
                        )}
                      </div>

                      {entry.status !== 'approved' && (
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={isDeleting === entry.id}
                          className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Permanently Erase"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-8">
            <div className="glass-card p-6 border border-white/5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                HARMONY TRACKER
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Focus Level</div>
                    <div className="text-xl font-mono text-white">N/A</div>
                  </div>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[10%] h-full bg-slate-700" />
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Archive Sync</div>
                    <div className="text-xl font-mono text-white">12%</div>
                  </div>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[12%] h-full bg-mint shadow-[0_0_8px_rgba(43,222,172,0.5)]" />
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-3 rounded-lg bg-accent/5 border border-accent/10 text-center">
                <p className="text-[11px] text-accent-light font-medium italic">
                  Complete 5 approved entries to unlock advanced sync metrics.
                </p>
              </div>
            </div>

            <div className="glass-card p-6 border border-white/5 bg-violet-green/5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">
                QUICK ACCESS
              </h3>
              <div className="flex flex-col gap-2">
                <Link 
                  to="/submit" 
                  className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-accent/20 hover:border-accent/30 transition-all text-center"
                >
                  New Experiment
                </Link>
                <Link 
                  to="/archive" 
                  className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-slate-300 hover:text-white transition-all text-center"
                >
                  Public Archive
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConductorDashboard;
