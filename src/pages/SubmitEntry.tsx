import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { useConductorStore } from '../stores/conductorStore';
import { parsePostContent } from '../lib/parsePostContent';
import { validateEntry } from '../lib/validateEntry';
import Nav from '../components/Nav';

type EntryType = 'research' | 'protocol';

const SubmitEntry: React.FC = () => {
  const navigate = useNavigate();
  const uid = useConductorStore((s) => s.uid);
  const pendingPostId = useConductorStore((s) => s.pendingPostId);
  const postCount = useConductorStore((s) => s.postCount);
  const setConductor = useConductorStore((s) => s.setConductor);

  const [type, setType] = useState<EntryType>('research');
  const [title, setTitle] = useState('');

  // Research fields
  const [content, setContent] = useState('');

  // Protocol fields
  const [hypothesis, setHypothesis] = useState('');
  const [protocol, setProtocol] = useState('');
  const [observation, setObservation] = useState('[redact]\n\n[/redact]');

  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const researchRef = useRef<HTMLTextAreaElement>(null);
  const hypRef = useRef<HTMLTextAreaElement>(null);
  const protRef = useRef<HTMLTextAreaElement>(null);
  const obsRef = useRef<HTMLTextAreaElement>(null);

  const getRawContent = () => {
    if (type === 'research') return content;
    return `HYPOTHESIS\n${hypothesis}\n\nPROTOCOL\n${protocol}\n\nOBSERVATION\n${observation}`;
  };

  // Debounced word count
  useEffect(() => {
    const handler = setTimeout(() => {
      const raw = getRawContent();
      const parsed = parsePostContent(raw);
      setWordCount(parsed.wordCount);
    }, 300);

    return () => clearTimeout(handler);
  }, [content, hypothesis, protocol, observation, type]);

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
    if (!uid || pendingPostId || wordCount < 150 || isSubmitting) return;

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

      const postRef = doc(collection(db, 'archive'));
      const scholarRef = doc(db, 'scholars', uid);

      const postData = {
        authorId: uid,
        title,
        type,
        publicContent: parsed.publicContent,
        redactedContent: parsed.redactedContent,
        status: 'pending',
        rejectionReason: null,
        revisionCount: 0,
        wordCount: parsed.wordCount,
        isFirstApprovedPost: postCount === 0,
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
        publishedAt: null,
      };

      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      batch.set(postRef, postData);
      batch.update(scholarRef, { pendingPostId: postRef.id });

      await batch.commit();

      setConductor({ pendingPostId: postRef.id });
      navigate('/dashboard', {
        state: { message: 'Entry submitted. Awaiting review.' },
      });
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError('Submission failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isPending = !!pendingPostId;
  const canSubmit =
    wordCount >= 150 && !isPending && title.trim() !== '' && !isSubmitting;

  return (
    <div className="min-h-screen bg-void text-slate-200">
      <Nav />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-mint/10 blur-[120px]" />
      </div>

      <div className="max-w-[720px] mx-auto py-24 px-6 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold tracking-tight text-white mb-2">
            EXPERIMENT BUILDER
          </h1>
          <p className="text-slate-400 font-medium">Drafting unauthorized data for Archive validation.</p>
        </div>

        {/* Type Selector */}
        <div className="glass rounded-2xl p-1.5 flex gap-2 mb-12 border border-white/5">
          <button
            onClick={() => setType('research')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
              type === 'research' 
                ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Research Entry
          </button>
          <button
            onClick={() => setType('protocol')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${
              type === 'protocol' 
                ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Conduct Protocol
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div className="glass-card p-6 border border-white/5 focus-within:border-accent/40 transition-colors">
            <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
              Entry Designation (Title)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent p-0 text-xl font-heading font-bold text-white placeholder:text-slate-700 focus:outline-none"
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
                className="w-full h-96 bg-transparent p-0 text-slate-300 font-body leading-relaxed focus:outline-none resize-none placeholder:text-slate-800"
                placeholder="Begin the transcription of findings..."
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
                  placeholder="Predict the outcome of this protocol..."
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
                  placeholder="Define the sequential steps of the experiment..."
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
              <div className="mb-6 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
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
              {isPending
                ? 'Transmission in Progress'
                : wordCount < 150
                ? 'Insufficient Data (150 Wds Min)'
                : isSubmitting
                ? 'Transmitting...'
                : 'Authorize Submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitEntry;
