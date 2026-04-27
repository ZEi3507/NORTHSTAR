import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import Nav from '../components/Nav';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const Gatekeeper: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Access Denied: Identity not recognized.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05040A] text-slate-200 selection:bg-[#39FF14]/30 flex flex-col items-center p-6 overflow-hidden relative">
      <Nav />
      
      {/* Liquid Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-[#7C3AED]/20 blur-[140px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#39FF14]/10 blur-[140px]" 
        />
      </div>

      {/* Hero Section */}
      <header className="relative z-10 w-full max-w-4xl text-center py-20 mt-10">
        <h1 
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-6xl font-bold text-white mb-6 tracking-tight italic"
        >
          NORTHSTAR | The Conduct Laboratory & Archive
        </h1>
        <p className="text-xl font-mono text-slate-400 tracking-wider">
          Life is a series of experiments. Start documenting your evidence.
        </p>
      </header>

      {/* Auth Panel */}
      <div className="max-w-md w-full relative z-10 mb-20">
        <div className="glass-card p-10 border border-[#39FF14]/10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#39FF14] to-transparent opacity-50" />
          
          <div className="text-center mb-10">
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#39FF14]/60">
              Authorized Entry Only
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono uppercase tracking-widest text-center flex items-center justify-center gap-2"
            >
              <ShieldAlert size={14} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Designation
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-[#39FF14]/40 focus:bg-white/[0.08] text-white transition-all outline-none placeholder:text-slate-700 text-sm"
                placeholder="scholar@northstar.io"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                Access Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/5 focus:border-[#39FF14]/40 focus:bg-white/[0.08] text-white transition-all outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#39FF14] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-br from-[#1A0B2E] to-[#05040A] text-[#39FF14] border border-[#39FF14]/30 text-xs font-bold tracking-[0.3em] uppercase shadow-lg shadow-[#39FF14]/5 hover:border-[#39FF14] hover:shadow-[#39FF14]/20 active:scale-[0.98] disabled:opacity-50 transition-all mt-4"
            >
              {loading ? 'Authenticating...' : 'Initiate Connection'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              New Investigator?{' '}
              <Link
                to="/signup"
                className="text-[#39FF14]/80 hover:text-[#39FF14] transition-colors font-bold ml-1"
              >
                Request Access
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Pillars Section */}
      <section className="relative z-10 w-full max-w-6xl py-20 px-6">
        <h2 className="text-3xl text-white italic mb-12 text-center">THE ARCHITECTURE OF INTENT</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 border border-white/5 rounded-2xl bg-white/[0.02]">
            <h3 className="text-[#39FF14] font-mono text-xs uppercase tracking-widest mb-4">The Laboratory</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Where hypothesis meets rigorous documentation. Build your protocol.</p>
          </div>
          <div className="p-8 border border-white/5 rounded-2xl bg-white/[0.02]">
            <h3 className="text-[#39FF14] font-mono text-xs uppercase tracking-widest mb-4">The Archive</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Preserve the integrity of human discovery. A ledger of collective knowledge.</p>
          </div>
          <div className="p-8 border border-white/5 rounded-2xl bg-white/[0.02]">
            <h3 className="text-[#39FF14] font-mono text-xs uppercase tracking-widest mb-4">The Conduct</h3>
            <p className="text-slate-400 text-sm leading-relaxed">The standard of rigor. Define how knowledge is validated and shared.</p>
          </div>
        </div>
      </section>

      {/* The Veil Section */}
      <section className="relative z-10 w-full bg-white/[0.01] border-y border-white/5 py-20 my-10">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl text-white italic mb-6">WISDOM IS EARNED, NOT GIVEN</h2>
          <p className="text-slate-400 text-lg">Publish an entry. Reveal the results. Evolve the system.</p>
        </div>
      </section>

      {/* Observatory Section */}
      <section className="relative z-10 w-full max-w-4xl py-20 text-center px-6">
        <h2 className="text-3xl text-white italic mb-6">NAVIGATE THE CONSTELLATIONS</h2>
        <p className="text-slate-400 text-lg mb-10">Do not scroll through feeds. Navigate the Observatory—a 3D spatial data visualization engine.</p>
      </section>

      {/* Footer CTA */}
      <footer className="relative z-10 w-full py-20 bg-gradient-to-b from-transparent to-[#1A0B2E]/50 text-center">
        <h2 className="text-5xl font-bold text-white mb-10 tracking-tighter italic">DON'T JUST LIVE. EXPERIMENT.</h2>
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em]">
          Secured Connection // Node_0xAF
        </p>
      </footer>
    </div>
  );
};

export default Gatekeeper;
