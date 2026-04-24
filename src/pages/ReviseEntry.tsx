import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import {
  doc,
  getDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { useConductorStore } from '../stores/conductorStore';
import { parsePostContent } from '../lib/parsePostContent';
import { validateEntry } from '../lib/validateEntry';
import Nav from '../components/Nav';
import Loading from '../components/Loading';

type EntryType = 'research' | 'protocol';

const ReviseEntry: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const uid = useConductorStore((s) => s.uid);
  const pendingPostId = useConductorStore((s) => s.pendingPostId);
  const setConductor = useConductorStore((s) => s.setConductor);

  const [type, setType] = useState<EntryType>('research');
  const [title, setTitle] = useState('');

  // Research fields
  const [content, setContent] = useState('');

  // Protocol fields
  const [hypothesis, setHypothesis] = useState('');
  const [protocol, setProtocol] = useState('');
  const [observation, setObservation] = useState('');

  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const researchRef = useRef<HTMLTextAreaElement>(null);
  const hypRef = useRef<HTMLTextAreaElement>(null);
  const protRef = useRef<HTMLTextAreaElement>(null);
  const obsRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId || !uid) return;

      try {
        const postDoc = await getDoc(doc(db, 'archive', postId));

        if (!postDoc.exists()) {
          navigate('/dashboard');
          return;
        }

        const data = postDoc.data();

        if (data.authorId !== uid || data.status !== 'rejected') {
          navigate('/dashboard');
          return;
        }

        const gatedDoc = await getDoc(doc(db, 'archive', postId, 'gated', 'content'));
        const redactedContent = gatedDoc.exists() ? gatedDoc.data().redactedContent : '';

        setTitle(data.title);
        setType(data.type);
        setRejectionReason(data.rejectionReason);

        const publicContent = data.publicContent || '';
        const segments = redactedContent.split('\n---\n');
        let segmentIndex = 0;

        const rawContent = publicContent.replace(/\[REDACTED\]/g, () => {
          const segment = segments[segmentIndex++] || '';
          return `[redact]${segment}[/redact]`;
        });

        if (data.type === 'research') {
          setContent(rawContent);
        } else {
          const hypothesisMatch = rawContent.match(/^HYPOTHESIS\n([\s\S]*?)\n\nPROTOCOL\n/);
          const protocolMatch = rawContent.match(/\n\nPROTOCOL\n([\s\S]*?)\n\nOBSERVATION\n/);
          const observationMatch = rawContent.match(/\n\nOBSERVATION\n([\s\S]*)$/);

          setHypothesis(hypothesisMatch ? hypothesisMatch[1] : '');
          setProtocol(protocolMatch ? protocolMatch[1] : '');
          setObservation(observationMatch ? observationMatch[1] : '');
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        navigate('/dashboard');
      }
    };

    fetchPost();
  }, [postId, uid, navigate]);

  useEffect(() => {
    if (isLoading) return;
    const handler = setTimeout(() => {
      const raw = getRawContent();
      const parsed = parsePostContent(raw);
      setWordCount(parsed.wordCount);
    }, 300);

    return () => clearTimeout(handler);
  }, [content, hypothesis, protocol, observation, type, isLoading]);

  const getRawContent = () => {
    if (type === 'research') return content;
    return `HYPOTHESIS\n${hypothesis}\n\nPROTOCOL\n${protocol}\n\nOBSERVATION\n${observation}`;
  };

  const handleRedact = (
    ref: React.RefObject<HTMLTextAreaElement | null>,
    setter: (val: string) => void
  ) => {
    if (!ref.current) return;
    const start = ref.current.selectionStart;
    const end = ref.current.selectionEnd;
    const text = ref.current.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    setter(`${before}[redact]${selection}[/redact]${after}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !postId || isSubmitting) return;

    if (pendingPostId && pendingPostId !== postId) {
      setError('You have another entry awaiting review. Wait for it to be reviewed first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const rawContent = getRawContent();
      const parsed = parsePostContent(rawContent);

      const validationError = validateEntry(parsed);
      if (validationError) {
        setError(validationError);
        setIsSubmitting(false);
        return;
      }

      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);

      const postRef = doc(db, 'archive', postId);
      const gatedRef = doc(db, 'archive', postId, 'gated', 'content');
      const scholarRef = doc(db, 'scholars', uid);

      batch.update(postRef, {
        title,
        publicContent: parsed.publicContent,
        wordCount: parsed.wordCount,
        status: 'pending',
        rejectionReason: null,
        revisionCount: increment(1),
        submittedAt: serverTimestamp(),
      });

      batch.set(gatedRef, { redactedContent: parsed.redactedContent });
      batch.update(scholarRef, { pendingPostId: postId });

      await batch.commit();

      setConductor({ pendingPostId: postId });
      navigate('/dashboard', {
        state: { message: 'Entry resubmitted. Awaiting review.' },
      });
    } catch (err: any) {
      console.error('Update failed:', err);
      setError('Update failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;

  const isAnotherPending = !!pendingPostId && pendingPostId !== postId;
  const canSubmit = wordCount >= 150 && !isAnotherPending && title.trim() !== '' && !isSubmitting;

  return (
    <div className="min-h-screen bg-void text-slate-200 selection:bg-accent/30">
      <Nav />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-mint/10 blur-[120px]" />
      </div>

      <div className="max-w-[720px] mx-auto py-24 px-6 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold tracking-tight text-white mb-2 uppercase">
            Revise Entry
          </h1>
          <p className="text-slate-400 font-medium">Reconstructing unauthorized data points.</p>
        </div>

        {/* RETURNED FOR REVISION NOTICE */}
        <div className="glass-card p-8 mb-12 border border-red-500/20 bg-red-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 opacity-30" />
          <div className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-[0.3em] mb-4 text-center">
            | PROTOCOL REVISION REQUIRED |
          </div>
          <p className="text-center italic text-slate-300 mb-6 bg-void/40 p-4 rounded-xl border border-white/5">
            "{rejectionReason}"
          </p>
          <div className="text-center text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Modify coordinates below and authorize resubmission.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass-card p-6 border border-white/5 focus-within:border-accent/40 transition-colors">
            <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
              Entry Designation
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent p-0 text-xl font-heading font-bold text-white focus:outline-none"
              placeholder="Designate this finding..."
              required
            />
          </div>

          {type === 'research' ? (
            <div className="glass-card p-6 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
                  Corpus Content
                </label>
                <button
                  type="button"
                  onClick={() => handleRedact(researchRef, setContent)}
                  className="px-3 py-1 rounded bg-accent/10 border border-accent/20 text-[9px] font-bold tracking-widest text-accent-light hover:bg-accent/20 transition-all uppercase"
                >
                  [ Apply Redaction ]
                </button>
              </div>
              <textarea
                ref={researchRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 bg-transparent p-0 text-slate-300 font-body leading-relaxed focus:outline-none resize-none"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="glass-card p-6 border border-white/5">
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
                  Hypothesis
                </label>
                <textarea
                  ref={hypRef}
                  value={hypothesis}
                  onChange={(e) => setHypothesis(e.target.value)}
                  className="w-full h-24 bg-transparent p-0 text-slate-300 focus:outline-none resize-none"
                />
              </div>

              <div className="glass-card p-6 border border-white/5">
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
                  Protocol
                </label>
                <textarea
                  ref={protRef}
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full h-32 bg-transparent p-0 text-slate-300 focus:outline-none resize-none"
                />
              </div>

              <div className="glass-card p-6 border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">
                    Observations (Gated)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRedact(obsRef, setObservation)}
                    className="px-3 py-1 rounded bg-accent/10 border border-accent/20 text-[9px] font-bold tracking-widest text-accent-light hover:bg-accent/20 transition-all uppercase"
                  >
                    [ Apply Redaction ]
                  </button>
                </div>
                <textarea
                  ref={obsRef}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full h-48 bg-transparent p-0 text-slate-300 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col items-center pt-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex flex-col items-center">
                <span className={`text-xl font-mono font-bold ${wordCount < 150 ? 'text-red-500' : 'text-mint'}`}>
                  {wordCount}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Word Count</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-xl font-mono font-bold text-white">150</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Minimum</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-4 rounded-2xl text-sm font-bold tracking-[0.2em] uppercase transition-all ${
                canSubmit 
                  ? 'bg-violet-green text-white shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
              }`}
            >
              {isAnotherPending
                ? 'Queue Overload'
                : wordCount < 150
                ? 'Insufficient Data'
                : isSubmitting
                ? 'Updating...'
                : 'Authorize Resubmission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviseEntry;
