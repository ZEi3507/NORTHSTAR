import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import Nav from '../components/Nav';
import { Eye, EyeOff } from 'lucide-react';

const SignUp: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });

      const scholarDoc = {
        displayName,
        scholarGrade: "Initiate",
        level: 1,
        postCount: 0,
        approvedPostIds: [],
        pendingPostId: null,
        conductStats: {
          focusScore: 0,
          experimentsRun: 0,
        },
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "scholars", user.uid), scholarDoc);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This designation is already registered.');
      } else {
        setError('Failed to authorize registration. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-slate-200 selection:bg-accent/30 flex items-center justify-center p-6">
      <Nav />
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-mint/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="glass-card p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-violet-green opacity-50" />
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-heading font-bold text-white mb-2 tracking-tight">
              NEW INITIATION
            </h1>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
              Register for Archive Access
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-accent/40 focus:bg-white/[0.08] text-white transition-all outline-none placeholder:text-slate-700"
                placeholder="Scholar Name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Designation (Email)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-accent/40 focus:bg-white/[0.08] text-white transition-all outline-none placeholder:text-slate-700"
                placeholder="scholar@northstar.io"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Access Key (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-accent/40 focus:bg-white/[0.08] text-white transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-violet-green text-white text-sm font-bold tracking-[0.2em] uppercase shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
            >
              {loading ? 'Authorizing...' : 'Begin Initiation'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already a Scholar?{' '}
              <Link
                to="/signin"
                className="text-accent-light hover:text-white transition-colors font-bold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">
          NorthStar Protocol v2.0 // Secured Connection
        </p>
      </div>
    </div>
  );
};

export default SignUp;
