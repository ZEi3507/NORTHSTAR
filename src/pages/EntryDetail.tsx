import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, increment, onSnapshot, writeBatch } from 'firebase/firestore';
import { Star, ThumbsDown } from 'lucide-react';
import { db, app } from '../lib/firebase';
import { useConductorStore } from '../stores/conductorStore';
import { TheVeil } from '../components/TheVeil';
import Nav from '../components/Nav';
import Loading from '../components/Loading';
import { EchoButton } from '../components/ui/EchoButton';

const functions = getFunctions(app);
const getPostForUser = httpsCallable(functions, 'getPostForUser');

interface PostResponse {
  id: string;
  title: string;
  type: 'research' | 'protocol';
  publicContent: string;
  redactedContent?: string;
  authorId: string;
  publishedAt: any;
  wordCount: number;
}

interface AuthorInfo {
  displayName: string;
  scholarGrade: string;
}

interface RelatedEntry {
  id: string;
  title: string;
  type: string;
  authorName: string;
  publishedAt: any;
}

const EntryDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { uid, level } = useConductorStore();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [author, setAuthor] = useState<AuthorInfo | null>(null);
  const [relatedEntries, setRelatedEntries] = useState<RelatedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [stars, setStars] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userInteraction, setUserInteraction] = useState<'star' | 'dislike' | null>(null);

  useEffect(() => {
    if (!postId) return;
    const postRef = doc(db, 'archive', postId);
    
    const unsubPost = onSnapshot(postRef, (snap) => {
      const data = snap.data();
      setStars(data?.starCount || 0);
      setDislikes(data?.dislikeCount || 0);
    });

    let unsubUser = () => {};
    if (uid) {
      unsubUser = onSnapshot(doc(db, 'archive', postId, 'interactions', uid), (snap) => {
        if (snap.exists()) setUserInteraction(snap.data().type);
        else setUserInteraction(null);
      });
    }

    return () => { unsubPost(); unsubUser(); };
  }, [postId, uid]);

  const handleInteraction = async (type: 'star' | 'dislike') => {
    if (!postId || !uid) return;
    const batch = writeBatch(db);
    const postRef = doc(db, 'archive', postId);
    const interactionRef = doc(db, 'archive', postId, 'interactions', uid);

    if (userInteraction === type) {
      batch.delete(interactionRef);
      batch.update(postRef, { [type === 'star' ? 'starCount' : 'dislikeCount']: increment(-1) });
    } else {
      if (userInteraction) {
        batch.update(postRef, { [userInteraction === 'star' ? 'starCount' : 'dislikeCount']: increment(-1) });
      }
      batch.set(interactionRef, { type });
      batch.update(postRef, { [type === 'star' ? 'starCount' : 'dislikeCount']: increment(1) });
    }
    await batch.commit();
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      setLoading(true);
      setError(null);

      try {
        const result = await getPostForUser({ postId });
        const postData = result.data as PostResponse;

        setPost(postData);

        try {
          const authorSnap = await getDoc(doc(db, 'scholars', postData.authorId));
          if (authorSnap.exists()) {
            const authorData = authorSnap.data();
            setAuthor({
              displayName: authorData.displayName || 'Unknown Scholar',
              scholarGrade: authorData.scholarGrade || 'Initiate',
            });
          }
        } catch {
          setAuthor({ displayName: 'Unknown Scholar', scholarGrade: 'Initiate' });
        }

        try {
          const q = query(
            collection(db, 'archive'),
            where('status', '==', 'approved'),
            orderBy('publishedAt', 'desc'),
            limit(4)
          );
          const snapshot = await getDocs(q);
          const related: RelatedEntry[] = [];
          const authorNameCache: Record<string, string> = {};

          for (const d of snapshot.docs) {
            if (d.id === postId) continue;
            if (related.length >= 3) break;

            const data = d.data();
            let authorName = authorNameCache[data.authorId];

            if (!authorName) {
              try {
                const aSnap = await getDoc(doc(db, 'scholars', data.authorId));
                authorName = aSnap.exists()
                  ? aSnap.data().displayName || 'Unknown'
                  : 'Unknown';
              } catch {
                authorName = 'Unknown';
              }
              authorNameCache[data.authorId] = authorName;
            }

            related.push({
              id: d.id,
              title: data.title,
              type: data.type,
              authorName,
              publishedAt: data.publishedAt,
            });
          }
          setRelatedEntries(related);
        } catch (err) {
          console.error('Related sync error:', err);
        }
      } catch (err: any) {
        console.error('EntryDetail: fetchPost failed');
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          details: err.details,
          stack: err.stack
        });
        setError('Data corruption or unauthorized access attempt.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, level]);

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  if (loading) return <Loading />;

  if (error || !post) {
    return (
      <div className="min-h-screen bg-void text-slate-200">
        <Nav />
        <div className="pt-48 text-center px-6">
          <div className="glass-card max-w-md mx-auto p-8 border-red-500/20">
            <p className="text-red-400 font-medium mb-6">{error}</p>
            <Link to="/archive" className="text-accent-light hover:text-white transition-colors font-bold">
              ← Return to Archive
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const redactedSegments = post.redactedContent ? post.redactedContent.split('\n---\n') : [];
  const contentParts = post.publicContent.split('[REDACTED]');
  const authorName = author?.displayName || 'Unknown Scholar';
  const authorGrade = author?.scholarGrade || 'Initiate';

  return (
    <div className="min-h-screen bg-void text-slate-200 selection:bg-accent/30">
      <div className="fixed top-0 left-0 w-full h-[2px] bg-white/5 z-[60]">
        <div className="h-full bg-violet-green shadow-[0_0_10px_rgba(43,222,172,0.8)] transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      <Nav />

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-mint/10 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16">
          
          <article className="min-w-0">
            <header className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-mint bg-mint/10 px-3 py-1 rounded-full border border-mint/20">
                  {post.type}
                </span>
                <span className="text-xs text-slate-500 font-mono">ID: {post.id.substring(0,8).toUpperCase()}</span>
              </div>
              
              <div className="flex items-center justify-between gap-4 mb-8">
                <h1 className="text-5xl sm:text-6xl font-heading font-bold text-white leading-[1.1] tracking-tight">
                  {post.title}
                </h1>
                <EchoButton text={`${post.title}. ${post.publicContent}`} />
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-400 font-medium pb-8 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-[10px] text-accent-light font-bold">
                    {authorName[0]}
                  </div>
                  <span>{authorName}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span>{formatDate(post.publishedAt)}</span>
                <span className="w-1 h-1 rounded-full bg-slate-800" />
                <span>{post.wordCount} words</span>
              </div>
            </header>

            <section className="text-lg leading-[1.8] text-slate-300 font-body max-w-[65ch]">
              {contentParts.map((part, index) => (
                <React.Fragment key={index}>
                  <p className="mb-8 whitespace-pre-wrap">{part}</p>
                  {index < contentParts.length - 1 && (
                    <div className="my-10">
                      <TheVeil userLevel={level}>
                        {level >= 2 ? redactedSegments[index] : undefined}
                      </TheVeil>
                    </div>
                  )}
                </React.Fragment>
              ))}

              <div className="flex gap-6 mt-12 py-8 border-t border-white/10">
                <button 
                  onClick={() => handleInteraction('star')}
                  className={`liquid-glass flex items-center gap-2 px-6 py-2 rounded-[2px] transition-all ${userInteraction === 'star' ? 'text-mint border-mint' : 'text-slate-400'}`}
                >
                  <Star size={18} fill={userInteraction === 'star' ? 'currentColor' : 'none'} />
                  <span>{stars} Stars</span>
                </button>
                <button 
                  onClick={() => handleInteraction('dislike')}
                  className={`liquid-glass flex items-center gap-2 px-6 py-2 rounded-[2px] transition-all ${userInteraction === 'dislike' ? 'text-red-400 border-red-400' : 'text-slate-400'}`}
                >
                  <ThumbsDown size={18} fill={userInteraction === 'dislike' ? 'currentColor' : 'none'} />
                  <span>{dislikes} Dislikes</span>
                </button>
              </div>
            </section>
          </article>

          <aside className="space-y-12">
            <div className="glass-card p-8 border border-white/5 sticky top-32">
              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">The Archivist</h3>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-lg font-heading font-bold text-white mb-1">{authorName}</div>
                  <div className="text-[10px] font-mono font-bold text-accent-light uppercase tracking-widest">
                    {authorGrade}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Cross-References</h3>
                <div className="space-y-6">
                  {relatedEntries.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">No related sectors mapped.</p>
                  ) : (
                    relatedEntries.map((entry) => (
                      <Link key={entry.id} to={`/archive/${entry.id}`} className="block group">
                        <div className="text-[9px] font-mono font-bold text-mint uppercase tracking-widest mb-1">
                          {entry.type}
                        </div>
                        <div className="text-sm font-heading font-bold text-slate-300 group-hover:text-white transition-colors line-clamp-2">
                          {entry.title}
                        </div>
                        <div className="text-[10px] text-slate-600 mt-1">
                          {formatDate(entry.publishedAt)}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-12 p-4 rounded-xl bg-accent/5 border border-accent/10 border-dashed">
                <h4 className="text-[9px] font-bold text-accent-light uppercase tracking-[0.2em] mb-2">Marginalia Beta</h4>
                <p className="text-[11px] text-slate-500 italic">
                  Neural annotations are currently locked for this sector.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EntryDetail;
