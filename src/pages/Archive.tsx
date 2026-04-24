import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';

interface ArchiveEntry {
  id: string;
  title: string;
  type: 'research' | 'protocol';
  publicContent: string;
  authorId: string;
  publishedAt: any;
  wordCount: number;
}

const Archive: React.FC = () => {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const q = query(
          collection(db, 'archive'),
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ArchiveEntry[];
        
        data.sort((a, b) => {
          const timeA = a.publishedAt?.toMillis?.() || 0;
          const timeB = b.publishedAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setEntries(data);

        const uniqueAuthorIds = [...new Set(data.map((e) => e.authorId))];
        const names: Record<string, string> = {};
        await Promise.all(
          uniqueAuthorIds.map(async (authorId) => {
            try {
              const scholarSnap = await getDoc(doc(db, 'scholars', authorId));
              if (scholarSnap.exists()) {
                names[authorId] = scholarSnap.data().displayName || 'Unknown';
              } else {
                names[authorId] = 'Unknown';
              }
            } catch {
              names[authorId] = 'Unknown';
            }
          })
        );
        setAuthorNames(names);
      } catch (err) {
        console.error('Error fetching archive:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getExcerpt = (publicContent: string): string => {
    const clean = publicContent.replace(/\[REDACTED\]/g, '').trim();
    return clean.length > 200 ? clean.substring(0, 200) + '…' : clean;
  };

  return (
    <div className="min-h-screen bg-void text-slate-200">
      <Nav />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-accent/40 blur-[150px]" />
        <div className="absolute top-[60%] left-[-5%] w-[40%] h-[40%] rounded-full bg-mint/20 blur-[150px]" />
      </div>

      <main className="pt-32 max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <header className="mb-16">
          <h1 className="text-5xl font-heading font-bold tracking-tight text-white mb-4">
            THE ARCHIVE
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl">
            A repository of approved research and protocols for the NorthStar initiative.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-mint font-mono tracking-[0.3em] animate-pulse">SYNCHRONIZING REPOSITORY...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-24 glass rounded-3xl border border-white/5 text-center">
            <p className="text-slate-400 font-medium">The Archive awaits its first authorized entry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {entries.map((entry) => (
              <Link
                to={`/archive/${entry.id}`}
                key={entry.id}
                className="skew-glass-card group h-[320px] w-full"
              >
                <div className="glass-content flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-mint">
                      [{entry.type.toUpperCase()}]
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                      {entry.title}
                    </h2>
                    <p className="text-slate-300 text-sm line-clamp-3 leading-relaxed opacity-80">
                      {getExcerpt(entry.publicContent)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                      <span>{authorNames[entry.authorId] || '...'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-500" />
                      <span>{formatDate(entry.publishedAt)}</span>
                    </div>
                    <div className="text-[10px] font-mono font-bold tracking-widest text-mint uppercase">
                      {entry.wordCount} WDS
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Archive;
