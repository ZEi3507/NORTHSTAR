import React, { useState } from 'react';
import Nav from '../components/Nav';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { fileToBase64 } from '../lib/fileHelpers';

const CATEGORIES = ['All', 'Productivity', 'Coding', 'Finance', 'Life', 'Courses'];

const SacredInsights: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [inputType, setInputType] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [hyperlink, setHyperlink] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]); // Productivity
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!auth.currentUser) return;
    setUploading(true);
    setStatus('idle');
    
    try {
      let dataUrl = '';
      if (inputType === 'file' && file) {
        dataUrl = await fileToBase64(file);
      } else if (inputType === 'link') {
        dataUrl = hyperlink;
      }

      await addDoc(collection(db, 'sacred-insights'), {
        fileName: inputType === 'file' ? file?.name : 'hyperlink',
        category,
        url: dataUrl,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        type: inputType
      });

      setStatus('success');
      setMessage('Upload successful');
      setUploading(false);
      setFile(null);
      setHyperlink('');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
      setUploading(false);
    }
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
        <header className="mb-12">
          <h1 className="text-5xl font-heading font-bold tracking-tight text-white mb-4">
            SACRED INSIGHTS
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-2xl">
            Curated knowledge and discoveries for the NorthStar initiative.
          </p>
        </header>

        {/* Category Slider */}
        <div className="flex gap-4 mb-16 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                activeCategory === cat
                  ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-violet-500/10'
                  : 'bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

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

            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={inputType === 'file'} onChange={() => setInputType('file')} /> File
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={inputType === 'link'} onChange={() => setInputType('link')} /> Link
              </label>
            </div>
            
            {inputType === 'file' ? (
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
              />
            ) : (
              <input 
                type="text" 
                value={hyperlink}
                onChange={(e) => setHyperlink(e.target.value)}
                placeholder="Paste hyperlink here"
                className="bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent"
              />
            )}
            
            <button 
              onClick={handleUpload}
              disabled={(inputType === 'file' ? !file : !hyperlink) || uploading}
              className="px-6 py-3 rounded-full bg-accent text-void font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload size={18} /> {uploading ? 'Archiving...' : 'Archive Insight'}
            </button>
          </div>

          {status === 'success' && <p className="text-mint mt-4 flex items-center gap-2"><CheckCircle2 size={16}/> {message}</p>}
          {status === 'error' && <p className="text-red-400 mt-4 flex items-center gap-2"><AlertCircle size={16}/> {message}</p>}
        </div>
      </main>
    </div>
  );
};

export default SacredInsights;
